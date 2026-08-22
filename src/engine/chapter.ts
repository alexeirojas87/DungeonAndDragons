// ============================================================
// CHAPTER CONTRACT
// A chapter is data, not runtime generation. Every reviewed authored chapter
// goes through the same schema and structural validator.
// ============================================================

import { z } from 'zod';
import type {
  Archetype, Character, Enemy, NPC, Origin, Quest, Skill, StoryRoute, WorldLocation,
} from './types';
import { ITEM_TEMPLATES, type ItemTemplate } from './inventory';
import type { Puzzle } from './puzzles';

// ---- Story graph pieces (canonical home; storyGraph.ts re-exports these) ----

export interface StoryCondition {
  flag: string;
  equals?: boolean;
}

export interface StoryValueCondition {
  key: string;
  min?: number;
  max?: number;
}

export interface StoryChoice {
  id: string;
  label: string;
  labelEs: string;
  nextNodeId: string;
  setsFlags?: Record<string, boolean>;
  adjustsValues?: Record<string, number>;
  requires?: StoryCondition[];
  requiresValues?: StoryValueCondition[];
  archetypes?: Archetype[];
  origins?: Origin[];
  result?: string;
  resultEs?: string;
}

export type StoryNodeKind = 'beat' | 'route' | 'puzzle' | 'ending';

export interface StoryNode {
  id: string;
  title: string;
  titleEs: string;
  text: string;
  textEs: string;
  choices: StoryChoice[];
  kind?: StoryNodeKind;
  /** Required when kind === 'puzzle'. */
  puzzleId?: string;
  /**
   * Moves the player to this location on arrival. Without it a chapter whose
   * beats are all story nodes never leaves its starting room, and the location
   * header contradicts the prose.
   */
  locationId?: string;
  route?: StoryRoute;
  terminal?: boolean;
  externalEntry?: boolean;
  /** Authored summary metadata for local and campaign endings. */
  outcome?: 'success' | 'failure' | 'ambiguous';
  survivors?: string[];
  casualties?: string[];
  globalEndingId?: 'new_concord' | 'last_guardian' | 'unbound_world' | 'veil_ascendant' | 'court_restored' | 'decentralized_oaths';
}

// ---- Chapter pieces ----

export interface IntroBeat {
  type: 'system' | 'narration';
  /** `{name}` and `{origin}` are substituted with the hero's own values. */
  text: string;
  textEs: string;
  mood?: 'neutral' | 'tense' | 'danger' | 'triumph' | 'horror' | 'humor' | 'mystery';
}

export interface SuggestedAction {
  /** Ignored on chapter data: the UI renumbers whatever survives filtering. */
  key?: string;
  label: string;
  labelEs: string;
  action: string;
  /** Only offered when these flags hold. */
  requires?: StoryCondition[];
  /** Only offered on these travel routes. */
  routes?: StoryRoute[];
  /** 'before' = only during the decision phase, 'after' = only once it is settled. */
  phase?: 'before' | 'after';
}

export interface StoryFact {
  flag: string;
  en: string;
  es?: string;
  /** When this flag is also set, the spent wording replaces the default. */
  spentFlag?: string;
  spentEn?: string;
  spentEs?: string;
}

export interface ChapterHooks {
  /** Winning a fight here triggers the aftermath node. Replaces hardcoded ids. */
  bossLocationId: string;
  aftermathNodeId: string;
  /** route -> locationId the party ends up in. */
  routeDestinations?: Partial<Record<StoryRoute, string>>;
}

export interface Chapter {
  id: string;
  index: number;
  title: string;
  titleEs: string;
  premise: string;
  premiseEs: string;
  intro: IntroBeat[];
  startNodeId: string;
  startLocationId: string;
  nodes: Record<string, StoryNode>;
  puzzles: Record<string, Puzzle>;
  locations: Record<string, WorldLocation>;
  npcs: Record<string, NPC>;
  monsters: Record<string, Omit<Enemy, 'id'>>;
  items?: Record<string, ItemTemplate>;
  quests: Record<string, Quest>;
  mainQuestId: string;
  hooks: ChapterHooks;
  storyFacts: StoryFact[];
  suggestions: Record<string, SuggestedAction[]>;
  /**
   * Nodes marked `externalEntry` are re-entered by gameplay (after travel or a
   * boss fight), not by a graph edge, so the validator cannot know which flags
   * are set by then. Each entry lists the flag sets that reaching it may imply.
   */
  externalEntrySeeds?: Record<string, Array<Record<string, boolean>>>;
  /** Flags worth carrying into the next chapter's prompt. */
  summaryFlags?: string[];
}

export function nodeKind(node: StoryNode): StoryNodeKind {
  if (node.kind) return node.kind;
  if (node.route) return 'route';
  if (node.terminal) return 'ending';
  return 'beat';
}

export interface ChapterSummary {
  chapterId: string;
  index: number;
  title: string;
  titleEs: string;
  endingNodeId: string;
  endingTitle: string;
  endingTitleEs: string;
  route?: StoryRoute;
  outcome: 'success' | 'failure' | 'ambiguous';
  keyFlags: string[];
  values: Record<string, number>;
  puzzlesSolved: string[];
  survivors: string[];
  casualties: string[];
  heroSnapshot: {
    level: number;
    hp: number;
    maxHp: number;
    gold: number;
    notableItems: string[];
  };
}

export const ARCHETYPE_IDS: Archetype[] = ['warrior', 'rogue', 'ranger', 'mage', 'cleric'];
export const ORIGIN_IDS: Origin[] = ['ashenvale', 'ironcoast', 'shadowfen', 'stormreach', 'deephollow'];

export const SKILL_IDS: Skill[] = [
  'melee', 'ranged', 'athletics', 'acrobatics', 'stealth',
  'sleight_of_hand', 'investigation', 'arcana', 'history',
  'insight', 'perception', 'survival', 'deception',
  'intimidation', 'persuasion', 'performance', 'religion',
  'medicine', 'nature', 'animal_handling',
];

// ============================================================
// ZOD SCHEMA — shape gate for authored campaign data
// ============================================================

const id = z.string().regex(/^[a-z][a-z0-9_]*$/, 'ids must be snake_case');
const stateKey = z.string().regex(
  /^(?:[a-z][a-z0-9_]*:)?[a-z][a-z0-9_]*$/,
  'state keys must be snake_case, optionally namespaced',
);
const text = z.string().min(1);
const idList = z.array(id);

const bilingual = z.object({ en: text, es: text });

const skillEnum = z.enum(SKILL_IDS as [Skill, ...Skill[]]);
const routeEnum = z.enum(['direct', 'forest', 'secret_tunnel', 'varen', 'council']);
const damageTypeEnum = z.enum([
  'slashing', 'piercing', 'bludgeoning', 'fire', 'cold',
  'lightning', 'necrotic', 'radiant', 'poison', 'psychic',
]);
export const AMBIANCE_IDS = [
  'tavern', 'dungeon', 'crypt', 'forest', 'town', 'battle', 'boss',
  'shop', 'temple', 'sewer', 'outdoor', 'cave', 'library', 'throne',
] as const;
const ambianceEnum = z.enum(AMBIANCE_IDS);
const moodEnum = z.enum(['neutral', 'tense', 'danger', 'triumph', 'horror', 'humor', 'mystery']);

