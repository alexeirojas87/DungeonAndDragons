# Chapter X — The Tenth Door · *La décima puerta*

> Act III finale. Behind the court seal, the Door — the very name this campaign
> has carried — opens one last time. Three final commitments close a world: who
> will witness its oaths, who will keep the vessel, and who will pay the price.
> Exactly six terminal nodes, one per global ending; no hung terminal.
>
> *Final del Acto III. Tras el sello de la corte, la puerta — el nombre que
> esta campaña ha llevado — se abre por última vez. Tres últimas decisiones
> cierran un mundo: quién será testigo de sus juramentos, quién guardará la
> vasija, y quién pagará el precio. Exactamente seis nodos terminales, uno por
> final global; sin nodo suspendido.*

## Premise · Premisa

**EN:** Behind the court's seal, the Door — the very name this campaign has
carried — opens one last time; three final commitments close a world: who will
witness its oaths, who will keep the vessel, and who will pay the price.

**ES:** Tras el sello de la corte, la puerta — el nombre que esta campaña ha
llevado — se abre por última vez; tres últimas decisiones cierran un mundo:
quién será testigo de sus juramentos, quién guardará la vasija, y quién pagará
el precio.

**Dramatic question · Pregunta dramática:** not whether it can be closed, but by
whom, in what vessel, and for what price. · *No si puede cerrarse, sino por
quién, en qué vasija, y por qué precio.*

## Arc · Arco

1. **Opening · Apertura:** the descent to the Ante-Threshold — crossing onto
   the door with the whole company; the Council of Witnesses mirrors every bond.
2. **First pledge · Primer compromiso:** `c10_first_pledge` — whom you openly
   side with first: the Assembly clerk (`c10_lean_trust`), the Council living
   guardian (`c10_lean_carry`), or the Free spokesperson (`c10_lean_break`).
   The lean does **not** choose the ending; it is at most a conjunct inside a
   route predicate.
