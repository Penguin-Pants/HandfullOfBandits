# 12 Architecture Review

Status: complete. An independent reviewer (large model, no edit rights) read docs 01 to 11 and research chapters 05, 06, 07, 09 and 10. Findings were checked against the source, then applied. Verified claims are marked.

## 1. High-severity findings and changes

| ID | Finding | Evidence | Change made |
|---|---|---|---|
| R-01 | S0 could not reach a meaningful end. Final margins against 49 and 30 after 8 cards are fixed by the start (PKK ahead) | 09 s2.2; 10 s2.2 | S0 result labeled "test result, not comparable". Record shows score change from start (10 s2.1, DEC-20) |
| R-02 | S0 hid two rule dependencies. DK-003 makes Strike Collaborators legal. ARGK Formed is legal from C1 | 06 s5.3; research 10 s2.3 | Strike Collaborators moved into M2 (P2-08). Pivotals removed from S0 as a listed deviation |
| R-03 | S0 deck order undefined. Cards could fall below the only Propaganda card | research 05 s1.1 | Propaganda card last in S0 (`propagandaLast`, P2-04) |

## 2. Medium-severity findings and changes

| ID | Finding | Change made |
|---|---|---|
| R-04 | Modules pinned by major version only. A minor code edit could change old replays silently. Resume used current code with stored data | Session stores module semver and source hash. A changed hash forces a replay check (04 s10.3, 06 s7, DEC-19) |
| R-05 | `interleaved` SA timing undefined against "during" (06 s1.3) | Removed. Before or after only. Named interleave points are a later handler feature (05 s3.1, DEC-16) |
| R-06 | Too much platform in M2: backup, FTS, Markdown | Moved to P3a-08. M2 keeps notes, save, undo, review, JSON export |
| R-07 | PA-12 overrode source text "In each space" | PA-12 now follows the source literally (confirmation, not override) |

## 3. Low-severity findings and changes

| ID | Finding | Change made |
|---|---|---|
| R-08 | MAP-07 banned Assault in Western Cities. Source bans March, Sweep and Garrison only (verified: 03 s4.2 item 1) | Fixed in 01 |
| R-09 | DK-053 is not a gap. 07 s10.1 gives a tie order | Removed from GAP-B15 and PA-15 |
| R-10 | PA-05 reorders source steps without saying so | Labeled "reorders source steps" |
| R-11 | PA-08 partly restates source | Text narrowed to the new part |
| R-12 | Note context lacks the legal alternatives at note time | `legal_choices_summary` added (07 s4.2) |
| R-13 | Pivotal priority needs an explicit engine step | Pivotal window Decision added (05 s6) |

## 4. Answers to the twelve review questions

| # | Question | Verdict |
|---|---|---|
| 1 | Engine too abstract? | No. "Procedures in code, values in data" keeps generic code to what the design uses |
| 2 | Schemas too complex? | Acceptable. Content hash is the replay key. `rulesetVersion` is for humans |
| 3 | Modules deterministic and testable? | Yes after R-04. Pure functions, effects only, lint bans, per-module tests, source hash |
| 4 | Annotation context enough? | Yes after R-12 |
| 5 | Snapshot per action needed? | Not strictly. Kept: small size, simple undo and review. Replay stays the integrity check |
| 6 | Logs enough for replay? | Yes. Commands, Decision answers and RNG state are stored. R-05 removed the undefined case |
| 7 | Sessions valid across package changes? | Yes after R-04. Stored package content plus module hash check |
| 8 | MVP reaches a complete game? | Yes after R-01 to R-03. Redeploy and Reset are not needed because the final round stops after phase 6.6 (research 05 s6.6 item 3) |
| 9 | Too much infrastructure first? | Reduced by R-06. IC-2a plays the slice in the CLI before UI work |
| 10 | Represents the real mechanics? | Yes. Spot checks passed: Rally option 3, March activation, Village Clearance, Legal Politics lines, Ceasefire as warning, Pivotal window |
| 11 | Rules silently invented? | No after R-07 to R-11. Every filled gap is a labeled PA, logged when it fires |
| 12 | Realistic for one user locally? | Yes. One Node process, one SQLite file, `npm start` |

## 5. PR review findings (Codex) and changes

| Finding | Change made |
|---|---|
| Code identity stored on the shared package row | Moved to each session (06 s3.2) |
| Branch-local seq gives duplicate action IDs | Session-wide seq plus `branch_seq` (06 s2, s3.4) |
| Resume check ignored shared engine code | `code_fingerprint` over all rules code (04 s10.3) |
| Default export had unresolvable state hashes | A state record per referenced hash is always exported (07 s8.1) |

## 6. Remaining risks

| Risk | Severity | Mitigation |
|---|---|---|
| Card encoding volume (91 cards) and misreading prose | High | 5 cards per PR, fixture per side, side-by-side review list, `reviewedAgainstText` |
| Rule churn during build (research is untested) | Medium | All `[tune]` values are parameters. Golden replays show each change |
| UI plan forms for 17 actions | Medium | One generic form driven by handler metadata (P2-15) |
| `branches` table unused until Phase 4 | Low | Reviewer suggested dropping it. Kept: one table, no logic, avoids a later migration (DEC-10) |
| Solo player sees hidden Covert markers | Low | Q-03 and P4-07 toggle |

Next step: read 13-design-decisions.md.