const storyConditionSchema = z.object({
  flag: stateKey,
  equals: z.boolean().optional(),
});

const storyValueConditionSchema = z.object({
  key: stateKey,
  min: z.number().optional(),
  max: z.number().optional(),
}).refine(condition => condition.min !== undefined || condition.max !== undefined, {
  message: 'numeric conditions need min or max',
});

const storyChoiceSchema = z.object({
  id,
  label: text,
  labelEs: text,
  nextNodeId: id,
  setsFlags: z.record(stateKey, z.boolean()).optional(),
  adjustsValues: z.record(z.string(), z.number()).optional(),
  requires: z.array(storyConditionSchema).optional(),
  requiresValues: z.array(storyValueConditionSchema).optional(),
  archetypes: z.array(z.enum(ARCHETYPE_IDS as [Archetype, ...Archetype[]])).optional(),
  origins: z.array(z.enum(ORIGIN_IDS as [Origin, ...Origin[]])).optional(),
  result: text.optional(),
  resultEs: text.optional(),
});

const storyNodeSchema = z.object({
  id,
  title: text,
  titleEs: text,
  text,
  textEs: text,
  choices: z.array(storyChoiceSchema),
  kind: z.enum(['beat', 'route', 'puzzle', 'ending']).optional(),
  puzzleId: id.optional(),
  locationId: id.optional(),
  route: routeEnum.optional(),
  terminal: z.boolean().optional(),
  externalEntry: z.boolean().optional(),
  outcome: z.enum(['success', 'failure', 'ambiguous']).optional(),
  survivors: idList.optional(),
  casualties: idList.optional(),
  globalEndingId: z.enum([
    'new_concord', 'last_guardian', 'unbound_world', 'veil_ascendant',
    'court_restored', 'decentralized_oaths',
  ]).optional(),
});

const puzzleBaseShape = {
  id,
  title: text,
  titleEs: text,
  prompt: text,
  promptEs: text,
  hints: z.array(bilingual).min(2, 'a puzzle needs at least two hints'),
  unlocks: z.object({
    flags: z.record(stateKey, z.boolean()).optional(),
    items: idList.optional(),
    nodeId: id.optional(),
    locationId: id.optional(),
  }),
  solvedNodeId: id,
  skipNodeId: id,
};

const puzzleSchema = z.discriminatedUnion('kind', [
  z.object({
    ...puzzleBaseShape,
    kind: z.literal('riddle'),
    answers: z.array(text).min(1),
    answersEs: z.array(text).min(1),
  }),
  z.object({
    ...puzzleBaseShape,
    kind: z.literal('mechanism'),
    steps: idList.min(2),
    ordered: z.boolean(),
    stepLabels: z.array(z.object({ id, label: text, labelEs: text })).min(2),
    onWrongStep: bilingual,
  }),
  z.object({
    ...puzzleBaseShape,
    kind: z.literal('check'),
    // Skill is normalised (fuzzy-matched to a real skill) right after schema;
    // the model sometimes writes a near-miss ("strength", "locks") and that is
    // not worth a repair round-trip.
    skill: z.string(),
    dc: z.number().int().min(8).max(20),
    clues: z.array(z.object({ id, en: text, es: text, dcReduction: z.number().int().min(1).max(5) })),
  }),
]);

const worldObjectSchema = z.object({
  id,
  name: text,
  nameEs: text,
  description: text,
  descriptionEs: text,
  interactable: z.boolean(),
  searchDC: z.number().int().optional(),
  contains: idList.optional(),
  broken: z.boolean(),
  hidden: z.boolean(),
});

const secretSchema = z.object({
  id,
  description: text,
  descriptionEs: text,
  discovered: z.boolean(),
  requiresCheck: z.object({ skill: skillEnum, dc: z.number().int() }).optional(),
  contains: idList.optional(),
});

const locationSchema = z.object({
  id,
  name: text,
  nameEs: text,
  description: text,
  descriptionEs: text,
  connections: idList,
  objects: z.array(worldObjectSchema),
  npcs: idList,
  enemies: idList,
  dangerLevel: z.number().int().min(0).max(10),
  discovered: z.boolean(),
  secrets: z.array(secretSchema),
  ambiance: ambianceEnum,
  /** Optional semantic visual hint (e.g. "crypt", "tavern", "arcane"). */
  visualType: z.string().optional(),
  /** Item templateId that gates entry. Kept loose (not the snake_case id
   * pattern): the model writes a semantic token and the referential check
   * below still rejects anything that is not a real item this chapter (or a
   * global template) declares. */
  requiresKey: z.string().min(1).optional(),
});

const dialogueResponseSchema = z.object({
  text,
  textEs: text,
  nextNodeId: z.string().min(1),
  conditions: z.array(z.object({
    type: z.enum(['disposition', 'quest', 'item', 'flag', 'skill_check']),
    value: z.union([z.string(), z.number()]),
    operator: z.enum(['gt', 'lt', 'eq', 'has', 'not_has']),
  })).optional(),
});

const dialogueNodeSchema = z.object({
  id: z.string().min(1),
  text,
  textEs: text,
  responses: z.array(dialogueResponseSchema),
});

const npcSchema = z.object({
  id,
  name: text,
  nameEs: text,
  portrait: z.string().min(1),
  faction: z.string().min(1),
  location: id,
  disposition: z.number().int().min(-100).max(100),
  knowledge: z.array(text),
  memory: z.array(z.unknown()).default([]),
  dialogue: z.array(dialogueNodeSchema).min(1),
  inventory: z.array(z.unknown()).default([]),
  alive: z.boolean(),
  occupation: text,
  occupationEs: text,
  secrets: z.array(text),
  secretsEs: z.array(text),
  personality: text,
  personalityEs: text,
});

const monsterSchema = z.object({
  templateId: id,
  name: text,
  nameEs: text,
  portrait: z.string().min(1),
  hp: z.number().int().min(1),
  maxHp: z.number().int().min(1),
  ac: z.number().int().min(5).max(25),
  attack: z.number().int().min(1).max(30),
  damage: z.string().regex(/^\d+d\d+$/, 'damage must look like 2d6'),
  damageType: damageTypeEnum,
  abilities: z.array(text),
  abilitiesEs: z.array(text),
  xpValue: z.number().int().min(0),
  loot: idList,
  intelligence: z.number().int().min(1).max(20),
  morale: z.number().int().min(0).max(100),
  conditions: z.array(z.unknown()).default([]),
});

const questSchema = z.object({
  id,
  name: text,
  nameEs: text,
  description: text,
  descriptionEs: text,
  state: z.enum(['available', 'active', 'updated', 'failed', 'completed', 'hidden']),
  objectives: z.array(z.object({
    id,
    description: text,
    descriptionEs: text,
    completed: z.boolean(),
    current: z.number().int().min(0),
    required: z.number().int().min(1),
  })).min(1),
  rewards: z.array(z.object({
    type: z.enum(['xp', 'gold', 'item', 'reputation', 'unlock']),
    value: z.union([z.string(), z.number()]),
    itemId: id.optional(),
    factionId: z.string().optional(),
  })),
  isMain: z.boolean(),
  faction: z.string().optional(),
});

