// ============================================================
// CHAPTER TRANSITION - End of chapter, loading, and failure
// Generation takes real time, so the overlay has to be worth
// looking at; failure has to be recoverable without losing the run.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import type { ChapterSummary } from '../engine/chapter';
import type { Language } from '../engine/types';

const LOADING_LINES: Array<{ en: string; es: string }> = [
  { en: 'The chronicle is being written…', es: 'Se está escribiendo la crónica…' },
  { en: 'Counting what your choices cost.', es: 'Contando lo que costaron tus decisiones.' },
  { en: 'Somewhere, a door remembers your name.', es: 'En algún lugar, una puerta recuerda tu nombre.' },
  { en: 'Drawing the roads out of Blackmere.', es: 'Trazando los caminos que salen de Blackmere.' },
  { en: 'Laying three locks and hiding three keys.', es: 'Colocando tres cerraduras y escondiendo tres llaves.' },
  { en: 'Waking something that had settled.', es: 'Despertando algo que ya se había asentado.' },
  { en: 'Checking every path leads somewhere.', es: 'Comprobando que todo camino lleve a alguna parte.' },
];

interface ChapterTransitionProps {
  language: Language;
  summary: ChapterSummary | null;
  isGenerating: boolean;
  error: { message: string; issues: string[] } | null;
  onContinue: () => void;
  onMainMenu: () => void;
}

export function ChapterTransition({
  language,
  summary,
  isGenerating,
  error,
  onContinue,
  onMainMenu,
}: ChapterTransitionProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const es = language === 'es';

  useEffect(() => {
    if (!isGenerating) return;
    const startedAt = Date.now();
    const lines = setInterval(() => {
      setLineIndex(index => (index + 1) % LOADING_LINES.length);
    }, 3500);
    // Generation runs for minutes; a visible clock is the difference between
    // "it is working" and "it has hung". Derived from the start time rather
    // than counted up, so it stays honest if the tab is backgrounded.
    const clock = setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => {
      clearInterval(lines);
      clearInterval(clock);
    };
  }, [isGenerating]);

  return (
<div className="fixed inset-0 z-[60] flex overflow-y-auto bg-black/85 px-4 py-4">
    <div className="relative m-auto w-full max-w-xl rounded border border-[var(--color-border)] bg-[var(--color-bg-panel)] p-5 md:p-7">
        {isGenerating ? (
          <div className="text-center">
            <div className="font-[var(--font-mono)] text-[13px] uppercase tracking-[0.3em] text-[var(--color-accent-gold)]">
              {es ? 'Generando el capítulo siguiente' : 'Generating the next chapter'}
            </div>
            <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
              {[0, 1, 2].map(dot => (
                <span
                  key={dot}
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-gold)] animate-pulse"
                  style={{ animationDelay: `${dot * 0.25}s` }}
                />
              ))}
            </div>
            <p className="mt-5 font-[var(--font-mono)] text-[15px] text-[var(--color-text-secondary)] min-h-[3rem]">
              {es ? LOADING_LINES[lineIndex].es : LOADING_LINES[lineIndex].en}
            </p>
            <p className="mt-3 font-[var(--font-mono)] text-[13px] text-[var(--color-text-dim)]">
              {es
                ? 'Suele tardar entre 3 y 8 minutos: el capítulo se escribe entero y se valida antes de dártelo.'
                : 'This usually takes 3 to 8 minutes: the chapter is written in full and validated before you get it.'}
            </p>
            <p className="mt-2 font-[var(--font-mono)] text-[13px] text-[var(--color-text-dim)] tabular-nums">
              {formatElapsed(elapsed)}
            </p>
          </div>
        ) : error ? (
          <div>
            <div className="font-[var(--font-mono)] text-[13px] uppercase tracking-[0.3em] text-[var(--color-accent-crimson)]">
              {es ? 'No se pudo generar el capítulo' : 'The chapter could not be generated'}
            </div>
            <p className="mt-3 font-[var(--font-mono)] text-[15px] text-[var(--color-text-secondary)]">
              {es
                ? 'Tu partida está intacta. Puedes reintentar: cada intento parte de cero y suele bastar con uno más.'
                : 'Your save is intact. You can retry: each attempt starts fresh and one more is usually enough.'}
            </p>
            <p className="mt-2 font-[var(--font-mono)] text-[13px] text-[var(--color-text-dim)] break-words">
              {error.message}
            </p>
            {error.issues.length > 0 && (
              <ul className="mt-2 max-h-32 overflow-y-auto space-y-0.5">
                {error.issues.slice(0, 6).map((issue, index) => (
                  <li key={index} className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-dim)]">
                    · {issue}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              <ActionButton primary onClick={onContinue}>
                {es ? 'Reintentar' : 'Retry'}
              </ActionButton>
              <ActionButton onClick={onMainMenu}>
                {es ? 'Menú principal' : 'Main menu'}
              </ActionButton>
            </div>
          </div>
        ) : (
          <div>
            <div className="font-[var(--font-mono)] text-[13px] uppercase tracking-[0.3em] text-[var(--color-accent-gold)]">
              {es ? `Fin del capítulo ${summary?.index ?? ''}` : `End of chapter ${summary?.index ?? ''}`}
            </div>
            <h2 className="mt-2 font-[var(--font-display)] text-[22px] md:text-[26px] text-[var(--color-text-primary)]">
              {es ? summary?.endingTitleEs : summary?.endingTitle}
            </h2>
            <p className="mt-3 font-[var(--font-mono)] text-[15px] text-[var(--color-text-secondary)]">
              {es ? summary?.titleEs : summary?.title}
            </p>

            {summary && (
              <dl className="mt-4 grid grid-cols-2 gap-2 font-[var(--font-mono)] text-[13px]">
                <SummaryRow label={es ? 'Desenlace' : 'Outcome'} value={outcomeLabel(summary.outcome, es)} />
                {summary.route && (
                  <SummaryRow label={es ? 'Ruta' : 'Route'} value={summary.route} />
                )}
                <SummaryRow
                  label={es ? 'Enigmas resueltos' : 'Puzzles solved'}
                  value={String(summary.puzzlesSolved.length)}
                />
                <SummaryRow
                  label={es ? 'Hechos registrados' : 'Facts recorded'}
                  value={String(summary.keyFlags.length)}
                />
              </dl>
            )}

            <p className="mt-5 font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)]">
              {es
                ? 'El siguiente capítulo se escribirá a partir de este final.'
                : 'The next chapter will be written out of this ending.'}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <ActionButton primary onClick={onContinue}>
                {es ? 'Continuar' : 'Continue'}
              </ActionButton>
              <ActionButton onClick={onMainMenu}>
                {es ? 'Menú principal' : 'Main menu'}
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

function outcomeLabel(outcome: ChapterSummary['outcome'], es: boolean): string {
  if (outcome === 'success') return es ? 'Victoria' : 'Success';
  if (outcome === 'failure') return es ? 'Fracaso' : 'Failure';
  return es ? 'Ambiguo' : 'Ambiguous';
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--color-text-dim)] uppercase tracking-wider">{label}</dt>
      <dd className="text-[var(--color-text-primary)]">{value}</dd>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  primary = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded border font-[var(--font-mono)] text-[14px] uppercase tracking-widest transition-colors ${
        primary
          ? 'border-[var(--color-accent-gold)] text-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold)]/10'
          : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}
