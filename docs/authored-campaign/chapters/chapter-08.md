# Chapter VIII — The Court of Broken Oaths · *La corte de los juramentos incumplidos*

> Act III opener. The old compact behind every door and song in Syrva has
> reached its last day; in the Veiled Court the party must prosecute it,
> defend it, or dissolve it, using every piece of evidence the campaign has
> earned. Four verdicts close the court.
>
> *Apertura del Acto III. El antiguo pacto que sostiene las puertas y las
> canciones de Sirva ha llegado a su último día; en la Corte del Velo el
> grupo debe acusarlo, defenderlo o disolverlo con las pruebas que toda la
> campaña ha reunido. Cuatro veredictos cierran la corte.*

## Premise · Premisa

**EN:** The old compact that holds doors and songs in balance has reached its
last day; in the Veiled Court you must prosecute it, defend it, or dissolve it,
using every piece of evidence the campaign has earned.

**ES:** El antiguo pacto que sostiene las puertas y las canciones ha llegado a su
último día; en la sala de la Corte del Velo debes acusarlo, defenderlo o
disolverlo, con las pruebas que toda la campaña ha reunido.

**Dramatic question · Pregunta dramática:** did the pact save the door or break
it — and what must the pact become? · *¿El pacto salvó la puerta o la rompió
— y en qué debe convertirse?*

## Arc · Arco

1. **Opening · Apertura:** the Veiled Court convenes at the turn of the tide;
   the chamber is full of the people the pact kept alive, and the court will hear
   one charge today, and one only.
2. **Charge · Acusación:** the first irreversible choice — prosecute the pact
   (it broke the door it swore to keep), defend it (it held a world together),
   or press for dissolution (let every door answer for itself).
3. **Branches · Ramas (≥3):** the witness stand (a testimony basin that records
   a voice once), the record vault (the vow-riddle in the second ink), the old
   seal-room (the three-bolt mechanism), the dead-grant chamber (an oath-bound
   killer heard by ritual or by steel).
4. **Midpoint reversal · Reverso:** the vow decoded reveals the pact made the
   door the witness and the seal the vessel — the very thing the prosecution and
   the defense both need.
5. **Climax · Clímax:** the court called to vote; the charge, the seal, and the
   evidence decide which verdict the court can reach.
6. **Endings · Desenlaces (4):** `c08_ending_vindicated`, `c08_ending_reform`,
   `c08_ending_dissolved`, `c08_ending_hung`.

## Node table · Tabla de nodos

