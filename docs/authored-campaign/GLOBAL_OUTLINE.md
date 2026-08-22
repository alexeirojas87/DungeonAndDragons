# The Tenth Door — Global Bilingual Narrative Outline

**Status:** draft for Codex review · **Version:** 0.6 · **Owner:** OpenCode outline writer

This is the master authoring outline for the ten-chapter bilingual campaign *The Tenth Door*. It is a **planning document, not playable chapter data**. It locks the continuity contracts every later artifact must satisfy — each chapter narrative (`docs/authored-campaign/chapters/chapter-NN.md`) and each playable `Chapter` (`src/data/chapters/chapter-NN.ts`):

- ten chapter dramatic arcs (structure + bilingual premises);
- the exact setup/payoff chain with literal `canon:` keys;
- the cross-chapter state matrix (write-then-read order enforced);
- faction and returning-NPC arcs;
- two deterministic qualifying routes to each of the six global endings, with explicit precedence and an exhaustive resolver;
- the oath witness/vessel/price accounting for every major magical event;
- the bilingual terminology glossary;
- the per-chapter input/output contracts.

Companion documents: `CAMPAIGN_BIBLE.md`, `CHAPTER_DELIVERY_CONTRACT.md`, `CODEX_REVIEW_RUBRIC.md`.

**ID convention (binding).** Every chapter-scoped node, choice, puzzle, and local-ending identifier begins with the two-digit chapter prefix `c01_` through `c10_`. Choice, node, puzzle, and ending ids are globally unique. The global-ending identifiers are exactly the six values in §6.3. Canonical facts used in cross-chapter predicates are literal `canon:cNN_*` keys (registered in §8.4). No `c1_…`, `c2_…`, … single-digit forms are valid anywhere.

---

## 0. Contract with the engine and the existing canon

### 0.1 Chapter 1: canon retained, structure rebuilt

Chapter 1's named canon and strongest scenes are canonical: the posted notice, the second ink, the Black Lantern, Blackmere's barred doors, the Chapel of the Ashen Veil and its burial ledger, the flooded crypt, the Warden as jailer, the silver sealing vial, the Drowned Door, the Drowned Eye, Elder Mira, Aldric, Priest Sera, Elara, and the captives Tomas, Greta, and Lyra, and the five original endings `ending_rescue`, `ending_sealed`, `ending_destroyed`, `ending_remembered`, `ending_relic`.

The shipped graph is not carried over as-is. Chapter 1 is rebuilt to the standard authored `Chapter` shape — 25–35 reachable nodes, exactly two puzzles, a route-determining first fork, same validator guarantees as chapters 2–10 — reusing the two existing puzzle designs (`c01_chapel_ledger`, `c01_drowned_door_runes`) and re-minting the five endings under the canonical names below. The legacy ending ids map onto the new ids (§0.3); every existing `c1_…` id migrates to `c01_…` at the same step.

### 0.2 Campaign state schema

| Axis | Key | Range | Notes |
|---|---|---|---|
| Faction reputation | `faction:<slug>` | −5…+5 | Clamped; eight canonical slugs only (§0.4). |
| NPC bond | `bond:<npc-id>` | −3…+3 | Clamped. |
| Conviction | `conviction:compassion\|truth\|freedom\|duty` | ≥0 | non-negative integers |
| Canonical fact | `canon:cNN_<slug>` | boolean | survives the summary; must be consumed or declared carried |
| Chapter-local fact | `local:cNN_<slug>` | boolean | discarded at the chapter summary |
| Chronicle | `ChapterSummary[]` | per chapter | engine-built from `summaryFlags` |

### 0.3 Legacy mapping — two engine-side conversions, each shippable

Two one-time deterministic conversions are engine work (§11.3). They are required, not optional, and they are the only place where old identifiers may appear:

- **State-value mapping:** legacy Chapter-1 tracks (`compassion`, `pragmatism`, `independence`, `insight`, `martikTrust`, `strangerTrust`, `councilTrust`) map respectively onto `conviction:compassion | conviction:duty | conviction:freedom | conviction:truth | bond:martik | bond:varen | faction:blackmere_council`.
- **Identifier mapping:** every legacy `c1_…` id (nodes, choices, puzzles) maps to its `c01_…` equivalent. The five legacy ending ids map explicitly:

| Legacy ending id | New canonical id |
|---|---|
| `ending_rescue` | `c01_ending_rescue` |
| `ending_sealed` | `c01_ending_sealed` |
| `ending_destroyed` | `c01_ending_destroyed` |
| `ending_remembered` | `c01_ending_remembered` |
| `ending_relic` | `c01_ending_relic` |

Where a save is already on a Chapter-1 ending, the chronicle is completed with the mapped id before chapter 2 loads. In the same conversion, remaining `ashen_veil` reputation folds into `veiled_court` (once); after that point no chapter reads the legacy names or the `ashen_veil` slug.

### 0.4 Canonical faction slugs (only these may appear in state)

| Slug | EN | ES | Notes |
|---|---|---|---|
| `blackmere_council` | Blackmere Council | Consejo de Blackmere | the village; no alias |
| `salt_compact` | Salt Compact | Pacto de Sal | introduced Ch2 |
| `bellwardens` | Bellwardens | Vigías de Campana | introduced Ch3 |
| `keepers_of_names` | Keepers of Names | Guardianes de los Nombres | introduced Ch4 |
| `iron_parliament` | Iron Parliament | Parlamento de Hierro | introduced Ch5 |
| `tidebound_fleet` | Tidebound Fleet | Armada de la Marea Atada | introduced Ch6 |
| `veiled_court` | Veiled Court | Corte del Velo | adjusted from Ch3 (fold of the Ashen Veil); formal seat Ch8 |
| `free_witnesses` | Free Witnesses | Testigos Libres | seeded Ch2, gathered Ch9 |

State data uses slugs, never abbreviations (`blackmere`, `keepers`, `tidebound`, `veiled`, `free` are invalid).

### 0.5 Returning bonds and identity

| Bond | Character | Works across | Gender (both languages) |
|---|---|---|---|
| `bond:martik` | Martik, innkeeper of the Black Lantern | 1–10 | he |
| `bond:varen` | Captain Varen, the Guide | 1–10 | he |
| `bond:elara` | Elara, healer; Act-I representative | 1–10 | she |
| `bond:voss` | Registrar Voss | 5–10 | he |
| `bond:olen` | Olen, caravan-master (Salt) | 2–10 | she |
| `bond:sylva` | Sylva, the moss-keeper of Ch4 | 4, 8, 10 | she (stable named Ch4 bond, consumed in Ch8 & Ch10, §8.4) |

### 0.6 Difficulty and narration

`story | oath | trial` changes numbers only, never choices, consequences, or endings. Authored bilingual text is always the complete fallback; runtime narrator text is optional polish. No chapter content or choice graph is generated at runtime.

---

