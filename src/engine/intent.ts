// ============================================================
// INTENT INTERPRETER - Parse player input to structured actions
// The AI proposes actions. THE GAME ENGINE VALIDATES THEM.
// ============================================================

import type {
  PlayerIntent, InterpretedAction, ActionType, Skill, StoryState, Character, CampaignStatus,
} from '../engine/types';
import { isStoryChoiceAvailable, type Chapter } from './chapter';
import type { Puzzle } from './puzzles';

// Verb patterns mapped to action types
const VERB_PATTERNS: Array<{ patterns: RegExp[]; type: ActionType; skill?: Skill }> = [
  // Movement
  { patterns: [/^(go|walk|move|head|travel|run|sneak)\s+(north|south|east|west|left|right|forward|back|up|down)/i, /^(go|walk|move)\s+(to|into|inside|through)/i], type: 'move' },
  { patterns: [/^(enter|exit|leave|cross|climb|descend|ascend)/i], type: 'move' },
  { patterns: [/^(north|south|east|west|up|down|forward|back|inside|outside)$/i], type: 'move' },

  // Examination - handle "look around" as general examination
  { patterns: [/^(look around|examine room|inspect area|look at everything|survey|observe surroundings|check surroundings)/i], type: 'examine' },
  { patterns: [/^(examine|inspect|look at|check|study|analyze|observe|scrutinize|investigate)/i], type: 'examine' },
  { patterns: [/^(look|see|watch|glance|peer|gaze|stare)/i], type: 'examine' },

  // Taking items
  { patterns: [/^(take|grab|pick up|collect|gather|loot|acquire|steal)/i], type: 'take' },
  { patterns: [/^(get|obtain|procure)/i], type: 'take' },
  // Spanish: "tomar", "coger", "recoger", "agarrar", "llevar"
  { patterns: [/^(tomar|toma|coger|coge|recoger|recoge|agarrar|agarra|llevar|lleva)/i], type: 'take' },

  // Dropping items
  { patterns: [/^(drop|discard|leave|abandon|扔掉)/i], type: 'drop' },

  // Using items
  { patterns: [/^(use|activate|consume|drink|eat|apply|read|open|activate)/i], type: 'use' },
  { patterns: [/^(light|ignite|burn|set fire|set ablaze)/i], type: 'use' },

  // Equipment
  { patterns: [/^(equip|wear|don|wield|hold|arm)/i], type: 'equip' },
  { patterns: [/^(equipar|equipa|equípame|equiparme|equiparse|equipándote|vestir|portar|empuñar|empuña|armarte)/i, /^(equip(?:ar|arme)?|equípa(?:te|me)?)\s+\w+/i], type: 'equip' },
  { patterns: [/^(unequip|remove|sheathe|holster|take off)/i], type: 'unequip' },
  { patterns: [/^(quitar|retirar|desequipar|guardar)\s*(equipamiento|arma|armadura)?/i], type: 'unequip' },

  // Combat
  { patterns: [/^(attack|hit|strike|slay|kill|fight|smash|bash|cleave|slash|thrust|stab)/i], type: 'attack' },
  { patterns: [/^(defend|block|dodge|parry|brace|guard)/i], type: 'defend' },
  { patterns: [/^(flee|run|escape|retreat|back away)/i], type: 'flee' },

  // Magic
  { patterns: [/^(cast|channel|conjure|summon|invoke|enchant|activate|lanzar|lanza|canalizar|conjurar|invocar)/i, /^(?:cast|lanzar|lanza)\s+\w+/i], type: 'cast' },

  // Social
  { patterns: [/^(talk|speak|chat|ask|tell|say|whisper|shout|call|greet)/i], type: 'talk' },
  { patterns: [/^(persuade|convince|negotiate|bargain|haggle|charm)/i], type: 'talk' },
  { patterns: [/^(intimidate|threaten|coerce|bully|scare|frighten)/i], type: 'talk' },
  { patterns: [/^(deceive|lie|trick|bluff|mislead|fool)/i], type: 'talk' },

  // Interaction
  { patterns: [/^(search|rummage|dig|explore|probe)/i], type: 'search' },
  { patterns: [/^(open|unlock|break|smash|force|pry)/i], type: 'open' },
  { patterns: [/^(close|shut|seal|bar|block)/i], type: 'close' },
  { patterns: [/^(push|shove|press|lean)/i], type: 'push' },
  { patterns: [/^(pull|tug|yank|drag)/i], type: 'pull' },
  { patterns: [/^(break|destroy|shatter|crush|smash)/i], type: 'break' },
  { patterns: [/^(extinguish|douse|put out|snuff)/i], type: 'extinguish' },

  // Giving
  { patterns: [/^(give|hand|offer|trade|exchange|barter)/i], type: 'give' },

  // Trading
  { patterns: [/^(buy|purchase|acquire)/i], type: 'buy' },
  { patterns: [/^(sell|trade|vendor)/i], type: 'sell' },

  // Rest
  { patterns: [/^(rest|sleep|nap|meditate|recover)/i], type: 'rest' },

  // Information
  { patterns: [/^(listen|hear|smell|taste|feel|touch)/i], type: 'listen' },

  // Follow/Stay
  { patterns: [/^(follow|accompany|come with|join)/i], type: 'follow' },
  { patterns: [/^(stay|wait|hold|remain)/i], type: 'wait' },

  // Help
  { patterns: [/^(help|assist|aid|support)/i], type: 'help' },

  // UI
  { patterns: [/^(inventory|bag|pack|items|equipment)/i], type: 'inventory' },
  { patterns: [/^(character|sheet|stats|status|me)/i], type: 'character_sheet' },
  { patterns: [/^(quest|log|mission|objective)/i], type: 'quest_log' },
];

