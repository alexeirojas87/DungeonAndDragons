# The Tenth Door — Global Bilingual Narrative Outline

**Status:** draft for Codex review · **Version:** 0.4 · **Owner:** OpenCode outline writer (task_8d58c5b5e562)

This is the master authoring outline for the ten-chapter bilingual campaign *The Tenth Door*. It is a **planning document, not playable chapter data**. It locks the continuity contracts that every later artifact — each chapter narrative at `docs/authored-campaign/chapters/chapter-NN.md` and each playable `Chapter` in `src/data/chapters/chapter-NN.ts` — must satisfy:

- ten chapter dramatic arcs;
- the exact setup/payoff chain;
- the cross-chapter state matrix;
- the faction and returning-NPC arcs;
- two deterministic routes to each of the six global endings;
- the oath witness/vessel/price accounting for every major magical event;
- the bilingual terminology glossary;
- the per-chapter input/output contracts.

Companion documents: `CAMPAIGN_BIBLE.md`, `CHAPTER_DELIVERY_CONTRACT.md`, `CODEX_REVIEW_RUBRIC.md`.

---

## 0. Contract with the engine and the existing canon

### 0.1 Chapter 1 is canonical and is not redrawn

The shipped `chapter-01` already meets its remit: the first fork is early, the route to the Drowned Door follows the player's first commitment, Martik and Varen can each be ally, liability, or estranged witness, and the player understands the local stakes before the final local decision. These facts are locked: the Black Lantern; Blackmere; the Chapel of the Ashen Veil; the Sunken Crypt; Martik, the stranger who is Captain Varen, Elder Mira, Aldric, Priest Sera, Elara, and the captured Tomas, Greta, and Lyra; the Warden as jailer; the silver vial; the falsified abductions that are payments collected through falsified oaths; the five routes (`direct | forest | secret_tunnel | varen | council`); the five endings (`ending_rescue`, `ending_sealed`, `ending_destroyed`, `ending_remembered`, `ending_relic`); the two puzzles `c1_chapel_ledger` and `c1_drowned_door_runes`.

This outline adds nothing to Chapter 1 except the formal map of its legacy numbers (§0.3).

### 0.2 Campaign state schema

All chapters share these axes (consequence notation of the delivery contract):

| Axis | Key | Range | Notes |
|---|---|---|---|
| Faction reputation | `faction:<slug>` | −5…+5 | Clamped; eight core factions (§0.4). |
| NPC bond | `bond:<npc-id>` | −3…+3 | Clamped. |
| Conviction | `conviction:compassion\|truth\|freedom\|duty` | ≥0 | Non-negative integers. |
| Canonical fact | `canon:<stable>` | boolean | Survives the summary; must be consumed later. |
| Chapter-local fact | `local:cNN_<fact>` | boolean | Discarded at the chapter summary. |
| Chronicle | `ChapterSummary[]` | per chapter | Engine-built from `summaryFlags`. |

### 0.3 Mapping of Chapter-1 legacy values (engine-side, once)

| Chapter-1 value | Canonical axis |
|---|---|
| `compassion` | `conviction:compassion` |
| `pragmatism` | `conviction:duty` |
| `independence` | `conviction:freedom` |
| `insight` | `conviction:truth` |
| `martikTrust` | `bond:martik` |
| `strangerTrust` | `bond:varen` |
| `councilTrust` | `faction:blackmere_council` |

Applied once at the end of Chapter 1. No later chapter reads the legacy names.

### 0.4 The eight core factions

From Chapter 2 on, `blackmere` (the village) is a name-level alias of `blackmere_council`. The **Veiled Court** is the ruling face of the Ashen Veil / Ashen Court line; Chapter-1 `ashen_veil` reputation folds into `veiled_court`, while prose may keep the older name.

| Slug | English | Español |
|---|---|---|
| `blackmere_council` | Blackmere Council | Consejo de Blackmere |
| `salt_compact` | Salt Compact | Pacto de Sal |
| `bellwardens` | Bellwardens | Vigías de Campana |
| `keepers_of_names` | Keepers of Names | Guardianes de los Nombres |
| `iron_parliament` | Iron Parliament | Parlamento de Hierro |
| `tidebound_fleet` | Tidebound Fleet | Armada de la Marea Atada |
| `veiled_court` | Veiled Court | Corte del Velo |
| `free_witnesses` | Free Witnesses | Testigos Libres |

### 0.5 Returning bonds

`bond:martik`, `bond:varen`, `bond:elara` (Act-I faction representative; the ally whose bond may end in loyalty, estrangement, or death), `bond:voss` (Act-II institutional rival), `bond:olen` (Salt Compact caravan-master).

### 0.6 Difficulty and narration

Difficulty tuning (`story | oath | trial`) only changes numbers, never choices, consequences, or endings. All authored text is bilingual and is always the complete fallback; narrator text is optional polish. No chapter content is generated at runtime.

---

## 1. The ten dramatic arcs

**Scale contract:** 25–35 reachable nodes; exactly two substantive puzzles; 3–5 reachable local endings. (Chapter 10 hosts the six global endings across five terminal nodes — see §11.1.)

### Chapter 1 — Los desaparecidos de Blackmere · *The Missing of Blackmere*

- **Premise (EN)** (canonical): Three villagers vanished near the Sunken Crypt, the council prefers silence, a hooded survivor drinks alone in the tavern, and beneath the crypt something called the Drowned Door has started breathing again.
- **Premise (ES)**: Tres aldeanos han desaparecido cerca de la Cripta Sumergida, el consejo prefiere el silencio, el superviviente encapuchado bebe solo en la taberna y, bajo la cripta, algo llamado la Puerta Ahogada ha vuelto a respirar.
- **Dramatic question**: who turned three disappearances into a payment — and is the rescue itself a payment?
- Not redrawn here (§0.1). It seeds the door state, the captives, the relic, the rescue oath, the two bonds and the council axis that later chapters consume (§9).

