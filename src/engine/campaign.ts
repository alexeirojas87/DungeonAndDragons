import {
  ChapterSchema,
  collectChapterIds,
  nodeKind,
  registerCarriedFlags,
  validateChapter,
  type Chapter,
} from './chapter';
import type { CampaignProgress } from './types';

export const GLOBAL_ENDING_IDS = [
  'new_concord',
  'last_guardian',
  'unbound_world',
  'veil_ascendant',
  'court_restored',
  'decentralized_oaths',
] as const;

/** Folds the retired Chapter-1 faction slug exactly once and removes it. */
export function foldLegacyCampaignProgress(progress: CampaignProgress): void {
  const ashenVeil = progress.factionReputation.ashen_veil;
  if (ashenVeil === undefined) return;
  const veiledCourt = progress.factionReputation.veiled_court ?? 0;
  progress.factionReputation.veiled_court = Math.max(-5, Math.min(5, veiledCourt + ashenVeil));
  delete progress.factionReputation.ashen_veil;
}

/** Release gate for the complete static campaign, stricter than one-chapter validation. */
export function validateAuthoredCampaign(chapters: readonly Chapter[]): string[] {
  const errors: string[] = [];
  const ordered = [...chapters].sort((a, b) => a.index - b.index);
  const usedIds = new Set<string>();
  const canonicalWrites = new Map<string, number>();
  const canonicalReads = new Map<string, number[]>();
  const valueWrites = new Map<string, number>();
  const valueReads = new Map<string, number[]>();

  if (ordered.length !== 10) errors.push(`campaign needs 10 chapters, found ${ordered.length}`);

  for (let offset = 0; offset < ordered.length; offset++) {
    const chapter = ordered[offset];
    const priorCanonicalKeys = new Set(canonicalWrites.keys());
    const priorValueKeys = new Set(valueWrites.keys());
    const expectedIndex = offset + 1;
    const prefix = `c${String(chapter.index).padStart(2, '0')}_`;
    if (chapter.index !== expectedIndex) errors.push(`${chapter.id} has index ${chapter.index}; expected ${expectedIndex}`);
    if (chapter.id !== `chapter-${String(chapter.index).padStart(2, '0')}`) {
      errors.push(`${chapter.id} does not match its chapter index`);
    }

    const parsed = ChapterSchema.safeParse(chapter);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) errors.push(`${chapter.id} schema ${issue.path.join('.')}: ${issue.message}`);
    }
    for (const issue of validateChapter(chapter, usedIds)) errors.push(`${chapter.id}: ${issue}`);

    const nodeCount = Object.keys(chapter.nodes).length;
    if (nodeCount < 25 || nodeCount > 35) errors.push(`${chapter.id} needs 25-35 nodes, found ${nodeCount}`);
    if (Object.keys(chapter.puzzles).length !== 2) errors.push(`${chapter.id} needs exactly two puzzles`);
    const endings = Object.values(chapter.nodes).filter(node => nodeKind(node) === 'ending');
    const expectedEndings = chapter.index === 10 ? 6 : undefined;
    if (expectedEndings ? endings.length !== expectedEndings : endings.length < 3 || endings.length > 5) {
      errors.push(`${chapter.id} has ${endings.length} endings; expected ${expectedEndings ?? '3-5'}`);
    }

    for (const [nodeId, node] of Object.entries(chapter.nodes)) {
      if (!nodeId.startsWith(prefix)) errors.push(`${chapter.id} node ${nodeId} must start with ${prefix}`);
      for (const choice of node.choices) {
        if (!choice.id.startsWith(prefix)) errors.push(`${chapter.id} choice ${choice.id} must start with ${prefix}`);
        if (!choice.result || !choice.resultEs) errors.push(`${chapter.id}.${choice.id} needs bilingual post-choice result text`);
        for (const flag of Object.keys(choice.setsFlags ?? {})) {
          if (flag.startsWith('canon:')) canonicalWrites.set(flag, chapter.index);
        }
        for (const condition of choice.requires ?? []) {
          const list = canonicalReads.get(condition.flag) ?? [];
          list.push(chapter.index);
          canonicalReads.set(condition.flag, list);
        }
        for (const key of Object.keys(choice.adjustsValues ?? {})) {
          if (/^(faction|bond|conviction):/.test(key)) valueWrites.set(key, chapter.index);
        }
        for (const condition of choice.requiresValues ?? []) {
          const list = valueReads.get(condition.key) ?? [];
          list.push(chapter.index);
          valueReads.set(condition.key, list);
        }
      }
      if (nodeKind(node) === 'ending') {
        if (!node.outcome) errors.push(`${chapter.id} ending ${node.id} needs outcome`);
        if (!node.survivors || !node.casualties) errors.push(`${chapter.id} ending ${node.id} needs survivors and casualties`);
        if (chapter.index === 10 && !node.globalEndingId) {
          errors.push(`${chapter.id} ending ${node.id} needs a globalEndingId`);
        }
      } else if (node.globalEndingId) {
        errors.push(`${chapter.id} non-ending node ${node.id} cannot declare a globalEndingId`);
      }
      if (chapter.index !== 10 && node.globalEndingId) {
        errors.push(`${chapter.id} node ${node.id} cannot declare a globalEndingId before Chapter 10`);
      }
    }
    for (const puzzleId of Object.keys(chapter.puzzles)) {
      if (!puzzleId.startsWith(prefix)) errors.push(`${chapter.id} puzzle ${puzzleId} must start with ${prefix}`);
    }

    if (!hasEarlyConsequence(chapter)) errors.push(`${chapter.id} needs a consequential choice within its first five nodes`);
    if (!hasThreeSustainedBranches(chapter)) {
      errors.push(`${chapter.id} needs three branches that remain separate for at least two nodes`);
    }
    if (chapter.index > 1 && !consumesPriorState(chapter, priorCanonicalKeys, priorValueKeys)) {
      errors.push(`${chapter.id} needs a gated choice that consumes an earlier chapter consequence`);
    }

    for (const id of collectChapterIds(chapter)) usedIds.add(id);
    registerCarriedFlags(chapter.summaryFlags ?? []);
  }

  for (const [flag, writtenAt] of canonicalWrites) {
    const readLater = (canonicalReads.get(flag) ?? []).some(index => index > writtenAt);
    const summarized = ordered.some(chapter => chapter.index >= writtenAt && chapter.summaryFlags?.includes(flag));
    if (!readLater && !summarized) errors.push(`${flag} is introduced in chapter ${writtenAt} but never consumed or summarized`);
  }
  for (const [key, writtenAt] of valueWrites) {
    if (!(valueReads.get(key) ?? []).some(index => index > writtenAt)) {
      errors.push(`${key} is adjusted in chapter ${writtenAt} but never gates a later authored choice`);
    }
  }

  const finalEndingIds = Object.values(ordered.find(chapter => chapter.index === 10)?.nodes ?? {})
    .filter(node => nodeKind(node) === 'ending')
    .map(node => node.globalEndingId)
    .filter((endingId): endingId is NonNullable<typeof endingId> => Boolean(endingId));
  const finalEndings = new Set(finalEndingIds);
  for (const endingId of GLOBAL_ENDING_IDS) {
    if (!finalEndings.has(endingId)) errors.push(`Chapter 10 is missing global ending ${endingId}`);
  }
  if (finalEndingIds.length !== finalEndings.size) errors.push('Chapter 10 global ending IDs must be unique');

  return [...new Set(errors)];
}

