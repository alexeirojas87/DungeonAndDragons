// ============================================================
// CHAPTER I — The Missing of Blackmere
// The authored chapter, expressed in the same Chapter shape that
// LLM-generated chapters must satisfy. Prose lives in the original
// data modules; this file assembles it and adds the pieces the
// engine used to hardcode (intro beats, hooks, story facts,
// suggestions) plus the chapter's two puzzles.
// ============================================================

import type { Chapter, StoryNode, StoryNodeKind } from '../../engine/chapter';
import type { Puzzle } from '../../engine/puzzles';
import { STORY_GRAPH, STORY_START_NODE } from '../storyGraph';
import { ADVENTURE_LOCATIONS } from '../locations';
import { ADVENTURE_NPCS } from '../npcs';
import { ADVENTURE_QUESTS } from '../quests';
import { MONSTER_TEMPLATES } from '../monsters';

// ---- Puzzles -------------------------------------------------

const CHAPEL_LEDGER: Puzzle = {
  id: 'c1_chapel_ledger',
  kind: 'check',
  title: 'The Chapel Ledger',
  titleEs: 'El registro de la capilla',
  prompt: 'The chapel keeps a burial ledger nobody has closed in forty years. Three entries near the back were written in a different hand, and the margin holds a drawing that is not a prayer. Read it properly and you will know how the abductors come and go.',
  promptEs: 'La capilla guarda un registro de entierros que nadie ha cerrado en cuarenta años. Tres asientos del final están escritos con otra mano, y el margen guarda un dibujo que no es una oración. Léelo como es debido y sabrás por dónde entran y salen los secuestradores.',
  hints: [
    {
      en: 'The three odd entries share a date that is not a burial date. It is a tide table.',
      es: 'Los tres asientos extraños comparten una fecha que no es de entierro. Es una tabla de mareas.',
    },
    {
      en: 'The margin drawing is the chapel floor seen from below. The line leaving it is water, not a wall.',
      es: 'El dibujo del margen es el suelo de la capilla visto desde abajo. La línea que sale de él es agua, no un muro.',
    },
    {
      en: 'A rusted key is pressed flat between the last two pages, exactly where the drawing ends.',
      es: 'Una llave oxidada está prensada entre las dos últimas páginas, justo donde termina el dibujo.',
    },
  ],
  skill: 'investigation',
  dc: 14,
  clues: [
    {
      id: 'c1_clue_altar_watermark',
      en: 'The altar stone carries a watermark higher than any flood Blackmere remembers.',
      es: 'La piedra del altar tiene una marca de agua más alta que cualquier inundación que Blackmere recuerde.',
      dcReduction: 2,
    },
    {
      id: 'c1_clue_second_ink',
      en: 'The reward notice was written in two inks; the same second ink stains the ledger.',
      es: 'El aviso de recompensa se escribió con dos tintas; la segunda mancha también el registro.',
      dcReduction: 2,
    },
  ],
  unlocks: {
    flags: { tunnel_map: true, chapel_ledger_decoded: true },
    items: ['rusty_key'],
  },
  // Lands on the archive beat rather than jumping past it: that node is where
  // origin and archetype bonuses are earned, and solving a puzzle must never
  // leave the hero weaker than skipping it would have.
  solvedNodeId: 'archive_clue',
  skipNodeId: 'chapel_plea',
};

const DROWNED_DOOR_RUNES: Puzzle = {
  id: 'c1_drowned_door_runes',
  kind: 'mechanism',
  title: 'The Runes of the Drowned Door',
  titleEs: 'Las runas de la Puerta Ahogada',
  prompt: 'Three runes ring the Drowned Door, and the black water answers each one with a different sound. The Ashen Court did not lock this door. They taught it an order, and the order is a sentence.',
  promptEs: 'Tres runas rodean la Puerta Ahogada, y el agua negra responde a cada una con un sonido distinto. La Corte Ceniza no cerró esta puerta con llave: le enseñó un orden, y ese orden es una frase.',
  hints: [
    {
      en: 'A sentence needs a subject before a verb. Begin with the rune that names something, not the ones that do something.',
      es: 'Una frase necesita un sujeto antes de un verbo. Empieza por la runa que nombra algo, no por las que hacen algo.',
    },
    {
      en: 'Salt was scattered before the mourners spoke, and the mourners spoke before the bone was laid down.',
      es: 'La sal se esparció antes de que hablaran los deudos, y los deudos hablaron antes de que se depositara el hueso.',
    },
    {
      en: 'Moon, then salt, then bone. The water goes quiet on the third.',
      es: 'Luna, luego sal, luego hueso. El agua calla a la tercera.',
    },
  ],
  steps: ['c1_rune_moon', 'c1_rune_salt', 'c1_rune_bone'],
  ordered: true,
  stepLabels: [
    { id: 'c1_rune_moon', label: 'Press the drowned moon', labelEs: 'Pulsar la luna ahogada' },
    { id: 'c1_rune_salt', label: 'Press the scattered salt', labelEs: 'Pulsar la sal esparcida' },
    { id: 'c1_rune_bone', label: 'Press the laid bone', labelEs: 'Pulsar el hueso depositado' },
  ],
  onWrongStep: {
    en: 'The water swallows the sound and gives it back wrong. The sequence unwinds; you may begin again.',
    es: 'El agua se traga el sonido y lo devuelve mal. La secuencia se deshace; puedes empezar de nuevo.',
  },
  unlocks: {
    flags: { drowned_runes_read: true },
  },
  solvedNodeId: 'drowned_door_understood',
  skipNodeId: 'warden_aftermath',
};

