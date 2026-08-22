// ============================================================
// CHAPTER II — The Road of Salt and Ash
// El camino de sal y ceniza
// Act I. Refugees and salt caravans crowd the north road. A Salt
// Compact caravan-master holds the only ledger that binds a voice
// to a vessel — the first true map of oath-vessels. Four local
// endings close the chapter. Self-contained authored data.
// ============================================================

import type { Chapter, StoryNode } from '../../engine/chapter';
import type { Puzzle } from '../../engine/puzzles';
import type { WorldLocation, NPC, Enemy, Quest } from '../../engine/types';

// ---- Puzzles -------------------------------------------------

const CARGO_LEDGER: Puzzle = {
  id: 'c02_cargo_ledger',
  kind: 'check',
  title: 'The Cargo Ledger',
  titleEs: 'El registro de carga',
  prompt: 'Olen\'s ledger binds each sealed voice to the vessel that carries it. The entries near the back were written in a different ink — the same second ink that stained the chapel ledger a chapter ago. Read the ledger and you will know whose voice moves whose freight.',
  promptEs: 'El registro de Olen ata cada voz sellada a la vasija que la lleva. Los asientos del final están escritos con otra tinta — la misma segunda tinta que manchó el registro de la capilla hace un capítulo. Léelo y sabrás de quién es la voz que mueve qué mercancía.',
  hints: [
    { en: 'The three odd entries share a date that is not a departure date. It is a tally — a count of voices, not of goods.', es: 'Los tres asientos extraños comparten una fecha que no es de partida. Es un recuento — un conteo de voces, no de mercancías.' },
    { en: 'The margin drawing is a map of the oath-vessels. Each line connects a voice to the vessel that carries it — and one line is missing.', es: 'El dibujo del margen es un mapa de las vasijas de juramento. Cada línea conecta una voz con la vasija que la lleva — y falta una línea.' },
  ],
  skill: 'investigation',
  dc: 14,
  clues: [
    { id: 'c02_clue_second_ink', en: 'The same second ink that stained the chapel ledger stains this ledger too — the oath-bank is the same.', es: 'La misma segunda tinta que manchó el registro de la capilla mancha también este — el registro de juramentos es el mismo.', dcReduction: 3 },
    { id: 'c02_clue_voice_tally', en: 'The tally at the bottom counts voices, not goods — three more than the caravan carries.', es: 'El recuento del pie cuenta voces, no mercancías — tres más de las que la caravana lleva.', dcReduction: 2 },
  ],
  unlocks: { flags: { c02_voice_token: true, 'canon:c02_evidence_ledger': true } },
  solvedNodeId: 'c02_cargo_decoded',
  skipNodeId: 'c02_cargo_skipped',
};

const KILN_RIDDLE: Puzzle = {
  id: 'c02_kiln_riddle',
  kind: 'riddle',
  title: 'The Kiln Riddle',
  titleEs: 'El enigma del horno',
  prompt: 'The ash-children keep a kiln at the edge of the hollow, and the kiln asks one question of anyone who would pass: what neither salt nor ash can keep, that the road takes and the road gives back?',
  promptEs: 'Los hijos de la ceniza guardan un horno al borde del barranco, y el horno hace una pregunta a quien quiera pasar: ¿qué ni la sal ni la ceniza pueden retener, que el camino toma y el camino devuelve?',
  hints: [
    { en: 'It is not a substance. It is what carries both salt and ash along the road.', es: 'No es una sustancia. Es lo que lleva tanto la sal como la ceniza por el camino.' },
    { en: 'The caravans follow it; the ashes scatter on it; the road is nothing without it.', es: 'Las caravanas lo siguen; las cenizas se esparcen en él; el camino no es nada sin él.' },
  ],
  answers: ['the wind', 'wind', 'el viento', 'viento'],
  answersEs: ['el viento', 'viento', 'the wind', 'wind'],
  unlocks: { flags: { c02_kiln_answer: true } },
  solvedNodeId: 'c02_kiln_solved',
  skipNodeId: 'c02_kiln_skipped',
};

// ---- Nodes ---------------------------------------------------

