# The Tenth Door — Global Bilingual Narrative Outline

**Status:** revision for Codex review · **Version:** 0.5 · **Owner:** OpenCode outline writer

This is the master authoring outline for the ten-chapter bilingual campaign *The Tenth Door*. It is a **planning document, not playable chapter data**. It locks the continuity contracts that every later artifact — each chapter narrative at `docs/authored-campaign/chapters/chapter-NN.md` and each playable `Chapter` in `src/data/chapters/chapter-NN.ts` — must satisfy:

- ten chapter dramatic arcs;
- the exact setup/payoff chain;
- the cross-chapter state matrix;
- the faction and returning-NPC arcs;
- two deterministic routes to each of the six global endings, with explicit precedence;
- the oath witness/vessel/price accounting for every major magical event;
- the bilingual terminology glossary;
- the per-chapter input/output contracts.

Companion documents: `CAMPAIGN_BIBLE.md`, `CHAPTER_DELIVERY_CONTRACT.md`, `CODEX_REVIEW_RUBRIC.md`. This revision addresses the Codex findings on v0.4; see §11 for the disposition of each finding.

---

## 0. Contract with the engine and the existing canon

### 0.1 Chapter 1: canon retained, structure rebuilt

The ten chapters keep the bible's canon and Chapter 1's strongest scenes. Chapter 1's named canon is preserved **as canonical**: the notice and the second ink, the Black Lantern, Blackmere's barred doors, the Chapel of the Ashen Veil and the burial ledger, the flooded crypt, the Warden as jailer, the silver sealing vial, the Drowned Door and the Drowned Eye, Elder Mira, Aldric the smith, Priest Sera, Elara the healer, and the captives Tomas, Greta, and Lyra, and the five endings `ending_rescue`, `ending_sealed`, `ending_destroyed`, `ending_remembered`, `ending_relic`.

**What is not carried forward is the current graph as-is.** Chapter 1 must be rebuilt into the standard authored `Chapter` shape — 25–35 reachable nodes, exactly two puzzles, a route-determining first fork, and the same validator guarantees as in chapters 2–10 — so that the whole campaign is authored in one format. The rebuild specification lives in §1 (Chapter 1). The two existing puzzles (`c1_chapel_ledger`, `c1_drowned_door_runes`) and the five ending beats are reused.

### 0.2 Campaign state schema

All chapters share these axes (consequence notation of the delivery contract):

| Axis | Key | Range | Notes |
|---|---|---|---|
| Faction reputation | `faction:<slug>` | −5…+5 | Clamped. The eight canonical slugs only (§0.4). |
| NPC bond | `bond:<npc-id>` | −3…+3 | Clamped. |
| Conviction | `conviction:compassion\|truth\|freedom\|duty` | ≥0 | Non-negative integers. |
| Canonical fact | `canon:<stable>` | boolean | Survives the summary; must be consumed later. |
| Chapter-local fact | `local:cNN_<fact>` | boolean | Discarded at the chapter summary. |
| Chronicle | `ChapterSummary[]` | per chapter | Engine-built from `summaryFlags`. |

### 0.3 Legacy mapping — one-time engine conversion

Chapter 1's opening shipped with legacy numeric tracks. They are folded **once**, deterministically, either at migration of a legacy save or at Chapter-1 completion of a fresh run, by an engine conversion that must ship with the Chapter-1 rebuild (§11.3):

| Legacy Chapter-1 value | Canonical axis |
|---|---|
| `compassion` | `conviction:compassion` |
| `pragmatism` | `conviction:duty` |
| `independence` | `conviction:freedom` |
| `insight` | `conviction:truth` |
| `martikTrust` | `bond:martik` |
| `strangerTrust` | `bond:varen` |
| `councilTrust` | `faction:blackmere_council` |

At the same conversion point, any remaining `ashen_veil` reputation folds into `veiled_court` **once** (§0.4). After that point no chapter reads the legacy names or the `ashen_veil` slug.

### 0.4 Canonical faction slugs (only these may appear in state)

| Slug | English | Español | Notes |
|---|---|---|---|
| `blackmere_council` | Blackmere Council | Consejo de Blackmere | The village; no `blackmere` alias. |
| `salt_compact` | Salt Compact | Pacto de Sal | |
| `bellwardens` | Bellwardens | Vigías de Campana | |
| `keepers_of_names` | Keepers of Names | Guardianes de los Nombres | No `keepers` alias. |
| `iron_parliament` | Iron Parliament | Parlamento de Hierro | |
| `tidebound_fleet` | Tidebound Fleet | Armada de la Marea Atada | No `tidebound` alias. |
| `veiled_court` | Veiled Court | Corte del Velo | Fold of the Ashen Veil line; only `ashen_veil` → `veiled_court` at migration. No `veiled` alias. |
| `free_witnesses` | Free Witnesses | Testigos Libres | No `free` alias. |

Prose may use display names, but state data — flags, `faction:<slug>` deltas, matrix cells, ending predicates — uses these slugs and **never** abbreviates them.

### 0.5 Returning bonds and consistent identity

| Bond | Character | Gender (consistent across both languages) |
|---|---|---|
| `bond:martik` | Martik, innkeeper of the Black Lantern | he |
| `bond:varen` | Captain Varen, the Guide | he |
| `bond:elara` | Elara, healer of Blackmere; Act-I representative | she |
| `bond:voss` | Registrar Voss, Iron Parliament | he |
| `bond:olen` | Olen, caravan-master of the Salt Compact | she |

Pronouns in both languages must agree with the table (he/him, she/her as shown).

### 0.6 Difficulty and narration

Difficulty tuning (`story | oath | trial`) only changes numbers, never choices, consequences, or endings. All authored text is bilingual and always the complete fallback; runtime narrator text is optional polish. No chapter content or choice graph is generated at runtime.

---

## 1. The ten dramatic arcs

**Scale contract:** 25–35 reachable nodes; exactly two substantive puzzles; 3–5 reachable local endings. **Explicit exception:** the Chapter-10 block records exactly six terminal nodes, one per global ending (see §11.1).

### Chapter 1 — Los desaparecidos de Blackmere · *The Missing of Blackmere*