const itemTemplateSchema = z.object({
  id,
  name: text,
  nameEs: text,
  type: z.enum(['weapon', 'armor', 'shield', 'consumable', 'quest', 'relic', 'misc']),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'unique']),
  weight: z.number().min(0),
  value: z.number().int().min(0),
  description: text,
  descriptionEs: text,
  properties: z.object({
    damage: z.string().optional(),
    damageType: damageTypeEnum.optional(),
    range: z.number().optional(),
    acBonus: z.number().optional(),
    special: z.array(z.string()).optional(),
    healAmount: z.number().optional(),
    mpRestore: z.number().optional(),
  }),
  maxDurability: z.number().int().optional(),
  slot: z.enum([
    'weapon_main', 'weapon_off', 'armor', 'helmet', 'boots',
    'gloves', 'ring_1', 'ring_2', 'amulet', 'relic',
  ]).optional(),
  usable: z.boolean(),
  consumable: z.boolean(),
});

export const ChapterSchema = z.object({
  id: z.string().regex(/^chapter-\d{2,}$/, "chapter id must look like 'chapter-02'"),
  index: z.number().int().min(1),
  title: text,
  titleEs: text,
  premise: text,
  premiseEs: text,
  intro: z.array(z.object({
    type: z.enum(['system', 'narration']),
    text,
    textEs: text,
    mood: moodEnum.optional(),
  })).min(1),
  startNodeId: id,
  startLocationId: id,
  nodes: z.record(id, storyNodeSchema),
  puzzles: z.record(id, puzzleSchema),
  locations: z.record(id, locationSchema),
  npcs: z.record(id, npcSchema),
  monsters: z.record(id, monsterSchema),
  items: z.record(id, itemTemplateSchema).optional(),
  quests: z.record(id, questSchema),
  mainQuestId: id,
  hooks: z.object({
    bossLocationId: id,
    aftermathNodeId: id,
    routeDestinations: z.record(routeEnum, id).optional(),
  }),
  storyFacts: z.array(z.object({
    flag: stateKey,
    en: text,
    es: text.optional(),
    spentFlag: stateKey.optional(),
    spentEn: text.optional(),
    spentEs: text.optional(),
  })),
  suggestions: z.record(id, z.array(z.object({
    key: z.string().min(1).optional(),
    label: text,
    labelEs: text,
    action: z.string().min(1),
    requires: z.array(storyConditionSchema).optional(),
    routes: z.array(routeEnum).optional(),
    phase: z.enum(['before', 'after']).optional(),
  }))),
  externalEntrySeeds: z.record(id, z.array(z.record(stateKey, z.boolean()))).optional(),
  summaryFlags: z.array(stateKey).optional(),
});

// ============================================================
// STRUCTURAL VALIDATOR
// Generalised from the original validateStoryGraph(): the same
// BFS over (archetype x origin x node x flags), now also walking
// both puzzle exits, plus referential-integrity checks.
// ============================================================

export function isStoryChoiceAvailable(
  choice: StoryChoice,
  flags: Record<string, boolean>,
  hero?: Pick<Character, 'archetype' | 'origin'>,
  values?: Record<string, number>,
): boolean {
  const flagsMatch = (choice.requires ?? []).every(condition =>
    flags[condition.flag] === (condition.equals ?? true)
  );
  if (!flagsMatch) return false;
  if (values && !(choice.requiresValues ?? []).every(condition => {
    const value = values[condition.key] ?? 0;
    return (condition.min === undefined || value >= condition.min)
      && (condition.max === undefined || value <= condition.max);
  })) return false;
  if (choice.archetypes && (!hero || !choice.archetypes.includes(hero.archetype))) return false;
  if (choice.origins && (!hero || !choice.origins.includes(hero.origin))) return false;
  return true;
}

interface WalkState {
  nodeId: string;
  flags: Record<string, boolean>;
  hero: Pick<Character, 'archetype' | 'origin'>;
}

