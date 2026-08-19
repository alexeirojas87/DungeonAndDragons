// ============================================================
// CHAPTER REGISTRY
// Chapter I is authored; every later chapter is generated at
// runtime and appended to the campaign's own chapter list.
// ============================================================

import { registerCarriedFlags, type Chapter } from '../../engine/chapter';
import { CHAPTER_ONE } from './chapter-01';

export { CHAPTER_ONE };

/** The opening chapter every campaign starts from. */
export function getFirstChapter(): Chapter {
  return CHAPTER_ONE;
}

// Later chapters may legitimately gate choices on flags that chapter I set,
// so the validator must not read those requirements as dead gates.
registerCarriedFlags(CHAPTER_ONE.summaryFlags ?? []);
