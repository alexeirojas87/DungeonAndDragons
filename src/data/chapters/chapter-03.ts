// ============================================================
// CHAPTER III — The City of Silent Bells
// La ciudad de las campanas mudas
// Act I closer. In Syrva a promise once rang through a bell; now
// each bell is a cell of voices, and the keeper Vane holds one
// bell per stolen voice. Four local endings close the chapter.
// Self-contained authored data.
// ============================================================

import type { Chapter, StoryNode } from '../../engine/chapter';
import type { Puzzle } from '../../engine/puzzles';
import type { WorldLocation, NPC, Enemy, Quest } from '../../engine/types';

// ---- Puzzles -------------------------------------------------

const VOICE_SEQUENCE: Puzzle = {
  id: 'c03_voice_sequence',
  kind: 'mechanism',
  title: 'The Voice Sequence',
  titleEs: 'La secuencia de voces',
  prompt: 'Three bells hang in the tower keep, and each one held a stolen voice. Vane set them in an order only the voices remember — the order in which they were taken. Turn the bells in the order the city paid them, and the tower opens onto the belfry.',
  promptEs: 'Tres campanas cuelgan en la torre, y cada una guardaba una voz robada. Vane las puso en un orden que solo las voces recuerdan — el orden en que fueron tomadas. Gira las campanas en el orden en que la ciudad las pagó, y la torre se abre al campanario.',
  hints: [
    { en: 'The first voice was a farmer\'s — the youngest bell, bright and thin.', es: 'La primera voz fue de un granjero — la campana más joven, brillante y delgada.' },
    { en: 'The last voice was a keeper\'s — the oldest bell, deep and slow.', es: 'La última voz fue de un guardián — la campana más vieja, grave y lenta.' },
  ],
  steps: ['c03_bell_young', 'c03_bell_middle', 'c03_bell_old'],
  ordered: true,
  stepLabels: [
    { id: 'c03_bell_young', label: 'Ring the young bell', labelEs: 'Tocar la campana joven' },
    { id: 'c03_bell_middle', label: 'Ring the middle bell', labelEs: 'Tocar la campana mediana' },
    { id: 'c03_bell_old', label: 'Ring the oldest bell', labelEs: 'Tocar la campana más vieja' },
  ],
  onWrongStep: { en: 'The bells clash and the tower goes silent. The voices will not answer in that order.', es: 'Las campanas se aturden y la torre queda en silencio. Las voces no responderán en ese orden.' },
  unlocks: { flags: { c03_voices_freed: true, 'canon:c03_evidence_bell': true } },
  solvedNodeId: 'c03_voice_solved',
  skipNodeId: 'c03_voice_skipped',
};

const FOUNDRY_CRATE: Puzzle = {
  id: 'c03_foundry_crate',
  kind: 'check',
  title: 'The Foundry Crate',
  titleEs: 'La caja de la fundición',
  prompt: 'The foundry keeps a crate of bells that never rang — bells cast for voices the city never collected. Among them is the crate that records which voice the city already paid for, and which it still owes. Read it and you will know what the foundry knows.',
  promptEs: 'La fundición guarda una caja de campanas que nunca sonaron — campanas fundidas para voces que la ciudad nunca cobró. Entre ellas está la caja que registra qué voz ya pagó la ciudad y cuál aún debe. Léela y sabrás lo que sabe la fundición.',
  hints: [
    { en: 'The crate is stamped with the same second ink that stained the chapel ledger and Olen\'s cargo ledger — the oath-bank is the same.', es: 'La caja lleva el sello de la misma segunda tinta que manchó el registro de la capilla y el de Olen — el registro de juramentos es el mismo.' },
    { en: 'The stamp on the lid matches the tally from the cargo ledger — three voices paid, one still owed.', es: 'El sello de la tapa coincide con el recuento del registro de carga — tres voces pagadas, una aún debida.' },
  ],
  skill: 'investigation',
  dc: 14,
  clues: [
    { id: 'c03_clue_second_ink', en: 'The same second ink that stained the chapel and cargo ledgers stains this crate — the oath-bank is continental.', es: 'La misma segunda tinta que manchó los registros de la capilla y la carga mancha también esta caja — el registro de juramentos es continental.', dcReduction: 3 },
    { id: 'c03_clue_voice_tally', en: 'The tally shows three voices paid and one owed — the city still owes a voice.', es: 'El recuento muestra tres voces pagadas y una debida — la ciudad aún debe una voz.', dcReduction: 2 },
  ],
  unlocks: { flags: { c03_foundry_evidence: true, 'canon:c03_evidence_bell': true } },
  solvedNodeId: 'c03_foundry_solved',
  skipNodeId: 'c03_foundry_skipped',
};

// ---- Nodes ---------------------------------------------------

