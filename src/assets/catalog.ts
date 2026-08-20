// ============================================================
// SEMANTIC CATALOG
// The visual library is a semantic API: directories, filenames and
// the supplied manifests describe WHAT each image is. This module
// captures that meaning once so resolvers can stay thin. The data
// here mirrors the JSON manifests inside Assests/.
//
// A resolver NEVER returns a filesystem path. It returns a catalog
// id, and the URL layer maps id -> /api/asset/... path.
// ============================================================

export const ASSET_ROOT = 'Assests';

export const CATEGORY_DIRS = {
  environments: 'rpg_environments/environments',
  characters: 'rpg_characters_enemies/characters',
  npcs: 'rpg_characters_enemies/npcs',
  enemies: 'rpg_characters_enemies/enemies',
  items: 'rpg_equipment_items',
  props: 'rpg_props/props',
  icons: 'rpg_icons',
} as const;

// ---- Components and NPCs ----
export const CHARACTER_ASSETS = [
  'paladin', 'mage', 'rogue', 'ranger', 'cleric', 'dwarf-warrior',
] as const;

export const NPC_ASSETS = [
  'wizard', 'innkeeper', 'blacksmith', 'merchant', 'king', 'elf-noble',
] as const;

// Hardcoded portrait tokens the authored content uses, resolved to the
// closest existing npc asset so an unknown token never breaks the scene.
export const NPC_ALIASES: Record<string, string> = {
  wizard: 'wizard',
  innkeeper: 'innkeeper',
  blacksmith: 'blacksmith',
  merchant: 'merchant',
  king: 'king',
  elder: 'wizard',
  stranger: 'wizard',
  priest: 'cleric',
  villager: 'merchant',
  guard: 'paladin',
  knight: 'paladin',
  councilor: 'king',
  helper: 'merchant',
};

export const CHARACTER_ARCHETYPES: Record<string, string> = {
  warrior: 'paladin',
  rogue: 'rogue',
  ranger: 'ranger',
  mage: 'mage',
  cleric: 'cleric',
};

// ------------------------------------------------------------------------
// Enemies
// ------------------------------------------------------------------------
export const ENEMY_ASSETS = [
  'demon', 'dire-wolf', 'fire-elemental', 'giant-spider', 'goblin',
  'ice-dragon', 'ice-elemental', 'mimic', 'minotaur', 'necromancer',
  'ogre', 'orc', 'red-dragon', 'skeleton', 'slime', 'stone-golem',
  'treant', 'zombie',
] as const;

export const ENEMY_ALIASES: Record<string, string> = {
  wolf: 'dire-wolf',
  'dire wolf': 'dire-wolf',
  skeleton: 'skeleton',
  'skeleton warrior': 'skeleton',
  skeleton_warrior: 'skeleton',
  wraith: 'necromancer',
  warden: 'ogre',
  guardian: 'ogre',
  goblin: 'goblin',
  orc: 'orc',
  zombie: 'zombie',
  ooze: 'slime',
  slime: 'slime',
  spider: 'giant-spider',
  'giant spider': 'giant-spider',
  rat: 'giant-spider',
  elemental: 'fire-elemental',
  golem: 'stone-golem',
  'stone golem': 'stone-golem',
  dragon: 'red-dragon',
  'red dragon': 'red-dragon',
  'ice dragon': 'ice-dragon',
  demon: 'demon',
  minotaur: 'minotaur',
  treant: 'treant',
  cultist: 'necromancer',
  necromancer: 'necromancer',
  specter: 'necromancer',
  wraithlord: 'necromancer',
  bandit: 'goblin',
  guard: 'orc',
};

