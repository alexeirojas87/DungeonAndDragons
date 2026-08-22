# Chapter V — The Iron Parliament · *El parlamento de hierro*

> Act II. An exploded vault has scattered its receipts across the
> plaza, proving all oath-magic flows through a single continental
> register. The Iron Parliament must decide: ban it, own it, or
> place the law beside it. Four endings close the vote.
>
> *Acto II. Un depósito reventado esparció sus recibos por la
> plaza; se ha demostrado que la magia del juramento pasa por un
> registro continental, y el Parlamento de Hierro debe decidir:
> prohibirlo, poseerlo o hacer la ley a su lado. Cuatro desenlaces
> cierran la votación.*

## Premise · Premisa

**EN:** An exploded vault has scattered its receipts across the plaza,
proving all oath-magic flows through a single continental register. The
Iron Parliament must decide to ban it, own it, or place the law beside it.

**ES:** Un depósito reventado esparció sus recibos por la plaza; se ha
demostrado que la magia del juramento pasa por un registro continental, y
el Parlamento de Hierro debe decidir: prohibirlo, poseerlo o hacer la ley
a su lado.

**Dramatic question · Pregunta dramática:** does the law become the
witness, or the vault? · *¿La ley se vuelve el testigo, o el depósito?*

## Arc · Arco

1. **Opening · Apertura:** the vault explodes in the night; the
   receipts prove the continental register is cracking; the Iron
   Parliament convenes in emergency session.
2. **The first seat · El primer asiento:** boycott the vote, take the
   floor, or hand the list to the people through Voss.
3. **Branches · Ramas (≥3):** the public floor (the teller roll), the
   vault (the chamber locks), Voss's office (the people file).
4. **Midpoint reversal · Reverso:** the teller roll and the chamber
   both prove the register holds every name without consent — Voss's
   file confirms it.
5. **Climax · Clímax:** the masked collector blocks the aisle; the
   vote: govern, strangle, free, or stalemate.
6. **Endings · Desenlaces (4):** `c05_ending_registry`,
   `c05_ending_strangled`, `c05_ending_free`, `c05_ending_stalemate`.

## Node table · Tabla de nodos

| ID | Beat (EN / ES) | Outgoing choices | Consumes |
|---|---|---|---|
| `c05_arrival` | The Exploded Vault / El depósito reventado | `c05_arrival_with_map` (canon:c02_map_shared), `c05_arrival_open` | — |
| `c05_parliament_floor` | The Parliament Floor / La sala del parlamento | `c05_floor_to_voss` | — |
| `c05_registrar_seat` | The Registrar Seat / El asiento del registrador | `c05_seat_to_first` | — |
| `c05_first_seat` | The First Seat / El primer asiento | `c05_boycott`, `c05_take_floor`, `c05_hand_list` | — |
| `c05_floor_open` | The Public Floor / La planta pública | `c05_floor_to_witness`, `c05_floor_back` | choice_boycott |
| `c05_floor_witness` | The Witness on the Floor / El testigo | `c05_witness_to_teller`, `c05_witness_back` | — |
| `c05_teller_roll_node` | The Teller Roll / El rollo del contador | `c05_teller_open`, `c05_teller_back` | — |
| `c05_teller_puzzle` | The Teller Roll (puzzle) / El rollo | — | — |
| `c05_teller_read` | The Roll Read / El rollo leído | `c05_teller_to_assembly` | teller_read |
| `c05_teller_skipped` | The Roll Unread / El rollo sin leer | `c05_teller_skip_to_assembly` | — |
| `c05_vault_door` | The Vault Door / La puerta del depósito | `c05_vault_to_receipts`, `c05_vault_back` | choice_floor |
| `c05_vault_receipts` | The Scattered Receipts / Los recibos | `c05_receipts_with_ledger` (canon:c02_evidence_ledger), `c05_receipts_without`, `c05_receipts_back` | — |
| `c05_chamber_puzzle` | The Chamber Locks (puzzle) / Los cerrojos | — | — |
| `c05_chamber_unlocked` | The Chamber Opens / La cámara se abre | `c05_chamber_to_assembly` | chamber_open |
| `c05_chamber_locked` | The Chamber Stays Shut / La cámara cerrada | `c05_chamber_skip_to_assembly` | — |
| `c05_voss_office` | Voss's Office / El despacho de Voss | `c05_office_to_truth`, `c05_office_back` | choice_hand |
| `c05_voss_truth` | Voss's Truth / La verdad de Voss | `c05_truth_to_file` | — |
| `c05_voss_file` | The File / El expediente | `c05_file_take`, `c05_file_back` | — |
| `c05_assembly` | The Assembly / La asamblea | `c05_assembly_to_collector`, `c05_assembly_to_vote` | — |
| `c05_collector_approach` | The Masked Collector / El cobrador | `c05_face_collector`, `c05_ward_with_name` (canon:c04_name_returned), `c05_ward_with_free_name` (canon:c04_name_free), `c05_evade_collector` | — |
| `c05_collector_aftermath` | The Collector Down (external entry) / El cobrador caído | `c05_collector_to_vote` | collector_faced |
| `c05_vote` | The Vote / La votación | `c05_vote_registry`, `c05_vote_strangle`, `c05_vote_free`, `c05_vote_stalemate` | — |
| `c05_ending_registry` | Governed (terminal) / Gobernado | — | registry_governed |
| `c05_ending_strangled` | Strangled (terminal) / Estrangulado | — | registry_governed |
| `c05_ending_free` | Freed (terminal) / Liberado | — | registry_free |
| `c05_ending_stalemate` | Stalemate (terminal) / Empate | — | — |

