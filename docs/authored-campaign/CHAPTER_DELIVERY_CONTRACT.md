# Authored Chapter Delivery Contract

Each OpenCode writer delivers both:

1. `docs/authored-campaign/chapters/chapter-NN.md`, a bilingual narrative design document;
2. `src/data/chapters/chapter-NN.ts`, playable `Chapter` data using the repository’s existing schema;
3. focused tests or validator fixtures for every introduced mechanic or cross-chapter condition;
4. one commit in the worker branch, never a merge into the integration branch.

## Narrative document

The document must contain:

- premise and dramatic question in English and Spanish;
- opening, escalation, midpoint reversal, climax, and 3–5 local endings;
- a node table with stable ID, bilingual beat, outgoing choices, and consumed consequences;
- both puzzles, including clue logic, permitted solutions, DC, difficulty hints, and accessibility fallback;
- encounters with combat and non-combat resolutions;
- new facts, setup/payoff links, faction changes, bond changes, conviction changes, items, injuries, survivors, and casualties;
- inputs consumed from prior chapters and outputs guaranteed for later chapters;
- translation review notes for idioms or deliberate non-literal phrasing.

## Playable data rules

- 25–35 reachable nodes; no orphan node unless marked and justified as an external gameplay entry.
- Exactly two puzzles; every puzzle has solvable clues before its lock and a fallback that preserves campaign progress.
- 3–5 ending nodes, each reachable from the chapter start; Chapter 10 instead has exactly six terminal nodes, one per `globalEndingId`.
- Every ending node declares `outcome`, `survivors`, and `casualties`; Chapter 10 endings also declare one of the six canonical `globalEndingId` values.
- Every choice ID and node ID is globally unique and begins with `cNN_`.
- Every choice has bilingual label, action, and post-choice result text.
- Numeric consequences are encoded in effects but appear in narrative only after selection.
- Every condition has at least one satisfiable path. Every flag read is defined in the current chapter or declared as a campaign input.
- Numeric gates use `requiresValues` with a namespaced `key` plus `min` and/or `max`; they must always leave at least one ungated route forward.
- Every introduced non-local flag is consumed by a later condition, summary, or ending rule.
- No direct imports from another chapter file. Shared canon belongs in campaign state/contracts.
- Returning NPCs keep their original stable ID through `returningNpcIds` and may be placed in locations without redeclaring their full NPC object.
- No LLM calls, randomness in graph topology, or difficulty-dependent story branches.

## Consequence notation

Use these shared state keys:

- `faction:<slug>` for reputation deltas, clamped to -5…+5;
- `bond:<npc-id>` for relationship deltas, clamped to -3…+3;
- `conviction:compassion|truth|freedom|duty` for conviction deltas;
- `canon:<stable-fact>` for durable boolean facts;
- `local:cNN_<fact>` only for chapter-local facts that are intentionally discarded after summary.

Results must say what changed in-world. The UI owns compact numeric disclosure such as `Salt Compact +1`; authored prose must not awkwardly embed bookkeeping.

## Worker self-check before `worker_done`

- TypeScript compiles.
- Chapter validator returns no issue.
- English and Spanish fields are both present and equivalent in meaning.
- IDs and references resolve.
- Node count, puzzle count, and ending count satisfy the contract.
- All endings are reachable and no unintended infinite loop exists.
- Cross-chapter inputs/outputs are listed in the narrative document.
- The commit contains only the assigned act’s narrative/data/tests.

`worker_done` means the commit is ready for Codex review. It is not approval or integration authorization.