// ------------------------------------------------------------------------
// Environments
// ------------------------------------------------------------------------
export const ENV_IDS = [
  'abandoned-village', 'ancient-altar', 'arcane-tower', 'barracks',
  'blacksmith', 'cave', 'celestial-garden', 'coastal-pier', 'crypt',
  'dark-ritual-chamber', 'desert-ruins', 'dragon-lair', 'dungeon',
  'floating-island', 'forest', 'goblin-camp', 'ice-cavern', 'library',
  'mystic-portal', 'pirate-cove', 'sewer', 'snowy-mountains', 'swamp',
  'tavern', 'temple', 'throne-room', 'town-square', 'underground-lake',
  'volcanic-cavern', 'waterfall-grove',
];

// The authored `ambiance` enum maps onto environment ids. Where there is no
// dedicated asset, pick the closest environment so a location always has art.
export const AMBIANCE_TO_ENV: Record<string, string> = {
  tavern: 'tavern',
  town: 'town-square',
  temple: 'temple',
  forest: 'forest',
  crypt: 'crypt',
  boss: 'dungeon',
  shop: 'tavern',
  sewer: 'sewer',
  outdoor: 'forest',
  cave: 'cave',
  library: 'library',
  throne: 'throne-room',
  dungeon: 'dungeon',
  battle: 'dungeon',
};

export const ENV_FALLBACK = 'dungeon';

// Free-text keyword banks used to guess an environment from a location name
// or description when neither ambiance nor visualType is authoritative.
export const ENV_KEYWORDS: Record<string, string[]> = {
  crypt: ['tomb', 'grave', 'burial', 'sepulcher', 'crypt', 'mausoleum', 'catacomb', 'vault'],
  'town-square': ['village', 'market', 'square', 'plaza', 'town', 'settlement'],
  tavern: ['tavern', 'inn', 'pub', 'alehouse'],
  'throne-room': ['throne', 'royal', 'court', 'palace', 'keep'],
  temple: ['temple', 'chapel', 'shrine', 'sanctuary', 'cathedral', 'church'],
  forest: ['forest', 'woods', 'grove', 'woodland', 'wilderness'],
  swamp: ['swamp', 'marsh', 'bog', 'wetland'],
  cave: ['cave', 'cavern', 'mine', 'grotto'],
  'arcane-tower': ['tower', 'arcane', 'wizard', 'mage', 'laboratory'],
  library: ['library', 'scriptorium', 'archive', 'study'],
  blacksmith: ['forge', 'smithy', 'blacksmith', 'armorer', 'anvil'],
  barracks: ['barrack', 'guardhouse', 'militia', 'garrison'],
  sewer: ['sewer', 'drain', 'undercity', 'tunnel'],
  'ancient-altar': ['altar', 'ritual', 'stone circle'],
  'abandoned-village': ['abandon', 'ruined village', 'ghost town', 'deserted'],
  'desert-ruins': ['desert', 'ruin', 'ancient'],
  'snowy-mountains': ['snow', 'mountain', 'alpine', 'tundra'],
  'volcanic-cavern': ['volcano', 'lava', 'magma'],
  'coastal-pier': ['pier', 'harbor', 'dock', 'port', 'coast'],
  'ice-cavern': ['ice', 'glacier', 'frozen'],
  'goblin-camp': ['goblin', 'raider camp', 'monster camp'],
  'pirate-cove': ['pirate', 'smuggler', 'cove'],
  'underground-lake': ['underground lake', 'subterranean lake', 'cave lake'],
  'waterfall-grove': ['waterfall', 'oasis', 'sacred grove'],
  'celestial-garden': ['celestial', 'divine garden', 'holy'],
  'dark-ritual-chamber': ['ritual chamber', 'cult chamber', 'summoning'],
  'dragon-lair': ['dragon lair', 'dragon', 'hoard'],
  'mystic-portal': ['portal', 'gateway', 'teleporter'],
  'floating-island': ['floating', 'sky island', 'airborne'],
};

