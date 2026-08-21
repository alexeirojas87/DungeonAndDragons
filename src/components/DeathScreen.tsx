// ============================================================
// DEATH SCREEN - The run is over
// The save is deliberately kept: dying costs the fight, not the
// campaign. Retry reloads the last safe checkpoint.
// ============================================================

'use client';

import type { ChapterSummary } from '../engine/chapter';
import type { Character, Language } from '../engine/types';

interface DeathScreenProps {
  language: Language;
  character: Character | null;
  chronicle: ChapterSummary[];
  /** Puzzles solved in the chapter the hero died in — not yet in the chronicle. */
  puzzlesSolvedThisChapter: number;
  chapterTitle: string;
  hasCheckpoint: boolean;
  onRetry: () => void;
  onMainMenu: () => void;
}

export function DeathScreen({
  language,
  character,
  chronicle,
  puzzlesSolvedThisChapter,
  chapterTitle,
  hasCheckpoint,
  onRetry,
  onMainMenu,
}: DeathScreenProps) {
  const es = language === 'es';
  // The chronicle only records finished chapters, so a puzzle solved in the run
  // that killed you would otherwise be reported as zero.
  const puzzlesSolved =
    chronicle.reduce((total, entry) => total + entry.puzzlesSolved.length, 0)
    + puzzlesSolvedThisChapter;

  return (
<div className="fixed inset-0 z-[70] flex overflow-y-auto bg-black/90 px-4 py-4">
    <div className="relative m-auto w-full max-w-xl rounded border border-[var(--color-accent-crimson)]/50 bg-[var(--color-bg-panel)] p-5 md:p-7">
        <div className="font-[var(--font-mono)] text-[13px] uppercase tracking-[0.3em] text-[var(--color-accent-crimson)]">
          {es ? 'Has muerto' : 'You have died'}
        </div>
        <h2 className="mt-2 font-[var(--font-display)] text-[22px] md:text-[26px] text-[var(--color-text-primary)]">
          {character?.name ?? (es ? 'Tu héroe' : 'Your hero')}
        </h2>
        <p className="mt-2 font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)]">
          {es ? 'Cayó durante' : 'Fell during'} {chapterTitle}
        </p>

        <div className="mt-5 border-t border-[var(--color-border)] pt-4">
          <div className="font-[var(--font-mono)] text-[13px] uppercase tracking-widest text-[var(--color-accent-gold)]">
            {es ? 'Crónica de la campaña' : 'Campaign chronicle'}
          </div>
          {chronicle.length === 0 ? (
            <p className="mt-2 font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)]">
              {es ? 'Ningún capítulo llegó a su final.' : 'No chapter reached its ending.'}
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {chronicle.map(entry => (
                <li key={entry.chapterId} className="font-[var(--font-mono)] text-[14px]">
                  <span className="text-[var(--color-text-dim)]">
                    {es ? 'Cap.' : 'Ch.'} {entry.index} —{' '}
                  </span>
                  <span className="text-[var(--color-text-primary)]">
                    {es ? entry.titleEs : entry.title}
                  </span>
                  <span className="text-[var(--color-text-dim)]">
                    {' '}· {es ? entry.endingTitleEs : entry.endingTitle}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 font-[var(--font-mono)] text-[13px] text-[var(--color-text-dim)]">
            {es
              ? `Capítulos completados: ${chronicle.length} · Enigmas resueltos: ${puzzlesSolved} · Nivel alcanzado: ${character?.level ?? 1}`
              : `Chapters completed: ${chronicle.length} · Puzzles solved: ${puzzlesSolved} · Level reached: ${character?.level ?? 1}`}
          </p>
        </div>

        <p className="mt-5 font-[var(--font-mono)] text-[14px] text-[var(--color-text-secondary)]">
          {hasCheckpoint
            ? es
              ? 'Tu partida sigue guardada. Reintentar te devuelve al último punto seguro.'
              : 'Your save is still there. Retry returns you to the last safe point.'
            : es
              ? 'No hay punto de control disponible; puedes volver al menú y empezar de nuevo.'
              : 'No checkpoint is available; return to the menu to start again.'}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {hasCheckpoint && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded border border-[var(--color-accent-gold)] text-[var(--color-accent-gold)] font-[var(--font-mono)] text-[14px] uppercase tracking-widest hover:bg-[var(--color-accent-gold)]/10 transition-colors"
            >
              {es ? 'Reintentar' : 'Retry'}
            </button>
          )}
          <button
            onClick={onMainMenu}
            className="px-4 py-2 rounded border border-[var(--color-border)] text-[var(--color-text-dim)] font-[var(--font-mono)] text-[14px] uppercase tracking-widest hover:text-[var(--color-text-primary)] transition-colors"
          >
            {es ? 'Menú principal' : 'Main menu'}
          </button>
        </div>
      </div>
    </div>
  );
}
