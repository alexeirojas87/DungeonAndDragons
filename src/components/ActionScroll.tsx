// ============================================================
// ACTION SCROLL — the mobile pergamino
// A ribbon of brass that rests at the bottom edge of the page.
// Collapsed it shows who is present and how many actions wait;
// expanded it is the choice sheet. It replaces InputBar on
// mobile, where a permanently-open list of choices plus a text
// field plus a tab bar left the narrative 180px to live in.
// ============================================================

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Language } from '../engine/types';
import type { SceneEntity } from './AdventureScene';
import type { PuzzleView } from './InputBar';

interface ActionScrollProps {
  onSubmit: (input: string) => void;
  language: Language;
  isTyping: boolean;
  suggestions?: Array<{ key: string; label: string; labelEs: string; action: string }>;
  puzzleView?: PuzzleView | null;
  entities?: SceneEntity[];
  className?: string;
}

export function ActionScroll({
  onSubmit,
  language,
  isTyping,
  suggestions = [],
  puzzleView = null,
  entities = [],
  className,
}: ActionScrollProps) {
  const es = language === 'es';
  const [open, setOpen] = useState(true);
  const [typingMode, setTypingMode] = useState(false);
  const [input, setInput] = useState('');
  const [focusedEntity, setFocusedEntity] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // The scroll unfurls when the narration finishes. That makes "choices
  // visible" the resting state after every turn, so collapsing is a deliberate
  // act of reading rather than something the player has to undo to play.
  const wasTyping = useRef(isTyping);
  useEffect(() => {
    if (wasTyping.current && !isTyping && suggestions.length > 0) {
      setOpen(true);
    }
    wasTyping.current = isTyping;
  }, [isTyping, suggestions.length]);

  useEffect(() => {
    if (typingMode) inputRef.current?.focus();
  }, [typingMode]);

  const submit = useCallback((text: string) => {
    const value = text.trim();
    if (!value || isTyping) return;
    onSubmit(value);
    setInput('');
    setTypingMode(false);
    setFocusedEntity(null);
    // Collapse on commit: the next thing the player wants is the narration
    // that answers what they just did.
    setOpen(false);
  }, [isTyping, onSubmit]);

  const puzzle = puzzleView?.puzzle;
  const placeholder = puzzle
    ? puzzle.kind === 'riddle'
      ? (es ? 'Escribe tu respuesta al enigma...' : 'Type your answer to the riddle...')
      : (es ? 'Actúa sobre el enigma...' : 'Act on the puzzle...')
    : (es ? 'Escribe tu acción...' : 'Type your action...');

  const count = suggestions.length;

  return (
    <div
      className={`relative z-20 flex-shrink-0 border-t border-[var(--rpg-brass)] bg-[var(--color-bg-panel)] safe-area-bottom ${className ?? ''}`}
    >
      {/* ---- Handle: presences on the left, the wax seal count on the right ---- */}
      <button
        onClick={() => { setOpen(o => !o); setTypingMode(false); setFocusedEntity(null); }}
        aria-expanded={open}
        className={`scroll-handle relative w-full flex items-center justify-between gap-2 px-3 ${open ? 'h-10' : 'h-14'}`}
      >
        {/* Open, a grabber replaces the chips — the sheet below already shows
            the same cast, with names. */}
        {open && (
          <span className="absolute left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-[var(--rpg-brass)]" />
        )}

        <span className="flex items-center gap-1.5 min-w-0">
          {!open && entities.slice(0, 5).map(entity => (
            <span
              key={entity.id}
              data-compact
              className={`rpg-image-frame w-9 h-9 flex-shrink-0 overflow-hidden ${
                entity.kind === 'enemy' ? 'ring-1 ring-[var(--rpg-danger)]' : ''
              }`}
            >
              <img src={entity.src} alt="" className="w-full h-full object-cover" draggable={false} />
            </span>
          ))}
        </span>

        <span className="flex items-center gap-2 flex-shrink-0">
          <span className="font-[var(--font-mono)] text-[13px] uppercase tracking-widest text-[var(--rpg-gold)]">
            ✦ {count} {es ? (count === 1 ? 'acción' : 'acciones') : (count === 1 ? 'action' : 'actions')}
          </span>
          <svg
            className={`w-4 h-4 text-[var(--rpg-gold)] transition-transform ${open ? '' : 'rotate-180'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* ---- Sheet ---- */}
      {open && (
        <div className="action-scroll-sheet max-h-[46vh] overflow-y-auto border-t border-[var(--color-border)]">
          {/* Puzzle header — hints accumulate, attempts never cost anything */}
          {puzzleView && puzzle && (
            <div className="px-3 pt-2.5 pb-2 border-b border-[var(--color-border)]">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-[var(--font-mono)] text-[13px] uppercase tracking-widest text-[var(--color-accent-gold)]">
                  {es ? 'Enigma' : 'Puzzle'} — {es ? puzzle.titleEs : puzzle.title}
                </span>
                <span className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-dim)]">
                  {es ? 'Intentos' : 'Attempts'}: {puzzleView.attempts}
                  {puzzleView.effectiveDC !== undefined && ` · DC ${puzzleView.effectiveDC}`}
                </span>
              </div>

              {puzzle.kind === 'mechanism' && (
                <div className="mt-1.5 font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)]">
                  {es ? 'Secuencia' : 'Sequence'}: {puzzleView.progress.length}/{puzzle.steps.length}
                </div>
              )}

              {puzzleView.revealedHints.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {puzzleView.revealedHints.map((hint, index) => (
                    <li key={index} className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-accent-gold)] mr-1">
                        {es ? 'Pista' : 'Hint'} {index + 1}:
                      </span>
                      {es ? hint.es : hint.en}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Presences, named. This is where a 14px figure with a clipped label
              becomes something a thumb can actually reach and read. */}
          {entities.length > 0 && (
            <div className="flex gap-3 overflow-x-auto px-3 py-2 border-b border-[var(--color-border)]">
              {entities.map(entity => {
                const focused = focusedEntity === entity.id;
                return (
                  <button
                    key={entity.id}
                    data-compact
                    disabled={isTyping}
                    onClick={() => (focused ? submit(entity.action) : setFocusedEntity(entity.id))}
                    className="flex flex-col items-center gap-1 flex-shrink-0 w-[68px] disabled:opacity-40"
                  >
                    <span
                      className={`rpg-image-frame w-11 h-11 overflow-hidden transition-shadow ${
                        focused ? 'ring-2 ring-[var(--rpg-gold)]' : ''
                      } ${entity.kind === 'enemy' ? 'ring-1 ring-[var(--rpg-danger)]' : ''}`}
                    >
                      <img src={entity.src} alt="" className="w-full h-full object-cover" draggable={false} />
                    </span>
                    <span className="font-[var(--font-mono)] text-[11px] leading-tight text-center text-[var(--color-text-dim)]">
                      {entity.name}
                    </span>
                    {entity.hp !== undefined && entity.maxHp ? (
                      <span className="w-11 h-1 bg-[var(--rpg-stone)] overflow-hidden">
                        <span
                          className="block h-full bg-[var(--rpg-danger)]"
                          style={{ width: `${Math.max(0, (entity.hp / entity.maxHp) * 100)}%` }}
                        />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}

          {/* The choices, full width and evenly weighted */}
          {!typingMode && suggestions.length > 0 && (
            <ul>
              {suggestions.map((s, index) => (
                <li key={s.key}>
                  <button
                    onClick={() => (s.action ? submit(s.action) : setTypingMode(true))}
                    disabled={isTyping}
                    className="w-full flex items-baseline gap-2.5 text-left px-4 py-2.5 border-b border-[var(--color-border)] active:bg-[var(--color-bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)] flex-shrink-0">
                      [{s.key || index + 1}]
                    </span>
                    <span className="font-[var(--font-narrative)] text-[17px] leading-snug text-[var(--color-text-primary)]">
                      {es ? s.labelEs : s.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Free text stays one tap away instead of costing 57px every turn */}
          {typingMode ? (
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span className="font-[var(--font-mono)] text-[var(--color-accent-gold)] text-sm flex-shrink-0">{'>'}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); submit(input); }
                  if (e.key === 'Escape') setTypingMode(false);
                }}
                disabled={isTyping}
                placeholder={placeholder}
                className="flex-1 min-w-0 bg-transparent border-none outline-none font-[var(--font-mono)] text-[16px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-dim)] disabled:opacity-50 py-1"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <button
                onClick={() => submit(input)}
                disabled={!input.trim() || isTyping}
                className="px-3 py-1.5 text-[15px] font-[var(--font-mono)] rounded border border-[var(--color-border-light)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] active:border-[var(--color-accent-gold)] active:text-[var(--color-accent-gold)] disabled:opacity-30 transition-colors"
              >
                {es ? 'Enviar' : 'Enter'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setTypingMode(true)}
              disabled={isTyping}
              className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-[var(--color-text-dim)] active:bg-[var(--color-bg-tertiary)] disabled:opacity-40 transition-colors"
            >
              <span className="font-[var(--font-mono)] text-[15px] flex-shrink-0">✎</span>
              <span className="font-[var(--font-narrative)] text-[16px]">
                {es ? 'Escribir otra cosa' : 'Write something else'}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
