# Codex Review Rubric

Codex reviews every OpenCode document, translation, diff, graph, consequence, test, and commit. A delivery is accepted only when every blocking row passes.

## Blocking review

- **Canon:** respects the campaign bible, oath law, chapter remit, and existing retained canon.
- **Originality:** no imitation of a living author’s style or borrowing of distinctive protected expression.
- **Agency:** important choices produce legible, later-observable consequences; no false strategic choices.
- **Graph:** 25–35 reachable nodes, exactly two puzzles, 3–5 reachable local endings, valid references, no accidental loops or dead ends.
- **State:** all conditions are satisfiable; scores stay within bounds; introduced campaign state has a consumer; endings cannot be selected by one late choice alone.
- **Mechanics:** dangerous scenes support stat/equipment-sensitive play and at least one credible non-combat route.
- **Bilingual quality:** complete semantic parity, natural phrasing, consistent names and terminology.
- **Fallback:** the authored text is sufficient with networking disabled or malformed narrator responses.
- **Tests:** validators and relevant unit/playthrough tests pass.
- **Scope:** no unreviewed unrelated edits and no generated artifacts committed accidentally.

## Review outcome

- `accept`: Codex may integrate the exact reviewed commit.
- `revise`: a fresh Task/Dispatch goes to the same OpenCode terminal with concrete findings; the previous commit is not integrated.
- `reject`: the approach conflicts with canon or contract and must be replaced, still through a fresh Task/Dispatch.

After all ten chapters pass individually, a separate OpenCode continuity critic produces findings only. Codex reviews those findings and dispatches revisions to the original act writer. Shipping approval remains exclusively with Codex after full campaign QA.
