// ============================================================
// MAIN PAGE - Root page component
// ============================================================

'use client';

import { useGame } from '../hooks/useGame';
import { MainMenu } from '../components/MainMenu';
import { CharacterCreation } from '../components/CharacterCreation';
import { GameScreen } from '../components/GameScreen';

export default function Home() {
  const {
    screen,
    language,
    narrative,
    isTyping,
    uiState,
    lastRawInput,
    isGeneratingChapter,
    chapterError,
    selectLanguage,
    startGame,
    continueGame,
    retryFromCheckpoint,
    advanceChapter,
    abandonRun,
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
  } = useGame();

  if (screen === 'menu') {
    return <MainMenu onSelectLanguage={selectLanguage} onContinue={continueGame} />;
  }

  if (screen === 'character_creation') {
    return (
      <CharacterCreation
        language={language}
        onComplete={(name, archetype, origin) => startGame(name, archetype, origin)}
      />
    );
  }

  return (
    <GameScreen
      language={language}
      narrative={narrative}
      isTyping={isTyping}
      uiState={uiState}
      character={getCharacter()}
      location={getLocation() ?? null}
      npcs={getNPCs()}
      combat={getCombat()}
      gameState={getState()}
      chapter={getChapter()}
      puzzleView={getPuzzleView()}
      chronicle={getChronicle()}
      isGeneratingChapter={isGeneratingChapter}
      hasCheckpoint={checkpointAvailable()}
      chapterError={chapterError}
      lastRawInput={lastRawInput}
      onProcessInput={processInput}
      onDialogueResponse={handleDialogueResponse}
      onToggleUI={toggleUI}
      onAdvanceChapter={advanceChapter}
      onRetryFromCheckpoint={retryFromCheckpoint}
      onMainMenu={abandonRun}
    />
  );
}
