// ============================================================
// INVENTORY SYSTEM - Items, equipment, loot
// ============================================================

import type { Item, ItemRarity, ItemType, Equipment, EquipmentSlot, ItemProperties, SpellSchool, Spell } from './types';

let itemCounter = 0;

export function generateItemId(): string {
  return `item_${Date.now()}_${++itemCounter}`;
}

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#8B8682',
  uncommon: '#4A9E4A',
  rare: '#4A7FD4',
  epic: '#9B59B6',
  legendary: '#E6A817',
  unique: '#FF6B6B',
};

export const RARITY_LABELS: Record<ItemRarity, Record<string, string>> = {
  common: { en: 'Common', es: 'Común' },
  uncommon: { en: 'Uncommon', es: 'Poco Común' },
  rare: { en: 'Rare', es: 'Raro' },
  epic: { en: 'Epic', es: 'Épico' },
  legendary: { en: 'Legendary', es: 'Legendario' },
  unique: { en: 'Unique', es: 'Único' },
};

/** Equipment slot names for display; raw ids read as English placeholders. */
export const SLOT_LABELS: Record<string, { en: string; es: string }> = {
  weapon_main: { en: 'Main hand', es: 'Mano principal' },
  weapon_off: { en: 'Off hand', es: 'Mano secundaria' },
  armor: { en: 'Armor', es: 'Armadura' },
  helmet: { en: 'Helmet', es: 'Yelmo' },
  boots: { en: 'Boots', es: 'Botas' },
  gloves: { en: 'Gloves', es: 'Guantes' },
  ring_1: { en: 'Ring I', es: 'Anillo I' },
  ring_2: { en: 'Ring II', es: 'Anillo II' },
  amulet: { en: 'Amulet', es: 'Amuleto' },
  relic: { en: 'Relic', es: 'Reliquia' },
};

export function slotLabel(slot: string, language: 'en' | 'es'): string {
  const label = SLOT_LABELS[slot];
  return label ? label[language] : slot.replaceAll('_', ' ');
}

export interface ItemTemplate {
  id: string;
  name: string;
  nameEs: string;
  type: ItemType;
  rarity: ItemRarity;
  weight: number;
  value: number;
  description: string;
  descriptionEs: string;
  properties: ItemProperties;
  maxDurability?: number;
  slot?: EquipmentSlot;
  usable: boolean;
  consumable: boolean;
  spellSchool?: SpellSchool;
}

