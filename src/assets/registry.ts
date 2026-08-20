// ============================================================
// ASSET REGISTRY — semantic visual resolver
//
//   LLM content  ->  semantic game data ->  resolver  ->  URL
//
// The resolver is the ONLY layer that knows the filesystem layout.
// The rest of the game asks semantic questions:
//   resolveEnvironment("the forgotten tomb")
//   resolveEnemy("warden")
//   resolveItem("rusty_sword")
// and gets back a public URL. Unknown input degrades gracefully to a
// sensible archetype, never to a missing-image error.
// ============================================================

import {
  ASSET_ROOT, CATEGORY_DIRS, CHARACTER_ARCHETYPES, NPC_ALIASES,
  ENEMY_ALIASES, AMBIANCE_TO_ENV, ENV_FALLBACK, ENV_KEYWORDS,
  ITEM_KEYWORDS, PROPS, ICON_FALLBACK, ENEMY_ASSETS,
} from './catalog';

function assetUrl(category: keyof typeof CATEGORY_DIRS, id: string): string {
  return `/${ASSET_ROOT}/${CATEGORY_DIRS[category]}/${id}.png`;
}

// Environments get a leading slash off (their dir has no trailing slash).
function envUrl(id: string): string {
  return `/${ASSET_ROOT}/${CATEGORY_DIRS.environments}/${id}.png`;
}

const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function tokenMatch(id: string, aliases: string[], query: string): boolean {
  const q = normalize(query);
  if (!q) return false;
  const haystacks = [id, ...aliases].map(normalize);
  // exact match carries the most weight
  if (haystacks.some(h => h === q)) return true;
  return haystacks.some(h => h.split(' ').some(word => word.length > 2 && q.includes(word)));
}

// ---------------------------------------------------------------
// Environments
// ---------------------------------------------------------------
export function resolveEnvironment(
  visualType?: string,
  ambiance?: string,
  locationName?: string,
  description?: string,
): string {
  const candidates = [visualType, ambiance, locationName, description].filter(Boolean) as string[];

  // 1. explicit visualType maps to an asset id directly
  if (visualType) {
    const direct = envIdFromToken(visualType);
    if (direct) return envUrl(direct);
  }

  // 2. ambiance enum (from chapter schema) maps onto a known id
  if (ambiance && AMBIANCE_TO_ENV[normalize(ambiance)]) {
    return envUrl(AMBIANCE_TO_ENV[normalize(ambiance)]);
  }

  // 3. keyword bank on name/description
  const text = candidates.join(' ');
  for (const [envId, keywords] of Object.entries(ENV_KEYWORDS)) {
    if (keywords.some(k => normalize(text).includes(normalize(k)))) {
      return envUrl(envId);
    }
  }

  return envUrl(ENV_FALLBACK);
}

function envIdFromToken(token: string): string | undefined {
  const q = normalize(token);
  if (!q) return undefined;
  // full id list; match exact then word-overlap, fall back to dungeon.
  const ids = [
    'abandoned-village', 'ancient-altar', 'arcane-tower', 'barracks',
    'blacksmith', 'cave', 'celestial-garden', 'coastal-pier', 'crypt',
    'dark-ritual-chamber', 'desert-ruins', 'dragon-lair', 'dungeon',
    'floating-island', 'forest', 'goblin-camp', 'ice-cavern', 'library',
    'mystic-portal', 'pirate-cove', 'sewer', 'snowy-mountains', 'swamp',
    'tavern', 'temple', 'throne-room', 'town-square', 'underground-lake',
    'volcanic-cavern', 'waterfall-grove',
  ];
  if (ids.includes(q)) return q;
  const alt = ids.find(id => id.replace(/-/g, ' ') === q);
  const keywordEnv = Object.entries(ENV_KEYWORDS).find(([, kw]) => kw.some(k => q.includes(normalize(k))));
  return alt ?? (keywordEnv ? keywordEnv[0] : ENV_FALLBACK);
}

// ---------------------------------------------------------------
// Characters / NPCs / Enemies
// ---------------------------------------------------------------
export function resolveCharacter(portraitToken: string, archetype?: string): string {
  const q = normalize(portraitToken);
  if (q && ['paladin', 'mage', 'rogue', 'ranger', 'cleric', 'dwarf-warrior'].includes(q)) {
    return assetUrl('characters', q);
  }
  if (archetype && CHARACTER_ARCHETYPES[archetype]) {
    return assetUrl('characters', CHARACTER_ARCHETYPES[archetype]);
  }
  return assetUrl('characters', 'paladin');
}

