// ============================================================
// INVENTORY & QUEST OVERLAYS
// Item artwork stands for an archetype (a rusty sword and a
// knight's longsword both wear the `weapon-sword` frame); the actual
// game data stays text/HTML. Rarity colours the frame, and a hover
// tooltip carries the description and stats.
// ============================================================

'use client';

import type { Character, Item, Language, Quest, ItemRarity, EquipmentSlot } from '../engine/types';
import { slotLabel } from '../engine/inventory';
import { resolveItem, resolveIcon } from '../assets/registry';

const SLOT_ORDER: EquipmentSlot[] = [
  'weapon_main', 'weapon_off', 'armor', 'helmet', 'boots',
  'gloves', 'ring_1', 'ring_2', 'amulet', 'relic',
];

const RARITY_COLOR: Record<ItemRarity, string> = {
  common: 'var(--color-border)',
  uncommon: 'var(--rpg-success)',
  rare: 'var(--color-accent-blue)',
  epic: 'var(--color-accent-purple)',
  legendary: 'var(--color-accent-gold)',
  unique: 'var(--color-accent-crimson)',
};

const RARITY_STYLE: Record<ItemRarity, string> = {
  common: 'text-[var(--color-text-dim)]',
  uncommon: 'text-[var(--color-accent-green)]',
  rare: 'text-[var(--color-accent-blue)]',
  epic: 'text-[var(--color-accent-purple)]',
  legendary: 'text-[var(--color-accent-gold)]',
  unique: 'text-[var(--color-accent-crimson)]',
};

export function InventoryPanel({
  language,
  character,
  onClose,
}: {
  language: Language;
  character: Character | null;
  onClose: () => void;
}) {
  const es = language === 'es';
  const items = character?.inventory ?? [];
  const equipment = character?.equipment;

  return (
    <Overlay title={es ? 'Inventario' : 'Inventory'} icon="icon-inventory" onClose={onClose}>
      <div className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)] flex items-center gap-2">
        <img src={resolveIcon('icon-gold')} alt="" className="w-4 h-4" />
        <span>{es ? 'Oro' : 'Gold'}:</span>
        <span className="text-[var(--color-accent-gold)] text-[16px]">{character?.gold ?? 0}</span>
      </div>

      <Section title={es ? 'Equipado' : 'Equipped'}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SLOT_ORDER.map(slot => {
            const equipped = equipment?.[slot] ?? null;
            return (
              <div key={slot} className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-12 h-12 flex-shrink-0 rounded-sm border flex items-center justify-center bg-[var(--color-bg-tertiary)] ${
                    equipped ? '' : 'border-dashed opacity-40'
                  }`}
                  style={equipped ? { borderColor: RARITY_COLOR[equipped.rarity] } : undefined}
                >
                  {equipped ? (
                    <img
                      src={resolveItem(equipped)}
                      alt={es ? equipped.nameEs : equipped.name}
                      className="w-full h-full object-cover select-none"
                      draggable={false}
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-dim)] uppercase">
                    {slotLabel(slot, language)}
                  </div>
                  <div className={`font-[var(--font-mono)] text-[12px] truncate ${equipped ? RARITY_STYLE[equipped.rarity] : 'text-[var(--color-text-dim)]'}`}>
                    {equipped ? (es ? equipped.nameEs : equipped.name) : '—'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title={es ? 'Mochila' : 'Carried'}>
        {items.length === 0 ? (
          <p className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)]">
            {es ? 'No llevas nada.' : 'You are carrying nothing.'}
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {items.map(item => (
<div
                  key={item.id}
                  className="group relative aspect-square rounded-sm overflow-hidden bg-[var(--color-bg-secondary)]"
                  style={{ border: `1px solid ${RARITY_COLOR[item.rarity]}` }}
                >
                  <img
                    src={resolveItem(item)}
                    alt={es ? item.nameEs : item.name}
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5">
                    <span className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-primary)] truncate block">
                      {es ? item.nameEs : item.name}
                    </span>
                  </div>
                  <div className="pointer-events-none absolute inset-0 tooltip-hover" data-tip={tooltipText(item, es)} />
                </div>
            ))}
          </div>
        )}
      </Section>
    </Overlay>
  );
}

function tooltipText(item: Item, es: boolean): string {
  const parts: string[] = [es ? item.nameEs : item.name];
  if (item.rarity !== 'common') parts.push(item.rarity.toUpperCase());
  parts.push(es ? item.descriptionEs : item.description);
  return parts.join(' — ');
}

export function QuestLogPanel({
  language,
  quests,
  onClose,
}: {
  language: Language;
  quests: Quest[];
  onClose: () => void;
}) {
  const es = language === 'es';
  const visible = quests.filter(quest => quest.state !== 'hidden');

  return (
    <Overlay title={es ? 'Misiones' : 'Quests'} icon="icon-quest" onClose={onClose}>
      {visible.length === 0 ? (
        <p className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)]">
          {es ? 'Ninguna misión activa.' : 'No active quests.'}
        </p>
      ) : (
        visible.map(quest => (
          <Section key={quest.id} title={es ? quest.nameEs : quest.name}>
            <p className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)] mb-1.5">
              {es ? quest.descriptionEs : quest.description}
            </p>
            <ul className="space-y-0.5">
              {quest.objectives.map(objective => (
                <li key={objective.id} className="font-[var(--font-mono)] text-[14px]">
                  <span className={objective.completed ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-text-dim)]'}>
                    {objective.completed ? '✓' : '○'}{' '}
                  </span>
                  <span className={objective.completed ? 'text-[var(--color-text-dim)] line-through' : 'text-[var(--color-text-primary)]'}>
                    {es ? objective.descriptionEs : objective.description}
                  </span>
                  {objective.required > 1 && (
                    <span className="text-[var(--color-text-dim)]"> ({objective.current}/{objective.required})</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        ))
      )}
    </Overlay>
  );
}

function Overlay({ title, icon, onClose, children }: {
  title: string; icon: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 overlay-backdrop" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded border border-[var(--rpg-brass)] bg-[var(--color-bg-panel)] p-5 rpg-panel">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-[var(--font-display)] text-[14px] uppercase tracking-[0.25em] text-[var(--color-accent-gold)] flex items-center gap-2">
            <img src={resolveIcon(icon)} alt="" className="w-5 h-5 opacity-80" />
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-accent-gold)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="font-[var(--font-display)] text-[12px] uppercase tracking-widest text-[var(--color-text-dim)] mb-1.5">
        {title}
      </h3>
      {children}
    </div>
  );
}