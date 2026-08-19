// ============================================================
// INVENTORY & QUEST OVERLAYS
// The header buttons for these toggled state nothing rendered, so
// anything the player earned — a puzzle's unlocked tool above all —
// was invisible. These are the panels those buttons open.
// ============================================================

'use client';

import type { Character, Item, Language, Quest } from '../engine/types';
import { slotLabel } from '../engine/inventory';

interface OverlayProps {
  language: Language;
  onClose: () => void;
}

export function InventoryPanel({
  language,
  character,
  onClose,
}: OverlayProps & { character: Character | null }) {
  const es = language === 'es';
  const items = character?.inventory ?? [];
  const equipped = Object.entries(character?.equipment ?? {})
    .filter((entry): entry is [string, Item] => !!entry[1]);

  return (
    <Overlay title={es ? 'Inventario' : 'Inventory'} onClose={onClose}>
      <div className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)]">
        {es ? 'Oro' : 'Gold'}: <span className="text-[var(--color-accent-gold)]">{character?.gold ?? 0}</span>
      </div>

      {equipped.length > 0 && (
        <Section title={es ? 'Equipado' : 'Equipped'}>
          {equipped.map(([slot, item]) => (
            <Row
              key={slot}
              name={es ? item.nameEs : item.name}
              detail={slotLabel(slot, language)}
            />
          ))}
        </Section>
      )}

      <Section title={es ? 'Mochila' : 'Carried'}>
        {items.length === 0 ? (
          <p className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-dim)]">
            {es ? 'No llevas nada.' : 'You are carrying nothing.'}
          </p>
        ) : (
          items.map(item => (
            <Row
              key={item.id}
              name={es ? item.nameEs : item.name}
              detail={es ? item.descriptionEs : item.description}
              rarity={item.rarity}
            />
          ))
        )}
      </Section>
    </Overlay>
  );
}

export function QuestLogPanel({
  language,
  quests,
  onClose,
}: OverlayProps & { quests: Quest[] }) {
  const es = language === 'es';
  const visible = quests.filter(quest => quest.state !== 'hidden');

  return (
    <Overlay title={es ? 'Misiones' : 'Quests'} onClose={onClose}>
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
                  <span className={objective.completed
                    ? 'text-[var(--color-accent-green)]'
                    : 'text-[var(--color-text-dim)]'}
                  >
                    {objective.completed ? '✓' : '○'}{' '}
                  </span>
                  <span className={objective.completed
                    ? 'text-[var(--color-text-dim)] line-through'
                    : 'text-[var(--color-text-primary)]'}
                  >
                    {es ? objective.descriptionEs : objective.description}
                  </span>
                  {objective.required > 1 && (
                    <span className="text-[var(--color-text-dim)]">
                      {' '}({objective.current}/{objective.required})
                    </span>
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

function Overlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded border border-[var(--color-border)] bg-[var(--color-bg-panel)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-[var(--font-mono)] text-[13px] uppercase tracking-[0.3em] text-[var(--color-accent-gold)]">
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
      <h3 className="font-[var(--font-mono)] text-[13px] uppercase tracking-widest text-[var(--color-text-dim)] mb-1.5">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ name, detail, rarity }: { name: string; detail?: string; rarity?: string }) {
  return (
    <div className="mb-1.5">
      <span className="font-[var(--font-mono)] text-[15px] text-[var(--color-text-primary)]">{name}</span>
      {rarity && rarity !== 'common' && (
        <span className="ml-2 font-[var(--font-mono)] text-[13px] uppercase text-[var(--color-accent-gold)]">
          {rarity}
        </span>
      )}
      {detail && (
        <div className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-dim)]">{detail}</div>
      )}
    </div>
  );
}
