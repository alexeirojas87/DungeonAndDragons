# Chapter IX — The Last Road to Blackmere · *El último camino a Blackmere*

> Act III mid-finale. The road home edges past a Blackmere that has grown
> over the door; every choice of the first chapter returns — sealed or open,
> named or nameless, relic kept or taken — and then the last collector knocks.
> Four endings close the last road and feed the Chapter 10 selector.
>
> *Intermedio final del Acto III. El único camino de regreso bordea un
> Blackmere que ha crecido sobre la puerta; cada elección del primer capítulo
> vuelve — sellada o abierta, con nombre o sin él, la reliquia conservada o
> perdida —; después llama el último cobrador. Cuatro desenlaces cierran el
> último camino y alimentan el selector del Capítulo 10.*

## Premise · Premisa

**EN:** The road home edges past a Blackmere that has grown over the door;
every choice of the first chapter returns — sealed or open, named or nameless,
relic kept or taken — and then the last collector knocks.

**ES:** El único camino de regreso bordea un Blackmere que ha crecido sobre la
puerta; cada elección del primer capítulo vuelve — sellada o abierta, con
nombre o sin él, la reliquia conservada o perdida —; después llama el último
cobrador.

**Dramatic question · Pregunta dramática:** what has become of the wound the
village opened? · *¿Qué se ha vuelto la herida que el pueblo abrió?*

## Arc · Arco

1. **Opening · Apertura:** the road home edges past a Blackmere that has crept
   down to the crypt — new walls, new lanterns, a choir that sings where the
   council once kept silent.
2. **First choice · Primera elección:** `c09_first_edge` — who speaks at the
   door: the one who owes most (Martik), the one with most to give (Varen), or
   you alone.
3. **Branches · Ramas (≥3):** the owes-lane (Martik's honest price — a talk that
   closes a debt without a blow); the gives-lane (the council bargain — the
   council admits the barring in the open); the alone-lane (the gravel ambush —
   the road itself, hungry for the names the door once took).
4. **The flooded door · La puerta inundada:** the captives remembered, the
   first-chapter door-state recalled, and the flood-lock turned (or left).
5. **The last bargain · El último trato:** the ash-lock read (the last chance to
   spend the relic), then the last collector knocks and the door closes on the
   tally.
6. **Endings · Desenlaces (4):** `c09_ending_open`, `c09_ending_sealed`,
   `c09_ending_burned`, `c09_ending_martyr`.

## Node table · Tabla de nodos

