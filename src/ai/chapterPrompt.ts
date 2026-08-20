// ============================================================
// CHAPTER GENERATION PROMPTS
// Two passes: a small outline that is cheap to validate, then the
// full Chapter JSON built from the approved outline. The engine
// validates whatever comes back, so these prompts exist to make
// a valid answer likely, not to be trusted.
// ============================================================

import { z } from 'zod';
import { ARCHETYPE_IDS, ORIGIN_IDS, SKILL_IDS, type ChapterSummary } from '../engine/chapter';

export interface HeroItemBrief {
  templateId: string;
  name: string;
  nameEs: string;
  rarity: string;
  type: string;
  slot?: string;
  description: string;
}

export interface HeroBrief {
  name: string;
  level: number;
  archetype: string;
  origin: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  /** Every goal the hero is carrying when the chapter starts. */
  items: HeroItemBrief[];
  /** Currently equipped gear (slot -> item). */
  equipped: HeroItemBrief[];
  notableItems: string[];
  spells: string[];
}

export interface ChapterRequest {
  nextIndex: number;
  chronicle: ChapterSummary[];
  hero: HeroBrief;
  language: 'en' | 'es';
  usedIds: string[];
}

/**
 * Deliberately loose on counts. The outline is a plan, not a contract: if the
 * model brings five NPCs instead of four, trimming is free, whereas rejecting
 * costs a minute and gains nothing.
 */
export const OutlineSchema = z.object({
  title: z.string().min(1),
  titleEs: z.string().min(1),
  premise: z.string().min(1),
  premiseEs: z.string().min(1),
  continuity: z.string().min(1),
  beats: z.array(z.object({
    id: z.string().min(1),
    summary: z.string().min(1),
  })).min(3),
  cast: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    role: z.string().min(1),
  })).min(1),
  places: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    purpose: z.string().min(1),
  })).min(2),
  boss: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    threat: z.string().min(1),
  }),
  puzzles: z.array(z.object({
    id: z.string().min(1),
    kind: z.enum(['riddle', 'mechanism', 'check']),
    unlocks: z.string().min(1),
  })).min(1),
  endings: z.array(z.object({
    id: z.string().min(1),
    summary: z.string().min(1),
  })).min(2),
});

export type ChapterOutline = z.infer<typeof OutlineSchema>;

/** Keeps a chapter within the size the writer pass can actually finish. */
export function trimOutline(outline: ChapterOutline): ChapterOutline {
  return {
    ...outline,
    beats: outline.beats.slice(0, 7),
    cast: outline.cast.slice(0, 4),
    places: outline.places.slice(0, 5),
    puzzles: outline.puzzles.slice(0, 2),
    endings: outline.endings.slice(0, 4),
  };
}

const WORLD_BIBLE = `WORLD
"The Gauntlet" is grim low-fantasy. The village of Blackmere sits below the Sunken Crypt.
Factions: the Blackmere village council (secretive, self-preserving), the Ashen Veil (scholars
of what the Ashen Court sealed away), and whatever survives beneath the Drowned Door.
Tone: restrained, physical, no winking. Violence costs something. Nothing is explained twice.`;

function heroBlock(hero: HeroBrief): string {
  const carried = hero.items.length
    ? hero.items.map(i => `  - ${i.templateId} · ${i.name} (${i.rarity} ${i.type})`).join('\n')
    : '  - (nothing)';
  const equipped = hero.equipped.length
    ? hero.equipped.map(i => `  - ${i.slot ?? 'slot'} · ${i.name} (${i.templateId})`).join('\n')
    : '  - (nothing)';

  return `HERO
${hero.name}, level ${hero.level} ${hero.archetype} of ${hero.origin}.
HP ${hero.hp}/${hero.maxHp}, MP ${hero.mp}/${hero.maxMp}, ${hero.gold} gold.
Spells: ${hero.spells.join(', ') || 'none'}.

ITEMS CARRIED (all real, all in the player's inventory as this chapter begins):
${carried}

EQUIPPED:
${equipped}

ITEM CONTINUITY: make SUCH items matter. Pick at least one carried or equipped item and give it a role
this chapter via supported mechanics ONLY:
  - a location's "requiresKey" set to that item's exact templateId: the engine opens the passage only while the item is held;
  - a location object whose "contains" lists that exact id, so the player must take it (optionally behind a searchDC) to progress a beat;
  - an NPC thread that wants it, and the story later recognizes it (a delivered relic activates a route; a weapon opens a pact, etc.).
To use a carried item here, DECLARE it again in this chapter's "items" map under the EXACT same id (same name/stats is fine);
standard templates (rusty_key, health_potion, etc.) need no redeclaration. If nothing fits the story, say so explicitly in the
continuity note instead of forcing a token reference.`;
}

