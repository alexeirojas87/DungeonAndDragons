// ============================================================
// Playthrough harness
//   pnpm playthrough
// Drives GameEngine directly, with no browser, so flow bugs are
// reproducible even when a browser driver is unavailable. It walks
// full runs for every archetype x origin, solving and abandoning
// puzzles, and asserts nothing ever strands the player.
// ============================================================

import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/engine/gameEngine';
import { addExperience, createCharacter } from '../src/engine/character';
import {
  ARCHETYPE_IDS, ORIGIN_IDS, ChapterSchema, coerceChapterShape, nodeKind,
  normalizeChapter, validateChapter, type Chapter,
} from '../src/engine/chapter';
import { getSuggestedActions } from '../src/engine/intent';
import { getEffectiveAC } from '../src/engine/inventory';
import { CHAPTER_ONE } from '../src/data/chapters';
import type { Archetype, Origin } from '../src/engine/types';

const MAX_STEPS = 200;

/**
 * Optional: a chapter JSON captured from /api/chapter. Playing a generated
 * chapter through the same suites is the only proof that "valid" also means
 * "playable" — pass the file as the first argument.
 */
const generatedPath = process.argv[2];

interface RunResult {
  hero: string;
  reachedSettled: boolean;
  reachedEnding: boolean;
  puzzlesSolved: string[];
  puzzlesSeen: string[];
  steps: number;
  failures: string[];
}

/**
 * Picks the next decision. Puzzle branches are taken first so every run
 * actually exercises them; otherwise the choice rotates by hero, which spreads
 * the 25 runs across the graph instead of walking one path 25 times.
 */
function pickChoice(
  engine: GameEngine,
  rotation: number,
  skipPuzzles: Set<string> = new Set(),
): { id: string; leadsToPuzzle: boolean } | null {
  const chapter = engine.getChapter();
  const choices = engine.getAvailableStoryChoices();
  if (choices.length === 0) return null;

  const puzzleIdFor = (nextNodeId: string): string | null => {
    const target = chapter?.nodes[nextNodeId];
    if (!target || nodeKind(target) !== 'puzzle') return null;
    return target.puzzleId ?? null;
  };

  const toPuzzle = choices.find(choice => {
    const puzzleId = puzzleIdFor(choice.nextNodeId);
    return puzzleId !== null && !skipPuzzles.has(puzzleId);
  });
  if (toPuzzle) return { id: toPuzzle.id, leadsToPuzzle: true };

  // A player who walked away from a puzzle does not walk straight back in.
  const others = choices.filter(choice => puzzleIdFor(choice.nextNodeId) === null);
  const pool = others.length > 0 ? others : choices;
  return { id: pool[rotation % pool.length].id, leadsToPuzzle: false };
}

function newEngine(archetype: Archetype, origin: Origin, chapter?: Chapter): GameEngine {
  const engine = new GameEngine();
  engine.setLanguage('en');
  engine.initGame(createCharacter('Harness', archetype, origin));
  if (chapter) engine.appendChapter(chapter);
  return engine;
}