export function interpretIntent(input: string): PlayerIntent {
  const trimmed = input.trim();
  const normalized = normalizeSpanishIntent(trimmed);
  const actions: InterpretedAction[] = [];

  if (!trimmed) {
    return { raw: trimmed, actions: [] };
  }

  // Try to match verb patterns
  for (const { patterns, type, skill } of VERB_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        const action = extractAction(normalized, type, skill);
        if (action) {
          actions.push(action);
          break;
        }
      }
    }
  }

  // If no patterns matched, treat as talk/examine
  if (actions.length === 0) {
    // Check if it looks like a question
    if (trimmed.endsWith('?') || /^(what|where|who|when|why|how|tell me|explain|qué|que|dónde|donde|quién|quien|cuándo|cuando|por qué|por que|cómo|como)/i.test(trimmed)) {
      actions.push({
        type: 'talk',
        dialogueContent: trimmed,
        confidence: 0.6,
      });
    } else {
      actions.push({
        type: 'talk',
        dialogueContent: trimmed,
        confidence: 0.4,
      });
    }
  }

  return { raw: trimmed, actions };
}

function normalizeSpanishIntent(input: string): string {
  const lower = input.toLowerCase().trim();
  const replacements: Array<[RegExp, string]> = [
    [/^(avanzar|avanza|adelante)$/i, 'go forward'],
    [/^(retroceder|retrocede|atrás|atras)$/i, 'go back'],
    [/^(ir|ve|caminar|camina|moverse|muévete|muevete)\s+(a|hacia)\s+/i, 'go to '],
    [/^(entrar|entra)(\s+(a|en))?\s*/i, 'enter '],
    [/^(salir|sal|abandonar)\s*/i, 'exit '],
    [/^(atacar|ataca|golpear|golpea|luchar)\s*/i, 'attack '],
    [/^(defender|defiende|bloquear|esquivar)$/i, 'defend'],
    [/^(huir|huye|escapar|retirarse)$/i, 'flee'],
    [/^(mirar alrededor|mira alrededor|observar alrededor)$/i, 'look around'],
    [/^(examinar|examina|inspeccionar|inspecciona|mirar|mira)\s*/i, 'examine '],
    [/^(hablar|habla)\s+(con\s+)?/i, 'talk to '],
    [/^(preguntar|pregunta)\s+(a\s+)?/i, 'ask '],
    [/^(buscar|busca|registrar|explorar)\s*/i, 'search '],
    [/^(abrir|abre)\s*/i, 'open '],
    [/^(usar|usa|utilizar|beber|bebe)\s*/i, 'use '],
    [/^(descansar|descansa|dormir)$/i, 'rest'],
    [/^(inventario|mochila|objetos)$/i, 'inventory'],
    [/^(misión|mision|misiones|objetivo|objetivos)$/i, 'quest'],
    [/^(personaje|estadísticas|estadisticas|estado)$/i, 'character'],
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(lower)) return lower.replace(pattern, replacement).trim();
  }
  return input;
}

