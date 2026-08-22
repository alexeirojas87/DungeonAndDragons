// ============================================================
// CHAPTER VI — The Tideless Sea
// El mar sin mareas
// Act II closer. Off the west coast the sea has gone still;
// beached in that calm lies the Continental Vault, a vessel
// larger than a village holding the names and debts of an
// entire coastline. Its tide engine is broken. Four endings
// close the sea.
// ============================================================

import type { Chapter, StoryNode } from '../../engine/chapter';
import type { Puzzle } from '../../engine/puzzles';
import type { WorldLocation, NPC, Enemy, Quest } from '../../engine/types';

// ---- Puzzles -------------------------------------------------

const TIDE_CHART: Puzzle = {
  id: 'c06_tide_chart',
  kind: 'check',
  title: 'The Tide Chart',
  titleEs: 'La carta de mareas',
  prompt: 'The dry docks hold a tide chart that shows when the Vault engine opens and when it shuts. Read it properly and you know which gate the tide still answers to.',
  promptEs: 'Los muelles secos guardan una carta de mareas que muestra cuándo se abre el motor de la Bóveda y cuándo se cierra. Léela como es debido y sabrás qué puerta responde aún a la marea.',
  hints: [
    { en: 'The chart marks two tides: the one that was and the one that should be. The gap between them is the engine.', es: 'La carta marca dos mareas: la que fue y la que debería ser. El espacio entre ellas es el motor.' },
    { en: 'The gate the chart names is the one the riddle asks for — the sea-gate, the sluice that lets the tide in and keeps it out.', es: 'La puerta que la carta nombra es la que el enigma pregunta — la esclusa, que deja entrar la marea y la mantiene fuera.' },
  ],
  skill: 'nature',
  dc: 14,
  clues: [
    { id: 'c06_clue_pattern', en: 'The tide pattern shows two peaks and a flat — the flat is where the engine stopped.', es: 'El patrón de mareas muestra dos picos y un plano — el plano es donde el motor se detuvo.', dcReduction: 2 },
    { id: 'c06_clue_gate', en: 'The chart names the gate the tide still answers to: the sea-gate, the sluice.', es: 'La carta nombra la puerta a la que la marea aún responde: la esclusa.', dcReduction: 3 },
  ],
  unlocks: { flags: { c06_chart_read: true } },
  solvedNodeId: 'c06_tide_read',
  skipNodeId: 'c06_tide_skipped',
};

const VAULT_RIDDLE: Puzzle = {
  id: 'c06_vault_riddle',
  kind: 'riddle',
  title: 'The Riddle of the Vault',
  titleEs: 'El enigma de la Bóveda',
  prompt: 'The deep hold asks: what lets the sea in and keeps the sea out, that the tide opens and the tide shuts, that the Vault holds but the shore cannot? Name it, and the Vault knows you have understood its shape.',
  promptEs: 'La bodega profunda pregunta: ¿qué deja entrar al mar y lo mantiene fuera, que la marea abre y la marea cierra, que la Bóveda guarda pero la orilla no puede? Nómbralo, y la Bóveda sabrá que has comprendido su forma.',
  hints: [
    { en: 'It is not a door of wood or iron. It is a door of water, moved by the moon.', es: 'No es una puerta de madera o hierro. Es una puerta de agua, movida por la luna.' },
    { en: 'The Vault holds it because the Vault was built around it. The shore cannot because the shore has no walls.', es: 'La Bóveda la guarda porque fue construida alrededor de ella. La orilla no puede porque no tiene muros.' },
    { en: 'The tide chart in the dry docks names it: the sea-gate, the sluice.', es: 'La carta de mareas en los muelles secos la nombra: la esclusa.' },
  ],
  answers: ['the sea-gate', 'sea-gate', 'seagate', 'the sea gate', 'sea gate', 'the sluice', 'sluice', 'la esclusa', 'esclusa', 'la esclusa del mar'],
  answersEs: ['la esclusa', 'esclusa', 'la esclusa del mar', 'el portón del mar', 'portón del mar'],
  unlocks: { flags: { c06_riddle_answered: true } },
  solvedNodeId: 'c06_vault_answered',
  skipNodeId: 'c06_vault_unanswered',
};

// ---- Nodes ---------------------------------------------------

