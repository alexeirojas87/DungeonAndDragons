// ============================================================
// GAME SCREEN - Main game layout
// ============================================================

'use client';

import { useEffect } from 'react';
import { Terminal } from './Terminal';
import { CharacterPanel } from './CharacterPanel';
import { InputBar } from './InputBar';
import { CombatView } from './CombatView';
import { AdventureScene } from './AdventureScene';
import { DebugPanel } from './DebugPanel';
import { ChapterTransition } from './ChapterTransition';
import { DeathScreen } from './DeathScreen';
import { InventoryPanel, QuestLogPanel } from './InventoryPanel';
import { getSuggestedActions } from '../engine/intent';
import { resolveCharacter, resolveIcon } from '../assets/registry';
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
    <div className="h-[100dvh] flex flex-col md:flex-row bg-[var(--color-bg-primary)] overflow-hidden noise-overlay scanlines vignette">
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
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Location Header - Compact on mobile */}
        <div className="px-3 py-1.5 md:px-4 md:py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-panel)] flex items-center justify-between safe-area-top flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)] flex-shrink-0" />
            <h2 className="font-[var(--font-mono)] text-[13px] md:text-[14px] text-[var(--color-accent-green)] uppercase tracking-widest truncate">
              {language === 'es' ? locationNameEs : locationName}
            </h2>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <HeaderBtn
              icon="icon-character"
              label={language === 'es' ? 'Personaje' : 'Character'}
              onClick={() => onToggleUI('showCharacterSheet')}
              mobileOnly
            />
            <HeaderBtn
              icon="icon-inventory"
              label={language === 'es' ? 'Inventario' : 'Inventory'}
              onClick={() => onToggleUI('showInventory')}
            />
            <HeaderBtn
              icon="icon-quest"
              label={language === 'es' ? 'Misiones' : 'Quests'}
              onClick={() => onToggleUI('showQuestLog')}
              desktopOnly
            />
            <button
              onClick={() => onToggleUI('showDebug')}
              className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-accent-gold)] hover:border-[var(--color-accent-gold)] transition-colors"
              title="Debug Panel (Ctrl+Shift+D)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Adventure Scene — composed illustrated world */}
        <AdventureScene
          location={location}
          chapterLocation={chapter?.locations?.[location?.id ?? ''] ?? null}
          npcs={npcs}
          combat={combat}
          language={language}
        />

        {/* Combat View */}
        {combat && character && (
          <CombatView
            encounter={combat}
            language={language}
            currentPlayerId={character.id}
            playerPortrait={resolveCharacter(character.portrait, character.archetype)}
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
            icon={<img src={resolveIcon('icon-map')} alt="" className="w-5 h-5" />}
            label={language === 'es' ? 'Mirar' : 'Look'}
            onClick={() => onProcessInput('look around')}
          />
          <MobileActionBarBtn
            icon={<img src={resolveIcon('icon-chest')} alt="" className="w-5 h-5" />}
            label={language === 'es' ? 'Buscar' : 'Search'}
            onClick={() => onProcessInput('search')}
          />
          <MobileActionBarBtn
            icon={<img src={resolveIcon('icon-inventory')} alt="" className="w-5 h-5" />}
            label={language === 'es' ? 'Inventario' : 'Inventory'}
            onClick={() => onToggleUI('showInventory')}
          />
          <MobileActionBarBtn
            icon={<img src={resolveIcon('icon-quest')} alt="" className="w-5 h-5" />}
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

function HeaderBtn({
  icon, label, onClick, mobileOnly = false, desktopOnly = false,
}: {
  icon: string; label: string; onClick: () => void;
  mobileOnly?: boolean; desktopOnly?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`p-2 rounded border border-[var(--color-border)] text-[var(--color-text-dim)] active:text-[var(--color-accent-gold)] active:border-[var(--color-accent-gold)] hover:text-[var(--color-accent-gold)] hover:border-[var(--color-accent-gold)] transition-colors ${
        mobileOnly ? 'md:hidden' : desktopOnly ? 'hidden md:block' : ''
      }`}
    >
      <img src={resolveIcon(icon)} alt={label} className="w-5 h-5" draggable={false} />
    </button>
  );
}
