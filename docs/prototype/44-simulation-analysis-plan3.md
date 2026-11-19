# 44 Local simulation and analysis: audit Plan 3 results

Date: 2026-11-19. Scope: all of Plan 3 in [`docs/audit/playtest-readiness-audit.md`](../audit/playtest-readiness-audit.md) section 6 (A1 to A5).

## 1. Bottom line

Every Plan 3 milestone is done. You can compare two runs paired by cell and seed, start a study with no manual hash, count card side plays, and open any recorded game in the app at any decision.

| ID | Status | Result |
|:--|:--|:--|
| A1 Paired run compare | ✅ Done | `experiment compare <base> <variant> --paired`. Doc 41 means match exactly; interval ends within one bootstrap step (section 3) |
| A2 Study without hashes | ✅ Done | `experiment new <study.json> --out <manifest.json>`; `supersedes` is optional |
| A3 Card side coverage | ✅ Done | `experiment cards <run>... --out <file.md>`. 189 of 189 run counts match the audit ledger; one ledger no-effect count corrected (section 3) |
| A4 Probe players | ✅ Done in Plan 1 (D-04) | No new code. Evidence re-checked (section 3) |
| A5 Report viewer | ✅ Done | Home nav "Experiment reports": open a run's report, open a game at a decision as a session |

## 2. What changed

| Item | Change | Evidence |
|:--|:--|:--|
| A1 | `compareRuns` and `comparePairedRuns` (`cli/experiment-analysis.ts`). Pairs completed first plays by cell and game seed. The roster change resamples game seeds once per draw for both runs. Bootstrap settings come from the base manifest; roster cells are qualified against qualified (19 s4) | `sim/test/experiment-plan3.test.ts` A1 block |
| A2 | `newManifest` (`cli/experiment-manifest.ts`). Fills package hash, thresholds, Harm limit and both fingerprints from the package and the runtime; keeps values the study file gives (`null` fingerprints stay null); rewrites the package path relative to the output with `/`; validates like `experiment run` before it writes. `supersedes` defaults to null | A2 block |
| A3 | `cardRun` and the `cards` and `propagandaReveals` diagnostics (`cli/experiment-coverage.ts`) replace `eventSides`. New `cli/experiment-cards.ts` lists every package side with runs and no-effect runs | A3 block |
| Shared reader | `gameSteps` (`cli/experiment-artifacts.ts`): one game's start hash and steps from its journal or the replay archive. `experiment replay` and coverage now use it | existing replay and coverage tests |
| A5 server | `ExperimentRuns` interface, `SessionService` 4th argument, `experiments`, `experiment`, `openExperimentGame`. Routes `GET /api/experiments`, `GET /api/experiments/:id`, `POST /api/experiments/:id/games/:gameId/open`. Reader `cli/experiment-viewer.ts`, wired in `src/main.ts` (`HOB_EXPERIMENTS`, default `sim/experiments/runs`) | `sim/test/experiment-viewer.test.ts` |
| A5 UI | `src/ui/experiments/Experiments.tsx`: run list, report text, game table with "Review selection only", "Decision N of M" and "Open at decision" | `experiments.test.tsx`; browser check below |

## 3. Acceptance evidence

