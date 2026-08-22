// ============================================================
// Chapter validation harness
//   node --experimental-strip-types scripts/validate-chapters.ts
// Fails loudly if the authored chapter stops satisfying the same
// contract every authored campaign chapter has to satisfy.
// ============================================================

import {
  ChapterSchema, coerceChapterShape, normalizeChapter, validateChapter,
} from '../src/engine/chapter';
import { CHAPTER_ONE } from '../src/data/chapters';

let failed = false;

function report(label: string, errors: string[]): void {
  if (errors.length === 0) {
    console.log(`✓ ${label}`);
    return;
  }
  failed = true;
  console.log(`✗ ${label} — ${errors.length} problem(s)`);
  for (const error of errors) console.log(`    ${error}`);
}

const shape = ChapterSchema.safeParse(CHAPTER_ONE);
report(
  `${CHAPTER_ONE.id} schema`,
  shape.success ? [] : shape.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
);

report(`${CHAPTER_ONE.id} structure`, validateChapter(CHAPTER_ONE));

// Coercion supports imported authored data before the schema, so it must
// leave a correct chapter byte-identical.
report(
  `${CHAPTER_ONE.id} coercion is a no-op`,
  JSON.stringify(coerceChapterShape(CHAPTER_ONE)) === JSON.stringify(CHAPTER_ONE)
    ? []
    : ['coerceChapterShape changed an already-valid chapter'],
);

// The normaliser supports imported authored data, so it must be a no-op on a
// chapter that is already correct — otherwise it is quietly deleting content.
const { chapter: normalized, notes } = normalizeChapter(CHAPTER_ONE);
report(
  `${CHAPTER_ONE.id} normaliser is a no-op`,
  notes.map(note => `unexpected change: ${note}`),
);
report(`${CHAPTER_ONE.id} still valid after normalising`, validateChapter(normalized));

// ---- Regression: the trap that shipped once ----
// The first generated chapter passed every check and was still unplayable: two
// nodes pointed at each other with no way out. "Some path reaches an ending"
// was never the right question. This rebuilds that shape in miniature.

const trapped = JSON.parse(JSON.stringify(CHAPTER_ONE)) as typeof CHAPTER_ONE;
trapped.nodes.trap_hub_a = {
  id: 'trap_hub_a',
  kind: 'beat',
  title: 'Hub A', titleEs: 'Nodo A',
  text: 'A', textEs: 'A',
  choices: [{ id: 'trap_a_to_b', label: 'to B', labelEs: 'a B', nextNodeId: 'trap_hub_b' }],
};
trapped.nodes.trap_hub_b = {
  id: 'trap_hub_b',
  kind: 'beat',
  title: 'Hub B', titleEs: 'Nodo B',
  text: 'B', textEs: 'B',
  choices: [{ id: 'trap_b_to_a', label: 'to A', labelEs: 'a A', nextNodeId: 'trap_hub_a' }],
};
trapped.nodes[trapped.startNodeId].choices.push({
  id: 'trap_enter', label: 'into the loop', labelEs: 'al bucle', nextNodeId: 'trap_hub_a',
});

const trapErrors = validateChapter(trapped);
report(
  'an inescapable A-B loop is rejected',
  trapErrors.some(error => error.includes('trap_hub_a') && error.includes('trap'))
    && trapErrors.some(error => error.includes('trap_hub_b'))
    ? []
    : [`expected both loop nodes to be reported as traps, got: ${trapErrors.join(' | ') || '(no errors)'}`],
);

process.exit(failed ? 1 : 0);
