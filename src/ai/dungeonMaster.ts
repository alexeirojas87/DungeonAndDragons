// ============================================================
// AI DUNGEON MASTER - Narrative generation layer
// The AI receives authoritative game events and transforms
// them into compelling narration.
// ============================================================

import type { GameState, Character, NarrativeEntry, Language, GameEvent, WorldLocation, NPC, Enemy, DiceRoll } from '../engine/types';

export interface DMContext {
  gameState: GameState;
  location: WorldLocation | undefined;
  npcs: NPC[];
  recentEvents: GameEvent[];
  language: Language;
  playerAction: string;
}

export interface DMResponse {
  narrative: string;
  mood: 'neutral' | 'tense' | 'danger' | 'triumph' | 'horror' | 'humor' | 'mystery';
  type: 'narration' | 'dialogue' | 'system' | 'combat' | 'dice';
  speaker?: string;
}

// The DM prompt template
const DM_SYSTEM_PROMPT = `You are the Dungeon Master for a dark fantasy RPG called "The Gauntlet."

RULES:
1. You are NOT the source of truth. The game engine is.
2. You NEVER modify authoritative state (HP, gold, inventory, etc.)
3. You NEVER invent dice results.
4. You NEVER allow impossible actions.
5. You narrate what happens based on the game engine's results.

STYLE:
- Dark fantasy atmosphere
- Concise, evocative prose
- Not every object needs three paragraphs
- Match narrative intensity to importance
- Use sensory details: sound, light, temperature, smell
- Let silence be powerful
- Avoid purple prose
- Avoid constant dramatic language
- Characters should feel distinct
- Horror when appropriate, humor when it fits

TONE:
- Intelligent
- Fair
- Occasionally ruthless
- Atmospheric
- Concise when appropriate
- Descriptive when important

WHAT YOU RECEIVE:
- Current game state (location, party, combat, quests)
- Player's interpreted action
- Game engine's validation results
- Dice rolls and outcomes
- Recent events

WHAT YOU PRODUCE:
- Narrative text describing the outcome
- Mood indicator
- Content type (narration, dialogue, system, combat)

LANGUAGE:
Always narrate in the player's selected language.`;

export function buildDMContext(
  gameState: GameState,
  playerAction: string,
  language: Language
): DMContext {
  const location = gameState.worldState.locations[gameState.location];
  const npcs = location?.npcs
    .map(id => gameState.worldState.npcs[id])
    .filter(Boolean) || [];

  return {
    gameState,
    location,
    npcs,
    recentEvents: gameState.eventLog.slice(-10),
    language,
    playerAction,
  };
}

// Deterministic narrative generation (no LLM required)
export function generateNarration(
  context: DMContext,
  actionResult: { success: boolean; message?: string; dice?: DiceRoll }
): DMResponse {
  const { location, language } = context;

  // If there's a custom message from the engine, use it
  if (actionResult.message) {
    return {
      narrative: actionResult.message,
      mood: actionResult.success ? 'triumph' : 'neutral',
      type: 'narration',
    };
  }

  // Generate contextual narration based on location and events
  if (!location) {
    return {
      narrative: language === 'es'
        ? 'Te encuentras en un lugar desconocido.'
        : 'You find yourself in an unknown place.',
      mood: 'mystery',
      type: 'narration',
    };
  }

  // Default atmospheric description
  return {
    narrative: language === 'es'
      ? `Estás en ${location.nameEs}. ${location.descriptionEs}`
      : `You are in ${location.name}. ${location.description}`,
    mood: location.dangerLevel > 2 ? 'danger' : location.dangerLevel > 0 ? 'tense' : 'neutral',
    type: 'narration',
  };
}

// Generate NPC dialogue based on context
export function generateNPCDialogue(
  npc: NPC,
  playerInput: string,
  language: Language
): DMResponse {
  // Find the most appropriate dialogue node
  const lowerInput = playerInput.toLowerCase();

  // Check for keyword matches in dialogue responses
  for (const node of npc.dialogue) {
    for (const response of node.responses) {
      const responseText = language === 'es' ? response.textEs.toLowerCase() : response.text.toLowerCase();
      if (lowerInput.includes(responseText.split(' ').slice(0, 3).join(' '))) {
        const nextNode = npc.dialogue.find(d => d.id === response.nextNodeId);
        if (nextNode) {
          return {
            narrative: language === 'es' ? nextNode.textEs : nextNode.text,
            mood: 'neutral',
            type: 'dialogue',
            speaker: npc.name,
          };
        }
      }
    }
  }

  // Default: return greeting
  const greeting = npc.dialogue.find(d => d.id === 'greeting') || npc.dialogue[0];
  if (greeting) {
    return {
      narrative: language === 'es' ? greeting.textEs : greeting.text,
      mood: 'neutral',
      type: 'dialogue',
      speaker: npc.name,
    };
  }

  return {
    narrative: language === 'es'
      ? `${npc.name} no dice nada.`
      : `${npc.name} says nothing.`,
    mood: 'neutral',
    type: 'dialogue',
    speaker: npc.name,
  };
}

// Generate combat narration
export function generateCombatNarration(
  attackerName: string,
  defenderName: string,
  hit: boolean,
  damage: number,
  critical: boolean,
  language: Language
): DMResponse {
  if (!hit) {
    return {
      narrative: language === 'es'
        ? `${attackerName} ataca pero falla.`
        : `${attackerName} attacks but misses.`,
      mood: 'tense',
      type: 'combat',
    };
  }

  const intensity = critical ? 'devastating' : damage > 10 ? 'powerful' : 'solid';
  const intensityEs = critical ? 'devastador' : damage > 10 ? 'potente' : 'sólido';

  return {
    narrative: language === 'es'
      ? `${attackerName} asesta un golpe ${intensityEs} a ${defenderName}, infligiendo ${damage} puntos de daño.${critical ? ' ¡Golpe crítico!' : ''}`
      : `${attackerName} lands a ${intensity} blow on ${defenderName}, dealing ${damage} points of damage.${critical ? ' Critical hit!' : ''}`,
    mood: critical ? 'triumph' : 'danger',
    type: 'combat',
  };
}

// Generate location description
export function generateLocationDescription(
  location: WorldLocation,
  isFirstVisit: boolean,
  language: Language
): DMResponse {
  const desc = language === 'es' ? location.descriptionEs : location.description;

  if (isFirstVisit) {
    return {
      narrative: desc,
      mood: location.dangerLevel > 2 ? 'danger' : 'neutral',
      type: 'narration',
    };
  }

  return {
    narrative: language === 'es'
      ? `Vuelves a ${location.nameEs}.`
      : `You return to ${location.name}.`,
    mood: 'neutral',
    type: 'narration',
  };
}
