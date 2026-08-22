// ============================================================
// CHAPTER I — The Missing of Blackmere
// Los desaparecidos de Blackmere
// Act I opener. Three villagers have disappeared by the Sunken
// Crypt; the council wants the matter kept silent; a hooded
// survivor drinks alone in the tavern; beneath the crypt, the
// Drowned Door has started breathing again. Five local endings
// close the chapter. Self-contained authored data.
// ============================================================

import type { Chapter, StoryNode } from '../../engine/chapter';
import type { Puzzle } from '../../engine/puzzles';
import type { WorldLocation, NPC, Enemy, Quest } from '../../engine/types';

// ---- Puzzles -------------------------------------------------

const CHAPEL_LEDGER: Puzzle = {
  id: 'c01_chapel_ledger',
  kind: 'check',
  title: 'The Chapel Ledger',
  titleEs: 'El registro de la capilla',
  prompt: 'The chapel keeps a burial ledger nobody has closed in forty years. Three entries near the back were written in a different hand, and the margin holds a drawing that is not a prayer. Read it properly and you will know how the abductors come and go.',
  promptEs: 'La capilla guarda un registro de entierros que nadie ha cerrado en cuarenta años. Tres asientos del final están escritos con otra mano, y el margen guarda un dibujo que no es una oración. Léelo como es debido y sabrás por dónde entran y salen los secuestradores.',
  hints: [
    { en: 'The three odd entries share a date that is not a burial date. It is a tide table.', es: 'Los tres asientos extraños comparten una fecha que no es de entierro. Es una tabla de mareas.' },
    { en: 'The margin drawing is the chapel floor seen from below. The line leaving it is water, not a wall.', es: 'El dibujo del margen es el suelo de la capilla visto desde abajo. La línea que sale de él es agua, no un muro.' },
  ],
  skill: 'investigation',
  dc: 14,
  clues: [
    { id: 'c01_clue_altar_watermark', en: 'The altar stone carries a watermark higher than any flood Blackmere remembers.', es: 'La piedra del altar tiene una marca de agua más alta que cualquier inundación que Blackmere recuerde.', dcReduction: 2 },
    { id: 'c01_clue_second_ink', en: 'The reward notice was written in two inks; the same second ink stains the ledger.', es: 'El aviso de recompensa se escribió con dos tintas; la segunda mancha también el registro.', dcReduction: 2 },
  ],
  unlocks: { flags: { c01_tunnel_map: true, c01_chapel_ledger_decoded: true } },
  solvedNodeId: 'c01_chapel_decoded',
  skipNodeId: 'c01_chapel_skipped',
};

const DROWNED_DOOR_RUNES: Puzzle = {
  id: 'c01_drowned_door_runes',
  kind: 'mechanism',
  title: 'The Runes of the Drowned Door',
  titleEs: 'Las runas de la Puerta Ahogada',
  prompt: 'Three runes ring the Drowned Door, and the black water answers each one with a different sound. The Ashen Court did not lock this door. They taught it an order, and the order is a sentence.',
  promptEs: 'Tres runas rodean la Puerta Ahogada, y el agua negra responde a cada una con un sonido distinto. La Corte Ceniza no cerró esta puerta con llave: le enseñó un orden, y ese orden es una frase.',
  hints: [
    { en: 'A sentence needs a subject before a verb. Begin with the rune that names something, not the ones that do something.', es: 'Una frase necesita un sujeto antes de un verbo. Empieza por la runa que nombra algo, no por las que hacen algo.' },
    { en: 'Salt was scattered before the mourners spoke, and the mourners spoke before the bone was laid down.', es: 'La sal se esparció antes de que hablaran los deudos, y los deudos hablaron antes de que se depositara el hueso.' },
  ],
  steps: ['c01_rune_moon', 'c01_rune_salt', 'c01_rune_bone'],
  ordered: true,
  stepLabels: [
    { id: 'c01_rune_moon', label: 'Press the drowned moon', labelEs: 'Pulsar la luna ahogada' },
    { id: 'c01_rune_salt', label: 'Press the scattered salt', labelEs: 'Pulsar la sal esparcida' },
    { id: 'c01_rune_bone', label: 'Press the laid bone', labelEs: 'Pulsar el hueso depositado' },
  ],
  onWrongStep: { en: 'The water swallows the sound and gives it back wrong. The sequence unwinds; you may begin again.', es: 'El agua se traga el sonido y lo devuelve mal. La secuencia se deshace; puedes empezar de nuevo.' },
  unlocks: { flags: { c01_drowned_runes_read: true } },
  solvedNodeId: 'c01_runes_read',
  skipNodeId: 'c01_runes_skipped',
};

// ---- Nodes ---------------------------------------------------