- **Premise (EN):** Three villagers have vanished near the Sunken Crypt; the village council would rather the matter stay quiet, and a hooded survivor drinks alone in the tavern. Beneath the crypt, the Drowned Door has started breathing again.
- **Premise (ES):** Tres aldeanos han desaparecido junto a la Cripta Sumergida; el consejo de la aldea preferiría que el asunto siguiera en silencio, y un superviviente encapuchado bebe solo en la taberna. Bajo la cripta, la Puerta Ahogada ha vuelto a respirar.
- **Dramatic question:** who turned the three disappearances into a payment — and is the rescue itself a payment?
- **Rebuild spec (structure, not prose):**
  - Graph: 25–35 reachable nodes; **exactly two puzzles**: `c1_chapel_ledger` (check, `investigation`, DC 14; unlocks the chapel tunnel route and the `tunnel_map`) and `c1_drowned_door_runes` (mechanism — the runes of the Drowned Door, ordered sequence; its route to the `ending_remembered` ending without the Shadowfen origin). **Five endings** preserved: `ending_rescue`, `ending_sealed`, `ending_destroyed`, `ending_remembered`, `ending_relic`.
  - *Early irreversible fork (node 2–3), `c1_commitment`:* choose whose account shapes the hunt — the **council road** (`c1_lean_council`), the **chapel road** (`c1_lean_chapel`), or the **stranger road** (`c1_lean_stranger`). Each choice sets one lane's unique access; the other two remain playable but lose one scene each, and the choice changes the first scout's makeup and tone.
  - *Three branches that stay separate for ≥ two nodes:*
    1. Council branch: `c1_council_chamber` → `c1_council_bargain` → `c1_archive` — offers `council_support` and the sealed journal; a lever on the council axis.
    2. Chapel branch: `c1_chapel_plea` → the ledger puzzle → `c1_tunnel_map` — offers `tunnel_map` and the `rusty_key`.
    3. Stranger branch: `c1_stranger_identity` → `c1_varen_vow` → `c1_vial` — offers `has_sealing_vial` and `bond:varen`.
    The lane verdicts then merge at the route articulation (`plan_departure`, the five route choices, per §1).
  - *Martik consequence:* `bond:martik` is a live axis. Trusted and confided in, he equips the route and his testimony helps the last door decide; deliberately deceived, he is the voice that will not answer when Chapter 9 asks — and the "witnessless" outcome is a component of several endings.
  - *Varen consequence:* `bond:varen` is decided at `c1_stranger_identity` (forgive / expose). A trusted Varen escorts the `route_varen`, discounts the `ending_remembered` gate, and later becomes a Ch9 martyr candidate; an exposed Varen widens the crypt's teeth, closes the remembered ending without the rune puzzle, and narrows the "clean seal" lane.
  - *Terminal beat requirements:* the village understands the local stake before the final local decision, but not the continental truth. Three or more local endings must be reachable on any single run; the fought-rescue ending stays mandated on the runtime.
  - *Outputs for the campaign (§9):* door state, captives' fate, relic, `rescue_oath`, `bond:martik`, `bond:varen`, `bond:elara`, and the `faction:blackmere_council` axis, plus the oath-bank reveal. Conversion as §0.3.

### Chapter 2 — El camino de sal y ceniza · *The Road of Salt and Ash*

