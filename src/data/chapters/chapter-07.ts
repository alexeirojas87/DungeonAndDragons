// ============================================================
// CHAPTER VII — The Siege of Names
// El asedio de los nombres
// Act II finale. When the roads cross the salt waste,
// name-collectors no one can fight come for every name this
// campaign has carried. The only wall that can outlast the
// night is the one built from allies. The Claim is the ram
// through a chain of gates, and the death gate carries the
// death option of one bond. Four endings close the siege.
// ============================================================

import type { Chapter, StoryNode } from '../../engine/chapter';
import type { Puzzle } from '../../engine/puzzles';
import type { WorldLocation, NPC, Enemy, Quest } from '../../engine/types';

// ---- Puzzles -------------------------------------------------

const WALL_LIFT: Puzzle = {
  id: 'c07_wall_lift',
  kind: 'mechanism',
  title: 'The Wall Lift',
  titleEs: 'El alzamiento del muro',
  prompt: 'Three sections of the Naming Wall must be lifted before the Claim arrives: the base, the gate, and the crest. Lift them in the wrong order and the wall buckles; lift them in the right order and the wall holds.',
  promptEs: 'Tres secciones de la Muralla de los Nombres deben alzarse antes de que llegue la Reclamación: la base, la puerta y la cresta. Alza en el orden equivocado y el muro cede; alza en el orden correcto y el muro resiste.',
  hints: [
    { en: 'The base goes first — it is the foundation the rest stands on.', es: 'La base va primero: es el cimiento sobre el que se sostiene el resto.' },
    { en: 'The gate goes second — it is the door the Claim tries to ram.', es: 'La puerta va segunda: es la puerta que la Reclamación intenta embestir.' },
    { en: 'The crest goes last — it is the height the wall needs to hold the night.', es: 'La cresta va al final: es la altura que el muro necesita para resistir la noche.' },
  ],
  steps: ['c07_lift_base', 'c07_lift_gate', 'c07_lift_crest'],
  ordered: true,
  stepLabels: [
    { id: 'c07_lift_base', label: 'Lift the base', labelEs: 'Alzar la base' },
    { id: 'c07_lift_gate', label: 'Lift the gate', labelEs: 'Alzar la puerta' },
    { id: 'c07_lift_crest', label: 'Lift the crest', labelEs: 'Alzar la cresta' },
  ],
  onWrongStep: { en: 'The wall buckles and the sections fall back. Begin again.', es: 'El muro cede y las secciones caen. Empieza de nuevo.' },
  unlocks: { flags: { c07_wall_built: true } },
  solvedNodeId: 'c07_wall_raised',
  skipNodeId: 'c07_wall_lowered',
};

const CREDITOR_CHECK: Puzzle = {
  id: 'c07_creditor_check',
  kind: 'check',
  title: 'The Creditor Count',
  titleEs: 'El recuento de acreedores',
  prompt: 'The assembly needs to know how many name-collectors the Claim is bringing. Count them from the assembly roof before the night falls, and you know which flanks will hold and which will break.',
  promptEs: 'La asamblea necesita saber cuántos cobradores de nombres trae la Reclamación. Cuéntalos desde el techo de la asamblea antes de que caiga la noche, y sabrás qué flancos resistirán y cuáles cederán.',
  hints: [
    { en: 'The collectors march in chains of three — count the chains, not the shapes.', es: 'Los cobradores marchan en cadenas de tres: cuenta las cadenas, no las figuras.' },
    { en: 'The opened Vault made the coast lighter — if the Vault opened, the collectors are fewer.', es: 'La Bóveda abierta aligeró la costa: si la Bóveda se abrió, los cobradores son menos.' },
  ],
  skill: 'insight',
  dc: 14,
  clues: [
    { id: 'c07_clue_chains', en: 'The collectors march in chains of three — count the chains.', es: 'Los cobradores marchan en cadenas de tres: cuenta las cadenas.', dcReduction: 2 },
    { id: 'c07_clue_vault', en: 'If the Vault opened, the coastline debts settled and the collectors are fewer.', es: 'Si la Bóveda se abrió, las deudas del litoral se saldaron y los cobradores son menos.', dcReduction: 3 },
  ],
  unlocks: { flags: { c07_creditors_counted: true } },
  solvedNodeId: 'c07_creditor_counted',
  skipNodeId: 'c07_creditor_skipped',
};

// ---- Nodes ---------------------------------------------------

