// ============================================================
// DM CLIENT - Calls the DM API route from the browser
// ============================================================

import type { GameState, Language, NPC, WorldLocation } from '../engine/types';

const DM_SYSTEM_PROMPT = `You are the Dungeon Master for a dark fantasy RPG called "The Gauntlet".

ROLE: You describe what happens. The game engine already resolved the action.

RULES:
1. NEVER modify game state
2. NEVER invent dice results
3. Keep responses SHORT (2-4 sentences max)
4. Match intensity to situation
5. Use sensory details but be concise
6. If player talks to an NPC, describe the NPC's reaction briefly
7. If player examines something, describe what they notice
8. If player moves, describe the transition
9. Avoid over-describing simple actions
10. Respond in the same language as the user
11. Treat STORY FACTS as authoritative; never deny an ally, item, promise, route, or consequence listed there
12. If the engine result rejects an action but a STORY FACT directly supports it, describe the supported attempt without erasing that fact
13. NEVER invent walls, rubble, false doors or dead ends across a listed EXIT. If the player moves toward one, describe the passage and the transition through it
14. NEVER stop mid-sentence. Finish every sentence you start

STYLE:
- Punchy, atmospheric prose
- Not every action needs a paragraph
- Silence is powerful
- Action beats description
- Think "show, don't tell"

FORMAT: Return ONLY the narrative text. No quotes, no markdown.`;

export interface DMContext {
  gameState: GameState;
  location: WorldLocation | undefined;
  npcs: NPC[];
  playerAction: string;
  actionResult: string;
  language: Language;
  combatActive: boolean;
}