export function validateChapter(chapter: Chapter, usedIds: Set<string> = new Set()): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(Object.keys(chapter.nodes));
  const puzzleIds = new Set(Object.keys(chapter.puzzles));
  const locationIds = new Set(Object.keys(chapter.locations));
  const npcIds = new Set(Object.keys(chapter.npcs));
  const itemIds = new Set(Object.keys(chapter.items ?? {}));
  const monsterIds = new Set(Object.keys(chapter.monsters));

  // ---- keys must agree with embedded ids ----
  for (const [key, node] of Object.entries(chapter.nodes)) {
    if (key !== node.id) errors.push(`node key ${key} does not match node.id ${node.id}`);
  }
  for (const [key, puzzle] of Object.entries(chapter.puzzles)) {
    if (key !== puzzle.id) errors.push(`puzzle key ${key} does not match puzzle.id ${puzzle.id}`);
  }
  for (const [key, location] of Object.entries(chapter.locations)) {
    if (key !== location.id) errors.push(`location key ${key} does not match location.id ${location.id}`);
  }

  // ---- id collisions with earlier chapters ----
  for (const candidate of [...nodeIds, ...puzzleIds, ...locationIds, ...npcIds, ...monsterIds, ...itemIds]) {
    if (usedIds.has(candidate)) errors.push(`id ${candidate} collides with an earlier chapter`);
  }

  // ---- entry points ----
  if (!nodeIds.has(chapter.startNodeId)) errors.push(`startNodeId ${chapter.startNodeId} does not exist`);
  if (!locationIds.has(chapter.startLocationId)) errors.push(`startLocationId ${chapter.startLocationId} does not exist`);
  if (!locationIds.has(chapter.hooks.bossLocationId)) errors.push(`hooks.bossLocationId ${chapter.hooks.bossLocationId} does not exist`);
  if (!nodeIds.has(chapter.hooks.aftermathNodeId)) errors.push(`hooks.aftermathNodeId ${chapter.hooks.aftermathNodeId} does not exist`);
  if (!chapter.quests[chapter.mainQuestId]) errors.push(`mainQuestId ${chapter.mainQuestId} does not exist`);
  for (const [route, destination] of Object.entries(chapter.hooks.routeDestinations ?? {})) {
    if (!locationIds.has(destination)) errors.push(`routeDestinations.${route} targets missing location ${destination}`);
  }

  // ---- node / choice integrity ----
  const choiceIds = new Set<string>();
  const settableFlags = new Set<string>();
  for (const node of Object.values(chapter.nodes)) {
    const kind = nodeKind(node);
    const settles = kind === 'ending' || kind === 'route' || !!node.terminal;
    const isPuzzle = kind === 'puzzle';
    if (!settles && !isPuzzle && node.choices.length === 0) {
      errors.push(`${node.id} has no choices and is neither a route, an ending nor a puzzle`);
    }
    if (isPuzzle) {
      if (!node.puzzleId) errors.push(`${node.id} is a puzzle node without puzzleId`);
      else if (!puzzleIds.has(node.puzzleId)) errors.push(`${node.id} references missing puzzle ${node.puzzleId}`);
    }
    if (node.locationId && !locationIds.has(node.locationId)) {
      errors.push(`${node.id} moves the player to missing location ${node.locationId}`);
    }
    for (const choice of node.choices) {
      if (!nodeIds.has(choice.nextNodeId)) {
        errors.push(`${node.id}.${choice.id} targets missing node ${choice.nextNodeId}`);
      }
      if (choiceIds.has(choice.id)) errors.push(`duplicate choice id ${choice.id}`);
      choiceIds.add(choice.id);
      for (const flag of Object.keys(choice.setsFlags ?? {})) settableFlags.add(flag);
    }
  }

  // ---- puzzle integrity ----
  for (const puzzle of Object.values(chapter.puzzles)) {
    if (!nodeIds.has(puzzle.solvedNodeId)) errors.push(`puzzle ${puzzle.id} solvedNodeId ${puzzle.solvedNodeId} does not exist`);
    if (!nodeIds.has(puzzle.skipNodeId)) errors.push(`puzzle ${puzzle.id} skipNodeId ${puzzle.skipNodeId} does not exist`);
    if (puzzle.solvedNodeId === puzzle.skipNodeId) {
      errors.push(`puzzle ${puzzle.id} solvedNodeId and skipNodeId are identical, so solving it changes nothing`);
    }
    if (puzzle.hints.length < 2) errors.push(`puzzle ${puzzle.id} needs at least two hints`);
    for (const flag of Object.keys(puzzle.unlocks.flags ?? {})) settableFlags.add(flag);
    for (const itemId of puzzle.unlocks.items ?? []) {
      if (!itemIds.has(itemId) && !GLOBAL_ITEM_IDS.has(itemId)) {
        errors.push(`puzzle ${puzzle.id} unlocks unknown item ${itemId}`);
      }
    }
    if (puzzle.unlocks.nodeId && !nodeIds.has(puzzle.unlocks.nodeId)) {
      errors.push(`puzzle ${puzzle.id} unlocks missing node ${puzzle.unlocks.nodeId}`);
    }
    if (puzzle.unlocks.locationId && !locationIds.has(puzzle.unlocks.locationId)) {
      errors.push(`puzzle ${puzzle.id} unlocks missing location ${puzzle.unlocks.locationId}`);
    }
    if (puzzle.kind === 'mechanism') {
      const labelIds = new Set(puzzle.stepLabels.map(label => label.id));
      for (const step of puzzle.steps) {
        if (!labelIds.has(step)) errors.push(`puzzle ${puzzle.id} step ${step} has no stepLabel`);
      }
      if (new Set(puzzle.steps).size !== puzzle.steps.length) {
        errors.push(`puzzle ${puzzle.id} repeats a step`);
      }
    }
    if (puzzle.kind === 'riddle' && (puzzle.answers.length === 0 || puzzle.answersEs.length === 0)) {
      errors.push(`puzzle ${puzzle.id} needs at least one answer in each language`);
    }
  }

  // ---- referential integrity of world data ----
  for (const location of Object.values(chapter.locations)) {
    for (const connection of location.connections) {
      if (!locationIds.has(connection)) {
        errors.push(`location ${location.id} connects to missing location ${connection}`);
        continue;
      }
      // One-way exits are how a player gets stranded in a room.
      if (!chapter.locations[connection].connections.includes(location.id)) {
        errors.push(`location ${location.id} connects to ${connection}, but ${connection} has no way back`);
      }
    }
    for (const npcId of location.npcs) {
      if (!npcIds.has(npcId)) errors.push(`location ${location.id} lists missing npc ${npcId}`);
    }
    for (const enemyId of location.enemies) {
      if (!monsterIds.has(enemyId)) errors.push(`location ${location.id} lists missing monster ${enemyId}`);
    }
    // Carried-item continuity: requiresKey and contains must point at an item
    // this chapter declares or a standard global template — otherwise the gate
    // can never open or the loot can never be taken, and the run breaks later.
    if (location.requiresKey && !itemIds.has(location.requiresKey) && !GLOBAL_ITEM_IDS.has(location.requiresKey)) {
      errors.push(`location ${location.id} requiresKey references unknown item ${location.requiresKey}`);
    }
    for (const object of location.objects) {
      for (const itemId of object.contains ?? []) {
        if (!itemIds.has(itemId) && !GLOBAL_ITEM_IDS.has(itemId)) {
          errors.push(`location ${location.id} object ${object.id} contains unknown item ${itemId}`);
        }
      }
    }
    for (const secret of location.secrets) {
      for (const itemId of secret.contains ?? []) {
        if (!itemIds.has(itemId) && !GLOBAL_ITEM_IDS.has(itemId)) {
          errors.push(`location ${location.id} secret ${secret.id} contains unknown item ${itemId}`);
        }
      }
    }
  }
  for (const npc of Object.values(chapter.npcs)) {
    if (!locationIds.has(npc.location)) errors.push(`npc ${npc.id} lives in missing location ${npc.location}`);
    const dialogueIds = new Set(npc.dialogue.map(node => node.id));
    for (const node of npc.dialogue) {
      for (const response of node.responses) {
        if (response.nextNodeId !== 'end' && !dialogueIds.has(response.nextNodeId)) {
          errors.push(`npc ${npc.id} dialogue ${node.id} points at missing node ${response.nextNodeId}`);
        }
      }
    }
  }

  // ---- dead requirements: a gate nobody can ever open ----
  for (const node of Object.values(chapter.nodes)) {
    for (const choice of node.choices) {
      for (const condition of choice.requires ?? []) {
        if ((condition.equals ?? true) && !settableFlags.has(condition.flag) && !CARRIED_FLAGS.has(condition.flag)) {
          errors.push(`${node.id}.${choice.id} requires flag ${condition.flag}, which nothing in this chapter can set`);
        }
      }
    }
  }

  // ---- reachability: every hero, both puzzle exits ----
  const heroes = ARCHETYPE_IDS.flatMap(archetype => ORIGIN_IDS.map(origin => ({ archetype, origin })));

  const externalEntries = Object.values(chapter.nodes).filter(node => node.externalEntry);

  const seedsFor = (nodeId: string): Array<Record<string, boolean>> => {
    const declared = chapter.externalEntrySeeds?.[nodeId];
    // The bare {} variant is always walked: entering with nothing set must
    // still leave the player a way forward.
    return declared && declared.length > 0 ? [{}, ...declared] : [{}];
  };

  interface WalkResult {
    nodes: Set<string>;
    choices: Set<string>;
    /** heroKey -> reached a node with no outgoing choices (route or ending). */
    settled: Set<string>;
    /** Nodes from which no sequence of available choices ever settles. */
    deadEnds: Set<string>;
  }

  const walk = (
    entries: Array<{ nodeId: string; flags: Record<string, boolean> }>,
    puzzlesSolvable: boolean,
  ): WalkResult => {
    const result: WalkResult = {
      nodes: new Set(), choices: new Set(), settled: new Set(), deadEnds: new Set(),
    };
    const explored = new Set<string>();
    // The state graph is kept so we can ask the question that actually matters:
    // not "does some path settle" but "can this state still settle at all".
    const successors = new Map<string, string[]>();
    const nodeOfState = new Map<string, string>();
    const settledStates = new Set<string>();

    const signatureOf = (state: WalkState): string =>
      `${state.hero.archetype}:${state.hero.origin}|${state.nodeId}|${
        Object.keys(state.flags).filter(key => state.flags[key]).sort().join(',')
      }`;

    const pending: WalkState[] = heroes.flatMap(hero =>
      entries.map(entry => ({ nodeId: entry.nodeId, flags: { ...entry.flags }, hero })),
    );

    while (pending.length > 0) {
      const state = pending.shift()!;
      const signature = signatureOf(state);
      if (explored.has(signature)) continue;
      explored.add(signature);

      const node = chapter.nodes[state.nodeId];
      if (!node) continue;
      result.nodes.add(node.id);
      nodeOfState.set(signature, node.id);

      const heroKey = `${state.hero.archetype}:${state.hero.origin}`;
      const kind = nodeKind(node);
      if (kind === 'ending' || kind === 'route' || node.terminal) {
        result.settled.add(heroKey);
        settledStates.add(signature);
        continue;
      }

      const nextStates: WalkState[] = [];

      if (kind === 'puzzle' && node.puzzleId) {
        const puzzle = chapter.puzzles[node.puzzleId];
        if (puzzle) {
          if (puzzlesSolvable) {
            nextStates.push({
              nodeId: puzzle.solvedNodeId,
              flags: { ...state.flags, ...(puzzle.unlocks.flags ?? {}) },
              hero: state.hero,
            });
          }
          // Abandoning is always available, in both walks.
          nextStates.push({ nodeId: puzzle.skipNodeId, flags: { ...state.flags }, hero: state.hero });
        }
      } else {
        for (const choice of node.choices) {
          if (!isStoryChoiceAvailable(choice, state.flags, state.hero)) continue;
          result.choices.add(choice.id);
          nextStates.push({
            nodeId: choice.nextNodeId,
            flags: { ...state.flags, ...(choice.setsFlags ?? {}) },
            hero: state.hero,
          });
        }
      }

      successors.set(signature, nextStates.map(signatureOf));
      pending.push(...nextStates);
    }

    // Reverse-reachability from settled states: anything that cannot get back
    // here is a place the player can walk into and never leave.
    const predecessors = new Map<string, string[]>();
    for (const [from, tos] of successors) {
      for (const to of tos) {
        const list = predecessors.get(to);
        if (list) list.push(from);
        else predecessors.set(to, [from]);
      }
    }

    const canSettle = new Set<string>(settledStates);
    const queue = [...settledStates];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const previous of predecessors.get(current) ?? []) {
        if (canSettle.has(previous)) continue;
        canSettle.add(previous);
        queue.push(previous);
      }
    }

    // One stuck way in is enough. A node that settles when you arrive holding
    // the right flag, and traps you when you do not, is still a trap.
    for (const [signature, nodeId] of nodeOfState) {
      if (!canSettle.has(signature)) result.deadEnds.add(nodeId);
    }

    return result;
  };

  const allEntries = [
    { nodeId: chapter.startNodeId, flags: {} as Record<string, boolean> },
    ...externalEntries.flatMap(node => seedsFor(node.id).map(flags => ({ nodeId: node.id, flags }))),
  ];

  const solvable = walk(allEntries, true);
  const abandoned = walk(allEntries, false);

  // The decision phase, walked on its own, must always terminate: no hero may
  // wander the opening of a chapter and run out of options.
  const fromStart = walk([{ nodeId: chapter.startNodeId, flags: {} }], true);
  const fromStartSkipping = walk([{ nodeId: chapter.startNodeId, flags: {} }], false);

  for (const nodeId of nodeIds) {
    if (!solvable.nodes.has(nodeId)) errors.push(`unreachable node ${nodeId}`);
  }
  for (const node of Object.values(chapter.nodes)) {
    for (const choice of node.choices) {
      if (!solvable.choices.has(choice.id)) errors.push(`unreachable choice ${node.id}.${choice.id}`);
    }
  }
  // The check that catches inescapable loops: a player standing on any of these
  // nodes can keep choosing forever and never end the chapter.
  for (const nodeId of solvable.deadEnds) {
    errors.push(`node ${nodeId} is a trap: no sequence of choices from it ever reaches a route or an ending`);
  }
  for (const nodeId of abandoned.deadEnds) {
    if (solvable.deadEnds.has(nodeId)) continue;
    errors.push(`node ${nodeId} becomes a trap when its puzzles are abandoned: no way out reaches a route or an ending`);
  }

  for (const hero of heroes) {
    const heroKey = `${hero.archetype}:${hero.origin}`;
    if (!fromStart.settled.has(heroKey)) {
      errors.push(`${heroKey} cannot reach a route or ending from the chapter start`);
    }
    if (!fromStartSkipping.settled.has(heroKey)) {
      errors.push(`${heroKey} gets stranded if every puzzle is abandoned`);
    }
    if (!abandoned.settled.has(heroKey)) {
      errors.push(`${heroKey} cannot settle the chapter with every puzzle abandoned`);
    }
  }

  const endingNodes = Object.values(chapter.nodes).filter(node => nodeKind(node) === 'ending');
  if (endingNodes.length === 0) errors.push('chapter has no ending node');
  for (const ending of endingNodes) {
    if (!solvable.nodes.has(ending.id)) errors.push(`ending ${ending.id} is unreachable`);
  }
  // One puzzle is not a feature, it is an accident. Two is the floor.
  if (Object.keys(chapter.puzzles).length < 2) {
    errors.push(`chapter has ${Object.keys(chapter.puzzles).length} puzzle(s); at least 2 are required, each reached from a node with kind "puzzle"`);
  }

  return errors;
}

