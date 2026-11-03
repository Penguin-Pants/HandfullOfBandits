# Scenario A automated playtest specification

Status: specified, not implemented or run. Requested 2026-11-02.

## 1. Purpose and authority

Build a reproducible testing program that separates engine correctness, player
competence and evidence about balance. Find scoring routes, counterplay, missing
procedures and dominant strategies before expanding scenario content.

This specification changes no game rules. Sample sizes, warning levels and player
benchmarks below are program requirements. Conclusions apply only to the tested
rules, options and player population.

| Source | Use |
|---|---|
| [Current rules](../rules/prototype-rules.md), sections 3, 6, 7 and 10 | Actions, scoring, sequence and Scenario A |
| [Game package](../../game-packages/kurdish-coin/0.1.0/) | Exact setup, parameters, cards and formulas |
| [Build plan](11-build-plan.md), Phase 3a and IC-3a | Existing implementation and human checkpoint |
| [Research playtest plan](../../research/research-final/package-b-coin-design/12-playtest-plan.md), sections 5, 7 and 9 | Mechanic questions and adversarial screens |
| [Phase 3a review](15-phase3a-review.md) | Existing evidence and limitations |

Current rules govern where older research differs. Harm above six blocks an
opening victory check but does not forbid a final-margin win. Do not implement
the older research stop rule as a ban on that legal final result. Record other
conflicts for review rather than inventing a rule inside a player.

## 2. Scope and experiment contract

Use `scenario-a`, full setup, C1/C2 and ARGK. End at the second Propaganda unless
the opening check ends play. S0 is a smoke test only. Later campaign systems and
alternative initiative rules are outside this experiment.

Freeze rules, engine, players and analysis before evaluation. Resolve rule/package
disagreements before freezing. Validate State threshold 49, PKK threshold 30 and
Harm limit 6 against loaded data; fail setup if they differ.

Baseline options allow early KDP hot pursuit and Restricted Syria March. Test all
four option combinations, but report the three alternatives separately from the
baseline. Never pool them into a headline win rate.

| Manifest group | Required fields |
|---|---|
| Identity | Experiment ID, scenario, rules hash, engine commit, dependency lock hash |
| Players | Faction, strategy ID/version, parameters, decision budget, candidate-generator version |
| Randomness | Disjoint development/evaluation seed lists, player seeds, game RNG version |
| Conditions | Options, command/decision/time limits, concurrency and hardware |
| Analysis | Matchups, sample sizes, warnings, exclusions and report version |

Never tune on evaluation seeds. After tuning prompted by an evaluation, use fresh
evaluation seeds and retain the earlier results.

## 3. Shared scoring model

State score is Support plus Legitimacy. PKK score is Opposition plus domestic PKK
Bases. Passive levels contribute population; Active levels contribute twice
population. Control, casualties and external Bases score nothing directly.

Except at the first Propaganda, opening victory requires the threshold and Harm
eligibility. Final margin is score minus threshold minus twice Harm above six.
Apply lower Harm, then PKK, for tied margins. Prioritize forced immediate wins
over heuristic preferences. Evaluate opponent threats as well as own scoring.

Players must account for remaining opportunities before Propaganda, resources,
spending caps, marker removal, eligibility and opponent replies. Log potential
future points as estimates, separately from points already earned.

## 4. Strategy portfolio

These are hypotheses, not proven winning strategies. Each implementation must
document target positions, priorities, spending reserves, risk tolerance and
conditions for changing course.

| ID | Scoring route and priorities | Response when blocked |
|---|---|---|
| S-POL | Build Support in valuable spaces; establish Police/security; protect Legitimacy | Restore Civic Action prerequisites; interrupt credible PKK wins |
| S-MIL | Expose Guerrillas and remove domestic Bases where disruption exceeds opportunity cost | Convert cleared positions to Support; avoid low-value external pursuits |
| S-CON | Deny PKK scoring positions while maintaining a secure Support network | Reinforce valuable spaces; attack when denial otherwise fails |
| S-ADAPT | Compare scoring, denial and investment through bounded lookahead | Re-evaluate margins and imminent wins at each decision |
| P-POL | Establish domestic Bases or Control and buy Opposition efficiently | Redress worthwhile blocks; protect scoring positions; prevent State wins |
| P-EXP | Reach larger-population spaces and build a distributed domestic network | Change routes; stop expanding when existing positions offer better timely returns |
| P-SURV | Preserve forces, resources and camps, then convert into domestic score | Trigger conversion from estimated actions remaining; abandon survival-only play when margins require it |
| P-ADAPT | Compare Opposition, Bases and reducing State Support/Legitimacy | Re-evaluate threats, Harm and timing at each decision |

Explore cautious and aggressive parameters during development. Freeze one set per
family for the main matrix. Report retained variants in separate extension runs.

Keep existing concentration, civic-action, emergency-rule, sanctuary, concealment
and coerce-only players as adversarial controls. Keep scripted and random-legal
players as diagnostic baselines. Exclude these controls from headline averages
over qualified players.

