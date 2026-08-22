// ============================================================
// PERSISTENCE - Save/Load system
// Everything important must persist.
// Never depend on the LLM remembering the campaign.
// ============================================================

import type { GameState, Language, NarrativeEntry } from '../engine/types';
import { createInitialStoryState } from '../data/storyGraph';
import { CHAPTER_ONE, getCampaignChaptersThrough } from '../data/chapters';
import { createPuzzleRuntime } from '../engine/puzzles';
import { foldLegacyCampaignProgress } from '../engine/campaign';

const SAVE_KEY = 'gauntlet_save';
const CHECKPOINT_KEY = 'gauntlet_checkpoint';
const SETTINGS_KEY = 'gauntlet_settings';
const SAVE_VERSION = 5;

const LEGACY_CHAPTER_ONE_ENDINGS = new Set([
  'ending_rescue',
  'ending_sealed',
  'ending_destroyed',
  'ending_remembered',
  'ending_relic',
]);

function authoredChapterOneEndingId(legacyEndingNodeId: string): string {
  const authoredEndingNodeId = `c01_${legacyEndingNodeId}`;
  return CHAPTER_ONE.nodes[authoredEndingNodeId]
    ? authoredEndingNodeId
    : legacyEndingNodeId;
}

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

function pruneChapters(gameState: GameState): GameState {
  // Authored chapters are immutable application data. Persist their index,
  // not hundreds of kilobytes of duplicate graph data in every save.
  return {
    ...gameState,
    chapters: [],
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
  if (![1, 2, 3, 4, SAVE_VERSION].includes(data.version)) return null;

  const state = data.gameState;
  if (!state.story) state.story = createInitialStoryState();

  const legacyGeneratedSave = data.version <= 3
    && (state.activeChapterIndex > 0 || (state.chapters?.some(chapter => chapter.index > 1) ?? false));
  const legacyChapterOneGraphSave = data.version <= 4
    && !legacyGeneratedSave
    && (state.activeChapterIndex ?? 0) === 0
    && !CHAPTER_ONE.nodes[state.story.currentNodeId];

  if (!state.campaignProgress) {
    const retainedLegacyFlags = Object.fromEntries(
      Object.entries(state.flags ?? {}).filter(([, value]) => value),
    );
    state.campaignProgress = {
      factionReputation: {},
      npcBonds: {},
      convictions: { compassion: 0, truth: 0, freedom: 0, duty: 0 },
      canonicalChoices: [...new Set(state.story.choiceHistory?.map(choice => choice.choiceId) ?? [])],
      legacyFlags: retainedLegacyFlags,
    };
  }
  foldLegacyCampaignProgress(state.campaignProgress);
  state.difficulty ??= 'oath';

  if (legacyGeneratedSave) {
    const chapterOneSummary = state.chronicle?.find(summary => summary.chapterId === CHAPTER_ONE.id);
    const legacyEndingNodeId = state.flags.claimed_drowned_relic
      ? 'ending_relic'
      : state.flags.destroyed_drowned_door
        ? 'ending_destroyed'
        : state.flags.drowned_door_appeased
          ? 'ending_remembered'
          : state.flags.sealed_drowned_door
            ? 'ending_sealed'
            : 'ending_rescue';
    const endingNodeId = authoredChapterOneEndingId(legacyEndingNodeId);
    state.chapters = [CHAPTER_ONE];
    state.activeChapterIndex = 0;
    state.story = {
      ...createInitialStoryState(),
      currentNodeId: endingNodeId,
      visitedNodeIds: [endingNodeId],
      values: { ...(chapterOneSummary?.values ?? {}) },
      completed: true,
    };
    const values = state.story.values;
    state.campaignProgress.convictions.compassion = Math.max(0, values.compassion ?? 0);
    state.campaignProgress.convictions.duty = Math.max(0, values.pragmatism ?? 0);
    state.campaignProgress.convictions.freedom = Math.max(0, values.independence ?? 0);
    state.campaignProgress.convictions.truth = Math.max(0, values.insight ?? 0);
    state.campaignProgress.npcBonds.martik = Math.max(-3, Math.min(3, values.martikTrust ?? 0));
    state.campaignProgress.npcBonds.varen = Math.max(-3, Math.min(3, values.strangerTrust ?? 0));
    state.campaignProgress.factionReputation.blackmere_council = Math.max(-5, Math.min(5, values.councilTrust ?? 0));
    state.flags['canon:chapter_one_values_mapped'] = true;
    state.chronicle = chapterOneSummary ? [chapterOneSummary] : [];
    state.combat = null;
    state.activeDialogue = null;
    state.status = 'chapter_complete';
  }

  if (legacyChapterOneGraphSave) {
    for (const [flag, value] of Object.entries(state.flags ?? {})) {
      if (value) state.campaignProgress.legacyFlags[flag] = true;
    }
    const legacyNodeId = state.story.currentNodeId;
    const mappedEndingId = LEGACY_CHAPTER_ONE_ENDINGS.has(legacyNodeId)
      ? authoredChapterOneEndingId(legacyNodeId)
      : null;
    state.chapters = [CHAPTER_ONE];
    state.activeChapterIndex = 0;
    state.combat = null;
    state.activeDialogue = null;
    state.puzzles = createPuzzleRuntime();
    if (mappedEndingId) {
      state.story = {
        ...createInitialStoryState(),
        currentNodeId: mappedEndingId,
        visitedNodeIds: [mappedEndingId],
        values: { ...state.story.values },
        completed: true,
      };
      state.status = 'chapter_complete';
    } else {
      state.story = {
        ...createInitialStoryState(),
        currentNodeId: CHAPTER_ONE.startNodeId,
        visitedNodeIds: [CHAPTER_ONE.startNodeId],
      };
      state.chronicle = (state.chronicle ?? []).filter(summary => summary.chapterId !== CHAPTER_ONE.id);
      state.status = 'playing';
    }
  }

  // v1/v2 saves predate chapters-as-data: they can only have been playing the
  // authored chapter, so give them that one and an empty chronicle.
  if (typeof state.activeChapterIndex !== 'number' || state.activeChapterIndex < 0) state.activeChapterIndex = 0;
  if (!legacyGeneratedSave && !legacyChapterOneGraphSave) {
    const activeChapterNumber = state.activeChapterIndex + 1;
    state.chapters = getCampaignChaptersThrough(activeChapterNumber);
    if (!state.chapters[state.activeChapterIndex]) {
      state.activeChapterIndex = Math.max(0, state.chapters.length - 1);
    }
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