## 1. The ten chapter arcs

**Scale:** 25–35 reachable nodes, exactly two puzzles, 3–5 reachable local endings — with the single explicit exception that Chapter 10 is exactly six terminal nodes (§11.1).

### Chapter 1 — Los desaparecidos de Blackmere · *The Missing of Blackmere*

- **Premise (ES):** Tres aldeanos han desaparecido junto a la Cripta Sumergida; el consejo prefiere silencio; un superviviente encapuchado bebe solo en la taberna; bajo la cripta, la Puerta Ahogada ha vuelto a respirar.
- **Premise (EN):** Three villagers have disappeared by the Sunken Crypt; the council wants the matter kept silent; a hooded survivor drinks alone in the tavern; beneath the crypt, the Drowned Door has started breathing again.
- **Dramatic question:** who turned three disappearances into a payment — and is the rescue itself a payment?
- **Rebuild spec:**
  - Graph 25–35 nodes; **puzzles**: `c01_chapel_ledger` (check, DC 14), `c01_drowned_door_runes` (mechanism, ordered); **endings** `c01_ending_rescue`, `c01_ending_sealed`, `c01_ending_destroyed`, `c01_ending_remembered`, `c01_ending_relic` (five local endings mapped from legacy, §0.3).
  - **Early irreversible fork `c01_commitment` (nodes 2–3):** choose whose account shapes the hunt — `c01_lean_council`, `c01_lean_chapel`, `c01_lean_stranger`. Sets one unique lane access; each lane stays separate ≥2 nodes.
  - **Three branches (≥2 nodes, distinct):** (a) council branch (`c01_council_chamber` → `c01_council_bargain` → `c01_archive`; yields `faction:blackmere_council` tension, the sealed journal); (b) chapel branch (`c01_chapel_plea` → the `c01_chapel_ledger` puzzle → `c01_chapel_path`/`c01_tunnel_map`); (c) stranger branch (`c01_stranger_identity` → `c01_varen_vow` → `c01_vial`). Merge at `c01_plan_departure`.
  - **Martik consequence:** `bond:martik` is set by trust he believed (or betrayed) during the fork: ≥2 he equips you for the escape and may be Ch9/10's people's witness; ≤ −2 he becomes the silent door the finale refuses to hear.
  - **Varen consequence:** decided at `c01_stranger_identity` (forgive / surrender). Forgiven → `bond:varen` ≥1, opens `route_varen` and the "clean seal" lane; exposed → door fights fortified, the seal lane narrows.
- **Consumed earlier:** none (campaign start).
- **Outputs:** door fate (`canon:c01_door_*`), captives (`canon:c01_trio_rescued | c01_trio_lost`), relic (`canon:c01_relic_claimed`), `rescue_oath`, and the three bonds; the oath-bank reveal (`canon:c01_oath_bank`).

### Chapter 2 — El camino de sal y ceniza · *The Road of Salt and Ash*

- **Premise (ES):** Refugiados y caravanas de sal llenan el camino al norte de Blackmere. La maestra de una caravana del Pacto de Sal guarda el único registro que ata una voz a una vasija; antes de que acabe la semana lo venderá, lo canjeará o lo quemará.
- **Premise (EN):** Refugees and salt caravans crowd the north road. A Salt Compact caravan-master holds the only ledger that binds a voice to a vessel — the first true map of oath-vessels — and before the week is out she will sell it, trade it, or burn it.
- **Dramatic question:** whose word is written on that map, and who gets to read it?
- **Arc:** the caravan under the ash (Trio rescued join it) · the *Cargo of Voices* and the Iron Parliament courier · Olen's reversal (the ledger holds only falsified vows) · the salt-storm crossing · **4 local endings**: `c02_ending_partner`, `c02_ending_sold`, `c02_ending_burned`, `c02_ending_seed`.
- **First irreversible choice (node 3):** `c02_first_gate` — read the sealed cargo or leave the seals whole.
- **Branches ≥3:** the caravan road; the ash-children's husk; the courier's road; the brine trench.
- **Consumed earlier:** the Drowned Door's fate (`canon:c01_door_*`) and captive survival — a trusted village lets the Salt trust you.
- **Non-combat resolution:** refuse the map; a skill check exposes who really moves the ledger.
- **Combat:** Wicker Wraith ambush + a bound debtor when the storm is rallied.
- **Puzzles:** `c02_cargo_ledger` (check, `investigation` 14 → `{ voice_token }`, keepers' route) and `c02_kiln_riddle` (riddle — *what neither salt nor ash can keep?* **the wind · el viento**).
- **Oath-wave:** Olen swears the map is complete on her bond — and leaves her own row off it. The price of the road: one sealed voice per crossing (§7).
- **Outputs:** `canon:c02_map_*` (variant per ending), `bond:olen`, `faction:salt_compact`, `canon:c02_ash_seed`, `bond:varen` stays, evidence.
- **Puzzles exactly two; both skip-tolerant.**

### Chapter 3 — La ciudad de las campanas mudas · *The City of Silent Bells*

- **Premise (ES):** En la ciudad de Sirva una promesa se escuchaba por una campana; ahora cada campana es una jaula de voces, y el portero Vane guarda una campana por cada voz que tomó. Si te demoras, un distrito entero callará para siempre.
- **Premise (EN):** In Syrva a promise once rang through a bell; now each bell is a cell of voices, and the keeper Vane holds one bell per stolen voice. If you wait, an entire district goes silent forever.
- **Dramatic question:** which testimony survives, and whose voice pays for it?
- **Arc:** the silent gate · Vane's revelation (voices are the city's payment to the Door) · the party's own voices thinning · the bell-showdown · **4 local endings**: `c03_ending_ring`, `c03_ending_liburn`, `c03_ending_sold`, `c03_ending_flight`.
- **First choice:** `c03_first_hammer` — break, keep, or sell the oldest bell.
- **Branches ≥3:** the market district, the bell-tower keep, the foundry.
- **Consumed earlier:** `rescue_oath` and whether Greta's stolen voice was returned in Ch1 (`canon:c01_greta_voice`); the returning of Greta's voice to the bell is the continuation the Ch1 arc promised.
- **Non-combat resolution:** a witnessing rite (`performance` / `persuasion`).
- **Combat:** the *Chiming Wardens* of the bell-lift.
- **Puzzles:** `c03_voice_sequence` (mechanism, ordered) and `c03_foundry_crate` (check, `investigation`) — which voice the city already paid.
- **Oath-law beat:** the bell is the witness, the pod is the vessel, the price is a voice (§7).
- **Outputs:** `canon:c03_bells_*`, `canon:c03_district_*`, `faction:bellwardens`, `faction:veiled_court` (adjust), optionally `canon:c01_greta_voice_returned`.

### Chapter 4 — El bosque que recuerda nombres · *The Forest That Remembers Names*

