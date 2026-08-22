// ============================================================
// CHAPTER X — The Tenth Door
// La décima puerta
// Act III finale. Behind the court seal, the Door — the very
// name this campaign has carried — opens one last time. Three
// final commitments close a world: who will witness its oaths,
// who will keep the vessel, and who will pay the price. Exactly
// six terminal nodes, one per global ending; no hung terminal.
// ============================================================

import type { Chapter, StoryNode } from '../../engine/chapter';
import type { Puzzle } from '../../engine/puzzles';
import type { WorldLocation, NPC, Enemy, Quest } from '../../engine/types';

// ---- Puzzles -------------------------------------------------

const NAME_RIDDLE: Puzzle = {
  id: 'c10_name_riddle',
  kind: 'riddle',
  title: 'The Riddle of the Name',
  titleEs: 'El enigma del nombre',
  prompt: 'The Door asks for its own name. It is the word every chapter of this campaign has traded, the one a witness speaks, a vessel keeps, and a price pays. It binds without a chain and breaks without a touch, and the court can only hear it once it has been broken. What is it?',
  promptEs: 'La puerta pide su propio nombre. Es la palabra que cada capítulo de esta campaña ha trocado, la que un testigo pronuncia, una vasija guarda y un precio paga. Ata sin cadena y se rompe sin contacto, y la corte solo puede oírla una vez que ha sido rota. ¿Qué es?',
  hints: [
    { en: 'It is not a thing you can hold — it lives only while someone keeps speaking it.', es: 'No es algo que puedas sostener: solo vive mientras alguien sigue pronunciándolo.' },
    { en: 'Every door in this campaign is one, and the court heard it only when the silence ended it.', es: 'Cada puerta de esta campaña es uno, y la corte lo oyó solo cuando el silencio lo terminó.' },
    { en: 'It names a witness, a vessel and a price — and it is the word itself.', es: 'Nombra un testigo, una vasija y un precio — y es la propia palabra.' },
  ],
  answers: ['an oath', 'oath', 'a vow', 'vow', 'the oath', 'the vow'],
  answersEs: ['un juramento', 'juramento', 'un voto', 'voto', 'el juramento', 'el voto'],
  unlocks: { flags: { c10_name_unlocked: true } },
  solvedNodeId: 'c10_riddle_solved',
  skipNodeId: 'c10_riddle_skipped',
};

const LAST_MECHANISM: Puzzle = {
  id: 'c10_last_mechanism',
  kind: 'mechanism',
  title: 'The Inner Bolts',
  titleEs: 'Los cerrojos interiores',
  prompt: 'Three inner bolts hold the last seal of the Tenth Door: the witness-bolt, the vessel-bolt, the price-bolt. Turn them in the order an oath is spoken and the seal opens clean; turn them wrong and the seal bites. You may also skip the bolts and let the hand resolve the seal on its own.',
  promptEs: 'Tres cerrojos interiores sostienen el último sello de la décima puerta: el del testigo, el de la vasija, el del precio. Gíralos en el orden en que se pronuncia un juramento y el sello se abre limpio; gíralos mal y el sello muerde. También puedes omitir los cerrojos y dejar que la mano resuelva el sello por sí misma.',
  hints: [
    { en: 'The seal shows the witness first, the vessel second, and the price last — the order every oath is spoken.', es: 'El sello muestra primero el testigo, luego la vasija y al final el precio: el orden en que se pronuncia cada juramento.' },
    { en: 'The witness-bolt is an open eye, the vessel-bolt a bowl, the price-bolt a falling hand.', es: 'El cerrojo del testigo es un ojo abierto, el de la vasija un cuenco, el del precio una mano que cae.' },
    { en: 'Eye, then bowl, then falling hand — the seal goes quiet on the third.', es: 'Ojo, luego cuenco, luego mano que cae: el sello se aquieta en el tercero.' },
  ],
  steps: ['c10_bolt_witness', 'c10_bolt_vessel', 'c10_bolt_price'],
  ordered: true,
  stepLabels: [
    { id: 'c10_bolt_witness', label: 'Turn the witness-bolt', labelEs: 'Girar el cerrojo del testigo' },
    { id: 'c10_bolt_vessel', label: 'Turn the vessel-bolt', labelEs: 'Girar el cerrojo de la vasija' },
    { id: 'c10_bolt_price', label: 'Turn the price-bolt', labelEs: 'Girar el cerrojo del precio' },
  ],
  onWrongStep: { en: 'The seal bites and the bolts spin home. The order is lost; begin again.', es: 'El sello muerde y los cerrojos vuelven a su sitio. El orden se pierde; empieza de nuevo.' },
  unlocks: { flags: { c10_seal_aligned: true } },
  solvedNodeId: 'c10_mechanism_solved',
  skipNodeId: 'c10_mechanism_skipped',
};

// ---- Nodes ---------------------------------------------------