export async function callDM(context: DMContext): Promise<string> {
  const { gameState, location, npcs, playerAction, actionResult, language, combatActive } = context;

  // Build context messages
  const contextParts: string[] = [];

  // Current state
  const player = gameState.party[0];
  // Names must be given in the language being played, or the narrator writes
  // "hacia el Guardian's Chamber" in the middle of Spanish prose.
  const es = language === 'es';
  const nameOf = (place: { name: string; nameEs: string } | undefined): string =>
    place ? (es ? place.nameEs : place.name) : (es ? 'Desconocido' : 'Unknown');

  if (player) {
    contextParts.push(`PLAYER: ${player.name}, Level ${player.level} ${player.archetype}, origin ${player.origin}`);
    contextParts.push(`HP: ${player.hp}/${player.maxHp}, MP: ${player.mp}/${player.maxMp}, AC: ${player.ac}, Gold: ${player.gold}`);
    contextParts.push(`Location: ${nameOf(location)}`);
  }

  // Location description
  if (location) {
    contextParts.push(`\nLOCATION: ${nameOf(location)}`);
    contextParts.push(es ? location.descriptionEs : location.description);

    // The narrator kept inventing collapsed walls and false doors across real
    // exits, which reads to the player as a dead end and stalls the chapter.
    const exits = location.connections
      .map(id => gameState.worldState.locations[id])
      .filter(Boolean)
      .map(target => nameOf(target));
    if (exits.length > 0) {
      contextParts.push(`EXITS (these passages EXIST and are open; never describe them as blocked, collapsed, sealed or false): ${exits.join(', ')}`);
    }
  }

  // NPCs present
  if (npcs.length > 0) {
    contextParts.push(`\nNPCs PRESENT:`);
    for (const npc of npcs) {
      contextParts.push(`- ${es ? npc.nameEs : npc.name} (${es ? npc.occupationEs : npc.occupation}). Disposition: ${npc.disposition}. ${es ? npc.personalityEs : npc.personality}`);
    }
  }

  // Combat state
  if (combatActive && gameState.combat) {
    const enemies = gameState.combat.initiativeOrder.filter(c => c.type === 'enemy' && c.isAlive);
    contextParts.push(`\nCOMBAT ACTIVE - Round ${gameState.combat.round}`);
    contextParts.push(`Enemies: ${enemies.map(e => `${es ? e.nameEs : e.name} (${e.hp}/${e.maxHp} HP)`).join(', ')}`);
  }

  // Quest state
  const activeQuests = gameState.quests.filter(q => q.state === 'active' || q.state === 'updated');
  if (activeQuests.length > 0) {
    contextParts.push(`\nACTIVE QUESTS: ${activeQuests.map(q => es ? q.nameEs : q.name).join(', ')}`);
  }

  // Authoritative facts come from the active chapter's own declarations plus the
  // chronicle, so a generated chapter narrates correctly without engine changes.
  const storyFacts: string[] = [];
  if (gameState.story.route) storyFacts.push(`Chosen route: ${gameState.story.route}`);

  const chapter = gameState.chapters?.[gameState.activeChapterIndex];
  for (const fact of chapter?.storyFacts ?? []) {
    if (!gameState.flags[fact.flag]) continue;
    const spent = fact.spentFlag ? gameState.flags[fact.spentFlag] : false;
    const plain = es ? (fact.es ?? fact.en) : fact.en;
    const worn = es ? (fact.spentEs ?? fact.spentEn) : fact.spentEn;
    storyFacts.push(spent && worn ? worn : plain);
  }

  const solvedPuzzles = (gameState.worldState.solvedPuzzles ?? [])
    .map(id => chapter?.puzzles?.[id])
    .filter(Boolean)
    .map(puzzle => es ? puzzle!.titleEs : puzzle!.title);
  if (solvedPuzzles.length > 0) {
    storyFacts.push(`The player already solved: ${solvedPuzzles.join(', ')}`);
  }

  if (storyFacts.length > 0) contextParts.push(`\nSTORY FACTS (AUTHORITATIVE):\n- ${storyFacts.join('\n- ')}`);

  const chronicle = gameState.chronicle ?? [];
  if (chronicle.length > 0) {
    const previously = chronicle.slice(-3).map(entry =>
      `Chapter ${entry.index} "${es ? entry.titleEs : entry.title}" ended as "${es ? entry.endingTitleEs : entry.endingTitle}" (${entry.outcome})`
    );
    contextParts.push(`\nPREVIOUSLY (AUTHORITATIVE, never contradict):\n- ${previously.join('\n- ')}`);
  }

  const systemMessage = `${DM_SYSTEM_PROMPT}\n\n---GAME CONTEXT---\n${contextParts.join('\n')}`;

  const messages = [
    { role: 'system' as const, content: systemMessage },
    { role: 'user' as const, content: `Player action: "${playerAction}"\n\nResult: ${actionResult}\n\nDescribe what happens next (1-3 paragraphs, in ${language === 'es' ? 'Spanish' : 'English'}):` },
  ];

  try {
    const res = await fetch('/api/dm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        temperature: 0.7,
        maxTokens: 1600,
      }),
    });

    if (!res.ok) {
      console.warn('DM API failed, using fallback');
      return '';
    }

    const data = await res.json();
    return data.content || '';
  } catch (err) {
    console.warn('DM API error:', err);
    return '';
  }
}

export async function generateNPCDialogue(
  npc: NPC,
  playerInput: string,
  language: Language,
  npcDialogueText: string
): Promise<string> {
  const systemMessage = `You are ${npc.name}, a ${npc.occupation} in a dark fantasy world.
PERSONALITY: ${language === 'es' ? npc.personalityEs : npc.personality}
KNOWLEDGE: ${npc.knowledge.join(', ')}
DISPOSITION TOWARD PLAYER: ${npc.disposition} (-100 hostile, 0 neutral, 100 friendly)

RULES:
- Stay in character
- Never reveal information the NPC wouldn't know
- Match the NPC's personality and speech patterns
- Keep responses concise (1-3 sentences)
- If the NPC has secrets, hint at them subtly based on disposition
- Respond in ${language === 'es' ? 'Spanish' : 'English'}`;

  const messages = [
    { role: 'system' as const, content: systemMessage },
    { role: 'assistant' as const, content: npcDialogueText },
    { role: 'user' as const, content: playerInput },
  ];

  try {
    const res = await fetch('/api/dm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        temperature: 0.8,
        maxTokens: 1600,
      }),
    });

    if (!res.ok) return '';
    const data = await res.json();
    return data.content || '';
  } catch {
    return '';
  }
}
