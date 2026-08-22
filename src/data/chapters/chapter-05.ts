// ============================================================
// CHAPTER V — The Iron Parliament
// El parlamento de hierro
// Act II. An exploded vault has scattered its receipts across
// the plaza, proving all oath-magic flows through a single
// continental register. The Iron Parliament must decide: ban
// it, own it, or place the law beside it. Four endings close
// the vote.
// ============================================================

import type { Chapter, StoryNode } from '../../engine/chapter';
import type { Puzzle } from '../../engine/puzzles';
import type { WorldLocation, NPC, Enemy, Quest } from '../../engine/types';

// ---- Puzzles -------------------------------------------------

const CHAMBER_LOCKS: Puzzle = {
  id: 'c05_chamber_locks',
  kind: 'mechanism',
  title: 'The Chamber Locks',
  titleEs: 'Los cerrojos de la cámara',
  prompt: 'Three locks hold the vault chamber, and the register behind it. Turn them in the order the receipts were filed: receipt, register, seal. Turn them wrong and the chamber bolts itself.',
  promptEs: 'Tres cerrojos sostienen la cámara del depósito, y el registro detrás de ella. Gíralos en el orden en que se archivaron los recibos: recibo, registro, sello. Si los giras mal, la cámara se tranca.',
  hints: [
    { en: 'The receipt-lock is filed first — it is the thinnest, the one that proves the debt exists.', es: 'El cerrojo del recibo se archiva primero: es el más fino, el que prueba que la deuda existe.' },
    { en: 'The register-lock is filed second — it is the one that names who owes and who holds.', es: 'El cerrojo del registro se archiva segundo: es el que nombra quién debe y quién guarda.' },
    { en: 'The seal-lock is filed last — it is the thickest, the one that closes the law around the debt.', es: 'El cerrojo del sello se archiva al final: es el más grueso, el que cierra la ley alrededor de la deuda.' },
  ],
  steps: ['c05_lock_receipt', 'c05_lock_register', 'c05_lock_seal'],
  ordered: true,
  stepLabels: [
    { id: 'c05_lock_receipt', label: 'Turn the receipt-lock', labelEs: 'Girar el cerrojo del recibo' },
    { id: 'c05_lock_register', label: 'Turn the register-lock', labelEs: 'Girar el cerrojo del registro' },
    { id: 'c05_lock_seal', label: 'Turn the seal-lock', labelEs: 'Girar el cerrojo del sello' },
  ],
  onWrongStep: { en: 'The locks spin shut and the chamber bolts itself. Begin again.', es: 'Los cerrojos giran y se cierran, y la cámara se tranca. Empieza de nuevo.' },
  unlocks: { flags: { c05_chamber_open: true } },
  solvedNodeId: 'c05_chamber_unlocked',
  skipNodeId: 'c05_chamber_locked',
};

const TELLER_ROLL: Puzzle = {
  id: 'c05_teller_roll',
  kind: 'check',
  title: 'The Teller Roll',
  titleEs: 'El rollo del contador',
  prompt: 'The teller roll is a scroll of receipts that proves every oath-magic transaction flows through one continental register. Read it properly and you have the evidence the parliament cannot ignore.',
  promptEs: 'El rollo del contador es un pergamino de recibos que prueba que toda transacción de magia de juramento pasa por un único registro continental. Léelo como es debido y tendrás la prueba que el parlamento no puede ignorar.',
  hints: [
    { en: 'The receipts are filed by date, not by name. The dates cluster around the solstices.', es: 'Los recibos se archivan por fecha, no por nombre. Las fechas se agrupan alrededor de los solsticios.' },
    { en: 'Each receipt names the same register — the continental one — as the vessel of the oath.', es: 'Cada recibo nombra al mismo registro — el continental — como la vasija del juramento.' },
  ],
  skill: 'investigation',
  dc: 14,
  clues: [
    { id: 'c05_clue_dates', en: 'The dates cluster at the solstices — the register opens twice a year.', es: 'Las fechas se agrupan en los solsticios: el registro se abre dos veces al año.', dcReduction: 2 },
    { id: 'c05_clue_names', en: 'Every receipt names the continental register as the vessel.', es: 'Cada recibo nombra al registro continental como la vasija.', dcReduction: 3 },
  ],
  unlocks: { flags: { c05_teller_read: true } },
  solvedNodeId: 'c05_teller_read',
  skipNodeId: 'c05_teller_skipped',
};

// ---- Nodes ---------------------------------------------------