const NODES: Record<string, StoryNode> = {
  c02_arrival: {
    id: 'c02_arrival', kind: 'beat', locationId: 'c02_north_road',
    title: 'The North Road', titleEs: 'El camino del norte',
    text: 'Refugees and salt caravans crowd the north road out of Blackmere. The air tastes of salt and ash. Somewhere ahead, a caravan-master holds the only ledger that binds a voice to a vessel — the first true map of oath-vessels.',
    textEs: 'Refugiados y caravanas de sal llenan el camino al norte de Blackmere. El aire sabe a sal y ceniza. En algún punto más adelante, una maestra de caravana guarda el único registro que ata una voz a una vasija — el primer mapa verdadero de las vasijas de juramento.',
    choices: [
      { id: 'c02_approach_caravan', label: 'Approach the Salt Compact caravan', labelEs: 'Acercarse a la caravana del Pacto de Sal', nextNodeId: 'c02_caravan_gate', adjustsValues: { faction_salt_compact: 1 }, result: 'You walk toward the salt caravans. The road smells of brine and old fires.', resultEs: 'Te acercas a las caravanas de sal. El camino huele a salmuera y fogatas viejas.' },
    ],
  },

  c02_caravan_gate: {
    id: 'c02_caravan_gate', kind: 'beat', locationId: 'c02_caravan_camp',
    title: 'The Caravan Under the Ash', titleEs: 'La caravana bajo la ceniza',
    text: 'The Salt Compact caravan sits ringed by ash-tents. Olen, the caravan-master, counts sealed crates by lantern-light. She holds the only ledger that binds a voice to a vessel — and before the week is out she will sell it, trade it, or burn it. "The road took three voices from your village," she says without looking up. "I have the receipt. The question is whether you can read it."',
    textEs: 'La caravana del Pacto de Sal se sienta rodeada de tiendas de ceniza. Olen, la maestra de caravana, cuenta cajas selladas a la luz de un farol. Tiene el único registro que ata una voz a una vasija — y antes de que acabe la semana lo venderá, lo canjeará o lo quemará. «El camino tomó tres voces de tu aldea», dice sin levantar la vista. «Tengo el recibo. La pregunta es si sabes leerlo».',
    choices: [
      { id: 'c02_meet_olen', label: 'Speak with Olen', labelEs: 'Hablar con Olen', nextNodeId: 'c02_first_gate', adjustsValues: { bond_olen: 1 }, result: 'Olen sets her ledger down and meets your eye for the first time.', resultEs: 'Olen deja el registro y te mira a los ojos por primera vez.' },
      { id: 'c02_mention_rescue', label: 'Tell Olen the village trusted you with their missing', labelEs: 'Contarle a Olen que la aldea confió en ti con sus desaparecidos', nextNodeId: 'c02_first_gate', setsFlags: { 'canon:c01_trio_rescued': true }, adjustsValues: { bond_olen: 1, conviction_compassion: 1 }, result: 'You tell Olen how Blackmere trusted you with their missing. She nods; trust travels the road.', resultEs: 'Le cuentas a Olen cómo Blackmere confió en ti con sus desaparecidos. Asiente; la confianza viaja por el camino.' },
    ],
  },

  c02_first_gate: {
    id: 'c02_first_gate', kind: 'beat',
    title: 'The Sealed Cargo', titleEs: 'La carga sellada',
    text: 'Olen shows you the sealed cargo — crates of voices bound for the Iron Parliament. "These seals are the road\'s law. Break them and you read the ledger; leave them and the road trusts you. But the road does not forget either way."',
    textEs: 'Olen te muestra la carga sellada — cajas de voces destinadas al Parlamento de Hierro. «Estos sellos son la ley del camino. Rómpelos y leerás el registro; déjalos y el camino confiará en ti. Pero el camino no olvida, de ninguna de las dos maneras».',
    choices: [
      { id: 'c02_read_cargo', label: 'Read the sealed cargo — break the seals', labelEs: 'Leer la carga sellada — romper los sellos', nextNodeId: 'c02_crossroads', setsFlags: { c02_cargo_read: true }, adjustsValues: { conviction_truth: 1, bond_olen: -1 }, result: 'You break the seals. The ledger opens; the road\'s law bends.', resultEs: 'Rompes los sellos. El registro se abre; la ley del camino se doblega.' },
      { id: 'c02_leave_seals', label: 'Leave the seals whole', labelEs: 'Dejar los sellos intactos', nextNodeId: 'c02_crossroads', setsFlags: { c02_seals_intact: true }, adjustsValues: { faction_salt_compact: 1, conviction_duty: 1 }, result: 'You leave the seals whole. Olen nods; the road remembers that you did not break its law.', resultEs: 'Dejas los sellos intactos. Olen asiente; el camino recuerda que no rompiste su ley.' },
    ],
  },

  c02_crossroads: {
    id: 'c02_crossroads', kind: 'beat', locationId: 'c02_caravan_camp',
    title: 'Three Roads', titleEs: 'Tres caminos',
    text: 'The caravan camp opens onto three roads: the caravan road running north with the salt, the ash-hollow where the ash-children keep their kiln, and the courier\'s road that follows the Iron Parliament\'s post. Each one can reach Olen\'s ledger; each one carries a different price.',
    textEs: 'El campamento de la caravana se abre a tres caminos: el camino de la caravana que va al norte con la sal, el barranco de ceniza donde los hijos de la ceniza guardan su horno, y el camino del correo que sigue la posta del Parlamento de Hierro. Cada uno puede llegar al registro de Olen; cada uno lleva un precio distinto.',
    choices: [
      { id: 'c02_take_caravan', label: 'Take the caravan road with Olen', labelEs: 'Tomar el camino de la caravana con Olen', nextNodeId: 'c02_caravan_road', setsFlags: { c02_chose_caravan: true }, result: 'You walk beside the salt wagons. Olen keeps pace.', resultEs: 'Caminas junto a los carros de sal. Olen marca el paso.' },
      { id: 'c02_take_ash', label: 'Descend to the ash-children\'s hollow', labelEs: 'Bajar al barranco de los hijos de la ceniza', nextNodeId: 'c02_ash_children', setsFlags: { c02_chose_ash: true }, result: 'You take the path into the ash-hollow.', resultEs: 'Tomas el sendero hacia el barranco de ceniza.' },
      { id: 'c02_take_courier', label: 'Follow the courier\'s road', labelEs: 'Seguir el camino del correo', nextNodeId: 'c02_courier_road', setsFlags: { c02_chose_courier: true }, result: 'You take the courier\'s road east.', resultEs: 'Tomas el camino del correo hacia el este.' },
    ],
  },

  // ---- Caravan road branch ----
  c02_caravan_road: {
    id: 'c02_caravan_road', kind: 'beat', locationId: 'c02_caravan_camp',
    title: 'The Caravan Road', titleEs: 'El camino de la caravana',
    text: 'The salt wagons creak north. Olen walks beside you, her ledger tucked under one arm. She tells you the map is not a map of roads but of oaths — each voice a pledge, each vessel a debt. "The road does not carry goods," she says. "It carries promises. And every promise has a price."',
    textEs: 'Los carros de sal crujen hacia el norte. Olen camina a tu lado, el registro bajo el brazo. Te dice que el mapa no es un mapa de caminos sino de juramentos — cada voz una promesa, cada vasija una deuda. «El camino no lleva mercancías», dice. «Lleva promesas. Y cada promesa tiene un precio».',
    choices: [
      { id: 'c02_olen_bargain', label: 'Ask Olen to share the ledger', labelEs: 'Pedir a Olen que comparta el registro', nextNodeId: 'c02_olen_bargain', adjustsValues: { bond_olen: 1 }, result: 'Olen weighs the question. The ledger is her living witness.', resultEs: 'Olen sopesa la pregunta. El registro es su testigo vivo.' },
    ],
  },

  c02_olen_bargain: {
    id: 'c02_olen_bargain', kind: 'beat',
    title: 'Olen\'s Bargain', titleEs: 'El trato de Olen',
    text: 'Olen sets the ledger on a salt-crate. "Swear the map is complete on my bond and I will share it. But the map has a gap — my own row is left off it. That is the price of the road: one sealed voice per crossing." She watches you. "If your village trusted you with their missing, the Salt can trust you with this."',
    textEs: 'Olen deja el registro sobre una caja de sal. «Jura que el mapa es completo bajo mi palabra y lo compartiré. Pero al mapa le falta un hueco — mi propia fila no está. Ese es el precio del camino: una voz sellada por cada paso». Te observa. «Si tu aldea confió en ti con sus desaparecidos, la Sal puede confiar en ti con esto».',
    choices: [
      { id: 'c02_olen_trio_rescued', label: 'A trusted village lets the Salt trust you', labelEs: 'Una aldea que confía deja que la Sal confíe en ti', nextNodeId: 'c02_puzzle_cargo', requires: [{ flag: 'canon:c01_trio_rescued' }], setsFlags: { c02_olen_trust: true }, adjustsValues: { bond_olen: 2, faction_salt_compact: 1, conviction_compassion: 1 }, result: 'Olen sees the trust your village placed in you. She opens the ledger.', resultEs: 'Olen ve la confianza que tu aldea depositó en ti. Abre el registro.' },
      { id: 'c02_olen_no_trust', label: 'Ask for the ledger without the oath', labelEs: 'Pedir el registro sin el juramento', nextNodeId: 'c02_puzzle_cargo', adjustsValues: { bond_olen: -1 }, result: 'Olen shrugs. "Then read it yourself. The ink will decide."', resultEs: 'Olen se encoge de hombros. «Entonces léelo tú mismo. La tinta decidirá».' },
    ],
  },

  // ---- Ash-children branch ----
  c02_ash_children: {
    id: 'c02_ash_children', kind: 'beat', locationId: 'c02_ash_hollow',
    title: 'The Ash-Children\'s Husk', titleEs: 'El barranco de los hijos de la ceniza',
    text: 'The ash-hollow is a ring of burned tents around a kiln that still breathes heat. The ash-children — refugees who lost their names to the fires — tend the kiln and keep a riddle older than the road. They do not ask for payment; they ask for an answer.',
    textEs: 'El barranco de ceniza es un anillo de tiendas quemadas alrededor de un horno que aún respira calor. Los hijos de la ceniza — refugiados que perdieron sus nombres en los incendios — cuidan el horno y guardan un enigma más viejo que el camino. No piden pago; piden una respuesta.',
    choices: [
      { id: 'c02_ask_kiln', label: 'Approach the kiln', labelEs: 'Acercarse al horno', nextNodeId: 'c02_kiln_intro', setsFlags: { c02_chose_kiln: true }, result: 'The kiln glows red behind its grate. A voice asks its question.', resultEs: 'El herno brilla rojo detrás de su rejilla. Una voz hace su pregunta.' },
      { id: 'c02_ash_seed_choice', label: 'Plant an ash-seed with the children', labelEs: 'Plantar una semilla de ceniza con los hijos', nextNodeId: 'c02_ash_seed', setsFlags: { c02_chose_seed: true, 'canon:c02_ash_seed': true }, adjustsValues: { faction_free_witnesses: 1, conviction_compassion: 2 }, result: 'You kneel with the ash-children and press a seed into the ash. They nod; the seed is planted.', resultEs: 'Te arrodillas con los hijos de la ceniza y prensas una semilla en la ceniza. Asienten; la semilla está plantada.' },
    ],
  },

  c02_kiln_intro: {
    id: 'c02_kiln_intro', kind: 'beat', locationId: 'c02_kiln',
    title: 'The Kiln\'s Question', titleEs: 'La pregunta del horno',
    text: 'The kiln-keeper — a thin figure wrapped in ash-cloth — speaks: "What neither salt nor ash can keep, that the road takes and the road gives back?" The grate is hot; the answer is older than the road.',
    textEs: 'El guardián del horno — una figura delgada envuelta en tela de ceniza — habla: «¿Qué ni la sal ni la ceniza pueden retener, que el camino toma y el camino devuelve?» La rejilla está caliente; la respuesta es más vieja que el camino.',
    choices: [
      { id: 'c02_open_kiln', label: 'Answer the kiln\'s riddle', labelEs: 'Responder al enigma del horno', nextNodeId: 'c02_puzzle_kiln', result: 'You step up to the kiln. The question waits.', resultEs: 'Te acercas al horno. La pregunta espera.' },
    ],
  },

  c02_puzzle_kiln: {
    id: 'c02_puzzle_kiln', kind: 'puzzle', puzzleId: 'c02_kiln_riddle',
    title: 'The Kiln Riddle', titleEs: 'El enigma del horno',
    text: 'The kiln-keeper watches. The grate glows. "What neither salt nor ash can keep?"',
    textEs: 'El guardián del horno observa. La rejilla brilla. «¿Qué ni la sal ni la ceniza pueden retener?»',
    choices: [],
  },

  c02_kiln_solved: {
    id: 'c02_kiln_solved', kind: 'beat',
    title: 'The Wind Answers', titleEs: 'El viento responde',
    text: '"The wind," you say. The kiln-keeper inclines their head. "El viento," you say again, and the ash-cloth stirs. The wind carries both salt and ash along the road, and the road gives it back. The kiln-keeper presses a token into your hand — a piece of ash that does not burn.',
    textEs: '«El viento», dices. El guardián del horno inclina la cabeza. «El viento», repites, y la tela de ceniza se agita. El viento lleva tanto la sal como la ceniza por el camino, y el camino lo devuelve. El guardián te prensa un token en la mano — un trozo de ceniza que no arde.',
    choices: [
      { id: 'c02_kiln_to_threshold', label: 'Take the token to the crossing', labelEs: 'Llevar el token al paso', nextNodeId: 'c02_olen_reversal', setsFlags: { c02_kiln_answer: true }, adjustsValues: { conviction_truth: 2 }, result: 'You carry the wind\'s token toward the salt-storm crossing.', resultEs: 'Llevas el token del viento hacia el paso de la tormenta de sal.' },
    ],
  },

  c02_kiln_skipped: {
    id: 'c02_kiln_skipped', kind: 'beat',
    title: 'The Kiln Left Unanswered', titleEs: 'El horno sin respuesta',
    text: 'You leave the riddle unanswered. The kiln-keeper says nothing. The ash-children watch you go. The wind does not carry you; you carry yourself.',
    textEs: 'Dejas el enigma sin responder. El guardián del horno no dice nada. Los hijos de la ceniza te ven marchar. El viento no te lleva; te llevas a ti mismo.',
    choices: [
      { id: 'c02_kiln_skip_to_threshold', label: 'Head to the crossing', labelEs: 'Ir al paso', nextNodeId: 'c02_olen_reversal', result: 'You leave the hollow and head toward the salt-storm crossing.', resultEs: 'Dejas el barranco y te diriges al paso de la tormenta de sal.' },
    ],
  },

  c02_ash_seed: {
    id: 'c02_ash_seed', kind: 'beat',
    title: 'The Ash Seed', titleEs: 'La semilla de ceniza',
    text: 'The ash-children gather around the pressed seed. One of them speaks: "This is the Free Witnesses\' ceremony. We plant what the fire took, and what grows is ours. No ledger, no road, no court can take it." The seed is in the ground now. It will grow or it will not.',
    textEs: 'Los hijos de la ceniza se reúnen alrededor de la semilla prensada. Uno habla: «Esta es la ceremonia de los Testigos Libres. Plantamos lo que el fuego tomó, y lo que crece es nuestro. Ningún registro, ningún camino, ninguna corte puede llevarlo». La semilla está en la tierra ahora. Crecerá o no crecerá.',
    choices: [
      { id: 'c02_seed_to_threshold', label: 'Carry the seed toward the crossing', labelEs: 'Llevar la semilla al paso', nextNodeId: 'c02_olen_reversal', adjustsValues: { faction_free_witnesses: 1, conviction_freedom: 1 }, result: 'You carry the planted seed\'s promise toward the crossing.', resultEs: 'Llevas la promesa de la semilla plantada hacia el paso.' },
    ],
  },

  // ---- Courier's road branch ----
  c02_courier_road: {
    id: 'c02_courier_road', kind: 'beat', locationId: 'c02_courier_trail',
    title: 'The Courier\'s Road', titleEs: 'El camino del correo',
    text: 'The courier\'s road follows the Iron Parliament\'s post east. The tracks are fresh — a fast rider with sealed saddlebags. The road is quieter than the caravan; the salt is thicker here, and the ash thinner. Something moved this way recently, dragging a heavy weight.',
    textEs: 'El camino del correo sigue la posta del Parlamento de Hierro al este. Las huellas son frescas — un jinete rápido con alforjas selladas. El camino es más quieto que la caravana; la sal es más espesa aquí, y la ceniza más delgada. Algo se movió por aquí hace poco, arrastrando un peso.',
    choices: [
      { id: 'c02_courier_meet', label: 'Follow the tracks to the courier', labelEs: 'Seguir las huellas hasta el correo', nextNodeId: 'c02_courier_meet', setsFlags: { c02_chose_courier_meet: true }, result: 'You follow the tracks east. The salt crunches underfoot.', resultEs: 'Sigues las huellas al este. La sal cruje bajo tus pies.' },
    ],
  },

  c02_courier_meet: {
    id: 'c02_courier_meet', kind: 'beat',
    title: 'The Iron Parliament Courier', titleEs: 'El correo del Parlamento de Hierro',
    text: 'A rider in Iron Parliament livery sits her horse at the trail\'s end. She carries sealed saddlebags — the same second ink on the wax as the chapel ledger. "Olen\'s ledger is a map of oath-vessels," she says. "The Parliament wants it. So does the road. So do you. The question is who pays the price of reading it."',
    textEs: 'Una jinete con librea del Parlamento de Hierro sienta su caballo al final del sendero. Lleva alforjas selladas — la misma segunda tinta en la cera que el registro de la capilla. «El registro de Olen es un mapa de vasijas de juramento», dice. «El Parlamento lo quiere. El camino también. Y tú. La pregunta es quién paga el precio de leerlo».',
    choices: [
      { id: 'c02_courier_to_olen', label: 'Return to Olen with the courier\'s terms', labelEs: 'Volver con Olen y los términos del correo', nextNodeId: 'c02_olen_reversal', adjustsValues: { faction_salt_compact: 1, conviction_duty: 1 }, result: 'You ride back to Olen with the Parliament\'s terms in your head.', resultEs: 'Vuelves con Olen y los términos del Parlamento en la cabeza.' },
    ],
  },

  // ---- Cargo ledger puzzle ----
  c02_puzzle_cargo: {
    id: 'c02_puzzle_cargo', kind: 'puzzle', puzzleId: 'c02_cargo_ledger',
    title: 'The Ledger of Voices', titleEs: 'El registro de voces',
    text: 'Olen sets the ledger on the crate. The pages are salt-stained but legible. Three entries near the back were written in a different ink. Read them and you will know whose voice moves whose freight.',
    textEs: 'Olen deja el registro sobre la caja. Las páginas están manchadas de sal pero son legibles. Tres asientos del final están escritos con otra tinta. Léelos y sabrás de quién es la voz que mueve qué mercancía.',
    choices: [],
  },

  c02_cargo_decoded: {
    id: 'c02_cargo_decoded', kind: 'beat',
    title: 'The Ledger Decoded', titleEs: 'El registro descifrado',
    text: 'The three odd entries share a date that is not a departure date — it is a tally of voices. The margin drawing is a map of oath-vessels: each line connects a voice to the vessel that carries it. One line is missing — Olen\'s own. She left her row off the map. The ledger proves the abductions were falsified — three names written as a payment to the door.',
    textEs: 'Los tres asientos extraños comparten una fecha que no es de partida — es un recuento de voces. El dibujo del margen es un mapa de vasijas de juramento: cada línea conecta una voz con la vasija que la lleva. Falta una línea — la de Olen. Dejó su fila fuera del mapa. El registro prueba que los secuestros fueron falsificados — tres nombres escritos como pago a la puerta.',
    choices: [
      { id: 'c02_decoded_to_reversal', label: 'Bring the decoded ledger to the crossing', labelEs: 'Llevar el registro descifrado al paso', nextNodeId: 'c02_olen_reversal', setsFlags: { c02_voice_token: true, 'canon:c02_evidence_ledger': true }, adjustsValues: { conviction_truth: 2, bond_olen: 1 }, result: 'You carry the decoded ledger to the salt-storm crossing. The evidence is yours now.', resultEs: 'Llevas el registro descifrado al paso de la tormenta de sal. La prueba es tuya ahora.' },
    ],
  },

  c02_cargo_skipped: {
    id: 'c02_cargo_skipped', kind: 'beat',
    title: 'The Ledger Left Shut', titleEs: 'El registro dejado cerrado',
    text: 'You leave the ledger unread. Olen closes it without comment. The voices stay sealed; the map stays hidden. You will have to cross the storm without knowing what the ledger knows.',
    textEs: 'Dejas el registro sin leer. Olen lo cierra sin comentario. Las voces siguen selladas; el mapa sigue oculto. Tendrás que cruzar la tormenta sin saber lo que el registro sabe.',
    choices: [
      { id: 'c02_skipped_to_reversal', label: 'Head to the crossing', labelEs: 'Ir al paso', nextNodeId: 'c02_olen_reversal', result: 'You leave the ledger and head toward the salt-storm crossing.', resultEs: 'Dejas el registro y te diriges al paso de la tormenta de sal.' },
    ],
  },

  // ---- Combat and merge ----
  c02_wicker_ambush: {
    id: 'c02_wicker_ambush', kind: 'beat', locationId: 'c02_salt_flats',
    title: 'The Wicker Ambush', titleEs: 'La emboscada de mimbre',
    text: 'The salt-storm crossing is a flat white stretch where the wind never stops. Halfway across, the wicker shapes rise from the ash — Wicker Wraiths, the road\'s collectors, woven from the refuse of broken oaths. Behind them, a bound debtor stumbles forward, chained to a weight.',
    textEs: 'El paso de la tormenta de sal es un tramo plano y blanco donde el viento nunca se detiene. A mitad del cruce, las figuras de mimbre se alzan de la ceniza — Espectros de Mimbre, los cobradores del camino, tejidos con los restos de juramentos rotos. Detrás, un deudor atado tropieza hacia delante, encadenado a un peso.',
    choices: [
      { id: 'c02_fight_wicker', label: 'Fight through the Wicker Wraiths', labelEs: 'Luchar contra los Espectros de Mimbre', nextNodeId: 'c02_wicker_aftermath', setsFlags: { c02_fought_wicker: true }, adjustsValues: { conviction_freedom: 1 }, result: 'You raise your weapon. The wicker shapes close in.', resultEs: 'Levantas tu arma. Las figuras de mimbre se acercan.' },
    ],
  },

  c02_wicker_aftermath: {
    id: 'c02_wicker_aftermath', kind: 'beat', locationId: 'c02_salt_flats', externalEntry: true,
    title: 'The Storm Breaks', titleEs: 'La tormenta cede',
    text: 'The Wicker Wraiths collapse into ash and woven sticks. The bound debtor kneels where the chains let him, breathing hard. "The road sent me to pay a debt I did not choose," he says. "Olen\'s ledger is the receipt. But the map has a gap — and the gap is the price."',
    textEs: 'Los Espectros de Mimbre se derrumban en ceniza y varas tejidas. El deudor atado se arrodilla donde las cadenas le permiten, jadeando. «El camino me envió a pagar una deuda que no elegí», dice. «El registro de Olen es el recibo. Pero al mapa le falta un hueco — y el hueco es el precio».',
    choices: [
      { id: 'c02_aftermath_to_debtor', label: 'Press on past the debtor', labelEs: 'Seguir junto al deudor', nextNodeId: 'c02_bound_debtor', result: 'You leave the fallen wraiths and press on with the debtor.', resultEs: 'Dejas a los espectros caídos y sigues con el deudor.' },
    ],
  },

  c02_bound_debtor: {
    id: 'c02_bound_debtor', kind: 'beat',
    title: 'The Bound Debtor', titleEs: 'El deudor atado',
    text: 'The debtor\'s chains are road-iron — the same iron that sealed the chapel ledger. He says the road bound him when he broke an oath he did not know he had made. "Olen knows. The ledger has my name in it, and hers, and yours. The map is the debt; the debt is the map."',
    textEs: 'Las cadenas del deudor son de hierro del camino — el mismo hierro que selló el registro de la capilla. Dice que el camino lo ató cuando rompió un juramento que no sabía haber hecho. «Olen lo sabe. El registro tiene mi nombre, y el suyo, y el tuyo. El mapa es la deuda; la deuda es el mapa».',
    choices: [
      { id: 'c02_debtor_to_storm', label: 'Take the debtor\'s testimony to the storm', labelEs: 'Llevar el testimonio del deudor a la tormenta', nextNodeId: 'c02_salt_storm', adjustsValues: { conviction_truth: 1 }, result: 'You take the debtor\'s words toward the salt-storm crossing.', resultEs: 'Llevas las palabras del deudor hacia el paso de la tormenta de sal.' },
    ],
  },

  c02_olen_reversal: {
    id: 'c02_olen_reversal', kind: 'beat', locationId: 'c02_salt_flats',
    title: 'Olen\'s Reversal', titleEs: 'El reverso de Olen',
    text: 'Olen catches up with you at the crossing. She is carrying the ledger open. "I swore the map was complete on my bond," she says. "And I left my own row off it. The road took three voices from your village — and I wrote the receipt. The ledger holds only falsified vows. The map is the debt; the debt is the map." She holds it out. "The storm is coming. Decide now: share it, sell it, burn it, or plant what it can grow."',
    textEs: 'Olen te alcanza en el paso. Lleva el registro abierto. «Juré que el mapa era completo bajo mi palabra», dice. «Y dejé mi propia fila fuera. El camino tomó tres voces de tu aldea — y yo escribí el recibo. El registro solo guarda juramentos falsificados. El mapa es la deuda; la deuda es el mapa». Lo extiende. «La tormenta viene. Decide ahora: compártelo, véndelo,qué malo, o planta lo que pueda crecer».',
    choices: [
      { id: 'c02_reversal_to_ambush', label: 'Face the salt-storm crossing', labelEs: 'Enfrentar el paso de la tormenta de sal', nextNodeId: 'c02_wicker_ambush', result: 'You stand at the crossing. The storm rolls in from the north, and the wicker shapes rise.', resultEs: 'Te yergues en el paso. La tormenta llega del norte, y las figuras de mimbre se alzan.' },
    ],
  },

  c02_salt_storm: {
    id: 'c02_salt_storm', kind: 'beat',
    title: 'The Salt-Storm Crossing', titleEs: 'El paso de la tormenta de sal',
    text: 'The salt-storm is a white wall of wind and brine. The road disappears under it. You have one choice before the storm closes the crossing: what to do with the map of oath-vessels that Olen carried this far.',
    textEs: 'La tormenta de sal es un muro blanco de viento y salmuera. El camino desaparece bajo ella. Tienes una elección antes de que la tormenta cierre el paso: qué hacer con el mapa de vasijas de juramento que Olen trajo hasta aquí.',
    choices: [
      { id: 'c02_to_ending_partner', label: 'Partner with Olen — share the map with the road', labelEs: 'Asociarte con Olen — compartir el mapa con el camino', nextNodeId: 'c02_ending_partner', setsFlags: { 'canon:c02_map_shared': true }, adjustsValues: { bond_olen: 2, faction_salt_compact: 2 }, result: 'You take the ledger together. The map is shared; the road reads it.', resultEs: 'Tomáis el registro juntas. El mapa se comparte; el camino lo lee.' },
      { id: 'c02_to_ending_sold', label: 'Sell the map to the highest bidder', labelEs: 'Vender el mapa al mejor postor', nextNodeId: 'c02_ending_sold', setsFlags: { 'canon:c02_map_shared': true }, adjustsValues: { conviction_freedom: 1 }, result: 'You sell the map. It stays in the world; the world reads it.', resultEs: 'Vendes el mapa. Se queda en el mundo; el mundo lo lee.' },
      { id: 'c02_to_ending_burned', label: 'Burn the map — let no one read it', labelEs: 'Quemar el mapa — que nadie lo lea', nextNodeId: 'c02_ending_burned', setsFlags: { 'canon:c02_map_burned': true }, adjustsValues: { conviction_freedom: 2 }, result: 'You set the ledger alight. The salt-storm takes the ashes.', resultEs: 'Prendes fuego al registro. La tormenta de sal se lleva las cenizas.' },
      { id: 'c02_to_ending_seed', label: 'Plant what the map can grow', labelEs: 'Plantar lo que el mapa pueda crecer', nextNodeId: 'c02_ending_seed', requires: [{ flag: 'canon:c02_ash_seed' }], setsFlags: { 'canon:c02_map_shared': true, 'canon:c02_ash_seed': true }, adjustsValues: { faction_free_witnesses: 2, conviction_compassion: 2 }, result: 'You take the ash-seed and the ledger together. The map becomes a seed the road can read.', resultEs: 'Tomas la semilla de ceniza y el registro juntas. El mapa se vuelve una semilla que el camino puede leer.' },
    ],
  },

  // ---- Endings ----
  c02_ending_partner: {
    id: 'c02_ending_partner', kind: 'ending', terminal: true, choices: [],
    outcome: 'success', survivors: ['c02_olen'], casualties: [],
    title: 'Partners in the Salt', titleEs: 'Socias en la sal',
    text: 'You and Olen walk out of the storm together, the ledger between you. The map of oath-vessels is shared with the road; every caravanner who passes this way can read it now. The Salt Compact remembers your name, and Olen leaves her own row on the map at last. The road takes one sealed voice per crossing — that is the price — but the map is the world\'s now, and so is the debt.',
    textEs: 'Tú y Olen salen de la tormenta juntas, el registro entre las dos. El mapa de vasijas de juramento se comparte con el camino; todo carretero que pase por aquí puede leerlo ahora. El Pacto de Sal recuerda tu nombre, y Olen deja al fin su propia fila en el mapa. El camino toma una voz sellada por cada paso — ese es el precio —, pero el mapa es del mundo ahora, y la deuda también.',
  },
  c02_ending_sold: {
    id: 'c02_ending_sold', kind: 'ending', terminal: true, choices: [],
    outcome: 'ambiguous', survivors: ['c02_olen'], casualties: [],
    title: 'The Map Sold', titleEs: 'El mapa vendido',
    text: 'You sell the ledger to the highest bidder. The map stays in the world — readable, copyable, contestable. Olen takes her cut and walks south. The Salt Compact will not forget that you treated their ledger as a commodity, but the road will not forget that you kept it legible. The debt is someone else\'s now, but the map is everyone\'s.',
    textEs: 'Vendes el registro al mejor postor. El mapa se queda en el mundo — legible, copiable, rebatible. Olen toma su parte y camina al sur. El Pacto de Sal no olvidará que trataste su registro como una mercancía, pero el camino no olvidará que lo mantuviste legible. La deuda es de otro ahora, pero el mapa es de todos.',
  },
  c02_ending_burned: {
    id: 'c02_ending_burned', kind: 'ending', terminal: true, choices: [],
    outcome: 'ambiguous', survivors: [], casualties: ['c02_olen'],
    title: 'Ashes for the Wind', titleEs: 'Cenizas para el viento',
    text: 'You set the ledger alight. The salt-storm takes the ashes north. The map is gone; the voices it bound are unbound. Olen watches it burn and says nothing. The road will not forget that you burned its receipt — and neither will the Iron Parliament, when it learns what was on that page.',
    textEs: 'Prendes fuego al registro. La tormenta de sal se lleva las cenizas al norte. El mapa se ha ido; las voces que ataba quedan libres. Olen lo ve arder y no dice nada. El camino no olvidará que quemaste su recibo — y tampoco lo olvidará el Parlamento de Hierro, cuando sepa qué había en esa página.',
  },
  c02_ending_seed: {
    id: 'c02_ending_seed', kind: 'ending', terminal: true, choices: [],
    outcome: 'success', survivors: ['c02_olen'], casualties: [],
    title: 'What the Ash Can Grow', titleEs: 'Lo que la ceniza puede crecer',
    text: 'You press the ash-seed into the ledger\'s last page and hand it to the wind. The map does not burn; it grows. The Free Witnesses\' ceremony turns the ledger into a living thing — a seed the road carries and the road gives back. The Salt Compact calls it waste. The ash-children call it witness. The road calls it the price it was always willing to pay.',
    textEs: 'Prensas la semilla de ceniza en la última página del registro y se la das al viento. El mapa no arde; crece. La ceremonia de los Testigos Libres convierte el registro en algo vivo — una semilla que el camino lleva y el camino devuelve. El Pacto de Sal lo llama desperdicio. Los hijos de la ceniza lo llaman testigo. El camino lo llama el precio que siempre estuvo dispuesto a pagar.',
  },
};

