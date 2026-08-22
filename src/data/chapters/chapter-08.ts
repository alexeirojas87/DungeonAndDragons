// ============================================================
// CHAPTER VIII — The Court of Broken Oaths
// La corte de los juramentos incumplidos
// Act III opener. The old compact behind every door and song in
// Syrva has reached its last day; in the Veiled Court the party
// must prosecute it, defend it, or dissolve it with the evidence
// the whole campaign has gathered. Four verdicts close the court.
// ============================================================

import type { Chapter, StoryNode } from '../../engine/chapter';
import type { Puzzle } from '../../engine/puzzles';
import type { WorldLocation, NPC, Enemy, Quest } from '../../engine/types';

// ---- Puzzles -------------------------------------------------

const VOW_RIDDLE: Puzzle = {
  id: 'c08_vow_riddle',
  kind: 'riddle',
  title: 'The Riddle of the Vow',
  titleEs: 'El enigma del juramento',
  prompt: 'A vow is read into the record. It binds without a chain, it breaks without a touch, and the court can only hear it once it has been broken. What is it?',
  promptEs: 'Un juramento se lee en el acta. Ata sin cadena, se rompe sin contacto, y la corte solo puede oírlo una vez que ha sido roto. ¿Qué es?',
  hints: [
    { en: 'It is not a thing you can hold. It lives only while someone keeps speaking it.', es: 'No es algo que puedas sostener. Solo vive mientras alguien sigue pronunciándolo.' },
    { en: 'Every door in this campaign is one. The court hears it only when the silence ends it.', es: 'Cada puerta de esta campaña es uno. La corte lo oye solo cuando el silencio lo termina.' },
    { en: 'It names a witness, a vessel and a price — and it is the word itself.', es: 'Nombra un testigo, una vasija y un precio — y es la propia palabra.' },
  ],
  answers: ['an oath', 'oath', 'a vow', 'vow', 'the oath', 'the vow'],
  answersEs: ['un juramento', 'juramento', 'un voto', 'voto', 'el juramento', 'el voto'],
  unlocks: { flags: { c08_evidence_record: true, c08_evidence_any: true } },
  solvedNodeId: 'c08_vow_decoded',
  skipNodeId: 'c08_vow_abandoned',
};

const SEAL_MECHANISM: Puzzle = {
  id: 'c08_seal_mechanism',
  kind: 'mechanism',
  title: 'The Old Seal',
  titleEs: 'El sello antiguo',
  prompt: 'Three bolts hold the old pact-seal, and the court turns them in one order only. Turn them wrong and the seal bites; turn them right and the court can see what the pact was made from.',
  promptEs: 'Tres cerrojos sostienen el sello del pacto, y la corte los gira en un único orden. Si los giras mal, el sello muerde; si los giras bien, la corte puede ver de qué se hizo el pacto.',
  hints: [
    { en: 'The seal shows the witness first, the vessel second, and the price last — that is the order every oath in this campaign is spoken.', es: 'El sello muestra primero el testigo, luego la vasija y al final el precio: es el orden en que se pronuncia cada juramento de esta campaña.' },
    { en: 'The witness-bolt is engraved with an open eye; the vessel-bolt carries a bowl; the price-bolt carries a hand letting something fall.', es: 'El cerrojo del testigo lleva un ojo abierto grabado; el de la vasija, un cuenco; el del precio, una mano que deja caer algo.' },
    { en: 'Eye, then bowl, then falling hand. The seal goes quiet on the third.', es: 'Ojo, luego cuenco, luego mano que cae. El sello se aquieta en el tercero.' },
  ],
  steps: ['c08_bolt_witness', 'c08_bolt_vessel', 'c08_bolt_price'],
  ordered: true,
  stepLabels: [
    { id: 'c08_bolt_witness', label: 'Turn the witness-bolt', labelEs: 'Girar el cerrojo del testigo' },
    { id: 'c08_bolt_vessel', label: 'Turn the vessel-bolt', labelEs: 'Girar el cerrojo de la vasija' },
    { id: 'c08_bolt_price', label: 'Turn the price-bolt', labelEs: 'Girar el cerrojo del precio' },
  ],
  onWrongStep: { en: 'The seal bites back and the bolts spin home. The order is lost; you may begin again.', es: 'El sello muerde y los cerrojos vuelven a su sitio. El orden se pierde; puedes empezar de nuevo.' },
  unlocks: { flags: { c08_evidence_seal: true, c08_evidence_any: true, c08_seal_understood: true } },
  solvedNodeId: 'c08_seal_aligned',
  skipNodeId: 'c08_seal_left',
};

// ---- Nodes ---------------------------------------------------

