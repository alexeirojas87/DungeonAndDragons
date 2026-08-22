# The Tenth Door — Campaign Bible

## Creative boundary

This is an original bilingual dark-fantasy campaign. It may use broad genre craft such as rule-bound magic, long foreshadowing, ensemble character arcs, and delayed revelations, but it must not imitate the prose, distinctive worldbuilding, characters, terminology, or scenes of any named author.

Spanish and English are equal source languages. Neither version may be a synopsis of the other. Names, flags, IDs, mechanics, and facts must match exactly across both.

## Player promise

Blackmere is the first wound in a continental crisis. Every important choice must do at least one of these things:

- change a later available choice or scene;
- change a faction reputation, NPC bond, conviction, resource, injury, or item;
- change how a later conflict can be solved;
- contribute transparently to one of the six campaign endings.

Flavor-only choices are allowed only as short role-playing beats and must not masquerade as strategic decisions.

## The law of oaths

Magic is created only when an oath has all three parts:

1. A witness who remembers and can testify to the promise.
2. A vessel that stores or manifests the promise.
3. A price that is paid now or becomes collectible later.

Breaking an oath never creates generic corruption. It transfers, distorts, or weaponizes one of those three parts. Every magical solution must name the witness, vessel, and price in the narrative or make their identities inferable before the reveal.

## Campaign structure

### Act I — The first wound

1. **Los desaparecidos de Blackmere / The Missing of Blackmere** — Rebuild the existing opening while preserving Blackmere, the Drowned Door, Martik, Varen, the flooded crypt, and the strongest existing scenes. Make the first meaningful fork arrive early. The player learns that the disappearances are payments collected through falsified oaths.
2. **El camino de sal y ceniza / The Road of Salt and Ash** — Refugees, salt caravans, and rival accounts of what Blackmere awakened. Choices determine who controls the first reliable map of oath-vessels.
3. **La ciudad de las campanas mudas / The City of Silent Bells** — A city whose bells were witnesses until their voices were stolen. Act-I decisions decide which district, faction, and truth survives.

### Act II — The broken continent

4. **El bosque que recuerda nombres / The Forest That Remembers Names** — The forest stores names surrendered as prices. Recovering one memory must imperil another.
5. **El parlamento de hierro / The Iron Parliament** — Factions demand law, control, or abolition. Reputation and bonds must materially alter votes, allies, and combat alternatives.
6. **El mar sin mareas / The Tideless Sea** — A stranded fleet guards a continental-scale vessel. Earlier control of routes and names changes access.
7. **El asedio de los nombres / The Siege of Names** — Ensemble payoff: allies recruited, estranged, or killed across Chapters 1–6 determine the shape of the defense.

### Act III — The price of a world

8. **La corte de los juramentos incumplidos / The Court of Broken Oaths** — The party must prosecute, defend, or dissolve the old compact with evidence accumulated through play.
9. **El último camino a Blackmere / The Last Road to Blackmere** — Return through places transformed by the player’s choices. No route may be a simple recap.
10. **La décima puerta / The Tenth Door** — The final decision resolves who witnesses the world’s promises, what vessel holds them, and who pays their price.

## Global endings

All difficulties expose the same routes and six endings. Endings are selected from accumulated state plus final decisions; no single final button may override the campaign.

1. **New Concord / Nuevo Concordato** — institutions share oversight and accept enforceable limits;
2. **Last Guardian / Último Guardián** — one bonded guardian accepts the final personal price;
3. **Unbound World / Mundo Desatado** — oath magic is ended, with its protections and coercion both removed;
4. **Veil Ascendant / Ascenso del Velo** — secrecy and controlled memory become the new order;
5. **Court Restored / Corte Restaurada** — the ancient centralized system returns, reformed or unchanged according to evidence;
6. **Decentralized Oaths / Juramentos Descentralizados** — communities become their own witnesses and vessels.

Every ending needs at least two deterministic, validator-covered paths and must acknowledge at least three earlier chapter consequences.

## Persistent state

- Faction reputation is an integer from -5 through +5.
- NPC bonds are integers from -3 through +3.
- Convictions are `compassion`, `truth`, `freedom`, and `duty`, each a non-negative integer.
- Canonical choices are stable IDs. Once shipped, IDs must never be renamed.
- Flags are boolean facts, not scores. A flag introduced by a choice must be read later, summarized, or explicitly declared local-only.

Core factions: Blackmere Council, Salt Compact, Bellwardens, Keepers of Names, Iron Parliament, Tidebound Fleet, Veiled Court, Free Witnesses.

Core returning cast: Martik, Varen, one Act-I faction representative, one Act-II institutional rival, and one ally whose bond can end in loyalty, estrangement, or death.

## Chapter scale and rhythm

Each chapter contains 25–35 reachable nodes, exactly two substantive puzzles, and 3–5 local endings. A local ending records an outcome and advances to the next authored chapter; only Chapter 10 records a global ending.

Every chapter must include:

- an irreversible meaningful choice within the first five nodes;
- at least three branches that stay separate for two or more nodes before reconverging;
- one consequence from an earlier chapter that changes available play;
- one non-combat resolution to a dangerous conflict;
- one combat where equipment and character strengths create different viable tactics;
- setup and payoff for at least one later revelation;
- consequence text shown after the decision, never numeric previews before it.

## Chapter 1 rebuild requirements

Retain the strongest existing sensory scenes and named canon, but remove false choices and unexplained consequences. The route to the Drowned Door must differ according to the player’s first commitment. Martik and Varen must each be possible ally, liability, or estranged witness; neither can be a cosmetic dialogue branch. The player must understand what is at stake before the final local decision, but not the entire continental truth.

Generated legacy saves migrate to the end of Chapter 1. Preserve hero, equipment, inventory, language, and canonical Chapter-1 decisions that can be mapped. Unknown generated flags are retained only as archival legacy facts and cannot affect authored validation.

## Difficulty contract

- `story`: enemy HP ×0.8, damage ×0.85, attack −1, DC −2, hints after the first failed attempt.
- `oath`: baseline values.
- `trial`: enemy HP ×1.2, damage ×1.15, attack +1, DC +2, hints one attempt later.

Rounding is deterministic: HP and damage round to the nearest integer with a minimum of 1; DC and attack modifiers are exact integers. Difficulty never changes story nodes, choice availability, consequences, or endings.

## Narration contract

Runtime LLM narration is optional polish only. Authored bilingual node and result text is always the complete fallback. The game must remain fully playable offline, when `/api/dm` fails, or when it returns malformed output. No chapter content or choice graph may be generated at runtime.
