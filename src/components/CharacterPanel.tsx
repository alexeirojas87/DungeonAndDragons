// ============================================================
// CHARACTER PANEL - Left sidebar with character info
// ============================================================

'use client';

import type { Character, Language } from '../engine/types';
import { ARCHETYPES, ORIGINS } from '../engine/character';
import { slotLabel } from '../engine/inventory';

interface CharacterPanelProps {
  character: Character | null;
  language: Language;
  locationName: string;
  locationNameEs: string;
}

export function CharacterPanel({ character, language, locationName, locationNameEs }: CharacterPanelProps) {
  if (!character) return null;

  const archName = language === 'es' ? ARCHETYPES[character.archetype].nameEs : ARCHETYPES[character.archetype].name;
  const originName = language === 'es' ? ORIGINS[character.origin].nameEs : ORIGINS[character.origin].name;
  // Sidebar abbreviations were hardcoded English, so a Spanish game showed
  // "HP / MP / GOLD" beside prose that says PV, PM and oro.
  const es = language === 'es';
  const L = {
    hp: es ? 'PV' : 'HP', mp: es ? 'PM' : 'MP', xp: es ? 'EXP' : 'XP',
    ac: es ? 'CA' : 'AC', gold: es ? 'ORO' : 'GOLD', origin: es ? 'ORIGEN' : 'ORIGIN',
    str: es ? 'FUE' : 'STR', dex: es ? 'DES' : 'DEX', con: es ? 'CON' : 'CON',
    int: es ? 'INT' : 'INT', wis: es ? 'SAB' : 'WIS', cha: es ? 'CAR' : 'CHA',
  };
  const locName = language === 'es' ? locationNameEs : locationName;

  const hpPercent = (character.hp / character.maxHp) * 100;
  const mpPercent = character.maxMp > 0 ? (character.mp / character.maxMp) * 100 : 0;
  const xpPercent = (character.experience / character.experienceToNext) * 100;

  return (
    <div className="w-full h-full bg-[var(--color-bg-panel)] border-r border-[var(--color-border)] flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <PortraitPlaceholder character={character} />
          <div className="flex-1 min-w-0">
            <h2 className="font-[var(--font-display)] text-[var(--color-accent-gold)] text-[17px] tracking-wider truncate">
              {character.name}
            </h2>
            <div className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-secondary)] mt-0.5">
              LVL {character.level} {archName.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)] uppercase tracking-widest">
          {language === 'es' ? 'Ubicación' : 'Location'}
        </div>
        <div className="font-[var(--font-mono)] text-[15px] text-[var(--color-accent-green)] mt-1 truncate">
          {locName}
        </div>
      </div>

      {/* Bars */}
      <div className="px-4 py-3 space-y-3 border-b border-[var(--color-border)]">
        <Bar label={L.hp} icon="♥" current={character.hp} max={character.maxHp} percent={hpPercent} color="var(--color-accent-crimson)" />
        {character.maxMp > 0 && (
          <Bar label={L.mp} icon="◆" current={character.mp} max={character.maxMp} percent={mpPercent} color="var(--color-accent-blue)" />
        )}
        <Bar label={L.xp} icon="★" current={character.experience} max={character.experienceToNext} percent={xpPercent} color="var(--color-accent-gold)" />
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatBox label={L.ac} value={character.ac} />
          <StatBox label={L.gold} value={character.gold} />
          <StatBox label={L.origin} value={originName} />
        </div>
      </div>

      {/* Attributes */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">
          {language === 'es' ? 'Atributos' : 'Attributes'}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <AttrRow label={L.str} icon="⚔" value={character.attributes.strength} />
          <AttrRow label={L.dex} icon="🏹" value={character.attributes.dexterity} />
          <AttrRow label={L.con} icon="🛡" value={character.attributes.constitution} />
          <AttrRow label={L.int} icon="📖" value={character.attributes.intelligence} />
          <AttrRow label={L.wis} icon="👁" value={character.attributes.wisdom} />
          <AttrRow label={L.cha} icon="👑" value={character.attributes.charisma} />
        </div>
      </div>

      {/* Decorative divider */}
      <div className="px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border-light)] to-transparent" />
      </div>

      {/* Equipment */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] flex-1 overflow-y-auto">
        <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)] uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <span className="text-[10px]">⚙</span>
          {language === 'es' ? 'Equipo' : 'Equipment'}
        </div>
        <div className="space-y-1.5">
          {Object.entries(character.equipment).map(([slot, item]) => (
            <div key={slot} className="flex items-center justify-between text-[15px]">
              <span className="font-[var(--font-mono)] text-[var(--color-text-secondary)] uppercase text-[12px]">
                {slotLabel(slot, language)}
              </span>
              <span className="text-[var(--color-text-secondary)] truncate ml-2">
                {item ? (language === 'es' ? item.nameEs : item.name) : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Conditions */}
      {character.conditions.length > 0 && (
        <div className="px-3 py-2 border-t border-[var(--color-border)]">
          <div className="flex flex-wrap gap-1">
            {character.conditions.map(c => (
              <span key={c} className="px-2 py-1 text-[13px] font-[var(--font-mono)] bg-[var(--color-accent-crimson)] text-[var(--color-bg-primary)] rounded">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PortraitPlaceholder({ character }: { character: Character }) {
  const initials = character.name.slice(0, 2).toUpperCase();
  const hpPercent = (character.hp / character.maxHp) * 100;
  const glowColor = hpPercent > 60
    ? 'rgba(74, 158, 74, 0.35)'
    : hpPercent > 30
    ? 'rgba(196, 146, 42, 0.35)'
    : 'rgba(196, 64, 64, 0.4)';
  const borderColor = hpPercent > 60
    ? 'var(--color-accent-green)'
    : hpPercent > 30
    ? 'var(--color-accent-amber)'
    : 'var(--color-accent-crimson)';
  return (
    <div
      className="w-11 h-11 rounded bg-[var(--color-bg-tertiary)] flex items-center justify-center flex-shrink-0 transition-all duration-500"
      style={{
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 10px ${glowColor}, inset 0 0 6px ${glowColor}`,
      }}
    >
      <span className="font-[var(--font-display)] text-[var(--color-accent-gold)] text-base">
        {initials}
      </span>
    </div>
  );
}

function Bar({ label, icon, current, max, percent, color }: {
  label: string; icon: string; current: number; max: number; percent: number; color: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)] uppercase flex items-center gap-1">
          <span className="text-[10px] opacity-80">{icon}</span>
          {label}
        </span>
        <span className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-primary)]">
          {current}/{max}
        </span>
      </div>
      <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden border border-[var(--color-border)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="py-1.5 bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)]">
      <div className="font-[var(--font-mono)] text-[12px] text-[var(--color-text-secondary)] uppercase">{label}</div>
      <div className="font-[var(--font-mono)] text-[15px] text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}

function AttrRow({ label, icon, value }: { label: string; icon: string; value: number }) {
  const mod = Math.floor((value - 10) / 2);
  return (
    <div className="flex items-center justify-between">
      <span className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-secondary)] flex items-center gap-1">
        <span className="text-[10px] opacity-75">{icon}</span>
        {label}
      </span>
      <span className="font-[var(--font-mono)] text-[15px] text-[var(--color-text-primary)]">
        {value} <span className="text-[var(--color-text-dim)]">({mod >= 0 ? '+' : ''}{mod})</span>
      </span>
    </div>
  );
}