const NODES: Record<string, StoryNode> = {
  c06_arrival: {
    id: 'c06_arrival', kind: 'beat', locationId: 'c06_shore', externalEntry: true,
    title: 'The Tideless Shore', titleEs: 'La orilla sin marea',
    text: 'The sea has gone still. No tide moves, no wave breaks, and the water sits flat as a mirror. Beached in that calm lies the Continental Vault — a vessel larger than the village behind you, its hull crusted with salt and its name still legible: the Vault.\n\nIt holds the names and debts of an entire coastline, and its tide engine is broken. The fleet watches from the decks, and the shore is empty.',
    textEs: 'El mar se ha quedado quieto. Ninguna marea se mueve, ninguna ola rompe, y el agua yace plana como un espejo. Varada en esa calma descansa la Bóveda del Continente — una vasija mayor que la aldea detrás de ti, su casco incrustado de sal y su nombre aún legible: la Bóveda. Guarda los nombres y las deudas de todo un litoral, y su motor de mareas está roto. La armada vigila desde las cubiertas, y la orilla está vacía.',
    choices: [
      { id: 'c06_arrival_with_map', label: 'Approach through the path the map showed', labelEs: 'Acercarse por el sendero que el mapa mostró', nextNodeId: 'c06_vault_hull', requires: [{ flag: 'canon:c02_map_shared' }], result: 'The map Olen shared still holds the path to the Vault. You approach without the fleet seeing you.', resultEs: 'El mapa que Olen compartió aún guarda el sendero a la Bóveda. Te acercas sin que la armada te vea.' },
      { id: 'c06_arrival_bare', label: 'Walk up to the hull openly', labelEs: 'Acercarse al casco abiertamente', nextNodeId: 'c06_vault_hull', result: 'You walk across the flat water to the hull. The fleet watches every step.', resultEs: 'Caminas sobre el agua plana hacia el casco. La armada observa cada paso.' },
    ],
  },

  c06_vault_hull: {
    id: 'c06_vault_hull', kind: 'beat', locationId: 'c06_vault_decks',
    title: 'The Vault Hull', titleEs: 'El casco de la Bóveda',
    text: 'The hull is salt-crusted but intact. A door leads up to the decks where the fleet watches, another down to the dry docks, and a third into the deep hold. The tide engine sits in the belly of the vessel, and its broken sound is the only thing the still sea carries. A figure stands at the rail — the fleet eye, the one who watches for the tide that does not come.',
    textEs: 'El casco está incrustado de sal pero intacto. Una puerta sube a las cubiertas donde la armada vigila, otra baja a los muelles secos, y una tercera entra a la bodega profunda. El motor de mareas descansa en el vientre de la vasija, y su sonido roto es lo único que el mar quieto transporta. Una figura se mantiene en la barandilla — el ojo de la flota, el que vigila la marea que no llega.',
    choices: [
      { id: 'c06_hull_to_eye', label: 'Speak to the fleet eye', labelEs: 'Hablar con el ojo de la flota', nextNodeId: 'c06_fleet_eye', result: 'The figure at the rail turns. The fleet eye has been waiting.', resultEs: 'La figura en la barandilla se vuelve. El ojo de la flota ha estado esperando.' },
    ],
  },

  c06_fleet_eye: {
    id: 'c06_fleet_eye', kind: 'beat', locationId: 'c06_vault_decks',
    title: 'The Fleet Eye', titleEs: 'El ojo de la flota',
    text: 'The fleet eye is old, salt-burned, and patient. "The tide engine broke when the name was fenced," she says. "The Vault holds the coastline debts, and the engine is what lets the tide settle them. Without the engine, the debts stay locked. With it, the tide can open the Vault or master it. The fleet will not let you master it. But we will let you open it, if you can."\n\nShe looks at your hands. "Do you carry the map? Do you carry a name that is free?"',
    textEs: 'El ojo de la flota es viejo, quemado por la sal, y paciente. —El motor de mareas se rompió cuando el nombre fue cercado —dice—. La Bóveda guarda las deudas del litoral, y el motor es lo que deja que la marea las salde. Sin el motor, las deudas siguen bloqueadas. Con él, la marea puede abrir la Bóveda o dominarla. La armada no te dejará dominarla. Pero te dejaremos abrirla, si puedes. —Mira tus manos—. ¿Llevas el mapa? ¿Llevas un nombre que esté libre?',
    choices: [
      { id: 'c06_eye_to_first', label: 'Answer the fleet eye', labelEs: 'Responder al ojo de la flota', nextNodeId: 'c06_first_sea', result: 'You meet her gaze. The decks wait.', resultEs: 'Sostienes su mirada. Las cubiertas esperan.' },
    ],
  },

  c06_first_sea: {
    id: 'c06_first_sea', kind: 'beat', locationId: 'c06_vault_decks',
    title: 'The First Sea', titleEs: 'El primer mar',
    text: 'Three paths leave the hull: the decks where the lance-luggers patrol, the dry docks where the tide chart hangs, and the deep hold where the Vault riddle is set.\n\n"Choose," the fleet eye says. "The engine is in the belly. Every path leads there. What you find on the way decides what you can do when you reach it."',
    textEs: 'Tres caminos salen del casco: las cubiertas donde patrullan los lanceros, los muelles secos donde cuelga la carta de mareas, y la bodega profunda donde se plantea el enigma de la Bóveda. —Elige —dice el ojo de la flota—. El motor está en el vientre. Cada camino lleva allí. Lo que encuentres en el camino decide qué podrás hacer cuando llegues.',
    choices: [
      { id: 'c06_to_decks', label: 'Go to the fleet decks', labelEs: 'Ir a las cubiertas de la flota', nextNodeId: 'c06_decks_walk', setsFlags: { c06_decks_chosen: true }, adjustsValues: { conviction_duty: 1, faction_tidebound_fleet: 1 }, result: 'You climb to the decks. The lance-luggers turn.', resultEs: 'Subes a las cubiertas. Los lanceros se vuelven.' },
      { id: 'c06_to_docks', label: 'Descend to the dry docks', labelEs: 'Bajar a los muelles secos', nextNodeId: 'c06_docks_walk', setsFlags: { c06_docks_chosen: true }, adjustsValues: { conviction_truth: 1 }, result: 'You descend to the dry docks. The tide chart hangs on the wall.', resultEs: 'Bajas a los muelles secos. La carta de mareas cuelga en la pared.' },
      { id: 'c06_to_hold', label: 'Enter the deep hold', labelEs: 'Entrar a la bodega profunda', nextNodeId: 'c06_hold_walk', setsFlags: { c06_hold_chosen: true }, adjustsValues: { conviction_freedom: 1 }, result: 'You enter the deep hold. The riddle is carved in the keel.', resultEs: 'Entras a la bodega profunda. El enigma está tallado en la quilla.' },
    ],
  },

  c06_decks_walk: {
    id: 'c06_decks_walk', kind: 'beat', locationId: 'c06_vault_decks',
    title: 'The Fleet Decks', titleEs: 'Las cubiertas de la flota',
    text: 'The decks are wide and salt-scoured. Lance-luggers patrol the rails — the fleet enforcers, carrying the long lances that keep the Vault sealed. They do not challenge you yet; the fleet eye has vouched for your approach. But the engine room is past them, and they will not let you pass without a word or a fight.',
    textEs: 'Las cubiertas son anchas y rasposas de sal. Los lanceros patrullan las barandillas — los guardias de la flota, con las largas lanzas que mantienen la Bóveda sellada. No te desafían todavía; el ojo de la flota ha respondido por tu acercamiento. Pero la sala del motor está detrás de ellos, y no te dejarán pasar sin una palabra o una pelea.',
    choices: [
      { id: 'c06_decks_to_luggers', label: 'Approach the lance-luggers', labelEs: 'Acercarse a los lanceros', nextNodeId: 'c06_lance_luggers', result: 'You walk toward the engine room. The luggers lower their lances.', resultEs: 'Caminas hacia la sala del motor. Los lanceros bajan sus lanzas.' },
      { id: 'c06_decks_back', label: 'Return to the hull', labelEs: 'Volver al casco', nextNodeId: 'c06_first_sea', result: 'You step back. The decks stay patrolled.', resultEs: 'Retrocedes. Las cubiertas siguen patrulladas.' },
    ],
  },

  c06_lance_luggers: {
    id: 'c06_lance_luggers', kind: 'beat', locationId: 'c06_vault_decks',
    title: 'The Lance-Luggers', titleEs: 'Los lanceros',
    text: 'The lance-luggers block the engine room door. "The fleet eye vouched for your approach," the lead lugger says, "but not for your passage. The engine is the fleet charge. Turn back, or we will turn you." The lances are long and the deck is wide. You can fight, or you can turn back and find another way to the engine.',
    textEs: 'Los lanceros bloquean la puerta de la sala del motor. —El ojo de la flota respondió por tu acercamiento —dice el lancero principal—, pero no por tu paso. El motor es cargo de la flota. Retrocede, o te haremos retroceder. Las lanzas son largas y la cubierta es ancha. Puedes luchar, o puedes retroceder y buscar otro camino al motor.',
    choices: [
      { id: 'c06_face_luggers', label: 'Fight the lance-luggers', labelEs: 'Pelear con los lanceros', nextNodeId: 'c06_luggers_aftermath', setsFlags: { c06_luggers_faced: true }, result: 'You raise your weapon. The luggers lower their lances.', resultEs: 'Levantas tu arma. Los lanceros bajan sus lanzas.' },
      { id: 'c06_evade_luggers', label: 'Turn back and find another way', labelEs: 'Retroceder y buscar otro camino', nextNodeId: 'c06_engine', result: 'You turn from the luggers and descend through the hold. The engine room has more than one door.', resultEs: 'Te apartas de los lanceros y bajas por la bodega. La sala del motor tiene más de una puerta.' },
    ],
  },

  c06_luggers_aftermath: {
    id: 'c06_luggers_aftermath', kind: 'beat', locationId: 'c06_vault_decks', externalEntry: true,
    title: 'The Luggers Down', titleEs: 'Los lanceros caídos',
    text: 'The lance-luggers are down and the deck is clear. The engine room door stands open. The fleet eye watches from the rail but does not intervene. "You earned your passage," she calls. "The engine is yours. Use it well."',
    textEs: 'Los lanceros caen y la cubierta queda despejada. La puerta de la sala del motor está abierta. El ojo de la flota vigila desde la barandilla pero no interviene. —Te ganaste el paso —llama—. El motor es tuyo. Úsalo bien.',
    choices: [
      { id: 'c06_luggers_to_engine', label: 'Enter the engine room', labelEs: 'Entrar a la sala del motor', nextNodeId: 'c06_engine', result: 'You step through the door into the engine room.', resultEs: 'Atraviesas la puerta hacia la sala del motor.' },
    ],
  },

  c06_docks_walk: {
    id: 'c06_docks_walk', kind: 'beat', locationId: 'c06_dry_docks',
    title: 'The Dry Docks', titleEs: 'Los muelles secos',
    text: 'The dry docks are where the Vault was built, and where it was beached when the tide stopped. A tide chart hangs on the wall — the only record of when the engine opens and when it shuts. The chart is old and the ink is salt-faded, but the pattern is still there if you can read it.',
    textEs: 'Los muelles secos son donde la Bóveda fue construida, y donde fue varada cuando la marea se detuvo. Una carta de mareas cuelga en la pared — el único registro de cuándo se abre el motor y cuándo se cierra. La carta es vieja y la tinta está descolorida por la sal, pero el patrón sigue ahí si puedes leerlo.',
    choices: [
      { id: 'c06_docks_to_chart', label: 'Examine the tide chart', labelEs: 'Examinar la carta de mareas', nextNodeId: 'c06_tide_chart_node', result: 'You stand before the chart. The salt-faded ink waits.', resultEs: 'Te paras ante la carta. La tinta descolorida espera.' },
      { id: 'c06_docks_back', label: 'Return to the hull', labelEs: 'Volver al casco', nextNodeId: 'c06_first_sea', result: 'You climb back to the hull. The chart stays on the wall.', resultEs: 'Vuelves al casco. La carta sigue en la pared.' },
    ],
  },

  c06_tide_chart_node: {
    id: 'c06_tide_chart_node', kind: 'beat', locationId: 'c06_dry_docks',
    title: 'The Tide Chart', titleEs: 'La carta de mareas',
    text: 'The chart shows two tides: the one that was and the one that should be. The gap between them is the engine, and the gate the chart names is the one the riddle asks for. Read it properly and you know which gate the tide still answers to.',
    textEs: 'La carta muestra dos mareas: la que fue y la que debería ser. El espacio entre ellas es el motor, y la puerta que la carta nombra es la que el enigma pregunta. Léela como es debido y sabrás a qué puerta responde aún la marea.',
    choices: [
      { id: 'c06_chart_open', label: 'Read the tide chart', labelEs: 'Leer la carta de mareas', nextNodeId: 'c06_tide_puzzle', result: 'You lean in. The pattern waits to be read.', resultEs: 'Te acercas. El patrón espera ser leído.' },
      { id: 'c06_chart_back', label: 'Return to the docks', labelEs: 'Volver a los muelles', nextNodeId: 'c06_docks_walk', result: 'You step back. The chart stays on the wall.', resultEs: 'Retrocedes. La carta sigue en la pared.' },
    ],
  },

  c06_tide_puzzle: {
    id: 'c06_tide_puzzle', kind: 'puzzle', puzzleId: 'c06_tide_chart', locationId: 'c06_dry_docks',
    title: 'The Tide Chart', titleEs: 'La carta de mareas',
    text: 'The chart waits to be read.',
    textEs: 'La carta espera ser leída.',
    choices: [],
  },

  c06_tide_read: {
    id: 'c06_tide_read', kind: 'beat', locationId: 'c06_dry_docks',
    title: 'The Chart Read', titleEs: 'La carta leída',
    text: 'The chart opens its pattern: the tide opens the sea-gate, the sea-gate opens the engine, and the engine opens the Vault. The gate the chart names is the sluice — the one that lets the tide in and keeps it out. You know the shape of the Vault now. The engine room waits below.',
    textEs: 'La carta revela su patrón: la marea abre la esclusa, la esclusa abre el motor, y el motor abre la Bóveda. La puerta que la carta nombra es la esclusa — la que deja entrar la marea y la mantiene fuera. Conoces la forma de la Bóveda ahora. La sala del motor espera abajo.',
    choices: [
      { id: 'c06_tide_to_engine', label: 'Go to the engine room', labelEs: 'Ir a la sala del motor', nextNodeId: 'c06_engine', result: 'You descend to the engine room with the chart read.', resultEs: 'Bajas a la sala del motor con la carta leída.' },
    ],
  },

  c06_tide_skipped: {
    id: 'c06_tide_skipped', kind: 'beat', locationId: 'c06_dry_docks',
    title: 'The Chart Unread', titleEs: 'La carta sin leer',
    text: 'You leave the chart on the wall. The pattern stays salt-faded and unread. "No matter," the fleet eye calls from above. "The engine is the same whether you read the chart or not. The question is what you do when you reach it."',
    textEs: 'Dejas la carta en la pared. El patrón sigue descolorido y sin leer. —No importa —llama el ojo de la flota desde arriba—. El motor es el mismo tanto si lees la carta como si no. La pregunta es qué haces cuando llegues a él.',
    choices: [
      { id: 'c06_tide_skip_to_engine', label: 'Go to the engine room', labelEs: 'Ir a la sala del motor', nextNodeId: 'c06_engine', result: 'You descend without the chart.', resultEs: 'Bajas sin la carta.' },
    ],
  },

  c06_hold_walk: {
    id: 'c06_hold_walk', kind: 'beat', locationId: 'c06_deep_hold',
    title: 'The Deep Hold', titleEs: 'La bodega profunda',
    text: 'The deep hold is where the Vault keeps the names and debts of the coastline. The walls are lined with ledgers, and the keel is carved with a riddle — the one the Vault sets for anyone who would understand its shape. Answer it, and the Vault knows you have understood what it holds.',
    textEs: 'La bodega profunda es donde la Bóveda guarda los nombres y deudas del litoral. Las paredes están forradas de libros, y la quilla está tallada con un enigma — el que la Bóveda plantea a quien quiera comprender su forma. Respóndelo, y la Bóveda sabrá que has comprendido lo que guarda.',
    choices: [
      { id: 'c06_hold_to_riddle', label: 'Approach the keel riddle', labelEs: 'Acercarse al enigma de la quilla', nextNodeId: 'c06_vault_riddle_node', result: 'You stand before the keel. The riddle is carved deep.', resultEs: 'Te paras ante la quilla. El enigma está tallado profundo.' },
      { id: 'c06_hold_back', label: 'Return to the hull', labelEs: 'Volver al casco', nextNodeId: 'c06_first_sea', result: 'You climb back. The riddle stays carved.', resultEs: 'Vuelves arriba. El enigma sigue tallado.' },
    ],
  },

  c06_vault_riddle_node: {
    id: 'c06_vault_riddle_node', kind: 'beat', locationId: 'c06_deep_hold',
    title: 'The Riddle of the Vault', titleEs: 'El enigma de la Bóveda',
    text: 'The riddle is carved in the keel: what lets the sea in and keeps the sea out, that the tide opens and the tide shuts, that the Vault holds but the shore cannot? Answer it and the Vault knows you have understood its shape.',
    textEs: 'El enigma está tallado en la quilla: ¿qué deja entrar al mar y lo mantiene fuera, que la marea abre y la marea cierra, que la Bóveda guarda pero la orilla no puede? Respóndelo y la Bóveda sabrá que has comprendido su forma.',
    choices: [
      { id: 'c06_riddle_open', label: 'Answer the riddle', labelEs: 'Responder el enigma', nextNodeId: 'c06_vault_puzzle', result: 'You lean over the keel. The riddle waits.', resultEs: 'Te inclinas sobre la quilla. El enigma espera.' },
      { id: 'c06_riddle_back', label: 'Return to the hold', labelEs: 'Volver a la bodega', nextNodeId: 'c06_hold_walk', result: 'You step back. The riddle stays carved.', resultEs: 'Retrocedes. El enigma sigue tallado.' },
    ],
  },

  c06_vault_puzzle: {
    id: 'c06_vault_puzzle', kind: 'puzzle', puzzleId: 'c06_vault_riddle', locationId: 'c06_deep_hold',
    title: 'The Riddle of the Vault', titleEs: 'El enigma de la Bóveda',
    text: 'The keel waits for an answer.',
    textEs: 'La quilla espera una respuesta.',
    choices: [],
  },

  c06_vault_answered: {
    id: 'c06_vault_answered', kind: 'beat', locationId: 'c06_deep_hold',
    title: 'The Riddle Answered', titleEs: 'El enigma respondido',
    text: 'The word settles into the keel: the sea-gate, the sluice. The Vault hums once, low, and the ledgers on the walls shift. The Vault knows you have understood its shape — the sea-gate is the door the tide opens, and the engine is what turns that door. You carry the shape with you to the engine room.',
    textEs: 'La palabra se posa en la quilla: la esclusa. La Bóveda zumba una vez, baja, y los libros de las paredes se desplazan. La Bóveda sabe que has comprendido su forma — la esclusa es la puerta que la marea abre, y el motor es lo que gira esa puerta. Llevas la forma contigo a la sala del motor.',
    choices: [
      { id: 'c06_vault_to_engine', label: 'Go to the engine room', labelEs: 'Ir a la sala del motor', nextNodeId: 'c06_engine', result: 'You carry the shape of the Vault to the engine.', resultEs: 'Llevas la forma de la Bóveda al motor.' },
    ],
  },

  c06_vault_unanswered: {
    id: 'c06_vault_unanswered', kind: 'beat', locationId: 'c06_deep_hold',
    title: 'The Riddle Unanswered', titleEs: 'El enigma sin respuesta',
    text: 'You leave the riddle unanswered. The keel stays silent and the ledgers stay still. You go to the engine without the shape, and the engine will be harder to read.',
    textEs: 'Dejas el enigma sin responder. La quilla sigue en silencio y los libros siguen quietos. Vas al motor sin la forma, y el motor será más difícil de leer.',
    choices: [
      { id: 'c06_vault_skip_to_engine', label: 'Go to the engine room', labelEs: 'Ir a la sala del motor', nextNodeId: 'c06_engine', result: 'You climb to the engine without the shape.', resultEs: 'Subes al motor sin la forma.' },
    ],
  },

  c06_engine: {
    id: 'c06_engine', kind: 'beat', locationId: 'c06_engine_room',
    title: 'The Tide Engine', titleEs: 'El motor de mareas',
    text: 'The tide engine sits in the belly of the Vault — a wheel of salt-iron that should turn with the tide, and does not. The sea-gate, the sluice, is the door the engine opens; without the engine, the gate stays shut and the Vault stays sealed. Something is in the engine room besides the engine — a shape, anchored to the wheel, that does not move when you enter. The fleet eye calls it the Anchored.',
    textEs: 'El motor de mareas descansa en el vientre de la Bóveda — una rueda de hierro salado que debería girar con la marea, y no gira. La esclusa es la puerta que el motor abre; sin el motor, la puerta sigue cerrada y la Bóveda sigue sellada. Algo más está en la sala del motor además del motor — una figura, anclada a la rueda, que no se mueve cuando entras. El ojo de la flota lo llama el Anclado.',
    choices: [
      { id: 'c06_engine_to_examine', label: 'Examine the engine first', labelEs: 'Examinar el motor primero', nextNodeId: 'c06_engine_examine', result: 'You approach the engine. The Anchored does not move.', resultEs: 'Te acercas al motor. El Anclado no se mueve.' },
      { id: 'c06_engine_to_anchored', label: 'Approach the Anchored', labelEs: 'Acercarse al Anclado', nextNodeId: 'c06_anchored', result: 'You walk toward the shape on the wheel.', resultEs: 'Caminas hacia la figura en la rueda.' },
      { id: 'c06_engine_to_choice', label: 'Go straight to the engine choice', labelEs: 'Ir directo a la elección del motor', nextNodeId: 'c06_engine_choice', result: 'You step past the Anchored to the engine wheel.', resultEs: 'Pasas junto al Anclado hacia la rueda del motor.' },
    ],
  },

  c06_engine_examine: {
    id: 'c06_engine_examine', kind: 'beat', locationId: 'c06_engine_room',
    title: 'The Engine Examined', titleEs: 'El motor examinado',
    text: 'The engine is a wheel of salt-iron with one gate at its center — the sea-gate, the sluice. The gate is shut. The wheel should turn with the tide, but the tide is gone. You can open the gate if you carry the map and the freed name — the map shows the way, and the freed name unbolted the lock. You can master the engine if you carry the returned name — the fleet keeps the secret and the Vault stays the fleet charge.\n\nOr you can let the tide go and leave the Vault as it is.',
    textEs: 'El motor es una rueda de hierro salado con una puerta en el centro — la esclusa. La puerta está cerrada. La rueda debería girar con la marea, pero la marea se ha ido. Puedes abrir la puerta si llevas el mapa y el nombre liberado — el mapa muestra el camino, y el nombre liberado destrabó el cerrojo. Puedes dominar el motor si llevas el nombre devuelto — la armada guarda el secreto y la Bóveda sigue siendo cargo de la flota. O puedes dejar ir la marea y dejar la Bóveda como está.',
    choices: [
      { id: 'c06_examine_to_choice', label: 'Go to the engine choice', labelEs: 'Ir a la elección del motor', nextNodeId: 'c06_engine_choice', result: 'You step back from the engine. The choice waits.', resultEs: 'Retrocedes del motor. La elección espera.' },
    ],
  },

  c06_anchored: {
    id: 'c06_anchored', kind: 'beat', locationId: 'c06_engine_room',
    title: 'The Anchored', titleEs: 'El Anclado',
    text: 'The Anchored is bound to the engine wheel — a shape that was a person once, now bolted to the tide engine as its keeper. It does not speak. It does not move unless you touch the wheel. The fleet eye calls from above: "The Anchored is the last keeper of the engine. If you fight it, the engine is yours. If you leave it, the engine keeps its own counsel. Either way, the choice is yours after."',
    textEs: 'El Anclado está atado a la rueda del motor — una figura que fue persona alguna vez, ahora empernada al motor de mareas como su guardián. No habla. No se mueve a menos que toques la rueda. El ojo de la flota llama desde arriba: —El Anclado es el último guardián del motor. Si lo combates, el motor es tuyo. Si lo dejas, el motor sigue su propio consejo. De cualquier modo, la elección es tuya después.',
    choices: [
      { id: 'c06_face_anchored', label: 'Fight the Anchored', labelEs: 'Combatir al Anclado', nextNodeId: 'c06_anchored_aftermath', setsFlags: { c06_anchored_faced: true }, result: 'You reach for the wheel. The Anchored stirs.', resultEs: 'Alcanzas la rueda. El Anclado se agita.' },
      { id: 'c06_leave_anchored', label: 'Leave the Anchored and go to the choice', labelEs: 'Dejar al Anclado e ir a la elección', nextNodeId: 'c06_engine_choice', result: 'You step back from the Anchored. It does not follow.', resultEs: 'Retrocedes del Anclado. No te sigue.' },
    ],
  },

  c06_anchored_aftermath: {
    id: 'c06_anchored_aftermath', kind: 'beat', locationId: 'c06_engine_room', externalEntry: true,
    title: 'The Anchored Released', titleEs: 'El Anclado liberado',
    text: 'The Anchored is down and its bonds fall from the wheel. The engine is unguarded. The fleet eye watches from the rail. "You fought the keeper," she says. "The engine is yours now. Use it as you will — the fleet will not stop you, not today."',
    textEs: 'El Anclado cae y sus ataduras sueltan la rueda. El motor queda sin guardia. El ojo de la flota vigila desde la barandilla. —Combatiste al guardián —dice—. El motor es tuyo ahora. Úsalo como quieras — la armada no te detendrá, no hoy.',
    choices: [
      { id: 'c06_anchored_to_choice', label: 'Go to the engine choice', labelEs: 'Ir a la elección del motor', nextNodeId: 'c06_engine_choice', result: 'You stand before the unguarded engine.', resultEs: 'Te paras ante el motor sin guardia.' },
    ],
  },

  c06_engine_choice: {
    id: 'c06_engine_choice', kind: 'beat', locationId: 'c06_engine_room',
    title: 'The Engine Choice', titleEs: 'La elección del motor',
    text: 'The engine wheel waits. The sea-gate is shut. You can open the Vault — if the map showed the way and the name was freed, the gate will turn.\n\nYou can master the Vault — if the name was returned, the fleet keeps the secret and the Vault stays the fleet charge.\n\nYou can draw the Vault — the mercantile holds the debts and the fleet takes a cut.\n\nOr you can leave the Vault stranded — nothing opens, nothing closes, and the debts stay locked in the still sea.',
    textEs: 'La rueda del motor espera. La esclusa está cerrada. Puedes abrir la Bóveda — si el mapa mostró el camino y el nombre fue liberado, la puerta girará. Puedes dominar la Bóveda — si el nombre fue devuelto, la armada guarda el secreto y la Bóveda sigue siendo cargo de la flota. Puedes tomar la Bóveda — los mercaderes sostienen las deudas y la armada toma una parte. O puedes dejar la Bóveda encallada — nada se abre, nada se cierra, y las deudas siguen bloqueadas en el mar quieto.',
    choices: [
      { id: 'c06_open_vault', label: 'Open the Vault with the map and the freed name', labelEs: 'Abrir la Bóveda con el mapa y el nombre liberado', nextNodeId: 'c06_ending_opened', requires: [{ flag: 'canon:c02_map_shared' }, { flag: 'canon:c04_name_free' }], setsFlags: { 'canon:c06_vault_opened': true, 'canon:c06_evidence_vault': true }, adjustsValues: { faction_tidebound_fleet: -1, conviction_freedom: 1 }, result: 'The map shows the way and the freed name unbolted the gate. The sea-gate opens. The tide begins to move.', resultEs: 'El mapa muestra el camino y el nombre liberado destrabó la puerta. La esclusa se abre. La marea empieza a moverse.' },
      { id: 'c06_master_vault', label: 'Master the Vault with the returned name', labelEs: 'Dominar la Bóveda con el nombre devuelto', nextNodeId: 'c06_ending_mastered', requires: [{ flag: 'canon:c04_name_returned' }], setsFlags: { 'canon:c06_vault_mastered': true, 'canon:c06_evidence_vault': true }, adjustsValues: { faction_tidebound_fleet: 1, conviction_duty: 1 }, result: 'The returned name lets the fleet keep the secret. The Vault stays the fleet charge, and the engine answers to the fleet eye.', resultEs: 'El nombre devuelto deja a la armada guardar el secreto. La Bóveda sigue siendo cargo de la flota, y el motor responde al ojo de la flota.' },
      { id: 'c06_draw_vault', label: 'Draw the Vault — let the mercantile hold the debts', labelEs: 'Tomar la Bóveda — dejar que los mercaderes sostengan las deudas', nextNodeId: 'c06_ending_drawn', setsFlags: { 'canon:c06_vault_drawn': true, 'canon:c06_evidence_vault': true }, adjustsValues: { faction_tidebound_fleet: 1, conviction_truth: 1 }, result: 'The mercantile takes the debts and the fleet takes a cut. The Vault stays beached but its books are open to trade.', resultEs: 'Los mercaderes toman las deudas y la armada toma una parte. La Bóveda sigue varada pero sus libros están abiertos al comercio.' },
      { id: 'c06_strand_vault', label: 'Leave the Vault stranded', labelEs: 'Dejar la Bóveda encallada', nextNodeId: 'c06_ending_stranded', setsFlags: { 'canon:c06_vault_stranded': true, 'canon:c06_evidence_vault': true }, result: 'You leave the engine as it is. The Vault stays sealed. The debts stay locked.', resultEs: 'Dejas el motor como está. La Bóveda sigue sellada. Las deudas siguen bloqueadas.' },
    ],
  },

  c06_ending_opened: {
    id: 'c06_ending_opened', kind: 'ending', terminal: true, choices: [],
    title: 'Opened', titleEs: 'Abierta',
    text: 'The sea-gate opens and the tide returns. The Vault opens its ledgers to the sea, and the debts of the coastline settle as the water moves. The fleet watches from the decks and does not interfere — the map and the freed name earned the opening. The tide engine turns once, slowly, and the still sea begins to breathe again. The coastline will remember this day.',
    textEs: 'La esclusa se abre y la marea vuelve. La Bóveda abre sus libros al mar, y las deudas del litoral se saldan cuando el agua se mueve. La armada vigila desde las cubiertas y no interviene — el mapa y el nombre liberado ganaron la apertura. El motor de mareas gira una vez, lentamente, y el mar quieto empieza a respirar otra vez. El litoral recordará este día.',
    outcome: 'success', survivors: ['c06_fleet_eye'], casualties: [],
  },

  c06_ending_mastered: {
    id: 'c06_ending_mastered', kind: 'ending', terminal: true, choices: [],
    title: 'Mastered', titleEs: 'Dominada',
    text: 'The fleet masters the Vault. The engine answers to the fleet eye, and the ledgers stay in the fleet keeping. The debts of the coastline are held by the Tidebound Fleet, not by the sea. The fleet eye nods. "We will keep it as we kept the tide," she says. "Come and find us if the sea ever needs another keeper."',
    textEs: 'La armada domina la Bóveda. El motor responde al ojo de la flota, y los libros siguen en custodia de la armada. Las deudas del litoral las sostiene la Armada de la Marea Atada, no el mar. El ojo de la flota asiente. —Lo guardaremos como guardamos la marea —dice—. Búscanos si el mar necesita otro guardián.',
    outcome: 'ambiguous', survivors: ['c06_fleet_eye'], casualties: [],
  },

  c06_ending_drawn: {
    id: 'c06_ending_drawn', kind: 'ending', terminal: true, choices: [],
    title: 'Drawn', titleEs: 'Tomada',
    text: 'The mercantile takes the debts and the fleet takes a cut. The Vault stays beached but its books are open to trade, and the coastline pays its debts in salt and coin instead of in names. The fleet eye watches the trade and says nothing. "The Vault is open for business," she says at last. "The sea will have to find another way to settle."',
    textEs: 'Los mercaderes toman las deudas y la armada toma una parte. La Bóveda sigue varada pero sus libros están abiertos al comercio, y el litoral paga sus deudas en sal y moneda en vez de en nombres. El ojo de la flota observa el comercio y no dice nada. —La Bóveda está abierta para el negocio —dice al fin—. El mar tendrá que encontrar otra forma de saldar.',
    outcome: 'ambiguous', survivors: ['c06_fleet_eye'], casualties: [],
  },

  c06_ending_stranded: {
    id: 'c06_ending_stranded', kind: 'ending', terminal: true, choices: [],
    title: 'Stranded', titleEs: 'Encallada',
    text: 'You leave the engine as it is. The Vault stays sealed, the tide stays still, and the debts of the coastline stay locked in the flat sea. The fleet eye watches you go. "The Vault will wait," she says. "It has waited this long. The debts will keep." The sea does not move behind you as you walk back to the shore.',
    textEs: 'Dejas el motor como está. La Bóveda sigue sellada, la marea sigue quieta, y las deudas del litoral siguen bloqueadas en el mar plano. El ojo de la flota te ve ir. —La Bóveda esperará —dice—. Ha esperado todo este tiempo. Las deudas aguantarán. El mar no se mueve a tu espalda cuando vuelves a la orilla.',
    outcome: 'failure', survivors: ['c06_fleet_eye'], casualties: [],
  },
};