const NODES: Record<string, StoryNode> = {
  c07_arrival: {
    id: 'c07_arrival', kind: 'beat', locationId: 'c07_salt_waste', externalEntry: true,
    title: 'The Salt Waste', titleEs: 'El erial de sal',
    text: 'The roads cross at the salt waste, and the name-collectors are coming. You can see them on the horizon — a chain of shapes, the Claim at its head, the ram that breaks every wall it meets. The Naming Wall stands between the waste and the roads home, and it is the only wall the collectors have not yet broken. The assembly is gathering behind it, and the wall is not yet built. The night is coming, and with it the Claim.',
    textEs: 'Los caminos se cruzan en el erial de sal, y los cobradores de nombres vienen. Puedes verlos en el horizonte — una cadena de figuras, la Reclamación a su cabeza, el ariete que rompe cada muro que encuentra. La Muralla de los Nombres se alza entre el erial y los caminos a casa, y es el único muro que los cobradores no han roto aún. La asamblea se reúne detrás de ella, y el muro aún no está construido. La noche viene, y con ella la Reclamación.',
    choices: [
      { id: 'c07_arrival_with_map', label: 'Take the map road to the wall', labelEs: 'Tomar el camino del mapa al muro', nextNodeId: 'c07_wall_gate', requires: [{ flag: 'canon:c02_map_shared' }], result: 'The map Olen shared still holds the road. You reach the wall before the collectors see you.', resultEs: 'El mapa que Olen compartió aún guarda el camino. Llegas al muro antes de que los cobradores te vean.' },
      { id: 'c07_arrival_bare', label: 'Walk the waste openly', labelEs: 'Cruzar el erial abiertamente', nextNodeId: 'c07_wall_gate', result: 'You walk the waste in the open. The collectors see you but they do not speed.', resultEs: 'Cruzas el erial abierto. Los cobradores te ven pero no se apresuran.' },
    ],
  },

  c07_wall_gate: {
    id: 'c07_wall_gate', kind: 'beat', locationId: 'c07_naming_wall',
    title: 'The Naming Wall', titleEs: 'La Muralla de los Nombres',
    text: 'The Naming Wall is not a wall of stone. It is a wall of names — every name the free witnesses carry, written on the salt-crusted stones, and each name is a defender. The wall is half-built and the night is coming. The assembly gathers behind it, and the breach is open where the wall has not yet been raised. Three paths leave the gate: the walls where the lift is being built, the assembly where the creditors are being counted, and the breach where the Claim will come.',
    textEs: 'La Muralla de los Nombres no es un muro de piedra. Es un muro de nombres — cada nombre que los testigos libres llevan, escrito en las piedras incrustadas de sal, y cada nombre es un defensor. El muro está medio construido y la noche viene. La asamblea se reúne detrás, y la brecha está abierta donde el muro aún no se ha alzado. Tres caminos salen de la puerta: los muros donde se construye el alzamiento, la asamblea donde se cuentan los acreedores, y la brecha por donde vendrá la Reclamación.',
    choices: [
      { id: 'c07_gate_to_assembly', label: 'Go to the assembly call', labelEs: 'Ir al llamado de la asamblea', nextNodeId: 'c07_assembly_call', result: 'You walk to the assembly call. The gathering has begun.', resultEs: 'Caminas al llamado de la asamblea. La reunión ha comenzado.' },
    ],
  },

  c07_assembly_call: {
    id: 'c07_assembly_call', kind: 'beat', locationId: 'c07_naming_wall',
    title: 'The Assembly Call', titleEs: 'El llamado de la asamblea',
    text: 'The assembly is the gathering of every ally this campaign has carried — the free witnesses, the fleet eye, the salt caravan, the wood keepers, and the ones who came with you from the first road. They stand behind the half-built wall and they wait for someone to carry the standard. "The Claim is the ram," the assembly says with one voice, "and the wall is the names. Choose who carries the standard, and the wall will follow."',
    textEs: 'La asamblea es la reunión de cada aliado que esta campaña ha llevado — los testigos libres, el ojo de la flota, la caravana de sal, los guardianes del bosque, y los que vinieron contigo desde el primer camino. Se mantienen detrás del muro medio construido y esperan a alguien que lleve el estandarte. —La Reclamación es el ariete —dice la asamblea con una sola voz—, y el muro son los nombres. Elige quién lleva el estandarte, y el muro seguirá.',
    choices: [
      { id: 'c07_assembly_to_first', label: 'Answer the assembly', labelEs: 'Responder a la asamblea', nextNodeId: 'c07_first_lead', result: 'You step forward. The assembly waits for your word.', resultEs: 'Das un paso al frente. La asamblea espera tu palabra.' },
    ],
  },

  c07_first_lead: {
    id: 'c07_first_lead', kind: 'beat', locationId: 'c07_naming_wall',
    title: 'Who Carries the Standard', titleEs: 'Quién lleva el estandarte',
    text: 'Three hands can carry the standard: Elara, who has been with you since the first road and knows what a name costs; Varen, who guided you through every door and knows what a wall holds; or you, who have carried every name this campaign has traded. The standard is the vessel of the wall-oath — whoever carries it, the wall follows. "Choose," the assembly says. "The night is coming and the Claim does not wait."',
    textEs: 'Tres manos pueden llevar el estandarte: Elara, que ha estado contigo desde el primer camino y sabe lo que cuesta un nombre; Varen, que te guió por cada puerta y sabe lo que sostiene un muro; o tú, que has llevado cada nombre que esta campaña ha trocado. El estandarte es la vasija del juramento del muro — quien lo lleva, el muro lo sigue. —Elige —dice la asamblea—. La noche viene y la Reclamación no espera.',
    choices: [
      { id: 'c07_lead_elara', label: 'Let Elara carry the standard', labelEs: 'Dejar que Elara lleve el estandarte', nextNodeId: 'c07_walls', requiresValues: [{ key: 'bond:elara', min: 1 }], setsFlags: { c07_elara_leads: true }, adjustsValues: { conviction_duty: 1, bond_elara: 1 }, result: 'Elara takes the standard. The wall follows her toward the lift.', resultEs: 'Elara toma el estandarte. El muro la sigue hacia el alzamiento.' },
      { id: 'c07_lead_varen', label: 'Let Varen carry the standard', labelEs: 'Dejar que Varen lleve el estandarte', nextNodeId: 'c07_assembly', requiresValues: [{ key: 'bond:varen', min: 1 }], setsFlags: { c07_varen_leads: true }, adjustsValues: { conviction_duty: 1, bond_varen: 1 }, result: 'Varen takes the standard. The assembly follows him to the count.', resultEs: 'Varen toma el estandarte. La asamblea lo sigue al recuento.' },
      { id: 'c07_lead_party', label: 'Carry the standard yourself', labelEs: 'Llevar el estandarte tú mismo', nextNodeId: 'c07_breach', setsFlags: { c07_party_leads: true }, adjustsValues: { conviction_freedom: 1 }, result: 'You take the standard. The breach is where the Claim will come, and you go to meet it.', resultEs: 'Tomas el estandarte. La brecha es por donde vendrá la Reclamación, y vas a encontrarla.' },
    ],
  },

  c07_walls: {
    id: 'c07_walls', kind: 'beat', locationId: 'c07_naming_wall',
    title: 'The Walls', titleEs: 'Los muros',
    text: 'Elara carries the standard to the wall lift, where three sections of the Naming Wall wait to be raised: the base, the gate, and the crest. The wall is half-built and the night is coming. "Lift them in the right order," Elara says, "and the wall holds the night. Lift them wrong and the wall buckles before the Claim arrives." The wall-witness stands at the base, watching.',
    textEs: 'Elara lleva el estandarte al alzamiento del muro, donde tres secciones de la Muralla de los Nombres esperan ser alzadas: la base, la puerta y la cresta. El muro está medio construido y la noche viene. —Alza en el orden correcto —dice Elara— y el muro resiste la noche. Alza mal y el muro cede antes de que la Reclamación llegue. El testigo del muro se mantiene en la base, observando.',
    choices: [
      { id: 'c07_walls_to_witness', label: 'Speak to the wall-witness', labelEs: 'Hablar con el testigo del muro', nextNodeId: 'c07_wall_witness', result: 'The witness turns. Her name is on the wall.', resultEs: 'El testigo se vuelve. Su nombre está en el muro.' },
      { id: 'c07_walls_back', label: 'Return to the first lead', labelEs: 'Volver a la elección del estandarte', nextNodeId: 'c07_first_lead', result: 'You step back. The standard stays in Elara hands.', resultEs: 'Retrocedes. El estandarte sigue en manos de Elara.' },
    ],
  },

  c07_wall_witness: {
    id: 'c07_wall_witness', kind: 'beat', locationId: 'c07_naming_wall',
    title: 'The Wall-Witness', titleEs: 'El testigo del muro',
    text: 'The wall-witness is one of the free witnesses, her name carved in the base of the wall. "I am the wall," she says. "My name is the base. Lift the base first, then the gate, then the crest. The wall follows the names, and the names follow the order." She touches the stone. "Lift them wrong and my name cracks. Lift them right and my name holds the night."',
    textEs: 'El testigo del muro es uno de los testigos libres, su nombre tallado en la base del muro. —Yo soy el muro —dice—. Mi nombre es la base. Alza primero la base, luego la puerta, luego la cresta. El muro sigue a los nombres, y los nombres siguen el orden. —Toca la piedra—. Alza mal y mi nombre se raja. Alza bien y mi nombre resiste la noche.',
    choices: [
      { id: 'c07_witness_to_lift', label: 'Go to the wall lift', labelEs: 'Ir al alzamiento del muro', nextNodeId: 'c07_wall_lift_node', result: 'You walk to the lift. Three sections wait.', resultEs: 'Caminas al alzamiento. Tres secciones esperan.' },
      { id: 'c07_witness_back', label: 'Return to the walls', labelEs: 'Volver a los muros', nextNodeId: 'c07_walls', result: 'You step back. The witness watches you go.', resultEs: 'Retrocedes. El testigo te ve irse.' },
    ],
  },

  c07_wall_lift_node: {
    id: 'c07_wall_lift_node', kind: 'beat', locationId: 'c07_naming_wall',
    title: 'The Wall Lift', titleEs: 'El alzamiento del muro',
    text: 'Three sections of the wall wait to be lifted: the base, the gate, the crest. Elara holds the standard and the wall-witness watches from the base. Lift them in the right order and the wall holds the night.',
    textEs: 'Tres secciones del muro esperan ser alzadas: la base, la puerta, la cresta. Elara sostiene el estandarte y el testigo del muro observa desde la base. Alza en el orden correcto y el muro resiste la noche.',
    choices: [
      { id: 'c07_lift_open', label: 'Begin the wall lift', labelEs: 'Comenzar el alzamiento', nextNodeId: 'c07_wall_puzzle', result: 'You put your hands to the base. The lift begins.', resultEs: 'Pones tus manos en la base. El alzamiento comienza.' },
      { id: 'c07_lift_back', label: 'Return to the witness', labelEs: 'Volver al testigo', nextNodeId: 'c07_wall_witness', result: 'You step back. The sections stay down.', resultEs: 'Retrocedes. Las secciones siguen abajo.' },
    ],
  },

  c07_wall_puzzle: {
    id: 'c07_wall_puzzle', kind: 'puzzle', puzzleId: 'c07_wall_lift', locationId: 'c07_naming_wall',
    title: 'The Wall Lift', titleEs: 'El alzamiento del muro',
    text: 'Three sections wait. Base, gate, crest.',
    textEs: 'Tres secciones esperan. Base, puerta, cresta.',
    choices: [],
  },

  c07_wall_raised: {
    id: 'c07_wall_raised', kind: 'beat', locationId: 'c07_naming_wall',
    title: 'The Wall Raised', titleEs: 'El muro alzado',
    text: 'The crest lifts and the wall stands. The names hold the stones and the stones hold the night. Elara lowers the standard. "The wall will hold," she says. "But the Claim is still coming, and the death gate is still open. Go — I will hold the wall while you choose."',
    textEs: 'La cresta se alza y el muro se sostiene. Los nombres sostienen las piedras y las piedras sostienen la noche. Elara baja el estandarte. —El muro resistirá —dice—. Pero la Reclamación sigue viniendo, y la puerta de la muerte sigue abierta. Ve — sostendré el muro mientras eliges.',
    choices: [
      { id: 'c07_raised_to_death', label: 'Go to the death gate', labelEs: 'Ir a la puerta de la muerte', nextNodeId: 'c07_death_gate', result: 'You walk to the death gate. The wall holds behind you.', resultEs: 'Caminas a la puerta de la muerte. El muro resiste a tu espalda.' },
    ],
  },

  c07_wall_lowered: {
    id: 'c07_wall_lowered', kind: 'beat', locationId: 'c07_naming_wall',
    title: 'The Wall Left Low', titleEs: 'El muro dejado bajo',
    text: 'You leave the sections as they are. The wall stays half-built and the night is coming. "The wall will hold what it can," Elara says, "but it will not hold everything. Go to the death gate. The choice there is the one the wall cannot make for you."',
    textEs: 'Dejas las secciones como están. El muro sigue medio construido y la noche viene. —El muro resistirá lo que pueda —dice Elara—, pero no resistirá todo. Ve a la puerta de la muerte. La elección ahí es la que el muro no puede hacer por ti.',
    choices: [
      { id: 'c07_lowered_to_death', label: 'Go to the death gate', labelEs: 'Ir a la puerta de la muerte', nextNodeId: 'c07_death_gate', result: 'You walk to the death gate. The wall is low behind you.', resultEs: 'Caminas a la puerta de la muerte. El muro está bajo a tu espalda.' },
    ],
  },

  c07_assembly: {
    id: 'c07_assembly', kind: 'beat', locationId: 'c07_assembly',
    title: 'The Assembly', titleEs: 'La asamblea',
    text: 'Varen carries the standard to the assembly, where the free witnesses are counting the name-collectors on the horizon. "The Claim brings a chain of collectors," Varen says, "and each collector is a gate the wall must hold. Count them from the roof, and we know which flanks hold and which break." The assembly roof is open to the waste, and the collectors are visible in the dying light.',
    textEs: 'Varen lleva el estandarte a la asamblea, donde los testigos libres cuentan los cobradores de nombres en el horizonte. —La Reclamación trae una cadena de cobradores —dice Varen—, y cada cobrador es una puerta que el muro debe sostener. Cuéntalos desde el techo, y sabremos qué flancos resisten y cuáles ceden. El techo de la asamblea está abierto al erial, y los cobradores son visibles en la luz que muere.',
    choices: [
      { id: 'c07_assembly_to_gather', label: 'Join the gathering', labelEs: 'Unirse a la reunión', nextNodeId: 'c07_assembly_gather', result: 'You walk into the assembly. The counting has begun.', resultEs: 'Entras a la asamblea. El recuento ha comenzado.' },
      { id: 'c07_assembly_back', label: 'Return to the first lead', labelEs: 'Volver a la elección del estandarte', nextNodeId: 'c07_first_lead', result: 'You step back. The standard stays in Varen hands.', resultEs: 'Retrocedes. El estandarte sigue en manos de Varen.' },
    ],
  },

  c07_assembly_gather: {
    id: 'c07_assembly_gather', kind: 'beat', locationId: 'c07_assembly',
    title: 'The Gathering', titleEs: 'La reunión',
    text: 'The free witnesses are on the roof, counting the collectors. "The Vault helped," one says. "If the Continental Vault opened, the coastline debts settled and the collectors are fewer. If it did not, the collectors are as many as the debts." The creditor count waits on the roof — count them properly and you know which flanks hold.',
    textEs: 'Los testigos libres están en el techo, contando los cobradores. —La Bóveda ayudó —dice uno—. Si la Bóveda del Continente se abrió, las deudas del litoral se saldaron y los cobradores son menos. Si no, los cobradores son tantos como las deudas. El recuento de acreedores espera en el techo — cuéntalos como es debido y sabrás qué flancos resisten.',
    choices: [
      { id: 'c07_gather_to_creditor', label: 'Go to the creditor count', labelEs: 'Ir al recuento de acreedores', nextNodeId: 'c07_creditor_check_node', result: 'You climb to the roof. The collectors wait on the horizon.', resultEs: 'Subes al techo. Los cobradores esperan en el horizonte.' },
      { id: 'c07_gather_back', label: 'Return to the assembly', labelEs: 'Volver a la asamblea', nextNodeId: 'c07_assembly', result: 'You step down. The counting goes on without you.', resultEs: 'Bajas. El recuento sigue sin ti.' },
    ],
  },

  c07_creditor_check_node: {
    id: 'c07_creditor_check_node', kind: 'beat', locationId: 'c07_assembly',
    title: 'The Creditor Count', titleEs: 'El recuento de acreedores',
    text: 'The creditor count is a skill of insight — reading the chain of collectors on the horizon, counting the gates the wall must hold. The free witnesses have a scope, and the dying light is enough to count by. Count them properly and you know which flanks hold; count them wrong and the wall breaks where you did not expect.',
    textEs: 'El recuento de acreedores es una habilidad de perspicacia — leer la cadena de cobradores en el horizonte, contar las puertas que el muro debe sostener. Los testigos libres tienen un catalejo, y la luz que muere basta para contar. Cuéntalos como es debido y sabrás qué flancos resisten; cuéntalos mal y el muro cede donde no esperabas.',
    choices: [
      { id: 'c07_creditor_open', label: 'Count the collectors', labelEs: 'Contar los cobradores', nextNodeId: 'c07_creditor_puzzle', result: 'You put your eye to the scope. The chain waits to be counted.', resultEs: 'Pones el ojo en el catalejo. La cadena espera ser contada.' },
      { id: 'c07_creditor_back', label: 'Return to the gathering', labelEs: 'Volver a la reunión', nextNodeId: 'c07_assembly_gather', result: 'You step back from the scope. The counting waits.', resultEs: 'Retrocedes del catalejo. El recuento espera.' },
    ],
  },

  c07_creditor_puzzle: {
    id: 'c07_creditor_puzzle', kind: 'puzzle', puzzleId: 'c07_creditor_check', locationId: 'c07_assembly',
    title: 'The Creditor Count', titleEs: 'El recuento de acreedores',
    text: 'The chain of collectors waits to be counted.',
    textEs: 'La cadena de cobradores espera ser contada.',
    choices: [],
  },

  c07_creditor_counted: {
    id: 'c07_creditor_counted', kind: 'beat', locationId: 'c07_assembly',
    title: 'The Collectors Counted', titleEs: 'Los cobradores contados',
    text: 'The count is done. The chain of collectors is fewer if the Vault opened — the coastline debts settled, and the Claim brings fewer gates. Varen lowers the standard. "We know which flanks hold," he says. "Now the death gate. The choice there is the one the count cannot make for you. Go."',
    textEs: 'El recuento está hecho. La cadena de cobradores es menor si la Bóveda se abrió — las deudas del litoral se saldaron, y la Reclamación trae menos puertas. Varen baja el estandarte. —Sabemos qué flancos resisten —dice—. Ahora la puerta de la muerte. La elección ahí es la que el recuento no puede hacer por ti. Ve.',
    choices: [
      { id: 'c07_counted_to_death', label: 'Go to the death gate', labelEs: 'Ir a la puerta de la muerte', nextNodeId: 'c07_death_gate', result: 'You descend from the roof. The death gate waits below.', resultEs: 'Bajas del techo. La puerta de la muerte espera abajo.' },
    ],
  },

  c07_creditor_skipped: {
    id: 'c07_creditor_skipped', kind: 'beat', locationId: 'c07_assembly',
    title: 'The Count Unmade', titleEs: 'El recuento sin hacer',
    text: 'You leave the count undone. "No matter," Varen says. "The wall holds what it holds, and the death gate is the choice the count cannot change. Go — the night is here."',
    textEs: 'Dejas el recuento sin hacer. —No importa —dice Varen—. El muro resiste lo que resiste, y la puerta de la muerte es la elección que el recuento no puede cambiar. Ve — la noche está aquí.',
    choices: [
      { id: 'c07_skipped_to_death', label: 'Go to the death gate', labelEs: 'Ir a la puerta de la muerte', nextNodeId: 'c07_death_gate', result: 'You descend without the count. The death gate waits.', resultEs: 'Bajas sin el recuento. La puerta de la muerte espera.' },
    ],
  },

  c07_breach: {
    id: 'c07_breach', kind: 'beat', locationId: 'c07_breach',
    title: 'The Breach', titleEs: 'La brecha',
    text: 'You carry the standard to the breach — the gap in the wall where the Claim will come. The breach is open and the night is here. The Claim is a ram, not a person — a chain of gates that breaks every wall it meets, and each gate is a name-collector. You can meet it head-on, or you can fall back to the death gate and let the wall and the assembly hold what they can.',
    textEs: 'Llevas el estandarte a la brecha — el hueco en el muro por donde vendrá la Reclamación. La brecha está abierta y la noche está aquí. La Reclamación es un ariete, no una persona — una cadena de puertas que rompe cada muro que encuentra, y cada puerta es un cobrador de nombres. Puedes enfrentarla de frente, o puedes retroceder a la puerta de la muerte y dejar que el muro y la asamblea resistan lo que puedan.',
    choices: [
      { id: 'c07_breach_to_open', label: 'Enter the breach', labelEs: 'Entrar a la brecha', nextNodeId: 'c07_breach_open', result: 'You walk into the breach. The Claim is on the horizon.', resultEs: 'Entras a la brecha. La Reclamación está en el horizonte.' },
      { id: 'c07_breach_back', label: 'Return to the first lead', labelEs: 'Volver a la elección del estandarte', nextNodeId: 'c07_first_lead', result: 'You step back. The breach stays open.', resultEs: 'Retrocedes. La brecha sigue abierta.' },
    ],
  },

  c07_breach_open: {
    id: 'c07_breach_open', kind: 'beat', locationId: 'c07_breach',
    title: 'The Breach Open', titleEs: 'La brecha abierta',
    text: 'The breach is the gap where the wall has not been raised. The Claim comes through it — a chain of gates, each one a name-collector. You can fight the Claim in the breach, fall back to the death gate, or — if the Continental Vault was opened — use the settled debts to hold the flank. The night is here.',
    textEs: 'La brecha es el hueco donde el muro no se ha alzado. La Reclamación viene por ella — una cadena de puertas, cada una un cobrador de nombres. Puedes combatir a la Reclamación en la brecha, retroceder a la puerta de la muerte, o — si la Bóveda del Continente se abrió — usar las deudas saldadas para sostener el flanco. La noche está aquí.',
    choices: [
      { id: 'c07_breach_to_claim', label: 'Go to meet the Claim', labelEs: 'Ir a encontrar a la Reclamación', nextNodeId: 'c07_claim_approach', result: 'You walk toward the chain of gates. The Claim turns its ram.', resultEs: 'Caminas hacia la cadena de puertas. La Reclamación gira su ariete.' },
    ],
  },

  c07_claim_approach: {
    id: 'c07_claim_approach', kind: 'beat', locationId: 'c07_breach',
    title: 'The Claim', titleEs: 'La Reclamación',
    text: 'The Claim is a ram of gates — each gate a name-collector, each collector a name the campaign has carried. It does not speak; it breaks. You can fight it in the breach, fall back to the death gate, or — if the Vault opened and the coastline debts settled — hold the flank with the weight of the settled coast.',
    textEs: 'La Reclamación es un ariete de puertas — cada puerta un cobrador de nombres, cada cobrador un nombre que la campaña ha llevado. No habla; rompe. Puedes combatirla en la brecha, retroceder a la puerta de la muerte, o — si la Bóveda se abrió y las deudas del litoral se saldaron — sostener el flanco con el peso del litoral saldado.',
    choices: [
      { id: 'c07_face_claim', label: 'Fight the Claim in the breach', labelEs: 'Combatir a la Reclamación en la brecha', nextNodeId: 'c07_claim_aftermath', setsFlags: { c07_claim_faced: true }, result: 'You raise your weapon. The Claim lowers its ram.', resultEs: 'Levantas tu arma. La Reclamación baja su ariete.' },
      { id: 'c07_hold_with_vault', label: 'Hold the flank with the settled Vault', labelEs: 'Sostener el flanco con la Bóveda saldada', nextNodeId: 'c07_death_gate', requires: [{ flag: 'canon:c06_vault_opened' }], result: 'The opened Vault settled the coastline debts. The collectors are fewer and the flank holds.', resultEs: 'La Bóveda abierta saldó las deudas del litoral. Los cobradores son menos y el flanco resiste.' },
      { id: 'c07_evade_claim', label: 'Fall back to the death gate', labelEs: 'Retroceder a la puerta de la muerte', nextNodeId: 'c07_death_gate', result: 'You fall back. The Claim fills the breach behind you.', resultEs: 'Retrocedes. La Reclamación llena la brecha a tu espalda.' },
    ],
  },

  c07_claim_aftermath: {
    id: 'c07_claim_aftermath', kind: 'beat', locationId: 'c07_breach', externalEntry: true,
    title: 'The Claim Broken', titleEs: 'La Reclamación rota',
    text: 'The Claim is broken in the breach. Its chain of gates scatters and the name-collectors dissolve into the salt. The breach is held — for now. The night is still here, and the death gate is still open. The assembly calls from behind the wall: "The ram is down, but the night is not. Go — the choice is yours."',
    textEs: 'La Reclamación está rota en la brecha. Su cadena de puertas se esparce y los cobradores de nombres se disuelven en la sal. La brecha resiste — por ahora. La noche sigue aquí, y la puerta de la muerte sigue abierta. La asamblea llama desde detrás del muro: —El ariete está caído, pero la noche no. Ve — la elección es tuya.',
    choices: [
      { id: 'c07_claim_to_death', label: 'Go to the death gate', labelEs: 'Ir a la puerta de la muerte', nextNodeId: 'c07_death_gate', result: 'You walk from the breach to the death gate. The wall watches.', resultEs: 'Caminas de la brecha a la puerta de la muerte. El muro vigila.' },
    ],
  },

  c07_death_gate: {
    id: 'c07_death_gate', kind: 'beat', locationId: 'c07_naming_wall',
    title: 'The Death Gate', titleEs: 'La puerta de la muerte',
    text: 'The death gate is the room where one price can be paid. Elara or Varen — whichever bond is highest — can walk the room and pay the price the wall cannot: a life for a name, a name for a wall. If one walks, the wall holds the night and the bond ends. If neither walks, the watchman lives — but the wall must hold on its own. "Choose," the assembly says. "The night does not wait for the living."',
    textEs: 'La puerta de la muerte es la sala donde un precio puede pagarse. Elara o Varen — el vínculo más alto — puede caminar la sala y pagar el precio que el muro no puede: una vida por un nombre, un nombre por un muro. Si uno camina, el muro resiste la noche y el vínculo se acaba. Si ninguno camina, el vigilante vive — pero el muro debe sostenerse solo. —Elige —dice la asamblea—. La noche no espera a los vivos.',
    choices: [
      { id: 'c07_elara_walks', label: 'Let Elara walk the death gate', labelEs: 'Dejar que Elara camine la puerta de la muerte', nextNodeId: 'c07_final_choice', requiresValues: [{ key: 'bond:elara', min: 2 }], setsFlags: { 'canon:c07_bond_death': true, c07_elara_dies: true }, adjustsValues: { bond_elara: -3, conviction_compassion: 1 }, result: 'Elara walks the death gate. Her name pays the price the wall cannot. The wall holds the night; Elara does not.', resultEs: 'Elara camina la puerta de la muerte. Su nombre paga el precio que el muro no puede. El muro resiste la noche; Elara, no.' },
      { id: 'c07_varen_walks', label: 'Let Varen walk the death gate', labelEs: 'Dejar que Varen camine la puerta de la muerte', nextNodeId: 'c07_final_choice', requiresValues: [{ key: 'bond:varen', min: 2 }], setsFlags: { 'canon:c07_bond_death': true, c07_varen_dies: true }, adjustsValues: { bond_varen: -3, conviction_compassion: 1 }, result: 'Varen walks the death gate. His name pays the price the wall cannot. The wall holds the night; Varen does not.', resultEs: 'Varen camina la puerta de la muerte. Su nombre paga el precio que el muro no puede. El muro resiste la noche; Varen, no.' },
      { id: 'c07_no_death', label: 'Let the watchman live — the wall holds on its own', labelEs: 'Dejar que el vigilante viva — el muro resiste solo', nextNodeId: 'c07_final_choice', setsFlags: { 'canon:c07_watchman_living': true }, adjustsValues: { conviction_freedom: 1 }, result: 'No one walks the death gate. The watchman lives. The wall must hold the night alone.', resultEs: 'Nadie camina la puerta de la muerte. El vigilante vive. El muro debe resistir la noche solo.' },
    ],
  },

  c07_final_choice: {
    id: 'c07_final_choice', kind: 'beat', locationId: 'c07_naming_wall',
    title: 'The Wall and the Night', titleEs: 'El muro y la noche',
    text: 'The night is here and the death gate is settled. The wall stands or it does not, the Claim is broken or it is not, and the allies are gathered or they are not. Four outcomes close the siege: the wall holds, the wall wins, the wall breaks, or the wall is riven — split between the names that held and the names that did not. "Choose," the assembly says. "The morning will count what the night leaves."',
    textEs: 'La noche está aquí y la puerta de la muerte está resuelta. El muro se sostiene o no, la Reclamación está rota o no, y los aliados están reunidos o no. Cuatro desenlaces cierran el asedio: el muro resiste, el muro vence, el muro cede, o el muro se raja — dividido entre los nombres que sostuvieron y los que no. —Elige —dice la asamblea—. El amanecer contará lo que la noche deje.',
    choices: [
      { id: 'c07_hold_wall', label: 'Hold the wall — the night passes and the names survive', labelEs: 'Resistir el muro — la noche pasa y los nombres sobreviven', nextNodeId: 'c07_ending_held', setsFlags: { 'canon:c07_wall_held': true }, adjustsValues: { faction_free_witnesses: 1, conviction_duty: 1 }, result: 'The wall holds. The night passes. The names survive.', resultEs: 'El muro resiste. La noche pasa. Los nombres sobreviven.' },
      { id: 'c07_win_wall', label: 'Win the wall — drive the Claim back and take the waste', labelEs: 'Vencer el muro — hacer retroceder a la Reclamación y tomar el erial', nextNodeId: 'c07_ending_won', setsFlags: { 'canon:c07_wall_won': true }, adjustsValues: { faction_free_witnesses: 2, conviction_truth: 1 }, result: 'The wall wins. The Claim is driven back. The waste is yours.', resultEs: 'El muro vence. La Reclamación retrocede. El erial es tuyo.' },
      { id: 'c07_break_wall', label: 'Let the wall break — the names scatter and the night passes', labelEs: 'Dejar que el muro ceda — los nombres se esparcen y la noche pasa', nextNodeId: 'c07_ending_broken', setsFlags: { 'canon:c07_wall_broken': true }, adjustsValues: { conviction_freedom: 1 }, result: 'The wall breaks. The names scatter. The night passes over the ruins.', resultEs: 'El muro cede. Los nombres se esparcen. La noche pasa sobre las ruinas.' },
      { id: 'c07_rive_wall', label: 'Rive the wall — split the names that held from the names that did not', labelEs: 'Rajar el muro — dividir los nombres que resistieron de los que no', nextNodeId: 'c07_ending_riven', setsFlags: { 'canon:c07_wall_riven': true }, adjustsValues: { conviction_truth: 1 }, result: 'The wall rives. The names that held stand apart from the names that did not.', resultEs: 'El muro se raja. Los nombres que resistieron se separan de los que no.' },
    ],
  },

  c07_ending_held: {
    id: 'c07_ending_held', kind: 'ending', terminal: true, choices: [],
    title: 'Held', titleEs: 'Resistido',
    text: 'The wall holds the night. The names survive, the assembly keeps the standard, and the free witnesses stand on the wall at dawn. The Claim broke on the names and the morning counts what the night leaves: a wall, a standard, and the living who carried it. The roads home are open, and the names are still yours.',
    textEs: 'El muro resiste la noche. Los nombres sobreviven, la asamblea guarda el estandarte, y los testigos libres se mantienen en el muro al amanecer. La Reclamación se rompió contra los nombres y el amanecer cuenta lo que la noche deja: un muro, un estandarte, y los vivos que lo llevaron. Los caminos a casa están abiertos, y los nombres siguen siendo tuyos.',
    outcome: 'success', survivors: ['c07_wall_witness'], casualties: [],
  },

  c07_ending_won: {
    id: 'c07_ending_won', kind: 'ending', terminal: true, choices: [],
    title: 'Won', titleEs: 'Vencido',
    text: 'The wall wins the night. The Claim is driven back into the waste and the name-collectors scatter into the salt. The free witnesses take the waste and the roads beyond it, and the wall stands behind them — not a defense but a standard. The morning counts a victory, and the names that won it are still alive.',
    textEs: 'El muro vence la noche. La Reclamación es rechazada hacia el erial y los cobradores de nombres se esparcen en la sal. Los testigos libres toman el erial y los caminos más allá, y el muro se alza detrás — no una defensa sino un estandarte. El amanecer cuenta una victoria, y los nombres que la ganaron siguen vivos.',
    outcome: 'success', survivors: ['c07_wall_witness'], casualties: [],
  },

  c07_ending_broken: {
    id: 'c07_ending_broken', kind: 'ending', terminal: true, choices: [],
    title: 'Broken', titleEs: 'Roto',
    text: 'The wall breaks. The names scatter into the salt waste and the night passes over the ruins. The assembly disperses and the free witnesses carry what names they can. The Claim took the wall but not the names — they are free now, scattered and unheld. The morning counts a ruin and a freedom that cost more than it should have.',
    textEs: 'El muro cede. Los nombres se esparcen por el erial de sal y la noche pasa sobre las ruinas. La asamblea se dispersa y los testigos libres llevan los nombres que pueden. La Reclamación tomó el muro pero no los nombres — están libres ahora, esparcidos y sin guardián. El amanecer cuenta una ruina y una libertad que costó más de lo que debía.',
    outcome: 'ambiguous', survivors: ['c07_wall_witness'], casualties: [],
  },

  c07_ending_riven: {
    id: 'c07_ending_riven', kind: 'ending', terminal: true, choices: [],
    title: 'Riven', titleEs: 'Rajado',
    text: 'The wall rives — split between the names that held and the names that did not. The assembly is divided: the names that held stand on one side of the crack, and the names that did not stand on the other. The morning counts two walls where there was one, and two assemblies where there was one. The night passed, but the wall did not survive it whole.',
    textEs: 'El muro se raja — dividido entre los nombres que resistieron y los que no. La asamblea está dividida: los nombres que resistieron se mantienen de un lado de la grieta, y los que no del otro. El amanecer cuenta dos muros donde había uno, y dos asambleas donde había una. La noche pasó, pero el muro no la sobrevivió entero.',
    outcome: 'ambiguous', survivors: ['c07_wall_witness'], casualties: [],
  },
};

