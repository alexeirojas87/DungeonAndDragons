// ============================================================
// LOCALIZATION - English and Spanish translations
// ============================================================

import type { Language } from '../engine/types';

export const UI_STRINGS: Record<string, Record<Language, string>> = {
  // Main Menu
  'menu.title': { en: 'The Gauntlet', es: 'La Prueba' },
  'menu.subtitle': { en: 'A Living Fantasy RPG', es: 'Un RPG de Fantasía Vivo' },
  'menu.language': { en: 'Select Language', es: 'Seleccionar Idioma' },
  'menu.version': { en: 'v0.1.0 • The Sunken Crypt • Vertical Slice', es: 'v0.1.0 • La Cripta Sumergida • Slice Vertical' },

  // Character Creation
  'creation.title': { en: 'Character Creation', es: 'Creación de Personaje' },
  'creation.name': { en: 'Character Name', es: 'Nombre del Personaje' },
  'creation.name_placeholder': { en: 'Enter your name...', es: 'Ingresa tu nombre...' },
  'creation.archetype': { en: 'Choose Your Archetype', es: 'Elige tu Arquetipo' },
  'creation.origin': { en: 'Choose Your Origin', es: 'Elige tu Origen' },
  'creation.continue': { en: 'Continue', es: 'Continuar' },
  'creation.back': { en: 'Back', es: 'Atrás' },
  'creation.begin': { en: 'Begin Adventure', es: 'Comenzar Aventura' },

  // Game UI
  'game.location': { en: 'Location', es: 'Ubicación' },
  'game.equipment': { en: 'Equipment', es: 'Equipo' },
  'game.attributes': { en: 'Attributes', es: 'Atributos' },
  'game.inventory': { en: 'Inventory', es: 'Inventario' },
  'game.quests': { en: 'Quests', es: 'Misiones' },

  // Input
  'input.placeholder': { en: 'Type your action...', es: 'Escribe tu acción...' },
  'input.submit': { en: 'Enter', es: 'Enviar' },

  // Suggestions
  'suggestion.look': { en: 'Look around', es: 'Mirar a los alrededores' },
  'suggestion.search': { en: 'Search', es: 'Buscar' },
  'suggestion.inventory': { en: 'Inventory', es: 'Inventario' },
  'suggestion.attack': { en: 'Attack', es: 'Atacar' },
  'suggestion.defend': { en: 'Defend', es: 'Defender' },
  'suggestion.use_item': { en: 'Use item', es: 'Usar objeto' },
  'suggestion.flee': { en: 'Flee', es: 'Huir' },
  'suggestion.other': { en: 'Something else...', es: 'Algo más...' },

  // Combat
  'combat.title': { en: 'Combat!', es: '¡Combate!' },
  'combat.round': { en: 'Round', es: 'Ronda' },
  'combat.your_turn': { en: 'Your turn — Choose an action', es: 'Tu turno — Elige una acción' },
  'combat.enemy_turn': { en: 'is acting...', es: 'está actuando...' },
  'combat.victory': { en: 'Victory!', es: '¡Victoria!' },
  'combat.defeat': { en: 'Defeat!', es: '¡Derrota!' },

  // System Messages
  'system.no_action': { en: "You're not sure what to do with that.", es: 'No estás seguro de qué hacer con eso.' },
  'system.cant_do': { en: "You can't do that right now.", es: 'No puedes hacer eso ahora.' },
  'system.no_exit': { en: 'There is no exit in that direction.', es: 'No hay salida en esa dirección.' },
  'system.locked': { en: 'The door is locked. You need to find the right key.', es: 'La puerta está cerrada con llave. Necesitas encontrar la llave correcta.' },
  'system.no_enemies': { en: 'There are no enemies here to attack.', es: 'No hay enemigos aquí para atacar.' },
  'system.no_one': { en: "There's no one here to talk to.", es: 'No hay nadie aquí con quien hablar.' },
  'system.nothing_found': { en: 'You search carefully but find nothing special.', es: 'Buscas cuidadosamente pero no encuentras nada especial.' },
  'system.acquired': { en: 'Acquired:', es: 'Obtienes:' },
  'system.equipped': { en: 'You equip', es: 'Equipas' },
  'system.unequipped': { en: 'You unequip', es: 'Te quitas' },
  'system.used': { en: 'You use', es: 'Usas' },
  'system.recover': { en: 'Recover', es: 'Recuperas' },
  'system.rest': { en: 'You rest and recover', es: 'Descansas y recuperas' },
  'system.time_passes': { en: 'Time passes.', es: 'El tiempo avanza.' },
  'system.no_rest_combat': { en: "You can't rest in the middle of combat.", es: 'No puedes descansar en medio de un combate.' },
  'system.no_flee_combat': { en: "You can't just walk away from combat. Use \"flee\" if you want to escape.", es: 'No puedes huir de un combate así. Usa "huir" si quieres escapar.' },
  'system.escape_success': { en: 'You manage to escape from combat!', es: '¡Logras escapar del combate!' },
  'system.escape_fail': { en: "You can't escape! The enemy blocks your path.", es: '¡No puedes escapar! El enemigo te bloquea el paso.' },
  'system.listen': { en: 'You listen carefully to the sounds around you...', es: 'Escuchas atentamente los sonidos a tu alrededores...' },
  'system.no_items': { en: "You don't have that.", es: 'No tienes eso.' },
  'system.cant_equip': { en: "You can't equip that.", es: 'No puedes equipar eso.' },
  'system.cant_use': { en: "You can't use that.", es: 'No puedes usar eso.' },
  'system.no_active_quests': { en: 'You have no active quests.', es: 'No tienes misiones activas.' },
  'system.xp_gained': { en: 'XP gained:', es: 'XP obtenido:' },
  'system.gold_gained': { en: 'Gold acquired:', es: 'Oro obtenido:' },
  'system.level_up': { en: 'Level Up!', es: '¡Subiste de nivel!' },
};

export function t(key: string, lang: Language): string {
  return UI_STRINGS[key]?.[lang] || UI_STRINGS[key]?.en || key;
}