// ---- World ---------------------------------------------------

const LOCATIONS: Record<string, WorldLocation> = {
  c06_shore: {
    id: 'c06_shore', name: 'The Tideless Shore', nameEs: 'La orilla sin marea',
    description: 'A flat shore where the sea has gone still. The Continental Vault lies beached in the calm.',
    descriptionEs: 'Una orilla plana donde el mar se ha quedado quieto. La Bóveda del Continente yace varada en la calma.',
    connections: ['c06_vault_decks'],
    objects: [{ id: 'c06_flat_water', name: 'The Flat Water', nameEs: 'El agua plana', description: 'The sea is still as a mirror. No tide moves.', descriptionEs: 'El mar está quieto como un espejo. Ninguna marea se mueve.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'outdoor',
  },
  c06_vault_decks: {
    id: 'c06_vault_decks', name: 'The Vault Decks', nameEs: 'Las cubiertas de la Bóveda',
    description: 'The wide salt-scoured decks of the Continental Vault. Lance-luggers patrol the rails and the fleet eye watches from the bow.',
    descriptionEs: 'Las cubiertas anchas y rasposas de sal de la Bóveda del Continente. Los lanceros patrullan las barandillas y el ojo de la flota vigila desde la proa.',
    connections: ['c06_shore', 'c06_dry_docks', 'c06_deep_hold', 'c06_engine_room'],
    objects: [{ id: 'c06_deck_rail', name: 'The Deck Rail', nameEs: 'La barandilla de la cubierta', description: 'A salt-crusted rail where the fleet eye stands watch.', descriptionEs: 'Una barandilla incrustada de sal donde el ojo de la flota hace guardia.', interactable: true, broken: false, hidden: false }],
    npcs: ['c06_fleet_eye'], enemies: ['c06_lance_lugger'], dangerLevel: 3, discovered: true, secrets: [], ambiance: 'boss',
  },
  c06_dry_docks: {
    id: 'c06_dry_docks', name: 'The Dry Docks', nameEs: 'Los muelles secos',
    description: 'Where the Vault was built and beached. A tide chart hangs on the wall, salt-faded but legible.',
    descriptionEs: 'Donde la Bóveda fue construida y varada. Una carta de mareas cuelga en la pared, descolorida por la sal pero legible.',
    connections: ['c06_vault_decks'],
    objects: [{ id: 'c06_tide_chart_wall', name: 'The Tide Chart', nameEs: 'La carta de mareas', description: 'A chart on the wall showing when the engine opens and shuts.', descriptionEs: 'Una carta en la pared que muestra cuándo se abre y cierra el motor.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'dungeon',
  },
  c06_deep_hold: {
    id: 'c06_deep_hold', name: 'The Deep Hold', nameEs: 'La bodega profunda',
    description: 'The hold where the Vault keeps the coastline debts. The walls are lined with ledgers, and the keel is carved with a riddle.',
    descriptionEs: 'La bodega donde la Bóveda guarda las deudas del litoral. Las paredes están forradas de libros, y la quilla está tallada con un enigma.',
    connections: ['c06_vault_decks'],
    objects: [{ id: 'c06_keel', name: 'The Keel', nameEs: 'La quilla', description: 'The keel is carved with the riddle of the Vault.', descriptionEs: 'La quilla está tallada con el enigma de la Bóveda.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'crypt',
  },
  c06_engine_room: {
    id: 'c06_engine_room', name: 'The Engine Room', nameEs: 'La sala del motor',
    description: 'The belly of the Vault. A wheel of salt-iron sits at the center, and the Anchored is bound to it.',
    descriptionEs: 'El vientre de la Bóveda. Una rueda de hierro salado se sienta en el centro, y el Anclado está atado a ella.',
    connections: ['c06_vault_decks'],
    objects: [{ id: 'c06_engine_wheel', name: 'The Engine Wheel', nameEs: 'La rueda del motor', description: 'A salt-iron wheel that should turn with the tide. The sea-gate is at its center.', descriptionEs: 'Una rueda de hierro salado que debería girar con la marea. La esclusa está en su centro.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: ['c06_the_anchored'], dangerLevel: 4, discovered: true, secrets: [], ambiance: 'boss',
  },
};

const NPCS: Record<string, NPC> = {
  c06_fleet_eye: {
    id: 'c06_fleet_eye', name: 'The Fleet Eye', nameEs: 'El ojo de la flota', portrait: 'sailor', faction: 'tidebound_fleet', location: 'c06_vault_decks', disposition: 0,
    knowledge: ['the_engine', 'the_vault', 'the_sea_gate', 'the_anchored'],
    memory: [], inventory: [],
    dialogue: [
      { id: 'greeting', text: 'The fleet eye looks down from the rail. "The tide engine broke when the name was fenced. The Vault holds the coastline debts. Open it, master it, or leave it. The fleet will not stop you — not today."', textEs: 'El ojo de la flota mira abajo desde la barandilla. «El motor de mareas se rompió cuando el nombre fue cercado. La Bóveda guarda las deudas del litoral. Ábrela, domínala o déjala. La armada no te detendrá — no hoy».', responses: [{ text: 'I will open it.', textEs: 'La abriré.', nextNodeId: 'end' }, { text: 'I will master it.', textEs: 'La dominaré.', nextNodeId: 'end' }, { text: 'I will leave it.', textEs: 'La dejaré.', nextNodeId: 'end' }] },
    ],
    alive: true, occupation: 'Fleet Eye', occupationEs: 'Ojo de la flota', secrets: ['the_anchored'], secretsEs: ['el anclado'], personality: 'patient', personalityEs: 'paciente',
  },
};

const MONSTERS: Record<string, Omit<Enemy, 'id'>> = {
  c06_lance_lugger: {
    templateId: 'c06_lance_lugger', name: 'Lance-Lugger', nameEs: 'Lancero', portrait: 'soldier', hp: 16, maxHp: 16, ac: 13, attack: 5, damage: '1d10', damageType: 'piercing', abilities: ['Long Lance', 'Deck Patrol'], abilitiesEs: ['Lanza larga', 'Patrulla de cubierta'], xpValue: 80, loot: [], intelligence: 8, morale: 60, conditions: [],
  },
  c06_the_anchored: {
    templateId: 'c06_the_anchored', name: 'The Anchored', nameEs: 'El Anclado', portrait: 'aberration', hp: 28, maxHp: 28, ac: 15, attack: 7, damage: '2d8', damageType: 'bludgeoning', abilities: ['Tide-Bind', 'Salt-Crusted Hide'], abilitiesEs: ['Atadura de marea', 'Piel incrustada de sal'], xpValue: 200, loot: [], intelligence: 6, morale: 100, conditions: [],
  },
};

const QUESTS: Record<string, Quest> = {
  c06_the_tideless_sea: {
    id: 'c06_the_tideless_sea', name: 'The Tideless Sea', nameEs: 'El mar sin mareas', description: 'Reach the tide engine and decide the fate of the Continental Vault.', descriptionEs: 'Llega al motor de mareas y decide el destino de la Bóveda del Continente.', state: 'active', isMain: true, faction: 'tidebound_fleet',
    objectives: [
      { id: 'c06_reach_engine', description: 'Reach the tide engine', descriptionEs: 'Llegar al motor de mareas', completed: false, current: 0, required: 1 },
      { id: 'c06_decide_vault', description: 'Decide the fate of the Vault', descriptionEs: 'Decidir el destino de la Bóveda', completed: false, current: 0, required: 1 },
    ],
    rewards: [{ type: 'xp', value: 250 }],
  },
};

export const CHAPTER_SIX: Chapter = {
  id: 'chapter-06', index: 6,
  title: 'The Tideless Sea', titleEs: 'El mar sin mareas',
  premise: 'Off the west coast the sea has gone still; beached in that calm lies the Continental Vault, a vessel larger than a village holding the names and debts of an entire coastline; its tide engine is broken.',
  premiseEs: 'Frente a la costa oeste el mar se ha quedado sin marea; varada descansa la Bóveda del Continente, una bóveda mayor que un pueblo donde el mar guardó los nombres y las deudas de toda la costa; su motor de mareas está roto.',
  intro: [
    { type: 'system', text: 'CHAPTER VI — THE TIDELESS SEA', textEs: 'CAPÍTULO VI — EL MAR SIN MAREAS', mood: 'mystery' },
    { type: 'narration', text: '{name} comes to a shore where the sea has gone still. Beached in the calm lies the Continental Vault, holding the names and debts of an entire coastline. The tide engine is broken, the fleet watches from the decks, and the sea-gate is shut. The fate of the Vault is in the engine room.', textEs: '{name} llega a una orilla donde el mar se ha quedado quieto. Varada en la calma descansa la Bóveda del Continente, guardando los nombres y deudas de todo un litoral. El motor de mareas está roto, la armada vigila desde las cubiertas, y la esclusa está cerrada. El destino de la Bóveda está en la sala del motor.', mood: 'mystery' },
    { type: 'system', text: 'CURRENT OBJECTIVE — Reach the tide engine and decide the fate of the Vault.', textEs: 'OBJETIVO ACTUAL — Llega al motor de mareas y decide el destino de la Bóveda.', mood: 'neutral' },
  ],
  startNodeId: 'c06_arrival', startLocationId: 'c06_shore',
  nodes: NODES,
  puzzles: { c06_tide_chart: TIDE_CHART, c06_vault_riddle: VAULT_RIDDLE },
  locations: LOCATIONS, npcs: NPCS, monsters: MONSTERS, quests: QUESTS,
  mainQuestId: 'c06_the_tideless_sea',
  hooks: { bossLocationId: 'c06_engine_room', aftermathNodeId: 'c06_anchored_aftermath' },
  storyFacts: [
    { flag: 'c06_decks_chosen', en: 'The party went to the fleet decks', es: 'El grupo fue a las cubiertas de la flota' },
    { flag: 'c06_docks_chosen', en: 'The party went to the dry docks', es: 'El grupo fue a los muelles secos' },
    { flag: 'c06_hold_chosen', en: 'The party entered the deep hold', es: 'El grupo entró a la bodega profunda' },
    { flag: 'c06_chart_read', en: 'The tide chart was read', es: 'La carta de mareas fue leída' },
    { flag: 'c06_riddle_answered', en: 'The Vault riddle was answered', es: 'El enigma de la Bóveda fue respondido' },
    { flag: 'c06_luggers_faced', en: 'The lance-luggers were fought', es: 'Los lanceros fueron combatidos' },
    { flag: 'c06_anchored_faced', en: 'The Anchored was fought', es: 'El Anclado fue combatido' },
  ],
  suggestions: {
    c06_shore: [{ label: 'Go to the Vault decks', labelEs: 'Ir a las cubiertas de la Bóveda', action: 'go to the vault decks' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c06_vault_decks: [
      { label: 'Return to the shore', labelEs: 'Volver a la orilla', action: 'go to the shore' },
      { label: 'Go to the dry docks', labelEs: 'Ir a los muelles secos', action: 'go to the dry docks' },
      { label: 'Enter the deep hold', labelEs: 'Entrar a la bodega profunda', action: 'go to the deep hold' },
      { label: 'Go to the engine room', labelEs: 'Ir a la sala del motor', action: 'go to the engine room' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c06_dry_docks: [{ label: 'Return to the decks', labelEs: 'Volver a las cubiertas', action: 'go to the vault decks' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c06_deep_hold: [{ label: 'Return to the decks', labelEs: 'Volver a las cubiertas', action: 'go to the vault decks' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c06_engine_room: [{ label: 'Return to the decks', labelEs: 'Volver a las cubiertas', action: 'go to the vault decks' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
  },
  externalEntrySeeds: {
    c06_luggers_aftermath: [{ c06_decks_chosen: true }],
    c06_anchored_aftermath: [{ c06_decks_chosen: true }, { c06_docks_chosen: true }, { c06_hold_chosen: true }],
    c06_arrival: [{ 'canon:c02_map_shared': true, 'canon:c04_name_free': true, 'canon:c04_name_returned': true }],
  },
  summaryFlags: [
    'canon:c06_vault_opened', 'canon:c06_vault_mastered', 'canon:c06_vault_stranded', 'canon:c06_vault_drawn', 'canon:c06_evidence_vault',
  ],
};