// ---- New nodes: the puzzle beats and the unlocked ending ------

const PUZZLE_NODES: Record<string, StoryNode> = {
  puzzle_chapel_ledger: {
    id: 'puzzle_chapel_ledger',
    kind: 'puzzle',
    puzzleId: 'c1_chapel_ledger',
    title: 'The Ledger Nobody Closed',
    titleEs: 'El registro que nadie cerró',
    text: 'Sera lets you take the ledger to the window, where what is left of the light falls on it. She does not offer to help. Whatever the last three entries say, she would rather you were the one to say it out loud.',
    textEs: 'Sera te deja llevar el registro a la ventana, donde cae lo que queda de luz. No se ofrece a ayudar. Diga lo que digan los tres últimos asientos, prefiere que seas tú quien lo diga en voz alta.',
    choices: [],
  },
  puzzle_drowned_runes: {
    id: 'puzzle_drowned_runes',
    kind: 'puzzle',
    puzzleId: 'c1_drowned_door_runes',
    title: 'Three Runes, One Sentence',
    titleEs: 'Tres runas, una frase',
    text: 'The Warden is down. The prisoners are still chained, the water is still rising, and the door is still awake. You have exactly as long as it takes the water to reach the third step.',
    textEs: 'El Guardián ha caído. Los prisioneros siguen encadenados, el agua sigue subiendo y la puerta sigue despierta. Tienes exactamente el tiempo que tarde el agua en llegar al tercer escalón.',
    choices: [],
  },
  drowned_door_understood: {
    id: 'drowned_door_understood',
    kind: 'beat',
    title: 'What the Door Was Asking For',
    titleEs: 'Lo que la puerta pedía',
    text: 'The third rune goes quiet and the black water goes quiet with it. The Drowned Door was never a lock. It was a mouth waiting to be answered, and now you know the answer — a name it lost, and the sentence that gives it back.',
    textEs: 'La tercera runa calla y el agua negra calla con ella. La Puerta Ahogada nunca fue un cerrojo. Era una boca esperando respuesta, y ahora conoces la respuesta: un nombre que perdió y la frase que lo devuelve.',
    choices: [
      {
        id: 'runes_return_voice',
        label: 'Speak the sentence and give the door back its name',
        labelEs: 'Pronunciar la frase y devolver a la puerta su nombre',
        nextNodeId: 'ending_remembered',
        setsFlags: { rescued_villagers: true, drowned_door_appeased: true },
        adjustsValues: { insight: 3, compassion: 1 },
        result: 'You say it once, plainly, the way a name should be said. The water lowers itself out of the chamber like something taking its hat off, and the chains open without being struck.',
        resultEs: 'Lo pronuncias una vez, con sencillez, como debe decirse un nombre. El agua se retira de la cámara como quien se descubre la cabeza, y las cadenas se abren sin recibir un golpe.',
      },
      {
        id: 'runes_then_seal',
        label: 'Use the silver vial now that the door is listening',
        labelEs: 'Usar el vial plateado ahora que la puerta escucha',
        nextNodeId: 'ending_sealed',
        requires: [{ flag: 'has_sealing_vial' }],
        setsFlags: { rescued_villagers: true, sealed_drowned_door: true },
        adjustsValues: { pragmatism: 2, strangerTrust: 2 },
        result: 'A door that is listening is a door that can be told no. The vial does the rest.',
        resultEs: 'Una puerta que escucha es una puerta a la que se le puede decir no. El vial hace el resto.',
      },
      {
        id: 'runes_then_flee',
        label: 'Take the villagers out while the water is still low',
        labelEs: 'Sacar a los aldeanos mientras el agua sigue baja',
        nextNodeId: 'ending_rescue',
        setsFlags: { rescued_villagers: true, door_left_unsealed: true },
        adjustsValues: { compassion: 3 },
        result: 'You choose the three people you came for over the thing you finally understood. It is not the wrong choice. It is only the one that leaves the door open.',
        resultEs: 'Eliges a las tres personas por las que viniste antes que a lo que por fin comprendiste. No es la elección equivocada. Solo es la que deja la puerta abierta.',
      },
    ],
  },
};

