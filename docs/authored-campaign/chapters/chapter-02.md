# Chapter II — The Road of Salt and Ash · *El camino de sal y ceniza*

> Act I. Refugees and salt caravans crowd the north road. A Salt Compact
> caravan-master holds the only ledger that binds a voice to a vessel — the
> first true map of oath-vessels — and before the week is out she will sell
> it, trade it, or burn it. Four local endings close the chapter.
>
> *Acto I. Refugiados y caravanas de sal llenan el camino al norte. La maestra
> de una caravana del Pacto de Sal guarda el único registro que ata una voz a
> una vasija — el primer mapa verdadero de vasijas de juramento — y antes de
> que acabe la semana lo venderá, lo canjeará o lo quemará. Cuatro desenlaces
> locales cierran el capítulo.*

## Premise · Premisa

**EN:** Refugees and salt caravans crowd the north road. A Salt Compact
caravan-master holds the only ledger that binds a voice to a vessel — the
first true map of oath-vessels — and before the week is out she will sell it,
trade it, or burn it.

**ES:** Refugiados y caravanas de sal llenan el camino al norte. La maestra de
una caravana del Pacto de Sal guarda el único registro que ata una voz a una
vasija — el primer mapa verdadero de vasijas de juramento — y antes de que
acabe la semana lo venderá, lo canjeará o lo quemará.

**Dramatic question · Pregunta dramática:** whose word is written on that map,
and who gets to read it? · *¿De quién está escrita la palabra en ese mapa, y
quién puede leerlo?*

## Arc · Arco

1. **Opening · Apertura:** the north road out of Blackmere, crowded with
   refugees and salt caravans. Olen, the caravan-master, counts sealed crates
   by lantern-light.
