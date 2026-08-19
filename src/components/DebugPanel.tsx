// ============================================================
// DEBUG PANEL - Developer tools for inspecting game state
// ============================================================

'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Character, CombatEncounter, NPC, WorldLocation, GameState, Language } from '../engine/types';
import { interpretIntent } from '../engine/intent';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character | null;
  location: WorldLocation | null;
  npcs: NPC[];
  combat: CombatEncounter | null;
  gameState: GameState | null;
  language: Language;
  lastRawInput?: string;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-green-900/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-1.5 text-[10px] font-bold tracking-widest text-green-400 uppercase hover:bg-green-900/20 flex items-center gap-1.5"
      >
        <span className="text-green-600">{open ? '▼' : '▶'}</span>
        {title}
      </button>
      {open && (
        <div className="px-3 pb-2 text-[11px] leading-relaxed text-green-300/80 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string | number | boolean | undefined }) {
  return (
    <div className="flex gap-2">
      <span className="text-green-500 shrink-0">{k}:</span>
      <span className="text-green-300 break-all">{String(v ?? '—')}</span>
    </div>
  );
}

export function DebugPanel({
  isOpen,
  onClose,
  character,
  location,
  npcs,
  combat,
  gameState,
  language,
  lastRawInput,
}: DebugPanelProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const lastIntent = useMemo(() => {
    if (lastRawInput && lastRawInput.trim()) {
      return interpretIntent(lastRawInput);
    }
    return null;
  }, [lastRawInput]);

  const activeQuests = gameState?.quests.filter(q => q.state === 'active' || q.state === 'updated') ?? [];
  const recentEvents = (gameState?.eventLog ?? []).slice(-10).reverse();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-80 max-w-[90vw] z-50 bg-[#0a0f0a] border-l border-green-900/60 flex flex-col overflow-hidden shadow-2xl shadow-green-900/20 font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-green-900/50 bg-[#0d120d]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-green-400 uppercase">DEBUG</span>
          </div>
          <button
            onClick={onClose}
            className="text-green-600 hover:text-green-300 transition-colors text-sm leading-none px-1"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent">
          {/* PLAYER STATE */}
          <Section title="PLAYER STATE">
            {character ? (
              <>
                <KV k="name" v={character.name} />
                <KV k="archetype" v={character.archetype} />
                <KV k="origin" v={character.origin} />
                <KV k="level" v={character.level} />
                <KV k="hp" v={`${character.hp}/${character.maxHp}`} />
                <KV k="mp" v={`${character.mp}/${character.maxMp}`} />
                <KV k="stamina" v={`${character.stamina}/${character.maxStamina}`} />
                <KV k="ac" v={character.ac} />
                <KV k="gold" v={character.gold} />
                <KV k="xp" v={`${character.experience}/${character.experienceToNext}`} />
                <KV k="conditions" v={character.conditions.length > 0 ? character.conditions.join(', ') : 'none'} />
                <KV k="equipment" v={Object.entries(character.equipment).filter(([,v]) => v).map(([k]) => k).join(', ') || 'none'} />
              </>
            ) : (
              <div className="text-green-700 italic">No character loaded</div>
            )}
          </Section>

          {/* LOCATION */}
          <Section title="LOCATION">
            {location ? (
              <>
                <KV k="id" v={location.id} />
                <KV k="danger" v={location.dangerLevel} />
                <KV k="connections" v={location.connections.join(', ') || 'none'} />
                <KV k="npcs" v={location.npcs.join(', ') || 'none'} />
                <KV k="enemies" v={location.enemies.join(', ') || 'none'} />
                <KV k="objects" v={location.objects.map(o => `${o.id}${o.broken ? ' [broken]' : ''}${o.hidden ? ' [hidden]' : ''}`).join(', ') || 'none'} />
                <KV k="ambiance" v={location.ambiance} />
                <KV k="secrets" v={location.secrets.length} />
                {location.requiresKey && <KV k="requiresKey" v={location.requiresKey} />}
              </>
            ) : (
              <div className="text-green-700 italic">No location data</div>
            )}
          </Section>

          {/* COMBAT */}
          <Section title="COMBAT">
            {combat ? (
              <>
                <KV k="state" v={combat.state} />
                <KV k="round" v={combat.round} />
                <KV k="currentTurn" v={combat.currentTurn} />
                <div className="mt-1 text-green-500 text-[10px] uppercase tracking-wider">Initiative Order</div>
                {combat.initiativeOrder.map((c, i) => (
                  <div key={c.id} className={`flex justify-between ${i === combat.currentTurn ? 'text-green-300 font-bold' : 'text-green-500/70'}`}>
                    <span>{i === combat.currentTurn ? '→ ' : '  '}{c.name}</span>
                    <span>{c.hp}/{c.maxHp} AC:{c.ac}</span>
                  </div>
                ))}
                <div className="mt-1 text-green-500 text-[10px] uppercase tracking-wider">Enemies</div>
                {combat.enemies.map(e => (
                  <div key={e.id} className={`flex justify-between ${e.hp > 0 ? 'text-green-400' : 'text-red-400 line-through'}`}>
                    <span>{e.name}</span>
                    <span>{e.hp}/{e.maxHp}</span>
                  </div>
                ))}
                {combat.log.length > 0 && (
                  <>
                    <div className="mt-1 text-green-500 text-[10px] uppercase tracking-wider">Last Actions</div>
                    {combat.log.slice(-5).map((entry, i) => (
                      <div key={i} className="text-green-600/80 text-[10px]">
                        R{entry.round} {entry.action}
                      </div>
                    ))}
                  </>
                )}
              </>
            ) : (
              <div className="text-green-700 italic">No active combat</div>
            )}
          </Section>

          {/* ACTIVE QUESTS */}
          <Section title="ACTIVE QUESTS">
            {activeQuests.length > 0 ? (
              activeQuests.map(q => (
                <div key={q.id} className="mb-1.5">
                  <div className="text-green-400 font-bold">{q.name}</div>
                  {q.objectives.map(o => (
                    <div key={o.id} className="pl-2 flex justify-between">
                      <span className={o.completed ? 'text-green-600 line-through' : ''}>{o.description}</span>
                      {o.required > 1 && <span className="text-green-600">{o.current}/{o.required}</span>}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="text-green-700 italic">No active quests</div>
            )}
          </Section>

          {/* NPC STATES */}
          <Section title="NPC STATES" defaultOpen={false}>
            {npcs.length > 0 ? (
              npcs.map(npc => (
                <div key={npc.id} className="mb-1.5">
                  <div className="flex justify-between text-green-400">
                    <span className="font-bold">{npc.name}</span>
                    <span className={npc.disposition > 0 ? 'text-green-400' : npc.disposition < 0 ? 'text-red-400' : 'text-yellow-400'}>
                      disp:{npc.disposition > 0 ? '+' : ''}{npc.disposition}
                    </span>
                  </div>
                  <div className="pl-2 text-green-600/80 text-[10px]">
                    knowledge:{npc.knowledge.length} memory:{npc.memory.length} alive:{String(npc.alive)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-green-700 italic">No NPCs in area</div>
            )}
          </Section>

          {/* INTENT INTERPRETATION */}
          <Section title="LAST INTENT" defaultOpen={false}>
            {lastRawInput ? (
              <>
                <div className="text-green-500 text-[10px] uppercase tracking-wider mb-0.5">Raw Input</div>
                <div className="text-green-300 break-all mb-1">&quot;{lastRawInput}&quot;</div>
                {lastIntent && (
                  <>
                    <div className="text-green-500 text-[10px] uppercase tracking-wider mb-0.5">Parsed Actions</div>
                    {lastIntent.actions.map((action, i) => (
                      <div key={i} className="pl-2 text-green-400/80 text-[10px]">
                        [{action.type}] target:{action.target ?? '—'} spell:{action.spell ?? '—'} conf:{Math.round(action.confidence * 100)}%
                      </div>
                    ))}
                  </>
                )}
              </>
            ) : (
              <div className="text-green-700 italic">No input yet</div>
            )}
          </Section>

          {/* RECENT EVENTS */}
          <Section title="RECENT EVENTS" defaultOpen={false}>
            {recentEvents.length > 0 ? (
              recentEvents.map((event, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-green-500">{event.type}</span>
                </div>
              ))
            ) : (
              <div className="text-green-700 italic">No events yet</div>
            )}
          </Section>

          {/* GAME FLAGS */}
          <Section title="GAME FLAGS" defaultOpen={false}>
            {gameState && Object.keys(gameState.flags).length > 0 ? (
              Object.entries(gameState.flags).map(([k, v]) => (
                <KV key={k} k={k} v={v} />
              ))
            ) : (
              <div className="text-green-700 italic">No flags set</div>
            )}
          </Section>

          {/* WORLD TIME */}
          <Section title="WORLD TIME" defaultOpen={false}>
            {gameState ? (
              <>
                <KV k="hour" v={gameState.time.hour} />
                <KV k="day" v={gameState.time.day} />
                <KV k="period" v={gameState.time.period} />
                <KV k="campaignDay" v={gameState.campaign.day} />
              </>
            ) : null}
          </Section>
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-green-900/50 bg-[#0d120d] text-[9px] text-green-700 flex justify-between">
          <span>tick:{tick}</span>
          <span>Ctrl+Shift+D to toggle</span>
        </div>
      </div>
    </>
  );
}
