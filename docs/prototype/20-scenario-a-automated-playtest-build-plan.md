# Scenario A automated playtest build plan

Status: ready for implementation. Planning only; no code changed by this plan.
Date: 2026-11-03. Source: [requirements](19-scenario-a-automated-playtest-spec.md).
The requested output path was an unfilled placeholder; this file follows the
existing numbered prototype-document convention.

## Requirements and boundaries

The source has section numbers and AP-A01 through AP-A05 identifiers, but no
individual requirement IDs. References R2–R11 below mean the complete corresponding
source section, including all tables and acceptance conditions. They are aliases,
not changes to the requirements. R1 and R12 govern every phase.

Goal: reproducible Scenario A experiments that distinguish engine correctness,
player competence and strategic evidence. No rule tuning, new scenarios, historical
claims or balance guarantees. Required interface is a CLI and readable reports;
no new web UI, API service, database migration or deployment is required.

## Repository evidence and approach

| Existing path | Evidence and planned reuse |
|---|---|
| `sim/src/cli/experiment.ts` | Partial in-memory runner. Replace its incomplete manifest and all-or-nothing loop; migrate its test together |
| `sim/src/cli/main.ts`, `batch.ts` | Existing command routing and round-metric export. Preserve legacy batch semantics as labeled screens |
| `sim/src/cli/play.ts`, `sim/src/engine/replay.ts` | Command/hash records and deterministic replay; reuse rather than create another replay engine |
| `sim/src/cli/strategies/index.ts` | Faction routing, legacy controls and generic continuation. Qualified players must not inherit fallback behavior |
| `sim/src/engine/index.ts` | Authoritative start/validate/apply API; keep live state inside the trusted runner |
| `sim/src/engine/core/types.ts` | GameState contains seed, RNG, future piles, set-aside cards and private state; do not expose it to qualified players |
| `sim/src/package/load.ts` | Package normalization/hash, packageContent and withSessionOptions; reuse for frozen artifacts and replay |
| `sim/src/server/fingerprint.ts` | Existing source fingerprint pattern; include actual engine fingerprint as well as commit identity |
| `sim/src/server/forms.ts` | Action fields and dynamic modifiers; useful coverage inventory, not a complete legal-plan enumerator |
| `sim/src/engine/coin/stop-rules.ts` | legalOps probes one-location plans and prefers one box; insufficient for required candidate coverage |
| `sim/src/engine/coin/propaganda/` | Existing phase handlers for spending, upkeep, redeploy and reset |
| `sim/test/experiment.test.ts`, `scenario-a.test.ts` | Existing limited runner test and actual CLI/replay integration pattern |
| `sim/package.json`, `Makefile` | Node 24+, TypeScript, Zod, Vitest, YAML; use existing dependencies and make check/test |

Keep orchestration in the CLI layer. Proposed new modules belong under the existing
`sim/src/cli/` directory and tests under `sim/test/`; names below are proposed files,
not claims that they already exist. Keep deterministic engine APIs unchanged.
Use versioned filesystem artifacts rather than extending the session database.

## Phase 1: Validate and freeze experiments

**Goal:** Reject invalid experiments before any game starts.

**Requirements covered:** AP-A01; R2, R7 manifest/randomness requirements; R9 identity;
R11 reproducibility.

**Changes:** Extend `sim/src/cli/experiment.ts`; add
`sim/src/cli/experiment-manifest.ts`; extend `sim/test/experiment.test.ts`.
Define a versioned Zod manifest with every field from R2. Resolve player versions,
parameters, generator version and budgets through a faction-aware registry.
Record actual engine/source fingerprints, commit, lock hash and normalized package.
Record dirty source identity so a commit alone never misidentifies local changes.
Validate Scenario A, thresholds, Harm limit, options, nonempty seeds, seed uniqueness,
development/evaluation separation, bounded limits and supported schema versions.

**Implementation notes:** Reuse loadPackage/packageContent/withSessionOptions and
canonical hashing. Options are part of experiment identity even if packageHash
stays unchanged. Legacy players are explicitly unqualified controls. Use stable
IDs derived from frozen manifest and game index. No new dependencies.

**Tests:** Malformed JSON/schema, wrong hashes, wrong scenario/thresholds, unknown
options/player/faction, duplicate or unsafe seeds, empty roster, changed source and
seed overlap. Identical normalized input produces identical experiment identity.

**Acceptance criteria:** Every R2 manifest field is validated or captured from the
runtime; invalid input starts zero games. No unresolved identity ambiguity.

**Dependencies:** None.

## Phase 2: Durable runner, CLI and replay

**Goal:** Execute and inspect an experiment without losing evidence on failure.

**Requirements covered:** AP-A01; R7 limits; R9 artifacts; R11 reliability/reproducibility.