- **Premise (EN):** Refugees and salt caravans clog the road north of Blackmere. The mistress of a Salt Compact caravan holds the only ledger that ties a voice to a vessel — the first reliable map of oath-vessels — and before the week runs out she will sell it, trade it, or burn it.
- **Premise (ES):** Refugiados y caravanas de sal llenan el camino al norte de Blackmere. La maestra de una caravana del Pacto de Sal guarda el único registro que ata una voz a una vasija — el primer mapa fiable de las vasijas de juramento — y antes de que acabe la semana lo venderá, lo canjeará o lo quemará.
- **Dramatic question:** whose word is written on that map, and who gets to read it?
- **Arc:** (1) the caravan under falling ash; if the Chapter-1 captives were rescued, two of them travel along and recognize you; (2) the *Cargo of Voices* — sealed crates that murmur — is booked north while an Iron Parliament courier tries to buy the map; (3) reversal: Olen admits the ledger records only *falsified* vows; every entry was collected, never promised; (4) a salt-storm ambush; (5) resolution — four local endings.
- **Local endings (4):** `c2_ending_partner` (the map stays with the Salt Compact), `c2_ending_sold` (the map goes to the Iron Parliament), `c2_ending_burned` (the map is burned; the dead land keeps its silence), `c2_ending_seed` (the map goes to the mute ash-children, founding the Free Witnesses).
- **First irreversible choice (node 3):** `c2_first_gate` — read the sealed cargo or leave the seals whole; each choice costs a route or an ally.
- **Branches ≥3:** the caravan road itself; the husk settlement of the ash-children; the Iron Parliament's courier road; a smuggler trench in the stiff brine.
- **Consumed earlier:** the Drowned Door's fate (Ch1). A door sealed or appeased makes the Compact trust you; an open door or a taken relic marks you a bad debt and the most valuable ledger is hidden.
- **Non-combat resolution:** refuse the map — a skill check that reveals who actually moves the ledger while the storm passes.
- **Combat:** a Wicker Wraith ambush, and a heavier bound debtor if the storm is rallied.
- **Puzzles (2):** `c2_cargo_ledger` (check, `investigation`, DC 14 — unlocks the `voice_token` item and the keepers' route) and `c2_kiln_riddle` (riddle — *"what fills the land that neither salt nor ash can hold?"* **the wind · el viento**). Both skippable.
- **Oath-law beat:** Olen swears the map is complete *on her bond to the Salt* while omitting one row — her own. The lie never corrupts the ledger; it leaves a hidden vessel for later chapters. The concrete price of the road is fixed in §7.

### Chapter 3 — La ciudad de las campanas mudas · *The City of Silent Bells*

- **Premise (EN):** In the city of Syrva a promise used to ring through a bell, and the whole city echoed it. Now every bell is mute and the keeper Vane holds a bell for each voice taken. If you wait, a whole district goes dumb forever.
- **Premise (ES):** En la ciudad de Sirva, una promesa solía anunciarse con una campana y toda la ciudad la repetía. Ahora las campanas cuelgan mudas y encadenadas, y la campanera Vane guarda una campana por cada voz tomada. Si esperas, un distrito entero enmudecerá para siempre.
- **Dramatic question:** which testimony survives, and whose voice becomes its price?
- **Arc:** (1) the silent gate; (2) Vane reveals the stolen voices are the city's payment to the Door — witnesses turned vessels; (3) the party's own voices begin to thin; (4) the bell-battle: pour a voice back into the lull, break the shelves, or give Greta's stolen voice (if she survived Chapter 1) to the bell that needs it; (5) four local endings.
- **Local endings (4):** `c3_ending_ring` (the city speaks again), `c3_ending_liburn` (the shelves empty and burn; the city goes free though it remembers without voices), `c3_ending_sold` (the city sells its silence to the Veiled Court), `c3_ending_flight` (one district's people escape).
- **First choice:** `c3_first_hammer` — break, keep, or sell the oldest bell.
- **Branches:** the market district, the bell-tower keep, the foundry.
- **Consumed earlier:** `rescue_oath`; if Greta's stolen voice was never returned, Vane's bell holds it and the arc continues where Chapter 1 promised.
- **Non-combat resolution:** a witnessing rite (`performance` or `persuasion`) that stands down the guard.
- **Combat:** the "Chiming Wardens" of the bell-lift; low AC, high reflect, gear-dependent.
- **Puzzles (2):** `c3_voice_sequence` (mechanism, ordered — a four-note witness sentence) and `c3_foundry_crate` (check, `investigation`, DC 13 — which voice the city already paid). Both skippable.
- **Oath-law beat:** the bell is the witness, the iron pod is the vessel, the price is a voice. Selling a voice empties the vessel, and later the court's testimony is unreliable (§7).

### Chapter 4 — El bosque que recuerda nombres · *The Forest That Remembers Names*

- **Premise (EN):** Beyond the last road, a wood keeps the names surrendered as the price of a vow. The Keepers of Names govern that register, and to call a name back you must give another — one that someone still answers to. Somewhere in the moss rests the name of the Tenth Door.
- **Premise (ES):** Más allá del último camino, un bosque conserva los nombres entregados como precio de un juramento. Los Guardianes de los Nombres gobiernan ese registro y, para recuperar un nombre, hay que dar otro — uno que todavía alguien responda. En algún lugar del musgo reposa el nombre de la décima puerta.
- **Dramatic question:** which memory do you buy, and who pays for the other half?
- **Arc:** (1) the keeper's child states the only rule of exchange; (2) a hoarder carries a name-hoard that includes, she swears, the name of the Tenth Door; (3) reversal: the memory-cage shows you a memory that is not yours, and taking it back would imperil one of your own; (4) the Reaping sees the forest strip names from the party one by one; (5) four local endings.
- **Local endings (4):** `c4_ending_recover` (the chosen name comes back; an ally pays), `c4_ending_refuse` (no one pays; the hoard waits), `c4_ending_selfbound` (you offer your own name as collateral), `c4_ending_burn` (moss and hoarder burn; the names flow free).
- **First choice:** `c4_first_name` — surrender a living name, or break the rule openly.
- **Branches ≥3:** the Keeper's roundhouse, the hoard ditch, the memory-cage.
- **Consumed earlier:** the map and the relic of Ch1/Ch2 shape how quietly the party enters; produces **the name of the Tenth Door** held or freed, consumed at Ch9–10.
- **Non-combat resolution:** a moss-seer's rite (`religion` or `nature`) that negotiates a price-free pass.
- **Combat:** the Hunger, a name-eater that answers a well-built name; gear and argument both matter.
- **Puzzles (2):** `c4_roots_weave` (mechanism, ordered — three roots) and `c4_breath_riddle` (riddle — *what the dead swallow and the living never lend* · **breath · el aliento**). Both skippable.
- **Oath-law beat:** the moss is the witness, the root-basket is the vessel, the price is a name. Stealing without giving records a thief in the moss; the name of the Tenth Door answers only a real exchange (§7).

### Chapter 5 — El parlamento de hierro · *The Iron Parliament*

- **Premise (EN):** An exploded depot scattered receipts over the public square. Someone has shown that all oath-magic moves through a single continental register, and the Iron Parliament must rule: ban it, own it, or set the law beside it.
- **Premise (ES):** Un depósito reventado esparció recibos por la plaza. Alguien ha demostrado que toda la magia del juramento pasa por un único registro continental; el Parlamento de Hierro debe decidir si prohibirlo, poseerlo o colocar la ley junto a él.
- **Dramatic question:** does the law become the witness, or the vault?
- **Arc:** (1) the parade of witnesses; (2) the registrar's trap (Registrar Voss); (3) the countersuit springing from the free ledger; (4) the vote on the floor; (5) four local endings.
- **Local endings (4):** `c5_ending_registry` (the Iron Parliament owns the register), `c5_ending_strangled` (the register is not what it seems and it chokes), `c5_ending_free` (the names go to the Free Witnesses), `c5_ending_stalemate` (a hung vote).
- **First choice:** `c5_first_seat` — boycott the vote, take the floor, or hand the public the list meant to stay private.
- **Branches ≥3:** the public floor, the vault, the registrar's office.
- **Consumed earlier:** the map (Ch2) and the freed-or-held names (Ch4) become evidence; nothing else reshapes the vote.
- **Non-combat resolution:** the arc is procedural — a "proclamation" chain of `persuasion` / `intimidation` / `deception`.
- **Combat:** a masked collector if a witness is cornered; otherwise avoidable.
- **Puzzles (2):** `c5_chamber_locks` (mechanism — the vault's rotary exit) and `c5_teller_roll` (check, `investigation`/`history` — reading which votes were bought). Both skippable.
- **Oath-law beat:** the chamber is the witness, the steel register is the vessel, the assembly's duty to enforce is the price. Walking out of the vote blinds the institution's witness (§7).

### Chapter 6 — El mar sin mareas · *The Tideless Sea*

- **Premise (EN):** Off the west coast the sea has gone still, and beached in that calm lies the Continental Vault — a vessel larger than a village that holds, in one keel, the names of the debts and the witnesses of a whole tide. Its tide engine is broken, and the fleet cannot sail.
- **Premise (ES):** Frente a la costa oeste, el mar se ha quedado sin marea. Varada en esa calma descansa la Bóveda del Continente: una vasija mayor que una aldea que guarda con un solo casco los nombres de las deudas y los testigos de una marea entera. Su motor de mareas está roto y la armada no puede zarpar.
- **Dramatic question:** who opens the Vault — and what does the tide pay?
- **Arc:** (1) the fleet that cannot sail; (2) the nine keys scattered; (3) the incursion between the wrecks; (4) the midnight leap at the engine; (5) four local endings.
- **Local endings (4):** `c6_ending_opened` (the Vault goes to those it serves), `c6_ending_mastered` (the fleet keeps it, and keeps silence), `c6_ending_drawn` (a merchant assembly takes hold of it), `c6_ending_stranded` (nothing opens; the sea's secret dies).
- **First choice:** `c6_first_sea` — hand the Vault to an institution, share it as a commons, or wake the engine and break the tide forever.
- **Consumed earlier:** the Chapter-2 map opens the Vault's register only if the Chapter-4 names are free; a fenced name bolts the Vault shut — a full branch hinge.
- **Non-combat resolution:** "let the tide go" — an `arcana` or `religion` check that re-rigs the engine to another flow.
- **Combat:** the lance-brigands on the decks; optional boss **the Anchored**, a chained hull that must be unmade beneath the engine.
- **Puzzles (2):** `c6_tide_chart` (check, `survival`/`athletics` — the ruined tide-tables) and `c6_vault_riddle` (riddle — *what holds the sea back and calls itself a door?* **the flood-gate · la esclusa**). Both skippable.
- **Oath-law beat:** the fleet's last witnesses sit in the Vault's ledger, the keel is the vessel, the price is the whole tide. Sacking the Vault makes the price hit every coast at once, with no corruption (§7).

### Chapter 7 — El asedio de los nombres · *The Siege of Names*

- **Premise (EN):** When the roads meet above the salt waste, the collectors that cannot be fought come for every name this campaign has carried. The only wall that can outlast the night is the one built from allies.
- **Premise (ES):** Cuando los caminos se cruzan sobre el erial de sal, acuden los cobradores con los que no se puede combatir, por todos los nombres que lleva esta campaña. La única muralla que puede resistir la noche es la levantada con aliados.
- **Dramatic question:** who do you still owe — as a debt or as a link of trust?
- **Arc:** (1) a month on the walls; (2) the assembly of the Naming Wall; (3) the standard is a promise held; (4) the one name they demand is the one you carry; (5) four local endings.
- **Local endings (4):** `c7_ending_held`, `c7_ending_won`, `c7_ending_broken` (a gate falls and a keeper's name is taken), `c7_ending_riven` (the walls groan, the party itself splits).
- **First choice:** `c7_first_lead` — who carries the standard: the ally with the truest claim, yourself, or a split defense.
- **Death gate:** this chapter carries the **death** option of one bond — Elara or Varen, whoever holds the highest bond, walks the room where a price can be paid. (Resolved here or at Ch9.)
- **Consumed earlier:** the bonds; the Ch2 map built or the Ch6 Vault opened decide which flanks hold.
- **Non-combat resolution:** the midnight truce — a speech from "the torn book" that denies the collectors without a fight.
- **Combat:** "the Claim", the siege-ram through a chain of gates; equipment and traits decide.
- **Puzzles (2):** `c7_wall_lift` (mechanism — the wall-lift sequence) and `c7_creditor_check` (check, `investigation` — who is actually owed). Both skippable.
- **Oath-law beat:** the wall's witnesses are whoever stands, the standard is the vessel, the price is the defenders' names. Abandoning the breach splits vessel from truth (§7).

### Chapter 8 — La corte de los juramentos · *The Court of Broken Oaths*

- **Premise (EN):** The old compact that holds up the doors and the songs has reached its last day. In the chamber of the Veil you must prosecute it, defend it, or dissolve it with the proof the whole campaign has gathered.
- **Premise (ES):** El antiguo pacto que sostiene las puertas y las canciones ha llegado a su último día. En la sala de la Corte del Velo debes acusarlo, defenderlo o disolverlo con las pruebas que toda la campaña ha reunido.
- **Dramatic question:** did the pact save the door or break it — and what must become of the pact?
- **Arc:** (1) the assembled chamber; (2) the prosecution (led by Voss if you kept his file); (3) the objection of the broken vow; (4) the verdict; (5) four local endings.
- **Evidence set (the trial is decisive only with ≥3):** the Ch2 ledger, the Ch3 bell, the Ch4 name, the Ch5 register, the Ch6 Vault — numbered evidence the player collected during play.
- **Local endings (4):** `c8_ending_reform` (the pact is condemned and rebuilt with limits), `c8_ending_vindicated` (innocent, to be restored), `c8_ending_dissolved` (ended), `c8_ending_hung` (undecided; the question passes to Ch9–10).
- **First choice:** `c8_first_pray` — the charge: prosecute, defend, or dissolve.
- **Branches ≥3:** the witness stand, the vault of records, the old seal-room.
- **Consumed earlier:** the five evidence tracks, `bond:voss`, the doors and names, the Ch7 martyr.
- **Non-combat resolution:** the arc is procedural; the only steel is "the dead grant", an oath-bound killer who must be heard (combat or ritual — the player's choice).
- **Puzzles (2):** `c8_vow_riddle` (riddle — *the single clause no one can cut*) and `c8_seal_mechanism` (mechanism — ordering the proof of who holds the old seal). Both skippable.
- **Oath-law beat:** the trial is the witness, the pact's seal the vessel, the price the geography the pact binds. Breaking the pact in the chamber turns every broken vow into evidence (§7).
- **Output:** `c8_verdict` + evidence list.

### Chapter 9 — El último camino a Blackmere · *The Last Road to Blackmere*

- **Premise (EN):** The only road home edges past a Blackmere that has grown over the door. Every choice of the first chapter returns: sealed or open, named or nameless, the relic kept or taken. Then the last collector knocks.
- **Premise (ES):** El único camino de regreso bordea un Blackmere que ha crecido sobre la puerta. Cada elección del primer capítulo vuelve: sellada o abierta, con nombre o sin él, la reliquia conservada o perdida. Después llama el último cobrador.
- **Dramatic question:** what has become of the wound the village opened?
- **Arc:** (1) arrival — Martik, the council, the choir; (2) descent to the flooded door; (3) the last bargain, a corner or a door held; (4) the last collector; (5) four local endings.
- **Local endings (4):** `c9_ending_open`, `c9_ending_sealed`, `c9_ending_burned`, `c9_ending_martyr` (a character pays the final personal price).
- **First choice:** `c9_first_edge` — who speaks at the door: the one who owes most, the one with the most to return, or you alone.
- **Consumed earlier:** the full Chapter-1 door state, the captives, the relic, the bonds, and the Ch7–8 outcomes.
- **Non-combat resolution:** "Martik's honest price", a negotiation that closes a debt without a blow.
- **Combat:** "the gravel", an ambush of worn resolve; endurance and supplies decide.
- **Puzzles (2):** `c9_flood_lock` (mechanism — three bolts below black water) and `c9_ash_check` (check — reading the ash; the last chance to spend the relic). Both skippable.
- **Oath-law beat:** the door's recollection is the witness, the iron band of the lock is the vessel, the price is Blackmere's own silence (§7).

### Chapter 10 — La décima puerta · *The Tenth Door*

- **Premise (EN):** Behind the seal of the court, the door — the very name the campaign has carried — opens one last time. Three last commitments close a world: who witnesses its promises, what holds them, and who pays the price.
- **Premise (ES):** Tras el sello de la corte, la puerta — el nombre que esta campaña ha llevado — se abre una última vez. Tres últimas decisiones cierran un mundo: quién da testimonio de las promesas, qué las sostiene y quién paga su precio.
- **The three hand-choices (never a single button):**
  - `c10_hand_trust` — an institution becomes the witness;
  - `c10_hand_carry` — one person carries the final price;
  - `c10_hand_break` — no vault, no privilege; all terms end.
- **Six terminal nodes, one per global ending** (explicit Ch10 exception to the 3–5 local-ending rule, §11.1):
  - `c10_end_new_concord` → New Concord / Nuevo Concordato;
  - `c10_end_last_guardian` → Last Guardian / Último Guardián;
  - `c10_end_veil_ascendant` → Veil Ascendant / Ascenso del Velo;
  - `c10_end_court_restored` → Court Restored / Corte Restaurada;
  - `c10_end_unbound` → Unbound World / Mundo Desatado;
  - `c10_end_decentralized` → Decentralized Oaths / Juramentos Descentralizados.
- **Selection:** accumulated state + the final hand, evaluated by the deterministic precedence of §6.2.
- **Puzzles (2):** `c10_name_riddle` (riddle — the name of the door; if the Chapter-4 name is still unrecovered, the remaining evidence lets the player infer it) and `c10_last_mechanism` (mechanism — the bolts that only close from the inside). Both skippable; the hand choices remain available without them.
- **Oath-law beat:** the final witness, the final vessel, and the final price are chosen; the final price per ending is fixed in §7.1.

## 2. The setup/payoff chain (exact)

Each row names a concrete setup and the chapter(s) that must fire on it. A row fires only if its `canon:` fact is set; every row must be covered by per-chapter data.

| # | Setup | Payoff | What fires |
|---|---|---|---|
| S1 | Ch1 — the Drowned Door keeps a name | Ch9, Ch10 | the final seal and the hands of the last door |
| S2 | Ch1 — captives rescued or lost | Ch3, Ch9 | Greta's bell; the survivors' homecoming |
| S3 | Ch1 — the relic taken | Ch8, Ch10 | evidence; the last relic use |
| S4 | Ch1 — the door sealed | Ch2, Ch9 | the Salt's trust; the final lock |
| S5 | Ch2 — the map's fate decided | Ch6, Ch9 | vault access; roads home |
| S6 | Ch2 — the ash-children seeded | Ch9, Ch10 | the Free-Witnesses line of endings |
| S7 | Ch3 — the bells (restored / kept / sold) | Ch8 | a heard bell is evidence |
| S8 | Ch3 — the saved district | Ch8 | a living witness arrives in court |
| S9 | Ch4 — the name of the Tenth Door | Ch9, Ch10 | the final key |
| S10 | Ch5 — the register's verdict | Ch6, Ch10 | vault completeness; one of the six endings |
| S11 | Ch5 — Voss's dossier | Ch8 | prosecution / defense material |
| S12 | Ch6 — the Vault opened | Ch7, Ch10 | a flank in the siege; the concord |
| S13 | Ch7 — who held the wall | Ch8, Ch9 | who the pact is; the martyr |
| S14 | Ch7 — a bond ends in death | Ch8, Ch10 | evidence; the Guardian route |
| S15 | Ch8 — verdict: dissolved | Ch10 | Unbound / Decentralized gates |
| S16 | Ch8 — verdict: vindicated | Ch10 | Court Restored gate |
| S17 | Ch9 — the door's final state | Ch10 | the sixth ending family's light |

## 3. Cross-chapter state matrix

Legend: `S` the chapter may set it; `R` reads it (choices, conditions, or summary); `±` adjusts; blank = untouched. **Slugs are canonical (§0.4); aliases are not used.**

| Axis ↵ \ Ch. → | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| door fate | S | R | | | | | | | R,S | R |
| captives (trio) | S | R | R | | | | R | R | R | R |
| relic | S | | | | | R | | R | R | R |
| `bond:martik` | S | R | | | | | R | R | R | R |
| `bond:varen` | S | | R | R | | R | R | R | R | R |
| `bond:elara` | S | S,R | S,R | R | | R | ± | R | R | R |
| `bond:olen` | | S | R | R | R | R | R | R | R | R |
| `bond:voss` | | | | R | S | R | | R | R | R |
| `conviction:compassion` | S | R | R | R | R | R | R | R | R | R |
| `conviction:truth` | S | R | R | R | R | R | R | R | R | R |
| `conviction:freedom` | S | S,R | R | R | S | R | R | R | R | R |
| `conviction:duty` | S | R | R | R | S | R | R | R | R | R |
| `faction:blackmere_council` | S | ± | R | | | | R | R | S | R |
| `faction:salt_compact` | ± | S | R | | R | R | R | | | |
| `faction:bellwardens` | | S | R | | R | R | R | | | |
| `faction:keepers_of_names` | | | S | R | R | | R | R | | R |
| `faction:iron_parliament` | | | | | S | R | R | R | R | R |
| `faction:tidebound_fleet` | | | | | | S | R | R | R | R |
| `faction:veiled_court` | | | S | R | R | R | | R | R | R |
| `faction:free_witnesses` | | S | R | | R | R | R | R | R | R |

The matrix rows are contract: a chapter writing a cell the matrix does not grant is rejected. Chapter-1 `ashen_veil` reputation exists only until the migration conversion (§0.3); it never appears in later cells.

## 4. Faction arcs

| Faction | Founded | Arc | Feeds endings |
|---|---|---|---|
| `blackmere_council` | Ch1 | cover-up → disclosure → the last road | New Concord (common), or the absent voice |
| `salt_compact` | Ch2 | holder of the map; sale or seed | New Concord, Decentralized |
| `bellwardens` | Ch3 | the bells as the guard of testimony | Veil, New Concord |
| `keepers_of_names` | Ch4 | the register obeyed or undone | Court Restored, Veil |
| `iron_parliament` | Ch5 | owner of the vault register | New Concord, Court Restored, Veil |
| `tidebound_fleet` | Ch6 | keeps or yields the Vault | New Concord, Unbound |
| `veiled_court` | Ch8 | rule restored or refused | Veil, Court Restored |
| `free_witnesses` | Ch2 seed / Ch9 | the ash-children's simple ceremony | Decentralized |

## 5. Returning-NPC arcs

**Martik — the first witness (Blackmere).** Bond established in Chapter 1, deepened at the fork. In Chapter 9 he is the *doorkeeper of the last road*; with `bond:martik ≥ 2` he can be the people's witness to a new order. A betrayed Martik becomes a silence in the finale — never a cosmetic branch, never a button.

**Varen — the Guide, the Door's debt.** Tied in Chapter 1 and pulled back through Ch3 (why he sealed his company in), Ch4 (a name he knew), Ch6 (the Vault), Ch7 (the walls), Ch9 (the last road). With `bond:varen ≥ 2` he offers himself for `c9_ending_martyr`; in the `carry` path that makes him the Guardian. If estranged or (rarely) dead, each of his defenses thins.

**Elara — Act-I representative, the memory-price.** She is the early traveler, the voice of Ch2–3, hesitant in Ch4, the *death-capable* in Ch7, the first testimonial in Ch8, and in Ch9 she may choose to remain as the village's second hero. Her bonds drive the endings she unlocks:
- *loyalty* (`bond:elara ≥ 4`): steady voice for `c8_ending_vindicated`, the `carry` Guardian path, and the free-witnesses roads;
- *estrangement* (`bond:elara < 0`): poorer voices; courts misread her;
- *death* (Ch7 battle, or the `c9_ending_martyr`): evidence of the price; the Guardian has to rest on another bearer.

**Voss — Act-II institutional rival (Ch5).** A registrar, not a villain; he believes in the institution so strongly he would feed it anyone. With `bond:voss ≥ 0` he drafts the New Concord clause and Ch8's reform; at `≤ −2` he returns as the defense's blade at the trial.

**Olen — the Salt caravan-master (she), Act-I/II.** The map is her life; she is the architect of the first reliable map of oath-vessels. Her bond is set in Ch2, she moves with the campaign into Ch4 and the Ch6 Vault, and — if not spent on the wall — she is the Free Witnesses' anchor, or the witness that the road is only ever a deal.

## 6. The six global endings — deterministic routes with explicit precedence

The ending is chosen by **accumulated state + the final hand**. No single final choice overrides the campaign. Each of the six endings has exactly **two deterministic routes**; a route fires when its stated conditions all hold; **no two routes in the same hand can fire simultaneously** (they are mutually exclusive predicates, see §6.2). Every route cites consequences from **at least three distinct earlier chapters** (labeled `Ch#`). Difficulty never changes the routes.

### 6.1 Hands and their pairings

| Hand | Ending pairs evaluated for that hand |
|---|---|
| `c10_hand_trust` | New Concord *or* Court Restored |
| `c10_hand_carry` | Last Guardian *or* Veil Ascendant |
| `c10_hand_break` | Unbound World *or* Decentralized Oaths |

### 6.2 Selector precedence

For a given hand, the selector evaluates the two paired endings in the fixed order below and **stops at the first match**. If neither matches, that hand yields no ending, and a single "hung" node is reached in the final beat (the world wavers; the chronicle records a neutral close). The pairs define mutually exclusive predicates — they require disjoint facts, and the precedence resolves any edge overlap:

1. **Court Restored** fires before **New Concord** when the hand is `trust`.
2. **Last Guardian** fires before **Veil Ascendant** when the hand is `carry`.
3. **Decentralized Oaths** fires before **Unbound World** when the hand is `break`.

### 6.3 The twelve deterministic routes

**New Concord / Nuevo Concordato** (`c10_hand_trust`)
- **N1:** `canon:map_shared` set in Ch2 (map public) **and** `c5_ending_registry` reached in Ch5 **and** `c8_ending_reform` in Ch8 **and** at least 3 of the eight `faction:*` values ≥ +1. *(Distinct earlier chapters: 2, 5, 8.)*
- **N2:** `bond:olen ≥ 1` (Ch2) + `c6_ending_opened` (Ch6) + `c8_ending_reform` (Ch8) + `bond:voss ≥ 0` (Ch5). *(Distinct earlier chapters: 2, 5, 6, 8.)*

**Court Restored / Corte Restaurada** (`c10_hand_trust`) — *both routes require the Chapter-8 verdict.*
- **R1:** `c8_ending_vindicated` (Ch8) + `c5_ending_registry` (Ch5) + `c4_ending_recover`/the name of the Tenth Door handed to the old keeper (Ch4). *(Distinct earlier chapters: 4, 5, 8.)*
- **R2:** `c8_ending_vindicated` (Ch8) + trial evidence ≥3 of the listed five (drawn from Ch2/4/6) + `bond:voss ≥ 0` (Ch5). *(Distinct earlier chapters: at least 3 of {2, 4, 5, 6} plus 8.)*

**Last Guardian / Último Guardián** (`c10_hand_carry`)
- **G1:** `bond:varen ≥ 3` or `bond:elara ≥ 3` (Ch1) + the Ch7 bond death-lane resolved alive and willing (Ch7) + `c9_ending_martyr` reached (Ch9). *(Distinct earlier chapters: 1, 7, 9.)*
- **G2:** `bond:martik ≥ 2` (Ch1) + the Ch1 door was sealed (`c1:sealed_drowned_door`) + `c7_ending_held` kept by the community (Ch7) + `c9_ending_sealed` (Ch9). *(Distinct earlier chapters: 1, 7, 9.)*

**Veil Ascendant / Ascenso del Velo** (`c10_hand_carry`)
- **V1:** `c3_ending_sold` (Ch3) + `faction:veiled_court ≥ +2` built from Ch3 and Ch5 + the veil ratified at Ch8. *(Distinct earlier chapters: 3, 5, 8.)*
- **V2:** `c4_ending_selfbound` (Ch4 — the player's own name accepted as collateral) + `c7_ending_broken` (Ch7, a name taken and held silently) + `faction:veiled_court ≥ +1` (Ch3). *(Distinct earlier chapters: 3, 4, 7.)*

**Unbound World / Mundo Desatado** (`c10_hand_break`)
- **U1:** `c2_ending_burned` (Ch2) + `c6_ending_stranded` (Ch6) + `c8_ending_dissolved` (Ch8). *(Distinct earlier chapters: 2, 6, 8.)*
- **U2:** `c5_ending_free` (Ch5) + `c8_ending_dissolved` (Ch8) + `c7_ending_won` (Ch7). *(Distinct earlier chapters: 5, 7, 8.)*

**Decentralized Oaths / Juramentos Descentralizados** (`c10_hand_break`)
- **D1:** `c2_ending_seed` (Ch2) + `faction:free_witnesses ≥ 3` (grown in Ch5 and Ch9) + `c8_ending_dissolved` (Ch8). *(Distinct earlier chapters: 2, 5, 8, 9 — three minimum always satisfied.)*
- **D2:** `c7_ending_held` (Ch7) + `c8_ending_dissolved` (Ch8) + `faction:free_witnesses ≥ 1` (Ch2 seed carried). *(Distinct earlier chapters: 2, 7, 8.)*

Each row above labels its distinct chapter set inline; the validator checks that the three-distinct requirement holds and that the predicates of the paired endings in a hand are disjoint.

### 6.4 Chapter 10 terminal nodes

Six distinct terminal nodes, one per `globalEndingId`, reached by the precedence order above. Remove shared-node variants.

## 7. Oath witness / vessel / price — accounting for every major magical event

By the law of oaths: magic exists only when the oath names a witness, a vessel, and a price. Breaking an oath never causes generic infection; it transfers, distorts, or weaponizes one of the three. Each row's terms are **named (or inferable) before the reveal** in the chapter's prose.

| # | Ch. | Event | Witness | Vessel | Price | If the player breaks it |
|---|---|---|---|---|---|---|
| 1 | 1 | the falsified abductions | the chapel ledger and the door-stone | the black water and the Drowned Door | the three names Tomas, Greta, Lyra | leaving them (`ending_relic`): the price is still collected, the vessel grows, and the map of who owes lengthens |
| 2 | 1 | the sealing | the Door, while listening | the silver sealing vial | the chamber must give nothing back — the name of the Door stays sealed in it | using the relic after the seal: the seal is an empty act; the water answers no name |
| 3 | 2 | Olen's hand-fair | Olen's name over the ledger | the map of the vessels | one sealed voice per caravan crossing — the road's entire agreed freight | returning that freight to the wrong road a single season: the Compact wrongs the ash; the map hides its one row |
| 4 | 3 | the voice-bells | the belfry (the entire city's ears) | the iron pods of the bell-eyes | the voices themselves | selling a voice empties a pod; the court's testimony loses that witness |
| 5 | 4 | the name-rent | the moss and its keeper | the root-basket | one living name per recovered name | taking without giving: the moss records the theft and the name answers wrongly |
| 6 | 5 | the parliamentary pledge | the assembled chamber | the steel register | the assembly must enforce the laws it passes | walking out of the vote blinds the institution's witness; the Ch9 door has no legal ear |
| 7 | 6 | the sea's vault | the fleet's last witnesses (in the ledger) | the Continental Vault, the keel | the tide itself — permanent high tide while the vault stands | sacking the Vault: the price hits every coast at once; the seas grow shallow and flat |
| 8 | 7 | the wall-oath | whoever stands before the wall | the standard | the defenders' own names until the siege ends | abandoning the breach: the standard and the truth part, and the Ch8 evidence reads as forgery |
| 9 | 8 | the court-oath | the trial, the witnesses | the old pact's seal | the geography the pact binds — a world held in place | tearing the seal in the chamber turns every broken vow into legal evidence |
| 10 | 9 | the door's peace | the door's recollection | the iron band of the lock | Blackmere's silence and the village's knowledge | fleeing before the deal: the wound becomes a legend and reshapes the Ch10 close |
| 11 | 10 | the last sealing | the chosen final witness (§7.1) | the chosen final vessel (§7.1) | the exact price of the ending chosen (§7.1) | the world chooses with the accord or without it — never a soft failure |

### 7.1 The exact final price of each of the six endings

| globalEndingId | Final witness | Final vessel | Final price |
|---|---|---|---|
| `new_concord` | the new Concord assembly (all eight factions) | the shared annual register | the signatories give up the claim of secrecy forever; a fee of one confirmed oath-run is law-bound every season |
| `court_restored` | the Veiled Court, restored | the re-bound pact seal, exchanged and judged by the evidence | re-hermetic duty: the restored court redeems the compact's bookkeeping and accepts one keeper's silence each year |
| `last_guardian` | one living person (the Guardian) | the Guardian's own body and carried standard | the price already announced in Ch1: the bearer gives their visible history — no one alive may know their name again |
| `veil_ascendant` | the Veiled Court and its redactors | the compiled memory-keep (what survives of every vessel) | the world's memories of the promises themselves, paid one generation at a time |
| `unbound` | none — no witness survives | no vessel — nothing holds | the true total of all promise-claims is paid once by everyone at once across the (austerity) night |
| `decentralized` | every community | every community's own small vessel (a well, a bell, a ledger) | each town shoulders its own fraction, sealed by its own names, forever |

The exact wording of these prices must also appear prose-mapped in the Ch10 narrative document.

## 8. Bilingual terminology glossary (locked)

| EN | ES | Kind | First chapter | Notes |
|---|---|---|---|---|
| The Tenth Door | La décima puerta | gate | 10 | the last threshold |
| The Drowned Door | La Puerta Ahogada | vessel | 1 | a mouth that answers a name |
| The Drowned Eye | El Ojo Ahogado | symbol | 1 | |
| The Sunken Crypt | La Cripta Sumergida | area | 1 | |
| The Warden (the Jailer) | El Guardián (el carcelero) | enemy | 1 | a jailer, never a guard |
| Blackmere | Blackmere | village | 1–10 | |
| Martik | Martik | NPC | 1–10 | innkeeper (he) |
| Varen | Varen | NPC | 1–9 | the Guide (he) |
| Elara | Elara | NPC | 1–9 | healer (she) |
| Voss | Voss | NPC | 5–9 | registrar (he) |
| Olen | Olen | NPC | 2 | caravan-master (she) |
| the ash | la ceniza | region | 2 | |
| the Salt Compact | el Pacto de Sal | faction | 2 | slug `salt_compact` |
| the map of oath-vessels | el mapa de las vasijas de juramento | artifact | 2 | the first reliable map |
| the ash-children | los hijos de la ceniza | NPCs | 2 | the seed of the free |
| the Cargo of Voices | el cargamento de voces | artifact | 2 | sealed crates |
| Syrva | Sirva | city | 3 | the mute city |
| the silent bells | las campanas mudas | artifact | 3 | |
| Vane the silent-keeper | Vane, la campanera paciente | NPC | 3 | bell-tower keeper (she) |
| the Keepers of Names | los Guardianes de los Nombres | faction | 4 | slug `keepers_of_names` |
| the name of the Tenth Door | el nombre de la décima puerta | secret | 4 | a key |
| the Iron Parliament | el Parlamento de Hierro | faction | 5 | slug `iron_parliament` |
| the steel register | el registro de Estado | artifact | 5 | the parliament's book |
| the Continental Vault | la Bóveda del Continente | vessel | 6 | |
| the Tideless Sea | el mar sin mareas | sea | 6 | |
| the Naming Wall | la Muralla de los Nombres | location | 7 | |
| the old compact | el Antiguo Pacto | institution | 8 | |
| the Veiled Court | la Corte del Velo | faction | 8 | slug `veiled_court` |
| the Free Witnesses | los Testigos Libres | faction | 9 | slug `free_witnesses` |

Locked operational terms — **no replacement allowed in chapter text:**

| EN | ES |
|---|---|
| oath | juramento |
| to break an oath | quebrantar un juramento |
| witness | el testigo / la testigo |
| vessel | la vasija |
| the price | el precio |
| to pay the price | pagar el precio |
| hand of trust / hand of carry / hand of break | la mano de confiar / la mano de llevar / la mano de romper |

Translation policy: both languages are source; neither may be a bare synopsis of the other. Idioms are rewritten, not transliterated; names and core facts match. Spanish consistently addresses the player in the singular (tú), never voseo.

## 9. Per-chapter input/output contracts (compact)

| Ch | Consumes (from earlier) | Produces (for later) |
|---|---|---|
| 1 | — (start) | door fate; captives; relic; `rescue_oath`; `bond:martik`; `bond:varen`; `bond:elara`; `faction:blackmere_council`; oath-bank reveal |
| 2 | gate fate; captives; relic | `map_fate`; ash-children seed; `bond:olen`; `faction:salt_compact`; `oath_bank_revealed` |
| 3 | captives (Greta); `rescue_oath` | bells verdict; district; `faction:bellwardens`; optionally `greta_voice_recovered` |
| 4 | map; relic; | `name_of_door` held/freed; moss-register signal; keeper bond |
| 5 | map; names; evidence-1-3 | `bond:voss`; register verdict; `faction:iron_parliament`; bill marker |
| 6 | map openness; free names; tide | `vault_*`; `faction:tidebound_fleet`; `tide_free` |
| 7 | bonds; map; vault | ally status; martyr flag; evidence list |
| 8 | evidence ≥3; `bond:voss`; doors; names | `c8_verdict`; evidence tally |
| 9 | door state; captives; council; bonds; relic | final door state; the keeper who stays |
| 10 | the whole chronicle | the six global endings (one per `globalEndingId`) |

## 10. Authoring checklist (every chapter)

1. 25–35 reachable nodes; exactly two puzzles; 3–5 reachable local endings (§1.1 for Ch1; Ch10 ends with six global endings).
2. First irreversible choice by the 4th–5th node.
3. ≥3 branches stay separate for ≥2 nodes.
4. At least one consequence consumed from an earlier chapter.
5. One non-combat resolution to a dangerous conflict; one combat where equipment and stats change tactics.
6. One setup that pays off elsewhere.
7. Consequence text after the decision, never numeric previews before it.
8. Both languages present and equal; no placeholders; singular tú address.
9. Canonical faction slugs only in state.
10. Every introduced `canon:` fact consumed here or later; local facts `local:cNN_`.
11. Name the witness, vessel, and price in the narrative before the reveal.
12. Ch10's six terminal nodes map **1-to-1** onto the six `globalEndingId`s; no shared-node variants.

## 11. Deviations and dispositions of the Codex findings

1. **Chapter-10 exception, explicit:** Ch10 uses exactly six terminal nodes, one per `globalEndingId`, instead of the bible's 3–5 local endings. The validator's ending-count rule is relaxed (Chapter-10 exception); all other chapters are 3–5.
2. **Canonical faction slugs only.** No `blackmere`, `keepers`, `tidebound`, `veiled`, or `free` aliases exist in state. Prose names may stay friendly (the Free Witnesses) but state uses the slug list of §0.4.
3. **Legacy conversion is engine work** — required, shipped with the Ch1 rebuild: at migration and at Ch1 completion, `ashen_veil → veiled_court` once; and the story `values` map on to convictions/bonds/faction per §0.3. No engine-relief is claimed.
4. **The 12 global-ending routes** are enumerated and assigned with explicit precedence (§6.2–6.3). Each cites ≥3 distinct earlier chapters. Court Restored routes include the Ch8 verdict.
5. **Names created at-outline** (Syrva, Vane, Olen, Voss) remain canonical-unless-collision; the campaign leads renames if any collides with a known author's distinctive matter.
6. **No playable chapter data** was written; this document only plans, and it does not claim Ch1 is already complete — Ch1 is to be rebuilt to the §1 spec.

## 12. Self-check (run before worker_done)

- Reread every EN and ES premise; fixed singular-tú address in the ES premises and the Ch6 EN/ES equivalence.
- Verify the 12 routes fire mutually exclusive and each cites ≥3 chapters.
- Confirm every Chapter-10 terminal node maps one-to-one to a global ending.
- Confirm all state tables use canonical slugs only.
- Confirm the legacy conversion is declared engine work (§0.3, §11.3).
- Confirm Elara (she), Olen (she), Martik (he), Varen (he), Voss (he) pronouns match in both languages.
- Commit only `docs/authored-campaign/GLOBAL_OUTLINE.md`.

---

This revision is submitted for review. `worker_done` means ready for Codex; it is not approval or integration authorization.