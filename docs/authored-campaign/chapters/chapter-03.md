# Chapter III — The City of Silent Bells · *La ciudad de las campanas mudas*

> Act I closer. In Syrva a promise once rang through a bell; now each bell is
> a cell of voices, and the keeper Vane holds one bell per stolen voice. If
> you wait, an entire district goes silent forever. Four local endings close
> the chapter.
>
> *Cierre del Acto I. En la ciudad de Sirva una promesa se escuchaba por una
> campana; ahora cada campana es una jaula de voces, y la campanera Vane
> guarda una campana por cada voz que tomó. Si te demoras, un distrito entero
> callará para siempre. Cuatro desenlaces locales cierran el capítulo.*

## Premise · Premisa

**EN:** In Syrva a promise once rang through a bell; now each bell is a cell of
voices, and the keeper Vane holds one bell per stolen voice. If you wait, an
entire district goes silent forever.

**ES:** En la ciudad de Sirva una promesa se escuchaba por una campana; ahora
cada campana es una jaula de voces, y la campanera Vane guarda una campana por
cada voz que tomó. Si te demoras, un distrito entero callará para siempre.

**Dramatic question · Pregunta dramática:** which testimony survives, and whose
voice pays for it? · *¿Qué testimonio sobrevive, y qué voz lo paga?*

## Arc · Arco

1. **Opening · Apertura:** the silent gate of Syrva, where the oldest bell
   hangs mute. Vane, the campanera, watches.
2. **First choice · Primera elección:** `c03_first_hammer` — break, keep, or
   sell the oldest bell. Each opens a different branch.
3. **Branches · Ramas (≥3):** the market district (the voice-tally and the
   stall-keepers), the bell-tower keep (the three-bell voice-sequence
   puzzle), the foundry (the foundry-crate investigation puzzle).
4. **Reversal · Reverso:** Vane's revelation — the voices are the city's
   payment to the Door, and the pact chose this a hundred years ago. The
   bell is the witness, the pod is the vessel, the price is a voice.
5. **Climax · Clímax:** the Chiming Wardens at the bell-lift; the
   bell-showdown at the threshold; the player rings, liburns, sells, or flees.
6. **Endings · Desenlaces (4):** `c03_ending_ring`, `c03_ending_liburn`,
   `c03_ending_sold`, `c03_ending_flight`.

## Node table · Tabla de nodos

| ID | Beat (EN / ES) | Outgoing choices | Consumes |
|---|---|---|---|
| `c03_arrival` | The Silent Gate / La puerta muda | `c03_enter_gate`, `c03_recall_greta` | — |
| `c03_silent_gate` | The Oldest Bell / La campana más vieja | `c03_break_bell`, `c03_keep_bell`, `c03_sell_bell` | — |
| `c03_market_district` | The Market District / El distrito del mercado | `c03_market_stalls` | broke_bell |
| `c03_market_stalls` | The Voice Tally / El recuento de voces | `c03_stalls_to_reveal` | searched_market |
| `c03_bell_tower` | The Bell-Tower Keep / La torre de las campanas | `c03_climb_tower` | kept_bell |
| `c03_tower_keep` | The Three Bells / Las tres campanas | `c03_ring_bells` | — |
| `c03_puzzle_voice` | The Voice Sequence (puzzle) / La secuencia de voces | — | — |
| `c03_voice_solved` | The Belfry Opens / El campanario se abre | `c03_voice_to_reveal` | voices_freed |
| `c03_voice_skipped` | The Bells Left Unrung / Las campanas sin tocar | `c03_voice_skip_to_reveal` | — |
| `c03_foundry` | The Foundry / La fundición | `c03_foundry_floor` | sold_bell |
| `c03_foundry_floor` | The Crate of Unrung Bells / La caja de campanas mudas | `c03_open_foundry_crate` | entered_foundry |
| `c03_puzzle_foundry` | The Foundry Crate (puzzle) / La caja de la fundición | — | — |
| `c03_foundry_solved` | The Tally Read / El recuento leído | `c03_foundry_to_reveal` | foundry_evidence |
| `c03_foundry_skipped` | The Crate Left Shut / La caja dejada cerrada | `c03_foundry_skip_to_reveal` | — |
| `c03_vane_reveal` | Vane's Revelation / La revelación de Vane | `c03_return_greta_voice`, `c03_face_wardens`, `c03_witnessing_rite` | canon:c01_greta_voice (optional) |
| `c03_greta_voice` | Greta's Voice Returned / La voz de Greta devuelta | `c03_greta_to_threshold` | canon:c01_greta_voice |
| `c03_chiming_wardens` | The Chiming Wardens / Los Guardianes Retintines | `c03_fight_wardens` | faced_wardens |
| `c03_wardens_aftermath` | The Belfry Reached (external entry) / El campanario alcanzado | `c03_aftermath_to_threshold` | fought_wardens |
| `c03_witnessing_rite` | The Witnessing Rite / El rito de testimonio | `c03_rite_to_threshold` | performed_rite |
| `c03_threshold` | The Bell-Showdown / El cara a cara de las campanas | `c03_to_ending_ring`, `c03_to_ending_liburn`, `c03_to_ending_sold`, `c03_to_ending_flight` | — |
| `c03_ending_ring` | The District Rings (terminal) / El distrito resuena | — | — |
| `c03_ending_liburn` | The Soft Bells (terminal) / Las campanas quedas | — | — |
| `c03_ending_sold` | The Bells Sold (terminal) / Las campanas vendidas | — | — |
| `c03_ending_flight` | The Silent District (terminal) / El distrito mudo | — | — |