function extractAction(input: string, type: ActionType, skill?: Skill): InterpretedAction | null {
  const lower = input.toLowerCase();

  switch (type) {
    case 'move': {
      const destinationMatch = lower.match(/^(?:go|walk|move|head|travel|run|sneak)\s+(?:(?:to|into|through)\s+)?(.+)$/)
        ?? lower.match(/^(?:enter|exit|leave|cross|climb|descend|ascend)\s*(.*)$/);
      const explicitDestination = destinationMatch?.[1]?.trim();
      const dirMatch = lower.match(/(north|south|east|west|left|right|forward|back|up|down|inside|outside)/);
      const direction = explicitDestination || (dirMatch ? dirMatch[1] : 'forward');
      return { type: 'move', direction, confidence: 0.8 };
    }

    case 'examine': {
      // Handle "look around" as examining the room
      if (/^(look around|examine room|inspect area|look at everything|survey|observe surroundings|check surroundings)/i.test(lower)) {
        return { type: 'examine', target: 'room', confidence: 0.95 };
      }
      const target = extractTarget(input, ['examine', 'inspect', 'look at', 'check', 'study', 'look', 'observe']);
      return { type: 'examine', target, confidence: 0.9 };
    }

    case 'take': {
      const item = extractTarget(input, ['take', 'grab', 'pick up', 'collect', 'get', 'loot', 'steal', 'tomar', 'toma', 'coger', 'coge', 'recoger', 'recoge', 'agarrar', 'agarra', 'llevar', 'lleva']);
      return { type: 'take', item, confidence: 0.85 };
    }

    case 'drop': {
      const item = extractTarget(input, ['drop', 'discard', 'leave', 'abandon']);
      return { type: 'drop', item, confidence: 0.9 };
    }

    case 'use': {
      const item = extractTarget(input, ['use', 'activate', 'consume', 'drink', 'eat', 'read', 'open', 'light', 'ignite', 'burn']);
      return { type: 'use', item, confidence: 0.85 };
    }

    case 'equip': {
      const item = extractTarget(input, ['equip', 'wear', 'don', 'wield', 'hold', 'arm', 'equipar', 'equipa', 'equípame', 'equiparme', 'equiparse', 'vestir', 'portar', 'empuñar', 'empuña']);
      return { type: 'equip', item, confidence: 0.9 };
    }

    case 'unequip': {
      const item = extractTarget(input, ['unequip', 'remove', 'sheathe', 'take off']);
      return { type: 'unequip', item, confidence: 0.9 };
    }

    case 'attack': {
      const target = extractTarget(input, ['attack', 'hit', 'strike', 'slay', 'kill', 'fight', 'smash', 'bash']);
      return { type: 'attack', target, skill: skill || 'melee', confidence: 0.85 };
    }

    case 'defend': {
      return { type: 'defend', confidence: 0.9 };
    }

    case 'flee': {
      return { type: 'flee', confidence: 0.95 };
    }

    case 'cast': {
      const spellMatch = input.match(/(?:cast|channel|conjure|invoke|lanzar|lanza|canalizar|conjurar|invocar)\s+(.+?)(?:\s+(?:at|on|against|contra|sobre)\s+(.+))?$/i);
      return {
        type: 'cast',
        spell: spellMatch ? spellMatch[1].trim() : undefined,
        target: spellMatch && spellMatch[2] ? spellMatch[2].trim() : undefined,
        confidence: 0.8,
      };
    }

    case 'talk': {
      const targetMatch = input.match(/(?:talk|speak|ask|tell|say|whisper|shout)\s+(?:to\s+)?(\w+)\s*(?:that\s+(.+))?$/i);
      return {
        type: 'talk',
        dialogueTarget: targetMatch ? targetMatch[1] : undefined,
        dialogueContent: targetMatch && targetMatch[2] ? targetMatch[2] : input,
        confidence: 0.75,
      };
    }

    case 'search': {
      const target = extractTarget(input, ['search', 'rummage', 'dig', 'explore', 'probe']);
      return { type: 'search', target, skill: 'perception', confidence: 0.8 };
    }

    case 'open': {
      const target = extractTarget(input, ['open', 'unlock', 'break', 'force', 'pry']);
      return { type: 'open', target, confidence: 0.85 };
    }

    case 'close': {
      const target = extractTarget(input, ['close', 'shut', 'seal', 'bar', 'block']);
      return { type: 'close', target, confidence: 0.85 };
    }

    case 'push': {
      const target = extractTarget(input, ['push', 'shove', 'press', 'lean']);
      return { type: 'push', target, confidence: 0.85 };
    }

    case 'pull': {
      const target = extractTarget(input, ['pull', 'tug', 'yank', 'drag']);
      return { type: 'pull', target, confidence: 0.85 };
    }

    case 'break': {
      const target = extractTarget(input, ['break', 'destroy', 'shatter', 'crush', 'smash']);
      return { type: 'break', target, confidence: 0.85 };
    }

    case 'extinguish': {
      const target = extractTarget(input, ['extinguish', 'douse', 'put out', 'snuff']);
      return { type: 'extinguish', target, confidence: 0.9 };
    }

    case 'give': {
      const giveMatch = input.match(/give\s+(\w+)\s+(?:to\s+)?(\w+)/i);
      return {
        type: 'give',
        item: giveMatch ? giveMatch[1] : undefined,
        dialogueTarget: giveMatch ? giveMatch[2] : undefined,
        confidence: 0.8,
      };
    }

    case 'buy': {
      const item = extractTarget(input, ['buy', 'purchase', 'acquire']);
      return { type: 'buy', item, confidence: 0.8 };
    }

    case 'sell': {
      const item = extractTarget(input, ['sell', 'trade']);
      return { type: 'sell', item, confidence: 0.8 };
    }

    case 'rest': {
      return { type: 'rest', confidence: 0.95 };
    }

    case 'listen': {
      const target = extractTarget(input, ['listen', 'hear', 'smell', 'taste', 'feel', 'touch']);
      return { type: 'listen', target, skill: 'perception', confidence: 0.8 };
    }

    case 'follow': {
      return { type: 'follow', confidence: 0.85 };
    }

    case 'wait': {
      return { type: 'wait', confidence: 0.95 };
    }

    case 'help': {
      return { type: 'help', confidence: 0.9 };
    }

    case 'inventory': {
      return { type: 'inventory', confidence: 1.0 };
    }

    case 'character_sheet': {
      return { type: 'character_sheet', confidence: 1.0 };
    }

    case 'quest_log': {
      return { type: 'quest_log', confidence: 1.0 };
    }

    default:
      return null;
  }
}

