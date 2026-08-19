// ============================================================
// QUEST DATA - The Sunken Crypt Adventure
// ============================================================

import type { Quest } from '../engine/types';

export const ADVENTURE_QUESTS: Record<string, Quest> = {
  the_sunken_crypt: {
    id: 'the_sunken_crypt',
    name: 'The Sunken Crypt',
    nameEs: 'La Cripta Sumergida',
    description: 'Villagers have vanished near the ancient Sunken Crypt. Investigate the disappearances and find the missing people.',
    descriptionEs: 'Aldeanos han desaparecido cerca de la antigua Cripta Sumergida. Investiga las desapariciones y encuentra a las personas desaparecidas.',
    state: 'available',
    objectives: [
      {
        id: 'investigate_rumors',
        description: 'Learn about the missing villagers',
        descriptionEs: 'Infórmate sobre los aldeanos desaparecidos',
        completed: false,
        current: 0,
        required: 1,
      },
      {
        id: 'reach_crypt',
        description: 'Travel to the Sunken Crypt',
        descriptionEs: 'Viaja a la Cripta Sumergida',
        completed: false,
        current: 0,
        required: 1,
      },
      {
        id: 'explore_crypt',
        description: 'Explore the crypt and find the missing villagers',
        descriptionEs: 'Explora la cripta y encuentra a los aldeanos desaparecidos',
        completed: false,
        current: 0,
        required: 3,
      },
      {
        id: 'defeat_warden',
        description: 'Defeat the Crypt Warden',
        descriptionEs: 'Derrota al Guardián de la Cripta',
        completed: false,
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'xp', value: 500 },
      { type: 'gold', value: 100 },
      { type: 'reputation', value: 25, factionId: 'blackmere' },
    ],
    isMain: true,
    faction: 'blackmere',
  },
  the_strangers_debt: {
    id: 'the_strangers_debt',
    name: 'The Stranger\'s Debt',
    nameEs: 'La Deuda del Desconocido',
    description: 'The mysterious stranger in the tavern knows more than they let on. Uncover their true identity and purpose.',
    descriptionEs: 'El misterioso desconocido en la taberna sabe más de lo que deja ver. Descubre su verdadera identidad y propósito.',
    state: 'hidden',
    objectives: [
      {
        id: 'learn_stranger_identity',
        description: 'Discover who the stranger really is',
        descriptionEs: 'Descubre quién es realmente el desconocido',
        completed: false,
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'xp', value: 200 },
      { type: 'unlock', value: 'shadow_blade_recipe' },
    ],
    isMain: false,
  },
  old_gretas_prayer: {
    id: 'old_gretas_prayer',
    name: 'Old Greta\'s Prayer',
    nameEs: 'La Oración de la Vieja Greta',
    description: 'Find Old Greta in the crypt and restore her voice. She holds knowledge the Ashen Veil needs.',
    descriptionEs: 'Encuentra a la vieja Greta en la cripta y restaura su voz. Ella posee conocimiento que el Velo Ceniza necesita.',
    state: 'hidden',
    objectives: [
      {
        id: 'find_greta',
        description: 'Locate Old Greta in the crypt',
        descriptionEs: 'Localiza a la vieja Greta en la cripta',
        completed: false,
        current: 0,
        required: 1,
      },
      {
        id: 'restore_voice',
        description: 'Find a way to restore her voice',
        descriptionEs: 'Encuentra una manera de restaurar su voz',
        completed: false,
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'xp', value: 150 },
      { type: 'reputation', value: 15, factionId: 'ashen_veil' },
    ],
    isMain: false,
    faction: 'ashen_veil',
  },
  the_ashen_court_legacy: {
    id: 'the_ashen_court_legacy',
    name: 'The Ashen Court Legacy',
    nameEs: 'El Legado de la Corte Ceniza',
    description: 'Discover the true history of the Ashen Court and why they sealed the crypt.',
    descriptionEs: 'Descubre la verdadera historia de la Corte Ceniza y por qué sellaron la cripta.',
    state: 'hidden',
    objectives: [
      {
        id: 'find_court_history',
        description: 'Find historical records of the Ashen Court',
        descriptionEs: 'Encuentra registros históricos de la Corte Ceniza',
        completed: false,
        current: 0,
        required: 3,
      },
    ],
    rewards: [
      { type: 'xp', value: 300 },
      { type: 'unlock', value: 'ashen_veil_quests' },
    ],
    isMain: false,
  },
};
