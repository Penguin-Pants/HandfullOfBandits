# Automated players: reference and review checklist

Date: 2026-11-13 (was 2026-11-04). State of the code: generator `cand-6`, qualification suite 2, search `search-2`, observation version 1, roster State v1 and PKK v2, engine with DEC-62. Use this file before each new simulation program, and update it whenever the bots change. Details: [21](21-scenario-a-strategies.md) (players), [19](19-scenario-a-automated-playtest-spec.md) (requirements), [23](23-scenario-a-automated-playtest-report.md) (results).

## Part 1: summary

### What the bots are

- Ten coded players (four State, four PKK, two counters) and six weak control bots. No language models.
- **All bots share one decision engine.** A strategy is only a set of weights on what to value.
- Each decision: list the legal choices, try each one on a sampled guess of the hidden deck, score the result, pick the best. The bots look **one action ahead**; two adaptive bots also check the opponent's best reply on the same card.

### Strengths

- **Always legal and reproducible.** Every command is validated by the engine; every game replays hash by hash; 40,000 frozen games so far.
- **No cheating.** Bots see only what a human player sees; the hidden deck is sampled, never read.
- **Cover the whole decision space.** Every action family, Event side, Propaganda phase and host procedure has candidates; a qualification suite proves each player can find wins, avoid losses and score correctly.
- **Find rules gaps and dead ends.** They play far more games than humans and hit rare paths (for example the DEC-56 dead end, closed by DEC-62).
- **Measure matchups.** 200 games per pairing give intervals of about ±7 points.

### Weaknesses

- **One action ahead.** No plan spans two cards, such as Sweep now and Assault next card. This is the main limit (see P-SHIELD, [25](25-p-shield-designer-notes.md)).
- **Bounded choice lists.** At most 14 candidates per action family. Four review rounds found pruning gaps; more may exist.
- **Hand-set weights.** Each strategy is a guess about good play, not a learned or optimal policy.
- **Passive State.** The State passes on about 39% of its card choices and ends with about 4.8 unused Resources.
- **Narrow strategy set.** Eight families plus two counters; any line nobody coded is untested.
- **Tuned for Scenario A.** The weights, the potential estimate and the win and loss fixtures come from the archived Scenario A (C1 and C2). Since `cand-6` the bots have candidates, coverage entries and procedure fixtures for the C3 to C5 decisions, but no weight is tuned for them (Part 2).

### What the program can and cannot show

| It can show | It cannot show |
|---|---|
| The rules engine runs every legal path without crashing or stalling | That the game is balanced for humans |
| A rule produces a dead end or an unintended outcome | Human win rates, fun, length or clarity |
| Which coded strategies beat which, with confidence intervals | That a strategy is dominant against **all** play (only against these bots) |
| That a line is strong enough to beat every coded opponent (a flag for the designer) | Whether a weakness is in the rules or in the bots' one-step planning |
| How an option (hot pursuit, Syria closure) changes results **for these bots** | Effects of options the bots rarely use (sanctuary play beyond Restricted) |
| Scoring routes, tie rates, Base counts and other trends | Strategies that need multi-card plans or bluffing |
| Regression after a rule change: same seeds, compare | Anything about cards or mechanics not in the package |

Human IC-3a play is still needed for every right-hand item.

## Part 2: reference

### Decision pipeline

| Step | What happens | Code | Key limits |
|---|---|---|---|
| 1. Observe | Allowlisted, deep-frozen view: board, tracks, visible cards; deck order and future dice hidden | `sim/src/cli/player-observation.ts` | Observation version 1 |
| 2. Generate | Legal candidates per decision kind and action family, engine-validated | `sim/src/cli/candidates.ts` | Family cap 14; broad mode ×4 for audits |
| 3. Determinize | Sample a legal deck order and dice with the player's own seed | `player-observation.ts` (`determinize`, `SearchRng`) | Player seed from experiment, game and faction |
| 4. Simulate | Apply a candidate, run automatic phases and any victory check | `sim/src/cli/strategies/scenario-a.ts` | 600 engine steps per decision (`SEARCH_BUDGET`) |
| 5. Score | Margin difference (rules 7.3, Harm penalty) + potential estimate + strategy weights | `sim/src/cli/strategies/evaluation.ts` | Weights in `FAMILIES` |
| 6. Search | Family round-robin until 25% of the budget is left; best 6 re-scored on 2 more samples | `scenario-a.ts` (`searchDecide`, `roundRobin`) | `search-2` |
| 7. Reply check | Adaptive bots only: best 4 re-scored against the opponent's best reply, up to 40 sampled | `scenario-a.ts` | S-ADAPT, P-ADAPT |
| 8. Final round | Civic Action solved against the best Agitation reply; Agitation solved exactly over generated allocations | `evaluation.ts`, `candidates.ts` | Exact search with ties kept (`cand-5`) |