## 5. Player interface and coverage

Use: faction-visible observation, candidate plans, engine validation, strategy
evaluation, selected command, engine application. Only the engine resolves rules
and live randomness. Players cannot mutate state or inspect unrevealed cards,
future RNG values, deck order or opponent private information.

Search must sample unknown futures from legal distributions, not read the actual
hidden deck or RNG. Keep search RNG separate from game RNG. Test observation
boundaries. Audit logs may contain protected replay data; players may not read it.

| Decision family | Required coverage |
|---|---|
| Initiative | Every legal box, Pass and eligibility consequences |
| Events | Permitted sides, targets, allocations and pending choices |
| Operations | All Scenario A operations, multi-space plans, movement amounts and faces |
| Special Activities | All Scenario A activities, combinations, timing and interrupted continuations |
| Campaign | ARGK play/decline, allocations, Propaganda spending, Emergency Rule, Redeploy and skips |

Large plan spaces may use pruning. Document it, keep all action families reachable
and compare against a broader generator on tactical fixtures. A shared omission
can weaken the whole league.

Log rejected candidates, pruning and fallback reasons. Rejection during search is
normal; an illegal submitted command is a failure. Never silently substitute a
generic player in qualified evaluation. Automatic advancement is not a fallback.
An unexplained empty candidate set creates an incomplete game and diagnostic.

Start with coded players and bounded lookahead. Language-model agents are an
optional extension for discovery, counters and review. Record model/provider,
prompt version, observations, responses, commands, sampling settings and inference
budget. Replay saved commands; identical prompts need not reproduce decisions.

## 6. Player qualification

Hand-review tactical fixtures against rules. Each names its source, alternatives
and acceptable outcomes. Accept equivalent good actions, not one exact command.

| Benchmark | Pass condition |
|---|---|
| Available win | Take a forced immediate win within the fixture's decision horizon |
| Preventable loss | Prevent a forced immediate loss when a legal defence exists |
| Scoring | Recognize population weights, domestic Bases and below-threshold final wins |
| Costs and Harm | Respect caps, redress prerequisites, resources, Harm gate and final penalties |
| Procedures | Legally resolve Events, ARGK, host interruptions, spending and Redeploy |

Every qualified player passes all applicable fixtures with no submitted illegal
commands or private-data leaks. Each also completes 20 development games without
unexplained fallback, including blocked-strategy positions. Record the fixture
suite hash. Winning against scripted play alone does not prove competence.

Add regression fixtures for discovered defects. Independently check score
arithmetic and tactical alternatives; the engine must not be its only oracle.

## 7. Tournament design

Run four State families against four PKK families. Factions stay fixed. Do not use
the current `--swap-seats` behavior for this matrix: opposite-faction policies fall
back to scripted play. Compare player versions on the same opponent roster and
starting seeds instead.

| Stage | Sample | Purpose |
|---|---|---|
| Pilot | 20 games per cell; 320 total | Debug; excluded from final estimates |
| Frozen baseline | 200 fresh seeds per cell; 3,200 total | Main matchup matrix |
| Option sensitivity | 50 fresh seeds per cell per nonbaseline option combination; 2,400 total | Separate reports for option dependence |
| Adversarial | Each faction-specific control against all four qualified opponents; 20 seeds per cell | Research exploit screens |
| Confirmation | New fixed batch of 200 seeds per selected matchup | Test declared counters and persistent advantages |

Use the same starting seed block across cells within a suite. Different actions
can consume RNG differently, so later rolls need not match. Record actual decks
and outcomes. Player seeds are stable functions of experiment/game/player IDs.

For stochastic players, average over declared player randomness. Add a declared
subset with repeated player seeds per game seed to measure sensitivity. Group
those repeats by game seed in uncertainty estimates, not as independent decks.

Give comparable search players equal engine-transition budgets. Report wall time
and separate budget classes for language-model agents. Do not mix budget classes
without labeling them.

Retain 2,000 commands per game as an initial safety limit. Set decision and wall
limits after the pilot and record them before freezing. Limits create incomplete
games, not losses. Preserve failures and continue independent jobs; suspend an
affected condition if its integrity is uncertain.

## 8. Targeted mechanic suite

Keep constructed legal fixtures separate from representative win-rate estimates.

| Area | Required evidence |
|---|---|
| Victory | First check skipped, simultaneous qualification, negative final margins, ties and excess Harm |
| Political economy | Rally Agitation, Train Civic Action, Propaganda prerequisites/caps and blockers |
| Civilian effects | Harm, Coercion, Guard upkeep/abuse, Strike Collaborators, Europe and marker removal |
| Sanctuary | Each posture, independent host effects, hot pursuit options and interrupted actions |
| Sequence/cards | Eligibility rows, mandatory Always lines, both Event sides, ARGK, Redeploy/Reset and final skips |