export const ITEM_TEMPLATES: Record<string, ItemTemplate> = {
  iron_longsword: {
    id: 'iron_longsword',
    name: 'Iron Longsword',
    nameEs: 'Espada Larga de Hierro',
    type: 'weapon',
    rarity: 'common',
    weight: 3,
    value: 15,
    description: 'A sturdy longsword forged from iron. Reliable if unremarkable.',
    descriptionEs: 'Una espada larga resistente forjada de hierro. Fiable si poco notable.',
    properties: { damage: '1d8', damageType: 'slashing' },
    maxDurability: 20,
    slot: 'weapon_main',
    usable: true,
    consumable: false,
  },
  iron_daggers: {
    id: 'iron_daggers',
    name: 'Iron Daggers',
    nameEs: 'Dagas de Hierro',
    type: 'weapon',
    rarity: 'common',
    weight: 1,
    value: 10,
    description: 'A pair of short iron daggers. Quick and deadly in skilled hands.',
    descriptionEs: 'Un par de dagas cortas de hierro. Rápidas y mortales en manos hábiles.',
    properties: { damage: '1d4', damageType: 'piercing' },
    maxDurability: 15,
    slot: 'weapon_main',
    usable: true,
    consumable: false,
  },
  short_bow: {
    id: 'short_bow',
    name: 'Short Bow',
    nameEs: 'Arco Corto',
    type: 'weapon',
    rarity: 'common',
    weight: 2,
    value: 12,
    description: 'A simple bow suitable for hunting and light combat.',
    descriptionEs: 'Un arco simple adecuado para caza y combate ligero.',
    properties: { damage: '1d6', damageType: 'piercing', range: 80 },
    maxDurability: 12,
    slot: 'weapon_main',
    usable: true,
    consumable: false,
  },
  iron_shortsword: {
    id: 'iron_shortsword',
    name: 'Iron Shortsword',
    nameEs: 'Espada Corta de Hierro',
    type: 'weapon',
    rarity: 'common',
    weight: 2,
    value: 10,
    description: 'A short blade, well-balanced for quick strikes.',
    descriptionEs: 'Una hoja corta, bien equilibrada para golpes rápidos.',
    properties: { damage: '1d6', damageType: 'slashing' },
    maxDurability: 15,
    slot: 'weapon_main',
    usable: true,
    consumable: false,
  },
  arcane_staff: {
    id: 'arcane_staff',
    name: 'Arcane Staff',
    nameEs: 'Bastón Arcano',
    type: 'weapon',
    rarity: 'uncommon',
    weight: 4,
    value: 25,
    description: 'A staff etched with arcane symbols. It hums with latent power.',
    descriptionEs: 'Un bastón grabado con símbolos arcanos. Vibra con poder latente.',
    properties: { damage: '1d6', damageType: 'psychic', special: ['+1 spell damage'] },
    maxDurability: 10,
    slot: 'weapon_main',
    usable: true,
    consumable: false,
  },
  iron_mace: {
    id: 'iron_mace',
    name: 'Iron Mace',
    nameEs: 'Maza de Hierro',
    type: 'weapon',
    rarity: 'common',
    weight: 4,
    value: 12,
    description: 'A heavy mace blessed by the temple. Crushes bone and doubt alike.',
    descriptionEs: 'Una maza pesada bendecida por el templo. Tritura huesos y dudas por igual.',
    properties: { damage: '1d6', damageType: 'bludgeoning' },
    maxDurability: 20,
    slot: 'weapon_main',
    usable: true,
    consumable: false,
  },
  chainmail: {
    id: 'chainmail',
    name: 'Chainmail Armor',
    nameEs: 'Armadura de Cota de Malla',
    type: 'armor',
    rarity: 'common',
    weight: 20,
    value: 30,
    description: 'Interlocking iron rings forming a protective mesh.',
    descriptionEs: 'Anillos de hierro entrelazados formando una malla protectora.',
    properties: { acBonus: 6 },
    maxDurability: 25,
    slot: 'armor',
    usable: true,
    consumable: false,
  },
  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    nameEs: 'Armadura de Cuero',
    type: 'armor',
    rarity: 'common',
    weight: 10,
    value: 15,
    description: 'Hardened leather offering basic protection without restricting movement.',
    descriptionEs: 'Cuero endurecido que ofrece protección básica sin restringir el movimiento.',
    properties: { acBonus: 2 },
    maxDurability: 15,
    slot: 'armor',
    usable: true,
    consumable: false,
  },
  studded_leather: {
    id: 'studded_leather',
    name: 'Studded Leather',
    nameEs: 'Cuero con Tachuelas',
    type: 'armor',
    rarity: 'common',
    weight: 12,
    value: 20,
    description: 'Leather reinforced with metal studs. Light but effective.',
    descriptionEs: 'Cuero reforzado con tachuelas de metal. Ligero pero efectivo.',
    properties: { acBonus: 3 },
    maxDurability: 18,
    slot: 'armor',
    usable: true,
    consumable: false,
  },
  robes: {
    id: 'robes',
    name: 'Scholar\'s Robes',
    nameEs: 'Túnica del Erudito',
    type: 'armor',
    rarity: 'common',
    weight: 3,
    value: 5,
    description: 'Simple robes offering minimal physical protection.',
    descriptionEs: 'Túnicas simples que ofrecen protección física mínima.',
    properties: { acBonus: 0 },
    slot: 'armor',
    usable: true,
    consumable: false,
  },
  wooden_shield: {
    id: 'wooden_shield',
    name: 'Wooden Shield',
    nameEs: 'Escudo de Madera',
    type: 'shield',
    rarity: 'common',
    weight: 5,
    value: 5,
    description: 'A simple wooden shield. It will break eventually.',
    descriptionEs: 'Un escudo de madera simple. Se romperá eventualmente.',
    properties: { acBonus: 2 },
    maxDurability: 10,
    slot: 'weapon_off',
    usable: true,
    consumable: false,
  },
  shield_wooden: {
    id: 'shield_wooden',
    name: 'Wooden Shield',
    nameEs: 'Escudo de Madera',
    type: 'shield',
    rarity: 'common',
    weight: 5,
    value: 5,
    description: 'A simple wooden shield bearing a faded holy symbol.',
    descriptionEs: 'Un escudo de madera simple con un símbolo sagrado descolorido.',
    properties: { acBonus: 2 },
    maxDurability: 10,
    slot: 'weapon_off',
    usable: true,
    consumable: false,
  },
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    nameEs: 'Poción de Salud',
    type: 'consumable',
    rarity: 'common',
    weight: 0.5,
    value: 10,
    description: 'A small vial of crimson liquid. Restores vitality when consumed.',
    descriptionEs: 'Un pequeño frasco de líquido carmesí. Restaura vitalidad al consumirse.',
    properties: { healAmount: 15 },
    usable: true,
    consumable: true,
  },
  mana_potion: {
    id: 'mana_potion',
    name: 'Mana Potion',
    nameEs: 'Poción de Maná',
    type: 'consumable',
    rarity: 'uncommon',
    weight: 0.5,
    value: 15,
    description: 'A vial of shimmering blue liquid. Restores arcane energy.',
    descriptionEs: 'Un frasco de líquido azul brillante. Restaura energía arcana.',
    properties: { mpRestore: 8 },
    usable: true,
    consumable: true,
  },
  torch: {
    id: 'torch',
    name: 'Torch',
    nameEs: 'Antorcha',
    type: 'misc',
    rarity: 'common',
    weight: 1,
    value: 1,
    description: 'A simple torch that burns for about an hour.',
    descriptionEs: 'Una antorcha simple que dura aproximadamente una hora.',
    properties: {},
    usable: true,
    consumable: false,
  },
  rations_3: {
    id: 'rations_3',
    name: 'Trail Rations',
    nameEs: 'Raciones de Camino',
    type: 'consumable',
    rarity: 'common',
    weight: 3,
    value: 3,
    description: 'Three days of dried meat, hard bread, and preserved fruit.',
    descriptionEs: 'Tres días de carne seca, pan duro y fruta preservada.',
    properties: {},
    usable: true,
    consumable: false,
  },
  thieves_tools: {
    id: 'thieves_tools',
    name: 'Thieves\' Tools',
    nameEs: 'Herramientas de Ladrón',
    type: 'misc',
    rarity: 'common',
    weight: 1,
    value: 25,
    description: 'Lockpicks, tension wrenches, and small tools for bypassing locks.',
    descriptionEs: 'Ganzúas, llaves de tensión y herramientas pequeñas para abrir cerraduras.',
    properties: { special: ['Pick locks', 'Disable traps'] },
    usable: true,
    consumable: false,
  },
  arrows_20: {
    id: 'arrows_20',
    name: 'Arrows (20)',
    nameEs: 'Flechas (20)',
    type: 'misc',
    rarity: 'common',
    weight: 1,
    value: 1,
    description: 'A quiver of twenty simple arrows.',
    descriptionEs: 'Un carcaj de veinte flechas simples.',
    properties: {},
    usable: false,
    consumable: false,
  },
  holy_symbol: {
    id: 'holy_symbol',
    name: 'Holy Symbol',
    nameEs: 'Símbolo Sagrado',
    type: 'relic',
    rarity: 'uncommon',
    weight: 0.5,
    value: 20,
    description: 'A tarnished silver symbol of an ancient order. It still resonates with faint power.',
    descriptionEs: 'Un símbolo plateado tarnizado de una orden antigua. Aún resuena con un poder tenue.',
    properties: { special: ['Channel divine power'] },
    usable: true,
    consumable: false,
  },
  spellbook: {
    id: 'spellbook',
    name: 'Spellbook',
    nameEs: 'Libro de Hechizos',
    type: 'misc',
    rarity: 'uncommon',
    weight: 2,
    value: 50,
    description: 'A leather-bound tome filled with arcane notation and diagrams.',
    descriptionEs: 'Un tomo encuadernado en cuero lleno de notación arcanos y diagramas.',
    properties: { special: ['Required for learning spells'] },
    usable: true,
    consumable: false,
  },
  // Dungeon Loot
  ancient_coin: {
    id: 'ancient_coin',
    name: 'Ancient Coin',
    nameEs: 'Moneda Antigua',
    type: 'misc',
    rarity: 'uncommon',
    weight: 0.1,
    value: 5,
    description: 'A tarnished coin bearing the seal of a forgotten kingdom.',
    descriptionEs: 'Una moneda tarnizada con el sello de un reino olvidado.',
    properties: {},
    usable: false,
    consumable: false,
  },
  rusty_key: {
    id: 'rusty_key',
    name: 'Rusty Key',
    nameEs: 'Llave Oxidada',
    type: 'misc',
    rarity: 'common',
    weight: 0.5,
    value: 2,
    description: 'An old iron key, covered in rust. It might open something.',
    descriptionEs: 'Una llave de hierro vieja, cubierta de óxido. Podría abrir algo.',
    properties: { special: ['Opens locked doors'] },
    usable: true,
    consumable: false,
  },
  bone_amulet: {
    id: 'bone_amulet',
    name: 'Bone Amulet',
    nameEs: 'Amuleto de Hueso',
    type: 'relic',
    rarity: 'rare',
    weight: 0.3,
    value: 100,
    description: 'An amulet carved from human bone. It whispers when worn.',
    descriptionEs: 'Un amuleto tallado en hueso humano. Susurra cuando se lleva.',
    properties: { statBonuses: { wisdom: 2 }, special: ['Speak with the dead'] },
    slot: 'amulet',
    usable: true,
    consumable: false,
  },
  shadow_blade: {
    id: 'shadow_blade',
    name: 'Shadow Blade',
    nameEs: 'Hoja Sombría',
    type: 'weapon',
    rarity: 'epic',
    weight: 2,
    value: 500,
    description: 'A dagger that seems to drink the light around it. Made by the Shadowfen assassins.',
    descriptionEs: 'Una daga que parece beber la luz a su alrededor. Forjada por los asesinos de Ciénaga Sombría.',
    properties: { damage: '2d4', damageType: 'necrotic', special: ['+2 vs undead'] },
    maxDurability: 30,
    slot: 'weapon_main',
    usable: true,
    consumable: false,
  },
  crypt_warden_helm: {
    id: 'crypt_warden_helm',
    name: 'Crypt Warden\'s Helm',
    nameEs: 'Yelmo del Guardián de la Cripta',
    type: 'armor',
    rarity: 'rare',
    weight: 6,
    value: 200,
    description: 'A bone-crested helm worn by the ancient guardians of the Sunken Crypt.',
    descriptionEs: 'Un yelmo crestado de hueso usado por los guardianes ancestrales de la Cripta Sumergida.',
    properties: { acBonus: 1, statBonuses: { constitution: 1 }, special: ['+2 vs necrotic damage'] },
    maxDurability: 25,
    slot: 'helmet',
    usable: true,
    consumable: false,
  },
};

