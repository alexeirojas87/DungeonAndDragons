// ============================================================
// GAME SCREEN - Main game layout
// ============================================================

'use client';

import { useEffect } from 'react';
import { Terminal } from './Terminal';
import { CharacterPanel } from './CharacterPanel';
import { InputBar } from './InputBar';
import { CombatView } from './CombatView';
import { DebugPanel } from './DebugPanel';
import { ChapterTransition } from './ChapterTransition';
import { DeathScreen } from './DeathScreen';
import { InventoryPanel, QuestLogPanel } from './InventoryPanel';
import { getSuggestedActions } from '../engine/intent';
import type { Chapter, ChapterSummary } from '../engine/chapter';
import type { PuzzleView } from './InputBar';
import type { Language, UIState, GameState, Character, WorldLocation, NPC, CombatEncounter, NarrativeEntry } from '../engine/types';

interface GameScreenProps {
  language: Language;
  narrative: NarrativeEntry[];
  isTyping: boolean;
  uiState: UIState;
  character: Character | null;
  location: WorldLocation | null;
  npcs: NPC[];
  combat: CombatEncounter | null;
  gameState: GameState | null;
  chapter: Chapter | null;
  puzzleView: PuzzleView | null;
  chronicle: ChapterSummary[];
  isGeneratingChapter: boolean;
  hasCheckpoint: boolean;
  chapterError: { message: string; issues: string[] } | null;
  lastRawInput: string;
  onProcessInput: (input: string) => void;
  onDialogueResponse: (responseIndex: number) => void;
  onToggleUI: (panel: keyof UIState) => void;
  onAdvanceChapter: () => void;
  onRetryFromCheckpoint: () => void;
  onMainMenu: () => void;
}