function extractTarget(input: string, verbs: string[]): string | undefined {
  const lower = input.toLowerCase();
  for (const verb of verbs) {
    const regex = new RegExp(`(?:${verb})(?:\\s+(?:the|a|an|my|your|this|that))?\\s+(.+?)$`, 'i');
    const match = lower.match(regex);
    if (match) return match[1].trim();
  }
  return undefined;
}

export interface Suggestion {
  key: string;
  label: string;
  labelEs: string;
  action: string;
}

export interface SuggestionContext {
  locationId: string;
  hasCombat: boolean;
  chapter?: Chapter | null;
  story?: StoryState;
  flags?: Record<string, boolean>;
  hero?: Pick<Character, 'archetype' | 'origin'>;
  activePuzzle?: Puzzle | null;
  status?: CampaignStatus;
}

/**
 * Builds the button row under the terminal. Nothing here knows the name of a
 * location or a chapter: combat, puzzles and story choices are derived from
 * live state, and everything else comes from `chapter.suggestions`.
 */
export function getSuggestedActions(context: SuggestionContext): Suggestion[] {
  const { locationId, hasCombat, chapter, story, activePuzzle, status } = context;
  const flags = context.flags ?? {};
  const hero = context.hero;
  const suggestions: Array<Omit<Suggestion, 'key'>> = [];

  const number = (items: Array<Omit<Suggestion, 'key'>>): Suggestion[] =>
    items.map((item, index) => ({ ...item, key: String(index + 1) }));

  if (status === 'dead' || status === 'chapter_complete') {
    return [];
  }

  if (hasCombat) {
    suggestions.push({ label: 'Attack', labelEs: 'Atacar', action: 'attack' });
    if (hero?.archetype === 'mage') {
      suggestions.push({ label: 'Cast Arcane Bolt', labelEs: 'Lanzar Proyectil Arcano', action: 'cast arcane bolt' });
    } else if (hero?.archetype === 'cleric') {
      suggestions.push({ label: 'Cast Sacred Flame', labelEs: 'Lanzar Llama Sagrada', action: 'cast sacred flame' });
    }
    suggestions.push(
      { label: 'Defend', labelEs: 'Defender', action: 'defend' },
      { label: 'Use item', labelEs: 'Usar objeto', action: 'use health potion' },
      { label: 'Flee', labelEs: 'Huir', action: 'flee' },
    );
    return number(suggestions);
  }

  // A puzzle owns the input while it is open, so it owns the buttons too.
  if (activePuzzle) {
    if (activePuzzle.kind === 'mechanism') {
      for (const step of activePuzzle.stepLabels) {
        suggestions.push({ label: step.label, labelEs: step.labelEs, action: step.id });
      }
    } else if (activePuzzle.kind === 'check') {
      suggestions.push({
        label: `Attempt the ${activePuzzle.skill} check`,
        labelEs: `Intentar la prueba de ${activePuzzle.skill}`,
        action: 'examine',
      });
    }
    suggestions.push({
      label: 'Abandon the puzzle',
      labelEs: 'Abandonar el enigma',
      action: 'abandon puzzle',
    });
    return number(suggestions);
  }

  if (chapter && story && !story.completed) {
    const node = chapter.nodes[story.currentNodeId];
    for (const choice of node?.choices ?? []) {
      if (!isStoryChoiceAvailable(choice, flags, hero)) continue;
      suggestions.push({
        label: choice.label,
        labelEs: choice.labelEs,
        action: `__story__:${choice.id}`,
      });
    }
    if (suggestions.length > 0) return number(suggestions);
  }

  const phase = story?.completed ? 'after' : 'before';
  for (const entry of chapter?.suggestions[locationId] ?? []) {
    if (entry.phase && entry.phase !== phase) continue;
    if (entry.routes && (!story?.route || !entry.routes.includes(story.route))) continue;
    const gated = (entry.requires ?? []).every(condition =>
      (flags[condition.flag] ?? false) === (condition.equals ?? true)
    );
    if (!gated) continue;
    suggestions.push({ label: entry.label, labelEs: entry.labelEs, action: entry.action });
  }

  if (suggestions.length === 0) {
    suggestions.push(
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
      { label: 'Search', labelEs: 'Buscar', action: 'search the room' },
    );
  }

  const numbered = number(suggestions);
  numbered.push({ key: '>', label: 'Something else...', labelEs: 'Algo más...', action: '' });
  return numbered;
}
