// ============================================================
// ADVENTURE SCENE
// The world rendered as a composed illustrated scene. The LLM
// describes what exists; the asset resolver picks the art; this
// component decides how it appears. The environment fills the
// backdrop, present NPCs/enemies/props walk the foreground.
//
// It never knows the filesystem — it only ever asks semantic
// questions of the resolver.
// ============================================================

'use client';

import type { WorldLocation, NPC, CombatEncounter, Language } from '../engine/types';
import {
  resolveEnvironment, resolveNpc, resolveEnemy, resolveProp, sceneImages,
} from '../assets/registry';

interface AdventureSceneProps {
  location: WorldLocation | null;
  chapterLocation?: { visualType?: string; ambiance?: string; name?: string; description?: string } | null;
  npcs: NPC[];
  combat: CombatEncounter | null;
  language: Language;
}

export function AdventureScene({ location, chapterLocation, npcs, combat, language }: AdventureSceneProps) {
  const es = language === 'es';

  // Semantic resolution — the resolver owns the filesystem, not us.
  const envSpec = chapterLocation ?? location;
  const environment = envSpec
    ? resolveEnvironment(envSpec.visualType, envSpec.ambiance, location?.name, location?.description)
    : null;

  // Visible entities. During combat the monsters replace idle scene NPCs so
  // the battlefield is what dominates. Otherwise present the location's NPCs.
  const enemies = combat ? combat.enemies : [];
  const sceneNpcs = combat ? [] : npcs;

  // Props derived from discovered, non-hidden objects — capped so a busy room
  // never turns into a collage.
  const props = (location?.objects ?? [])
    .filter(o => !o.hidden)
    .slice(0, 4);

  if (!environment) return null;

  return (
    <section
      className="relative w-full overflow-hidden border-b border-[var(--rpg-brass)] h-36 md:h-56 lg:h-64"
      aria-label={es ? 'Escena del lugar' : 'Location scene'}
    >
      {/* Environment artwork */}
      <img
        src={environment}
        alt=""
        className="absolute inset-0 w-full h-full object-cover select-none scene-slow-drift"
        draggable={false}
        loading="eager"
      />

      {/* Legibility scrims */}
      <div className="absolute inset-0 rpg-scrim-bottom" />

      {/* Foreground prop layer (bottom of the scene) */}
      {props.length > 0 && (
        <div className="absolute bottom-1 left-2 right-2 flex items-end justify-around gap-4 pointer-events-none">
          {props.map(prop => (
            <AssetChip
              key={prop.id}
              src={resolveProp(prop.name)}
              tone={es ? prop.nameEs : prop.name}
              className="w-9 h-9 md:w-11 md:h-11"
            />
          ))}
        </div>
      )}

      {/* Entity strip: enemies during combat, otherwise NPCs */}
      {(enemies.length > 0 || sceneNpcs.length > 0) && (
        <div className="absolute bottom-1 left-2 right-2 flex justify-center gap-3">
          {enemies.map(enemy => (
            <FigureCard
              key={enemy.id}
              src={resolveEnemy(enemy.portrait, enemy.templateId)}
              name={es ? enemy.nameEs : enemy.name}
              hp={enemy.hp}
              maxHp={enemy.maxHp}
              hostile
            />
          ))}
          {sceneNpcs.map(npc => (
            <FigureCard
              key={npc.id}
              src={resolveNpc(npc.portrait)}
              name={es ? npc.nameEs : npc.name}
            />
          ))}
        </div>
      )}

      {/* Location banner */}
      <div className="absolute top-1 left-1 right-1 rpg-scrim-top pointer-events-none">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="font-[var(--font-display)] text-[var(--rpg-gold)] text-[15px] md:text-[17px] tracking-wider uppercase">
            {location ? (es ? location.nameEs : location.name) : ''}
          </span>
          <span className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-dim)] uppercase tracking-widest">
            {es ? 'Lugar' : 'Place'}
          </span>
        </div>
      </div>

      {/* Preload hints for the current scene so traversal stays snappy */}
      <link rel="preload" as="image" href={environment} />
    </section>
  );
}

function FigureCard({ src, name, hp, maxHp, hostile }: {
  src: string; name: string; hp?: number; maxHp?: number; hostile?: boolean;
}) {
  const hpBar = hostile && hp !== undefined && maxHp !== undefined;
  return (
    <div className="flex flex-col items-center">
      <img
        src={src}
        alt={name}
        title={name}
        className={`rpg-image-frame w-14 h-14 object-cover select-none ${hostile ? 'animate-pulse' : ''}`}
        draggable={false}
      />
      {hpBar && (
        <div className="mt-0.5 w-14 h-1 rounded bg-[var(--rpg-stone)] overflow-hidden">
          <div className="h-full transition-all" style={{ backgroundColor: barColor(hp, maxHp), width: `${(hp / maxHp) * 100}%` }} />
        </div>
      )}
      <span className="font-[var(--font-mono)] text-[10px] text-[var(--color-text-dim)] leading-tight max-w-14 truncate">
        {name}
      </span>
    </div>
  );
}

function barColor(hp: number, maxHp: number): string {
  const ratio = hp / maxHp;
  return ratio > 0.6 ? 'var(--rpg-success)' : ratio > 0.3 ? 'var(--rpg-gold)' : 'var(--rpg-danger)';
}

function AssetChip({ src, tone, className }: { src: string; tone: string; className?: string }) {
  return (
    <div className={`${className ?? ''} rpg-image-frame overflow-hidden`} title={tone}>
      <img src={src} alt={tone} className="w-full h-full object-cover" draggable={false} />
    </div>
  );
}