## Puzzles · Puzles (2)

### `c03_voice_sequence` — mechanism (ordered)

- **Prompt:** three bells hang in the tower keep; ring them in the order the
  city paid them, and the belfry opens.
- **Steps (ordered):** `c03_bell_young` → `c03_bell_middle` → `c03_bell_old`
  (farmer, keeper, child — youngest to oldest voice taken).
- **Clues:** (1) the first voice was a farmer's — the youngest bell; (2) the
  last voice was a keeper's — the oldest bell.
- **Unlocks:** `c03_voices_freed`, `canon:c03_evidence_bell`. Solves to
  `c03_voice_solved`; skip to `c03_voice_skipped`.
- **Accessibility fallback:** the skip leaves the bells unrung; the district
  goes silent, but the player can still reach all endings.

### `c03_foundry_crate` — check (investigation, DC 14)

- **Prompt:** the foundry keeps a crate of unrung bells stamped with the second
  ink; read it to learn which voice the city already paid and which it still
  owes.
- **Clues / hints:** (1) the same second ink as the chapel and cargo ledgers —
  the oath-bank is continental; (2) the tally shows three voices paid and one
  owed. Clues reduce DC by 3 and 2.
- **Unlocks:** `c03_foundry_evidence`, `canon:c03_evidence_bell`. Solves to
  `c03_foundry_solved`; skip to `c03_foundry_skipped`.
- **Accessibility fallback:** the skip leaves the crate shut; the player can
  still reach the threshold and all endings.

## Encounters · Encuentros

- **Combat:** the Chiming Wardens (`c03_chiming_warden`) in `c03_bell_chamber`.
  Iron shapes carrying silenced bells as shields. On victory the
  boss-aftermath hook carries the player to `c03_wardens_aftermath`.
- **Non-combat resolution:** the witnessing rite (`c03_witnessing_rite`) — a
  performance/persuasion path that records the city's payment without freeing
  the voices.

## Consequences · Consecuencias

### Campaign outputs (carried forward) · Salidas para capítulos posteriores
- **Bells sold:** `canon:c03_bells_sold` (sold ending).
- **District saved:** `canon:c03_district_saved` (ring or liburn endings).
- **Greta's voice returned:** `canon:c03_greta_voice_returned` (if Greta's
  stolen voice from Ch1 is spoken into the oldest bell).
- **Evidence:** `canon:c03_evidence_bell` (voice sequence, foundry crate, or
  witnessing rite).
- **Faction:** `faction:bellwardens`, `faction:veiled_court` (±, adjusted by
  the bell choice and the sold ending).

### Bond / faction / conviction changes · Cambios
- `faction:bellwardens` ± (break/keep/sell bell); `faction:veiled_court` +
  (sell ending); convictions `freedom` / `compassion` / `truth` nudged by the
  bell choice and the ending.

## Oath witness / vessel / price · Testigo / vasija / precio

Per §7 of the global outline:

| Event | Witness | Vessel | Price |
|---|---|---|---|
| the voice-bells | the belfry, the whole city's ears | the iron pods | the voices themselves |

Selling a voice empties a pod; the court loses that witness past redemption.

## Inputs / Outputs (compact) · Entradas / Salidas

- **Inputs consumed:** `canon:c01_rescue_oath` (the oath the player made to the
  captives); `canon:c01_greta_voice` (Greta's stolen voice, taken in Ch1) —
  the gated choice at `c03_vane_reveal` returns it to the oldest bell.
- **Outputs guaranteed:** `canon:c03_bells_sold` or `canon:c03_district_saved`;
  `canon:c03_greta_voice_returned` (if Greta's voice was returned);
  `canon:c03_evidence_bell`; `faction:bellwardens`; `faction:veiled_court` (±).

## Translation review · Revisión de traducción

- Both languages are source; Spanish addresses the player as *tú*.
- Locked terms respected: *Syrva* / *Sirva*; *Vane, the mute-keeper* / *Vane,
  la campanera muda*. Vane is female throughout — *la campanera Vane* in both
  languages per §0.5 and §8.2.
- Idiom: "liburn the bells" (a soft, steady ringing) rendered as *hacer
  repicar suavemente las campanas* — a deliberate non-literal match for the
  campaign-specific term.