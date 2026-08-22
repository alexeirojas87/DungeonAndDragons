# Chapter VII — The Siege of Names · *El asedio de los nombres*

> Act II finale. When the roads cross the salt waste, name-collectors
> no one can fight come for every name this campaign has carried.
> The only wall that can outlast the night is the one built from
> allies. The Claim is the ram through a chain of gates, and the
> death gate carries the death option of one bond. Four endings
> close the siege.
>
> *Cierre del Acto II. Cuando los caminos se cruzan sobre el erial de
> sal, llegan los cobradores de nombres que nadie puede combatir.
> La única muralla que puede resistir la noche es la erigida con
> aliados. La Reclamación es el ariete a través de una cadena de
> puertas, y la puerta de la muerte lleva la opción de muerte de
> un vínculo. Cuatro desenlaces cierran el asedio.*

## Premise · Premisa

**EN:** When the roads cross the salt waste, name-collectors no one can
fight come for every name this campaign has carried; the only wall that
can outlast the night is the one built from allies.

**ES:** Cuando los caminos se cruzan sobre el erial de sal, llegan los
cobradores de nombres que nadie puede combatir; la única muralla que puede
resistir la noche es la erigida con aliados.

**Dramatic question · Pregunta dramática:** who do you still owe — and
does that call come as a debt or as a defense? · *¿A quién debes aún — y
ese llamado llega como deuda o como defensa?*

## Arc · Arco

1. **Opening · Apertura:** the salt waste; the name-collectors on the
   horizon; the Naming Wall half-built at the edge.
2. **The first lead · El primer estandarte:** who carries the standard —
   Elara, Varen, or the party.
3. **Branches · Ramas (≥3):** the walls (the wall-lift mechanism), the
   assembly (the creditor count), the breach (the Claim combat).
4. **Midpoint reversal · Reverso:** the wall-lift and the creditor count
   both reveal that the opened Vault settled the coastline debts and the
   collectors are fewer.
5. **Climax · Clímax:** the death gate — Elara or Varen walks the room
   where one price can be paid; the final choice.
6. **Endings · Desenlaces (4):** `c07_ending_held`, `c07_ending_won`,
   `c07_ending_broken`, `c07_ending_riven`.

## Node table · Tabla de nodos

