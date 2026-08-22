// ============================================================
// COMBAT VIEW - Combat interface overlay
// ============================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import type { CombatEncounter, Combatant, Language, Character } from '../engine/types';
import { resolveEnemy, resolveCharacter } from '../assets/registry';

interface CombatViewProps {
  encounter: CombatEncounter;
  language: Language;
  currentPlayerId: string;
  playerPortrait?: string;
  /** Tactical actions are surfaced here, beside the cards they target, instead
   * of only as generic suggestions in the bottom input bar. */
  onAction?: (input: string) => void;
  character?: Character | null;
  isTyping?: boolean;
}

export function CombatView({ encounter, language, currentPlayerId, playerPortrait, onAction, character, isTyping }: CombatViewProps) {
  const currentCombatant = encounter.initiativeOrder[encounter.currentTurn];
  const isPlayerTurn = currentCombatant?.id === currentPlayerId;

  return (
    <div className="border-b border-[var(--color-accent-crimson)] bg-[rgba(139,58,58,0.05)]">
      {/* Combat Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-[var(--color-border)]">
        <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-accent-crimson)] uppercase tracking-widest">
          {language === 'es' ? '¡Combate!' : 'Combat!'}
        </div>
        <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)]">
          {language === 'es' ? 'Ronda' : 'Round'} {encounter.round}
        </div>
      </div>

      {/* Initiative Order */}
      <div className="flex gap-3 overflow-x-auto px-3 py-3 [scrollbar-width:thin]">
        {encounter.initiativeOrder.map((combatant) => (
          <CombatantCard
            key={combatant.id}
            combatant={combatant}
            isActive={combatant.id === currentCombatant?.id}
            language={language}
            playerPortrait={playerPortrait}
          />
        ))}
      </div>

      {/* Turn Indicator */}
      {isPlayerTurn && (
        <div className="px-3 py-1.5 border-t border-[var(--color-border)]">
          <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-accent-gold)]">
            {language === 'es' ? 'Tu turno — Elige una acción' : 'Your turn — Choose an action'}
          </div>
        </div>
      )}

      {!isPlayerTurn && currentCombatant && (
        <div className="px-3 py-1.5 border-t border-[var(--color-border)]">
          <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)]">
            {currentCombatant.name} {language === 'es' ? 'está actuando...' : 'is acting...'}
          </div>
        </div>
      )}

      {/* Tactical actions — desktop only. On mobile the ActionScroll at the
          bottom is the thumb-reachable combat surface; duplicating it up here
          would split the same commands across two places. */}
      {isPlayerTurn && onAction && (
        <CombatActions
          encounter={encounter}
          language={language}
          character={character}
          disabled={!!isTyping}
          onAction={onAction}
        />
      )}
    </div>
  );
}

function CombatantCard({ combatant, isActive, language, playerPortrait }: {
  combatant: Combatant; isActive: boolean; language: Language; playerPortrait?: string;
}) {
  const hpPercent = Math.max(0, Math.min(100, (combatant.hp / combatant.maxHp) * 100));
  const lostPercent = 100 - hpPercent;
  const hpColor = hpPercent > 60 ? 'var(--color-accent-green)' : hpPercent > 30 ? 'var(--color-accent-amber)' : 'var(--color-accent-crimson)';
  const portraitSrc = combatant.type === 'player'
    ? playerPortrait ?? resolveCharacter(combatant.portrait)
    : resolveEnemy(combatant.portrait);

  // A round resolves in a single pass, so HP can jump from full to wounded in
  // one render. The damage is still visible: the bar and blood overlay animate
  // their dimensions, and the card flashes crimson the moment HP drops.
  const prevHpRef = useRef(combatant.hp);
  const [hitFlash, setHitFlash] = useState(false);
  useEffect(() => {
    if (combatant.hp < prevHpRef.current) {
      setHitFlash(true);
      const t = setTimeout(() => setHitFlash(false), 450);
      prevHpRef.current = combatant.hp;
      return () => clearTimeout(t);
    }
    prevHpRef.current = combatant.hp;
  }, [combatant.hp]);

  return (
    <div className={`w-40 flex-shrink-0 rounded border p-2.5 transition-all ${
      isActive
        ? 'border-[var(--color-accent-gold)] bg-[rgba(198,154,70,0.12)]'
        : combatant.isAlive
          ? 'border-[var(--color-border)]'
          : 'border-[var(--color-border)] opacity-40'
    } ${hitFlash ? 'ring-2 ring-[var(--color-accent-crimson)]' : ''}`}>
      <div className="flex items-start gap-2.5">
        <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-sm border border-[var(--color-border-light)] bg-black">
          <img
            src={portraitSrc}
            alt={combatant.type === 'player' ? (language === 'es' ? 'héroe' : 'hero') : (language === 'es' ? 'enemigo' : 'enemy')}
            className={`h-full w-full select-none object-cover transition-[filter,opacity] duration-500 ${
              !combatant.isAlive ? 'grayscale opacity-30' : lostPercent >= 70 ? 'grayscale-[35%] contrast-125' : ''
            }`}
            draggable={false}
          />
          {lostPercent > 0 && combatant.type === 'enemy' && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(150deg,transparent_0_35%,rgba(123,27,27,.72)_36%_44%,transparent_45%_58%,rgba(69,9,9,.82)_59%)] mix-blend-multiply transition-[height] duration-500"
              style={{ height: `${lostPercent}%` }}
              aria-hidden
            />
          )}
          {isActive && <span className="absolute inset-0 ring-2 ring-inset ring-[var(--color-accent-gold)]" aria-hidden />}
        </div>

        <div className="min-w-0 flex-1">
          <span className="block truncate font-[var(--font-mono)] text-[13px] text-[var(--color-text-primary)]">
            {language === 'es' ? combatant.nameEs : combatant.name}
          </span>
          <span className="mt-1 block font-[var(--font-display)] text-[20px] leading-none tabular-nums transition-colors duration-300" style={{ color: hpColor }}>
            {combatant.hp}
            <span className="text-[12px] text-[var(--color-text-dim)]"> / {combatant.maxHp} HP</span>
          </span>
          <span className="mt-1.5 block font-[var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">
            {!combatant.isAlive
              ? (language === 'es' ? 'Caído' : 'Fallen')
              : hpPercent <= 30
                ? (language === 'es' ? 'Herida crítica' : 'Critical wound')
                : hpPercent <= 60
                  ? (language === 'es' ? 'Herido' : 'Wounded')
                  : (language === 'es' ? 'En pie' : 'Standing')}
          </span>
        </div>
      </div>

      <div
        className="mt-2 grid h-2 grid-cols-10 gap-px"
        role="progressbar"
        aria-label={`${language === 'es' ? 'Vida' : 'Health'}: ${combatant.hp} / ${combatant.maxHp}`}
        aria-valuemin={0}
        aria-valuemax={combatant.maxHp}
        aria-valuenow={combatant.hp}
      >
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className="border border-black/20 transition-colors duration-300"
            style={{ backgroundColor: index < Math.ceil(hpPercent / 10) ? hpColor : 'var(--color-bg-tertiary)' }}
            aria-hidden
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-[var(--font-mono)] text-[11px] uppercase tracking-wide text-[var(--color-text-dim)]">
        <span>{language === 'es' ? 'ATQ' : 'ATK'} {combatant.attackBonus >= 0 ? '+' : ''}{combatant.attackBonus}</span>
        <span>CA {combatant.ac}</span>
        <span>{combatant.damage}{combatant.damageBonus > 0 ? `+${combatant.damageBonus}` : combatant.damageBonus < 0 ? combatant.damageBonus : ''}</span>
      </div>
      {combatant.abilities.length > 0 && (
        <p className="mt-1.5 line-clamp-2 font-[var(--font-mono)] text-[10px] leading-tight text-[var(--color-text-secondary)]">
          {(language === 'es' ? combatant.abilitiesEs : combatant.abilities).join(' · ')}
        </p>
      )}
    </div>
  );
}

