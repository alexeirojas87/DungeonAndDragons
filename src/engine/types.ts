// ============================================================
// THE GAUNTLET - Core Game Types
// The deterministic game engine is the source of truth.
// ============================================================

// ---- Dice System ----
export type DiceType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export interface DiceRoll {
  type: DiceType;
  count: number;
  modifier: number;
  results: number[];
  total: number;
  isCritical: boolean;
  isFumble: boolean;
}

export interface SkillCheck {
  skill: Skill;
  dc: number;
  roll: DiceRoll;
  modifier: number;
  total: number;
  success: boolean;
  hidden: boolean;
}

// ---- Character System ----
export type Archetype = 'warrior' | 'rogue' | 'ranger' | 'mage' | 'cleric';
export type Origin = 'ashenvale' | 'ironcoast' | 'shadowfen' | 'stormreach' | 'deephollow';

export interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export type Skill =
  | 'melee' | 'ranged' | 'athletics' | 'acrobatics' | 'stealth'
  | 'sleight_of_hand' | 'investigation' | 'arcana' | 'history'
  | 'insight' | 'perception' | 'survival' | 'deception'
  | 'intimidation' | 'persuasion' | 'performance' | 'religion'
  | 'medicine' | 'nature' | 'animal_handling';

export interface Character {
  id: string;
  name: string;
  portrait: string;
  archetype: Archetype;
  origin: Origin;
  level: number;
  experience: number;
  experienceToNext: number;
  attributes: Attributes;
  skills: Partial<Record<Skill, number>>;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stamina: number;
  maxStamina: number;
  ac: number;
  initiative: number;
  speed: number;
  gold: number;
  conditions: Condition[];
  equipment: Equipment;
  inventory: Item[];
  spells: Spell[];
  portraitState: PortraitState;
  background: string;
  personalityTraits: string;
}

export interface PortraitState {
  healthPercent: number;
  conditions: Condition[];
}

export type Condition =
  | 'poisoned' | 'frightened' | 'charmed' | 'paralyzed'
  | 'stunned' | 'blinded' | 'deafened' | 'grappled'
  | 'prone' | 'exhaustion' | 'blessed' | 'cursed';

// ---- Equipment System ----
export type EquipmentSlot =
  | 'weapon_main' | 'weapon_off' | 'armor' | 'helmet'
  | 'boots' | 'gloves' | 'ring_1' | 'ring_2' | 'amulet' | 'relic';

export interface Equipment {
  weapon_main: Item | null;
  weapon_off: Item | null;
  armor: Item | null;
  helmet: Item | null;
  boots: Item | null;
  gloves: Item | null;
  ring_1: Item | null;
  ring_2: Item | null;
  amulet: Item | null;
  relic: Item | null;
}

// ---- Item System ----
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';
export type ItemType = 'weapon' | 'armor' | 'shield' | 'consumable' | 'quest' | 'relic' | 'misc';

export interface Item {
  id: string;
  templateId: string;
  name: string;
  nameEs: string;
  type: ItemType;
  rarity: ItemRarity;
  weight: number;
  value: number;
  description: string;
  descriptionEs: string;
  properties: ItemProperties;
  durability?: number;
  maxDurability?: number;
  slot?: EquipmentSlot;
  usable: boolean;
  consumable: boolean;
}

export interface ItemProperties {
  damage?: string;
  damageType?: DamageType;
  range?: number;
  acBonus?: number;
  statBonuses?: Partial<Attributes>;
  skillBonuses?: Partial<Record<Skill, number>>;
  special?: string[];
  healAmount?: number;
  mpRestore?: number;
}

export type DamageType = 'slashing' | 'piercing' | 'bludgeoning' | 'fire' | 'cold' | 'lightning' | 'necrotic' | 'radiant' | 'poison' | 'psychic';

// ---- Spell System ----
export type SpellSchool = 'flame' | 'frost' | 'storm' | 'arcane' | 'shadow' | 'life' | 'nature' | 'protection' | 'spirit';

export interface Spell {
  id: string;
  name: string;
  nameEs: string;
  school: SpellSchool;
  level: number;
  mpCost: number;
  description: string;
  descriptionEs: string;
  damage?: string;
  damageType?: DamageType;
  healing?: string;
  range: number;
  area?: string;
  duration: string;
  concentration: boolean;
  saveType?: Skill;
  saveDC?: number;
}

// ---- World System ----
export interface WorldLocation {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  connections: string[];
  objects: WorldObject[];
  npcs: string[];
  enemies: string[];
  dangerLevel: number;
  discovered: boolean;
  secrets: Secret[];
  ambiance: AmbianceType;
  requiresKey?: string;
}

export type AmbianceType =
  | 'tavern' | 'dungeon' | 'crypt' | 'forest' | 'town'
  | 'battle' | 'boss' | 'shop' | 'temple' | 'sewer'
  | 'outdoor' | 'cave' | 'library' | 'throne';