export function createItem(templateId: string): Item | null {
  const template = ITEM_TEMPLATES[templateId];
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

export function equipItem(character: { equipment: Equipment; inventory: Item[] }, item: Item): boolean {
  if (!item.slot) return false;

  const currentEquipped = character.equipment[item.slot];
  if (currentEquipped) {
    character.inventory.push(currentEquipped);
  }

  character.equipment[item.slot] = item;
  character.inventory = character.inventory.filter(i => i.id !== item.id);

  return true;
}

export function unequipItem(character: { equipment: Equipment; inventory: Item[] }, slot: EquipmentSlot): boolean {
  const item = character.equipment[slot];
  if (!item) return false;

  character.inventory.push(item);
  character.equipment[slot] = null;

  return true;
}

/**
 * Armour class from equipment.
 *
 * `acBonus` is a bonus, but this used to assign it as the whole armour class,
 * throwing away the base 10. Equipping your starting gear therefore LOWERED your
 * defence — a cleric in chainmail and a shield dropped from 16 to 8, and a mage
 * in robes to 1 — so every enemy hit almost every swing and any run that lost a
 * little health spiralled into an unwinnable retry loop.
 */
export function getEffectiveAC(character: { equipment: Equipment; attributes: { dexterity: number } }): number {
  const dexMod = getAttributeModifierValue(character.attributes.dexterity);
  const armor = character.equipment.armor;
  const armorBonus = armor?.properties.acBonus ?? 0;

  // Heavy armour sets a high floor but restricts movement, so it caps how much
  // agility adds. Light armour and robes leave the wearer free.
  const HEAVY_ARMOR_BONUS = 4;
  let ac = armorBonus > 0
    ? 10 + armorBonus + (armorBonus >= HEAVY_ARMOR_BONUS ? Math.min(dexMod, 2) : dexMod)
    : 10 + dexMod;

  const shield = character.equipment.weapon_off;
  if (shield && shield.type === 'shield') {
    ac += shield.properties.acBonus || 0;
  }
  return ac;
}

function getAttributeModifierValue(value: number): number {
  return Math.floor((value - 10) / 2);
}

export function calculateInventoryWeight(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.weight, 0);
}

export function consumeItem(item: Item): { heal?: number; mp?: number } | null {
  if (!item.consumable) return null;

  const result: { heal?: number; mp?: number } = {};
  if (item.properties.healAmount) result.heal = item.properties.healAmount;
  if (item.properties.mpRestore) result.mp = item.properties.mpRestore;

  return result;
}