const NODES: Record<string, StoryNode> = {
  c01_arrival: {
    id: 'c01_arrival', kind: 'beat', locationId: 'c01_black_lantern',
    title: 'The Black Lantern', titleEs: 'El Farol Negro',
    text: 'The notice has brought you to the right place. Martik watches from behind the bar, the hooded stranger watches Martik, and the village beyond the door has gone quiet before nightfall.',
    textEs: 'El aviso te ha llevado al lugar correcto. Martik observa desde la barra, el desconocido encapuchado observa a Martik y la aldea al otro lado de la puerta ha quedado en silencio antes del anochecer.',
    choices: [
      { id: 'c01_show_martik', label: 'Show the notice to Martik', labelEs: 'Mostrar el aviso a Martik', nextNodeId: 'c01_martik_briefing', adjustsValues: { bond_martik: 1 }, result: 'Martik sees the notice in your hand and sets his mug aside.', resultEs: 'Martik ve el aviso en tu mano y deja la jarra a un lado.' },
      { id: 'c01_inspect_notice', label: 'Study the altered notice first', labelEs: 'Estudiar el aviso alterado primero', nextNodeId: 'c01_notice_clue', setsFlags: { c01_noticed_second_ink: true }, adjustsValues: { conviction_truth: 1 }, result: 'You study the notice: two inks, and three crossed-out initials on the back.', resultEs: 'Estudias el aviso: dos tintas, y tres iniciales tachadas en el reverso.' },
    ],
  },

  c01_notice_clue: {
    id: 'c01_notice_clue', kind: 'beat',
    title: 'Two Inks', titleEs: 'Dos tintas',
    text: 'The council notice promises gold but never mentions the crypt. Martik added that clue later. On the back, three initials — T, G, and L — have been crossed out by a fourth hand.',
    textEs: 'El aviso del consejo promete oro, pero nunca menciona la cripta. Martik añadió esa pista después. En el reverso, tres iniciales —T, G y L— están tachadas por una cuarta mano.',
    choices: [
      { id: 'c01_compare_martik', label: 'Ask Martik about both inks', labelEs: 'Preguntar a Martik por las dos tintas', nextNodeId: 'c01_martik_briefing', setsFlags: { c01_confronted_martik: true }, adjustsValues: { bond_martik: 1, conviction_truth: 1 }, result: 'Martik admits the council struck out their names after they vanished.', resultEs: 'Martik admite que el consejo borró sus nombres después de que desaparecieran.' },
      { id: 'c01_show_stranger_notice', label: 'Show the crossed initials to the stranger', labelEs: 'Mostrar las iniciales al desconocido', nextNodeId: 'c01_stranger_identity', adjustsValues: { bond_varen: 1 }, result: 'The stranger recognizes the crossed initials and leans forward.', resultEs: 'El desconocido reconoce las iniciales tachadas y se inclina hacia delante.' },
    ],
  },

  c01_martik_briefing: {
    id: 'c01_martik_briefing', kind: 'beat', locationId: 'c01_black_lantern',
    title: 'Three Names', titleEs: 'Tres nombres',
    text: 'Martik names the missing: Tomas, a young farmer; Greta, keeper of the chapel records; and Lyra, sister of the healer Elara. All three asked about lights moving in the northern hills before they vanished. He spreads a rough map on the bar. Their disappearances were not random — but whose account you trust will shape the hunt.',
    textEs: 'Martik nombra a los desaparecidos: Tomas, un joven granjero; Greta, guardiana de los archivos de la capilla; y Lyra, hermana de la curandera Elara. Los tres preguntaron por unas luces que se movían en las colinas del norte antes de desaparecer. Extiende un mapa rudimentario sobre la barra. Sus desapariciones no fueron casuales — pero de quién fíes dará forma a la búsqueda.',
    choices: [
      { id: 'c01_lean_council', label: 'Trust the council — demand their sealed record', labelEs: 'Confiar en el consejo — exigir su registro sellado', nextNodeId: 'c01_council_chamber', setsFlags: { c01_lean_council: true }, adjustsValues: { faction_blackmere_council: 1, conviction_duty: 1 }, result: 'You choose the council\'s account. Martik warns you they will want silence in return.', resultEs: 'Elijes la versión del consejo. Martik te advierte que querrán silencio a cambio.' },
      { id: 'c01_lean_chapel', label: 'Trust the chapel — seek Elara and the old records', labelEs: 'Confiar en la capilla — buscar a Elara y los viejos registros', nextNodeId: 'c01_chapel_plea', setsFlags: { c01_lean_chapel: true, 'canon:c01_rescue_oath': true }, adjustsValues: { bond_elara: 1, conviction_compassion: 1 }, result: 'You choose the chapel\'s account. Elara is waiting; her sister is among the missing.', resultEs: 'Elijes la versión de la capilla. Elara espera; su hermana está entre los desaparecidos.' },
      { id: 'c01_lean_stranger', label: 'Trust the stranger — hear what the hooded survivor knows', labelEs: 'Confiar en el desconocido — oír lo que sabe el superviviente', nextNodeId: 'c01_stranger_identity', setsFlags: { c01_lean_stranger: true }, adjustsValues: { bond_varen: 1 }, result: 'You choose the stranger\'s account. The hooded figure watches you approach.', resultEs: 'Elijes la versión del desconocido. La figura encapuchada te ve acercarte.' },
    ],
  },

  // ---- Council branch ----
  c01_council_chamber: {
    id: 'c01_council_chamber', kind: 'beat', locationId: 'c01_village',
    title: 'The Council\'s Bargain', titleEs: 'El trato del consejo',
    text: 'The council speaker confesses that fear caused the cover-up: if trade caravans learn what is happening, Blackmere will starve. They offer supplies and guards in exchange for your silence — and the sealed journal of the last crypt expedition.',
    textEs: 'El portavoz del consejo confiesa que el miedo causó el encubrimiento: si las caravanas comerciales descubren lo que ocurre, Blackmere morirá de hambre. Ofrecen provisiones y guardias a cambio de tu silencio — y el diario sellado de la última expedición a la cripta.',
    choices: [
      { id: 'c01_accept_council', label: 'Accept help and keep their secret — for now', labelEs: 'Aceptar la ayuda y guardar el secreto por ahora', nextNodeId: 'c01_council_bargain', setsFlags: { c01_council_support: true, c01_kept_council_secret: true }, adjustsValues: { faction_blackmere_council: 2, conviction_duty: 1 }, result: 'You accept. The council signs for supplies and armed support.', resultEs: 'Aceptas. El consejo firma un adelanto, provisiones y apoyo armado.' },
      { id: 'c01_expose_council', label: 'Refuse and tell the village the truth', labelEs: 'Negarse y contar la verdad a la aldea', nextNodeId: 'c01_council_bargain', setsFlags: { c01_council_hostile: true, c01_exposed_council: true }, adjustsValues: { faction_blackmere_council: -2, conviction_compassion: 1 }, result: 'You refuse. The council withdraws its support, but the village knows.', resultEs: 'Te niegas. El consejo retira su apoyo, pero la aldea lo sabe.' },
    ],
  },

  c01_council_bargain: {
    id: 'c01_council_bargain', kind: 'beat',
    title: 'The Sealed Record', titleEs: 'El registro sellado',
    text: 'Martik admits the council keeps the journal of the last crypt expedition locked in its archive. The expedition returned with one survivor, but his name was removed from every public record. The journal reveals a flooded service tunnel beneath the chapel — a passage that bypasses the crypt gate.',
    textEs: 'Martik admite que el consejo guarda bajo llave el diario de la última expedición a la cripta. La expedición regresó con un superviviente, pero su nombre fue eliminado de todos los registros públicos. El diario revela un túnel de servicio inundado bajo la capilla — un pasadizo que evita la entrada de la cripta.',
    choices: [
      { id: 'c01_take_archive', label: 'Take the journal and the tunnel map', labelEs: 'Tomar el diario y el mapa del túnel', nextNodeId: 'c01_archive', setsFlags: { c01_tunnel_map: true, 'canon:c01_oath_bank': true }, adjustsValues: { conviction_truth: 1 }, result: 'You copy the journal and the tunnel map. The falsified-oath ledger is discoverable now.', resultEs: 'Copias el diario y el mapa del túnel. El registro de juramentos falsificados queda al descubierto.' },
      { id: 'c01_council_to_plan', label: 'Head straight to the crypt road', labelEs: 'Ir directo al camino de la cripta', nextNodeId: 'c01_plan_departure', result: 'You leave the archive for another time and head to the road.', resultEs: 'Dejas el archivo para otra ocasión y te diriges al camino.' },
    ],
  },

  c01_archive: {
    id: 'c01_archive', kind: 'beat',
    title: 'The Drowned Passage', titleEs: 'El pasadizo ahogado',
    text: 'The expedition journal reveals a flooded service tunnel beneath the chapel. It bypasses the crypt gate and reaches the prisoners\' level, but the map warns that the water carries memories that are not your own. The ledger also shows that the abductions were falsified — three names were written as a payment to the door.',
    textEs: 'El diario de la expedición revela un túnel de servicio inundado bajo la capilla. Evita la entrada de la cripta y llega al nivel de los prisioneros, pero el mapa advierte que el agua transporta recuerdos que no son tuyos. El registro también muestra que los secuestros fueron falsificados — tres nombres se escribieron como pago a la puerta.',
    choices: [
      { id: 'c01_keep_tunnel_map', label: 'Keep the tunnel map', labelEs: 'Guardar el mapa del túnel', nextNodeId: 'c01_plan_departure', setsFlags: { c01_tunnel_map: true, 'canon:c01_oath_bank': true }, adjustsValues: { conviction_freedom: 1 }, result: 'You keep the map close. The tunnel is a route the Warden cannot watch.', resultEs: 'Guardas el mapa. El túnel es una ruta que el Guardián no puede vigilar.' },
      { id: 'c01_share_with_martik', label: 'Share the map with Martik', labelEs: 'Compartir el mapa con Martik', nextNodeId: 'c01_plan_departure', setsFlags: { c01_tunnel_map: true, 'canon:c01_oath_bank': true }, adjustsValues: { bond_martik: 2, conviction_compassion: 1 }, result: 'You share the map with Martik. He will remember that.', resultEs: 'Compartes el mapa con Martik. Él lo recordará.' },
    ],
  },

  // ---- Chapel branch ----
  c01_chapel_plea: {
    id: 'c01_chapel_plea', kind: 'beat', locationId: 'c01_chapel',
    title: 'Lyra\'s Dream', titleEs: 'El sueño de Lyra',
    text: 'Elara, Lyra\'s sister, shows you a drawing left behind: a stone door below black water and three figures bound before it. Greta called the same symbol "the Drowned Eye." Sera tends candles before the cracked altar. You swore to rescue them before treasure — the oath is made.',
    textEs: 'Elara, la hermana de Lyra, te muestra un dibujo que dejó atrás: una puerta de piedra bajo aguas negras y tres figuras atadas ante ella. Greta llamaba al mismo símbolo «el Ojo Ahogado». Sera cuida velas ante el altar agrietado. Has jurado rescatarlos antes que al tesoro — el juramento está hecho.',
    choices: [
      { id: 'c01_ask_for_ledger', label: 'Ask Sera for the chapel\'s burial ledger', labelEs: 'Pedir a Sera el registro de entierros de la capilla', nextNodeId: 'c01_puzzle_ledger', setsFlags: { c01_asked_for_ledger: true }, adjustsValues: { conviction_truth: 1 }, result: 'Sera lets you take the ledger to the window. She does not offer to help.', resultEs: 'Sera te deja llevar el registro a la ventana. No se ofrece a ayudar.' },
      { id: 'c01_elara_blessing', label: 'Ask Elara for her blessing', labelEs: 'Pedir a Elara su bendición', nextNodeId: 'c01_plan_departure', setsFlags: { c01_elara_blessing: true, 'canon:c01_rescue_oath': true }, adjustsValues: { bond_elara: 2, conviction_compassion: 2 }, result: 'Elara places her hands on your shoulders. A faint warmth spreads. Her faith will shield you.', resultEs: 'Elara pone sus manos sobre tus hombros. Un calor tenue se extiende. Su fe te protegerá.' },
    ],
  },

  c01_puzzle_ledger: {
    id: 'c01_puzzle_ledger', kind: 'puzzle', puzzleId: 'c01_chapel_ledger',
    title: 'The Ledger Nobody Closed', titleEs: 'El registro que nadie cerró',
    text: 'Sera lets you take the ledger to the window, where what is left of the light falls on it. Whatever the last three entries say, she would rather you were the one to say it out loud.',
    textEs: 'Sera te deja llevar el registro a la ventana, donde cae lo que queda de luz. Diga lo que digan los tres últimos asientos, prefiere que seas tú quien lo diga en voz alta.',
    choices: [],
  },

  c01_chapel_decoded: {
    id: 'c01_chapel_decoded', kind: 'beat',
    title: 'The Ledger Speaks', titleEs: 'El registro habla',
    text: 'The three odd entries share a date that is not a burial date — it is a tide table. The margin drawing is the chapel floor seen from below; the line leaving it is water. A rusted key is pressed flat between the last two pages. The ledger shows the tunnel beneath the chapel, and the names of three people written as a payment.',
    textEs: 'Los tres asientos extraños comparten una fecha que no es de entierro — es una tabla de mareas. El dibujo del margen es el suelo de la capilla visto desde abajo; la línea que sale de él es agua. Una llave oxidada está prensada entre las dos últimas páginas. El registro muestra el túnel bajo la capilla, y los nombres de tres personas escritos como pago.',
    choices: [
      { id: 'c01_decoded_to_tunnel', label: 'Follow the tunnel map from the ledger', labelEs: 'Seguir el mapa del túnel del registro', nextNodeId: 'c01_tunnel_map', setsFlags: { c01_tunnel_map: true, 'canon:c01_oath_bank': true, c01_chapel_ledger_decoded: true }, result: 'You take the key and the map. The tunnel beneath the chapel is open to you.', resultEs: 'Tomas la llave y el mapa. El túnel bajo la capilla está abierto para ti.' },
      { id: 'c01_decoded_to_archive', label: 'Bring the ledger to the archive', labelEs: 'Llevar el registro al archivo', nextNodeId: 'c01_archive', setsFlags: { 'canon:c01_oath_bank': true, c01_chapel_ledger_decoded: true }, result: 'You bring the decoded ledger to the expedition archive. The falsified oaths are now plain.', resultEs: 'Llevas el registro descifrado al archivo de la expedición. Los juramentos falsificados quedan al descubierto.' },
    ],
  },

  c01_chapel_skipped: {
    id: 'c01_chapel_skipped', kind: 'beat',
    title: 'The Ledger Left Shut', titleEs: 'El registro dejado cerrado',
    text: 'You leave the ledger unread. Sera says nothing. The tunnel beneath the chapel stays hidden, and you will have to find another way to the prisoners.',
    textEs: 'Dejas el registro sin leer. Sera no dice nada. El túnel bajo la capilla sigue oculto, y tendrás que buscar otro camino hacia los prisioneros.',
    choices: [
      { id: 'c01_skipped_to_plan', label: 'Head to the road', labelEs: 'Ir al camino', nextNodeId: 'c01_plan_departure', result: 'You leave the chapel and choose your road.', resultEs: 'Dejas la capilla y eliges tu camino.' },
    ],
  },

  c01_tunnel_map: {
    id: 'c01_tunnel_map', kind: 'beat',
    title: 'The Drowned Passage', titleEs: 'El pasadizo ahogado',
    text: 'The map warns that the water carries memories that are not your own. But it also shows a way to the prisoners\' level that the Warden cannot watch. You may follow it, or choose another road.',
    textEs: 'El mapa advierte que el agua transporta recuerdos que no son tuyos. Pero también muestra un camino al nivel de los prisioneros que el Guardián no puede vigilar. Puedes seguirlo, o elegir otro camino.',
    choices: [
      { id: 'c01_tunnel_to_plan', label: 'Take the map to the road', labelEs: 'Llevar el mapa al camino', nextNodeId: 'c01_plan_departure', setsFlags: { c01_tunnel_map: true }, result: 'You fold the map and head to the crossroads.', resultEs: 'Doblas el mapa y te diriges al cruce.' },
    ],
  },

  // ---- Stranger branch ----
  c01_stranger_identity: {
    id: 'c01_stranger_identity', kind: 'beat', locationId: 'c01_black_lantern',
    title: 'Captain Varen', titleEs: 'Capitán Varen',
    text: 'The stranger lowers his hood. Captain Varen led the previous expedition. He sealed his companions inside when the Warden woke, and has lived with that choice ever since. He says the Warden is a jailer, not a guardian. Killing it carelessly will open the submerged door. A silver sealing vial can close it — but only if used before taking anything from the chamber.',
    textEs: 'El desconocido se baja la capucha. Es el capitán Varen, quien dirigió la expedición anterior. Selló dentro a sus compañeros cuando el Guardián despertó y desde entonces vive con aquella decisión. Dice que el Guardián es un carcelero, no un protector. Matarlo sin cuidado abrirá la puerta sumergida. Un vial plateado de sellado puede cerrarla, pero solo si se usa antes de tomar nada de la cámara.',
    choices: [
      { id: 'c01_forgive_varen', label: 'Offer Varen a chance to put it right', labelEs: 'Dar a Varen la oportunidad de repararlo', nextNodeId: 'c01_varen_vow', setsFlags: { c01_varen_guide: true, c01_forgave_varen: true }, adjustsValues: { bond_varen: 3, conviction_compassion: 1 }, result: 'Varen stands. He will guide you along the route of his failed expedition.', resultEs: 'Varen se levanta. Te guiará por la ruta de su expedición fallida.' },
      { id: 'c01_expose_varen', label: 'Expose Varen to the village', labelEs: 'Entregar a Varen ante la aldea', nextNodeId: 'c01_varen_vow', setsFlags: { c01_exposed_varen: true }, adjustsValues: { bond_varen: -2, faction_blackmere_council: 1 }, result: 'You expose him. Varen recoils; the door\'s fights will be fortified against you.', resultEs: 'Lo delatas. Varen retrocede; las defensas de la puerta se fortalecerán contra ti.' },
    ],
  },

  c01_varen_vow: {
    id: 'c01_varen_vow', kind: 'beat',
    title: 'The Vow at the Bar', titleEs: 'El juramento en la barra',
    text: 'Varen slides a silver vial across the bar. "Pour this on the Warden\'s remains before you touch the chains. It is the only way to close the door again." He also tells you where Greta\'s stolen voice was taken — the Warden feeds on it still. If you can hear it, you can answer the door with its own name.',
    textEs: 'Varen desliza un vial plateado por la barra. «Vierte esto sobre los restos del Guardián antes de tocar las cadenas. Es la única manera de cerrar la puerta de nuevo». También te dice dónde se llevaron la voz robada de Greta — el Guardián se alimenta de ella aún. Si puedes oírla, puedes responder a la puerta con su propio nombre.',
    choices: [
      { id: 'c01_take_vial', label: 'Accept the sealing vial', labelEs: 'Aceptar el vial de sellado', nextNodeId: 'c01_vial', setsFlags: { c01_has_vial: true }, adjustsValues: { bond_varen: 1, conviction_compassion: 1 }, result: 'You take the vial. It is heavier than it looks.', resultEs: 'Tomas el vial. Pesa más de lo que parece.' },
      { id: 'c01_seek_destroy', label: 'Reject the vial — plan to destroy the door', labelEs: 'Rechazar el vial — planea destruir la puerta', nextNodeId: 'c01_vial', setsFlags: { c01_intends_destroy: true }, adjustsValues: { conviction_freedom: 2 }, result: 'You refuse the vial. If the door must die, you will bring the chamber down on it.', resultEs: 'Rechazas el vial. Si la puerta debe morir, derrumbarás la cámara sobre ella.' },
      { id: 'c01_hear_greta', label: 'Listen for Greta\'s stolen voice', labelEs: 'Escuchar la voz robada de Greta', nextNodeId: 'c01_vial', setsFlags: { 'canon:c01_greta_voice': true }, adjustsValues: { conviction_truth: 2, bond_elara: 1 }, result: 'You listen. Greta\'s stolen voice whispers through the chapel stones: "Below us. Follow the water that remembers."', resultEs: 'Escuchas. La voz robada de Greta susurra entre las piedras: «Debajo. Sigue el agua que recuerda».' },
    ],
  },

  c01_vial: {
    id: 'c01_vial', kind: 'beat',
    title: 'The Sealing Vial', titleEs: 'El vial de sellado',
    text: 'You have what Varen offered — the vial, the intent to destroy, or Greta\'s stolen voice. Each is a different way to answer the door. Varen tells you the route his failed expedition took, if you will have him as a guide.',
    textEs: 'Tienes lo que Varen ofreció — el vial, la intención de destruir, o la voz robada de Greta. Cada una es una forma distinta de responder a la puerta. Varen te indica la ruta de su expedición fallida, si lo aceptas como guía.',
    choices: [
      { id: 'c01_vial_to_plan', label: 'Head to the road', labelEs: 'Ir al camino', nextNodeId: 'c01_plan_departure', result: 'You leave the Black Lantern and choose your road.', resultEs: 'Dejas el Farol Negro y eliges tu camino.' },
    ],
  },

  // ---- Merge: plan departure ----
  c01_plan_departure: {
    id: 'c01_plan_departure', kind: 'beat', locationId: 'c01_village',
    title: 'Choose the Road', titleEs: 'Elegir el camino',
    text: 'By midnight you know enough to act. Every route can reach the Sunken Crypt, but each determines who stands beside you, what dangers you meet first, and which promises can still be kept.',
    textEs: 'A medianoche sabes lo suficiente para actuar. Todas las rutas pueden llevarte a la Cripta Sumergida, pero cada una determina quién estará a tu lado, qué peligros encontrarás primero y qué promesas podrás cumplir.',
    choices: [
      { id: 'c01_take_direct', label: 'Take the direct road before dawn', labelEs: 'Tomar el camino directo antes del amanecer', nextNodeId: 'c01_route_direct', setsFlags: { c01_chose_direct: true }, result: 'You leave before dawn on the shortest road.', resultEs: 'Partes antes del amanecer por el camino más corto.' },
      { id: 'c01_take_forest', label: 'Use the old forest paths', labelEs: 'Usar los antiguos senderos del bosque', nextNodeId: 'c01_route_forest', setsFlags: { c01_chose_forest: true }, result: 'You choose the forest path, trading speed for secrecy.', resultEs: 'Eliges el sendero del bosque, cambiando velocidad por sigilo.' },
      { id: 'c01_take_tunnel', label: 'Enter through the flooded tunnel', labelEs: 'Entrar por el túnel inundado', nextNodeId: 'c01_route_secret_tunnel', requires: [{ flag: 'c01_tunnel_map' }], setsFlags: { c01_chose_tunnel: true }, result: 'With the map, you descend beneath the chapel.', resultEs: 'Con el mapa, desciendes bajo la capilla.' },
      { id: 'c01_take_varen', label: 'Return with Varen as your guide', labelEs: 'Regresar con Varen como guía', nextNodeId: 'c01_route_varen', requires: [{ flag: 'c01_varen_guide' }], setsFlags: { c01_chose_varen: true }, result: 'Varen leads you along the route of his failed expedition.', resultEs: 'Varen te guía por la ruta de su expedición fallida.' },
      { id: 'c01_take_council', label: 'Lead the council escort', labelEs: 'Liderar la escolta del consejo', nextNodeId: 'c01_route_council', requires: [{ flag: 'c01_council_support' }], setsFlags: { c01_chose_council: true }, result: 'You march with supplies and armed guards.', resultEs: 'Marchas con provisiones y guardias armados.' },
    ],
  },

  // ---- Route terminals ----
  c01_route_direct: { id: 'c01_route_direct', kind: 'route', route: 'direct', terminal: true, choices: [], title: 'The Open Road', titleEs: 'El camino abierto', text: 'You leave before dawn on the shortest road. You will reach the crypt quickly, but without allies or hidden knowledge. Whatever waits at the gate will see you coming.', textEs: 'Partes antes del amanecer por el camino más corto. Llegarás pronto a la cripta, pero sin aliados ni conocimientos ocultos. Lo que espere en la entrada te verá llegar.' },
  c01_route_forest: { id: 'c01_route_forest', kind: 'route', route: 'forest', terminal: true, choices: [], title: 'Under the Old Pines', titleEs: 'Bajo los pinos antiguos', text: 'You choose the forest path, trading speed for secrecy. The tracks of the missing may reveal what happened before you ever reach the crypt.', textEs: 'Eliges el sendero del bosque, cambiando velocidad por sigilo. Las huellas de los desaparecidos pueden revelar lo ocurrido antes de que llegues a la cripta.' },
  c01_route_secret_tunnel: { id: 'c01_route_secret_tunnel', kind: 'route', route: 'secret_tunnel', terminal: true, choices: [], title: 'Black Water', titleEs: 'Aguas negras', text: 'With the stolen map, you descend beneath the chapel. This path reaches the prisoners first — but every memory in the flooded tunnel will demand a price.', textEs: 'Con el mapa, desciendes bajo la capilla. Esta ruta llega primero a los prisioneros, pero cada recuerdo del túnel inundado exigirá un precio.' },
  c01_route_varen: { id: 'c01_route_varen', kind: 'route', route: 'varen', terminal: true, choices: [], title: 'A Debt Returned', titleEs: 'Una deuda que regresa', text: 'Varen leads you along the route of his failed expedition. He knows the Warden\'s traps, but the crypt remembers him — and may use his guilt against both of you.', textEs: 'Varen te guía por la ruta de su expedición fallida. Conoce las trampas del Guardián, pero la cripta lo recuerda y puede usar su culpa contra ambos.' },
  c01_route_council: { id: 'c01_route_council', kind: 'route', route: 'council', terminal: true, choices: [], title: 'Banners in the Mist', titleEs: 'Estandartes en la niebla', text: 'You march with supplies and armed guards. The escort makes combat easier, but the council expects control over anything recovered from the crypt.', textEs: 'Marchas con provisiones y guardias armados. La escolta facilitará el combate, pero el consejo espera controlar todo lo que se recupere de la cripta.' },

  // ---- Aftermath (external entry after boss fight) ----
  c01_warden_aftermath: {
    id: 'c01_warden_aftermath', kind: 'beat', locationId: 'c01_guardian_room', externalEntry: true,
    title: 'The Door Opens', titleEs: 'La puerta se abre',
    text: 'The Warden collapses. Behind its throne, Tomas, Greta, and Lyra hang alive in loosened chains. Beneath them, the submerged door begins to open. There is time for one deliberate choice before the chamber floods with black light.',
    textEs: 'El Guardián se derrumba. Tras su trono, Tomas, Greta y Lyra cuelgan vivos de unas cadenas que empiezan a aflojarse. Bajo ellos, la puerta sumergida comienza a abrirse. Solo hay tiempo para una decisión consciente antes de que la cámara se inunde de luz negra.',
    choices: [
      { id: 'c01_rescue_and_flee', label: 'Free the villagers and flee', labelEs: 'Liberar a los aldeanos y huir', nextNodeId: 'c01_ending_rescue', setsFlags: { 'canon:c01_door_open': true, 'canon:c01_trio_rescued': true }, adjustsValues: { conviction_compassion: 3 }, result: 'You cut the three prisoners free and escape as black water fills the chamber. The door stays open behind you.', resultEs: 'Liberas a los tres prisioneros y escapas mientras el agua negra llena la cámara. La puerta queda abierta detrás de ti.' },
      { id: 'c01_seal_and_rescue', label: 'Use the vial, then free the villagers', labelEs: 'Usar el vial y liberar a los aldeanos', nextNodeId: 'c01_ending_sealed', requires: [{ flag: 'c01_has_vial' }], setsFlags: { 'canon:c01_door_sealed': true, 'canon:c01_trio_rescued': true }, adjustsValues: { conviction_duty: 2, bond_varen: 2 }, result: 'The silver vial turns the black water clear. You free the three before the stone seals forever.', resultEs: 'El vial plateado vuelve transparente el agua negra. Liberas a los tres antes de que la piedra se selle para siempre.' },
      { id: 'c01_destroy_and_rescue', label: 'Bring down the chamber around the door', labelEs: 'Derrumbar la cámara sobre la puerta', nextNodeId: 'c01_ending_destroyed', requires: [{ flag: 'c01_intends_destroy' }], setsFlags: { 'canon:c01_door_destroyed': true, 'canon:c01_trio_rescued': true }, adjustsValues: { conviction_freedom: 3 }, result: 'You break the ancient supports and drag the prisoners clear. The chamber collapses over the Drowned Door.', resultEs: 'Rompes los soportes antiguos y sacas a los prisioneros. La cámara se derrumba sobre la Puerta Ahogada.' },
      { id: 'c01_study_door_runes', label: 'Read the three runes before touching the chains', labelEs: 'Leer las tres runas antes de tocar las cadenas', nextNodeId: 'c01_puzzle_runes', setsFlags: { c01_studied_runes: true }, adjustsValues: { conviction_truth: 1 }, result: 'You turn to the runes before the captives. The door is awake and waiting to be answered.', resultEs: 'Te vuelves hacia las runas antes que a los cautivos. La puerta está despierta y espera respuesta.' },
      { id: 'c01_claim_relic', label: 'Take the relic beyond the door', labelEs: 'Tomar la reliquia tras la puerta', nextNodeId: 'c01_ending_relic', setsFlags: { 'canon:c01_door_relic': true, 'canon:c01_trio_lost': true, 'canon:c01_relic_claimed': true }, adjustsValues: { conviction_freedom: 3, conviction_compassion: -3 }, result: 'You reach through the opening and take the relic. By the time you turn back, the chains have vanished beneath black water.', resultEs: 'Cruzas la abertura y tomas la reliquia. Cuando vuelves la mirada, las cadenas han desaparecido bajo el agua negra.' },
    ],
  },

  // ---- Runes puzzle ----
  c01_puzzle_runes: {
    id: 'c01_puzzle_runes', kind: 'puzzle', puzzleId: 'c01_drowned_door_runes',
    title: 'Three Runes, One Sentence', titleEs: 'Tres runas, una frase',
    text: 'The Warden is down. The prisoners are still chained, the water is still rising, and the door is still awake. You have exactly as long as it takes the water to reach the third step.',
    textEs: 'El Guardián ha caído. Los prisioneros siguen encadenados, el agua sigue subiendo y la puerta sigue despierta. Tienes exactamente el tiempo que tarde el agua en llegar al tercer escalón.',
    choices: [],
  },

  c01_runes_read: {
    id: 'c01_runes_read', kind: 'beat',
    title: 'What the Door Was Asking For', titleEs: 'Lo que la puerta pedía',
    text: 'The third rune goes quiet and the black water goes quiet with it. The Drowned Door was never a lock. It was a mouth waiting to be answered, and now you know the answer — a name it lost, and the sentence that gives it back.',
    textEs: 'La tercera runa calla y el agua negra calla con ella. La Puerta Ahogada nunca fue un cerrojo. Era una boca esperando respuesta, y ahora conoces la respuesta: un nombre que perdió y la frase que lo devuelve.',
    choices: [
      { id: 'c01_speak_name', label: 'Speak the sentence and give the door back its name', labelEs: 'Pronunciar la frase y devolver a la puerta su nombre', nextNodeId: 'c01_ending_remembered', setsFlags: { 'canon:c01_door_remembered': true, 'canon:c01_trio_rescued': true, 'canon:c01_door_named': true }, adjustsValues: { conviction_truth: 3, conviction_compassion: 1 }, result: 'You say it once, plainly, the way a name should be said. The water lowers and the chains open without being struck.', resultEs: 'Lo pronuncias una vez, con sencillez, como debe decirse un nombre. El agua se retira y las cadenas se abren sin recibir un golpe.' },
      { id: 'c01_runes_then_seal', label: 'Use the silver vial now that the door is listening', labelEs: 'Usar el vial plateado ahora que la puerta escucha', nextNodeId: 'c01_ending_sealed', requires: [{ flag: 'c01_has_vial' }], setsFlags: { 'canon:c01_door_sealed': true, 'canon:c01_trio_rescued': true }, adjustsValues: { conviction_duty: 2, bond_varen: 2 }, result: 'A door that is listening is a door that can be told no. The vial does the rest.', resultEs: 'Una puerta que escucha es una puerta a la que se le puede decir no. El vial hace el resto.' },
      { id: 'c01_runes_then_flee', label: 'Take the villagers out while the water is still low', labelEs: 'Sacar a los aldeanos mientras el agua sigue baja', nextNodeId: 'c01_ending_rescue', setsFlags: { 'canon:c01_door_open': true, 'canon:c01_trio_rescued': true }, adjustsValues: { conviction_compassion: 3 }, result: 'You choose the three people you came for over the thing you finally understood. It is not the wrong choice — only the one that leaves the door open.', resultEs: 'Eliges a las tres personas por las que viniste antes que a lo que por fin comprendiste. No es la elección equivocada — solo la que deja la puerta abierta.' },
    ],
  },

  c01_runes_skipped: {
    id: 'c01_runes_skipped', kind: 'beat',
    title: 'The Runes Left Unread', titleEs: 'Las runas sin leer',
    text: 'You leave the runes. The water keeps rising, and the door keeps breathing. You still have time to act before the chamber floods.',
    textEs: 'Dejas las runas. El agua sigue subiendo y la puerta sigue respirando. Todavía tienes tiempo de actuar antes de que la cámara se inunde.',
    choices: [
      { id: 'c01_runes_skip_back', label: 'Turn back to the chamber', labelEs: 'Volver a la cámara', nextNodeId: 'c01_warden_aftermath', result: 'You turn back to the captives and the door.', resultEs: 'Vuelves a los cautivos y a la puerta.' },
    ],
  },

  // ---- Endings ----
  c01_ending_rescue: {
    id: 'c01_ending_rescue', kind: 'ending', terminal: true, choices: [],
    outcome: 'success', survivors: ['c01_tomas', 'c01_greta', 'c01_lyra'], casualties: [],
    title: 'The Cost of Mercy', titleEs: 'El precio de la misericordia',
    text: 'You cut the three prisoners free and escape as black water fills the chamber. Blackmere welcomes its missing home, but far below, the open door continues to breathe. Your rescue is a victory — and a promise of what comes next.',
    textEs: 'Liberas a los tres prisioneros y escapas mientras el agua negra llena la cámara. Blackmere recibe a sus desaparecidos, pero muy abajo la puerta abierta sigue respirando. Tu rescate es una victoria y una promesa de lo que vendrá.',
  },
  c01_ending_sealed: {
    id: 'c01_ending_sealed', kind: 'ending', terminal: true, choices: [],
    outcome: 'success', survivors: ['c01_tomas', 'c01_greta', 'c01_lyra'], casualties: ['c01_warden'],
    title: 'A Door Made Silent', titleEs: 'Una puerta silenciada',
    text: 'The silver vial turns the black water clear. You free Tomas, Greta, and Lyra before the stone seals forever. Varen\'s debt is paid, and Blackmere gains something rarer than treasure: a future.',
    textEs: 'El vial plateado vuelve transparente el agua negra. Liberas a Tomas, Greta y Lyra antes de que la piedra se selle para siempre. La deuda de Varen queda saldada y Blackmere obtiene algo más raro que un tesoro: un futuro.',
  },
  c01_ending_destroyed: {
    id: 'c01_ending_destroyed', kind: 'ending', terminal: true, choices: [],
    outcome: 'ambiguous', survivors: ['c01_tomas', 'c01_greta', 'c01_lyra'], casualties: ['c01_warden'],
    title: 'Stone Upon Stone', titleEs: 'Piedra sobre piedra',
    text: 'You break the ancient supports and drag the prisoners clear. The chamber collapses over the Drowned Door. No seal lasts forever, but this one will outlive everyone who knows where to dig.',
    textEs: 'Rompes los soportes antiguos y sacas a los prisioneros. La cámara se derrumba sobre la Puerta Ahogada. Ningún sello dura para siempre, pero este sobrevivirá a todos los que saben dónde excavar.',
  },
  c01_ending_remembered: {
    id: 'c01_ending_remembered', kind: 'ending', terminal: true, choices: [],
    outcome: 'success', survivors: ['c01_tomas', 'c01_greta', 'c01_lyra'], casualties: ['c01_warden'],
    title: 'The Name the Water Kept', titleEs: 'El nombre que guardó el agua',
    text: 'Greta speaks the forgotten name of the Drowned Eye. The door recognizes its keeper and closes without blood or ruin. You lead the three captives home carrying a secret almost nobody left alive knows how to hear.',
    textEs: 'Greta pronuncia el nombre olvidado del Ojo Ahogado. La puerta reconoce a su guardiana y se cierra sin sangre ni destrucción. Conduces a los tres cautivos a casa llevando un secreto que casi nadie con vida sabe ya escuchar.',
  },
  c01_ending_relic: {
    id: 'c01_ending_relic', kind: 'ending', terminal: true, choices: [],
    outcome: 'failure', survivors: [], casualties: ['c01_tomas', 'c01_greta', 'c01_lyra'],
    title: 'What You Chose to Carry', titleEs: 'Lo que elegiste cargar',
    text: 'You reach through the opening and take the relic. By the time you turn back, the chains and their captives have vanished beneath black water. You leave the crypt powerful, alone, and unwelcome in the village you failed.',
    textEs: 'Cruzas la abertura y tomas la reliquia. Cuando vuelves la mirada, las cadenas y sus cautivos han desaparecido bajo el agua negra. Abandonas la cripta con poder, en soledad y sin ser bienvenido en la aldea a la que fallaste.',
  },
};