| ID | Beat (EN / ES) | Outgoing choices | Consumes |
|---|---|---|---|
| `c08_arrival` | The Last Day of the Pact / El último día del pacto | `c08_pray_prosecute`, `c08_pray_defend`, `c08_pray_dissolve` | — |
| `c08_prosecution_open` | The Prosecution Opens / La acusación se abre | `c08_prosecution_to_assembly` | charge |
| `c08_defense_open` | The Defense Opens / La defensa se abre | `c08_defense_to_assembly` | charge |
| `c08_dissolution_open` | Dissolution Opens / La disolución se abre | `c08_dissolution_to_assembly` | charge |
| `c08_assembly` | The Assembled Chamber / La cámara reunida | `c08_to_witness`, `c08_to_vault`, `c08_to_seal`, `c08_to_grant`, `c08_to_threshold` (evidence_any) | charge |
| `c08_witness_stand` | The Witness Stand / El estrado de testigos | `c08_hear_testimony`, `c08_witness_back` | — |
| `c08_witness_testimony` | A Voice Read into the Record / Una voz leída en el acta | `c08_raise_objection`, `c08_testimony_back` | — |
| `c08_witness_oath` | The Objection of the Broken Vow / La objeción del voto roto | `c08_oath_back` | objection |
| `c08_record_vault` | The Record Vault / El archivo de actas | `c08_open_puzzle_vow`, `c08_vault_back` | — |
| `c08_puzzle_vow` | The Riddle of the Vow (puzzle) / El enigma del voto | — | — |
| `c08_vow_decoded` | The Vow Decoded / El voto descifrado | `c08_examine_old_seal`, `c08_vow_decoded_back` | evidence_record |
| `c08_old_seal_seen` | The Old Seal, At Rest / El sello antiguo, en reposo | `c08_old_seal_back` | old_seal_seen |
| `c08_vow_abandoned` | The Vow Left Locked / El voto dejado cerrado | `c08_vow_abandoned_back` | — |
| `c08_seal_room` | The Old Seal-Room / La sala del sello antiguo | `c08_open_puzzle_seal`, `c08_seal_back` | — |
| `c08_puzzle_seal` | The Old Seal (puzzle) / El sello antiguo | — | — |
| `c08_seal_aligned` | The Seal Aligned / El sello alineado | `c08_seal_aligned_back` | evidence_seal, seal_understood |
| `c08_seal_left` | The Seal Left Alone / El sello dejado en paz | `c08_seal_left_back` | — |
| `c08_dead_grant_intro` | The Dead Grant / La concesión de los muertos | `c08_perform_ritual`, `c08_grant_back` | — |
| `c08_dead_grant_resolved` | The Grant Heard (external entry) / La concesión oída | `c08_grant_resolved_back` | evidence_dead_grant |
| `c08_verdict_threshold` | The Court Called to Vote / La corte llamada a votar | `c08_to_vindicated`, `c08_to_reform`, `c08_to_dissolved`, `c08_to_hung` | evidence_any |
| `c08_ending_vindicated` | Vindicated (terminal) / Vindicada | — | charge_prosecute, witness, record, seal |
| `c08_ending_reform` | Reformed (terminal) / Reformado | — | charge_defend, witness, record, seal |
| `c08_ending_dissolved` | Dissolved (terminal) / Disuelto | — | charge_dissolve, seal_understood |
| `c08_ending_hung` | Hung (terminal) / Suspendida | — | — |

## Puzzles · Puzles (2)

### `c08_vow_riddle` — riddle · acertijo

- **Prompt:** A vow is read into the record. It binds without a chain, it breaks
  without a touch, and the court can only hear it once it has been broken. What
  is it? · *Un juramento se lee en el acta. Ata sin cadena, se rompe sin contacto,
  y la corte solo puede oírlo una vez que ha sido roto. ¿Qué es?*
- **Answers:** an oath / a vow (and bare forms). · *un juramento / un voto.*
- **Clues / hints:** (1) it is not a thing you can hold — it lives only while
  someone keeps speaking it; (2) every door in this campaign is one; (3) it
  names a witness, a vessel and a price, and it is the word itself.
- **Unlocks:** `c08_evidence_record`, `c08_evidence_any`. Solves to
  `c08_vow_decoded`; skip to `c08_vow_abandoned`.
- **Accessibility fallback:** the skip node keeps the chapter moving; the
  court can still reach a verdict (`c08_ending_hung`) without the record.

### `c08_seal_mechanism` — mechanism (ordered) · mecanismo (ordenado)

- **Prompt:** three bolts hold the old pact-seal, turned in one order only.
  Wrong order bites; right order reveals the pact. · *Tres cerrojos sostienen el
  sello del pacto, en un único orden.*
- **Steps (ordered):** `c08_bolt_witness` → `c08_bolt_vessel` → `c08_bolt_price`
  (witness, vessel, price — the order every oath is spoken).
- **Clues:** (1) the seal shows witness first, vessel second, price last; (2) the
  witness-bolt is an open eye, the vessel-bolt a bowl, the price-bolt a falling
  hand; (3) eye, then bowl, then falling hand — the seal goes quiet on the third.
- **Unlocks:** `c08_evidence_seal`, `c08_evidence_any`, `c08_seal_understood`.
  Solves to `c08_seal_aligned`; skip to `c08_seal_left`.
- **Accessibility fallback:** the skip leaves the seal shut; dissolution loses
  its cleanest door but `c08_ending_hung` remains reachable.

