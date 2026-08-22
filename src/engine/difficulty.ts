import type { Difficulty } from './types';

export interface DifficultyRules {
  enemyHpMultiplier: number;
  enemyDamageMultiplier: number;
  enemyAttackModifier: number;
  puzzleDcModifier: number;
  firstHintAfterFailures: number;
}

export const DIFFICULTY_RULES: Record<Difficulty, DifficultyRules> = {
  story: {
    enemyHpMultiplier: 0.8,
    enemyDamageMultiplier: 0.85,
    enemyAttackModifier: -1,
    puzzleDcModifier: -2,
    firstHintAfterFailures: 1,
  },
  oath: {
    enemyHpMultiplier: 1,
    enemyDamageMultiplier: 1,
    enemyAttackModifier: 0,
    puzzleDcModifier: 0,
    firstHintAfterFailures: 2,
  },
  trial: {
    enemyHpMultiplier: 1.2,
    enemyDamageMultiplier: 1.15,
    enemyAttackModifier: 1,
    puzzleDcModifier: 2,
    firstHintAfterFailures: 3,
  },
};

export function scalePositive(value: number, multiplier: number): number {
  return Math.max(1, Math.round(value * multiplier));
}

export function difficultyRules(difficulty: Difficulty): DifficultyRules {
  return DIFFICULTY_RULES[difficulty];
}
