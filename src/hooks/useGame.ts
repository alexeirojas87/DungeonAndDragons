// ============================================================
// USE GAME HOOK - Connects game engine to React UI
// ============================================================

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GameEngine } from '../engine/gameEngine';
import type { Character, NarrativeEntry, Language, Archetype, Origin, UIState, DialogueState, Difficulty } from '../engine/types';
import { createCharacter } from '../engine/character';
import {
  deleteSave, hasCheckpoint, loadCheckpoint, loadGame, saveCheckpoint, saveGame,
} from '../lib/persistence';
import { audioManager } from '../audio/audioManager';
import { callDM, NARRATION_MAX_CHARS } from '../ai/dmClient';
import { getChapterByIndex } from '../data/chapters';

export type GameScreen = 'menu' | 'language' | 'character_creation' | 'game';

export function useGame() {
  const engineRef = useRef<GameEngine | null>(null);
  const solvedPuzzleCountRef = useRef(0);
  const combatWasActiveRef = useRef(false);
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [language, setLanguageState] = useState<Language>('en');
  const [narrative, setNarrative] = useState<NarrativeEntry[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<DialogueState | null>(null);
  const [lastRawInput, setLastRawInput] = useState<string>('');
  const [stateVersion, setStateVersion] = useState(0);
  const [uiState, setUiState] = useState<UIState>({
    showInventory: false,
    showCharacterSheet: false,
    showQuestLog: false,
    showSettings: false,
    showDebug: false,
    textSpeed: 'fast',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
  });

  useEffect(() => {
    const handleInteraction = () => {
      audioManager.init();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new GameEngine();
    }
    return engineRef.current;
  }, []);

  const selectLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    const engine = getEngine();
    engine.setLanguage(lang);
    audioManager.play('menu_select');
    setScreen('character_creation');
  }, [getEngine]);

  const startGame = useCallback((name: string, archetype: Archetype, origin: Origin, difficulty: Difficulty) => {
    const engine = getEngine();
    const character = createCharacter(name, archetype, origin);
    engine.initGame(character, difficulty);
    setNarrative([...engine.getNarrative()]);
    saveGame(engine.getState(), engine.getNarrative(), language);
    saveCheckpoint(engine.getState(), engine.getNarrative(), language);
    audioManager.play('menu_select');
    audioManager.startAmbience('tavern');
    setStateVersion(version => version + 1);
    setScreen('game');
  }, [getEngine, language]);

  const continueGame = useCallback(() => {
    const saved = loadGame();
    if (!saved) return;
    const engine = getEngine();
    engine.restoreGame(saved.gameState, saved.narrative, saved.language);
    setLanguageState(saved.language);
    setNarrative([...saved.narrative]);
    setActiveDialogue(saved.gameState.activeDialogue);
    setStateVersion(version => version + 1);
    setScreen('game');
  }, [getEngine]);

  /**
   * Rolls back to the last checkpoint, which is only ever written at safe
   * moments, so the hero always comes back alive.
   */
  const retryFromCheckpoint = useCallback(() => {
    const saved = loadCheckpoint();
    if (!saved) return;
    const engine = getEngine();
    engine.restoreGame(saved.gameState, saved.narrative, saved.language);
    setLanguageState(saved.language);
    setNarrative([...saved.narrative]);
    setActiveDialogue(saved.gameState.activeDialogue);
    audioManager.play('menu_select');
    setStateVersion(version => version + 1);
    setScreen('game');
  }, [getEngine]);

  /** Loads the next reviewed chapter from the authored campaign registry. */
  const advanceChapter = useCallback(() => {
    const engine = getEngine();
    const hero = engine.getState().party[0];
    if (!hero || !engine.canAdvanceChapter()) return;
    const nextIndex = (engine.getChapter()?.index ?? 0) + 1;
    const nextChapter = getChapterByIndex(nextIndex);
    if (!nextChapter) return;
    engine.appendChapter(nextChapter);
    setNarrative([...engine.getNarrative()]);
    setActiveDialogue(null);
    saveGame(engine.getState(), engine.getNarrative(), language);
    saveCheckpoint(engine.getState(), engine.getNarrative(), language);
    audioManager.play('menu_select');
    setStateVersion(version => version + 1);
  }, [getEngine, language]);

  const abandonRun = useCallback(() => {
    setActiveDialogue(null);
    setNarrative([]);
    engineRef.current = null;
    setScreen('menu');
  }, []);

  const startNewCampaign = useCallback(() => {
    deleteSave();
    abandonRun();
  }, [abandonRun]);

  const processInput = useCallback(async (input: string) => {
    const engine = getEngine();
    const isStoryChoice = input.startsWith('__story__:');
    setIsTyping(true);
    setLastRawInput(input);
    audioManager.play('ui_click');

    // Checkpoint BEFORE resolving the input, while the hero is still out of a
    // fight. Writing it after combat had already started froze the player inside
    // the battle at whatever health they walked in with: retrying restored them
    // mid-fight at 2 HP with no potions, dying again every time, with no way to
    // retreat, heal or take another route. The last safe moment is the one worth
    // returning to.
    const preInput = engine.getState();
    if (!preInput.combat && preInput.status === 'playing') {
      saveCheckpoint(preInput, engine.getNarrative(), language);
    }

    // Add player action to display
    const playerAction: NarrativeEntry = {
      id: `player_${Date.now()}`,
      type: 'action',
      content: engine.getPlayerFacingInput(input),
      timestamp: Date.now(),
    };

    // Process action - get results WITHOUT adding to engine narrative
    const results = engine.processInputRaw(input);

    // Try LLM narration for narration-type results
    const hasNarrative = results.some(r => r.type === 'narration');
    let finalResults = results;

    if (hasNarrative && !isStoryChoice) {
      try {
        const state = engine.getState();
        const location = engine.getLocation();
        const npcs = engine.getNPCs();
        const resultSummary = results.map(r => r.content).join('\n');

        const dmText = await callDM({
          gameState: state,
          location,
          npcs,
          playerAction: input,
          actionResult: resultSummary,
          language,
          combatActive: !!state.combat,
        });

        if (dmText && dmText.length > 10) {
          // Replace narration entries with DM text. The DM is asked to write
          // under NARRATION_MAX_CHARS, so a compliant response renders whole.
          // This is only a safety net for a model that over-runs: a rescue on a
          // sentence boundary (never a hard slice that cuts mid-word).
          finalResults = results.map(r =>
            r.type === 'narration' ? { ...r, content: trimAtSentence(dmText, NARRATION_MAX_CHARS) } : r
          );
        }
      } catch (err) {
        console.warn('DM failed:', err);
      }
    }

    // Add all results to engine narrative
    for (const entry of finalResults) {
      engine.addNarrativeEntry(entry);
    }

    // Update display
    setNarrative([playerAction, ...engine.getNarrative()]);
    setActiveDialogue(engine.getActiveDialogue());
    setIsTyping(false);

    // Auto-save. A story decision, a solved puzzle or the moment before a fight
    // are the points worth being able to come back to.
    const state = engine.getState();
    // Checkpoint on the way into a fight AND on the way out of one: without the
    // second, dying later rewound the player past a battle they had already won
    // and stripped the level they earned for it.
    const combatJustEnded = combatWasActiveRef.current && !state.combat && state.status === 'playing';
    const worthCheckpoint = isStoryChoice
      || state.worldState.solvedPuzzles.length !== solvedPuzzleCountRef.current
      || combatJustEnded;
    solvedPuzzleCountRef.current = state.worldState.solvedPuzzles.length;
    combatWasActiveRef.current = !!state.combat;

    if (worthCheckpoint || state.eventLog.length % 10 === 0) {
      saveGame(state, engine.getNarrative(), language);
    }
    if (worthCheckpoint) {
      saveCheckpoint(state, engine.getNarrative(), language);
    }
    setStateVersion(version => version + 1);
  }, [getEngine, language]);

  const handleDialogueResponse = useCallback(async (responseIndex: number) => {
    const engine = getEngine();
    setIsTyping(true);
    audioManager.play('ui_click');

    const results = engine.processDialogueResponseRaw(responseIndex);

    // Dialogue nodes and response buttons form one authored conversation tree.
    // Keep them together so generated prose cannot contradict the next choices.
    for (const entry of results) {
      engine.addNarrativeEntry(entry);
    }

    setNarrative([...engine.getNarrative()]);
    setActiveDialogue(engine.getActiveDialogue());
    setIsTyping(false);
    setStateVersion(version => version + 1);
  }, [getEngine]);

  const getCharacter = useCallback((): Character | null => {
    return getEngine().getState().party[0] || null;
  }, [getEngine]);

  const getLocation = useCallback(() => {
    return getEngine().getLocation();
  }, [getEngine]);

  const getNPCs = useCallback(() => {
    return getEngine().getNPCs();
  }, [getEngine]);

  const getCombat = useCallback(() => {
    return getEngine().getCombat();
  }, [getEngine]);

  const getState = useCallback(() => {
    return getEngine().getState();
  }, [getEngine]);

  const getChapter = useCallback(() => {
    return getEngine().getChapter();
  }, [getEngine]);

  const getPuzzleView = useCallback(() => {
    return getEngine().getPuzzleView();
  }, [getEngine]);

  const getChronicle = useCallback(() => {
    return getEngine().getChronicle();
  }, [getEngine]);

  const checkpointAvailable = useCallback(() => {
    return typeof window !== 'undefined' && hasCheckpoint();
  }, []);

  const toggleUI = useCallback((panel: keyof UIState) => {
    setUiState(prev => ({ ...prev, [panel]: !prev[panel] }));
    audioManager.play('ui_click');
  }, []);

  const manualSave = useCallback(() => {
    const engine = getEngine();
    saveGame(engine.getState(), engine.getNarrative(), language);
    audioManager.play('item_pickup');
  }, [getEngine, language]);

  return {
    screen,
    language,
    narrative,
    isTyping,
    activeDialogue,
    uiState,
    lastRawInput,
    stateVersion,
    selectLanguage,
    startGame,
    continueGame,
    retryFromCheckpoint,
    advanceChapter,
    abandonRun,
    startNewCampaign,
    processInput,
    handleDialogueResponse,
    getCharacter,
    getLocation,
    getNPCs,
    getCombat,
    getState,
    getChapter,
    getPuzzleView,
    getChronicle,
    checkpointAvailable,
    toggleUI,
    setScreen,
    manualSave,
  };
}

/**
 * Truncates narration at a sentence boundary instead of a raw character
 * count, so prose never ends mid-word (the previous slice(0,400) cut phrases
 * like "…como si guardar"). Stops at the last sentence terminator before the
 * limit; prefers not to chop a long dialogue mid-speech.
 */
function trimAtSentence(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const enders = ['. ', '! ', '? ', '».', '».', '“', '.\n'];
  let cut = -1;
  for (const token of enders) {
    const idx = text.lastIndexOf(token, maxLength);
    if (idx > cut) cut = idx;
  }
  if (cut > 0) return text.slice(0, cut + (text[cut + 1] === ' ' ? 1 : 0)).trimEnd();
  // No sentence boundary found: fall back to the last space so we never cut a
  // word, even if the source lacks punctuation.
  const space = text.lastIndexOf(' ', maxLength);
  return space > 0 ? text.slice(0, space).trimEnd() : text.slice(0, maxLength).trimEnd();
}
