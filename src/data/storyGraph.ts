// ============================================================
// STORY GRAPH — Chapter I: The Missing of Blackmere
// Authored choices stay deterministic; free-form actions remain available
// after the chapter establishes the player's route to the crypt.
// ============================================================

import type { Archetype, Character, Origin, StoryRoute, StoryState } from '../engine/types';

export interface StoryCondition {
  flag: string;
  equals?: boolean;
}

export interface StoryChoice {
  id: string;
  label: string;
  labelEs: string;
  nextNodeId: string;
  setsFlags?: Record<string, boolean>;
  adjustsValues?: Record<string, number>;
  requires?: StoryCondition[];
  archetypes?: Archetype[];
  origins?: Origin[];
  result?: string;
  resultEs?: string;
}

export interface StoryNode {
  id: string;
  title: string;
  titleEs: string;
  text: string;
  textEs: string;
  choices: StoryChoice[];
  route?: StoryRoute;
  terminal?: boolean;
  externalEntry?: boolean;
}

export const STORY_START_NODE = 'arrival_at_black_lantern';

export function createInitialStoryState(): StoryState {
  return {
    currentNodeId: STORY_START_NODE,
    visitedNodeIds: [STORY_START_NODE],
    choiceHistory: [],
    values: {
      compassion: 0,
      pragmatism: 0,
      insight: 0,
      independence: 0,
      martikTrust: 0,
      strangerTrust: 0,
      councilTrust: 0,
    },
    completed: false,
  };
}

export function isStoryChoiceAvailable(
  choice: StoryChoice,
  flags: Record<string, boolean>,
  hero?: Pick<Character, 'archetype' | 'origin'>,
): boolean {
  const flagsMatch = (choice.requires ?? []).every(condition =>
    flags[condition.flag] === (condition.equals ?? true)
  );
  if (!flagsMatch) return false;
  if (choice.archetypes && (!hero || !choice.archetypes.includes(hero.archetype))) return false;
  if (choice.origins && (!hero || !choice.origins.includes(hero.origin))) return false;
  return true;
}