**Changes:** Extend `experiment.ts`, `main.ts`, `replay.ts`; add
`sim/src/cli/experiment-artifacts.ts` and `sim/test/experiment-cli.test.ts`.
Expose `sim experiment <manifest.json> --out <directory>` and an experiment replay
mode. Keep current batch/replay commands compatible. Write frozen manifest/package,
per-game command/hash journal, decisions, failures and summary. Reject existing
output directories; never overwrite completed artifacts. Publish files atomically
and mark the experiment complete only after all scheduled results are recorded.

**Implementation notes:** Persist after each applied command. Preserve rejected
commands, exceptions and limits with the valid replay prefix. Separate complete,
failed and interrupted games; never score failure as defeat. Continue independent
games. Run each game in a worker so time limits can interrupt synchronous policies;
parent owns durable writes and can preserve the latest acknowledged prefix. Use
one worker initially with explicit concurrency; later increase without changing
seed assignment. Replays use captured package/options, validate engine identity and
compare every hash. No policy inference is needed for replay.

**Tests:** CLI success across several seeds; wrong flags; output collision; disk-write
failure; invalid command; throwing policy; command cap; stalled worker timeout;
worker termination; partial journal recovery; option-aware replay; hash mismatch;
Windows paths with spaces. Compare semantic artifacts, excluding elapsed times.

**Acceptance criteria:** AP-A01 acceptance plus all failure cases leave explicit
status and replayable valid prefixes. Multiple completed games replay identically.

**Dependencies:** Phase 1.

## Phase 3: Restricted player interface

**Goal:** Qualified players cannot inspect actual unknown futures or mutate live state.

**Requirements covered:** AP-A02; R5 privacy/interface; R9 decision identity.

**Changes:** Add `sim/src/cli/player-observation.ts` and
`sim/test/player-observation.test.ts`; update experiment player registration.
Use explicit allowlists for visible board, tracks, current/public cards, own legal
choices and public rules. Exclude seed, live RNG, future piles, set-aside identities,
private opponent data and protected audit data. Clone/freeze observations. Keep
legacy full-state Policy registration limited to labeled controls.

**Implementation notes:** Players return a candidate ID or command proposal through
an observation-only interface, never Engine or GameState. Public rule/card catalog
is distinct from actual deck composition. Rules on visibility determine fields,
including pivotal information; do not hide information the game makes public.
Validation results returned to players expose only information their legal choices
permit. No live-state preview/apply API crosses the boundary.

**Tests:** Change only hidden deck/RNG/seed and assert identical observations and
candidate diagnostics; nested mutation cannot affect the engine. Check both factions,
pending decisions and audit-log exclusion. Unqualified controls cannot enter the
qualified roster unnoticed.

**Acceptance criteria:** R5 observation boundary tests pass; no actual hidden future
is reachable through the qualified player contract.

**Dependencies:** Phase 2.

## Phase 4: Complete candidates and diagnostics

**Goal:** Every Scenario A decision family can be expressed and evaluated.

**Requirements covered:** AP-A02; R5 all coverage rows; R8 procedure coverage; R9 decisions.

**Changes:** Add `sim/src/cli/candidates.ts` and `sim/test/candidates.test.ts`; integrate
with the runner. Inventory existing handlers and forms against R5. Generate all
legal boxes, Event sides and answers, Operations with multi-space plans and
allocations, Special Activity combinations/timing, ARGK, Propaganda spending,
Emergency Rule, Redeploy and interrupted continuations. Reuse engine validation;
do not copy rule legality into a separate engine.

**Implementation notes:** Expand Event questions with existing complete/question
patterns, allowing alternative answers rather than only firstPicker. Use bounded
combinations for movement and spending. Document pruning and reserve candidates
for each reachable action family so one family cannot consume the whole budget.
Compare with a wider generator on small fixtures. The trusted validator may hold
live state but must not emit stochastic previews of actual unknown outcomes.
Explicitly distinguish automatic advance, optional skip, legal Pass and unexplained
empty candidate sets. Empty sets fail with diagnostics; no generic continuation.

**Tests:** A fixture per action/SA and campaign decision, both Event sides, allocations,
multi-space moves, modifier changes, host interruption and budgets. Validate every
emitted candidate. Wider enumeration detects lost good plans in bounded fixtures.
Hidden-state changes cannot change visible candidate sets for equivalent positions.

**Acceptance criteria:** AP-A02 coverage ledger has no unowned decision family;
privacy, illegal-candidate and empty-set tests pass. Counts of proposed, rejected,
pruned and retained candidates are saved per decision.

**Dependencies:** Phase 3.

## Phase 5: Eight strategies and qualification

**Goal:** A credible, frozen initial opponent roster.

**Requirements covered:** AP-A03; R3, R4, R6; R5 sampled search and budgets.

