# Chapter VI — The Tideless Sea · *El mar sin mareas*

> Act II closer. Off the west coast the sea has gone still; beached
> in that calm lies the Continental Vault, a vessel larger than a
> village holding the names and debts of an entire coastline. Its
> tide engine is broken. Four endings close the sea.
>
> *Cierre del Acto II. Frente a la costa oeste el mar se ha quedado
> sin marea; varada descansa la Bóveda del Continente, una bóveda
> mayor que un pueblo donde el mar guardó los nombres y las deudas
> de toda la costa. Su motor de mareas está roto. Cuatro desenlaces
> cierran el mar.*

## Premise · Premisa

**EN:** Off the west coast the sea has gone still; beached in that calm
lies the Continental Vault, a vessel larger than a village holding the
names and debts of an entire coastline; its tide engine is broken.

**ES:** Frente a la costa oeste el mar se ha quedado sin marea; varada
descansa la Bóveda del Continente, una bóveda mayor que un pueblo donde el
mar guardó los nombres y las deudas de toda la costa; su motor de mareas
está roto.

**Dramatic question · Pregunta dramática:** who opens the Vault — and what
does the tide pay? · *¿Quién abre la Bóveda — y qué paga la marea?*

## Arc · Arco

1. **Opening · Apertura:** the tideless shore; the Continental Vault
   beached in the calm; the fleet watches from the decks.
2. **The first sea · El primer mar:** the fleet eye sets the terms —
   open it, master it, or leave it.
3. **Branches · Ramas (≥3):** the fleet decks (lance-luggers), the dry
   docks (the tide chart), the deep hold (the Vault riddle).
4. **Midpoint reversal · Reverso:** the tide chart and the Vault riddle
   both name the sea-gate — the sluice that lets the tide in and keeps
   it out.
5. **Climax · Clímax:** the tide engine room; the Anchored, bound to
   the wheel; the engine choice.
6. **Endings · Desenlaces (4):** `c06_ending_opened`,
   `c06_ending_mastered`, `c06_ending_drawn`, `c06_ending_stranded`.

## Node table · Tabla de nodos

| ID | Beat (EN / ES) | Outgoing choices | Consumes |
|---|---|---|---|
| `c06_arrival` | The Tideless Shore / La orilla sin marea | `c06_arrival_with_map` (canon:c02_map_shared), `c06_arrival_bare` | — |
| `c06_vault_hull` | The Vault Hull / El casco | `c06_hull_to_eye` | — |
| `c06_fleet_eye` | The Fleet Eye / El ojo de la flota | `c06_eye_to_first` | — |
| `c06_first_sea` | The First Sea / El primer mar | `c06_to_decks`, `c06_to_docks`, `c06_to_hold` | — |
| `c06_decks_walk` | The Fleet Decks / Las cubiertas | `c06_decks_to_luggers`, `c06_decks_back` | decks_chosen |
| `c06_lance_luggers` | The Lance-Luggers / Los lanceros | `c06_face_luggers`, `c06_evade_luggers` | — |
| `c06_luggers_aftermath` | The Luggers Down (external entry) / Los lanceros caídos | `c06_luggers_to_engine` | luggers_faced |
| `c06_docks_walk` | The Dry Docks / Los muelles secos | `c06_docks_to_chart`, `c06_docks_back` | docks_chosen |
| `c06_tide_chart_node` | The Tide Chart / La carta de mareas | `c06_chart_open`, `c06_chart_back` | — |
| `c06_tide_puzzle` | The Tide Chart (puzzle) / La carta | — | — |
| `c06_tide_read` | The Chart Read / La carta leída | `c06_tide_to_engine` | chart_read |
| `c06_tide_skipped` | The Chart Unread / La carta sin leer | `c06_tide_skip_to_engine` | — |
| `c06_hold_walk` | The Deep Hold / La bodega | `c06_hold_to_riddle`, `c06_hold_back` | hold_chosen |
| `c06_vault_riddle_node` | The Riddle of the Vault / El enigma | `c06_riddle_open`, `c06_riddle_back` | — |
| `c06_vault_puzzle` | The Riddle of the Vault (puzzle) / El enigma | — | — |
| `c06_vault_answered` | The Riddle Answered / Respondido | `c06_vault_to_engine` | riddle_answered |
| `c06_vault_unanswered` | The Riddle Unanswered / Sin respuesta | `c06_vault_skip_to_engine` | — |
| `c06_engine` | The Tide Engine / El motor | `c06_engine_to_examine`, `c06_engine_to_anchored`, `c06_engine_to_choice` | — |
| `c06_engine_examine` | The Engine Examined / Examinado | `c06_examine_to_choice` | — |
| `c06_anchored` | The Anchored / El Anclado | `c06_face_anchored`, `c06_leave_anchored` | — |
| `c06_anchored_aftermath` | The Anchored Released (external entry) / Liberado | `c06_anchored_to_choice` | anchored_faced |
| `c06_engine_choice` | The Engine Choice / La elección | `c06_open_vault` (canon:c02_map_shared + canon:c04_name_free), `c06_master_vault` (canon:c04_name_returned), `c06_draw_vault`, `c06_strand_vault` | — |
| `c06_ending_opened` | Opened (terminal) / Abierta | — | vault_opened |
| `c06_ending_mastered` | Mastered (terminal) / Dominada | — | vault_mastered |
| `c06_ending_drawn` | Drawn (terminal) / Tomada | — | vault_drawn |
| `c06_ending_stranded` | Stranded (terminal) / Encallada | — | vault_stranded |