const NODES: Record<string, StoryNode> = {
  c08_arrival: {
    id: 'c08_arrival', kind: 'beat', locationId: 'c08_court_chamber', externalEntry: true,
    title: 'The Last Day of the Pact', titleEs: 'El último día del pacto',
    text: 'The Veiled Court convenes at the turn of the tide. The old compact — the one that gave every door its name and every song its keeper — expires at dawn, and the chamber is full of the people it kept alive. Registrar Voss waits by the prosecution bench; a redactor of the Veiled Court sits veiled above; the Assembly clerk counts heads. You are the evidence-bearer. The court will hear one charge today, and one only.',
    textEs: 'La Corte del Velo se reúne en el cambio de marea. El pacto antiguo — el que dio a cada puerta su nombre y a cada canción su guardián — expira al alba, y la sala está llena de la gente que mantuvo con vida. El Registrador Voss espera junto al banquillo de la acusación; una redactora de la Corte del Velo se sienta velada en lo alto; el secretario de la Asamblea cuenta cabezas. Tú portas las pruebas. La corte escuchará hoy una acusación, y solo una.',
    choices: [
      { id: 'c08_pray_prosecute', label: 'Prosecute the pact — it broke the door it swore to keep', labelEs: 'Acusar al pacto — rompió la puerta que juró guardar', nextNodeId: 'c08_prosecution_open', setsFlags: { c08_charge_prosecute: true }, adjustsValues: { conviction_truth: 1 }, result: 'You stand for the prosecution. Voss inclines his head; your evidence will be aimed at the door itself.', resultEs: 'Te levantas para la acusación. Voss asiente; tus pruebas apuntarán a la puerta misma.' },
      { id: 'c08_pray_defend', label: 'Defend the pact — it held a world together, and must be mended', labelEs: 'Defender el pacto — sostuvo un mundo, y debe repararse', nextNodeId: 'c08_defense_open', setsFlags: { c08_charge_defend: true }, adjustsValues: { conviction_duty: 1 }, result: 'You stand for the defense. The pact kept more than it cost; you will argue it can be kept again.', resultEs: 'Te levantas para la defensa. El pacto guardó más de lo que costó; argumentarás que puede volver a guardarse.' },
      { id: 'c08_pray_dissolve', label: 'Press for dissolution — let every door answer for itself', labelEs: 'Pedir la disolución — que cada puerta responda por sí misma', nextNodeId: 'c08_dissolution_open', setsFlags: { c08_charge_dissolve: true }, adjustsValues: { conviction_freedom: 1 }, result: 'You stand for dissolution. The pact is a vessel with no keeper worth naming; you will ask the court to break it on the seal.', resultEs: 'Te levantas para la disolución. El pacto es una vasija sin guardián que merezca ser nombrado; pedirás a la corte que lo rompa sobre el sello.' },
    ],
  },

  c08_prosecution_open: {
    id: 'c08_prosecution_open', kind: 'beat',
    title: 'The Prosecution Opens', titleEs: 'La acusación se abre',
    text: 'Voss lays the file open and lets you read it with him. The pact did not merely fail the Drowned Door; it turned the door’s name into the price other doors paid. “Prosecute the principle,” Voss says, “and the door stops being a debt.” You need the record of the vow, the seal that bound it, and a witness who paid.',
    textEs: 'Voss abre el expediente y te deja leer con él. El pacto no solo falló a la Puerta Ahogada; convirtió su nombre en el precio que otras puertas pagaron. —Acusa el principio —dice Voss— y la puerta deja de ser una deuda. Necesitas el registro del voto, el sello que lo ató y un testigo que haya pagado.',
    choices: [{ id: 'c08_prosecution_to_assembly', label: 'Enter the assembled chamber', labelEs: 'Entrar en la cámara reunida', nextNodeId: 'c08_assembly', result: 'You walk into the chamber as the prosecution. The benches turn to watch the evidence-bearer.', resultEs: 'Entras en la sala como acusación. Los bancos se vuelven para mirar al portador de pruebas.' }],
  },

  c08_defense_open: {
    id: 'c08_defense_open', kind: 'beat',
    title: 'The Defense Opens', titleEs: 'La defensa se abre',
    text: 'The redactor speaks for the first time: the pact kept the names of the dead from thinning into wind. To defend it is to argue that the vessel still holds, even when the keeper is gone. You will need the vow in the record, the seal understood, and the dead grant heard — the one oath the court still answers to.',
    textEs: 'La redactora habla por primera vez: el pacto impidió que los nombres de los muertos se adelgazaran hasta volverse viento. Defenderlo es argumentar que la vasija aún sostiene, aun sin guardián. Necesitarás el voto en el acta, el sello comprendido y la concesión de los muertos oída — el único juramento al que la corte aún responde.',
    choices: [{ id: 'c08_defense_to_assembly', label: 'Enter the assembled chamber', labelEs: 'Entrar en la cámara reunida', nextNodeId: 'c08_assembly', result: 'You walk into the chamber as the defense. The redactor lifts her veil a fraction in acknowledgement.', resultEs: 'Entras en la sala como defensa. La redactora se levanta el velo un instante en reconocimiento.' }],
  },

  c08_dissolution_open: {
    id: 'c08_dissolution_open', kind: 'beat',
    title: 'Dissolution Opens', titleEs: 'La disolución se abre',
    text: 'The clerk reads the dissolution clause aloud: a pact unmade on its own seal releases every door it bound. To press it you must show the seal and break it in the court’s sight. The chamber goes very quiet; the doors you have carried through this campaign lean toward you, listening.',
    textEs: 'El secretario lee la cláusula de disolución en voz alta: un pacto deshecho sobre su propio sello libera a cada puerta que ató. Para impulsarla debes mostrar el sello y romperlo ante la corte. La sala se queda muy quieta; las puertas que has cruzado en esta campaña se inclinan hacia ti, escuchando.',
    choices: [{ id: 'c08_dissolution_to_assembly', label: 'Enter the assembled chamber', labelEs: 'Entrar en la cámara reunida', nextNodeId: 'c08_assembly', result: 'You walk into the chamber pressing dissolution. The clerk sets the clause down and waits.', resultEs: 'Entras en la sala impulsando la disolución. El secretario deja la cláusula y espera.' }],
  },

  c08_assembly: {
    id: 'c08_assembly', kind: 'beat', locationId: 'c08_court_chamber',
    title: 'The Assembled Chamber', titleEs: 'La cámara reunida',
    text: 'Three doors open off the chamber: the witness stand, the record vault, and the old seal-room. Beneath the floor, the dead-grant chamber waits for the one oath spoken in iron.\n\nThe redactor lifts her veil long enough to name the law: every oath is a child of three named things — a witness who can be asked, a vessel that can be filled, a price that can be paid — and the pact made the door the witness, the seal the vessel, a coastline the price. The court will not vote until you bring back something to read into the record.',
    textEs: 'Tres puertas se abren desde la sala: el estrado de testigos, el archivo de actas y la sala del sello antiguo. Bajo el suelo, la cámara de la concesión de los muertos espera al único juramento que se pronuncia en hierro.\n\nLa redactora se levanta el velo lo justo para nombrar la ley: cada juramento es hijo de tres cosas nombradas — un testigo al que se pueda preguntar, una vasija que se pueda llenar, un precio que se pueda pagar — y el pacto hizo de la puerta el testigo, del sello la vasija, de un litoral el precio. La corte no votará hasta que traigas algo que leer en el acta.',
    choices: [
      { id: 'c08_to_witness', label: 'Go to the witness stand', labelEs: 'Ir al estrado de testigos', nextNodeId: 'c08_witness_stand', setsFlags: { c08_evidence_any: true }, result: 'You cross to the witness stand. The basin of clear water waits for a voice.', resultEs: 'Cruzas al estrado de testigos. La palangana de agua clara espera una voz.' },
      { id: 'c08_to_vault', label: 'Enter the record vault', labelEs: 'Entrar en el archivo de actas', nextNodeId: 'c08_record_vault', setsFlags: { c08_evidence_any: true }, result: 'You enter the vault. The second ink gleams on every filed vow.', resultEs: 'Entras en el archivo. La segunda tinta brilla en cada voto archivado.' },
      { id: 'c08_to_seal', label: 'Descend to the old seal-room', labelEs: 'Bajar a la sala del sello antiguo', nextNodeId: 'c08_seal_room', setsFlags: { c08_evidence_any: true }, result: 'You descend to the seal-room. The black water holds the three bolts.', resultEs: 'Bajas a la sala del sello. El agua negra sostiene los tres cerrojos.' },
      { id: 'c08_to_grant', label: 'Open the dead-grant chamber', labelEs: 'Abrir la cámara de la concesión de los muertos', nextNodeId: 'c08_dead_grant_intro', setsFlags: { c08_evidence_any: true }, result: 'You lift the trapdoor. The dead-grant chamber breathes up iron and silence.', resultEs: 'Levantas la trampilla. La cámara de la concesión respira hierro y silencio.' },
      { id: 'c08_to_evidence_review', label: 'Lay out the evidence you carried from the campaign', labelEs: 'Desplegar las pruebas que trajiste de la campaña', nextNodeId: 'c08_evidence_review', result: 'You set the evidence from the whole campaign on the prosecution bench. Voss turns to look.', resultEs: 'Pones las pruebas de toda la campaña sobre el banquillo. Voss se vuelve para mirar.' },
      { id: 'c08_to_threshold', label: 'Call the court to its verdict', labelEs: 'Llamar a la corte a su veredicto', nextNodeId: 'c08_verdict_threshold', requires: [{ flag: 'c08_evidence_any' }], result: 'You call the court to vote. The chamber stills; the redactor lifts her veil.', resultEs: 'Llamas a la corte a votar. La sala se aquieta; la redactora se levanta el velo.' },
    ],
  },

  c08_evidence_review: {
    id: 'c08_evidence_review', kind: 'beat', locationId: 'c08_court_chamber',
    title: 'The Campaign Evidence', titleEs: 'Las pruebas de la campaña',
    text: 'You lay every piece of evidence the campaign has gathered on the bench. The ledger from the salt road, the bell-tower witness, the freed name, the continental register, the Vault ledger, the bond-death — each one is a thread in the pact the court is trying today. Voss reads them one by one; the redactor marks each that the court will accept into the record.',
    textEs: 'Pones cada prueba que la campaña ha reunido sobre el banquillo. El registro del camino de sal, el testigo de la torre, el nombre liberado, el registro continental, el libro de la Bóveda, la muerte del vínculo — cada uno es un hilo del pacto que la corte juzga hoy. Voss los lee uno a uno; la redactora marca cada uno que la corte aceptará en el acta.',
    choices: [
      { id: 'c08_present_ledger', label: 'Enter the salt-road ledger as evidence', labelEs: 'Presentar el registro del camino de sal como prueba', nextNodeId: 'c08_assembly', requires: [{ flag: 'canon:c02_evidence_ledger' }], setsFlags: { c08_evidence_record: true, c08_evidence_any: true }, result: 'The decoded ledger goes into the record. The second ink matches the vow-lock exactly; the court accepts it as the pact’s bookkeeping.', resultEs: 'El registro descifrado entra en el acta. La segunda tinta coincide con la cerradura del voto; la corte lo acepta como la contabilidad del pacto.' },
      { id: 'c08_present_bell', label: 'Enter the bell-tower witness as evidence', labelEs: 'Presentar el testigo de la torre como prueba', nextNodeId: 'c08_assembly', requires: [{ flag: 'canon:c03_evidence_bell' }], setsFlags: { c08_evidence_witness: true, c08_evidence_any: true }, result: 'The bell-tower witness goes into the record. A voice the court could not hear before is now read aloud from the basin.', resultEs: 'El testigo de la torre entra en el acta. Una voz que la corte no podía oír antes se lee ahora en la palangana.' },
      { id: 'c08_present_name', label: 'Enter the freed name as evidence', labelEs: 'Presentar el nombre liberado como prueba', nextNodeId: 'c08_assembly', requires: [{ flag: 'canon:c04_evidence_name' }], setsFlags: { c08_evidence_record: true, c08_evidence_any: true }, result: 'The name from the wood goes into the record. The court sees the door that was made a witness and charged for its own keeping.', resultEs: 'El nombre del bosque entra en el acta. La corte ve la puerta que fue hecha testigo y cobrada por su propia guarda.' },
      { id: 'c08_present_register', label: 'Enter the continental register as evidence', labelEs: 'Presentar el registro continental como prueba', nextNodeId: 'c08_assembly', requires: [{ flag: 'canon:c05_evidence_register' }], setsFlags: { c08_evidence_witness: true, c08_evidence_any: true }, result: 'Voss’s file goes into the record. The continental register holds every name the pact ever swore; the court accepts it as the witness-list.', resultEs: 'El expediente de Voss entra en el acta. El registro continental guarda cada nombre que el pacto juró; la corte lo acepta como la lista de testigos.' },
      { id: 'c08_present_vault', label: 'Enter the Vault ledger as evidence', labelEs: 'Presentar el libro de la Bóveda como prueba', nextNodeId: 'c08_assembly', requires: [{ flag: 'canon:c06_evidence_vault' }], setsFlags: { c08_evidence_seal: true, c08_evidence_any: true }, result: 'The Vault ledger goes into the record. The court sees the price the pact charged: a coastline, a door, a life per season.', resultEs: 'El libro de la Bóveda entra en el acta. La corte ve el precio que el pacto cobró: un litoral, una puerta, una vida por estación.' },
      { id: 'c08_present_bond_death', label: 'Enter the bond-death as evidence', labelEs: 'Presentar la muerte del vínculo como prueba', nextNodeId: 'c08_assembly', requires: [{ flag: 'canon:c07_bond_death' }], setsFlags: { c08_evidence_dead_grant: true, c08_evidence_any: true }, result: 'The bond-death goes into the record. The court hears the price already paid in iron; the dead-grant need not be heard again.', resultEs: 'La muerte del vínculo entra en el acta. La corte oye el precio ya pagado en hierro; la concesión de los muertos no necesita oírse otra vez.' },
      { id: 'c08_evidence_review_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'You gather the evidence and step back. The bench holds what the court will accept.', resultEs: 'Recoges las pruebas y retrocedes. El banquillo guarda lo que la corte aceptará.' },
    ],
  },

  c08_witness_stand: {
    id: 'c08_witness_stand', kind: 'beat', locationId: 'c08_witness_stand',
    title: 'The Witness Stand', titleEs: 'El estrado de testigos',
    text: 'The stand holds a single chair and a basin of clear water that records every voice spoken into it. Voss is here if his file survived the campaign; if it did not, the basin remains. The court lets a witness speak once, and once only.',
    textEs: 'El estrado tiene una sola silla y una palangana de agua clara que registra toda voz que se habla en ella. Voss está aquí si su expediente sobrevivió a la campaña; si no, la palangana sigue. La corte deja hablar a un testigo una vez, y solo una.',
    choices: [
      { id: 'c08_hear_testimony', label: 'Speak a testimony into the basin', labelEs: 'Hablar un testimonio en la palangana', nextNodeId: 'c08_witness_testimony', setsFlags: { c08_evidence_witness: true, c08_evidence_any: true }, result: 'The water takes the voice; the court takes the water. A witness has been heard.', resultEs: 'El agua toma la voz; la corte toma el agua. Un testigo ha sido oído.' },
      { id: 'c08_witness_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'You leave the stand. The basin holds its silence for now.', resultEs: 'Dejas el estrado. La palangana guarda su silencio por ahora.' },
    ],
  },

  c08_witness_testimony: {
    id: 'c08_witness_testimony', kind: 'beat',
    title: 'A Voice Read into the Record', titleEs: 'Una voz leída en el acta',
    text: 'The basin holds the voice now. Whatever else happens today, the chamber has its human proof. You may let the testimony stand, or raise the objection of the broken vow — that a door was named a witness and then charged for its own hearing.',
    textEs: 'La palangana guarda ya la voz. Pase lo que pase hoy, la sala tiene su prueba humana. Puedes dejar el testimonio como está, o plantear la objeción del voto roto — que una puerta fue nombrada testigo y luego cobrada por su propia audiencia.',
    choices: [
      { id: 'c08_raise_objection', label: 'Raise the objection of the broken vow', labelEs: 'Plantear la objeción del voto roto', nextNodeId: 'c08_witness_oath', setsFlags: { c08_objection_raised: true }, adjustsValues: { conviction_truth: 1 }, result: 'You raise the objection. The chamber cannot unhear it; the redactor marks it into the record.', resultEs: 'Planteas la objeción. La sala no puede dejar de oírla; la redactora la anota en el acta.' },
      { id: 'c08_testimony_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'You let the testimony stand and return. The voice stays in the basin.', resultEs: 'Dejas el testimonio como está y vuelves. La voz se queda en la palangana.' },
    ],
  },

  c08_witness_oath: {
    id: 'c08_witness_oath', kind: 'beat',
    title: 'The Objection of the Broken Vow', titleEs: 'La objeción del voto roto',
    text: 'You object not to the pact but to the vow that hid it: a door was named a witness and then charged for its own hearing. The chamber cannot unhear that. Whether the court votes or not, the objection stands in the record, and it will weigh on the last road.',
    textEs: 'Te opones no al pacto sino al voto que lo ocultó: una puerta fue nombrada testigo y luego cobrada por su propia audiencia. La sala no puede dejar de oírlo. Vote o no la corte, la objeción queda en el acta, y pesará en el último camino.',
    choices: [{ id: 'c08_oath_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'The objection is filed. You return to the chamber; the record holds one more mark against the pact.', resultEs: 'La objeción queda archivada. Vuelves a la sala; el acta guarda una marca más contra el pacto.' }],
  },

  c08_record_vault: {
    id: 'c08_record_vault', kind: 'beat', locationId: 'c08_record_vault',
    title: 'The Record Vault', titleEs: 'El archivo de actas',
    text: 'The vault holds every oath ever filed with the court, written in the same second ink that stained the chapel ledger a campaign ago. One vow is still legible — the one that made a door into a debt. It is locked in a riddle the court set so that only a witness could read it.',
    textEs: 'El archivo guarda cada juramento jamás presentado a la corte, escrito con la misma segunda tinta que manchó el registro de la capilla hace una campaña. Un voto sigue siendo legible — el que convirtió a una puerta en deuda. Está cerrado con un enigma que la corte puso para que solo un testigo pudiera leerlo.',
    choices: [
      { id: 'c08_open_puzzle_vow', label: 'Open the riddle of the vow', labelEs: 'Abrir el enigma del voto', nextNodeId: 'c08_puzzle_vow', result: 'You approach the vow-lock. The second ink forms its question on the page.', resultEs: 'Te acercas a la cerradura del voto. La segunda tinta forma su pregunta en la página.' },
      { id: 'c08_vault_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'You leave the vault. The vow stays locked for now.', resultEs: 'Dejas el archivo. El voto sigue cerrado por ahora.' },
    ],
  },

  c08_puzzle_vow: {
    id: 'c08_puzzle_vow', kind: 'puzzle', puzzleId: 'c08_vow_riddle',
    title: 'The Riddle of the Vow', titleEs: 'El enigma del voto',
    text: 'The vow-lock asks its question in the second ink. Answer true and the record turns its page to the door’s true name.',
    textEs: 'La cerradura del voto hace su pregunta en la segunda tinta. Responde con verdad y el acta pasa su página al nombre verdadero de la puerta.',
    choices: [],
  },

  c08_vow_decoded: {
    id: 'c08_vow_decoded', kind: 'beat',
    title: 'The Vow Decoded', titleEs: 'El voto descifrado',
    text: 'The page turns and the vow is plain: the door was named a witness so it could be charged for its own keeping. The record proves the prosecution’s point and the defense’s both. You may read the old seal beside it before you go.',
    textEs: 'La página pasa y el voto queda en claro: la puerta fue nombrada testigo para poder cobrarla por su propia guarda. El acta prueba tanto la acusación como la defensa. Puedes leer el sello antiguo junto a ella antes de irte.',
    choices: [
      { id: 'c08_examine_old_seal', label: 'Examine the old seal beside the vow', labelEs: 'Examinar el sello antiguo junto al voto', nextNodeId: 'c08_old_seal_seen', setsFlags: { c08_old_seal_seen: true }, result: 'You read the seal beside the vow. Three bolts, three names: witness, vessel, price.', resultEs: 'Lees el sello junto al voto. Tres cerrojos, tres nombres: testigo, vasija, precio.' },
      { id: 'c08_vow_decoded_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'You leave the decoded vow in the record and return to the chamber.', resultEs: 'Dejas el voto descifrado en el acta y vuelves a la sala.' },
    ],
  },

  c08_old_seal_seen: {
    id: 'c08_old_seal_seen', kind: 'beat',
    title: 'The Old Seal, At Rest', titleEs: 'El sello antiguo, en reposo',
    text: 'The seal is intact and three bolts turn in it — witness, vessel, price. You have seen it now, and the seal-room will recognize your hand when you descend.',
    textEs: 'El sello está intacto y tres cerrojos se mueven en él — testigo, vasija, precio. Ya lo has visto, y la sala del sello reconocerá tu mano cuando bajes.',
    choices: [{ id: 'c08_old_seal_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'You leave the seal at rest and climb back to the chamber.', resultEs: 'Dejas el sello en reposo y vuelves a subir a la sala.' }],
  },

  c08_vow_abandoned: {
    id: 'c08_vow_abandoned', kind: 'beat',
    title: 'The Vow Left Locked', titleEs: 'El voto dejado cerrado',
    text: 'You leave the riddle unread. The vow stays in the vault, and the court will have to do without its clearest page. There are other roads to a verdict.',
    textEs: 'Dejas el enigma sin leer. El voto se queda en el archivo, y la corte tendrá que arreglárselas sin su página más nítida. Hay otros caminos hacia un veredicto.',
    choices: [{ id: 'c08_vow_abandoned_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'You leave the vow unread and return. The clearest page stays closed.', resultEs: 'Dejas el voto sin leer y vuelves. La página más nítida sigue cerrada.' }],
  },

  c08_seal_room: {
    id: 'c08_seal_room', kind: 'beat', locationId: 'c08_seal_room',
    title: 'The Old Seal-Room', titleEs: 'La sala del sello antiguo',
    text: 'The seal sits in a well of black water — the same water that fills the Drowned Door, a campaign ago. Three bolts hold it: the witness-bolt, the vessel-bolt, the price-bolt. Turn them in the order an oath is spoken and the court can see what the pact was made from.',
    textEs: 'El sello descansa en un pozo de agua negra — la misma que llena la Puerta Ahogada, una campaña atrás. Tres cerrojos lo sostienen: el del testigo, el de la vasija, el del precio. Gíralos en el orden en que se pronuncia un juramento y la corte podrá ver de qué se hizo el pacto.',
    choices: [
      { id: 'c08_open_puzzle_seal', label: 'Turn the three bolts', labelEs: 'Girar los tres cerrojos', nextNodeId: 'c08_puzzle_seal', result: 'You reach for the bolts. The black water stills as the seal waits for the order.', resultEs: 'Tomas los cerrojos. El agua negra se aquieta mientras el sello espera el orden.' },
      { id: 'c08_seal_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'You leave the seal untouched and climb back to the chamber.', resultEs: 'Dejas el sello sin tocar y vuelves a subir a la sala.' },
    ],
  },

  c08_puzzle_seal: {
    id: 'c08_puzzle_seal', kind: 'puzzle', puzzleId: 'c08_seal_mechanism',
    title: 'The Old Seal', titleEs: 'El sello antiguo',
    text: 'The bolts wait. Witness, vessel, price — in the order the oath is spoken.',
    textEs: 'Los cerrojos esperan. Testigo, vasija, precio — en el orden en que se pronuncia el juramento.',
    choices: [],
  },

  c08_seal_aligned: {
    id: 'c08_seal_aligned', kind: 'beat',
    title: 'The Seal Aligned', titleEs: 'El sello alineado',
    text: 'The third bolt turns and the seal goes quiet. The court can now see the pact whole: a door for a witness, a seal for a vessel, a coastline for a price. To dissolve, the court needs only this; to reform, it needs this and a witness.',
    textEs: 'El tercer cerrojo gira y el sello se aquieta. La corte ya puede ver el pacto entero: una puerta por testigo, un sello por vasija, un litoral por precio. Para disolver, la corte solo necesita esto; para reformar, esto y un testigo.',
    choices: [{ id: 'c08_seal_aligned_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'The seal is aligned. You climb back to the chamber; the court can now see the pact whole.', resultEs: 'El sello está alineado. Vuelves a subir a la sala; la corte ya puede ver el pacto entero.' }],
  },

  c08_seal_left: {
    id: 'c08_seal_left', kind: 'beat',
    title: 'The Seal Left Alone', titleEs: 'El sello dejado en paz',
    text: 'You leave the bolts as they were. The seal stays shut, and the court will decide without seeing the pact whole. Dissolution loses its cleanest door.',
    textEs: 'Dejas los cerrojos como estaban. El sello sigue cerrado, y la corte decidirá sin ver el pacto entero. La disolución pierde su puerta más limpia.',
    choices: [{ id: 'c08_seal_left_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'You leave the seal shut and return. The pact stays half-seen by the court.', resultEs: 'Dejas el sello cerrado y vuelves. El pacto sigue medio visto por la corte.' }],
  },

  c08_dead_grant_intro: {
    id: 'c08_dead_grant_intro', kind: 'beat', locationId: 'c08_court_chamber',
    title: 'The Dead Grant', titleEs: 'La concesión de los muertos',
    text: 'Below the chamber is the dead-grant room, where an oath-bound killer is heard by ritual — or, if the court will not wait, by steel.\n\nThe grant is the last oath the court still answers to: a life sworn to keep a silence. Hear it, and the chamber has a witness no living voice can contradict.',
    textEs: 'Bajo la sala está la cámara de la concesión de los muertos, donde un asesino atado por juramento es oído por ritual — o, si la corte no espera, por acero.\n\nLa concesión es el último juramento al que la corte aún responde: una vida jurada para guardar un silencio. Óyelo, y la sala tendrá un testigo que ninguna voz viva puede contradecir.',
    choices: [
      { id: 'c08_perform_ritual', label: 'Hear the grant by ritual', labelEs: 'Oír la concesión por ritual', nextNodeId: 'c08_dead_grant_resolved', setsFlags: { c08_evidence_dead_grant: true, c08_evidence_any: true }, adjustsValues: { conviction_compassion: 1 }, result: 'You light the rite. The grant speaks its silence into the record without a blow.', resultEs: 'Enciendes el rito. La concesión habla su silencio en el acta sin un golpe.' },
      { id: 'c08_grant_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'You step back from the trapdoor. The dead-grant waits below, unspoken.', resultEs: 'Retrocedes de la trampilla. La concesión de los muertos espera abajo, sin hablar.' },
    ],
  },

  c08_dead_grant_resolved: {
    id: 'c08_dead_grant_resolved', kind: 'beat', locationId: 'c08_ritual_chamber', externalEntry: true,
    title: 'The Grant Heard', titleEs: 'La concesión oída',
    text: 'The grant is done. A witness who paid with their own keeping now stands in the record, and the chamber above has its hardest evidence. You climb back to the court.',
    textEs: 'La concesión ha concluido. Un testigo que pagó con su propia guarda queda ahora en el acta, y la sala de arriba tiene su prueba más dura. Vuelves a subir a la corte.',
    choices: [{ id: 'c08_grant_resolved_back', label: 'Return to the chamber', labelEs: 'Volver a la sala', nextNodeId: 'c08_assembly', result: 'You climb back to the chamber. The hardest evidence is now in the record.', resultEs: 'Vuelves a subir a la sala. La prueba más dura está ya en el acta.' }],
  },

  c08_verdict_threshold: {
    id: 'c08_verdict_threshold', kind: 'beat',
    title: 'The Court Called to Vote', titleEs: 'La corte llamada a votar',
    text: 'You have brought enough to the record. The court will take a verdict now — reform, vindicate, dissolve, or hang. The chamber waits on your charge.',
    textEs: 'Has traído bastante al acta. La corte emitirá ahora un veredicto — reformar, vindicar, disolver o suspender. La sala espera tu acusación.',
    choices: [
      { id: 'c08_to_vindicated', label: 'Press the prosecution to vindication', labelEs: 'Llevar la acusación a la vindicación', nextNodeId: 'c08_ending_vindicated', requires: [{ flag: 'c08_charge_prosecute' }, { flag: 'c08_evidence_witness' }, { flag: 'c08_evidence_record' }, { flag: 'c08_evidence_seal' }], setsFlags: { 'canon:c08_verdict_vindicated': true, 'canon:c08_evidence_majority': true }, result: 'The pact is declared broken by its own hand. The door is vindicated; the court restores the name it took.', resultEs: 'El pacto es declarado roto por su propia mano. La puerta queda vindicada; la corte devuelve el nombre que tomó.' },
      { id: 'c08_to_reform', label: 'Press the defense to reform', labelEs: 'Llevar la defensa a la reforma', nextNodeId: 'c08_ending_reform', requires: [{ flag: 'c08_charge_defend' }, { flag: 'c08_evidence_witness' }, { flag: 'c08_evidence_record' }, { flag: 'c08_evidence_seal' }], setsFlags: { 'canon:c08_verdict_reform': true, 'canon:c08_evidence_majority': true }, result: 'The pact is kept, but rewritten: the door keeps its name, the seal keeps a keeper, the price is paid in seasons instead of lives.', resultEs: 'El pacto se conserva, pero reescrito: la puerta guarda su nombre, el sello guarda un guardián, el precio se paga en estaciones en vez de vidas.' },
      { id: 'c08_to_dissolved', label: 'Press dissolution on the seal', labelEs: 'Impulsar la disolución sobre el sello', nextNodeId: 'c08_ending_dissolved', requires: [{ flag: 'c08_charge_dissolve' }, { flag: 'c08_seal_understood' }], setsFlags: { 'canon:c08_verdict_dissolved': true }, result: 'The seal breaks in the court’s sight. Every door the pact bound answers for itself from this dawn.', resultEs: 'El sello se rompe ante la corte. Cada puerta que el pacto ató responde por sí misma desde este alba.' },
      { id: 'c08_to_hung', label: 'Let the court stand hung', labelEs: 'Dejar a la corte suspendida', nextNodeId: 'c08_ending_hung', setsFlags: { 'canon:c08_verdict_hung': true }, result: 'The court cannot settle. The pact lapses at dawn without a verdict, and the last road will have to settle it instead.', resultEs: 'La corte no puede decidir. El pacto caduca al alba sin veredicto, y el último camino tendrá que decidirlo en su lugar.' },
    ],
  },

  c08_ending_vindicated: { id: 'c08_ending_vindicated', kind: 'ending', terminal: true, outcome: 'success', survivors: ['hero', 'c08_registrar_voss'], casualties: [], choices: [], title: 'Vindicated', titleEs: 'Vindicada', text: 'The court records that the pact broke the door it swore to keep. The name of the Drowned Door is returned to the record, and every keeper in the chamber rises. Behind the seal, the next world’s door will open onto a court that has admitted its fault. The last road begins.', textEs: 'La corte deja constancia de que el pacto rompió la puerta que juró guardar. El nombre de la Puerta Ahogada vuelve al acta, y cada guardián de la sala se levanta. Detrás del sello, la puerta del próximo mundo se abrirá ante una corte que ha admitido su falta. Comienza el último camino.' },

  c08_ending_reform: { id: 'c08_ending_reform', kind: 'ending', terminal: true, outcome: 'success', survivors: ['hero', 'c08_registrar_voss'], casualties: [], choices: [], title: 'Reformed', titleEs: 'Reformado', text: 'The court keeps the pact but rewrites its terms: the door keeps its name, the seal takes a living keeper, the price is paid in seasons rather than in lives. The chamber accepts the reform and adjourns. The last road carries a mended vessel toward the Tenth Door.', textEs: 'La corte conserva el pacto pero reescribe sus términos: la puerta guarda su nombre, el sello toma un guardián vivo, el precio se paga en estaciones y no en vidas. La sala acepta la reforma y se levanta. El último camino lleva una vasija reparada hacia la décima puerta.' },

  c08_ending_dissolved: { id: 'c08_ending_dissolved', kind: 'ending', terminal: true, outcome: 'ambiguous', survivors: ['hero'], casualties: [], choices: [], title: 'Dissolved', titleEs: 'Disuelto', text: 'The seal breaks in open court. The pact is unmade on its own vessel, and every door it bound — the Drowned Door, the bell-doors of Syrva, the name-doors of the wood — answers for itself from this dawn. The chamber empties of keepers and fills with the doors themselves. The last road is open.', textEs: 'El sello se rompe en sesión abierta. El pacto se deshace sobre su propia vasija, y cada puerta que ató — la Puerta Ahogada, las puertas-campana de Sirva, las puertas-nombre del bosque — responde por sí misma desde este alba. La sala se vacía de guardianes y se llena de las puertas mismas. El último camino queda abierto.' },

  c08_ending_hung: { id: 'c08_ending_hung', kind: 'ending', terminal: true, outcome: 'ambiguous', survivors: ['hero'], casualties: [], choices: [], title: 'Hung', titleEs: 'Suspendida', text: 'The court cannot settle, and the pact lapses at dawn without a verdict. The chamber leaves the question to the last road: whoever stands at the Tenth Door will have to settle what the court could not. No verdict is itself a kind of verdict — the one that hands the world to the next keeper.', textEs: 'La corte no puede decidir, y el pacto caduca al alba sin veredicto. La sala deja la cuestión al último camino: quien esté ante la décima puerta tendrá que decidir lo que la corte no pudo. Ningún veredicto es también una clase de veredicto — el que entrega el mundo al próximo guardián.' },
};

// ---- World ---------------------------------------------------

const LOCATIONS: Record<string, WorldLocation> = {
  c08_court_chamber: {
    id: 'c08_court_chamber', name: 'The Veiled Court', nameEs: 'La Corte del Velo',
    description: 'A long chamber of pale stone, lit from below by tide-water running in channels under the floor. Three doors leave it: the stand, the vault, the seal-room. A trapdoor in the center opens onto the dead-grant chamber.',
    descriptionEs: 'Una cámara larga de piedra pálida, iluminada desde abajo por agua de marea que corre por canales bajo el suelo. Tres puertas salen de ella: el estrado, el archivo, la sala del sello. Una trampilla en el centro abre sobre la cámara de la concesión de los muertos.',
    connections: ['c08_witness_stand', 'c08_record_vault', 'c08_seal_room', 'c08_ritual_chamber'],
    objects: [{ id: 'c08_tide_channels', name: 'Tide Channels', nameEs: 'Canales de marea', description: 'Black water moves in the floor-channels; it is the same water that fills the Drowned Door.', descriptionEs: 'Agua negra se mueve en los canales del suelo; es la misma que llena la Puerta Ahogada.', interactable: true, broken: false, hidden: false }],
    npcs: ['c08_registrar_voss', 'c08_assembly_clerk'], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'throne',
  },
  c08_witness_stand: {
    id: 'c08_witness_stand', name: 'The Witness Stand', nameEs: 'El estrado de testigos',
    description: 'A single chair beside a basin of clear water. The water records a voice once, and once only.',
    descriptionEs: 'Una silla junto a una palangana de agua clara. El agua registra una voz una vez, y solo una.',
    connections: ['c08_court_chamber'],
    objects: [{ id: 'c08_testimony_basin', name: 'Testimony Basin', nameEs: 'Palangana del testimonio', description: 'A basin of clear water that holds a single voice, spoken once.', descriptionEs: 'Una palangana de agua clara que guarda una sola voz, dicha una vez.', interactable: true, broken: false, hidden: false }],
    npcs: ['c08_redactor'], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'throne',
  },
  c08_record_vault: {
    id: 'c08_record_vault', name: 'The Record Vault', nameEs: 'El archivo de actas',
    description: 'Shelves of vows filed in the second ink, the same ink that stained the chapel ledger a campaign ago. One vow-lock sits open on the reading desk.',
    descriptionEs: 'Estanterías de votos archivados en la segunda tinta, la misma que manchó el registro de la capilla hace una campaña. Una cerradura de voto queda abierta sobre el atril.',
    connections: ['c08_court_chamber'],
    objects: [{ id: 'c08_vow_lock', name: 'The Vow-Lock', nameEs: 'La cerradura del voto', description: 'A riddle-lock the court set so only a witness could read the vow.', descriptionEs: 'Una cerradura-enigma que la corte puso para que solo un testigo pudiera leer el voto.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 0, discovered: true, secrets: [], ambiance: 'library',
  },
  c08_seal_room: {
    id: 'c08_seal_room', name: 'The Old Seal-Room', nameEs: 'La sala del sello antiguo',
    description: 'A well of black water holds the pact-seal. Three bolts turn in it: witness, vessel, price.',
    descriptionEs: 'Un pozo de agua negra sostiene el sello del pacto. Tres cerrojos se mueven en él: testigo, vasija, precio.',
    connections: ['c08_court_chamber'],
    objects: [{ id: 'c08_old_seal', name: 'The Old Seal', nameEs: 'El sello antiguo', description: 'Three bolts — eye, bowl, falling hand — hold the pact-seal in black water.', descriptionEs: 'Tres cerrojos — ojo, cuenco, mano que cae — sostienen el sello del pacto en agua negra.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'crypt',
  },
  c08_ritual_chamber: {
    id: 'c08_ritual_chamber', name: 'The Dead-Grant Chamber', nameEs: 'La cámara de la concesión de los muertos',
    description: 'A round stone room below the court, where an oath-bound killer is heard by ritual or by steel. The rite-basin and the iron ring both wait.',
    descriptionEs: 'Una sala redonda de piedra bajo la corte, donde un asesino atado por juramento es oído por ritual o por acero. La palangana del rito y el aro de hierro esperan ambas.',
    connections: ['c08_court_chamber'],
    objects: [{ id: 'c08_rite_basin', name: 'The Rite-Basin', nameEs: 'La palangana del rito', description: 'Light the rite here and the grant speaks without a blow.', descriptionEs: 'Enciende aquí el rito y la concesión habla sin un golpe.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: ['c08_dead_grant'], dangerLevel: 3, discovered: true, secrets: [], ambiance: 'crypt',
  },
};

const NPCS: Record<string, NPC> = {
  c08_registrar_voss: {
    id: 'c08_registrar_voss', name: 'Registrar Voss', nameEs: 'Registrador Voss', portrait: 'noble', faction: 'iron_parliament', location: 'c08_court_chamber', disposition: 5,
    knowledge: ['the_vow', 'the_seal', 'the_pact'],
    memory: [], inventory: [],
    dialogue: [
      { id: 'greeting', text: 'Voss turns the file to face you. “The pact made the door the witness and the seal the vessel. Pick the charge, and I will back you with the register.”', textEs: 'Voss gira el expediente hacia ti. «El pacto hizo de la puerta el testigo y del sello la vasija. Elige la acusación, y yo te respaldaré con el registro».', responses: [{ text: 'I will prosecute.', textEs: 'Acusaré.', nextNodeId: 'end' }, { text: 'I will defend.', textEs: 'Defenderé.', nextNodeId: 'end' }] },
    ],
    alive: true, occupation: 'Registrar', occupationEs: 'Registrador', secrets: [], secretsEs: [], personality: 'precise', personalityEs: 'preciso',
  },
  c08_assembly_clerk: {
    id: 'c08_assembly_clerk', name: 'The Assembly Clerk', nameEs: 'El secretario de la Asamblea', portrait: 'scholar', faction: 'iron_parliament', location: 'c08_court_chamber', disposition: 0,
    knowledge: ['the_dissolution_clause'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'The clerk counts heads and does not meet your eye. “Call the vote when you have something to read. The court will not vote on air.”', textEs: 'El secretario cuenta cabezas y no te mira. «Llama a la votación cuando tengas algo que leer. La corte no vota sobre el aire».', responses: [{ text: 'Understood.', textEs: 'Entendido.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Clerk', occupationEs: 'Secretario', secrets: [], secretsEs: [], personality: 'neutral', personalityEs: 'neutro',
  },
  c08_redactor: {
    id: 'c08_redactor', name: 'The Redactor', nameEs: 'La redactora', portrait: 'mysterious', faction: 'veiled_court', location: 'c08_witness_stand', disposition: 0,
    knowledge: ['witness_vessel_price'], memory: [], inventory: [],
    dialogue: [{ id: 'greeting', text: 'The redactor lifts her veil only for the oath-law. “Every oath is a child of three named things. Decide which of the three you put on the stand.”', textEs: 'La redactora se levanta el velo solo para la ley del juramento. «Cada juramento es hijo de tres cosas nombradas. Decid cuál de las tres ponéis en el estrado».', responses: [{ text: 'Thank you.', textEs: 'Gracias.', nextNodeId: 'end' }] }],
    alive: true, occupation: 'Redactor', occupationEs: 'Redactora', secrets: [], secretsEs: [], personality: 'veiled', personalityEs: 'velada',
  },
};

const MONSTERS: Record<string, Omit<Enemy, 'id'>> = {
  c08_dead_grant: {
    templateId: 'c08_dead_grant', name: 'The Dead Grant', nameEs: 'La concesión de los muertos', portrait: 'wraith', hp: 22, maxHp: 22, ac: 14, attack: 15, damage: '2d8', damageType: 'necrotic', abilities: ['Oath-Bound Silence', 'Iron Memory'], abilitiesEs: ['Silencio atado por juramento', 'Memoria de hierro'], xpValue: 200, loot: [], intelligence: 10, morale: 100, conditions: [],
  },
};

const QUESTS: Record<string, Quest> = {
  c08_the_veiled_court: {
    id: 'c08_the_veiled_court', name: 'The Veiled Court', nameEs: 'La Corte del Velo', description: 'Bring enough evidence to the record and take a verdict before dawn.', descriptionEs: 'Lleva suficiente prueba al acta y emite un veredicto antes del alba.', state: 'active', isMain: true, faction: 'veiled_court',
    objectives: [
      { id: 'c08_gather_evidence', description: 'Read something into the record', descriptionEs: 'Lee algo en el acta', completed: false, current: 0, required: 1 },
      { id: 'c08_render_verdict', description: 'Take a verdict', descriptionEs: 'Emitir un veredicto', completed: false, current: 0, required: 1 },
    ],
    rewards: [{ type: 'xp', value: 300 }],
  },
};

export const CHAPTER_EIGHT: Chapter = {
  id: 'chapter-08', index: 8,
  title: 'The Court of Broken Oaths', titleEs: 'La corte de los juramentos incumplidos',
  premise: 'The old compact that holds doors and songs in balance has reached its last day; in the Veiled Court you must prosecute it, defend it, or dissolve it, using every piece of evidence the campaign has earned.',
  premiseEs: 'El antiguo pacto que sostiene las puertas y las canciones ha llegado a su último día; en la sala de la Corte del Velo debes acusarlo, defenderlo o disolverlo, con las pruebas que toda la campaña ha reunido.',
  intro: [
    { type: 'system', text: 'CHAPTER VIII — THE COURT OF BROKEN OATHS', textEs: 'CAPÍTULO VIII — LA CORTE DE LOS JURAMENTOS INCUMPLIDOS', mood: 'mystery' },
    { type: 'narration', text: '{name} comes to the Veiled Court at the turn of the tide, the evidence of a whole campaign carried close. The compact that gave every door its name and every song its keeper expires at dawn; the chamber is full of the people it kept alive, and the court will hear one charge today, and one only.', textEs: '{name} llega a la Corte del Velo en el cambio de marea, las pruebas de toda una campaña llevadas cerca. El pacto que dio a cada puerta su nombre y a cada canción su guardián expira al alba; la sala está llena de la gente que mantuvo con vida, y la corte escuchará hoy una acusación, y solo una.', mood: 'mystery' },
    { type: 'system', text: 'CURRENT OBJECTIVE — Bring something to the record, then call the court to its verdict.', textEs: 'OBJETIVO ACTUAL — Lleva algo al acta y luego llama a la corte a su veredicto.', mood: 'neutral' },
  ],
  startNodeId: 'c08_arrival', startLocationId: 'c08_court_chamber',
  nodes: NODES,
  puzzles: { c08_vow_riddle: VOW_RIDDLE, c08_seal_mechanism: SEAL_MECHANISM },
  locations: LOCATIONS, npcs: NPCS, monsters: MONSTERS, quests: QUESTS,
  mainQuestId: 'c08_the_veiled_court',
  hooks: { bossLocationId: 'c08_ritual_chamber', aftermathNodeId: 'c08_dead_grant_resolved' },
  storyFacts: [
    { flag: 'c08_charge_prosecute', en: 'The party chose to prosecute the pact', es: 'El grupo eligió acusar al pacto' },
    { flag: 'c08_charge_defend', en: 'The party chose to defend the pact', es: 'El grupo eligió defender el pacto' },
    { flag: 'c08_charge_dissolve', en: 'The party chose to press for dissolution', es: 'El grupo eligió impulsar la disolución' },
    { flag: 'c08_seal_understood', en: 'The old seal was aligned and the pact seen whole', es: 'El sello antiguo fue alineado y el pacto visto entero' },
    { flag: 'c08_objection_raised', en: 'The objection of the broken vow stands in the record', es: 'La objeción del voto roto queda en el acta' },
    { flag: 'canon:c08_evidence_majority', en: 'A majority of the court’s evidence was read into the record', es: 'Una mayoría de las pruebas de la corte fue leída en el acta' },
  ],
  suggestions: {
    c08_court_chamber: [
      { label: 'Go to the witness stand', labelEs: 'Ir al estrado de testigos', action: 'go to the witness stand' },
      { label: 'Enter the record vault', labelEs: 'Entrar en el archivo de actas', action: 'go to the record vault' },
      { label: 'Descend to the old seal-room', labelEs: 'Bajar a la sala del sello antiguo', action: 'go to the old seal room' },
      { label: 'Open the dead-grant chamber', labelEs: 'Abrir la cámara de la concesión de los muertos', action: 'go to the dead grant chamber' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c08_witness_stand: [{ label: 'Return to the chamber', labelEs: 'Volver a la sala', action: 'go to the veiled court' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c08_record_vault: [{ label: 'Return to the chamber', labelEs: 'Volver a la sala', action: 'go to the veiled court' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c08_seal_room: [{ label: 'Return to the chamber', labelEs: 'Volver a la sala', action: 'go to the veiled court' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c08_ritual_chamber: [{ label: 'Return to the chamber', labelEs: 'Volver a la sala', action: 'go to the veiled court' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
  },
  externalEntrySeeds: {
    c08_arrival: [
      { 'canon:c02_evidence_ledger': true, 'canon:c03_evidence_bell': true, 'canon:c04_evidence_name': true, 'canon:c05_evidence_register': true, 'canon:c06_evidence_vault': true, 'canon:c07_bond_death': true },
    ],
    c08_dead_grant_resolved: [{ c08_charge_prosecute: true }, { c08_charge_defend: true }],
  },
  summaryFlags: [
    'c08_charge_prosecute', 'c08_charge_defend', 'c08_charge_dissolve',
    'c08_seal_understood', 'c08_objection_raised', 'canon:c08_evidence_majority',
    'canon:c08_verdict_reform', 'canon:c08_verdict_vindicated', 'canon:c08_verdict_dissolved', 'canon:c08_verdict_hung',
  ],
};