2. **First gate · Primer paso:** the first irreversible choice — read the
   sealed cargo (break the road's law) or leave the seals whole (keep the
   road's trust).
3. **Branches · Ramas (≥3):** the caravan road (Olen's bargain and the cargo
   ledger), the ash-children's hollow (the kiln riddle and the ash-seed),
   the courier's trail (the Iron Parliament courier).
4. **Reversal · Reverso:** Olen's reversal — the ledger holds only falsified
   vows, and she left her own row off the map. The map is the debt; the debt
   is the map.
5. **Climax · Clímax:** the salt-storm crossing; the Wicker Wraith ambush;
   the bound debtor's testimony. The player decides the fate of the map.
6. **Endings · Desenlaces (4):** `c02_ending_partner`, `c02_ending_sold`,
   `c02_ending_burned`, `c02_ending_seed`.

## Node table · Tabla de nodos

| ID | Beat (EN / ES) | Outgoing choices | Consumes |
|---|---|---|---|
| `c02_arrival` | The North Road / El camino del norte | `c02_approach_caravan` | — |
| `c02_caravan_gate` | The Caravan Under the Ash / La caravana bajo la ceniza | `c02_meet_olen`, `c02_mention_rescue` | — |
| `c02_first_gate` | The Sealed Cargo / La carga sellada | `c02_read_cargo`, `c02_leave_seals` | — |
| `c02_crossroads` | Three Roads / Tres caminos | `c02_take_caravan`, `c02_take_ash`, `c02_take_courier` | cargo_read/seals_intact |
| `c02_caravan_road` | The Caravan Road / El camino de la caravana | `c02_olen_bargain` | chose_caravan |
| `c02_olen_bargain` | Olen's Bargain / El trato de Olen | `c02_olen_trio_rescued`, `c02_olen_no_trust` | canon:c01_trio_rescued (optional) |
| `c02_ash_children` | The Ash-Children's Husk / El barranco de los hijos de la ceniza | `c02_ask_kiln`, `c02_ash_seed_choice` | chose_ash |
| `c02_kiln_intro` | The Kiln's Question / La pregunta del horno | `c02_open_kiln` | chose_kiln |
| `c02_puzzle_kiln` | The Kiln Riddle (puzzle) / El enigma del horno | — | — |
| `c02_kiln_solved` | The Wind Answers / El viento responde | `c02_kiln_to_threshold` | kiln_answer |
| `c02_kiln_skipped` | The Kiln Left Unanswered / El horno sin respuesta | `c02_kiln_skip_to_threshold` | — |
| `c02_ash_seed` | The Ash Seed / La semilla de ceniza | `c02_seed_to_threshold` | canon:c02_ash_seed |
| `c02_courier_road` | The Courier's Road / El camino del correo | `c02_courier_meet` | chose_courier |
| `c02_courier_meet` | The Iron Parliament Courier / El correo del Parlamento de Hierro | `c02_courier_to_olen` | — |
| `c02_puzzle_cargo` | The Ledger of Voices (puzzle) / El registro de voces | — | — |
| `c02_cargo_decoded` | The Ledger Decoded / El registro descifrado | `c02_decoded_to_reversal` | voice_token, canon:c02_evidence_ledger |
| `c02_cargo_skipped` | The Ledger Left Shut / El registro dejado cerrado | `c02_skipped_to_reversal` | — |
| `c02_wicker_ambush` | The Wicker Ambush / La emboscada de mimbre | `c02_fight_wicker` | — |
| `c02_wicker_aftermath` | The Storm Breaks (external entry) / La tormenta cede | `c02_aftermath_to_debtor` | fought_wicker |
| `c02_bound_debtor` | The Bound Debtor / El deudor atado | `c02_debtor_to_storm` | — |
| `c02_olen_reversal` | Olen's Reversal / El reverso de Olen | `c02_reversal_to_ambush` | — |
| `c02_salt_storm` | The Salt-Storm Crossing / El paso de la tormenta de sal | `c02_to_ending_partner`, `c02_to_ending_sold`, `c02_to_ending_burned`, `c02_to_ending_seed` | canon:c02_ash_seed (seed ending) |
| `c02_ending_partner` | Partners in the Salt (terminal) / Socias en la sal | — | — |
| `c02_ending_sold` | The Map Sold (terminal) / El mapa vendido | — | — |
| `c02_ending_burned` | Ashes for the Wind (terminal) / Cenizas para el viento | — | — |
| `c02_ending_seed` | What the Ash Can Grow (terminal) / Lo que la ceniza puede crecer | — | canon:c02_ash_seed |

## Puzzles · Puzles (2)

### `c02_cargo_ledger` — check (investigation, DC 14)

- **Prompt:** Olen's ledger binds each sealed voice to its vessel; three
  entries near the back were written in a second ink.
- **Clues / hints:** (1) the three odd entries share a tally date, not a
  departure date — a count of voices, not goods; (2) the margin drawing is a
  map of oath-vessels with one line missing. Clues reduce DC by 3 and 2.
- **Unlocks:** `c02_voice_token`, `canon:c02_evidence_ledger`. Solves to
  `c02_cargo_decoded`; skip to `c02_cargo_skipped`.
- **Accessibility fallback:** the skip keeps the map hidden; the player can
  still cross the storm and reach any ending.

### `c02_kiln_riddle` — riddle

- **Prompt:** what neither salt nor ash can keep, that the road takes and the
  road gives back?
- **Answers:** the wind / el viento (and bare forms).
- **Clues:** (1) it is not a substance — it carries both salt and ash; (2)
  caravans follow it, ashes scatter on it, the road is nothing without it.
- **Unlocks:** `c02_kiln_answer`. Solves to `c02_kiln_solved`; skip to
  `c02_kiln_skipped`.
- **Accessibility fallback:** the skip leaves the riddle unanswered; the player
  can still reach the threshold and all endings.

## Encounters · Encuentros

- **Combat:** Wicker Wraith (`c02_wicker_wraith`) ambush at the salt-storm
  crossing, plus a Bound Debtor (`c02_bound_debtor_monster`). On victory at
  `c02_salt_flats`, the boss-aftermath hook carries the player to
  `c02_wicker_aftermath`.
- **Non-combat resolution:** refuse the map; the cargo ledger can be left shut;
  the kiln riddle can be left unanswered; the ash-seed can be planted without
  violence.

## Consequences · Consecuencias

### Campaign outputs (carried forward) · Salidas para capítulos posteriores
- **Map fate:** `canon:c02_map_shared` (partner, sold, seed) or
  `canon:c02_map_burned` (burned).
- **Ash seed:** `canon:c02_ash_seed` (seed ending only).
- **Evidence:** `canon:c02_evidence_ledger` (cargo ledger decoded).
- **Bond:** `bond:olen`.
- **Faction:** `faction:salt_compact`, `faction:free_witnesses` (seed).

### Bond / faction / conviction changes · Cambios
- `bond:olen` ± (trust, bargain, or betrayal); `faction:salt_compact` +
  (cooperation); `faction:free_witnesses` + (ash-seed); convictions `truth` /
  `freedom` / `compassion` / `duty` nudged by the gate and the ending.

## Oath witness / vessel / price · Testigo / vasija / precio

Per §7 of the global outline:

| Event | Witness | Vessel | Price |
|---|---|---|---|
| Olen's hand-fair | Olen's name over the ledger | the map | one sealed voice per caravan crossing |

## Inputs / Outputs (compact) · Entradas / Salidas

- **Inputs consumed:** Ch1 door variants (narrative context); `canon:c01_trio_rescued`
  (a trusted village lets the Salt trust you — gated choice at `c02_olen_bargain`).
- **Outputs guaranteed:** `canon:c02_map_shared` or `canon:c02_map_burned`;
  `canon:c02_ash_seed` (seed ending); `canon:c02_evidence_ledger` (cargo
  decoded); `bond:olen`; `faction:salt_compact`; `faction:free_witnesses` (seed).

## Translation review · Revisión de traducción

- Both languages are source; Spanish addresses the player as *tú*.
- Locked terms respected: *the ash* / *la ceniza*; *Olen, caravan-master* /
  *Olen, maestra de caravana*.
- Idiom: "the road does not forget either way" rendered as *el camino no
  olvida, de ninguna de las dos maneras* — a deliberate non-literal match.