// ---- Assembly ------------------------------------------------

const NODE_KINDS: Record<string, StoryNodeKind> = {
  route_direct: 'route',
  route_forest: 'route',
  route_secret_tunnel: 'route',
  route_varen: 'route',
  route_council: 'route',
  ending_rescue: 'ending',
  ending_sealed: 'ending',
  ending_destroyed: 'ending',
  ending_remembered: 'ending',
  ending_relic: 'ending',
};

function buildNodes(): Record<string, StoryNode> {
  const nodes: Record<string, StoryNode> = {};

  for (const [id, node] of Object.entries(STORY_GRAPH)) {
    nodes[id] = {
      ...node,
      kind: NODE_KINDS[id] ?? 'beat',
      choices: node.choices.map(choice => ({ ...choice })),
    };
  }

  Object.assign(nodes, PUZZLE_NODES);

  // The chapel gains a way into the ledger puzzle...
  nodes.chapel_plea.choices.push({
    id: 'read_chapel_ledger',
    label: 'Ask for the chapel\'s burial ledger',
    labelEs: 'Pedir el registro de entierros de la capilla',
    nextNodeId: 'puzzle_chapel_ledger',
    setsFlags: { asked_for_ledger: true },
    adjustsValues: { insight: 1 },
  });

  // ...and the aftermath gains a way into the rune puzzle, which is what makes
  // the remembered ending reachable without the Shadowfen origin.
  nodes.warden_aftermath.choices.splice(nodes.warden_aftermath.choices.length - 1, 0, {
    id: 'study_door_runes',
    label: 'Read the three runes before touching the chains',
    labelEs: 'Leer las tres runas antes de tocar las cadenas',
    nextNodeId: 'puzzle_drowned_runes',
    setsFlags: { studied_door_runes: true },
    adjustsValues: { insight: 1 },
  });

  return nodes;
}