export interface WorldObject {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  interactable: boolean;
  searchDC?: number;
  contains?: string[];
  broken: boolean;
  hidden: boolean;
}

export interface Secret {
  id: string;
  description: string;
  descriptionEs: string;
  discovered: boolean;
  requiresCheck?: { skill: Skill; dc: number };
  contains?: string[];
}

// ---- NPC System ----
export interface NPC {
  id: string;
  name: string;
  nameEs: string;
  portrait: string;
  faction: string;
  location: string;
  disposition: number; // -100 to 100
  knowledge: string[];
  memory: NPCMemoryEntry[];
  dialogue: DialogueNode[];
  inventory: Item[];
  alive: boolean;
  occupation: string;
  occupationEs: string;
  secrets: string[];
  secretsEs: string[];
  personality: string;
  personalityEs: string;
}

export interface NPCMemoryEntry {
  eventId: string;
  timestamp: number;
  type: 'observation' | 'interaction' | 'rumor' | 'betrayal' | 'kindness' | 'theft' | 'combat' | 'quest';
  description: string;
  descriptionEs: string;
  importance: number;
}

export interface DialogueNode {
  id: string;
  text: string;
  textEs: string;
  conditions?: DialogueCondition[];
  responses: DialogueResponse[];
  effects?: GameEvent[];
}

export interface DialogueCondition {
  type: 'disposition' | 'quest' | 'item' | 'flag' | 'skill_check';
  value: string | number;
  operator: 'gt' | 'lt' | 'eq' | 'has' | 'not_has';
}

export interface DialogueResponse {
  text: string;
  textEs: string;
  nextNodeId: string;
  conditions?: DialogueCondition[];
  effects?: GameEvent[];
}

// ---- Combat System ----
export type CombatState = 'inactive' | 'initiative' | 'player_turn' | 'enemy_turn' | 'resolving' | 'victory' | 'defeat' | 'fled';

export interface CombatEncounter {
  id: string;
  enemies: Enemy[];
  initiativeOrder: Combatant[];
  currentTurn: number;
  round: number;
  state: CombatState;
  environment: string[];
  log: CombatLogEntry[];
}

export interface Combatant {
  id: string;
  name: string;
  nameEs: string;
  type: 'player' | 'enemy' | 'ally';
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  conditions: Condition[];
  portrait: string;
  isAlive: boolean;
}

export interface Enemy {
  id: string;
  templateId: string;
  name: string;
  nameEs: string;
  portrait: string;
  hp: number;
  maxHp: number;
  ac: number;
  attack: number;
  damage: string;
  damageType: DamageType;
  abilities: string[];
  abilitiesEs: string[];
  xpValue: number;
  loot: string[];
  intelligence: number;
  morale: number;
  conditions: Condition[];
}

export interface CombatAction {
  actorId: string;
  type: 'attack' | 'spell' | 'defend' | 'flee' | 'item' | 'environment' | 'special';
  targetId?: string;
  itemId?: string;
  spellId?: string;
  description?: string;
  descriptionEs?: string;
}

export interface CombatLogEntry {
  round: number;
  actorId: string;
  action: string;
  actionEs: string;
  result: string;
  resultEs: string;
  damage?: number;
  healing?: number;
}

// ---- Quest System ----
export type QuestState = 'available' | 'active' | 'updated' | 'failed' | 'completed' | 'hidden';

export interface Quest {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  state: QuestState;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  isMain: boolean;
  faction?: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  descriptionEs: string;
  completed: boolean;
  current: number;
  required: number;
}

export interface QuestReward {
  type: 'xp' | 'gold' | 'item' | 'reputation' | 'unlock';
  value: string | number;
  itemId?: string;
  factionId?: string;
}

// ---- Game Events ----
export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data: Record<string, unknown>;
}

export type GameEventType =
  | 'PLAYER_ENTERED_LOCATION'
  | 'ITEM_ACQUIRED'
  | 'ITEM_EQUIPPED'
  | 'ITEM_CONSUMED'
  | 'DICE_ROLLED'
  | 'CHECK_SUCCEEDED'
  | 'CHECK_FAILED'
  | 'COMBAT_STARTED'
  | 'ATTACK_RESOLVED'
  | 'DAMAGE_APPLIED'
  | 'HEALING_APPLIED'
  | 'NPC_KILLED'
  | 'QUEST_UPDATED'
  | 'QUEST_COMPLETED'
  | 'FACTION_REPUTATION_CHANGED'
  | 'SECRET_DISCOVERED'
  | 'SPELL_CAST'
  | 'PLAYER_DOWNED'
  | 'PLAYER_DIED'
  | 'BOSS_DEFEATED'
  | 'DOOR_OPENED'
  | 'TRAP_TRIGGERED'
  | 'PUZZLE_SOLVED'
  | 'MORAL_DECISION'
  | 'DIALOGUE_STARTED'
  | 'DIALOGUE_ENDED'
  | 'LEVEL_UP'
  | 'SHORT_REST'
  | 'LONG_REST';