**Changes:** Extend `sim/src/cli/strategies/` with proposed `evaluation.ts` and
`scenario-a.ts`; add `sim/test/player-qualification.test.ts` and reviewed fixtures.
Implement S-POL, S-MIL, S-CON, S-ADAPT, P-POL, P-EXP, P-SURV and P-ADAPT.
Document priorities, reserves, risk, blocked-plan responses and conversion timing.
Add random-legal baseline; preserve all existing controls outside qualified averages.

**Implementation notes:** Shared scoring uses margins, correct ties/Harm, timing,
opponent threats and costs. Reuse engine derivation but independently verify fixture
arithmetic. Adaptive search samples legal unseen futures consistent with observed
history and scenario deck rules, never the real future. Player/search RNG is separate
from live RNG. Equal transition budgets and visible component scores. Explore
parameter variants only on development seeds; retain old versions.

**Tests:** All R6 benchmark rows, forced win/defence within defined horizons, political
weights, negative-margin wins, blocked plans and future resource costs. Verify sampled
futures meet deck constraints. Each player completes 20 development games with no
unexplained fallback. Accept equivalent good actions rather than a single command.

**Acceptance criteria:** R6 in full for all eight players, suite hash saved and
strategy parameters frozen. Model agents remain optional, not needed to pass.

**Dependencies:** Phase 4.

## Phase 6: Pilot and mechanic evidence

**Goal:** Complete the 320-game pilot and close reliability/coverage gaps.

**Requirements covered:** AP-A04; R7 pilot; R8; R9 checkpoints; R11 coverage.

**Changes:** Extend experiment orchestration and artifacts; add proposed
`sim/src/cli/experiment-coverage.ts`, tests and pilot manifests. Record before/after
Propaganda snapshots, action/card/interaction exposure, Pass shares, streaks,
resources and scoring trajectories. Add targeted fixtures for every R8 row, including
civilian effects, sanctuary options and final-round differences.

**Implementation notes:** Natural exposure and constructed-fixture evidence stay
separate. Diagnose harmful-action incentives with same-position alternatives and
immediate versus later margins. Do not convert historical research stop rules into
incorrect final-score bans. Preserve failed runs and superseding rerun links.

**Tests:** Metric snapshots match replay-derived values; mandatory effects once;
coverage categories; no duplicate games; all failures accounted for. Review existing
propaganda/Scenario A tests before adding new cases.

**Acceptance criteria:** 16 cells × 20 completed games; all 320 accounted for and
replayed; defects fixed, affected games rerun, qualification renewed after player
changes. Ledger covers every applicable mechanic naturally or by reviewed fixture.

**Dependencies:** Phase 5.

## Phase 7: Frozen evaluation and statistical reports

**Goal:** Produce reproducible estimates for the qualified roster.

**Requirements covered:** AP-A05; R7 all remaining suites; R9 reports; R10 statistics.

**Changes:** Add proposed `sim/src/cli/experiment-analysis.ts` with tests, extend CLI
report mode and add frozen manifests. Execute 3,200 baseline games, 2,400 option
sensitivity games and controls versus all applicable opposing qualified players at
20 seeds/cell. Report each option and budget class separately.

**Implementation notes:** Use shared starting seed blocks across cells, separate
player RNG and declared repeated-player-seed subset. Set limits before freezing.
Use Wilson intervals per cell, paired differences for version comparisons and
bootstrap shared game-seed groups for roster-average uncertainty. Do not treat
repeated player trials as independent decks. Save analysis seed/config/version.
Report incomplete counts separately; block acceptance until resolved.

**Tests:** Known Wilson examples, zero/all wins, missing/incomplete cells, bootstrap
cluster preservation, seed overlap rejection, equal-weight averages and option
separation. Report exact game counts and artifact links.

**Acceptance criteria:** R7 suite sizes and R9 report fields complete; deterministic
report reruns; uncertainty and exploratory warning triggers from R10 verified.

**Dependencies:** Phase 6.

## Phase 8: Counter-strategies and final disposition

**Goal:** Deliver a justified next-phase recommendation.

**Requirements covered:** AP-A05; R10 review/counters; R11 all gates.

**Changes:** Produce experiment report and evidence ledger; update this plan's status,
`docs/prototype/README.md` and relevant checkpoint notes in `11-build-plan.md`.
Select five closest, five largest and five seeded-random games, deduplicate and add
all failures/exploits. Freeze/qualify counters to persistent patterns, then run new
200-seed confirmation batches against relevant opponents and retained roster.

**Implementation notes:** Record successful and failed counters. Attribute findings
to rules, generation, evaluation, planning or chance. No repeated sampling until a
preferred answer appears. Formal claims beyond exploratory triggers need an explicit
multiple-comparison method. No requirement for each matchup to be 50/50.

