// ============================================================
// PERSISTENCE - Save/Load system
// Everything important must persist.
// Never depend on the LLM remembering the campaign.
// ============================================================

import type { GameState, Language, NarrativeEntry } from '../engine/types';
import { createInitialStoryState } from '../data/storyGraph';
import { CHAPTER_ONE } from '../data/chapters';
import { createPuzzleRuntime } from '../engine/puzzles';

const SAVE_KEY = 'gauntlet_save';
const CHECKPOINT_KEY = 'gauntlet_checkpoint';
const SETTINGS_KEY = 'gauntlet_settings';
const SAVE_VERSION = 3;

export interface SaveData {
  version: number;
  gameState: GameState;
  narrative: NarrativeEntry[];
  language: Language;
  savedAt: number;
}

export interface GameSettings {
  language: Language;
  textSpeed: 'instant' | 'fast' | 'normal' | 'slow';
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
  audioEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  language: 'en',
  textSpeed: 'fast',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
  audioEnabled: false,
  musicVolume: 0.15,
  effectsVolume: 0.12,
};

/**
 * Generated chapters are large. Only the chapter being played and the one
 * before it are kept in full; older ones survive as their chronicle summary,
 * which is all the engine and the next generation actually read.
 */
function pruneChapters(gameState: GameState): GameState {
  const keepFrom = Math.max(0, gameState.activeChapterIndex - 1);
  if (keepFrom === 0) return gameState;

  const chapters = gameState.chapters.slice(keepFrom);
  return {
    ...gameState,
    chapters,
    activeChapterIndex: gameState.activeChapterIndex - keepFrom,
  };
}

function writeSave(key: string, data: SaveData): void {
  const attempts: SaveData[] = [
    data,
    { ...data, narrative: data.narrative.slice(-100) },
    { ...data, narrative: data.narrative.slice(-25) },
  ];

  for (const attempt of attempts) {
    try {
      localStorage.setItem(key, JSON.stringify(attempt));
      return;
    } catch (err) {
      if (attempt === attempts[attempts.length - 1]) {
        console.error('Failed to save game:', err);
      }
    }
  }
}

export function saveGame(gameState: GameState, narrative: NarrativeEntry[], language: Language): void {
  writeSave(SAVE_KEY, {
    version: SAVE_VERSION,
    gameState: pruneChapters(gameState),
    narrative: narrative.slice(-200),
    language,
    savedAt: Date.now(),
  });
}

/**
 * A checkpoint is written only at safe moments (chapter load, story decision,
 * puzzle resolved, right before a fight starts) and is never overwritten by
 * dying, so "retry" always lands on a live, coherent state.
 */
export function saveCheckpoint(gameState: GameState, narrative: NarrativeEntry[], language: Language): void {
  if (gameState.status !== 'playing') return;
  writeSave(CHECKPOINT_KEY, {
    version: SAVE_VERSION,
    gameState: pruneChapters(gameState),
    narrative: narrative.slice(-120),
    language,
    savedAt: Date.now(),
  });
}

function migrate(data: SaveData): SaveData | null {
  if (data.version !== 1 && data.version !== 2 && data.version !== SAVE_VERSION) return null;

  const state = data.gameState;
  if (!state.story) state.story = createInitialStoryState();

  // v1/v2 saves predate chapters-as-data: they can only have been playing the
  // authored chapter, so give them that one and an empty chronicle.
  if (!Array.isArray(state.chapters) || state.chapters.length === 0) {
    state.chapters = [CHAPTER_ONE];
    state.activeChapterIndex = 0;
  }
  if (typeof state.activeChapterIndex !== 'number' || !state.chapters[state.activeChapterIndex]) {
    state.activeChapterIndex = state.chapters.length - 1;
  }
  if (!Array.isArray(state.chronicle)) state.chronicle = [];
  if (!state.puzzles) state.puzzles = createPuzzleRuntime();
  state.puzzles.progress ??= {};
  state.puzzles.attempts ??= {};
  state.puzzles.solved ??= state.worldState?.solvedPuzzles ?? [];
  if (!state.status) state.status = 'playing';

  data.version = SAVE_VERSION;
  return data;
}

function readSave(key: string): SaveData | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return migrate(JSON.parse(raw) as SaveData);
  } catch (err) {
    console.error('Failed to load game:', err);
    return null;
  }
}

export function loadGame(): SaveData | null {
  return readSave(SAVE_KEY);
}

export function loadCheckpoint(): SaveData | null {
  return readSave(CHECKPOINT_KEY) ?? readSave(SAVE_KEY);
}

export function hasSavedGame(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function hasCheckpoint(): boolean {
  return localStorage.getItem(CHECKPOINT_KEY) !== null || hasSavedGame();
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(CHECKPOINT_KEY);
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getLastSaveTime(): number | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    return data.savedAt;
  } catch {
    return null;
  }
}