### Player roster

| Player | Side | Values |
|---|---|---|
| S-POL v1 | State | Policed, Controlled high-Pop spaces; Support; Legitimacy |
| S-MIL v1 | State | Exposed Guerrillas; removing domestic Bases |
| S-CON v1 | State | Denying PKK Bases, Control and Agitation room |
| S-ADAPT v1 | State | Balanced, with the reply check |
| P-POL v2 | PKK | Bases or Control, then Opposition |
| P-EXP v2 | PKK | Spread network in high-Pop spaces |
| P-SURV v2 | PKK | Preserves forces, converts as the final Propaganda nears |
| P-ADAPT v2 | PKK | Balanced, with the reply check |
| P-SHIELD v3 | PKK counter | P-POL plus Underground protection of Bases |
| S-SIEGE v3 | State counter | S-MIL plus value for exposing protected Bases |

PKK v2 caps the potential estimate by the remaining conversion opportunities. Controls: three State and three PKK legacy screens; random baselines S-RANDOM and P-RANDOM.

### Frozen limits and safeguards

- Per decision 20 s, per game 300 s, 2,000 commands; measured decision p99 332 ms.
- Manifests freeze engine and player fingerprints; a run refuses to start if code changed. `--resume` continues an interrupted run.
- Qualification suite: 8 State and 10 PKK fixtures across five benchmarks (available win, preventable loss, scoring, costs and Harm, procedures); random and control baselines must fail.
- Analysis: Wilson intervals on one play per seed, seed-cluster bootstrap for roster averages, review triggers at a 60% roster average, 80% wins for either side in a cell, and a median margin gap of 10.

### Scenario-specific assumptions

| Assumption | Where | Generalizes? |
|---|---|---|
| Cards to the final Propaganda, from scenario data (`finalRound`, piles, campaigns) | `evaluation.ts` timing | Yes, reads the scenario |
| Potential estimate: Civic Action caps and Train/Rally chances of the remaining Propaganda rounds | `evaluation.ts` | Partly; tuned on a 2-round game |
| Strategy weights | `FAMILIES` in `scenario-a.ts` | No; tuned on Scenario A pilots |
| Qualification fixtures (campaign C2, round 1 or 2, named cards) | `qualification.ts` | No |
| Coverage mechanics list | `experiment-coverage.ts` (`MECHANICS`) | Yes since 2026-11-13: Village Clearance, Covert Action, ceasefire, Legal Politics, the three later Pivotals, Europe Ban |
| Space and box names (host zones, Western Cities, Diyarbakir City fallback) | `candidates.ts` | No; map-specific |
| Event candidates: answers to each card's questions, 60 question nodes per side | `candidates.ts` | Yes for new cards using existing question types |

### C3 to C5 decisions (`cand-6`, 2026-11-13)

| Decision | Candidates | Code |
|---|---|---|
| Village Clearance, Covert Action | Special Activity variants with Sweep and Garrison; both Reception spaces; before and after | `candidates.ts` (`saVariants`) |
| Declare Ceasefire | One candidate in the Limited Op box, from C3 | `candidates.ts` (card decision) |
| Legal Politics | Two parts, State first: closure filing, accept or leave a ceasefire; then the PKK ends or leaves | `candidates.ts` (`legalPoliticsState`, `legalPoliticsPkk`), `game-runner.ts` |
| Serhildan, Area Domination, Coercive Diplomacy on Syria | Every completion of the card's questions, or decline | `candidates.ts` (pivotal decision) |