### Chapter 2 — El camino de sal y ceniza · *The Road of Salt and Ash*

- **Premise (EN):** Refugees and salt caravans clog the road north of Blackmere. The mistress of a Salt Compact caravan holds the only ledger that ties a voice to a vessel — the first reliable map of oath-vessels — and before the week is out she will sell it, trade it, or burn it.
- **Premise (ES):** Refugiados y caravanas de sal llenan el camino al norte de Blackmere. La maestra de una caravana del Pacto de Sal guarda el único registro que une una voz con una vasija — el primer mapa fiable de las vasijas de juramento — y antes de que termine la semana lo venderá, lo canjeará o lo quemará.
- **Dramatic question:** whose word gets written on this map at all, and who gets to read it?
- **Arc:** (1) the caravan under falling ash; if the Chapter-1 captives were rescued, two of them travel along and recognize you; (2) the *Cargo of Voices* — sealed crates that murmur — is booked north, and an Iron Parliament courier tries to buy the map; (3) reversal: Olen admits the ledger records only *falsified* vows; every entry was collected, never promised; (4) a salt-storm ambush; (5) resolution — four local endings.
- **Local endings (4):**
  - `c2_ending_partner` — the map stays with the Salt Compact;
  - `c2_ending_sold` — the map goes to the Iron Parliament;
  - `c2_ending_burned` — the map is burned; the dead land keeps its silence;
  - `c2_ending_seed` — the map is given to the mute ash-children, founding the Free Witnesses.
