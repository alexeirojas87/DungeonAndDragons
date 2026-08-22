// ============================================================
// CHAPTER IX — The Last Road to Blackmere
// El último camino a Blackmere
// Act III mid-finale. The road home edges past a Blackmere
// that has grown over the door; every choice of the first
// chapter returns — sealed or open, named or nameless, relic
// kept or taken — and then the last collector knocks. Four
// endings close the last road and feed the Ch10 selector.
// ============================================================

import type { Chapter, StoryNode } from '../../engine/chapter';
import type { Puzzle } from '../../engine/puzzles';
import type { WorldLocation, NPC, Enemy, Quest } from '../../engine/types';

// ---- Puzzles -------------------------------------------------

const FLOOD_LOCK: Puzzle = {
  id: 'c09_flood_lock',
  kind: 'mechanism',
  title: 'The Flood Lock',
  titleEs: 'El cerradura de la inundación',
  prompt: 'Three bolts hold the iron band over the Drowned Door, and the black water has risen around them. Turn them in the order the water recedes — the lower bolt first, then the center bolt, then the upper bolt — or the band bites and the water climbs again.',
  promptEs: 'Tres cerrojos sostienen la banda de hierro sobre la Puerta Ahogada, y el agua negra ha subido a su alrededor. Gíralos en el orden en que el agua retrocede — el cerrojo inferior primero, luego el central, luego el superior — o la banda muerde y el agua vuelve a subir.',
  hints: [
    { en: 'The water recedes from the lowest stone first — turn the lower bolt while it is dry.', es: 'El agua retrocede primero de la piedra más baja: gira el cerrojo inferior mientras está seco.' },
    { en: 'Once the lower bolt turns, the center stone drains — turn the center bolt second.', es: 'Una vez girado el inferior, la piedra central se vacía: gira el cerrojo central en segundo lugar.' },
    { en: 'The upper bolt only turns once the water is gone — it is the last and the seal.', es: 'El cerrojo superior solo gira cuando el agua se ha ido: es el último y el sello.' },
  ],
  steps: ['c09_bolt_lower', 'c09_bolt_center', 'c09_bolt_upper'],
  ordered: true,
  stepLabels: [
    { id: 'c09_bolt_lower', label: 'Turn the lower bolt', labelEs: 'Girar el cerrojo inferior' },
    { id: 'c09_bolt_center', label: 'Turn the center bolt', labelEs: 'Girar el cerrojo central' },
    { id: 'c09_bolt_upper', label: 'Turn the upper bolt', labelEs: 'Girar el cerrojo superior' },
  ],
  onWrongStep: { en: 'The band bites and the water climbs back. The order is lost; begin again.', es: 'La banda muerde y el agua vuelve a subir. El orden se pierde; empieza de nuevo.' },
  unlocks: { flags: { c09_lock_opened: true } },
  solvedNodeId: 'c09_lock_solved',
  skipNodeId: 'c09_lock_skipped',
};

const ASH_CHECK: Puzzle = {
  id: 'c09_ash_check',
  kind: 'check',
  title: 'The Ash Reading',
  titleEs: 'La lectura de ceniza',
  prompt: 'The ash-lock reads whether the relic still has a price to pay. Read the ash over the threshold — the last chance to spend the relic the first chapter carried — and the door will take it or turn it away.',
  promptEs: 'La cerradura de ceniza lee si la reliquia aún tiene un precio que pagar. Lee la ceniza sobre el umbral — la última oportunidad de gastar la reliquia que el primer capítulo llevó — y la puerta la tomará o la rechazará.',
  hints: [
    { en: 'The ash answers to the relic the first chapter carried — lay it on the stone and read what remains.', es: 'La ceniza responde a la reliquia que el primer capítulo llevó: ponla sobre la piedra y lee lo que queda.' },
    { en: 'A name read into the ash steadies the reading — if the door kept a name, the price is lighter.', es: 'Un nombre leído en la ceniza afianza la lectura: si la puerta guardó un nombre, el precio es menor.' },
  ],
  skill: 'religion',
  dc: 14,
  clues: [
    { id: 'c09_clue_relic', en: 'The relic claimed a campaign ago still holds — lay it on the ash and the reading drops.', es: 'La reliquia tomada hace una campaña aún sostiene: ponla sobre la ceniza y la lectura baja.', dcReduction: 3 },
    { id: 'c09_clue_name', en: 'If the door kept a name, the ash reads truer — recall it and the price lightens.', es: 'Si la puerta guardó un nombre, la ceniza lee con más certeza: recórdalo y el precio disminuye.', dcReduction: 2 },
  ],
  unlocks: { flags: { c09_relic_spent: true } },
  solvedNodeId: 'c09_ash_spent',
  skipNodeId: 'c09_ash_kept',
};

// ---- Nodes ---------------------------------------------------

