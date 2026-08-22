// ============================================================
// CHAPTER IV — The Forest That Remembers Names
// El bosque que recuerda nombres
// Act II opener. Beyond the last road a wood stores the names
// surrendered as an oath price. The Keepers of Names govern the
// register; to take a name back you must give another — one
// someone still holds. Four endings close the wood.
// ============================================================

import type { Chapter, StoryNode } from '../../engine/chapter';
import type { Puzzle } from '../../engine/puzzles';
import type { WorldLocation, NPC, Enemy, Quest } from '../../engine/types';

// ---- Puzzles -------------------------------------------------

const ROOTS_WEAVE: Puzzle = {
  id: 'c04_roots_weave',
  kind: 'mechanism',
  title: 'The Roots Weave',
  titleEs: 'El tejido de raíces',
  prompt: 'Three roots grow across the name-register, and the moss parts only when they are plaited in the right order. Plait them wrong and the roots twist back; plait them right and the name shows through.',
  promptEs: 'Tres raíces crecen sobre el registro de nombres, y el musgo solo se aparta cuando se trenzan en el orden correcto. Trenza mal y las raíces se retuercen; trenza bien y el nombre asoma.',
  hints: [
    { en: 'The oldest root goes first — it has held the name the longest.', es: 'La raíz más antigua va primero: es la que más tiempo ha sostenido el nombre.' },
    { en: 'The deepest root goes second — it drinks from the water the name was written in.', es: 'La raíz más profunda va segunda: bebe del agua en la que el nombre fue escrito.' },
    { en: 'The named root goes last — it is the one that still answers to a living voice.', es: 'La raíz nombrada va al final: es la que aún responde a una voz viva.' },
  ],
  steps: ['c04_root_oldest', 'c04_root_deepest', 'c04_root_named'],
  ordered: true,
  stepLabels: [
    { id: 'c04_root_oldest', label: 'Plait the oldest root', labelEs: 'Trenzar la raíz más antigua' },
    { id: 'c04_root_deepest', label: 'Plait the deepest root', labelEs: 'Trenzar la raíz más profunda' },
    { id: 'c04_root_named', label: 'Plait the named root', labelEs: 'Trenzar la raíz nombrada' },
  ],
  onWrongStep: { en: 'The roots twist back into the moss. The order is lost; you may begin again.', es: 'Las raíces se retuercen de vuelta al musgo. El orden se pierde; puedes empezar de nuevo.' },
  unlocks: { flags: { c04_roots_aligned: true } },
  solvedNodeId: 'c04_roots_woven',
  skipNodeId: 'c04_roots_skipped',
};

const BREATH_RIDDLE: Puzzle = {
  id: 'c04_breath_riddle',
  kind: 'riddle',
  title: 'The Riddle of Breath',
  titleEs: 'El enigma del aliento',
  prompt: 'The moss-seer asks: what do the dead borrow and the living never lend? Name it, and the name you came for speaks through your own mouth.',
  promptEs: 'La vidente del musgo pregunta: ¿qué toman prestado los muertos y los vivos nunca prestan? Nómbralo, y el nombre que buscas hablará por tu propia boca.',
  hints: [
    { en: 'The dead borrow it to speak; the living lend everything but this.', es: 'Los muertos lo toman prestado para hablar; los vivos prestan todo menos esto.' },
    { en: 'You are spending it right now, and when it ends, so does the word.', es: 'Lo estás gastando ahora mismo, y cuando se acaba, se acaba la palabra.' },
    { en: 'It is the first thing a name carries and the last thing a name costs.', es: 'Es lo primero que un nombre lleva y lo último que un nombre cuesta.' },
  ],
  answers: ['breath', 'a breath', 'the breath', 'aliento', 'el aliento', 'un aliento'],
  answersEs: ['el aliento', 'aliento', 'un aliento'],
  unlocks: { flags: { c04_breath_answered: true } },
  solvedNodeId: 'c04_breath_solved',
  skipNodeId: 'c04_breath_skipped',
};

// ---- Nodes ---------------------------------------------------