// ---- Dialogue State ----
export interface DialogueState {
  npcId: string;
  currentNodeId: string;
  speaker: string;
  speakerEs: string;
  responses: DialogueResponse[];
}

// ---- Story Graph State ----
export type StoryRoute = 'direct' | 'forest' | 'secret_tunnel' | 'varen' | 'council';

export interface StoryChoiceRecord {
  nodeId: string;
  choiceId: string;
  nextNodeId: string;
  timestamp: number;
}

export interface StoryState {
  currentNodeId: string;
  visitedNodeIds: string[];
  choiceHistory: StoryChoiceRecord[];
  values: Record<string, number>;
  route?: StoryRoute;
  /** The authored decision phase is settled (a route or an ending was reached). */
  completed: boolean;
}

/**
 * Campaign-level status. 'chapter_complete' means the player is standing at an
 * ending and may continue into a freshly generated chapter; 'dead' locks input
 * until the player retries from a checkpoint.
 */
export type CampaignStatus = 'playing' | 'chapter_complete' | 'dead';

// ---- Game State ----
export interface GameState {
  campaign: CampaignState;
  party: Character[];
  activePlayerIndex: number;
  location: string;
  combat: CombatEncounter | null;
  quests: Quest[];
  worldState: WorldState;
  flags: Record<string, boolean>;
  time: WorldTime;
  eventLog: GameEvent[];
  activeDialogue: DialogueState | null;
  story: StoryState;
  /** Every chapter this campaign has loaded, authored or generated. */
  chapters: import('./chapter').Chapter[];
  activeChapterIndex: number;
  /** One compressed record per finished chapter; feeds the next generation. */
  chronicle: import('./chapter').ChapterSummary[];
  puzzles: import('./puzzles').PuzzleRuntime;
  status: CampaignStatus;
}

export interface CampaignState {
  id: string;
  name: string;
  createdAt: number;
  lastSaved: number;
  day: number;
}

export interface WorldState {
  locations: Record<string, WorldLocation>;
  npcs: Record<string, NPC>;
  items: Record<string, Item>;
  discoveredSecrets: string[];
  killedEnemies: string[];
  triggeredTraps: string[];
  solvedPuzzles: string[];
}

export interface WorldTime {
  hour: number;
  day: number;
  period: 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'midnight';
}

// ---- Intent System ----
export interface PlayerIntent {
  raw: string;
  actions: InterpretedAction[];
}

export interface InterpretedAction {
  type: ActionType;
  target?: string;
  item?: string;
  spell?: string;
  direction?: string;
  dialogueTarget?: string;
  dialogueContent?: string;
  skill?: Skill;
  confidence: number;
}

export type ActionType =
  | 'move' | 'examine' | 'take' | 'drop' | 'use'
  | 'equip' | 'unequip' | 'attack' | 'cast'
  | 'talk' | 'pick_up' | 'search' | 'open' | 'close'
  | 'push' | 'pull' | 'break' | 'light' | 'extinguish'
  | 'give' | 'buy' | 'sell' | 'rest' | 'flee'
  | 'defend' | 'sneak' | 'climb' | 'jump' | 'swim'
  | 'listen' | 'smell' | 'feel' | 'taste'
  | 'wait' | 'help' | 'follow' | 'stay'
  | 'inventory' | 'character_sheet' | 'quest_log'
  | 'unknown';

// ---- Narrative Types ----
export interface NarrativeEntry {
  id: string;
  type: 'narration' | 'dialogue' | 'system' | 'combat' | 'dice' | 'action' | 'whisper';
  speaker?: string;
  speakerEs?: string;
  content: string;
  timestamp: number;
  important?: boolean;
  illustration?: string;
  mood?: 'neutral' | 'tense' | 'danger' | 'triumph' | 'horror' | 'humor' | 'mystery';
  dialogueResponses?: DialogueResponse[];
}

// ---- UI State ----
export interface UIState {
  showInventory: boolean;
  showCharacterSheet: boolean;
  showQuestLog: boolean;
  showSettings: boolean;
  showDebug: boolean;
  textSpeed: 'instant' | 'fast' | 'normal' | 'slow';
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

// ---- Multiplayer Types ----
export interface Campaign {
  id: string;
  name: string;
  ownerId: string;
  players: Player[];
  state: GameState;
  maxPlayers: number;
}

export interface Player {
  id: string;
  name: string;
  characterId?: string;
  ready: boolean;
  isHost: boolean;
}

// ---- Localization ----
export type Language = 'en' | 'es';

export interface LocalizedString {
  en: string;
  es: string;
}
