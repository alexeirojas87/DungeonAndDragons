# Chapter I — The Missing of Blackmere · *Los desaparecidos de Blackmere*

> Act I opener. Three villagers have disappeared by the Sunken Crypt; the
> council wants the matter kept silent; a hooded survivor drinks alone in the
> tavern; beneath the crypt, the Drowned Door has started breathing again.
> Five local endings close the chapter.
>
> *Apertura del Acto I. Tres aldeanos han desaparecido junto a la Cripta
> Sumergida; el consejo prefiere silencio; un superviviente encapuchado bebe
> solo en la taberna; bajo la cripta, la Puerta Ahogada ha vuelto a respirar.
> Cinco desenlaces locales cierran el capítulo.*

## Premise · Premisa

**EN:** Three villagers have disappeared by the Sunken Crypt; the council wants
the matter kept silent; a hooded survivor drinks alone in the tavern; beneath
the crypt, the Drowned Door has started breathing again.

**ES:** Tres aldeanos han desaparecido junto a la Cripta Sumergida; el consejo
prefiere silencio; un superviviente encapuchado bebe solo en la taberna; bajo
la cripta, la Puerta Ahogada ha vuelto a respirar.

**Dramatic question · Pregunta dramática:** who turned three disappearances
into a payment — and is the rescue itself a payment? · *¿Quién convirtió tres
desapariciones en un pago — y es el rescate mismo un pago?*

## Arc · Arco

1. **Opening · Apertura:** the Black Lantern at dusk; Martik names the missing
   — Tomas, Greta, Lyra — and the notice was written in two inks.
2. **Fork · Bifurcación:** the first irreversible choice — whose account shapes
   the hunt: the council, the chapel, or the stranger.
3. **Branches · Ramas (≥3):** the council chamber (bargain and sealed journal),
   the chapel (Elara, the Drowned Eye, and the burial-ledger puzzle), the
   stranger (Captain Varen revealed, the sealing vial, and Greta's stolen
   voice). Each lane stays separate ≥2 nodes, merging at `c01_plan_departure`.
4. **Reversal · Reverso:** the runes of the Drowned Door were never a lock —
   they were a sentence, a name the door lost, and the player can speak it.
5. **Climax · Clímax:** the Warden falls; the Drowned Door opens; the player
   chooses to rescue, seal, destroy, remember, or claim the relic.
6. **Endings · Desenlaces (5):** `c01_ending_rescue`, `c01_ending_sealed`,
   `c01_ending_destroyed`, `c01_ending_remembered`, `c01_ending_relic`.

## Node table · Tabla de nodos

| ID | Beat (EN / ES) | Outgoing choices | Consumes |
|---|---|---|---|
| `c01_arrival` | The Black Lantern / El Farol Negro | `c01_show_martik`, `c01_inspect_notice` | — |
| `c01_notice_clue` | Two Inks / Dos tintas | `c01_compare_martik`, `c01_show_stranger_notice` | — |
| `c01_martik_briefing` | Three Names / Tres nombres | `c01_lean_council`, `c01_lean_chapel`, `c01_lean_stranger` | — |
| `c01_council_chamber` | The Council's Bargain / El trato del consejo | `c01_accept_council`, `c01_expose_council` | lean_council |
| `c01_council_bargain` | The Sealed Record / El registro sellado | `c01_take_archive`, `c01_council_to_plan` | council_support/council_hostile |
| `c01_archive` | The Drowned Passage / El pasadizo ahogado | `c01_keep_tunnel_map`, `c01_share_with_martik` | — |
| `c01_chapel_plea` | Lyra's Dream / El sueño de Lyra | `c01_ask_for_ledger`, `c01_elara_blessing` | lean_chapel |
| `c01_puzzle_ledger` | The Ledger Nobody Closed (puzzle) / El registro que nadie cerró | — | — |
| `c01_chapel_decoded` | The Ledger Speaks / El registro habla | `c01_decoded_to_tunnel`, `c01_decoded_to_archive` | chapel_ledger_decoded |
| `c01_chapel_skipped` | The Ledger Left Shut / El registro dejado cerrado | `c01_skipped_to_plan` | — |
| `c01_tunnel_map` | The Drowned Passage / El pasadizo ahogado | `c01_tunnel_to_plan` | tunnel_map |
| `c01_stranger_identity` | Captain Varen / Capitán Varen | `c01_forgive_varen`, `c01_expose_varen` | lean_stranger |
| `c01_varen_vow` | The Vow at the Bar / El juramento en la barra | `c01_take_vial`, `c01_seek_destroy`, `c01_hear_greta` | varen_guide/exposed_varen |
| `c01_vial` | The Sealing Vial / El vial de sellado | `c01_vial_to_plan` | — |
| `c01_plan_departure` | Choose the Road / Elegir el camino | `c01_take_direct`, `c01_take_forest`, `c01_take_tunnel`, `c01_take_varen`, `c01_take_council` | tunnel_map, varen_guide, council_support |
| `c01_route_direct` | The Open Road (route) / El camino abierto | — | — |
| `c01_route_forest` | Under the Old Pines (route) / Bajo los pinos antiguos | — | — |
| `c01_route_secret_tunnel` | Black Water (route) / Aguas negras | — | tunnel_map |
| `c01_route_varen` | A Debt Returned (route) / Una deuda que regresa | — | varen_guide |
| `c01_route_council` | Banners in the Mist (route) / Estandartes en la niebla | — | council_support |
| `c01_warden_aftermath` | The Door Opens (external entry) / La puerta se abre | `c01_rescue_and_flee`, `c01_seal_and_rescue`, `c01_destroy_and_rescue`, `c01_study_door_runes`, `c01_claim_relic` | has_vial, intends_destroy |
| `c01_puzzle_runes` | Three Runes, One Sentence (puzzle) / Tres runas, una frase | — | — |
| `c01_runes_read` | What the Door Was Asking For / Lo que la puerta pedía | `c01_speak_name`, `c01_runes_then_seal`, `c01_runes_then_flee` | drowned_runes_read |
| `c01_runes_skipped` | The Runes Left Unread / Las runas sin leer | `c01_runes_skip_back` | — |
| `c01_ending_rescue` | The Cost of Mercy (terminal) / El precio de la misericordia | — | — |
| `c01_ending_sealed` | A Door Made Silent (terminal) / Una puerta silenciada | — | has_vial |
| `c01_ending_destroyed` | Stone Upon Stone (terminal) / Piedra sobre piedra | — | intends_destroy |
| `c01_ending_remembered` | The Name the Water Kept (terminal) / El nombre que guardó el agua | — | drowned_runes_read |
| `c01_ending_relic` | What You Chose to Carry (terminal) / Lo que elegiste cargar | — | — |