export const STORY_GRAPH: Record<string, StoryNode> = {
  arrival_at_black_lantern: {
    id: 'arrival_at_black_lantern',
    title: 'The Black Lantern',
    titleEs: 'El Farol Negro',
    text: 'The notice has brought you to the right place. Martik watches from behind the bar, the hooded stranger watches Martik, and the village beyond the door has gone quiet before nightfall.',
    textEs: 'El aviso te ha llevado al lugar correcto. Martik observa desde la barra, el desconocido encapuchado observa a Martik y la aldea al otro lado de la puerta ha quedado en silencio antes del anochecer.',
    choices: [
      { id: 'show_martik', label: 'Show the notice to Martik', labelEs: 'Mostrar el aviso a Martik', nextNodeId: 'martik_briefing', setsFlags: { approached_martik_first: true }, adjustsValues: { martikTrust: 1 } },
      { id: 'inspect_notice', label: 'Study the altered notice', labelEs: 'Estudiar el aviso alterado', nextNodeId: 'notice_clue', setsFlags: { noticed_second_ink: true }, adjustsValues: { insight: 1 } },
      { id: 'watch_stranger', label: 'Approach the hooded stranger', labelEs: 'Acercarse al desconocido', nextNodeId: 'stranger_warning', setsFlags: { approached_stranger_first: true }, adjustsValues: { strangerTrust: 1 } },
      { id: 'leave_tavern', label: 'Investigate the village first', labelEs: 'Investigar primero la aldea', nextNodeId: 'village_crossroads', setsFlags: { investigated_independently: true }, adjustsValues: { independence: 1 } },
    ],
  },

  martik_briefing: {
    id: 'martik_briefing',
    title: 'Three Names',
    titleEs: 'Tres nombres',
    text: 'Martik names the missing: Tomas, a young farmer; Greta, keeper of the chapel records; and Lyra, sister of the healer Elara. All three asked about lights moving in the northern hills before they vanished.',
    textEs: 'Martik nombra a los desaparecidos: Tomas, un joven granjero; Greta, guardiana de los archivos de la capilla; y Lyra, hermana de la curandera Elara. Los tres preguntaron por unas luces que se movían en las colinas del norte antes de desaparecer.',
    choices: [
      { id: 'swear_rescue', label: 'Promise to bring them home', labelEs: 'Prometer que los traerás a casa', nextNodeId: 'martik_names', setsFlags: { rescue_oath: true }, adjustsValues: { compassion: 2, martikTrust: 2 } },
      { id: 'ask_payment', label: 'Negotiate the reward first', labelEs: 'Negociar primero la recompensa', nextNodeId: 'martik_names', setsFlags: { negotiated_reward: true }, adjustsValues: { pragmatism: 2, martikTrust: -1 } },
      { id: 'question_council', label: 'Ask why the council calls them runaways', labelEs: 'Preguntar por qué el consejo los llama fugitivos', nextNodeId: 'council_secret', setsFlags: { suspects_council: true }, adjustsValues: { insight: 2 } },
      {
        id: 'warrior_take_command',
        label: '[Warrior] Organize a rescue party',
        labelEs: '[Guerrero] Organizar una partida de rescate',
        nextNodeId: 'martik_names',
        archetypes: ['warrior'],
        setsFlags: { warrior_vanguard: true, rescue_oath: true },
        adjustsValues: { compassion: 1, martikTrust: 3 },
        result: 'You turn fear into a plan: watches, signals, marching order. Martik recognizes someone accustomed to keeping others alive under pressure.',
        resultEs: 'Transformas el miedo en un plan: guardias, señales y orden de marcha. Martik reconoce a alguien acostumbrado a mantener con vida a otros bajo presión.',
      },
    ],
  },

  notice_clue: {
    id: 'notice_clue',
    title: 'Two Inks',
    titleEs: 'Dos tintas',
    text: 'The council notice promises gold but never mentions the crypt. Martik added that clue later. On the back, three initials—T, G, and L—have been crossed out by a fourth hand.',
    textEs: 'El aviso del consejo promete oro, pero nunca menciona la cripta. Martik añadió esa pista después. En el reverso, tres iniciales —T, G y L— están tachadas por una cuarta mano.',
    choices: [
      { id: 'compare_martik', label: 'Ask Martik about both inks', labelEs: 'Preguntar a Martik por las dos tintas', nextNodeId: 'council_secret', setsFlags: { confronted_martik_with_notice: true }, adjustsValues: { martikTrust: 1, insight: 1 } },
      { id: 'show_stranger', label: 'Show the crossed initials to the stranger', labelEs: 'Mostrar las iniciales al desconocido', nextNodeId: 'stranger_warning', setsFlags: { showed_notice_to_stranger: true }, adjustsValues: { strangerTrust: 2 } },
      { id: 'take_to_council', label: 'Take the notice to the village council', labelEs: 'Llevar el aviso al consejo', nextNodeId: 'council_chamber', setsFlags: { challenged_council: true }, adjustsValues: { councilTrust: -1 } },
    ],
  },

  stranger_warning: {
    id: 'stranger_warning',
    title: 'The Fourth Hand',
    titleEs: 'La cuarta mano',
    text: 'The stranger recognizes the crossed initials. “The council struck out their names after they vanished. They are hiding panic, not guilt. But someone beneath the crypt wanted those three specifically.”',
    textEs: 'El desconocido reconoce las iniciales tachadas. «El consejo borró sus nombres después de que desaparecieran. Ocultan el pánico, no la culpa. Pero alguien bajo la cripta quería precisamente a esas tres personas».',
    choices: [
      { id: 'believe_warning', label: 'Ask what waits beneath the crypt', labelEs: 'Preguntar qué espera bajo la cripta', nextNodeId: 'warden_truth', setsFlags: { believes_stranger: true }, adjustsValues: { strangerTrust: 2 } },
      { id: 'demand_identity', label: 'Demand the stranger’s identity', labelEs: 'Exigir la identidad del desconocido', nextNodeId: 'stranger_identity', setsFlags: { pressed_stranger: true }, adjustsValues: { strangerTrust: -1 } },
      { id: 'return_to_martik', label: 'Return to Martik with this warning', labelEs: 'Volver con Martik y contarle la advertencia', nextNodeId: 'martik_briefing', setsFlags: { shared_warning_with_martik: true }, adjustsValues: { martikTrust: 1 } },
    ],
  },

  village_crossroads: {
    id: 'village_crossroads',
    title: 'A Village Holding Its Breath',
    titleEs: 'Una aldea que contiene el aliento',
    text: 'Outside, every door is barred. Candlelight burns in the chapel, fresh wagon tracks cut toward the forest, and two council guards remove notices from the square.',
    textEs: 'Fuera, todas las puertas están atrancadas. Hay velas encendidas en la capilla, huellas recientes de carreta se internan en el bosque y dos guardias del consejo retiran avisos de la plaza.',
    choices: [
      { id: 'visit_chapel', label: 'Follow the candlelight to the chapel', labelEs: 'Seguir la luz hasta la capilla', nextNodeId: 'chapel_plea', setsFlags: { visited_chapel_first: true }, adjustsValues: { compassion: 1 } },
      { id: 'follow_tracks', label: 'Follow the wagon tracks', labelEs: 'Seguir las huellas de la carreta', nextNodeId: 'forest_tracks', setsFlags: { found_wagon_tracks: true }, adjustsValues: { independence: 1 } },
      { id: 'confront_guards', label: 'Ask the guards why they remove notices', labelEs: 'Preguntar a los guardias por los avisos', nextNodeId: 'council_chamber', setsFlags: { confronted_guards: true }, adjustsValues: { councilTrust: -1, insight: 1 } },
    ],
  },

  martik_names: {
    id: 'martik_names',
    title: 'What the Missing Shared',
    titleEs: 'Lo que compartían los desaparecidos',
    text: 'Martik spreads a rough map on the bar. Tomas knew the forest paths, Greta could read the crypt’s old script, and Lyra had begun dreaming of a door beneath black water. Their disappearances were not random.',
    textEs: 'Martik extiende un mapa rudimentario sobre la barra. Tomas conocía los senderos, Greta podía leer la escritura antigua de la cripta y Lyra había empezado a soñar con una puerta bajo aguas negras. Sus desapariciones no fueron casuales.',
    choices: [
      { id: 'seek_families', label: 'Speak with the families', labelEs: 'Hablar con las familias', nextNodeId: 'chapel_plea', setsFlags: { seeking_witnesses: true }, adjustsValues: { compassion: 1 } },
      { id: 'study_tracks', label: 'Investigate Tomas’s last trail', labelEs: 'Investigar el último rastro de Tomas', nextNodeId: 'forest_tracks', setsFlags: { tracking_tomas: true }, adjustsValues: { insight: 1 } },
      { id: 'prepare_departure', label: 'Choose how to approach the crypt', labelEs: 'Decidir cómo acercarse a la cripta', nextNodeId: 'plan_departure', setsFlags: { briefed_by_martik: true } },
    ],
  },

  council_secret: {
    id: 'council_secret',
    title: 'The Sealed Record',
    titleEs: 'El registro sellado',
    text: 'Martik admits the council keeps the journal of the last crypt expedition locked in its archive. The expedition returned with one survivor, but his name was removed from every public record.',
    textEs: 'Martik admite que el consejo guarda bajo llave el diario de la última expedición a la cripta. La expedición regresó con un superviviente, pero su nombre fue eliminado de todos los registros públicos.',
    choices: [
      { id: 'steal_record', label: 'Break into the archive', labelEs: 'Entrar a escondidas en el archivo', nextNodeId: 'archive_clue', setsFlags: { stole_archive_record: true }, adjustsValues: { councilTrust: -2, independence: 2 } },
      { id: 'petition_council', label: 'Demand access from the council', labelEs: 'Exigir acceso al consejo', nextNodeId: 'council_chamber', setsFlags: { requested_archive_access: true }, adjustsValues: { councilTrust: 1 } },
      { id: 'ask_survivor', label: 'Find the unnamed survivor', labelEs: 'Buscar al superviviente sin nombre', nextNodeId: 'stranger_identity', setsFlags: { knows_survivor_exists: true }, adjustsValues: { insight: 1 } },
      {
        id: 'rogue_enter_archive',
        label: '[Rogue] Enter without disturbing the seal',
        labelEs: '[Pícaro] Entrar sin alterar el sello',
        nextNodeId: 'archive_clue',
        archetypes: ['rogue'],
        setsFlags: { rogue_shadow_entry: true, stole_archive_record: true },
        adjustsValues: { independence: 2, insight: 1 },
        result: 'The archive lock yields without a scratch. You copy the journal and replace every thread of the wax seal; the council will not know it was opened.',
        resultEs: 'La cerradura cede sin dejar una marca. Copias el diario y restituyes cada hilo del sello de cera; el consejo no sabrá que fue abierto.',
      },
    ],
  },

  council_chamber: {
    id: 'council_chamber',
    title: 'The Council’s Bargain',
    titleEs: 'El trato del consejo',
    text: 'The council speaker confesses that fear caused the cover-up: if trade caravans learn what is happening, Blackmere will starve. They offer supplies and guards in exchange for your silence.',
    textEs: 'El portavoz del consejo confiesa que el miedo causó el encubrimiento: si las caravanas comerciales descubren lo que ocurre, Blackmere morirá de hambre. Ofrecen provisiones y guardias a cambio de tu silencio.',
    choices: [
      { id: 'accept_council', label: 'Accept help and keep their secret—for now', labelEs: 'Aceptar la ayuda y guardar el secreto por ahora', nextNodeId: 'plan_departure', setsFlags: { council_support: true, kept_council_secret: true }, adjustsValues: { councilTrust: 3, pragmatism: 1 } },
      { id: 'expose_council', label: 'Refuse and tell the village the truth', labelEs: 'Negarse y contar la verdad a la aldea', nextNodeId: 'plan_departure', setsFlags: { council_hostile: true, exposed_council: true }, adjustsValues: { councilTrust: -3, compassion: 1 } },
      { id: 'trade_for_archive', label: 'Trade silence for the expedition journal', labelEs: 'Cambiar silencio por el diario de la expedición', nextNodeId: 'archive_clue', setsFlags: { bargained_for_archive: true }, adjustsValues: { councilTrust: 1, insight: 2 } },
      {
        id: 'ironcoast_contract',
        label: '[Iron Coast] Bind the council to a written contract',
        labelEs: '[Costa de Hierro] Obligar al consejo a firmar un contrato',
        nextNodeId: 'plan_departure',
        origins: ['ironcoast'],
        setsFlags: { council_support: true, ironcoast_supplies: true, kept_council_secret: true },
        adjustsValues: { councilTrust: 2, pragmatism: 2 },
        result: 'Iron Coast law is merciless about sealed bargains. The council signs for an advance, provisions, and armed support—with penalties if they abandon you.',
        resultEs: 'La ley de la Costa de Hierro es implacable con los pactos sellados. El consejo firma un adelanto, provisiones y apoyo armado, con sanciones si te abandona.',
      },
    ],
  },

  chapel_plea: {
    id: 'chapel_plea',
    title: 'Lyra’s Dream',
    titleEs: 'El sueño de Lyra',
    text: 'Elara, Lyra’s sister, shows you a drawing left behind: a stone door below black water and three figures bound before it. Greta called the same symbol “the Drowned Eye.”',
    textEs: 'Elara, la hermana de Lyra, te muestra un dibujo que dejó atrás: una puerta de piedra bajo aguas negras y tres figuras atadas ante ella. Greta llamaba al mismo símbolo «el Ojo Ahogado».',
    choices: [
      { id: 'vow_rescue', label: 'Swear that rescue comes before treasure', labelEs: 'Jurar que el rescate está antes que el tesoro', nextNodeId: 'plan_departure', setsFlags: { rescue_oath: true, elara_blessing: true }, adjustsValues: { compassion: 3 } },
      { id: 'ask_symbol', label: 'Search Greta’s records for the symbol', labelEs: 'Buscar el símbolo en los registros de Greta', nextNodeId: 'archive_clue', setsFlags: { knows_drowned_eye: true }, adjustsValues: { insight: 2 } },
      { id: 'ask_last_route', label: 'Ask where Lyra went that night', labelEs: 'Preguntar adónde fue Lyra esa noche', nextNodeId: 'forest_tracks', setsFlags: { tracking_lyra: true }, adjustsValues: { compassion: 1, insight: 1 } },
      {
        id: 'cleric_consecrate_vow',
        label: '[Cleric] Consecrate the rescue vow',
        labelEs: '[Clérigo] Consagrar el juramento de rescate',
        nextNodeId: 'plan_departure',
        archetypes: ['cleric'],
        origins: ['ashenvale', 'ironcoast', 'stormreach', 'deephollow'],
        setsFlags: { rescue_oath: true, cleric_sanctuary: true },
        adjustsValues: { compassion: 3 },
        result: 'The chapel flame bends toward your holy symbol. Elara and the families answer your vow together; their faith will shield you once when death reaches for you.',
        resultEs: 'La llama de la capilla se inclina hacia tu símbolo sagrado. Elara y las familias responden juntas a tu juramento; su fe te protegerá una vez cuando la muerte intente alcanzarte.',
      },
      {
        id: 'shadowfen_hear_greta',
        label: '[Shadowfen] Listen for Greta among the dead',
        labelEs: '[Ciénaga Sombría] Buscar la voz de Greta entre los muertos',
        nextNodeId: 'archive_clue',
        archetypes: ['warrior', 'rogue', 'ranger', 'mage'],
        origins: ['shadowfen'],
        setsFlags: { shadowfen_dead_voices: true, knows_drowned_eye: true },
        adjustsValues: { insight: 2, compassion: 1 },
        result: 'You hear no corpse—Greta is alive—but her stolen voice whispers through the chapel stones: “Below us. Follow the water that remembers.”',
        resultEs: 'No oyes a ningún cadáver —Greta sigue viva—, pero su voz robada susurra entre las piedras: «Debajo. Sigue el agua que recuerda».',
      },
      {
        id: 'cleric_shadowfen_requiem',
        label: '[Shadowfen Cleric] Consecrate Greta\'s living voice',
        labelEs: '[Clérigo de Ciénaga Sombría] Consagrar la voz viva de Greta',
        nextNodeId: 'archive_clue',
        archetypes: ['cleric'],
        origins: ['shadowfen'],
        setsFlags: { rescue_oath: true, cleric_sanctuary: true, shadowfen_dead_voices: true, knows_drowned_eye: true },
        adjustsValues: { compassion: 3, insight: 2 },
        result: 'You refuse to mistake Greta\'s stolen voice for a ghost. Your prayer anchors her among the living, and the answering chorus consecrates your rescue oath while revealing the water-bound passage.',
        resultEs: 'Te niegas a confundir la voz robada de Greta con la de un fantasma. Tu oración la ancla entre los vivos y el coro que responde consagra tu juramento de rescate mientras revela el pasadizo ligado al agua.',
      },
    ],
  },

  forest_tracks: {
    id: 'forest_tracks',
    title: 'Tracks That Return Empty',
    titleEs: 'Huellas que regresan vacías',
    text: 'The wagon tracks reach an abandoned charcoal road. Three sets of footprints continue north; only one set returns, accompanied by a deep groove as if something heavy was dragged toward Blackmere.',
    textEs: 'Las huellas llegan a un camino carbonero abandonado. Tres pares de pisadas continúan al norte; solo uno regresa, acompañado por un surco profundo, como si algo pesado hubiera sido arrastrado hacia Blackmere.',
    choices: [
      { id: 'follow_returning', label: 'Follow the returning footprints', labelEs: 'Seguir las pisadas que regresan', nextNodeId: 'stranger_identity', setsFlags: { tracked_survivor: true }, adjustsValues: { insight: 2 } },
      { id: 'mark_forest_route', label: 'Mark a hidden route through the forest', labelEs: 'Marcar una ruta oculta por el bosque', nextNodeId: 'plan_departure', setsFlags: { forest_route_known: true }, adjustsValues: { independence: 2 } },
      { id: 'report_tracks', label: 'Bring this evidence to Martik', labelEs: 'Llevar esta prueba a Martik', nextNodeId: 'martik_names', setsFlags: { shared_tracks_with_martik: true }, adjustsValues: { martikTrust: 2 } },
      {
        id: 'ranger_read_tracks',
        label: '[Ranger] Reconstruct the abduction from the tracks',
        labelEs: '[Explorador] Reconstruir el secuestro por las huellas',
        nextNodeId: 'plan_departure',
        archetypes: ['ranger'],
        setsFlags: { forest_route_known: true, ranger_safe_passage: true },
        adjustsValues: { insight: 2, independence: 1 },
        result: 'Bent needles, displaced moss, and stride length tell the story: the captives walked willingly until the old cairn. You mark a route the ambushers cannot watch.',
        resultEs: 'Agujas dobladas, musgo desplazado y longitud de zancada cuentan la historia: los cautivos caminaron por voluntad propia hasta el viejo cairn. Marcas una ruta que los emboscadores no pueden vigilar.',
      },
    ],
  },

  warden_truth: {
    id: 'warden_truth',
    title: 'The Door Below',
    titleEs: 'La puerta de abajo',
    text: 'The stranger says the Warden is a jailer, not a guardian. Killing it carelessly will open the submerged door. A silver sealing vial can close it—but only if used before taking anything from the chamber.',
    textEs: 'El desconocido afirma que el Guardián es un carcelero, no un protector. Matarlo sin cuidado abrirá la puerta sumergida. Un vial de sellado puede cerrarla, pero solo si se usa antes de tomar nada de la cámara.',
    choices: [
      { id: 'take_vial', label: 'Accept the vial and agree to seal the door', labelEs: 'Aceptar el vial y prometer sellar la puerta', nextNodeId: 'plan_departure', setsFlags: { has_sealing_vial: true, promised_to_seal_door: true }, adjustsValues: { strangerTrust: 2, compassion: 1 } },
      { id: 'seek_destroy', label: 'Reject the bargain and plan to destroy the door', labelEs: 'Rechazar el trato y planear destruir la puerta', nextNodeId: 'plan_departure', setsFlags: { intends_destroy_door: true }, adjustsValues: { independence: 2 } },
      { id: 'demand_truth', label: 'Demand to know how the stranger survived', labelEs: 'Exigir saber cómo sobrevivió el desconocido', nextNodeId: 'stranger_identity', setsFlags: { knows_about_warden: true }, adjustsValues: { insight: 1 } },
      {
        id: 'ashenvale_read_warden_mark',
        label: '[Ashenvale] Read the Warden’s ash-mark',
        labelEs: '[Valle Ceniza] Leer la marca de ceniza del Guardián',
        nextNodeId: 'plan_departure',
        origins: ['ashenvale'],
        setsFlags: { ashenvale_warden_lore: true, intends_destroy_door: true },
        adjustsValues: { insight: 2 },
        result: 'You saw the same brand after the fires of Ashenvale: a binding that weakens when named in the old tongue. The Warden can be made vulnerable.',
        resultEs: 'Viste la misma marca tras los incendios del Valle Ceniza: una atadura que se debilita al nombrarla en la lengua antigua. El Guardián puede volverse vulnerable.',
      },
    ],
  },

  stranger_identity: {
    id: 'stranger_identity',
    title: 'Captain Varen',
    titleEs: 'Capitán Varen',
    text: 'The stranger lowers his hood. Captain Varen led the previous expedition. He sealed his companions inside when the Warden woke, and has lived with that choice ever since.',
    textEs: 'El desconocido se baja la capucha. Es el capitán Varen, quien dirigió la expedición anterior. Selló dentro a sus compañeros cuando el Guardián despertó y desde entonces vive con aquella decisión.',
    choices: [
      { id: 'forgive_varen', label: 'Offer Varen a chance to put it right', labelEs: 'Dar a Varen la oportunidad de repararlo', nextNodeId: 'plan_departure', setsFlags: { varen_guide: true, forgave_varen: true }, adjustsValues: { strangerTrust: 3, compassion: 1 } },
      { id: 'expose_varen', label: 'Expose Varen to the village', labelEs: 'Entregar a Varen ante la aldea', nextNodeId: 'plan_departure', setsFlags: { exposed_varen: true }, adjustsValues: { strangerTrust: -3, councilTrust: 1 } },
      { id: 'demand_map', label: 'Demand his old expedition map', labelEs: 'Exigir el mapa de su expedición', nextNodeId: 'archive_clue', setsFlags: { coerced_varen: true }, adjustsValues: { strangerTrust: -1, pragmatism: 2 } },
    ],
  },

  archive_clue: {
    id: 'archive_clue',
    title: 'The Drowned Passage',
    titleEs: 'El pasadizo ahogado',
    text: 'The expedition journal reveals a flooded service tunnel beneath the chapel. It bypasses the crypt gate and reaches the prisoners’ level, but the map warns that the water carries memories that are not your own.',
    textEs: 'El diario de la expedición revela un túnel de servicio inundado bajo la capilla. Evita la entrada de la cripta y llega al nivel de los prisioneros, pero el mapa advierte que el agua transporta recuerdos que no son tuyos.',
    choices: [
      { id: 'keep_map', label: 'Keep the tunnel map secret', labelEs: 'Guardar en secreto el mapa del túnel', nextNodeId: 'plan_departure', setsFlags: { tunnel_map: true, hid_tunnel_map: true }, adjustsValues: { independence: 2 } },
      { id: 'share_map', label: 'Share the map with Martik', labelEs: 'Compartir el mapa con Martik', nextNodeId: 'plan_departure', setsFlags: { tunnel_map: true, shared_tunnel_map: true }, adjustsValues: { martikTrust: 2 } },
      { id: 'burn_map', label: 'Destroy the dangerous map', labelEs: 'Destruir el mapa peligroso', nextNodeId: 'plan_departure', setsFlags: { destroyed_tunnel_map: true }, adjustsValues: { compassion: 1, pragmatism: -1 } },
      {
        id: 'mage_decode_flood_wards',
        label: '[Mage] Reconstruct the flood wards',
        labelEs: '[Mago] Reconstruir las barreras de inundación',
        nextNodeId: 'plan_departure',
        archetypes: ['mage'],
        origins: ['ashenvale', 'ironcoast', 'shadowfen'],
        setsFlags: { tunnel_map: true, mage_arcane_ward: true },
        adjustsValues: { insight: 3 },
        result: 'The diagram is not merely a map but a spell circuit. You restore one broken ward and bind it to your focus; it will absorb the first hostile spell or strike.',
        resultEs: 'El diagrama no es solo un mapa, sino un circuito de hechizo. Restauras una barrera rota y la enlazas a tu foco; absorberá el primer hechizo o golpe hostil.',
      },
      {
        id: 'stormreach_rebuild_gate',
        label: '[Stormreach] Recalculate the ancient floodgates',
        labelEs: '[Barrera Tormentosa] Recalcular las compuertas antiguas',
        nextNodeId: 'plan_departure',
        archetypes: ['warrior', 'rogue', 'ranger', 'cleric'],
        origins: ['stormreach'],
        setsFlags: { tunnel_map: true, stormreach_ward_breaker: true },
        adjustsValues: { insight: 3 },
        result: 'Stormreach engineering hides beneath the ritual notation. You calculate where pressure will fracture the Warden’s defenses without collapsing the prisoners’ chamber.',
        resultEs: 'Bajo la notación ritual reconoces ingeniería de Barrera Tormentosa. Calculas dónde la presión fracturará las defensas del Guardián sin hundir la cámara de los prisioneros.',
      },
      {
        id: 'deephollow_read_water',
        label: '[Deephollow] Read the underground water marks',
        labelEs: '[Hondonada Profunda] Leer las marcas del agua subterránea',
        nextNodeId: 'plan_departure',
        archetypes: ['warrior', 'rogue', 'ranger', 'cleric'],
        origins: ['deephollow'],
        setsFlags: { tunnel_map: true, deephollow_tunnelcraft: true },
        adjustsValues: { independence: 2, insight: 1 },
        result: 'The map uses miners’ water marks still taught in Deephollow. You identify stable air pockets and a dry ledge that the original expedition missed.',
        resultEs: 'El mapa usa marcas de agua mineras que aún se enseñan en Hondonada Profunda. Identificas bolsas de aire estables y una cornisa seca que la expedición original pasó por alto.',
      },
      {
        id: 'mage_stormreach_master_wards',
        label: '[Stormreach Mage] Turn the flood circuit against the Warden',
        labelEs: '[Mago de Barrera Tormentosa] Volver el circuito de inundación contra el Guardián',
        nextNodeId: 'plan_departure',
        archetypes: ['mage'],
        origins: ['stormreach'],
        setsFlags: { tunnel_map: true, mage_arcane_ward: true, stormreach_ward_breaker: true },
        adjustsValues: { insight: 4 },
        result: 'You read the design as both spellcraft and Stormreach engineering. One half becomes a ward around your body; the other will drive ancient water pressure through the Warden\'s defenses.',
        resultEs: 'Lees el diseño a la vez como hechicería e ingeniería de Barrera Tormentosa. Una mitad se convierte en una barrera alrededor de tu cuerpo; la otra conducirá la presión del agua antigua a través de las defensas del Guardián.',
      },
      {
        id: 'mage_deephollow_safe_circuit',
        label: '[Deephollow Mage] Bind the ward to the dry ledges',
        labelEs: '[Mago de Hondonada Profunda] Ligar la barrera a las cornisas secas',
        nextNodeId: 'plan_departure',
        archetypes: ['mage'],
        origins: ['deephollow'],
        setsFlags: { tunnel_map: true, mage_arcane_ward: true, deephollow_tunnelcraft: true },
        adjustsValues: { insight: 3, independence: 2 },
        result: 'Deephollow water marks show where the spell circuit can breathe. You stabilize the dry route and carry the repaired ward with you instead of choosing between them.',
        resultEs: 'Las marcas de agua de Hondonada Profunda muestran dónde puede respirar el circuito de hechizo. Estabilizas la ruta seca y llevas contigo la barrera reparada en vez de elegir entre ambas.',
      },
    ],
  },

  plan_departure: {
    id: 'plan_departure',
    title: 'Choose the Road',
    titleEs: 'Elegir el camino',
    text: 'By midnight you know enough to act. Every route can reach the Sunken Crypt, but each determines who stands beside you, what dangers you meet first, and which promises can still be kept.',
    textEs: 'A medianoche sabes lo suficiente para actuar. Todas las rutas pueden llevarte a la Cripta Sumergida, pero cada una determina quién estará a tu lado, qué peligros encontrarás primero y qué promesas podrás cumplir.',
    choices: [
      { id: 'take_direct', label: 'Take the direct road before dawn', labelEs: 'Tomar el camino directo antes del amanecer', nextNodeId: 'route_direct', setsFlags: { chose_direct_route: true } },
      { id: 'take_forest', label: 'Use the old forest paths', labelEs: 'Usar los antiguos senderos del bosque', nextNodeId: 'route_forest', setsFlags: { chose_forest_route: true } },
      { id: 'take_tunnel', label: 'Enter through the flooded tunnel', labelEs: 'Entrar por el túnel inundado', nextNodeId: 'route_secret_tunnel', requires: [{ flag: 'tunnel_map' }], setsFlags: { chose_tunnel_route: true } },
      { id: 'take_varen', label: 'Return with Varen as your guide', labelEs: 'Regresar con Varen como guía', nextNodeId: 'route_varen', requires: [{ flag: 'varen_guide' }], setsFlags: { chose_varen_route: true } },
      { id: 'take_council', label: 'Lead the council escort', labelEs: 'Liderar la escolta del consejo', nextNodeId: 'route_council', requires: [{ flag: 'council_support' }], setsFlags: { chose_council_route: true } },
    ],
  },

  route_direct: {
    id: 'route_direct', title: 'The Open Road', titleEs: 'El camino abierto', route: 'direct', terminal: true,
    text: 'You leave before dawn on the shortest road. You will reach the crypt quickly, but without allies or hidden knowledge. Whatever waits at the gate will see you coming.',
    textEs: 'Partes antes del amanecer por el camino más corto. Llegarás pronto a la cripta, pero sin aliados ni conocimientos ocultos. Lo que espere en la entrada te verá llegar.', choices: [],
  },
  route_forest: {
    id: 'route_forest', title: 'Under the Old Pines', titleEs: 'Bajo los pinos antiguos', route: 'forest', terminal: true,
    text: 'You choose the forest path, trading speed for secrecy. The tracks of the missing may reveal what happened before you ever reach the crypt.',
    textEs: 'Eliges el sendero del bosque, cambiando velocidad por sigilo. Las huellas de los desaparecidos pueden revelar lo ocurrido antes de que llegues a la cripta.', choices: [],
  },
  route_secret_tunnel: {
    id: 'route_secret_tunnel', title: 'Black Water', titleEs: 'Aguas negras', route: 'secret_tunnel', terminal: true,
    text: 'With the stolen map, you descend beneath the chapel. This path reaches the prisoners first—but every memory in the flooded tunnel will demand a price.',
    textEs: 'Con el mapa, desciendes bajo la capilla. Esta ruta llega primero a los prisioneros, pero cada recuerdo del túnel inundado exigirá un precio.', choices: [],
  },
  route_varen: {
    id: 'route_varen', title: 'A Debt Returned', titleEs: 'Una deuda que regresa', route: 'varen', terminal: true,
    text: 'Varen leads you along the route of his failed expedition. He knows the Warden’s traps, but the crypt remembers him—and may use his guilt against both of you.',
    textEs: 'Varen te guía por la ruta de su expedición fallida. Conoce las trampas del Guardián, pero la cripta lo recuerda y puede usar su culpa contra ambos.', choices: [],
  },
  route_council: {
    id: 'route_council', title: 'Banners in the Mist', titleEs: 'Estandartes en la niebla', route: 'council', terminal: true,
    text: 'You march with supplies and armed guards. The escort makes combat easier, but the council expects control over anything recovered from the crypt.',
    textEs: 'Marchas con provisiones y guardias armados. La escolta facilitará el combate, pero el consejo espera controlar todo lo que se recupere de la cripta.', choices: [],
  },

  warden_aftermath: {
    id: 'warden_aftermath',
    title: 'The Door Opens',
    titleEs: 'La puerta se abre',
    externalEntry: true,
    text: 'The Warden collapses. Behind its throne, Tomas, Greta, and Lyra hang alive in loosened chains. Beneath them, the submerged door begins to open. There is time for one deliberate choice before the chamber floods with black light.',
    textEs: 'El Guardián se derrumba. Tras su trono, Tomas, Greta y Lyra cuelgan vivos de unas cadenas que empiezan a aflojarse. Bajo ellos, la puerta sumergida comienza a abrirse. Solo hay tiempo para una decisión consciente antes de que la cámara se inunde de luz negra.',
    choices: [
      { id: 'rescue_and_flee', label: 'Free the villagers and flee', labelEs: 'Liberar a los aldeanos y huir', nextNodeId: 'ending_rescue', setsFlags: { rescued_villagers: true, door_left_unsealed: true }, adjustsValues: { compassion: 3 } },
      { id: 'seal_and_rescue', label: 'Use the vial, then free the villagers', labelEs: 'Usar el vial y liberar a los aldeanos', nextNodeId: 'ending_sealed', requires: [{ flag: 'has_sealing_vial' }], setsFlags: { rescued_villagers: true, sealed_drowned_door: true }, adjustsValues: { compassion: 2, strangerTrust: 2 } },
      { id: 'destroy_and_rescue', label: 'Bring down the chamber around the door', labelEs: 'Derrumbar la cámara sobre la puerta', nextNodeId: 'ending_destroyed', requires: [{ flag: 'intends_destroy_door' }], setsFlags: { rescued_villagers: true, destroyed_drowned_door: true }, adjustsValues: { independence: 2 } },
      {
        id: 'shadowfen_return_voice',
        label: '[Shadowfen] Return Greta\'s stolen voice to the water',
        labelEs: '[Ciénaga Sombría] Devolver al agua la voz robada de Greta',
        nextNodeId: 'ending_remembered',
        origins: ['shadowfen'],
        requires: [{ flag: 'shadowfen_dead_voices' }],
        setsFlags: { rescued_villagers: true, drowned_door_appeased: true },
        adjustsValues: { compassion: 2, insight: 2 },
        result: 'You repeat the words that followed you from the chapel. Greta answers with her true voice, and the black water stills long enough for all four of you to escape.',
        resultEs: 'Repites las palabras que te siguieron desde la capilla. Greta responde con su voz verdadera y el agua negra se aquieta el tiempo suficiente para que los cuatro escapen.',
      },
      { id: 'claim_relic', label: 'Take the relic beyond the door', labelEs: 'Tomar la reliquia tras la puerta', nextNodeId: 'ending_relic', setsFlags: { abandoned_villagers: true, claimed_drowned_relic: true }, adjustsValues: { pragmatism: 3, compassion: -3 } },
    ],
  },
  ending_rescue: {
    id: 'ending_rescue', title: 'The Cost of Mercy', titleEs: 'El precio de la misericordia', terminal: true,
    text: 'You cut the three prisoners free and escape as black water fills the chamber. Blackmere welcomes its missing home, but far below, the open door continues to breathe. Your rescue is a victory—and a promise of what comes next.',
    textEs: 'Liberas a los tres prisioneros y escapas mientras el agua negra llena la cámara. Blackmere recibe a sus desaparecidos, pero muy abajo la puerta abierta sigue respirando. Tu rescate es una victoria y una promesa de lo que vendrá.', choices: [],
  },
  ending_sealed: {
    id: 'ending_sealed', title: 'A Door Made Silent', titleEs: 'Una puerta silenciada', terminal: true,
    text: 'The silver vial turns the black water clear. You free Tomas, Greta, and Lyra before the stone seals forever. Varen’s debt is paid, and Blackmere gains something rarer than treasure: a future.',
    textEs: 'El vial plateado vuelve transparente el agua negra. Liberas a Tomas, Greta y Lyra antes de que la piedra se selle para siempre. La deuda de Varen queda saldada y Blackmere obtiene algo más raro que un tesoro: un futuro.', choices: [],
  },
  ending_destroyed: {
    id: 'ending_destroyed', title: 'Stone Upon Stone', titleEs: 'Piedra sobre piedra', terminal: true,
    text: 'You break the ancient supports and drag the prisoners clear. The chamber collapses over the Drowned Door. No seal lasts forever, but this one will outlive everyone who knows where to dig.',
    textEs: 'Rompes los soportes antiguos y sacas a los prisioneros. La cámara se derrumba sobre la Puerta Ahogada. Ningún sello dura para siempre, pero este sobrevivirá a todos los que saben dónde excavar.', choices: [],
  },
  ending_remembered: {
    id: 'ending_remembered', title: 'The Name the Water Kept', titleEs: 'El nombre que guardó el agua', terminal: true,
    text: 'Greta speaks the forgotten name of the Drowned Eye. The door recognizes its keeper and closes without blood or ruin. You lead the three captives home carrying a secret almost nobody left alive knows how to hear.',
    textEs: 'Greta pronuncia el nombre olvidado del Ojo Ahogado. La puerta reconoce a su guardiana y se cierra sin sangre ni destrucción. Conduces a los tres cautivos a casa llevando un secreto que casi nadie con vida sabe ya escuchar.', choices: [],
  },
  ending_relic: {
    id: 'ending_relic', title: 'What You Chose to Carry', titleEs: 'Lo que elegiste cargar', terminal: true,
    text: 'You reach through the opening and take the relic. By the time you turn back, the chains and their captives have vanished beneath black water. You leave the crypt powerful, alone, and unwelcome in the village you failed.',
    textEs: 'Cruzas la abertura y tomas la reliquia. Cuando vuelves la mirada, las cadenas y sus cautivos han desaparecido bajo el agua negra. Abandonas la cripta con poder, en soledad y sin ser bienvenido en la aldea a la que fallaste.', choices: [],
  },
};

