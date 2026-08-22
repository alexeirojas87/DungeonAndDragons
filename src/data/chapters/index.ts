// ============================================================
// AUTHORED CAMPAIGN REGISTRY
// Runtime code may load chapters only from this immutable registry.
// ============================================================

import { registerCarriedFlags, type Chapter } from '../../engine/chapter';
import { CHAPTER_ONE } from './chapter-01';
import { CHAPTER_TWO } from './chapter-02';
import { CHAPTER_THREE } from './chapter-03';
import { CHAPTER_FOUR } from './chapter-04';
import { CHAPTER_FIVE } from './chapter-05';
import { CHAPTER_SIX } from './chapter-06';
import { CHAPTER_SEVEN } from './chapter-07';
import { CHAPTER_EIGHT } from './chapter-08';
import { CHAPTER_NINE } from './chapter-09';
import { CHAPTER_TEN } from './chapter-10';

export {
  CHAPTER_ONE, CHAPTER_TWO, CHAPTER_THREE, CHAPTER_FOUR, CHAPTER_FIVE,
  CHAPTER_SIX, CHAPTER_SEVEN, CHAPTER_EIGHT, CHAPTER_NINE, CHAPTER_TEN,
};

/** Every authored chapter, in order, for the validation and playthrough harnesses. */
export const AUTHORED_CHAPTERS: readonly Chapter[] = [
  CHAPTER_ONE,
  CHAPTER_TWO,
  CHAPTER_THREE,
  CHAPTER_FOUR,
  CHAPTER_FIVE,
  CHAPTER_SIX,
  CHAPTER_SEVEN,
  CHAPTER_EIGHT,
  CHAPTER_NINE,
  CHAPTER_TEN,
];

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

// Later chapters may legitimately gate choices on facts summarized earlier,
// so every registry entry contributes its carried flags in campaign order.
for (const chapter of AUTHORED_CHAPTERS) {
  registerCarriedFlags(chapter.summaryFlags ?? []);
}