export function GameScreen({
  language,
  narrative,
  isTyping,
  uiState,
  character,
  location,
  npcs,
  combat,
  gameState,
  chapter,
  puzzleView,
  chronicle,
  isGeneratingChapter,
  hasCheckpoint,
  chapterError,
  lastRawInput,
  onProcessInput,
  onDialogueResponse,
  onToggleUI,
  onAdvanceChapter,
  onRetryFromCheckpoint,
  onMainMenu,
}: GameScreenProps) {
  // GameEngine mutates its state object intentionally. Derive choices on every
  // render so a story transition cannot leave stale buttons from the prior node.
  const suggestions = getSuggestedActions({
    locationId: location?.id || '',
    hasCombat: !!combat,
    chapter,
    story: gameState?.activeDialogue ? undefined : gameState?.story,
    flags: gameState?.flags,
    hero: character ?? undefined,
    activePuzzle: puzzleView?.puzzle ?? null,
    status: gameState?.status,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        onToggleUI('showDebug');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onToggleUI]);

  const locationName = location?.name || 'Unknown';
  const locationNameEs = location?.nameEs || 'Desconocido';

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[var(--color-bg-primary)] overflow-hidden noise-overlay scanlines vignette">
      {/* Character Panel - Desktop */}
      <div className="hidden md:block w-72 lg:w-80 flex-shrink-0">
        <CharacterPanel
          character={character}
          language={language}
          locationName={locationName}
          locationNameEs={locationNameEs}
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Location Header - Compact on mobile */}
        <div className="px-3 py-1.5 md:px-4 md:py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-panel)] flex items-center justify-between safe-area-top">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)] flex-shrink-0" />
            <h2 className="font-[var(--font-mono)] text-[13px] md:text-[14px] text-[var(--color-accent-green)] uppercase tracking-widest truncate">
              {language === 'es' ? locationNameEs : locationName}
            </h2>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onToggleUI('showCharacterSheet')}
              className="md:hidden p-2 rounded border border-[var(--color-border)] text-[var(--color-text-dim)] active:text-[var(--color-accent-gold)] active:border-[var(--color-accent-gold)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button
              onClick={() => onToggleUI('showInventory')}
              className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-dim)] active:text-[var(--color-accent-gold)] active:border-[var(--color-accent-gold)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </button>
            <button
              onClick={() => onToggleUI('showQuestLog')}
              className="hidden md:block p-2 rounded border border-[var(--color-border)] text-[var(--color-text-dim)] active:text-[var(--color-accent-gold)] active:border-[var(--color-accent-gold)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
            <button
              onClick={() => onToggleUI('showDebug')}
              className="p-2 rounded border border-green-800/50 text-green-700 hover:text-green-400 hover:border-green-500 transition-colors"
              title="Debug Panel (Ctrl+Shift+D)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Combat View */}
        {combat && character && (
          <CombatView
            encounter={combat}
            language={language}
            currentPlayerId={character.id}
          />
        )}

        {/* Terminal */}
        <Terminal
          narrative={narrative}
          language={language}
          isTyping={isTyping}
          onDialogueResponse={onDialogueResponse}
        />

        {/* Input Bar */}
        <InputBar
          onSubmit={onProcessInput}
          language={language}
          // Once the run is over the terminal sits behind a full-screen overlay,
          // so a refusal message printed into it is invisible. Lock the input
          // instead of silently swallowing what the player types.
          isTyping={isTyping || (!!gameState && gameState.status !== 'playing')}
          suggestions={suggestions}
          puzzleView={puzzleView}
        />
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 mobile-bottom-bar mobile-input-wrapper">
        <div className="flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-bg-panel)] px-2 py-1">
          <MobileActionBarBtn
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
            label={language === 'es' ? 'Mirar' : 'Look'}
            onClick={() => onProcessInput('look around')}
          />
          <MobileActionBarBtn
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
            label={language === 'es' ? 'Buscar' : 'Search'}
            onClick={() => onProcessInput('search')}
          />
          <MobileActionBarBtn
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            label={language === 'es' ? 'Inventario' : 'Inventory'}
            onClick={() => onToggleUI('showInventory')}
          />
          <MobileActionBarBtn
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            label={language === 'es' ? 'Misiones' : 'Quests'}
            onClick={() => onToggleUI('showQuestLog')}
          />
        </div>
      </div>

      {/* Mobile Character Sheet Overlay - Slide-in from left */}
      {uiState.showCharacterSheet && character && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 overlay-backdrop"
            onClick={() => onToggleUI('showCharacterSheet')}
          />
          <div className="absolute inset-y-0 left-0 w-72 character-panel-slide-in flex flex-col">
            {/* Close button */}
            <button
              onClick={() => onToggleUI('showCharacterSheet')}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-dim)] active:text-[var(--color-accent-gold)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex-1 overflow-y-auto">
              <CharacterPanel
                character={character}
                language={language}
                locationName={locationName}
                locationNameEs={locationNameEs}
              />
            </div>
          </div>
        </div>
      )}

      {/* Inventory and quests — what the header buttons actually open */}
      {uiState.showInventory && (
        <InventoryPanel
          language={language}
          character={character}
          onClose={() => onToggleUI('showInventory')}
        />
      )}
      {uiState.showQuestLog && (
        <QuestLogPanel
          language={language}
          quests={gameState?.quests ?? []}
          onClose={() => onToggleUI('showQuestLog')}
        />
      )}

      {/* End of chapter: continue, loading, or a recoverable failure */}
      {gameState?.status === 'chapter_complete' && (
        <ChapterTransition
          language={language}
          summary={chronicle[chronicle.length - 1] ?? null}
          isGenerating={isGeneratingChapter}
          error={chapterError}
          onContinue={onAdvanceChapter}
          onMainMenu={onMainMenu}
        />
      )}

      {/* Death: the run stops, the save does not */}
      {gameState?.status === 'dead' && (
        <DeathScreen
          language={language}
          character={character}
          chronicle={chronicle}
          puzzlesSolvedThisChapter={
            (gameState?.worldState.solvedPuzzles ?? []).filter(id => chapter?.puzzles[id]).length
          }
          chapterTitle={(language === 'es' ? chapter?.titleEs : chapter?.title) ?? ''}
          hasCheckpoint={hasCheckpoint}
          onRetry={onRetryFromCheckpoint}
          onMainMenu={onMainMenu}
        />
      )}

      {/* Debug Panel */}
      <DebugPanel
        isOpen={uiState.showDebug}
        onClose={() => onToggleUI('showDebug')}
        character={character}
        location={location}
        npcs={npcs}
        combat={combat}
        gameState={gameState}
        language={language}
        lastRawInput={lastRawInput}
      />
    </div>
  );
}

function MobileActionBarBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded text-[var(--color-text-dim)] active:text-[var(--color-accent-gold)] active:bg-[var(--color-bg-tertiary)] transition-colors min-w-[60px]"
    >
      {icon}
      <span className="font-[var(--font-mono)] text-[13px] uppercase tracking-wider">{label}</span>
    </button>
  );
}