| ID | Beat (EN / ES) | Outgoing choices | Consumes |
|---|---|---|---|
| `c09_arrival` (start, external entry) | The Last Road / El último camino | `c09_arrival_to_edge` | — |
| `c09_first_edge` | Who Speaks at the Door / Quién habla en la puerta | `c09_edge_owes` (bond:martik≥1), `c09_edge_gives` (bond:varen≥1), `c09_edge_alone` | — |
| `c09_owes_lane` | The One Who Owes / El que más debe | `c09_owes_to_price`, `c09_owes_back` | owes_chosen |
| `c09_martik_price` | The Honest Price of Martik / El precio honesto de Martik | `c09_price_to_yard` | debt_closed |
| `c09_gives_lane` | The One With Most to Give / El que más tiene que dar | `c09_gives_to_bargain`, `c09_gives_back` | gives_chosen |
| `c09_council_bargain` | The Council Bargain / El trato del consejo | `c09_bargain_to_yard` | council_admitted |
| `c09_alone_lane` | The Road Alone / El camino solo | `c09_alone_to_gravel`, `c09_alone_back` | alone_chosen |
| `c09_gravel_ambush` | The Gravel / La grava | `c09_face_gravel` | — |
| `c09_gravel_aftermath` (external entry) | The Gravel Broken / La grava rota | `c09_gravel_to_yard` | gravel_faced |
| `c09_door_yard` | The Door Yard / El patio de la puerta | `c09_yard_to_trio` | — |
| `c09_trio_echo` | The Captives Remembered / Los cautivos recordados | `c09_trio_present` (c01_trio_rescued), `c09_trio_absent` (c01_trio_lost), `c09_trio_unknown` | trio state |
| `c09_door_memory` | What the First Chapter Did / Lo que el primer capítulo hizo | `c09_recall_sealed` (c01_door_sealed), `c09_recall_open` (c01_door_open), `c09_recall_remembered` (c01_door_remembered), `c09_recall_relic` (c01_door_relic), `c09_recall_destroyed` (c01_door_destroyed), `c09_recall_name` (c01_door_named), `c09_recall_approach` | Ch1 door state |
| `c09_flood_door` (puzzle) | The Flood Lock / El cerradura de inundación | — | — |
| `c09_lock_solved` | The Lock Turned / La cerradura girada | `c09_solved_to_threshold` | lock_opened |
| `c09_lock_skipped` | The Lock Left / La cerradura dejada | `c09_skipped_to_threshold` | — |
| `c09_threshold` | The Threshold / El umbral | `c09_lay_relic` (c01_relic_claimed), `c09_approach_ash` | relic |
| `c09_ash_door` (puzzle) | The Ash Reading / La lectura de ceniza | — | — |
| `c09_ash_spent` | The Relic Spent / La reliquia gastada | `c09_spent_to_collector` | relic_spent |
| `c09_ash_kept` | The Relic Kept / La reliquia conservada | `c09_kept_to_collector` | — |
| `c09_last_collector` | The Last Collector Knocks / El último cobrador llama | `c09_collector_to_bargain` | — |
| `c09_collector_bargain` | The Last Bargain / El último trato | `c09_open_the_door`, `c09_seal_the_door`, `c09_burn_the_door`, `c09_martyr_the_door` (bond:varen≥2), `c09_press_verdict` (c08_verdict_vindicated) | verdict |
| `c09_ending_open` (terminal) | Open / Abierta | — | c09_door_open |
| `c09_ending_sealed` (terminal) | Sealed / Sellada | — | c09_door_sealed |
| `c09_ending_burned` (terminal) | Burned / Quemada | — | c09_door_burned |
| `c09_ending_martyr` (terminal) | Martyr / Martirio | — | c09_martyr, c09_door_sealed |

## Puzzles · Puzles (2)

### `c09_flood_lock` — mechanism (ordered) · mecanismo (ordenado)

- **Prompt:** three bolts hold the iron band over the Drowned Door, turned in
  the order the water recedes. · *Tres cerrojos sostienen la banda de hierro
  sobre la Puerta Ahogada, en el orden en que el agua retrocede.*
- **Steps (ordered):** `c09_bolt_lower` → `c09_bolt_center` → `c09_bolt_upper`
  (lower, center, upper — the order the water recedes).
- **Clues:** (1) the water recedes from the lowest stone first; (2) once the
  lower bolt turns, the center stone drains; (3) the upper bolt only turns once
  the water is gone — it is the last and the seal.
- **Unlocks:** `c09_lock_opened`. Solves to `c09_lock_solved`; skip to
  `c09_lock_skipped`.
- **Accessibility fallback:** the skip leaves the band tight; the door is sealed
  by the flood rather than by the player hand, and the threshold is still
  reachable.

### `c09_ash_check` — check · comprobación

- **Prompt:** the ash-lock reads whether the relic still has a price to pay —
  the last chance to spend the relic the first chapter carried. · *La cerradura
  de ceniza lee si la reliquia aún tiene un precio que pagar — la última
  oportunidad de gastar la reliquia que el primer capítulo llevó.*
- **Skill / DC:** `religion` / 14.
- **Clues:** (1) the relic claimed a campaign ago still holds — lay it on the
  ash and the reading drops (−3); (2) if the door kept a name, the ash reads
  truer (−2).
- **Unlocks:** `c09_relic_spent`. Solves to `c09_ash_spent`; skip to
  `c09_ash_kept`.
- **Accessibility fallback:** the skip keeps the relic (or reads the door
  alone); the last collector still knocks and the door still closes.

## Encounters · Encuentros

- **Non-combat resolution (primary):** "Martik's honest price" — a talk that
  closes a debt without a blow, reached on the owes-lane (`c09_martik_price`).