## Puzzles · Puzles (2)

### `c05_chamber_locks` — mechanism (ordered) · mecanismo (ordenado)

- **Prompt:** three locks hold the vault chamber, turned in the order
  the receipts were filed. · *Tres cerrojos sostienen la cámara, en el
  orden en que se archivaron los recibos.*
- **Steps (ordered):** `c05_lock_receipt` → `c05_lock_register` →
  `c05_lock_seal` (receipt, register, seal — the order the register
  enforces).
- **Clues:** (1) the receipt-lock is the thinnest; (2) the register-lock
  names who owes; (3) the seal-lock is the thickest.
- **Unlocks:** `c05_chamber_open`. Solves to `c05_chamber_unlocked`;
  skip to `c05_chamber_locked`.
- **Accessibility fallback:** the skip leaves the chamber sealed; the
  receipts on the floor are enough for a vote without the register.

### `c05_teller_roll` — check · comprobación

- **Prompt:** the teller roll proves every oath-magic transaction
  flows through one register. Read it properly. · *El rollo del
  contador prueba que toda transacción pasa por un registro.*
- **Skill:** investigation, DC 14.
- **Clues:** (1) the dates cluster at the solstices (dc −2); (2) every
  receipt names the continental register as the vessel (dc −3).
- **Unlocks:** `c05_teller_read`. Solves to `c05_teller_read`; skip to
  `c05_teller_skipped`.
- **Accessibility fallback:** the skip leaves the roll unread; the
  parliament votes on air if nothing else is brought.

## Encounters · Encuentros

- **Non-combat resolution (primary):** the whole arc is procedural — a
  proclamation chain. Evidence is gathered from the public floor
  (teller roll), the vault (chamber locks), or Voss's office (the
  file), then brought to the vote.
- **Combat (optional):** the masked collector (`c05_masked_collector`)
  in the plaza. Avoidable via the name ward (`canon:c04_name_returned`
  or `canon:c04_name_free`) or by evasion. On victory the boss-aftermath
  hook carries the player to `c05_collector_aftermath`.

## Consequences · Consecuencias

### New facts (local) · Hechos nuevos (locales)
- `c05_choice_boycott` / `c05_choice_floor` / `c05_choice_hand` — the
  first seat chosen.
- `c05_chamber_open` — the chamber locks were turned in the right order.
- `c05_teller_read` — the teller roll was read.
- `c05_ledger_crossed` — the receipts were cross-referenced with the
  cargo ledger.
- `c05_voss_file_taken` — the party took the file.
- `c05_collector_faced` — the masked collector was fought.

### Campaign outputs (carried forward) · Salidas
- `canon:c05_registry_governed` (registry/strangled ending) — the
  register is governed by law. Consumed by Ch8, Ch10.
- `canon:c05_registry_free` (free ending) — the register is free.
  Consumed by Ch8, Ch10.
- `canon:c05_voss_file` — Voss's dossier. Consumed by Ch8, Ch10 (V1).
- `canon:c05_evidence_register` — evidence flag 4 of 5, consumed by
  Ch8.

### Setup/payoff links · Vínculos
- **Consumes from earlier chapters:** `canon:c02_map_shared` (the map
  shows the side entrance); `canon:c02_evidence_ledger` (the cargo
  ledger decodes the receipts); `canon:c04_name_returned` /
  `canon:c04_name_free` (the name wards the collector).
- **Produces for later chapters:** the two registry-outcome keys feed
  Ch8's evidence count and Ch10's selector routes (N1/N2, R1/R2, U2);
  `c05_voss_file` feeds Ch8's prosecution.

### Bond / faction / conviction changes · Cambios
- `bond:voss` (set here, consumed Ch8 & Ch10); `faction:iron_parliament`
  (set here); `conviction:truth` / `conviction:freedom` /
  `conviction:duty` nudged by the first seat and the vote.

## Oath witness / vessel / price · Testigo / vasija / precio

| Event | Witness | Vessel | Price |
|---|---|---|---|
| the parliamentary pledge | the assembled chamber | the steel register | the assembly's enforcement of the law |

Walking out blinds the institution's witness; the Ch9 door has no law
to lean on.

## Inputs / Outputs (compact) · Entradas / Salidas

- **Inputs consumed:** `canon:c02_map_shared` (Ch2), `canon:c02_evidence_ledger`
  (Ch2), `canon:c04_name_returned` / `canon:c04_name_free` (Ch4).
- **Outputs guaranteed:** exactly one of `canon:c05_registry_governed` /
  `canon:c05_registry_free`; `canon:c05_voss_file`;
  `canon:c05_evidence_register`; `bond:voss`; `faction:iron_parliament`.

## Translation review · Revisión de traducción

- Both languages are source; Spanish addresses the player as *tú*.
- Locked terms respected: *the Iron Parliament* / *el Parlamento de
  Hierro*; *Registrar Voss* / *el Registrador Voss*.
- Idiom: "the parliament votes on air" rendered as *el parlamento vota
  sobre el aire* — meaning a vote with no evidence, both languages
  use the same metaphor of emptiness.