const NODES: Record<string, StoryNode> = {
  c09_arrival: {
    id: 'c09_arrival', kind: 'beat', locationId: 'c09_road', externalEntry: true,
    title: 'The Last Road', titleEs: 'El último camino',
    text: 'The road home edges past a Blackmere that has grown over the door. The village has crept down to the crypt since you left it — new walls, new lanterns, a choir that sings where the council once kept silent. Every choice of the first chapter returns here: the door you left sealed or open, named or nameless, the relic kept or taken. The Black Lantern still stands at the crossroads, and Martik is still behind its bar. The last collector has not knocked yet, but the road knows he is coming.',
    textEs: 'El camino de regreso bordea un Blackmere que ha crecido sobre la puerta. El pueblo se ha arrimado a la cripta desde que lo dejaste — muros nuevos, faroles nuevos, un coro que canta donde el consejo antes guardaba silencio. Cada elección del primer capítulo vuelve aquí: la puerta que dejaste sellada o abierta, con nombre o sin él, la reliquia conservada o perdida. El Farol Negro sigue en el cruce, y Martik sigue detrás de su barra. El último cobrador aún no ha llamado, pero el camino sabe que viene.',
    choices: [
      { id: 'c09_arrival_to_edge', label: 'Walk to the door', labelEs: 'Caminar a la puerta', nextNodeId: 'c09_first_edge', result: 'You take the road down to the door. The village watches from behind its new lanterns.', resultEs: 'Tomas el camino hacia la puerta. El pueblo vigila desde detrás de sus faroles nuevos.' },
    ],
  },

  c09_first_edge: {
    id: 'c09_first_edge', kind: 'beat', locationId: 'c09_road',
    title: 'Who Speaks at the Door', titleEs: 'Quién habla en la puerta',
    text: 'The door has grown into the hill, and someone must speak to it before it will answer. Three voices can speak at the door: the one who owes the most — Martik, who kept the first silence; the one with the most to give — Varen, who guided every road; or you alone, who have carried every name this campaign traded. "Choose," the choir sings from the wall. "The door only listens once."',
    textEs: 'La puerta ha crecido hacia el cerro, y alguien debe hablarle antes de que responda. Tres voces pueden hablar en la puerta: la que más debe — Martik, que guardó el primer silencio; la que más tiene que dar — Varen, que guió cada camino; o tú solo, que has llevado cada nombre que esta campaña trocó. —Elige —canta el coro desde el muro—. La puerta solo escucha una vez.',
    choices: [
      { id: 'c09_edge_owes', label: 'Let the one who owes most speak — Martik', labelEs: 'Dejar hablar al que más debe — Martik', nextNodeId: 'c09_owes_lane', requiresValues: [{ key: 'bond:martik', min: 1 }], setsFlags: { c09_owes_chosen: true }, adjustsValues: { conviction_duty: 1, bond_martik: 1 }, result: 'Martik wipes the bar from his hands and walks down to the door. He owes it the first silence; he will pay it with the truth.', resultEs: 'Martik se limpia la barra de las manos y baja a la puerta. Le debe el primer silencio; lo pagará con la verdad.' },
      { id: 'c09_edge_gives', label: 'Let the one with most to give speak — Varen', labelEs: 'Dejar hablar al que más tiene que dar — Varen', nextNodeId: 'c09_gives_lane', requiresValues: [{ key: 'bond:varen', min: 1 }], setsFlags: { c09_gives_chosen: true }, adjustsValues: { conviction_compassion: 1, bond_varen: 1 }, result: 'Varen lays his guide-staff at the door. He has given every road its name; he will give this one too.', resultEs: 'Varen deja su bordón de guía ante la puerta. Ha dado a cada camino su nombre; dará también este.' },
      { id: 'c09_edge_alone', label: 'Speak at the door yourself', labelEs: 'Hablar tú mismo en la puerta', nextNodeId: 'c09_alone_lane', setsFlags: { c09_alone_chosen: true }, adjustsValues: { conviction_freedom: 1 }, result: 'You walk down to the door alone. The choir falls silent; the village does not sing for the one who carries the names.', resultEs: 'Bajas a la puerta tú solo. El coro enmudece; el pueblo no canta para quien lleva los nombres.' },
    ],
  },

  c09_owes_lane: {
    id: 'c09_owes_lane', kind: 'beat', locationId: 'c09_blackmere',
    title: 'The One Who Owes', titleEs: 'El que más debe',
    text: 'Martik walks you to the Black Lantern first. "I kept the council silence when the door first breathed," he says. "I owe the door the truth of that silence, and I can pay it without a blow. Sit, and let me speak the honest price." The lantern is warm and the road is cold, and Martik has kept the inn the whole campaign through.',
    textEs: 'Martik te lleva primero al Farol Negro. —Guardé el silencio del consejo cuando la puerta respiró por primera vez —dice—. Le debo a la puerta la verdad de ese silencio, y puedo pagarlo sin un golpe. Siéntate, y deja que hable el precio honesto. El farol está caliente y el camino está frío, y Martik ha guardado la posada toda la campaña.',
    choices: [
      { id: 'c09_owes_to_price', label: 'Sit and let Martik speak the honest price', labelEs: 'Sentarse y dejar que Martik hable el precio honesto', nextNodeId: 'c09_martik_price', result: 'You sit. Martik pours two cups and begins the talk that closes a debt without a blow.', resultEs: 'Te sientas. Martik sirve dos tazas y empieza la charla que cierra una deuda sin un golpe.' },
      { id: 'c09_owes_back', label: 'Return to the choice of voices', labelEs: 'Volver a la elección de voces', nextNodeId: 'c09_first_edge', result: 'You step back from the lantern. Martik watches you go.', resultEs: 'Retrocedes del farol. Martik te ve irse.' },
    ],
  },

  c09_martik_price: {
    id: 'c09_martik_price', kind: 'beat', locationId: 'c09_blackmere',
    title: 'The Honest Price of Martik', titleEs: 'El precio honesto de Martik',
    text: 'Martik speaks the honest price: the council paid the door to stay silent, and the door kept the names the council could not. The debt is not the door — it is the village, and Martik names it in the warm room where the council once hid it. No steel is drawn. The talk closes the debt, and the door hears its own name spoken for the first time since you left it. Martik walks you down to the yard.',
    textEs: 'Martik habla el precio honesto: el consejo pagó a la puerta para que guardara silencio, y la puerta guardó los nombres que el consejo no pudo. La deuda no es de la puerta — es del pueblo, y Martik la nombra en la sala caliente donde el consejo antes la escondía. No se desenvaina acero. La charla cierra la deuda, y la puerta oye su propio nombre pronunciado por primera vez desde que la dejaste. Martik te lleva al patio.',
    choices: [
      { id: 'c09_price_to_yard', label: 'Walk down to the door yard', labelEs: 'Bajar al patio de la puerta', nextNodeId: 'c09_door_yard', setsFlags: { c09_debt_closed: true }, adjustsValues: { faction_blackmere_council: 1 }, result: 'The honest price is paid. You walk down to the door yard with Martik beside you.', resultEs: 'El precio honesto está pagado. Bajas al patio de la puerta con Martik a tu lado.' },
    ],
  },

  c09_gives_lane: {
    id: 'c09_gives_lane', kind: 'beat', locationId: 'c09_blackmere',
    title: 'The One With Most to Give', titleEs: 'El que más tiene que dar',
    text: 'Varen walks you to the council chamber, where the elder who survived the first chapter still keeps the ledger of the door. "I gave every road its name," Varen says, "and this road I will give the council to bargain with. The door listens to a guide, and the council listens to a debt." The chamber is cold and the ledger is open.',
    textEs: 'Varen te lleva a la sala del consejo, donde el anciano que sobrevivió al primer capítulo aún guarda el registro de la puerta. —Di a cada camino su nombre —dice Varen—, y este camino lo daré al consejo para que negocie. La puerta escucha a un guía, y el consejo escucha a una deuda. La sala está fría y el registro está abierto.',
    choices: [
      { id: 'c09_gives_to_bargain', label: 'Enter the council bargain', labelEs: 'Entrar al trato del consejo', nextNodeId: 'c09_council_bargain', result: 'You enter the chamber. The elder turns the ledger to face you.', resultEs: 'Entras a la sala. El anciano gira el registro hacia ti.' },
      { id: 'c09_gives_back', label: 'Return to the choice of voices', labelEs: 'Volver a la elección de voces', nextNodeId: 'c09_first_edge', result: 'You step back from the chamber. Varen watches you go.', resultEs: 'Retrocedes de la sala. Varen te ve irse.' },
    ],
  },

  c09_council_bargain: {
    id: 'c09_council_bargain', kind: 'beat', locationId: 'c09_blackmere',
    title: 'The Council Bargain', titleEs: 'El trato del consejo',
    text: 'The elder reads the ledger: the council barred the door and charged the village for the barring. Varen offers the council a bargain — the council admits the barring in the open, and the door takes the admission as its price. The council argues, then agrees; a debt admitted in the open is lighter than a debt kept in the dark. Varen walks you down to the yard.',
    textEs: 'El anciano lee el registro: el consejo cerró la puerta y cobró al pueblo por el cierre. Varen ofrece al consejo un trato — el consejo admite el cierre en público, y la puerta toma la admisión como su precio. El consejo discute, luego acepta; una deuda admitida en público es más ligera que una deuda guardada en la oscuridad. Varen te lleva al patio.',
    choices: [
      { id: 'c09_bargain_to_yard', label: 'Walk down to the door yard', labelEs: 'Bajar al patio de la puerta', nextNodeId: 'c09_door_yard', setsFlags: { c09_council_admitted: true }, adjustsValues: { faction_blackmere_council: 1, conviction_truth: 1 }, result: 'The bargain is struck. You walk down to the door yard with Varen beside you.', resultEs: 'El trato está cerrado. Bajas al patio de la puerta con Varen a tu lado.' },
    ],
  },

  c09_alone_lane: {
    id: 'c09_alone_lane', kind: 'beat', locationId: 'c09_road',
    title: 'The Road Alone', titleEs: 'El camino solo',
    text: 'You walk the road alone, and the gravel knows it. Somewhere between the village and the crypt, the gravel shifts — the ambush the first chapter warned of, the one that eats endurance and supplies. You can meet it on the road, or take the long way around through the breach. The night is coming either way.',
    textEs: 'Caminas el camino solo, y la grava lo sabe. En algún lugar entre el pueblo y la cripta, la grava se mueve — la emboscada de la que el primer capítulo advirtió, la que devora resistencia y provisiones. Puedes enfrentarla en el camino, o tomar el rodeo por la brecha. La noche viene de todos modos.',
    choices: [
      { id: 'c09_alone_to_gravel', label: 'Meet the gravel on the road', labelEs: 'Encontrar la grava en el camino', nextNodeId: 'c09_gravel_ambush', result: 'You turn onto the gravel. The ambush is waiting.', resultEs: 'Giras a la grava. La emboscada espera.' },
      { id: 'c09_alone_back', label: 'Return to the choice of voices', labelEs: 'Volver a la elección de voces', nextNodeId: 'c09_first_edge', result: 'You step back. The gravel settles behind you.', resultEs: 'Retrocedes. La grava se aquieta a tu espalda.' },
    ],
  },

  c09_gravel_ambush: {
    id: 'c09_gravel_ambush', kind: 'beat', locationId: 'c09_breach',
    title: 'The Gravel', titleEs: 'La grava',
    text: 'The gravel is not a creature — it is the road itself, hungry for the names the door once took. It rises in a low ridge across the path and grinds where it moves. Endurance and supplies matter here: a fed party breaks the ridge; a spent party is worn down to the bone. You can fight it through, or push past and take the breach.',
    textEs: 'La grava no es una criatura — es el propio camino, hambriento de los nombres que la puerta tomó. Se alza en una cresta baja a través del sendero y muele donde se mueve. La resistencia y las provisiones importan aquí: un grupo alimentado rompe la cresta; un grupo gastado se desgasta hasta el hueso. Puedes combatirla, o empujar y tomar la brecha.',
    choices: [
      { id: 'c09_face_gravel', label: 'Fight the gravel through', labelEs: 'Combatir la grava', nextNodeId: 'c09_gravel_aftermath', setsFlags: { c09_gravel_faced: true }, adjustsValues: { conviction_duty: 1 }, result: 'You raise your weapon. The gravel ridge grinds toward you.', resultEs: 'Levantas tu arma. La cresta de grava muele hacia ti.' },
    ],
  },

  c09_gravel_aftermath: {
    id: 'c09_gravel_aftermath', kind: 'beat', locationId: 'c09_breach', externalEntry: true,
    title: 'The Gravel Broken', titleEs: 'La grava rota',
    text: 'The gravel ridge breaks and the road is quiet again — quiet the way only a road that has eaten can be. You brush the dust from your arms and walk down to the door yard. The night is closer now, and the last collector is closer with it.',
    textEs: 'La cresta de grava se rompe y el camino vuelve a estar en silencio — el silencio que solo un camino que ha comido puede tener. Te sacudes el polvo de los brazos y bajas al patio de la puerta. La noche está más cerca ahora, y el último cobrador más cerca con ella.',
    choices: [
      { id: 'c09_gravel_to_yard', label: 'Walk down to the door yard', labelEs: 'Bajar al patio de la puerta', nextNodeId: 'c09_door_yard', result: 'You walk down to the door yard. The gravel does not follow.', resultEs: 'Bajas al patio de la puerta. La grava no te sigue.' },
    ],
  },

  c09_door_yard: {
    id: 'c09_door_yard', kind: 'beat', locationId: 'c09_door_yard',
    title: 'The Door Yard', titleEs: 'El patio de la puerta',
    text: 'The door yard is where the village buried the door a campaign ago. The hill has grown over it, and the iron band of the flood-lock shows through the grass like a rib. The choir stands on the new wall above, singing the names the door once took. Below, the black water has risen around the three bolts. Someone must recall what the first chapter did here, and then the lock must be turned.',
    textEs: 'El patio de la puerta es donde el pueblo enterró la puerta hace una campaña. El cerro ha crecido sobre ella, y la banda de hierro del cerradura de inundación asoma entre la hierba como una costilla. El coro se mantiene en el muro nuevo, cantando los nombres que la puerta tomó. Abajo, el agua negra ha subido alrededor de los tres cerrojos. Alguien debe recordar lo que el primer capítulo hizo aquí, y luego la cerradura debe girarse.',
    choices: [
      { id: 'c09_yard_to_trio', label: 'Recall the captives of the first chapter', labelEs: 'Recordar a los cautivos del primer capítulo', nextNodeId: 'c09_trio_echo', result: 'You turn to the choir. The names they sing are the ones the door took.', resultEs: 'Te vuelves al coro. Los nombres que cantan son los que la puerta tomó.' },
    ],
  },

  c09_trio_echo: {
    id: 'c09_trio_echo', kind: 'beat', locationId: 'c09_door_yard',
    title: 'The Captives Remembered', titleEs: 'Los cautivos recordados',
    text: 'The choir sings the names of Tomas, Greta, and Lyra — the three the door took in the first chapter. If they were rescued, they stand on the wall now, singing their own names back at the door. If they were lost, the choir sings around the gap where three voices should be, and the gap weighs more than the song.',
    textEs: 'El coro canta los nombres de Tomas, Greta y Lyra — los tres que la puerta tomó en el primer capítulo. Si fueron rescatados, están ahora en el muro, cantando sus propios nombres a la puerta. Si se perdieron, el coro canta alrededor del hueco donde deberían estar tres voces, y el hueco pesa más que la canción.',
    choices: [
      { id: 'c09_trio_present', label: 'Hear the rescued sing their own names', labelEs: 'Oír a los rescatados cantar sus propios nombres', nextNodeId: 'c09_door_memory', requires: [{ flag: 'canon:c01_trio_rescued' }], adjustsValues: { conviction_compassion: 1, faction_blackmere_council: 1 }, result: 'The three stand on the wall and sing. The door hears the names it took, returned alive.', resultEs: 'Los tres se mantienen en el muro y cantan. La puerta oye los nombres que tomó, devueltos vivos.' },
      { id: 'c09_trio_absent', label: 'Stand in the gap where the lost should sing', labelEs: 'Mantenerse en el hueco donde los perdidos deberían cantar', nextNodeId: 'c09_door_memory', requires: [{ flag: 'canon:c01_trio_lost' }], adjustsValues: { conviction_truth: 1 }, result: 'The three are not on the wall. The choir sings around the gap, and the door hears the weight of it.', resultEs: 'Los tres no están en el muro. El coro canta alrededor del hueco, y la puerta oye su peso.' },
      { id: 'c09_trio_unknown', label: 'Say nothing of the captives', labelEs: 'No decir nada de los cautivos', nextNodeId: 'c09_door_memory', result: 'You let the choir sing. The names are the door now, whatever the first chapter did.', resultEs: 'Dejas que el coro cante. Los nombres son de la puerta ahora, fuera lo que fuere que el primer capítulo hizo.' },
    ],
  },

  c09_door_memory: {
    id: 'c09_door_memory', kind: 'beat', locationId: 'c09_door_yard',
    title: 'What the First Chapter Did', titleEs: 'Lo que el primer capítulo hizo',
    text: 'The door remembers what you did to it, and so does the village. The iron band over the flood-lock is different for every door-state you left behind: sealed, broken open, remembered by name, or surrendered to the relic. Recall the first chapter, and the door will answer the recall; then the three bolts wait.',
    textEs: 'La puerta recuerda lo que le hiciste, y el pueblo también. La banda de hierro sobre el cerradura de inundación es distinta para cada estado en que dejaste la puerta: sellada, abierta por fuerza, recordada por su nombre, o entregada a la reliquia. Recuerda el primer capítulo, y la puerta responderá al recuerdo; luego los tres cerrojos esperan.',
    choices: [
      { id: 'c09_recall_sealed', label: 'Recall the door you sealed', labelEs: 'Recordar la puerta que sellaste', nextNodeId: 'c09_flood_door', requires: [{ flag: 'canon:c01_door_sealed' }], setsFlags: { c09_door_recalled: true }, result: 'The band is intact — the seal you left held. The bolts turn harder for it.', resultEs: 'La banda está intacta — el sello que dejaste resistió. Los cerrojos giran más duros por ello.' },
      { id: 'c09_recall_open', label: 'Recall the door you broke open', labelEs: 'Recordar la puerta que abriste', nextNodeId: 'c09_flood_door', requires: [{ flag: 'canon:c01_door_open' }], setsFlags: { c09_door_recalled: true }, result: 'The band is scarred — the opening you forced left its mark. The water is lower for it.', resultEs: 'La banda está marcada — la apertura que forzaste dejó su huella. El agua está más baja por ello.' },
      { id: 'c09_recall_remembered', label: 'Recall the door you named', labelEs: 'Recordar la puerta que nombraste', nextNodeId: 'c09_flood_door', requires: [{ flag: 'canon:c01_door_remembered' }], setsFlags: { c09_door_recalled: true }, result: 'The band carries the name you gave it. The door answers the recall before the bolts turn.', resultEs: 'La banda lleva el nombre que le diste. La puerta responde al recuerdo antes de que los cerrojos giren.' },
      { id: 'c09_recall_relic', label: 'Recall the door you surrendered to the relic', labelEs: 'Recordar la puerta que entregaste a la reliquia', nextNodeId: 'c09_flood_door', requires: [{ flag: 'canon:c01_door_relic' }], setsFlags: { c09_door_recalled: true }, result: 'The band is cold — the relic lane left a hollow in the seal. The water fills the hollow.', resultEs: 'La banda está fría — el camino de la reliquia dejó un hueco en el sello. El agua llena el hueco.' },
      { id: 'c09_recall_destroyed', label: 'Recall the door you destroyed', labelEs: 'Recordar la puerta que destruiste', nextNodeId: 'c09_flood_door', requires: [{ flag: 'canon:c01_door_destroyed' }], setsFlags: { c09_door_recalled: true }, result: 'The band is broken — the door you destroyed grew back around the break. The bolts hold the scar.', resultEs: 'La banda está rota — la puerta que destruiste creció alrededor de la rotura. Los cerrojos sostienen la cicatriz.' },
      { id: 'c09_recall_name', label: 'Speak the name the door still keeps', labelEs: 'Pronunciar el nombre que la puerta aún guarda', nextNodeId: 'c09_flood_door', requires: [{ flag: 'canon:c01_door_named' }], setsFlags: { c09_door_named_spoken: true }, adjustsValues: { conviction_truth: 1 }, result: 'You speak the name. The door stirs under the hill, and the bolts loosen a half-turn.', resultEs: 'Pronuncias el nombre. La puerta se agita bajo el cerro, y los cerrojos aflojan medio giro.' },
      { id: 'c09_recall_approach', label: 'Approach the flood-lock without a recall', labelEs: 'Acercarse al cerradura sin recuerdo', nextNodeId: 'c09_flood_door', result: 'You step to the lock. The door will answer what it answers.', resultEs: 'Te acercas a la cerradura. La puerta responderá lo que responda.' },
    ],
  },

  c09_flood_door: {
    id: 'c09_flood_door', kind: 'puzzle', puzzleId: 'c09_flood_lock', locationId: 'c09_crypt',
    title: 'The Flood Lock', titleEs: 'El cerradura de inundación',
    text: 'Three bolts hold the iron band over the Drowned Door, and the black water has risen around them. Lower, center, upper — in the order the water recedes.',
    textEs: 'Tres cerrojos sostienen la banda de hierro sobre la Puerta Ahogada, y el agua negra ha subido a su alrededor. Inferior, central, superior — en el orden en que el agua retrocede.',
    choices: [],
  },

  c09_lock_solved: {
    id: 'c09_lock_solved', kind: 'beat', locationId: 'c09_crypt',
    title: 'The Lock Turned', titleEs: 'La cerradura girada',
    text: 'The upper bolt turns and the water recedes. The iron band over the door goes slack, and the door is open to the threshold for the first time since you left it. The choir above falls silent. The last bargain can be made now, and the last chance to spend the relic.',
    textEs: 'El cerrojo superior gira y el agua retrocede. La banda de hierro sobre la puerta cede, y la puerta queda abierta al umbral por primera vez desde que la dejaste. El coro arriba enmudece. El último trato puede hacerse ahora, y la última oportunidad de gastar la reliquia.',
    choices: [
      { id: 'c09_solved_to_threshold', label: 'Step to the threshold', labelEs: 'Pasar al umbral', nextNodeId: 'c09_threshold', result: 'You step over the slack band to the threshold. The ash-lock waits.', resultEs: 'Pasas la banda cedida al umbral. La cerradura de ceniza espera.' },
    ],
  },

  c09_lock_skipped: {
    id: 'c09_lock_skipped', kind: 'beat', locationId: 'c09_crypt',
    title: 'The Lock Left', titleEs: 'La cerradura dejada',
    text: 'You leave the bolts as they are. The water stays up and the band stays tight; the door is sealed by the flood rather than by your hand. There is still a threshold to reach, and the ash-lock still reads — but the door will answer what it answers through the water.',
    textEs: 'Dejas los cerrojos como están. El agua se mantiene y la banda sigue apretada; la puerta está sellada por la inundación más que por tu mano. Aún hay un umbral que alcanzar, y la cerradura de ceniza aún lee — pero la puerta responderá lo que responda a través del agua.',
    choices: [
      { id: 'c09_skipped_to_threshold', label: 'Step around the flood to the threshold', labelEs: 'Rodear la inundación hasta el umbral', nextNodeId: 'c09_threshold', result: 'You step around the flood. The threshold waits beyond the water.', resultEs: 'Rodeas la inundación. El umbral espera más allá del agua.' },
    ],
  },

  c09_threshold: {
    id: 'c09_threshold', kind: 'beat', locationId: 'c09_threshold',
    title: 'The Threshold', titleEs: 'El umbral',
    text: 'The threshold is the last stone before the door, and the ash-lock sits on it — a basin of grey ash that reads whether the relic still has a price to pay. This is the last chance to spend the relic the first chapter carried. If you still hold it, lay it on the ash and read what remains; if you do not, the ash reads the door alone.',
    textEs: 'El umbral es la última piedra antes de la puerta, y la cerradura de ceniza está en él — una palangana de ceniza gris que lee si la reliquia aún tiene un precio que pagar. Esta es la última oportunidad de gastar la reliquia que el primer capítulo llevó. Si aún la tienes, ponla sobre la ceniza y lee lo que queda; si no, la ceniza lee a la puerta sola.',
    choices: [
      { id: 'c09_lay_relic', label: 'Lay the relic on the ash and read it', labelEs: 'Poner la reliquia sobre la ceniza y leerla', nextNodeId: 'c09_ash_door', requires: [{ flag: 'canon:c01_relic_claimed' }], setsFlags: { c09_relic_laid: true }, result: 'You lay the relic on the ash. The grey surface takes its shape and waits to be read.', resultEs: 'Pones la reliquia sobre la ceniza. La superficie gris toma su forma y espera ser leída.' },
      { id: 'c09_approach_ash', label: 'Approach the ash-lock without the relic', labelEs: 'Acercarse a la cerradura de ceniza sin la reliquia', nextNodeId: 'c09_ash_door', result: 'You approach the ash-lock. The ash reads the door alone.', resultEs: 'Te acercas a la cerradura de ceniza. La ceniza lee a la puerta sola.' },
    ],
  },

  c09_ash_door: {
    id: 'c09_ash_door', kind: 'puzzle', puzzleId: 'c09_ash_check', locationId: 'c09_threshold',
    title: 'The Ash Reading', titleEs: 'La lectura de ceniza',
    text: 'The ash-lock waits to be read. The last price the door will take is written in the grey.',
    textEs: 'La cerradura de ceniza espera ser leída. El último precio que la puerta tomará está escrito en lo gris.',
    choices: [],
  },

  c09_ash_spent: {
    id: 'c09_ash_spent', kind: 'beat', locationId: 'c09_threshold',
    title: 'The Relic Spent', titleEs: 'La reliquia gastada',
    text: 'The reading takes the relic. The ash swallows its shape and the door takes the price — the relic is spent, and the threshold is lighter for it. The last collector can knock now, and the door will answer him with an empty hand.',
    textEs: 'La lectura toma la reliquia. La ceniza traga su forma y la puerta toma el precio — la reliquia está gastada, y el umbral es más ligero por ello. El último cobrador puede llamar ahora, y la puerta le responderá con la mano vacía.',
    choices: [
      { id: 'c09_spent_to_collector', label: 'Wait for the last collector', labelEs: 'Esperar al último cobrador', nextNodeId: 'c09_last_collector', result: 'The ash settles. The knock comes.', resultEs: 'La ceniza se asienta. Llega la llamada.' },
    ],
  },

  c09_ash_kept: {
    id: 'c09_ash_kept', kind: 'beat', locationId: 'c09_threshold',
    title: 'The Relic Kept', titleEs: 'La reliquia conservada',
    text: 'You keep the relic, or you never had it. The ash reads the door alone, and the door takes its price from the silence instead. The threshold is heavier for it, and the last collector will knock on a door that still holds something back.',
    textEs: 'Conservas la reliquia, o nunca la tuviste. La ceniza lee a la puerta sola, y la puerta toma su precio del silencio en cambio. El umbral es más pesado por ello, y el último cobrador llamará a una puerta que aún guarda algo.',
    choices: [
      { id: 'c09_kept_to_collector', label: 'Wait for the last collector', labelEs: 'Esperar al último cobrador', nextNodeId: 'c09_last_collector', result: 'The ash stays still. The knock comes.', resultEs: 'La ceniza queda quieta. Llega la llamada.' },
    ],
  },

  c09_last_collector: {
    id: 'c09_last_collector', kind: 'beat', locationId: 'c09_threshold',
    title: 'The Last Collector Knocks', titleEs: 'El último cobrador llama',
    text: 'The last collector knocks. He is not the Claim, and he is not the gravel — he is the one who tallies the whole campaign and asks for the door to close on the tally. He does not fight; he bargains. "The door closes one way or another," he says. "Choose the way, and I will write it." The choir above holds its breath.',
    textEs: 'El último cobrador llama. No es la Reclamación, ni es la grava — es el que suma toda la campaña y pide que la puerta se cierre sobre la suma. No combate; trata. —La puerta se cierra de una forma o de otra —dice—. Elige la forma, y yo la escribiré. El coro arriba contiene el aliento.',
    choices: [
      { id: 'c09_collector_to_bargain', label: 'Hear the last bargain', labelEs: 'Oír el último trato', nextNodeId: 'c09_collector_bargain', result: 'You stand at the threshold and hear the bargain. The collector opens his tally.', resultEs: 'Te mantienes en el umbral y oyes el trato. El cobrador abre su suma.' },
    ],
  },

  c09_collector_bargain: {
    id: 'c09_collector_bargain', kind: 'beat', locationId: 'c09_threshold',
    title: 'The Last Bargain', titleEs: 'El último trato',
    text: 'The collector lays the tally open: every name the campaign traded, every door it crossed, every price it paid or kept. The door closes on the tally one way — open, sealed, burned, or carried by the one who walks the threshold for the rest. If the Veiled Court vindicated the door, you can press its verdict on the collector and seal the door with the court hand. Choose the way the door closes.',
    textEs: 'El cobrador abre la suma: cada nombre que la campaña trocó, cada puerta que cruzó, cada precio que pagó o guardó. La puerta se cierra sobre la suma de una forma — abierta, sellada, quemada, o cargada por quien camine el umbral el resto del tiempo. Si la Corte del Velo vindicó la puerta, puedes imponer su veredicto al cobrador y sellar la puerta con la mano de la corte. Elige la forma en que la puerta se cierra.',
    choices: [
      { id: 'c09_open_the_door', label: 'Open the door — let the tally go free', labelEs: 'Abrir la puerta — dejar ir la suma', nextNodeId: 'c09_ending_open', setsFlags: { 'canon:c09_door_open': true }, adjustsValues: { conviction_freedom: 1 }, result: 'You open the door. The tally goes free, and the road keeps no debt.', resultEs: 'Abres la puerta. La suma se va libre, y el camino no guarda deuda.' },
      { id: 'c09_seal_the_door', label: 'Seal the door — the tally is closed and kept', labelEs: 'Sellar la puerta — la suma queda cerrada y guardada', nextNodeId: 'c09_ending_sealed', setsFlags: { 'canon:c09_door_sealed': true }, adjustsValues: { conviction_duty: 1 }, result: 'You seal the door. The tally is closed and kept, and the road holds.', resultEs: 'Sellas la puerta. La suma queda cerrada y guardada, y el camino sostiene.' },
      { id: 'c09_burn_the_door', label: 'Burn the door — the tally is ash and the road starts over', labelEs: 'Quemar la puerta — la suma es ceniza y el camino empieza de nuevo', nextNodeId: 'c09_ending_burned', setsFlags: { 'canon:c09_door_burned': true }, adjustsValues: { conviction_freedom: 1, conviction_truth: 1 }, result: 'You burn the door. The tally is ash, and the road begins again on the ash.', resultEs: 'Quemas la puerta. La suma es ceniza, y el camino empieza de nuevo sobre la ceniza.' },
      { id: 'c09_martyr_the_door', label: 'Carry the door — walk the threshold for the rest', labelEs: 'Cargar la puerta — caminar el umbral el resto', nextNodeId: 'c09_ending_martyr', requiresValues: [{ key: 'bond:varen', min: 2 }], setsFlags: { 'canon:c09_martyr': true, 'canon:c09_door_sealed': true }, adjustsValues: { conviction_compassion: 1, bond_varen: -3 }, result: 'Varen offers himself. He walks the threshold for the rest, and the door closes on his name instead of the village.', resultEs: 'Varen se ofrece. Camina el umbral el resto, y la puerta se cierra sobre su nombre en vez del pueblo.' },
      { id: 'c09_press_verdict', label: 'Press the court vindication on the collector', labelEs: 'Imponer la vindicación de la corte al cobrador', nextNodeId: 'c09_ending_sealed', requires: [{ flag: 'canon:c08_verdict_vindicated' }], setsFlags: { 'canon:c09_door_sealed': true, c09_verdict_pressed: true }, adjustsValues: { conviction_duty: 1 }, result: 'The court vindicated the door. You press its verdict on the collector, and the door seals with the court hand.', resultEs: 'La corte vindicó la puerta. Impones su veredicto al cobrador, y la puerta se sella con la mano de la corte.' },
    ],
  },

  c09_ending_open: {
    id: 'c09_ending_open', kind: 'ending', terminal: true, choices: [],
    title: 'Open', titleEs: 'Abierta',
    text: 'The door opens. The tally the campaign carried goes free into the night, and the road keeps no debt. The choir sings the names one last time and then stops — the names are no longer the door to keep. Blackmere wakes to a door that answers only to itself, and the last collector closes his book with nothing left to write. The road to the Tenth Door is open, and whatever it costs, it will cost in the open.',
    textEs: 'La puerta se abre. La suma que la campaña llevó se va libre en la noche, y el camino no guarda deuda. El coro canta los nombres una última vez y luego se detiene — los nombres ya no son de la puerta para guardar. Blackmere despierta a una puerta que solo responde a sí misma, y el último cobrador cierra su libro sin nada que escribir. El camino a la décima puerta queda abierto, y cueste lo que cueste, costará abiertamente.',
    outcome: 'ambiguous', survivors: ['c09_martik', 'c09_council_elder'], casualties: [],
  },

  c09_ending_sealed: {
    id: 'c09_ending_sealed', kind: 'ending', terminal: true, choices: [],
    title: 'Sealed', titleEs: 'Sellada',
    text: 'The door seals. The tally is closed and kept, and the road holds its weight. The choir sings the names into the seal so the door does not forget them, and the village builds a new wall over the band — not to hide the door, but to mark it. The last collector writes "sealed" in his book and goes. The road to the Tenth Door carries a closed vessel, and the next world door will open onto a seal that knows its own name.',
    textEs: 'La puerta se sella. La suma queda cerrada y guardada, y el camino sostiene su peso. El coro canta los nombres al sello para que la puerta no los olvide, y el pueblo levanta un muro nuevo sobre la banda — no para ocultar la puerta, sino para marcarla. El último cobrador escribe «sellada» en su libro y se va. El camino a la décima puerta lleva una vasija cerrada, y la puerta del próximo mundo se abrirá sobre un sello que conoce su propio nombre.',
    outcome: 'success', survivors: ['c09_martik', 'c09_council_elder'], casualties: [],
  },

  c09_ending_burned: {
    id: 'c09_ending_burned', kind: 'ending', terminal: true, choices: [],
    title: 'Burned', titleEs: 'Quemada',
    text: 'The door burns. The tally turns to ash and the road starts over on the ash. The choir scatters — some names were kept, and some were lost, and the fire does not sort them. Blackmere wakes to a hollow where the door was, and the last collector writes "burned" and shuts his book for good. The road to the Tenth Door carries nothing but the ash, and the next world door will have to grow its own name from scratch.',
    textEs: 'La puerta arde. La suma se vuelve ceniza y el camino empieza de nuevo sobre la ceniza. El coro se esparce — algunos nombres se guardaron, otros se perdieron, y el fuego no los separa. Blackmere despierta a un hueco donde estaba la puerta, y el último cobrador escribe «quemada» y cierra su libro para siempre. El camino a la décima puerta no lleva más que la ceniza, y la puerta del próximo mundo tendrá que criar su propio nombre desde cero.',
    outcome: 'ambiguous', survivors: ['c09_martik'], casualties: [],
  },

  c09_ending_martyr: {
    id: 'c09_ending_martyr', kind: 'ending', terminal: true, choices: [],
    title: 'Martyr', titleEs: 'Martirio',
    text: 'Varen walks the threshold. The door closes on his name instead of the village, and the tally is paid by the one who guided every road. The choir does not sing — they stand in silence for the guide who became the door keeper. The last collector writes "carried" and leaves the book open, because a price carried is never quite closed. The road to the Tenth Door carries a sealed door and a name no one alive may learn again.',
    textEs: 'Varen camina el umbral. La puerta se cierra sobre su nombre en vez del pueblo, y la suma la paga el que guió cada camino. El coro no canta — se mantienen en silencio por el guía que se volvió guardián de la puerta. El último cobrador escribe «cargado» y deja el libro abierto, porque un precio cargado nunca está del todo cerrado. El camino a la décima puerta lleva una puerta sellada y un nombre que nadie vivo podrá aprender de nuevo.',
    outcome: 'success', survivors: ['c09_martik', 'c09_council_elder'], casualties: ['c09_varen'],
  },
};

