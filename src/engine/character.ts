// ============================================================
// CHARACTER SYSTEM - Creation, progression, management
// ============================================================

import type { Character, Archetype, Origin, Attributes, Skill, Spell } from './types';
import { getAttributeModifier } from './dice';
import { SPELL_TEMPLATES } from '../data/spells';

let charCounter = 0;

export function generateCharacterId(): string {
  return `char_${Date.now()}_${++charCounter}`;
}

export interface ArchetypeDefinition {
  id: Archetype;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  baseAttributes: Attributes;
  hitDie: number;
  proficientSkills: Skill[];
  startingSpells: string[];
  startingEquipment: string[];
}

export const ARCHETYPES: Record<Archetype, ArchetypeDefinition> = {
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    nameEs: 'Guerrero',
    description: 'Masters of martial combat, warriors rely on strength and endurance to overcome their foes.',
    descriptionEs: 'Maestros del combate marcial, los guerreros confían en la fuerza y la resistencia para superar a sus enemigos.',
    baseAttributes: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 12, charisma: 10 },
    hitDie: 10,
    proficientSkills: ['melee', 'athletics', 'intimidation'],
    startingSpells: [],
    startingEquipment: ['iron_longsword', 'wooden_shield', 'chainmail', 'rations_3', 'health_potion'],
  },
  rogue: {
    id: 'rogue',
    name: 'Rogue',
    nameEs: 'Pícaro',
    description: 'Cunning and agile, rogues use stealth and precision to exploit their enemies\' weaknesses.',
    descriptionEs: 'Astutos y ágiles, los pícaros usan sigilo y precisión para explotar las debilidades de sus enemigos.',
    baseAttributes: { strength: 10, dexterity: 16, constitution: 12, intelligence: 14, wisdom: 12, charisma: 12 },
    hitDie: 8,
    proficientSkills: ['stealth', 'sleight_of_hand', 'deception', 'perception'],
    startingSpells: [],
    startingEquipment: ['iron_daggers', 'leather_armor', 'thieves_tools', 'rations_3', 'health_potion'],
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    nameEs: 'Explorador',
    description: 'Skilled hunters and trackers, rangers combine martial prowess with knowledge of the natural world.',
    descriptionEs: 'Hábiles cazadores y rastreadores, los exploradores combinan destreza marcial con conocimiento del mundo natural.',
    baseAttributes: { strength: 12, dexterity: 16, constitution: 12, intelligence: 10, wisdom: 14, charisma: 10 },
    hitDie: 10,
    proficientSkills: ['ranged', 'survival', 'perception', 'animal_handling', 'nature'],
    startingSpells: [],
    startingEquipment: ['short_bow', 'iron_shortsword', 'studded_leather', 'arrows_20', 'rations_3', 'health_potion'],
  },
  mage: {
    id: 'mage',
    name: 'Mage',
    nameEs: 'Mago',
    description: 'Wielders of arcane power, mages reshape reality through forbidden knowledge and ancient spells.',
    descriptionEs: 'Domadores del poder arcano, los magos remodelan la realidad a través de conocimiento prohibido y hechizos ancestrales.',
    baseAttributes: { strength: 8, dexterity: 12, constitution: 12, intelligence: 16, wisdom: 14, charisma: 10 },
    hitDie: 6,
    proficientSkills: ['arcana', 'history', 'investigation'],
    startingSpells: ['arcane_bolt', 'frost_touch'],
    startingEquipment: ['arcane_staff', 'robes', 'spellbook', 'rations_3', 'health_potion'],
  },
  cleric: {
    id: 'cleric',
    name: 'Cleric',
    nameEs: 'Clérigo',
    description: 'Devoted to ancient powers, clerics channel divine energy to heal allies and punish the unworthy.',
    descriptionEs: 'Devotos de poderes ancestrales, los clérigos canalizan energía divina para sanar aliados y castigar a los indignos.',
    baseAttributes: { strength: 14, dexterity: 10, constitution: 14, intelligence: 10, wisdom: 16, charisma: 12 },
    hitDie: 8,
    proficientSkills: ['medicine', 'religion', 'persuasion'],
    startingSpells: ['sacred_flame', 'healing_word'],
    startingEquipment: ['iron_mace', 'holy_symbol', 'chainmail', 'shield_wooden', 'rations_3', 'health_potion'],
  },
};

export const ORIGINS: Record<Origin, { name: string; nameEs: string; description: string; descriptionEs: string; skillBonus: Skill; attributeBonus: keyof Attributes }> = {
  ashenvale: {
    name: 'Ashenvale',
    nameEs: 'Valle Ceniza',
    description: 'A war-torn valley where ancient forests burned and strange magic seeps from the earth.',
    descriptionEs: 'Un valle devastado por la guerra donde bosques ancestrales ardieron y magia extraña se filtra de la tierra.',
    skillBonus: 'survival',
    attributeBonus: 'constitution',
  },
  ironcoast: {
    name: 'Iron Coast',
    nameEs: 'Costa de Hierro',
    description: 'Harsh shores ruled by merchant-lords and fortified with ancient iron.',
    descriptionEs: 'Costas duras gobernadas por señores mercaderes y fortificadas con hierro ancestral.',
    skillBonus: 'intimidation',
    attributeBonus: 'strength',
  },
  shadowfen: {
    name: 'Shadowfen',
    nameEs: 'Ciénaga Sombría',
    description: 'Misty marshlands where the dead speak and the living listen.',
    descriptionEs: 'Pantanos brumosos donde los muertos hablan y los vivos escuchan.',
    skillBonus: 'religion',
    attributeBonus: 'wisdom',
  },
  stormreach: {
    name: 'Stormreach',
    nameEs: 'Barrera Tormentosa',
    description: 'A fortress-city battered by eternal storms, home to scholars and outcasts.',
    descriptionEs: 'Una ciudad-fortaleza golpeada por tormentas eternas, hogar de académicos y parias.',
    skillBonus: 'arcana',
    attributeBonus: 'intelligence',
  },
  deephollow: {
    name: 'Deephollow',
    nameEs: 'Hondonada Profunda',
    description: 'Underground cities carved into living rock, where trade flows through darkness.',
    descriptionEs: 'Ciudades subterráneas talladas en roca viva, donde el comercio fluye a través de la oscuridad.',
    skillBonus: 'stealth',
    attributeBonus: 'dexterity',
  },
};

