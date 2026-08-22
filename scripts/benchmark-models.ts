// ============================================================
// CHAPTER BENCHMARK — runs the REAL full-chapter generation path
// (buildChapterMessages -> stream -> extractJson -> ChapterSchema
// + coerce + normalize + validateChapter) against each model.
// Answers: which model reliably produces a VALID playable chapter
// without running out of tokens mid-JSON.
//
// Testing/benchmark utility, not part of the game runtime.
// Deliberately loose types so schema drift never blocks comparing models.
/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================

import { buildOutlineMessages, buildChapterMessages, buildRepairMessages, trimOutline, OutlineSchema } from '../src/ai/chapterPrompt';
import { ChapterSchema, coerceChapterShape, normalizeChapter, validateChapter } from '../src/engine/chapter';

const NAN_BASE_URL = process.env.NAN_BASE_URL || 'https://api.nan.builders/v1';
const NAN_API_KEY = process.env.NAN_API_KEY || '';
const MAX_CHAP_TOKENS = 32000;
const MODELS = process.argv.slice(2).length ? process.argv.slice(2) : ['deepseek-v4-flash'];

function makeRequest() {
  return {
    nextIndex: 3,
    chronicle: [
      { index: 1, title: 'The Chapel Ledger', titleEs: 'El Registro de la Capilla', endingTitle: 'The Drowned Door Opens', endingTitleEs: 'La Puerta Ahogada se Abre', outcome: 'success', route: 'direct', keyFlags: ['chapel_ledger_decoded', 'tunnel_map'], puzzlesSolved: ['c1_chapel_ledger'], survivors: ['martik'], casualties: [], values: { compassion: 2, pride: -1 } },
      { index: 2, title: 'The Bell That Counts', titleEs: 'La Campana que Cuenta', endingTitle: 'The Veil Sings', endingTitleEs: 'El Velo Canta', outcome: 'failure', route: 'council', keyFlags: [], puzzlesSolved: [], survivors: [], casualties: ['varen'], values: { compassion: 1 } },
    ],
    hero: {
      name: 'Alexei', level: 3, archetype: 'rogue', origin: 'ashenvale', hp: 24, maxHp: 28, mp: 18, maxMp: 22, gold: 140,
      items: [
        { templateId: 'rusty_key', name: 'Rusty Key', nameEs: 'Llave Oxidada', rarity: 'common', type: 'misc', description: 'An old iron key.' },
        { templateId: 'c2_moonreliquary', name: 'Moon Reliquary', nameEs: 'Relicario Lunar', rarity: 'rare', type: 'relic', slot: 'relic', description: 'A silver reliquary that hums in moonlight.' },
      ],
      equipped: [{ templateId: 'c2_moonreliquary', name: 'Moon Reliquary', nameEs: 'Relicario Lunar', rarity: 'rare', type: 'relic', slot: 'relic', description: 'A silver reliquary.' }],
      notableItems: ['Rusty Key', 'Moon Reliquary'],
      spells: ['Shadow Bolt'],
    },
    language: 'en',
    usedIds: ['c1_tab', 'c1_chapel_ledger', 'c1_drowned_door_runes', 'c1_priest_sera', 'c1_warden', 'c2_bell', 'c2_varen'],
  };
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(trimmed); } catch {
    const start = trimmed.indexOf('{'); const end = trimmed.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('no JSON');
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function schemaIssues(parsed: { success: boolean }): string[] {
  if (parsed.success) return [];
  return [];
}

function inspect(candidate: unknown): { ok: boolean; issues: string[] } {
  const parsed: any = ChapterSchema.safeParse(coerceChapterShape(candidate));
  if (!parsed.success) {
    const seen = new Set<string>(); const issues: string[] = [];
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.') || '(root)';
      if (seen.has(path)) continue; seen.add(path);
      issues.push(`${path}: ${issue.message}`);
    }
    return { ok: false, issues: issues.slice(0, 20) };
  }
  const { chapter, notes } = normalizeChapter(parsed.data as any);
  const structural = validateChapter(chapter as any, new Set());
  return structural.length > 0 ? { ok: false, issues: structural.slice(0, 20) } : { ok: true, issues: [] };
}

async function callLLM(model: string, messages: any[], maxTokens: number) {
  const t0 = Date.now();
  const res = await fetch(`${NAN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${NAN_API_KEY}`, 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
      max_tokens: maxTokens,
      ...(model.toLowerCase().startsWith('qwen') ? { enable_thinking: false } : {}),
      stream: true,
    }),
  });
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${(await res.text()).slice(0, 150)}`, charLen: 0, ms: Date.now() - t0, content: '', finishReason: null };
  const reader = res.body!.getReader(); const decoder = new TextDecoder();
  let buffer = ''; let content = ''; let finishReason: string | null = null;
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
    for (const line of lines) {
      const t = line.trim(); if (!t.startsWith('data:')) continue;
      const payload = t.slice(5).trim(); if (payload === '[DONE]') continue;
      try { const c = JSON.parse(payload); const ch = c.choices?.[0]; content += ch?.delta?.content ?? ''; if (ch?.finish_reason) finishReason = ch.finish_reason; } catch {}
    }
  }
  return { ok: true, finishReason, content, charLen: content.length, ms: Date.now() - t0 };
}

(async () => {
  if (!NAN_API_KEY) { console.error('NAN_API_KEY required'); process.exit(1); }
  const request = makeRequest();

  // Build outlines ONCE with a fast model so every chapter test sees the same
  // approved outline (otherwise later models get an easier or harder task).
  let outline: any;
  try {
    const msg = buildOutlineMessages(request as any);
    const r = await callLLM('qwen3.6', msg, 12000);
    if (!r.ok || !r.content.trim()) { console.error('baseline outline failed:', r.error); process.exit(1); }
    outline = trimOutline(OutlineSchema.parse(extractJson(r.content)));
    console.log('Baseline outline from qwen3.6:', outline.title, '| beats:', outline.beats.length, '| places:', outline.places.length);
  } catch (e: any) { console.error('Could not build baseline outline:', String(e.message).slice(0, 120)); process.exit(1); }

  console.log('\n=== FULL CHAPTER BENCHMARK (max_tokens=%d, with repair loop) ===', MAX_CHAP_TOKENS);
  for (const model of MODELS) {
    let messages: any[] = buildChapterMessages(request as any, outline as any);
    let verdict = '';
    let lastCharLen = 0;
    let lastMs = 0;
    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await callLLM(model, messages, MAX_CHAP_TOKENS);
      lastCharLen = r.charLen;
      lastMs = r.ms;
      if (!r.ok) { verdict = `TRANSPORT FAIL ${r.error}`; break; }
      if (r.finishReason === 'length' || r.charLen === 0) { verdict = `TRUNCATED (finish=${r.finishReason}, ${r.charLen} chars)`; break; }
      try {
        const candidate = extractJson(r.content);
        const insp = inspect(candidate);
        if (insp.ok) { verdict = `VALID CHAPTER ✓ on attempt ${attempt + 1}`; break; }
        if (attempt === 2) { verdict = `INVALID after 3 attempts → ${insp.issues.slice(0, 3).join(' | ')}`; break; }
        messages = buildRepairMessages(request as any, outline as any, r.content, insp.issues);
      } catch (e: any) {
        verdict = `PARSE FAIL → ${String(e.message).slice(0, 80)}`; break;
      }
    }
    console.log(`\n[${model}]\n  chars=${lastCharLen}  ms=${Math.round(lastMs / 1000)}s\n  → ${verdict}`);
  }
})();