// ---- World ---------------------------------------------------

const LOCATIONS: Record<string, WorldLocation> = {
  c09_road: {
    id: 'c09_road', name: 'The Last Road', nameEs: 'El último camino',
    description: 'The road home, edged by the salt wind and the new walls of Blackmere. The door has grown into the hill at its end.',
    descriptionEs: 'El camino a casa, bordeado por el viento de sal y los muros nuevos de Blackmere. La puerta ha crecido hacia el cerro al final.',
    connections: ['c09_blackmere'],
    objects: [{ id: 'c09_crossroads', name: 'The Crossroads', nameEs: 'El cruce', description: 'Where the Black Lantern still stands, and Martik still keeps the bar.', descriptionEs: 'Donde el Farol Negro aún se mantiene, y Martik aún guarda la barra.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'outdoor',
  },
  c09_blackmere: {
    id: 'c09_blackmere', name: 'Blackmere', nameEs: 'Blackmere',
    description: 'The village has crept down to the crypt. New walls, new lanterns, a choir that sings where the council once kept silent. The Black Lantern stands at the crossroads and the council chamber stands behind it.',
    descriptionEs: 'El pueblo se ha arrimado a la cripta. Muros nuevos, faroles nuevos, un coro que canta donde el consejo antes guardaba silencio. El Farol Negro se mantiene en el cruce y la sala del consejo detrás.',
    connections: ['c09_road', 'c09_door_yard', 'c09_breach'],
    objects: [{ id: 'c09_new_wall', name: 'The New Wall', nameEs: 'El muro nuevo', description: 'A wall the village built over the door, not to hide it but to mark it. The choir stands on it.', descriptionEs: 'Un muro que el pueblo levantó sobre la puerta, no para ocultarla sino para marcarla. El coro se mantiene en él.', interactable: true, broken: false, hidden: false }],
    npcs: ['c09_martik', 'c09_council_elder'], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'town',
  },
  c09_door_yard: {
    id: 'c09_door_yard', name: 'The Door Yard', nameEs: 'El patio de la puerta',
    description: 'The hill has grown over the door, and the iron band of the flood-lock shows through the grass. The choir stands on the wall above, singing the names the door once took.',
    descriptionEs: 'El cerro ha crecido sobre la puerta, y la banda de hierro del cerradura de inundación asoma entre la hierba. El coro se mantiene en el muro, cantando los nombres que la puerta tomó.',
    connections: ['c09_blackmere', 'c09_crypt'],
    objects: [{ id: 'c09_iron_band', name: 'The Iron Band', nameEs: 'La banda de hierro', description: 'The band over the flood-lock, three bolts in it, black water risen around them.', descriptionEs: 'La banda sobre el cerradura de inundación, tres cerrojos en ella, agua negra subida a su alrededor.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 2, discovered: true, secrets: [], ambiance: 'crypt',
  },
  c09_crypt: {
    id: 'c09_crypt', name: 'The Flooded Crypt', nameEs: 'La cripta inundada',
    description: 'The Sunken Crypt, a campaign older. The black water has risen around the three bolts of the flood-lock, and the Drowned Door breathes behind the band.',
    descriptionEs: 'La Cripta Sumergida, una campaña más vieja. El agua negra ha subido alrededor de los tres cerrojos del cerradura de inundación, y la Puerta Ahogada respira detrás de la banda.',
    connections: ['c09_door_yard', 'c09_threshold'],
    objects: [{ id: 'c09_drowned_door', name: 'The Drowned Door', nameEs: 'La Puerta Ahogada', description: 'The door behind the iron band. It has grown into the hill and it remembers what you did to it.', descriptionEs: 'La puerta detrás de la banda de hierro. Ha crecido hacia el cerro y recuerda lo que le hiciste.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 3, discovered: true, secrets: [], ambiance: 'crypt',
  },
  c09_threshold: {
    id: 'c09_threshold', name: 'The Threshold', nameEs: 'El umbral',
    description: 'The last stone before the door. The ash-lock sits on it — a basin of grey ash that reads whether the relic still has a price to pay. The last collector knocks here.',
    descriptionEs: 'La última piedra antes de la puerta. La cerradura de ceniza está en ella — una palangana de ceniza gris que lee si la reliquia aún tiene un precio que pagar. El último cobrador llama aquí.',
    connections: ['c09_crypt'],
    objects: [{ id: 'c09_ash_lock', name: 'The Ash-Lock', nameEs: 'La cerradura de ceniza', description: 'A basin of grey ash that reads the relic and the door. The last price is written in the grey.', descriptionEs: 'Una palangana de ceniza gris que lee la reliquia y la puerta. El último precio está escrito en lo gris.', interactable: true, broken: false, hidden: false }],
    npcs: ['c09_collector'], enemies: [], dangerLevel: 2, discovered: true, secrets: [], ambiance: 'crypt',
  },
  c09_breach: {
    id: 'c09_breach', name: 'The Gravel Road', nameEs: 'El camino de grava',
    description: 'Where the road turns to gravel and the ambush eats endurance and supplies. The gravel is the road itself, hungry for the names the door once took.',
    descriptionEs: 'Donde el camino se vuelve grava y la emboscada devora resistencia y provisiones. La grava es el propio camino, hambriento de los nombres que la puerta tomó.',
    connections: ['c09_blackmere'],
    objects: [{ id: 'c09_gravel_ridge', name: 'The Gravel Ridge', nameEs: 'La cresta de grava', description: 'A low ridge of shifting gravel across the path. It grinds where it moves.', descriptionEs: 'Una cresta baja de grava movediza a través del sendero. Muele donde se mueve.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: ['c09_gravel'], dangerLevel: 4, discovered: true, secrets: [], ambiance: 'battle',
  },
};

const NPCS: Record<string, NPC> = {
  c09_martik: {
    id: 'c09_martik', name: 'Martik', nameEs: 'Martik', portrait: 'innkeeper', faction: 'blackmere_council', location: 'c09_blackmere', disposition: 20,
    knowledge: ['the_first_silence', 'the_door', 'the_honest_price'],
    memory: [], inventory: [],
    dialogue: [
      { id: 'greeting', text: 'Martik wipes the bar from his hands. "I kept the council silence when the door first breathed. I owe it the truth of that silence — and I can pay it without a blow. Sit, and let me speak the honest price."', textEs: 'Martik se limpia la barra de las manos. «Guardé el silencio del consejo cuando la puerta respiró por primera vez. Le debo la verdad de ese silencio — y puedo pagarlo sin un golpe. Siéntate, y deja que hable el precio honesto».', responses: [{ text: 'I will sit.', textEs: 'Me sentaré.', nextNodeId: 'end' }] },
    ],
    alive: true, occupation: 'Innkeeper', occupationEs: 'Posadero', secrets: [], secretsEs: [], personality: 'honest', personalityEs: 'honesto',
  },
  c09_council_elder: {
    id: 'c09_council_elder', name: 'The Council Elder', nameEs: 'El anciano del consejo', portrait: 'villager', faction: 'blackmere_council', location: 'c09_blackmere', disposition: 0,
    knowledge: ['the_ledger', 'the_barring'],
    memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'The elder turns the ledger to face you. "The council barred the door and charged the village for the barring. The debt is ours — name it, and the door takes the admission as its price."', textEs: 'El anciano gira el registro hacia ti. «El consejo cerró la puerta y cobró al pueblo por el cierre. La deuda es nuestra — nómbrala, y la puerta toma la admisión como su precio».', responses: [{ text: 'I will name it.', textEs: 'La nombraré.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Elder', occupationEs: 'Anciano', secrets: [], secretsEs: [], personality: 'weary', personalityEs: 'cansado',
  },
  c09_collector: {
    id: 'c09_collector', name: 'The Last Collector', nameEs: 'El último cobrador', portrait: 'mysterious', faction: 'veiled_court', location: 'c09_threshold', disposition: 0,
    knowledge: ['the_tally', 'the_door', 'the_campaign'],
    memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'The last collector opens his tally. "The door closes one way or another. Choose the way, and I will write it. I do not fight; I bargain."', textEs: 'El último cobrador abre su suma. «La puerta se cierra de una forma o de otra. Elige la forma, y yo la escribiré. No combate; trato».', responses: [{ text: 'I will choose.', textEs: 'Elegiré.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Collector', occupationEs: 'Cobrador', secrets: [], secretsEs: [], personality: 'patient', personalityEs: 'paciente',
  },
};

const MONSTERS: Record<string, Omit<Enemy, 'id'>> = {
  c09_gravel: {
    templateId: 'c09_gravel', name: 'The Gravel', nameEs: 'La grava', portrait: 'golem', hp: 28, maxHp: 28, ac: 15, attack: 7, damage: '2d8', damageType: 'bludgeoning', abilities: ['Grind', 'Swallow the Road', 'Endurance Drain'], abilitiesEs: ['Moler', 'Tragar el camino', 'Drenar resistencia'], xpValue: 250, loot: [], intelligence: 4, morale: 100, conditions: [],
  },
};

const QUESTS: Record<string, Quest> = {
  c09_the_last_road: {
    id: 'c09_the_last_road', name: 'The Last Road to Blackmere', nameEs: 'El último camino a Blackmere', description: 'Return to the door the first chapter opened, and close it before the last collector writes the tally.', descriptionEs: 'Vuelve a la puerta que el primer capítulo abrió, y ciérrala antes de que el último cobrador escriba la suma.', state: 'active', isMain: true, faction: 'blackmere_council',
    objectives: [
      { id: 'c09_speak_door', description: 'Speak at the door', descriptionEs: 'Hablar en la puerta', completed: false, current: 0, required: 1 },
      { id: 'c09_close_door', description: 'Close the door on the tally', descriptionEs: 'Cerrar la puerta sobre la suma', completed: false, current: 0, required: 1 },
    ],
    rewards: [{ type: 'xp', value: 350 }],
  },
};

export const CHAPTER_NINE: Chapter = {
  id: 'chapter-09', index: 9,
  title: 'The Last Road to Blackmere', titleEs: 'El último camino a Blackmere',
  premise: 'The road home edges past a Blackmere that has grown over the door; every choice of the first chapter returns — sealed or open, named or nameless, relic kept or taken — and then the last collector knocks.',
  premiseEs: 'El único camino de regreso bordea un Blackmere que ha crecido sobre la puerta; cada elección del primer capítulo vuelve — sellada o abierta, con nombre o sin él, la reliquia conservada o perdida —; después llama el último cobrador.',
  intro: [
    { type: 'system', text: 'CHAPTER IX — THE LAST ROAD TO BLACKMERE', textEs: 'CAPÍTULO IX — EL ÚLTIMO CAMINO A BLACKMERE', mood: 'mystery' },
    { type: 'narration', text: '{name} comes home to a Blackmere that has grown over the door. The village crept down to the crypt, the choir sings where the council kept silent, and the iron band of the flood-lock shows through the grass. Every choice of the first chapter returns here, and then the last collector knocks.', textEs: '{name} vuelve a casa a un Blackmere que ha crecido sobre la puerta. El pueblo se arrimó a la cripta, el coro canta donde el consejo guardaba silencio, y la banda de hierro del cerradura de inundación asoma entre la hierba. Cada elección del primer capítulo vuelve aquí, y luego llama el último cobrador.', mood: 'mystery' },
    { type: 'system', text: 'CURRENT OBJECTIVE — Speak at the door, turn the flood-lock, and close the door on the tally.', textEs: 'OBJETIVO ACTUAL — Habla en la puerta, gira el cerradura de inundación y cierra la puerta sobre la suma.', mood: 'neutral' },
  ],
  startNodeId: 'c09_arrival', startLocationId: 'c09_road',
  nodes: NODES,
  puzzles: { c09_flood_lock: FLOOD_LOCK, c09_ash_check: ASH_CHECK },
  locations: LOCATIONS, npcs: NPCS, monsters: MONSTERS, quests: QUESTS,
  mainQuestId: 'c09_the_last_road',
  hooks: { bossLocationId: 'c09_breach', aftermathNodeId: 'c09_gravel_aftermath' },
  storyFacts: [
    { flag: 'c09_owes_chosen', en: 'The one who owes most spoke at the door', es: 'El que más debe habló en la puerta' },
    { flag: 'c09_gives_chosen', en: 'The one with most to give spoke at the door', es: 'El que más tiene que dar habló en la puerta' },
    { flag: 'c09_alone_chosen', en: 'The party spoke at the door alone', es: 'El grupo habló en la puerta solo' },
    { flag: 'c09_debt_closed', en: 'Martik spoke the honest price and closed the debt', es: 'Martik habló el precio honesto y cerró la deuda' },
    { flag: 'c09_council_admitted', en: 'The council admitted the barring in the open', es: 'El consejo admitió el cierre en público' },
    { flag: 'c09_gravel_faced', en: 'The gravel was fought on the last road', es: 'La grava fue combatida en el último camino' },
    { flag: 'c09_door_recalled', en: 'The first chapter door-state was recalled', es: 'El estado de la puerta del primer capítulo fue recordado' },
    { flag: 'c09_door_named_spoken', en: 'The name the door keeps was spoken at the yard', es: 'El nombre que la puerta guarda fue pronunciado en el patio' },
    { flag: 'c09_lock_opened', en: 'The flood-lock was turned', es: 'El cerradura de inundación fue girado' },
    { flag: 'c09_relic_laid', en: 'The relic was laid on the ash', es: 'La reliquia fue puesta sobre la ceniza' },
    { flag: 'c09_relic_spent', en: 'The ash reading spent the relic', es: 'La lectura de ceniza gastó la reliquia' },
    { flag: 'c09_verdict_pressed', en: 'The court vindication was pressed on the collector', es: 'La vindicación de la corte fue impuesta al cobrador' },
  ],
  suggestions: {
    c09_road: [{ label: 'Walk to the door', labelEs: 'Caminar a la puerta', action: 'go to the door' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c09_blackmere: [{ label: 'Go to the door yard', labelEs: 'Ir al patio de la puerta', action: 'go to the door yard' }, { label: 'Go to the gravel road', labelEs: 'Ir al camino de grava', action: 'go to the gravel road' }, { label: 'Return to the last road', labelEs: 'Volver al último camino', action: 'go to the last road' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c09_door_yard: [{ label: 'Enter the flooded crypt', labelEs: 'Entrar a la cripta inundada', action: 'go to the flooded crypt' }, { label: 'Return to Blackmere', labelEs: 'Volver a Blackmere', action: 'go to blackmere' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c09_crypt: [{ label: 'Go to the threshold', labelEs: 'Ir al umbral', action: 'go to the threshold' }, { label: 'Return to the door yard', labelEs: 'Volver al patio de la puerta', action: 'go to the door yard' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c09_threshold: [{ label: 'Return to the crypt', labelEs: 'Volver a la cripta', action: 'go to the flooded crypt' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c09_breach: [{ label: 'Return to Blackmere', labelEs: 'Volver a Blackmere', action: 'go to blackmere' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
  },
  externalEntrySeeds: {
    c09_arrival: [
      { 'canon:c01_door_sealed': true, 'canon:c01_trio_rescued': true, 'canon:c01_relic_claimed': true, 'canon:c01_door_named': true, 'canon:c08_verdict_vindicated': true },
      { 'canon:c01_door_open': true, 'canon:c01_trio_lost': true, 'canon:c08_verdict_reform': true },
      { 'canon:c01_door_remembered': true, 'canon:c08_verdict_dissolved': true },
      { 'canon:c01_door_relic': true, 'canon:c08_verdict_hung': true },
      { 'canon:c01_door_destroyed': true, 'canon:c08_verdict_vindicated': true },
    ],
    c09_gravel_aftermath: [{ c09_alone_chosen: true, c09_gravel_faced: true }],
  },
  summaryFlags: [
    'canon:c09_door_open', 'canon:c09_door_sealed', 'canon:c09_door_burned', 'canon:c09_martyr',
  ],
};