const NODES: Record<string, StoryNode> = {
  c10_start: {
    id: 'c10_start', kind: 'beat', locationId: 'c10_ante_threshold',
    title: 'The Descent', titleEs: 'El descenso',
    text: 'The Tenth Door opens behind the court seal. The whole company descends with you onto the door — Martik if he kept the first silence, Varen if he guided every road, Elara if she paid the memory-price, Voss if the register stamped it, Olen if the map still holds, Sylva if the moss still keeps the name. The door is the very name this campaign has carried, and three final commitments will close a world: who will witness its oaths, who will keep the vessel, and who will pay the price.',
    textEs: 'La décima puerta se abre detrás del sello de la corte. Toda la compañía desciende contigo sobre la puerta — Martik si guardó el primer silencio, Varen si guió cada camino, Elara si pagó el precio de la memoria, Voss si el registro lo selló, Olen si el mapa aún sostiene, Sylva si el musgo aún guarda el nombre. La puerta es el propio nombre que esta campaña ha llevado, y tres compromisos finales cerrarán un mundo: quién será testigo de sus juramentos, quién guardará la vasija, y quién pagará el precio.',
    choices: [
      { id: 'c10_start_to_ante', label: 'Cross onto the door', labelEs: 'Cruzar a la puerta', nextNodeId: 'c10_ante_threshold', result: 'You cross onto the door. The whole company follows.', resultEs: 'Cruzas a la puerta. Toda la compañía sigue.' },
    ],
  },

  c10_ante_threshold: {
    id: 'c10_ante_threshold', kind: 'beat', locationId: 'c10_ante_threshold',
    title: 'The Ante-Threshold', titleEs: 'El ante-umbral',
    text: 'The ante-threshold is the floor of the last door, and the Council of Witnesses mirrors every bond the campaign accrued. The Assembly clerk waits on one side, the Council living guardian on another, the Free people spokesperson on the third. You may openly side with one first — not to choose the ending, but to set the room. The lean is a conjunct inside a route, never a sole arbiter; the history this campaign carries decides the rest.',
    textEs: 'El ante-umbral es el suelo de la última puerta, y el Consejo de Testigos refleja cada vínculo que la campaña acumuló. El secretario de la Asamblea espera a un lado, el guardián vivo del Consejo a otro, el portavoz del pueblo libre al tercero. Puedes alinearte abiertamente con uno primero — no para elegir el final, sino para preparar la sala. La inclinación es un conjunto dentro de una ruta, nunca un árbitro único; la historia que esta campaña lleva decide el resto.',
    choices: [
      { id: 'c10_start_to_pledge', label: 'Open the first pledge', labelEs: 'Abrir el primer compromiso', nextNodeId: 'c10_first_pledge', result: 'The three representatives turn to you. The pledge begins.', resultEs: 'Los tres representantes se vuelven hacia ti. El compromiso comienza.' },
    ],
  },

  c10_first_pledge: {
    id: 'c10_first_pledge', kind: 'beat', locationId: 'c10_ante_threshold',
    title: 'The First Pledge', titleEs: 'El primer compromiso',
    text: 'Three voices wait for your first pledge: the Assembly clerk, who would make an institution the witness; the Council living guardian, who would have one living person carry the price; the Free people spokesperson, who would let every community shoulder its own fraction. Whom you side with first sets the room — but the ending is decided by the whole campaign behind you, never by this lean alone.',
    textEs: 'Tres voces esperan tu primer compromiso: el secretario de la Asamblea, que haría de una institución el testigo; el guardián vivo del Consejo, que haría que una persona viva cargara el precio; el portavoz del pueblo libre, que dejaría a cada comunidad cargar su propia fracción. Con quién te alinees primero prepara la sala — pero el final lo decide toda la campaña detrás de ti, nunca esta inclinación sola.',
    choices: [
      { id: 'c10_lean_trust', label: 'Side with the Assembly clerk', labelEs: 'Alinearte con el secretario de la Asamblea', nextNodeId: 'c10_gallery_entry', setsFlags: { c10_lean_trust: true }, adjustsValues: { conviction_duty: 1 }, result: 'You side with the clerk. The archive-gallery opens before you.', resultEs: 'Te alineas con el secretario. La galería del archivo se abre ante ti.' },
      { id: 'c10_lean_carry', label: 'Side with the living guardian', labelEs: 'Alinearte con el guardián vivo', nextNodeId: 'c10_well_entry', setsFlags: { c10_lean_carry: true }, adjustsValues: { conviction_compassion: 1 }, result: 'You side with the guardian. The witnessing-well opens before you.', resultEs: 'Te alineas con el guardián. El pozo del testimonio se abre ante ti.' },
      { id: 'c10_lean_break', label: 'Side with the Free spokesperson', labelEs: 'Alinearte con el portavoz libre', nextNodeId: 'c10_seal_entry', setsFlags: { c10_lean_break: true }, adjustsValues: { conviction_freedom: 1 }, result: 'You side with the spokesperson. The forged-seal chamber opens before you.', resultEs: 'Te alineas con el portavoz. La cámara del sello forjado se abre ante ti.' },
    ],
  },

  c10_gallery_entry: {
    id: 'c10_gallery_entry', kind: 'beat', locationId: 'c10_gallery',
    title: 'The Archive-Gallery', titleEs: 'La galería del archivo',
    text: 'The archive-gallery is the silent stacks of the clerk court, where every precedent oath is filed in the second ink. The clerk walks you past the shelves to the reading desk where the name of the Door waits behind a riddle. The precedent evidence lives here: read the name, and the door knows its own word.',
    textEs: 'La galería del archivo son las estanterías silenciosas de la corte del secretario, donde cada juramento precedente está archivado en la segunda tinta. El secretario te lleva por las estanterías al atril donde el nombre de la puerta espera tras un enigma. La prueba del precedente vive aquí: lee el nombre, y la puerta conoce su propia palabra.',
    choices: [
      { id: 'c10_gallery_to_stacks', label: 'Walk the silent stacks to the reading desk', labelEs: 'Cruzar las estanterías silenciosas al atril', nextNodeId: 'c10_gallery_stacks', result: 'You walk the stacks. The second ink glows faintly on every spine.', resultEs: 'Cruzas las estanterías. La segunda tinta brilla débilmente en cada lomo.' },
      { id: 'c10_gallery_back', label: 'Return to the pledge', labelEs: 'Volver al compromiso', nextNodeId: 'c10_first_pledge', result: 'You step back from the gallery. The clerk watches you go.', resultEs: 'Retrocedes de la galería. El secretario te ve irse.' },
    ],
  },

  c10_gallery_stacks: {
    id: 'c10_gallery_stacks', kind: 'beat', locationId: 'c10_gallery',
    title: 'The Silent Stacks', titleEs: 'Las estanterías silenciosas',
    text: 'The stacks hold every oath the world filed with the Door. The reading desk at the end holds one riddle the Door set on its own name — answer it, and the precedent evidence is yours. If the name was never recovered in the wood, the evidence gathered in-chapter makes it inferable: the word is the one every chapter traded.',
    textEs: 'Las estanterías guardan cada juramento que el mundo presentó a la puerta. El atril al final guarda un enigma que la puerta puso sobre su propio nombre — respóndelo, y la prueba del precedente es tuya. Si el nombre nunca se recuperó en el bosque, la prueba reunida en el capítulo lo hace inferible: la palabra es la que cada capítulo trocó.',
    choices: [
      { id: 'c10_stacks_to_riddle', label: 'Open the riddle of the name', labelEs: 'Abrir el enigma del nombre', nextNodeId: 'c10_name_riddle', result: 'You sit at the reading desk. The riddle of the name begins.', resultEs: 'Te sientas al atril. El enigma del nombre comienza.' },
      { id: 'c10_stacks_back', label: 'Return to the gallery entry', labelEs: 'Volver a la entrada de la galería', nextNodeId: 'c10_gallery_entry', result: 'You step back from the desk. The riddle waits.', resultEs: 'Retrocedes del atril. El enigma espera.' },
    ],
  },

  c10_name_riddle: {
    id: 'c10_name_riddle', kind: 'puzzle', puzzleId: 'c10_name_riddle', locationId: 'c10_gallery',
    title: 'The Riddle of the Name', titleEs: 'El enigma del nombre',
    text: 'The reading desk holds the riddle the Door set on its own name. Answer true and the precedent evidence is yours.',
    textEs: 'El atril guarda el enigma que la puerta puso sobre su propio nombre. Responde con verdad y la prueba del precedente es tuya.',
    choices: [],
  },

  c10_riddle_solved: {
    id: 'c10_riddle_solved', kind: 'beat', locationId: 'c10_gallery',
    title: 'The Name Recovered', titleEs: 'El nombre recuperado',
    text: 'The name is plain: the Door is an oath — the word every chapter traded, the one a witness speaks, a vessel keeps, a price pays. The precedent evidence is yours, and the door knows its own word now. You walk from the gallery to the reckoning.',
    textEs: 'El nombre es evidente: la puerta es un juramento — la palabra que cada capítulo trocó, la que un testigo pronuncia, una vasija guarda, un precio paga. La prueba del precedente es tuya, y la puerta ya conoce su propia palabra. Caminas de la galería al ajuste de cuentas.',
    choices: [
      { id: 'c10_solved_to_reckon', label: 'Walk to the reckoning', labelEs: 'Ir al ajuste de cuentas', nextNodeId: 'c10_reckoning', setsFlags: { c10_name_known: true }, result: 'You leave the gallery. The reckoning waits at the well of the door.', resultEs: 'Dejas la galería. El ajuste de cuentas espera en el pozo de la puerta.' },
    ],
  },

  c10_riddle_skipped: {
    id: 'c10_riddle_skipped', kind: 'beat', locationId: 'c10_gallery',
    title: 'The Name Left Unspoken', titleEs: 'El nombre dejado sin pronunciar',
    text: 'You leave the riddle unanswered. The name stays in the desk, and the precedent evidence is thinner for it — but the reckoning can still be reached, and the hand can still resolve the door on the rest of the campaign. You walk from the gallery to the reckoning.',
    textEs: 'Dejas el enigma sin responder. El nombre se queda en el atril, y la prueba del precedente es más delgada por ello — pero el ajuste de cuentas aún puede alcanzarse, y la mano aún puede resolver la puerta con el resto de la campaña. Caminas de la galería al ajuste de cuentas.',
    choices: [
      { id: 'c10_skipped_to_reckon', label: 'Walk to the reckoning', labelEs: 'Ir al ajuste de cuentas', nextNodeId: 'c10_reckoning', result: 'You leave the gallery. The reckoning waits, thinner but still open.', resultEs: 'Dejas la galería. El ajuste de cuentas espera, más delgado pero aún abierto.' },
    ],
  },

  c10_well_entry: {
    id: 'c10_well_entry', kind: 'beat', locationId: 'c10_well',
    title: 'The Witnessing-Well', titleEs: 'El pozo del testimonio',
    text: 'The witnessing-well is the living testimony of the crowd. The guardian walks you to the rail where every bond the campaign accrued looks back up at you — Martik, Varen, Elara, Voss, Olen, Sylva — and the crowd presses its human proof of the verdict upward. The well does not ask a riddle; it asks you to let the testimony stand.',
    textEs: 'El pozo del testimonio es el testimonio vivo de la multitud. El guardián te lleva a la barandilla donde cada vínculo que la campaña acumuló te mira hacia arriba — Martik, Varen, Elara, Voss, Olen, Sylva — y la multitud empuja su prueba humana del veredicto hacia arriba. El pozo no pide un enigma; te pide que dejes que el testimonio se sostenga.',
    choices: [
      { id: 'c10_well_to_testimony', label: 'Lean on the rail and hear the testimony', labelEs: 'Apoyarse en la barandilla y oír el testimonio', nextNodeId: 'c10_well_testimony', result: 'You lean on the rail. The faces look up and the testimony begins.', resultEs: 'Te apoyas en la barandilla. Los rostros miran arriba y el testimonio comienza.' },
      { id: 'c10_well_back', label: 'Return to the pledge', labelEs: 'Volver al compromiso', nextNodeId: 'c10_first_pledge', result: 'You step back from the well. The guardian watches you go.', resultEs: 'Retrocedes del pozo. El guardián te ve irse.' },
    ],
  },

  c10_well_testimony: {
    id: 'c10_well_testimony', kind: 'beat', locationId: 'c10_well',
    title: 'The Living Testimony', titleEs: 'El testimonio vivo',
    text: 'The testimony rises from the well: every name the campaign carried, every door it crossed, every price it paid. The crowd presses its human proof of the verdict upward, and the guardian lets it stand. You walk from the well to the reckoning.',
    textEs: 'El testimonio sube del pozo: cada nombre que la campaña llevó, cada puerta que cruzó, cada precio que pagó. La multitud empuja su prueba humana del veredicto hacia arriba, y el guardián la deja sostener. Caminas del pozo al ajuste de cuentas.',
    choices: [
      { id: 'c10_testimony_to_crowd', label: 'Let the testimony stand and walk to the crowd', labelEs: 'Dejar que el testimonio se sostenga y bajar a la multitud', nextNodeId: 'c10_well_crowd', setsFlags: { c10_testimony_heard: true }, adjustsValues: { conviction_compassion: 1 }, result: 'The testimony stands. You walk down to the crowd.', resultEs: 'El testimonio se sostiene. Bajas a la multitud.' },
    ],
  },

  c10_well_crowd: {
    id: 'c10_well_crowd', kind: 'beat', locationId: 'c10_well',
    title: 'The Crowd', titleEs: 'La multitud',
    text: 'The crowd holds the human proof of the verdict, and the guardian stands among them. You walk from the well to the reckoning, the testimony carried with you.',
    textEs: 'La multitud guarda la prueba humana del veredicto, y el guardián se mantiene entre ellos. Caminas del pozo al ajuste de cuentas, el testimonio llevado contigo.',
    choices: [
      { id: 'c10_crowd_to_reckon', label: 'Walk to the reckoning', labelEs: 'Ir al ajuste de cuentas', nextNodeId: 'c10_reckoning', result: 'You leave the well. The reckoning waits at the well of the door.', resultEs: 'Dejas el pozo. El ajuste de cuentas espera en el pozo de la puerta.' },
    ],
  },

  c10_seal_entry: {
    id: 'c10_seal_entry', kind: 'beat', locationId: 'c10_seal_chamber',
    title: 'The Forged-Seal Chamber', titleEs: 'La cámara del sello forjado',
    text: 'The forged-seal chamber is the danger branch, where the old seal integrity is broken or repaired. The spokesperson walks you to the seal-bench where three inner bolts hold the last seal of the Tenth Door. The bolts may be turned in the order an oath is spoken, or skipped — the hand resolves the seal on its own if you do.',
    textEs: 'La cámara del sello forjado es la rama del peligro, donde la integridad del sello antiguo se rompe o se repara. El portavoz te lleva al banco del sello donde tres cerrojos interiores sostienen el último sello de la décima puerta. Los cerrojos pueden girarse en el orden en que se pronuncia un juramento, u omitirse — la mano resuelve el sello por sí misma si no lo haces.',
    choices: [
      { id: 'c10_seal_to_chamber', label: 'Enter the seal chamber', labelEs: 'Entrar a la cámara del sello', nextNodeId: 'c10_seal_chamber', result: 'You enter the chamber. The three inner bolts wait in the bench.', resultEs: 'Entras a la cámara. Los tres cerrojos interiores esperan en el banco.' },
      { id: 'c10_seal_back', label: 'Return to the pledge', labelEs: 'Volver al compromiso', nextNodeId: 'c10_first_pledge', result: 'You step back from the chamber. The spokesperson watches you go.', resultEs: 'Retrocedes de la cámara. El portavoz te ve irse.' },
    ],
  },

  c10_seal_chamber: {
    id: 'c10_seal_chamber', kind: 'beat', locationId: 'c10_seal_chamber',
    title: 'The Seal-Bench', titleEs: 'El banco del sello',
    text: 'The seal-bench holds the three inner bolts — witness, vessel, price — and the old seal sits in a well of black water behind them, the same water that fills the Drowned Door. Turn them in the order an oath is spoken and the seal opens clean; skip them and the hand resolves the seal on its own. The spokesperson waits at your shoulder.',
    textEs: 'El banco del sello sostiene los tres cerrojos interiores — testigo, vasija, precio — y el sello antiguo descansa en un pozo de agua negra detrás de ellos, la misma que llena la Puerta Ahogada. Gíralos en el orden en que se pronuncia un juramento y el sello se abre limpio; ómitelos y la mano resuelve el sello por sí misma. El portavoz espera junto a ti.',
    choices: [
      { id: 'c10_chamber_to_mechanism', label: 'Turn the three inner bolts', labelEs: 'Girar los tres cerrojos interiores', nextNodeId: 'c10_last_mechanism', result: 'You put your hands to the bolts. The mechanism begins.', resultEs: 'Pones tus manos en los cerrojos. El mecanismo comienza.' },
    ],
  },

  c10_last_mechanism: {
    id: 'c10_last_mechanism', kind: 'puzzle', puzzleId: 'c10_last_mechanism', locationId: 'c10_seal_chamber',
    title: 'The Inner Bolts', titleEs: 'Los cerrojos interiores',
    text: 'The inner bolts wait. Witness, vessel, price — in the order the oath is spoken. You may also skip them.',
    textEs: 'Los cerrojos interiores esperan. Testigo, vasija, precio — en el orden en que se pronuncia el juramento. También puedes omitirlos.',
    choices: [],
  },

  c10_mechanism_solved: {
    id: 'c10_mechanism_solved', kind: 'beat', locationId: 'c10_seal_chamber',
    title: 'The Seal Opened Clean', titleEs: 'El sello abierto limpio',
    text: 'The third bolt turns and the seal opens clean. The door is open to the hand, and the hand can resolve it without a fight. You walk from the chamber to the reckoning.',
    textEs: 'El tercer cerrojo gira y el sello se abre limpio. La puerta queda abierta a la mano, y la mano puede resolverla sin pelea. Caminas de la cámara al ajuste de cuentas.',
    choices: [
      { id: 'c10_msolved_to_reckon', label: 'Walk to the reckoning', labelEs: 'Ir al ajuste de cuentas', nextNodeId: 'c10_reckoning', result: 'You leave the chamber. The reckoning waits at the well of the door.', resultEs: 'Dejas la cámara. El ajuste de cuentas espera en el pozo de la puerta.' },
    ],
  },

  c10_mechanism_skipped: {
    id: 'c10_mechanism_skipped', kind: 'beat', locationId: 'c10_seal_chamber',
    title: 'The Bolts Left', titleEs: 'Los cerrojos dejados',
    text: 'You leave the bolts as they are. The seal stays shut, and the hand will resolve it on its own — the closing still happens, only without the clean opening. You walk from the chamber to the reckoning.',
    textEs: 'Dejas los cerrojos como están. El sello sigue cerrado, y la mano lo resolverá por sí misma — el cierre sigue ocurriendo, solo sin la apertura limpia. Caminas de la cámara al ajuste de cuentas.',
    choices: [
      { id: 'c10_mskipped_to_reckon', label: 'Walk to the reckoning', labelEs: 'Ir al ajuste de cuentas', nextNodeId: 'c10_reckoning', result: 'You leave the chamber. The reckoning waits at the well of the door.', resultEs: 'Dejas la cámara. El ajuste de cuentas espera en el pozo de la puerta.' },
    ],
  },

  c10_reckoning: {
    id: 'c10_reckoning', kind: 'beat', locationId: 'c10_threshold',
    title: 'The Reckoning of Oaths', titleEs: 'El ajuste de cuentas de los juramentos',
    text: 'The Reckoning of Oaths is the non-combat climax. The last Collector arrives insisting the full tally resolves today, and the party sends the full tally once. You may dissolve the accusation with persuasion, deception, or performance — and walk to the threshold without a final blow. Or you may meet the Thief of Names, the assassin of witness memory, and settle the reckoning in steel. Either road reaches the threshold where the three hands wait.',
    textEs: 'El ajuste de cuentas de los juramentos es el clímax sin combate. El último cobrador llega insistiendo en que la suma completa se resuelva hoy, y el grupo envía la suma completa una vez. Puedes disolver la acusación con persuasión, engaño o interpretación — y caminar al umbral sin un golpe final. O puedes encontrar al Ladrón de Nombres, el asesino de la memoria de los testigos, y resolver el ajuste en acero. Ambos caminos llegan al umbral donde esperan las tres manos.',
    choices: [
      { id: 'c10_reckon_dissolve', label: 'Dissolve the accusation without a blow', labelEs: 'Disolver la acusación sin un golpe', nextNodeId: 'c10_thief_aftermath', setsFlags: { c10_reckoning_dissolved: true }, adjustsValues: { conviction_compassion: 1 }, result: 'You send the full tally once. The accusation dissolves and the Collector closes his book.', resultEs: 'Envías la suma completa una vez. La acusación se disuelve y el cobrador cierra su libro.' },
      { id: 'c10_reckon_fight', label: 'Meet the Thief of Names in steel', labelEs: 'Encontrar al Ladrón de Nombres en acero', nextNodeId: 'c10_thief_combat', setsFlags: { c10_thief_faced: true }, adjustsValues: { conviction_duty: 1 }, result: 'You raise your weapon. The Thief of Names turns its stolen shapes toward you.', resultEs: 'Levantas tu arma. El Ladrón de Nombres gira sus formas robadas hacia ti.' },
    ],
  },

  c10_thief_combat: {
    id: 'c10_thief_combat', kind: 'beat', locationId: 'c10_threshold',
    title: 'The Thief of Names', titleEs: 'El Ladrón de Nombres',
    text: 'The Thief of Names is the assassin of witness memory. A spell-heavy pressure wears down its concentration; an athletic or stealth route strips its stolen shapes; an archer forces the fight at range; a well-armored wall catches its lunges. Your build decides the viable lane. Win, and the threshold is clear for the three hands.',
    textEs: 'El Ladrón de Nombres es el asesino de la memoria de los testigos. Una presión mágica desgasta su concentración; un camino atlético o furtivo despoja sus formas robadas; un arquero fuerza la pelea a distancia; un muro bien armado atrapa sus embestidas. Tu construcción decide el camino viable. Gana, y el umbral queda libre para las tres manos.',
    choices: [
      { id: 'c10_face_thief', label: 'Fight the Thief of Names', labelEs: 'Combatir al Ladrón de Nombres', nextNodeId: 'c10_thief_aftermath', result: 'You close with the Thief. The stolen shapes turn on you.', resultEs: 'Cierras con el Ladrón. Las formas robadas se vuelven hacia ti.' },
    ],
  },

  c10_thief_aftermath: {
    id: 'c10_thief_aftermath', kind: 'beat', locationId: 'c10_threshold', externalEntry: true,
    title: 'The Threshold Clear', titleEs: 'El umbral despejado',
    text: 'The reckoning is done — dissolved without a blow, or won in steel. The threshold is clear, and the three hands wait on the last stone of the door. The hand the court verdict offers is the hand you may take; the history behind it decides which of the hand routes carries the world.',
    textEs: 'El ajuste de cuentas está hecho — disuelto sin un golpe, o ganado en acero. El umbral está despejado, y las tres manos esperan en la última piedra de la puerta. La mano que el veredicto de la corte ofrece es la mano que puedes tomar; la historia detrás de ella decide cuál de las rutas de la mano carga el mundo.',
    choices: [
      { id: 'c10_aftermath_to_hands', label: 'Walk to the three hands', labelEs: 'Caminar a las tres manos', nextNodeId: 'c10_hand_assembly', result: 'You walk to the last stone. The three hands wait.', resultEs: 'Caminas a la última piedra. Las tres manos esperan.' },
    ],
  },

  c10_hand_assembly: {
    id: 'c10_hand_assembly', kind: 'route', locationId: 'c10_threshold',
    title: 'The Three Hands', titleEs: 'Las tres manos',
    text: 'The three final commitments wait on the last stone: trust an institution to witness the oaths, carry the price in one living person, or break the terms so every community shoulders its own fraction. The hand the court verdict offers is the hand you may take; the routes inside it are decided by the whole campaign behind you. The descent closes here — the hands open by the verdict, and the world closes on the route.',
    textEs: 'Los tres compromisos finales esperan en la última piedra: confiar en una institución para testificar los juramentos, cargar el precio en una persona viva, o romper los términos para que cada comunidad cargue su propia fracción. La mano que el veredicto de la corte ofrece es la mano que puedes tomar; las rutas dentro de ella las decide toda la campaña detrás de ti. El descenso se cierra aquí — las manos se abren por el veredicto, y el mundo se cierra sobre la ruta.',
    choices: [],
  },

  c10_hand_trust: {
    id: 'c10_hand_trust', kind: 'beat', locationId: 'c10_threshold', externalEntry: true,
    title: 'The Hand of Trust', titleEs: 'La mano de la confianza',
    text: 'The court vindicated the door, or reformed the pact — an institution becomes the witness. The routes inside the hand of trust are two pairs:\n\nThe Court Restored pair on a vindicated verdict, split by whether the name was returned; the New Concord pair on a reformed verdict, split by whether the map was shared. The history behind you picks the route; the hand only opens the door.',
    textEs: 'La corte vindicó la puerta, o reformó el pacto — una institución se vuelve el testigo. Las rutas dentro de la mano de la confianza son dos pares:\n\nEl par de la Corte Restaurada sobre un veredicto vindicado, dividido por si el nombre fue devuelto; el par del Nuevo Concordato sobre un veredicto reformado, dividido por si el mapa fue compartido. La historia detrás de ti elige la ruta; la mano solo abre la puerta.',
    choices: [
      { id: 'c10_route_r1', label: 'Hand the name to the old keeper — the court is restored', labelEs: 'Entregar el nombre al guardián antiguo — la corte queda restaurada', nextNodeId: 'c10_end_court_restored', requires: [{ flag: 'canon:c08_verdict_vindicated' }, { flag: 'canon:c04_name_returned' }, { flag: 'canon:c05_registry_governed' }], requiresValues: [{ key: 'bond:sylva', min: 1 }], setsFlags: { c10_route_r1: true }, adjustsValues: { conviction_duty: 1 }, result: 'The name is handed to the old keeper. The court re-accepts the bookkeeping and one keeper silence each year.', resultEs: 'El nombre se entrega al guardián antiguo. La corte reacepta la contabilidad y un silencio del guardián cada año.' },
      { id: 'c10_route_r2', label: 'Restored by evidence — the court takes the bookkeeping', labelEs: 'Restaurada por la prueba — la corte toma la contabilidad', nextNodeId: 'c10_end_court_restored', requires: [{ flag: 'canon:c08_verdict_vindicated' }, { flag: 'canon:c04_name_returned', equals: false }, { flag: 'canon:c08_evidence_majority' }], requiresValues: [{ key: 'bond:voss', min: 1 }], setsFlags: { c10_route_r2: true }, adjustsValues: { conviction_duty: 1 }, result: 'Voss stamps the register. The court takes the bookkeeping on the weight of the evidence.', resultEs: 'Voss sella el registro. La corte toma la contabilidad sobre el peso de la prueba.' },
      { id: 'c10_route_n1', label: 'A concord of assembly and council — the new concord', labelEs: 'Un concordato de asamblea y consejo — el nuevo concordato', nextNodeId: 'c10_end_new_concord', requires: [{ flag: 'canon:c08_verdict_reform' }, { flag: 'canon:c05_registry_governed' }, { flag: 'canon:c02_map_shared' }], requiresValues: [{ key: 'faction:iron_parliament', min: 1 }, { key: 'faction:blackmere_council', min: 1 }], setsFlags: { c10_route_n1: true }, adjustsValues: { conviction_duty: 1 }, result: 'The assembly and the council stand together. A shared annual register binds one oath-run into law each season.', resultEs: 'La asamblea y el consecho se mantienen juntos. Un registro anual compartido ata una carrera de juramentos a la ley cada estación.' },
      { id: 'c10_route_n2', label: 'Olen anchor — the new concord on the opened Vault', labelEs: 'Ancla Olen — el nuevo concordato sobre la Bóveda abierta', nextNodeId: 'c10_end_new_concord', requires: [{ flag: 'canon:c08_verdict_reform' }, { flag: 'canon:c05_registry_governed' }, { flag: 'canon:c02_map_shared', equals: false }, { flag: 'canon:c06_vault_opened' }], requiresValues: [{ key: 'bond:olen', min: 1 }], setsFlags: { c10_route_n2: true }, adjustsValues: { conviction_duty: 1 }, result: 'Olen anchors the concord on the opened Vault. The map she never shared is written into law another way.', resultEs: 'Olen ancla el concordato sobre la Bóveda abierta. El mapa que nunca compartió se escribe en la ley de otra forma.' },
      { id: 'c10_trust_back', label: 'Step back to the assembly', labelEs: 'Volver a la asamblea', nextNodeId: 'c10_hand_assembly', result: 'You step back. The hand of trust waits.', resultEs: 'Retrocedes. La mano de la confianza espera.' },
    ],
  },

  c10_hand_carry: {
    id: 'c10_hand_carry', kind: 'beat', locationId: 'c10_threshold', externalEntry: true,
    title: 'The Hand of Carry', titleEs: 'La mano de la carga',
    text: 'The court hung — one living person carries the final price.\n\nThe Guardian pair comes first: a martyr from the last road with a bond deep enough, or the sealed-door lane where no legendary bearer exists. Then the Veil pair: the redactors on sold bells and a Voss file, or the selfbound on a broken wall and a mastered Vault. The history behind you picks the route; the hand only opens the door.',
    textEs: 'La corte se suspendió — una persona viva carga el precio final.\n\nEl par del Guardián viene primero: un martirio del último camino con un vínculo bastante profundo, o el camino de la puerta sellada donde no existe un portador legendario. Luego el par del Velo: los redactores sobre campanas vendidas y un expediente de Voss, o el autoligado sobre un muro roto y una Bóveda dominada. La historia detrás de ti elige la ruta; la mano solo abre la puerta.',
    choices: [
      { id: 'c10_route_g1a', label: 'Varen carries the standard — the last guardian', labelEs: 'Varen lleva el estandarte — el último guardián', nextNodeId: 'c10_end_last_guardian', requires: [{ flag: 'canon:c08_verdict_hung' }, { flag: 'canon:c09_martyr' }, { flag: 'canon:c07_watchman_living' }], requiresValues: [{ key: 'bond:varen', min: 3 }], setsFlags: { c10_route_g1: true }, adjustsValues: { conviction_compassion: 1 }, result: 'Varen takes the standard. No one alive may learn his name again.', resultEs: 'Varen toma el estandarte. Nadie vivo podrá aprender su nombre de nuevo.' },
      { id: 'c10_route_g1b', label: 'Elara carries the standard — the last guardian', labelEs: 'Elara lleva el estandarte — el último guardián', nextNodeId: 'c10_end_last_guardian', requires: [{ flag: 'canon:c08_verdict_hung' }, { flag: 'canon:c09_martyr' }, { flag: 'canon:c07_watchman_living' }], requiresValues: [{ key: 'bond:elara', min: 3 }], setsFlags: { c10_route_g1: true }, adjustsValues: { conviction_compassion: 1 }, result: 'Elara takes the standard. No one alive may learn her name again.', resultEs: 'Elara toma el estandarte. Nadie vivo podrá aprender su nombre de nuevo.' },
      { id: 'c10_route_g2', label: 'The sealed-door lane — Martik stands as the last guardian', labelEs: 'El camino de la puerta sellada — Martik se mantiene como último guardián', nextNodeId: 'c10_end_last_guardian', requires: [{ flag: 'canon:c08_verdict_hung' }, { flag: 'canon:c09_martyr', equals: false }, { flag: 'canon:c01_door_sealed' }, { flag: 'canon:c07_wall_held' }, { flag: 'canon:c09_door_sealed' }], requiresValues: [{ key: 'bond:martik', min: 2 }], setsFlags: { c10_route_g2: true }, adjustsValues: { conviction_duty: 1 }, result: 'The sealed-door lane. Martik holds the standard where no legendary bearer exists.', resultEs: 'El camino de la puerta sellada. Martik sostiene el estandarte donde no existe un portador legendario.' },
      { id: 'c10_route_v1', label: 'The redactors take the memory-keep — the veil ascendant', labelEs: 'Los redactores toman la memoria — el velo ascendente', nextNodeId: 'c10_end_veil_ascendant', requires: [{ flag: 'canon:c08_verdict_hung' }, { flag: 'canon:c04_selfbound', equals: false }, { flag: 'canon:c03_bells_sold' }, { flag: 'canon:c05_voss_file' }], requiresValues: [{ key: 'faction:veiled_court', min: 2 }], setsFlags: { c10_route_v1: true }, adjustsValues: { conviction_duty: 1 }, result: 'The redactors take the compiled memory-keep. Each generation pays the memory of its promises.', resultEs: 'Los redactores toman la memoria compilada. Cada generación paga la memoria de sus promesas.' },
      { id: 'c10_route_v2', label: 'The selfbound on the broken wall — the veil ascendant', labelEs: 'El autoligado sobre el muro roto — el velo ascendente', nextNodeId: 'c10_end_veil_ascendant', requires: [{ flag: 'canon:c08_verdict_hung' }, { flag: 'canon:c04_selfbound' }, { flag: 'canon:c07_wall_broken' }, { flag: 'canon:c06_vault_mastered' }], setsFlags: { c10_route_v2: true }, adjustsValues: { conviction_truth: 1 }, result: 'The selfbound name and the mastered Vault. The veil takes the memory-keep.', resultEs: 'El nombre autoligado y la Bóveda dominada. El velo toma la memoria.' },
      { id: 'c10_carry_back', label: 'Step back to the assembly', labelEs: 'Volver a la asamblea', nextNodeId: 'c10_hand_assembly', result: 'You step back. The hand of carry waits.', resultEs: 'Retrocedes. La mano de la carga espera.' },
    ],
  },

  c10_hand_break: {
    id: 'c10_hand_break', kind: 'beat', locationId: 'c10_threshold', externalEntry: true,
    title: 'The Hand of Break', titleEs: 'La mano de la ruptura',
    text: 'The court dissolved the pact — no vessel of privilege; the terms end.\n\nThe Decentralized pair comes first: the ash seed with a wall held and free witnesses, or the opened Vault with freed names. Then the Unbound pair: the map burned with a stranded Vault, or the registry free with a broken wall. The history behind you picks the route; the hand only opens the door.',
    textEs: 'La corte disolvió el pacto — sin vasija de privilegio; los términos terminan.\n\nEl par Descentralizado viene primero: la semilla de ceniza con un muro resistido y testigos libres, o la Bóveda abierta con nombres liberados. Luego el par Liberado: el mapa quemado con una Bóveda varada, o el registro libre con un muro roto. La historia detrás de ti elige la ruta; la mano solo abre la puerta.',
    choices: [
      { id: 'c10_route_d1', label: 'The ash seed and the free witnesses — decentralized oaths', labelEs: 'La semilla de ceniza y los testigos libres — juramentos descentralizados', nextNodeId: 'c10_end_decentralized_oaths', requires: [{ flag: 'canon:c08_verdict_dissolved' }, { flag: 'canon:c02_ash_seed' }, { flag: 'canon:c07_wall_held' }], requiresValues: [{ key: 'faction:free_witnesses', min: 1 }], setsFlags: { c10_route_d1: true }, adjustsValues: { conviction_freedom: 1 }, result: 'The free witnesses take the ash seed. Each community shoulders its own fraction forever.', resultEs: 'Los testigos libres toman la semilla de ceniza. Cada comunidad carga su propia fracción para siempre.' },
      { id: 'c10_route_d2', label: 'The opened Vault and the freed names — decentralized oaths', labelEs: 'La Bóveda abierta y los nombres liberados — juramentos descentralizados', nextNodeId: 'c10_end_decentralized_oaths', requires: [{ flag: 'canon:c08_verdict_dissolved' }, { flag: 'canon:c02_ash_seed', equals: false }, { flag: 'canon:c06_vault_opened' }, { flag: 'canon:c04_name_free' }], setsFlags: { c10_route_d2: true }, adjustsValues: { conviction_freedom: 1 }, result: 'The opened Vault and the freed names. Each community shoulders its own fraction forever.', resultEs: 'La Bóveda abierta y los nombres liberados. Cada comunidad carga su propia fracción para siempre.' },
      { id: 'c10_route_u1', label: 'The map burned and the stranded Vault — the unbound world', labelEs: 'El mapa quemado y la Bóveda varada — el mundo sin ataduras', nextNodeId: 'c10_end_unbound_world', requires: [{ flag: 'canon:c08_verdict_dissolved' }, { flag: 'canon:c02_ash_seed', equals: false }, { flag: 'canon:c06_vault_opened', equals: false }, { flag: 'canon:c02_map_burned' }, { flag: 'canon:c06_vault_stranded' }], setsFlags: { c10_route_u1: true }, adjustsValues: { conviction_freedom: 1 }, result: 'The map burned and the Vault stranded. Every promise is paid once, all at once, on one austerity night.', resultEs: 'El mapa quemado y la Bóveda varada. Cada promesa se paga una vez, toda a la vez, en una noche de austeridad.' },
      { id: 'c10_route_u2', label: 'The registry free and the broken wall — the unbound world', labelEs: 'El registro libre y el muro roto — el mundo sin ataduras', nextNodeId: 'c10_end_unbound_world', requires: [{ flag: 'canon:c08_verdict_dissolved' }, { flag: 'canon:c02_ash_seed', equals: false }, { flag: 'canon:c06_vault_opened', equals: false }, { flag: 'canon:c02_map_burned', equals: false }, { flag: 'canon:c05_registry_free' }, { flag: 'canon:c07_wall_broken' }], setsFlags: { c10_route_u2: true }, adjustsValues: { conviction_freedom: 1 }, result: 'The registry free and the wall broken. Every promise is paid once, all at once, on one austerity night.', resultEs: 'El registro libre y el muro roto. Cada promesa se paga una vez, toda a la vez, en una noche de austeridad.' },
      { id: 'c10_break_back', label: 'Step back to the assembly', labelEs: 'Volver a la asamblea', nextNodeId: 'c10_hand_assembly', result: 'You step back. The hand of break waits.', resultEs: 'Retrocedes. La mano de la ruptura espera.' },
    ],
  },

  c10_end_new_concord: {
    id: 'c10_end_new_concord', kind: 'ending', terminal: true, choices: [],
    title: 'The New Concord', titleEs: 'El Nuevo Concordato',
    text: 'The Concord assembly of all eight factions becomes the witness, and the shared annual register becomes the vessel. Every faction cedes its sovereign secrecy, and one confirmed oath-run is bound into law each season. The Tenth Door closes on a world that keeps its promises in the open, season by season, and no single vessel holds the whole. The campaign ends on a concord.',
    textEs: 'La asamblea del concordato de las ocho facciones se vuelve el testigo, y el registro anual compartido se vuelve la vasija. Cada facción cede su secreto soberano, y una carrera de juramentos confirmada se ata a la ley cada estación. La décima puerta se cierra sobre un mundo que guarda sus promesas en público, estación tras estación, y ninguna vasija sola sostiene el todo. La campaña termina en un concordato.',
    globalEndingId: 'new_concord', outcome: 'success', survivors: ['c10_clerk', 'c10_spokesperson'], casualties: [],
  },

  c10_end_last_guardian: {
    id: 'c10_end_last_guardian', kind: 'ending', terminal: true, choices: [],
    title: 'The Last Guardian', titleEs: 'El Último Guardián',
    text: 'One living Guardian becomes the witness, and the body and standard of the bearer become the vessel. No one alive may learn the Guardian name again. The Tenth Door closes on a world guarded by a single name no one speaks, and the price is the silence around that name for as long as the world stands. The campaign ends on a keeper.',
    textEs: 'Un Guardián vivo se vuelve el testigo, y el cuerpo y estandarte del portador se vuelven la vasija. Nadie vivo podrá aprender el nombre del Guardián de nuevo. La décima puerta se cierra sobre un mundo guardado por un solo nombre que nadie pronuncia, y el precio es el silencio alrededor de ese nombre mientras el mundo se sostenga. La campaña termina en un guardián.',
    globalEndingId: 'last_guardian', outcome: 'success', survivors: ['c10_guardian'], casualties: [],
  },

  c10_end_unbound_world: {
    id: 'c10_end_unbound_world', kind: 'ending', terminal: true, choices: [],
    title: 'The Unbound World', titleEs: 'El Mundo sin Ataduras',
    text: 'No witness and no vessel. Every promise is paid once, all at once, on one austerity night. The Tenth Door closes on a world unbound, where the tally the campaign carried settles in a single settling and nothing is carried forward. The price is the night itself, and the morning after it is a world that owes nothing and guards nothing. The campaign ends on a clean slate.',
    textEs: 'Sin testigo y sin vasija. Cada promesa se paga una vez, toda a la vez, en una noche de austeridad. La décima puerta se cierra sobre un mundo sin ataduras, donde la suma que la campaña llevó se salda en un solo saldar y nada se lleva hacia adelante. El precio es la noche misma, y la mañana después es un mundo que no debe nada y no guarda nada. La campaña termina empezando de cero.',
    globalEndingId: 'unbound_world', outcome: 'ambiguous', survivors: ['c10_spokesperson'], casualties: [],
  },

  c10_end_veil_ascendant: {
    id: 'c10_end_veil_ascendant', kind: 'ending', terminal: true, choices: [],
    title: 'The Veil Ascendant', titleEs: 'El Velo Ascendente',
    text: 'The Veiled Court and its redactors become the witness, and the compiled memory-keep becomes the vessel. Each generation pays the memory of its promises. The Tenth Door closes on a world where the veil keeps the bookkeeping in redacted silence, and the price is the memory each generation owes and pays. The campaign ends on a court that remembers.',
    textEs: 'La Corte del Velo y sus redactores se vuelven el testigo, y la memoria compilada se vuelve la vasija. Cada generación paga la memoria de sus promesas. La décima puerta se cierra sobre un mundo donde el velo guarda la contabilidad en silencio redactado, y el precio es la memoria que cada generación debe y paga. La campaña termina en una corte que recuerda.',
    globalEndingId: 'veil_ascendant', outcome: 'ambiguous', survivors: ['c10_redactor'], casualties: [],
  },

  c10_end_court_restored: {
    id: 'c10_end_court_restored', kind: 'ending', terminal: true, choices: [],
    title: 'The Court Restored', titleEs: 'La Corte Restaurada',
    text: 'The Veiled Court, restored, becomes the witness, and the re-bound pact seal becomes the vessel. The court re-accepts the bookkeeping and one keeper silence each year. The Tenth Door closes on a world where the old compact is mended and the court holds the seal in trust, and the price is the annual silence of one keeper. The campaign ends on a mended vessel.',
    textEs: 'La Corte del Velo, restaurada, se vuelve el testigo, y el sello del pacto reenganchado se vuelve la vasija. La corte reacepta la contabilidad y un silencio del guardián cada año. La décima puerta se cierra sobre un mundo donde el pacto antiguo está reparado y la corte guarda el sello en fideicomiso, y el precio es el silencio anual de un guardián. La campaña termina en una vasija reparada.',
    globalEndingId: 'court_restored', outcome: 'success', survivors: ['c10_clerk', 'c10_redactor'], casualties: [],
  },

  c10_end_decentralized_oaths: {
    id: 'c10_end_decentralized_oaths', kind: 'ending', terminal: true, choices: [],
    title: 'The Decentralized Oaths', titleEs: 'Los Juramentos Descentralizados',
    text: 'Every community becomes its own witness, and each community\'s own small vessel — a well, a bell, a ledger — becomes the vessel. Each community shoulders its own fraction forever. The Tenth Door closes on a world where no single keeper holds the whole, and the price is the fraction every community carries for as long as it stands. The campaign ends on a world of small vessels.',
    textEs: 'Cada comunidad se vuelve su propio testigo, y la vasija pequeña de cada comunidad — un pozo, una campana, un registro — se vuelve la vasija. Cada comunidad carga su propia fracción para siempre. La décima puerta se cierra sobre un mundo donde ningún guardián solo sostiene el todo, y el precio es la fracción que cada comunidad carga mientras se sostenga. La campaña termina en un mundo de vasijas pequeñas.',
    globalEndingId: 'decentralized_oaths', outcome: 'success', survivors: ['c10_spokesperson', 'c10_guardian'], casualties: [],
  },
};