// ---- World ---------------------------------------------------

const LOCATIONS: Record<string, WorldLocation> = {
  c01_black_lantern: {
    id: 'c01_black_lantern', name: 'The Black Lantern Tavern', nameEs: 'La Taberna del Farol Negro',
    description: 'A smoky common room lit by a single black iron lantern. The air smells of roasting meat and old ale. A fire crackles in the stone hearth.',
    descriptionEs: 'Una sala común humeante iluminada por un solo farol de hierro negro. El aire huele a carne asada y cerveza vieja. Un fuego crepita en la chimenea de piedra.',
    connections: ['c01_village'],
    objects: [
      { id: 'c01_tavern_hearth', name: 'Stone Hearth', nameEs: 'Chimenea de Piedra', description: 'A well-worn stone hearth with a fire crackling. Warmth radiates outward.', descriptionEs: 'Una chimenea de piedra gastada con un fuego crepitante.', interactable: true, broken: false, hidden: false },
      { id: 'c01_tavern_notice', name: 'Notice Board', nameEs: 'Tablero de Anuncios', description: 'The reward notice bears the Blackmere council seal: three missing villagers. Martik has written across the bottom: "They did not run away."', descriptionEs: 'El aviso de recompensa lleva el sello del consejo de Blackmere: tres aldeanos desaparecidos. Martik ha escrito al pie: «No huyeron».', interactable: true, broken: false, hidden: false },
    ],
    npcs: ['c01_martik', 'c01_varen'], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'tavern',
  },
  c01_village: {
    id: 'c01_village', name: 'Blackmere Village', nameEs: 'Aldea de Blackmere',
    description: 'A small village nestled in a valley of dark pines. Smoke rises from chimneys. The villagers keep to themselves.',
    descriptionEs: 'Una pequeña aldea enclavada en un valle de pinos oscuros. El humo sube de las chimeneas. Los aldeanos se mantienen a sí mismos.',
    connections: ['c01_black_lantern', 'c01_chapel', 'c01_crypt_path'],
    objects: [
      { id: 'c01_village_well', name: 'Village Well', nameEs: 'Pozo del Pueblo', description: 'An old stone well. You can hear water far below.', descriptionEs: 'Un viejo pozo de piedra. Puedes escuchar agua muy abajo.', interactable: true, broken: false, hidden: false },
    ],
    npcs: ['c01_mira', 'c01_aldric'], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'town',
  },
  c01_chapel: {
    id: 'c01_chapel', name: 'Chapel of the Ashen Veil', nameEs: 'Capilla del Velo Ceniza',
    description: 'A small stone chapel with a faded mural of a veiled figure. Candles flicker before a cracked altar.',
    descriptionEs: 'Una pequeña capilla de piedra con un mural descolorido de una figura velada. Las velas parpadean ante un altar agrietado.',
    connections: ['c01_village'],
    objects: [
      { id: 'c01_chapel_altar', name: 'Cracked Altar', nameEs: 'Altar Agrietado', description: 'The altar bears a faintly glowing symbol. Something about it feels wrong.', descriptionEs: 'El altar lleva un símbolo que brilla tenuemente. Algo se siente mal.', interactable: true, searchDC: 15, broken: false, hidden: false },
    ],
    npcs: ['c01_sera', 'c01_elara'], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'temple',
  },
  c01_crypt_path: {
    id: 'c01_crypt_path', name: 'The Overgrown Path', nameEs: 'El Sendero Crecido',
    description: 'A narrow trail winding through twisted pines. The air grows colder. Birdsong fades to silence.',
    descriptionEs: 'Un sendero estrecho serpenteando a través de pinos retorcidos. El aire se enfría. El canto de las aves se convierte en silencio.',
    connections: ['c01_village', 'c01_crypt_entrance'],
    objects: [],
    npcs: [], enemies: ['c01_shadow_wolf'], dangerLevel: 1, discovered: false, secrets: [], ambiance: 'forest',
  },
  c01_crypt_entrance: {
    id: 'c01_crypt_entrance', name: 'The Sunken Crypt — Entrance', nameEs: 'La Cripta Sumergida — Entrada',
    description: 'A massive stone archway half-buried in earth. Ancient runes glow faintly on the doorframe. The iron door is slightly ajar.',
    descriptionEs: 'Un enorme arco de piedra enterrado a medias en la tierra. Runas antiguas brillan tenuemente en el marco. La puerta de hierro está entreabierta.',
    connections: ['c01_crypt_path', 'c01_crypt_antechamber'],
    objects: [],
    npcs: [], enemies: [], dangerLevel: 2, discovered: false, secrets: [], ambiance: 'crypt',
  },
  c01_crypt_antechamber: {
    id: 'c01_crypt_antechamber', name: 'The Antechamber', nameEs: 'La Antecámara',
    description: 'A wide chamber with columns lining the walls. Broken sarcophagi lie scattered. Torchlight reveals faded murals of a burial procession.',
    descriptionEs: 'Una amplia cámara con columnas alineando las paredes. Sarcófagos rotos dispersos. La luz de las antorchas revela murales descoloridos de una procesión funeraria.',
    connections: ['c01_crypt_entrance', 'c01_guardian_room'],
    objects: [],
    npcs: [], enemies: ['c01_skeleton_guard'], dangerLevel: 2, discovered: false, secrets: [], ambiance: 'crypt',
  },
  c01_guardian_room: {
    id: 'c01_guardian_room', name: 'The Guardian\'s Chamber', nameEs: 'La Cámara del Guardián',
    description: 'A vast underground hall. At its center, a towering figure of bone and shadow rises from a black pool. The Crypt Warden. This is where the missing villagers ended up.',
    descriptionEs: 'Un vasto salón subterráneo. En su centro, una figura imponente de hueso y sombra se eleva de un estanque negro. El Guardián de la Cripta. Aquí es donde terminaron los aldeanos desaparecidos.',
    connections: ['c01_crypt_antechamber'],
    objects: [
      { id: 'c01_guardian_pool', name: 'Black Pool', nameEs: 'Estanque Negro', description: 'A pool of liquid darkness. The water is unnaturally cold.', descriptionEs: 'Un estanque de oscuridad líquida. El agua es antinaturalmente fría.', interactable: true, broken: false, hidden: false },
    ],
    npcs: ['c01_lyra'], enemies: ['c01_warden'], dangerLevel: 4, discovered: false, secrets: [], ambiance: 'boss',
  },
};

