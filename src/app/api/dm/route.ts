// ============================================================
// DM API ROUTE - Calls NaN Builders LLM for narration
// The AI receives game events and generates narrative.
// It NEVER modifies authoritative state.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

const NAN_BASE_URL = process.env.NAN_BASE_URL || 'https://api.nan.builders/v1';
const NAN_API_KEY = process.env.NAN_API_KEY || '';

interface DMRequest {
  systemPrompt: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Cuts a truncated answer back to its last finished sentence. The narrator runs
 * on a reasoning model, so hidden reasoning can eat the token budget and leave
 * the prose stopping mid-word; half a sentence reads as a bug to the player.
 */
function trimToLastSentence(text: string): string {
  const end = Math.max(text.lastIndexOf('.'), text.lastIndexOf('!'), text.lastIndexOf('?'));
  if (end < 0) return '';
  return text.slice(0, end + 1).trim();
}

async function callNaN(body: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${NAN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NAN_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'the-gauntlet/1.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`NaN API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  const content: string = choice?.message?.content || '';
  return choice?.finish_reason === 'length' ? trimToLastSentence(content) : content;
}

export async function POST(req: NextRequest) {
  if (!NAN_API_KEY) {
    return NextResponse.json(
      { error: 'NAN_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const body: DMRequest = await req.json();

    const response = await callNaN({
      model: 'deepseek-v4-flash',
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.maxTokens ?? 1200,
      stream: false,
    });

    return NextResponse.json({ content: response });
  } catch (error) {
    console.error('DM API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate narration' },
      { status: 500 }
    );
  }
}
