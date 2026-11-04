# Scenario A automated playtest: status and evidence

Status: Phases 1 to 8 implemented and run on 2026-11-03; current evidence is generator `cand-5` with search `search-2` (PR #42). Report: [23](23-scenario-a-automated-playtest-report.md). Players and generator: [21](21-scenario-a-strategies.md). Plan: [20](20-scenario-a-automated-playtest-build-plan.md). Human IC-3a remains open.

## Environment

- Node 24.22.2 installed in the container (it had Node 22; `sim/package.json` requires 24). `make check` and `make test` run here; CLI subprocess tests run without `EPERM`. Windows was not run (paths with spaces are tested on Linux only).
- 4 CPUs; one worker thread per CPU; about 55 qualified games per minute.

## Phase status

| Phase | Status | Evidence |
|---|---|---|
| 1 Manifest and freeze | ✅ | `sim/src/cli/experiment-manifest.ts`, seed registry `sim/experiments/seed-registry.json`; `sim/test/experiment.test.ts` |
| 2 Durable runner, CLI, replay | ✅ | `experiment.ts`, `experiment-artifacts.ts`, `experiment-worker.ts`, `game-runner.ts`, `replay.ts`; `sim/test/experiment-cli.test.ts` |
| 3 Restricted player interface | ✅ | `player-observation.ts`, `players.ts`; `sim/test/player-observation.test.ts` |
| 4 Candidates and diagnostics | ✅ | `candidates.ts`; `sim/test/candidates.test.ts` |
| 5 Strategies and qualification | ✅ | `strategies/evaluation.ts`, `strategies/scenario-a.ts`, `qualification.ts`; `sim/test/player-qualification.test.ts`, `sim/test/mechanics-a.test.ts`; `sim/experiments/qualification-*.json` |
| 6 Pilot and mechanic evidence | ✅ | `experiment-coverage.ts`; runs `pilot-1`, `dev-compare-v2` (pilot of the frozen roster) |
| 7 Frozen evaluation and statistics | ✅ | `experiment-analysis.ts`; runs `baseline-1`, `options-1`, `adversarial-2`; `sim/test/experiment-analysis.test.ts` |
| 8 Counters and disposition | ✅ | runs `dev-counter-*`, `dev-probe-spend`, `confirmation-1`; report 23 |
| Review rerun (cand-2) | ✅ | runs `baseline-2`, `options-2`, `adversarial-3`, `confirmation-2` supersede the `cand-1` evaluation runs |
| Review rerun (cand-5, search-2) | ✅ | runs `baseline-5`, `options-5`, `adversarial-6`, `confirmation-5` supersede the `cand-4` runs; 8,000/8,000 complete, all replay identically; `baseline-5` resumed once after a container restart (2,580 games kept) |
| Review rerun (cand-4, search-2) | ⚠️ | runs `baseline-4`, `options-4`, `adversarial-5`, `confirmation-4` supersede the `cand-3` runs; 7,999/8,000 complete, all replay identically; 1 recorded engine dead end (DEC-56) |
| Review rerun (cand-3, search-2) | ✅ | runs `baseline-3`, `options-3`, `adversarial-4`, `confirmation-3` supersede the `cand-2` runs; 8,000/8,000 complete and replay identically |

CLI: `sim experiment run | replay | analyze | archive | compare | qualify`. Legacy `batch`, `replay <file>`, `fuzz` and `export` are unchanged; README labels the batch policies as legacy screens.

## Plan corrections

| Plan item | Correction | Reason |
|---|---|---|
| Phase 1 fingerprint | `sim/src/server/fingerprint.ts` moved to `sim/src/package/fingerprint.ts` and generalized; the engine fingerprint value is unchanged | CLI may not import the server layer |
| Phase 2 artifacts | Bulk per-game journals are not committed. Each run commits `replays.jsonl.gz` (every command and state hash), full journals of reviewed games and the analysis | 16 KB per game would add over 100 MB to git |
| Phase 2 worker | One worker per slot, reused; replaced after a timeout or crash | A new worker per game cost most of the run time |
| Phase 5 versions | v2 (capped potential) added after the pilot; frozen roster is State v1 and PKK v2 | Paired comparison on pilot seeds |
| Phase 6 pilot | `dev-compare-v2` half S@1 x P@2 (320 games, 20 per cell, pilot seeds) is the pilot of the frozen roster | Roster chosen after pilot-1 |
| Phase 7 adversarial | `adversarial-1` was refused by the freeze check before any game; `adversarial-2` re-freezes it | Counters changed the player fingerprint; 16/16 baseline games reproduce with later code |
| Limits | Pilot measured decision p99 332 ms, max 519 ms; frozen limits 20 s per decision, 300 s per game, 2,000 commands | Recorded before freezing |

## TWO-PASS REVIEW

Pass 1, correctness (confidence high for the runner and statistics; medium for player strength):

| Class | Finding | Outcome |
|---|---|---|
| Fix | Rally+Agitate and Train Base plans crowded out by a single family cap | Split families by option, multi-location and sub-action; test `candidates.test.ts` coverage cases failed before, pass after |
| Fix | Multi-destination March plans pruned; bounded best 1.25 below broad | Multi-location sub-families; bounded-vs-broad test passes |
| Fix | Propaganda frontier had no removal-only spends, so excess Harm could not be bought back | Unit redress spends; fixtures P-HARM-FINAL and S-HARM-FINAL failed for every player before, pass after |
| Fix | Reused worker stalled: `removeAllListeners()` also removed Node's internal listeners | Remove only own events; CLI run test failed before, passes after |
| Fix | Coverage crashed on Eligibility entries without boxes; Restricted-entry probe matched size-based activation | Guarded; probe checks the destination posture |
| Fix | Checkpoint `qualifies` used a literal Harm limit | Uses `harm.limit` |
| Fix | Fixture arithmetic errors in eight first-draft fixtures (no discriminating answer) | Recomputed by hand; a test now requires a passing and a failing candidate per fixture |
| Fix | Real-worker tests timed out at 5 s under full-suite load | Explicit timeouts |
| Fix | `experiment replay` printed a stack trace for a missing directory | Error message, exit 1 |
| Decide | P-SHIELD dominance: rules property or one-ply planning? | Recorded as a hypothesis for the designer (report 23); no rule changed |
| Fix | PR #40 review: Rally flip, Train Guards and Base pruned before their families; spending frontier cap dropped the maximum allocation | Generator `cand-2` with regression tests; frozen program rerun on fresh seeds (baseline-2, options-2, adversarial-3, confirmation-2); `cand-1` runs retained |
| Fix | PR #40 review: replay counted a truncated journal as identical | Replay requires the recorded command count and final hash; all committed runs re-verified |
| Fix | PR #40 review: zero completed games gave a 0% roster estimate | NaN estimate, no roster trigger |
| Fix | PR #40 review: full-state controls skipped the decision time limit | Same check as observation players |
| Fix | PR #40 review round 2: search budget starved late families; Harm removal unvalued in spending; low-supply Train plans missing; repeats counted as independent trials; controls pooled into roster averages; no-pair comparisons shown as 0; Propaganda checkpoints per round, not per phase; abort left workers running | `cand-3`, `search-2`, analysis v2, runner fix; each with a regression test that fails before the fix; frozen program rerun on fresh seeds |
| Fix | PR #40 review round 3: report labels dropped player versions; coverage replayed without checking hashes | Full player IDs; coverage throws on divergence; regression tests; all 19 committed runs pass |
| Fix | PR #40 review rounds 3 and 4: Harm benefit capped per space, not per allocation; removal-only spending missing below the Harm limit; final Civic Action pruning ignores Agitation-reply exposure; large-space greedy frontier drops second shifts | Deferred from PR #40, fixed in PR #41 (`cand-4`, exact allocation search); four regression tests fail on `cand-3`; frozen program rerun on fresh seeds |
| Fix | PR #41 review: the exact search keeps only the first of two Civic Action allocations with equal gain and exposure; the other can survive a resource-limited Agitation reply better (reproduced) | Deferred from PR #41, fixed in PR #42 (`cand-5`: up to three tied allocations per search state); regression test fails on `cand-4`; frozen program rerun on fresh seeds |
| Fix | A container restart stopped `baseline-5` after 2,580 of 3,520 games; the runner could only start again from nothing | `experiment run --resume` keeps sealed games and replays unfinished ones (PR #42); tests compare a resumed run with an uninterrupted one |
| Fix | PR #42 review: a resumed run reported a new experiment hash after a runner-only commit | The recorded hash stays the run's identity; regression test |
| Decide | `options-4` game `no-syria-march~S-MILv1~P-ADAPTv2~1001716~r0`: after Host Pressure before March, DEC-56 waits for new March destinations, but no legal, affordable March exists | Engine dead end reproduced from the journal; recorded as failed with its 58-command prefix, no fallback. Resolved by DEC-62 (designer, 2026-11-04, option A): the Operation ends when no legal, affordable replacement exists; engine fix with Rally and March regression tests |
| Drop | State passing: v2 capped potential did not reduce it (37.4% vs 39.6%) | Hypothesis falsified; kept as a diagnostic and a player limitation |

Pass 2, simplicity: one candidate generator serves runner, search and fixtures; one replay path (`replaySteps`) serves journals and archives; analysis reads archives so bulk journals are optional; no new dependency, database or service. The legacy `runExperiment` in-memory runner was replaced and its test migrated.

## Open findings

1. P-SHIELD dominance unconfirmed as a rules issue (report 23, risk 1).
2. State passivity about 39% Pass share (player limitation).
3. Sanctuary actions beyond Restricted never chosen naturally.
4. Human IC-3a not done.