export function validateStoryGraph(): string[] {
  const errors: string[] = [];
  const choiceIds = new Set<string>();

  for (const node of Object.values(STORY_GRAPH)) {
    if (!node.terminal && node.choices.length === 0) errors.push(`${node.id} has no choices`);
    for (const choice of node.choices) {
      if (!STORY_GRAPH[choice.nextNodeId]) errors.push(`${node.id}.${choice.id} targets missing node ${choice.nextNodeId}`);
      if (choiceIds.has(choice.id)) errors.push(`duplicate choice id ${choice.id}`);
      choiceIds.add(choice.id);
    }
  }

  const reachableNodes = new Set<string>();
  const reachableRoutes = new Set<StoryRoute>();
  const reachableChoices = new Set<string>();
  const archetypes: Archetype[] = ['warrior', 'rogue', 'ranger', 'mage', 'cleric'];
  const origins: Origin[] = ['ashenvale', 'ironcoast', 'shadowfen', 'stormreach', 'deephollow'];
  const heroes = archetypes.flatMap(archetype => origins.map(origin => ({ archetype, origin })));
  const pending: Array<{
    nodeId: string;
    flags: Record<string, boolean>;
    hero: Pick<Character, 'archetype' | 'origin'>;
  }> = heroes.flatMap(hero => [
    { nodeId: STORY_START_NODE, flags: {}, hero },
    ...Object.values(STORY_GRAPH)
      .filter(node => node.externalEntry)
      .map(node => ({
        nodeId: node.id,
        flags: {
          has_sealing_vial: true,
          intends_destroy_door: true,
          shadowfen_dead_voices: hero.origin === 'shadowfen',
        },
        hero,
      })),
  ]);
  const exploredStates = new Set<string>();

  while (pending.length > 0) {
    const state = pending.shift()!;
    const signature = `${state.hero.archetype}:${state.hero.origin}|${state.nodeId}|${Object.keys(state.flags).filter(key => state.flags[key]).sort().join(',')}`;
    if (exploredStates.has(signature)) continue;
    exploredStates.add(signature);

    const node = STORY_GRAPH[state.nodeId];
    if (!node) continue;
    reachableNodes.add(node.id);
    if (node.route) reachableRoutes.add(node.route);

    for (const choice of node.choices) {
      if (!isStoryChoiceAvailable(choice, state.flags, state.hero)) continue;
      reachableChoices.add(choice.id);
      pending.push({
        nodeId: choice.nextNodeId,
        flags: { ...state.flags, ...(choice.setsFlags ?? {}) },
        hero: state.hero,
      });
    }
  }

  for (const nodeId of Object.keys(STORY_GRAPH)) {
    if (!reachableNodes.has(nodeId)) errors.push(`unreachable node ${nodeId}`);
  }
  for (const route of ['direct', 'forest', 'secret_tunnel', 'varen', 'council'] as StoryRoute[]) {
    if (!reachableRoutes.has(route)) errors.push(`unreachable route ${route}`);
  }
  for (const node of Object.values(STORY_GRAPH)) {
    for (const choice of node.choices) {
      if (!reachableChoices.has(choice.id)) errors.push(`unreachable choice ${node.id}.${choice.id}`);
    }
  }

  return errors;
}

const storyGraphErrors = validateStoryGraph();
if (storyGraphErrors.length > 0) {
  throw new Error(`Invalid story graph:\n${storyGraphErrors.join('\n')}`);
}