const NODES: Record<string, StoryNode> = {
  c05_arrival: {
    id: 'c05_arrival', kind: 'beat', locationId: 'c05_plaza', externalEntry: true,
    title: 'The Exploded Vault', titleEs: 'El depósito reventado',
    text: 'The vault in the plaza has exploded in the night, and its receipts scatter the cobblestones like white leaves. Every receipt names the same register — the continental one — as the vessel every oath flows through. The Iron Parliament is in emergency session behind the closed doors, and the plaza is full of people who can read.',
    textEs: 'El depósito de la plaza ha reventado en la noche, y sus recibos se esparcen por los adoquines como hojas blancas. Cada recibo nombra al mismo registro — el continental — como la vasija por la que pasa cada juramento. El Parlamento de Hierro está en sesión de emergencia tras las puertas cerradas, y la plaza está llena de gente que sabe leer.',
    choices: [
      { id: 'c05_arrival_with_map', label: 'Enter through the side the map showed', labelEs: 'Entrar por el lado que el mapa mostró', nextNodeId: 'c05_parliament_floor', requires: [{ flag: 'canon:c02_map_shared' }], result: 'The map Olen shared still holds the side entrance. You slip in past the crowd.', resultEs: 'El mapa que Olen compartió aún guarda la entrada lateral. Te cuelas entre la multitud.' },
      { id: 'c05_arrival_open', label: 'Walk in through the front', labelEs: 'Entrar por la puerta principal', nextNodeId: 'c05_parliament_floor', result: 'You push through the crowd and the receipts. The parliament doors are open.', resultEs: 'Atraviesas la multitud y los recibos. Las puertas del parlamento están abiertas.' },
    ],
  },

  c05_parliament_floor: {
    id: 'c05_parliament_floor', kind: 'beat', locationId: 'c05_parliament',
    title: 'The Parliament Floor', titleEs: 'La sala del parlamento',
    text: 'The Iron Parliament sits in emergency session. The chamber is iron and cold, and every seat is full. At the registrar desk, a man in iron-grey sorts the receipts the plaza coughed up. He is Registrar Voss, and he has been expecting someone to come with evidence — not with opinions.',
    textEs: 'El Parlamento de Hierro se sienta en sesión de emergencia. La sala es de hierro y fría, y cada asiento está ocupado. En la mesa del registrador, un hombre vestido de gris hierro ordena los recibos que la plaza escupió. Es el Registrador Voss, y lleva tiempo esperando a alguien que venga con pruebas — no con opiniones.',
    choices: [
      { id: 'c05_floor_to_voss', label: 'Approach the registrar', labelEs: 'Acercarse al registrador', nextNodeId: 'c05_registrar_seat', result: 'Voss looks up. His desk is full of receipts and his hands are still.', resultEs: 'Voss levanta la mirada. Su mesa está llena de recibos y sus manos están quietas.' },
    ],
  },

  c05_registrar_seat: {
    id: 'c05_registrar_seat', kind: 'beat', locationId: 'c05_parliament',
    title: 'The Registrar Seat', titleEs: 'El asiento del registrador',
    text: 'Voss does not stand. "The vault exploded because the register is too full," he says. "Every oath on this continent flows through one vessel, and the vessel is cracking. The parliament will vote today: govern it, free it, or let it split. I have a file that says govern. The people outside have a teller roll that says free. And you — what do you carry?" He looks at your hands.',
    textEs: 'Voss no se levanta. —El depósito reventó porque el registro está demasiado lleno —dice—. Cada juramento de este continente pasa por una sola vasija, y la vasija se está rajando. El parlamento votará hoy: gobernarlo, liberarlo o dejar que se parta. Yo tengo un expediente que dice gobernar. La gente de afuera tiene un rollo del contador que dice liberar. ¿Y tú, qué llevas? — Te mira las manos.',
    choices: [
      { id: 'c05_seat_to_first', label: 'Answer the registrar', labelEs: 'Responder al registrador', nextNodeId: 'c05_first_seat', result: 'You meet his gaze. The vote waits.', resultEs: 'Sostienes su mirada. La votación espera.' },
    ],
  },

  c05_first_seat: {
    id: 'c05_first_seat', kind: 'beat', locationId: 'c05_parliament',
    title: 'The First Seat', titleEs: 'El primer asiento',
    text: 'Three doors leave the chamber: the public floor where the people hold their own vote, the vault where the receipts are still scattered, and Voss\'s office where his file waits. "Choose," Voss says. "Boycott the parliament and take it to the people. Take the floor and examine the vault. Or hand the list to the people through me. The vote is at sundown, and the register will not hold past dawn."',
    textEs: 'Tres puertas dan salida desde la sala: la planta pública donde la gente celebra su propia votación, el depósito donde los recibos siguen esparcidos, y el despacho de Voss donde su expediente espera. —Elige —dice Voss—. Boicotea el parlamento y llévalo a la gente. Toma la planta y examina el depósito. O entrega la lista a la gente a través de mí. La votación es al atardecer, y el registro no aguantará hasta el alba.',
    choices: [
      { id: 'c05_boycott', label: 'Boycott the vote — take it to the public floor', labelEs: 'Boicotear la votación — llevarlo a la planta pública', nextNodeId: 'c05_floor_open', setsFlags: { c05_choice_boycott: true }, adjustsValues: { conviction_freedom: 1, bond_voss: -1 }, result: 'You will not sit in the parliament. The people outside will decide.', resultEs: 'No te sentarás en el parlamento. La gente de afuera decidirá.' },
      { id: 'c05_take_floor', label: 'Take the floor — examine the vault', labelEs: 'Tomar la planta — examinar el depósito', nextNodeId: 'c05_vault_door', setsFlags: { c05_choice_floor: true }, adjustsValues: { conviction_duty: 1, bond_voss: 1 }, result: 'You take the floor. The vault is where the receipts are.', resultEs: 'Tomas la planta. El depósito es donde están los recibos.' },
      { id: 'c05_hand_list', label: 'Hand the list to the people through Voss', labelEs: 'Entregar la lista a la gente a través de Voss', nextNodeId: 'c05_voss_office', setsFlags: { c05_choice_hand: true }, adjustsValues: { conviction_truth: 1, bond_voss: 1 }, result: 'You hand the list to Voss. His file is the people file, he says.', resultEs: 'Entregas la lista a Voss. Su expediente es el expediente de la gente, dice.' },
    ],
  },

  c05_floor_open: {
    id: 'c05_floor_open', kind: 'beat', locationId: 'c05_public_floor',
    title: 'The Public Floor', titleEs: 'La planta pública',
    text: 'The public floor is the plaza itself, turned into a parliament of its own. People read the receipts aloud and pin them to the wall. A teller stands on a crate with a scroll — the teller roll — and calls out the names of every oath the register holds. "If you can read it," a woman says, "you can prove what the register is doing to us."',
    textEs: 'La planta pública es la plaza misma, convertida en un parlamento propio. La gente lee los recibos en voz alta y los clava en la pared. Un contador se sube a una caja con un pergamino — el rollo del contador — y lee los nombres de cada juramento que el registro guarda. —Si puedes leerlo —dice una mujer—, puedes probar lo que el registro nos está haciendo.',
    choices: [
      { id: 'c05_floor_to_witness', label: 'Hear the witness', labelEs: 'Oír al testigo', nextNodeId: 'c05_floor_witness', result: 'The woman steps forward. Her name is on the register.', resultEs: 'La mujer da un paso adelante. Su nombre está en el registro.' },
      { id: 'c05_floor_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c05_first_seat', result: 'You step back inside. The parliament waits.', resultEs: 'Vuelves adentro. El parlamento espera.' },
    ],
  },

  c05_floor_witness: {
    id: 'c05_floor_witness', kind: 'beat', locationId: 'c05_public_floor',
    title: 'The Witness on the Floor', titleEs: 'El testigo en la planta',
    text: '"My name was put in the register when I was seven," the woman says. "My mother swore it as surety for a debt she could not pay. I am forty now, and the register still holds it. Every oath I have sworn since has flowed through that name, and every oath has cost me double because the register owns the first one." She points at the teller roll. "Read it. Prove it. Then bring it inside."',
    textEs: '—Mi nombre fue puesto en el registro cuando tenía siete años —dice la mujer—. Mi madre lo juró como garantía de una deuda que no podía pagar. Ahora tengo cuarenta, y el registro sigue guardándolo. Cada juramento que he hecho desde entonces ha pasado por ese nombre, y cada uno me ha costado el doble porque el registro posee el primero. —Señala el rollo del contador—. Léelo. Pruébalo. Y luego llévalo adentro.',
    choices: [
      { id: 'c05_witness_to_teller', label: 'Go to the teller roll', labelEs: 'Ir al rollo del contador', nextNodeId: 'c05_teller_roll_node', result: 'You walk to the teller on the crate.', resultEs: 'Caminas hacia el contador sobre la caja.' },
      { id: 'c05_witness_back', label: 'Return to the floor', labelEs: 'Volver a la planta', nextNodeId: 'c05_floor_open', result: 'You step back. The witness watches you go.', resultEs: 'Retrocedes. El testigo te ve irse.' },
    ],
  },

  c05_teller_roll_node: {
    id: 'c05_teller_roll_node', kind: 'beat', locationId: 'c05_public_floor',
    title: 'The Teller Roll', titleEs: 'El rollo del contador',
    text: 'The teller hands you the scroll. "Read it properly," he says, "and you have the evidence the parliament cannot ignore. Read it wrong and it is just paper." The roll is dense with names and dates and the same word repeated at the bottom of every entry: register.',
    textEs: 'El contador te entrega el pergamino. —Léelo como es debido —dice— y tendrás la prueba que el parlamento no puede ignorar. Léelo mal y es solo papel. El rollo está repleto de nombres y fechas y la misma palabra repetida al pie de cada entrada: registro.',
    choices: [
      { id: 'c05_teller_open', label: 'Read the teller roll', labelEs: 'Leer el rollo del contador', nextNodeId: 'c05_teller_puzzle', result: 'You unroll the scroll. The names and dates wait.', resultEs: 'Desenrollas el pergamino. Los nombres y las fechas esperan.' },
      { id: 'c05_teller_back', label: 'Return to the floor', labelEs: 'Volver a la planta', nextNodeId: 'c05_floor_open', result: 'You roll it back up. The teller watches you go.', resultEs: 'Lo vuelves a enrollar. El contador te ve irse.' },
    ],
  },

  c05_teller_puzzle: {
    id: 'c05_teller_puzzle', kind: 'puzzle', puzzleId: 'c05_teller_roll', locationId: 'c05_public_floor',
    title: 'The Teller Roll', titleEs: 'El rollo del contador',
    text: 'The scroll waits to be read.',
    textEs: 'El pergamino espera ser leído.',
    choices: [],
  },

  c05_teller_read: {
    id: 'c05_teller_read', kind: 'beat', locationId: 'c05_public_floor',
    title: 'The Roll Read', titleEs: 'El rollo leído',
    text: 'The roll opens its pattern: every oath on the continent flows through one register, and every name in that register pays double. The teller nods. "Now the parliament cannot ignore it. Bring it inside — the vote is at sundown."',
    textEs: 'El rollo revela su patrón: cada juramento del continente pasa por un solo registro, y cada nombre en ese registro paga el doble. El contador asiente. —Ahora el parlamento no puede ignorarlo. Llévalo adentro — la votación es al atardecer.',
    choices: [
      { id: 'c05_teller_to_assembly', label: 'Bring the roll to the assembly', labelEs: 'Llevar el rollo a la asamblea', nextNodeId: 'c05_assembly', result: 'You carry the roll inside. The parliament doors close behind you.', resultEs: 'Llevas el rollo adentro. Las puertas del parlamento se cierran a tu espalda.' },
    ],
  },

  c05_teller_skipped: {
    id: 'c05_teller_skipped', kind: 'beat', locationId: 'c05_public_floor',
    title: 'The Roll Left Unread', titleEs: 'El rollo sin leer',
    text: 'You leave the roll in the teller\'s hands. "Your loss," he says, rolling it back up. "The parliament votes on air if you bring them nothing." You go inside without the evidence.',
    textEs: 'Dejas el rollo en las manos del contador. —Tu pérdida —dice, enrollándolo de nuevo—. El parlamento vota en vacío si no les llevas nada. Entras sin la prueba.',
    choices: [
      { id: 'c05_teller_skip_to_assembly', label: 'Go to the assembly', labelEs: 'Ir a la asamblea', nextNodeId: 'c05_assembly', result: 'You enter the parliament without the roll.', resultEs: 'Entras al parlamento sin el rollo.' },
    ],
  },

  c05_vault_door: {
    id: 'c05_vault_door', kind: 'beat', locationId: 'c05_vault',
    title: 'The Vault Door', titleEs: 'La puerta del depósito',
    text: 'The vault is half-collapsed, but the chamber behind the door is intact. Three locks hold it: the receipt-lock, the register-lock, the seal-lock. Voss follows you. "Turn them in the order the receipts were filed," he says. "Receipt, register, seal — that is the order the register itself enforces."',
    textEs: 'El depósito está medio derrumbado, pero la cámara detrás de la puerta está intacta. Tres cerrojos la sostienen: el del recibo, el del registro, el del sello. Voss te sigue. —Gíralos en el orden en que se archivaron los recibos —dice—. Recibo, registro, sello: es el orden que el registro mismo impone.',
    choices: [
      { id: 'c05_vault_to_receipts', label: 'Examine the scattered receipts', labelEs: 'Examinar los recibos esparcidos', nextNodeId: 'c05_vault_receipts', result: 'You kneel among the receipts. Names and dates cover the floor.', resultEs: 'Te arrodillas entre los recibos. Nombres y fechas cubren el suelo.' },
      { id: 'c05_vault_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c05_first_seat', result: 'You step back. The vault door stays shut.', resultEs: 'Retrocedes. La puerta del depósito sigue cerrada.' },
    ],
  },

  c05_vault_receipts: {
    id: 'c05_vault_receipts', kind: 'beat', locationId: 'c05_vault',
    title: 'The Scattered Receipts', titleEs: 'Los recibos esparcidos',
    text: 'Among the scattered receipts, you find the ones that prove the continental register holds every oath. The cargo ledger you found on the salt road — if you still carry it — decodes the entries the register itself did not want read. Without it, the receipts are names without context. With it, they are evidence.',
    textEs: 'Entre los recibos esparcidos, encuentras los que prueban que el registro continental guarda cada juramento. El registro de carga que hallaste en el camino de sal — si todavía lo llevas — descifra las entradas que el registro mismo no quería que se leyeran. Sin él, los recibos son nombres sin contexto. Con él, son prueba.',
    choices: [
      { id: 'c05_receipts_with_ledger', label: 'Cross-reference the receipts with the cargo ledger', labelEs: 'Cruzar los recibos con el registro de carga', nextNodeId: 'c05_chamber_puzzle', requires: [{ flag: 'canon:c02_evidence_ledger' }], setsFlags: { c05_ledger_crossed: true }, result: 'The cargo ledger decodes the receipts. The register holds every name on the continent.', resultEs: 'El registro de carga descifra los recibos. El registro guarda cada nombre del continente.' },
      { id: 'c05_receipts_without', label: 'Read the receipts without the ledger', labelEs: 'Leer los recibos sin el registro de carga', nextNodeId: 'c05_chamber_puzzle', result: 'You read what you can. The names are there, but the pattern is half-hidden.', resultEs: 'Lees lo que puedes. Los nombres están, pero el patrón está medio oculto.' },
      { id: 'c05_receipts_back', label: 'Return to the vault door', labelEs: 'Volver a la puerta del depósito', nextNodeId: 'c05_vault_door', result: 'You step back to the door. The receipts stay on the floor.', resultEs: 'Retrocedes a la puerta. Los recibos siguen en el suelo.' },
    ],
  },

  c05_chamber_puzzle: {
    id: 'c05_chamber_puzzle', kind: 'puzzle', puzzleId: 'c05_chamber_locks', locationId: 'c05_vault',
    title: 'The Chamber Locks', titleEs: 'Los cerrojos de la cámara',
    text: 'Three locks wait. Receipt, register, seal.',
    textEs: 'Tres cerrojos esperan. Recibo, registro, sello.',
    choices: [],
  },

  c05_chamber_unlocked: {
    id: 'c05_chamber_unlocked', kind: 'beat', locationId: 'c05_vault',
    title: 'The Chamber Opens', titleEs: 'La cámara se abre',
    text: 'The third lock turns and the chamber opens. Inside is the continental register itself — a book of names, every name on the continent that has been sworn as surety for an oath. Voss stands behind you. "Now you have seen it," he says. "Now you can govern it, free it, or let it split. Bring what you have to the vote."',
    textEs: 'El tercer cerrojo gira y la cámara se abre. Dentro está el registro continental mismo — un libro de nombres, cada nombre del continente que ha sido jurado como garantía de un juramento. Voss está de pie detrás de ti. —Ahora lo has visto —dice—. Ahora puedes gobernarlo, liberarlo o dejar que se parta. Lleva lo que tienes a la votación.',
    choices: [
      { id: 'c05_chamber_to_assembly', label: 'Bring the evidence to the assembly', labelEs: 'Llevar la prueba a la asamblea', nextNodeId: 'c05_assembly', result: 'You carry what the chamber held into the light.', resultEs: 'Llevas a la luz lo que la cámara guardaba.' },
    ],
  },

  c05_chamber_locked: {
    id: 'c05_chamber_locked', kind: 'beat', locationId: 'c05_vault',
    title: 'The Chamber Stays Shut', titleEs: 'La cámara sigue cerrada',
    text: 'The locks spin shut and the chamber stays sealed. You leave the register behind the door. "No matter," Voss says. "The receipts on the floor are enough for a vote. The chamber is where the register lives, but the plaza is where it is seen."',
    textEs: 'Los cerrojos giran y se cierran, y la cámara sigue sellada. Dejas el registro detrás de la puerta. —No importa —dice Voss—. Los recibos del suelo bastan para una votación. La cámara es donde vive el registro, pero la plaza es donde se le ve.',
    choices: [
      { id: 'c05_chamber_skip_to_assembly', label: 'Go to the assembly', labelEs: 'Ir a la asamblea', nextNodeId: 'c05_assembly', result: 'You leave the vault without the register.', resultEs: 'Sales del depósito sin el registro.' },
    ],
  },

  c05_voss_office: {
    id: 'c05_voss_office', kind: 'beat', locationId: 'c05_voss_office',
    title: "Voss's Office", titleEs: 'El despacho de Voss',
    text: 'Voss\'s office is small, iron, and full of files. One file sits open on his desk — the one he calls the people file. "It is the record of every name the register holds without consent," he says. "I compiled it over twenty years. The parliament does not know it exists. If you bring it to the vote, the register is governed. If you bring it to the people, the register is free. Choose which one you want — but read it first."',
    textEs: 'El despacho de Voss es pequeño, de hierro, y está lleno de expedientes. Uno está abierto sobre la mesa — el que él llama el expediente de la gente. —Es la lista de cada nombre que el registro guarda sin consentimiento —dice—. Lo compilé durante veinte años. El parlamento no sabe que existe. Si lo llevas a la votación, el registro es gobernado. Si lo llevas a la gente, el registro es libre. Elige cuál quieres — pero léelo primero.',
    choices: [
      { id: 'c05_office_to_truth', label: 'Hear Voss out', labelEs: 'Oír a Voss', nextNodeId: 'c05_voss_truth', result: 'Voss closes the door. The office goes quiet.', resultEs: 'Voss cierra la puerta. El despacho se queda en silencio.' },
      { id: 'c05_office_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c05_first_seat', result: 'You step back. The file stays open.', resultEs: 'Retrocedes. El expediente sigue abierto.' },
    ],
  },

  c05_voss_truth: {
    id: 'c05_voss_truth', kind: 'beat', locationId: 'c05_voss_office',
    title: "Voss's Truth", titleEs: 'La verdad de Voss',
    text: '"I am not your ally or your enemy," Voss says. "I am the registrar. I keep the register because someone must, and I keep the file because someone must. If the parliament governs the register, I keep it under law. If the people free it, I keep nothing and the names go home. If it splits, I keep the shards. But the file — the file goes where you carry it. I am asking you to carry it to the vote. The people are asking you to carry it to the plaza. I will back either choice. I will back no stalemate."',
    textEs: '—No soy tu aliado ni tu enemigo —dice Voss—. Soy el registrador. Guardo el registro porque alguien debe hacerlo, y guardo el expediente porque alguien debe hacerlo. Si el parlamento gobierna el registro, lo guardo bajo la ley. Si la gente lo libera, no guardo nada y los nombres vuelven a casa. Si se parte, guardo los fragmentos. Pero el expediente — el expediente va a donde tú lo lleves. Te pido que lo lleves a la votación. La gente te pide que lo lleves a la plaza. Respaldaré cualquiera de las dos opciones. No respaldaré un empate.',
    choices: [
      { id: 'c05_truth_to_file', label: 'Take the file', labelEs: 'Tomar el expediente', nextNodeId: 'c05_voss_file', result: 'You reach for the file. Voss does not stop you.', resultEs: 'Alcanzas el expediente. Voss no te detiene.' },
    ],
  },

  c05_voss_file: {
    id: 'c05_voss_file', kind: 'beat', locationId: 'c05_voss_office',
    title: 'The File', titleEs: 'El expediente',
    text: 'The file is heavy with names — every name the register holds without a consent attached. It is the evidence the parliament cannot ignore and the people cannot forget. You can take it to the assembly for the vote, or you can carry it to the plaza and let the people decide. Voss watches you hold it.',
    textEs: 'El expediente está cargado de nombres — cada nombre que el registro guarda sin un consentimiento adjunto. Es la prueba que el parlamento no puede ignorar y la gente no puede olvidar. Puedes llevarlo a la asamblea para la votación, o puedes llevarlo a la plaza y dejar que la gente decida. Voss te ve sostenerlo.',
    choices: [
      { id: 'c05_file_take', label: 'Take the file to the assembly', labelEs: 'Llevar el expediente a la asamblea', nextNodeId: 'c05_assembly', setsFlags: { c05_voss_file_taken: true }, adjustsValues: { bond_voss: 1, conviction_truth: 1 }, result: 'You hold the file. Voss nods. The assembly waits.', resultEs: 'Sostienes el expediente. Voss asiente. La asamblea espera.' },
      { id: 'c05_file_back', label: 'Return to the office', labelEs: 'Volver al despacho', nextNodeId: 'c05_voss_office', result: 'You set the file down. It stays open on the desk.', resultEs: 'Dejas el expediente. Queda abierto sobre la mesa.' },
    ],
  },

  c05_assembly: {
    id: 'c05_assembly', kind: 'beat', locationId: 'c05_parliament',
    title: 'The Assembly', titleEs: 'La asamblea',
    text: 'All three roads lead back to the assembly: the teller roll from the public floor, the register from the vault, the file from Voss\'s office. The parliament is ready to vote, but a masked collector blocks the aisle — one of the register\'s own collectors, come to collect the evidence before the vote. You can face it, evade it, or — if the name you recovered in the wood still holds — ward it with the name itself.',
    textEs: 'Los tres caminos llevan de vuelta a la asamblea: el rollo del contador de la planta pública, el registro del depósito, el expediente del despacho de Voss. El parlamento está listo para votar, pero un cobrador enmascarado bloquea el pasillo — uno de los cobradores del registro mismo, venido a cobrar la prueba antes de la votación. Puedes enfrentarlo, esquivarlo, o — si el nombre que recuperaste en el bosque sigue valiendo — protegerlo con el nombre mismo.',
    choices: [
      { id: 'c05_assembly_to_collector', label: 'Approach the masked collector', labelEs: 'Acercarse al cobrador enmascarado', nextNodeId: 'c05_collector_approach', result: 'You walk toward the aisle. The collector turns.', resultEs: 'Caminas hacia el pasillo. El cobrador se vuelve.' },
      { id: 'c05_assembly_to_vote', label: 'Go straight to the vote', labelEs: 'Ir directo a la votación', nextNodeId: 'c05_vote', result: 'You push past the collector. It does not stop you — yet.', resultEs: 'Pasas junto al cobrador. No te detiene — todavía.' },
    ],
  },

  c05_collector_approach: {
    id: 'c05_collector_approach', kind: 'beat', locationId: 'c05_plaza',
    title: 'The Masked Collector', titleEs: 'El cobrador enmascarado',
    text: 'The collector wears a mask of blank lead and carries a chain of receipts. "The register sent me," it says, in a voice that is not a voice. "The evidence is the register\'s property. Surrender it, or I will collect it from your hands." You can fight it, flee, or ward it with the name you brought back from the wood.',
    textEs: 'El cobrador lleva una máscara de plomo liso y una cadena de recibos. —El registro me envió —dice, en una voz que no es una voz—. La prueba es propiedad del registro. Entrégala, o la cobraré de tus manos. Puedes luchar, huir, o protegerlo con el nombre que trajiste del bosque.',
    choices: [
      { id: 'c05_face_collector', label: 'Face the collector', labelEs: 'Enfrentar al cobrador', nextNodeId: 'c05_collector_aftermath', setsFlags: { c05_collector_faced: true }, result: 'You raise your hands. The collector raises its chain.', resultEs: 'Levantas las manos. El cobrador levanta su cadena.' },
      { id: 'c05_ward_with_name', label: 'Ward the collector with the name from the wood', labelEs: 'Proteger del cobrador con el nombre del bosque', nextNodeId: 'c05_vote', requires: [{ flag: 'canon:c04_name_returned' }], result: 'The name you returned still holds. The collector flinches from it and lets you pass.', resultEs: 'El nombre que devolviste aún sostiene. El cobrador retrocede ante él y te deja pasar.' },
      { id: 'c05_ward_with_free_name', label: 'Ward the collector with the freed name', labelEs: 'Proteger del cobrador con el nombre liberado', nextNodeId: 'c05_vote', requires: [{ flag: 'canon:c04_name_free' }], result: 'The name you freed still burns. The collector recoils and the chain goes slack.', resultEs: 'El nombre que liberaste aún arde. El cobrador retrocede y la cadena se afloja.' },
      { id: 'c05_evade_collector', label: 'Evade the collector', labelEs: 'Esquivar al cobrador', nextNodeId: 'c05_vote', result: 'You slip past the collector and into the chamber. The chain misses.', resultEs: 'Te cuelas junto al cobrador y hacia la sala. La cadena falla.' },
    ],
  },

  c05_collector_aftermath: {
    id: 'c05_collector_aftermath', kind: 'beat', locationId: 'c05_plaza', externalEntry: true,
    title: 'The Collector Down', titleEs: 'El cobrador caído',
    text: 'The collector is down and its chain clatters on the floor. The mask splits and there is nothing behind it — the register sent a shape, not a person. Voss stands at the chamber door. "The register collects its own," he says. "It will send another. Go — vote before it does."',
    textEs: 'El cobrador cae y su cadena retumba en el suelo. La máscara se parte y no hay nada detrás — el registro envió una forma, no una persona. Voss está de pie en la puerta de la sala. —El registro cobra lo suyo —dice—. Enviará otro. Ve — vota antes de que lo haga.',
    choices: [
      { id: 'c05_collector_to_vote', label: 'Go to the vote', labelEs: 'Ir a la votación', nextNodeId: 'c05_vote', result: 'You step over the chain and into the chamber.', resultEs: 'Pisas la cadena y entras en la sala.' },
    ],
  },

  c05_vote: {
    id: 'c05_vote', kind: 'beat', locationId: 'c05_parliament',
    title: 'The Vote', titleEs: 'La votación',
    text: 'The parliament is ready. The evidence — whatever you brought — is on the floor. Voss stands at the registrar desk. "Four motions," he says. "Govern the register under the parliament. Strangle it under the parliament and the law. Free it and let the names go home. Or stalemate — let it split at dawn." The chamber waits for your word.',
    textEs: 'El parlamento está listo. La prueba — lo que sea que hayas traído — está en la sala. Voss está de pie en la mesa del registrador. —Cuatro mociones —dice—. Gobernar el registro bajo el parlamento. Estrangularlo bajo el parlamento y la ley. Liberarlo y dejar que los nombres vuelvan a casa. O empate — dejar que se parta al alba. La sala espera tu palabra.',
    choices: [
      { id: 'c05_vote_registry', label: 'Vote to govern the register under law', labelEs: 'Votar para gobernar el registro bajo la ley', nextNodeId: 'c05_ending_registry', setsFlags: { 'canon:c05_registry_governed': true, 'canon:c05_voss_file': true, 'canon:c05_evidence_register': true }, adjustsValues: { faction_iron_parliament: 1, bond_voss: 1, conviction_duty: 1 }, result: 'The parliament governs the register. Voss keeps it under law.', resultEs: 'El parlamento gobierna el registro. Voss lo guarda bajo la ley.' },
      { id: 'c05_vote_strangle', label: 'Vote to strangle the register under the law', labelEs: 'Votar para estrangular el registro bajo la ley', nextNodeId: 'c05_ending_strangled', setsFlags: { 'canon:c05_registry_governed': true, 'canon:c05_voss_file': true, 'canon:c05_evidence_register': true }, adjustsValues: { faction_iron_parliament: 2, conviction_duty: 1 }, result: 'The parliament strangles the register. The law holds it tight.', resultEs: 'El parlamento estrangula el registro. La ley lo sostiene con fuerza.' },
      { id: 'c05_vote_free', label: 'Vote to free the register and the names', labelEs: 'Votar para liberar el registro y los nombres', nextNodeId: 'c05_ending_free', setsFlags: { 'canon:c05_registry_free': true, 'canon:c05_voss_file': true, 'canon:c05_evidence_register': true }, adjustsValues: { conviction_freedom: 1, faction_iron_parliament: -1 }, result: 'The parliament frees the register. The names go home.', resultEs: 'El parlamento libera el registro. Los nombres vuelven a casa.' },
      { id: 'c05_vote_stalemate', label: 'Let the vote stalemate — let the register split', labelEs: 'Dejar que la votación empate — dejar que el registro se parta', nextNodeId: 'c05_ending_stalemate', setsFlags: { 'canon:c05_voss_file': true, 'canon:c05_evidence_register': true }, result: 'The vote splits. The register will split at dawn.', resultEs: 'La votación empata. El registro se partirá al alba.' },
    ],
  },

  c05_ending_registry: {
    id: 'c05_ending_registry', kind: 'ending', terminal: true, choices: [],
    title: 'Governed', titleEs: 'Gobernado',
    text: 'The parliament votes to govern the register under law. Voss takes the registrar seat and the file goes into the record. Every name the register holds is now held under parliamentary oversight — not free, but accountable. The register stops cracking. The law holds it together. Voss catches your eye as the chamber empties. "I will keep it under law," he says. "Come and find me when the law is not enough."',
    textEs: 'El parlamento vota gobernar el registro bajo la ley. Voss toma el asiento del registrador y el expediente entra en el acta. Cada nombre que el registro guarda está ahora bajo supervisión parlamentaria — no libre, pero responsable. El registro deja de rajarse. La ley lo sostiene. Voss cruza tu mirada mientras la sala se vacía. —Lo guardaré bajo la ley —dice—. Búscame cuando la ley no baste.',
    outcome: 'success', survivors: ['c05_registrar_voss'], casualties: [],
  },

  c05_ending_strangled: {
    id: 'c05_ending_strangled', kind: 'ending', terminal: true, choices: [],
    title: 'Strangled', titleEs: 'Estrangulado',
    text: 'The parliament votes to strangle the register under the law — every name locked, every oath chained, every transaction recorded and forbidden without the parliament seal. The register stops cracking because nothing flows through it anymore. The law holds it so tight that nothing moves. Voss sits at the registrar desk and does not look up. "You asked for law," he says. "You got law."',
    textEs: 'El parlamento vota estrangular el registro bajo la ley — cada nombre bloqueado, cada juramento encadenado, cada transacción registrada y prohibida sin el sello del parlamento. El registro deja de rajarse porque ya nada pasa por él. La ley lo sostiene tan fuerte que nada se mueve. Voss se sienta en la mesa del registrador y no levanta la mirada. —Pediste ley —dice—. Tienes ley.',
    outcome: 'ambiguous', survivors: ['c05_registrar_voss'], casualties: [],
  },

  c05_ending_free: {
    id: 'c05_ending_free', kind: 'ending', terminal: true, choices: [],
    title: 'Freed', titleEs: 'Liberado',
    text: 'The parliament votes to free the register. The names go home — every name held without consent lifts from the book and walks out the door. The register is empty and the oaths flow where they will. Voss stands in the empty chamber and watches the last name go. "I kept it for twenty years," he says. "It is lighter empty. Come and find me if the oaths need a keeper again."',
    textEs: 'El parlamento vota liberar el registro. Los nombres vuelven a casa — cada nombre guardado sin consentimiento se eleva del libro y sale por la puerta. El registro queda vacío y los juramentos van a donde quieran. Voss está de pie en la sala vacía y ve irse al último nombre. —Lo guardé durante veinte años —dice—. Vacío, pesa menos. Búscame si los juramentos necesitan un guardián otra vez.',
    outcome: 'success', survivors: ['c05_registrar_voss'], casualties: [],
  },

  c05_ending_stalemate: {
    id: 'c05_ending_stalemate', kind: 'ending', terminal: true, choices: [],
    title: 'Stalemate', titleEs: 'Empate',
    text: 'The vote splits and the register splits with it. Half the names go home, half stay locked, and the parliament cannot govern what it cannot hold. The register cracks at dawn as Voss said it would, and the oaths flow through the cracks — ungoverned, unowned, and unaccountable. Voss leaves the chamber. "I will find you," he says at the door. "The register will need a registrar even when it is broken."',
    textEs: 'La votación empata y el registro se parte con ella. La mitad de los nombres vuelven a casa, la mitad siguen bloqueados, y el parlamento no puede gobernar lo que no puede sostener. El registro se raja al alba como Voss dijo que haría, y los juramentos pasan por las grietas — sin gobernar, sin dueño, y sin rendir cuentas. Voss sale de la sala. —Te encontraré —dice en la puerta—. El registro necesitará un registrador incluso cuando esté roto.',
    outcome: 'ambiguous', survivors: ['c05_registrar_voss'], casualties: [],
  },
};