/** Items that exist in the shared ITEM_TEMPLATES registry rather than in a chapter. */
const GLOBAL_ITEM_IDS = new Set(Object.keys(ITEM_TEMPLATES));
/**
 * Flags a chapter may legitimately inherit from an earlier one, so requiring
 * them is not a dead gate. Chapters declare their own via `summaryFlags`.
 */
const CARRIED_FLAGS = new Set<string>();

export function registerCarriedFlags(flags: string[]): void {
  for (const flag of flags) CARRIED_FLAGS.add(flag);
}

// ============================================================
// SHAPE COERCION
// Runs before the schema. Generated chapters slip on the same few
// details every time — a missing empty array, a monster carrying
// loot by display name, a puzzle node left blank because it has no
// choices. None of that is a design decision, so it is fixed here
// rather than spent on a repair round-trip.
// ============================================================

type Loose = Record<string, unknown>;

const isObject = (value: unknown): value is Loose =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const nonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export function coerceChapterShape(input: unknown): unknown {
  if (!isObject(input)) return input;
  const chapter: Loose = { ...input };

  const puzzles = isObject(chapter.puzzles) ? chapter.puzzles : {};

  // Optional id fields come back as "" when the model has no value for them,
  // which reads as a malformed id rather than as "absent".
  const dropEmptyOptionals = (target: Loose, keys: string[]): void => {
    for (const key of keys) {
      if (key in target && !nonEmptyString(target[key])) delete target[key];
    }
  };

  for (const raw of Object.values(puzzles)) {
    if (!isObject(raw)) continue;
    const puzzle = raw as Loose;
    if (isObject(puzzle.unlocks)) {
      const unlocks = puzzle.unlocks as Loose;
      dropEmptyOptionals(unlocks, ['nodeId', 'locationId']);
      unlocks.items = asArray(unlocks.items).filter(nonEmptyString);
      if (!isObject(unlocks.flags)) unlocks.flags = {};
    } else {
      puzzle.unlocks = { flags: {}, items: [] };
    }
    puzzle.hints = asArray(puzzle.hints).filter(isObject);
    if (puzzle.kind === 'check') puzzle.clues = asArray(puzzle.clues).filter(isObject);
  }

  if (isObject(chapter.nodes)) {
    for (const [key, raw] of Object.entries(chapter.nodes)) {
      if (!isObject(raw)) continue;
      const node = raw as Loose;
      node.id ??= key;
      node.choices = asArray(node.choices).filter(isObject);
      dropEmptyOptionals(node, ['puzzleId', 'route', 'kind', 'locationId']);
      for (const choice of node.choices as Loose[]) {
        dropEmptyOptionals(choice, ['result', 'resultEs']);
        if ('requires' in choice) choice.requires = asArray(choice.requires).filter(isObject);
        if ('archetypes' in choice) choice.archetypes = asArray(choice.archetypes).filter(nonEmptyString);
        if ('origins' in choice) choice.origins = asArray(choice.origins).filter(nonEmptyString);
        if ('setsFlags' in choice && !isObject(choice.setsFlags)) delete choice.setsFlags;
        if ('adjustsValues' in choice && !isObject(choice.adjustsValues)) delete choice.adjustsValues;
      }

      // A puzzle node carries no choices, which is exactly why it tends to come
      // back blank. Its own puzzle already has the words.
      if (node.kind === 'puzzle' && nonEmptyString(node.puzzleId)) {
        const puzzle = isObject(puzzles[node.puzzleId]) ? puzzles[node.puzzleId] as Loose : null;
        if (!nonEmptyString(node.text)) node.text = puzzle?.prompt ?? node.title;
        if (!nonEmptyString(node.textEs)) node.textEs = puzzle?.promptEs ?? node.titleEs;
        if (!nonEmptyString(node.title)) node.title = puzzle?.title ?? 'A Puzzle';
        if (!nonEmptyString(node.titleEs)) node.titleEs = puzzle?.titleEs ?? 'Un enigma';
      }
    }
  }

  const itemIds = new Set([
    ...Object.keys(isObject(chapter.items) ? chapter.items : {}),
    ...GLOBAL_ITEM_IDS,
  ]);

  if (isObject(chapter.locations)) {
    for (const [key, raw] of Object.entries(chapter.locations)) {
      if (!isObject(raw)) continue;
      const location = raw as Loose;
      location.id ??= key;
      location.connections = asArray(location.connections).filter(nonEmptyString);
      location.npcs = asArray(location.npcs).filter(nonEmptyString);
      location.enemies = asArray(location.enemies).filter(nonEmptyString);
      location.objects = asArray(location.objects).filter(isObject).map(object => ({
        broken: false,
        hidden: false,
        interactable: true,
        ...object,
      }));
      // Half-written secrets are dropped rather than guessed at.
      location.secrets = asArray(location.secrets)
        .filter(isObject)
        .filter(secret =>
          nonEmptyString(secret.id)
          && nonEmptyString(secret.description)
          && nonEmptyString(secret.descriptionEs))
        .map(secret => ({ discovered: false, ...secret }));
      if (typeof location.discovered !== 'boolean') location.discovered = true;
      if (typeof location.dangerLevel !== 'number') location.dangerLevel = 1;
      // Ambiance only selects an audio bed, so an invented one ("camp",
      // "ruins") is not worth a repair round-trip.
      if (!(AMBIANCE_IDS as readonly string[]).includes(location.ambiance as string)) {
        location.ambiance = 'outdoor';
      }
      // A location's visual never needs a repair round trip: if the LLM did not
      // already supply a semantic visualType, derive one from the ambiance so the
      // asset resolver always has a hint even for hand-authored or old chapters.
      if (!nonEmptyString(location.visualType)) {
        location.visualType = location.ambiance;
      }
      // The model writes "requiresKey":"" for locations it does not gate; an
      // empty string fails the schema. Treat it as "no key" — the same meaning.
      if (location.requiresKey === '' || location.requiresKey == null) {
        delete location.requiresKey;
      }
    }
  }

  if (isObject(chapter.npcs)) {
    for (const [key, raw] of Object.entries(chapter.npcs)) {
      if (!isObject(raw)) continue;
      const npc = raw as Loose;
      npc.id ??= key;
      npc.memory = asArray(npc.memory);
      npc.inventory = asArray(npc.inventory);
      npc.knowledge = asArray(npc.knowledge).filter(nonEmptyString);
      npc.secrets = asArray(npc.secrets).filter(nonEmptyString);
      npc.secretsEs = asArray(npc.secretsEs).filter(nonEmptyString);
      if (!nonEmptyString(npc.faction)) npc.faction = 'unaffiliated';
      if (!nonEmptyString(npc.portrait)) npc.portrait = 'villager';
      if (typeof npc.alive !== 'boolean') npc.alive = true;
      if (typeof npc.disposition !== 'number') npc.disposition = 0;

      const dialogue = asArray(npc.dialogue).filter(isObject);
      if (dialogue.length === 0) {
        dialogue.push({
          id: 'greeting',
          text: `${npc.name ?? 'They'} looks you over and says nothing worth repeating.`,
          textEs: `${npc.name ?? 'Esa persona'} te mira de arriba abajo y no dice nada que merezca repetirse.`,
          responses: [{ text: 'Leave it.', textEs: 'Dejarlo estar.', nextNodeId: 'end' }],
        });
      }
      for (const node of dialogue as Loose[]) {
        node.responses = asArray(node.responses).filter(isObject);
        if ((node.responses as unknown[]).length === 0) {
          node.responses = [{ text: 'Say nothing.', textEs: 'No decir nada.', nextNodeId: 'end' }];
        }
      }
      npc.dialogue = dialogue;
    }
  }

  if (isObject(chapter.monsters)) {
    for (const [key, raw] of Object.entries(chapter.monsters)) {
      if (!isObject(raw)) continue;
      const monster = raw as Loose;
      monster.templateId ??= key;
      monster.conditions = asArray(monster.conditions);
      monster.abilities = asArray(monster.abilities).filter(nonEmptyString);
      monster.abilitiesEs = asArray(monster.abilitiesEs).filter(nonEmptyString);
      // Loot is a list of item ids, not of names; anything else is dropped.
      monster.loot = asArray(monster.loot).filter(
        (id): id is string => nonEmptyString(id) && itemIds.has(id),
      );
      if (!nonEmptyString(monster.portrait)) monster.portrait = 'skeleton';
      if (typeof monster.maxHp !== 'number' && typeof monster.hp === 'number') monster.maxHp = monster.hp;
      // Damage is a dice string ("2d6") — the model sometimes writes a bare
      // number or "d6". Not worth a repair round-trip; keep a sane default so
      // the monster stays usable.
      if (typeof monster.damage !== 'string' || !/^\d+d\d+$/.test(monster.damage)) {
        monster.damage = '1d6';
      }
    }
  }

  if (isObject(chapter.quests)) {
    for (const [key, raw] of Object.entries(chapter.quests)) {
      if (!isObject(raw)) continue;
      const quest = raw as Loose;
      quest.id ??= key;
      quest.rewards = asArray(quest.rewards).filter(isObject);
      quest.objectives = asArray(quest.objectives).filter(isObject).map(objective => ({
        completed: false,
        current: 0,
        required: 1,
        ...objective,
      }));
      if (!nonEmptyString(quest.state)) quest.state = 'available';
    }
  }

  return chapter;
}

