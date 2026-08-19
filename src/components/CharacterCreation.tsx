// ============================================================
// CHARACTER CREATION - Initial character setup
// ============================================================

'use client';

import { useState } from 'react';
import type { Archetype, Origin, Language } from '../engine/types';
import { ARCHETYPES, ORIGINS } from '../engine/character';

interface CharacterCreationProps {
  language: Language;
  onComplete: (name: string, archetype: Archetype, origin: Origin) => void;
}

export function CharacterCreation({ language, onComplete }: CharacterCreationProps) {
  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState<Archetype>('warrior');
  const [origin, setOrigin] = useState<Origin>('ashenvale');
  const [step, setStep] = useState(0);

  const canProceed = name.trim().length > 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-[var(--font-display)] text-[var(--color-accent-gold)] text-2xl md:text-3xl tracking-[0.2em] uppercase">
            {language === 'es' ? 'Crear Personaje' : 'Character Creation'}
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-accent-gold)] to-transparent mt-4 opacity-30" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[13px] font-[var(--font-mono)] transition-colors ${
                step === i
                  ? 'border-[var(--color-accent-gold)] text-[var(--color-accent-gold)]'
                  : step > i
                    ? 'border-[var(--color-accent-green)] text-[var(--color-accent-green)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
              }`}>
                {step > i ? '✓' : i + 1}
              </div>
              {i < 2 && <div className="w-10 h-px bg-[var(--color-border-light)]" />}
            </div>
          ))}
        </div>

        {/* Step 0: Name */}
        {step === 0 && (
          <div className="fade-in space-y-6">
            <div>
              <label className="block font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)] uppercase tracking-widest mb-3">
                {language === 'es' ? 'Nombre del Personaje' : 'Character Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'es' ? 'Ingresa tu nombre...' : 'Enter your name...'}
                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-light)] rounded px-4 py-3 font-[var(--font-mono)] text-[17px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-accent-gold)] focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!canProceed}
              className="w-full py-3.5 border border-[var(--color-accent-gold)] text-[var(--color-accent-gold)] font-[var(--font-mono)] text-[15px] uppercase tracking-wider rounded hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {language === 'es' ? 'Continuar' : 'Continue'}
            </button>
          </div>
        )}

        {/* Step 1: Archetype */}
        {step === 1 && (
          <div className="fade-in space-y-4">
            <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)] uppercase tracking-widest mb-3">
              {language === 'es' ? 'Elige tu Arquetipo' : 'Choose Your Archetype'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(ARCHETYPES) as [Archetype, typeof ARCHETYPES[Archetype]][]).map(([id, arch]) => (
                <button
                  key={id}
                  onClick={() => setArchetype(id)}
                  className={`p-5 rounded border bg-[var(--color-bg-secondary)] text-left transition-all shadow-[0_2px_10px_rgba(0,0,0,0.22)] ${
                    archetype === id
                      ? 'border-[var(--color-accent-gold)] bg-[rgba(240,201,106,0.12)]'
                      : 'border-[var(--color-border-light)] hover:border-[var(--color-accent-gold)]'
                  }`}
                >
                  <div className="font-[var(--font-display)] text-[19px] text-[var(--color-accent-gold)] tracking-wider">
                    {language === 'es' ? arch.nameEs : arch.name}
                  </div>
                  <p className="text-[16px] font-medium text-[var(--color-text-primary)] mt-2 leading-[1.6]">
                    {language === 'es' ? arch.descriptionEs : arch.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-3.5 border border-[var(--color-border-light)] text-[var(--color-text-primary)] font-[var(--font-mono)] text-[15px] rounded hover:border-[var(--color-accent-gold)] transition-colors"
              >
                {language === 'es' ? 'Atrás' : 'Back'}
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 border border-[var(--color-accent-gold)] text-[var(--color-accent-gold)] font-[var(--font-mono)] text-[15px] uppercase tracking-wider rounded hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-primary)] transition-colors"
              >
                {language === 'es' ? 'Continuar' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Origin */}
        {step === 2 && (
          <div className="fade-in space-y-4">
            <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)] uppercase tracking-widest mb-3">
              {language === 'es' ? 'Elige tu Origen' : 'Choose Your Origin'}
            </div>

            <div className="space-y-2">
              {(Object.entries(ORIGINS) as [Origin, typeof ORIGINS[Origin]][]).map(([id, org]) => (
                <button
                  key={id}
                  onClick={() => setOrigin(id)}
                  className={`w-full p-4 rounded border bg-[var(--color-bg-secondary)] text-left transition-all flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.22)] ${
                    origin === id
                      ? 'border-[var(--color-accent-gold)] bg-[rgba(240,201,106,0.12)]'
                      : 'border-[var(--color-border-light)] hover:border-[var(--color-accent-gold)]'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-[var(--font-display)] text-[18px] text-[var(--color-accent-gold)] tracking-wider">
                      {language === 'es' ? org.nameEs : org.name}
                    </div>
                    <p className="text-[16px] font-medium text-[var(--color-text-primary)] mt-1 leading-relaxed">
                      {language === 'es' ? org.descriptionEs : org.description}
                    </p>
                  </div>
                  <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-accent-green)]">
                    +1 {org.attributeBonus.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 border border-[var(--color-border-light)] text-[var(--color-text-primary)] font-[var(--font-mono)] text-[15px] rounded hover:border-[var(--color-accent-gold)] transition-colors"
              >
                {language === 'es' ? 'Atrás' : 'Back'}
              </button>
              <button
                onClick={() => onComplete(name.trim(), archetype, origin)}
                className="flex-1 py-3.5 border border-[var(--color-accent-gold)] text-[var(--color-accent-gold)] font-[var(--font-mono)] text-[15px] uppercase tracking-wider rounded hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-primary)] transition-colors"
              >
                {language === 'es' ? 'Comenzar Aventura' : 'Begin Adventure'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