const NODES: Record<string, StoryNode> = {
  c04_arrival: {
    id: 'c04_arrival', kind: 'beat', locationId: 'c04_forest_edge', externalEntry: true,
    title: 'The Last Road Ends', titleEs: 'El último camino termina',
    text: 'Beyond the last road the trees lean close, and the air smells of wet moss and old ink. A wood stretches ahead — the Forest That Remembers Names — and somewhere inside it, the name you came for is waiting to be traded back. The path narrows; the village is already behind you.',
    textEs: 'Más allá del último camino los árboles se ciernen, y el aire huele a musgo húmedo y tinta vieja. Un bosque se extiende adelante — el Bosque Que Recuerda Nombres — y en algún punto dentro de él, el nombre que buscas espera para ser recuperado. El sendero se estrecha; la aldea ya queda atrás.',
    choices: [
      { id: 'c04_enter_with_map', label: 'Take the old paths the map showed', labelEs: 'Tomar los senderos antiguos que el mapa mostró', nextNodeId: 'c04_roundhouse_gate', requires: [{ flag: 'canon:c02_map_shared' }], result: 'The map Olen shared still holds the old paths. You slip between the trees without a sound.', resultEs: 'El mapa que Olen compartió aún guarda los senderos antiguos. Te deslizas entre los árboles sin un sonido.' },
      { id: 'c04_enter_bare', label: 'Walk in openly', labelEs: 'Entrar abiertamente', nextNodeId: 'c04_roundhouse_gate', result: 'You push through the moss and the branches. The wood takes note of every step.', resultEs: 'Atraviesas el musgo y las ramas. El bosque anota cada paso.' },
    ],
  },

  c04_roundhouse_gate: {
    id: 'c04_roundhouse_gate', kind: 'beat', locationId: 'c04_roundhouse',
    title: "The Keeper's Roundhouse", titleEs: 'La casa redonda de la guardiana',
    text: 'A roundhouse of woven roots sits in a clearing. Moss covers its roof like a green tongue, and a woman in bark-cloth stands at the door, waiting. She is Sylva, the moss-keeper, and she has been expecting you since the first name was surrendered. "Come in," she says. "The register is old, but the rule is older."',
    textEs: 'Una casa redonda de raíces trenzadas se alza en un claro. El musgo cubre su techo como una lengua verde, y una mujer vestida de corteza espera en la puerta. Es Sylva, la guardiana del musgo, y te ha estado esperando desde que el primer nombre fue entregado.\n\n—Pasa —dice—. El registro es antiguo, pero la regla lo es más.',
    choices: [
      { id: 'c04_gate_to_rule', label: 'Enter and hear the rule', labelEs: 'Entrar y oír la regla', nextNodeId: 'c04_keeper_rule', result: 'Sylva leads you inside. The walls are hung with strips of bark, each one a name.', resultEs: 'Sylva te conduce dentro. Las paredes están cubiertas de tiras de corteza, cada una un nombre.' },
    ],
  },

  c04_keeper_rule: {
    id: 'c04_keeper_rule', kind: 'beat', locationId: 'c04_roundhouse',
    title: 'The Only Rule of Trade', titleEs: 'La única regla del trueque',
    text: 'Sylva spreads the register open on the root-table. Every name the wood has ever collected is written in moss-ink on bark. "To take a name back," she says, "you must give one. Not a dead name — one that someone still holds. One that someone still answers to. That is the price, and there is no other."\n\nShe watches you. "Or you can try to break the rule. The wood has broken stronger hands than yours."',
    textEs: 'Sylva extiende el registro sobre la mesa de raíces. Cada nombre que el bosque ha recogido está escrito con tinta de musgo sobre corteza. —Para devolver un nombre —dice— debes dar uno. No un nombre muerto: uno que alguien aún lleve. Uno a cuyo nombre alguien aún responda. Ese es el precio, y no hay otro. —Te observa—. O puedes intentar romper la regla. El bosque ha roto manos más fuertes que las tuyas.',
    choices: [
      { id: 'c04_rule_to_first', label: 'Answer the keeper', labelEs: 'Responder a la guardiana', nextNodeId: 'c04_first_name', result: 'You meet her gaze. The register waits.', resultEs: 'Sostienes su mirada. El registro espera.' },
    ],
  },

  c04_first_name: {
    id: 'c04_first_name', kind: 'beat', locationId: 'c04_roundhouse',
    title: 'The First Name', titleEs: 'El primer nombre',
    text: 'Three paths leave the roundhouse: the root-grove where the names are woven, the hoard-ditch where the hoarded names rot, and the memory-cage where the wood keeps the names it has not yet traded. Sylva waits for your word. "Choose," she says. "The name you came for is behind one of these doors. The price is behind the other two."',
    textEs: 'Tres caminos salen de la casa redonda: la arboleda de raíces donde los nombres se trenzan, la fosa donde los nombres acumulados se pudren, y la jaula de memoria donde el bosque guarda los nombres que aún no ha trocado. Sylva espera tu palabra. —Elige —dice—. El nombre que buscas está detrás de una de esas puertas. El precio está detrás de las otras dos.',
    choices: [
      { id: 'c04_give_name', label: 'Surrender a live name and trade in the root-grove', labelEs: 'Entregar un nombre vivo y trocar en la arboleda de raíces', nextNodeId: 'c04_roundhouse_trade', setsFlags: { c04_name_given: true }, adjustsValues: { bond_sylva: 1, conviction_duty: 1 }, result: 'You offer a name someone still holds. Sylva nods; the trade may proceed.', resultEs: 'Ofreces un nombre que alguien aún lleva. Sylva asiente; el trueque puede proceder.' },
      { id: 'c04_break_rule', label: 'Break the rule — go to the hoard-ditch', labelEs: 'Romper la regla — ir a la fosa', nextNodeId: 'c04_ditch_entry', setsFlags: { c04_rule_broken: true }, adjustsValues: { conviction_freedom: 1 }, result: 'You will not pay the price. The ditch is where the hoarded names are kept, unguarded.', resultEs: 'No pagarás el precio. La fosa guarda los nombres acumulados, sin guardia.' },
      { id: 'c04_seek_cage', label: 'Seek the memory-cage — the name the wood has not yet traded', labelEs: 'Buscar la jaula de memoria — el nombre que el bosque aún no ha trocado', nextNodeId: 'c04_cage_entry', setsFlags: { c04_cage_chosen: true }, adjustsValues: { conviction_truth: 1 }, result: 'You go to the cage where the untraded names wait. Perhaps the name you need was never paid for at all.', resultEs: 'Vas a la jaula donde los nombres sin trocar esperan. Quizá el nombre que necesitas nunca fue pagado.' },
    ],
  },

  c04_roundhouse_trade: {
    id: 'c04_roundhouse_trade', kind: 'beat', locationId: 'c04_root_grove',
    title: 'The Trade Begins', titleEs: 'El trueque comienza',
    text: 'The root-grove is a clearing where the names grow in the moss itself. Sylva leads you to the oldest patch, where three roots cross over a single strip of bark. "Plait them in the right order," she says, "and the name shows through. Plait them wrong and the roots remember nothing."',
    textEs: 'La arboleda de raíces es un claro donde los nombres crecen en el propio musgo. Sylva te lleva al parche más antiguo, donde tres raíces se cruzan sobre una sola tira de corteza. —Trenza en el orden correcto —dice— y el nombre asoma. Trenza mal y las raíces no recuerdan nada.',
    choices: [
      { id: 'c04_trade_to_roots', label: 'Plait the roots', labelEs: 'Trenzar las raíces', nextNodeId: 'c04_roots_puzzle', result: 'You kneel at the root-table. Three roots wait to be plaited.', resultEs: 'Te arrodillas junto a la mesa de raíces. Tres raíces esperan ser trenzadas.' },
      { id: 'c04_trade_back', label: 'Return to the roundhouse', labelEs: 'Volver a la casa redonda', nextNodeId: 'c04_first_name', result: 'You step back. The roots are still.', resultEs: 'Retrocedes. Las raíces siguen quietas.' },
    ],
  },

  c04_roots_puzzle: {
    id: 'c04_roots_puzzle', kind: 'puzzle', puzzleId: 'c04_roots_weave', locationId: 'c04_root_grove',
    title: 'The Roots Weave', titleEs: 'El tejido de raíces',
    text: 'Three roots lie across the bark. The moss waits for the right plait.',
    textEs: 'Tres raíces yacen sobre la corteza. El musgo espera el trenzado correcto.',
    choices: [],
  },

  c04_roots_woven: {
    id: 'c04_roots_woven', kind: 'beat', locationId: 'c04_root_grove',
    title: 'The Name Shows Through', titleEs: 'El nombre asoma',
    text: 'The third root turns and the moss parts. A name shows through the bark — the name of the Tenth Door itself, written in the oldest ink the wood keeps. Sylva touches it gently. "Now you have it," she says. "But having is not keeping. The Hunger will come for it, and you must answer it."',
    textEs: 'La tercera raíz gira y el musgo se aparta. Un nombre asoma en la corteza — el nombre de la décima puerta misma, escrito con la tinta más antigua del bosque. Sylva lo toca suavemente. —Ahora lo tienes —dice—. Pero tener no es guardar. El Hambre vendrá por él, y deberás responderle.',
    choices: [
      { id: 'c04_roots_to_advice', label: 'Hear Sylva advice before the Hunger', labelEs: 'Oír el consejo de Sylva antes del Hambre', nextNodeId: 'c04_sylva_advice', result: 'Sylva walks with you to the edge of the grove.', resultEs: 'Sylva camina contigo hasta el borde de la arboleda.' },
    ],
  },

  c04_sylva_advice: {
    id: 'c04_sylva_advice', kind: 'beat', locationId: 'c04_root_grove',
    title: "Sylva's Advice", titleEs: 'El consejo de Sylva',
    text: '"The Hunger answers a well-shaped name," Sylva says. "Shape it with breath, and the breath will answer. The moss-seer in the grove knows the riddle — what the dead borrow and the living never lend. Answer her, and the name will speak through your own mouth before the Hunger comes."\n\nShe looks south. "Or face it raw. The relic you carry may ward it, if you carry one."',
    textEs: '—El Hambre responde a un nombre bien formado —dice Sylva—. Fórmalo con aliento, y el aliento responderá. La vidente del musgo en la arboleda conoce el enigma — lo que los muertos toman prestado y los vivos nunca prestan. Respóndele, y el nombre hablará por tu propia boca antes de que el Hambre llegue. —Mira al sur—. O enfréntalo en crudo. La reliquia que llevas puede protegerte de ella, si llevas una.',
    choices: [
      { id: 'c04_advice_to_assembly', label: 'Go to the clearing where the paths meet', labelEs: 'Ir al claro donde los caminos se cruzan', nextNodeId: 'c04_assembly', result: 'You walk to the clearing where the three paths meet.', resultEs: 'Caminas al claro donde los tres caminos se cruzan.' },
    ],
  },

  c04_roots_skipped: {
    id: 'c04_roots_skipped', kind: 'beat', locationId: 'c04_root_grove',
    title: 'The Roots Stay Tangled', titleEs: 'Las raíces siguen enredadas',
    text: 'You leave the roots as they are. The name stays behind the moss, and the wood does not offer it twice. Sylva does not reproach you; she only points south. "The Hunger still comes," she says. "Meet it without the name if you must."',
    textEs: 'Dejas las raíces como están. El nombre se queda detrás del musgo, y el bosque no lo ofrece dos veces. Sylva no te reprocha nada; solo señala al sur. —El Hambre sigue viniendo —dice—. Encuéntrala sin el nombre si debes.',
    choices: [
      { id: 'c04_skipped_to_assembly', label: 'Go to the clearing', labelEs: 'Ir al claro', nextNodeId: 'c04_assembly', result: 'You walk to the clearing without the name.', resultEs: 'Caminas al claro sin el nombre.' },
    ],
  },

  c04_ditch_entry: {
    id: 'c04_ditch_entry', kind: 'beat', locationId: 'c04_hoard_ditch',
    title: 'The Hoard-Ditch', titleEs: 'La fosa del acopio',
    text: 'The hoard-ditch is a cut in the earth where the wood keeps the names it has hoarded — names no one came to trade, names the rule never freed. They rot in the mud, half-legible. Sylva does not follow you here. "The ditch is not mine," she calls from above. "Take what you can. The wood will not stop you. But the Hunger will know."',
    textEs: 'La fosa del acopio es un corte en la tierra donde el bosque guarda los nombres que ha acumulado — nombres que nadie vino a trocar, nombres que la regla nunca liberó. Se pudren en el barro, casi ilegibles. Sylva no te sigue. —La fosa no es mía —llama desde arriba—. Toma lo que puedas. El bosque no te detendrá. Pero el Hambre lo sabrá.',
    choices: [
      { id: 'c04_ditch_descend', label: 'Descend into the ditch', labelEs: 'Bajar a la fosa', nextNodeId: 'c04_ditch_depths', result: 'You climb down into the mud. Names stick to your hands.', resultEs: 'Bajas al barro. Los nombres se te pegan a las manos.' },
      { id: 'c04_ditch_back', label: 'Return to the roundhouse', labelEs: 'Volver a la casa redonda', nextNodeId: 'c04_first_name', result: 'You climb back. The ditch keeps its hoard.', resultEs: 'Vuelves arriba. La fosa guarda su acopio.' },
    ],
  },

  c04_ditch_depths: {
    id: 'c04_ditch_depths', kind: 'beat', locationId: 'c04_hoard_ditch',
    title: 'The Depths of the Ditch', titleEs: 'Lo profundo de la fosa',
    text: 'At the bottom of the ditch, among the rotting bark, you find a name that still has shape — the name of the Tenth Door, half-faded but legible. The moss around it is dead. Whatever kept this name did not trade it; it simply held it until the holder was gone.',
    textEs: 'Al fondo de la fosa, entre la corteza podrida, encuentras un nombre que aún tiene forma — el nombre de la décima puerta, casi borrado pero legible. El musgo a su alrededor está muerto. Quien guardó este nombre no lo trocó; solo lo sostuvo hasta que el guardián se fue.',
    choices: [
      { id: 'c04_depths_to_hoarder', label: 'Search for the hoarder', labelEs: 'Buscar al acopiador', nextNodeId: 'c04_hoarder', result: 'You look for whoever left the name in the ditch.', resultEs: 'Buscas a quien dejó el nombre en la fosa.' },
      { id: 'c04_depths_to_assembly', label: 'Take the name and go to the clearing', labelEs: 'Tomar el nombre e ir al claro', nextNodeId: 'c04_assembly', result: 'You pull the name from the mud. The ditch keeps its silence.', resultEs: 'Arrancas el nombre del barro. La fosa guarda su silencio.' },
    ],
  },

  c04_hoarder: {
    id: 'c04_hoarder', kind: 'beat', locationId: 'c04_hoard_ditch',
    title: 'The Hoarder', titleEs: 'El acopiador',
    text: 'A shape moves at the edge of the ditch — not the Hunger, but a keeper who stayed too long. It does not speak; it only holds a strip of bark to its chest and watches you take the name. "You can take it," Sylva calls from above, "but the wood remembers who held it last. The Hunger will come for what was hoarded, not what was traded."',
    textEs: 'Una figura se mueve al borde de la fosa — no el Hambre, sino un guardián que se quedó demasiado tiempo. No habla; solo sostiene una tira de corteza contra su pecho y te observa tomar el nombre. —Puedes tomarlo —llama Sylva desde arriba—, pero el bosque recuerda quién lo sostuvo por último. El Hambre vendrá por lo acumulado, no por lo trocado.',
    choices: [
      { id: 'c04_hoarder_to_assembly', label: 'Take the name to the clearing', labelEs: 'Llevar el nombre al claro', nextNodeId: 'c04_assembly', result: 'You leave the hoarder behind. The name is in your hands.', resultEs: 'Dejas al acopiador atrás. El nombre está en tus manos.' },
    ],
  },

  c04_cage_entry: {
    id: 'c04_cage_entry', kind: 'beat', locationId: 'c04_memory_cage',
    title: 'The Memory-Cage', titleEs: 'La jaula de memoria',
    text: 'The memory-cage is a lattice of living roots, shaped like a cage for birds that never learned to fly. Inside it, strips of bark hang like wind-chimes, each one a name the wood has not yet traded. Some are old; some are new. The oldest one, at the center, is the name of the Tenth Door — still bright, still green, still waiting for its price.',
    textEs: 'La jaula de memoria es un enrejado de raíces vivas, formado como una jaula para pájaros que nunca aprendieron a volar. Dentro, tiras de corteza cuelgan como carrillones, cada una un nombre que el bosque aún no ha trocado. Algunos son antiguos; otros, nuevos. El más antiguo, en el centro, es el nombre de la décima puerta — aún brillante, aún verde, aún esperando su precio.',
    choices: [
      { id: 'c04_cage_enter', label: 'Enter the cage', labelEs: 'Entrar en la jaula', nextNodeId: 'c04_cage_inner', result: 'You step through the lattice. The bark chimes stir.', resultEs: 'Atraviesas el enrejado. Las cortezas se agitan.' },
      { id: 'c04_cage_back', label: 'Return to the roundhouse', labelEs: 'Volver a la casa redonda', nextNodeId: 'c04_first_name', result: 'You step back from the cage. The names chime softly.', resultEs: 'Retrocedes de la jaula. Los nombres suenan suavemente.' },
    ],
  },

  c04_cage_inner: {
    id: 'c04_cage_inner', kind: 'beat', locationId: 'c04_memory_cage',
    title: 'Inside the Memory-Cage', titleEs: 'Dentro de la jaula de memoria',
    text: 'Inside the cage the air is thick with names. The one you need hangs at the center, green and untraded. Sylva stands outside the lattice. "It was never paid for," she says. "The wood held it for the one who would come. That is you, or it is no one.\n\nTake it — but the Hunger will know you took what was not traded, and it will come harder."',
    textEs: 'Dentro de la jaula el aire se espesa con nombres. El que necesitas cuelga en el centro, verde y sin trocar. Sylva se mantiene fuera del enrejado. —Nunca fue pagado —dice—. El bosque lo guardó para quien viniera. Eres tú, o no es nadie. Tómalo — pero el Hambre sabrá que tomaste lo que no fue trocado, y vendrá con más fuerza.',
    choices: [
      { id: 'c04_cage_to_memory', label: 'Hold the name and remember what it cost', labelEs: 'Sostener el nombre y recordar lo que costó', nextNodeId: 'c04_cage_memory', result: 'You touch the bark. The name is warm.', resultEs: 'Tocas la corteza. El nombre está caliente.' },
      { id: 'c04_cage_to_assembly', label: 'Take the name to the clearing', labelEs: 'Llevar el nombre al claro', nextNodeId: 'c04_assembly', result: 'You pull the name from the lattice and walk south.', resultEs: 'Arrancas el nombre del enrejado y caminas al sur.' },
    ],
  },

  c04_cage_memory: {
    id: 'c04_cage_memory', kind: 'beat', locationId: 'c04_memory_cage',
    title: 'The Memory in the Cage', titleEs: 'El recuerdo en la jaula',
    text: 'The name remembers everything it was before the wood held it. You see the Tenth Door as it was meant to be — not a debt, but a threshold. The memory is brief and it is not yours to keep, but it tells you what the name is for. Sylva watches from outside. "Now you know its shape," she says. "The Hunger will test whether you can hold it."',
    textEs: 'El nombre recuerda todo lo que fue antes de que el bosque lo guardara. Ves la décima puerta como debía ser — no una deuda, sino un umbral. El recuerdo es breve y no es tuyo de guardar, pero te dice para qué es el nombre. Sylva observa desde fuera. —Ahora conoces su forma —dice—. El Hambre pondrá a prueba si puedes sostenerlo.',
    choices: [
      { id: 'c04_memory_to_assembly', label: 'Go to the clearing', labelEs: 'Ir al claro', nextNodeId: 'c04_assembly', result: 'You carry the name and its memory south.', resultEs: 'Llevas el nombre y su recuerdo al sur.' },
    ],
  },

  c04_assembly: {
    id: 'c04_assembly', kind: 'beat', locationId: 'c04_forest_edge',
    title: 'The Clearing', titleEs: 'El claro',
    text: 'All three paths meet at a clearing at the edge of the wood. The moss-seer sits by a well of black water, and the Hunger waits somewhere in the trees.\n\nSylva joins you. "You can shape the name with breath — the moss-seer knows the riddle. Or you can face the Hunger with the relic you carry. Or you can take it raw, and pay the full price. Choose."',
    textEs: 'Los tres caminos se cruzan en un claro en el borde del bosque. La vidente del musgo se sienta junto a un pozo de agua negra, y el Hambre espera en algún punto entre los árboles. Sylva se une a ti. —Puedes formar el nombre con aliento — la vidente conoce el enigma. O puedes enfrentar al Hambre con la reliquia que llevas. O puedes tomarlo en crudo, y pagar el precio completo. Elige.',
    choices: [
      { id: 'c04_to_breath', label: 'Go to the moss-seer and the breath riddle', labelEs: 'Ir a la vidente del musgo y el enigma del aliento', nextNodeId: 'c04_breath_puzzle', result: 'You approach the moss-seer by the black well.', resultEs: 'Te acercas a la vidente del musgo junto al pozo negro.' },
      { id: 'c04_to_seer', label: 'Sit with the moss-seer and hear the rite', labelEs: 'Sentarse con la vidente del musgo y oír el rito', nextNodeId: 'c04_moss_seer', result: 'You sit by the well. The moss-seer opens her eyes.', resultEs: 'Te sientas junto al pozo. La vidente del musgo abre los ojos.' },
      { id: 'c04_to_hunger', label: 'Go to the Hunger', labelEs: 'Ir al Hambre', nextNodeId: 'c04_hunger_call', result: 'You walk toward the trees where the Hunger waits.', resultEs: 'Caminas hacia los árboles donde el Hambre espera.' },
    ],
  },

  c04_breath_puzzle: {
    id: 'c04_breath_puzzle', kind: 'puzzle', puzzleId: 'c04_breath_riddle', locationId: 'c04_forest_edge',
    title: 'The Riddle of Breath', titleEs: 'El enigma del aliento',
    text: 'The moss-seer speaks her riddle over the black well.',
    textEs: 'La vidente del musgo pronuncia su enigma sobre el pozo negro.',
    choices: [],
  },

  c04_breath_solved: {
    id: 'c04_breath_solved', kind: 'beat', locationId: 'c04_forest_edge',
    title: 'The Breath Answers', titleEs: 'El aliento responde',
    text: 'The word "breath" settles into the well, and the black water takes it. The name you came for speaks through your own mouth — not in the moss-ink, but in the air you breathe. The Hunger will not come for a name shaped by breath; it has nothing to bite. Sylva nods. "You have the name. Now choose what to do with it."',
    textEs: 'La palabra «aliento» se posa en el pozo, y el agua negra la toma. El nombre que buscas habla por tu propia boca — no en la tinta de musgo, sino en el aire que respiras. El Hambre no vendrá por un nombre formado por aliento; no tiene nada que morder. Sylva asiente. —Tienes el nombre. Ahora elige qué hacer con él.',
    choices: [
      { id: 'c04_breath_to_choice', label: 'Go to the name-choice', labelEs: 'Ir a la elección del nombre', nextNodeId: 'c04_name_choice', result: 'You carry the name shaped by breath.', resultEs: 'Llevas el nombre formado por aliento.' },
    ],
  },

  c04_breath_skipped: {
    id: 'c04_breath_skipped', kind: 'beat', locationId: 'c04_forest_edge',
    title: 'The Riddle Left Unanswered', titleEs: 'El enigma sin respuesta',
    text: 'You leave the riddle unspoken. The name stays in the bark, unshaped by breath. The Hunger will come for it raw, and the price will be the full one. Sylva does not stop you. "Some names are worth the full cost," she says. "Yours may be one."',
    textEs: 'Dejas el enigma sin responder. El nombre se queda en la corteza, sin darle forma con el aliento. El Hambre vendrá por él en crudo, y el precio será el completo. Sylva no te detiene. —Algunos nombres valen el precio completo —dice—. El tuyo quizá sea uno.',
    choices: [
      { id: 'c04_breath_skip_to_choice', label: 'Go to the name-choice', labelEs: 'Ir a la elección del nombre', nextNodeId: 'c04_name_choice', result: 'You carry the name unshaped.', resultEs: 'Llevas el nombre sin formar.' },
    ],
  },

  c04_moss_seer: {
    id: 'c04_moss_seer', kind: 'beat', locationId: 'c04_forest_edge',
    title: 'The Moss-Seer', titleEs: 'La vidente del musgo',
    text: 'The moss-seer is older than Sylva, older than the register. She sits by the black well and her eyes are closed. "I do not speak the riddle twice," she says without opening them. "But I can hold the name while you decide. The rite is simple: breathe over the well, and the name settles in your breath instead of the bark. The Hunger cannot bite what is breathed, only what is held."\n\nShe opens one eye. "Or you can go to the Hunger with what you carry. The relic wards things the breath cannot."',
    textEs: 'La vidente del musgo es más antigua que Sylva, más antigua que el registro. Se sienta junto al pozo negro con los ojos cerrados. —No pronuncio el enigma dos veces —dice sin abrirlos—. Pero puedo sostener el nombre mientras decides. El rito es simple: respira sobre el pozo, y el nombre se posa en tu aliento en vez de en la corteza. El Hambre no puede morder lo respirado, solo lo sostenido. —Abre un ojo—. O puedes ir al Hambre con lo que llevas. La reliquia protege lo que el aliento no puede.',
    choices: [
      { id: 'c04_seer_to_choice', label: 'Let the seer hold the name and go to the choice', labelEs: 'Dejar que la vidente sostenga el nombre e ir a la elección', nextNodeId: 'c04_name_choice', setsFlags: { c04_seer_held: true }, adjustsValues: { conviction_compassion: 1 }, result: 'The seer holds the name over the well. You stand.', resultEs: 'La vidente sostiene el nombre sobre el pozo. Te pones de pie.' },
    ],
  },

  c04_hunger_call: {
    id: 'c04_hunger_call', kind: 'beat', locationId: 'c04_hunger_lair',
    title: 'The Hunger Comes', titleEs: 'El Hambre viene',
    text: 'The Hunger is a shape in the trees, not a body but a need. It smells the name on you and it comes. You can face it in its lair, or you can ward it with the relic you carry, or you can flee to the clearing and face the choice without the fight.',
    textEs: 'El Hambre es una figura en los árboles, no un cuerpo sino una necesidad. Huele el nombre en ti y viene. Puedes enfrentarla en su guarida, o protegerte de ella con la reliquia que llevas, o huir al claro y enfrentar la elección sin la pelea.',
    choices: [
      { id: 'c04_face_hunger', label: 'Face the Hunger in its lair', labelEs: 'Enfrentar el Hambre en su guarida', nextNodeId: 'c04_hunger_aftermath', setsFlags: { c04_hunger_faced: true }, result: 'You step into the lair. The Hunger takes shape.', resultEs: 'Entras en la guarida. El Hambre toma forma.' },
      { id: 'c04_ward_with_relic', label: 'Ward the Hunger with the relic', labelEs: 'Proteger del Hambre con la reliquia', nextNodeId: 'c04_name_choice', requires: [{ flag: 'canon:c01_relic_claimed' }], result: 'The relic burns in your hand and the Hunger flinches. You walk past it to the clearing.', resultEs: 'La reliquia arde en tu mano y el Hambre retrocede. Pasas junto a él hacia el claro.' },
      { id: 'c04_skip_hunger', label: 'Flee to the clearing', labelEs: 'Huir al claro', nextNodeId: 'c04_name_choice', result: 'You turn and run. The Hunger follows but does not catch you — yet.', resultEs: 'Te das la vuelta y corres. El Hambre te sigue pero no te alcanza — todavía.' },
    ],
  },

  c04_hunger_aftermath: {
    id: 'c04_hunger_aftermath', kind: 'beat', locationId: 'c04_hunger_lair', externalEntry: true,
    title: 'The Hunger Fed', titleEs: 'El Hambre saciado',
    text: 'The Hunger is down. Its shape dissolves into the moss and the bark, and the name you carried is still in your hands. The wood is quiet. Sylva waits at the edge of the lair. "You answered it with steel," she says. "The name is yours now. Choose what to do with it."',
    textEs: 'El Hambre cae. Su forma se disuelve en el musgo y la corteza, y el nombre que llevabas sigue en tus manos. El bosque queda en silencio. Sylva espera en el borde de la guarida. —Lo respondiste con acero —dice—. El nombre es tuyo ahora. Elige qué hacer con él.',
    choices: [
      { id: 'c04_aftermath_to_choice', label: 'Go to the name-choice', labelEs: 'Ir a la elección del nombre', nextNodeId: 'c04_name_choice', result: 'You walk to the clearing with the name in your hands.', resultEs: 'Caminas al claro con el nombre en las manos.' },
    ],
  },

  c04_name_choice: {
    id: 'c04_name_choice', kind: 'beat', locationId: 'c04_forest_edge',
    title: 'The Name in Your Hands', titleEs: 'El nombre en tus manos',
    text: 'All paths have led here. The name of the Tenth Door is in your hands — traded, hoarded, or remembered. Sylva stands by the well. "You can return it to the register — I will keep it for the one who comes next. You can refuse the trade and leave it free — the wood will not hold it again. You can bind it to your own name — the price becomes your own. Or you can burn the register and free every name the wood has ever held. Choose."',
    textEs: 'Todos los caminos llevan aquí. El nombre de la décima puerta está en tus manos — trocado, acumulado o recordado. Sylva se mantiene junto al pozo. —Puedes devolverlo al registro — lo guardaré para quien venga después. Puedes rechazar el trueque y dejarlo libre — el bosque no lo sostendrá otra vez. Puedes atarlo a tu propio nombre — el precio se vuelve tuyo. O puedes quemar el registro y liberar cada nombre que el bosque haya guardado. Elige.',
    choices: [
      { id: 'c04_recover_name', label: 'Return the name to the register', labelEs: 'Devolver el nombre al registro', nextNodeId: 'c04_ending_recover', setsFlags: { 'canon:c04_name_returned': true, 'canon:c04_evidence_name': true }, adjustsValues: { bond_sylva: 1, conviction_duty: 1 }, result: 'You hand the name to Sylva. She lays it in the register, face up, and the moss closes around it gently.', resultEs: 'Entregas el nombre a Sylva. Lo deposita en el registro, boca arriba, y el musgo lo envuelve suavemente.' },
      { id: 'c04_refuse_trade', label: 'Refuse the trade — leave the name free', labelEs: 'Rechazar el trueque — dejar el nombre libre', nextNodeId: 'c04_ending_refuse', setsFlags: { 'canon:c04_name_free': true, 'canon:c04_evidence_name': true }, adjustsValues: { conviction_freedom: 1 }, result: 'You set the name free. It lifts from the bark and the moss and goes where it will.', resultEs: 'Dejas el nombre libre. Se eleva de la corteza y el musgo y va a donde quiera.' },
      { id: 'c04_self_bind', label: 'Bind the name to your own', labelEs: 'Atar el nombre al tuyo', nextNodeId: 'c04_ending_selfbound', setsFlags: { 'canon:c04_selfbound': true, 'canon:c04_evidence_name': true }, adjustsValues: { conviction_truth: 1 }, result: 'You speak your own name over the register. The name of the Door and your name are woven together in the moss.', resultEs: 'Pronuncias tu propio nombre sobre el registro. El nombre de la puerta y el tuyo se trenzan juntos en el musgo.' },
      { id: 'c04_burn_register', label: 'Burn the register and free every name', labelEs: 'Quemar el registro y liberar cada nombre', nextNodeId: 'c04_ending_burn', setsFlags: { 'canon:c04_name_free': true, 'canon:c04_evidence_name': true }, adjustsValues: { faction_keepers_of_names: -1, conviction_freedom: 1 }, result: 'You set the bark alight. Every name the wood ever held rises as smoke.', resultEs: 'Prendes la corteza. Cada nombre que el bosque guardó se eleva como humo.' },
    ],
  },

  c04_ending_recover: {
    id: 'c04_ending_recover', kind: 'ending', terminal: true, choices: [],
    title: 'Recovered', titleEs: 'Recuperado',
    text: 'The name of the Tenth Door is back in the register, and Sylva has sworn to keep it for the one who comes next. The wood closes behind you as you leave, and the moss-ink dries on the bark. The name is not free, but it is kept — and keeping is a kind of love the wood understands.',
    textEs: 'El nombre de la décima puerta está de vuelta en el registro, y Sylva ha jurado guardarlo para quien venga después. El bosque se cierra a tu espalda cuando te vas, y la tinta de musgo se seca en la corteza. El nombre no está libre, pero está guardado — y guardar es una clase de amor que el bosque comprende.',
    outcome: 'success', survivors: ['c04_sylva'], casualties: [],
  },

  c04_ending_refuse: {
    id: 'c04_ending_refuse', kind: 'ending', terminal: true, choices: [],
    title: 'Refused', titleEs: 'Rechazado',
    text: 'You set the name free. It rises from the bark and the moss and goes where names go when no one holds them. Sylva watches it go and does not stop it. "The wood will not hold it again," she says. "It is free — for now. The Hunger will find it eventually, but that is not your concern." You leave the wood lighter than you came.',
    textEs: 'Dejas el nombre libre. Se eleva de la corteza y el musgo y va a donde van los nombres cuando nadie los sostiene. Sylva lo ve ir y no lo detiene. —El bosque no lo guardará otra vez —dice—. Está libre — por ahora. El Hambre lo encontrará al final, pero eso no es tu asunto. Sales del bosque más ligero que cuando entraste.',
    outcome: 'ambiguous', survivors: ['c04_sylva'], casualties: [],
  },

  c04_ending_selfbound: {
    id: 'c04_ending_selfbound', kind: 'ending', terminal: true, choices: [],
    title: 'Self-Bound', titleEs: 'Atado a uno mismo',
    text: 'Your name and the name of the Door are woven together in the moss. Where one goes, the other follows. The wood accepts the binding because the price is paid in full — not with a dead name, but with a living one. Yours. Sylva watches you leave. "When the Door opens," she says, "it will open onto your name. Remember that."',
    textEs: 'Tu nombre y el nombre de la puerta están trenzados juntos en el musgo. A donde va uno, va el otro. El bosque acepta el vínculo porque el precio está pagado por completo — no con un nombre muerto, sino con uno vivo. El tuyo. Sylva te ve marchar. —Cuando la puerta se abra —dice—, se abrirá sobre tu nombre. Recuérdalo.',
    outcome: 'ambiguous', survivors: ['c04_sylva'], casualties: [],
  },

  c04_ending_burn: {
    id: 'c04_ending_burn', kind: 'ending', terminal: true, choices: [],
    title: 'Burned', titleEs: 'Quemado',
    text: 'The register burns. Every name the wood ever held rises as smoke and the moss-ink runs like tears. Sylva stands in the clearing and watches the bark curl and the roots shrink back. She does not stop you. "The names are free," she says. "But the wood will not hold another for a long time. You have burned the keeper as well as the kept." The forest goes quiet behind you.',
    textEs: 'El registro arde. Cada nombre que el bosque guardó se eleva como humo y la tinta de musgo corre como lágrimas. Sylva se mantiene en el claro y mira cómo la corteza se riza y las raíces retroceder. No te detiene. —Los nombres están libres —dice—. Pero el bosque no sostendrá otro durante mucho tiempo. Has quemado al guardián tanto como a lo guardado. El bosque queda en silencio a tu espalda.',
    outcome: 'failure', survivors: [], casualties: ['c04_sylva'],
  },
};

