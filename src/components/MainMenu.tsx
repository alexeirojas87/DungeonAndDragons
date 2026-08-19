// ============================================================
// MAIN MENU - Title screen and language selection
// ============================================================

'use client';

import { useState } from 'react';
import type { Language } from '../engine/types';

interface MainMenuProps {
  onSelectLanguage: (lang: Language) => void;
  onContinue: () => void;
}

export function MainMenu({ onSelectLanguage, onContinue }: MainMenuProps) {
  const [hasSavedGame] = useState(() => {
    try {
      return !!localStorage.getItem('gauntlet_save');
    } catch {
      return false;
    }
  });

  const handleContinue = () => {
    onContinue();
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4 noise-overlay scanlines relative overflow-hidden">
      {/* Animated fog layers */}
      <div className="fog-layer absolute inset-0 pointer-events-none" />
      <div className="fog-layer-2 absolute inset-0 pointer-events-none" />

      <div className="text-center max-w-lg relative z-10">
        {/* Logo */}
        <div className="mb-12">
          <h1 className="font-[var(--font-display)] text-[var(--color-accent-gold)] text-4xl md:text-5xl tracking-[0.3em] uppercase mb-2 title-glow">
            The Gauntlet
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-accent-gold)] to-transparent opacity-40" />
          <p className="font-[var(--font-mono)] text-[var(--color-text-secondary)] text-sm mt-4 tracking-widest uppercase">
            A Living Fantasy RPG
          </p>
        </div>

        {/* Tagline */}
        <p className="font-[var(--font-narrative)] text-[var(--color-text-secondary)] text-lg italic mb-12 leading-relaxed">
          &ldquo;The terminal is not a limitation.<br />
          <span className="text-[var(--color-accent-gold)]">The terminal is the window into the world.</span>&rdquo;
        </p>

        {/* Language Selection */}
        <div className="space-y-3">
          <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)] uppercase tracking-widest mb-4">
            Select Language
          </div>

          {hasSavedGame && (
            <button
              onClick={handleContinue}
              className="w-full py-3 px-6 border border-[var(--color-accent-gold)] rounded tactile-hover bg-[rgba(184,148,63,0.08)] hover:bg-[rgba(184,148,63,0.15)] transition-all group mb-2"
            >
              <div className="font-[var(--font-display)] text-[var(--color-accent-gold)] text-sm tracking-wider">
                Continue
              </div>
            </button>
          )}

          <button
            onClick={() => onSelectLanguage('en')}
            className="w-full py-4 px-6 border border-[var(--color-border)] rounded tactile-hover hover:border-[var(--color-accent-gold)] hover:bg-[rgba(184,148,63,0.05)] transition-all group"
          >
            <div className="font-[var(--font-display)] text-[var(--color-text-primary)] text-lg tracking-wider group-hover:text-[var(--color-accent-gold)] transition-colors">
              English
            </div>
          </button>

          <button
            onClick={() => onSelectLanguage('es')}
            className="w-full py-4 px-6 border border-[var(--color-border)] rounded tactile-hover hover:border-[var(--color-accent-gold)] hover:bg-[rgba(184,148,63,0.05)] transition-all group"
          >
            <div className="font-[var(--font-display)] text-[var(--color-text-primary)] text-lg tracking-wider group-hover:text-[var(--color-accent-gold)] transition-colors">
              Español
            </div>
          </button>
        </div>

        {/* Footer */}
          <div className="mt-12 font-[var(--font-mono)] text-[12px] text-[var(--color-text-secondary)]">
          v0.1.0 • The Sunken Crypt • Vertical Slice
        </div>
      </div>
    </div>
  );
}
