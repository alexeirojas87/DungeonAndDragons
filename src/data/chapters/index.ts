// ============================================================
// AUTHORED CAMPAIGN REGISTRY
// Runtime code may load chapters only from this immutable registry.
// ============================================================

import { registerCarriedFlags, type Chapter } from '../../engine/chapter';
import { CHAPTER_ONE } from './chapter-01';

export { CHAPTER_ONE };

export const AUTHORED_CHAPTERS: readonly Chapter[] = [CHAPTER_ONE];

/** The opening chapter every campaign starts from. */
export function getFirstChapter(): Chapter {
  return AUTHORED_CHAPTERS[0];
}

export function getChapterByIndex(index: number): Chapter | null {
  return AUTHORED_CHAPTERS.find(chapter => chapter.index === index) ?? null;
}

export function getCampaignChaptersThrough(index: number): Chapter[] {
  return AUTHORED_CHAPTERS.filter(chapter => chapter.index <= index).map(chapter => chapter);
}

// Later chapters may legitimately gate choices on flags that chapter I set,
// so the validator must not read those requirements as dead gates.
registerCarriedFlags(CHAPTER_ONE.summaryFlags ?? []);