- **Combat:** *the gravel* (`c09_gravel`, the road itself, hungry for the names
  the door once took) in `c09_breach`, reached on the alone-lane. Endurance and
  supplies matter: a fed party breaks the ridge; a spent party is worn down. On
  victory the boss-aftermath hook carries the player to `c09_gravel_aftermath`.
  It is never required to settle the chapter.

## Consequences · Consecuencias

### New facts (local) · Hechos nuevos (locales)
- `c09_owes_chosen` / `c09_gives_chosen` / `c09_alone_chosen` — who spoke at
  the door.
- `c09_debt_closed` — Martik spoke the honest price and closed the debt.
- `c09_council_admitted` — the council admitted the barring in the open.
- `c09_gravel_faced` — the gravel was fought on the last road.
- `c09_door_recalled` / `c09_door_named_spoken` — the first-chapter door-state
  was recalled; the name the door keeps was spoken.
- `c09_lock_opened` — the flood-lock was turned.
- `c09_relic_laid` / `c09_relic_spent` — the relic was laid on the ash; the ash
  reading spent it.
- `c09_verdict_pressed` — the court vindication was pressed on the collector.

### Campaign outputs (carried forward) · Salidas para capítulos posteriores
- Exactly one of `canon:c09_door_open` / `canon:c09_door_sealed` /
  `canon:c09_door_burned` (the martyr lane also sets `canon:c09_door_sealed`).
- `canon:c09_martyr` — set on `c09_ending_martyr`; consumed by the Chapter 10
  `last_guardian` G1 route.

### Setup/payoff links · Vínculos de plantado / cobro
- **Consumes from earlier chapters:** the full Ch1 door-state
  (`canon:c01_door_sealed` / `_destroyed` / `_open` / `_remembered` / `_relic`),
  `canon:c01_door_named`, the captives (`canon:c01_trio_rescued` /
  `_lost`), the relic (`canon:c01_relic_claimed`), the bonds, and one Ch8
  verdict key (`canon:c08_verdict_vindicated` gates `c09_press_verdict`).
- **Produces for later chapters:** the Ch9 door-variants and `canon:c09_martyr`
  feed the Chapter 10 selector (the `last_guardian` G2 route reads
  `canon:c09_door_sealed`; the G1 route reads `canon:c09_martyr`).

### Bond / faction / conviction changes · Cambios
- `bond:martik`, `bond:varen` nudged by the first-edge choice; `bond:varen` −3
  on the martyr ending.
- `faction:blackmere_council` +1 on the honest price and the council bargain.
- `conviction:duty` / `compassion` / `freedom` / `truth` nudged by the lane and
  the closing choice.

## Oath witness / vessel / price · Testigo / vasija / precio

Per §7 of the global outline, the door-peace's three named parts:

| Event | Witness | Vessel | Price |
|---|---|---|---|
| the door-peace | the door's recollection | the iron band of the lock | Blackmere's silence and knowledge |

Fleeing the covenant outlives the keeper; the wound hardens into legend and
shifts the Chapter 10 read.

## Inputs / Outputs (compact) · Entradas / Salidas

- **Inputs consumed:** Ch1 door variants, `canon:c01_door_named`, trio state,
  `canon:c01_relic_claimed`, the bonds, one Ch8 verdict key.
- **Outputs guaranteed:** exactly one of `canon:c09_door_sealed` /
  `canon:c09_door_open` / `canon:c09_door_burned`; `canon:c09_martyr` on the
  martyr lane (which also sets `canon:c09_door_sealed`).

## Translation review · Revisión de traducción

- Both languages are source; Spanish addresses the player as *tú*.
- Locked terms respected: *the Drowned Door* / *la Puerta Ahogada*; *the Sunken
  Crypt* / *la Cripta Sumergida*; *the Black Lantern* / *el Farol Negro*; *the
  last road* / *el último camino*; *the gravel* / *la grava*; *the last
  collector* / *el último cobrador*.
- Idiom: "Martik's honest price" rendered as *el precio honesto de Martik* — a
  talk that closes a debt without a blow, both languages carrying the same
  metaphor of a price paid in speech rather than steel.