| ID | Beat (EN / ES) | Outgoing choices | Consumes |
|---|---|---|---|
| `c07_arrival` | The Salt Waste / El erial de sal | `c07_arrival_with_map` (canon:c02_map_shared), `c07_arrival_bare` | — |
| `c07_wall_gate` | The Naming Wall / La Muralla | `c07_gate_to_assembly` | — |
| `c07_assembly_call` | The Assembly Call / El llamado | `c07_assembly_to_first` | — |
| `c07_first_lead` | Who Carries the Standard / El estandarte | `c07_lead_elara` (bond:elara≥1), `c07_lead_varen` (bond:varen≥1), `c07_lead_party` | — |
| `c07_walls` | The Walls / Los muros | `c07_walls_to_witness`, `c07_walls_back` | elara_leads |
| `c07_wall_witness` | The Wall-Witness / El testigo | `c07_witness_to_lift`, `c07_witness_back` | — |
| `c07_wall_lift_node` | The Wall Lift / El alzamiento | `c07_lift_open`, `c07_lift_back` | — |
| `c07_wall_puzzle` | The Wall Lift (puzzle) / El alzamiento | — | — |
| `c07_wall_raised` | The Wall Raised / El muro alzado | `c07_raised_to_death` | wall_built |
| `c07_wall_lowered` | The Wall Left Low / El muro bajo | `c07_lowered_to_death` | — |
| `c07_assembly` | The Assembly / La asamblea | `c07_assembly_to_gather`, `c07_assembly_back` | varen_leads |
| `c07_assembly_gather` | The Gathering / La reunión | `c07_gather_to_creditor`, `c07_gather_back` | — |
| `c07_creditor_check_node` | The Creditor Count / El recuento | `c07_creditor_open`, `c07_creditor_back` | — |
| `c07_creditor_puzzle` | The Creditor Count (puzzle) / El recuento | — | — |
| `c07_creditor_counted` | The Collectors Counted / Contados | `c07_counted_to_death` | creditors_counted |
| `c07_creditor_skipped` | The Count Unmade / Sin contar | `c07_skipped_to_death` | — |
| `c07_breach` | The Breach / La brecha | `c07_breach_to_open`, `c07_breach_back` | party_leads |
| `c07_breach_open` | The Breach Open / La brecha abierta | `c07_breach_to_claim` | — |
| `c07_claim_approach` | The Claim / La Reclamación | `c07_face_claim`, `c07_hold_with_vault` (canon:c06_vault_opened), `c07_evade_claim` | — |
| `c07_claim_aftermath` | The Claim Broken (external entry) / Rota | `c07_claim_to_death` | claim_faced |
| `c07_death_gate` | The Death Gate / La puerta de la muerte | `c07_elara_walks` (bond:elara≥2), `c07_varen_walks` (bond:varen≥2), `c07_no_death` | — |
| `c07_final_choice` | The Wall and the Night / El muro y la noche | `c07_hold_wall`, `c07_win_wall`, `c07_break_wall`, `c07_rive_wall` | — |
| `c07_ending_held` | Held (terminal) / Resistido | — | wall_held |
| `c07_ending_won` | Won (terminal) / Vencido | — | wall_won |
| `c07_ending_broken` | Broken (terminal) / Roto | — | wall_broken |
| `c07_ending_riven` | Riven (terminal) / Rajado | — | wall_riven |

## Puzzles · Puzles (2)

### `c07_wall_lift` — mechanism (ordered) · mecanismo (ordenado)

- **Prompt:** three sections of the Naming Wall must be lifted: base,
  gate, crest. Wrong order buckles; right order holds. · *Tres secciones
  del muro deben alzarse: base, puerta, cresta.*
- **Steps (ordered):** `c07_lift_base` → `c07_lift_gate` →
  `c07_lift_crest` (base, gate, crest — foundation, door, height).
- **Clues:** (1) the base is the foundation; (2) the gate is what the
  Claim rams; (3) the crest is the height the wall needs for the night.
- **Unlocks:** `c07_wall_built`. Solves to `c07_wall_raised`; skip to
  `c07_wall_lowered`.
- **Accessibility fallback:** the skip leaves the wall half-built; the
  night passes but the wall does not hold everything.

### `c07_creditor_check` — check · comprobación

- **Prompt:** count the name-collectors on the horizon from the
  assembly roof. Read the chain. · *Cuenta los cobradores en el
  horizonte desde el techo de la asamblea.*
- **Skill:** insight, DC 14.
- **Clues:** (1) the collectors march in chains of three (dc −2); (2)
  if the Vault opened, the coastline debts settled and the collectors
  are fewer (dc −3).
- **Unlocks:** `c07_creditors_counted`. Solves to `c07_creditor_counted`;
  skip to `c07_creditor_skipped`.
- **Accessibility fallback:** the skip leaves the count undone; the
  wall holds what it holds regardless.

## Encounters · Encuentros

- **Non-combat resolution (primary):** the midnight truce — the
  wall-lift and the creditor count prepare the wall without combat; the
  death gate is the non-combat price (a bond walks so the wall holds).
  The Claim can be evaded entirely.
- **Combat (optional):** the Claim (`c07_the_claim`) in the breach —
  the ram through a chain of gates. On victory the boss-aftermath hook
  carries the player to `c07_claim_aftermath`. Avoidable by evasion or
  by holding the flank with the opened Vault (`canon:c06_vault_opened`).

## The Death Gate · La puerta de la muerte

