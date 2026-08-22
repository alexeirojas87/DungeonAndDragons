# Chapter IV — The Forest That Remembers Names · *El bosque que recuerda nombres*

> Act II opener. Beyond the last road a wood stores the names
> surrendered as an oath price. The Keepers of Names govern the
> register; to take a name back you must give another — one
> someone still holds. Four endings close the wood.
>
> *Apertura del Acto II. Más allá del último camino, un bosque
> guarda los nombres entregados como precio de juramento. Los
> Guardianes de los Nombres gobiernan el registro; para devolver
> un nombre hay que dar otro al que alguien todavía responda.
> Cuatro desenlaces cierran el bosque.*

## Premise · Premisa

**EN:** Beyond the last road a wood stores the names surrendered as
an oath price. The Keepers of Names govern the register; to take a
name back you must give another — one someone still holds.

**ES:** Más allá del último camino, un bosque guarda los nombres pagados
como precio de un juramento. Los Guardianes de los Nombres gobiernan el
registro, y para devolver un nombre hay que dar uno al que todavía alguien
responda.

**Dramatic question · Pregunta dramática:** which memory do you buy — and
who pays for the other half? · *¿Qué memoria compras — y quién paga la otra
mitad?*

## Arc · Arco

1. **Opening · Apertura:** the last road ends at the Forest That Remembers
   Names; Sylva, the moss-keeper, governs the register.
2. **The only rule · La única regla:** to take a name back you must give
   one that someone still holds — or break the rule.
3. **Branches · Ramas (≥3):** the Keeper's roundhouse (the root-grove
   where names are woven), the hoard-ditch (where hoarded names rot),
   the memory-cage (where untraded names wait).
4. **Midpoint reversal · Reverso:** the roots reveal the name of the
   Tenth Door; the breath riddle shapes it so the Hunger cannot bite.
5. **Climax · Clímax:** the Hunger that answers a well-shaped name;
   the name-choice: return it, free it, bind it, or burn the register.
6. **Endings · Desenlaces (4):** `c04_ending_recover`, `c04_ending_refuse`,
   `c04_ending_selfbound`, `c04_ending_burn`.

## Node table · Tabla de nodos

| ID | Beat (EN / ES) | Outgoing choices | Consumes |
|---|---|---|---|
| `c04_arrival` | The Last Road Ends / El último camino termina | `c04_enter_with_map` (canon:c02_map_shared), `c04_enter_bare` | — |
| `c04_roundhouse_gate` | The Keeper's Roundhouse / La casa redonda | `c04_gate_to_rule` | — |
| `c04_keeper_rule` | The Only Rule of Trade / La única regla | `c04_rule_to_first` | — |
| `c04_first_name` | The First Name / El primer nombre | `c04_give_name`, `c04_break_rule`, `c04_seek_cage` | — |
| `c04_roundhouse_trade` | The Trade Begins / El trueque comienza | `c04_trade_to_roots`, `c04_trade_back` | name_given |
| `c04_roots_puzzle` | The Roots Weave (puzzle) / El tejido de raíces | — | — |
| `c04_roots_woven` | The Name Shows Through / El nombre asoma | `c04_roots_to_advice` | roots_aligned |
| `c04_sylva_advice` | Sylva's Advice / El consejo de Sylva | `c04_advice_to_assembly` | — |
| `c04_roots_skipped` | The Roots Stay Tangled / Las raíces enredadas | `c04_skipped_to_assembly` | — |
| `c04_ditch_entry` | The Hoard-Ditch / La fosa | `c04_ditch_descend`, `c04_ditch_back` | rule_broken |
| `c04_ditch_depths` | The Depths of the Ditch / Lo profundo | `c04_depths_to_hoarder`, `c04_depths_to_assembly` | — |
| `c04_hoarder` | The Hoarder / El acopiador | `c04_hoarder_to_assembly` | — |
| `c04_cage_entry` | The Memory-Cage / La jaula de memoria | `c04_cage_enter`, `c04_cage_back` | cage_chosen |
| `c04_cage_inner` | Inside the Memory-Cage / Dentro de la jaula | `c04_cage_to_memory`, `c04_cage_to_assembly` | — |
| `c04_cage_memory` | The Memory in the Cage / El recuerdo | `c04_memory_to_assembly` | — |
| `c04_assembly` | The Clearing / El claro | `c04_to_breath`, `c04_to_seer`, `c04_to_hunger` | — |
| `c04_breath_puzzle` | The Riddle of Breath (puzzle) / El enigma del aliento | — | — |
| `c04_breath_solved` | The Breath Answers / El aliento responde | `c04_breath_to_choice` | breath_answered |
| `c04_breath_skipped` | The Riddle Unanswered / El enigma sin respuesta | `c04_breath_skip_to_choice` | — |
| `c04_moss_seer` | The Moss-Seer / La vidente del musgo | `c04_seer_to_choice` | — |
| `c04_hunger_call` | The Hunger Comes / El Hambre viene | `c04_face_hunger`, `c04_ward_with_relic` (canon:c01_relic_claimed), `c04_skip_hunger` | — |
| `c04_hunger_aftermath` | The Hunger Fed (external entry) / El Hambre saciado | `c04_aftermath_to_choice` | hunger_faced |
| `c04_name_choice` | The Name in Your Hands / El nombre en tus manos | `c04_recover_name`, `c04_refuse_trade`, `c04_self_bind`, `c04_burn_register` | — |
| `c04_ending_recover` | Recovered (terminal) / Recuperado | — | name_returned |
| `c04_ending_refuse` | Refused (terminal) / Rechazado | — | name_free |
| `c04_ending_selfbound` | Self-Bound (terminal) / Atado a uno mismo | — | selfbound |
| `c04_ending_burn` | Burned (terminal) / Quemado | — | name_free |

