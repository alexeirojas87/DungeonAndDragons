// ============================================================
// CHAPTER API ROUTE - Generates the next chapter with the LLM
// The model writes prose and structure; this route is the gate.
// Nothing leaves here that has not passed both the zod schema and
// the structural validator, so the client can load it blindly.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  ChapterSchema, coerceChapterShape, normalizeChapter, validateChapter, type Chapter,
} from '../../../engine/chapter';
import {
  OutlineSchema, buildChapterMessages, buildOutlineMessages, buildRepairMessages, trimOutline,
  type ChapterOutline, type ChapterRequest,
} from '../../../ai/chapterPrompt';

const NAN_BASE_URL = process.env.NAN_BASE_URL || 'https://api.nan.builders/v1';
const NAN_API_KEY = process.env.NAN_API_KEY || '';
const MODEL = process.env.NAN_CHAPTER_MODEL || 'deepseek-v4-flash';

const MAX_REPAIR_ATTEMPTS = 3;
/** Gateway timeouts and empty streams are not the model's fault; they get their own retries. */
const MAX_TRANSPORT_RETRIES = 2;

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
async function callLLM(messages: Message[], maxTokens: number, temperature: number): Promise<string> {
  const res = await fetch(`${NAN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NAN_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'User-Agent': 'the-gauntlet/1.0',
    },
    body: JSON.stringify({
      model: MODEL,
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
async function callLLMWithRetries(messages: Message[], maxTokens: number, temperature: number): Promise<string> {
  let lastError: unknown;
  for (let retry = 0; retry <= MAX_TRANSPORT_RETRIES; retry++) {
    try {
      return await callLLM(messages, maxTokens, temperature);
    } catch (error) {
      if (!(error instanceof TransportError)) throw error;
      lastError = error;
      console.warn(`Transport retry ${retry + 1}: ${(error as Error).message}`);
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

  const usedIds = new Set(request.usedIds);

  // ---- Pass 1: outline. Small, cheap, and worth retrying on its own. ----
  let outline: ChapterOutline | null = null;
  const outlineIssues: string[] = [];
  for (let attempt = 0; attempt < 2 && !outline; attempt++) {
    try {
      const raw = await callLLMWithRetries(buildOutlineMessages(request), 12000, 0.9);
      const parsed = OutlineSchema.safeParse(extractJson(raw));
      if (parsed.success) outline = trimOutline(parsed.data);
      else {
        outlineIssues.push(...parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`));
        console.warn('Outline rejected. Raw head:', raw.slice(0, 400));
      }
    } catch (error) {
      outlineIssues.push(error instanceof Error ? error.message : String(error));
      if (error instanceof TruncatedResponse) {
        console.warn('Outline truncated. Partial head:', error.partial.slice(0, 400));
      }
    }
  }

  if (!outline) {
    console.error('Chapter outline failed:', outlineIssues);
    return NextResponse.json(
      { error: 'chapter_outline_failed', issues: outlineIssues.slice(0, 10) },
      { status: 422 },
    );
  }

  // ---- Pass 2: full chapter, then repair until it validates or we give up. ----
  let lastRaw = '';
  let lastIssues: string[] = [];

  for (let attempt = 0; attempt < MAX_REPAIR_ATTEMPTS; attempt++) {
    const messages = attempt === 0
      ? buildChapterMessages(request, outline)
      : buildRepairMessages(request, outline, lastRaw, lastIssues);

    try {
      lastRaw = await callLLMWithRetries(messages, 32000, attempt === 0 ? 0.8 : 0.4);
      const candidate = extractJson(lastRaw);
      const { chapter, issues } = inspect(candidate, usedIds);

      if (chapter) {
        return NextResponse.json({ chapter, outline, attempts: attempt + 1 });
      }

      lastIssues = issues;
      console.warn(`Chapter attempt ${attempt + 1} rejected:`, issues);
    } catch (error) {
      if (error instanceof TruncatedResponse) {
        // Keep the partial so the repair pass can finish it rather than restart.
        lastRaw = error.partial;
        lastIssues = ['The JSON was cut off before it ended. Return the whole chapter again, complete and closed, and keep the prose shorter so it fits.'];
      } else {
        lastIssues = [error instanceof Error ? error.message : String(error)];
      }
      console.warn(`Chapter attempt ${attempt + 1} threw:`, lastIssues);
    }
  }

  return NextResponse.json(
    { error: 'chapter_validation_failed', issues: lastIssues.slice(0, 15) },
    { status: 422 },
  );
}