function run(
  archetype: Archetype,
  origin: Origin,
  solvePuzzles: boolean,
  rotation: number,
  chapter?: Chapter,
): RunResult {
  const engine = newEngine(archetype, origin, chapter);

  const failures: string[] = [];
  const puzzlesSeen = new Set<string>();
  const puzzlesDropped = new Set<string>();
  let steps = 0;

  while (steps < MAX_STEPS) {
    const state = engine.getState();
    if (state.status === 'chapter_complete' || state.status === 'dead') break;

    const puzzleView = engine.getPuzzleView();
    if (puzzleView) {
      puzzlesSeen.add(puzzleView.puzzle.id);
      if (!solvePuzzles) {
        puzzlesDropped.add(puzzleView.puzzle.id);
        engine.processInputRaw('abandon puzzle');
        steps++;
        continue;
      }
      // Solving is deliberately done the slow way: keep making attempts and let
      // the hint ladder run out. If a puzzle can ever fail to resolve, this hangs
      // against MAX_STEPS and the run is reported as stuck.
      engine.processInputRaw(nextPuzzleAttempt(engine, puzzleView, steps));
      steps++;
      continue;
    }

    const story = state.story;
    if (story.completed) break;

    // The button row must agree with the engine: if the engine has choices, the
    // UI has to be offering them.
    const suggestions = getSuggestedActions({
      locationId: state.location,
      hasCombat: !!state.combat,
      chapter: engine.getChapter(),
      story,
      flags: state.flags,
      hero: state.party[0],
      activePuzzle: null,
      status: state.status,
    });

    const choice = pickChoice(engine, rotation + steps, puzzlesDropped);
    if (!choice) {
      failures.push(`no story choice available at node ${story.currentNodeId}`);
      break;
    }
    if (!suggestions.some(option => option.action === `__story__:${choice.id}`)) {
      failures.push(`choice ${choice.id} exists in the engine but is not offered by the UI`);
    }

    engine.processInputRaw(`__story__:${choice.id}`);
    steps++;
  }

  const state = engine.getState();
  const node = engine.getChapter()?.nodes[state.story.currentNodeId];
  const kind = node ? nodeKind(node) : 'beat';

  if (steps >= MAX_STEPS) failures.push('run did not settle within the step budget');

  return {
    hero: `${archetype}/${origin}`,
    reachedSettled: kind === 'route' || kind === 'ending',
    reachedEnding: kind === 'ending',
    puzzlesSolved: [...state.worldState.solvedPuzzles],
    puzzlesSeen: [...puzzlesSeen],
    steps,
    failures,
  };
}

function nextPuzzleAttempt(
  engine: GameEngine,
  view: NonNullable<ReturnType<GameEngine['getPuzzleView']>>,
  seed: number,
): string {
  const puzzle = view.puzzle;
  if (puzzle.kind === 'mechanism') {
    // Deliberately wrong order first, to exercise the reset path.
    const order = view.attempts === 0 && seed % 2 === 0
      ? [...puzzle.steps].reverse()
      : puzzle.steps;
    return order[view.progress.length] ?? order[0];
  }
  if (puzzle.kind === 'riddle') {
    return view.attempts >= puzzle.hints.length ? puzzle.answers[0] : 'a wrong guess';
  }
  return 'examine';
}

// ---- Aftermath and death paths, which no story choice can reach ----

function runAftermath(archetype: Archetype, origin: Origin): string[] {
  const failures: string[] = [];
  const engine = newEngine(archetype, origin);

  const chapter = engine.getChapter()!;
  const state = engine.getState();
  // Stand the hero where the boss dies, with the flags a real run could carry.
  state.flags.c01_has_vial = true;
  state.flags.c01_intends_destroy = true;
  state.story.currentNodeId = chapter.hooks.aftermathNodeId;
  state.story.completed = false;

  let steps = 0;
  let sawRunePuzzle = false;
  while (steps < 40 && engine.getState().status === 'playing') {
    const view = engine.getPuzzleView();
    if (view) {
      engine.processInputRaw(nextPuzzleAttempt(engine, view, steps));
      steps++;
      continue;
    }
    const current = engine.getState();
    const choice = pickChoice(engine, steps);
    if (!choice) {
      failures.push(`${archetype}/${origin}: aftermath offered no choices at ${current.story.currentNodeId}`);
      break;
    }
    sawRunePuzzle ||= choice.leadsToPuzzle;
    engine.processInputRaw(`__story__:${choice.id}`);
    steps++;
  }

  if (engine.getState().status !== 'chapter_complete') {
    failures.push(`${archetype}/${origin}: aftermath never completed the chapter (status ${engine.getState().status})`);
  }
  if (engine.getChronicle().length !== 1) {
    failures.push(`${archetype}/${origin}: chronicle has ${engine.getChronicle().length} entries, expected 1`);
  }
  if (!sawRunePuzzle) {
    failures.push(`${archetype}/${origin}: the aftermath rune puzzle was never offered`);
  }
  if (!engine.getState().worldState.solvedPuzzles.includes('c01_drowned_door_runes')) {
    failures.push(`${archetype}/${origin}: the rune puzzle never resolved`);
  }
  return failures;
}

