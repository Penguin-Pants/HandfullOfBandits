# Scenario A automated players and candidate generation

Status: implemented for [the automated playtest plan](20-scenario-a-automated-playtest-build-plan.md), Phases 3 to 5. Requirements: [19 s3 to s6](19-scenario-a-automated-playtest-spec.md).

These strategies are hypotheses about scoring routes. They are not proven strong play. Results apply only to this roster.

## Player contract

| Step | Owner | File |
|---|---|---|
| Public observation (allowlist, frozen copy) | Trusted runner | `sim/src/cli/player-observation.ts` |
| Candidates on a public projection, then live validation | Trusted runner | `sim/src/cli/candidates.ts`, `game-runner.ts` |
| Choice of one candidate ID | Player | `sim/src/cli/strategies/scenario-a.ts` |
| Apply, hash, journal | Trusted runner | `sim/src/cli/game-runner.ts` |

- The observation omits the seed, RNG, pile contents and order, set-aside identities and opponent hand identities. It keeps played cards, pile counts and all board state (rules 2.2).
- Search uses `determinize`: a full state built from the observation, with piles sampled under the deck rules (rules 10.3) and a fresh RNG. Sampling is uniform within the constraints. It is a legal distribution, not the exact posterior over the deal.
- Search randomness comes from the player seed (SHA-256 of experiment, game and faction IDs). Game randomness stays in the engine.
- Each decision has a budget of 600 engine transitions for every qualified family. Equal budgets, no wall-clock cutoffs, so play is reproducible.
- A player error, an unknown candidate ID or an empty candidate set ends the game as incomplete. Nothing substitutes another player.

## Candidate generation and pruning

Generator version `cand-1`. Every emitted command passed engine validation. Each family has its own cap of 14 retained candidates, so one family cannot crowd out another. Single-location plans are split by option (for example `train/base`, `rally/grow`), by multi-location plans (`/multi`), by Europe Rally and by political sub-action (`/civicAction`, `/agitate`).

| Decision | Generated plans | Pruning |
|---|---|---|
| Card: Pass, Event | Pass; both sides; all answers to option questions; up to 5 counts; up to 8 space sets (highest Pop first); free-action plans from the Operation generator | 60 question nodes per side |
| Train | Per space: 6 Troop/Police mixes, 1 or 2 Guards, Base; Civic Action of 1 or 2 shifts clearing all blocks; 2 to 4 highest-Pop spaces with their first option | 6 multi-space sets per size |
| Garrison | Activation in each space with Underground Guerrillas, with 0 or enough Police moved in | Police from spaces with 2 or more |
| Sweep | Each target with all adjacent Troops, none, or half; 2 to 3 targets together | 4 sets per size |
| Assault | Each target, all affordable targets, pairs | 3 pairs |
| Rally | Per location grow (maximum), Base, place, flip; Europe; Academy extras; Agitate 1 or 2 shifts (two spaces with Extra Agitate); 2 to 4 locations, Bases first | 5 sets per size, 7 best locations |
| March | Per destination all, Underground only, groups of 2, all but one; pairs of domestic destinations with disjoint origins | 8 pairs |
| Attack, Coerce | Each space, all together, pairs | 3 pairs |
| Special Activities | Air Mobility from the two largest Troop stacks; Cross-Border lifts of 0, 2, 3 or 6 into KDP or PUK; Diplomacy at each target; Ambush in Attack spaces; Extort in all qualifying spaces, before or after; Strike Collaborators in each Guard space or pairs; Host Pressure before or after | First 6 Operation plans per SA |
| ARGK | Decline; all four in one Base space; 2 and 2 in pairs; 1 each | 6 pairs |
| Resume after Host Pressure | Operation generator for the saved Operation and box, no SA | Family cap |
| Upkeep shortfall | Fewest Guards removed: low-Pop spaces first, or crowded spaces first | 2 orders |
| Legitimacy | Keep (Advance) or each permitted Emergency Rule step | None |
| Civic Action, Agitation | Best allocation for every total cost (exact over 9 or fewer spaces, else greedy); buy-back of excess Harm one marker at a time, alone and with the best remaining allocation | Pareto frontier |
| Redeploy | State: required Iraqi exits to the 4 highest-Pop legal destinations; consolidation toward the most threatened base; Police into Controlled spaces without Police. PKK: none, all adjacent into Bases, external only, domestic only | Fixed list |