export const CHAPTER_ONE: Chapter = {
  id: 'chapter-01',
  index: 1,
  title: 'The Missing of Blackmere',
  titleEs: 'Los desaparecidos de Blackmere',
  premise: 'Three villagers vanished near the Sunken Crypt outside Blackmere. The village council would rather the matter stayed quiet, a hooded survivor of the last expedition is drinking alone in the tavern, and beneath the crypt a thing called the Drowned Door has started breathing again.',
  premiseEs: 'Tres aldeanos han desaparecido cerca de la Cripta Sumergida, a las puertas de Blackmere. El consejo de la aldea preferiría que el asunto siguiera en silencio, un superviviente encapuchado de la última expedición bebe solo en la taberna y, bajo la cripta, algo llamado la Puerta Ahogada ha vuelto a respirar.',
  intro: [
    {
      type: 'system',
      text: 'CHAPTER I — THE MISSING OF BLACKMERE',
      textEs: 'CAPÍTULO I — LOS DESAPARECIDOS DE BLACKMERE',
      mood: 'mystery',
    },
    {
      type: 'narration',
      text: 'Three nights ago, on the road from {origin}, you found a notice: “Adventurers wanted. Three Blackmere villagers have vanished. The last trail leads to the Sunken Crypt. Reward: 100 gold.” Someone had added beneath it in fresh ink: “Ask for Martik at the Black Lantern.”',
      textEs: 'Hace tres noches encontraste un aviso en el camino desde {origin}: «Se buscan aventureros. Tres vecinos de Blackmere han desaparecido. La última pista conduce a la Cripta Sumergida. Recompensa: 100 piezas de oro». Alguien había añadido debajo, con tinta aún fresca: «Pregunten por Martik en el Farol Negro».',
      mood: 'mystery',
    },
    {
      type: 'narration',
      text: '{name} reaches Blackmere at dusk, the notice tucked among their belongings. The village is too quiet for this hour. Your first objective is simple: find Martik and learn who vanished before going anywhere near the crypt.',
      textEs: '{name} llega a Blackmere al caer la tarde, con el aviso guardado entre sus pertenencias. El pueblo está demasiado silencioso para esa hora. Tu primer objetivo es sencillo: encontrar a Martik y averiguar quién desapareció antes de acercarte a la cripta.',
      mood: 'neutral',
    },
    {
      type: 'narration',
      text: 'The Black Lantern is the only building with light in its windows. Inside, a burly innkeeper wipes a mug behind the bar; that must be Martik. In one corner, a hooded figure watches the room over the rim of a cup.',
      textEs: 'El Farol Negro es el único edificio con luz en las ventanas. Dentro, un tabernero robusto limpia una jarra detrás de la barra; debe de ser Martik. En una esquina, una figura encapuchada observa el salón por encima de su copa.',
      mood: 'neutral',
    },
    {
      type: 'system',
      text: 'CURRENT OBJECTIVE — Ask Martik about the missing villagers.',
      textEs: 'OBJETIVO ACTUAL — Habla con Martik sobre los aldeanos desaparecidos.',
      mood: 'neutral',
    },
  ],
  startNodeId: STORY_START_NODE,
  startLocationId: 'black_lantern_tavern',
  nodes: buildNodes(),
  puzzles: {
    c1_chapel_ledger: CHAPEL_LEDGER,
    c1_drowned_door_runes: DROWNED_DOOR_RUNES,
  },
  locations: ADVENTURE_LOCATIONS,
  npcs: ADVENTURE_NPCS,
  monsters: MONSTER_TEMPLATES,
  quests: ADVENTURE_QUESTS,
  mainQuestId: 'the_sunken_crypt',
  hooks: {
    bossLocationId: 'crypt_guardian_room',
    aftermathNodeId: 'warden_aftermath',
    routeDestinations: {
      direct: 'crypt_path',
      forest: 'crypt_path',
      secret_tunnel: 'crypt_antechamber',
      varen: 'crypt_entrance',
      council: 'crypt_path',
    },
  },
  externalEntrySeeds: {
    warden_aftermath: [
      {
        has_sealing_vial: true,
        intends_destroy_door: true,
        shadowfen_dead_voices: true,
      },
    ],
  },
  storyFacts: [
    {
      flag: 'council_escort_present',
      en: 'A council escort is physically traveling with the player',
      es: 'Una escolta del consejo viaja físicamente con el jugador',
    },
    {
      flag: 'varen_guide',
      en: 'Captain Varen is guiding the player',
      es: 'El capitán Varen guía al jugador',
    },
    {
      flag: 'has_sealing_vial',
      en: 'The player carries the silver sealing vial',
      es: 'El jugador lleva el vial plateado de sellado',
    },
    {
      flag: 'elara_blessing_applied',
      en: "Elara's blessing increased the player's vitality",
      es: 'La bendición de Elara aumentó la vitalidad del jugador',
    },
    {
      flag: 'rescue_oath',
      en: 'The player promised to rescue all three missing villagers',
      es: 'El jugador prometió rescatar a los tres aldeanos desaparecidos',
    },
    {
      flag: 'warrior_vanguard',
      en: 'The Warrior organized the rescue vanguard and gained +4 maximum HP',
      es: 'El Guerrero organizó la vanguardia de rescate y ganó +4 de vida máxima',
    },
    {
      flag: 'rogue_shadow_entry',
      en: 'The Rogue can bypass the first non-boss hostile ambush',
      es: 'El Pícaro puede evitar la primera emboscada hostil que no sea del jefe',
      spentFlag: 'rogue_shadow_entry_used',
      spentEn: 'The Rogue already used the undetected archive route to bypass one hostile ambush',
      spentEs: 'El Pícaro ya usó la ruta del archivo para evitar una emboscada hostil',
    },
    {
      flag: 'ranger_safe_passage',
      en: "The Ranger's reconstructed trail guarantees initiative in the first combat",
      es: 'El rastro reconstruido por el Explorador garantiza la iniciativa en el primer combate',
      spentFlag: 'ranger_safe_passage_used',
      spentEn: 'The Ranger read the abduction trail and used it to seize initiative in the first combat',
      spentEs: 'El Explorador leyó el rastro del secuestro y lo usó para tomar la iniciativa en el primer combate',
    },
    {
      flag: 'mage_arcane_ward',
      en: "The Mage's reconstructed flood ward will absorb the first hostile hit",
      es: 'La barrera de inundación reconstruida por el Mago absorberá el primer golpe hostil',
      spentFlag: 'mage_arcane_ward_used',
      spentEn: "The Mage's reconstructed flood ward already absorbed one hostile hit",
      spentEs: 'La barrera del Mago ya absorbió un golpe hostil',
    },
    {
      flag: 'cleric_sanctuary',
      en: 'The Cleric will survive the first otherwise lethal blow',
      es: 'El Clérigo sobrevivirá al primer golpe que de otro modo sería letal',
      spentFlag: 'cleric_sanctuary_used',
      spentEn: 'The Cleric already survived one otherwise lethal blow',
      spentEs: 'El Clérigo ya sobrevivió a un golpe que habría sido letal',
    },
    {
      flag: 'ashenvale_warden_lore',
      en: "Ashenvale ash-marks raise the player's AC by 2 against the Warden",
      es: 'Las marcas de ceniza de Valle Ceniciento suben 2 la CA del jugador frente al Guardián',
    },
    {
      flag: 'ironcoast_supplies',
      en: 'The Ironcoast contract added 25 gold and binding council support',
      es: 'El contrato de Costa de Hierro añadió 25 de oro y el apoyo vinculante del consejo',
    },
    {
      flag: 'shadowfen_dead_voices',
      en: "Shadowfen hearing recovered Greta's stolen voice and unlocks a unique way to appease the Drowned Door",
      es: 'El oído de Ciénaga Sombría recuperó la voz robada de Greta y abre una forma única de apaciguar la Puerta Ahogada',
    },
    {
      flag: 'stormreach_ward_breaker',
      en: "Stormreach engineering fractures the Warden's wards and reduces its maximum HP by 6",
      es: 'La ingeniería de Alcance Tormentoso fractura las defensas del Guardián y reduce su vida máxima en 6',
    },
    {
      flag: 'deephollow_tunnelcraft',
      en: 'Deephollow water marks reveal safe air pockets and an intact healing potion on the secret-tunnel route',
      es: 'Las marcas de agua de Hondonada Profunda revelan bolsas de aire seguras y una poción intacta en la ruta del túnel',
    },
    {
      flag: 'chapel_ledger_decoded',
      en: 'The player decoded the chapel burial ledger and holds the rusted chapel key plus the tunnel route',
      es: 'El jugador descifró el registro de entierros de la capilla y tiene la llave oxidada y la ruta del túnel',
    },
    {
      flag: 'drowned_runes_read',
      en: 'The player read the three runes of the Drowned Door and knows the sentence that answers it',
      es: 'El jugador leyó las tres runas de la Puerta Ahogada y conoce la frase que la responde',
    },
  ],
  suggestions: {
    black_lantern_tavern: [
      {
        label: 'Show the notice to Martik',
        labelEs: 'Mostrar el aviso a Martik',
        action: 'hablo con el tabernero',
        requires: [{ flag: 'talked_to_martik', equals: false }],
      },
      {
        label: 'Continue with Martik',
        labelEs: 'Seguir con Martik',
        action: 'hablo con el tabernero',
        requires: [{ flag: 'talked_to_martik' }],
      },
      {
        label: 'Talk to the stranger',
        labelEs: 'Hablar con el desconocido',
        action: 'hablo con el encapuchado',
        requires: [{ flag: 'talked_to_martik' }],
      },
      { label: 'Read the notice', labelEs: 'Leer el aviso', action: 'examine notice board' },
      {
        label: 'Look around',
        labelEs: 'Mirar a los alrededores',
        action: 'look around',
        requires: [{ flag: 'talked_to_martik', equals: false }],
      },
      { label: 'Go into the village', labelEs: 'Ir a la aldea', action: 'go to village' },
    ],
    blackmere_village: [
      { label: 'Talk to Elder Mira', labelEs: 'Hablar con la Anciana Mira', action: 'hablo con la anciana' },
      { label: 'Talk to Aldric', labelEs: 'Hablar con Aldric', action: 'hablo con el herrero' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    village_chapel: [
      { label: 'Talk to Priest Sera', labelEs: 'Hablar con la Sacerdotisa Sera', action: 'hablo con la sacerdotisa' },
      { label: 'Examine the altar', labelEs: 'Examinar el altar', action: 'examine altar' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    crypt_path: [
      {
        label: 'Advance with the escort',
        labelEs: 'Avanzar con la escolta',
        action: 'go forward',
        routes: ['council'],
        phase: 'after',
      },
      {
        label: 'Send scouts ahead',
        labelEs: 'Enviar exploradores',
        action: 'look around',
        routes: ['council'],
        phase: 'after',
      },
      {
        label: 'Check supplies',
        labelEs: 'Revisar provisiones',
        action: 'inventory',
        routes: ['council'],
        phase: 'after',
      },
      {
        label: 'Advance under cover',
        labelEs: 'Avanzar a cubierto',
        action: 'go forward',
        routes: ['forest'],
        phase: 'after',
      },
      {
        label: 'Search the hidden path',
        labelEs: 'Registrar el sendero oculto',
        action: 'search path',
        routes: ['forest'],
        phase: 'after',
      },
      {
        label: 'Advance toward the crypt',
        labelEs: 'Avanzar hacia la cripta',
        action: 'go forward',
        routes: ['direct', 'secret_tunnel', 'varen'],
        phase: 'after',
      },
      { label: 'Examine the tracks', labelEs: 'Examinar las huellas', action: 'examine fresh footprints' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    crypt_entrance: [
      { label: 'Enter the crypt', labelEs: 'Entrar en la cripta', action: 'go forward', phase: 'after' },
      { label: 'Study the runes', labelEs: 'Estudiar las runas', action: 'examine glowing runes' },
      { label: 'Inspect the iron door', labelEs: 'Inspeccionar la puerta', action: 'examine iron door' },
      { label: 'Open the door', labelEs: 'Abrir la puerta', action: 'open door', phase: 'before' },
    ],
    crypt_antechamber: [
      {
        label: 'Continue into the Hall of Echoes',
        labelEs: 'Seguir hacia la Sala de los Ecos',
        action: 'go forward',
      },
      {
        label: 'Face the Warden',
        labelEs: 'Enfrentar al Guardián',
        action: 'go to the guardian room',
      },
      { label: 'Study the burial mural', labelEs: 'Estudiar el mural funerario', action: 'examine burial mural' },
      { label: 'Search the columns', labelEs: 'Registrar las columnas', action: 'search columns' },
    ],
    // Without these the deeper crypt fell back to "Look around / Search", which
    // reads as a dead end even though the passages are open.
    crypt_hall_of_echoes: [
      { label: 'Press on to the Riddle Chamber', labelEs: 'Seguir a la Cámara de los Enigmas', action: 'go to the puzzle room' },
      { label: 'Turn aside to the armory', labelEs: 'Desviarte a la armería', action: 'go to the armory' },
      { label: 'Go back to the antechamber', labelEs: 'Volver a la antecámara', action: 'go to the antechamber' },
      { label: 'Search the hall', labelEs: 'Registrar la sala', action: 'search the room' },
    ],
    crypt_puzzle_room: [
      { label: 'Continue to the treasury', labelEs: 'Seguir hacia la cámara del tesoro', action: 'go to the treasury' },
      { label: 'Examine the pedestal', labelEs: 'Examinar el pedestal', action: 'examine pedestal' },
      { label: 'Go back to the Hall of Echoes', labelEs: 'Volver a la Sala de los Ecos', action: 'go to the hall of echoes' },
    ],
    crypt_armory: [
      { label: 'Search the racks', labelEs: 'Registrar los armeros', action: 'search the room' },
      { label: 'Go back to the Hall of Echoes', labelEs: 'Volver a la Sala de los Ecos', action: 'go to the hall of echoes' },
    ],
    crypt_treasury: [
      { label: 'Search the hoard', labelEs: 'Registrar el tesoro', action: 'search the room' },
      { label: 'Go back to the Riddle Chamber', labelEs: 'Volver a la Cámara de los Enigmas', action: 'go to the puzzle room' },
    ],
    crypt_guardian_room: [
      { label: 'Attack the Warden', labelEs: 'Atacar al Guardián', action: 'attack' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
      { label: 'Retreat to the antechamber', labelEs: 'Retirarte a la antecámara', action: 'go to the antechamber' },
    ],
  },
  summaryFlags: [
    'rescued_villagers', 'abandoned_villagers', 'sealed_drowned_door', 'destroyed_drowned_door',
    'door_left_unsealed', 'drowned_door_appeased', 'claimed_drowned_relic', 'rescue_oath',
    'varen_guide', 'forgave_varen', 'exposed_varen', 'council_support', 'council_hostile',
    'exposed_council', 'elara_blessing', 'chapel_ledger_decoded', 'drowned_runes_read',
    'warden_defeated',
  ],
};