## Puzzles · Puzles (2)

### `c01_chapel_ledger` — check (investigation, DC 14)

- **Prompt:** the chapel's burial ledger has three entries in a second hand;
  read it to learn how the abductors come and go.
- **Clues / hints:** (1) the three odd entries share a tide-table date, not a
  burial date; (2) the margin drawing is the chapel floor seen from below —
  the line is water. Clues reduce DC by 2 each.
- **Unlocks:** `c01_tunnel_map`, `c01_chapel_ledger_decoded`. Solves to
  `c01_chapel_decoded`; skip to `c01_chapel_skipped`.
- **Accessibility fallback:** the skip leaves the tunnel hidden; the player can
  still reach the crypt via the direct or forest route.

### `c01_drowned_door_runes` — mechanism (ordered)

- **Prompt:** three runes ring the Drowned Door; the Ashen Court taught it an
  order, and the order is a sentence.
- **Steps (ordered):** `c01_rune_moon` → `c01_rune_salt` → `c01_rune_bone`
  (subject, verb, object — the sentence of a burial rite).
- **Clues:** (1) begin with the rune that names something; (2) salt was
  scattered before the mourners spoke, mourners before the bone was laid.
- **Unlocks:** `c01_drowned_runes_read`. Solves to `c01_runes_read`; skip to
  `c01_runes_skipped`.
- **Accessibility fallback:** the skip returns to `c01_warden_aftermath`; the
  player can still rescue, seal (if vial held), destroy, or claim the relic.

## Encounters · Encuentros

- **Combat (boss):** the Crypt Warden (`c01_warden`) in `c01_guardian_room`.
  On victory the engine's boss-aftermath hook carries the player to
  `c01_warden_aftermath`. The Warden has Bone Shield, Fear Aura, and Life Drain.
- **Non-combat resolution:** the Drowned Door's runes can be read and answered
  without further combat; the remembered ending (`c01_ending_remembered`) is a
  non-violent close.

## Consequences · Consecuencias

### Campaign outputs (carried forward) · Salidas para capítulos posteriores
- **Door fate (exactly one):** `canon:c01_door_sealed`,
  `canon:c01_door_destroyed`, `canon:c01_door_open`,
  `canon:c01_door_remembered`, `canon:c01_door_relic`.
- **Captives:** `canon:c01_trio_rescued` or `canon:c01_trio_lost`.
- **Relic:** `canon:c01_relic_claimed`.
- **Oath:** `canon:c01_rescue_oath`.
- **Oath-bank:** `canon:c01_oath_bank`.
- **Greta's voice:** `canon:c01_greta_voice`.
- **Door named:** `canon:c01_door_named`.
- **Bonds:** `bond:martik`, `bond:varen`, `bond:elara`.
- **Faction:** `faction:blackmere_council`.

### Bond / faction / conviction changes · Cambios
- `bond:martik` ± (trust he believed or betrayed); `bond:varen` ± (forgive or
  expose); `bond:elara` + (chapel branch); `faction:blackmere_council` ±
  (accept, expose, or trade); convictions `compassion` / `truth` / `freedom` /
  `duty` nudged by the fork and the ending.

## Oath witness / vessel / price · Testigo / vasija / precio

Per §7 of the global outline:

| Event | Witness | Vessel | Price |
|---|---|---|---|
| the falsified abductions | the chapel ledger + the door-stone | the black water; the Drowned Door | the names (Tomas, Greta, Lyra) |
| the sealing | the Door while listening | the silver vial | the chamber must give nothing back |

## Inputs / Outputs (compact) · Entradas / Salidas

- **Inputs consumed:** none (campaign start).
- **Outputs guaranteed:** exactly one door-variant flag; trio rescued or lost;
  relic claimed; rescue oath; oath-bank; Greta's voice; door named; three
  bonds; one faction.

## Translation review · Revisión de traducción

- Both languages are source; Spanish addresses the player as *tú*.
- Locked terms respected: *the Drowned Door* / *la Puerta Ahogada*; *the
  Drowned Eye* / *el Ojo Ahogado*; *the Sunken Crypt* / *la Cripta Sumergida*;
  *the Black Lantern* / *el Farol Negro*; *Blackmere*.
- Idiom: "the water lowers itself out of the chamber like something taking its
  hat off" rendered as *el agua se retira de la cámara como quien se descubre
  la cabeza* — a deliberate non-literal match of the English image.