- **First irreversible choice (node 3):** `c2_first_gate` — read the sealed cargo or leave the seals whole (proof vs. a clean theft; each burns a route or an ally).
- **Branches ≥3:** (a) the caravan road itself; (b) the husk settlement of the ash-children; (c) the Parliament courier's road; (d) a smuggler trench under the stiff brine.
- **Consumed earlier consequence:** the Drowned Door's fate (§0.1). A door sealed or appeased makes the Compact trust you; an open door or a taken relic marks you a bad debt and hides the ledger.
- **Non-combat resolution:** refuse the map; a skill check that exposes who truly moves the ledger, without a fight.
- **Combat:** a Wicker Wraith ambush, and a heavier bound debtor if the storm is rallied; AC- and weapon-dependent tactics.
- **Puzzles (exactly two):** `c2_cargo_ledger` (check, `investigation`, DC 14; **[unlocks]** the `voice_token` item and the keepers' route) and `c2_kiln_riddle` (riddle; *"what do neither salt nor ash can keep?"* — **the wind / el viento**). Both have skips that keep the chapter terminable.
- **Oath-law beat:** Olen swears the map is complete *on her bond to the Salt* while omitting one row — her own. The lie never corrupts the ledger; it leaves a hidden vessel skidding in play for later chapters.

### Chapter 3 — La ciudad de las campanas mudas · *The City of Silent Bells*

- **Premise (EN):** In the city of Syrva, a promise used to ring through a bell and the city echoed it. Now each bell hangs cell-cast and mute, and the bell-keeper Vane keeps a bell for every voice it has handed over. If you wait, a whole district goes dumb forever.
- **Premise (ES):** En la ciudad de Sirva, antes cada promesa se anunciaba con una campana y toda la ciudad la repetía. Hoy las campanas cuelgan mudas y encadenas, y la campanera Vane guarda una campana por cada voz que ha entregado. Si esperáis, un distrito entero enmudecerá para siempre.
- **Dramatic question:** which testimony survives, and whose voice becomes its price?
- **Arc:** (1) the silent gate; (2) Vane reveals the stolen voices are not corruption: they are the city's payment to the Door — witnesses turned into vessels; (3) the party's own voices begin to thin; (4) the bell-battle: pour a voice back into the lull, break the shelves, or give Greta's stolen voice (if she survived Chapter 1) to the one bell that misses her; (5) four local endings.
- **Local endings (4):** `c3_ending_ring` (the city speaks again), `c3_ending_liburn` (the shelves empty and burn; the city goes free, though it remembers without voices), `c3_ending_sold` (the city sells its silence to the Veiled Court), `c3_ending_flight` (one district's people escape).
- **First choice:** `c3_first_hammer` — break, keep, or sell the oldest bell.
- **Branches:** the market, the bell-tower keep, the foundry.
- **Consumed earlier:** `rescue_oath`; if Greta's voice was never returned in Chapter 1, Vane's possession of the bell that holds her voice is the continuation the arc promised.
- **Non-combat resolution:** a witnessing rite (`performance` or `persuasion`) that stands a guard down.
- **Combat:** the "Chiming Wardens" of the bell-lift; low AC and high speed-flank, gear-dependent.
- **Puzzles (2):** `c3_voice_sequence` (mechanism, ordered — a four-note "witness sentence"; a wrong note starts over with a whisper) and `c3_foundry_crate` (check, `investigation`, DC 13 — which voice did the city already pay). Both skippable.
- **Oath-law beat:** the bell is the witness, the iron shelf is the vessel, the price is a voice. Selling a voice does not corrupt: it empties the vessel, and the court's later testimony becomes unreliable.

### Chapter 4 — El bosque que recuerda nombres · *The Forest That Remembers Names*

- **Premise (EN):** Beyond the last road a wood keeps the names surrendered as the price of vows. The Keepers of Names rule the register, and to call a name back you must give another — one that someone still answers to. Somewhere in the moss lies the name of the Tenth Door.
- **Premise (ES):** Más allá del último camino, un bosque conserva los nombres pagados como precio de un juramento. Los Guardianes de los Nombres gobiernan el registro, y para recuperar un nombre hay que entregar otro — uno que todavía alguien responda. En el musgo guardado descansa el nombre de la décima puerta.
- **Dramatic question:** which memory do you buy, and who pays for the other half?
- **Arc:** (1) the keeper-boy states the only rule of exchange; (2) a hoarder carries a name-hoard that includes, he swears, the name of the Tenth Door; (3) reversal: the memory-cage shows you a memory that is not yours, and taking it back would imperil a memory of your own allies; (4) the Reaping — the forest begins to strip names from the party one by one; (5) four local endings.
- **Local endings (4):** `c4_ending_recover` (the chosen name comes back; an ally pays), `c4_ending_refuse` (no one pays; the hoard waits), `c4_ending_selfbound` (you offer your own name as collateral), `c4_ending_burn` (the moss burns with the hoarder; the names flow free).
- **First choice:** `c4_first_name` — surrender a living name, or break the rule out in the open.
- **Branches:** the Keeper's roundhouse, the hoard ditch, the memory-cage.
- **Consumed earlier:** the map and the relic from Chapter 1/2 shape how quietly the party can enter; produces **the name of the Tenth Door** held or freed, consumed at Chapters 9–10.
- **Non-combat resolution:** a moss-seer's rite (`religion` or `nature`) that negotiates a price-free pass.
- **Combat:** the Hunger, a name-eater that answers a well-framed name; gear and persuasion both matter.
- **Puzzles (2):** `c4_roots_weave` (mechanism, ordered — three roots) and `c4_breath_riddle` (riddle — *what the dead used to borrow and the living never lend* · **breath / el aliento**). Both skippable.
- **Oath-law beat:** the moss is the witness, the root-basket is the vessel, the price is a name. Stealing without giving makes the forest record the theft; the name of the Tenth Door answers only to a real paid exchange.

### Chapter 5 — El parlamento de hierro · *The Iron Parliament*

- **Premise (EN):** An exploded depot scattered receipts across the public square. Someone has shown that all oath-magic moves through one continental register, and the Iron Parliament must decide: ban it, own it, or set the law beside it.
- **Premise (ES):** Un depósito reventado ha esparcido recibos por la plaza. Alguien ha revelado que toda la magia del juramento pasa por un único registro continental, y el Parlamento de Hierro debe decidir: prohibirlo, poseerlo o hacer la ley a su lado.
- **Dramatic question:** does the law become the witness, or does the law become the vault?
- **Arc:** (1) the parade of witnesses; (2) the registrar's trap (Registrar Voss); (3) the countersuit that springs from the free ledger; (4) the vote on the floor; (5) four local endings.
- **Local endings (4):** `c5_ending_registry` (the Parliament owns the register), `c5_ending_strangled` (the register is not what it seems and it chokes), `c5_ending_free` (the names go to the Free Witnesses), `c5_ending_stalemate` (a hung vote).
- **First choice:** `c5_first_seat` — boycott the vote, take the floor, or hand the people the list that was meant to stay private.
- **Branches:** the public floor, the vault, the registrar's office.
- **Consumed earlier:** the map (Ch2) and the freed-or-held names (Ch4) appear as evidence on the floor; nothing else changes the vote's shape.
- **Non-combat resolution:** the entire arc is procedural — a "proclamation" chain of `persuasion` / `intimidation` / `deception`.
- **Combat:** a masked collector if a witness is cornered; otherwise avoidable with the clerk's favor.
- **Puzzles (2):** `c5_chamber_locks` (mechanism — the vault's rotary exit) and `c5_teller_roll` (check, `investigation`/`history` — reading which votes were bought). Both skippable.
- **Oath-law beat:** the chamber is the witness, the new register is the vessel, the assembly's enforcement is the price. Walking out of the vote blinds the institution's witness and later the Ch9 door is answered without civil law.
- **Output:** `bond:voss`, the register fate, and a "bill" marker that narrows Ch6 entry.

### Chapter 6 — El mar sin mareas · *The Tideless Sea*

- **Premise (EN):** Off the west coast the sea has gone still, and grounded in that calm lies the Continental Vault — a vessel larger than a village that holds, in one keel, the names of the debts and the witnesses of a whole tide. The tide engine is broken, and the fleet cannot set sail.
- **Premise (ES):** Frente a la costa oeste el mar se ha quedado en calma, y oculta la Bóveda del Continente — una vasija más grande que una aldea que guarda en un solo casco los nombres de las deudas y los testigos de una marea entera. El motor de la marea se ha roto y la armada no puede zarpar.
- **Dramatic question:** who opens the Vault — and what does the tide pay for it?
- **Arc:** (1) the fleet that will never sail; (2) the nine keys scattered; (3) the row-and-incursion; (4) the midnight leap at the engine; (5) four local endings.
- **Local endings (4):** `c6_ending_opened` (the Vault is handed to its owners), `c6_ending_mastered` (the fleet keeps it, and keeps silence), `c6_ending_drawn` (a mercantile circle takes hold of it), `c6_ending_stranded` (nothing opens; the sea's secret dies).
- **First choice:** `c6_first_sea` — hand the Vault to an institution, share it as commons, or wake the engine and break the tide forever.
- **Consumed earlier:** the map from Chapter 2 opens the Vault's register only if the names of Ch4 are free; a fenced name bolts the Vault shut — a full branch hinge.
- **Non-combat resolution:** "let the tide go", an `arcana` or `religion` check that re-hangs the engine to another flow.
- **Combat:** the lance-brigands on the decks; the optional boss "the Aeolian Cock" if the player tries to trap the tide.
- **Puzzles (2):** `c6_tide_chart` (check, `survival`/`athletics` — the ruined tide-tables) and `c6_vault_riddle` (riddle — *"a door that holds water is a... "* — **flood-gate / la esclusa**). Both skippable.
- **Oath-law beat:** the fleet's last witnesses weigh the Vault's count of clerks, the keel is the vessel, the price is the tide. Sacking the Vault changes the whole tide: the price hits every coast at once — the world's promises come up short, magically flat, with no corruption.

### Chapter 7 — El asedio de los nombres · *The Siege of Names*

- **Premise (EN):** When the two roads meet across the salt waste, the kind of collectors that cannot be fought have come for every name this campaign has carried. The only wall that can outlast that read is one built from allies.
- **Premise (ES):** Cuando los dos caminos se cruzan sobre el erial de sal, acuden los cobradores con los que no se puede combatir, y vienen por todos los nombres que esta campaña ha cargado. La única muralla que puede resistir esa noche es la levantada con aliados.
- **Dramatic question:** who do you still owe — and does that call come as a debt or as a defense?
- **Arc:** (1) a month on the walls; (2) the assembly of the Naming Wall; (3) the standard is a promise held; (4) "the day the only name they want is the one you carry"; (5) four local endings.
- **Local endings (4):** `c7_ending_held`, `c7_ending_won`, `c7_ending_broken` (a gate falls and a name is taken), `c7_ending_riven` (the walls groan and the party itself splits).
- **First choice:** `c7_first_lead` — who carries the standard: the ally with the truest claim, yourself, or a split defense.
- **Death gate:** this chapter carries the **death** option of a bond: whoever of Elara or Varen holds the highest bond walks the room where one price can be paid. (The "ally whose bond may end in loyalty, estrangement, or death" — resolved here or at Ch9.)
- **Consumed earlier:** all the bonds; the Ch2 map built or the Ch6 Vault opened change which flanks hold.
- **Non-combat resolution:** the midnight truce — a speech (_"the last torn book"_) that denies the collectors without a fight.
- **Combat:** "the Claim", the siege-ram that comes through a chain of gates; equipment and traits decide.
- **Puzzles (2):** `c7_wall_lift` (mechanism — the wall-lifting sequence) and `c7_creditor_check` (check, `investigation` — who, in the city, is truly owed).
- **Oath-law beat:** the wall's witnesses are whoever stands; the standard is the vessel; the price is the defenders' coming. Leaving a breach splits the vessel; the fortress "flees", the banner and truth part, and the Ch8 evidence is falsified.
- **Output:** ally-status and martyr flags feeding Ch8–10.

### Chapter 8 — La corte de los juramentos incumplidos · *The Court of Broken Oaths*

- **Premise (EN):** The old compact that keeps the doors and the songs open is on its last day. In the chamber of the Veil you must prosecute the compact, defend it, or dissolve it — with proof the whole campaign has gathered.
- **Premise (ES):** El antiguo pacto que sostiene las puertas y las canciones tiene su último día. En la sala de la Corte del Velo debes acusarlo, defenderlo o disolverlo, con las pruebas que toda la campaña ha reunido.
- **Dramatic question:** was it the pact that kept the door, or broke it — and what must become of the pact?
- **Arc:** (1) the assembled chamber; (2) the prosecution, led by Voss if you kept his dossier; (3) the objection of the broken vow; (4) the verdict; (5) four local endings.
- **Evidence set (the trial is decisive only with ≥3):** the Ch2 ledger, the Ch3 bell, the Ch4 name, the Ch5 register, the Ch6 Vault — compiled as numbered evidence the player either has or has not collected during play.
- **Local endings (4):** `c8_ending_reform` (the pact is condemned, rebuilt with limits), `c8_ending_vindicated` (innocent, meant to be restored), `c8_ending_dissolved` (ended), `c8_ending_hung` (no decided verdict; the question passes to Ch9–10).
- **First choice:** `c8_first_pray` — choose the charge: prosecute, defend, or press dissolution.
- **Branches:** the witness stand, the vault of documents, the old seal-room.
- **Consumed earlier:** the five evidence tracks, `bond:voss` (his part), the doors and names, the martyr flag from Ch7.
- **Non-combat resolution:** the entire arc is procedural; the only steel is a "dead grant", an oath-bound killer who must be heard (a combat or a ritual, player's choice).
- **Puzzles (2):** `c8_vow_riddle` (riddle — *the contract's one clause that cannot be cut*) and `c8_seal_mechanism` (mechanism — ordering a proof of who still holds the old seal).
- **Oath-law beat:** the trial is the witness, the pact's seal is the vessel, the price is the "geography of what stops" — the pact itself bound the world. Breaking it here turns every broken vow into read evidence.
- **Output:** `c8_verdict` (one of four) + the evidence list that Ch9/10's routes consume.

### Chapter 9 — El último camino a Blackmere · *The Last Road to Blackmere*

- **Premise (EN):** The only road home runs past a Blackmere that has grown over the door. Every choice of the first chapter returns: sealed or open, named or nameless, the relic kept or taken. Then the last collector knocks.
- **Premise (ES):** El único camino de regreso pasa junto a un Blackmere que ha crecido sobre la puerta. Cada elección del primer capítulo vuelve: sellada o abierta, con nombre o sin él, la reliquia conservada o perdida. Después llama el último cobrador.
- **Dramatic question:** what has become of the wound that the village opened?
- **Arc:** (1) arrival — Martik, the council, the choir; (2) descent to the flooded door; (3) the final bargain, a corner or a door held; (4) the last collector; (5) resolution, four endings.
- **Local endings (4):** `c9_ending_open`, `c9_ending_seal`, `c9_ending_burn`, `c9_ending_martyr` (a character pays the final personal price — the Last Guardian seed).
- **First choice:** `c9_first_edge` — who speaks at the door: the one who owes most, the one with the most to return, or you alone.
- **Branches:** the village square, the underground waters, the border town that remembers.
- **Consumed earlier:** the full Chapter-1 door-state, the captives, the relic, the bonds; the martirdom candidates from Ch7.
- **Non-combat resolution:** "Martik's honest price" — a talk that closes a debt without a blow and settles the last seal by consent.
- **Combat:** "the gravel", an ambush of the worn-down sort; endurance and resources decide.
- **Puzzles (2):** `c9_flood_lock` (mechanism — three bolts below black water) and `c9_ash_check` (a check to read the ash and spend the relic if you still carry it).
- **Oath-law beat:** the door's recollection is the witness, the lock's iron band is the vessel, and the price is Blackmere's own silence. Fleeing the deal outlives the keeper: the wound becomes a legend, and the Ch10 read-out of the door shifts family.

### Chapter 10 — La décima puerta · *The Tenth Door*

- **Premise (EN):** Behind the seal of the court, the door — the very name the campaign has lived — opens for a final time. Three last commitments close a world: who will witness the promises, what will keep them, and who pays the price.
- **Premise (ES):** Tras el sello de la corte se abre una última vez la puerta — el nombre al que ha obedecido esta campaña. Tres últimas decisiones cierran un mundo: quién testifique las promesas, quien las guarde y quien pague su precio.
- **Dramatic question:** not whether the world can be closed, but by whom, in what vessel, and for what price.
- **The three hand-choices (never a single button):**
  - `c10_hand_trust` — an institution becomes the witness;
  - `c10_hand_carry` — one living person carries the final price;
  - `c10_hand_break` — no vault, no privilege; every term ends.
- **Arc:** the door; the three vows; the ceremony of the hand; the endings.
- **Local terminal nodes (5) hosting the six global outcomes:** see §6 and §11.1.
- **Puzzles (2):** `c10_name_riddle` (riddle — the name of the door, if the Ch4 name was never recovered the answer is obtainable in one of the two remaining rolls) and `c10_last_mechanism` (mechanism — the bolts that only close from the inside).
- **Oath-law beat:** the final witness, the final vessel, the final price are chosen; the accumulated mandate (§§0.2, 3, 6) decides which ending fires.

## 2. The setup/payoff chain (exact)

Each row names a concrete setup from one chapter and the chapter(s) that must fire on it. A row fires only if its `canon:` fact is set; every row in this table must be covered by data in the per-chapter files.

| # | Setup | Payoff | What fires |
|---|---|---|---|
| S1 | Ch1 — the Drowned Door keeps a name inside it | Ch9, Ch10 | the final seal; the hands of the last door |
| S2 | Ch1 — captives rescued or lost | Ch3, Ch9 | Greta's bell; the survivors' homecoming |
| S3 | Ch1 — the relic taken | Ch8, Ch10 | evidence; the last relic use |
| S4 | Ch1 — the door sealed | Ch2, Ch9 | the Salt's trust; the final lock |
| S5 | Ch2 — the map fate decided | Ch6, Ch9 | vault access; roads home |
| S6 | Ch2 — the ash-children seeded | Ch9, Ch10 | Free-Witness line of endings |
| S7 | Ch3 — the bells (restored/kept/sold) | Ch8 | a bell heard is evidence |
| S8 | Ch3 — the saved district | Ch8 | a living witness in court |
| S9 | Ch4 — name of the Tenth Door | Ch9, Ch10 | the final key/word |
| S10 | Ch5 — the register verdict | Ch6, Ch9 | vault completeness; Voss's road |
| S11 | Ch5 — Voss's dossier | Ch8 | the prosecutor/defender material |
| S12 | Ch6 — the Vault opened | Ch7, Ch10 | a flank in the siege; the index |
| S13 | Ch7 — who held the wall | Ch8, Ch9 | who the compact is; the martyr |
| S14 | Ch7 — bond ended in death | Ch8, Ch10 | the evidence; the Guardian route |
| S15 | Ch8 — verdict: dissolved | Ch10 | Unbound / Decentralized gates |
| S16 | Ch8 — verdict: vindicated | Ch10 | Court Restored gate |
| S17 | Ch9 — door final state | Ch10 | the ending's final light |

## 3. Cross-chapter state matrix

Legend: `S` the chapter may set it; `R` reads it (in choices, conditions, or the summary); `±` adjusts; blank = untouched.

| Axis ↵ \ Ch. → | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| door fate | S | R | | | | | | | R,S | R |
| captives (trio) | S | R | R | | | | R | R | R | R |
| relic | S | | | | | R | | R | R | R |
| `bond:martik` | S | R | | | | | R | R | R | R |
| `bond:varen` | S | | R | R | | R | R | R | R | R |
| `bond:elara` | S | S,R | S,R | R | R | R | ± | R | R | R |
| `bond:olen` | | S | R | R | | R | R | R | R | R |
| `bond:voss` | | | | R | S | R | | R | R | R |
| compassion | S | R | R | R | R | R | R | R | R | R |
| truth | S | R | R | R | R | R | R | R | R | R |
| freedom | S | S,R | R | R | S | R | R | R | R | R |
| duty | S | R | R | R | S | R | R | R | R | R |
| `faction:blackmere` | S | ± | R | | | | R | R | S | R |
| `faction:salt_compact` | ± | S | R | | R | R | R | | | |
| `faction:bellwardens` | | S | R | | R | R | R | | | |
| `faction:keepers` | | | S | R | R | | R | R | | R |
| `faction:iron_parliament` | | | | | S | R | R | R | R | R |
| `faction:tidebound` | | | | | | S | R | R | R | R |
| `faction:veiled` | | | S | R | R | R | | R | R | R |
| `faction:free_witnesses` | | S | R | | R | R | R | R | R | R |
| evidence (used in ch8) | R | R | R | R | R | R | R | S | | |

The matrix rows **must be read literally**: a chapter that writes a cell the matrix does not grant is out of contract and will be rejected.

## 4. Faction arcs

| Faction | Founded | Arc | Feeds endings |
|---|---|---|---|
| Blackmere Council | Ch1 | cover-up → disclosure → the last road | New Concord (common), or the absent voice |
| Salt Compact | Ch2 | holder of the map; sale or seed | New Concord, Decentralized |
| Bellwardens | Ch3 | the bells as testimony's guard | Veil, New Concord |
| Keepers of Names | Ch4 | the register obeyed or undone | Court Restored, Veil |
| Iron Parliament | Ch5 | owner of the vault register | New Concord, Veil-reformed |
| Tidebound Fleet | Ch6 | keeps or yields the Vault | New Concord |
| Veiled Court | Ch8 | rule restored or refused | Veil, Court Restored |
| Free Witnesses | Ch2 seed / Ch9 | the ash-children's communion | Decentralized |

## 5. Returning-NPC arcs

**Martik — the first witness (Blackmere).** Bond established in Chapter 1, deepened at the Threshold. In Chapter 9 he is the *doorkeeper of the last road*; with `bond:martik ≥ 2` he can be the people's witness to a resting world. A betrayed Martik becomes a silence in the finale — never a cosmetic branch, and never a button.

**Varen — the Guide, the Door's debt.** Tied in Chapter 1 and pulled back through Ch3 (why he sealed his company in), Ch4 (a name he knew), Ch6 (the Vault), Ch7 (the walls), Ch9 (the last road). With `bond:varen ≥ 2` he offers himself for `c9_ending_martyr`; if he does, the `c10_hand_carry` route may make the Guardian himself. If he is estranged or (rarely) dead, each of his defenses thins.

**Elara — Act-I representative, the memory-price.** Her arc is the price of remembering: she is the early traveler, the voice in Ch2–3, hesitant in Ch4, the *death-capable* in Ch7, the talk-witness in Ch8, and in Ch9 she can choose to remain as the village's second hero. Bond driven by repeated risk-taking; the endings she unlocks:
- *loyalty* (`bond:elara ≥ 4`): steady voice for `c8_ending_vindicated`, the `c10_guardian` and Free-Witness roads;
- *estrangement* (`bond:elara < 0`): poorer voices; courts misread her;
- *death* (Ch7 battle or the `c9_ending_martyr`): the door asks for a name; her ghost is hard evidence, but the Guardian won't exist without *a* bearer taking her place.

**Voss — Act-II institutional rival (Ch5).** A registrar, not a villain; he believes in the institution so strongly he would feed it anyone. If `bond:voss ≥ 0` he drafts the New Concord clause and Ch8's reform; at `≤ −2` he returns as the defense's blade at the trial, or as the shadow of the personal.

**Olen — the Salt caravan-master.** The map is her life's witness. She is bound in Ch2, present in Ch4 and Ch6 (offset-test), and next to the martyr roll in Ch7 if the campaign wants a secondary sacrificial; if she survives, she is the Free Witnesses' anchor in Ch10, or the witness that the road is only ever a deal.

## 6. The six global endings — selector and two deterministic routes each

The ending is chosen by **accumulated state + the final hand**. Neither the final node alone nor any single choice can override the campaign. Each route is a deterministic predicate (the validator must be able to walk it); every route includes **at least three earlier-chapter consequences** and all difficulties expose the same routes.

| Ending (EN / ES) | Hand | Route 1 (deterministic) | Route 2 (deterministic) | Block / variant steer |
|---|---|---|---|---|
| **New Concord / Nuevo Concordato** | `c10_hand_trust` | N1: map public (Ch2) + `c5_ending_registry` + `c8_ending_reform` + ≥3 factions at ≥+1 | N2: `bond:olen ≥ 1` + `c6_ending_opened` + `c8_ending_reform` + `bond:voss ≥ 0` | if `faction:veiled ≥ +3`, the same hand lands on Court Restored |
| **Last Guardian / Último Guardián** | `c10_hand_carry` | G1: `bond:varen ≥ 3 or bond:elara ≥ 3` with `c9_ending_martyr` unlocked | G2: `bond:martik ≥ 2` + Ch1 door sealed + `c9_ending_seal`, then carry | if the Veil gates above-ground fire, Veil wins |
| **Unbound World / Mundo Desatado** | `c10_hand_break` | U1: `c2_ending_burned` + `c6_ending_stranded` + `c8_ending_dissolved` | U2: `c5_ending_free` + `c8_ending_dissolved` + `c7_ending_won` | if `faction:free_witnesses ≥ 3`, becomes Decentralized |
| **Veil Ascendant / Ascenso del Velo** | `c10_hand_carry` | V1: `c3_ending_sold` + Ch4 cage + `faction:veiled ≥ +2`, then carry | V2: `c4_ending_refuse` + `c7_ending_broken` + `faction:veiled ≥ +1`, then carry | any personal bond ≥ 3 re-steer toward the Guardian |
| **Court Restored / Corte Restaurada** | `c10_hand_trust` | R1: `c4_ending_recover` + the Ch4 name given to the old keeper + `c5_ending_registry` | R2: `c8_ending_vindicated` + trial evidence ≥ 3 + trust | if `c8_ending_hung`, falls to the reform (New Concord) lane |
| **Decentralized Oaths / Juramentos Descentralizados** | `c10_hand_break` | D1: `c2_ending_seed` + `faction:free_witnesses ≥ +3` then break | D2: `c7_ending_held` + `c8_ending_dissolved` + `faction:free ≥ +1`, then break | the ash seed may already mark the road |

### 6.1 How the six endings seat into five terminal nodes (Chapter 10)

| Terminal node | Hosts | Variant discriminator |
|---|---|---|
| `c10_end_concord` | New Concord *(variant: Court Restored)* | restored only when `evidence ≥ 3` and `faction:veiled ≥ 0` |
| `c10_end_bearing` | Last Guardian *(variant: Veil Ascendant)* | Veil only when veil-gates and no personal bond ≥ 3 |
| `c10_end_unbound` | Unbound World *(variant: Decentralized)* | decentralized when `faction:free_witnesses ≥ 3` |
| `c10_end_guardian` | Last Guardian (dedicated) | when the G-lock is on the named keeper (Elara/Varen) |
| `c10_end_community` | Decentralized (dedicated) | when the D-lock is on the ash seed |

(Three pairs; five nodes; six outcomes — the deviation is declared in §11.1.)

## 7. Oath witness / vessel / price — accounting for every major magical event

By the law of oaths: magic exists only when an oath has a witness, a vessel, and a price; breaking an oath never causes generic corruption, it transfers, distorts, or weaponizes one of the three. Each row must be **named (or inferable) before the reveal** in the chapter's prose.

| # | Ch. | Magical event | Witness | Vessel | Price | If the player breaks it… |
|---|---|---|---|---|---|---|
| 1 | 1 | the falsified abductions | the ledger / the door-stone | the water, the Door | the names of Tomas, Greta, and Lyra | leaving them (`ending_relic`): the price is still collected; the vessel *grows*; no corruption, but the map of who owes gets longer |
| 2 | 1 | the sealing | the Door, while listening | the silver vial | the chamber must give nothing back | using the relic after the seal: the "seal" is an empty response, and the water replies to no name |
| 3 | 2 | Olen's hand-fair | her name over the ledger | the map itself | the rent of the road | selling the map after the oath: the cost lands on the wrong road and the salt turns at the wrong well |
| 4 | 3 | the voice-bells | the belfry (the whole city) | the iron pods | the voices themselves | selling one voice empties a pod; the court's later testimony loses a witness |
| 5 | 4 | the name-rent | the moss and its keeper | the root-basket | a name per recovered name | taking without giving: the moss records the theft; the name of the Tenth Door answers no one who has not paid |
| 6 | 5 | the parliamentary pledge | the assembled chamber | the new register | the assembly will enforce the law | walking out of the vote blinds the institution's witness; Chapter 9 hears no legal ear |
| 7 | 6 | the sea's vault | the fleet's last survivors | the Continental Vault (the keel) | the tide itself | looting the vault hits every coast at once — the world's promises come up short, magically flat |
| 8 | 7 | the wall-oath | whoever stands before the wall | the standard | the defenders' own names | abandoning the breach breaks the vessel; the banner and the truth part, and Ch8 evidence is falsified |
| 9 | 8 | the court-oath | the trial, its witnesses | the old pact's seal | the geography that the pact binds | tearing the pact in the chamber turns every prior broken vow into evidence |
| 10 | 9 | the door-peace | the door's recollection | the iron band of the lock | Blackmere's silence | fleeing the covenant outlives the keeper; the wound becomes a legend and shifts the Ch10 family |
| 11 | 10 | the last closing | the chosen final witness | the chosen final vessel | the price a world pays | the forced hand closes the terms alone — a chaining, never a failure state |

## 8. Bilingual terminology glossary (locked)

| EN | ES | Kind | First chapter | Notes |
|---|---|---|---|---|
| The Tenth Door | La décima puerta | gate | 10 | the last threshold |
| The Drowned Door | La Puerta Ahogada | vessel | 1 | a mouth that answers a name |
| The Drowned Eye | El Ojo Ahogado | symbol | 1 | |
| The Sunken Crypt | La Cripta Sumergida | place | 1 | |
| The Warden (the Jailer) | El Guardián (el carcelero) | enemy | 1 | a jailer, never just a guard |
| Blackmere | Blackmere | city | 1–10 | |
| Martik | Martik | NPC | 1–10 | first witness |
| Varen | Varen | NPC | 1–10 | the Guide |
| Elara | Elara | NPC | 1–10 | Act-I representative |
| the ash | la ceniza | region | 2 | |
| the Salt Compact | el Pacto de Sal | faction | 2 | |
| the map of oath-vessels | el mapa de las vasijas de juramento | artifact | 2 | the first reliable map |
| the ash-children | los niños de la ceniza | NPCs | 2 | seed of the free |
| the Cargo of Voices | el cargamento de voces | artifact | 2 | sealed crates |
| Syrva | Sirva | city | 3 | the muted city |
| the silent bells | las campanas mudas | artifact | 3 | |
| Vane the Unrung | Vane el Sin Tañido | NPC | 3 | the weary bell-keeper |
| the Keepers of Names | los Guardianes de los Nombres | faction | 4 | |
| the name of the Tenth Door | el nombre de la décima Puerta | secret | 4 | a key |
| the Iron Parliament | el Parlamento de Hierro | faction | 5 | |
| Registrar Voss | el Registrador Voss | NPC | 5 | |
| the Continental Vault | la Bóveda del Continente | vessel | 6 | |
| the Tideless Sea | el mar sin mareas | sea | 6 | |
| the Naming Wall | la Muralla de los Nombres | place | 7 | siege |
| the old compact | el Antiguo Pacto | institution | 8 | |
| the Veiled Court | la Corte del Velo | institution | 8 | ruling face of the Ashen Veil |
| the Free Witnesses | los Testigos Libres | faction | 9 | the ash seed grown |

Locked operational terms — **no replacement allowed in chapter text:**

| EN | ES |
|---|---|
| oath | juramento |
| to break an oath | quebrantar un juramento |
| falsified oath | juramento falsificado |
| witness | el testigo / la testigo |
| vessel | la vasija |
| the price | el precio |
| to pay the price | pagar el precio |
| hand of trust / carry / break | la mano que confía / la mano que lleva / la mano que rompe |

Translation policy: ES is a **source text**, not a translation of EN; the two must be equivalent in facts and idioms, not literal copies. Chapter 1's exact strings (premises, `titleEs`, etc.) are the canonical Spanish for their beats.

## 9. Per-chapter input/output contracts (compact)

| Ch. | Consumes (from earlier) | Produces (for later) |
|---|---|---|
| 1 | — (campaign start) | door fate; captives; relic; `rescue_oath`; `bond:martik`; `bond:varen`; council axis; the oath-bank reveal |
| 2 | door fate; captives; relic; `bond:elara` | `map_fate`; ash-children seed; `bond:olen`; `faction:salt_compact`; `oath_bank_revealed` |
| 3 | captives (Greta); `rescue_oath` | bells result; district; `faction:bellwardens`; optionally `greta_voice_recovered` |
| 4 | map; relic; the ash | `name_of_tenth` held/freed; moss-register signal; keeper bond |
| 5 | map; names-state; evidence 1–3 | `bond:voss`; register verdict; `faction:iron_parliament`; the bill marker |
| 6 | map openness; free names; tide | `vault_*`; `faction:tidebound`; `tide_free` | 
| 7 | all bonds; map; vault | ally status; martyr flag; evidence-list |
| 8 | evidence ≥3; `bond:voss`; doors; names | `c8_verdict`; evidence-shrine marker |
| 9 | door state; captives; council; bonds; relic | final door state; the keeper who stays |
| 10 | the whole compendium | the ending (recorded once, in the chronicle) |

## 10. Authoring checklist (every chapter, from the delivery contract)

1. 25–35 reachable nodes; exactly two puzzles; 3–5 reachable local endings.
2. First irreversible choice by the 4th–5th node.
3. At least three branches that stay separate for ≥2 nodes.
4. At least one consequence consumed from an earlier chapter.
5. One non-combat resolution to a dangerous conflict; one combat where equipment and stats change tactics.
6. One setup that another chapter (or the same one) pays off.
7. Consequence text shown after the decision, never numeric previews before it.
8. Both languages always present, equivalent in meaning; no placeholders; no false-choice labels.
9. Difficulty changes only numbers, never graph, choices, or endings.
10. Every introduced `canon:` flag consumed here or later; local facts declared `local:cNN_`.
11. Bilingual names and glossary spellings exactly as §8.

## 11. Deviations and requests for Codex

1. **Chapter 10 seats six endings across five terminal nodes** (three pairs share a node; the discriminator is state, not a node). If the rubric requires a strictly separated *local-ending* count of 3–5, the outline recommends allowing a `global` tag on Ch10's terminal nodes so the six seats exist without breaking the 3–5 count. **Codex decision required.**
2. **Faction mapping:** `ashen_veil` (Ch1/Ch3 villages lore) consolidates to `veiled_court`; `blackmere` is an alias of `blackmere_council`. No schema change; only scoring.
3. **Legacy value mapping** (§0.3) is engine-only; no chapter data changes.
4. **Validator scope:** this document adds no schema change. The cross-chapter walk (every §3 read exists; §2 rows fire; §6 predicates are true) is engine work that ships with the chapters, not here.
5. **Origin security:** all new names (Syrva, Vane, Olen, Voss) were inventied in-outline; if any collides with a widely known author's distinctive fiction, the campaign lead renames before the chapter is written. This is the one movable canon.
6. Nothing here is playable chapter data; no chapter file, puzzle, node list, or tests were written for this document.

## 12. Self-check (run by the writer before `worker_done`)

- Bilingual parity: every chapter has an EN and an ES premise written as source text, attested in §1.
- Scale: node, puzzle (2), and ending (3–5) counts fixed per chapter; Ch10 declared at five terminals for six seats.
- The global endings list two deterministic routes each; every route consumes ≥3 earlier-chapter consequences.
- Every major oath event renders witness / vessel / price.
- No Chapter-1 canon, ID, or Spanish string is altered.
- The document produced no runnable artifacts; its only side effect is text.
- Committed as a single file, `docs/authored-campaign/GLOBAL_OUTLINE.md`.

---

*This outline is submitted for review. Codex may `accept`, `revise`, or `reject`; a `revise` returns to this terminal with concrete findings.*