function CombatActions({
  encounter, language, character, disabled, onAction,
}: {
  encounter: CombatEncounter;
  language: Language;
  character?: Character | null;
  disabled: boolean;
  onAction: (input: string) => void;
}) {
  const es = language === 'es';
  const enemies = encounter.initiativeOrder.filter(c => c.type === 'enemy' && c.isAlive);
  const spells = character?.spells ?? [];
  const potions = (character?.inventory ?? []).filter(i => /potion/i.test(i.templateId) && i.usable);

  const act = (input: string) => {
    if (disabled) return;
    onAction(input);
  };

  const btn = 'px-2.5 py-1.5 text-[13px] font-[var(--font-mono)] rounded border border-[var(--color-border-light)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] active:border-[var(--color-accent-gold)] active:text-[var(--color-accent-gold)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

  return (
    <div className="hidden md:flex flex-wrap items-center gap-1.5 px-3 py-2 border-t border-[var(--color-border)]">
      {/* Targeted attacks — one button per living enemy so the player aims,
          not just "attack" hitting whichever the engine picks first. */}
      <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--color-text-dim)] mr-0.5">
        {es ? 'Atacar:' : 'Attack:'}
      </span>
      {enemies.length > 1
        ? enemies.map(e => (
            <button key={e.id} className={btn} disabled={disabled} onClick={() => act(`attack ${es ? e.nameEs : e.name}`)}>
              {es ? e.nameEs : e.name}
            </button>
          ))
        : (
            <button className={btn} disabled={disabled} onClick={() => act('attack')}>
              {es ? 'Atacar' : 'Attack'}
            </button>
          )}

      {/* Spells — every known spell, not just the archetype's signature one.
          Greyed when mana is short so the cost is visible and binding. */}
      {spells.length > 0 && (
        <>
          <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--color-text-dim)] ml-2 mr-0.5">
            {es ? 'Hechizos:' : 'Spells:'}
          </span>
          {spells.map(spell => {
            const insufficient = !!character && character.mp < spell.mpCost;
            return (
              <button
                key={spell.id}
                className={btn}
                disabled={disabled || insufficient}
                title={insufficient ? (es ? `Maná insuficiente (${spell.mpCost})` : `Not enough mana (${spell.mpCost})`) : undefined}
                onClick={() => act(`cast ${spell.id.replaceAll('_', ' ')}`)}
              >
                {es ? spell.nameEs : spell.name}
                <span className="text-[var(--color-text-dim)] ml-1">{spell.mpCost}PM</span>
              </button>
            );
          })}
        </>
      )}

      <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--color-text-dim)] ml-2 mr-0.5">
        {es ? 'Otros:' : 'Other:'}
      </span>
      <button className={btn} disabled={disabled} onClick={() => act('defend')}>
        {es ? 'Defender' : 'Defend'}
      </button>
      {potions.length > 0 && (
        <button className={btn} disabled={disabled} onClick={() => act('use health potion')}>
          {es ? 'Usar poción' : 'Use potion'}
        </button>
      )}
      <button className={btn} disabled={disabled} onClick={() => act('flee')}>
        {es ? 'Huir' : 'Flee'}
      </button>
    </div>
  );
}
