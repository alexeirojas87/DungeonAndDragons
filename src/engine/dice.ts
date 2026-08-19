// ============================================================
// DICE ENGINE - Deterministic dice rolling
// The AI must NEVER invent dice results.
// ============================================================

import type { DiceType, DiceRoll, SkillCheck, Skill, Attributes } from './types';

const SKILL_ATTRIBUTE_MAP: Record<Skill, keyof Attributes> = {
  melee: 'strength',
  ranged: 'dexterity',
  athletics: 'strength',
  acrobatics: 'dexterity',
  stealth: 'dexterity',
  sleight_of_hand: 'dexterity',
  investigation: 'intelligence',
  arcana: 'intelligence',
  history: 'intelligence',
  insight: 'wisdom',
  perception: 'wisdom',
  survival: 'wisdom',
  deception: 'charisma',
  intimidation: 'charisma',
  persuasion: 'charisma',
  performance: 'charisma',
  religion: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  animal_handling: 'wisdom',
};

export function rollDice(type: DiceType, count: number = 1, modifier: number = 0): DiceRoll {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * type) + 1);
  }
  const sum = results.reduce((a, b) => a + b, 0);
  const total = sum + modifier;

  const isCritical = type === 20 && results.some(r => r === 20);
  const isFumble = type === 20 && results.length === 1 && results[0] === 1;

  return {
    type,
    count,
    modifier,
    results,
    total: Math.max(0, total),
    isCritical,
    isFumble,
  };
}

export function rollD20(modifier: number = 0): DiceRoll {
  return rollDice(20, 1, modifier);
}

export function rollSkillCheck(
  skill: Skill,
  attributes: Attributes,
  skillProficiency: number,
  dc: number,
  hidden: boolean = false
): SkillCheck {
  const attrKey = SKILL_ATTRIBUTE_MAP[skill];
  const attrMod = Math.floor((attributes[attrKey] - 10) / 2);
  const totalMod = attrMod + skillProficiency;
  const roll = rollD20(totalMod);

  return {
    skill,
    dc,
    roll,
    modifier: totalMod,
    total: roll.total,
    success: roll.total >= dc,
    hidden,
  };
}

export function rollInitiative(dexterity: number): number {
  const mod = Math.floor((dexterity - 10) / 2);
  const roll = rollD20(mod);
  return roll.total;
}

export function rollDamage(damageStr: string, modifier: number = 0): DiceRoll {
  // Parse damage string like "2d6"
  const match = damageStr.match(/(\d+)d(\d+)/);
  if (!match) return rollDice(6, 1, modifier);

  const count = parseInt(match[1]);
  const type = parseInt(match[2]) as DiceType;
  return rollDice(type, count, modifier);
}

export function getAttributeModifier(value: number): number {
  return Math.floor((value - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function rollSaveCheck(
  attribute: keyof Attributes,
  attributes: Attributes,
  dc: number,
  proficiencyBonus: number = 0
): SkillCheck {
  const skillMap: Record<keyof Attributes, Skill> = {
    strength: 'athletics',
    dexterity: 'acrobatics',
    constitution: 'medicine',
    intelligence: 'arcana',
    wisdom: 'insight',
    charisma: 'persuasion',
  };

  return rollSkillCheck(
    skillMap[attribute],
    attributes,
    proficiencyBonus,
    dc,
    true
  );
}