1. **A1.** `experiment compare` of `dd25-v4b-thresholds-43-38` against `dd25-v4b`, `-46-35` and `variant-a` gives +16.7 [+10.4, +23.3], +10.8 [+5.0, +16.7] and +6.2 [+1.2, +11.7] pp. Doc 41: +16.7 [+10.4, +22.9], +10.8 [+5.0, +17.1], +6.2 [+0.8, +11.7]. The means match exactly. The interval ends differ by at most 0.42 pp: with 15 seeds of 16 cells a paired mean moves in steps of 1/240. The doc 41 scratch script was not committed, so its random draws cannot be reproduced. Confidence: high. The test allows one step.
2. **A2.** A study file with no hash, no expected values and no `supersedes` becomes a manifest that `experiment run` completes. Verified in the test through the real CLI.
3. **A3.** The stored dd25 runs no longer replay on the current engine (rules changed since, for example decision 18). `experiment replay dd25-v4b` now gives 186 of 240 identical. So the new counting code ran in a worktree at the audit commit `c22d5ab` over `dd25-pilot`, `dd25-pilot-main-players` and `dd25-v4b` (720 games, 78 s). Result: the run counts of 180 Event sides, 4 Pivotals and 5 Propaganda cards all equal `docs/audit/card-ledger.csv` `bot_runs`. No-effect counts equal the ledger except DK-052 shaded: 6, not 5. The ledger, like the first version of this command, counted an effect that the next card's Always line applied in the same transition (a command that ends a card reveals the next one). The count now stops at the reveal (review of PR #129), and the ledger row is corrected. 173 sides ran, 157 with an effect at least once (audit section 0: "157 sides ran"). The never-run list equals audit section 3.2. The worktree was deleted afterward.
4. **A4.** Coverage of `d04-probe` on the current engine (100 games) plus the roster runs: every non-Victory mechanic row has 10 or more natural games. Rows under 10 in `d04-probe` alone are covered by the roster runs: `H-puk-host` 9 (34 in `dd25-v4b`), `P-ceasefire-restraint` 1 (85), `L-state-filing` 0 (214). The four Victory outcome rows stay reviewed fixtures by designer decision (audit status block).
5. **A5.** Real app, built UI (Playwright, 1400 x 900): Experiment reports, open `d04-probe`, report shown, "Review selection only", decision 25 of game `default~S-PROBEv1~P-PROBEv1~9005~r0`, "Open at decision". The Play screen opened at C1 card 12. No page errors. Opening a whole 159-command bot game takes about 1.1 s in this container.

## 4. Limits

- **Old runs diverge.** A run made with older rules code opens only up to the first command the current engine plays differently. The screen says which decision and offers the shorter session. This is replay identity (DEC-19), not a defect.
- **No "Why?" on opened games.** Journals store decision records with candidate IDs, not candidate commands. The History "Why?" panel needs the commands, so opened games show no bot reasons.
- **Not built (section 6.2 and 6.3, outside the A1 to A5 milestones):** a live progress line with rate and time left in `status.json`; card side counts and per-round trends inside `report.md`; a report comparison screen in the app (the CLI covers it).

## 5. Two-pass review

| Class | Finding | Outcome |
|:--|:--|:--|
| Fix | `experiment cards --paired` passed the flag as a run directory | Rejected with usage (exit 2); test fails without the fix |
| Fix | Usage text listed `cards` between the two `compare` forms | Reordered |
| Fix | Duplicate journal-or-archive reading in `replay.ts` and coverage | Merged into `gameSteps` (Edits 5 and 6) |
| Fix | Duplicate JSON and schema parsing in the new study reader | `parseWith` serves `parseManifest` and `newManifest` |
| Fix (PR #129 review) | No-effect counts included the next card's Always effects | Count stops at the next `CardRevealed`; DK-052 shaded ledger row corrected |
| Fix (PR #129 review) | `compare --paired` kept games a manifest excludes | Each run drops its own exclusions, as `analyzeExperiment` does |
| Fix (PR #129 review) | The viewer listed no games before `results.json` exists | Rows come from the schedule with the recorded prefix (status `recorded`) |
| Fix (PR #129 review) | `experiment new` wrote an empty package path when the manifest sits in the package folder | Writes `.` |
| Drop | `gameSteps` takes the start hash from the journal only (before: archive as a fallback) | A journal always starts with its start event; no reachable case |
| Drop | A paired change of exactly 0 prints `+0.0` | Cosmetic |

Validation: `make check` and `make test` pass (122 files, 1,758 tests; 110 files and 1,623 tests at the audit). `make e2e` passes. Windows: CI.

## 6. Decisions still open (designer)

Both are from audit section 6.7 and do not block the tools:

1. **Target band** for the State share of bot games (today 60 to 65%).
2. **Seed count** before a rules change (docs 37 to 41 propose 50 per cell).