// ============================================================
// NORMALISER
// A generated chapter usually fails on bookkeeping — a dangling
// reference, a one-way door, a branch nothing reaches — not on
// design. Fixing that here is deterministic and instant, so the
// repair round-trip is reserved for problems only a writer can
// solve: a hero with no way to an ending, a puzzle that blocks.
// ============================================================

export function normalizeChapter(input: Chapter): { chapter: Chapter; notes: string[] } {
  const chapter: Chapter = JSON.parse(JSON.stringify(input));
  const notes: string[] = [];

  // ---- keys are the truth ----
  for (const [key, node] of Object.entries(chapter.nodes)) {
    if (node.id !== key) { node.id = key; notes.push(`renamed node id to match key ${key}`); }
  }
  for (const [key, puzzle] of Object.entries(chapter.puzzles)) {
    if (puzzle.id !== key) { puzzle.id = key; notes.push(`renamed puzzle id to match key ${key}`); }
  }
  for (const [key, location] of Object.entries(chapter.locations)) {
    if (location.id !== key) { location.id = key; notes.push(`renamed location id to match key ${key}`); }
  }
  for (const [key, npc] of Object.entries(chapter.npcs)) {
    if (npc.id !== key) { npc.id = key; notes.push(`renamed npc id to match key ${key}`); }
  }

  const locationIds = new Set(Object.keys(chapter.locations));
  const npcIds = new Set(Object.keys(chapter.npcs));
  const monsterIds = new Set(Object.keys(chapter.monsters));
  const itemIds = new Set([...Object.keys(chapter.items ?? {}), ...GLOBAL_ITEM_IDS]);

  // ---- global items keep their canonical template ----
  // A chapter is allowed (and encouraged) to reference a standard template by
  // id, but when the model mis-types the redeclaration it costs a whole repair
  // round-trip for something that already exists. If the chapter's copy of a
  // global item is incomplete (missing any required field), swap in the
  // canonical template wholesale — the meaning is identical and the schema
  // stops complaining.
  if (isObject(chapter.items)) {
    for (const [id, raw] of Object.entries(chapter.items)) {
      if (!GLOBAL_ITEM_IDS.has(id) || !isObject(raw)) continue;
      const templ = ITEM_TEMPLATES[id];
      const rawObj = raw as Loose;
      const requires = ['type', 'rarity', 'weight', 'value', 'properties', 'usable', 'consumable'];
      const incomplete = requires.some(field => rawObj[field] === undefined || rawObj[field] === null);
      if (incomplete && templ) {
        chapter.items[id] = JSON.parse(JSON.stringify(templ));
        notes.push(`restored canonical template for global item ${id}`);
      }
    }
  }

  // ---- world references ----
  for (const location of Object.values(chapter.locations)) {
    const connections = location.connections.filter(id => id !== location.id && locationIds.has(id));
    if (connections.length !== location.connections.length) {
      notes.push(`dropped dangling connections from ${location.id}`);
    }
    location.connections = [...new Set(connections)];

    const npcs = location.npcs.filter(id => npcIds.has(id));
    if (npcs.length !== location.npcs.length) notes.push(`dropped unknown npcs from ${location.id}`);
    location.npcs = npcs;

    const enemies = location.enemies.filter(id => monsterIds.has(id));
    if (enemies.length !== location.enemies.length) notes.push(`dropped unknown enemies from ${location.id}`);
    location.enemies = enemies;
  }

  // One-way doors are a trap, and adding the way back is always the right fix.
  for (const location of Object.values(chapter.locations)) {
    for (const connection of location.connections) {
      const other = chapter.locations[connection];
      if (!other.connections.includes(location.id)) {
        other.connections.push(location.id);
        notes.push(`added the way back from ${connection} to ${location.id}`);
      }
    }
  }

  for (const npc of Object.values(chapter.npcs)) {
    if (!locationIds.has(npc.location)) {
      npc.location = chapter.startLocationId;
      notes.push(`moved ${npc.id} to the start location`);
    }
    const dialogueIds = new Set(npc.dialogue.map(node => node.id));
    for (const node of npc.dialogue) {
      for (const response of node.responses) {
        if (response.nextNodeId !== 'end' && !dialogueIds.has(response.nextNodeId)) {
          response.nextNodeId = 'end';
          notes.push(`ended a dangling dialogue branch in ${npc.id}`);
        }
      }
    }
  }

  // ---- puzzle references ----
  for (const puzzle of Object.values(chapter.puzzles)) {
    const items = (puzzle.unlocks.items ?? []).filter(id => itemIds.has(id));
    if (items.length !== (puzzle.unlocks.items ?? []).length) {
      notes.push(`dropped unknown unlock items from ${puzzle.id}`);
    }
    puzzle.unlocks.items = items;

    if (puzzle.unlocks.nodeId && !chapter.nodes[puzzle.unlocks.nodeId]) {
      delete puzzle.unlocks.nodeId;
      notes.push(`dropped a dangling unlock node from ${puzzle.id}`);
    }
    if (puzzle.unlocks.locationId && !locationIds.has(puzzle.unlocks.locationId)) {
      delete puzzle.unlocks.locationId;
      notes.push(`dropped a dangling unlock location from ${puzzle.id}`);
    }

    // Skill fuzzy-match: map a near-miss skill to the closest real one, else
    // fall back to a deliberate default so the check stays solvable.
    // Skill fuzzy-match: map a near-miss skill to the closest real one, else
    // fall back to a deliberate default so the check stays solvable.
    if (puzzle.kind === 'check') {
      const raw = (puzzle as unknown as Loose).skill as string;
      const matched = matchSkill(raw);
      if (matched !== raw) {
        (puzzle as unknown as Loose).skill = matched;
        notes.push(`mapped puzzle ${puzzle.id} skill "${raw}" -> ${matched}`);
      }
    }
  }

  for (const node of Object.values(chapter.nodes)) {
    if (node.locationId && !locationIds.has(node.locationId)) {
      delete node.locationId;
      notes.push(`dropped a dangling locationId from ${node.id}`);
    }
  }

  // ---- dangling choices ----
  for (const node of Object.values(chapter.nodes)) {
    const kept = node.choices.filter(choice => !!chapter.nodes[choice.nextNodeId]);
    if (kept.length !== node.choices.length) notes.push(`dropped dangling choices from ${node.id}`);
    node.choices = kept;
  }

  // The aftermath node is entered by winning a fight, not by a choice. Marking
  // it is the model's most-forgotten field and its absence makes the node look
  // unreachable, which would delete the end of the chapter.
  const aftermath = chapter.nodes[chapter.hooks.aftermathNodeId];
  if (aftermath && !aftermath.externalEntry) {
    aftermath.externalEntry = true;
    notes.push(`marked ${aftermath.id} as entered by gameplay`);
  }

  // A node nothing leads out of is an ending, whatever it was labelled. Left
  // unmarked it silently turns every node upstream of it into a trap.
  for (const node of Object.values(chapter.nodes)) {
    const kind = nodeKind(node);
    if (kind === 'puzzle' || kind === 'route' || kind === 'ending') continue;
    if (node.choices.length > 0) continue;
    node.kind = 'ending';
    node.terminal = true;
    notes.push(`marked ${node.id} as an ending: nothing leads out of it`);
  }

  // ---- gates nothing can ever open ----
  // A choice waiting on a flag no choice and no puzzle in this chapter sets is
  // a door with no key: it would never appear in play, so it is dead content.
  const settable = new Set<string>(CARRIED_FLAGS);
  for (const node of Object.values(chapter.nodes)) {
    for (const choice of node.choices) {
      for (const flag of Object.keys(choice.setsFlags ?? {})) settable.add(flag);
    }
  }
  for (const puzzle of Object.values(chapter.puzzles)) {
    for (const flag of Object.keys(puzzle.unlocks.flags ?? {})) settable.add(flag);
  }
  for (const node of Object.values(chapter.nodes)) {
    const kept = node.choices.filter(choice =>
      (choice.requires ?? []).every(condition =>
        (condition.equals ?? true) === false || settable.has(condition.flag)
      )
    );
    if (kept.length !== node.choices.length) {
      notes.push(`dropped choices from ${node.id} gated on flags nothing can set`);
      node.choices = kept;
    }
  }

  // ---- prune what nothing can reach, to a fixed point ----
  const protectedNodes = new Set<string>([chapter.startNodeId, chapter.hooks.aftermathNodeId]);
  for (const node of Object.values(chapter.nodes)) {
    if (node.externalEntry) protectedNodes.add(node.id);
  }

  for (let pass = 0; pass < 8; pass++) {
    const { nodes: reachable, choices: usedChoices } = reachableSet(chapter);
    let changed = false;

    for (const node of Object.values(chapter.nodes)) {
      const kept = node.choices.filter(choice => usedChoices.has(choice.id));
      if (kept.length !== node.choices.length) {
        notes.push(`dropped unreachable choices from ${node.id}`);
        node.choices = kept;
        changed = true;
      }
    }

    for (const nodeId of Object.keys(chapter.nodes)) {
      if (reachable.has(nodeId) || protectedNodes.has(nodeId)) continue;
      // A puzzle's own exits stay as long as the puzzle is still in play.
      const isPuzzleExit = Object.values(chapter.puzzles).some(puzzle =>
        puzzle.solvedNodeId === nodeId || puzzle.skipNodeId === nodeId
      );
      if (isPuzzleExit) continue;
      delete chapter.nodes[nodeId];
      notes.push(`removed unreachable node ${nodeId}`);
      changed = true;
    }

    if (!changed) break;
  }

  // ---- puzzles nothing points at any more ----
  const referencedPuzzles = new Set(
    Object.values(chapter.nodes).map(node => node.puzzleId).filter((id): id is string => !!id)
  );
  for (const puzzleId of Object.keys(chapter.puzzles)) {
    if (referencedPuzzles.has(puzzleId)) continue;
    delete chapter.puzzles[puzzleId];
    notes.push(`removed orphan puzzle ${puzzleId}`);
  }

  // ---- suggestions for places that no longer exist ----
  for (const locationId of Object.keys(chapter.suggestions)) {
    if (!locationIds.has(locationId)) {
      delete chapter.suggestions[locationId];
      notes.push(`dropped suggestions for unknown location ${locationId}`);
    }
  }

  return { chapter, notes };
}