// ---- World ---------------------------------------------------

const LOCATIONS: Record<string, WorldLocation> = {
  c07_salt_waste: {
    id: 'c07_salt_waste', name: 'The Salt Waste', nameEs: 'El erial de sal',
    description: 'A flat waste of salt where the roads cross. The name-collectors come from the horizon and the Naming Wall stands at the edge.',
    descriptionEs: 'Un erial plano de sal donde los caminos se cruzan. Los cobradores de nombres vienen del horizonte y la Muralla de los Nombres se alza en el borde.',
    connections: ['c07_naming_wall'],
    objects: [{ id: 'c07_horizon', name: 'The Horizon', nameEs: 'El horizonte', description: 'The chain of name-collectors is visible on the horizon, the Claim at its head.', descriptionEs: 'La cadena de cobradores de nombres es visible en el horizonte, la Reclamación a su cabeza.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 2, discovered: true, secrets: [], ambiance: 'outdoor',
  },
  c07_naming_wall: {
    id: 'c07_naming_wall', name: 'The Naming Wall', nameEs: 'La Muralla de los Nombres',
    description: 'A wall of salt-crusted stones, each one carved with a name. The wall is half-built and the night is coming.',
    descriptionEs: 'Un muro de piedras incrustadas de sal, cada una tallada con un nombre. El muro está medio construido y la noche viene.',
    connections: ['c07_salt_waste', 'c07_assembly', 'c07_breach'],
    objects: [{ id: 'c07_wall_stones', name: 'The Wall Stones', nameEs: 'Las piedras del muro', description: 'Stones carved with names — each name a defender, each defender a section of the wall.', descriptionEs: 'Piedras talladas con nombres — cada nombre un defensor, cada defensor una sección del muro.', interactable: true, broken: false, hidden: false }],
    npcs: ['c07_wall_witness'], enemies: ['c07_the_claim'], dangerLevel: 4, discovered: true, secrets: [], ambiance: 'battle',
  },
  c07_assembly: {
    id: 'c07_assembly', name: 'The Assembly', nameEs: 'La asamblea',
    description: 'A gathering of allies behind the wall. The free witnesses count the collectors from the roof.',
    descriptionEs: 'Una reunión de aliados detrás del muro. Los testigos libres cuentan los cobradores desde el techo.',
    connections: ['c07_naming_wall'],
    objects: [{ id: 'c07_assembly_roof', name: 'The Assembly Roof', nameEs: 'El techo de la asamblea', description: 'A roof open to the waste where the free witnesses count the collectors.', descriptionEs: 'Un techo abierto al erial donde los testigos libres cuentan los cobradores.', interactable: true, broken: false, hidden: false }],
    npcs: [], enemies: [], dangerLevel: 1, discovered: true, secrets: [], ambiance: 'town',
  },
  c07_breach: {
    id: 'c07_breach', name: 'The Breach', nameEs: 'La brecha',
    description: 'The gap in the wall where the Claim will come. The night is here and the ram is at the gate.',
    descriptionEs: 'El hueco en el muro por donde vendrá la Reclamación. La noche está aquí y el ariete está en la puerta.',
    connections: ['c07_naming_wall'],
    objects: [{ id: 'c07_breach_gap', name: 'The Breach Gap', nameEs: 'El hueco de la brecha', description: 'The open gap where the wall has not been raised. The Claim comes through here.', descriptionEs: 'El hueco abierto donde el muro no se ha alzado. La Reclamación viene por aquí.', interactable: true, broken: true, hidden: false }],
    npcs: [], enemies: ['c07_the_claim'], dangerLevel: 5, discovered: true, secrets: [], ambiance: 'battle',
  },
};

const NPCS: Record<string, NPC> = {
  c07_wall_witness: {
    id: 'c07_wall_witness', name: 'The Wall-Witness', nameEs: 'El testigo del muro', portrait: 'villager', faction: 'free_witnesses', location: 'c07_naming_wall', disposition: 20,
    knowledge: ['the_wall', 'the_claim', 'the_death_gate'],
    memory: [], inventory: [],
    dialogue: [
      { id: 'greeting', text: 'The wall-witness touches the stone with her name on it. "I am the wall," she says. "My name is the base. Lift it first, and the wall follows. The night is coming — choose fast."', textEs: 'El testigo del muro toca la piedra con su nombre. «Yo soy el muro —dice—. Mi nombre es la base. Alza primero, y el muro sigue. La noche viene — elige rápido».', responses: [{ text: 'I will lift it.', textEs: 'La alzaré.', nextNodeId: 'end' }] },
    ],
    alive: true, occupation: 'Wall-Witness', occupationEs: 'Testigo del muro', secrets: [], secretsEs: [], personality: 'resolute', personalityEs: 'resuelta',
  },
};

const MONSTERS: Record<string, Omit<Enemy, 'id'>> = {
  c07_the_claim: {
    templateId: 'c07_the_claim', name: 'The Claim', nameEs: 'La Reclamación', portrait: 'golem', hp: 30, maxHp: 30, ac: 16, attack: 8, damage: '2d10', damageType: 'bludgeoning', abilities: ['Chain of Gates', 'Ram of Names', 'Salt-Walk'], abilitiesEs: ['Cadena de puertas', 'Ariete de nombres', 'Marcha de sal'], xpValue: 300, loot: [], intelligence: 6, morale: 100, conditions: [],
  },
};

const QUESTS: Record<string, Quest> = {
  c07_the_siege: {
    id: 'c07_the_siege', name: 'The Siege of Names', nameEs: 'El asedio de los nombres', description: 'Hold the Naming Wall against the Claim and survive the night.', descriptionEs: 'Resiste la Muralla de los Nombres contra la Reclamación y sobrevive la noche.', state: 'active', isMain: true, faction: 'free_witnesses',
    objectives: [
      { id: 'c07_choose_standard', description: 'Choose who carries the standard', descriptionEs: 'Elegir quién lleva el estandarte', completed: false, current: 0, required: 1 },
      { id: 'c07_survive_night', description: 'Survive the night', descriptionEs: 'Sobrevivir la noche', completed: false, current: 0, required: 1 },
    ],
    rewards: [{ type: 'xp', value: 300 }],
  },
};

export const CHAPTER_SEVEN: Chapter = {
  id: 'chapter-07', index: 7,
  title: 'The Siege of Names', titleEs: 'El asedio de los nombres',
  premise: 'When the roads cross the salt waste, name-collectors no one can fight come for every name this campaign has carried; the only wall that can outlast the night is the one built from allies.',
  premiseEs: 'Cuando los caminos se cruzan sobre el erial de sal, llegan los cobradores de nombres que nadie puede combatir; la única muralla que puede resistir la noche es la erigida con aliados.',
  intro: [
    { type: 'system', text: 'CHAPTER VII — THE SIEGE OF NAMES', textEs: 'CAPÍTULO VII — EL ASEDIO DE LOS NOMBRES', mood: 'danger' },
    { type: 'narration', text: '{name} comes to the salt waste where the roads cross and the name-collectors are coming. The Naming Wall stands at the edge of the waste — a wall of names, half-built, and the night is here. The Claim is the ram through a chain of gates, and the death gate carries the death option of one bond. The only wall that can outlast the night is the one built from allies.', textEs: '{name} llega al erial de sal donde los caminos se cruzan y los cobradores de nombres vienen. La Muralla de los Nombres se alza en el borde del erial — un muro de nombres, medio construido, y la noche está aquí. La Reclamación es el ariete a través de una cadena de puertas, y la puerta de la muerte lleva la opción de muerte de un vínculo. La única muralla que puede resistir la noche es la erigida con aliados.', mood: 'danger' },
    { type: 'system', text: 'CURRENT OBJECTIVE — Choose a standard, raise the wall, and survive the night.', textEs: 'OBJETIVO ACTUAL — Elige un estandarte, alza el muro y sobrevive la noche.', mood: 'neutral' },
  ],
  startNodeId: 'c07_arrival', startLocationId: 'c07_salt_waste',
  nodes: NODES,
  puzzles: { c07_wall_lift: WALL_LIFT, c07_creditor_check: CREDITOR_CHECK },
  locations: LOCATIONS, npcs: NPCS, monsters: MONSTERS, quests: QUESTS,
  mainQuestId: 'c07_the_siege',
  hooks: { bossLocationId: 'c07_breach', aftermathNodeId: 'c07_claim_aftermath' },
  storyFacts: [
    { flag: 'c07_elara_leads', en: 'Elara carries the standard', es: 'Elara lleva el estandarte' },
    { flag: 'c07_varen_leads', en: 'Varen carries the standard', es: 'Varen lleva el estandarte' },
    { flag: 'c07_party_leads', en: 'The party carries the standard', es: 'El grupo lleva el estandarte' },
    { flag: 'c07_wall_built', en: 'The wall was lifted in the right order', es: 'El muro se alzó en el orden correcto' },
    { flag: 'c07_creditors_counted', en: 'The creditors were counted', es: 'Los acreedores fueron contados' },
    { flag: 'c07_claim_faced', en: 'The Claim was fought in the breach', es: 'La Reclamación fue combatida en la brecha' },
    { flag: 'c07_elara_dies', en: 'Elara walked the death gate', es: 'Elara caminó la puerta de la muerte' },
    { flag: 'c07_varen_dies', en: 'Varen walked the death gate', es: 'Varen caminó la puerta de la muerte' },
  ],
  suggestions: {
    c07_salt_waste: [{ label: 'Go to the Naming Wall', labelEs: 'Ir a la Muralla de los Nombres', action: 'go to the naming wall' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c07_naming_wall: [
      { label: 'Return to the salt waste', labelEs: 'Volver al erial de sal', action: 'go to the salt waste' },
      { label: 'Go to the assembly', labelEs: 'Ir a la asamblea', action: 'go to the assembly' },
      { label: 'Go to the breach', labelEs: 'Ir a la brecha', action: 'go to the breach' },
      { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' },
    ],
    c07_assembly: [{ label: 'Return to the wall', labelEs: 'Volver al muro', action: 'go to the naming wall' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
    c07_breach: [{ label: 'Return to the wall', labelEs: 'Volver al muro', action: 'go to the naming wall' }, { label: 'Look around', labelEs: 'Mirar a los alrededores', action: 'look around' }],
  },
  externalEntrySeeds: {
    c07_claim_aftermath: [{ c07_party_leads: true }],
    c07_arrival: [{ 'canon:c02_map_shared': true, 'canon:c06_vault_opened': true, 'canon:c06_vault_mastered': true, 'canon:c06_vault_stranded': true, 'canon:c06_vault_drawn': true }],
  },
  summaryFlags: [
    'canon:c07_wall_held', 'canon:c07_wall_won', 'canon:c07_wall_broken', 'canon:c07_wall_riven',
    'canon:c07_watchman_living', 'canon:c07_bond_death',
  ],
};