function consumesPriorState(
  chapter: Chapter,
  priorCanonicalKeys: ReadonlySet<string>,
  priorValueKeys: ReadonlySet<string>,
): boolean {
  return Object.values(chapter.nodes).some(node => node.choices.some(choice =>
    choice.requires?.some(condition => priorCanonicalKeys.has(condition.flag))
    || choice.requiresValues?.some(condition => priorValueKeys.has(condition.key)),
  ));
}

function hasThreeSustainedBranches(chapter: Chapter): boolean {
  for (const node of Object.values(chapter.nodes)) {
    const starts = [...new Set(node.choices.map(choice => choice.nextNodeId))];
    if (starts.length < 3) continue;

    const candidates = starts.map(start => {
      const branchNode = chapter.nodes[start];
      if (!branchNode) return [] as Array<readonly [string, string]>;
      return [...new Set(branchNode.choices.map(choice => choice.nextNodeId))]
        .filter(next => next !== start && chapter.nodes[next])
        .map(next => [start, next] as const);
    });

    const chooseDisjoint = (branchIndex: number, used: Set<string>, chosen: number): boolean => {
      if (chosen >= 3) return true;
      if (branchIndex >= candidates.length || chosen + candidates.length - branchIndex < 3) return false;
      for (const path of candidates[branchIndex]) {
        if (path.some(id => used.has(id))) continue;
        const nextUsed = new Set(used);
        path.forEach(id => nextUsed.add(id));
        if (chooseDisjoint(branchIndex + 1, nextUsed, chosen + 1)) return true;
      }
      return chooseDisjoint(branchIndex + 1, used, chosen);
    };

    if (chooseDisjoint(0, new Set(), 0)) return true;
  }
  return false;
}

function hasEarlyConsequence(chapter: Chapter): boolean {
  const depths = new Map<string, number>([[chapter.startNodeId, 0]]);
  const queue = [chapter.startNodeId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const depth = depths.get(id) ?? 0;
    const node = chapter.nodes[id];
    if (!node || depth > 4) continue;
    if (node.choices.some(choice =>
      Object.keys(choice.setsFlags ?? {}).length > 0
      || Object.keys(choice.adjustsValues ?? {}).length > 0
    )) return true;
    for (const choice of node.choices) {
      if (!depths.has(choice.nextNodeId)) {
        depths.set(choice.nextNodeId, depth + 1);
        queue.push(choice.nextNodeId);
      }
    }
  }
  return false;
}