/** Reachable nodes and choices, walking every hero and both puzzle exits. */
function reachableSet(chapter: Chapter): { nodes: Set<string>; choices: Set<string> } {
  const nodes = new Set<string>();
  const choices = new Set<string>();
  const explored = new Set<string>();
  const heroes = ARCHETYPE_IDS.flatMap(archetype => ORIGIN_IDS.map(origin => ({ archetype, origin })));

  const entries: Array<{ nodeId: string; flags: Record<string, boolean> }> = [
    { nodeId: chapter.startNodeId, flags: {} },
  ];
  for (const node of Object.values(chapter.nodes)) {
    if (!node.externalEntry) continue;
    entries.push({ nodeId: node.id, flags: {} });
    for (const seed of chapter.externalEntrySeeds?.[node.id] ?? []) {
      entries.push({ nodeId: node.id, flags: seed });
    }
  }

  const pending: WalkState[] = heroes.flatMap(hero =>
    entries.map(entry => ({ nodeId: entry.nodeId, flags: { ...entry.flags }, hero })),
  );

  while (pending.length > 0) {
    const state = pending.shift()!;
    const signature = `${state.hero.archetype}:${state.hero.origin}|${state.nodeId}|${
      Object.keys(state.flags).filter(key => state.flags[key]).sort().join(',')
    }`;
    if (explored.has(signature)) continue;
    explored.add(signature);

    const node = chapter.nodes[state.nodeId];
    if (!node) continue;
    nodes.add(node.id);

    const kind = nodeKind(node);
    if (kind === 'ending' || kind === 'route' || node.terminal) continue;

    if (kind === 'puzzle' && node.puzzleId) {
      const puzzle = chapter.puzzles[node.puzzleId];
      if (!puzzle) continue;
      pending.push({
        nodeId: puzzle.solvedNodeId,
        flags: { ...state.flags, ...(puzzle.unlocks.flags ?? {}) },
        hero: state.hero,
      });
      pending.push({ nodeId: puzzle.skipNodeId, flags: { ...state.flags }, hero: state.hero });
      continue;
    }

    for (const choice of node.choices) {
      if (!isStoryChoiceAvailable(choice, state.flags, state.hero)) continue;
      choices.add(choice.id);
      pending.push({
        nodeId: choice.nextNodeId,
        flags: { ...state.flags, ...(choice.setsFlags ?? {}) },
        hero: state.hero,
      });
    }
  }

  return { nodes, choices };
}