// -------- Items --------
export const ITEM_ASSETS = [
  'weapon-sword', 'weapon-axe', 'weapon-bow', 'weapon-staff',
  'weapon-hammer', 'weapon-dagger', 'shield-heraldic', 'shield-round',
  'helmet-knight', 'helmet-horned', 'armor-heavy', 'armor-leather',
  'boots-heavy', 'boots-fur', 'boots-ranger', 'ring-ruby', 'ring-sapphire',
  'amulet-amethyst', 'amulet-sapphire', 'amulet-emerald', 'potion-health',
  'potion-mana', 'potion-nature', 'potion-golden', 'scroll', 'spellbook',
  'key', 'chest', 'gems', 'gold',
];

// Map item template keywords / slots onto an asset id. A template such as
// "rusty_sword" or "knight's_longsword" both resolve to weapon-sword.
export const ITEM_KEYWORDS: Record<string, string | string[]> = {
  sword: 'weapon-sword',
  blade: 'weapon-sword',
  longsword: 'weapon-sword',
  rapier: 'weapon-sword',
  axe: 'weapon-axe',
  battleaxe: 'weapon-axe',
  bow: 'weapon-bow',
  longbow: 'weapon-bow',
  staff: 'weapon-staff',
  wand: 'weapon-staff',
  hammer: 'weapon-hammer',
  maul: 'weapon-hammer',
  dagger: 'weapon-dagger',
  knife: 'weapon-dagger',
  shield: 'shield-heraldic',
  buckler: 'shield-round',
  helmet: 'helmet-knight',
  helm: 'helmet-knight',
  armor: ['armor-heavy', 'armor-leather'],
  plate: 'armor-heavy',
  mail: 'armor-heavy',
  leather: 'armor-leather',
  boot: 'boots-fur',
  ring: 'ring-ruby',
  amulet: 'amulet-emerald',
  potion: 'potion-health',
  health: 'potion-health',
  mana: 'potion-mana',
  elixir: 'potion-golden',
  scroll: 'scroll',
  book: 'spellbook',
  spellbook: 'spellbook',
  tome: 'spellbook',
  key: 'key',
  chest: 'chest',
  gem: 'gems',
  gold: 'gold',
  coin: 'gold',
};

// ---- Props ----
export const PROPS: Record<string, string[]> = {
  chest: ['chest'],
  barrel: ['barrel'],
  crate: ['crate'],
  'wall-torch': ['torch'],
  brazier: ['brazier', 'fire', 'forge'],
  altar: ['altar'],
  pillar: ['pillar', 'column'],
  'ruined-pillar': ['ruin', 'broken pillar'],
  sarcophagus: ['sarcophagus', 'coffin', 'tomb'],
  tombstone: ['tombstone', 'grave marker'],
  bones: ['bones', 'skull'],
  banner: ['banner', 'standard', 'flag'],
  door: ['door'],
  gate: ['gate'],
  trapdoor: ['trapdoor', 'hatch'],
  'spiral-stairs': ['stair', 'stairs'],
  'stone-stairs': ['stone stairs'],
  'stone-arch': ['arch'],
  table: ['table'],
  chair: ['chair', 'seat'],
  bookshelf: ['bookshelf', 'book', 'shelf'],
  'alchemy-table': ['alchemy', 'alchemist', 'potion station'],
  'weapon-rack': ['weapon rack', 'armory rack'],
  'loot-sack': ['sack', 'loot', 'bag'],
  statue: ['statue'],
  gargoyle: ['gargoyle'],
  fountain: ['fountain'],
  runestone: ['runestone', 'rune', 'carved stone'],
  'magic-crystal': ['crystal', 'magic crystal', 'gemstone'],
  coins: ['coins', 'gold pile'],
  'treasure-pile': ['treasure', 'hoard'],
};

// -------- Icons --------
export const ICON_IDS = [
  'icon-achievement', 'icon-character', 'icon-chest', 'icon-combat',
  'icon-defense', 'icon-exit', 'icon-gold', 'icon-health', 'icon-inventory',
  'icon-magic', 'icon-map', 'icon-potions', 'icon-quest', 'icon-settings',
  'icon-spellbook',
] as const;

// A generic fallback for a missing icon.
export const ICON_FALLBACK = 'icon-achievement';