- **Premise (ES):** Más allá del último camino, un bosque guarda los nombres pagados como precio de un juramento. Los Guardianes de los Nombres gobiernan el registro, y para devolver un nombre hay que dar otro que todavía alguien responda.
- **Premise (EN):** Beyond the last road a wood stores the names surrendered as an oath price. The Keepers of Names govern the register; to take a name back you must give another — one someone still holds.
- **Dramatic question:** which memory do you buy — and who pays for the other half?
- **Arc:** the keeper Sylva sets the only rule of trade · the hoarder holding *The name of the Tenth Door* · the reversed memory · the Reaping · **4 endings**: `c04_ending_recover`, `c04_ending_refuse`, `c04_ending_selfbound`, `c04_ending_burn`.
- **First choice:** `c04_first_name` — surrender a live name or break the rule.
- **Branches ≥3:** the Keeper's roundhouse, the hoard ditch, the memory-cage.
- **Consumed earlier:** the map battle and the relic from Ch1/Ch2 change how quietly the party enters.
- **Non-combat resolution:** a moss-seer's rite (`religion` / `nature`).
- **Combat:** the Hunger that answers a well-shaped name.
- **Puzzles:** `c04_roots_weave` (mechanism) and `c04_breath_riddle` (riddle — *what the dead borrow and the living never lend* — **breath · el aliento**).
- **Oath-wave:** the moss is the witness, the root-basket the vessel, the price one name (§7).
- **Outputs:** `canon:c04_name_*` (ein; the name of the Tenth Door held/freed), `faction:keepers_of_names`, `bond:sylva`, `conviction:truth` (read-ins).

### Chapter 5 — El parlamento de hierro · *The Iron Parliament*

- **Premise (ES):** Un depósito reventado esparció recibos por la plaza; se ha demostrado que la magia del juramento pasa por un registro continental, y el Parlamento de Hierro debe decidir: prohibirlo, poseerlo o hacer la ley a su lado.
- **Premise (EN):** An exploded vault scattered receipts over the plaza; a proof that all oath-magic flows through one continental register; the Iron Parliament must decide to ban it, own it, or put law beside it.
- **Dramatic question:** does the law become the witness, or the vault?
- **Arc:** the parade of witnesses · Registrar Voss's trap · the free-ledger countersuit · the vote · **4 endings**: `c05_ending_registry`, `c05_ending_strangled`, `c05_ending_free`, `c05_ending_stalemate`.
- **First choice:** `c05_first_seat` — boycott the vote, take the floor, or hand the list to the people.
- **Branches ≥3:** the public floor, the vault, Voss's office.
- **Consumed earlier:** the map (`canon:c02_map_*`) and the freed name (`c04`); they become evidence.
- **Non-combat resolution:** the whole arc procedural — a proclamation chain.
- **Combat:** a masked collector, avoidable.
- **Puzzles:** `c05_chamber_locks` (mechanism) and `c05_teller_roll` (check).
- **Oath-wave:** the chamber is the witness, the register is the vessel, enforcement is the price (§7).
- **Outputs:** `canon:c05_registry_*`, `canon:c05_voss_file`, `bond:voss` (set here), `faction:iron_parliament`.

### Chapter 6 — El mar sin mareas · *The Tideless Sea*

- **Premise (ES):** Frente a la costa oeste el mar se ha quedado sin marea; varada descansa la Vasija del Continente, una bóveda mayor que un pueblo donde el mar guardó los nombres y las deudas de toda la costa; su motor de mareas está roto.
- **Premise (EN):** Off the west coast the sea has gone still; beached in that calm lies the Continental Vault, a vessel larger than a village holding the names and debts of an entire coastline; its tide engine is broken.
- **Dramatic question:** who opens the Vault — and what does the tide pay?
- **Arc:** the unused fleet · the nine keys · the night run between the wrecks · the engine · **4 endings**: `c06_ending_opened`, `c06_ending_mastered`, `c06_ending_drawn`, `c06_ending_stranded`.
- **First choice:** `c06_first_sea`.
- **Branches ≥3:** the fleet decks, the dry docks, the deep hold.
- **Consumed earlier:** the map (`c02_map`) opens the Vault's register **only if** the freed names of Ch4 are free (`c04` name freed); a fenced name bolts the Vault.
- **Non-combat resolution:** "let the tide go" (`arcana` / `religion`).
- **Combat:** lance-luggers on the decks; optional boss **the Anchored**.
- **Puzzles:** `c06_tide_chart` (check) and `c06_vault_riddle` (riddle — **the sea-gate · la esclusa**).
- **Oath-wave:** the fleet eye is the witness, the keel the a vessel, the price the whole tide (§7).
- **Outputs:** `canon:c06_vault_*`, `faction:tidebound_fleet`.

### Chapter 7 — El asedio de los nombres · *The Siege of Names*

- **Premise (ES):** Cuando los caminos se cruzan sobre el erial de sal, llegan los cobradores de nombres que nadie puede combatir; la única muralla que puede resistir la noche es la erigida con aliados.
- **Premise (EN):** When the roads cross the salt waste, name-collectors no one can fight come for every name this campaign has carried; the only wall that can outlast the night is the one built from allies.
- **Dramatic question:** who do you still owe — and does that call come as a debt or as a defense?
- **Arc:** a month on the walls · the Assembly of the Naming Wall · the standard held · "the only name they want is the one you carry" · **4 endings**: `c07_ending_held`, `c07_ending_won`, `c07_ending_broken`, `c07_ending_riven`.
- **First choice:** `c07_first_lead` — who carries the standard.
- **Death gate:** this chapter carries the *death* option of one bond — Elara or Varen (highest bond) walks the room where one price can be paid; resolved here or at Ch9. If a death happens, `canon:c07_bond_death` is set.
- **Consumed earlier:** all the bonds; the Ch2 map; the opened Vault (`ch6 vault`) decide which flanks hold.
- **Non-combat resolution:** the midnight truce (traspinto from "the torn book").
- **Combat:** *the Claim*, the ram through a chain of gates.
- **Puzzles:** `c07_wall_lift` (mechanism) and `c07_creditor_check` (check).
- **Oath-wave:** the walls witness, the standard is the vessel, the defenders' names are the price (§7).
- **Outputs:** `canon:c07_wall_*`, `canon:c07_bond_death` (if a bond ends), `faction:free_witnesses` (gathered), ally evidence.

### Chapter 8 — La corte de los juramentos incumplidos · *The Court of Broken Oaths*