const NPCS: Record<string, NPC> = {
  c01_martik: {
    id: 'c01_martik', name: 'Martik', nameEs: 'Martik', portrait: 'innkeeper', faction: 'blackmere_council', location: 'c01_black_lantern', disposition: 10,
    knowledge: ['blackmere_rumors', 'missing_villagers', 'crypt_entrance'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'Martik sees the notice in your hand and sets the mug aside. "That final line is mine. Three people have vanished in a month, and the council would rather call them runaways. If you came for the reward, first learn their names."', textEs: 'Martik ve el aviso en tu mano y deja la jarra a un lado. «La última línea la escribí yo. Tres personas han desaparecido en un mes y el consejo prefiere llamarlos fugitivos. Si vienes por la recompensa, primero aprende sus nombres».', responses: [{ text: 'I will learn their names.', textEs: 'Aprenderé sus nombres.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Innkeeper', occupationEs: 'Posadero', secrets: ['Varen comes in at night and drinks alone'], secretsEs: ['Varen viene de noche y bebe solo'], personality: 'Gruff but caring', personalityEs: 'Gruñón pero cuidadoso',
  },
  c01_varen: {
    id: 'c01_varen', name: 'The Stranger', nameEs: 'El Desconocido', portrait: 'stranger', faction: 'unaffiliated', location: 'c01_black_lantern', disposition: 0,
    knowledge: ['ancient_lore', 'crypt_secrets'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'The hooded figure notices the folded notice among your belongings. "So the promise of a hundred gold brought another adventurer to Blackmere. Sit — if you truly intend to enter the crypt, there is something Martik cannot tell you."', textEs: 'La figura encapuchada distingue el aviso doblado entre tus pertenencias. «Así que la promesa de cien piezas de oro ha traído a otro aventurero a Blackmere. Siéntate; si de verdad piensas entrar en la cripta, hay algo que Martik no puede contarte».', responses: [{ text: 'Tell me.', textEs: 'Dime.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Unknown', occupationEs: 'Desconocido', secrets: ['Is Captain Varen, scarred from the expedition'], secretsEs: ['Es el Capitán Varen, marcado por la expedición'], personality: 'Mysterious and burdened by guilt', personalityEs: 'Misterioso y cargado de culpa',
  },
  c01_mira: {
    id: 'c01_mira', name: 'Elder Mira', nameEs: 'Anciana Mira', portrait: 'elder', faction: 'blackmere_council', location: 'c01_village', disposition: 5,
    knowledge: ['crypt_history', 'ancient_runes', 'missing_villagers'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'An elderly woman with sharp eyes watches you from her doorway. "You have the look of someone heading toward trouble. The crypt, I suppose."', textEs: 'Una mujer anciana con ojos agudos te observa desde su puerta. «Tienes el aspecto de alguien que se dirige hacia problemas. La cripta, supongo».', responses: [{ text: 'I need information.', textEs: 'Necesito información.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Village Elder', occupationEs: 'Anciana del Pueblo', secrets: ['The crypt contains a door sealed by the Ashen Court'], secretsEs: ['La cripta contiene una puerta sellada por la Corte Ceniza'], personality: 'Wise and direct', personalityEs: 'Sabia y directa',
  },
  c01_aldric: {
    id: 'c01_aldric', name: 'Aldric', nameEs: 'Aldric', portrait: 'blacksmith', faction: 'blackmere_council', location: 'c01_village', disposition: 0,
    knowledge: ['weapon_maintenance', 'local_crafts'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'A burly man hammers at a piece of glowing metal. "If you need something fixed, leave it by the door."', textEs: 'Un hombre macizo martilla un trozo de metal brillante. «Si necesitas algo arreglado, déjalo junto a la puerta».', responses: [{ text: 'Understood.', textEs: 'Entendido.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Blacksmith', occupationEs: 'Herrero', secrets: [], secretsEs: [], personality: 'Practical, no-nonsense', personalityEs: 'Práctico, sin rodeos',
  },
  c01_sera: {
    id: 'c01_sera', name: 'Priest Sera', nameEs: 'Sacerdotisa Sera', portrait: 'priest', faction: 'veiled_court', location: 'c01_chapel', disposition: 5,
    knowledge: ['divine_magic', 'crypt_seals', 'ashen_veil_history'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'A woman in grey robes tends candles before the altar. "Welcome to the Chapel of the Ashen Veil. Are you seeking guidance?"', textEs: 'Una mujer en túnicas grises cuida velas ante el altar. «Bienvenido a la Capilla del Velo Ceniza. ¿Buscas guía?»', responses: [{ text: 'I am investigating the missing.', textEs: 'Investigo a los desaparecidos.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Priest', occupationEs: 'Sacerdotisa', secrets: ['The Ashen Veil was once a powerful order'], secretsEs: ['El Velo Ceniza fue una orden poderosa'], personality: 'Gentle but resolute', personalityEs: 'Gentil pero resoluta',
  },
  c01_elara: {
    id: 'c01_elara', name: 'Elara', nameEs: 'Elara', portrait: 'healer', faction: 'blackmere_council', location: 'c01_chapel', disposition: 10,
    knowledge: ['healing', 'missing_villagers', 'drowned_eye'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'Elara, Lyra\'s sister, shows you a drawing left behind: a stone door below black water and three figures bound before it. "Greta called the same symbol the Drowned Eye. Please — bring Lyra home."', textEs: 'Elara, la hermana de Lyra, te muestra un dibujo que dejó atrás: una puerta de piedra bajo aguas negras y tres figuras atadas ante ella. «Greta llamaba al mismo símbolo el Ojo Ahogado. Por favor — trae a Lyra a casa».', responses: [{ text: 'I will try.', textEs: 'Lo intentaré.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Healer', occupationEs: 'Curandera', secrets: [], secretsEs: [], personality: 'Compassionate and worried', personalityEs: 'Compasiva y preocupada',
  },
  c01_lyra: {
    id: 'c01_lyra', name: 'Lyra', nameEs: 'Lyra', portrait: 'villager', faction: 'blackmere_council', location: 'c01_guardian_room', disposition: 20,
    knowledge: ['warden_prison', 'crypt_interior'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'A young woman chained to the wall. She looks up with desperate eyes. "You\'re alive? Please — you have to destroy that thing. It keeps us here. Feeds on our fear."', textEs: 'Una joven encadenada a la pared. Mira con ojos desesperados. «¿Estás vivo? Por favor — tienes que destruir esa cosa. Nos mantiene aquí. Se alimenta de nuestro miedo».', responses: [{ text: 'I will free you.', textEs: 'Os liberaré.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Farmer', occupationEs: 'Granjera', secrets: ['The Warden took Greta\'s voice'], secretsEs: ['El Guardián le quitó la voz a Greta'], personality: 'Frightened but brave', personalityEs: 'Asustada pero valiente',
  },
};

const MONSTERS: Record<string, Omit<Enemy, 'id'>> = {
  c01_shadow_wolf: {
    templateId: 'c01_shadow_wolf', name: 'Shadow Wolf', nameEs: 'Lobo Sombrío', portrait: 'wolf', hp: 10, maxHp: 10, ac: 12, attack: 14, damage: '2d6', damageType: 'slashing', abilities: ['Pack Tactics', 'Keen Senses'], abilitiesEs: ['Tácticas de Manada', 'Sentidos Agudos'], xpValue: 50, loot: [], intelligence: 3, morale: 60, conditions: [],
  },
  c01_skeleton_guard: {
    templateId: 'c01_skeleton_guard', name: 'Skeletal Guard', nameEs: 'Guardia Esquelético', portrait: 'skeleton', hp: 8, maxHp: 8, ac: 12, attack: 13, damage: '1d8', damageType: 'slashing', abilities: ['Undead Fortitude'], abilitiesEs: ['Fortaleza No-Muerta'], xpValue: 60, loot: [], intelligence: 6, morale: 100, conditions: [],
  },
  c01_warden: {
    templateId: 'c01_warden', name: 'The Crypt Warden', nameEs: 'El Guardián de la Cripta', portrait: 'warden', hp: 26, maxHp: 26, ac: 14, attack: 16, damage: '2d10', damageType: 'necrotic', abilities: ['Bone Shield', 'Fear Aura', 'Summon Skeletons', 'Life Drain'], abilitiesEs: ['Escudo de Huesos', 'Aura de Miedo', 'Invocar Esqueletos', 'Drenaje de Vida'], xpValue: 500, loot: [], intelligence: 12, morale: 100, conditions: [],
  },
};

const QUESTS: Record<string, Quest> = {
  c01_the_sunken_crypt: {
    id: 'c01_the_sunken_crypt', name: 'The Sunken Crypt', nameEs: 'La Cripta Sumergida',
    description: 'Villagers have vanished near the ancient Sunken Crypt. Investigate the disappearances and find the missing people.',
    descriptionEs: 'Aldeanos han desaparecido cerca de la antigua Cripta Sumergida. Investiga las desapariciones y encuentra a las personas desaparecidas.',
    state: 'active', isMain: true, faction: 'blackmere_council',
    objectives: [
      { id: 'c01_investigate', description: 'Learn about the missing villagers', descriptionEs: 'Infórmate sobre los aldeanos desaparecidos', completed: false, current: 0, required: 1 },
      { id: 'c01_reach_crypt', description: 'Travel to the Sunken Crypt', descriptionEs: 'Viaja a la Cripta Sumergida', completed: false, current: 0, required: 1 },
      { id: 'c01_find_villagers', description: 'Find the missing villagers', descriptionEs: 'Encuentra a los aldeanos desaparecidos', completed: false, current: 0, required: 3 },
      { id: 'c01_defeat_warden', description: 'Defeat the Crypt Warden', descriptionEs: 'Derrota al Guardián de la Cripta', completed: false, current: 0, required: 1 },
    ],
    rewards: [{ type: 'xp', value: 500 }, { type: 'gold', value: 100 }, { type: 'reputation', value: 25, factionId: 'blackmere_council' }],
  },
};

export const CHAPTER_ONE: Chapter = {
  id: 'chapter-01', index: 1,
  title: 'The Missing of Blackmere', titleEs: 'Los desaparecidos de Blackmere',
  premise: 'Three villagers have disappeared by the Sunken Crypt; the council wants the matter kept silent; a hooded survivor drinks alone in the tavern; beneath the crypt, the Drowned Door has started breathing again.',
  premiseEs: 'Tres aldeanos han desaparecido junto a la Cripta Sumergida; el consejo prefiere silencio; un superviviente encapuchado bebe solo en la taberna; bajo la cripta, la Puerta Ahogada ha vuelto a respirar.',
  intro: [
    { type: 'system', text: 'CHAPTER I — THE MISSING OF BLACKMERE', textEs: 'CAPÍTULO I — LOS DESAPARECIDOS DE BLACKMERE', mood: 'mystery' },
    { type: 'narration', text: 'Three nights ago, on the road from {origin}, you found a notice: "Adventurers wanted. Three Blackmere villagers have vanished. The last trail leads to the Sunken Crypt. Reward: 100 gold." Someone had added beneath it in fresh ink: "Ask for Martik at the Black Lantern."', textEs: 'Hace tres noches encontraste un aviso en el camino desde {origin}: «Se buscan aventureros. Tres vecinos de Blackmere han desaparecido. La última pista conduce a la Cripta Sumergida. Recompensa: 100 piezas de oro». Alguien había añadido debajo, con tinta aún fresca: «Pregunten por Martik en el Farol Negro».', mood: 'mystery' },
    { type: 'narration', text: '{name} reaches Blackmere at dusk, the notice tucked among their belongings. The village is too quiet for this hour. Your first objective is simple: find Martik and learn who vanished before going anywhere near the crypt.', textEs: '{name} llega a Blackmere al caer la tarde, con el aviso guardado entre sus pertenencias. El pueblo está demasiado silencioso para esa hora. Tu primer objetivo es sencillo: encontrar a Martik y averiguar quién desapareció antes de acercarte a la cripta.', mood: 'neutral' },
    { type: 'system', text: 'CURRENT OBJECTIVE — Ask Martik about the missing villagers.', textEs: 'OBJETIVO ACTUAL — Habla con Martik sobre los aldeanos desaparecidos.', mood: 'neutral' },
  ],
  startNodeId: 'c01_arrival', startLocationId: 'c01_black_lantern',
  nodes: NODES,
  puzzles: { c01_chapel_ledger: CHAPEL_LEDGER, c01_drowned_door_runes: DROWNED_DOOR_RUNES },
  locations: LOCATIONS, npcs: NPCS, monsters: MONSTERS, quests: QUESTS,
  mainQuestId: 'c01_the_sunken_crypt',
  hooks: {
    bossLocationId: 'c01_guardian_room', aftermathNodeId: 'c01_warden_aftermath',
    routeDestinations: { direct: 'c01_crypt_path', forest: 'c01_crypt_path', secret_tunnel: 'c01_crypt_antechamber', varen: 'c01_crypt_entrance', council: 'c01_crypt_path' },
  },
  storyFacts: [
    { flag: 'c01_lean_council', en: 'The party chose to trust the council\'s account', es: 'El grupo eligió confiar en la versión del consejo' },
    { flag: 'c01_lean_chapel', en: 'The party chose to trust the chapel\'s account', es: 'El grupo eligió confiar en la versión de la capilla' },
    { flag: 'c01_lean_stranger', en: 'The party chose to trust the stranger\'s account', es: 'El grupo eligió confiar en la versión del desconocido' },
    { flag: 'c01_has_vial', en: 'The player carries the silver sealing vial', es: 'El jugador lleva el vial plateado de sellado' },
    { flag: 'c01_tunnel_map', en: 'The player holds the tunnel map', es: 'El jugador tiene el mapa del túnel' },
    { flag: 'c01_varen_guide', en: 'Captain Varen is guiding the player', es: 'El capitán Varen guía al jugador' },
    { flag: 'c01_council_support', en: 'The council provided armed support', es: 'El consejo proporcionó apoyo armado' },
    { flag: 'c01_intends_destroy', en: 'The player intends to destroy the door', es: 'El jugador planea destruir la puerta' },
    { flag: 'c01_elara_blessing', en: 'Elara\'s blessing increased the player\'s vitality', es: 'La bendición de Elara aumentó la vitalidad del jugador' },
    { flag: 'c01_chapel_ledger_decoded', en: 'The chapel burial ledger was decoded', es: 'El registro de entierros de la capilla fue descifrado' },
    { flag: 'c01_drowned_runes_read', en: 'The three runes of the Drowned Door were read', es: 'Las tres runas de la Puerta Ahogada fueron leídas' },
  ],
  suggestions: {
    c01_black_lantern: [
      { label: 'Show the notice to Martik', labelEs: 'Mostrar el aviso a Martik', action: 'talk to martik' },
      { label: 'Study the notice', labelEs: 'Estudiar el aviso', action: 'examine notice' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c01_village: [
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
      { label: 'Go to the chapel', labelEs: 'Ir a la capilla', action: 'go to chapel' },
      { label: 'Take the crypt path', labelEs: 'Tomar el sendero de la cripta', action: 'go to crypt path' },
    ],
    c01_chapel: [
      { label: 'Return to the village', labelEs: 'Volver a la aldea', action: 'go to village' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c01_crypt_path: [
      { label: 'Advance toward the crypt', labelEs: 'Avanzar hacia la cripta', action: 'go forward' },
      { label: 'Return to the village', labelEs: 'Volver a la aldea', action: 'go to village' },
    ],
    c01_crypt_entrance: [
      { label: 'Enter the crypt', labelEs: 'Entrar en la cripta', action: 'go forward' },
      { label: 'Go back', labelEs: 'Volver', action: 'go back' },
    ],
    c01_crypt_antechamber: [
      { label: 'Face the Warden', labelEs: 'Enfrentar al Guardián', action: 'go to guardian room' },
      { label: 'Go back', labelEs: 'Volver', action: 'go back' },
    ],
    c01_guardian_room: [
      { label: 'Attack the Warden', labelEs: 'Atacar al Guardián', action: 'attack' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
  },
  externalEntrySeeds: {
    c01_warden_aftermath: [
      { c01_has_vial: true, c01_intends_destroy: true },
      { 'canon:c01_greta_voice': true },
    ],
  },
  summaryFlags: [
    'canon:c01_door_sealed', 'canon:c01_door_destroyed', 'canon:c01_door_open',
    'canon:c01_door_remembered', 'canon:c01_door_relic', 'canon:c01_trio_rescued',
    'canon:c01_trio_lost', 'canon:c01_relic_claimed', 'canon:c01_rescue_oath',
    'canon:c01_oath_bank', 'canon:c01_greta_voice', 'canon:c01_door_named',
    'c01_varen_guide', 'c01_has_vial', 'c01_tunnel_map', 'c01_council_support',
    'c01_intends_destroy', 'c01_elara_blessing', 'c01_chapel_ledger_decoded',
    'c01_drowned_runes_read',
  ],
};