function chronicleBlock(chronicle: ChapterSummary[]): string {
  if (chronicle.length === 0) return 'PREVIOUSLY\n(nothing yet)';

  const recent = chronicle.slice(-2);
  const older = chronicle.slice(0, -2);

  const lines: string[] = ['PREVIOUSLY'];
  for (const summary of older) {
    lines.push(`- Chapter ${summary.index} "${summary.title}" ended at "${summary.endingTitle}" (${summary.outcome}).`);
  }
  for (const summary of recent) {
    lines.push(`- Chapter ${summary.index} "${summary.title}"`);
    lines.push(`  ending: "${summary.endingTitle}" (${summary.outcome})`);
    if (summary.route) lines.push(`  route taken: ${summary.route}`);
    lines.push(`  facts still true: ${summary.keyFlags.join(', ') || 'none recorded'}`);
    lines.push(`  puzzles solved: ${summary.puzzlesSolved.join(', ') || 'none'}`);
    if (summary.survivors.length) lines.push(`  survivors: ${summary.survivors.join(', ')}`);
    if (summary.casualties.length) lines.push(`  lost: ${summary.casualties.join(', ')}`);
    lines.push(`  moral tally: ${Object.entries(summary.values).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  }
  return lines.join('\n');
}

export function buildOutlineMessages(request: ChapterRequest) {
  const prefix = `c${request.nextIndex}_`;
  const system = `You are the lead writer of an ongoing dark-fantasy campaign. You plan one chapter at a time.

${WORLD_BIBLE}

TASK
Plan chapter ${request.nextIndex}. It must grow directly out of how the previous chapter ended:
name the consequence in the "continuity" field. Do not restart the story or retell chapter 1.

HARD RULES
- Every id you invent must start with "${prefix}" and use only lowercase letters, digits and underscores.
- Plan exactly 2 puzzles. Each one must unlock something concrete that is otherwise locked:
  a tool, a route, an ally, or an ending. Say which, in "unlocks".
- Each puzzle is reached from a beat, so name in its "unlocks" the beat that leads to it.
- Plan 3 to 5 distinct endings with real moral difference between them.
- Beats move forward. If two beats link back to each other, at least one of them must also
  lead onward, or the player walks in circles forever.
- Say where each beat happens: the chapter should travel through its places, not narrate
  a journey from a single room.
- The boss must be beatable by a level ${request.hero.level} hero.

Reply with JSON only, matching this shape exactly:
{"title":"","titleEs":"","premise":"","premiseEs":"","continuity":"",
 "beats":[{"id":"","summary":""}],
 "cast":[{"id":"","name":"","role":""}],
 "places":[{"id":"","name":"","purpose":""}],
 "boss":{"id":"","name":"","threat":""},
 "puzzles":[{"id":"","kind":"riddle|mechanism|check","unlocks":""}],
 "endings":[{"id":"","summary":""}]}`;

  const user = `${chronicleBlock(request.chronicle)}

${heroBlock(request.hero)}

Plan chapter ${request.nextIndex}. JSON only.`;

  return [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: user },
  ];
}

const CHAPTER_SPEC = (prefix: string, index: number, level: number) => `SHAPE (all fields required unless marked optional)
{
 "id": "chapter-${String(index).padStart(2, '0')}",
 "index": ${index},
 "title": "", "titleEs": "",
 "premise": "", "premiseEs": "",
 "intro": [{"type":"system|narration","text":"","textEs":"","mood":"neutral|tense|danger|triumph|horror|humor|mystery"}],
 "startNodeId": "${prefix}...",
 "startLocationId": "${prefix}...",
 "nodes": { "<nodeId>": {
    "id":"<same as key>", "title":"", "titleEs":"", "text":"", "textEs":"",
    "kind":"beat|puzzle|ending",
    "puzzleId":"<only when kind is puzzle; omit the field otherwise>",
    "locationId":"<where this beat happens; the player is moved there on arrival>",
    "terminal": true,          // optional, only on ending nodes
    // A puzzle node still needs real title/text/textEs describing the moment,
    // and it MUST carry "choices": [] — an empty array, never a missing field.
    "choices": [{
      "id":"${prefix}...", "label":"", "labelEs":"", "nextNodeId":"",
      "setsFlags": {"${prefix}flag": true},          // optional
      "adjustsValues": {"compassion": 1},            // optional
      "requires": [{"flag":"${prefix}flag"}],        // optional
      "archetypes": ["warrior"],                     // optional
      "origins": ["ashenvale"],                      // optional
      "result":"", "resultEs":""                     // optional; omit rather than leaving ""
    }]
 }},
 "puzzles": { "<puzzleId>": {
    "id":"<same as key>", "kind":"riddle|mechanism|check",
    "title":"", "titleEs":"", "prompt":"", "promptEs":"",
    "hints":[{"en":"","es":""},{"en":"","es":""}],
    // "unlocks": flags is required; items/nodeId/locationId are optional —
    // OMIT them entirely rather than writing "" or [] you do not mean.
    "unlocks":{"flags":{"${prefix}flag":true}},
    "solvedNodeId":"", "skipNodeId":"",
    // riddle only:    "answers":["water"], "answersEs":["agua"]
    // mechanism only: "steps":["${prefix}a","${prefix}b"], "ordered":true,
    //                 "stepLabels":[{"id":"${prefix}a","label":"","labelEs":""}],
    //                 "onWrongStep":{"en":"","es":""}
    // check only:     "skill":"investigation", "dc":14,
    //                 "clues":[{"id":"${prefix}clue","en":"","es":"","dcReduction":2}]
 }},
"locations": { "<locationId>": {
    "id":"<same as key>", "name":"", "nameEs":"", "description":"", "descriptionEs":"",
    "connections":["<other location ids>"], "npcs":["<npc ids>"], "enemies":["<monster ids>"],
    "objects":[{"id":"","name":"","nameEs":"","description":"","descriptionEs":"",
                "interactable":true,"broken":false,"hidden":false,
                "contains":[""],       // item ids only; optional. Taking it removes it here.
                "searchDC":0},         // optional; the player must beat it to find the contains
    "secrets":[],              // leave this an empty array
    "dangerLevel":0, "discovered":true,
    "requiresKey":"",          // OPTIONAL — exact item templateId (carried or global) that gates entry
    "ambiance":"tavern|dungeon|crypt|forest|town|battle|boss|shop|temple|sewer|outdoor|cave|library|throne",
    // visualType is OPTIONAL — omit it unless it helps choose art from the visual
    // library. When present it is a SEMANTIC WORD ONLY (crypt|dungeon|tavern|
    // temple|forest|cave|tower|library|throne|sewer|swamp|altar|village|pier|
    // dragon-lair|portal|...), NEVER a filesystem path.
    "visualType":"crypt"                                    // optional
  }},
 "npcs": { "<npcId>": {
    "id":"<same as key>", "name":"", "nameEs":"", "portrait":"villager",
    "faction":"<a non-empty word, e.g. blackmere or ashen_veil>",
    "location":"<a location id>", "disposition":0, "alive":true,
    "occupation":"", "occupationEs":"", "personality":"", "personalityEs":"",
    "knowledge":[""], "secrets":[""], "secretsEs":[""], "memory":[], "inventory":[],
    // at least one dialogue node, the first with id "greeting", each with >=1 response
    "dialogue":[{"id":"greeting","text":"","textEs":"",
                 "responses":[{"text":"","textEs":"","nextNodeId":"<another dialogue id or 'end'>"}]}]
 }},
 "monsters": { "<monsterId>": {
    "templateId":"<same as key>", "name":"", "nameEs":"", "portrait":"skeleton",
    "hp":10,"maxHp":10,"ac":12,"attack":13,"damage":"1d8",
    "damageType":"slashing|piercing|bludgeoning|fire|cold|lightning|necrotic|radiant|poison|psychic",
    "abilities":[""], "abilitiesEs":[""], "xpValue":50,
    "loot":[],                 // item IDS only, and only ids you declared in "items"; otherwise []
    "intelligence":6, "morale":80, "conditions":[]
 }},
 "quests": { "<questId>": {
    "id":"<same as key>", "name":"", "nameEs":"", "description":"", "descriptionEs":"",
    "state":"available",
    "objectives":[{"id":"","description":"","descriptionEs":"","completed":false,"current":0,"required":1}],
    "rewards":[{"type":"xp","value":400},{"type":"gold","value":80}],
    "isMain": true
 }},
 "mainQuestId": "<one of the quest ids, the one with isMain true>",
 "hooks": { "bossLocationId":"<location id where the boss waits>",
            "aftermathNodeId":"<node id entered after the boss dies>" },
 "storyFacts": [{"flag":"${prefix}flag","en":"","es":""}],
 "suggestions": { "<locationId>": [{"label":"","labelEs":"","action":"look around"}] },
 "externalEntrySeeds": { "<aftermathNodeId>": [{"${prefix}flag": true}] },
 "summaryFlags": ["${prefix}flag"]
}

RULES THAT WILL BE MACHINE-CHECKED — a chapter that breaks any of them is rejected
1.  Every id starts with "${prefix}" and matches ^[a-z][a-z0-9_]*$. Object keys equal the inner "id".
2.  Every nextNodeId, solvedNodeId, skipNodeId, puzzleId, bossLocationId, aftermathNodeId,
    connection, npc, monster and quest id you reference must exist in this chapter.
3.  Location connections are two-way: if A lists B, B must list A.
4.  Every node is reachable. Every choice is reachable by at least one of the 25
    archetype x origin heroes. Archetypes: ${ARCHETYPE_IDS.join(', ')}. Origins: ${ORIGIN_IDS.join(', ')}.
5.  A choice that "requires" a flag only works if some other choice or puzzle in this
    chapter sets that flag first. Never gate on a flag nothing can set.
6.  Every hero must be able to reach an ending. Check this twice: once assuming every
    puzzle is solved, and once assuming the player abandons every single puzzle.
6b. NO INESCAPABLE LOOPS. This is the most common way a chapter is rejected. If the player
    can travel A -> B -> A, then A or B must ALSO offer a choice that leads onward toward an
    ending. Walk your graph once per node and ask: "standing here, is there a chain of choices
    that ends the chapter?" If the answer is no for any node, the chapter is broken. Hub nodes
    the player can return to are fine, but a hub must always keep an exit open.
7.  Puzzles: exactly 2, at least 2 hints each, solvedNodeId != skipNodeId, and skipNodeId must
    lead somewhere the chapter continues from. Puzzles unlock extras; they never block the path.
    Every puzzle needs a node with "kind":"puzzle" pointing at it, and that node needs a choice
    from a normal beat leading into it — an unreferenced puzzle is deleted before you see it.
8.  Nodes with kind "ending" have "terminal": true and an empty "choices" array.
    Every other node has at least one choice, except kind "puzzle", which has none.
9.  Aftermath node: mark it with "externalEntry": true and list in externalEntrySeeds the
    flags that may already be set when the player reaches it (e.g. items found earlier).
10. Both languages, always. No empty strings anywhere, no placeholders, no "TODO", no English
    text in an "Es" field. Balance for a level ${level} hero: boss 20-32 HP, AC 13-15, damage
    2d8-2d10; lesser enemies 8-16 HP.
11. Arrays that have nothing in them are written as [], never omitted and never left with a
    half-filled object inside. This is the single most common way a chapter gets rejected.
12. Keep it tight: 12-18 nodes, 3-5 locations, 2-4 npcs, 2-3 monsters, 1 quest. Two to four
    sentences per node. A chapter that does not fit in one answer is worse than a shorter one.
12b. MOVE THE PLAYER. Give "locationId" to every beat that happens somewhere new, and use all
    of your locations across the chapter. A chapter whose beats never set locationId leaves the
    player standing in the starting room while the prose describes a journey, and the location
    shown on screen then contradicts every line of it.
12c. CARRIED ITEMS. The "ITEMS CARRIED" list in the brief is authoritative: those objects are in
    the player's hands when this chapter starts. Give at least one of them a real role, using the
    mechanics below. To use one here you MUST re-declare it in "items" with the exact same id.
    - requiresKey on a location gates movement on that id;
    - an object's "contains" holding that id plus "interactable":true makes relocating it part of a beat;
    - an NPC dialogue tree can grant or reclaim it (a fair trade reads better than theft).
12d. Every item reference (location.requiresKey, objects.contains, puzzle unlocks, secret.contains,
    monster loot, dialogue item conditions) must resolve to this chapter's "items" or to the
    standard templates (rusty_key, health_potion, mana_potion, etc.). A carried item id that is not
    redeclared is an unknown reference and the chapter is rejected.
13. Answer with JSON only. No markdown fence, no commentary.`;

export function buildChapterMessages(request: ChapterRequest, outline: ChapterOutline) {
  const prefix = `c${request.nextIndex}_`;
  const system = `You are the lead writer and systems designer of an ongoing dark-fantasy campaign.
You now write the full, playable data for one chapter. The game engine runs this JSON directly:
it is not a draft, and no human will fix it.

${WORLD_BIBLE}

${CHAPTER_SPEC(prefix, request.nextIndex, request.hero.level)}`;

  const user = `${chronicleBlock(request.chronicle)}

${heroBlock(request.hero)}

APPROVED OUTLINE FOR CHAPTER ${request.nextIndex}
${JSON.stringify(outline, null, 1)}

IDS ALREADY USED BY EARLIER CHAPTERS — never reuse any of these:
${request.usedIds.join(', ')}

Write the complete chapter JSON now. JSON only.`;

  return [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: user },
  ];
}

export function buildRepairMessages(
  request: ChapterRequest,
  outline: ChapterOutline,
  brokenJson: string,
  issues: string[],
) {
  const base = buildChapterMessages(request, outline);
  return [
    base[0],
    base[1],
    { role: 'assistant' as const, content: brokenJson },
    {
      role: 'user' as const,
      content: `The validator rejected that chapter. Fix exactly these problems and change nothing else.
Return the complete corrected chapter JSON, JSON only.

${issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}`,
    },
  ];
}

export const VALID_SKILLS = SKILL_IDS;
