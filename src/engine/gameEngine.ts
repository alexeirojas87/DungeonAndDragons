// ============================================================
// GAME ENGINE - Core orchestrator
// The game engine is the source of truth.
// ============================================================

import type {
  GameState, Character, WorldLocation, Item, Quest, Enemy,
  CombatEncounter, PlayerIntent, InterpretedAction, NarrativeEntry,
  WorldTime, GameEvent, Skill, Language, DialogueState, NPC, EquipmentSlot, Difficulty, Conviction
} from './types';
import { rollSkillCheck, rollD20, rollDamage, getAttributeModifier } from './dice';
import { eventBus, createEvent } from './events';
import { damageCharacter, healCharacter, getSkillModifier, addExperience, ARCHETYPES, ORIGINS } from './character';
import { createItem, equipItem, unequipItem, consumeItem, getEffectiveAC, ITEM_TEMPLATES, generateItemId } from './inventory';
import {
  createEncounter, resolveAttack, applyDamage, applyHealing,
  nextTurn, isEncounterOver, getCurrentCombatant, enemyAction,
  attemptFlee, getEnemies, getPlayers, snapshotCombat
} from './combat';
import { MONSTER_TEMPLATES } from '../data/monsters';
import { SPELL_TEMPLATES } from '../data/spells';
import { interpretIntent } from './intent';
import { createInitialStoryState } from '../data/storyGraph';
import { CHAPTER_ONE } from '../data/chapters';
import {
  isStoryChoiceAvailable, nodeKind,
  type Chapter, type ChapterSummary, type StoryChoice, type StoryNode,
} from './chapter';
import {
  applyMechanismStep, createPuzzleRuntime, effectiveCheckDC, hintForAttempt,
  hintsExhausted, normalizeAnswer, rollPuzzleCheck, solutionText, solveRiddle,
  type BilingualText, type Puzzle,
} from './puzzles';
import { difficultyRules } from './difficulty';
import { foldLegacyCampaignProgress } from './campaign';

export type GameMode = 'single' | 'multiplayer';

export class GameEngine {
  state: GameState;
  narrative: NarrativeEntry[];
  language: Language;
  private narrativeIdCounter = 0;
  /**
   * Per-step encounter snapshots recorded while a combat round resolves. The
   * UI drains these with small delays so HP drains across enemy turns instead
   * of snapping to the final state in one render. Cleared on read.
   */
  private combatSteps: CombatEncounter[] = [];

