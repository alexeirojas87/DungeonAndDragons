// ============================================================
// INPUT BAR - Player input and suggestions
// ============================================================

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Language } from '../engine/types';
import type { BilingualText, Puzzle } from '../engine/puzzles';

export interface PuzzleView {
  puzzle: Puzzle;
  attempts: number;
  revealedHints: BilingualText[];
  progress: string[];
  effectiveDC?: number;
}

interface InputBarProps {
  onSubmit: (input: string) => void;
  language: Language;
  isTyping: boolean;
  suggestions?: Array<{ key: string; label: string; labelEs: string; action: string }>;
  puzzleView?: PuzzleView | null;
  className?: string;
}

export function InputBar({ onSubmit, language, isTyping, suggestions = [], puzzleView = null, className }: InputBarProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus();
    }
  }, [isTyping]);

  const handleSubmit = useCallback((value?: string) => {
    const text = (value || input).trim();
    if (!text || isTyping) return;
    onSubmit(text);
    setInput('');
  }, [input, isTyping, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    // Number key shortcuts
    if (!input && suggestions.length > 0) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= suggestions.length) {
        const suggestion = suggestions[num - 1];
        if (suggestion.action) {
          handleSubmit(suggestion.action);
        }
      }
    }
  }, [input, suggestions, handleSubmit]);

  const puzzle = puzzleView?.puzzle;
  const placeholder = puzzle
    ? puzzle.kind === 'riddle'
      ? (language === 'es' ? 'Escribe tu respuesta al enigma...' : 'Type your answer to the riddle...')
      : (language === 'es' ? 'Actúa sobre el enigma...' : 'Act on the puzzle...')
    : (language === 'es' ? 'Escribe tu acción...' : 'Type your action...');

  return (
    <div className={`border-t border-[var(--color-border)] bg-[var(--color-bg-panel)] safe-area-bottom ${className ?? ''}`}>
      {/* Puzzle panel — hints accumulate, attempts never cost anything */}
      {puzzleView && puzzle && (
        <div className="px-3 pt-2.5 md:px-4 border-b border-[var(--color-border)]">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-[var(--font-mono)] text-[13px] uppercase tracking-widest text-[var(--color-accent-gold)]">
              {language === 'es' ? 'Enigma' : 'Puzzle'} — {language === 'es' ? puzzle.titleEs : puzzle.title}
            </span>
            <span className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-dim)]">
              {language === 'es' ? 'Intentos' : 'Attempts'}: {puzzleView.attempts}
              {puzzleView.effectiveDC !== undefined && ` · DC ${puzzleView.effectiveDC}`}
            </span>
          </div>

          {puzzle.kind === 'mechanism' && (
            <div className="mt-1.5 font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)]">
              {language === 'es' ? 'Secuencia' : 'Sequence'}: {puzzleView.progress.length}/{puzzle.steps.length}
            </div>
          )}

          {puzzleView.revealedHints.length > 0 && (
            <ul className="mt-1.5 mb-2 space-y-1">
              {puzzleView.revealedHints.map((hint, index) => (
                <li key={index} className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-accent-gold)] mr-1">
                    {language === 'es' ? 'Pista' : 'Hint'} {index + 1}:
                  </span>
                  {language === 'es' ? hint.es : hint.en}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && !input && (
        <div className="flex flex-wrap gap-1.5 px-3 pt-2 pb-1 md:px-4">
          {suggestions.map((s) => (
            <button
              key={s.key}
              // The "Something else..." entry carries no action; it is an
              // invitation to type, so it focuses the input instead of doing
              // nothing at all.
              onClick={() => (s.action ? handleSubmit(s.action) : inputRef.current?.focus())}
              // Narration takes seconds. While it runs handleSubmit ignores
              // input, so leaving these live made every click vanish silently
              // and the buttons read as broken.
              disabled={isTyping}
              className="px-3 py-1.5 text-[15px] font-[var(--font-mono)] rounded border border-[var(--color-border-light)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] active:border-[var(--color-accent-gold)] active:text-[var(--color-accent-gold)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-[var(--color-text-dim)] mr-1">[{s.key}]</span>
              {language === 'es' ? s.labelEs : s.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3">
        <span className="font-[var(--font-mono)] text-[var(--color-accent-gold)] text-sm flex-shrink-0">
          {'>'}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none font-[var(--font-mono)] text-[16px] md:text-[17px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-dim)] disabled:opacity-50 py-1"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="text"
        />
        <button
          onClick={() => handleSubmit()}
          disabled={!input.trim() || isTyping}
          className="px-3 py-1.5 text-[15px] font-[var(--font-mono)] rounded border border-[var(--color-border-light)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] active:border-[var(--color-accent-gold)] active:text-[var(--color-accent-gold)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {language === 'es' ? 'Enviar' : 'Enter'}
        </button>
      </div>
    </div>
  );
}