3. **Branches · Ramas (≥3):** the archive-gallery (`c10_gallery_*` — silent
   stacks, the name-riddle, precedent evidence); the witnessing-well
   (`c10_well_*` — living testimony, the crowd's pressure); the forged-seal
   (`c10_seal_chamber_*` — the inner-bolts mechanism, the danger branch).
4. **Reckoning · Ajuste de cuentas:** the Reckoning of Oaths (non-combat
   climax) beside the Thief of Names (combat climax). A persuasion / deception
   / performance route dissolves the accusation without a final blow; the
   combat route is build-sensitive.
5. **The three hands · Las tres manos:** `c10_hand_trust` (verdict vindicated
   OR reform), `c10_hand_carry` (verdict hung), `c10_hand_break` (verdict
   dissolved). Each hand is offered only on its verdict gate.
6. **Terminal nodes · Nodos terminales (exactly 6):** one per `globalEndingId`.

## Terminal nodes · Nodos terminales

| Terminal node | globalEndingId | Hand | Routes |
|---|---|---|---|
| `c10_end_court_restored` | `court_restored` | trust | R1, R2 |
| `c10_end_new_concord` | `new_concord` | trust | N1, N2 |
| `c10_end_last_guardian` | `last_guardian` | carry | G1a, G1b, G2 |
| `c10_end_veil_ascendant` | `veil_ascendant` | carry | V1, V2 |
| `c10_end_decentralized_oaths` | `decentralized_oaths` | break | D1, D2 |
| `c10_end_unbound_world` | `unbound_world` | break | U1, U2 |

## Node table · Tabla de nodos

| ID | Beat (EN / ES) | Outgoing choices | Consumes |
|---|---|---|---|
| `c10_start` (start) | The Descent / El descenso | `c10_start_to_ante` | — |
| `c10_ante_threshold` | The Ante-Threshold / El ante-umbral | `c10_start_to_pledge` | — |
| `c10_first_pledge` | The First Pledge / El primer compromiso | `c10_lean_trust`, `c10_lean_carry`, `c10_lean_break` | lean |
| `c10_gallery_entry` | The Archive-Gallery / La galería del archivo | `c10_gallery_to_stacks`, `c10_gallery_back` | lean_trust |
| `c10_gallery_stacks` | The Silent Stacks / Las estanterías silenciosas | `c10_stacks_to_riddle`, `c10_stacks_back` | — |
| `c10_name_riddle` (puzzle) | The Riddle of the Name / El enigma del nombre | — | — |
| `c10_riddle_solved` | The Name Recovered / El nombre recuperado | `c10_solved_to_reckon` | name_known |
| `c10_riddle_skipped` | The Name Left Unspoken / El nombre dejado sin pronunciar | `c10_skipped_to_reckon` | — |
| `c10_well_entry` | The Witnessing-Well / El pozo del testimonio | `c10_well_to_testimony`, `c10_well_back` | lean_carry |
| `c10_well_testimony` | The Living Testimony / El testimonio vivo | `c10_testimony_to_crowd` | — |
| `c10_well_crowd` | The Crowd / La multitud | `c10_crowd_to_reckon` | testimony_heard |
| `c10_seal_entry` | The Forged-Seal Chamber / La cámara del sello forjado | `c10_seal_to_chamber`, `c10_seal_back` | lean_break |
| `c10_seal_chamber` | The Seal-Bench / El banco del sello | `c10_chamber_to_mechanism` | — |
| `c10_last_mechanism` (puzzle) | The Inner Bolts / Los cerrojos interiores | — | — |
| `c10_mechanism_solved` | The Seal Opened Clean / El sello abierto limpio | `c10_msolved_to_reckon` | seal_aligned |
| `c10_mechanism_skipped` | The Bolts Left / Los cerrojos dejados | `c10_mskipped_to_reckon` | — |
| `c10_reckoning` | The Reckoning of Oaths / El ajuste de cuentas de los juramentos | `c10_reckon_dissolve`, `c10_reckon_fight` | — |
| `c10_thief_combat` | The Thief of Names / El Ladrón de Nombres | `c10_face_thief` | thief_faced |
| `c10_thief_aftermath` (external entry) | The Threshold Clear / El umbral despejado | `c10_aftermath_to_hands` | reckoning resolved |
| `c10_hand_assembly` (route) | The Three Hands / Las tres manos | — | verdict gate |
| `c10_hand_trust` (external entry) | The Hand of Trust / La mano de la confianza | `c10_route_r1`, `c10_route_r2`, `c10_route_n1`, `c10_route_n2`, `c10_trust_back` | vindicated / reform |
| `c10_hand_carry` (external entry) | The Hand of Carry / La mano de la carga | `c10_route_g1a`, `c10_route_g1b`, `c10_route_g2`, `c10_route_v1`, `c10_route_v2`, `c10_carry_back` | hung |
| `c10_hand_break` (external entry) | The Hand of Break / La mano de la ruptura | `c10_route_d1`, `c10_route_d2`, `c10_route_u1`, `c10_route_u2`, `c10_break_back` | dissolved |
| `c10_end_court_restored` (terminal) | The Court Restored / La Corte Restaurada | — | R1 / R2 |
| `c10_end_new_concord` (terminal) | The New Concord / El Nuevo Concordato | — | N1 / N2 |
| `c10_end_last_guardian` (terminal) | The Last Guardian / El Último Guardián | — | G1a / G1b / G2 |
| `c10_end_veil_ascendant` (terminal) | The Veil Ascendant / El Velo Ascendente | — | V1 / V2 |
| `c10_end_decentralized_oaths` (terminal) | The Decentralized Oaths / Los Juramentos Descentralizados | — | D1 / D2 |
| `c10_end_unbound_world` (terminal) | The Unbound World / El Mundo sin Ataduras | — | U1 / U2 |

## Puzzles · Puzles (2)

### `c10_name_riddle` — riddle · acertijo

- **Prompt:** the Door asks for its own name — the word every chapter traded, the
  one a witness speaks, a vessel keeps, a price pays. · *La puerta pide su
  propio nombre — la palabra que cada capítulo trocó.*
- **Answers:** an oath / a vow (and bare forms). · *un juramento / un voto.*
- **Clues:** (1) it lives only while someone keeps speaking it; (2) every door in
  this campaign is one; (3) it names a witness, a vessel and a price — and it is
  the word itself.
- **Unlocks:** `c10_name_unlocked`. Solves to `c10_riddle_solved`; skip to
  `c10_riddle_skipped`.
- **Accessibility fallback:** if the Ch4 name was never recovered, evidence
  gathered in-chapter makes it inferable; the skip leaves the precedent thinner
  but the hand still resolves.

### `c10_last_mechanism` — mechanism (ordered, skippable) · mecanismo (ordenado, omitible)

- **Prompt:** three inner bolts — witness, vessel, price — hold the last seal,
  turned in the order an oath is spoken. · *Tres cerrojos interiores — testigo,
  vasija, precio — sostienen el último sello.*
- **Steps (ordered):** `c10_bolt_witness` → `c10_bolt_vessel` → `c10_bolt_price`.
- **Clues:** (1) witness first, vessel second, price last; (2) eye, bowl,
  falling hand; (3) eye, then bowl, then falling hand — the seal goes quiet on
  the third.
- **Unlocks:** `c10_seal_aligned`. Solves to `c10_mechanism_solved`; skip to
  `c10_mechanism_skipped`.
- **Accessibility fallback:** the skip leaves the seal shut; the hand still
  resolves the seal on its own — the closing happens, only without the clean
  opening.

## The selector · El selector

The selector (§6.1–6.6 of the global outline) is a total deterministic function
over every reachable final state. The Chapter-8 verdict gates exactly one hand;
each hand's two families are Boolean-disjoint; each family's pair split on a
Boolean axis is exhaustive. There is no seventh terminal, no hung node, no
lean-only route. The lean (`c10_lean_*`) appears only as a conjunct inside a
route, never a sole arbiter.

### Route predicates · Predicados de ruta

**Hand trust** (gate: `canon:c08_verdict_vindicated` OR `canon:c08_verdict_reform`):
- **R1** → `c10_end_court_restored`: `c08_verdict_vindicated` ∧
  `c04_name_returned` ∧ `bond:sylva ≥ 1` ∧ `c05_registry_governed`.
- **R2** → `c10_end_court_restored`: `c08_verdict_vindicated` ∧
  `c04_name_returned == false` ∧ `bond:voss ≥ 1` ∧ `c08_evidence_majority`.
- **N1** → `c10_end_new_concord`: `c08_verdict_reform` ∧
  `c05_registry_governed` ∧ `c02_map_shared` ∧ `faction:iron_parliament ≥ 1` ∧
  `faction:blackmere_council ≥ 1`.
- **N2** → `c10_end_new_concord`: `c08_verdict_reform` ∧
  `c05_registry_governed` ∧ `c02_map_shared == false` ∧ `bond:olen ≥ 1` ∧
  `c06_vault_opened`.

**Hand carry** (gate: `canon:c08_verdict_hung`):
- **G1a** → `c10_end_last_guardian`: `c08_verdict_hung` ∧ `c09_martyr` ∧
  `bond:varen ≥ 3` ∧ `c07_watchman_living`.
- **G1b** → `c10_end_last_guardian`: `c08_verdict_hung` ∧ `c09_martyr` ∧
  `bond:elara ≥ 3` ∧ `c07_watchman_living`.
- **G2** → `c10_end_last_guardian`: `c08_verdict_hung` ∧ `c09_martyr == false`
  ∧ `bond:martik ≥ 2` ∧ `c01_door_sealed` ∧ `c07_wall_held` ∧ `c09_door_sealed`.
- **V1** → `c10_end_veil_ascendant`: `c08_verdict_hung` ∧
  `c04_selfbound == false` ∧ `c03_bells_sold` ∧ `faction:veiled_court ≥ 2` ∧
  `c05_voss_file`.
- **V2** → `c10_end_veil_ascendant`: `c08_verdict_hung` ∧ `c04_selfbound` ∧
  `c07_wall_broken` ∧ `c06_vault_mastered`.

**Hand break** (gate: `canon:c08_verdict_dissolved`):
- **D1** → `c10_end_decentralized_oaths`: `c08_verdict_dissolved` ∧
  `c02_ash_seed` ∧ `c07_wall_held` ∧ `faction:free_witnesses ≥ 1`.
- **D2** → `c10_end_decentralized_oaths`: `c08_verdict_dissolved` ∧
  `c02_ash_seed == false` ∧ `c06_vault_opened` ∧ `c04_name_free`.
- **U1** → `c10_end_unbound_world`: `c08_verdict_dissolved` ∧
  `c02_ash_seed == false` ∧ `c06_vault_opened == false` ∧ `c02_map_burned` ∧
  `c06_vault_stranded`.
- **U2** → `c10_end_unbound_world`: `c08_verdict_dissolved` ∧
  `c02_ash_seed == false` ∧ `c06_vault_opened == false` ∧
  `c02_map_burned == false` ∧ `c05_registry_free` ∧ `c07_wall_broken`.

> Note on G1: the "varen ≥ 3 OR elara ≥ 3" disjunction is split into two choices
> (G1a / G1b), both pointing to `c10_end_last_guardian`, because
> `requiresValues` entries are AND-ed. G2 covers the legendary-free sealed-door
> lane without a bond ≥ 3 requirement.

### Validator reachability · Accesibilidad del validador

The three hand-entry nodes (`c10_hand_trust`, `c10_hand_carry`,
`c10_hand_break`) are marked `externalEntry: true` with `externalEntrySeeds`
providing one flag-set per route. The start-path settles at `c10_hand_assembly`
(`kind: 'route'`), which represents the completed descent; the hands are then
entered by the verdict gate. A non-gated "step back to the assembly" choice on
each hand keeps the bare-flagless seed walk from trapping, while every seeded
walk reaches exactly one terminal.

## Encounters · Encuentros

- **Non-combat resolution (primary):** the Reckoning of Oaths — a
  persuasion / deception / performance route (`c10_reckon_dissolve`) dissolves
  the Collector's accusation without a final blow.
- **Combat:** the **Thief of Names** (`c10_thief_of_names`, the assassin of
  witness memory) in `c10_threshold`. Build-dependent tactics: spell-heavy
  pressure wears its concentration; athletic/stealth strips its stolen shapes;
  archer forces range; a well-armored wall catches its lunges. On victory the
  boss-aftermath hook carries the player to `c10_thief_aftermath`. It is never
  required to settle the chapter — the dissolve route reaches the same
  aftermath.

## Consequences · Consecuencias

### New facts (local) · Hechos nuevos (locales)
- `c10_lean_trust` / `c10_lean_carry` / `c10_lean_break` — the first pledge.
- `c10_name_known` / `c10_seal_aligned` / `c10_testimony_heard` — branch
  outcomes.
- `c10_reckoning_dissolved` / `c10_thief_faced` — the reckoning path.
- `c10_route_r1` … `c10_route_u2` — the route taken (one per terminal reached).

### Campaign outputs (carried forward) · Salidas para capítulos posteriores
- Exactly one `globalEndingId` (one of the six), recorded on the terminal the
  selector resolves to. No hung terminal, no seventh ending.

### Setup/payoff links · Vínculos de plantado / cobro
- **Consumes from earlier chapters:** the whole canonical-fact register — the
  Ch8 verdict keys and `c08_evidence_majority`, the Ch4 name states
  (`c04_name_returned` / `_free` / `_selfbound`), the Ch5 registry and Voss
  file, the Ch2 map and ash-seed, the Ch3 bells, the Ch6 Vault states, the Ch7
  wall and watchman, the Ch9 door-variant and martyr, the Ch1 door-sealed.
- **Produces:** the campaign's single `globalEndingId`.

### Bond / faction / conviction changes · Cambios
- `bond:sylva`, `bond:voss`, `bond:olen`, `bond:varen`, `bond:elara`,
  `bond:martik`, and `faction:iron_parliament` / `blackmere_council` /
  `veiled_court` / `free_witnesses` gate the routes.
- `conviction:duty` / `compassion` / `freedom` / `truth` nudged by the pledge,
  the reckoning, and the route taken.

## Oath witness / vessel / price · Testigo / vasija / precio

Per §6.3 / §7.1 of the global outline, the last closing's three named parts,
one row per terminal:

| `globalEndingId` | Witness | Vessel | Price |
|---|---|---|---|
| `new_concord` | the Concord assembly (all eight factions) | the shared annual register | every faction cedes sovereign secrecy; one oath-run bound into law each season |
| `court_restored` | the Veiled Court, restored | the re-bound pact seal | the court re-accepts the bookkeeping and one keeper silence each year |
| `last_guardian` | one living Guardian | the body and standard of the bearer | no one alive may learn the Guardian name again |
| `veil_ascendant` | the Veiled Court and its redactors | the compiled memory-keep | each generation pays the memory of its promises |
| `unbound_world` | none | none | every promise paid once, all at once, on one austerity night |
| `decentralized_oaths` | every community | each community's own small vessel | each community shoulders its own fraction forever |

## Inputs / Outputs (compact) · Entradas / Salidas

- **Inputs consumed:** the whole canonical-fact register (§8.4); the bonds and
  factions that gate the twelve routes.
- **Outputs guaranteed:** exactly one `globalEndingId` — the selector is total
  and deterministic by construction.

## Translation review · Revisión de traducción

- Both languages are source; Spanish addresses the player as *tú*.
- Locked terms respected: *the Tenth Door* / *la décima puerta*; *the Thief of
  Names* / *el Ladrón de Nombres*; *the Reckoning of Oaths* / *el ajuste de
  cuentas de los juramentos*; *witness, vessel, price* / *testigo, vasija,
  precio*.
- Idiom: "clean slate" in `c10_end_unbound_world` is left as *clean slate* in
  the Spanish text as a deliberate loan — the ending's image is a world that
  owes nothing and guards nothing, and the English phrase carries the metaphor
  more plainly than any calque.