export function createCharacter(
  name: string,
  archetype: Archetype,
  origin: Origin,
  portrait: string = 'default',
  background: string = '',
  personalityTraits: string = ''
): Character {
  const archDef = ARCHETYPES[archetype];
  const originDef = ORIGINS[origin];

  const attributes = { ...archDef.baseAttributes };
  attributes[originDef.attributeBonus] += 1;

  const conMod = getAttributeModifier(attributes.constitution);
  const maxHp = archDef.hitDie + conMod;

  return {
    id: generateCharacterId(),
    name,
    portrait,
    archetype,
    origin,
    level: 1,
    experience: 0,
    experienceToNext: 100,
    attributes,
    skills: {},
    hp: maxHp,
    maxHp,
    mp: archetype === 'mage' ? 8 : archetype === 'cleric' ? 6 : 0,
    maxMp: archetype === 'mage' ? 8 : archetype === 'cleric' ? 6 : 0,
    stamina: 10,
    maxStamina: 10,
    ac: calculateAC(attributes, archetype),
    initiative: 0,
    speed: 30,
    gold: 15,
    conditions: [],
    equipment: {
      weapon_main: null,
      weapon_off: null,
      armor: null,
      helmet: null,
      boots: null,
      gloves: null,
      ring_1: null,
      ring_2: null,
      amulet: null,
      relic: null,
    },
    inventory: [],
    spells: archDef.startingSpells
      .map(spellId => SPELL_TEMPLATES[spellId])
      .filter((spell): spell is Spell => Boolean(spell))
      .map(spell => ({ ...spell })),
    portraitState: { healthPercent: 100, conditions: [] },
    background,
    personalityTraits,
  };
}

function calculateAC(attributes: Attributes, archetype: Archetype): number {
  const dexMod = getAttributeModifier(attributes.dexterity);
  switch (archetype) {
    case 'warrior':
    case 'cleric':
      return 16 + Math.min(dexMod, 2);
    case 'ranger':
      return 14 + Math.min(dexMod, 2);
    case 'rogue':
      return 12 + dexMod;
    case 'mage':
      return 10 + dexMod;
    default:
      return 10 + dexMod;
  }
}

export function getCharacterModifier(character: Character, attribute: keyof Attributes): number {
  return getAttributeModifier(character.attributes[attribute]);
}

export function getSkillModifier(character: Character, skill: Skill): number {
  const attrKey = getSkillAttribute(skill);
  const attrMod = getAttributeModifier(character.attributes[attrKey]);
  const skillMod = character.skills[skill] || 0;
  return attrMod + skillMod;
}

function getSkillAttribute(skill: Skill): keyof Attributes {
  const map: Record<Skill, keyof Attributes> = {
    melee: 'strength', ranged: 'dexterity', athletics: 'strength',
    acrobatics: 'dexterity', stealth: 'dexterity', sleight_of_hand: 'dexterity',
    investigation: 'intelligence', arcana: 'intelligence', history: 'intelligence',
    insight: 'wisdom', perception: 'wisdom', survival: 'wisdom',
    deception: 'charisma', intimidation: 'charisma', persuasion: 'charisma',
    performance: 'charisma', religion: 'intelligence', medicine: 'wisdom',
    nature: 'intelligence', animal_handling: 'wisdom',
  };
  return map[skill];
}

export function healCharacter(character: Character, amount: number): void {
  character.hp = Math.min(character.maxHp, character.hp + amount);
  character.portraitState.healthPercent = (character.hp / character.maxHp) * 100;
}

export function damageCharacter(character: Character, amount: number): void {
  character.hp = Math.max(0, character.hp - amount);
  character.portraitState.healthPercent = (character.hp / character.maxHp) * 100;
}

/**
 * Awards experience and applies every level it earns.
 *
 * Three things were wrong here and they compounded: the threshold was multiplied
 * by 1.5 without rounding (100, 150, 225, 337.5 — a fractional target shown to
 * the player), only ONE level was granted per call no matter how much XP came in
 * at once, and a level-up changed nothing but the number, so a level 4 hero still
 * had a level 1 hero's hit points.
 */
export function addExperience(character: Character, amount: number): boolean {
  character.experience += amount;

  const archDef = ARCHETYPES[character.archetype];
  const conMod = getAttributeModifier(character.attributes.constitution);
  let leveled = false;

  while (character.experience >= character.experienceToNext) {
    character.experience -= character.experienceToNext;
    character.level += 1;
    character.experienceToNext = Math.round(character.experienceToNext * 1.5);
    leveled = true;

    // Half a hit die, rounded up, plus the constitution modifier — never less
    // than one point, so a level is always worth something.
    const hpGain = Math.max(1, Math.ceil(archDef.hitDie / 2) + conMod);
    character.maxHp += hpGain;
    character.hp += hpGain;

    if (character.maxMp > 0) {
      character.maxMp += 2;
      character.mp += 2;
    }
  }

  character.portraitState.healthPercent = (character.hp / character.maxHp) * 100;
  return leveled;
}