**Tests:** Review selection reproducibility, evidence links, confirmation seeds fresh,
qualification still valid and gate computation from artifacts. Independently audit
selected replays and score arithmetic.

**Acceptance criteria:** Every R11 gate has linked evidence and every persistent flag
has a tested counter/disposition. Report human IC-3a separately as open unless actual
designer playthrough and notes exist. Never claim automation closes that checkpoint.

**Dependencies:** Phase 7.

## Cross-cutting controls

| Concern | Owner and implementation |
|---|---|
| Compatibility | Phases 1–2: version artifacts; retain existing PlayRecord/batch behavior; explicit rejection of unsupported formats. No SQLite migration |
| Privacy | Phases 3–5: trusted runner owns private state; observation/candidate/search boundary tests; audit files never supplied to players |
| Failure recovery | Phase 2: durable prefixes and immutable attempt IDs; failed attempts retained; reruns are new linked attempts, not overwrites |
| Documentation | Each phase documents its CLI/schema/contracts beside this plan; phases 6–8 add evidence. Phase 2 adds usage to README |
| Validation/review | Every implementation phase follows AGENTS.md TDD and TWO-PASS REVIEW; use make check/test, relevant CLI tests and Windows path checks. Run UI tests only if shared UI code changes |

## Requirements traceability

| Requirement | Planned phase | Verification |
|---|---|---|
| R1 authority/no tuning | All | Diff review; unchanged rules and disclosed disagreements |
| R2 complete manifest, scope, options, freeze, seeds | 1, 2, 7 | Schema/identity tests and captured manifest |
| R3 scoring, timing, costs, threats, estimates | 5 | Independent fixtures and logged components |
| R4 eight families, variants, controls | 5, 7 | Registry, qualifications, separate result groups |
| R5 observation and mutation boundaries | 3 | Hidden-state equivalence and mutation tests |
| R5 all five decision-family rows/pruning/empty sets | 4 | Action ledger and candidate tests |
| R5 sampled futures/budgets | 5 | Search RNG and legal-deck sampling tests |
| R6 all five benchmark rows plus 20 games/player | 5 | Hashed qualification report |
| R7 pilot/frozen/options/adversarial/confirmation counts | 6, 7, 8 | Manifest schedule versus artifact counts |
| R7 RNG, repeated trials, budgets, limits | 1, 2, 5, 7 | Determinism, timeout and clustering tests |
| R8 all five mechanic rows and incentives | 6 | Natural/fixture ledger and alternative comparisons |
| R9 all artifact levels | 2, 4, 6, 7 | Replay, schema and report checks |
| R10 uncertainty/paired estimates/warnings | 7 | Statistical fixtures and report reproduction |
| R10 selected reviews/counters/no overfitting | 8 | Selection IDs, retained roster and fresh confirmations |
| R11 reliability | 2, 6, 8 | No unresolved failures or replay differences |
| R11 competence | 5, 8 | Eight valid qualification reports |
| R11 coverage | 4, 6, 8 | No unresolved applicable ledger entry |
| R11 strategic review | 8 | Disposition for every persistent flag |
| R11 reproducibility | 1, 2, 7, 8 | Frozen inputs and repeatable report |
| R11 human checkpoint and limitations | 8 | Explicit independent IC-3a status |
| R12 AP-A01/A02/A03/A04/A05 | 1–2 / 3–4 / 5 / 6 / 7–8 | Phase exit checks above |

## Deferred and external items

Language-model agents are optional and deferred; their metadata requirements apply
if later enabled. Web dashboards, later scenarios, alternative initiative, rule
tuning, optional modules and database integration are outside this plan. Human
IC-3a remains an external checkpoint; it does not prevent implementing this program.
No unresolved product decision currently prevents implementation.

## TWO-PASS REVIEW

Pass 1, correctness (confidence high): reviewed source sections 1–12, current runner,
CLI/replay, state interfaces, package/options and repository test patterns.

| Class | Finding and correction |
|---|---|
| Fix | Commit identity alone misses current local changes; phase 1 captures actual source fingerprints |
| Fix | Existing replay assumes a supplied package; phase 2 captures package/options and checks engine compatibility |
| Fix | A timeout checked after synchronous policy execution cannot stop a hang; phase 2 uses a supervised game worker |
| Fix | Shared-seed cells and repeated player trials are correlated; phase 7 resamples game-seed groups |
| Fix | Existing legalOps cannot satisfy multi-space/SA coverage; phase 4 owns the complete candidate ledger |

Pass 2, simplicity (confidence high): preserve the pure engine, existing replay,
package loader and legacy screens. Use filesystem artifacts and existing dependencies.
No new service, database, UI or generic plugin framework. All required work maps to
source sections; optional agents do not block acceptance. Phase dependencies form
one executable chain. Path references and document whitespace checked after review.
