// ============================================================
// CHAPTER API ROUTE - Generates the next chapter with the LLM
// The model writes prose and structure; this route is the gate.
// Nothing leaves here that has not passed both the zod schema and
// the structural validator, so the client can load it blindly.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import {
  ChapterSchema, coerceChapterShape, normalizeChapter, validateChapter, type Chapter,
} from '../../../engine/chapter';
import {
  OutlineSchema, buildChapterMessages, buildOutlineMessages, buildRepairMessages, trimOutline,
  type ChapterOutline, type ChapterRequest,
} from '../../../ai/chapterPrompt';

const NAN_BASE_URL = process.env.NAN_BASE_URL || 'https://api.nan.builders/v1';
const NAN_API_KEY = process.env.NAN_API_KEY || '';
// Primary writer: fast, finishes long JSON in one pass.
const MODEL = process.env.NAN_CHAPTER_MODEL || 'qwen3.6';
// Fallback writer: used when the primary keeps failing a repair. It receives
// the exact broken JSON qwen produced and continues from it (the repair pass
// already feeds the previous draft forward), so the two models unify into one
// chapter instead of racing to write it from scratch.
const FALLBACK_MODEL = process.env.NAN_CHAPTER_FALLBACK_MODEL || 'deepseek-v4-flash';

// How many repair chances each model gets before the other steps in.
const PRIMARY_REPAIR_ATTEMPTS = 2;
const FALLBACK_REPAIR_ATTEMPTS = 2;
/** Gateway timeouts and empty streams are not the model's fault; they get their own retries. */
const MAX_TRANSPORT_RETRIES = 2;

// ---------------------------------------------------------------------------
// In-memory chapter cache + in-flight coalescing.
// The game spends 2.5-5 min per generated chapter, so identical requests (a
// retry after a timeout, a reload, many players on identical history + gear)
// must NOT each burn another LLM run. Two mechanisms:
//   - inflight: same request key while an LLM call is running → both callers
//     await the SAME promise (NaN caps concurrency at 5; this collapses N
//     duplicite runs into one).
//   - cache (LRU + TTL): a finished chapter for a request key is served from
//     memory instantly. In-memory only, no DB: a pod restart just cold-caches.
// Keys hash the FULL request — a different chronicle or inventory is a
// different story and must not be served from another player's chapter.
// ---------------------------------------------------------------------------
const CACHE_LIMIT = 128;
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2h

interface CacheEntry { chapter: Chapter; outline: ChapterOutline; attempts: number; model: string; ts: number; }

const chapterCache = new Map<string, CacheEntry>();
/** key -> promise of a generated chapter; identical requests wait on this. */
const inflight = new Map<string, Promise<CacheEntry>>();

/** Deterministic id for a generation request. Bad/absent entries never collide
 *  because they are serialized the way the route builds the LLM call. */
function requestHash(request: ChapterRequest): string {
  const canonical = JSON.stringify({
    nextIndex: request.nextIndex,
    chronicle: request.chronicle ?? [],
    hero: request.hero,
    language: request.language,
    usedIds: [...(request.usedIds ?? [])].sort(),
  });
  return createHash('sha1').update(canonical).digest('hex').slice(0, 24);
}

function cacheGet(key: string): CacheEntry | null {
  const entry = chapterCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { chapterCache.delete(key); return null; }
  return entry;
}

function cacheSet(key: string, entry: CacheEntry): void {
  if (chapterCache.has(key)) chapterCache.delete(key);
  chapterCache.set(key, entry);
  if (chapterCache.size > CACHE_LIMIT) {
    const oldest = chapterCache.keys().next().value;
    if (oldest !== undefined) chapterCache.delete(oldest);
  }
}

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

class TruncatedResponse extends Error {
  constructor(readonly partial: string) {
    super('the model ran out of tokens before finishing the JSON');
  }
}

/**
 * Streamed on purpose. A whole chapter takes minutes to write, and a silent
 * connection that long gets killed by the gateway (Cloudflare 524) long before
 * the model is done. Streaming keeps bytes moving, so the request survives.
 */