const NODES: Record<string, StoryNode> = {
  c03_arrival: {
    id: 'c03_arrival', kind: 'beat', locationId: 'c03_syrva_gate', externalEntry: true,
    title: 'The Silent Gate', titleEs: 'La puerta muda',
    text: 'Syrva was a city of bells. Now every bell is mute, and every mute bell is a cell. Vane, the campanera, holds one bell per stolen voice. If you wait, an entire district goes silent forever.',
    textEs: 'Sirva era una ciudad de campanas. Ahora cada campana está muda, y cada campana muda es una celda. Vane, la campanera, guarda una campana por cada voz robada. Si te demoras, un distrito entero callará para siempre.',
    choices: [
      { id: 'c03_enter_gate', label: 'Enter the city through the silent gate', labelEs: 'Entrar en la ciudad por la puerta muda', nextNodeId: 'c03_silent_gate', result: 'You pass beneath the silent gate. The bells hang above you, dumb.', resultEs: 'Pasas bajo la puerta muda. Las campanas cuelgan encima, enmudecidas.' },
      { id: 'c03_recall_greta', label: 'Recall the voice the Drowned Door stole from Greta', labelEs: 'Recordar la voz que la Puerta Ahogada le robó a Greta', nextNodeId: 'c03_silent_gate', requires: [{ flag: 'canon:c01_greta_voice' }, { flag: 'canon:c01_rescue_oath' }], adjustsValues: { conviction_truth: 1, conviction_compassion: 1 }, result: 'You remember Greta\'s stolen voice — the one the Drowned Door took in Blackmere. It may answer a bell here.', resultEs: 'Recuerdas la voz robada de Greta — la que la Puerta Ahogada tomó en Blackmere. Puede responder a una campana aquí.' },
    ],
  },

  c03_silent_gate: {
    id: 'c03_silent_gate', kind: 'beat', locationId: 'c03_syrva_gate',
    title: 'The Oldest Bell', titleEs: 'La campana más vieja',
    text: 'At the center of the gate hangs the oldest bell in Syrva. Vane stands beneath it. "Every bell is a cell of voices," she says. "The oldest one held the first voice the city ever took. Break it, keep it, or sell it — the city will hear which you chose."',
    textEs: 'En el centro de la puerta cuelga la campana más vieja de Sirva. Vane está debajo. «Cada campana es una celda de voces», dice. «La más vieja guardaba la primera voz que la ciudad tomó. Rómpela, guárdala o véndela: la ciudad oirá cuál elegiste».',
    choices: [
      { id: 'c03_break_bell', label: 'Break the oldest bell', labelEs: 'Romper la campana más vieja', nextNodeId: 'c03_market_district', setsFlags: { c03_broke_bell: true }, adjustsValues: { faction_bellwardens: -1, conviction_freedom: 1 }, result: 'You strike the oldest bell. It cracks; a thin voice escapes and fades. Vane flinches.', resultEs: 'Golpeas la campana más vieja. Se agrieta; una voz delgada escapa y se desvanece. Vane se estremece.' },
      { id: 'c03_keep_bell', label: 'Keep the oldest bell whole', labelEs: 'Guardar la campana más vieja intacta', nextNodeId: 'c03_bell_tower', setsFlags: { c03_kept_bell: true }, adjustsValues: { faction_bellwardens: 1, conviction_duty: 1 }, result: 'You leave the bell whole. Vane nods; the tower keep opens to you.', resultEs: 'Dejas la campana intacta. Vane asiente; la torre se te abre.' },
      { id: 'c03_sell_bell', label: 'Sell the oldest bell to the foundry', labelEs: 'Vender la campana más vieja a la fundición', nextNodeId: 'c03_foundry', setsFlags: { c03_sold_bell: true }, adjustsValues: { faction_veiled_court: 1, conviction_freedom: 1 }, result: 'You carry the bell toward the foundry. Vane watches you go without speaking.', resultEs: 'Llevas la campana hacia la fundición. Vane te ve marchar sin hablar.' },
    ],
  },

  // ---- Market district branch ----
  c03_market_district: {
    id: 'c03_market_district', kind: 'beat', locationId: 'c03_market_district',
    title: 'The Market District', titleEs: 'El distrito del mercado',
    text: 'The market district is half-silent. Stalls that sold bells now sell silence — cloth, wax, earplugs. One stall-keeper remembers when the bells rang at noon. He tells you Vane took the voices one by one, starting with the youngest.',
    textEs: 'El distrito del mercado está medio en silencio. Los puestos que vendían campanas ahora venden silencio — tela, cera, tapones para los oídos. Un tendero recuerda cuando las campanas sonaban al mediodía. Te dice que Vane tomó las voces una por una, empezando por la más joven.',
    choices: [
      { id: 'c03_market_stalls', label: 'Search the stalls for the voice-tally', labelEs: 'Registrar los puestos en busca del recuento de voces', nextNodeId: 'c03_market_stalls', setsFlags: { c03_searched_market: true }, adjustsValues: { conviction_truth: 1 }, result: 'You search the stalls. One keeper has a tally of the voices Vane took.', resultEs: 'Registras los puestos. Un tendero tiene un recuento de las voces que Vane tomó.' },
    ],
  },

  c03_market_stalls: {
    id: 'c03_market_stalls', kind: 'beat',
    title: 'The Voice Tally', titleEs: 'El recuento de voces',
    text: 'The tally is stamped with the same second ink that stained the chapel ledger and Olen\'s cargo manifest — the oath-bank is the same. Three voices were paid from this city: a farmer, a keeper, and a child. One is still owed. The city pays the Door with voices, and Vane is the collector.',
    textEs: 'El recuento lleva el sello de la misma segunda tinta que manchó el registro de la capilla y el manifiesto de Olen — el registro de juramentos es el mismo. Tres voces se pagaron desde esta ciudad: un granjero, un guardián y un niño. Una aún se debe. La ciudad paga a la Puerta con voces, y Vane es la cobradora.',
    choices: [
      { id: 'c03_stalls_to_reveal', label: 'Bring the tally to the bell-tower', labelEs: 'Llevar el recuento a la torre', nextNodeId: 'c03_vane_reveal', setsFlags: { c03_market_tally: true }, adjustsValues: { conviction_truth: 2 }, result: 'You carry the tally toward the bell-tower. The evidence is in your hands.', resultEs: 'Llevas el recuento hacia la torre. La prueba está en tus manos.' },
    ],
  },

  // ---- Bell-tower keep branch ----
  c03_bell_tower: {
    id: 'c03_bell_tower', kind: 'beat', locationId: 'c03_bell_tower',
    title: 'The Bell-Tower Keep', titleEs: 'La torre de las campanas',
    text: 'The bell-tower keep is a spiral of stone and iron. Three bells hang in the lower chamber, each one holding a stolen voice. Vane waits at the top of the stair.\n\n"The voices are the city\'s payment to the Door," she says. "I hold one bell per stolen voice. Ring them in the order they were taken, and the tower opens onto the belfry — and the truth."',
    textEs: 'La torre de las campanas es una espiral de piedra y hierro. Tres campanas cuelgan en la cámara inferior, y cada una encierra una voz robada. Vane espera en lo alto de la escalera.\n\n«Las voces son el pago de la ciudad a la Puerta», dice. «Guardo una campana por cada voz robada. Tócalas en el orden en que fueron tomadas, y la torre se abrirá al campanario — y a la verdad».',
    choices: [
      { id: 'c03_climb_tower', label: 'Climb to the three-bell chamber', labelEs: 'Subir a la cámara de las tres campanas', nextNodeId: 'c03_tower_keep', result: 'You climb the spiral stair. The bells hang above.', resultEs: 'Subes la escalera en espiral. Las campanas cuelgan arriba.' },
    ],
  },

  c03_tower_keep: {
    id: 'c03_tower_keep', kind: 'beat', locationId: 'c03_bell_chamber',
    title: 'The Three Bells', titleEs: 'Las tres campanas',
    text: 'Three bells hang in the keep: the young bell, bright and thin; the middle bell, steady and plain; and the oldest, deep and slow. Vane watches from the top of the stair.\n\n"Ring them in the order the city paid them," she says, "and the belfry opens."',
    textEs: 'Tres campanas cuelgan en la torre: la joven, brillante y delgada; la mediana, firme y sencilla; y la más vieja, grave y lenta. Vane observa desde lo alto de la escalera.\n\n«Tócalas en el orden en que la ciudad las pagó», dice, «y el campanario se abrirá».',
    choices: [
      { id: 'c03_ring_bells', label: 'Ring the three bells in order', labelEs: 'Tocar las tres campanas en orden', nextNodeId: 'c03_puzzle_voice', setsFlags: { c03_attempted_sequence: true }, result: 'You approach the three bells. The order is the question.', resultEs: 'Te acercas a las tres campanas. El orden es la cuestión.' },
    ],
  },

  c03_puzzle_voice: {
    id: 'c03_puzzle_voice', kind: 'puzzle', puzzleId: 'c03_voice_sequence',
    title: 'The Voice Sequence', titleEs: 'La secuencia de voces',
    text: 'The three bells wait. Young, middle, old — in the order the city paid them.',
    textEs: 'Las tres campanas esperan. Joven, mediana, vieja — en el orden en que la ciudad las pagó.',
    choices: [],
  },

  c03_voice_solved: {
    id: 'c03_voice_solved', kind: 'beat',
    title: 'The Belfry Opens', titleEs: 'El campanario se abre',
    text: 'The third bell rings true. The belfry opens above you, and the voices the bells held spill back into the air — thin, but alive. Vane lowers her head.\n\n"You rang them in the order they were taken," she says. "Now the belfry is yours. The district may ring again — or it may not. That is the choice the city always makes."',
    textEs: 'La tercera campana suena verdadera. El campanario se abre sobre ti, y las voces que las campanas guardaban vuelven al aire — delgadas, pero vivas. Vane baja la cabeza.\n\n«Las tocaste en el orden en que fueron tomadas», dice. «Ahora el campanario es tuyo. El distrito puede volver a sonar — o no. Esa es la elección que la ciudad siempre hace».',
    choices: [
      { id: 'c03_voice_to_reveal', label: 'Climb to the belfry', labelEs: 'Subir al campanario', nextNodeId: 'c03_vane_reveal', setsFlags: { c03_voices_freed: true, 'canon:c03_evidence_bell': true }, adjustsValues: { conviction_compassion: 2 }, result: 'You climb into the belfry. The freed voices circle the tower.', resultEs: 'Subes al campanario. Las voces liberadas rodean la torre.' },
    ],
  },

  c03_voice_skipped: {
    id: 'c03_voice_skipped', kind: 'beat',
    title: 'The Bells Left Unrung', titleEs: 'Las campanas sin tocar',
    text: 'You leave the bells unrung. The voices stay sealed in iron.\n\nVane watches you descend. "The district will go silent," she says. "It always does, when no one rings the bells."',
    textEs: 'Dejas las campanas sin tocar. Las voces siguen selladas en hierro.\n\nVane te ve bajar. «El distrito quedará mudo», dice. «Siempre pasa, cuando nadie toca las campanas».',
    choices: [
      { id: 'c03_voice_skip_to_reveal', label: 'Descend to the gate', labelEs: 'Bajar a la puerta', nextNodeId: 'c03_vane_reveal', result: 'You leave the bells and descend to the gate.', resultEs: 'Dejas las campanas y bajas a la puerta.' },
    ],
  },

  // ---- Foundry branch ----
  c03_foundry: {
    id: 'c03_foundry', kind: 'beat', locationId: 'c03_foundry',
    title: 'The Foundry', titleEs: 'La fundición',
    text: 'The foundry casts bells for voices the city never collected — bells that never rang. The foundry-keeper stamps each crate with the second ink, the same ink that stained the chapel ledger and Olen\'s manifest. The foundry knows which voice the city already paid for, and which it still owes.',
    textEs: 'La fundición funde campanas para voces que la ciudad nunca cobró — campanas que nunca sonaron. El guardián de la fundición estampa cada caja con la segunda tinta, la misma que manchó el registro de la capilla y el manifiesto de Olen. La fundición sabe qué voz ya pagó la ciudad y cuál aún debe.',
    choices: [
      { id: 'c03_foundry_floor', label: 'Enter the foundry floor', labelEs: 'Entrar en el piso de la fundición', nextNodeId: 'c03_foundry_floor', setsFlags: { c03_entered_foundry: true }, result: 'You step onto the foundry floor. The furnaces glow.', resultEs: 'Pisas el piso de la fundición. Los hornos brillan.' },
    ],
  },

  c03_foundry_floor: {
    id: 'c03_foundry_floor', kind: 'beat',
    title: 'The Crate of Unrung Bells', titleEs: 'La caja de campanas mudas',
    text: 'The foundry-keeper shows you a crate of unrung bells.\n\n"The city paid three voices," she says. "One is still owed. The crate has the tally — read it and you\'ll know which voice the city already spent, and which it still carries as a debt."\n\nThe crate is stamped with the same second ink as every ledger this campaign has carried.',
    textEs: 'El guardián de la fundición te muestra una caja de campanas que nunca sonaron.\n\n«La ciudad pagó tres voces», dice. «Una aún se debe. La caja tiene el recuento — léelo y sabrás qué voz gastó ya la ciudad y cuál lleva aún como deuda».\n\nLa caja lleva la misma segunda tinta que cada registro de esta campaña.',
    choices: [
      { id: 'c03_open_foundry_crate', label: 'Open the crate and read the tally', labelEs: 'Abrir la caja y leer el recuento', nextNodeId: 'c03_puzzle_foundry', result: 'You approach the crate. The second ink waits.', resultEs: 'Te acercas a la caja. La segunda tinta espera.' },
    ],
  },

  c03_puzzle_foundry: {
    id: 'c03_puzzle_foundry', kind: 'puzzle', puzzleId: 'c03_foundry_crate',
    title: 'The Foundry Crate', titleEs: 'La caja de la fundición',
    text: 'The crate is sealed with the second ink. The foundry-keeper watches. Read it and you will know what the city already paid.',
    textEs: 'La caja está sellada con la segunda tinta. El guardián observa. Léela y sabrás lo que la ciudad ya pagó.',
    choices: [],
  },

  c03_foundry_solved: {
    id: 'c03_foundry_solved', kind: 'beat',
    title: 'The Tally Read', titleEs: 'El recuento leído',
    text: 'The crate opens. The tally is plain: three voices paid — a farmer, a keeper, a child — and one still owed. The city pays the Door with voices, and Vane is the collector.\n\nThe foundry-keeper nods. "Now you know what the city owes. The question is whether you can make it stop."',
    textEs: 'La caja se abre. El recuento queda claro: tres voces pagadas — un granjero, un guardián, un niño — y una aún debida. La ciudad paga a la Puerta con voces, y Vane es la cobradora.\n\nEl guardián de la fundición asiente. «Ahora sabes lo que debe la ciudad. La pregunta es si puedes hacer que pare».',
    choices: [
      { id: 'c03_foundry_to_reveal', label: 'Bring the tally to the bell-tower', labelEs: 'Llevar el recuento a la torre', nextNodeId: 'c03_vane_reveal', setsFlags: { c03_foundry_evidence: true, 'canon:c03_evidence_bell': true }, adjustsValues: { conviction_truth: 2 }, result: 'You carry the foundry tally toward the bell-tower.', resultEs: 'Llevas el recuento de la fundición hacia la torre.' },
    ],
  },

  c03_foundry_skipped: {
    id: 'c03_foundry_skipped', kind: 'beat',
    title: 'The Crate Left Shut', titleEs: 'La caja dejada cerrada',
    text: 'You leave the crate sealed.\n\nThe foundry-keeper shrugs. "The city will keep paying, then. One voice per season, until someone reads the tally."',
    textEs: 'Dejas la caja cerrada.\n\nEl guardián de la fundición se encoge de hombros. «La ciudad seguirá pagando, entonces. Una voz por estación, hasta que alguien lea el recuento».',
    choices: [
      { id: 'c03_foundry_skip_to_reveal', label: 'Head to the bell-tower', labelEs: 'Ir a la torre', nextNodeId: 'c03_vane_reveal', result: 'You leave the foundry and head toward the bell-tower.', resultEs: 'Dejas la fundición y te diriges a la torre.' },
    ],
  },

  // ---- Vane's revelation and Greta's voice ----
  c03_vane_reveal: {
    id: 'c03_vane_reveal', kind: 'beat', locationId: 'c03_bell_tower',
    title: 'Vane\'s Revelation', titleEs: 'La revelación de Vane',
    text: 'Vane stands at the top of the bell-tower stair.\n\n"The voices are the city\'s payment to the Door," she says. "I did not choose this. The pact chose it, a hundred years ago. Every season the city gives one voice, and the Door stays closed for another year. Stop the payment, and the Door opens. Keep the payment, and the district goes silent forever. The city chose this bargain. I am only the bell-keeper."\n\nShe watches you. "But if you carry a voice the Door already took — one stolen, not paid — you might return it. The bell is the witness, the pod is the vessel, the price is a voice."',
    textEs: 'Vane está en lo alto de la escalera de la torre.\n\n«Las voces son el pago de la ciudad a la Puerta», dice. «Yo no elegí esto. Lo eligió el pacto, hace cien años. Cada estación, la ciudad entrega una voz, y la Puerta se mantiene cerrada otro año. Detén el pago, y la Puerta se abre. Mantén el pago, y el distrito queda mudo para siempre. La ciudad eligió este trato. Yo soy solo la campanera».\n\nTe observa. «Pero si llevas una voz que la Puerta ya tomó — una robada, no pagada — quizás puedas devolverla. La campana es el testigo, la vasija es el recipiente, el precio es una voz».',
    choices: [
      { id: 'c03_return_greta_voice', label: 'Return Greta\'s stolen voice to a bell', labelEs: 'Devolver la voz robada de Greta a una campana', nextNodeId: 'c03_greta_voice', requires: [{ flag: 'canon:c01_greta_voice' }], setsFlags: { 'canon:c03_greta_voice_returned': true }, adjustsValues: { conviction_compassion: 3, faction_bellwardens: 2 }, result: 'You carry Greta\'s stolen voice — the voice the Drowned Door took in Chapter 1 — and speak it into the oldest bell. The bell rings true for the first time in a hundred years.', resultEs: 'Llevas la voz robada de Greta — la voz que tomó la Puerta Ahogada en el Capítulo 1 — y la hablas en la campana más vieja. La campana suena verdadera por primera vez en cien años.' },
      { id: 'c03_face_wardens', label: 'Face the Chiming Wardens', labelEs: 'Enfrentar a los Guardianes Retintines', nextNodeId: 'c03_chiming_wardens', setsFlags: { c03_faced_wardens: true }, adjustsValues: { conviction_freedom: 1 }, result: 'You stride toward the belfry. The Chiming Wardens rise to block the stair.', resultEs: 'Te diriges al campanario. Los Guardianes Retintines se alzan para bloquear la escalera.' },
      { id: 'c03_witnessing_rite', label: 'Perform a witnessing rite before the bells', labelEs: 'Realizar un rito de testimonio ante las campanas', nextNodeId: 'c03_witnessing_rite', setsFlags: { c03_performed_rite: true }, adjustsValues: { conviction_compassion: 1, faction_bellwardens: 1 }, result: 'You stand before the bells and perform the rite the city forgot.', resultEs: 'Te yergues ante las campanas y realizas el rito que la ciudad olvidó.' },
    ],
  },

  c03_greta_voice: {
    id: 'c03_greta_voice', kind: 'beat',
    title: 'Greta\'s Voice Returned', titleEs: 'La voz de Greta devuelta',
    text: 'You speak Greta\'s voice into the oldest bell. It rings — clear, deep, and alive. The voice the Drowned Door took in Blackmere has come home to a bell in Syrva.\n\nVane lowers her head. "The rescue oath is fulfilled," she says. "The voice the Door stole is returned. The city\'s debt is lighter by one."\n\nThe bell still rings. The district remembers.',
    textEs: 'Hablas la voz de Greta en la campana más vieja. Suena — clara, grave y viva. La voz que la Puerta Ahogada tomó en Blackmere ha vuelto a una campana en Sirva.\n\nVane baja la cabeza. «El juramento de rescate está cumplido», dice. «La voz que la Puerta robó ha sido devuelta. La deuda de la ciudad es más ligera en una».\n\nLa campana sigue sonando. El distrito recuerda.',
    choices: [
      { id: 'c03_greta_to_threshold', label: 'Descend to the threshold', labelEs: 'Bajar al umbral', nextNodeId: 'c03_threshold', setsFlags: { 'canon:c03_greta_voice_returned': true }, adjustsValues: { conviction_compassion: 2 }, result: 'You carry the ringing bell\'s promise down to the threshold.', resultEs: 'Llevas la promesa de la campana que suena hasta el umbral.' },
    ],
  },

  // ---- Combat: the Chiming Wardens ----
  c03_chiming_wardens: {
    id: 'c03_chiming_wardens', kind: 'beat', locationId: 'c03_bell_chamber',
    title: 'The Chiming Wardens', titleEs: 'Los Guardianes Retintines',
    text: 'The Chiming Wardens rise from the bell-pits — iron shapes in the form of bell-ringers, each carrying a silenced bell as a shield. They do not speak; they ring. The stair to the belfry is behind them, and the district\'s last voice is above.',
    textEs: 'Los Guardianes Retintines se alzan de los fosos de las campanas — figuras de hierro con forma de campaneros, cada una con una campana silenciada como escudo. No hablan; repican. La escalera al campanario está detrás de ellos, y la última voz del distrito está arriba.',
    choices: [
      { id: 'c03_fight_wardens', label: 'Fight through the Chiming Wardens', labelEs: 'Luchar contra los Guardianes Retintines', nextNodeId: 'c03_wardens_aftermath', setsFlags: { c03_fought_wardens: true }, adjustsValues: { conviction_freedom: 2 }, result: 'You raise your weapon. The wardens ring their shields.', resultEs: 'Levantas tu arma. Los guardianes hacen sonar sus escudos.' },
    ],
  },

  c03_wardens_aftermath: {
    id: 'c03_wardens_aftermath', kind: 'beat', locationId: 'c03_bell_chamber', externalEntry: true,
    title: 'The Belfry Reached', titleEs: 'El campanario alcanzado',
    text: 'The Chiming Wardens collapse into iron and silence. The stair to the belfry is clear. Above, the district\'s last voice waits in the oldest bell. The district can ring again — or it can go quiet forever.',
    textEs: 'Los Guardianes Retintines se derrumban en hierro y silencio. La escalera al campanario está despejada. Arriba, la última voz del distrito espera en la campana más vieja. El distrito puede volver a sonar — o puede quedarse mudo para siempre.',
    choices: [
      { id: 'c03_aftermath_to_thinning', label: 'Climb past the fallen wardens', labelEs: 'Subir junto a los guardianes caídos', nextNodeId: 'c03_voices_thinning', result: 'You climb past the fallen wardens. The air is thinner here, and your own voice feels faint.', resultEs: 'Subes junto a los guardianes caídos. El aire es más delgado aquí, y tu propia voz se siente débil.' },
    ],
  },

  c03_voices_thinning: {
    id: 'c03_voices_thinning', kind: 'beat',
    title: 'The Party\'s Voices Thinning', titleEs: 'Las voces del grupo se adelgazan',
    text: 'As you climb toward the belfry, you notice your own voice thinning. The bells below have been feeding on every voice in the city for a hundred years — and now they are hungry enough to taste yours. The district\'s last voice is above, in the oldest bell. You can feel it pulling at your throat.',
    textEs: 'Al subir hacia el campanario, notas que tu propia voz se adelgaza. Las campanas de abajo han alimentado a cada voz de la ciudad durante cien años — y ahora tienen hambre suficiente para probar la tuya. La última voz del distrito está arriba, en la campana más vieja. Puedes sentirla tirando de tu garganta.',
    choices: [
      { id: 'c03_thinning_to_threshold', label: 'Press on to the bell-showdown', labelEs: 'Seguir hasta el cara a cara de las campanas', nextNodeId: 'c03_threshold', result: 'You steady your voice and press on toward the threshold.', resultEs: 'Afirmas tu voz y sigues hacia el umbral.' },
    ],
  },

  c03_witnessing_rite: {
    id: 'c03_witnessing_rite', kind: 'beat',
    title: 'The Witnessing Rite', titleEs: 'El rito de testimonio',
    text: 'You stand before the bells and perform the rite the city forgot — a witnessing, spoken and sung. The bells do not ring, but they listen.\n\nVane watches from the stair. "The rite does not free the voices," she says. "But it records them. The court will hear that the city paid, and what it paid with. That is evidence."',
    textEs: 'Te yergues ante las campanas y realizas el rito que la ciudad olvidó — un testimonio, hablado y cantado. Las campanas no suenan, pero escuchan.\n\nVane observa desde la escalera. «El rito no libera las voces», dice. «Pero las registra. La corte oirá que la ciudad pagó, y con qué. Eso es evidencia».',
    choices: [
      { id: 'c03_rite_to_threshold', label: 'Carry the rite\'s record to the threshold', labelEs: 'Llevar el registro del rito al umbral', nextNodeId: 'c03_threshold', setsFlags: { 'canon:c03_evidence_bell': true }, adjustsValues: { conviction_truth: 2 }, result: 'You carry the witnessing record toward the threshold.', resultEs: 'Llevas el registro del testimonio hacia el umbral.' },
    ],
  },

  // ---- Threshold ----
  c03_threshold: {
    id: 'c03_threshold', kind: 'beat', locationId: 'c03_bell_tower',
    title: 'The Bell-Showdown', titleEs: 'El cara a cara de las campanas',
    text: 'You stand at the top of the bell-tower. The district stretches below — half-silent, half-alive. Vane stands beside you.\n\n"The city chose this bargain a hundred years ago," she says. "One voice per season, and the Door stays closed. Ring the bells and free the district — the Door will open, but the voices will live. Liburn them — ring them softly, keep the district alive and the Door half-closed. Sell them — the Iron Parliament will take the bells and the voices. Or take flight, and let the district go silent. The choice is the city\'s. But you are the one standing here."',
    textEs: 'Estás en lo alto de la torre. El distrito se extiende abajo — medio mudo, medio vivo. Vane está a tu lado.\n\n«La ciudad eligió este trato hace cien años», dice. «Una voz por estación, y la Puerta se mantiene cerrada. Toca las campanas y libera el distrito — la Puerta se abrirá, pero las voces vivirán. Repícalas suavemente — mantén el distrito vivo y la Puerta medio cerrada. Véndelas — el Parlamento de Hierro se llevará las campanas y las voces. O huye, y deja que el distrito quede mudo. La elección es de la ciudad. Pero tú eres quien está aquí».',
    choices: [
      { id: 'c03_to_ending_ring', label: 'Ring the bells — free the district, open the Door', labelEs: 'Tocar las campanas — liberar el distrito, abrir la Puerta', nextNodeId: 'c03_ending_ring', setsFlags: { 'canon:c03_district_saved': true }, adjustsValues: { conviction_freedom: 3, faction_bellwardens: 2 }, result: 'You ring every bell in the tower. The voices pour out. The district rings alive; the Door opens somewhere far below.', resultEs: 'Tocas cada campana de la torre. Las voces se derraman. El distrito resuena vivo; la Puerta se abre en algún lugar muy abajo.' },
      { id: 'c03_to_ending_liburn', label: 'Liburn the bells — keep the district alive softly', labelEs: 'Repicar suavemente — mantener el distrito vivo quedamente', nextNodeId: 'c03_ending_liburn', setsFlags: { 'canon:c03_district_saved': true }, adjustsValues: { conviction_compassion: 2, faction_bellwardens: 1 }, result: 'You liburn the bells — a soft, steady ringing that keeps the voices in the air without setting them free. The Door stays half-closed.', resultEs: 'Haces repicar suavemente las campanas — un repique constante y quedo que mantiene las voces en el aire sin soltarlas. La Puerta queda medio cerrada.' },
      { id: 'c03_to_ending_sold', label: 'Sell the bells to the Iron Parliament', labelEs: 'Vender las campanas al Parlamento de Hierro', nextNodeId: 'c03_ending_sold', setsFlags: { 'canon:c03_bells_sold': true }, adjustsValues: { faction_veiled_court: 2, conviction_freedom: 1 }, result: 'You sell the bells. The Iron Parliament takes them — and the voices they hold.', resultEs: 'Vendes las campanas. El Parlamento de Hierro se las lleva — y las voces que guardan.' },
      { id: 'c03_to_ending_flight', label: 'Take flight — let the district go silent', labelEs: 'Huir — dejar que el distrito quede mudo', nextNodeId: 'c03_ending_flight', setsFlags: { c03_fled_district: true }, adjustsValues: { conviction_freedom: 2 }, result: 'You leave the tower. The district goes silent behind you.', resultEs: 'Dejas la torre. El distrito queda mudo a tus espaldas.' },
    ],
  },

  // ---- Endings ----
  c03_ending_ring: {
    id: 'c03_ending_ring', kind: 'ending', terminal: true, choices: [],
    outcome: 'success', survivors: ['c03_vane'], casualties: [],
    title: 'The District Rings', titleEs: 'El distrito resuena',
    text: 'Every bell in Syrva rings at once. The voices pour into the streets like rain after a drought. The district is saved — alive, loud, and free.\n\nThe Door opens somewhere far below, but the voices that were its payment are in the air now, not in the iron.\n\nVane stands in the tower and listens. "The city chose," she says. "It chose to ring."',
    textEs: 'Cada campana de Sirva suena a la vez. Las voces se derraman por las calles como lluvia tras una sequía. El distrito está a salvo — vivo, ruidoso y libre.\n\nLa Puerta se abre en algún lugar muy abajo, pero las voces que eran su pago están en el aire ahora, no en el hierro.\n\nVane está en la torre y escucha. «La ciudad eligió», dice. «Eligió sonar».',
  },
  c03_ending_liburn: {
    id: 'c03_ending_liburn', kind: 'ending', terminal: true, choices: [],
    outcome: 'ambiguous', survivors: ['c03_vane'], casualties: [],
    title: 'The Soft Bells', titleEs: 'Las campanas quedas',
    text: 'You liburn the bells — a soft, steady ringing that keeps the voices in the air without setting them fully free. The district lives, quietly. The Door stays half-closed. The bargain holds, but gently.\n\nVane nods. "The city chose to keep its voices and its door both. That is the hardest choice, and the slowest."',
    textEs: 'Haces repicar suavemente las campanas — un repique constante y quedo que mantiene las voces en el aire sin soltarlas del todo. El distrito vive, quedamente. La Puerta queda medio cerrada. El trato se mantiene, pero suavemente.\n\nVane asiente. «La ciudad eligió guardar sus voces y su puerta a la vez. Es la elección más difícil, y la más lenta».',
  },
  c03_ending_sold: {
    id: 'c03_ending_sold', kind: 'ending', terminal: true, choices: [],
    outcome: 'failure', survivors: [], casualties: ['c03_vane'],
    title: 'The Bells Sold', titleEs: 'Las campanas vendidas',
    text: 'You sell the bells to the Iron Parliament. They take the bells and the voices they hold — every one. The district goes silent.\n\nThe Parliament pays well. The city pockets the silver. The voices disappear into the continental register.\n\nVane is gone. The tower is empty. The Door stays closed, but the price was every voice the city had left.',
    textEs: 'Vendes las campanas al Parlamento de Hierro. Se llevan las campanas y las voces que guardan — todas. El distrito queda mudo.\n\nEl Parlamento paga bien. La ciudad se guarda la plata. Las voces desaparecen en el registro continental.\n\nVane se ha ido. La torre está vacía. La Puerta se mantiene cerrada, pero el precio fue cada voz que le quedaba a la ciudad.',
  },
  c03_ending_flight: {
    id: 'c03_ending_flight', kind: 'ending', terminal: true, choices: [],
    outcome: 'failure', survivors: [], casualties: ['c03_vane'],
    title: 'The Silent District', titleEs: 'El distrito mudo',
    text: 'You leave the tower. Behind you, the district goes silent — not all at once, but one bell at a time, until the last one stops.\n\nVane is still up there, tending the mute bells. The Door stays closed. The city pays its voice next season, and the next, and the next.\n\nYou chose not to choose, and the silence chose for you.',
    textEs: 'Dejas la torre. A tus espaldas, el distrito queda mudo — no de golpe, sino campana por campana, hasta que la última se detiene.\n\nVane sigue arriba, cuidando las campanas mudas. La Puerta se mantiene cerrada. La ciudad paga su voz la próxima estación, y la siguiente, y la siguiente.\n\nElegiste no elegir, y el silencio eligió por ti.',
  },
};