- **Premise (ES):** El antiguo pacto que sostiene las puertas y las canciones está en su último día; en la sala de la Corte del Velo debes acusarlo, defenderlo o disolverlo con las pruebas que toda la campaña ha reunido.
- **Premise (EN):** The old compact that holds doors and songs in balance has reached its last day; in the Veiled Court you must prosecute it, defend it, or dissolve it, using every piece of evidence the campaign has earned.
- **Dramatic question:** did the pact save the door or break it — and what must the pact become?
- **Arc:** the assembled chamber · the prosecution (Voss, if his file exists) · the objection of the broken vow · the verdict · **4 endings**: `c08_ending_reform`, `c08_ending_vindicated`, `c08_ending_dissolved`, `c08_ending_hung`.
- **First choice:** `c08_first_pray` — the charge: prosecute, defend, or press dissolution.
- **Branches ≥3:** the witness stand, the record vault, the old seal-room.
- **Consumed earlier:** five evidence tracks, `bond:voss`, doors & names of earlier chapters, `canon:c07_bond_death`.
- **Non-combat resolution:** the whole arc is procedural; the only steel is *the dead grant* (an oath-bound killer heard by ritual or combat — player's choice).
- **Puzzles:** `c08_vow_riddle` (riddle) and `c08_seal_mechanism` (mechanism).
- **Outputs:** `canon:c08_verdict_*`, evidence tally for Ch9/10.

### Chapter 9 — El último camino a Blackmere · *The Last Road to Blackmere*

- **Premise (ES):** El único camino de regreso bordea un Blackmere que ha crecido sobre la puerta; cada elección del primer capítulo vuelve — sellada o abierta, con nombre o sin él, la reliquia conservada o perdida —; después llama el último cobrador.
- **Premise (EN):** The road home edges past a Blackmere that has grown over the door; every choice of the first chapter returns — sealed or open, named or nameless, relic kept or taken — and then the last collector knocks.
- **Dramatic question:** what has become of the wound the village opened?
- **Arc:** arrival (Martik, the council, the choir) · the flooded door · the last bargain · the choice at the threshold · **4 endings**: `c09_ending_open`, `c09_ending_sealed`, `c09_ending_burned`, `c09_ending_martyr`.
- **First choice:** `c09_first_edge` — who speaks at the door (the one who owes most / the one with most to give / you alone).
- **Consumed earlier:** full Ch1 door state, captives, relic, the bonds, `c08_verdict_*`.
- **Non-combat resolution:** "Martik's honest price" — a talk that closes a debt without a blow.
- **Combat:** *the gravel* ambush (endurance and supplies matter).
- **Puzzles:** `c09_flood_lock` (mechanism, 3 bolts) and `c09_ash_check` (check — last chance to spend the relic).
- **Outputs:** `canon:c09_door_*`, `canon:c09_martyr`; feeds the Ch10 selector.

### Chapter 10 — La décima puerta · *The Tenth Door* *(full outline completeness)*

- **Premise (ES):** Tras el sello de la corte, la puerta — el nombre que esta campaña ha llevado — se abre por última vez; tres últimas decisiones cierran un mundo: quién será testigo de sus juramentos, quién guardará la vasija, y quién pagará el precio.
- **Premise (EN):** Behind the court's seal, the Door — the very name this campaign has carried — opens one last time; three final commitments close a world: who will witness its oaths, who will keep the vessel, and who will pay the price.
- **Dramatic question:** not whether it can be closed, but by whom, in what vessel, and for what price.
- **Arc:** (1) the descent to the Ante-Threshold — crossing onto the door with the whole company; (2) the *Council of Witnesses* mirrors every bond accrued; (3) the reversal — the last Collector arrives insisting the full tally resolves *today*; (4) the *Reckoning of Oaths* (non-combat climax) beside the **Thief of Names** (combat climax); (5) the six terminal nodes.
- **First consequential choice (nodes 2–3):** `c10_first_pledge` — whom you openly side with first inside the chamber: the Assembly's Clerk (`c10_lean_trust`), the Council's living Guardian (`c10_lean_carry`), or the Free people's spokesperson (`c10_lean_break`). This **does not choose the ending** — it only seeds the lean flag the resolver uses (§6.2), never overrides it.
- **Branches ≥3 (each ≥2 nodes):**
  1. *The archive-gallery* (`c10_gallery_*`) — silent stacks, the clerk's court; feeds the precedent evidence.
  2. *The witnessing-well* (`c10_well_*`) — living testimony, the crowd's pressure; feeds the human proof of the verdict.
  3. *The forged-seal* (`c10_seal_chamber_*`) — a sabotage challenge; the danger branch where the old seal's integrity is broken or repaired.
- **Non-combat resolution:** the *Reckoning of Oaths* — the moment when the Collector accuses and the party sends the full tally once. `persuasion`/`deception`/`performance` route dissolves the accusation without a final blow.
- **Combat:** the **Thief of Names** — an assassin of witness memory. Build-dependent tactics: a spell-heavy pressure wears down its concentration; an athletic or stealth route strips its stolen shapes; an archer forces the fight at range; a well-armored wall catches its lunges. Equipment and class choices create distinct, viable lanes.
- **Hands (the three commitments — never a single button):** `c10_hand_trust`, `c10_hand_carry`, `c10_hand_break`.
- **Terminal nodes — exactly six**, one per global ending, no hung node (names in the Ch10 card and §6.3):

| Terminal node | globalEndingId |
|---|---|
| `c10_end_new_concord` | `new_concord` |
| `c10_end_last_guardian` | `last_guardian` |
| `c10_end_unbound_world` | `unbound_world` |
| `c10_end_veil_ascendant` | `veil_ascendant` |
| `c10_end_court_restored` | `court_restored` |
| `c10_end_decentralized_oaths` | `decentralized_oaths` |

- **Puzzles (2):** `c10_name_riddle` (riddle — the name of the Door; if the Ch4 name was never recovered, evidence gathered in-chapter makes it inferable) and `c10_last_mechanism` (mechanism — the inner bolts; skippable, and its skip still leaves the hand resolved).
- **The selector** is §6.1–6.2; it is exhaustive by construction.

## 2. The setup/payoff chain (exact, literal `canon:` keys)

A row fires only when its `canon:` key is set by the payoff chapter's summary; every row ships in chapter data.

| # | Setup (chapter) | Key fired by | Payoff (chapter) | What fire talks |
|---|---|---|---|---|
| S1 | Ch1 — the door keeps a name | `canon:c01_door_named` | Ch9, Ch10 | final seal; gate conditions |
| S2 | Ch1 — trio rescued | `canon:c01_trio_rescued` | Ch3, Ch9 | Greta's voice; homecoming allies |
| S3 | Ch1 — trio lost | `canon:c01_trio_lost` | Ch3, Ch9 | the missing voices weigh the bell |
| S4 | Ch1 — relic taken | `canon:c01_relic_claimed` | Ch8, Ch9 | the last road — final relic use; the relic-face evidence |
| S5 | Ch2 — map's fate | `canon:c02_map_*` | Ch6, Ch9 | Vault registry; root of the vote |
| S6 | Ch2 — ash seed | `canon:c02_ash_seed` | Ch9, Ch10 | Free-Witness branch |
| S7 | Ch3 — bells | `canon:c03_bells_*` | Ch8 | a heard bell is evidence |
| S8 | Ch3 — district | `canon:c03_district_*` | Ch8 | a living witness in court |
| S9 | Ch4 — name of the Door | `canon:c04_name_*` | Ch9, Ch10 | the final key word |
| S10 | Ch5 — registry | `canon:c05_registry_*` | Ch8, Ch10 | the court bill; ending route |
| S11 | Ch5 — Voss file | `canon:c05_voss_file` | Ch8 | prosecution/defense dossier |
| S12 | Ch6 — Vault | `canon:c06_vault_*` | Ch7, Ch10 | a flank in the siege; concord data |
| S13 | Ch7 — wall's outcome | `canon:c07_wall_*` | Ch8, Ch10 | verdict evidence; changing allies |
| S14 | Ch7 — bond ended in death | `canon:c07_bond_death` | Ch8, Ch10 | evidence; Guardian routes |
| S15 | Ch8 — verdict dissolved | `canon:c08_verdict_dissolved` | Ch10 | Unbound / Decentralized gates |
| S16 | Ch8 — verdict vindicated | `canon:c08_verdict_vindicated` | Ch10 | Court Restored gate |
| S17 | Ch9 — door final | `canon:c09_door_*` | Ch10 | the last seating |

## 3. Cross-chapter state matrix

Legend: `S` = may set/write; `R` = may read (choices, conditions, summary); `±` = may adjust within range; blank = untouched. The matrix enforces write-before-read: **a cell with `R` or `±` must always have a prior chapter with `S`.**
Canonical `canon:cNN_*` facts are tracked in §8.4, not repeated here unless they are faction-state reads.

| Axis ↵ \ Ch. → | Ch1 | Ch2 | Ch3 | Ch4 | Ch5 | Ch6 | Ch7 | Ch8 | Ch9 | Ch10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| door fate (`canon:c01_door_*` / `c09_door_*`) | S | R |  |  |  |  |  | R | S,R | R |
| captives (trio) | S | R | R |  |  |  |  | R | R | R |
| relic (`canon:c01_relic`) | S |  |  | R |  |  |  | R | R | R |
| `bond:martik` | S |  |  |  |  |  |  |  | R | R |
| `bond:varen` | S |  | R | R |  | R | R | R | R | R |
| `bond:elara` | S | ± | ± | R |  |  | ± | R | R | R |
| `bond:olen` |  | S |  |  |  | R | ± |  |  | R |
| `bond:voss` |  |  |  |  | S |  |  | R | R | R |
| `bond:sylva` |  |  |  | S |  |  |  | R |  | R |
| `conviction:compassion` | S | R | R | R | R | R | R | R | R | R |
| `conviction:truth` | S | R | R | R | R | R | R | R | R | R |
| `conviction:freedom` | S | R | R | R | R | R | R | R | R | R |
| `conviction:duty` | S | R | R | R | R | R | R | R | R | R |
| `faction:blackmere_council` | S |  |  |  |  |  |  |  | S,R | R |
| `faction:salt_compact` |  | S |  |  | R | R | R | R |  | R |
| `faction:bellwardens` |  |  | S |  |  |  |  | R |  | R |
| `faction:keepers_of_names` |  |  |  | S | R |  |  | R |  | R |
| `faction:iron_parliament` |  |  |  |  | S |  | R | R |  | R |
| `faction:tidebound_fleet` |  |  |  |  |  | S | R | R |  | R |
|`faction:veiled_court` |  |  | S |  |  |  |  | R |  | R |
|`faction:free_witnesses` |  | S |  |  |  |  | R | R | R | R |
The prose in each chapter also declares its own reads (§1 cards) and outputs (§9) matching this matrix.

## 4. Faction arcs

| Faction | Founded | Act | Arc → | Steers endings |
|---|---|---|---|---|
| `blackmere_council` | Ch1 | I/III | cover-up → disclosure → last road | New Concord (common) |
| `salt_compact` | Ch2 | I/II | map-holder; sale or seed | New Concord, Decentralized |
| `bellwardens` | Ch3 | I | guard of testimony | Veil, New Concord |
| `keepers_of_names` | Ch4 | II | the moss-register obeyed or unmade | Court Restored, Veil |
| `iron_parliament` | Ch5 | II | ownership of the vault | New Concord, Veil |
| `tidebound_fleet` | Ch6 | II/III | keeps or yields the Vault | Concord, Unbound |
| `veiled_court` | Ch3 adj / Ch8 seat | I–III | rule restored or refused | Veil, Court Restored |
| `free_witnesses` | Ch2 seed | II/III | ash-children's simple ceremony | Decentralized |

## 5. Returning-NPC arcs (bonds whose payout appears)

**Martik — the first witness.** Established Ch1 (`bond:martik`); at Ch9 he is the doorkeeper of the last road; at `≥ 2` he can be the people's witness to the closing world; betrayed he is the silence in the finale.

**Varen — the Guide, the door's debt.** Ch1 (forgive/expose), pulled back through Ch3 (why he sealed his company in), Ch4 (a name he knew), Ch6 (the Vault), Ch7 (the walls), Ch9 (the last road), Ch10 (Guardian candidate; a `carry`-path witness). If `bond:varen ≥ 2` he offers himself for `c09_ending_martyr`.

**Elara — Act-I representative, the memory-price.** The early traveler, voice in Ch2–3, hesitant in Ch4, the *death-capable* in Ch7, the Ch8 testimonial, Ch9's possible stay. Endings she unlocks: loyalty (`≥4`) steady for `court_restored`, `last_guardian`, and free-witnesses roads; estranged (<0) weakens voices; death (*Ch7 or `c09_ending_martyr`*) yields `canon:c07_bond_death` evidence.

**Voss — Act-II institutional rival (Ch5; bond set at `c05_first_seat`).** A registrar, not a villain. His file (`canon:c05_voss_file`) drives Ch8's prosecution; `bond:voss ≥ 0` opens `court_restored`'s reform clause; `≤ −2` turns him to the defense's own blade. Voss state is consumed in Ch10 (the `court_restored` claim and the `veil_ascendant`/`last_guardian` institutional signatures) as a fair institutional stamp.

**Olen — caravan-master (she).** The map is her living witness; she travels through Ch6 and, if not spent on the Ch7 wall, becomes the Free Witnesses' anchor at Ch10. She is the Ch2–Ch6 actor.

**Sylva — the moss-keeper (she, Ch4).** Newly named stable Ch4 bond. `bond:sylva` is read in Ch8 (name-of-door evidence) and consumed in the Ch10 `c10_name_riddle` and `court_restored` R1 route (the name handed to the old keeper). No dangling output.

## 6. The six global endings — the selector

### 6.1 Overview

One of **exactly** these globalEndingId values is recorded: `new_concord`, `last_guardian`, `unbound_world`, `veil_ascendant`, `court_restored`, `decentralized_oaths`. No other value exists. The finale **never** admits a "hung" terminal.

### 6.2 The exhaustive selector (deterministic total function)

The selector is evaluated once, at the last Ch10 decision node. Inputs: the three final-hand choices (§1 Ch10), the accumulated campaign state, and the lean flag from `c10_first_pledge`.

Rules, in exact order:

1. **Hand eligibility is first.** `c10_hand_trust` restricts to `new_concord` / `court_restored`. `c10_hand_carry` restricts to `last_guardian` / `veil_ascendant`. `c10_hand_break` restricts to `unbound_world` / `decentralized_oaths`. The hand is the player's genuine decision and is never a single button — it is the outcome of the three commitments, made from the six options and the evidence on the table.
2. **Precedence within the pair:** for `trust`, `court_restored` is evaluated before `new_concord`; for `carry`, `veil_ascendant` before `last_guardian`; for `break`, `decentralized_oaths` before `unbound_world`. Called the **first-qualified rule**.
3. **How an ending qualifies (OR of the two routes):** For each ending, if **either** of its two §6.5-route predicates holds, the ending qualifies.
4. **Exhaustive fallback (last-qualified never empty):** The fallback is guaranteed: it is the only `#4` that always resolves; whenever the routes of a pair both miss, the fallback picks a member of the hand's pair deterministically from lean + canon tilt. It never leaves the selector unresolved. if neither of the pair qualifies by their routes, the **resolver applies the lean flag**: for each pair the fixed fallback maps
   - trust-lane: `c10_lean_trust` → `new_concord`, else `court_restored`, influenced by the `canon:c08_verdict_*` tilt;
   - carry-lane: `c10_lean_carry` → `last_guardian`, else `veil_ascendant` by `canon:c07_bond_death` weighting;
   - break-lane: `c10_lean_break` → `decentralized_oaths`, else `unbound_world`.

   The fallback is **deterministic**: it is fully specified by (lean flag + the pair's canon tilt) and never produces an empty result.
5. **No single button may override the campaign.** The fallback chooses between the two members of the hand's pair only, and only when neither qualifying route fired; it never picks outside the pair and never runs against a match.

Because steps 1–4 are a total function over the reachable states, **every reachable final-hand state deterministically reaches one of the two endings of its hand.**

### 6.3 globalEndingId values (canonical)

| Terminal | `globalEndingId` | Final witness | Final vessel | Final price (exact, §7.1) |
|---|---|---|---|---|
| `c10_end_new_concord` | `new_concord` | the Concord assembly, all eight factions | the shared annual register | every faction gives up the claim of sovereign secrecy; one confirmed oath-run is bound into law each season. |
| `c10_end_court_restored` | `court_restored` | the Veiled Court, restored | the re-bound pact seal | the court re-accepts the compact's bookkeeping and one keeper's silence each year. |
| `c10_end_last_guardian` | `last_guardian` | one living Guardian | the body and standard of the bearer | the declared price released since Ch1: no one alive may learn the Guardian's name again. |
| `c10_end_veil_ascendant` | `veil_ascendant` | the Veiled Court and its redactors | the compiled memory-keep | one world's memory of its promises paid per generation, silently. |
| `c10_end_unbound_world` | `unbound_world` | none | none | each promise-claim paid once, at once, across the one austerity night. |
| `c10_end_decentralized_oaths` | `decentralized_oaths` | every community | each community's own small vessel (a well, a bell, a ledger) | each town shoulders its own fraction forever |

(Note: terminal **node** ids in the Ch10 card are `c10_end_*`; `globalEndingId` values are exactly the six in the second column.)

### 6.4 Overlap statement — NOT mutually exclusive

The route predicates in §6.5 are **not claimed to be pairwise mutually exclusive**. Two routes can be simultaneously true (e.g., N1 and N2 can both qualify; a state can satisfy both `veil_ascendant` V1 and V2). The resolver handles this by the **first-qualified rule in §6.2(2).** Step precedence settles ties deterministically: within an ending, route **1** takes priority over route **2** when both qualify; across the pair, the first-listed ending wins the pair. No ambiguity survives.

### 6.5 The twelve qualifying routes (two per global ending; ≥3 distinct earlier chapters each)

Each predicate cites the earliest distinct chapter consequences. **Only `canon:cNN_*`, `bond:*`, `faction:*` keys appear — no raw ending/node ids.**

**New Concord / Nuevo Concordato** (hand `trust`)
- **N1:** `canon:c02_map_shared` (Ch2) + `canon:c05_registry_governed` (Ch5) + `canon:c08_verdict_reform` (Ch8) + ≥3 factions ≥ +1. (Ch 2,5,8)
- **N2:** `bond:olen ≥ 1` (Ch2) and `canon:c06_vault_opened` (Ch6) and `canon:c08_verdict_reform` (Ch8) and `bond:voss ≥ 0` (Ch5). (Ch 2,5,6,8)

**Court Restored — `court_restored`** (hand `trust`)
- **R1:** `canon:c08_verdict_vindicated` (Ch8) + `canon:c05_registry_governed` (Ch5) + `canon:c04_name_returned` (Ch4, name handed to the keeper) + `bond:voss ≥ 0` (Ch5). (Ch 4,5,8)
- **R2:** `canon:c08_verdict_vindicated` (Ch8) + trial evidence ≥3 (drawn from `Ch2/3/4/5/6` canon keys) + `bond:voss ≥ 0` (Ch5). (Ch at least 3 of 2,3,4,5,6)

**Last Guardian — `last_guardian`** (hand `carry`)
- **G1:** (`bond:varen ≥ 3` **or** `bond:elara ≥ 3`) (Ch1) + `canon:c07_watchman_living` (Ch7, the death-lane resolved **alive**) + `canon:c09_martyr` (Ch9) — the Bearer accepts. (Ch 1,7,9)
- **G2:** `bond:martik ≥ 2` (Ch1) + `canon:c01_door_sealed` (Ch1) + `canon:c07_wall_kept` (Ch7) + `canon:c09_door_sealed` (Ch9). (Ch 1,7,9)

**Veil Ascendant — `veil_ascendant`** (hand `carry`)
- **V1:** `canon:c03_bells_sold` (Ch3) + `faction:veiled_court ≥ +2` (adjusted from Ch3) + `canon:c05_voss_file` (Ch5) + Ch8 ratified the veil (`canon:c08_verdict_ascendant`). (Ch 3,5,8)
- **V2:** `canon:c04_selfbound` (Ch4) + `canon:c07_wall_broken` (Ch7) + `faction:veiled_court ≥ +1` (adjusted Ch3). (Ch 3,4,7)

**Unbound World — `unbound_world`** (hand `break`)
- **U1:** `canon:c02_map_burned` (Ch2) + `canon:c06_vault_stranded` (Ch6) + `canon:c08_verdict_dissolved` (Ch8). (Ch 2,6,8)
- **U2:** `canon:c05_registry_free` (Ch5) + `canon:c08_verdict_dissolved` (Ch8) + `canon:c07_wall_won` (Ch7). (Ch 5,7,8)

**Decentralized Oaths — `decentralized_oaths`** (hand `break`)
- **D1:** `canon:c02_ash_seed` (Ch2) + `faction:free_witnesses ≥ +3` (grown Ch7/Ch9) + `canon:c08_verdict_dissolved` (Ch8). (Ch 2,7/8/9 — three distinct)
- **D2:** `canon:c07_wall_kept`, held by the communities themselves (Ch7) + `canon:c08_verdict_dissolved` (Ch8) + `faction:free_witnesses ≥ +1` (seeded Ch2, carried). (Ch 2,7,8)

**Coda.** The Ch10 `c10_name_riddle` and the lean graph gate the single name-of-the-door resolution; the twelve route predicates plus the lean fallback are the entire picker.

### 6.6 No seventh terminal

There is **no** hung/neutral terminal node in Ch10. When the player reaches the selector, the exhaustion of step 4 guarantees a term chosen from each hand's pair. The fallback is not a "third node", it is a selection insurance.

## 7. Oath witness / vessel / price — accounting for every major magical event

By the law of the campaign: every magical effect is the child of an oath that names a witness, a vessel, and a price. Breaking an oath never causes generic corruption; it transfers, distorts, or weaponizes one of the three (bible). The table fixes the parts; chapter prose must make them inferable before the reveal.

| Ch. | Event | Witness | Vessel | Price | If the player breaks it |
|---|---|---|---|---|---|
| 1 | the falsified abductions | the chapel ledger + the door-stone | the black water; the Drowned Door | the names (Tomas, Greta, Lyra) | `c01_ending_relic`: the price is still collected; the vessel grows; the map of debt lengthens. |
| 1 | the sealing | the Door while listening | the silver vial | the chamber must give nothing back — the name stays sealed | using the relic after the seal: the seal is hollow; the water answers no name. |
| 2 | Olen's hand-fair | Olen's name over the ledger | the map | **one sealed voice per caravan crossing** — the entire agreed freight of that road | rerouting the freight in one season: the Compact injures the ash; the map hides its gap. |
| 3 | the voice-bells | the belfry, the whole city's ears | the iron pods | the voices themselves | selling a voice empties a pod; the court loses that witness past redemption. |
| 4 | the name-rent | the moss and Sylva | the root-basket | one living name per recovered name | taking without giving: the moss records the theft and the name answers wrongly. |
| 5 | the parliamentary pledge | the assembled chamber | the steel register | the assembly's enforcement of the law | walking out blinds the institution's witness; the Ch9 door has no law to lean on. |
| 6 | the sea's vault | the fleet's recorded witnesses | the Continental Vault (the keel) | the tide itself, held at high | looting the Vault makes every coast pay at once; the sea stays flat and shallow. |
| 7 | the wall-oath | whoever stands before the wall | the standard | the defenders' names until the end | abandoning the breach splits the standard from the truth; Ch8 evidence reads as forged. |
| 8 | the court-oath | the trial and its witnesses | the old seal | the geography the pact binds | tearing the seal in the chamber turns every past broken vow into evidence. |
| 9 | the door-peace | the door's recollection | the iron band of the lock | Blackmere's silence and knowledge | fleeing the covenant outlives the keeper; the wound hardens into legend and shifts the Ch10 read. |
| 10 | the last closing | the chosen final witness | the chosen final vessel | the exact Ch10 price, per §6.3 | the resolver forces the hand; a "stop" is never a state — it is a different closing. |

### 7.1 Exact final prices (already in §6.3, repeated for the oath registry)

| `globalEndingId` | Final price |
|---|---|
| `new_concord` | every faction cedes sovereign secrecy; one confirmed oath-run is law-bound each season |
| `court_restored` | the court re-accepts the bookkeeping and one keeper's annual silence |
| `last_guardian` | no one alive may learn the Guardian's name again |
| `veil_ascendant` | each generation pays the memory of its promises |
| `unbound_world` | every promise is paid **once**, all at once, on one austerity night |
| `decentralized_oaths` | each community shoulders its own fraction forever |

## 8. Bilingual terminology glossary (locked) and canonical-fact register

### 8.1 Places and gates

| EN | ES | First appears |
|---|---|---|
| the Tenth Door | la décima Puerta | Ch10 |
| the Drowned Door | la Puerta Ahogada | Ch1 |
| the Drowned Eye | el Ojo Ahogado | Ch1 |
| the Sunken Crypt | la Cripta Sumergida | Ch1 |
| the Black Lantern | el Farol Negro | Ch1 |
| Blackmere | Blackmere | Ch1 |
| the ash | la ceniza | Ch2 |
| Syrva | Sirva | Ch3 |
| the Continental Vault | la Bóveda del Continente | Ch6 |
| the Tideless Sea | el mar sin mareas | Ch6 |
| the Naming Wall | la Muralla de los Nombres | Ch7 |
| the last road | el último camino | Ch9 |

### 8.2 People

| Person | ES | Bond | Chapters |
|---|---|---|---|
| Martik | Martik | `bond:martik` | 1–10 |
| Varen | Varen | `bond:varen` | 1–10 |
| Elara | Elara | `bond:elara` | 1–10 |
| Voss, the Registrar | el Registrador Voss | `bond:voss` | 5–10 (state consumed in Ch10) |
| Olen, caravan-master | Olen, maestra de caravana | `bond:olen` | 2–10 (returns through Ch6; re-enters Ch7/10) |
| Sylva, the moss-keeper | Sylva, guardiana del musgo | `bond:sylva` | 4–10 (bond consumed Ch8, Ch10) |
| Vane, the mute-keeper | Vane, la campanera muda | — (city npc) | 3 |

### 8.3 Monsters and forces (EN / ES)

| EN | ES |
|---|---|
| The Warden (Jailer) | El Guardián (carcelero) |
| Wicker Wraith | Espectro de mimbre |
| the Claim | la Reclamación |
| the Thief of Names | el Ladrón de Nombres |
| the gravel | la grava |

### 8.4 Canonical fact register (`canon:cNN_*` — the only cross-chapter predicate keys)

| Key | Written by | First read by |
|---|---|---|
| `canon:c01_door_named` | Ch1 | Ch9 |
| `canon:c01_trio_rescued` | Ch1 | Ch3 |
| `canon:c01_trio_lost` | Ch1 | Ch3 |
| `canon:c01_relic_claimed` | Ch1 | Ch8 |
| `canon:c01_oath_bank` | Ch1 | Ch2, Ch6 |
| `canon:c01_greta_voice` | Ch1/Ch3 | Ch8 |
| `canon:c02_map_*` (shared / sold / burned / seed / public) | Ch2 | Ch6, Ch8 |
| `canon:c02_ash_seed` | Ch2 | Ch10 |
| `canon:c03_bells_*` (ring/liburn/sold) | Ch3 | Ch8 |
| `canon:c03_district_saved | c03_district_lost` | Ch3 | Ch8 |
| `canon:c04_name_recovered`, `c04_name_returned`, `c04_selfbound`, `c04_name_free` | Ch4 | Ch10 |
| `canon:c05_registry_governed`, `c05_registry_free`, `c05_voss_file` | Ch5 | Ch8, Ch10 |
| `canon:c06_vault_opened`, `c06_vault_stranded`, `c06_vault_mastered`, `c06_vault_drawn` | Ch6 | Ch7, Ch10 |
| `canon:c07_wall_*` (held/kept/won/broken/kept-by-people) | Ch7 | Ch8, Ch10 |
| `canon:c07_watchman_living` | Ch7 | Ch10 |
| `canon:c07_bond_death` | Ch7/Ch9 | Ch8 |
| `canon:c08_verdict_reform`, `c08_verdict_vindicated`, `c08_verdict_dissolved`, `c08_verdict_ascendant`, `c08_verdict_hung` | Ch8 | Ch10 |
| `canon:c09_martyr` | Ch9 | Ch10 |
| `canon:c09_door_sealed`, `c09_door_open`, `c09_door_burned` | Ch9 | Ch10 |

(canon keys are the **only** cross-chapter fact storage; no raw node/ending ids are ever read.)

### 8.5 Translation policy

Both languages are source (neither is a synopsis of the other); idiom rewrites, not transliterations; names and core facts match; Spanish addresses the player consistently as *tú* (never *voseo*). Terms in §8.1–8.3 are locked; no chapter may substitute a near-synonym for these glossary words.

## 9. Per-chapter input/output contracts (compact)

| Ch | Consumes (earlier keys) | Produces (for later) |
|---|---|---|
| 1 | — | `canon:c01_door_*`, `canon:c01_trio_*`, `canon:c01_relic_claimed`, `canon:c01_rescue_oath`, `bond:martik`, `bond:varen`, `bond:elara`, `faction:blackmere_council` |
| 2 | `canon:c01_door_*`, `canon:c01_trio_rescued` | `canon:c02_map_*`, `canon:c02_ash_seed`, `bond:olen`, `faction:salt_compact`, `faction:free_witnesses` (seed) |
| 3 | `canon:c01_greta_voice`, `canon:c01_rescue_oath` | `canon:c03_bells_*`, `canon:c03_district_*`, `faction:bellwardens`, `faction:veiled_court` (±), `canon:c01_greta_voice_returned` |
| 4 | `canon:c02_map_*`, `canon:c01_relic_claimed` | `canon:c04_name_*`, `faction:keepers_of_names`, `bond:sylva` |
| 5 | `canon:c02_map_*`, `canon:c04_name_*` | `canon:c05_registry_*`, `canon:c05_voss_file`, `bond:voss`, `faction:iron_parliament` |
| 6 | `canon:c02_map_*`, `canon:c04_name_free` | `canon:c06_vault_*`, `faction:tidebound_fleet` |
| 7 | all bonds, `canon:c02_map_*`, `canon:c06_vault_*` | `canon:c07_wall_*`, `canon:c07_watchman_living`, `canon:c07_bond_death`, allies |
| 8 | evidence ≥3, `bond:voss`, `canon:c07_wall_*`, `canon:c07_bond_death`, door/name keys | `canon:c08_verdict_*`, evidence tally |
| 9 | `canon:c01_door_*`, trio, relic, bonds, `canon:c08_verdict_*` | `canon:c09_door_*`, `canon:c09_martyr`, the keeper who stays |
| 10 | the whole register | exactly one of six `globalEndingId`s |

## 10. Authoring checklist (every chapter)

1. 25–35 reachable nodes; exactly two puzzles; local endings 3–5 (Ch10: **exactly six** terminal nodes, one per global ending).
2. First irreversible choice by nodes 3–4.
3. ≥3 branches stay separate ≥2 nodes.
4. At least one consequence from a prior chapter via a literal `canon:cNN_*` key.
5. One non-combat resolution; one combat where build/equipment changes viable tactics (Ch10 sees §1 and must be build-sensitive).
6. Names, flags, ids **globally unique with the `cNN_` prefix**; no single-digit forms.
7. Every `canon:` introduced here is consumed later or explicitly summary-carried.
8. Consequence text after the decision; no numeric previews before it.
9. Bilingual fields everywhere; no placeholders; Spanish *tú*.
10. Faction slugs canonical; `bond:` keys from §0.5 and §8.2 only.

## 11. Deviations and dispositions (Codex v0.5 review)

1. **Ch10 exclusive six-terminal rule** — the one chapter where local-ending count is 6, all global; no hung node. Validator exception in code review.
2. **Two-digit prefixes everywhere** (`c01_…`). Migration from the pre-outline `c1_…` ids is engine-side (§11.3).
3. **Legacy conversion is engine work** (§0.3) and must ship with the Ch1 rebuild and be validated by `scripts/validate-chapters.ts` after the format lands.
4. **Route predicates are not pairwise disjoint** — resolved by first-qualified precedence + exhaustive lean fallback; never by a raw button.
5. **No raw ending/node IDs in predicates** — all cross-chapter consequences are `canon:cNN_*` keys (register §8.4).
6. **Names** (Syrva, Vane, Voss, Olen, Sylva) remain canonical-unless-collision; the campaign-lead renames before writing if a clarity issue.
7. **No playable data** was written in this outline; only contracts.

## 12. Self-check and literal audit (performed manually by the writer — no validator automates these)

Audit scope for this revision (run by the writer before `worker_done`, documented per-run):

- `c[1-9]_` single-digit prefixes: **none** — grep over the file returns zero `\bc[1-9]_`.
- `cNN_` unique prefixes: exactly `c01_…c10_` — grep listing verified.
- Invalid faction aliases (`blackmere`, `keepers`, `tidebound`, `veiled`, `free` outside display names): none in state tables.
- globalEndingId set: exactly the six (`new_concord`, `last_guardian`, `unbound_world`, `veil_ascendant`, `court_restored`, `decentralized_oaths`); terminal nodes carry the matching `c10_end_*` ids.
- Matrix order: every `R`/`±` has a prior `S` on the same axis (run a prior-write check).
- Ch10 terminal nodes: exactly six (`c10_end_*` set, §6.3 and the Chapter 10 card).
- EN and ES premise pairs: each chapter has both, sibling semantic equivalence spot-checked (§1).
- Cross-refs: all in-document pointers re-resolved against the final section numbering (no stale first-personal `#.1` refs remain); §11.3 is the legacy-conversion item.

*If a later edition of this outline is produced, the same audit must be rerun and the "verified: yes" cell asserted per-run; the document itself does not script the check.*

---

*This outline is submitted for review. `worker_done` is ready-for-review only; Codex gives the decision.*