function runDeath(): string[] {
  const failures: string[] = [];
  const engine = newEngine('warrior', 'ironcoast');

  const hero = engine.getState().party[0];
  hero.hp = 1;
  // Walk into the boss room and fight until it resolves one way or the other.
  engine.getState().location = engine.getChapter()!.hooks.bossLocationId;
  for (let step = 0; step < 60 && engine.getState().status === 'playing'; step++) {
    engine.processInputRaw('attack');
  }

  const state = engine.getState();
  if (state.status === 'dead') {
    const blocked = engine.processInputRaw('look around');
    const content = blocked.map(entry => entry.content).join(' ');
    if (!/dead/i.test(content)) {
      failures.push('input after death was not refused');
    }
    if (state.combat) failures.push('combat survived the hero');
  }
  return failures;
}

// ---- Report ----

let failed = false;
const report = (label: string, failures: string[]) => {
  if (failures.length === 0) {
    console.log(`✓ ${label}`);
    return;
  }
  failed = true;
  console.log(`✗ ${label}`);
  for (const failure of failures) console.log(`    ${failure}`);
};

const heroes = ARCHETYPE_IDS.flatMap(archetype => ORIGIN_IDS.map(origin => ({ archetype, origin })));

function suite(chapter: Chapter | undefined, name: string): void {
 for (const solvePuzzles of [true, false]) {
  const label = solvePuzzles ? 'solving every puzzle' : 'abandoning every puzzle';
  const failures: string[] = [];
  let sawPuzzle = false;
  let solvedAny = false;

  for (const [index, { archetype, origin }] of heroes.entries()) {
    const result = run(archetype, origin, solvePuzzles, index, chapter);
    failures.push(...result.failures.map(failure => `${result.hero}: ${failure}`));
    if (!result.reachedSettled) {
      failures.push(`${result.hero}: never reached a route or ending`);
    }
    if (result.puzzlesSeen.length > 0) sawPuzzle = true;
    if (result.puzzlesSolved.length > 0) solvedAny = true;
  }

  if (solvePuzzles && !solvedAny) failures.push('no run ever solved a puzzle');
  if (!sawPuzzle) failures.push('no run ever encountered a puzzle');

  report(`${name} — 25 heroes, ${label}`, failures);
 }
}

suite(undefined, 'chapter-01');

report(
  'aftermath to ending, all heroes',
  heroes.flatMap(({ archetype, origin }) => runAftermath(archetype, origin)),
);

report('death locks the run', runDeath());

/**
 * Healing during a fight must survive the next round. The character and its
 * combatant are two copies of the same hit points, and combat reads the
 * combatant: a potion that healed only the character was silently undone, so
 * the player watched a full health bar die to one hit.
 */
function runHealingInCombat(): string[] {
  const failures: string[] = [];
  const engine = newEngine('cleric', 'shadowfen');
  const state = engine.getState();
  state.story.completed = true;
  state.location = 'c01_crypt_antechamber';
  engine.processInputRaw('go forward');

  const encounter = engine.getState().combat;
  if (!encounter) return ['no combat started, cannot test healing'];

  const hero = engine.getState().party[0];
  const combatant = encounter.initiativeOrder.find(entry => entry.id === hero.id);
  if (!combatant) return ['hero has no combatant'];

  combatant.hp = 2;
  hero.hp = 2;
  engine.processInputRaw('use health potion');

  const healed = engine.getState().party[0].hp;
  const healedCombatant = engine.getState().combat?.initiativeOrder.find(e => e.id === hero.id)?.hp;
  if (healed <= 2) failures.push(`potion did not heal the character (hp ${healed})`);
  if (healedCombatant !== healed) {
    failures.push(`combatant hp ${healedCombatant} does not match character hp ${healed} after healing`);
  }
  return failures;
}