// ---- World ---------------------------------------------------

const LOCATIONS: Record<string, WorldLocation> = {
  c04_forest_edge: {
    id: 'c04_forest_edge', name: 'The Forest Edge', nameEs: 'El borde del bosque',
    description: 'A clearing where the last road meets the wood. A black well sits at the center, and the moss-seer waits beside it.',
    descriptionEs: 'Un claro donde el último camino se encuentra con el bosque. Un pozo negro se sienta en el centro, y la vidente del musgo espera a su lado.',
    connections: ['c04_roundhouse', 'c04_hoard_ditch', 'c04_memory_cage', 'c04_hunger_lair'],
    objects: [{ id: 'c04_black_well', name: 'The Black Well', nameEs: 'El pozo negro', description: 'A well of black water where the moss-seer hears her riddles.', descriptionEs: 'Un pozo de agua negra donde la vidente del musgo escucha sus enigas.', interactable: true, broken: false, hidden: false }],
    npcs: ['c04_moss_seer'], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'forest',
  },
  c04_roundhouse: {
    id: 'c04_roundhouse', name: "The Keeper's Roundhouse", nameEs: 'La casa redonda de la guardiana',
    description: 'A roundhouse of woven roots where Sylva keeps the register. Bark strips cover every wall, each one a name.',
    descriptionEs: 'Una casa redonda de raíces trenzadas donde Sylva guarda el registro. Tiras de corteza cubren cada pared, cada una un nombre.',
    connections: ['c04_forest_edge', 'c04_root_grove'],
    objects: [{ id: 'c04_register', name: 'The Name Register', nameEs: 'El registro de nombres', description: 'A table of roots where every name the wood has collected is written in moss-ink.', descriptionEs: 'Una mesa de raíces donde cada nombre que el bosque ha recogido está escrito con tinta de musgo.', interactable: true, broken: false, hidden: false }],
    npcs: ['c04_sylva'], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'forest',
  },
  c04_root_grove: {
    id: 'c04_root_grove', name: 'The Root Grove', nameEs: 'El arboleda de raíces',
    description: 'A clearing where names grow in the moss. Three roots cross over a single strip of bark where the oldest names are kept.',
    descriptionEs: 'Un claro donde los nombres crecen en el musgo. Tres raíces se cruzan sobre una sola tira de corteza donde los nombres más antiguos se guardan.',
    connections: ['c04_roundhouse'],
    objects: [{ id: 'c04_root_table', name: 'The Root-Table', nameEs: 'La mesa de raíces', description: 'A table of living roots where the roots-weave puzzle is set.', descriptionEs: 'Una mesa de raíces vivas donde se plantea el enigma del tejido de raíces.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'cave',
  },
  c04_hoard_ditch: {
    id: 'c04_hoard_ditch', name: 'The Hoard-Ditch', nameEs: 'La fosa del acopio',
    description: 'A ditch in the earth where the wood keeps hoarded names that no one came to trade. They rot in the mud.',
    descriptionEs: 'Una fosa en la tierra donde el bosque guarda los nombres acumulados que nadie vino a trocar. Se pudren en el barro.',
    connections: ['c04_forest_edge'],
    objects: [{ id: 'c04_rotting_bark', name: 'Rotting Bark', nameEs: 'Corteza podrida', description: 'Strips of bark with fading names, half-buried in the mud.', descriptionEs: 'Tiras de corteza con nombres que se borran, medio enterradas en el barro.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 2, discovered: true, secrets: [], ambiance: 'dungeon',
  },
  c04_memory_cage: {
    id: 'c04_memory_cage', name: 'The Memory-Cage', nameEs: 'La jaula de memoria',
    description: 'A lattice of living roots shaped like a cage. Untraded names hang inside like wind-chimes.',
    descriptionEs: 'Un enrejado de raíces vivas con forma de jaula. Los nombres sin trocar cuelgan dentro como carrillones.',
    connections: ['c04_forest_edge'],
    objects: [{ id: 'c04_cage_lattice', name: 'The Cage Lattice', nameEs: 'El enrejado de la jaula', description: 'A lattice of living roots where the untraded names hang.', descriptionEs: 'Un enrejado de raíces vivas donde cuelgan los nombres sin trocar.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'crypt',
  },
  c04_hunger_lair: {
    id: 'c04_hunger_lair', name: "The Hunger's Lair", nameEs: 'La guarida del Hambre',
    description: 'A dark grove where the Hunger waits for names that have not been shaped by breath.',
    descriptionEs: 'Un arboleda oscura donde el Hambre espera los nombres que no han sido formados por aliento.',
    connections: ['c04_forest_edge'],
    objects: [{ id: 'c04_hunger_bones', name: 'Old Bones', nameEs: 'Huesos antiguos', description: 'Bones of names the Hunger has already devoured.', descriptionEs: 'Huesos de nombres que el Hambre ya ha devorado.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: ['c04_hunger'], dangerLevel: 4, discovered: true, secrets: [], ambiance: 'boss',
  },
};

const NPCS: Record<string, NPC> = {
  c04_sylva: {
    id: 'c04_sylva', name: 'Sylva', nameEs: 'Sylva', portrait: 'druid', faction: 'keepers_of_names', location: 'c04_roundhouse', disposition: 10,
    knowledge: ['the_register', 'the_rule', 'the_hunger', 'the_name_of_the_door'],
    memory: [], inventory: [],
    dialogue: [
      { id: 'greeting', text: 'Sylva looks up from the register. "You came for a name. Everyone does, sooner or later. The rule is simple: to take one back, give one that someone still holds."', textEs: 'Sylva levanta la mirada del registro. «Viniste por un nombre. Todos vienen, tarde o temprano. La regla es simple: para devolver uno, da uno que alguien aún lleve».', responses: [{ text: 'I will trade.', textEs: 'Trocaré.', nextNodeId: 'end' }, { text: 'I will break the rule.', textEs: 'Romperé la regla.', nextNodeId: 'end' }] },
    ],
    alive: true, occupation: 'Moss-Keeper', occupationEs: 'Guardiana del musgo', secrets: [], secretsEs: [], personality: 'patient', personalityEs: 'paciente',
  },
  c04_moss_seer: {
    id: 'c04_moss_seer', name: 'The Moss-Seer', nameEs: 'La vidente del musgo', portrait: 'crone', faction: 'keepers_of_names', location: 'c04_forest_edge', disposition: 0,
    knowledge: ['the_breath_riddle', 'the_rite'],
    memory: [], inventory: [],
    dialogue: [
      { id: 'greeting', text: 'The moss-seer does not open her eyes. "I speak the riddle once. Listen: what do the dead borrow and the living never lend?"', textEs: 'La vidente del musgo no abre los ojos. «Pronuncio el enigma una vez. Escucha: ¿qué toman prestado los muertos y los vivos nunca prestan?»', responses: [{ text: 'I will answer.', textEs: 'Responderé.', nextNodeId: 'end' }] },
    ],
    alive: true, occupation: 'Seer', occupationEs: 'Vidente', secrets: [], secretsEs: [], personality: 'cryptic', personalityEs: 'enigmática',
  },
};

const MONSTERS: Record<string, Omit<Enemy, 'id'>> = {
  c04_hunger: {
    templateId: 'c04_hunger', name: 'The Hunger', nameEs: 'El Hambre', portrait: 'aberration', hp: 20, maxHp: 20, ac: 13, attack: 6, damage: '2d6', damageType: 'necrotic', abilities: ['Name-Sense', 'Hollow Maw'], abilitiesEs: ['Sentir-nombres', 'Fauces huecas'], xpValue: 150, loot: [], intelligence: 8, morale: 80, conditions: [],
  },
};

const QUESTS: Record<string, Quest> = {
  c04_the_forest: {
    id: 'c04_the_forest', name: 'The Forest That Remembers Names', nameEs: 'El bosque que recuerda nombres', description: 'Recover the name of the Tenth Door from the wood that keeps it.', descriptionEs: 'Recupera el nombre de la décima puerta del bosque que lo guarda.', state: 'active', isMain: true, faction: 'keepers_of_names',
    objectives: [
      { id: 'c04_find_name', description: 'Find the name in the wood', descriptionEs: 'Encuentra el nombre en el bosque', completed: false, current: 0, required: 1 },
      { id: 'c04_choose_fate', description: 'Decide the fate of the name', descriptionEs: 'Decide el destino del nombre', completed: false, current: 0, required: 1 },
    ],
    rewards: [{ type: 'xp', value: 200 }],
  },
};

export const CHAPTER_FOUR: Chapter = {
  id: 'chapter-04', index: 4,
  title: 'The Forest That Remembers Names', titleEs: 'El bosque que recuerda nombres',
  premise: 'Beyond the last road a wood stores the names surrendered as an oath price. The Keepers of Names govern the register; to take a name back you must give another — one someone still holds.',
  premiseEs: 'Más allá del último camino, un bosque guarda los nombres pagados como precio de un juramento. Los Guardianes de los Nombres gobiernan el registro, y para devolver un nombre hay que dar uno al que todavía alguien responda.',
  intro: [
    { type: 'system', text: 'CHAPTER IV — THE FOREST THAT REMEMBERS NAMES', textEs: 'CAPÍTULO IV — EL BOSQUE QUE RECUERDA NOMBRES', mood: 'mystery' },
    { type: 'narration', text: '{name} passes the last road and enters the wood that keeps the names surrendered as an oath price. Sylva, the moss-keeper, governs the register; to take a name back you must give another — one someone still holds. The name of the Tenth Door is somewhere in the bark and the moss, and the price is somewhere behind it.', textEs: '{name} pasa el último camino y entra al bosque que guarda los nombres entregados como precio de juramento. Sylva, la guardiana del musgo, gobierna el registro; para devolver un nombre hay que dar uno al que alguien aún responda. El nombre de la décima puerta está en algún punto de la corteza y el musgo, y el precio está en algún punto detrás.', mood: 'mystery' },
    { type: 'system', text: 'CURRENT OBJECTIVE — Find the name in the wood, then decide its fate.', textEs: 'OBJETIVO ACTUAL — Encuentra el nombre en el bosque y decide su destino.', mood: 'neutral' },
  ],
  startNodeId: 'c04_arrival', startLocationId: 'c04_forest_edge',
  nodes: NODES,
  puzzles: { c04_roots_weave: ROOTS_WEAVE, c04_breath_riddle: BREATH_RIDDLE },
  locations: LOCATIONS, npcs: NPCS, monsters: MONSTERS, quests: QUESTS,
  mainQuestId: 'c04_the_forest',
  hooks: { bossLocationId: 'c04_hunger_lair', aftermathNodeId: 'c04_hunger_aftermath' },
  storyFacts: [
    { flag: 'c04_name_given', en: 'The party surrendered a live name', es: 'El grupo entregó un nombre vivo' },
    { flag: 'c04_rule_broken', en: 'The party broke the rule and went to the ditch', es: 'El grupo rompió la regla y fue a la fosa' },
    { flag: 'c04_cage_chosen', en: 'The party sought the memory-cage', es: 'El grupo buscó la jaula de memoria' },
    { flag: 'c04_roots_aligned', en: 'The roots were plaited in the right order', es: 'Las raíces se trenzaron en el orden correcto' },
    { flag: 'c04_breath_answered', en: 'The breath riddle was answered', es: 'El enigma del aliento fue respondido' },
    { flag: 'c04_hunger_faced', en: 'The Hunger was faced in its lair', es: 'El Hambre fue enfrentado en su guarida' },
    { flag: 'c04_seer_held', en: 'The moss-seer held the name', es: 'La vidente del musgo sostuvo el nombre' },
  ],
  suggestions: {
    c04_forest_edge: [
      { label: 'Go to the root grove', labelEs: 'Ir al arboleda de raíces', action: 'go to the root grove' },
      { label: 'Go to the hoard ditch', labelEs: 'Ir a la fosa', action: 'go to the hoard ditch' },
      { label: 'Go to the memory cage', labelEs: 'Ir a la jaula de memoria', action: 'go to the memory cage' },
      { label: 'Go to the Hunger lair', labelEs: 'Ir a la guarida del Hambre', action: 'go to the hunger lair' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c04_roundhouse: [{ label: 'Return to the forest edge', labelEs: 'Volver al borde del bosque', action: 'go to the forest edge' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c04_root_grove: [{ label: 'Return to the roundhouse', labelEs: 'Volver a la casa redonda', action: 'go to the roundhouse' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c04_hoard_ditch: [{ label: 'Return to the forest edge', labelEs: 'Volver al borde del bosque', action: 'go to the forest edge' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c04_memory_cage: [{ label: 'Return to the forest edge', labelEs: 'Volver al borde del bosque', action: 'go to the forest edge' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c04_hunger_lair: [{ label: 'Return to the forest edge', labelEs: 'Volver al borde del bosque', action: 'go to the forest edge' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
  },
  externalEntrySeeds: {
    c04_hunger_aftermath: [{ c04_name_given: true }, { c04_rule_broken: true }, { c04_cage_chosen: true }],
    c04_arrival: [{ 'canon:c02_map_shared': true, 'canon:c01_relic_claimed': true }],
  },
  summaryFlags: [
    'canon:c04_name_returned', 'canon:c04_name_free', 'canon:c04_selfbound', 'canon:c04_evidence_name',
  ],
};