## Puzzles · Puzles (2)

### `c06_tide_chart` — check · comprobación

- **Prompt:** the dry docks hold a tide chart that shows when the
  Vault engine opens and shuts. Read it properly. · *Los muelles secos
  guardan una carta de mareas que muestra cuándo se abre el motor.*
- **Skill:** nature, DC 14.
- **Clues:** (1) the tide pattern shows two peaks and a flat (dc −2);
  (2) the chart names the gate the tide answers to: the sea-gate, the
  sluice (dc −3).
- **Unlocks:** `c06_chart_read`. Solves to `c06_tide_read`; skip to
  `c06_tide_skipped`.
- **Accessibility fallback:** the skip leaves the chart unread; the
  engine is the same whether read or not.

### `c06_vault_riddle` — riddle · acertijo

- **Prompt:** what lets the sea in and keeps the sea out, that the tide
  opens and the tide shuts, that the Vault holds but the shore cannot?
  · *¿Qué deja entrar al mar y lo mantiene fuera, que la marea abre y
  la marea cierra, que la Bóveda guarda pero la orilla no puede?*
- **Answers:** the sea-gate / sea-gate / the sea gate / sea gate /
  the sluice / sluice / la esclusa / esclusa · *la esclusa / la esclusa
  del mar.*
- **Clues / hints:** (1) it is a door of water, not wood; (2) the Vault
  holds it because the Vault was built around it; (3) the tide chart
  names it.
- **Unlocks:** `c06_riddle_answered`. Solves to `c06_vault_answered`;
  skip to `c06_vault_unanswered`.
- **Accessibility fallback:** the skip leaves the shape unknown; the
  engine is harder to read but the choice remains.

## Encounters · Encuentros

- **Non-combat resolution (primary):** "let the tide go" — the tide
  chart and the Vault riddle reveal the sea-gate (the sluice) without
  combat. The engine choice can be reached without fighting.
- **Combat (optional):** the lance-luggers (`c06_lance_lugger`) on the
  decks; the Anchored (`c06_the_anchored`) in the engine room — an
  optional boss bound to the tide wheel. Both avoidable.

## Consequences · Consecuencias

### New facts (local) · Hechos nuevos (locales)
- `c06_decks_chosen` / `c06_docks_chosen` / `c06_hold_chosen` — the
  branch chosen at the first sea.
- `c06_chart_read` — the tide chart was read.
- `c06_riddle_answered` — the Vault riddle was answered.
- `c06_luggers_faced` — the lance-luggers were fought.
- `c06_anchored_faced` — the Anchored was fought.

### Campaign outputs (carried forward) · Salidas
- `canon:c06_vault_opened` (opened ending) — the Vault is opened.
  Consumed by Ch7, Ch10 (N2, D2).
- `canon:c06_vault_mastered` (mastered ending) — the fleet keeps the
  secret. Consumed by Ch10 (V2).
- `canon:c06_vault_stranded` (stranded ending) — nothing opens.
  Consumed by Ch10 (U1).
- `canon:c06_vault_drawn` (drawn ending) — the mercantile holds.
  Consumed by Ch10.
- `canon:c06_evidence_vault` — evidence flag 5 of 5, consumed by Ch8.

### Setup/payoff links · Vínculos
- **Consumes from earlier chapters:** `canon:c02_map_shared` (the
  Vault opens only if the map was shared); `canon:c04_name_free` (a
  freed name unbolted the gate); `canon:c04_name_returned` (a returned
  name lets the fleet master the secret).
- **Produces for later chapters:** the four Vault-outcome keys feed
  Ch7 (which flanks hold) and Ch10 (the selector routes N2, D2, U1,
  V2); `c06_evidence_vault` feeds Ch8's evidence majority.

### Bond / faction / conviction changes · Cambios
- `faction:tidebound_fleet` (set here); `conviction:freedom` /
  `conviction:duty` / `conviction:truth` nudged by the branch and
  the engine choice.

## Oath witness / vessel / price · Testigo / vasija / precio

| Event | Witness | Vessel | Price |
|---|---|---|---|
| the sea's vault | the fleet's recorded witnesses | the Continental Vault (the keel) | the tide itself, held at high |

Looting the Vault makes every coast pay at once; the sea stays flat
and shallow.

## Inputs / Outputs (compact) · Entradas / Salidas

- **Inputs consumed:** `canon:c02_map_shared` (Ch2), `canon:c04_name_free`
  (Ch4), `canon:c04_name_returned` (Ch4).
- **Outputs guaranteed:** exactly one of `canon:c06_vault_opened` /
  `canon:c06_vault_mastered` / `canon:c06_vault_stranded` /
  `canon:c06_vault_drawn`; `canon:c06_evidence_vault`;
  `faction:tidebound_fleet`.

## Translation review · Revisión de traducción

- Both languages are source; Spanish addresses the player as *tú*.
- Locked terms respected: *the Continental Vault* / *la Bóveda del
  Continente*; *the Tideless Sea* / *el mar sin mareas*; *the Tidebound
  Fleet* / *la Armada de la Marea Atada*.
- Idiom: "the sea-gate" / "la esclusa" — the riddle answer is the same
  object in both languages (a sluice gate that controls the tide), though
  the English uses a compound and the Spanish a single noun.
