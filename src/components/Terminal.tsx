// ============================================================
// TERMINAL - Main narrative display
// ============================================================

'use client';

import { useEffect, useRef } from 'react';
import type { NarrativeEntry, Language } from '../engine/types';

interface TerminalProps {
  narrative: NarrativeEntry[];
  language: Language;
  isTyping: boolean;
  onDialogueResponse: (responseIndex: number) => void;
}

export function Terminal({ narrative, language, isTyping, onDialogueResponse }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // The first narration of a chapter opens with a versal, the way a printed
  // adventure book does. Costs CSS, not vertical space.
  const firstNarrationId = narrative.find(e => e.type === 'narration')?.id;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [narrative]);

  return (
    <div className="relative h-full overflow-hidden crt-scanlines page-fade">
      <div
        ref={scrollRef}
        className="relative z-10 h-full overflow-y-auto px-4 py-4 md:px-7 md:py-7 terminal-scroll"
      >
        {narrative.map((entry) => (
          <NarrativeLine
            key={entry.id}
            entry={entry}
            language={language}
            isLatestDialogue={entry.id === narrative[narrative.length - 1]?.id && entry.type === 'dialogue'}
            isFirstNarration={entry.id === firstNarrationId}
            onDialogueResponse={onDialogueResponse}
          />
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 py-1 text-[var(--color-text-dim)]">
            <span className="font-[var(--font-mono)] text-sm">{'>'}</span>
            <span className="cursor-blink inline-block w-2 h-4 bg-[var(--color-accent-gold)]" />
          </div>
        )}
      </div>
    </div>
  );
}

function NarrativeLine({ entry, language, isLatestDialogue, isFirstNarration, onDialogueResponse }: { entry: NarrativeEntry; language: Language; isLatestDialogue: boolean; isFirstNarration: boolean; onDialogueResponse: (responseIndex: number) => void }) {
  const speaker = entry.type === 'dialogue'
    ? (language === 'es' ? entry.speakerEs : entry.speaker)
    : null;

  const moodColor = getMoodColor(entry.mood);

  const borderClass = entry.type === 'narration'
    ? 'border-l-2 border-[var(--color-accent-gold)]'
    : entry.type === 'system'
    ? 'border-l-2 border-[var(--color-accent-green)]'
    : entry.type === 'combat'
    ? 'border-l-2 border-[var(--color-accent-crimson)]'
    : entry.type === 'action'
    ? 'border-l-2 border-[var(--color-accent-gold)]'
    : '';

  const indentClass = entry.type === 'action' || entry.type === 'narration' || entry.type === 'system' || entry.type === 'combat'
    ? 'pl-4'
    : '';

  return (
    <div className={`mb-5 entry-enter ${borderClass} ${indentClass} ${entry.important && entry.type === 'narration' ? 'narrative-glow' : ''}`}>
      {entry.type === 'action' && (
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-[var(--font-mono)] text-[var(--color-accent-gold)] text-sm">{'>'}</span>
          <span className="font-[var(--font-mono)] text-[var(--color-text-secondary)] text-[15px] md:text-base italic">
            {entry.content}
          </span>
        </div>
      )}

      {entry.type === 'narration' && (
        <p
          className={`text-[var(--color-text-primary)] leading-[1.78] md:leading-[1.8] text-[19px] max-w-[62ch] ${isFirstNarration ? 'dropcap' : ''}`}
          style={{ color: moodColor || 'var(--color-text-primary)' }}
        >
          {entry.content}
        </p>
      )}

      {entry.type === 'dialogue' && (
        <div className="my-3 py-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-[var(--font-display)] text-[var(--color-accent-gold)] text-[15px] md:text-base tracking-wider uppercase">
              {speaker}
            </span>
            <span className="text-[var(--color-border-light)] text-sm">—</span>
          </div>
          <p className="text-[var(--color-text-primary)] leading-[1.78] text-[18px] md:text-[19px] italic pl-4 border-l border-[var(--color-accent-gold)] border-opacity-30" style={{ borderLeftColor: 'rgba(255, 218, 120, 0.8)' }}>
            &ldquo;{entry.content}&rdquo;
          </p>
          {isLatestDialogue && entry.dialogueResponses && entry.dialogueResponses.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 pl-4">
              {entry.dialogueResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => onDialogueResponse(index)}
                  className="px-3 py-1.5 text-[15px] font-[var(--font-mono)] rounded border border-[var(--color-accent-gold)] bg-[rgba(255,218,120,0.18)] text-[var(--color-accent-gold)] hover:bg-[rgba(255,218,120,0.28)] hover:border-[var(--color-accent-gold)] transition-colors cursor-pointer"
                >
                  {language === 'es' ? response.textEs : response.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {entry.type === 'system' && (
        <div className="font-[var(--font-mono)] text-sm text-[var(--color-accent-green)] py-2 px-3 bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)]">
          {entry.content.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {entry.type === 'combat' && (
        <div className="my-2 py-2 px-3 bg-[rgba(139,58,58,0.1)] border border-[var(--color-accent-crimson)] rounded">
          <p className="font-[var(--font-mono)] text-[15px] text-[var(--color-accent-crimson)] font-bold">
            {entry.content}
          </p>
        </div>
      )}

      {entry.type === 'dice' && (
        <div className="my-1 font-[var(--font-mono)] text-sm text-[var(--color-accent-amber)] flex items-center gap-1.5">
          <span className="text-[12px] opacity-80" title="d20">⬡</span>
          <span className="inline-block px-2 py-1 bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)]">
            {entry.content}
          </span>
        </div>
      )}

      {entry.important && entry.type === 'narration' && (
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent my-3" />
      )}
    </div>
  );
}

function getMoodColor(mood?: string): string | undefined {
  switch (mood) {
    case 'danger': return 'var(--color-accent-crimson)';
    case 'triumph': return 'var(--color-accent-gold)';
    case 'horror': return 'var(--color-accent-purple)';
    case 'mystery': return 'var(--color-accent-blue)';
    case 'humor': return 'var(--color-accent-green)';
    default: return undefined;
  }
}