// ---- World ---------------------------------------------------

const LOCATIONS: Record<string, WorldLocation> = {
  c05_plaza: {
    id: 'c05_plaza', name: 'The Plaza', nameEs: 'La plaza',
    description: 'A wide plaza where the vault exploded in the night. Receipts cover the cobblestones and the people read them aloud.',
    descriptionEs: 'Una plaza amplia donde el depósito reventó en la noche. Los recibos cubren los adoquines y la gente los lee en voz alta.',
    connections: ['c05_parliament', 'c05_public_floor'],
    objects: [{ id: 'c05_exploded_vault', name: 'The Exploded Vault', nameEs: 'El depósito reventado', description: 'The vault door hangs open and the receipts scatter from it.', descriptionEs: 'La puerta del depósito cuelga abierta y los recibos se esparcen de ella.', interactable: true, broken: true, hidden: false }],
    npcs: [], enemies: ['c05_masked_collector'], dangerLevel: 2, discovered: true, secrets: [], ambiance: 'town',
  },
  c05_parliament: {
    id: 'c05_parliament', name: 'The Iron Parliament', nameEs: 'El Parlamento de Hierro',
    description: 'An iron chamber where the parliament sits in emergency session. Every seat is full and the registrar desk stands at the front.',
    descriptionEs: 'Una sala de hierro donde el parlamento se sienta en sesión de emergencia. Cada asiento está ocupado y la mesa del registrador está al frente.',
    connections: ['c05_plaza', 'c05_vault', 'c05_voss_office'],
    objects: [{ id: 'c05_registrar_desk', name: 'The Registrar Desk', nameEs: 'La mesa del registrador', description: 'A desk of iron where Voss sorts the receipts and keeps the file.', descriptionEs: 'Una mesa de hierro donde Voss ordena los recibos y guarda el expediente.', interactable: true, broken: false, hidden: false }],
    npcs: ['c05_registrar_voss'], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'throne',
  },
  c05_public_floor: {
    id: 'c05_public_floor', name: 'The Public Floor', nameEs: 'La planta pública',
    description: 'The plaza turned into a parliament of its own. People read the receipts aloud and pin them to the wall. A teller stands on a crate with a scroll.',
    descriptionEs: 'La plaza convertida en un parlamento propio. La gente lee los recibos en voz alta y los clava en la pared. Un contador se sube a una caja con un pergamino.',
    connections: ['c05_plaza'],
    objects: [{ id: 'c05_teller_crate', name: 'The Teller Crate', nameEs: 'La caja del contador', description: 'A crate where the teller stands and reads the roll.', descriptionEs: 'Una caja donde el contador se sube y lee el rollo.', interactable: true, broken: false, hidden: false }],
    npcs: ['c05_floor_witness'], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'town',
  },
  c05_vault: {
    id: 'c05_vault', name: 'The Vault', nameEs: 'El depósito',
    description: 'A half-collapsed vault with an intact chamber behind three locks. Receipts cover the floor.',
    descriptionEs: 'Un depósito medio derrumbado con una cámara intacta detrás de tres cerrojos. Los recibos cubren el suelo.',
    connections: ['c05_parliament'],
    objects: [{ id: 'c05_chamber_door', name: 'The Chamber Door', nameEs: 'La puerta de la cámara', description: 'A door with three locks: receipt, register, seal.', descriptionEs: 'Una puerta con tres cerrojos: recibo, registro, sello.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 2, discovered: true, secrets: [], ambiance: 'dungeon',
  },
  c05_voss_office: {
    id: 'c05_voss_office', name: "Voss's Office", nameEs: 'El despacho de Voss',
    description: 'A small iron office full of files. One file sits open on the desk — the people file.',
    descriptionEs: 'Un despacho pequeño de hierro lleno de expedientes. Uno está abierto sobre la mesa — el expediente de la gente.',
    connections: ['c05_parliament'],
    objects: [{ id: 'c05_voss_desk', name: "Voss's Desk", nameEs: 'La mesa de Voss', description: 'A desk where the people file sits open.', descriptionEs: 'Una mesa donde el expediente de la gente está abierto.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'library',
  },
};

const NPCS: Record<string, NPC> = {
  c05_registrar_voss: {
    id: 'c05_registrar_voss', name: 'Registrar Voss', nameEs: 'Registrador Voss', portrait: 'noble', faction: 'iron_parliament', location: 'c05_parliament', disposition: 10,
    knowledge: ['the_register', 'the_file', 'the_vault', 'the_vote'],
    memory: [], inventory: [],
    dialogue: [
      { id: 'greeting', text: 'Voss does not stand. "The register is cracking. The parliament votes at sundown. I have a file that says govern, and the people have a roll that says free. What do you carry?"', textEs: 'Voss no se levanta. «El registro se está rajando. El parlamento vota al atardecer. Yo tengo un expediente que dice gobernar, y la gente tiene un rollo que dice liberar. ¿Qué llevas?»', responses: [{ text: 'I carry evidence.', textEs: 'Llevo pruebas.', nextNodeId: 'end' }, { text: 'I carry nothing.', textEs: 'No llevo nada.', nextNodeId: 'end' }] },
    ],
    alive: true, occupation: 'Registrar', occupationEs: 'Registrador', secrets: ['the_people_file'], secretsEs: ['el expediente de la gente'], personality: 'precise', personalityEs: 'preciso',
  },
  c05_floor_witness: {
    id: 'c05_floor_witness', name: 'The Witness', nameEs: 'El testigo', portrait: 'villager', faction: 'iron_parliament', location: 'c05_public_floor', disposition: 20,
    knowledge: ['her_name_in_the_register', 'the_teller_roll'],
    memory: [], inventory: [],
    dialogue: [
      { id: 'greeting', text: 'The woman on the floor holds out her wrist. A name is scarred into it — the name the register holds. "Read the roll," she says. "Prove what it did to us."', textEs: 'La mujer de la planta extiende la muñeca. Un nombre está tallado en ella — el nombre que el registro guarda. —Lee el rollo —dice—. Prueba lo que nos hizo.', responses: [{ text: 'I will.', textEs: 'Lo haré.', nextNodeId: 'end' }] },
    ],
    alive: true, occupation: 'Witness', occupationEs: 'Testigo', secrets: [], secretsEs: [], personality: 'bitter', personalityEs: 'amargada',
  },
};

const MONSTERS: Record<string, Omit<Enemy, 'id'>> = {
  c05_masked_collector: {
    templateId: 'c05_masked_collector', name: 'The Masked Collector', nameEs: 'El cobrador enmascarado', portrait: 'soldier', hp: 18, maxHp: 18, ac: 14, attack: 7, damage: '1d8', damageType: 'piercing', abilities: ['Chain of Receipts', 'Lead Mask'], abilitiesEs: ['Cadena de recibos', 'Máscara de plomo'], xpValue: 120, loot: [], intelligence: 8, morale: 70, conditions: [],
  },
};

const QUESTS: Record<string, Quest> = {
  c05_the_parliament: {
    id: 'c05_the_parliament', name: 'The Iron Parliament', nameEs: 'El parlamento de hierro', description: 'Bring evidence to the vote and decide the fate of the continental register.', descriptionEs: 'Lleva la prueba a la votación y decide el destino del registro continental.', state: 'active', isMain: true, faction: 'iron_parliament',
    objectives: [
      { id: 'c05_gather_evidence', description: 'Gather evidence from the floor, vault, or office', descriptionEs: 'Reunir prueba de la planta, el depósito o el despacho', completed: false, current: 0, required: 1 },
      { id: 'c05_cast_vote', description: 'Cast the vote', descriptionEs: 'Emitir el voto', completed: false, current: 0, required: 1 },
    ],
    rewards: [{ type: 'xp', value: 250 }],
  },
};

export const CHAPTER_FIVE: Chapter = {
  id: 'chapter-05', index: 5,
  title: 'The Iron Parliament', titleEs: 'El parlamento de hierro',
  premise: 'An exploded vault has scattered its receipts across the plaza, proving all oath-magic flows through a single continental register. The Iron Parliament must decide to ban it, own it, or place the law beside it.',
  premiseEs: 'Un depósito reventado esparció sus recibos por la plaza; se ha demostrado que la magia del juramento pasa por un registro continental, y el Parlamento de Hierro debe decidir: prohibirlo, poseerlo o hacer la ley a su lado.',
  intro: [
    { type: 'system', text: 'CHAPTER V — THE IRON PARLIAMENT', textEs: 'CAPÍTULO V — EL PARLAMENTO DE HIERRO', mood: 'tense' },
    { type: 'narration', text: '{name} arrives at a plaza full of receipts and a parliament in emergency session. The continental register is cracking, and the vote is at sundown: govern it, free it, or let it split. Registrar Voss waits at the desk with a file the parliament does not know exists.', textEs: '{name} llega a una plaza llena de recibos y un parlamento en sesión de emergencia. El registro continental se está rajando, y la votación es al atardecer: gobernarlo, liberarlo o dejar que se parta. El Registrador Voss espera en la mesa con un expediente que el parlamento no sabe que existe.', mood: 'tense' },
    { type: 'system', text: 'CURRENT OBJECTIVE — Gather evidence and cast the vote.', textEs: 'OBJETIVO ACTUAL — Reúne prueba y emite el voto.', mood: 'neutral' },
  ],
  startNodeId: 'c05_arrival', startLocationId: 'c05_plaza',
  nodes: NODES,
  puzzles: { c05_chamber_locks: CHAMBER_LOCKS, c05_teller_roll: TELLER_ROLL },
  locations: LOCATIONS, npcs: NPCS, monsters: MONSTERS, quests: QUESTS,
  mainQuestId: 'c05_the_parliament',
  hooks: { bossLocationId: 'c05_plaza', aftermathNodeId: 'c05_collector_aftermath' },
  storyFacts: [
    { flag: 'c05_choice_boycott', en: 'The party boycotted the vote', es: 'El grupo boicoteó la votación' },
    { flag: 'c05_choice_floor', en: 'The party took the floor', es: 'El grupo tomó la planta' },
    { flag: 'c05_choice_hand', en: 'The party handed the list through Voss', es: 'El grupo entregó la lista a través de Voss' },
    { flag: 'c05_chamber_open', en: 'The chamber locks were turned in the right order', es: 'Los cerrojos de la cámara se giraron en el orden correcto' },
    { flag: 'c05_teller_read', en: 'The teller roll was read', es: 'El rollo del contador fue leído' },
    { flag: 'c05_ledger_crossed', en: 'The receipts were cross-referenced with the cargo ledger', es: 'Los recibos se cruzaron con el registro de carga' },
    { flag: 'c05_voss_file_taken', en: 'The party took the file', es: 'El grupo tomó el expediente' },
    { flag: 'c05_collector_faced', en: 'The masked collector was faced', es: 'El cobrador enmascarado fue enfrentado' },
  ],
  suggestions: {
    c05_plaza: [
      { label: 'Enter the parliament', labelEs: 'Entrar al parlamento', action: 'go to the parliament' },
      { label: 'Go to the public floor', labelEs: 'Ir a la planta pública', action: 'go to the public floor' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c05_parliament: [
      { label: 'Go to the plaza', labelEs: 'Ir a la plaza', action: 'go to the plaza' },
      { label: 'Go to the vault', labelEs: 'Ir al depósito', action: 'go to the vault' },
      { label: "Go to Voss's office", labelEs: 'Ir al despacho de Voss', action: 'go to voss office' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c05_public_floor: [{ label: 'Return to the plaza', labelEs: 'Volver a la plaza', action: 'go to the plaza' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c05_vault: [{ label: 'Return to the parliament', labelEs: 'Volver al parlamento', action: 'go to the parliament' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c05_voss_office: [{ label: 'Return to the parliament', labelEs: 'Volver al parlamento', action: 'go to the parliament' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
  },
  externalEntrySeeds: {
    c05_collector_aftermath: [{ c05_choice_boycott: true }, { c05_choice_floor: true }, { c05_choice_hand: true }],
    c05_arrival: [{ 'canon:c02_map_shared': true, 'canon:c02_evidence_ledger': true, 'canon:c04_name_returned': true, 'canon:c04_name_free': true }],
  },
  summaryFlags: [
    'canon:c05_registry_governed', 'canon:c05_registry_free', 'canon:c05_voss_file', 'canon:c05_evidence_register',
  ],
};