/** A level must actually be worth something. */
function runLevelUp(): string[] {
  const failures: string[] = [];
  const engine = newEngine('cleric', 'shadowfen');
  const hero = engine.getState().party[0];
  const before = { level: hero.level, maxHp: hero.maxHp, maxMp: hero.maxMp };

  addExperience(hero, 5000);

  if (hero.level <= before.level) failures.push('a large award granted no level');
  if (hero.level < 4) failures.push(`only reached level ${hero.level} from 5000 xp; levels are not stacking`);
  if (hero.maxHp <= before.maxHp) failures.push(`maxHp unchanged at ${hero.maxHp} after levelling`);
  if (before.maxMp > 0 && hero.maxMp <= before.maxMp) failures.push('maxMp unchanged after levelling');
  if (!Number.isInteger(hero.experienceToNext)) {
    failures.push(`experienceToNext is fractional: ${hero.experienceToNext}`);
  }
  return failures;
}

/**
 * Cold-restore every node of a chapter and demand a way forward. A playtester
 * hit "a hard dead-end that survives reload": saving on a puzzle node and
 * reloading once the puzzle was solved left a node with no puzzle and no
 * choices. This walks every node the same way, for solved and unsolved puzzles.
 */
function runNoDeadEnds(chapter: Chapter, label: string): string[] {
  const failures: string[] = [];
  const heroes: Array<[Archetype, Origin]> = [
    ['warrior', 'ironcoast'], ['mage', 'stormreach'], ['cleric', 'shadowfen'],
  ];

  for (const [archetype, origin] of heroes) {
    for (const node of Object.values(chapter.nodes)) {
      const kind = nodeKind(node);
      if (kind === 'route' || kind === 'ending' || node.terminal) continue;

      for (const puzzlesAlreadySolved of [false, true]) {
        const seed = newEngine(archetype, origin, chapter.index > 1 ? chapter : undefined);
        const state = seed.getState();
        state.story.currentNodeId = node.id;
        state.story.completed = false;
        if (puzzlesAlreadySolved) {
          for (const puzzleId of Object.keys(chapter.puzzles)) {
            state.worldState.solvedPuzzles.push(puzzleId);
            state.puzzles.solved.push(puzzleId);
          }
        }

        // Round-trip through a save, exactly as a browser reload does.
        const engine = new GameEngine();
        engine.restoreGame(JSON.parse(JSON.stringify(state)), [], 'en');

        const live = engine.getState();
        const hasPuzzle = !!engine.getPuzzleView();
        const hasChoice = engine.getAvailableStoryChoices().length > 0;
        const settled = live.story.completed;
        if (hasPuzzle || hasChoice || settled) continue;

        failures.push(
          `${archetype}/${origin} restored on ${node.id}`
          + `${puzzlesAlreadySolved ? ' with puzzles solved' : ''}: no puzzle, no choices, story not settled`,
        );
      }
    }
  }
  return failures;
}

report('chapter-01 has no dead ends after a reload', runNoDeadEnds(CHAPTER_ONE, 'chapter-01'));
/**
 * Equipment must never make you easier to hit. `acBonus` was being assigned as
 * the whole armour class instead of added to the base, so putting on chainmail
 * and a shield dropped a cleric from 16 to 8 and a mage in robes to 1 — every
 * enemy then hit nearly every swing and losing runs could not be recovered.
 */
