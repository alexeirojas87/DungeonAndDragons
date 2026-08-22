// ============================================================
// CHARACTER CREATION - Initial character setup
// ============================================================

'use client';

import { useState } from 'react';
import type { Archetype, Origin, Language, Difficulty } from '../engine/types';
import { ARCHETYPES, ORIGINS } from '../engine/character';
import { resolveCharacter } from '../assets/registry';

interface CharacterCreationProps {
  language: Language;
  onComplete: (name: string, archetype: Archetype, origin: Origin, difficulty: Difficulty) => void;
}

export function CharacterCreation({ language, onComplete }: CharacterCreationProps) {
  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState<Archetype>('warrior');
  const [origin, setOrigin] = useState<Origin>('ashenvale');
  const [difficulty, setDifficulty] = useState<Difficulty>('oath');
  const [step, setStep] = useState(0);

  const canProceed = name.trim().length > 0;

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg-primary)] flex">
      <div className="m-auto w-full max-w-3xl p-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-[var(--font-display)] text-[var(--color-accent-gold)] text-2xl md:text-3xl tracking-[0.2em] uppercase">
            {language === 'es' ? 'Crear Personaje' : 'Character Creation'}
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-accent-gold)] to-transparent mt-4 opacity-30" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map(i => (
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
              {i < 3 && <div className="w-7 md:w-10 h-px bg-[var(--color-border-light)]" />}
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
                  className={`p-4 rounded border bg-[var(--color-bg-secondary)] text-left transition-all shadow-[0_2px_10px_rgba(0,0,0,0.3)] overflow-hidden ${
                    archetype === id
                      ? 'border-[var(--color-accent-gold)] bg-[rgba(198,154,70,0.12)]'
                      : 'border-[var(--color-border-light)] hover:border-[var(--color-accent-gold)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveCharacter(id, id)}
                      alt={arch.name}
                      className="w-14 h-14 object-cover rounded-sm rpg-image-frame select-none"
                      draggable={false}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-[var(--font-display)] text-[19px] text-[var(--color-accent-gold)] tracking-wider">
                        {language === 'es' ? arch.nameEs : arch.name}
                      </div>
                    </div>
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
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 border border-[var(--color-accent-gold)] text-[var(--color-accent-gold)] font-[var(--font-mono)] text-[15px] uppercase tracking-wider rounded hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-primary)] transition-colors"
              >
                {language === 'es' ? 'Continuar' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Difficulty. The oath seals describe mechanical pressure,
            never different story content: every route remains available. */}
        {step === 3 && (
          <div className="fade-in space-y-5">
            <div>
              <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)] uppercase tracking-widest">
                {language === 'es' ? 'Elige el peso del juramento' : 'Choose the oath’s weight'}
              </div>
              <p className="mt-2 text-[15px] text-[var(--color-text-dim)]">
                {language === 'es'
                  ? 'La historia, las rutas y los finales no cambian. Solo cambia la presión mecánica.'
                  : 'Story, routes, and endings stay the same. Only mechanical pressure changes.'}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {([
                {
                  id: 'story' as const,
                  en: 'Story', es: 'Historia', mark: 'I', tone: 'var(--color-accent-green)',
                  detailEn: 'Lighter enemies, gentler checks, earlier hints.',
                  detailEs: 'Enemigos más leves, pruebas suaves y pistas antes.',
                },
                {
                  id: 'oath' as const,
                  en: 'Oath', es: 'Juramento', mark: 'II', tone: 'var(--color-accent-gold)',
                  detailEn: 'The intended balance.', detailEs: 'El equilibrio previsto.',
                },
                {
                  id: 'trial' as const,
                  en: 'Trial', es: 'Prueba', mark: 'III', tone: 'var(--color-accent-crimson)',
                  detailEn: 'Harder enemies and checks; hints arrive later.',
                  detailEs: 'Enemigos y pruebas más duros; las pistas tardan más.',
                },
              ]).map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDifficulty(option.id)}
                  aria-pressed={difficulty === option.id}
                  className={`relative min-h-44 overflow-hidden rounded border p-4 text-left transition-all ${
                    difficulty === option.id
                      ? 'bg-[rgba(198,154,70,0.10)] shadow-[inset_0_0_28px_rgba(198,154,70,0.08)]'
                      : 'border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-text-dim)]'
                  }`}
                  style={difficulty === option.id ? { borderColor: option.tone } : undefined}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full border font-[var(--font-display)] text-lg"
                    style={{ borderColor: option.tone, color: option.tone }}
                    aria-hidden
                  >
                    {option.mark}
                  </span>
                  <strong className="mt-4 block font-[var(--font-display)] text-[20px] tracking-wide text-[var(--color-text-primary)]">
                    {language === 'es' ? option.es : option.en}
                  </strong>
                  <span className="mt-2 block text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
                    {language === 'es' ? option.detailEs : option.detailEn}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded border border-[var(--color-border-light)] py-3.5 font-[var(--font-mono)] text-[15px] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent-gold)]"
              >
                {language === 'es' ? 'Atrás' : 'Back'}
              </button>
              <button
                onClick={() => onComplete(name.trim(), archetype, origin, difficulty)}
                className="flex-[2] rounded border border-[var(--color-accent-gold)] py-3.5 font-[var(--font-mono)] text-[15px] uppercase tracking-wider text-[var(--color-accent-gold)] transition-colors hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-primary)]"
              >
                {language === 'es' ? 'Sellar y comenzar' : 'Seal and begin'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