## Encounters · Encuentros

- **Non-combat resolution (primary):** the whole arc is procedural — the
  court-room rite. The dead-grant may be heard by ritual (`c08_perform_ritual`)
  without a blow.
- **Combat (optional):** the *Dead Grant* (`c08_dead_grant`, the oath-bound
  killer) in `c08_ritual_chamber` is reachable by navigation; on victory the
  engine's boss-aftermath hook carries the player to `c08_dead_grant_resolved`.
  It is never required to settle the chapter.

## Consequences · Consecuencias

### New facts (local) · Hechos nuevos (locales)
- `c08_charge_prosecute` / `c08_charge_defend` / `c08_charge_dissolve` — the
  charge chosen.
- `c08_evidence_witness` / `c08_evidence_record` / `c08_evidence_seal` /
  `c08_evidence_dead_grant` — four evidence tracks, each set by its branch.
- `c08_evidence_any` — at least one track brought (gates the verdict call).
- `c08_evidence_majority` — set on the vindicated/reform verdict (the triple
  witness + record + seal).
- `c08_seal_understood` — the seal was aligned (gates dissolution).
- `c08_objection_raised` — the broken-vow objection stands in the record.
- `c08_old_seal_seen` — the old seal was examined beside the vow.

### Campaign outputs (carried forward) · Salidas para capítulos posteriores
- `c08_verdict_reform`, `c08_verdict_vindicated`, `c08_verdict_dissolved`,
  `c08_verdict_hung` — exactly one verdict key, consumed by Chapter 10's selector.
- `c08_evidence_majority`, `c08_objection_raised`, `c08_seal_understood` —
  carried as `summaryFlags`; read by Chapter 9 and Chapter 10.

### Setup/payoff links · Vínculos de plantado / cobro
- **Consumes from earlier chapters:** the chapel second-ink (Ch1 ledger), the
  Drowned Door's black water (Ch1), and the Voss file (`bond:voss`, set in Act II).
  Where the prior-chapter `canon:cNN_*` facts are unavailable in this build,
  the chapter re-derives the evidence in-chapter so it is self-validatable.
- **Produces for later chapters:** the four verdict keys feed Chapter 10's
  six-ending selector (§6.2 of the global outline); `c08_evidence_majority`
  feeds Chapter 10's `court_restored` R2 route.

### Bond / faction / conviction changes · Cambios
- `bond:voss` ± (Voss backs the prosecution); `faction:veiled_court` (the court
  itself convenes); `faction:iron_parliament` (Voss's bench); convictions
  `truth` / `duty` / `freedom` / `compassion` nudged by the charge and the rite.

## Oath witness / vessel / price · Testigo / vasija / precio

Per §7 of the global outline, the court-oath's three named parts:

| Event | Witness | Vessel | Price |
|---|---|---|---|
| the court-oath | the trial and its witnesses | the old seal | the geography the pact binds |

Breaking the seal in open court turns every past broken vow into evidence.

## Inputs / Outputs (compact) · Entradas / Salidas

- **Inputs consumed:** Ch1 door/water/second-ink; `bond:voss` (Act II); the
  five evidence tracks (re-derived in-chapter in this build).
- **Outputs guaranteed:** exactly one of `c08_verdict_reform` /
  `c08_verdict_vindicated` / `c08_verdict_dissolved` / `c08_verdict_hung`;
  `c08_evidence_majority`; `c08_seal_understood`; `c08_objection_raised`.

## Translation review · Revisión de traducción

- Both languages are source; Spanish addresses the player as *tú*.
- Locked terms respected: *the Veiled Court* / *la Corte del Velo*; *the Dead
  Grant* / *la concesión de los muertos*; *witness, vessel, price* /
  *testigo, vasija, precio*; *the Drowned Door* / *la Puerta Ahogada*.
- Idiom: "the court takes the water" rendered as *la corte toma el agua* (the
  basin keeps the recorded voice) — a deliberate non-literal match of the
  English metaphor, both meaning the testimony is now on the record.