Coverage ledger entries are: natural exposure, reviewed fixture, not applicable or
unresolved. Fixtures do not demonstrate natural strategic use. Track Pass shares,
eligibility streaks, unused resources and repeated no-progress choices as
diagnostics, not automatic proof of a rule defect.

For suspected harmful-action incentives, compare legal alternatives from the same
position. Record immediate score, relative margins, Harm and later outcomes
separately. A later win alone does not establish causation. Send apparent conflicts
with research design constraints to review; do not alter those constraints in code.

## 9. Evidence artifacts

Each immutable experiment directory contains the manifest, player configs,
qualification, commands, replay hashes, metrics, coverage, failures and report.
Use stable game and decision IDs.

| Level | Data |
|---|---|
| Decision | Observation hash, faction, card/phase, eligibility, candidates/pruning, selected plan, evaluation components, top alternative, costs, time and errors |
| Checkpoint | Before/after each Propaganda phase: resources, political totals, Bases, Legitimacy, Europe, postures, markers, scores, margins and qualification |
| Game | Seeds, options, versions, card order, commands, final hash, winner/end reason, round, duration and completion status |
| Report | Matchup matrix, uncertainty, margins, early wins, threshold attainment, Harm penalties, scoring routes, coverage and anomalies |

The logged top alternative is best among generated candidates, not proof of the
best legal move. Keep heuristic estimates distinct from observed outcomes.

## 10. Analysis and counter-strategies

Report State win rate per cell with a 95% Wilson interval and completed-game count.
Report incomplete games and causes separately. They block acceptance until fixed
and rerun. At 200 independent games, uncertainty near 50% is about seven percentage
points. Include final-margin difference distributions.

An equal-weight matrix average describes this roster, not human win probability.
Estimate its uncertainty by resampling shared game-seed groups across cells.
Use paired per-seed differences when comparing player or rule versions.

Review triggers: any matchup at 80% wins, either faction above 60% in the roster
average, recurring large margin gaps or an apparent forced exploit. These are not
balance pass/fail targets. Confirm exploratory findings on fresh seeds. Do not add
games until a desired statistical result appears. Formal claims across many cells
require a declared multiple-comparison analysis.

Review five closest finishes, five largest margin gaps and five seeded-random
games, plus every failure and suspected exploit. Deduplicate overlaps. Attribute
findings to rules, candidate coverage, evaluation, planning or chance with replay
evidence.

Develop counters to persistent dominant patterns. Freeze and qualify each counter,
then test on fresh seeds against the dominant player and earlier roster. Preserve
old opponents to detect overfitting. Record unsuccessful counters too. Do not tune
thresholds to compensate for an unqualified player.

## 11. Acceptance and next-phase recommendation

| Gate | Evidence required |
|---|---|
| Reliability | All scheduled evaluation games accounted for and completed after documented fixes/reruns; no unresolved crash, stall, illegal submission or replay mismatch |
| Competence | Eight qualified players, full decision-family coverage and no unexplained generic fallback |
| Coverage | Every applicable mechanic covered naturally or by reviewed fixture; natural-use gaps visible |
| Strategic review | Persistent dominance/exploit flags have diagnoses, tested counters and recorded dispositions |
| Reproducibility | Frozen manifests/versions, complete replays and machine-readable results reproduce reported outcomes |

Do not require every matchup to approach 50/50 or claim comprehensive balance
proof. A disposition may accept a documented limitation, but engine defects and
missing procedures require resolution.

The final recommendation names remaining risks, successful scoring routes for
both factions and supporting evidence. Preserve human IC-3a: the designer must
complete Scenario A in the UI and export notes. Automation supplements that
checkpoint. It does not close IC-3a, amend research initiative-comparison
requirements or complete later scenario/Phase 4 gates.

## 12. Implementation work packages

| Order | Deliverable | Acceptance |
|---|---|---|
| AP-A01 | Manifest, artifact capture and explicit faction matchup runner | Reproducible commands/results; no cross-faction substitution |
| AP-A02 | Visible observations, candidates and diagnostics | All decision families covered; privacy and empty-candidate checks pass |
| AP-A03 | Eight strategies and tactical qualification | Section 6 passes; strategy assumptions documented |
| AP-A04 | Pilot, replay verification and coverage ledger | All 320 games accounted for; defects resolved before freeze |
| AP-A05 | Frozen tournaments, analysis and confirmation | Sections 7–11 satisfied; human checkpoint reported separately |

Extend [the batch runner](../../sim/src/cli/batch.ts) and
[strategy interface](../../sim/src/cli/strategies/index.ts). Preserve existing
screen commands with their limitations labeled. Add structured output and replay
capture before increasing sample counts. New CLI syntax is an implementation
deliverable, not an existing command promised here.

Implementation requires repository tests and TWO-PASS REVIEW. Cover runner
failures, replay, observation boundaries, phase choices and independent scoring
fixtures before running large tournaments.