async function callLLM(messages: Message[], maxTokens: number, temperature: number, model: string): Promise<string> {
  const res = await fetch(`${NAN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NAN_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'User-Agent': 'the-gauntlet/1.0',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      stream: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    const message = `NaN API error ${res.status}: ${summariseUpstreamError(body)}`;
    throw res.status >= 500 || res.status === 429 ? new TransportError(message) : new Error(message);
  }
  if (!res.body) throw new TransportError('NaN API returned no body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let finishReason: string | null = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') continue;

      try {
        const chunk = JSON.parse(payload);
        const choice = chunk.choices?.[0];
        content += choice?.delta?.content ?? '';
        if (choice?.finish_reason) finishReason = choice.finish_reason;
      } catch {
        // A partial SSE frame; the next read completes it.
      }
    }
  }

  // A truncated answer is never valid JSON; say so plainly instead of
  // reporting a confusing parse error at some arbitrary character offset.
  if (finishReason === 'length') throw new TruncatedResponse(content);
  if (!content.trim()) throw new TransportError('the model returned an empty response');
  return content;
}

class TransportError extends Error {}

/**
 * Retries transport failures (gateway timeouts, dropped streams) in place, so a
 * flaky minute never eats one of the model's three chances to get it right.
 */
async function callLLMWithRetries(messages: Message[], maxTokens: number, temperature: number, model: string): Promise<string> {
  let lastError: unknown;
  for (let retry = 0; retry <= MAX_TRANSPORT_RETRIES; retry++) {
    try {
      return await callLLM(messages, maxTokens, temperature, model);
    } catch (error) {
      if (!(error instanceof TransportError)) throw error;
      lastError = error;
      console.warn(`Transport retry ${retry + 1} (${model}): ${(error as Error).message}`);
    }
  }
  throw lastError;
}

/** Gateways answer with whole HTML pages; keep the log readable. */
function summariseUpstreamError(body: string): string {
  if (!/<html/i.test(body)) return body.slice(0, 300);
  const title = /<title>([^<]*)<\/title>/i.exec(body)?.[1]?.trim();
  return title ? `${title} (gateway HTML response)` : 'gateway HTML response';
}

/** Models sometimes wrap JSON in a fence or a sentence; take the outermost object. */
function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('response contained no JSON object');
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function schemaIssues(parsed: ReturnType<typeof ChapterSchema.safeParse>): string[] {
  if (parsed.success) return [];
  // Repeated paths are noise for the model; keep the first issue per path.
  const seen = new Set<string>();
  const issues: string[] = [];
  for (const issue of parsed.error.issues) {
    const path = issue.path.join('.') || '(root)';
    if (seen.has(path)) continue;
    seen.add(path);
    issues.push(`${path}: ${issue.message}`);
  }
  return issues.slice(0, 25);
}

function inspect(candidate: unknown, usedIds: Set<string>): { chapter?: Chapter; issues: string[] } {
  const parsed = ChapterSchema.safeParse(coerceChapterShape(candidate));
  const issues = schemaIssues(parsed);
  if (!parsed.success) return { issues };

  // Bookkeeping is repaired here; only design problems go back to the model.
  const { chapter, notes } = normalizeChapter(parsed.data as unknown as Chapter);
  if (notes.length > 0) console.info(`Normalised chapter: ${notes.length} fix(es)`, notes.slice(0, 10));

  const structural = validateChapter(chapter, usedIds);
  if (structural.length > 0) return { issues: structural.slice(0, 25) };

  return { chapter, issues: [] };
}

export async function POST(req: NextRequest) {
  if (!NAN_API_KEY) {
    return NextResponse.json({ error: 'NAN_API_KEY not configured' }, { status: 500 });
  }

  let request: ChapterRequest;
  try {
    request = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }

  if (typeof request.nextIndex !== 'number' || !request.hero) {
    return NextResponse.json({ error: 'nextIndex and hero are required' }, { status: 400 });
  }
  request.usedIds ??= [];
  request.chronicle ??= [];
  request.language = request.language === 'es' ? 'es' : 'en';

  // ---- Cache / coalescing gate ----
  const key = requestHash(request);

  // 1. A finished chapter for this exact request? Serve it without the LLM.
  const cached = cacheGet(key);
  if (cached) {
    console.info(`Chapter cache HIT for ${key} (${cached.model}, ${cached.attempts} attempt(s))`);
    return NextResponse.json({
      chapter: cached.chapter, outline: cached.outline,
      attempts: cached.attempts, model: cached.model, cached: true,
    });
  }

  // 2. Identical request already mid-flight? Await the same promise; this is
  //    what collapses N concurrent equal runs into one LLM call (NaN ≤5).
  //    The promise is cleared both on success and on failure so a later retry
  //    does not deadlock on a stale rejection.
  const inflightKey = key;
  const existing = inflight.get(inflightKey);
  if (existing) {
    console.info(`Coalescing duplicate chapter request ${key} onto an in-flight run`);
    try {
      const entry = await existing;
      return NextResponse.json({
        chapter: entry.chapter, outline: entry.outline,
        attempts: entry.attempts, model: entry.model,
      });
    } catch {
      // The in-flight run failed; fall through to start a fresh one below.
    }
  }

  let resolveRun!: (entry: CacheEntry) => void;
  let rejectRun!: (err: unknown) => void;
  const run = new Promise<CacheEntry>((resolve, reject) => { resolveRun = resolve; rejectRun = reject; });
  inflight.set(inflightKey, run);

  try {
    const entry = await generateChapterFor(request);
    cacheSet(key, entry);
    resolveRun(entry);
    return NextResponse.json({
      chapter: entry.chapter, outline: entry.outline,
      attempts: entry.attempts, model: entry.model,
    });
  } catch (error) {
    rejectRun(error);
    const message = error instanceof Error ? error.message : String(error);
    if (error instanceof CachedGenerationError) {
      return NextResponse.json({ error: error.tag, issues: error.issues }, { status: error.status });
    }
    return NextResponse.json({ error: message, issues: [] }, { status: 500 });
  } finally {
    inflight.delete(inflightKey);
  }
}

/** A generation failure that carries structured issues instead of a thrown message. */
class CachedGenerationError extends Error {
  constructor(readonly tag: string, readonly issues: string[], readonly status: number) {
    super(tag);
  }
}

async function generateChapterFor(request: ChapterRequest): Promise<CacheEntry> {
  const usedIds = new Set(request.usedIds);

  const t0 = Date.now();
  const clock = (label: string) => console.info(`[timing] ${label}: ${Math.round((Date.now() - t0) / 1000)}s`);

  // ---- Pass 1: outline. Small, cheap, and worth retrying on its own. ----
  let outline: ChapterOutline | null = null;
  const outlineIssues: string[] = [];
  // The outline is tiny and cheap; the primary model usually nails it, and when
  // it returns an empty/truncated object another primary attempt is the fastest
  // recovery. The fallback only enters for a transport-level failure (its long
  // warm-up and tight cap are a poor fit for a small JSON).
  const outlineModels = [MODEL, MODEL, FALLBACK_MODEL];
  for (let attempt = 0; attempt < outlineModels.length && !outline; attempt++) {
    const model = outlineModels[attempt];
    try {
      const raw = await callLLMWithRetries(buildOutlineMessages(request), 12000, 0.9, model);
      const parsed = OutlineSchema.safeParse(extractJson(raw));
      if (parsed.success) outline = trimOutline(parsed.data);
      else {
        outlineIssues.push(...parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`));
        console.warn(`Outline rejected (${model}). Raw head:`, raw.slice(0, 400));
      }
    } catch (error) {
      outlineIssues.push(`${model}: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof TruncatedResponse) {
        console.warn(`Outline truncated (${model}). Partial head:`, error.partial.slice(0, 400));
      }
    }
  }

  if (!outline) {
    console.error('Chapter outline failed:', outlineIssues);
    throw new CachedGenerationError('chapter_outline_failed', outlineIssues.slice(0, 10), 422);
  }
  clock('outline done');

  // ---- Pass 2: chapter. Parallel on purpose — NaN allows 5 concurrents and a
  // chapter takes minutes, so three drafts of the same outline run at once and
  // the first one that validates wins. The repair round then feeds the best
  // draft forward to whichever model can finish it.
  let lastRaw = '';
  let lastIssues: string[] = [];

  const roundA = await raceFirst(
    generateChapter(MODEL, buildChapterMessages(request, outline), 0.8, usedIds),
    generateChapter(MODEL, buildChapterMessages(request, outline), 0.55, usedIds),
    generateChapter(MODEL, buildChapterMessages(request, outline), 0.7, usedIds),
  );
  if (roundA.valid) {
    clock('round A validated');
    return { chapter: roundA.valid, outline, attempts: 1, model: roundA.validModel ?? MODEL, ts: Date.now() };
  }
  const losers = roundA.drafts;
  clock(`round A failed (${losers.map(d => d.issueCount).join(',')})`);
  const best = [...losers].sort((a, b) => a.issueCount - b.issueCount)[0];
  lastRaw = best?.raw ?? '';
  lastIssues = best?.issues ?? ['the model returned nothing usable'];

  const roundB = await raceFirst(
    generateChapter(MODEL, buildRepairMessages(request, outline, lastRaw, lastIssues), 0.4, usedIds),
    generateChapter(FALLBACK_MODEL, buildRepairMessages(request, outline, lastRaw, lastIssues), 0.4, usedIds, true),
  );
  if (roundB.valid) {
    clock('round B validated');
    return { chapter: roundB.valid, outline, attempts: 2, model: roundB.validModel ?? FALLBACK_MODEL, ts: Date.now() };
  }
  const repairIssues: string[] = [];
  for (const draft of roundB.drafts) repairIssues.push(...draft.issues);
  clock('round B failed');

  throw new CachedGenerationError('chapter_validation_failed', repairIssues.slice(0, 15), 422);
}

/** Runs one model pass and inspects the result. Never throws for a bad draft:
 *  it returns a scored draft object so the parallel round can pick the best. */
async function generateChapter(
  model: string,
  messages: Message[],
  temperature: number,
  usedIds: Set<string>,
  tight = false,
): Promise<{ chapter?: Chapter; raw: string; issues: string[]; issueCount: number; model: string }> {
  // Every writer is nudged toward a compact chapter (a shrunk, valid run beats
  // a long one that truncates or drifts). The fallback gets the harder budget
  // because it caps its output below what the primary can emit.
  if (tight) {
    const last = messages[messages.length - 1];
    last.content += '\n\nHARD BUDGET: the ENTIRE chapter JSON must fit in about 12,000 characters. Keep prose to 1-2 sentences per node, keep every required field and every referenced id valid, and close every JSON brace. A short valid chapter beats a long broken one.';
  } else {
    const last = messages[messages.length - 1];
    last.content += '\n\nKEEP IT TIGHT: 10-14 nodes, 1-2 sentences per node. Every nextNodeId must name a real node you defined in this exact JSON — a choice that points nowhere is dropped and can break the graph. Prefer reusing a node over inventing one.';
  }

  try {
    const raw = await callLLMWithRetries(messages, 32000, temperature, model);
    const candidate = extractJson(raw);
    const { chapter, issues } = inspect(candidate, usedIds);
    if (!chapter && issues.length <= 8) {
      console.warn(`[${model}] draft rejected (${issues.length}):`, issues.join(' | '));
    }
    return { chapter, raw, issues, issueCount: issues.length, model };
  } catch (error) {
    const partial = error instanceof TruncatedResponse ? error.partial : '';
    const issues = [
      error instanceof TruncatedResponse
        ? 'The JSON was cut off before it ended. Return the whole chapter again, complete and closed, and keep the prose shorter so it fits.'
        : error instanceof Error ? error.message : String(error),
    ];
    return { chapter: undefined, raw: partial, issues, issueCount: 999, model };
  }
}

type Draft = { chapter?: Chapter; raw: string; issues: string[]; issueCount: number; model: string };

/**
 * Resolves the first draft that produced a VALID chapter, without waiting for
 * the slowest request. The round is only "lost" when every draft has settled
 * and none validated — then all drafts are handed back so the caller can pick
 * the least-broken one to repair. This is the difference between "max of the
 * two calls" and "sum of the two calls" — the whole point of the parallelism.
 */
async function raceFirst(
  ...drafts: Promise<Draft>[]
): Promise<{ valid?: Chapter; validModel?: string; drafts: Draft[] }> {
  const results: Draft[] = [];
  let settled = 0;
  return new Promise<{ valid?: Chapter; validModel?: string; drafts: Draft[] }>((resolve, reject) => {
    for (const draftPromise of drafts) {
      draftPromise.then((draft) => {
        results.push(draft);
        if (draft.chapter) {
          resolve({ valid: draft.chapter, validModel: draft.model, drafts: results });
          return;
        }
        settled += 1;
        if (settled === drafts.length) {
          resolve({ drafts: results });
        }
      }).catch(reject);
    }
  });
}
