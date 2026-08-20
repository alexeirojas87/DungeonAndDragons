// ============================================================
// COMBAT VIEW - Combat interface overlay
// ============================================================

'use client';

import type { CombatEncounter, Combatant, Language } from '../engine/types';
import { resolveEnemy, resolveCharacter } from '../assets/registry';

interface CombatViewProps {
  encounter: CombatEncounter;
  language: Language;
  currentPlayerId: string;
  playerPortrait?: string;
}

export function CombatView({ encounter, language, currentPlayerId, playerPortrait }: CombatViewProps) {
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
      <div className="px-3 py-2 flex gap-2 overflow-x-auto">
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
    </div>
  );
}

function CombatantCard({ combatant, isActive, language, playerPortrait }: {
  combatant: Combatant; isActive: boolean; language: Language; playerPortrait?: string;
}) {
  const hpPercent = (combatant.hp / combatant.maxHp) * 100;
  const hpColor = hpPercent > 60 ? 'var(--color-accent-green)' : hpPercent > 30 ? 'var(--color-accent-amber)' : 'var(--color-accent-crimson)';
  const portraitSrc = combatant.type === 'player'
    ? playerPortrait ?? resolveCharacter(combatant.portrait)
    : resolveEnemy(combatant.portrait);

  return (
    <div className={`flex-shrink-0 p-3 rounded border transition-all ${
      isActive
        ? 'border-[var(--color-accent-gold)] bg-[rgba(198,154,70,0.12)]'
        : combatant.isAlive
          ? 'border-[var(--color-border)]'
          : 'border-[var(--color-border)] opacity-40'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <img
          src={portraitSrc}
          alt={combatant.type === 'player' ? 'hero' : 'enemy'}
          className={`w-9 h-9 rounded-sm object-cover select-none rpg-image-frame ${isActive ? 'ring-1 ring-[var(--color-accent-gold)]' : ''}`}
          draggable={false}
        />
        <span className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-primary)] max-w-[100px] truncate">
          {language === 'es' ? combatant.nameEs : combatant.name}
        </span>
      </div>

      <div className="h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${hpPercent}%`, backgroundColor: hpColor }}
        />
      </div>

      <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)] mt-1 text-center">
        {combatant.hp}/{combatant.maxHp}
      </div>
    </div>
  );
}
