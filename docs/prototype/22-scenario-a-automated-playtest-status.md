# Scenario A automated playtest: status and evidence

Status: Phases 1 to 8 implemented and run on 2026-11-03. Report: [23](23-scenario-a-automated-playtest-report.md). Players and generator: [21](21-scenario-a-strategies.md). Plan: [20](20-scenario-a-automated-playtest-build-plan.md). Human IC-3a remains open.

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
| Drop | State passing: v2 capped potential did not reduce it (37.4% vs 39.6%) | Hypothesis falsified; kept as a diagnostic and a player limitation |

Pass 2, simplicity: one candidate generator serves runner, search and fixtures; one replay path (`replaySteps`) serves journals and archives; analysis reads archives so bulk journals are optional; no new dependency, database or service. The legacy `runExperiment` in-memory runner was replaced and its test migrated.

## Open findings

1. P-SHIELD dominance unconfirmed as a rules issue (report 23, risk 1).
2. State passivity about 38% Pass share (player limitation).
3. Sanctuary actions beyond Restricted never chosen naturally.
4. Human IC-3a not done.