// ---- World ---------------------------------------------------

const LOCATIONS: Record<string, WorldLocation> = {
  c10_ante_threshold: {
    id: 'c10_ante_threshold', name: 'The Ante-Threshold', nameEs: 'El ante-umbral',
    description: 'The floor of the last door, where the Council of Witnesses mirrors every bond. The three representatives wait at its edges.',
    descriptionEs: 'El suelo de la última puerta, donde el Consejo de Testigos refleja cada vínculo. Los tres representantes esperan en sus bordes.',
    connections: ['c10_gallery', 'c10_well', 'c10_seal_chamber', 'c10_threshold'],
    objects: [{ id: 'c10_council_ring', name: 'The Council Ring', nameEs: 'El anillo del consejo', description: 'A ring of three benches where the Assembly clerk, the living guardian, and the Free spokesperson sit.', descriptionEs: 'Un anillo de tres bancos donde se sientan el secretario de la Asamblea, el guardián vivo y el portavoz libre.', interactable: true, broken: false, hidden: false }],
    npcs: ['c10_clerk', 'c10_guardian', 'c10_spokesperson'], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'throne',
  },
  c10_gallery: {
    id: 'c10_gallery', name: 'The Archive-Gallery', nameEs: 'La galería del archivo',
    description: 'Silent stacks of precedent oaths filed in the second ink. A reading desk at the end holds the riddle of the name.',
    descriptionEs: 'Estanterías silenciosas de juramentos precedentes archivados en la segunda tinta. Un atril al final guarda el enigma del nombre.',
    connections: ['c10_ante_threshold'],
    objects: [{ id: 'c10_reading_desk', name: 'The Reading Desk', nameEs: 'El atril', description: 'A desk holding the riddle the Door set on its own name, written in the second ink.', descriptionEs: 'Un atril que guarda el enigma que la puerta puso sobre su propio nombre, escrito en la segunda tinta.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'library',
  },
  c10_well: {
    id: 'c10_well', name: 'The Witnessing-Well', nameEs: 'El pozo del testimonio',
    description: 'A well of living testimony where the crowd presses its human proof of the verdict upward. A rail looks down into it.',
    descriptionEs: 'Un pozo de testimonio vivo donde la multitud empuja su prueba humana del veredicto hacia arriba. Una barandilla mira hacia abajo.',
    connections: ['c10_ante_threshold'],
    objects: [{ id: 'c10_well_rail', name: 'The Well Rail', nameEs: 'La barandilla del pozo', description: 'A rail over the witnessing-well, where every bond the campaign accrued looks back up.', descriptionEs: 'Una barandilla sobre el pozo del testimonio, donde cada vínculo que la campaña acumuló mira hacia arriba.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'temple',
  },
  c10_seal_chamber: {
    id: 'c10_seal_chamber', name: 'The Forged-Seal Chamber', nameEs: 'La cámara del sello forjado',
    description: 'The danger branch, where the old seal integrity is broken or repaired. A seal-bench holds three inner bolts over a well of black water.',
    descriptionEs: 'La rama del peligro, donde la integridad del sello antiguo se rompe o se repara. Un banco del sello sostiene tres cerrojos interiores sobre un pozo de agua negra.',
    connections: ['c10_ante_threshold'],
    objects: [{ id: 'c10_inner_seal', name: 'The Inner Seal', nameEs: 'El sello interior', description: 'Three inner bolts — eye, bowl, falling hand — hold the last seal of the Tenth Door in black water.', descriptionEs: 'Tres cerrojos interiores — ojo, cuenco, mano que cae — sostienen el último sello de la décima puerta en agua negra.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 3, discovered: true, secrets: [], ambiance: 'crypt',
  },
  c10_threshold: {
    id: 'c10_threshold', name: 'The Threshold of the Tenth Door', nameEs: 'El umbral de la décima puerta',
    description: 'The last stone of the door, where the Reckoning of Oaths is sent and the three hands wait. The Thief of Names hunts here.',
    descriptionEs: 'La última piedra de la puerta, donde se envía el ajuste de cuentas de los juramentos y esperan las tres manos. El Ladrón de Nombres caza aquí.',
    connections: ['c10_ante_threshold'],
    objects: [{ id: 'c10_last_stone', name: 'The Last Stone', nameEs: 'La última piedra', description: 'The last stone before the door closes. The three hands wait on it.', descriptionEs: 'La última piedra antes de que la puerta se cierre. Las tres manos esperan en ella.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: ['c10_thief_of_names'], dangerLevel: 5, discovered: true, secrets: [], ambiance: 'boss',
  },
};

const NPCS: Record<string, NPC> = {
  c10_clerk: {
    id: 'c10_clerk', name: 'The Assembly Clerk', nameEs: 'El secretario de la Asamblea', portrait: 'scholar', faction: 'iron_parliament', location: 'c10_ante_threshold', disposition: 0,
    knowledge: ['the_precedent', 'the_name', 'the_concord'],
    memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'The clerk counts the assembled factions. "An institution can witness what no single person can hold. Trust it, and the seal keeps a keeper in law."', textEs: 'El secretario cuenta las facciones reunidas. «Una institución puede testificar lo que ninguna persona sola puede sostener. Confía en ella, y el sello guarda un guardián en la ley».', responses: [{ text: 'I will hear it.', textEs: 'Lo oiré.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Clerk', occupationEs: 'Secretario', secrets: [], secretsEs: [], personality: 'precise', personalityEs: 'preciso',
  },
  c10_guardian: {
    id: 'c10_guardian', name: 'The Living Guardian', nameEs: 'El guardián vivo', portrait: 'warrior', faction: 'veiled_court', location: 'c10_ante_threshold', disposition: 0,
    knowledge: ['the_standard', 'the_price', 'the_silence'],
    memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'The guardian holds the standard low. "One living person can carry what no institution will. Carry it, and the name goes silent with the bearer."', textEs: 'El guardián sostiene el estandarte bajo. «Una persona viva puede cargar lo que ninguna institución cargará. Cárgalo, y el nombre se silencia con el portador».', responses: [{ text: 'I will hear it.', textEs: 'Lo oiré.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Guardian', occupationEs: 'Guardián', secrets: [], secretsEs: [], personality: 'resolute', personalityEs: 'resolutó',
  },
  c10_spokesperson: {
    id: 'c10_spokesperson', name: 'The Free Spokesperson', nameEs: 'El portavoz libre', portrait: 'villager', faction: 'free_witnesses', location: 'c10_ante_threshold', disposition: 0,
    knowledge: ['the_fraction', 'the_well', 'the_bell'],
    memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'The spokesperson speaks for the free witnesses. "Let every community shoulder its own fraction. Break the single vessel, and the tally scatters into wells and bells and ledgers."', textEs: 'El portavoz habla por los testigos libres. «Deja que cada comunidad cargue su propia fracción. Rompe la vasija única, y la suma se esparce en pozos y campanas y registros».', responses: [{ text: 'I will hear it.', textEs: 'Lo oiré.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Spokesperson', occupationEs: 'Portavoz', secrets: [], secretsEs: [], personality: 'plain', personalityEs: 'sencillo',
  },
};

const MONSTERS: Record<string, Omit<Enemy, 'id'>> = {
  c10_thief_of_names: {
    templateId: 'c10_thief_of_names', name: 'The Thief of Names', nameEs: 'El Ladrón de Nombres', portrait: 'wraith', hp: 40, maxHp: 40, ac: 17, attack: 10, damage: '3d6', damageType: 'psychic', abilities: ['Steal a Shape', 'Witness Memory', 'Concentration Break'], abilitiesEs: ['Robar una forma', 'Memoria de testigo', 'Romper la concentración'], xpValue: 500, loot: [], intelligence: 14, morale: 100, conditions: [],
  },
};

const QUESTS: Record<string, Quest> = {
  c10_the_tenth_door: {
    id: 'c10_the_tenth_door', name: 'The Tenth Door', nameEs: 'La décima puerta', description: 'Close the Tenth Door on one of six final commitments — who witnesses, who keeps the vessel, who pays the price.', descriptionEs: 'Cierra la décima puerta sobre uno de seis compromisos finales — quién testifica, quién guarda la vasija, quién paga el precio.', state: 'active', isMain: true,
    objectives: [
      { id: 'c10_pledge', description: 'Make the first pledge', descriptionEs: 'Hacer el primer compromiso', completed: false, current: 0, required: 1 },
      { id: 'c10_close', description: 'Close the door on a hand', descriptionEs: 'Cerrar la puerta sobre una mano', completed: false, current: 0, required: 1 },
    ],
    rewards: [{ type: 'xp', value: 500 }],
  },
};

export const CHAPTER_TEN: Chapter = {
  id: 'chapter-10', index: 10,
  title: 'The Tenth Door', titleEs: 'La décima puerta',
  premise: 'Behind the court seal, the Door — the very name this campaign has carried — opens one last time; three final commitments close a world: who will witness its oaths, who will keep the vessel, and who will pay the price.',
  premiseEs: 'Tras el sello de la corte, la puerta — el nombre que esta campaña ha llevado — se abre por última vez; tres últimas decisiones cierran un mundo: quién será testigo de sus juramentos, quién guardará la vasija, y quién pagará el precio.',
  intro: [
    { type: 'system', text: 'CHAPTER X — THE TENTH DOOR', textEs: 'CAPÍTULO X — LA DÉCIMA PUERTA', mood: 'mystery' },
    { type: 'narration', text: '{name} descends onto the Tenth Door with the whole company. The Door is the very name this campaign has carried, and three final commitments close a world — who will witness its oaths, who will keep the vessel, who will pay the price. The selector is total: one of six endings, decided by the whole campaign behind you, never by a single lean.', textEs: '{name} desciende a la décima puerta con toda la compañía. La puerta es el propio nombre que esta campaña ha llevado, y tres compromisos finales cierran un mundo — quién será testigo de sus juramentos, quién guardará la vasija, quién pagará el precio. El selector es total: uno de seis finales, decidido por toda la campaña detrás de ti, nunca por una sola inclinación.', mood: 'mystery' },
    { type: 'system', text: 'CURRENT OBJECTIVE — Make the first pledge, send the reckoning, and close the door on a hand.', textEs: 'OBJETIVO ACTUAL — Haz el primer compromiso, envía el ajuste de cuentas y cierra la puerta sobre una mano.', mood: 'neutral' },
  ],
  startNodeId: 'c10_start', startLocationId: 'c10_ante_threshold',
  nodes: NODES,
  puzzles: { c10_name_riddle: NAME_RIDDLE, c10_last_mechanism: LAST_MECHANISM },
  locations: LOCATIONS, npcs: NPCS, monsters: MONSTERS, quests: QUESTS,
  mainQuestId: 'c10_the_tenth_door',
  hooks: { bossLocationId: 'c10_threshold', aftermathNodeId: 'c10_thief_aftermath' },
  storyFacts: [
    { flag: 'c10_lean_trust', en: 'The first pledge leaned to the Assembly clerk', es: 'El primer compromiso se inclinó al secretario de la Asamblea' },
    { flag: 'c10_lean_carry', en: 'The first pledge leaned to the living guardian', es: 'El primer compromiso se inclinó al guardián vivo' },
    { flag: 'c10_lean_break', en: 'The first pledge leaned to the Free spokesperson', es: 'El primer compromiso se inclinó al portavoz libre' },
    { flag: 'c10_name_known', en: 'The name of the Door was recovered in the gallery', es: 'El nombre de la puerta fue recuperado en la galería' },
    { flag: 'c10_seal_aligned', en: 'The inner bolts were turned in the right order', es: 'Los cerrojos interiores fueron girados en el orden correcto' },
    { flag: 'c10_testimony_heard', en: 'The living testimony was heard at the well', es: 'El testimonio vivo fue oído en el pozo' },
    { flag: 'c10_reckoning_dissolved', en: 'The reckoning was dissolved without a blow', es: 'El ajuste de cuentas fue disuelto sin un golpe' },
    { flag: 'c10_thief_faced', en: 'The Thief of Names was fought at the threshold', es: 'El Ladrón de Nombres fue combatido en el umbral' },
  ],
  suggestions: {
    c10_ante_threshold: [
      { label: 'Go to the archive-gallery', labelEs: 'Ir a la galería del archivo', action: 'go to the archive gallery' },
      { label: 'Go to the witnessing-well', labelEs: 'Ir al pozo del testimonio', action: 'go to the witnessing well' },
      { label: 'Go to the forged-seal chamber', labelEs: 'Ir a la cámara del sello forjado', action: 'go to the forged seal chamber' },
      { label: 'Go to the threshold', labelEs: 'Ir al umbral', action: 'go to the threshold' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c10_gallery: [{ label: 'Return to the ante-threshold', labelEs: 'Volver al ante-umbral', action: 'go to the ante threshold' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c10_well: [{ label: 'Return to the ante-threshold', labelEs: 'Volver al ante-umbral', action: 'go to the ante threshold' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c10_seal_chamber: [{ label: 'Return to the ante-threshold', labelEs: 'Volver al ante-umbral', action: 'go to the ante threshold' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c10_threshold: [{ label: 'Return to the ante-threshold', labelEs: 'Volver al ante-umbral', action: 'go to the ante threshold' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
  },
  externalEntrySeeds: {
    c10_hand_trust: [
      { 'canon:c08_verdict_vindicated': true, 'canon:c04_name_returned': true, 'canon:c05_registry_governed': true },
      { 'canon:c08_verdict_vindicated': true, 'canon:c04_name_returned': false, 'canon:c08_evidence_majority': true },
      { 'canon:c08_verdict_reform': true, 'canon:c05_registry_governed': true, 'canon:c02_map_shared': true },
      { 'canon:c08_verdict_reform': true, 'canon:c05_registry_governed': true, 'canon:c02_map_shared': false, 'canon:c06_vault_opened': true },
    ],
    c10_hand_carry: [
      { 'canon:c08_verdict_hung': true, 'canon:c09_martyr': true, 'canon:c07_watchman_living': true },
      { 'canon:c08_verdict_hung': true, 'canon:c09_martyr': false, 'canon:c01_door_sealed': true, 'canon:c07_wall_held': true, 'canon:c09_door_sealed': true },
      { 'canon:c08_verdict_hung': true, 'canon:c04_selfbound': false, 'canon:c03_bells_sold': true, 'canon:c05_voss_file': true },
      { 'canon:c08_verdict_hung': true, 'canon:c04_selfbound': true, 'canon:c07_wall_broken': true, 'canon:c06_vault_mastered': true },
    ],
    c10_hand_break: [
      { 'canon:c08_verdict_dissolved': true, 'canon:c02_ash_seed': true, 'canon:c07_wall_held': true },
      { 'canon:c08_verdict_dissolved': true, 'canon:c02_ash_seed': false, 'canon:c06_vault_opened': true, 'canon:c04_name_free': true },
      { 'canon:c08_verdict_dissolved': true, 'canon:c02_ash_seed': false, 'canon:c06_vault_opened': false, 'canon:c02_map_burned': true, 'canon:c06_vault_stranded': true },
      { 'canon:c08_verdict_dissolved': true, 'canon:c02_ash_seed': false, 'canon:c06_vault_opened': false, 'canon:c02_map_burned': false, 'canon:c05_registry_free': true, 'canon:c07_wall_broken': true },
    ],
    c10_thief_aftermath: [
      { c10_thief_faced: true },
      { c10_reckoning_dissolved: true },
    ],
  },
  summaryFlags: [
    'c10_lean_trust', 'c10_lean_carry', 'c10_lean_break',
    'c10_name_known', 'c10_seal_aligned', 'c10_testimony_heard',
    'c10_reckoning_dissolved', 'c10_thief_faced',
  ],
};
