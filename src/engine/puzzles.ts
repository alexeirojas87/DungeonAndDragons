// ============================================================
// PUZZLES - Deterministic gates that unlock tools and branches
// Three variants share one shape so the engine, the validator and
// the authored chapter contract all speak about the same object.
// Nothing here calls the LLM: a puzzle is always solvable offline.
// ============================================================

import type { Character, Skill } from './types';
import { rollSkillCheck } from './dice';

export interface BilingualText {
  en: string;
  es: string;
}

export interface PuzzleUnlocks {
  flags?: Record<string, boolean>;
  items?: string[];
  nodeId?: string;
  locationId?: string;
}

interface PuzzleBase {
  id: string;
  title: string;
  titleEs: string;
  prompt: string;
  promptEs: string;
  /** Revealed one at a time as attempts fail. At least two are required. */
  hints: BilingualText[];
  unlocks: PuzzleUnlocks;
  /** Where the story goes once the puzzle is solved. */
  solvedNodeId: string;
  /** Escape hatch: a puzzle must never be able to strand the player. */
  skipNodeId: string;
}

export interface RiddlePuzzle extends PuzzleBase {
  kind: 'riddle';
  answers: string[];
  answersEs: string[];
}

export interface MechanismStep {
  id: string;
  label: string;
  labelEs: string;
}

export interface MechanismPuzzle extends PuzzleBase {
  kind: 'mechanism';
  steps: string[];
  ordered: boolean;
  stepLabels: MechanismStep[];
  onWrongStep: BilingualText;
}

export interface PuzzleClue {
  id: string;
  en: string;
  es: string;
  dcReduction: number;
}

export interface CheckPuzzle extends PuzzleBase {
  kind: 'check';
  skill: Skill;
  dc: number;
  clues: PuzzleClue[];
}

export type Puzzle = RiddlePuzzle | MechanismPuzzle | CheckPuzzle;

export const PUZZLE_KINDS = ['riddle', 'mechanism', 'check'] as const;

// ---- Progress state (stored on GameState so it survives a reload) ----

export interface PuzzleRuntime {
  /** Mechanism steps already toggled, in the order they were toggled. */
  progress: Record<string, string[]>;
  /** Failed attempts per puzzle; drives progressive hints. */
  attempts: Record<string, number>;
  solved: string[];
}

export function createPuzzleRuntime(): PuzzleRuntime {
  return { progress: {}, attempts: {}, solved: [] };
}

// ---- Answer normalisation ----

const STRIPPED_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al',
  'the', 'a', 'an', 'of',
]);

/**
 * Lowercase, strip accents and punctuation, drop articles and collapse
 * whitespace, so "El Agua Negra." and "agua negra" compare equal.
 */
export function normalizeAnswer(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && !STRIPPED_WORDS.has(word))
    .join(' ');
}

// ---- Resolution ----

export type PuzzleOutcome =
  | { status: 'solved'; message: BilingualText; nextNodeId: string }
  | { status: 'progress'; message: BilingualText }
  | { status: 'failed'; message: BilingualText; hint?: BilingualText; solutionRevealed?: BilingualText };

const WRONG_ANSWER: BilingualText = {
  en: 'Something in the answer does not fit. The lock stays shut.',
  es: 'Algo en la respuesta no encaja. El cierre no cede.',
};

/**
 * Hint policy: no punishment, ever. The first failure only says "not yet";
 * every failure after that reveals one more authored hint, and once the hints
 * run out the engine hands over the solution rather than let the player stall.
 */
export function hintForAttempt(puzzle: Puzzle, attempts: number): BilingualText | undefined {
  if (attempts < 2) return undefined;
  return puzzle.hints[Math.min(attempts - 2, puzzle.hints.length - 1)];
}

export function hintsExhausted(puzzle: Puzzle, attempts: number): boolean {
  return attempts - 1 >= puzzle.hints.length;
}

export function solutionText(puzzle: Puzzle): BilingualText {
  switch (puzzle.kind) {
    case 'riddle':
      return {
        en: `The answer, at last, is plain: ${puzzle.answers[0]}.`,
        es: `La respuesta, al fin, es evidente: ${puzzle.answersEs[0] ?? puzzle.answers[0]}.`,
      };
    case 'mechanism': {
      const order = puzzle.steps
        .map(step => puzzle.stepLabels.find(label => label.id === step))
        .filter((label): label is MechanismStep => !!label);
      return {
        en: `The right sequence surfaces in your memory: ${order.map(l => l.label).join(' → ')}.`,
        es: `La secuencia correcta aflora en tu memoria: ${order.map(l => l.labelEs).join(' → ')}.`,
      };
    }
    case 'check':
      return {
        en: 'Patience does what talent could not: the meaning finally gives way.',
        es: 'La paciencia logra lo que el talento no pudo: el sentido cede por fin.',
      };
  }
}

export function solveRiddle(puzzle: RiddlePuzzle, rawInput: string): boolean {
  const normalized = normalizeAnswer(rawInput);
  if (!normalized) return false;
  return [...puzzle.answers, ...puzzle.answersEs]
    .map(normalizeAnswer)
    .filter(answer => answer.length > 0)
    .some(answer => normalized === answer || normalized.includes(answer));
}

export interface MechanismResult {
  solved: boolean;
  reset: boolean;
  progress: string[];
}

export function applyMechanismStep(
  puzzle: MechanismPuzzle,
  progress: string[],
  stepId: string,
): MechanismResult {
  if (!puzzle.steps.includes(stepId)) {
    return { solved: false, reset: false, progress };
  }

  if (!puzzle.ordered) {
    const next = progress.includes(stepId) ? progress : [...progress, stepId];
    return {
      solved: puzzle.steps.every(step => next.includes(step)),
      reset: false,
      progress: next,
    };
  }

  const expected = puzzle.steps[progress.length];
  if (stepId !== expected) {
    // Wrong step resets the sequence; the player loses nothing but the order.
    return { solved: false, reset: true, progress: [] };
  }

  const next = [...progress, stepId];
  return { solved: next.length === puzzle.steps.length, reset: false, progress: next };
}

export function effectiveCheckDC(puzzle: CheckPuzzle, discoveredClueIds: string[]): number {
  const reduction = puzzle.clues
    .filter(clue => discoveredClueIds.includes(clue.id))
    .reduce((total, clue) => total + clue.dcReduction, 0);
  return Math.max(5, puzzle.dc - reduction);
}

export function rollPuzzleCheck(
  puzzle: CheckPuzzle,
  hero: Character,
  discoveredClueIds: string[],
) {
  const dc = effectiveCheckDC(puzzle, discoveredClueIds);
  return {
    dc,
    check: rollSkillCheck(puzzle.skill, hero.attributes, hero.skills[puzzle.skill] ?? 0, dc),
  };
}

export { WRONG_ANSWER };
