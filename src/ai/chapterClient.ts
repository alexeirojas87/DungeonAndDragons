// ============================================================
// CHAPTER CLIENT - Asks the server for the next chapter
// The server has already validated whatever comes back, so the
// caller can hand it straight to the engine.
// ============================================================

import type { Chapter, ChapterSummary } from '../engine/chapter';
import type { Character, Language } from '../engine/types';
import type { HeroBrief } from './chapterPrompt';

export type ChapterResult =
  | { ok: true; chapter: Chapter }
  | { ok: false; error: string; issues: string[] };

export function describeHero(hero: Character): HeroBrief {
  return {
    name: hero.name,
    level: hero.level,
    archetype: hero.archetype,
    origin: hero.origin,
    hp: hero.hp,
    maxHp: hero.maxHp,
    mp: hero.mp,
    maxMp: hero.maxMp,
    gold: hero.gold,
    notableItems: hero.inventory
      .filter(item => item.rarity !== 'common')
      .map(item => item.name)
      .slice(0, 10),
    spells: hero.spells.map(spell => spell.name),
  };
}

export async function generateNextChapter(input: {
  nextIndex: number;
  chronicle: ChapterSummary[];
  hero: Character;
  language: Language;
  usedIds: string[];
}): Promise<ChapterResult> {
  try {
    const res = await fetch('/api/chapter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nextIndex: input.nextIndex,
        chronicle: input.chronicle,
        hero: describeHero(input.hero),
        language: input.language,
        usedIds: input.usedIds,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.chapter) {
      return {
        ok: false,
        error: typeof data?.error === 'string' ? data.error : `request failed (${res.status})`,
        issues: Array.isArray(data?.issues) ? data.issues : [],
      };
    }

    return { ok: true, chapter: data.chapter as Chapter };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'network error',
      issues: [],
    };
  }
}