  constructor() {
    this.language = 'en';
    this.narrative = [];
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      campaign: {
        id: `campaign_${Date.now()}`,
        name: 'The Sunken Crypt',
        createdAt: Date.now(),
        lastSaved: Date.now(),
        day: 1,
      },
      party: [],
      activePlayerIndex: 0,
      location: 'black_lantern_tavern',
      combat: null,
      quests: [],
      worldState: {
        locations: {},
        npcs: {},
        items: {},
        discoveredSecrets: [],
        killedEnemies: [],
        triggeredTraps: [],
        solvedPuzzles: [],
      },
      flags: {},
      time: { hour: 18, day: 1, period: 'evening' },
      eventLog: [],
      activeDialogue: null,
      story: createInitialStoryState(),
      chapters: [],
      activeChapterIndex: 0,
      chronicle: [],
      puzzles: createPuzzleRuntime(),
      status: 'playing',
      difficulty: 'oath',
      campaignProgress: {
        factionReputation: {},
        npcBonds: {},
        convictions: { compassion: 0, truth: 0, freedom: 0, duty: 0 },
        canonicalChoices: [],
        legacyFlags: {},
      },
    };
  }

  // ============================================================
  // CHAPTERS
  // All authored chapters travel the same road: they are
  // merged into world state by loadChapter and read back through
  // chapter(), so nothing in the engine names a specific chapter.
  // ============================================================

  private chapter(): Chapter {
    const chapter = this.state.chapters[this.state.activeChapterIndex];
    if (!chapter) throw new Error('no active chapter loaded');
    return chapter;
  }

  getChapter(): Chapter | null {
    return this.state.chapters[this.state.activeChapterIndex] ?? null;
  }

  private storyNode(nodeId: string): StoryNode | undefined {
    return this.getChapter()?.nodes[nodeId];
  }

  /**
   * Walking back into a puzzle you already solved should not re-lock the door:
   * the story continues from where solving it led, however you got here.
   */
  /** Story beats may relocate the player; the header must follow the prose. */
  private applyNodeLocation(node: StoryNode): void {
    if (!node.locationId) return;
    if (this.state.location === node.locationId) return;
    if (!this.state.worldState.locations[node.locationId]) return;

    this.state.location = node.locationId;
    const location = this.state.worldState.locations[node.locationId];
    if (location) location.discovered = true;
    const hero = this.state.party[0];
    if (hero) {
      eventBus.emit(createEvent('PLAYER_ENTERED_LOCATION', {
        locationId: node.locationId,
        characterId: hero.id,
      }));
    }
  }

  /**
   * Heals a story position that can no longer move. Saving while standing on a
   * puzzle node and reloading after the puzzle is solved left the player on a
   * node with no choices and no puzzle — a dead end that survived reloading,
   * because skipping solved puzzles only ever ran when entering a node.
   */
  private normalizeStoryPosition(): void {
    const current = this.storyNode(this.state.story.currentNodeId);
    if (!current) return;
    const resolved = this.skipSolvedPuzzles(current);
    if (!resolved || resolved.id === current.id) return;

    this.state.story.currentNodeId = resolved.id;
    if (!this.state.story.visitedNodeIds.includes(resolved.id)) {
      this.state.story.visitedNodeIds.push(resolved.id);
    }
    const kind = nodeKind(resolved);
    this.state.story.completed = kind === 'route' || kind === 'ending' || !!resolved.terminal;
    this.applyNodeLocation(resolved);
  }

  private skipSolvedPuzzles(node: StoryNode | undefined): StoryNode | undefined {
    const chapter = this.getChapter();
    let current = node;
    for (let hops = 0; current && hops < 8; hops++) {
      if (nodeKind(current) !== 'puzzle' || !current.puzzleId) return current;
      if (!this.state.worldState.solvedPuzzles.includes(current.puzzleId)) return current;
      const puzzle = chapter?.puzzles[current.puzzleId];
      if (!puzzle) return current;
      current = chapter?.nodes[puzzle.unlocks.nodeId ?? puzzle.solvedNodeId];
    }
    return current;
  }

  private monsterTemplate(templateId: string) {
    return this.getChapter()?.monsters[templateId]
      ?? MONSTER_TEMPLATES[templateId]
      ?? MONSTER_TEMPLATES['skeleton_guard_1'];
  }

  /**
   * Resolves an item from the static templates first, then from the active
   * chapter's own `items` registry. Later chapters declare their items
   * (a dark blade, a sealed relic…), but those never reached the inventory:
   * every grant point only consulted ITEM_TEMPLATES and returned null for a
   * chapter-only id, so the DM could narrate "the blade is yours" while the
   * inventory stayed empty. Chapter items can now be created and carried.
   */
  private resolveItem(templateId: string): Item | null {
    if (!templateId) return null;
    const known = createItem(templateId);
    if (known) return known;

    const template = this.getChapter()?.items?.[templateId];
    if (!template) return null;

    return {
      id: generateItemId(),
      templateId: template.id,
      name: template.name,
      nameEs: template.nameEs,
      type: template.type,
      rarity: template.rarity,
      weight: template.weight,
      value: template.value,
      description: template.description,
      descriptionEs: template.descriptionEs,
      properties: { ...template.properties },
      durability: template.maxDurability,
      maxDurability: template.maxDurability,
      slot: template.slot,
      usable: template.usable,
      consumable: template.consumable,
    };
  }

  /**
   * Merges a chapter's world into the live state and starts its story graph.
   * Locations, NPCs and quests accumulate across chapters so earlier places
   * stay visitable and finished quests stay in the log.
   */
  loadChapter(chapter: Chapter, options: { announce?: boolean } = {}): NarrativeEntry[] {
    const existingIndex = this.state.chapters.findIndex(c => c.id === chapter.id);
    if (existingIndex >= 0) {
      this.state.chapters[existingIndex] = chapter;
      this.state.activeChapterIndex = existingIndex;
    } else {
      this.state.chapters.push(chapter);
      this.state.activeChapterIndex = this.state.chapters.length - 1;
    }

    this.state.worldState.locations = {
      ...this.state.worldState.locations,
      ...JSON.parse(JSON.stringify(chapter.locations)),
    };
    this.state.worldState.npcs = {
      ...this.state.worldState.npcs,
      ...JSON.parse(JSON.stringify(chapter.npcs)),
    };
    for (const quest of Object.values(chapter.quests)) {
      if (this.state.quests.some(q => q.id === quest.id)) continue;
      this.state.quests.push({ ...quest, objectives: quest.objectives.map(o => ({ ...o })) });
    }

    this.state.location = chapter.startLocationId;
    this.state.combat = null;
    this.state.activeDialogue = null;
    this.state.status = 'playing';
    this.state.story = {
      ...createInitialStoryState(),
      currentNodeId: chapter.startNodeId,
      visitedNodeIds: [chapter.startNodeId],
    };
    this.state.campaign.name = this.language === 'es' ? chapter.titleEs : chapter.title;

    this.activateQuest(chapter.mainQuestId);

    const entries = this.renderIntro(chapter);
    if (options.announce !== false) {
      for (const entry of entries) this.narrative.push(entry);
    }

    const character = this.state.party[0];
    if (character) {
      eventBus.emit(createEvent('PLAYER_ENTERED_LOCATION', {
        locationId: chapter.startLocationId,
        characterId: character.id,
      }));
    }

    return entries;
  }

  private renderIntro(chapter: Chapter): NarrativeEntry[] {
    const character = this.state.party[0];
    const origin = character ? ORIGINS[character.origin] : undefined;
    const substitutions: Record<string, string> = {
      '{name}': character?.name ?? '',
      '{origin}': (this.language === 'es' ? origin?.nameEs : origin?.name) ?? '',
    };

    return chapter.intro.map(beat => {
      let content = this.language === 'es' ? beat.textEs : beat.text;
      for (const [token, value] of Object.entries(substitutions)) {
        content = content.split(token).join(value);
      }
      return this.createNarrativeEntry({ type: beat.type, content, mood: beat.mood ?? 'neutral' });
    });
  }

  /** True once the player is standing at an ending and a new chapter can follow. */
  canAdvanceChapter(): boolean {
    return this.state.status === 'chapter_complete';
  }

  getChronicle(): ChapterSummary[] {
    return this.state.chronicle;
  }

  /** Ids already spent by this campaign, so authored chapters cannot collide. */
  getUsedIds(): string[] {
    return this.state.chapters.flatMap(chapter => [
      ...Object.keys(chapter.nodes),
      ...Object.keys(chapter.puzzles),
      ...Object.keys(chapter.locations),
      ...Object.keys(chapter.npcs),
      ...Object.keys(chapter.monsters),
      ...Object.keys(chapter.items ?? {}),
    ]);
  }

  // ============================================================
  // PUZZLES
  // The active story node decides whether the player is solving a
  // puzzle; every attempt is resolved here, deterministically.
  // ============================================================

  /** The puzzle the player is standing in front of, if any. */
  getActivePuzzle(): Puzzle | null {
    const chapter = this.getChapter();
    if (!chapter || this.state.status !== 'playing') return null;
    const node = chapter.nodes[this.state.story.currentNodeId];
    if (!node || nodeKind(node) !== 'puzzle' || !node.puzzleId) return null;
    // A puzzle already solved is scenery, not a gate; re-posing it would let a
    // player walk in circles through a door they already opened.
    if (this.state.worldState.solvedPuzzles.includes(node.puzzleId)) return null;
    return chapter.puzzles[node.puzzleId] ?? null;
  }

  getPuzzleView(): {
    puzzle: Puzzle;
    attempts: number;
    revealedHints: BilingualText[];
    progress: string[];
    effectiveDC?: number;
  } | null {
    const puzzle = this.getActivePuzzle();
    if (!puzzle) return null;
    const attempts = this.state.puzzles.attempts[puzzle.id] ?? 0;
    const revealedHints: BilingualText[] = [];
    const firstHint = difficultyRules(this.state.difficulty).firstHintAfterFailures;
    for (let attempt = firstHint; attempt <= attempts; attempt++) {
      const hint = hintForAttempt(puzzle, attempt - firstHint + 2);
      if (hint && !revealedHints.includes(hint)) revealedHints.push(hint);
    }
    return {
      puzzle,
      attempts,
      revealedHints,
      progress: this.state.puzzles.progress[puzzle.id] ?? [],
      effectiveDC: puzzle.kind === 'check'
        ? this.effectivePuzzleDC(puzzle)
        : undefined,
    };
  }

  private say(text: BilingualText): string {
    return this.language === 'es' ? text.es : text.en;
  }

  private effectivePuzzleDC(puzzle: Extract<Puzzle, { kind: 'check' }>): number {
    return Math.max(
      5,
      effectiveCheckDC(puzzle, this.state.worldState.discoveredSecrets)
        + difficultyRules(this.state.difficulty).puzzleDcModifier,
    );
  }

  private puzzleBriefing(node: StoryNode): Array<Omit<NarrativeEntry, 'id' | 'timestamp'>> {
    const puzzle = node.puzzleId ? this.getChapter()?.puzzles[node.puzzleId] : undefined;
    if (!puzzle) return [];

    const entries: Array<Omit<NarrativeEntry, 'id' | 'timestamp'>> = [{
      type: 'system',
      content: this.language === 'es'
        ? `ENIGMA — ${puzzle.titleEs}`
        : `PUZZLE — ${puzzle.title}`,
      mood: 'mystery',
    }, {
      type: 'narration',
      content: this.language === 'es' ? puzzle.promptEs : puzzle.prompt,
      mood: 'mystery',
    }];

    if (puzzle.kind === 'mechanism') {
      entries.push({
        type: 'system',
        content: this.language === 'es'
          ? `Elementos: ${puzzle.stepLabels.map(step => step.labelEs).join(' · ')}`
          : `Elements: ${puzzle.stepLabels.map(step => step.label).join(' · ')}`,
        mood: 'neutral',
      });
    } else if (puzzle.kind === 'check') {
      const dc = this.effectivePuzzleDC(puzzle);
      entries.push({
        type: 'system',
        content: this.language === 'es'
          ? `Requiere una prueba de ${puzzle.skill} (dificultad ${dc}). Escribe "examinar" para intentarlo.`
          : `Calls for ${/^[aeiou]/.test(puzzle.skill) ? 'an' : 'a'} ${puzzle.skill} check (DC ${dc}). Type "examine" to attempt it.`,
        mood: 'neutral',
      });
    }

    entries.push({
      type: 'system',
      content: this.language === 'es'
        ? 'Puedes abandonar el enigma en cualquier momento sin penalización.'
        : 'You may abandon the puzzle at any time with no penalty.',
      mood: 'neutral',
    });

    return entries;
  }

  private isAbandonInput(raw: string): boolean {
    const normalized = normalizeAnswer(raw);
    return [
      'abandon', 'abandon puzzle', 'give up', 'leave', 'skip', 'walk away',
      'abandonar', 'abandonar enigma', 'rendirse', 'dejarlo', 'salir', 'irme',
    ].some(phrase => normalized === normalizeAnswer(phrase));
  }

  /**
   * Resolves one puzzle attempt. Failure never costs anything: it only reveals
   * the next authored hint, and once the hints run out the solution is handed
   * over so a puzzle can never end a run.
   */
  resolvePuzzleInput(rawInput: string, shouldAddNarrative: boolean): NarrativeEntry[] {
    const puzzle = this.getActivePuzzle();
    if (!puzzle) return [];

    const emit = (entries: Array<Omit<NarrativeEntry, 'id' | 'timestamp'>>) =>
      entries.map(entry => shouldAddNarrative ? this.addNarrative(entry) : this.createNarrativeEntry(entry));

    if (this.isAbandonInput(rawInput)) {
      return emit([
        {
          type: 'system',
          content: this.language === 'es'
            ? 'Dejas el enigma sin resolver. Nada te lo impedirá más adelante.'
            : 'You leave the puzzle unsolved. Nothing stops you returning to it later.',
          mood: 'neutral',
        },
        ...this.enterStoryNode(puzzle.skipNodeId),
      ]);
    }

    const entries: Array<Omit<NarrativeEntry, 'id' | 'timestamp'>> = [];
    let solved = false;

    switch (puzzle.kind) {
      case 'riddle': {
        solved = solveRiddle(puzzle, rawInput);
        break;
      }
      case 'mechanism': {
        const stepId = this.matchMechanismStep(puzzle, rawInput);
        if (!stepId) {
          entries.push({
            type: 'system',
            content: this.language === 'es'
              ? `No reconoces eso entre los elementos: ${puzzle.stepLabels.map(s => s.labelEs).join(' · ')}`
              : `That is not one of the elements: ${puzzle.stepLabels.map(s => s.label).join(' · ')}`,
            mood: 'neutral',
          });
          return emit(entries);
        }
        const progress = this.state.puzzles.progress[puzzle.id] ?? [];
        const result = applyMechanismStep(puzzle, progress, stepId);
        this.state.puzzles.progress[puzzle.id] = result.progress;
        solved = result.solved;
        if (!solved && result.reset) {
          entries.push({ type: 'narration', content: this.say(puzzle.onWrongStep), mood: 'tense' });
        } else if (!solved) {
          entries.push({
            type: 'system',
            content: this.language === 'es'
              ? `La secuencia acepta el elemento (${result.progress.length}/${puzzle.steps.length}).`
              : `The sequence accepts it (${result.progress.length}/${puzzle.steps.length}).`,
            mood: 'tense',
          });
          return emit(entries);
        }
        break;
      }
      case 'check': {
        const hero = this.state.party[0];
        if (!hero) return [];
        const dc = this.effectivePuzzleDC(puzzle);
        const check = rollSkillCheck(puzzle.skill, hero.attributes, hero.skills[puzzle.skill] ?? 0, dc);
        solved = check.success;
        entries.push({
          type: 'dice',
          content: this.language === 'es'
            ? `${puzzle.skill}: ${check.total} contra dificultad ${dc} — ${check.success ? 'éxito' : 'fallo'}`
            : `${puzzle.skill}: ${check.total} vs DC ${dc} — ${check.success ? 'success' : 'failure'}`,
          mood: check.success ? 'triumph' : 'tense',
        });
        break;
      }
    }

    if (solved) {
      entries.push(...this.applyPuzzleSolution(puzzle));
      return emit(entries);
    }

    const attempts = (this.state.puzzles.attempts[puzzle.id] ?? 0) + 1;
    this.state.puzzles.attempts[puzzle.id] = attempts;

    if (puzzle.kind === 'riddle') {
      entries.push({
        type: 'narration',
        content: this.language === 'es'
          ? 'Algo en la respuesta no encaja. El cierre no cede.'
          : 'Something in the answer does not fit. The lock stays shut.',
        mood: 'tense',
      });
    }

    const firstHint = difficultyRules(this.state.difficulty).firstHintAfterFailures;
    const hint = attempts >= firstHint
      ? hintForAttempt(puzzle, attempts - firstHint + 2)
      : undefined;
    if (hint) {
      entries.push({
        type: 'system',
        content: this.language === 'es' ? `PISTA — ${hint.es}` : `HINT — ${hint.en}`,
        mood: 'mystery',
      });
    }

    if (attempts >= firstHint && attempts - firstHint + 1 >= puzzle.hints.length) {
      entries.push({
        type: 'narration',
        content: this.say(solutionText(puzzle)),
        mood: 'mystery',
      });
      if (puzzle.kind === 'mechanism') this.state.puzzles.progress[puzzle.id] = [];
      entries.push(...this.applyPuzzleSolution(puzzle));
    }

    return emit(entries);
  }

  private matchMechanismStep(puzzle: Extract<Puzzle, { kind: 'mechanism' }>, rawInput: string): string | null {
    const normalized = normalizeAnswer(rawInput);
    if (!normalized) return null;
    const direct = puzzle.stepLabels.find(step => step.id === rawInput.trim());
    if (direct) return direct.id;
    const byLabel = puzzle.stepLabels.find(step =>
      normalized.includes(normalizeAnswer(step.label)) || normalized.includes(normalizeAnswer(step.labelEs))
      || normalizeAnswer(step.label).includes(normalized) || normalizeAnswer(step.labelEs).includes(normalized)
    );
    return byLabel?.id ?? null;
  }

  private applyPuzzleSolution(puzzle: Puzzle): Array<Omit<NarrativeEntry, 'id' | 'timestamp'>> {
    const entries: Array<Omit<NarrativeEntry, 'id' | 'timestamp'>> = [];

    if (!this.state.worldState.solvedPuzzles.includes(puzzle.id)) {
      this.state.worldState.solvedPuzzles.push(puzzle.id);
    }
    if (!this.state.puzzles.solved.includes(puzzle.id)) {
      this.state.puzzles.solved.push(puzzle.id);
    }

    for (const [flag, value] of Object.entries(puzzle.unlocks.flags ?? {})) {
      this.state.flags[flag] = value;
    }

    const hero = this.state.party[0];
    const gained: string[] = [];
    for (const templateId of puzzle.unlocks.items ?? []) {
      const item = this.resolveItem(templateId);
      if (item && hero) {
        hero.inventory.push(item);
        gained.push(this.language === 'es' ? item.nameEs : item.name);
      }
    }

    if (puzzle.unlocks.locationId) {
      const location = this.state.worldState.locations[puzzle.unlocks.locationId];
      if (location) location.discovered = true;
    }

    entries.push({
      type: 'system',
      content: this.language === 'es'
        ? `ENIGMA RESUELTO — ${puzzle.titleEs}`
        : `PUZZLE SOLVED — ${puzzle.title}`,
      mood: 'triumph',
    });
    if (gained.length > 0) {
      entries.push({
        type: 'system',
        content: this.language === 'es'
          ? `Obtienes: ${gained.join(', ')}`
          : `You obtain: ${gained.join(', ')}`,
        mood: 'triumph',
      });
    }

    eventBus.emit(createEvent('PUZZLE_SOLVED', { puzzleId: puzzle.id }));

    entries.push(...this.enterStoryNode(puzzle.unlocks.nodeId ?? puzzle.solvedNodeId));
    return entries;
  }

  /**
   * Moves the story to a node without going through a choice. Used by puzzles
   * (solved or abandoned) and by gameplay bridges such as the boss aftermath.
   */
  private enterStoryNode(nodeId: string): Array<Omit<NarrativeEntry, 'id' | 'timestamp'>> {
    const node = this.skipSolvedPuzzles(this.storyNode(nodeId));
    if (!node) return [];

    const story = this.state.story;
    story.currentNodeId = node.id;
    if (!story.visitedNodeIds.includes(node.id)) story.visitedNodeIds.push(node.id);
    if (node.route) story.route = node.route;
    this.applyNodeLocation(node);

    const kind = nodeKind(node);
    story.completed = kind === 'route' || kind === 'ending' || !!node.terminal;

    const entries: Array<Omit<NarrativeEntry, 'id' | 'timestamp'>> = [{
      type: 'system',
      content: this.language === 'es' ? node.titleEs : node.title,
      mood: 'mystery',
    }, {
      type: 'narration',
      content: this.language === 'es' ? node.textEs : node.text,
      mood: kind === 'ending' ? 'triumph' : 'tense',
    }];

    if (kind === 'puzzle') entries.push(...this.puzzleBriefing(node));
    if (kind === 'ending') this.completeChapter(node);

    return entries;
  }

  // ============================================================
  // CHAPTER COMPLETION AND DEATH
  // ============================================================

  private completeChapter(endingNode: StoryNode): void {
    const chapter = this.chapter();
    const hero = this.state.party[0];
    if (chapter.index === 1) this.applyLegacyChapterOneValues();
    const summaryFlags = chapter.summaryFlags ?? Object.keys(this.state.flags);

    const outcome: ChapterSummary['outcome'] = endingNode.outcome
      ?? (this.state.flags.abandoned_villagers
        ? 'failure'
        : this.state.flags.rescued_villagers
          ? 'success'
          : 'ambiguous');

    if (endingNode.globalEndingId) {
      this.state.campaignProgress.endingId = endingNode.globalEndingId;
    }

    const summary: ChapterSummary = {
      chapterId: chapter.id,
      index: chapter.index,
      title: chapter.title,
      titleEs: chapter.titleEs,
      endingNodeId: endingNode.id,
      endingTitle: endingNode.title,
      endingTitleEs: endingNode.titleEs,
      route: this.state.story.route,
      outcome,
      keyFlags: summaryFlags.filter(flag => this.state.flags[flag]),
      values: { ...this.state.story.values },
      puzzlesSolved: Object.keys(chapter.puzzles).filter(id => this.state.puzzles.solved.includes(id)),
      survivors: endingNode.survivors
        ?? (this.state.flags.rescued_villagers ? ['tomas', 'greta', 'lyra'] : []),
      casualties: endingNode.casualties
        ?? (this.state.flags.abandoned_villagers ? ['tomas', 'greta', 'lyra'] : []),
      heroSnapshot: {
        level: hero?.level ?? 1,
        hp: hero?.hp ?? 0,
        maxHp: hero?.maxHp ?? 0,
        gold: hero?.gold ?? 0,
        notableItems: (hero?.inventory ?? [])
          .filter(item => item.rarity !== 'common')
          .map(item => item.name)
          .slice(0, 8),
      },
    };

    const existing = this.state.chronicle.findIndex(entry => entry.chapterId === chapter.id);
    if (existing >= 0) this.state.chronicle[existing] = summary;
    else this.state.chronicle.push(summary);

    this.state.status = 'chapter_complete';
  }

  private applyLegacyChapterOneValues(): void {
    foldLegacyCampaignProgress(this.state.campaignProgress);
    if (this.state.flags['canon:chapter_one_values_mapped']) return;
    const legacy = this.state.story.values;
    const convictionMap: Array<[keyof typeof legacy, Conviction]> = [
      ['compassion', 'compassion'], ['pragmatism', 'duty'],
      ['independence', 'freedom'], ['insight', 'truth'],
    ];
    for (const [source, target] of convictionMap) {
      this.state.campaignProgress.convictions[target] = Math.max(0, legacy[source] ?? 0);
    }
    this.state.campaignProgress.npcBonds.martik = Math.max(-3, Math.min(3, legacy.martikTrust ?? 0));
    this.state.campaignProgress.npcBonds.varen = Math.max(-3, Math.min(3, legacy.strangerTrust ?? 0));
    this.state.campaignProgress.factionReputation.blackmere_council = Math.max(-5, Math.min(5, legacy.councilTrust ?? 0));
    this.state.flags['canon:chapter_one_values_mapped'] = true;
  }

  /**
   * Single place where the hero can die. Every damage path funnels through
   * combat, so calling this after combat resolution covers all of them.
   */
  private checkHeroDeath(): Array<Omit<NarrativeEntry, 'id' | 'timestamp'>> {
    const hero = this.state.party[0];
    if (!hero || this.state.status === 'dead') return [];
    if (hero.hp > 0) return [];

    hero.hp = 0;
    this.state.status = 'dead';
    this.state.combat = null;
    this.state.activeDialogue = null;
    eventBus.emit(createEvent('PLAYER_DIED', { characterId: hero.id }));

    return [{
      type: 'system',
      content: this.language === 'es'
        ? `${hero.name} ha caído. La campaña termina aquí.`
        : `${hero.name} has fallen. The campaign ends here.`,
      mood: 'horror',
    }];
  }

  isDead(): boolean {
    return this.state.status === 'dead';
  }

  /**
   * A character and its combatant are two copies of the same hit points, and
   * the combatant is the one combat reads and writes. Healing only the
   * character meant the next enemy turn silently overwrote the heal — a potion
   * would show full health and the hero would die to the following hit.
   */
  private syncHeroIntoCombat(): void {
    const hero = this.state.party[0];
    const encounter = this.state.combat;
    if (!hero || !encounter) return;
    const combatant = encounter.initiativeOrder.find(entry => entry.id === hero.id);
    if (!combatant) return;
    combatant.hp = hero.hp;
    combatant.maxHp = hero.maxHp;
    combatant.isAlive = hero.hp > 0;
  }

  /**
   * Death and end-of-chapter both stop the world; only the UI's own buttons
   * (retry from checkpoint, continue into the next chapter) move on from here.
   */
  private blockedInputEntry(shouldAddNarrative: boolean): NarrativeEntry[] | null {
    const message = this.state.status === 'dead'
      ? {
        es: 'Tu personaje ha muerto. Reintenta desde el último punto de control o vuelve al menú principal.',
        en: 'Your character is dead. Retry from the last checkpoint or return to the main menu.',
      }
      : this.state.status === 'chapter_complete'
        ? {
          es: 'El capítulo ha terminado. Pulsa Continuar para seguir la historia.',
          en: 'The chapter is over. Press Continue to carry the story forward.',
        }
        : null;
    if (!message) return null;

    const entry = {
      type: 'system' as const,
      content: this.language === 'es' ? message.es : message.en,
      mood: 'neutral' as const,
    };
    return [shouldAddNarrative ? this.addNarrative(entry) : this.createNarrativeEntry(entry)];
  }

  initGame(character: Character, difficulty: Difficulty = 'oath'): void {
    this.state.party = [character];
    this.state.difficulty = difficulty;

    // Populate starting equipment from archetype
    const archetypeDef = ARCHETYPES[character.archetype];
    for (const templateId of archetypeDef.startingEquipment) {
      const item = createItem(templateId);
      if (item) {
        character.inventory.push(item);
        if (item.slot) {
          equipItem(character, item);
        }
      }
    }

    // Recalculate stats after equipping starting equipment
    this.recalculateStats(character);

    // The adventure begins with a clear call to action instead of dropping the
    // player into an unexplained room.
    this.loadChapter(CHAPTER_ONE);
  }

  processInput(rawInput: string): NarrativeEntry[] {
    const blocked = this.blockedInputEntry(true);
    if (blocked) return blocked;

    if (rawInput.startsWith('__story__:')) {
      return this.resolveStoryChoice(rawInput.slice('__story__:'.length), true);
    }

    if (this.getActivePuzzle()) {
      return this.resolvePuzzleInput(rawInput, true);
    }

    // PRIORITY 1: If there's an active dialogue, try to match input against dialogue responses
    if (this.state.activeDialogue) {
      const dialogueResults = this.tryDialogueInput(rawInput);
      if (dialogueResults.length > 0) {
        return dialogueResults;
      }
      // If dialogue is active but no match, show help message instead of processing as action
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? 'Escribí una de las opciones disponibles o usá los botones de respuesta.'
          : 'Type one of the available options or use the response buttons.',
        mood: 'neutral',
      })];
    }

    const intent = interpretIntent(rawInput);
    const results: NarrativeEntry[] = [];

    for (const action of intent.actions) {
      const actionResults = this.processAction(action);
      results.push(...actionResults);
    }

    if (results.length === 0) {
      results.push(this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? 'No estás seguro de qué hacer con eso.'
          : 'You\'re not sure what to do with that.',
        mood: 'neutral',
      }));
    }

    return results;
  }

  // Raw version - processes input WITHOUT adding to narrative
  processInputRaw(rawInput: string): NarrativeEntry[] {
    const blocked = this.blockedInputEntry(false);
    if (blocked) return blocked;

    if (rawInput.startsWith('__story__:')) {
      return this.resolveStoryChoice(rawInput.slice('__story__:'.length), false);
    }

    if (this.getActivePuzzle()) {
      return this.resolvePuzzleInput(rawInput, false);
    }

    if (this.state.activeDialogue) {
      const dialogueResults = this.tryDialogueInputRaw(rawInput);
      if (dialogueResults.length > 0) {
        return dialogueResults;
      }
      return [this.createNarrativeEntry({
        type: 'system',
        content: this.language === 'es'
          ? 'Escribí una de las opciones disponibles o usá los botones de respuesta.'
          : 'Type one of the available options or use the response buttons.',
        mood: 'neutral',
      })];
    }

    const intent = interpretIntent(rawInput);
    const results: NarrativeEntry[] = [];

    for (const action of intent.actions) {
      const actionResults = this.processActionRaw(action);
      results.push(...actionResults);
    }

    if (results.length === 0) {
      results.push(this.createNarrativeEntry({
        type: 'system',
        content: this.language === 'es'
          ? 'No estás seguro de qué hacer con eso.'
          : 'You\'re not sure what to do with that.',
        mood: 'neutral',
      }));
    }

    return results;
  }

  // Raw dialogue response - processes without adding to narrative
  processDialogueResponseRaw(responseIndex: number): NarrativeEntry[] {
    const dialogue = this.state.activeDialogue;
    if (!dialogue) return [];

    const response = dialogue.responses[responseIndex];
    if (!response) return [];

    const npc = this.state.worldState.npcs[dialogue.npcId];
    if (!npc) {
      this.state.activeDialogue = null;
      return [];
    }

    const nextNode = npc.dialogue.find(d => d.id === response.nextNodeId);
    if (!nextNode) {
      this.state.activeDialogue = null;
      return [];
    }

    this.state.activeDialogue = {
      ...dialogue,
      currentNodeId: nextNode.id,
      responses: nextNode.responses,
    };

    if (response.effects) {
      for (const effect of response.effects) {
        eventBus.emit(createEvent(effect.type, effect.data));
      }
    }

    const dialogueText = (nextNode.text + nextNode.textEs).toLowerCase();
    const responseText = (response.text + response.textEs).toLowerCase();
    const shouldActivate = 
      dialogueText.includes('missing') || dialogueText.includes('crypt') ||
      dialogueText.includes('desaparecido') || dialogueText.includes('cripta') ||
      responseText.includes('i\'ll help') || responseText.includes('i\'ll find them') ||
      responseText.includes('ayudar') || responseText.includes('encontraré');
    if (shouldActivate) {
      this.activateQuest('the_sunken_crypt');
    }

    const results: NarrativeEntry[] = [];

    results.push(this.createNarrativeEntry({
      type: 'action',
      content: this.language === 'es' ? response.textEs : response.text,
    }));

    results.push(this.createNarrativeEntry({
      type: 'dialogue',
      speaker: npc.name,
      speakerEs: npc.nameEs,
      content: this.language === 'es' ? nextNode.textEs : nextNode.text,
      mood: 'neutral',
      dialogueResponses: nextNode.responses.length > 0 ? nextNode.responses : undefined,
    }));

    if (nextNode.responses.length === 0) {
      this.state.activeDialogue = null;
    }

    return results;
  }

  addNarrativeEntry(entry: NarrativeEntry): void {
    this.narrative.push(entry);
  }

  getAvailableStoryChoices(): StoryChoice[] {
    this.normalizeStoryPosition();
    if (this.state.story.completed) return [];
    const node = this.storyNode(this.state.story.currentNodeId);
    if (!node) return [];

    return node.choices.filter(choice =>
      isStoryChoiceAvailable(choice, this.state.flags, this.state.party[0], this.campaignValues())
    );
  }

  private campaignValues(): Record<string, number> {
    const values = { ...this.state.story.values };
    for (const [id, value] of Object.entries(this.state.campaignProgress.factionReputation)) values[`faction:${id}`] = value;
    for (const [id, value] of Object.entries(this.state.campaignProgress.npcBonds)) values[`bond:${id}`] = value;
    for (const [id, value] of Object.entries(this.state.campaignProgress.convictions)) values[`conviction:${id}`] = value;
    return values;
  }

  getPlayerFacingInput(rawInput: string): string {
    if (!rawInput.startsWith('__story__:')) return rawInput;
    const choiceId = rawInput.slice('__story__:'.length);
    const choice = this.getAvailableStoryChoices().find(candidate => candidate.id === choiceId);
    if (!choice) return rawInput;
    return this.language === 'es' ? choice.labelEs : choice.label;
  }

  private resolveStoryChoice(choiceId: string, shouldAddNarrative: boolean): NarrativeEntry[] {
    const story = this.state.story;
    const currentNode = this.storyNode(story.currentNodeId);
    const choice = this.getAvailableStoryChoices().find(candidate => candidate.id === choiceId);

    if (!currentNode || !choice) {
      const invalidChoice = {
        type: 'system' as const,
        content: this.language === 'es'
          ? 'Esa decisión ya no está disponible en tu camino actual.'
          : 'That decision is no longer available on your current path.',
        mood: 'neutral' as const,
      };
      return [shouldAddNarrative ? this.addNarrative(invalidChoice) : this.createNarrativeEntry(invalidChoice)];
    }

    for (const [flag, value] of Object.entries(choice.setsFlags ?? {})) {
      this.state.flags[flag] = value;
    }
    for (const [valueName, delta] of Object.entries(choice.adjustsValues ?? {})) {
      story.values[valueName] = (story.values[valueName] ?? 0) + delta;
    }
    if (!this.state.campaignProgress.canonicalChoices.includes(choice.id)) {
      this.state.campaignProgress.canonicalChoices.push(choice.id);
    }
    const campaignChanges = this.applyCampaignAdjustments(choice.adjustsValues ?? {});
    const heroEffectSummary = this.applyImmediateHeroStoryEffect(choice);

    const nextNode = this.skipSolvedPuzzles(this.storyNode(choice.nextNodeId));
    if (!nextNode) return [];
    story.choiceHistory.push({
      nodeId: currentNode.id,
      choiceId: choice.id,
      nextNodeId: nextNode.id,
      timestamp: Date.now(),
    });
    story.currentNodeId = nextNode.id;
    if (!story.visitedNodeIds.includes(nextNode.id)) story.visitedNodeIds.push(nextNode.id);
    if (story.choiceHistory.length === 1) {
      this.updateQuestProgress('investigate_rumors', 1);
    }
    if (nextNode.route) story.route = nextNode.route;
    this.applyNodeLocation(nextNode);
    const nextKind = nodeKind(nextNode);
    const settles = nextKind === 'route' || nextKind === 'ending' || !!nextNode.terminal;
    let consequenceSummary: string | undefined;
    if (settles) {
      story.completed = true;
      this.state.flags.chapter_route_chosen = true;
      // Kept for saves and prompts written before chapters were data.
      this.state.flags.chapter_one_route_chosen = true;
      consequenceSummary = this.applyStoryRoute(nextNode.route);
      if (nextKind === 'ending') {
        const endingSucceeded = (nextNode.outcome
          ?? (this.state.flags.abandoned_villagers ? 'failure' : 'success')) !== 'failure';
        consequenceSummary = this.finishMainQuest(endingSucceeded);
        this.completeChapter(nextNode);
      }
    }

    const entries: Array<Omit<NarrativeEntry, 'id' | 'timestamp'>> = [];
    const choiceResult = this.language === 'es' ? choice.resultEs : choice.result;
    if (choiceResult) {
      entries.push({ type: 'narration', content: choiceResult, mood: 'triumph' });
    }
    if (heroEffectSummary) {
      entries.push({ type: 'system', content: heroEffectSummary, mood: 'triumph' });
    }
    if (campaignChanges.length > 0) {
      entries.push({ type: 'system', content: campaignChanges.join(' · '), mood: 'neutral' });
    }
    // The chapter's own moral and relationship axes (compassion, trust in
    // Martik, etc.) used to adjust silently: the player made a choice and the
    // only feedback was the next scene's prose. Surface the delta so the
    // consequence of a decision is legible, not buried in save state.
    const valueDelta = this.summarizeStoryValueDelta(choice.adjustsValues ?? {});
    if (valueDelta) {
      entries.push({ type: 'system', content: valueDelta, mood: 'neutral' });
    }
    entries.push(
      {
        type: 'system' as const,
        content: this.language === 'es' ? nextNode.titleEs.toUpperCase() : nextNode.title.toUpperCase(),
        mood: nextNode.terminal ? 'triumph' as const : 'neutral' as const,
      },
      {
        type: 'narration' as const,
        content: this.language === 'es' ? nextNode.textEs : nextNode.text,
        mood: nextNode.terminal ? 'mystery' as const : 'neutral' as const,
      },
    );
    if (consequenceSummary) {
      entries.push({ type: 'system', content: consequenceSummary, mood: nextNode.terminal ? 'triumph' : 'neutral' });
    }
    if (nextKind === 'puzzle') {
      entries.push(...this.puzzleBriefing(nextNode));
    }

    return entries.map(entry => shouldAddNarrative ? this.addNarrative(entry) : this.createNarrativeEntry(entry));
  }

  private applyCampaignAdjustments(adjustments: Record<string, number>): string[] {
    const changes: string[] = [];
    for (const [key, delta] of Object.entries(adjustments)) {
      const [kind, id] = key.split(':', 2);
      if (!id || delta === 0) continue;

      if (kind === 'faction') {
        const current = this.state.campaignProgress.factionReputation[id] ?? 0;
        const next = Math.max(-5, Math.min(5, current + delta));
        this.state.campaignProgress.factionReputation[id] = next;
        const applied = next - current;
        if (applied) changes.push(`${this.language === 'es' ? 'Reputación' : 'Reputation'} — ${id.replaceAll('_', ' ')} ${applied > 0 ? '+' : ''}${applied}`);
      } else if (kind === 'bond') {
        const current = this.state.campaignProgress.npcBonds[id] ?? 0;
        const next = Math.max(-3, Math.min(3, current + delta));
        this.state.campaignProgress.npcBonds[id] = next;
        const applied = next - current;
        if (applied) changes.push(`${this.language === 'es' ? 'Vínculo' : 'Bond'} — ${id.replaceAll('_', ' ')} ${applied > 0 ? '+' : ''}${applied}`);
      } else if (kind === 'conviction' && ['compassion', 'truth', 'freedom', 'duty'].includes(id)) {
        const conviction = id as Conviction;
        const current = this.state.campaignProgress.convictions[conviction] ?? 0;
        const next = Math.max(0, current + delta);
        this.state.campaignProgress.convictions[conviction] = next;
        const applied = next - current;
        if (applied) changes.push(`${this.language === 'es' ? 'Convicción' : 'Conviction'} — ${id} ${applied > 0 ? '+' : ''}${applied}`);
      }
    }
    return changes;
  }

  /**
   * Localizes the chapter-one moral/relationship axes a choice shifts. Only
   * unprefixed keys are summarized here; `faction:`/`bond:`/`conviction:`
   * keys are already spoken for by `applyCampaignAdjustments`.
   */
  private summarizeStoryValueDelta(adjustments: Record<string, number>): string | undefined {
    const es = this.language === 'es';
    const labels: Record<string, [string, string]> = {
      compassion: ['Compassion', 'Compasión'],
      pragmatism: ['Pragmatism', 'Pragmatismo'],
      insight: ['Insight', 'Perspicacia'],
      independence: ['Independence', 'Independencia'],
      martikTrust: ['Martik trust', 'Confianza de Martik'],
      strangerTrust: ["Stranger's trust", 'Confianza del desconocido'],
      councilTrust: ['Council trust', 'Confianza del consejo'],
    };
    const parts: string[] = [];
    for (const [key, delta] of Object.entries(adjustments)) {
      if (key.includes(':') || delta === 0) continue;
      const label = labels[key];
      if (!label) continue;
      parts.push(`${es ? label[1] : label[0]} ${delta > 0 ? '+' : ''}${delta}`);
    }
    return parts.length > 0 ? parts.join(' · ') : undefined;
  }

  private applyImmediateHeroStoryEffect(choice: StoryChoice): string | undefined {
    const hero = this.state.party[0];
    if (!hero) return undefined;

    if (choice.id === 'warrior_take_command' && !this.state.flags.warrior_vanguard_applied) {
      hero.maxHp += 4;
      hero.hp += 4;
      this.state.flags.warrior_vanguard_applied = true;
      return this.language === 'es'
        ? 'EFECTO DE HÉROE — Liderazgo de vanguardia: +4 de vida máxima y actual.'
        : 'HERO EFFECT — Vanguard leadership: +4 current and maximum HP.';
    }

    if (choice.id === 'ironcoast_contract' && !this.state.flags.ironcoast_advance_paid) {
      hero.gold += 25;
      this.state.flags.ironcoast_advance_paid = true;
      return this.language === 'es'
        ? 'EFECTO DE ORIGEN — El contrato garantiza un adelanto inmediato de 25 piezas de oro.'
        : 'ORIGIN EFFECT — The contract secures an immediate advance of 25 gold.';
    }

    return undefined;
  }

  private applyStoryRoute(route?: import('./types').StoryRoute): string | undefined {
    if (!route) return undefined;

    const extraEffects: string[] = [];

    const destination = this.chapter().hooks.routeDestinations?.[route]
      ?? (route === 'secret_tunnel'
        ? 'crypt_antechamber'
        : route === 'varen'
          ? 'crypt_entrance'
          : 'crypt_path');

    this.state.location = destination;
    const location = this.state.worldState.locations[destination];
    if (location) location.discovered = true;

    if (route === 'forest') {
      this.state.flags.crypt_approach_hidden = true;
      if (!this.state.worldState.discoveredSecrets.includes('forest_approach')) {
        this.state.worldState.discoveredSecrets.push('forest_approach');
      }
    }
    if (route === 'varen') this.state.flags.varen_revealed_traps = true;
    if (route === 'council') {
      this.state.flags.council_escort_present = true;
      for (let i = 0; i < 2; i++) {
        const potion = createItem('health_potion');
        if (potion) this.state.party[0]?.inventory.push(potion);
      }
    }
    if (this.state.flags.ranger_safe_passage && !this.state.flags.ranger_safe_passage_prepared) {
      this.state.flags.ranger_safe_passage_prepared = true;
      extraEffects.push(this.language === 'es'
        ? 'El rastro del Explorador garantiza la iniciativa en el primer combate.'
        : 'The Ranger\'s trail guarantees initiative in the first combat.');
    }
    if (route === 'secret_tunnel' && this.state.flags.deephollow_tunnelcraft && !this.state.flags.deephollow_cache_claimed) {
      const potion = createItem('health_potion');
      if (potion) this.state.party[0]?.inventory.push(potion);
      this.state.flags.deephollow_cache_claimed = true;
      extraEffects.push(this.language === 'es'
        ? 'Las marcas de Hondonada Profunda revelan una cornisa seca y una poción intacta.'
        : 'Deephollow water marks reveal a dry ledge and an intact healing potion.');
    }
    if (route === 'secret_tunnel' || route === 'varen') {
      this.updateQuestProgress('reach_crypt', 1);
    }

    const hero = this.state.party[0];
    if (hero && this.state.flags.elara_blessing && !this.state.flags.elara_blessing_applied) {
      hero.maxHp += 3;
      hero.hp += 3;
      this.state.flags.elara_blessing_applied = true;
    }

    eventBus.emit(createEvent('PLAYER_ENTERED_LOCATION', { locationId: destination, storyRoute: route }));

    const summaries: Record<NonNullable<typeof route>, { en: string; es: string }> = {
      direct: {
        en: 'ROUTE EFFECT — You travel light and arrive without delay.',
        es: 'EFECTO DE RUTA — Viajas ligero y llegas sin demora.',
      },
      forest: {
        en: 'ROUTE EFFECT — Hidden approach discovered; enemies will not anticipate your arrival.',
        es: 'EFECTO DE RUTA — Acceso oculto descubierto; los enemigos no anticiparán tu llegada.',
      },
      secret_tunnel: {
        en: 'ROUTE EFFECT — The tunnel bypasses the outer gate and marks the journey objective complete.',
        es: 'EFECTO DE RUTA — El túnel evita la entrada exterior y completa el objetivo de viaje.',
      },
      varen: {
        en: 'ROUTE EFFECT — Varen guides you to the entrance and reveals the old expedition’s traps.',
        es: 'EFECTO DE RUTA — Varen te guía hasta la entrada y revela las trampas de la antigua expedición.',
      },
      council: {
        en: 'ROUTE EFFECT — The escort provides two healing potions and will intercept the first enemy attack.',
        es: 'EFECTO DE RUTA — La escolta entrega dos pociones de curación e interceptará el primer ataque enemigo.',
      },
    };
    const authoredDestination = this.chapter().hooks.routeDestinations?.[route];
    const routeSummary = authoredDestination && this.chapter().index > 1
      ? (this.language === 'es'
        ? `EFECTO DE RUTA — Tu decisión abre el camino hacia ${this.state.worldState.locations[destination]?.nameEs ?? destination}.`
        : `ROUTE EFFECT — Your decision opens the way to ${this.state.worldState.locations[destination]?.name ?? destination}.`)
      : (this.language === 'es' ? summaries[route].es : summaries[route].en);
    return [routeSummary, ...extraEffects].join('\n');
  }

  private beginWardenAftermath(shouldAddNarrative: boolean): NarrativeEntry[] {
    const node = this.storyNode(this.chapter().hooks.aftermathNodeId);
    if (!node) return [];
    this.state.flags[`canon:${this.chapter().id.replaceAll('-', '_')}_boss_defeated`] = true;
    if (this.chapter().index === 1) this.state.flags.warden_defeated = true;
    this.updateQuestProgress('explore_crypt', 3);
    this.updateQuestProgress('defeat_warden', 1);
    this.state.story.currentNodeId = node.id;
    this.state.story.completed = false;
    if (!this.state.story.visitedNodeIds.includes(node.id)) this.state.story.visitedNodeIds.push(node.id);

    const entries: Array<Omit<NarrativeEntry, 'id' | 'timestamp'>> = [
      { type: 'system', content: this.language === 'es' ? node.titleEs.toUpperCase() : node.title.toUpperCase(), mood: 'triumph' },
      { type: 'narration', content: this.language === 'es' ? node.textEs : node.text, mood: 'mystery' },
    ];
    return entries.map(entry => shouldAddNarrative ? this.addNarrative(entry) : this.createNarrativeEntry(entry));
  }

  private finishMainQuest(success: boolean): string {
    const mainQuestId = this.chapter().mainQuestId;
    const quest = this.state.quests.find(candidate => candidate.id === mainQuestId);
    if (quest) {
      quest.state = success ? 'completed' : 'failed';
      if (success) {
        for (const objective of quest.objectives) {
          objective.current = objective.required;
          objective.completed = true;
        }
      }
    }

    // The reward flag is per chapter, and the reward itself comes from the quest.
    // A single global flag meant chapter two announced its reward and paid
    // nothing, and the wording described chapter one's missing villagers.
    const grantedFlag = `main_quest_rewards_granted_${this.chapter().id}`;
    let gold = 0;
    let xp = 0;

    if (success && !this.state.flags[grantedFlag]) {
      const hero = this.state.party[0];
      for (const reward of quest?.rewards ?? []) {
        if (reward.type === 'gold' && typeof reward.value === 'number') gold += reward.value;
        if (reward.type === 'xp' && typeof reward.value === 'number') xp += reward.value;
      }
      if (hero) {
        hero.gold += gold;
        if (xp > 0) addExperience(hero, xp);
      }
      this.state.flags[grantedFlag] = true;
      // Kept so saves written before chapters were data still read as granted.
      this.state.flags.main_quest_rewards_granted = true;
      eventBus.emit(createEvent('QUEST_COMPLETED', { questId: mainQuestId }));
    }

    const questName = quest
      ? (this.language === 'es' ? quest.nameEs : quest.name)
      : (this.language === 'es' ? 'La misión' : 'The quest');

    if (success) {
      const reward = gold > 0 || xp > 0
        ? (this.language === 'es'
          ? ` Recompensa: ${gold} de oro y ${xp} XP.`
          : ` Reward: ${gold} gold and ${xp} XP.`)
        : '';
      return this.language === 'es'
        ? `MISIÓN COMPLETADA — ${questName}.${reward}`
        : `QUEST COMPLETE — ${questName}.${reward}`;
    }
    return this.language === 'es'
      ? `MISIÓN FALLIDA — ${questName}.`
      : `QUEST FAILED — ${questName}.`;
  }

  private tryDialogueInput(rawInput: string): NarrativeEntry[] {
    const dialogue = this.state.activeDialogue;
    if (!dialogue) return [];

    const inputLower = rawInput.toLowerCase().trim();
    const responses = dialogue.responses;

    // Try to match input against available dialogue responses
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const responseText = (this.language === 'es' ? response.textEs : response.text).toLowerCase();
      const inputWords = inputLower.split(/\s+/);
      const responseWords = responseText.split(/\s+/);

      // Check if significant words overlap (fuzzy match)
      const overlap = inputWords.filter(w => w.length > 2 && responseWords.some(rw => rw.includes(w) || w.includes(rw)));
      const matchRatio = overlap.length / Math.max(inputWords.length, 1);

      if (matchRatio > 0.4 || inputLower === responseText) {
        return this.processDialogueResponse(i);
      }
    }

    // No match found - return empty to let processInput handle it
    return [];
  }

  private processAction(action: InterpretedAction): NarrativeEntry[] {
    const results: NarrativeEntry[] = [];

    switch (action.type) {
      case 'move':
        results.push(...this.handleMove(action));
        break;
      case 'examine':
        results.push(...this.handleExamine(action));
        break;
      case 'take':
        results.push(...this.handleTake(action));
        break;
      case 'use':
        results.push(...this.handleUse(action));
        break;
      case 'equip':
        results.push(...this.handleEquip(action));
        break;
      case 'unequip':
        results.push(...this.handleUnequip(action));
        break;
      case 'attack':
        results.push(...this.handleAttack(action));
        break;
      case 'cast':
        results.push(...this.handleCast(action, true));
        break;
      case 'defend':
        results.push(...this.handleDefend());
        break;
      case 'flee':
        results.push(...this.handleFlee());
        break;
      case 'search':
        results.push(...this.handleSearch(action));
        break;
      case 'open':
        results.push(...this.handleOpen(action));
        break;
      case 'talk':
        results.push(...this.handleTalk(action));
        break;
      case 'inventory':
        results.push(...this.handleInventory());
        break;
      case 'character_sheet':
        results.push(...this.handleCharacterSheet());
        break;
      case 'quest_log':
        results.push(...this.handleQuestLog());
        break;
      case 'rest':
        results.push(...this.handleRest());
        break;
      case 'listen':
        results.push(...this.handleListen(action));
        break;
      default:
        results.push(this.addNarrative({
          type: 'system',
          content: this.language === 'es'
            ? 'No puedes hacer eso ahora.'
            : 'You can\'t do that right now.',
          mood: 'neutral',
        }));
    }

    return results;
  }

  private handleMove(action: InterpretedAction): NarrativeEntry[] {
    if (this.state.combat) {
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? 'No puedes huir de un combate así. Usa "huir" si quieres escapar.'
          : 'You can\'t just walk away from combat. Use "flee" if you want to escape.',
        mood: 'tense',
      })];
    }

    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    const direction = action.direction || 'forward';
    const nextLocId = this.resolveConnectedLocation(currentLoc, direction);

    if (!nextLocId) {
      return [this.addNarrative({
        type: 'narration',
        content: this.language === 'es'
          ? 'No hay salida en esa dirección.'
          : 'There is no exit in that direction.',
        mood: 'neutral',
      })];
    }

    // Check if location requires a key
    const nextLoc = this.state.worldState.locations[nextLocId];
    if (nextLoc?.requiresKey) {
      const hasKey = this.state.party[0]?.inventory.some(i => i.templateId === nextLoc.requiresKey);
      if (!hasKey) {
        return [this.addNarrative({
          type: 'narration',
          content: this.language === 'es'
            ? 'La puerta está cerrada con llave. Necesitas encontrar la llave correcta.'
            : 'The door is locked. You need to find the right key.',
          mood: 'tense',
        })];
      }
    }

    this.state.location = nextLocId;

    const narrations: NarrativeEntry[] = [];
    narrations.push(this.addNarrative({
      type: 'narration',
      content: nextLoc
        ? (this.language === 'es' ? nextLoc.descriptionEs : nextLoc.description)
        : 'You move to a new area.',
      mood: nextLoc?.dangerLevel ? (nextLoc.dangerLevel > 2 ? 'danger' : 'tense') : 'neutral',
      illustration: nextLocId,
    }));

    // Auto-activate quest when entering crypt_path
    if (nextLocId === 'crypt_path') {
      this.activateQuest('the_sunken_crypt');
    }

    // Check for enemies
    if (nextLoc?.enemies && nextLoc.enemies.length > 0) {
      const aliveEnemies = nextLoc.enemies.filter(eId =>
        !this.state.worldState.killedEnemies.includes(eId) && !this.state.flags[`bypassed_enemy_${eId}`]
      );
      if (aliveEnemies.length > 0) {
        const enemies = aliveEnemies.map(eId => {
          const template = this.monsterTemplate(eId);
          return { ...template, id: eId } as Enemy;
        });

        const prepared = this.prepareStoryEncounter(nextLocId, enemies);
        if (prepared.bypassMessage) {
          narrations.push(this.addNarrative({
            type: 'narration',
            content: prepared.bypassMessage,
            mood: 'triumph',
          }));
          nextLoc.discovered = true;
          eventBus.emit(createEvent('PLAYER_ENTERED_LOCATION', { locationId: nextLocId }));
          return narrations;
        }

        this.state.combat = createEncounter(
          this.state.party,
          prepared.enemies,
          nextLoc.secrets?.map(s => s.id) || [],
          this.state.difficulty,
        );
        const initiativeMessage = this.applyRangerInitiative(this.state.combat);
        for (const message of prepared.openingMessages) {
          narrations.push(this.addNarrative({ type: 'system', content: message, mood: 'triumph' }));
        }
        if (initiativeMessage) {
          narrations.push(this.addNarrative({ type: 'system', content: initiativeMessage, mood: 'triumph' }));
        }
        narrations.push(this.addNarrative({
          type: 'combat',
          content: this.language === 'es'
            ? `¡Combate! ${prepared.enemies.map(e => e.nameEs).join(', ')} ${prepared.enemies.length === 1 ? 'aparece' : 'aparecen'} ante ti.`
            : `Combat! ${prepared.enemies.map(e => e.name).join(', ')} ${prepared.enemies.length === 1 ? 'appears' : 'appear'} before you.`,
          mood: 'danger',
        }));
        narrations.push(...this.resolveEnemyTurns(true));
      }
    }

    // Discover location
    nextLoc.discovered = true;
    eventBus.emit(createEvent('PLAYER_ENTERED_LOCATION', { locationId: nextLocId }));

    // Check quest progress
    this.updateQuestProgress('reach_crypt', nextLocId === 'crypt_entrance' ? 1 : 0);

    return narrations;
  }

  private prepareStoryEncounter(
    locationId: string,
    enemies: Enemy[],
  ): { enemies: Enemy[]; openingMessages: string[]; bypassMessage?: string } {
    const isWardenEncounter = locationId === this.chapter().hooks.bossLocationId
      || enemies.some(enemy => enemy.templateId === 'crypt_warden');

    if (this.state.flags.rogue_shadow_entry && !this.state.flags.rogue_shadow_entry_used && !isWardenEncounter) {
      this.state.flags.rogue_shadow_entry_used = true;
      for (const enemy of enemies) this.state.flags[`bypassed_enemy_${enemy.id}`] = true;
      return {
        enemies,
        openingMessages: [],
        bypassMessage: this.language === 'es'
          ? 'EFECTO DE HÉROE — Lees la emboscada antes de que se cierre y atraviesas las sombras sin iniciar combate.'
          : 'HERO EFFECT — You read the ambush before it closes and cross the shadows without starting combat.',
      };
    }

    const openingMessages: string[] = [];
    const modifiedEnemies = enemies.map(enemy => ({ ...enemy }));
    for (const enemy of modifiedEnemies) {
      if (enemy.templateId !== 'crypt_warden') continue;

      if (this.state.flags.ashenvale_warden_lore) {
        enemy.ac = Math.max(1, enemy.ac - 2);
        openingMessages.push(this.language === 'es'
          ? 'EFECTO DE ORIGEN — Nombras la marca de ceniza: la CA del Guardián se reduce en 2.'
          : 'ORIGIN EFFECT — You name the ash-mark: the Warden\'s AC is reduced by 2.');
      }
      if (this.state.flags.stormreach_ward_breaker) {
        enemy.maxHp = Math.max(1, enemy.maxHp - 6);
        enemy.hp = Math.min(enemy.hp, enemy.maxHp);
        openingMessages.push(this.language === 'es'
          ? 'EFECTO DE ORIGEN — La presión rompe sus barreras: el Guardián pierde 6 de vida máxima.'
          : 'ORIGIN EFFECT — Water pressure fractures its wards: the Warden loses 6 maximum HP.');
      }
    }

    return { enemies: modifiedEnemies, openingMessages };
  }

  private applyRangerInitiative(encounter: CombatEncounter): string | undefined {
    if (!this.state.flags.ranger_safe_passage || this.state.flags.ranger_safe_passage_used) return undefined;
    const hero = encounter.initiativeOrder.find(combatant => combatant.type === 'player');
    if (!hero) return undefined;

    hero.initiative = Math.max(...encounter.initiativeOrder.map(combatant => combatant.initiative)) + 1;
    encounter.initiativeOrder.sort((a, b) => b.initiative - a.initiative);
    encounter.currentTurn = 0;
    this.state.flags.ranger_safe_passage_used = true;
    return this.language === 'es'
      ? 'EFECTO DE HÉROE — Tu ruta segura te da el primer turno de este combate.'
      : 'HERO EFFECT — Your safe route gives you the first turn in this combat.';
  }

  private static readonly MOVEMENT_STOPWORDS = new Set([
    'the', 'and', 'into', 'through', 'toward', 'towards', 'back', 'room', 'chamber',
    'hacia', 'para', 'los', 'las', 'del', 'sala', 'cuarto', 'camara', 'cámara',
  ]);

  private resolveConnectedLocation(currentLoc: WorldLocation, direction: string): string | null {
    if (currentLoc.connections.length === 0) return null;
    const requested = direction.toLowerCase().trim();

    const aliasesFor = (locationId: string): string[] => {
      const location = this.state.worldState.locations[locationId];
      if (!location) return [];
      return [
        locationId.replaceAll('_', ' '),
        location.name.toLowerCase(),
        location.nameEs.toLowerCase(),
      ];
    };

    const exact = currentLoc.connections.find(locationId =>
      aliasesFor(locationId).some(alias => alias.includes(requested) || requested.includes(alias))
    );
    if (exact) return exact;

    // Whole-string containment misses the way people actually type: "go to the
    // guardian room" never contains, and is never contained by, "crypt guardian
    // room". Score on shared meaningful words instead, and only move when one
    // destination is the clear winner.
    const meaningful = (phrase: string): string[] =>
      phrase
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúñü\s]/gi, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !GameEngine.MOVEMENT_STOPWORDS.has(word));

    const wanted = new Set(meaningful(requested));
    if (wanted.size > 0) {
      const scored = currentLoc.connections
        .map(locationId => ({
          locationId,
          score: aliasesFor(locationId).reduce((best, alias) => {
            const overlap = meaningful(alias).filter(word => wanted.has(word)).length;
            return Math.max(best, overlap);
          }, 0),
        }))
        .filter(candidate => candidate.score > 0)
        .sort((a, b) => b.score - a.score);

      if (scored.length === 1 || (scored.length > 1 && scored[0].score > scored[1].score)) {
        return scored[0].locationId;
      }
    }

    if (['back', 'south', 'west', 'outside', 'exit', 'leave'].includes(requested)) {
      return currentLoc.connections[0];
    }
    if (['forward', 'north', 'east', 'inside', 'enter', 'down'].includes(requested)) {
      return currentLoc.connections[Math.min(1, currentLoc.connections.length - 1)];
    }

    return currentLoc.connections.length === 1 ? currentLoc.connections[0] : null;
  }

  private handleExamine(action: InterpretedAction): NarrativeEntry[] {
    const target = action.target;
    if (!target) {
      return [this.addNarrative({
        type: 'narration',
        content: this.language === 'es'
          ? '¿Qué te gustaría examinar?'
          : 'What would you like to examine?',
        mood: 'neutral',
      })];
    }

    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    // Handle "room" as examining the general area
    if (target === 'room' || target === 'area' || target === 'around') {
      const descriptions: string[] = [];
      descriptions.push(this.language === 'es' ? currentLoc.descriptionEs : currentLoc.description);

      // List notable objects
      const visibleObjects = currentLoc.objects.filter(o => !o.hidden);
      if (visibleObjects.length > 0) {
        const objectNames = visibleObjects.map(o => this.language === 'es' ? o.nameEs : o.name).join(', ');
        descriptions.push(this.language === 'es'
          ? `Podés ver: ${objectNames}.`
          : `You can see: ${objectNames}.`);
      }

      // List NPCs
      if (currentLoc.npcs.length > 0) {
        const npcNames = currentLoc.npcs
          .map(id => this.state.worldState.npcs[id])
          .filter(Boolean)
          .map(npc => `${npc!.name} (${this.language === 'es' ? npc!.occupationEs : npc!.occupation})`)
          .join(', ');
        descriptions.push(this.language === 'es'
          ? `Hay aquí: ${npcNames}.`
          : `Present: ${npcNames}.`);
      }

      return [this.addNarrative({
        type: 'narration',
        content: descriptions.join('\n'),
        mood: currentLoc.dangerLevel > 2 ? 'danger' : 'neutral',
      })];
    }

    // Search objects
    for (const obj of currentLoc.objects) {
      if (obj.name.toLowerCase().includes(target.toLowerCase()) ||
          obj.nameEs.toLowerCase().includes(target.toLowerCase())) {
        return [this.addNarrative({
          type: 'narration',
          content: this.language === 'es' ? obj.descriptionEs : obj.description,
          mood: 'neutral',
        })];
      }
    }

    // Search NPCs
    for (const npcId of currentLoc.npcs) {
      const npc = this.state.worldState.npcs[npcId];
      if (npc && (npc.name.toLowerCase().includes(target.toLowerCase()) ||
                  npc.nameEs.toLowerCase().includes(target.toLowerCase()))) {
        return [this.addNarrative({
          type: 'narration',
          content: this.language === 'es'
            ? `${npc.nameEs}, ${npc.occupationEs.toLowerCase()}. ${npc.personalityEs}`
            : `${npc.name}, ${npc.occupation.toLowerCase()}. ${npc.personality}`,
          mood: 'neutral',
        })];
      }
    }

    // Default examination
    return [this.addNarrative({
      type: 'narration',
      content: this.language === 'es'
        ? `No ves nada especial sobre "${target}".`
        : `You don't see anything special about "${target}".`,
      mood: 'neutral',
    })];
  }

  private handleTake(action: InterpretedAction): NarrativeEntry[] {
    const itemName = action.item;
    if (!itemName) {
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? '¿Qué te gustaría tomar?'
          : 'What would you like to take?',
        mood: 'neutral',
      })];
    }

    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    // Check objects for items
    for (const obj of currentLoc.objects) {
      if (obj.name.toLowerCase().includes(itemName.toLowerCase()) ||
          obj.nameEs.toLowerCase().includes(itemName.toLowerCase())) {

        if (obj.searchDC) {
          const check = rollSkillCheck('perception', this.state.party[0].attributes, 0, obj.searchDC);
          if (!check.success) {
            return [this.addNarrative({
              type: 'dice',
              content: this.language === 'es'
                ? `PERCEPCIÓN: ${check.total} vs DC ${check.dc} - Falla`
                : `PERCEPTION: ${check.total} vs DC ${check.dc} - FAILED`,
              mood: 'neutral',
            })];
          }
        }

        if (obj.contains && obj.contains.length > 0) {
          const itemTemplateId = obj.contains[0];
          const item = this.resolveItem(itemTemplateId);
          if (item) {
            this.state.party[0].inventory.push(item);
            obj.contains = obj.contains.slice(1);
            eventBus.emit(createEvent('ITEM_ACQUIRED', { itemId: item.id, itemName: item.name }));
            return [this.addNarrative({
              type: 'system',
              content: this.language === 'es'
                ? `Obtienes: ${item.nameEs}`
                : `Acquired: ${item.name}`,
              mood: 'triumph',
            })];
          }
        }
      }
    }

    // The player often names the ITEM, not its container ("take the dark blade"
    // when the blade sits on an unnamed pedestal). Walk containers and match
    // against the resolved contained item's name before giving up.
    for (const obj of currentLoc.objects) {
      if (!obj.contains || obj.contains.length === 0) continue;
      for (const templateId of obj.contains) {
        const contained = this.resolveItem(templateId);
        if (!contained) continue;
        const match = itemNameMatches(contained.name, itemName) || itemNameMatches(contained.nameEs, itemName);
        if (match) {
          this.state.party[0].inventory.push(contained);
          obj.contains = obj.contains.filter(id => id !== templateId);
          eventBus.emit(createEvent('ITEM_ACQUIRED', { itemId: contained.id, itemName: contained.name }));
          return [this.addNarrative({
            type: 'system',
            content: this.language === 'es'
              ? `Obtienes: ${contained.nameEs}`
              : `Acquired: ${contained.name}`,
            mood: 'triumph',
          })];
        }
      }
    }

    return [this.addNarrative({
      type: 'system',
      content: this.language === 'es'
        ? `No puedes tomar "${itemName}".`
        : `You can't take "${itemName}".`,
      mood: 'neutral',
    })];
  }

  private handleUse(action: InterpretedAction): NarrativeEntry[] {
    const itemName = action.item;
    if (!itemName) {
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? '¿Qué objeto te gustaría usar?'
          : 'What item would you like to use?',
        mood: 'neutral',
      })];
    }

    const player = this.state.party[0];
    const item = player.inventory.find(i =>
      i.name.toLowerCase().includes(itemName.toLowerCase()) ||
      i.nameEs.toLowerCase().includes(itemName.toLowerCase())
    );

    if (!item) {
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? `No tienes "${itemName}".`
          : `You don't have "${itemName}".`,
        mood: 'neutral',
      })];
    }

    if (item.consumable) {
      const effect = consumeItem(item);
      if (effect) {
        if (effect.heal) {
          healCharacter(player, effect.heal);
    this.syncHeroIntoCombat();
          this.addNarrative({
            type: 'system',
            content: this.language === 'es'
              ? `Usas ${item.nameEs}. Recuperas ${effect.heal} HP.`
              : `You use ${item.name}. Recover ${effect.heal} HP.`,
            mood: 'triumph',
          });
        }
        if (effect.mp) {
          player.mp = Math.min(player.maxMp, player.mp + effect.mp);
          this.addNarrative({
            type: 'system',
            content: this.language === 'es'
              ? `Usas ${item.nameEs}. Recuperas ${effect.mp} MP.`
              : `You use ${item.name}. Recover ${effect.mp} MP.`,
            mood: 'triumph',
          });
        }

        // Remove consumed item
        player.inventory = player.inventory.filter(i => i.id !== item.id);
        eventBus.emit(createEvent('ITEM_CONSUMED', { itemId: item.id }));
        
        // Recalculate stats after consuming health potions
        this.recalculateStats(player);
      }
    }

    return [];
  }

  private handleEquip(action: InterpretedAction): NarrativeEntry[] {
    const itemName = action.item;
    if (!itemName) return [];

    const player = this.state.party[0];
    const item = player.inventory.find(i =>
      itemNameMatches(i.name, itemName) || itemNameMatches(i.nameEs, itemName)
    );

    if (!item || !item.slot) {
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? `No puedes equipar "${itemName}".`
          : `You can't equip "${itemName}".`,
        mood: 'neutral',
      })];
    }

    const success = equipItem(player, item);
    if (success) {
      this.recalculateStats(player);
      eventBus.emit(createEvent('ITEM_EQUIPPED', { itemId: item.id, slot: item.slot }));
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? `Equipas ${item.nameEs}.`
          : `You equip ${item.name}.`,
        mood: 'neutral',
      })];
    }

    return [];
  }

  private handleUnequip(action: InterpretedAction): NarrativeEntry[] {
    const itemName = action.item;
    if (!itemName) return [];

    const player = this.state.party[0];
    const equipped = Object.entries(player.equipment).find(([_, item]) =>
      item && (itemNameMatches(item.name, itemName) || itemNameMatches(item.nameEs, itemName))
    );

    if (!equipped) {
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? `No tienes "${itemName}" equipado.`
          : `You don't have "${itemName}" equipped.`,
        mood: 'neutral',
      })];
    }

    const [slot] = equipped;
    unequipItem(player, slot as EquipmentSlot);
    this.recalculateStats(player);
    return [this.addNarrative({
      type: 'system',
      content: this.language === 'es'
        ? `Te quitas ${itemName}.`
        : `You unequip ${itemName}.`,
      mood: 'neutral',
    })];
  }

  private handleAttack(action: InterpretedAction): NarrativeEntry[] {
    if (!this.state.combat) {
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? 'No hay enemigos aquí para atacar.'
          : 'There are no enemies here to attack.',
        mood: 'neutral',
      })];
    }

    const current = getCurrentCombatant(this.state.combat);
    if (!current || current.type !== 'player') return [];

    const targetName = action.target;
    const enemies = getEnemies(this.state.combat);
    const target = targetName
      ? enemies.find(e => e.name.toLowerCase().includes(targetName.toLowerCase()) ||
                          e.nameEs.toLowerCase().includes(targetName.toLowerCase()))
      : enemies[0];

    if (!target) {
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? 'Ese enemigo no está aquí.'
          : 'That enemy isn\'t here.',
        mood: 'neutral',
      })];
    }

    const result = resolveAttack(current, target, this.state.combat);
    applyDamage(this.state.combat, target.id, result.damage);

    const narrations: NarrativeEntry[] = [];
    narrations.push(this.addNarrative({
      type: 'dice',
      content: this.language === 'es'
        ? `D20: ${result.roll.results[0]} + ${result.roll.modifier} = ${result.roll.total} vs CA ${result.targetAc} → ${result.hit ? `${result.damage} DAÑO${result.critical ? ' CRÍTICO' : ''}` : 'FALLA'}`
        : `D20: ${result.roll.results[0]} + ${result.roll.modifier} = ${result.roll.total} vs AC ${result.targetAc} → ${result.hit ? `${result.damage} DAMAGE${result.critical ? ' CRITICAL' : ''}` : 'MISS'}`,
      mood: result.hit ? 'triumph' : 'neutral',
    }));

    narrations.push(this.addNarrative({
      type: 'narration',
      content: this.language === 'es'
        ? `Atacas a ${target.nameEs}. ${result.hit ? `Le infliges ${result.damage} puntos de daño${result.critical ? ' con un golpe devastador' : ''}.` : 'Tu ataque falla.'}`
        : `You attack ${target.name}. ${result.hit ? `You deal ${result.damage} points of damage${result.critical ? ' with a devastating blow' : ''}.` : 'Your attack misses.'}`,
      mood: result.hit ? 'triumph' : 'neutral',
    }));

    // Check if enemy died
    if (target.hp <= 0) {
      this.state.worldState.killedEnemies.push(target.id);
      const enemyTemplate = this.state.combat.enemies.find(e => e.id === target.id);
      if (enemyTemplate) {
        const battleContinues = getEnemies(this.state.combat).length > 0;
        narrations.push(this.addNarrative({
          type: 'narration',
          content: this.language === 'es'
            ? `${target.nameEs} cae.${battleContinues ? ' La batalla continúa.' : ''}`
            : `${target.name} falls.${battleContinues ? ' The battle continues.' : ''}`,
          mood: 'triumph',
        }));

        // XP
        addExperience(this.state.party[0], enemyTemplate.xpValue);
        narrations.push(this.addNarrative({
          type: 'system',
          content: this.language === 'es'
            ? `+${enemyTemplate.xpValue} XP`
            : `+${enemyTemplate.xpValue} XP`,
          mood: 'triumph',
        }));
      }

      // Check combat end
      const outcome = isEncounterOver(this.state.combat);
      if (outcome === 'victory') {
        this.state.combat.state = 'victory';
        narrations.push(this.addNarrative({
          type: 'combat',
          content: this.language === 'es'
            ? '¡Victoria! Los enemigos han sido derrotados.'
            : 'Victory! The enemies have been defeated.',
          mood: 'triumph',
        }));

        // Loot
        if (enemyTemplate?.loot) {
          for (const lootId of enemyTemplate.loot) {
            const item = this.resolveItem(lootId);
            if (item) {
              this.state.party[0].inventory.push(item);
              narrations.push(this.addNarrative({
                type: 'system',
                content: this.language === 'es'
                  ? `Obtienes: ${item.nameEs}`
                  : `Loot: ${item.name}`,
                mood: 'triumph',
              }));
            }
          }
        }

        if (this.state.location === this.chapter().hooks.bossLocationId) {
          narrations.push(...this.beginWardenAftermath(true));
        }

        this.state.combat = null;
      } else if (outcome === 'defeat') {
        this.state.combat.state = 'defeat';
        narrations.push(this.addNarrative({
          type: 'combat',
          content: this.language === 'es'
            ? 'Has caído en batalla...'
            : 'You have fallen in battle...',
          mood: 'horror',
        }));
        for (const entry of this.checkHeroDeath()) narrations.push(this.addNarrative(entry));
      } else {
        nextTurn(this.state.combat);
        narrations.push(...this.resolveEnemyTurns(true));
      }
    } else {
      nextTurn(this.state.combat);
      narrations.push(...this.resolveEnemyTurns(true));
    }

    return narrations;
  }

  private handleCast(action: InterpretedAction, shouldAddNarrative: boolean): NarrativeEntry[] {
    const makeEntry = (entry: Omit<NarrativeEntry, 'id' | 'timestamp'>): NarrativeEntry =>
      shouldAddNarrative ? this.addNarrative(entry) : this.createNarrativeEntry(entry);
    const player = this.state.party[0];
    if (!player) return [];

    const requestedSpell = action.spell?.toLowerCase().trim();
    const spell = requestedSpell
      ? player.spells.find(candidate => {
          const aliases = [candidate.id.replaceAll('_', ' '), candidate.name.toLowerCase(), candidate.nameEs.toLowerCase()];
          return aliases.some(alias => alias.includes(requestedSpell) || requestedSpell.includes(alias));
        })
      : undefined;

    if (!spell) {
      const known = player.spells.map(candidate => this.language === 'es' ? candidate.nameEs : candidate.name).join(', ');
      return [makeEntry({
        type: 'system',
        content: this.language === 'es'
          ? `No conoces ese hechizo.${known ? ` Hechizos conocidos: ${known}.` : ''}`
          : `You do not know that spell.${known ? ` Known spells: ${known}.` : ''}`,
        mood: 'neutral',
      })];
    }

    if (player.mp < spell.mpCost) {
      return [makeEntry({
        type: 'system',
        content: this.language === 'es'
          ? `No tienes suficiente maná para ${spell.nameEs} (${spell.mpCost} PM).`
          : `You do not have enough mana for ${spell.name} (${spell.mpCost} MP).`,
        mood: 'neutral',
      })];
    }

    if (spell.healing) {
      const current = this.state.combat ? getCurrentCombatant(this.state.combat) : undefined;
      if (this.state.combat && (!current || current.type !== 'player')) return [];

      const healing = Math.max(1, rollDamage(spell.healing, 0).total);
      player.mp -= spell.mpCost;
      healCharacter(player, healing);
    this.syncHeroIntoCombat();
      if (this.state.combat) applyHealing(this.state.combat, player.id, healing);
      this.recordCombatStep();
      const entries = [makeEntry({
        type: 'narration',
        content: this.language === 'es'
          ? `Lanzas ${spell.nameEs} y recuperas ${healing} puntos de vida.`
          : `You cast ${spell.name} and recover ${healing} HP.`,
        mood: 'triumph',
      })];
      if (this.state.combat) {
        const combatant = this.state.combat.initiativeOrder.find(candidate => candidate.id === player.id);
        if (combatant) player.hp = combatant.hp;
        nextTurn(this.state.combat);
        entries.push(...this.resolveEnemyTurns(shouldAddNarrative));
      }
      return entries;
    }

    const encounter = this.state.combat;
    if (!encounter) {
      return [makeEntry({
        type: 'system',
        content: this.language === 'es'
          ? `${spell.nameEs} necesita un objetivo hostil en combate.`
          : `${spell.name} needs a hostile target in combat.`,
        mood: 'neutral',
      })];
    }

    const current = getCurrentCombatant(encounter);
    if (!current || current.type !== 'player') return [];
    const enemies = getEnemies(encounter);
    const requestedTarget = action.target?.toLowerCase();
    const target = requestedTarget
      ? enemies.find(enemy => enemy.name.toLowerCase().includes(requestedTarget)
          || enemy.nameEs.toLowerCase().includes(requestedTarget))
      : enemies[0];
    if (!target) {
      return [makeEntry({
        type: 'system',
        content: this.language === 'es' ? 'Ese objetivo no está en combate.' : 'That target is not in combat.',
        mood: 'neutral',
      })];
    }

    player.mp -= spell.mpCost;
    const result = resolveAttack(current, target, encounter, true, spell.damage, spell.damageType);
    applyDamage(encounter, target.id, result.damage);
    this.recordCombatStep();
    const entries: NarrativeEntry[] = [
      makeEntry({
        type: 'dice',
        content: this.language === 'es'
          ? `${spell.nameEs}: ${result.roll.total} vs CA ${result.targetAc} → ${result.hit ? `${result.damage} DE DAÑO` : 'FALLA'}`
          : `${spell.name}: ${result.roll.total} vs AC ${result.targetAc} → ${result.hit ? `${result.damage} DAMAGE` : 'MISS'}`,
        mood: result.hit ? 'triumph' : 'neutral',
      }),
      makeEntry({
        type: 'narration',
        content: this.language === 'es'
          ? `Lanzas ${spell.nameEs} contra ${target.nameEs}.${result.hit ? ` Infliges ${result.damage} de daño.` : ' El hechizo falla.'}`
          : `You cast ${spell.name} at ${target.name}.${result.hit ? ` It deals ${result.damage} damage.` : ' The spell misses.'}`,
        mood: result.hit ? 'triumph' : 'neutral',
      }),
    ];

    if (target.hp <= 0) {
      if (!this.state.worldState.killedEnemies.includes(target.id)) this.state.worldState.killedEnemies.push(target.id);
      const enemyTemplate = encounter.enemies.find(enemy => enemy.id === target.id);
      if (enemyTemplate) addExperience(player, enemyTemplate.xpValue);
      const outcome = isEncounterOver(encounter);
      if (outcome === 'victory') {
        encounter.state = 'victory';
        this.recordCombatStep();
        entries.push(makeEntry({
          type: 'combat',
          content: this.language === 'es' ? '¡Victoria! Los enemigos han sido derrotados.' : 'Victory! The enemies have been defeated.',
          mood: 'triumph',
        }));
        if (this.state.location === this.chapter().hooks.bossLocationId) {
          entries.push(...this.beginWardenAftermath(shouldAddNarrative));
        }
        this.state.combat = null;
        return entries;
      }
    }

    nextTurn(encounter);
    entries.push(...this.resolveEnemyTurns(shouldAddNarrative));
    return entries;
  }

  private handleDefend(): NarrativeEntry[] {
    if (!this.state.combat) return [];

    const current = getCurrentCombatant(this.state.combat);
    if (!current || current.type !== 'player') return [];

    // Defending lasts through the immediately resolved enemy turns.
    current.ac += 2;
    nextTurn(this.state.combat);
    const results = [this.addNarrative({
      type: 'narration',
      content: this.language === 'es'
        ? 'Te preparas para defenderte. Tu defensa se ha fortalecido.'
        : 'You brace yourself for defense. Your AC is increased by 2 this round.',
      mood: 'neutral',
    })];
    results.push(...this.resolveEnemyTurns(true));
    current.ac = Math.max(0, current.ac - 2);
    return results;
  }

  private handleFlee(): NarrativeEntry[] {
    if (!this.state.combat) return [];

    const current = getCurrentCombatant(this.state.combat);
    if (!current || current.type !== 'player') return [];

    const success = attemptFlee(current, this.state.combat);

    if (success) {
      this.state.combat = null;
      return [this.addNarrative({
        type: 'narration',
        content: this.language === 'es'
          ? '¡Logras escapar del combate!'
          : 'You manage to escape from combat!',
        mood: 'tense',
      })];
    } else {
      nextTurn(this.state.combat);
      const results = [this.addNarrative({
        type: 'narration',
        content: this.language === 'es'
          ? '¡No puedes escapar! El enemigo te bloquea el paso.'
          : 'You can\'t escape! The enemy blocks your path.',
        mood: 'danger',
      })];
      results.push(...this.resolveEnemyTurns(true));
      return results;
    }
  }

  private resolveEnemyTurns(shouldAddNarrative: boolean): NarrativeEntry[] {
    const results: NarrativeEntry[] = [];
    let safety = 0;

    const makeEntry = (entry: Omit<NarrativeEntry, 'id' | 'timestamp'>): NarrativeEntry =>
      shouldAddNarrative ? this.addNarrative(entry) : this.createNarrativeEntry(entry);

    while (this.state.combat && safety < this.state.combat.initiativeOrder.length * 2) {
      const encounter = this.state.combat;
      const current = getCurrentCombatant(encounter);
      if (!current || current.type === 'player') break;
      safety++;

      const action = enemyAction(encounter, current);
      if (!action) break;

      if (action.type === 'flee') {
        current.isAlive = false;
        results.push(makeEntry({
          type: 'combat',
          content: this.language === 'es'
            ? `${current.nameEs} huye de la batalla.`
            : `${current.name} flees the battle.`,
          mood: 'neutral',
        }));
      } else {
        const target = encounter.initiativeOrder.find(combatant => combatant.id === action.targetId);
        if (!target) break;

        if (this.state.flags.council_escort_present && !this.state.flags.council_escort_intervened) {
          this.state.flags.council_escort_intervened = true;
          results.push(makeEntry({
            type: 'combat',
            content: this.language === 'es'
              ? 'Un guardia del consejo intercepta el primer ataque dirigido contra ti.'
              : 'A council guard intercepts the first attack aimed at you.',
            mood: 'triumph',
          }));
        } else {
          const attack = resolveAttack(current, target, encounter);
          let appliedDamage = attack.damage;
          let defenseMessage: string | undefined;

          if (target.type === 'player' && attack.hit && attack.damage > 0
            && this.state.flags.mage_arcane_ward && !this.state.flags.mage_arcane_ward_used) {
            appliedDamage = 0;
            this.state.flags.mage_arcane_ward_used = true;
            defenseMessage = this.language === 'es'
              ? 'La barrera arcana reconstruida absorbe por completo el primer golpe.'
              : 'The reconstructed arcane ward completely absorbs the first hit.';
          } else if (target.type === 'player' && attack.hit && attack.damage >= target.hp
            && this.state.flags.cleric_sanctuary && !this.state.flags.cleric_sanctuary_used) {
            appliedDamage = Math.max(0, target.hp - 1);
            this.state.flags.cleric_sanctuary_used = true;
            defenseMessage = this.language === 'es'
              ? 'El juramento consagrado rechaza la muerte y te mantiene con 1 punto de vida.'
              : 'The consecrated oath turns death aside and leaves you at 1 HP.';
          }

          applyDamage(encounter, target.id, appliedDamage);
          this.recordCombatStep();
          const drainedLife = attack.hit && appliedDamage > 0 && current.abilities.includes('Life Drain')
            ? Math.max(1, Math.ceil(appliedDamage / 2))
            : 0;
          if (drainedLife > 0) applyHealing(encounter, current.id, drainedLife);
          const character = this.state.party.find(member => member.id === target.id);
          if (character) character.hp = target.hp;

          results.push(makeEntry({
            type: 'combat',
            content: this.language === 'es'
              ? `${current.nameEs} ataca a ${target.nameEs}: ${attack.hit ? `${appliedDamage} de daño` : 'falla'}.${drainedLife ? ` Drenaje de vida: recupera ${drainedLife} HP.` : ''}${defenseMessage ? ` ${defenseMessage}` : ''}`
              : `${current.name} attacks ${target.name}: ${attack.hit ? `${appliedDamage} damage` : 'miss'}.${drainedLife ? ` Life Drain restores ${drainedLife} HP.` : ''}${defenseMessage ? ` ${defenseMessage}` : ''}`,
            mood: defenseMessage ? 'triumph' : attack.hit ? 'danger' : 'neutral',
          }));
        }
      }

      const outcome = isEncounterOver(encounter);
      if (outcome === 'defeat') {
        encounter.state = 'defeat';
        this.recordCombatStep();
        results.push(makeEntry({
          type: 'combat',
          content: this.language === 'es'
            ? 'Has caído. La oscuridad de la cripta reclama otra historia.'
            : 'You have fallen. The darkness of the crypt claims another story.',
          mood: 'horror',
        }));
        this.state.combat = null;
        for (const entry of this.checkHeroDeath()) results.push(makeEntry(entry));
        break;
      }
      if (outcome === 'victory') {
        encounter.state = 'victory';
        this.recordCombatStep();
        results.push(makeEntry({
          type: 'combat',
          content: this.language === 'es' ? '¡Victoria!' : 'Victory!',
          mood: 'triumph',
        }));
        if (this.state.location === this.chapter().hooks.bossLocationId) {
          results.push(...this.beginWardenAftermath(shouldAddNarrative));
        }
        this.state.combat = null;
        break;
      }

      nextTurn(encounter);
    }

    return results;
  }

  private handleSearch(action: InterpretedAction): NarrativeEntry[] {
    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    const results: NarrativeEntry[] = [];
    let found = false;

    for (const secret of currentLoc.secrets) {
      if (secret.discovered) continue;

      if (secret.requiresCheck) {
        const check = rollSkillCheck(
          secret.requiresCheck.skill,
          this.state.party[0].attributes,
          0,
          secret.requiresCheck.dc
        );

        if (check.success) {
          secret.discovered = true;
          this.state.worldState.discoveredSecrets.push(secret.id);
          found = true;

          results.push(this.addNarrative({
            type: 'dice',
            content: this.language === 'es'
              ? `${secret.requiresCheck.skill.toUpperCase()}: ${check.total} vs DC ${check.dc} - ¡ÉXITO`
              : `${secret.requiresCheck.skill.toUpperCase()}: ${check.total} vs DC ${check.dc} - SUCCESS`,
            mood: 'triumph',
          }));

          results.push(this.addNarrative({
            type: 'narration',
            content: this.language === 'es' ? secret.descriptionEs : secret.description,
            mood: 'mystery',
          }));

          // Discover contained items
          if (secret.contains) {
            for (const itemId of secret.contains) {
              const item = this.resolveItem(itemId);
              if (item) {
                this.state.party[0].inventory.push(item);
                results.push(this.addNarrative({
                  type: 'system',
                  content: this.language === 'es'
                    ? `Descubres: ${item.nameEs}`
                    : `You discover: ${item.name}`,
                  mood: 'triumph',
                }));
              }
            }
          }

          eventBus.emit(createEvent('SECRET_DISCOVERED', { secretId: secret.id }));
          break;
        }
      }
    }

    if (!found) {
      results.push(this.addNarrative({
        type: 'narration',
        content: this.language === 'es'
          ? 'Buscas cuidadosamente pero no encuentras nada especial.'
          : 'You search carefully but find nothing special.',
        mood: 'neutral',
      }));
    }

    return results;
  }

  private handleOpen(action: InterpretedAction): NarrativeEntry[] {
    const target = action.target;
    if (!target) return [];

    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    for (const obj of currentLoc.objects) {
      if (obj.name.toLowerCase().includes(target.toLowerCase()) ||
          obj.nameEs.toLowerCase().includes(target.toLowerCase())) {

        if (obj.contains && obj.contains.length > 0) {
          const results: NarrativeEntry[] = [];
          for (const itemId of obj.contains) {
            const item = createItem(itemId);
            if (item) {
              this.state.party[0].inventory.push(item);
              results.push(this.addNarrative({
                type: 'system',
                content: this.language === 'es'
                  ? `Encuentras: ${item.nameEs}`
                  : `You find: ${item.name}`,
                mood: 'triumph',
              }));
            }
          }
          obj.contains = [];
          return results;
        }

        return [this.addNarrative({
          type: 'narration',
          content: this.language === 'es'
            ? `Abres ${obj.nameEs}. ${obj.descriptionEs}`
            : `You open the ${obj.name}. ${obj.description}`,
          mood: 'neutral',
        })];
      }
    }

    return [this.addNarrative({
      type: 'system',
      content: this.language === 'es'
        ? `No puedes abrir "${target}".`
        : `You can't open "${target}".`,
      mood: 'neutral',
    })];
  }

  private handleTalk(action: InterpretedAction): NarrativeEntry[] {
    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    const targetName = action.dialogueTarget;
    const inputLower = action.dialogueContent?.toLowerCase() || '';

    // Find NPC - try to match by name, alias, or description
    for (const npcId of currentLoc.npcs) {
      const npc = this.state.worldState.npcs[npcId];
      if (!npc) continue;

      // Check multiple matching criteria
      const nameMatch = targetName && (
        npc.name.toLowerCase().includes(targetName.toLowerCase()) ||
        npc.nameEs.toLowerCase().includes(targetName.toLowerCase())
      );

      // Check for aliases in the input
      const aliasMatch = !targetName && (
        (npcId === 'mysterious_stranger' && (inputLower.includes('encapuchado') || inputLower.includes('stranger') || inputLower.includes('hooded') || inputLower.includes('figura'))) ||
        (npcId === 'innkeeper_martik' && (inputLower.includes('tabernero') || inputLower.includes('innkeeper') || inputLower.includes('martik'))) ||
        (npcId === 'elder_mira' && (inputLower.includes('anciana') || inputLower.includes('elder') || inputLower.includes('mira'))) ||
        (npcId === 'blacksmith_aldric' && (inputLower.includes('herrero') || inputLower.includes('blacksmith') || inputLower.includes('aldric'))) ||
        (npcId === 'priest_sera' && (inputLower.includes('sacerdotisa') || inputLower.includes('priest') || inputLower.includes('sera')))
      );

      if ((nameMatch || aliasMatch) && npc.dialogue.length > 0) {
        // Start dialogue from greeting
        const greeting = npc.dialogue.find(d => d.id === 'greeting') || npc.dialogue[0];

        // Set active dialogue state
        this.state.activeDialogue = {
          npcId: npc.id,
          currentNodeId: greeting.id,
          speaker: npc.name,
          speakerEs: npc.nameEs,
          responses: greeting.responses,
        };

        // Auto-activate main quest when talking to Martik or Mira
        if (npc.id === 'innkeeper_martik' || npc.id === 'elder_mira') {
          this.activateQuest('the_sunken_crypt');
        }
        if (npc.id === 'innkeeper_martik') {
          this.state.flags.talked_to_martik = true;
          this.updateQuestProgress('investigate_rumors', 1);
        }

        return [this.addNarrative({
          type: 'dialogue',
          speaker: npc.name,
          speakerEs: npc.nameEs,
          content: this.language === 'es' ? greeting.textEs : greeting.text,
          mood: 'neutral',
          dialogueResponses: greeting.responses,
        })];
      }
    }

    // No NPC matched - describe the scene instead
    return [this.addNarrative({
      type: 'narration',
      content: this.language === 'es'
        ? 'No estás seguro de con quién querés hablar.'
        : 'You\'re not sure who you want to talk to.',
      mood: 'neutral',
    })];
  }

  private handleInventory(): NarrativeEntry[] {
    const player = this.state.party[0];
    const equipped = Object.entries(player.equipment)
      .filter(([_, item]) => item)
      .map(([slot, item]) => `${slot}: ${item!.name}`)
      .join(', ');

    const inventory = player.inventory.map(i => i.name).join(', ');

    return [this.addNarrative({
      type: 'system',
      content: this.language === 'es'
        ? `EQUIPADO: ${equipped || 'Nada'}\nINVENTARIO: ${inventory || 'Vacío'}\nORO: ${player.gold}`
        : `EQUIPPED: ${equipped || 'Nothing'}\nINVENTORY: ${inventory || 'Empty'}\nGOLD: ${player.gold}`,
      mood: 'neutral',
    })];
  }

  private handleCharacterSheet(): NarrativeEntry[] {
    const p = this.state.party[0];
    return [this.addNarrative({
      type: 'system',
      content: this.language === 'es'
        ? `${p.name} | Nv.${p.level} | ${p.archetype}\nHP: ${p.hp}/${p.maxHp} | MP: ${p.mp}/${p.maxMp}\nFUE:${p.attributes.strength} DES:${p.attributes.dexterity} CON:${p.attributes.constitution} INT:${p.attributes.intelligence} SAB:${p.attributes.wisdom} CAR:${p.attributes.charisma}`
        : `${p.name} | Lvl.${p.level} | ${p.archetype}\nHP: ${p.hp}/${p.maxHp} | MP: ${p.mp}/${p.maxMp}\nSTR:${p.attributes.strength} DEX:${p.attributes.dexterity} CON:${p.attributes.constitution} INT:${p.attributes.intelligence} WIS:${p.attributes.wisdom} CHA:${p.attributes.charisma}`,
      mood: 'neutral',
    })];
  }

  private handleQuestLog(): NarrativeEntry[] {
    const activeQuests = this.state.quests.filter(q => q.state === 'active' || q.state === 'updated');
    if (activeQuests.length === 0) {
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? 'No tienes misiones activas.'
          : 'You have no active quests.',
        mood: 'neutral',
      })];
    }

    const questText = activeQuests.map(q => {
      const objectives = q.objectives.map(o =>
        `  ${o.completed ? '✓' : '○'} ${this.language === 'es' ? o.descriptionEs : o.description}`
      ).join('\n');
      return `${q.name}\n${objectives}`;
    }).join('\n\n');

    return [this.addNarrative({
      type: 'system',
      content: questText,
      mood: 'neutral',
    })];
  }

  private handleRest(): NarrativeEntry[] {
    if (this.state.combat) {
      return [this.addNarrative({
        type: 'system',
        content: this.language === 'es'
          ? 'No puedes descansar en medio de un combate.'
          : 'You can\'t rest in the middle of combat.',
        mood: 'tense',
      })];
    }

    const player = this.state.party[0];
    const healAmount = Math.floor(player.maxHp * 0.25);
    healCharacter(player, healAmount);
    this.syncHeroIntoCombat();

    this.state.time.hour += 8;
    if (this.state.time.hour >= 24) {
      this.state.time.hour -= 24;
      this.state.time.day++;
    }

    eventBus.emit(createEvent('SHORT_REST', { healAmount }));

    return [this.addNarrative({
      type: 'narration',
      content: this.language === 'es'
        ? `Descansas y recuperas ${healAmount} HP. El tiempo avanza.`
        : `You rest and recover ${healAmount} HP. Time passes.`,
      mood: 'neutral',
    })];
  }

  private handleListen(action: InterpretedAction): NarrativeEntry[] {
    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    return [this.addNarrative({
      type: 'narration',
      content: this.language === 'es'
        ? 'Escuchas atentamente los sonidos a tu alrededor...'
        : 'You listen carefully to the sounds around you...',
      mood: 'mystery',
    })];
  }

  private addNarrative(entry: Omit<NarrativeEntry, 'id' | 'timestamp'>): NarrativeEntry {
    const fullEntry: NarrativeEntry = {
      ...entry,
      id: `narr_${++this.narrativeIdCounter}`,
      timestamp: Date.now(),
      important: entry.mood !== 'neutral',
    };
    this.narrative.push(fullEntry);
    return fullEntry;
  }

  private recalculateStats(character: Character): void {
    character.ac = getEffectiveAC({ equipment: character.equipment, attributes: character.attributes });
  }

  private activateQuest(questId: string): boolean {
    const quest = this.state.quests.find(q => q.id === questId);
    if (quest && quest.state === 'available') {
      quest.state = 'active';
      eventBus.emit(createEvent('QUEST_UPDATED', { questId }));
      return true;
    }
    return false;
  }

  private updateQuestProgress(objectiveId: string, progress: number): void {
    for (const quest of this.state.quests) {
      if (quest.state !== 'active' && quest.state !== 'updated') continue;
      const objective = quest.objectives.find(o => o.id === objectiveId);
      if (objective && !objective.completed) {
        objective.current = Math.min(objective.required, objective.current + progress);
        if (objective.current >= objective.required) {
          objective.completed = true;
          quest.state = 'updated';
          eventBus.emit(createEvent('QUEST_UPDATED', { questId: quest.id, objectiveId }));
        }
      }
    }
  }

  processDialogueResponse(responseIndex: number): NarrativeEntry[] {
    const dialogue = this.state.activeDialogue;
    if (!dialogue) return [];

    const response = dialogue.responses[responseIndex];
    if (!response) return [];

    // Find the NPC and the next dialogue node
    const npc = this.state.worldState.npcs[dialogue.npcId];
    if (!npc) {
      this.state.activeDialogue = null;
      return [];
    }

    const nextNode = npc.dialogue.find(d => d.id === response.nextNodeId);
    if (!nextNode) {
      // End of dialogue
      this.state.activeDialogue = null;
      return [];
    }

    // Update active dialogue
    this.state.activeDialogue = {
      ...dialogue,
      currentNodeId: nextNode.id,
      responses: nextNode.responses,
    };

    // Emit effects if any
    if (response.effects) {
      for (const effect of response.effects) {
        eventBus.emit(createEvent(effect.type, effect.data));
      }
    }

    // Check for quest activation based on dialogue content
    const dialogueText = (nextNode.text + nextNode.textEs).toLowerCase();
    const responseText = (response.text + response.textEs).toLowerCase();
    const shouldActivate = 
      dialogueText.includes('missing') || dialogueText.includes('crypt') ||
      dialogueText.includes('desaparecido') || dialogueText.includes('cripta') ||
      responseText.includes('i\'ll help') || responseText.includes('i\'ll find them') ||
      responseText.includes('ayudar') || responseText.includes('encontraré');
    if (shouldActivate) {
      this.activateQuest('the_sunken_crypt');
    }

    const results: NarrativeEntry[] = [];

    // Show the player's response as an action
    results.push(this.addNarrative({
      type: 'action',
      content: this.language === 'es' ? response.textEs : response.text,
    }));

    // Show the NPC's response
    results.push(this.addNarrative({
      type: 'dialogue',
      speaker: npc.name,
      speakerEs: npc.nameEs,
      content: this.language === 'es' ? nextNode.textEs : nextNode.text,
      mood: 'neutral',
      dialogueResponses: nextNode.responses.length > 0 ? nextNode.responses : undefined,
    }));

    // If no more responses, clear active dialogue
    if (nextNode.responses.length === 0) {
      this.state.activeDialogue = null;
    }

    return results;
  }

  getActiveDialogue(): DialogueState | null {
    return this.state.activeDialogue;
  }

  getState(): GameState {
    return this.state;
  }

  getNarrative(): NarrativeEntry[] {
    return this.narrative;
  }

  getLocation(): WorldLocation | undefined {
    return this.state.worldState.locations[this.state.location];
  }

  getNPCs(): NPC[] {
    const loc = this.getLocation();
    if (!loc) return [];
    return loc.npcs
      .map(id => this.state.worldState.npcs[id])
      .filter(Boolean);
  }

  getCombat(): CombatEncounter | null {
    return this.state.combat;
  }

  /**
   * Returns and clears the recorded combat steps. The UI plays these back one
   * at a time so a round's worth of HP changes render as a sequence rather than
   * a single jump. Returns an empty array for non-combat inputs.
   */
  consumeCombatSteps(): CombatEncounter[] {
    const steps = this.combatSteps;
    this.combatSteps = [];
    return steps;
  }

  private recordCombatStep(): void {
    if (!this.state.combat) return;
    const snapshot = snapshotCombat(this.state.combat);
    if (snapshot) this.combatSteps.push(snapshot);
  }

  setLanguage(lang: Language): void {
    this.language = lang;
  }

  restoreGame(state: GameState, narrative: NarrativeEntry[], language: Language): void {
    this.state = state;
    this.narrative = narrative;
    this.language = language;
    this.narrativeIdCounter = narrative.length;
    for (const character of this.state.party) {
      if (character.spells?.length > 0) continue;
      character.spells = ARCHETYPES[character.archetype].startingSpells
        .map(spellId => SPELL_TEMPLATES[spellId])
        .filter(Boolean)
        .map(spell => ({ ...spell }));
    }

    // Saves written before chapters were data carry no chapter list; the
    // authored chapter is the only thing they could have been playing.
    if (!Array.isArray(this.state.chapters) || this.state.chapters.length === 0) {
      this.state.chapters = [CHAPTER_ONE];
      this.state.activeChapterIndex = 0;
    }
    if (typeof this.state.activeChapterIndex !== 'number'
      || !this.state.chapters[this.state.activeChapterIndex]) {
      this.state.activeChapterIndex = this.state.chapters.length - 1;
    }
    if (!Array.isArray(this.state.chronicle)) this.state.chronicle = [];
    if (!this.state.puzzles) this.state.puzzles = createPuzzleRuntime();
    this.state.puzzles.progress ??= {};
    this.state.puzzles.attempts ??= {};
    this.state.puzzles.solved ??= this.state.worldState.solvedPuzzles ?? [];
    if (!this.state.status) {
      const node = this.storyNode(this.state.story.currentNodeId);
      this.state.status = node && nodeKind(node) === 'ending' ? 'chapter_complete' : 'playing';
    }
    if (this.state.status === 'playing' && (this.state.party[0]?.hp ?? 1) <= 0) {
      this.state.status = 'dead';
    }
    this.normalizeStoryPosition();
  }

  /**
   * Adds the next reviewed authored chapter to the campaign and starts it. The caller
   * is responsible for having validated it; the engine trusts what it loads.
   */
  appendChapter(chapter: Chapter): NarrativeEntry[] {
    return this.loadChapter(chapter);
  }

  getLastActionSummary(): string {
    const recent = this.narrative.slice(-5);
    return recent
      .filter(e => e.type === 'system' || e.type === 'dice' || e.type === 'combat')
      .map(e => e.content)
      .join('\n');
  }

  replaceLastNarrative(results: NarrativeEntry[]): void {
    const count = results.length;
    if (count > 0 && this.narrative.length >= count) {
      this.narrative.splice(-count, count, ...results);
    }
  }

  private createNarrativeEntry(data: Omit<NarrativeEntry, 'id' | 'timestamp'>): NarrativeEntry {
    return {
      ...data,
      id: `narr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
  }

  private tryDialogueInputRaw(rawInput: string): NarrativeEntry[] {
    const dialogue = this.state.activeDialogue;
    if (!dialogue) return [];

    const inputLower = rawInput.toLowerCase().trim();
    const responses = dialogue.responses;

    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const responseText = (this.language === 'es' ? response.textEs : response.text).toLowerCase();
      const inputWords = inputLower.split(/\s+/);
      const responseWords = responseText.split(/\s+/);

      const overlap = inputWords.filter(w => w.length > 2 && responseWords.some(rw => rw.includes(w) || w.includes(rw)));
      const matchRatio = overlap.length / Math.max(inputWords.length, 1);

      if (matchRatio > 0.4 || inputLower === responseText) {
        return this.processDialogueResponseRaw(i);
      }
    }

    return [];
  }

  private processActionRaw(action: InterpretedAction): NarrativeEntry[] {
    const results: NarrativeEntry[] = [];

    switch (action.type) {
      case 'move':
        results.push(...this.handleMoveRaw(action));
        break;
      case 'examine':
        results.push(...this.handleExamineRaw(action));
        break;
      case 'take':
        results.push(...this.handleTakeRaw(action));
        break;
      case 'use':
        results.push(...this.handleUseRaw(action));
        break;
      case 'equip':
        results.push(...this.handleEquipRaw(action));
        break;
      case 'attack':
        results.push(...this.handleAttackRaw(action));
        break;
      case 'cast':
        results.push(...this.handleCast(action, false));
        break;
      case 'defend':
        results.push(...this.handleDefendRaw());
        break;
      case 'flee':
        results.push(...this.handleFleeRaw());
        break;
      case 'search':
        results.push(...this.handleSearchRaw(action));
        break;
      case 'open':
        results.push(...this.handleOpenRaw(action));
        break;
      case 'talk':
        results.push(...this.handleTalkRaw(action));
        break;
      case 'inventory':
        results.push(...this.handleInventoryRaw());
        break;
      case 'character_sheet':
        results.push(...this.handleCharacterSheetRaw());
        break;
      case 'quest_log':
        results.push(...this.handleQuestLogRaw());
        break;
      case 'rest':
        results.push(...this.handleRestRaw());
        break;
      case 'listen':
        results.push(...this.handleListenRaw(action));
        break;
      default:
        results.push(this.createNarrativeEntry({
          type: 'system',
          content: this.language === 'es' ? 'No puedes hacer eso ahora.' : 'You can\'t do that right now.',
          mood: 'neutral',
        }));
    }

    return results;
  }

  private handleMoveRaw(action: InterpretedAction): NarrativeEntry[] {
    if (this.state.combat) {
      return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? 'No puedes huir de un combate así. Usa "huir" si quieres escapar.' : 'You can\'t just walk away from combat. Use "flee" if you want to escape.', mood: 'tense' })];
    }

    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    const direction = action.direction || 'forward';
    const nextLocId = this.resolveConnectedLocation(currentLoc, direction);

    if (!nextLocId) {
      return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? 'No hay salida en esa dirección.' : 'There is no exit in that direction.', mood: 'neutral' })];
    }

    const nextLoc = this.state.worldState.locations[nextLocId];
    if (nextLoc?.requiresKey) {
      const hasKey = this.state.party[0]?.inventory.some(i => i.templateId === nextLoc.requiresKey);
      if (!hasKey) {
        return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? 'La puerta está cerrada con llave.' : 'The door is locked.', mood: 'tense' })];
      }
    }

    this.state.location = nextLocId;
    const narrations: NarrativeEntry[] = [];

    narrations.push(this.createNarrativeEntry({
      type: 'narration',
      content: nextLoc ? (this.language === 'es' ? nextLoc.descriptionEs : nextLoc.description) : 'You move to a new area.',
      mood: nextLoc?.dangerLevel ? (nextLoc.dangerLevel > 2 ? 'danger' : 'tense') : 'neutral',
      illustration: nextLocId,
    }));

    if (nextLoc?.enemies && nextLoc.enemies.length > 0) {
      const aliveEnemies = nextLoc.enemies.filter(eId =>
        !this.state.worldState.killedEnemies.includes(eId) && !this.state.flags[`bypassed_enemy_${eId}`]
      );
      if (aliveEnemies.length > 0) {
        const enemies = aliveEnemies.map(eId => {
          const template = this.monsterTemplate(eId);
          return { ...template, id: eId } as Enemy;
        });
        const prepared = this.prepareStoryEncounter(nextLocId, enemies);
        if (prepared.bypassMessage) {
          narrations.push(this.createNarrativeEntry({ type: 'narration', content: prepared.bypassMessage, mood: 'triumph' }));
          nextLoc.discovered = true;
          eventBus.emit(createEvent('PLAYER_ENTERED_LOCATION', { locationId: nextLocId }));
          return narrations;
        }
        this.state.combat = createEncounter(this.state.party, prepared.enemies, [], this.state.difficulty);
        const initiativeMessage = this.applyRangerInitiative(this.state.combat);
        this.recordCombatStep();
        for (const message of prepared.openingMessages) {
          narrations.push(this.createNarrativeEntry({ type: 'system', content: message, mood: 'triumph' }));
        }
        if (initiativeMessage) {
          narrations.push(this.createNarrativeEntry({ type: 'system', content: initiativeMessage, mood: 'triumph' }));
        }
        narrations.push(this.createNarrativeEntry({ type: 'combat', content: this.language === 'es' ? `¡Combate! ${prepared.enemies.map(e => e.nameEs).join(', ')}.` : `Combat! ${prepared.enemies.map(e => e.name).join(', ')}.`, mood: 'danger' }));
        narrations.push(...this.resolveEnemyTurns(false));
      }
    }

    nextLoc.discovered = true;
    eventBus.emit(createEvent('PLAYER_ENTERED_LOCATION', { locationId: nextLocId }));
    this.updateQuestProgress('reach_crypt', nextLocId === 'crypt_entrance' ? 1 : 0);

    return narrations;
  }

  private handleExamineRaw(action: InterpretedAction): NarrativeEntry[] {
    const target = action.target;
    if (!target) {
      return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? '¿Qué te gustaría examinar?' : 'What would you like to examine?', mood: 'neutral' })];
    }

    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    if (target === 'room' || target === 'area' || target === 'around') {
      const descriptions: string[] = [];
      descriptions.push(this.language === 'es' ? currentLoc.descriptionEs : currentLoc.description);

      const visibleObjects = currentLoc.objects.filter(o => !o.hidden);
      if (visibleObjects.length > 0) {
        const objectNames = visibleObjects.map(o => this.language === 'es' ? o.nameEs : o.name).join(', ');
        descriptions.push(this.language === 'es' ? `Podés ver: ${objectNames}.` : `You can see: ${objectNames}.`);
      }

      if (currentLoc.npcs.length > 0) {
        const npcNames = currentLoc.npcs
          .map(id => this.state.worldState.npcs[id])
          .filter(Boolean)
          .map(npc => `${npc!.name} (${this.language === 'es' ? npc!.occupationEs : npc!.occupation})`)
          .join(', ');
        descriptions.push(this.language === 'es' ? `Hay aquí: ${npcNames}.` : `Present: ${npcNames}.`);
      }

      return [this.createNarrativeEntry({ type: 'narration', content: descriptions.join('\n'), mood: currentLoc.dangerLevel > 2 ? 'danger' : 'neutral' })];
    }

    for (const obj of currentLoc.objects) {
      if (obj.name.toLowerCase().includes(target.toLowerCase()) || obj.nameEs.toLowerCase().includes(target.toLowerCase())) {
        return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? obj.descriptionEs : obj.description, mood: 'neutral' })];
      }
    }

    for (const npcId of currentLoc.npcs) {
      const npc = this.state.worldState.npcs[npcId];
      if (npc && (npc.name.toLowerCase().includes(target.toLowerCase()) || npc.nameEs.toLowerCase().includes(target.toLowerCase()))) {
        return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? `${npc.nameEs}, ${npc.occupationEs.toLowerCase()}.` : `${npc.name}, ${npc.occupation.toLowerCase()}.`, mood: 'neutral' })];
      }
    }

    return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? `No ves nada especial sobre "${target}".` : `You don't see anything special about "${target}".`, mood: 'neutral' })];
  }

  private handleTakeRaw(action: InterpretedAction): NarrativeEntry[] {
    const itemName = action.item;
    if (!itemName) return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? '¿Qué te gustaría tomar?' : 'What would you like to take?', mood: 'neutral' })];

    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    // 1. Object named like the target (e.g. "dark pedestal" holds the blade).
    for (const obj of currentLoc.objects) {
      if (obj.name.toLowerCase().includes(itemName.toLowerCase()) || obj.nameEs.toLowerCase().includes(itemName.toLowerCase())) {
        if (obj.contains && obj.contains.length > 0) {
          const item = this.resolveItem(obj.contains[0]);
          if (item) {
            this.state.party[0].inventory.push(item);
            obj.contains = obj.contains.slice(1);
            eventBus.emit(createEvent('ITEM_ACQUIRED', { itemId: item.id, itemName: item.name }));
            return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? `Obtienes: ${item.nameEs}` : `Acquired: ${item.name}`, mood: 'triumph' })];
          }
        }
      }
    }

    // 2. The player often names the ITEM, not its container ("take the dark
    // blade" when the blade sits on an unnamed pedestal). Walk containers and
    // match against the resolved contained item's name before giving up.
    for (const obj of currentLoc.objects) {
      if (!obj.contains || obj.contains.length === 0) continue;
      for (const templateId of obj.contains) {
        const contained = this.resolveItem(templateId);
        if (!contained) continue;
        const match = itemNameMatches(contained.name, itemName) || itemNameMatches(contained.nameEs, itemName);
        if (match) {
          this.state.party[0].inventory.push(contained);
          obj.contains = obj.contains.filter(id => id !== templateId);
          eventBus.emit(createEvent('ITEM_ACQUIRED', { itemId: contained.id, itemName: contained.name }));
          return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? `Obtienes: ${contained.nameEs}` : `Acquired: ${contained.name}`, mood: 'triumph' })];
        }
      }
    }

    return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? `No puedes tomar "${itemName}".` : `You can't take "${itemName}".`, mood: 'neutral' })];
  }

  private handleUseRaw(action: InterpretedAction): NarrativeEntry[] {
    const itemName = action.item;
    if (!itemName) return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? '¿Qué objeto te gustaría usar?' : 'What item would you like to use?', mood: 'neutral' })];

    const player = this.state.party[0];
    const item = player.inventory.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()) || i.nameEs.toLowerCase().includes(itemName.toLowerCase()));

    if (!item) return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? `No tienes "${itemName}".` : `You don't have "${itemName}".`, mood: 'neutral' })];

    if (item.consumable) {
      const effect = consumeItem(item);
      if (effect) {
        if (effect.heal) healCharacter(player, effect.heal);
    this.syncHeroIntoCombat();
        if (effect.mp) player.mp = Math.min(player.maxMp, player.mp + effect.mp);
        player.inventory = player.inventory.filter(i => i.id !== item.id);
        eventBus.emit(createEvent('ITEM_CONSUMED', { itemId: item.id }));
        return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? `Usas ${item.nameEs}.` : `You use ${item.name}.`, mood: 'triumph' })];
      }
    }

    return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? `No puedes usar "${itemName}".` : `You can't use "${itemName}".`, mood: 'neutral' })];
  }

  private handleEquipRaw(action: InterpretedAction): NarrativeEntry[] {
    const itemName = action.item;
    if (!itemName) return [];

    const player = this.state.party[0];
    const item = player.inventory.find(i => itemNameMatches(i.name, itemName) || itemNameMatches(i.nameEs, itemName));

    if (!item || !item.slot) return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? `No puedes equipar "${itemName}".` : `You can't equip "${itemName}".`, mood: 'neutral' })];

    const success = equipItem(player, item);
    if (success) {
      this.recalculateStats(player);
      eventBus.emit(createEvent('ITEM_EQUIPPED', { itemId: item.id, slot: item.slot }));
      return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? `Equipas ${item.nameEs}.` : `You equip ${item.name}.`, mood: 'neutral' })];
    }

    return [];
  }

  private handleAttackRaw(action: InterpretedAction): NarrativeEntry[] {
    if (!this.state.combat) return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? 'No hay enemigos aquí.' : 'No enemies here.', mood: 'neutral' })];

    const current = getCurrentCombatant(this.state.combat);
    if (!current || current.type !== 'player') return [];

    const targetName = action.target;
    const enemies = getEnemies(this.state.combat);
    const target = targetName ? enemies.find(e => e.name.toLowerCase().includes(targetName.toLowerCase())) : enemies[0];

    if (!target) return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? 'Ese enemigo no está aquí.' : 'That enemy isn\'t here.', mood: 'neutral' })];

    const result = resolveAttack(current, target, this.state.combat);
    applyDamage(this.state.combat, target.id, result.damage);
    this.recordCombatStep();

    const narrations: NarrativeEntry[] = [];
    narrations.push(this.createNarrativeEntry({
      type: 'dice',
      content: `D20: ${result.roll.results[0]} + ${result.roll.modifier} = ${result.roll.total} vs AC ${result.targetAc} → ${result.hit ? `${result.damage} DMG${result.critical ? ' CRIT' : ''}` : 'MISS'}`,
      mood: result.hit ? 'triumph' : 'neutral',
    }));

    if (target.hp <= 0) {
      this.state.worldState.killedEnemies.push(target.id);
      const enemyTemplate = this.state.combat.enemies.find(e => e.id === target.id);
      if (enemyTemplate) addExperience(this.state.party[0], enemyTemplate.xpValue);

      const outcome = isEncounterOver(this.state.combat);
      if (outcome === 'victory') {
        this.state.combat.state = 'victory';
        this.recordCombatStep();
        narrations.push(this.createNarrativeEntry({ type: 'combat', content: this.language === 'es' ? '¡Victoria!' : 'Victory!', mood: 'triumph' }));
        if (this.state.location === this.chapter().hooks.bossLocationId) {
          narrations.push(...this.beginWardenAftermath(false));
        }
        this.state.combat = null;
      } else {
        nextTurn(this.state.combat);
        narrations.push(...this.resolveEnemyTurns(false));
      }
    } else {
      nextTurn(this.state.combat);
      narrations.push(...this.resolveEnemyTurns(false));
    }

    return narrations;
  }

  private handleDefendRaw(): NarrativeEntry[] {
    if (!this.state.combat) return [];
    const current = getCurrentCombatant(this.state.combat);
    if (!current || current.type !== 'player') return [];
    current.ac += 2;
    nextTurn(this.state.combat);
    const results = [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? 'Te preparas para defenderte.' : 'You brace for defense.', mood: 'neutral' })];
    results.push(...this.resolveEnemyTurns(false));
    current.ac = Math.max(0, current.ac - 2);
    return results;
  }

  private handleFleeRaw(): NarrativeEntry[] {
    if (!this.state.combat) return [];
    const current = getCurrentCombatant(this.state.combat);
    if (!current || current.type !== 'player') return [];
    const success = attemptFlee(current, this.state.combat);
    if (success) {
      this.state.combat = null;
      return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? '¡Escapás!' : 'You escape!', mood: 'tense' })];
    } else {
      nextTurn(this.state.combat);
      const results = [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? '¡No podés escapar!' : 'Can\'t escape!', mood: 'danger' })];
      results.push(...this.resolveEnemyTurns(false));
      return results;
    }
  }

  private handleSearchRaw(action: InterpretedAction): NarrativeEntry[] {
    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    for (const secret of currentLoc.secrets) {
      if (secret.discovered) continue;
      if (secret.requiresCheck) {
        const check = rollSkillCheck(secret.requiresCheck.skill, this.state.party[0].attributes, 0, secret.requiresCheck.dc);
        if (check.success) {
          secret.discovered = true;
          this.state.worldState.discoveredSecrets.push(secret.id);
          const results: NarrativeEntry[] = [];
          results.push(this.createNarrativeEntry({ type: 'dice', content: `${secret.requiresCheck.skill.toUpperCase()}: ${check.total} vs DC ${check.dc} - SUCCESS`, mood: 'triumph' }));
          results.push(this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? secret.descriptionEs : secret.description, mood: 'mystery' }));
          if (secret.contains) {
            for (const itemId of secret.contains) {
              const item = this.resolveItem(itemId);
              if (item) {
                this.state.party[0].inventory.push(item);
                results.push(this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? `Descubres: ${item.nameEs}` : `You discover: ${item.name}`, mood: 'triumph' }));
              }
            }
          }
          eventBus.emit(createEvent('SECRET_DISCOVERED', { secretId: secret.id }));
          return results;
        }
      }
    }

    return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? 'No encontrás nada especial.' : 'You find nothing special.', mood: 'neutral' })];
  }

  private handleOpenRaw(action: InterpretedAction): NarrativeEntry[] {
    const target = action.target;
    if (!target) return [];
    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    for (const obj of currentLoc.objects) {
      if (obj.name.toLowerCase().includes(target.toLowerCase()) || obj.nameEs.toLowerCase().includes(target.toLowerCase())) {
        if (obj.contains && obj.contains.length > 0) {
          const results: NarrativeEntry[] = [];
          for (const itemId of obj.contains) {
            const item = this.resolveItem(itemId);
            if (item) {
              this.state.party[0].inventory.push(item);
              results.push(this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? `Encuentras: ${item.nameEs}` : `You find: ${item.name}`, mood: 'triumph' }));
            }
          }
          obj.contains = [];
          return results;
        }
        return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? `Abres ${obj.nameEs}.` : `You open the ${obj.name}.`, mood: 'neutral' })];
      }
    }

    return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? `No podés abrir "${target}".` : `Can't open "${target}".`, mood: 'neutral' })];
  }

  private handleTalkRaw(action: InterpretedAction): NarrativeEntry[] {
    const currentLoc = this.state.worldState.locations[this.state.location];
    if (!currentLoc) return [];

    const targetName = action.dialogueTarget;
    const inputLower = action.dialogueContent?.toLowerCase() || '';

    for (const npcId of currentLoc.npcs) {
      const npc = this.state.worldState.npcs[npcId];
      if (!npc) continue;

      const nameMatch = targetName && (npc.name.toLowerCase().includes(targetName.toLowerCase()) || npc.nameEs.toLowerCase().includes(targetName.toLowerCase()));

      const aliasMatch = !targetName && (
        (npcId === 'mysterious_stranger' && (inputLower.includes('encapuchado') || inputLower.includes('stranger') || inputLower.includes('hooded') || inputLower.includes('figura'))) ||
        (npcId === 'innkeeper_martik' && (inputLower.includes('tabernero') || inputLower.includes('innkeeper') || inputLower.includes('martik'))) ||
        (npcId === 'elder_mira' && (inputLower.includes('anciana') || inputLower.includes('elder') || inputLower.includes('mira'))) ||
        (npcId === 'blacksmith_aldric' && (inputLower.includes('herrero') || inputLower.includes('blacksmith') || inputLower.includes('aldric'))) ||
        (npcId === 'priest_sera' && (inputLower.includes('sacerdotisa') || inputLower.includes('priest') || inputLower.includes('sera')))
      );

      if ((nameMatch || aliasMatch) && npc.dialogue.length > 0) {
        const greeting = npc.dialogue.find(d => d.id === 'greeting') || npc.dialogue[0];
        this.state.activeDialogue = {
          npcId: npc.id,
          currentNodeId: greeting.id,
          speaker: npc.name,
          speakerEs: npc.nameEs,
          responses: greeting.responses,
        };

        if (npc.id === 'innkeeper_martik' || npc.id === 'elder_mira') {
          this.activateQuest('the_sunken_crypt');
        }
        if (npc.id === 'innkeeper_martik') {
          this.state.flags.talked_to_martik = true;
          this.updateQuestProgress('investigate_rumors', 1);
        }

        return [this.createNarrativeEntry({
          type: 'dialogue',
          speaker: npc.name,
          speakerEs: npc.nameEs,
          content: this.language === 'es' ? greeting.textEs : greeting.text,
          mood: 'neutral',
          dialogueResponses: greeting.responses,
        })];
      }
    }

    return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? 'No estás seguro de con quién querés hablar.' : 'You\'re not sure who to talk to.', mood: 'neutral' })];
  }

  private handleInventoryRaw(): NarrativeEntry[] {
    const player = this.state.party[0];
    const equipped = Object.entries(player.equipment).filter(([_, item]) => item).map(([slot, item]) => `${slot}: ${item!.name}`).join(', ');
    const inventory = player.inventory.map(i => i.name).join(', ');
    return [this.createNarrativeEntry({ type: 'system', content: `EQUIPPED: ${equipped || 'None'}\nINVENTORY: ${inventory || 'Empty'}\nGOLD: ${player.gold}`, mood: 'neutral' })];
  }

  private handleCharacterSheetRaw(): NarrativeEntry[] {
    const p = this.state.party[0];
    return [this.createNarrativeEntry({ type: 'system', content: `${p.name} | Lvl.${p.level} | ${p.archetype}\nHP: ${p.hp}/${p.maxHp} | MP: ${p.mp}/${p.maxMp}\nSTR:${p.attributes.strength} DEX:${p.attributes.dexterity} CON:${p.attributes.constitution} INT:${p.attributes.intelligence} WIS:${p.attributes.wisdom} CHA:${p.attributes.charisma}`, mood: 'neutral' })];
  }

  private handleQuestLogRaw(): NarrativeEntry[] {
    const activeQuests = this.state.quests.filter(q => q.state === 'active' || q.state === 'updated');
    if (activeQuests.length === 0) return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? 'No tenés misiones activas.' : 'No active quests.', mood: 'neutral' })];
    const questText = activeQuests.map(q => {
      const objectives = q.objectives.map(o => `  ${o.completed ? '✓' : '○'} ${this.language === 'es' ? o.descriptionEs : o.description}`).join('\n');
      return `${q.name}\n${objectives}`;
    }).join('\n\n');
    return [this.createNarrativeEntry({ type: 'system', content: questText, mood: 'neutral' })];
  }

  private handleRestRaw(): NarrativeEntry[] {
    if (this.state.combat) return [this.createNarrativeEntry({ type: 'system', content: this.language === 'es' ? 'No podés descansar en combate.' : 'Can\'t rest in combat.', mood: 'tense' })];
    const player = this.state.party[0];
    const healAmount = Math.floor(player.maxHp * 0.25);
    healCharacter(player, healAmount);
    this.syncHeroIntoCombat();
    this.state.time.hour += 8;
    if (this.state.time.hour >= 24) { this.state.time.hour -= 24; this.state.time.day++; }
    eventBus.emit(createEvent('SHORT_REST', { healAmount }));
    return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? `Descansas y recuperás ${healAmount} HP.` : `You rest and recover ${healAmount} HP.`, mood: 'neutral' })];
  }

  private handleListenRaw(action: InterpretedAction): NarrativeEntry[] {
    return [this.createNarrativeEntry({ type: 'narration', content: this.language === 'es' ? 'Escuchás atentamente...' : 'You listen carefully...', mood: 'mystery' })];
  }
}

/**
 * Loose name match for taking items: compares either direction after stripping
 * common articles, so "la hoja" finds "Hoja Oscura" just as "hoja oscura" does.
 */
function itemNameMatches(itemName: string, targetName: string): boolean {
  const strip = (s: string) => s.toLowerCase()
    .replace(/^(la |el |los |las |un |una |unos |unas |the |a |an )/, '')
    .trim();
  const a = strip(itemName);
  const b = strip(targetName);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}