export function collectChapterIds(chapter: Chapter): string[] {
  return [
    ...Object.keys(chapter.nodes),
    ...Object.keys(chapter.puzzles),
    ...Object.keys(chapter.locations),
    ...Object.keys(chapter.npcs),
    ...Object.keys(chapter.monsters),
    ...Object.keys(chapter.items ?? {}),
  ];
}

/**
 * Maps a free-text skill the model wrote onto the closest real skills. The
 * generated chapters write near-misses ("strength", "perception check", "lock")
 * that are not worth a repair round-trip; the check just needs a solvable skill.
 */
const SKILL_SYNONYMS: Record<string, Skill> = {
  strength: 'athletics',
  athletics: 'athletics',
  acrobatics: 'acrobatics',
  sleight: 'sleight_of_hand',
  'sleight of hand': 'sleight_of_hand',
  investigation: 'investigation',
  investigation_: 'investigation',
  perception: 'perception',
  arcana: 'arcana',
  history: 'history',
  insight: 'insight',
  survival: 'survival',
  stealth: 'stealth',
  animal: 'animal_handling',
  'animal handling': 'animal_handling',
  nature: 'nature',
  religion: 'religion',
  medicine: 'medicine',
  persuasion: 'persuasion',
  intimidation: 'intimidation',
  deception: 'deception',
  melee: 'melee',
  ranged: 'ranged',
  performance: 'performance',
  locks: 'sleight_of_hand',
  lock: 'sleight_of_hand',
  lockpick: 'sleight_of_hand',
  trickery: 'sleight_of_hand',
  trap: 'perception',
  traps: 'perception',
  smarts: 'arcana',
  'force push': 'athletics',
  push: 'athletics',
  lift: 'athletics',
};

function matchSkill(raw: string): Skill {
  const key = raw.trim().toLowerCase().replace(/_/g, ' ');
  if (SKILL_IDS.some(s => s === key.replace(/ /g, '_'))) {
    return key.replace(/ /g, '_') as Skill;
  }
  if (SKILL_SYNONYMS[key]) return SKILL_SYNONYMS[key];
  return 'investigation';
}