A wider generator (all bounds x4) is compared with the bounded one on three opening fixtures in `sim/test/candidates.test.ts`. The bounded best one-ply value is within 1 point of the wider best. The Agitation and Civic Action frontiers match a brute-force optimum. Two earlier pruning defects were found by these checks and fixed: Rally+Agitate and Train Base plans were crowded out by one family cap, and multi-destination March plans were cut.

## Shared search and evaluation

File: `sim/src/cli/strategies/evaluation.ts`.

1. **Forced lines.** In the final Propaganda round, Civic Action is solved against the PKK's best Agitation reply and Agitation is solved exactly. Ended games score ±1000 plus the margin difference, so a sampled immediate win or loss dominates heuristics.
2. **One-ply search.** Each candidate is applied to a determinized state and the automatic phases that follow (including an opening victory check) are run.
3. **Re-sampling.** The best six are evaluated on two more determinizations (new deck order and dice) and averaged.
4. **Adaptive families.** The best four are re-valued after the opponent's best static reply on the same card, sampled over up to 40 opponent candidates with a quota per family.

Value = own margin minus opponent margin (rules 7.3, including 2 per Harm above six) plus estimates: a share of each side's remaining **potential** (Pop per affordable shift: State 2 Resources per shift where it has Control and Police, PKK 1 per shift where it has a Base or Control, with one more income when a non-final Propaganda remains), a bonus for qualifying at a pending opening check (rules 7.2), and family shaping terms. Logged components separate the earned margin difference from these estimates.

## Families (frozen v1)

| ID | Target positions and priorities | Reserves and risk | When blocked or changing course |
|---|---|---|---|
| S-POL | Policed, Controlled high-Pop spaces; Support via Civic Action; Legitimacy | Own potential 0.7, opponent 0.4; Police-Pop and Legitimacy shaping | Restores Control and Police where Civic Action is blocked; forced-line search interrupts PKK wins |
| S-MIL | Exposed Guerrillas and domestic Bases | PKK Bases 3, Guerrillas 0.6, Active Guerrillas 0.4 | Converts cleared spaces to Support through the potential term; external pursuit only when its value is higher |
| S-CON | Denial of PKK Bases, Control and Agitation room | Opponent potential 1.0, PKK Control Pop 0.4, Bases 1.5 | Reinforces valuable spaces; attacks when denial otherwise fails |
| S-ADAPT | Balanced | Potential 0.6/0.6, Bases 1 | Sampled opponent reply on the best four plans |
| P-POL | Domestic Bases or Control, then Opposition by Agitation | Own potential 0.8, Bases 1, Control 0.15 | Redresses worthwhile blocks; forced-line search stops State wins |
| P-EXP | Distributed network in larger-Pop spaces | Presence Pop 0.25, Bases 1.5 | Changes routes; the potential term stops expansion when existing positions return more |
| P-SURV | Guerrillas, Resources and camps, then conversion | Underground 0.5, Resources 0.4, external 0.15, preservation scaled down as the expected cards before the final Propaganda fall | Converts when the expected cards left fall below half the top part; margins override survival |
| P-ADAPT | Balanced | Potential 0.7/0.6, Bases 1 | Sampled opponent reply on the best four plans |

All weights are in `FAMILIES` (`scenario-a.ts`) and are recorded in each experiment's `players.json`. No parameter variant was tuned on evaluation seeds.

## Controls and baselines

Legacy research 12 s7 policies (`S-CTRL-concentration`, `S-CTRL-civic-action`, `S-CTRL-emergency-rule`, `P-CTRL-sanctuary`, `P-CTRL-concealment`, `P-CTRL-coerce-only`) read the full live state and use the scripted policy where they have no rule. They are unqualified controls. `S-RANDOM`/`P-RANDOM` choose uniformly among generated legal candidates. `S-CTRL-scripted`/`P-CTRL-scripted` is the IC-2a policy. None enters headline averages.

## Qualification

`sim/src/cli/qualification.ts`, run by `sim experiment qualify <out.json>` and `sim/test/player-qualification.test.ts`. Each fixture names its rules source, its alternatives and its accepted outcomes. An independent score calculation written from rules 7.1 to 7.3 judges outcomes and is checked against the engine over every position of four random games. Each fixture has at least one passing and one failing generated candidate, and random baselines fail several fixtures, so the suite discriminates.