export function resolveNpc(portraitToken: string): string {
  const q = normalize(portraitToken);
  if (NPC_ALIASES[q]) return assetUrl('npcs', NPC_ALIASES[q]);
  if (q && ['wizard', 'innkeeper', 'blacksmith', 'merchant', 'king', 'elf-noble'].includes(q)) {
    return assetUrl('npcs', q);
  }
  return assetUrl('npcs', 'merchant');
}

export function resolveEnemy(portraitToken: string, templateId?: string): string {
  const q = normalize(templateId || portraitToken);
  if (ENEMY_ALIASES[q]) return assetUrl('enemies', ENEMY_ALIASES[q]);
  if ((ENEMY_ASSETS as unknown as string[]).includes(q)) return assetUrl('enemies', q);
  // keyword fallback: "goblin king" -> goblin, "elder wolf" -> dire-wolf
  for (const [alias, assetId] of Object.entries(ENEMY_ALIASES)) {
    if (q.includes(normalize(alias))) return assetUrl('enemies', assetId);
  }
  return assetUrl('enemies', 'goblin');
}

// ---------------------------------------------------------------
// Items
// ---------------------------------------------------------------
export function resolveItem(item?: { id?: string; templateId?: string; type?: string; slot?: string } | null): string {
  const id = normalize(item?.templateId || item?.id || '');
  // keyword first pass
  for (const [keyword, assetId] of Object.entries(ITEM_KEYWORDS)) {
    if (Array.isArray(assetId)) continue;
    if (id.includes(normalize(keyword))) return assetUrl('items', assetId);
  }
  // slot-based hints
  const slot = item?.slot;
  if (slot) {
    if (slot.includes('weapon')) {
      return assetUrl('items', 'weapon-sword');
    }
    if (slot.includes('armor')) {
      const heavy = id.includes('plate') || id.includes('mail') || id.includes('chain');
      return assetUrl('items', heavy ? 'armor-heavy' : 'armor-leather');
    }
    if (slot.includes('helmet')) return assetUrl('items', 'helmet-knight');
    if (slot.includes('boot')) return assetUrl('items', 'boots-fur');
    if (slot.includes('ring')) return assetUrl('items', 'ring-ruby');
    if (slot.includes('amulet')) return assetUrl('items', 'amulet-emerald');
  }
  const type = item?.type;
  if (type) {
    if (type === 'consumable' || type === 'quest' || type === 'misc') {
      return assetUrl('items', 'potion-health');
    }
  }
  return assetUrl('items', 'scroll');
}

// ---------------------------------------------------------------
// Props
// ---------------------------------------------------------------
export function resolveProp(token: string): string {
  const q = normalize(token);
  for (const [propId, keywords] of Object.entries(PROPS)) {
    if (propId.replace(/-/g, ' ') === q || keywords.some(k => q.includes(normalize(k)))) {
      return assetUrl('props', propId);
    }
  }
  for (const [propId] of Object.entries(PROPS)) {
    if (propId.replace(/-/g, ' ').split(' ').some(w => w.length > 2 && q.includes(w))) {
      return assetUrl('props', propId);
    }
  }
  return assetUrl('props', 'prop-crate');
}

// ---------------------------------------------------------------
// Icons
// ---------------------------------------------------------------
export function resolveIcon(id: string): string {
  if (id.includes('icon-') && CATEGORY_DIRS) {
    return `/${ASSET_ROOT}/rpg_icons/${id}.png`;
  }
  return `/${ASSET_ROOT}/rpg_icons/${ICON_FALLBACK}.png`;
}

// ---------------------------------------------------------------
// Convenience: preload hints for the current scene
// ---------------------------------------------------------------
export function sceneImages(location: {
  visualType?: string;
  ambiance?: string;
  name?: string;
  description?: string;
}): { environment: string } {
  return {
    environment: resolveEnvironment(
      location?.visualType,
      location?.ambiance,
      location?.name,
      location?.description,
    ),
  };
}