This chapter carries the **death option of one bond**. Elara or Varen
(whichever bond is highest, ≥ 2) walks the room where one price can be
paid: a life for a name, a name for a wall. If one walks:
- `canon:c07_bond_death` is set (consumed by Ch8, Ch10).
- The wall holds the night; the bond ends.

If neither walks:
- `canon:c07_watchman_living` is set (consumed by Ch10 G1).
- The wall must hold the night on its own.

## Consequences · Consecuencias

### New facts (local) · Hechos nuevos (locales)
- `c07_elara_leads` / `c07_varen_leads` / `c07_party_leads` — the
  standard-bearer chosen.
- `c07_wall_built` — the wall was lifted in the right order.
- `c07_creditors_counted` — the collectors were counted.
- `c07_claim_faced` — the Claim was fought.
- `c07_elara_dies` / `c07_varen_dies` — a bond ended at the death gate.

### Campaign outputs (carried forward) · Salidas
- `canon:c07_wall_held` (held ending) — the wall held the night.
  Consumed by Ch8, Ch10 (G2, D1).
- `canon:c07_wall_won` (won ending) — the wall won and the Claim was
  driven back. Consumed by Ch8.
- `canon:c07_wall_broken` (broken ending) — the wall broke. Consumed by
  Ch8, Ch10 (V2, U2).
- `canon:c07_wall_riven` (riven ending) — the wall was riven. Consumed
  by Ch8.
- `canon:c07_watchman_living` — no death happened. Consumed by Ch10
  (G1).
- `canon:c07_bond_death` — a bond ended in death. Consumed by Ch8, Ch10.

### Setup/payoff links · Vínculos
- **Consumes from earlier chapters:** all bonds (`bond:elara`,
  `bond:varen`, `bond:olen`, `bond:sylva`, `bond:voss`); `canon:c02_map_shared`
  (the map road to the wall); `canon:c06_vault_opened` (the opened Vault
  settled the coastline debts, so the collectors are fewer and the flank
  holds).
- **Produces for later chapters:** the four wall-outcome keys feed Ch8's
  evidence and Ch10's selector (G2, D1, V2, U2);
  `canon:c07_watchman_living` feeds Ch10 G1; `canon:c07_bond_death`
  feeds Ch8 and Ch10.

### Bond / faction / conviction changes · Cambios
- `bond:elara` (−3 if she walks the death gate); `bond:varen` (−3 if he
  walks); `faction:free_witnesses` (set here, gathered); `conviction:
  compassion` nudged by the death gate; `conviction:duty` /
  `conviction:freedom` / `conviction:truth` nudged by the standard and
  the wall choice.

## Oath witness / vessel / price · Testigo / vasija / precio

| Event | Witness | Vessel | Price |
|---|---|---|---|
| the wall-oath | whoever stands before the wall | the standard | the defenders' names until the end |

Abandoning the breach splits the standard from the truth; Ch8 evidence
reads as forged.

## Inputs / Outputs (compact) · Entradas / Salidas

- **Inputs consumed:** all bonds; `canon:c02_map_shared` (Ch2);
  `canon:c06_vault_opened` (Ch6).
- **Outputs guaranteed:** exactly one of `canon:c07_wall_held` /
  `canon:c07_wall_won` / `canon:c07_wall_broken` /
  `canon:c07_wall_riven`; `canon:c07_watchman_living` (or
  `canon:c07_bond_death`); `faction:free_witnesses` (gathered).

## Translation review · Revisión de traducción

- Both languages are source; Spanish addresses the player as *tú*.
- Locked terms respected: *the Naming Wall* / *la Muralla de los
  Nombres*; *the Claim* / *la Reclamación*; *the Free Witnesses* / *los
  Testigos Libres*; *the Salt Waste* / *el erial de sal*.
- Idiom: "the wall is the names" rendered as *el muro son los nombres* —
  a deliberate personification in both languages, the wall being the
  collective names of its defenders.
- Idiom: "the death gate" / *la puerta de la muerte* — the same
  metaphor in both languages for the room where a life-price is paid.