// ---- World ---------------------------------------------------

const LOCATIONS: Record<string, WorldLocation> = {
  c02_north_road: {
    id: 'c02_north_road', name: 'The North Road', nameEs: 'El camino del norte',
    description: 'A wide road north from Blackmere, choked with refugees and salt caravans. The air tastes of brine and old ash.', descriptionEs: 'Un camino ancho al norte de Blackmere, lleno de refugiados y caravanas de sal. El aire sabe a salmuera y ceniza vieja.',
    connections: ['c02_caravan_camp'],
    objects: [], npcs: [], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'outdoor',
  },
  c02_caravan_camp: {
    id: 'c02_caravan_camp', name: 'The Caravan Camp', nameEs: 'El campamento de la caravana',
    description: 'A ring of salt-wagons and ash-tents. Olen counts her crates by lantern-light. Three roads leave the camp: the caravan road, the ash-hollow, and the courier\'s trail.', descriptionEs: 'Un anillo de carros de sal y tiendas de ceniza. Olen cuenta sus cajas a la luz de un farol. Tres caminos salen del campamento: el de la caravana, el barranco de ceniza y el sendero del correo.',
    connections: ['c02_north_road', 'c02_ash_hollow', 'c02_courier_trail', 'c02_salt_flats'],
    objects: [{ id: 'c02_salt_crates', name: 'Salt Crates', nameEs: 'Cajas de Sal', description: 'Sealed crates of salt and voices bound for the Iron Parliament.', descriptionEs: 'Cajas selladas de sal y voces destinadas al Parlamento de Hierro.', interactable: true, broken: false, hidden: false }],
    npcs: ['c02_olen'], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'outdoor',
  },
  c02_ash_hollow: {
    id: 'c02_ash_hollow', name: 'The Ash Hollow', nameEs: 'El barranco de ceniza',
    description: 'A ring of burned tents around a kiln that still breathes heat. The ash-children tend it. The air is thick with ash and the smell of old fire.', descriptionEs: 'Un anillo de tiendas quemadas alrededor de un horno que aún respira calor. Los hijos de la ceniza lo cuidan. El aire está lleno de ceniza y el olor de fuego viejo.',
    connections: ['c02_caravan_camp', 'c02_kiln'],
    objects: [], npcs: ['c02_ash_child'], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'outdoor',
  },
  c02_kiln: {
    id: 'c02_kiln', name: 'The Kiln', nameEs: 'El horno',
    description: 'A stone kiln glowing red behind an iron grate. The heat is dry and old. The riddle-grate waits for an answer.', descriptionEs: 'Un horno de piedra que brilla rojo detrás de una rejilla de hierro. El calor es seco y viejo. La rejilla del enigma espera una respuesta.',
    connections: ['c02_ash_hollow'],
    objects: [{ id: 'c02_kiln_grate', name: 'The Riddle Grate', nameEs: 'La rejilla del enigma', description: 'A grate that asks one question of anyone who would pass.', descriptionEs: 'Una rejilla que hace una pregunta a quien quiera pasar.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'cave',
  },
  c02_courier_trail: {
    id: 'c02_courier_trail', name: 'The Courier\'s Trail', nameEs: 'El sendero del correo',
    description: 'A narrow trail east, following the Iron Parliament\'s post. The salt is thicker here, the ash thinner. Fresh tracks cut through both.', descriptionEs: 'Un sendero estrecho al este, siguiendo la posta del Parlamento de Hierro. La sal es más espesa aquí, la ceniza más delgada. Huellas frescas cruzan ambas.',
    connections: ['c02_caravan_camp'],
    objects: [], npcs: ['c02_iron_courier'], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'forest',
  },
  c02_salt_flats: {
    id: 'c02_salt_flats', name: 'The Salt Flats', nameEs: 'Los saladares',
    description: 'A flat white stretch where the wind never stops. The salt-storm rolls in from the north. The Wicker Wraiths rise from the ash here.', descriptionEs: 'Un tramo plano y blanco donde el viento nunca se detiene. La tormenta de sal llega del norte. Los Espectros de Mimbre se alzan de la ceniza aquí.',
    connections: ['c02_caravan_camp'],
    objects: [], npcs: [], enemies: ['c02_wicker_wraith', 'c02_bound_debtor_monster'], dangerLevel: 3, discovered: false, secrets: [], ambiance: 'outdoor',
  },
};

const NPCS: Record<string, NPC> = {
  c02_olen: {
    id: 'c02_olen', name: 'Olen', nameEs: 'Olen', portrait: 'caravaneer', faction: 'salt_compact', location: 'c02_caravan_camp', disposition: 10,
    knowledge: ['oath_vessels', 'salt_road', 'iron_parliament'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'Olen counts her crates without looking up. "The road took three voices from your village. I have the receipt. The question is whether you can read it."', textEs: 'Olen cuenta sus cajas sin levantar la vista. «El camino tomó tres voces de tu aldea. Tengo el recibo. La pregunta es si sabes leerlo».', responses: [{ text: 'I can read it.', textEs: 'Sé leerlo.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Caravan-master', occupationEs: 'Maestra de caravana', secrets: ['She left her own row off the map'], secretsEs: ['Dejó su propia fila fuera del mapa'], personality: 'Practical, sharp, and honest about her gaps', personalityEs: 'Práctica, aguda y honesta sobre sus huecos',
  },
  c02_iron_courier: {
    id: 'c02_iron_courier', name: 'The Iron Parliament Courier', nameEs: 'La correo del Parlamento de Hierro', portrait: 'courier', faction: 'iron_parliament', location: 'c02_courier_trail', disposition: 0,
    knowledge: ['iron_parliament', 'oath_vessels', 'ledger_value'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'A rider in Iron Parliament livery sits her horse at the trail\'s end. "Olen\'s ledger is a map of oath-vessels. The Parliament wants it. So does the road. So do you."', textEs: 'Una jinete con librea del Parlamento de Hierro sienta su caballo al final del sendero. «El registro de Olen es un mapa de vasijas de juramento. El Parlamento lo quiere. El camino también. Y tú».', responses: [{ text: 'What is the price?', textEs: '¿Cuál es el precio?', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Courier', occupationEs: 'Correo', secrets: [], secretsEs: [], personality: 'Professional and noncommittal', personalityEs: 'Profesional y evasiva',
  },
  c02_ash_child: {
    id: 'c02_ash_child', name: 'The Ash-Child', nameEs: 'El hijo de la ceniza', portrait: 'refugee', faction: 'free_witnesses', location: 'c02_ash_hollow', disposition: 5,
    knowledge: ['free_witnesses', 'kiln_riddle', 'ash_seed'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'A thin figure wrapped in ash-cloth speaks: "We plant what the fire took, and what grows is ours. No ledger, no road, no court can take it."', textEs: 'Una figura delgada envuelta en tela de ceniza habla: «Plantamos lo que el fuego tomó, y lo que crece es nuestro. Ningún registro, ningún camino, ninguna corte puede llevarlo».', responses: [{ text: 'I will plant with you.', textEs: 'Plantaré con vosotros.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Witness', occupationEs: 'Testigo', secrets: [], secretsEs: [], personality: 'Quiet and deliberate', personalityEs: 'Callado y deliberado',
  },
};

const MONSTERS: Record<string, Omit<Enemy, 'id'>> = {
  c02_wicker_wraith: {
    templateId: 'c02_wicker_wraith', name: 'Wicker Wraith', nameEs: 'Espectro de Mimbre', portrait: 'wraith', hp: 14, maxHp: 14, ac: 12, attack: 15, damage: '2d6', damageType: 'necrotic', abilities: ['Wicker Weave', 'Ash Step'], abilitiesEs: ['Trama de Mimbre', 'Paso de Ceniza'], xpValue: 120, loot: [], intelligence: 8, morale: 80, conditions: [],
  },
  c02_bound_debtor_monster: {
    templateId: 'c02_bound_debtor_monster', name: 'Bound Debtor', nameEs: 'Deudor Atado', portrait: 'debtor', hp: 10, maxHp: 10, ac: 10, attack: 12, damage: '1d8', damageType: 'slashing', abilities: ['Chain Drag'], abilitiesEs: ['Arrastre de Cadenas'], xpValue: 60, loot: [], intelligence: 7, morale: 40, conditions: [],
  },
};

const QUESTS: Record<string, Quest> = {
  c02_the_salt_road: {
    id: 'c02_the_salt_road', name: 'The Salt Road', nameEs: 'El camino de sal',
    description: 'Find the ledger that binds a voice to a vessel and decide the fate of the first true map of oath-vessels.', descriptionEs: 'Encuentra el registro que ata una voz a una vasija y decide el destino del primer mapa verdadero de vasijas de juramento.',
    state: 'active', isMain: true, faction: 'salt_compact',
    objectives: [
      { id: 'c02_reach_caravan', description: 'Reach the Salt Compact caravan', descriptionEs: 'Alcanza la caravana del Pacto de Sal', completed: false, current: 0, required: 1 },
      { id: 'c02_read_ledger', description: 'Read or leave the sealed cargo', descriptionEs: 'Lee o deja la carga sellada', completed: false, current: 0, required: 1 },
      { id: 'c02_cross_storm', description: 'Cross the salt-storm with the map', descriptionEs: 'Cruza la tormenta de sal con el mapa', completed: false, current: 0, required: 1 },
    ],
    rewards: [{ type: 'xp', value: 400 }, { type: 'reputation', value: 10, factionId: 'salt_compact' }],
  },
};

export const CHAPTER_TWO: Chapter = {
  id: 'chapter-02', index: 2,
  title: 'The Road of Salt and Ash', titleEs: 'El camino de sal y ceniza',
  premise: 'Refugees and salt caravans crowd the north road. A Salt Compact caravan-master holds the only ledger that binds a voice to a vessel — the first true map of oath-vessels — and before the week is out she will sell it, trade it, or burn it.',
  premiseEs: 'Refugiados y caravanas de sal llenan el camino al norte. La maestra de una caravana del Pacto de Sal guarda el único registro que ata una voz a una vasija — el primer mapa verdadero de vasijas de juramento — y antes de que acabe la semana lo venderá, lo canjeará o lo quemará.',
  intro: [
    { type: 'system', text: 'CHAPTER II — THE ROAD OF SALT AND ASH', textEs: 'CAPÍTULO II — EL CAMINO DE SAL Y CENIZA', mood: 'mystery' },
    { type: 'narration', text: '{name} leaves Blackmere on the north road. The air tastes of salt and ash. Somewhere ahead, a caravan-master named Olen carries a ledger that binds every voice to its vessel — the first true map of oath-vessels. Before the week is out, she will sell it, trade it, or burn it.', textEs: '{name} deja Blackmere por el camino del norte. El aire sabe a sal y ceniza. En algún punto más adelante, una maestra de caravana llamada Olen lleva un registro que ata cada voz a su vasija — el primer mapa verdadero de vasijas de juramento. Antes de que acabe la semana, lo venderá, lo canjeará o lo quemará.', mood: 'neutral' },
    { type: 'system', text: 'CURRENT OBJECTIVE — Reach the Salt Compact caravan and find the ledger.', textEs: 'OBJETIVO ACTUAL — Alcanza la caravana del Pacto de Sal y encuentra el registro.', mood: 'neutral' },
  ],
  startNodeId: 'c02_arrival', startLocationId: 'c02_north_road',
  nodes: NODES,
  puzzles: { c02_cargo_ledger: CARGO_LEDGER, c02_kiln_riddle: KILN_RIDDLE },
  locations: LOCATIONS, npcs: NPCS, monsters: MONSTERS, quests: QUESTS,
  mainQuestId: 'c02_the_salt_road',
  hooks: { bossLocationId: 'c02_salt_flats', aftermathNodeId: 'c02_wicker_aftermath' },
  storyFacts: [
    { flag: 'c02_cargo_read', en: 'The party broke the cargo seals', es: 'El grupo rompió los sellos de la carga' },
    { flag: 'c02_seals_intact', en: 'The party left the seals whole', es: 'El grupo dejó los sellos intactos' },
    { flag: 'c02_voice_token', en: 'The party decoded the cargo ledger and holds a voice token', es: 'El grupo descifró el registro de carga y tiene un token de voz' },
    { flag: 'c02_kiln_answer', en: 'The party answered the kiln riddle', es: 'El grupo respondió al enigma del horno' },
    { flag: 'c02_olen_trust', en: 'Olen trusted the party with the ledger', es: 'Olen confió en el grupo con el registro' },
  ],
  suggestions: {
    c02_north_road: [
      { label: 'Approach the caravan', labelEs: 'Acercarse a la caravana', action: 'go to caravan' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c02_caravan_camp: [
      { label: 'Speak with Olen', labelEs: 'Hablar con Olen', action: 'talk to olen' },
      { label: 'Take the caravan road', labelEs: 'Tomar el camino de la caravana', action: 'go to caravan road' },
      { label: 'Descend to the ash-hollow', labelEs: 'Bajar al barranco de ceniza', action: 'go to ash hollow' },
      { label: 'Follow the courier\'s trail', labelEs: 'Seguir el sendero del correo', action: 'go to courier trail' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c02_ash_hollow: [
      { label: 'Approach the kiln', labelEs: 'Acercarse al horno', action: 'go to kiln' },
      { label: 'Return to the camp', labelEs: 'Volver al campamento', action: 'go to caravan camp' },
    ],
    c02_kiln: [
      { label: 'Return to the hollow', labelEs: 'Volver al barranco', action: 'go to ash hollow' },
    ],
    c02_courier_trail: [
      { label: 'Return to the camp', labelEs: 'Volver al campamento', action: 'go to caravan camp' },
    ],
    c02_salt_flats: [
      { label: 'Fight the Wicker Wraiths', labelEs: 'Luchar contra los Espectros de Mimbre', action: 'attack' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
  },
  externalEntrySeeds: {
    c02_wicker_aftermath: [
      { c02_voice_token: true },
      { c02_kiln_answer: true },
    ],
  },
  summaryFlags: [
    'canon:c02_map_shared', 'canon:c02_map_burned', 'canon:c02_ash_seed',
    'canon:c02_evidence_ledger', 'c02_voice_token', 'c02_kiln_answer',
    'c02_olen_trust', 'c02_cargo_read', 'c02_seals_intact',
  ],
};