## Puzzles · Puzles (2)

### `c04_roots_weave` — mechanism (ordered) · mecanismo (ordenado)

- **Prompt:** three roots grow across the name-register, plaited in
  the right order. Wrong order twists them back; right order shows
  the name. · *Tres raíces crecen sobre el registro, trenzadas en el
  orden correcto.*
- **Steps (ordered):** `c04_root_oldest` → `c04_root_deepest` →
  `c04_root_named` (oldest, deepest, named — the order the name is
  held).
- **Clues:** (1) the oldest root goes first; (2) the deepest root
  goes second; (3) the named root goes last.
- **Unlocks:** `c04_roots_aligned`. Solves to `c04_roots_woven`; skip
  to `c04_roots_skipped`.
- **Accessibility fallback:** the skip node keeps the chapter
  moving; the name can still be found in the ditch or the cage.

### `c04_breath_riddle` — riddle · acertijo

- **Prompt:** what do the dead borrow and the living never lend? Name
  it, and the name speaks through your own mouth. · *¿Qué toman
  prestado los muertos y los vivos nunca prestan?*
- **Answers:** breath / a breath / the breath · *el aliento / aliento.*
- **Clues / hints:** (1) the dead borrow it to speak; (2) you are
  spending it now; (3) it is the first thing a name carries and the
  last thing a name costs.
- **Unlocks:** `c04_breath_answered`. Solves to `c04_breath_solved`;
  skip to `c04_breath_skipped`.
- **Accessibility fallback:** the skip leaves the name unshaped; the
  Hunger comes raw, and the relic can still ward it.

## Encounters · Encuentros

- **Non-combat resolution (primary):** the moss-seer rite — sit by the
  black well, breathe over it, and the name settles in your breath.
  `c04_moss_seer` and the breath riddle shape the name without combat.
- **Combat (optional):** the Hunger (`c04_hunger`, the shape that
  answers a well-shaped name) in `c04_hunger_lair`. On victory the
  boss-aftermath hook carries the player to `c04_hunger_aftermath`.
  Avoidable via the relic ward (`canon:c01_relic_claimed`) or by
  fleeing.

## Consequences · Consecuencias

### New facts (local) · Hechos nuevos (locales)
- `c04_name_given` / `c04_rule_broken` / `c04_cage_chosen` — the
  branch chosen at the first name.
- `c04_roots_aligned` — the roots were plaited in the right order.
- `c04_breath_answered` — the breath riddle was answered.
- `c04_hunger_faced` — the Hunger was fought.
- `c04_seer_held` — the moss-seer held the name.

### Campaign outputs (carried forward) · Salidas para capítulos posteriores
- `canon:c04_name_returned` (recover ending) — the name was returned to
  the register. Consumed by Ch8, Ch10 (R1).
- `canon:c04_name_free` (refuse/burn ending) — the name was freed.
  Consumed by Ch6, Ch10 (D2).
- `canon:c04_selfbound` (selfbound ending) — the player's own name
  bound as collateral. Consumed by Ch10 (V2).
- `canon:c04_evidence_name` — evidence flag 3 of 5, consumed by Ch8.

### Setup/payoff links · Vínculos de plantado / cobro
- **Consumes from earlier chapters:** `canon:c02_map_shared` (the
  map shows the old paths into the wood); `canon:c01_relic_claimed`
  (the relic wards the Hunger). Both change how quietly the party
  enters.
- **Produces for later chapters:** the three name-outcome keys
  (`c04_name_returned` / `c04_name_free` / `c04_selfbound`) feed
  Ch6 (the Vault opens only if the name was freed), Ch8 (the name
  evidence), and Ch10 (the selector routes).

### Bond / faction / conviction changes · Cambios
- `bond:sylva` (set here, consumed Ch8 & Ch10); `faction:keepers_of_names`
  (set here, consumed Ch8); `conviction:truth` nudged by the cage and
  the breath; `conviction:freedom` by the ditch and the burn;
  `conviction:duty` by the trade and the recover.

## Oath witness / vessel / price · Testigo / vasija / precio

Per §7 of the global outline, the name-rent's three named parts:

| Event | Witness | Vessel | Price |
|---|---|---|---|
| the name-rent | the moss and Sylva | the root-basket | one living name per recovered name |

Taking without giving: the moss records the theft and the name answers
wrongly.

## Inputs / Outputs (compact) · Entradas / Salidas

- **Inputs consumed:** `canon:c02_map_shared` (Ch2), `canon:c01_relic_claimed`
  (Ch1).
- **Outputs guaranteed:** exactly one of `canon:c04_name_returned` /
  `canon:c04_name_free` / `canon:c04_selfbound`; `canon:c04_evidence_name`;
  `bond:sylva`; `faction:keepers_of_names`; `conviction:truth`.

## Translation review · Revisión de traducción

- Both languages are source; Spanish addresses the player as *tú*.
- Locked terms respected: *the Forest That Remembers Names* / *el Bosque
  Que Recuerda Nombres*; *the Keepers of Names* / *los Guardianes de los
  Nombres*; *Sylva, the moss-keeper* / *Sylva, la guardiana del musgo*.
- Idiom: "the name speaks through your own mouth" rendered as *el nombre
  habla por tu propia boca* — the breath riddle's answer (aliento/breath)
  is the same word-root in both languages.
