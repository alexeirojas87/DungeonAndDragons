'use client';

import type { ChapterSummary } from '../engine/chapter';
import type { Language } from '../engine/types';

interface ChapterTransitionProps {
  language: Language;
  summary: ChapterSummary | null;
  onContinue: () => void;
  onMainMenu: () => void;
}

export function ChapterTransition({ language, summary, onContinue, onMainMenu }: ChapterTransitionProps) {
  const es = language === 'es';
  const campaignComplete = (summary?.index ?? 0) >= 10;
  const chapterIndex = summary?.index ?? 1;
  const act = chapterIndex <= 3 ? 1 : chapterIndex <= 7 ? 2 : 3;

  return (
    <div className="fixed inset-0 z-[60] flex overflow-y-auto bg-black/85 px-4 py-4">
      <div className="relative m-auto w-full max-w-xl overflow-hidden rounded border border-[var(--color-border)] bg-[var(--color-bg-panel)] p-5 md:p-7">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20 saturate-75"
          style={{ backgroundImage: `url(/authored-campaign/act-${act}.png)` }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--color-bg-panel)_5%,rgba(15,17,19,.80)_55%,var(--color-bg-panel))]" aria-hidden />
        <div className="relative">
        <div className="font-[var(--font-mono)] text-[13px] uppercase tracking-[0.3em] text-[var(--color-accent-gold)]">
          {campaignComplete
            ? (es ? 'La crónica está completa' : 'The chronicle is complete')
            : (es ? `Fin del capítulo ${summary?.index ?? ''}` : `End of chapter ${summary?.index ?? ''}`)}
        </div>
        <h2 className="mt-2 font-[var(--font-display)] text-[22px] text-[var(--color-text-primary)] md:text-[26px]">
          {es ? summary?.endingTitleEs : summary?.endingTitle}
        </h2>
        <p className="mt-3 font-[var(--font-mono)] text-[15px] text-[var(--color-text-secondary)]">
          {es ? summary?.titleEs : summary?.title}
        </p>

        {summary && (
          <dl className="mt-4 grid grid-cols-2 gap-2 font-[var(--font-mono)] text-[13px]">
            <SummaryRow label={es ? 'Desenlace' : 'Outcome'} value={outcomeLabel(summary.outcome, es)} />
            {summary.route && <SummaryRow label={es ? 'Ruta' : 'Route'} value={summary.route} />}
            <SummaryRow label={es ? 'Enigmas resueltos' : 'Puzzles solved'} value={String(summary.puzzlesSolved.length)} />
            <SummaryRow label={es ? 'Hechos registrados' : 'Facts recorded'} value={String(summary.keyFlags.length)} />
          </dl>
        )}

        <p className="mt-5 font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)]">
          {campaignComplete
            ? (es
                ? 'Este final pertenece a todas las decisiones que trajiste hasta la Décima Puerta.'
                : 'This ending belongs to every decision you carried to the Tenth Door.')
            : (es
                ? 'Tu siguiente capítulo ya está escrito; abrirlo no necesita conexión ni espera.'
                : 'Your next chapter is already written; opening it needs no connection or wait.')}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {!campaignComplete && (
            <ActionButton primary onClick={onContinue}>
              {es ? 'Abrir el capítulo siguiente' : 'Open the next chapter'}
            </ActionButton>
          )}
          <ActionButton onClick={onMainMenu}>{es ? 'Menú principal' : 'Main menu'}</ActionButton>
        </div>
        </div>
      </div>
    </div>
  );
}

function outcomeLabel(outcome: ChapterSummary['outcome'], es: boolean): string {
  if (outcome === 'success') return es ? 'Victoria' : 'Success';
  if (outcome === 'failure') return es ? 'Fracaso' : 'Failure';
  return es ? 'Ambiguo' : 'Ambiguous';
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="uppercase tracking-wider text-[var(--color-text-dim)]">{label}</dt>
      <dd className="text-[var(--color-text-primary)]">{value}</dd>
    </div>
  );
}

function ActionButton({ children, onClick, primary = false }: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded border px-4 py-2 font-[var(--font-mono)] text-[14px] uppercase tracking-widest transition-colors ${
        primary
          ? 'border-[var(--color-accent-gold)] text-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold)]/10'
          : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}