function runArmourHelps(): string[] {
  const failures: string[] = [];
  for (const [archetype, origin] of [
    ['warrior', 'ironcoast'], ['cleric', 'shadowfen'], ['mage', 'stormreach'], ['rogue', 'deephollow'],
  ] as Array<[Archetype, Origin]>) {
    const bare = createCharacter('T', archetype, origin);
    const designed = bare.ac;

    const engine = newEngine(archetype, origin);
    const dressed = engine.getState().party[0];
    const worn = getEffectiveAC(dressed);

    if (worn < designed) {
      failures.push(`${archetype}: wearing starting gear drops AC from ${designed} to ${worn}`);
    }
    if (dressed.ac !== worn) {
      failures.push(`${archetype}: sidebar AC ${dressed.ac} disagrees with effective AC ${worn}`);
    }
    if (worn < 10) {
      failures.push(`${archetype}: equipped AC ${worn} is below an unarmoured commoner`);
    }
  }
  return failures;
}

/**
 * A checkpoint must never drop the player back INSIDE the fight that killed
 * them: at low health with no supplies that is an unwinnable loop with no way
 * to retreat, heal or choose another route.
 */
function runCheckpointIsSafe(): string[] {
  const failures: string[] = [];
  const engine = newEngine('cleric', 'shadowfen');
  const state = engine.getState();
  state.story.completed = true;
  state.location = 'c01_crypt_antechamber';

  // The last safe snapshot is taken before the input that starts the fight.
  const safe = JSON.parse(JSON.stringify(engine.getState()));
  engine.processInputRaw('go forward');
  if (!engine.getState().combat) return ['no combat started, cannot test the checkpoint'];

  const restored = new GameEngine();
  restored.restoreGame(safe, [], 'en');
  const back = restored.getState();

  if (back.combat) failures.push('the pre-fight checkpoint still contains an active combat');
  if ((back.party[0]?.hp ?? 0) <= 0) failures.push('the pre-fight checkpoint restores a dead hero');
  if (back.status !== 'playing') failures.push(`checkpoint status is ${back.status}, expected playing`);
  return failures;
}

report('armour never lowers defence', runArmourHelps());
report('a checkpoint never restores you inside a fight', runCheckpointIsSafe());
report('healing survives the next combat round', runHealingInCombat());
report('levelling grants stats', runLevelUp());

/**
 * Every suggestion button that claims to move the player must actually move
 * them. A playtester hit a chapter that looked unwinnable because the deeper
 * rooms offered no exits and the phrasing the buttons used did not match.
 */
function runNavigation(chapter: Chapter): string[] {
  const failures: string[] = [];
  for (const [from, suggestions] of Object.entries(chapter.suggestions)) {
    for (const suggestion of suggestions) {
      if (!/^go /.test(suggestion.action)) continue;
      const engine = newEngine('warrior', 'ironcoast', chapter.index > 1 ? chapter : undefined);
      const state = engine.getState();
      if (!state.worldState.locations[from]) {
        failures.push(`suggestion for unknown location ${from}`);
        continue;
      }
      state.location = from;
      state.story.completed = true;
      state.combat = null;
      engine.processInputRaw(suggestion.action);
      if (engine.getState().location === from) {
        failures.push(`${from}: "${suggestion.action}" (${suggestion.label}) does not move the player`);
      }
    }
  }
  return failures;
}

report('chapter-01 movement suggestions all work', runNavigation(CHAPTER_ONE));

// ---- A generated chapter, held to the same standard ----

if (generatedPath) {
  const payload = JSON.parse(readFileSync(generatedPath, 'utf8'));
  const raw = payload.chapter ?? payload;

  const parsed = ChapterSchema.safeParse(coerceChapterShape(raw));
  if (!parsed.success) {
    report(
      `${generatedPath} schema`,
      parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
    );
  } else {
    const { chapter } = normalizeChapter(parsed.data as unknown as Chapter);
    report(`${chapter.id} schema`, []);
    report(`${chapter.id} structure`, validateChapter(chapter));
    report(`${chapter.id} movement suggestions all work`, runNavigation(chapter));
    report(`${chapter.id} has no dead ends after a reload`, runNoDeadEnds(chapter, chapter.id));
    suite(chapter, `${chapter.id} (generated)`);
  }
}

process.exit(failed ? 1 : 0);