Check run on 2026-11-13 (6 games, S-POL against P-POL and S-MIL against P-SURV, development seeds 11 to 13): all games complete. Seen: Serhildan in 4 games, ceasefire Declared in 4, Reciprocal Restraint in 2, a Restraint Broken marker in 3 (breach or State marker only; the probe did not separate them in this run), a State closure filing in 6, a ban in 5, Covert Action in 3, Area Domination in 1. Not seen: Village Clearance, the line 6 prosecutor filing, Coercive Diplomacy on Syria, leaving a ceasefire at the ceasefire step. Six games are a smoke check, not a result.

## Part 3: known gaps log

| Gap | Found | Effect | Status |
|---|---|---|---|
| One-step planning | Phase 8 counters, PR #40 | P-SHIELD may only beat the bots | Open; option A (three-step beam search) proposed |
| State passivity (about 39% Pass, about 4.8 Resources left) | Pilot, every baseline | State results likely low | Open; S-SPEND probe showed a partial player cause |
| Sanctuary play beyond Restricted, Cross-Border, hot pursuit not chosen naturally | Coverage ledgers | Options look harmless only because unused | Open; fixtures cover legality |
| Hand-set weights | Design | Results depend on these families | Open; review per program |
| Pruning gaps in candidate generation | PR #40 and #41 reviews (cand-2 to cand-5) | Missed best moves in rare positions | Fixed as found; broad-mode audit exists |
| DEC-56 dead end | options-4 | One game stopped | Closed by DEC-62 |
| No candidates for C3 to C5 decisions | Full campaign port, 2026-11-12 | Bots never used Village Clearance, Covert Action, ceasefire, closure filing or the later Pivotals | Closed by `cand-6` |
| ARGK fixture offered only "decline" | `cand-6` work | The fixture did not test an ARGK play | Fixed in suite 2 |
| Later free actions of one card were planned on the board before the card | PR 106 review | Area Domination: the Assault after the Sweep was offered only against Guerrillas already Active. The same held for every Event with two free actions | Closed: `engine.questionState` gives the board at the open question, and `eventCompletions` plans each answer on it |
| A question after a random result (DK-079 and DK-080 shaded with 2 Covert markers) had no answer | Smoke run after `cand-6` | Validation stops at the random reveal, so the generator sent no answer and `engine.apply` threw. One random-bot game failed | Closed: the generator applies a valid command on its sampled board and answers a late question |
| Weights and potential estimate not tuned for C3 to C5 | Full campaign port | Choices in C3 to C5 are legal but not informed | Open; needs the designer's view of good play |

## Part 4: review checklist before the next simulations

### Always

1. Update the frozen manifests; the engine or player fingerprint changes with any code change.
2. Requalify every player (`sim experiment qualify`) and confirm baselines still fail.
3. Run a pilot on development seeds and check decision times against the 20 s limit.
4. Update this file and [21](21-scenario-a-strategies.md).

### When adding cards (C3 and later)

- Check that every new Event question type has candidates; add generator cases for new ones.
- Add the new cards' mechanics to `MECHANICS` and fixtures for any that bots rarely choose.
- Recheck the Event search cap (60 question nodes per side) on the largest new cards.

### When the campaign gets longer

- Re-tune the potential estimate: it assumes a 2-round game.
- Recheck P-SURV's conversion timing (expected cards to the final Propaganda).
- Expect slower runs: game time scales with length; check the 300 s and 2,000-command limits.
- Consider a larger search budget, since early choices matter longer.

### When adding mechanics (Displacement, Syria Aligned, later Campaign systems)

- Add candidate families for new actions and remove "not applicable" coverage entries that now apply.
- Add qualification fixtures for each new mechanic's win, loss and cost cases.
- Review the observation allowlist: new hidden information must stay hidden.

### When adding deeper planning

- Decide the depth and beam widths; measure decision time on the pilot before freezing.
- Keep the one-step roster as a registered baseline for paired comparison.
- Rerun the confirmation cells first (P-SHIELD in particular): they answer the open question directly.