// ---- World ---------------------------------------------------

const LOCATIONS: Record<string, WorldLocation> = {
  c03_syrva_gate: {
    id: 'c03_syrva_gate', name: 'The Silent Gate', nameEs: 'La puerta muda',
    description: 'The gate of Syrva, where the oldest bell hangs mute. Three roads leave the gate: the market district, the bell-tower keep, and the foundry.', descriptionEs: 'La puerta de Sirva, donde cuelga muda la campana más vieja. Tres caminos salen de la puerta: el distrito del mercado, la torre de las campanas y la fundición.',
    connections: ['c03_market_district', 'c03_bell_tower', 'c03_foundry'],
    objects: [{ id: 'c03_oldest_bell', name: 'The Oldest Bell', nameEs: 'La campana más vieja', description: 'The oldest bell in Syrva, mute and heavy. It held the first voice the city ever took.', descriptionEs: 'La campana más vieja de Sirva, muda y pesada. Guardaba la primera voz que la ciudad tomó.', interactable: true, broken: false, hidden: false }],
    npcs: ['c03_vane'], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'town',
  },
  c03_market_district: {
    id: 'c03_market_district', name: 'The Market District', nameEs: 'El distrito del mercado',
    description: 'A half-silent market. The stalls that sold bells now sell silence — cloth, wax, ear-plugs. The air is thick with unspoken words.', descriptionEs: 'Un mercado medio mudo. Los puestos que vendían campanas ahora venden silencio — tela, cera, tapones. El aire está lleno de palabras no dichas.',
    connections: ['c03_syrva_gate'],
    objects: [], npcs: ['c03_stall_keeper'], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'town',
  },
  c03_bell_tower: {
    id: 'c03_bell_tower', name: 'The Bell-Tower Keep', nameEs: 'La torre de las campanas',
    description: 'A spiral of stone and iron. Three bells hang in the lower chamber; the belfry is above. Vane stands at the top of the stair.', descriptionEs: 'Una espiral de piedra y hierro. Tres campanas cuelgan en la cámara inferior; el campanario está arriba. Vane está en lo alto de la escalera.',
    connections: ['c03_syrva_gate', 'c03_bell_chamber'],
    objects: [], npcs: [], enemies: [], dangerLevel: 2, discovered: true, secrets: [], ambiance: 'temple',
  },
  c03_bell_chamber: {
    id: 'c03_bell_chamber', name: 'The Bell Chamber', nameEs: 'La cámara de las campanas',
    description: 'The lower chamber of the bell-tower, where three bells hang and the Chiming Wardens rise from the bell-pits.', descriptionEs: 'La cámara inferior de la torre, donde cuelgan tres campanas y se alzan los Guardianes Retintines de los fosos de las campanas.',
    connections: ['c03_bell_tower'],
    objects: [{ id: 'c03_three_bells', name: 'The Three Bells', nameEs: 'Las tres campanas', description: 'Three bells: the young, the middle, and the oldest. Each one a cell of stolen voice.', descriptionEs: 'Tres campanas: la joven, la mediana y la más vieja. Cada una una celda de voz robada.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: ['c03_chiming_warden'], dangerLevel: 3, discovered: false, secrets: [], ambiance: 'boss',
  },
  c03_foundry: {
    id: 'c03_foundry', name: 'The Foundry', nameEs: 'La fundición',
    description: 'A furnace-hot workshop where bells are cast for voices the city never collected. The foundry-keeper stamps each crate with the second ink.', descriptionEs: 'Un taller ardiente donde se funden campanas para voces que la ciudad nunca cobró. El guardián estampa cada caja con la segunda tinta.',
    connections: ['c03_syrva_gate'],
    objects: [{ id: 'c03_foundry_crate_obj', name: 'The Unrung-Bell Crate', nameEs: 'La caja de campanas mudas', description: 'A crate of bells that never rang, stamped with the second ink.', descriptionEs: 'Una caja de campanas que nunca sonaron, estampada con la segunda tinta.', interactable: true, searchDC: 14, broken: false, hidden: false }],
    npcs: ['c03_foundry_keeper'], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'shop',
  },
};

const NPCS: Record<string, NPC> = {
  c03_vane: {
    id: 'c03_vane', name: 'Vane', nameEs: 'Vane', portrait: 'bell_keeper', faction: 'bellwardens', location: 'c03_syrva_gate', disposition: 0,
    knowledge: ['bells', 'voices', 'the_door', 'the_pact'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'Vane stands beneath the oldest bell. "Every bell is a cell of voices. I hold one bell per stolen voice. The city chose this bargain a hundred years ago — one voice per season, and the Door stays closed."', textEs: 'Vane está bajo la campana más vieja. «Cada campana es una celda de voces. Guardo una campana por cada voz robada. La ciudad eligió este trato hace cien años — una voz por estación, y la Puerta se mantiene cerrada».', responses: [{ text: 'I will ring the bells.', textEs: 'Tocaré las campanas.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Bell-keeper', occupationEs: 'Campanera', secrets: ['The voices are the city\'s payment to the Door'], secretsEs: ['Las voces son el pago de la ciudad a la Puerta'], personality: 'Mute, watchful, burdened', personalityEs: 'Muda, observadora, cargada',
  },
  c03_stall_keeper: {
    id: 'c03_stall_keeper', name: 'The Stall-Keeper', nameEs: 'El tendero', portrait: 'merchant', faction: 'bellwardens', location: 'c03_market_district', disposition: 5,
    knowledge: ['voice_tally', 'market_history'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'A stall-keeper whispers: "I remember when every bell rang at noon. Now they ring at nothing. Vane took the voices one by one, starting with the youngest."', textEs: 'Un tendero susurra: «Recuerdo cuando cada campana sonaba al mediodía. Ahora no suenan a nada. Vane tomó las voces una por una, empezando por la más joven».', responses: [{ text: 'Tell me more.', textEs: 'Cuéntame más.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Stall-keeper', occupationEs: 'Tendero', secrets: [], secretsEs: [], personality: 'Nostalgic and afraid', personalityEs: 'Nostálgico y asustado',
  },
  c03_foundry_keeper: {
    id: 'c03_foundry_keeper', name: 'The Foundry-Keeper', nameEs: 'El guardián de la fundición', portrait: 'smith', faction: 'bellwardens', location: 'c03_foundry', disposition: 0,
    knowledge: ['foundry_crate', 'voice_tally', 'oath_bank'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'The foundry-keeper wipes ash from her hands. "The city paid three voices. One is still owed. The crate has the tally — read it and you\'ll know which voice the city already spent."', textEs: 'El guardián de la fundición se limpia la ceniza de las manos. «La ciudad pagó tres voces. Una aún se debe. La caja tiene el recuento — léelo y sabrás qué voz gastó ya la ciudad».', responses: [{ text: 'I will read it.', textEs: 'Lo leeré.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Foundry-keeper', occupationEs: 'Guardiana de la fundición', secrets: [], secretsEs: [], personality: 'Practical and tired', personalityEs: 'Práctica y cansada',
  },
};

const MONSTERS: Record<string, Omit<Enemy, 'id'>> = {
  c03_chiming_warden: {
    templateId: 'c03_chiming_warden', name: 'Chiming Warden', nameEs: 'Guardián Retintín', portrait: 'bell_golem', hp: 18, maxHp: 18, ac: 15, attack: 15, damage: '2d8', damageType: 'bludgeoning', abilities: ['Bell Shield', 'Deafening Ring', 'Iron Silence'], abilitiesEs: ['Escudo de Campana', 'Repicar Ensordecedor', 'Silencio de Hierro'], xpValue: 200, loot: [], intelligence: 8, morale: 100, conditions: [],
  },
};

const QUESTS: Record<string, Quest> = {
  c03_the_silent_bells: {
    id: 'c03_the_silent_bells', name: 'The Silent Bells', nameEs: 'Las campanas mudas',
    description: 'In Syrva every bell is a cell of stolen voices. Ring the bells, liburn them, sell them, or flee — the district hangs on your choice.', descriptionEs: 'En Sirva cada campana es una celda de voces robadas. Toca las campanas, repícalas suavemente, véndelas o huye — el distrito pende de tu elección.',
    state: 'active', isMain: true, faction: 'bellwardens',
    objectives: [
      { id: 'c03_enter_city', description: 'Enter Syrva through the silent gate', descriptionEs: 'Entra en Sirva por la puerta muda', completed: false, current: 0, required: 1 },
      { id: 'c03_find_voices', description: 'Find the stolen voices in the bells', descriptionEs: 'Encuentra las voces robadas en las campanas', completed: false, current: 0, required: 1 },
      { id: 'c03_choose_bells', description: 'Decide the fate of the bells', descriptionEs: 'Decide el destino de las campanas', completed: false, current: 0, required: 1 },
    ],
    rewards: [{ type: 'xp', value: 450 }, { type: 'reputation', value: 15, factionId: 'bellwardens' }],
  },
};

export const CHAPTER_THREE: Chapter = {
  id: 'chapter-03', index: 3,
  title: 'The City of Silent Bells', titleEs: 'La ciudad de las campanas mudas',
  premise: 'In Syrva a promise once rang through a bell; now each bell is a cell of voices, and the keeper Vane holds one bell per stolen voice. If you wait, an entire district goes silent forever.',
  premiseEs: 'En la ciudad de Sirva una promesa se escuchaba por una campana; ahora cada campana es una jaula de voces, y la campanera Vane guarda una campana por cada voz que tomó. Si te demoras, un distrito entero callará para siempre.',
  intro: [
    { type: 'system', text: 'CHAPTER III — THE CITY OF SILENT BELLS', textEs: 'CAPÍTULO III — LA CIUDAD DE LAS CAMPANAS MUDAS', mood: 'mystery' },
    { type: 'narration', text: '{name} comes to Syrva, where every bell is mute and every mute bell is a cell. The keeper Vane holds one bell per stolen voice. If you wait, an entire district goes silent forever. The rescue oath you swore in Blackmere — and the voice the Drowned Door stole from Greta — may be the key that rings the oldest bell.', textEs: '{name} llega a Sirva, donde cada campana está muda y cada campana muda es una celda. La campanera Vane guarda una campana por cada voz robada. Si te demoras, un distrito entero callará para siempre. El juramento de rescate que hiciste en Blackmere — y la voz que la Puerta Ahogada le robó a Greta — pueden ser la llave que haga sonar la campana más vieja.', mood: 'mystery' },
    { type: 'system', text: 'CURRENT OBJECTIVE — Find the stolen voices in the bells and decide the fate of the district.', textEs: 'OBJETIVO ACTUAL — Encuentra las voces robadas en las campanas y decide el destino del distrito.', mood: 'neutral' },
  ],
  startNodeId: 'c03_arrival', startLocationId: 'c03_syrva_gate',
  nodes: NODES,
  puzzles: { c03_voice_sequence: VOICE_SEQUENCE, c03_foundry_crate: FOUNDRY_CRATE },
  locations: LOCATIONS, npcs: NPCS, monsters: MONSTERS, quests: QUESTS,
  mainQuestId: 'c03_the_silent_bells',
  hooks: { bossLocationId: 'c03_bell_chamber', aftermathNodeId: 'c03_wardens_aftermath' },
  storyFacts: [
    { flag: 'c03_broke_bell', en: 'The party broke the oldest bell', es: 'El grupo rompió la campana más vieja' },
    { flag: 'c03_kept_bell', en: 'The party kept the oldest bell whole', es: 'El grupo dejó la campana más vieja intacta' },
    { flag: 'c03_sold_bell', en: 'The party sold the oldest bell', es: 'El grupo vendió la campana más vieja' },
    { flag: 'c03_voices_freed', en: 'The three bells were rung in order and the voices freed', es: 'Las tres campanas sonaron en orden y las voces fueron liberadas' },
    { flag: 'c03_foundry_evidence', en: 'The foundry crate was decoded', es: 'La caja de la fundición fue descifrada' },
    { flag: 'c03_fought_wardens', en: 'The Chiming Wardens were defeated', es: 'Los Guardianes Retintines fueron derrotados' },
  ],
  suggestions: {
    c03_syrva_gate: [
      { label: 'Break the oldest bell', labelEs: 'Romper la campana más vieja', action: 'break bell' },
      { label: 'Keep the oldest bell whole', labelEs: 'Dejar la campana más vieja intacta', action: 'keep bell' },
      { label: 'Sell the oldest bell', labelEs: 'Vender la campana más vieja', action: 'sell bell' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c03_market_district: [
      { label: 'Return to the gate', labelEs: 'Volver a la puerta', action: 'go to gate' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c03_bell_tower: [
      { label: 'Return to the gate', labelEs: 'Volver a la puerta', action: 'go to gate' },
      { label: 'Climb to the bell chamber', labelEs: 'Subir a la cámara de las campanas', action: 'go to bell chamber' },
    ],
    c03_bell_chamber: [
      { label: 'Return to the tower', labelEs: 'Volver a la torre', action: 'go to bell tower' },
      { label: 'Fight the Chiming Wardens', labelEs: 'Luchar contra los Guardianes Retintines', action: 'attack' },
    ],
    c03_foundry: [
      { label: 'Return to the gate', labelEs: 'Volver a la puerta', action: 'go to gate' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
  },
  externalEntrySeeds: {
    c03_arrival: [
      { 'canon:c01_greta_voice': true, 'canon:c01_rescue_oath': true },
      {},
    ],
    c03_wardens_aftermath: [
      { c03_voices_freed: true },
      { c03_foundry_evidence: true },
    ],
  },
  summaryFlags: [
    'canon:c03_bells_sold', 'canon:c03_district_saved', 'canon:c03_greta_voice_returned',
    'canon:c03_evidence_bell', 'c03_voices_freed', 'c03_foundry_evidence',
    'c03_broke_bell', 'c03_kept_bell', 'c03_sold_bell', 'c03_fought_wardens',
  ],
};