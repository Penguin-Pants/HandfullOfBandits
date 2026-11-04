# Scenario A automated playtest report

Date: 2026-11-03. Requirements: [19](19-scenario-a-automated-playtest-spec.md). Plan: [20](20-scenario-a-automated-playtest-build-plan.md). Players: [21](21-scenario-a-strategies.md). Status ledger: [22](22-scenario-a-automated-playtest-status.md).

## Bottom line

1. **Reliability:** 40,000 frozen evaluation games in five program runs. 39,999 completed and replay hash by hash to their recorded final state; the `cand-5` run completed all 8,000. One `cand-4` game (`options-4`) failed at an **engine dead end**: after Host Pressure before March, DEC-56 asks for new March destinations, but no legal, affordable March exists. It is recorded with its valid 58-command prefix and no fallback; the designer resolved it with DEC-62 (see Remaining risks). No crash, stall, illegal submission or replay mismatch.
2. **Headline result (generator `cand-5`, search `search-2`, current):** with the frozen eight-family roster, the State wins 55.5% [53.7, 57.4] of the equal-weight baseline matrix. This describes this roster only, not a human win probability. Superseded runs gave 56.3% [54.4, 58.3] (`cand-4`), 52.2% [50.3, 54.1] (`cand-3`), 53.7% [51.4, 55.9] (`cand-2`) and 48.0% [46.2, 49.7] (`cand-1`) on other seeds; they are retained below.
3. **Main strategic finding, confirmed five times on fresh seeds:** a PKK counter, **P-SHIELD** (domestic Bases kept with an Underground Guerrilla), held every State family to 3.0-11.5% (`cand-5`), 3.0-10.5% (`cand-4`), 3.0-11.0% (`cand-3`), 5.5-10.5% (`cand-2`) and 0.0-9.5% (`cand-1`). No State counter tried has beaten it. **Hypothesis, not a measured rules defect:** the Base-protection route is a dominant PKK line in Scenario A against one-ply State planning. It needs a stronger State planner or human play before any rule change.
4. **Generator sensitivity:** individual matchups moved by up to 57 points between generator versions (S-ADAPT vs P-EXP: 90.0% under `cand-2`, 33.0% under `cand-3`; S-ADAPT vs P-ADAPT: 38.2%, then 95.5%). Exact spending (`cand-4`) raised S-MIL vs P-POL from 66.5% to 84.0%; under `cand-5` it is 67.0%. Cell results describe these players and this generator, not stable properties of the factions.
5. **Human IC-3a stays open.** Automation supplements it and does not close it.

Measured results are labeled with game counts. Statements marked *hypothesis* are not established by these runs.

## Generator revisions

PR #40 review found pruning, search-order and spending defects in four rounds. `cand-2` keeps Rally flip, Train Guards and Train Base plans and the most valuable spending allocation. `cand-3` values Harm removal in spending choices and keeps small Train placements; `search-2` evaluates action families in round-robin order so the transition budget cannot starve late families. Each change has regression tests. The whole frozen program was rerun on fresh evaluation seeds after each round, with the same players and weights. Earlier runs are retained as superseded evidence. Because each run uses different seeds, changes between runs are not paired estimates of a fix's effect.

`cand-4` (PR #41) replaces the spending frontier with one exact search. It fixes the four `cand-3` gaps from review rounds 3 and 4: the Harm benefit was capped per space instead of across the allocation, removal-only spending was missing below the Harm limit, final Civic Action pruning ignored the PKK's Agitation reply, and over nine eligible spaces the greedy frontier dropped second shifts. **`cand-4` gap** (PR #41 review): of two Civic Action allocations with equal gain and exposure, only the first is kept, although the other can survive a resource-limited Agitation reply better. `cand-5` (PR #42) fixes it by keeping up to three tied allocations per search state. Details in [21](21-scenario-a-strategies.md).

## Reproduce

All artifacts are in `sim/experiments/`. Each run directory holds the frozen manifest, identity (commit, engine and player fingerprints, lock hash, Node), players, the normalized package, the schedule, results, failures, the compact replay archive `replays.jsonl.gz` (every command and state hash), full journals of the reviewed games in `review/`, and `analysis-v1/` or `analysis-v2/` (report, coverage ledger, statistics). Runs after the second review round use analysis v2: one play per seed for cell intervals, controls excluded from roster averages, replay hashes checked before coverage.

1. `cd sim`
2. `npm run sim -- experiment replay experiments/runs/baseline-5` (checks all 3,520 games to their recorded final hashes)
3. `npm run sim -- experiment run experiments/manifests/baseline-5.json --out <new-dir>` regenerates the full journals; `--out <dir> --resume` continues an interrupted run, keeping every sealed game. It refuses to start if the engine or player code differs from the frozen fingerprints.
4. `npm run sim -- experiment qualify <out.json>` reruns the qualification suite.

| Run | Stage | Generator | Seeds | Games | Complete | Replay |
|---|---|---|---|---|---|---|
| qualification-dev-1 | Qualification (v1) | cand-1 | dev 101-105 | 200 | 200 | identical |
| pilot-1 | Pilot (v1 roster) | cand-1 | dev 1001-1020 | 320 | 320 | identical |
| dev-compare-v2 | Version comparison; pilot of the frozen roster | cand-1 | dev 1001-1020 | 640 | 640 | identical |
| baseline-1 | Frozen baseline (superseded) | cand-1 | eval 1000000-1000199 | 3,520 | 3,520 | identical |
| options-1 | Option sensitivity (superseded) | cand-1 | eval 1000200-1000249 | 2,400 | 2,400 | identical |
| adversarial-2 | Adversarial controls (superseded) | cand-1 | eval 1000250-1000269 | 480 | 480 | identical |
| confirmation-1 | Confirmation and counters (superseded) | cand-1 | eval 1000300-1000499 | 1,600 | 1,600 | identical |
| dev-counter-*, dev-probe-spend | Counter development | cand-1 | dev 3001-3040, 3101-3120 | 800 | 800 | identical |
| baseline-2 | Frozen baseline (superseded) | cand-2 | eval 1000500-1000699 | 3,520 | 3,520 | identical |
| options-2 | Option sensitivity (superseded) | cand-2 | eval 1000700-1000749 | 2,400 | 2,400 | identical |
| adversarial-3 | Adversarial controls (superseded) | cand-2 | eval 1000750-1000769 | 480 | 480 | identical |
| confirmation-2 | Confirmation and counters (superseded) | cand-2 | eval 1000800-1000999 | 1,600 | 1,600 | identical |
| baseline-3 | Frozen baseline (superseded) | cand-3 | eval 1001000-1001199 | 3,520 | 3,520 | identical |
| options-3 | Option sensitivity (superseded) | cand-3 | eval 1001200-1001249 | 2,400 | 2,400 | identical |
| adversarial-4 | Adversarial controls (superseded) | cand-3 | eval 1001250-1001269 | 480 | 480 | identical |
| confirmation-3 | Confirmation and counters (superseded) | cand-3 | eval 1001300-1001499 | 1,600 | 1,600 | identical |
| baseline-4 | Frozen baseline (superseded) | cand-4 | eval 1001500-1001699 | 3,520 | 3,520 | identical |
| options-4 | Option sensitivity (superseded) | cand-4 | eval 1001700-1001749 | 2,400 | 2,399 (1 failed: DEC-56 dead end) | identical, including the failed prefix |
| adversarial-5 | Adversarial controls (superseded) | cand-4 | eval 1001750-1001769 | 480 | 480 | identical |
| confirmation-4 | Confirmation and counters (superseded) | cand-4 | eval 1001800-1001999 | 1,600 | 1,600 | identical |
| **baseline-5** | Frozen baseline (resumed once after a container restart, 2,580 games kept) | cand-5 | eval 1002000-1002199 | 3,520 | 3,520 | identical |
| **options-5** | Option sensitivity | cand-5 | eval 1002200-1002249 | 2,400 | 2,400 | identical |
| **adversarial-6** | Adversarial controls | cand-5 | eval 1002250-1002269 | 480 | 480 | identical |
| **confirmation-5** | Confirmation and counters | cand-5 | eval 1002300-1002499 | 1,600 | 1,600 | identical |

Baselines include the first 10 seeds with 3 player seeds each. adversarial-1 was refused by the freeze check before any game, because the Phase 8 counters changed the player fingerprint. adversarial-2 supersedes it, and sixteen baseline-1 games rerun on the later code reproduce their final hashes.

## Frozen roster

State families v1 and PKK families v2 (`ROSTER_VERSION`). v2 differs from v1 only in a capped conversion potential, tried after the pilot showed heavy State passing. Paired on the pilot seeds, v2 State play changed State wins by −3.1 points on average and v2 PKK play by −4.7 points (better for the PKK), with most intervals including zero (`experiments/dev-compare-v2.md`). The State keeps v1, the PKK uses v2. Qualification under `cand-5`: all eight roster players and both counters pass every applicable fixture (`experiments/qualification-cand5.json`; earlier: `qualification-cand4.json`, `qualification-cand3.json`, `qualification-cand2.json`); random and legacy baselines fail decisive fixtures.

## Baseline matrix (baseline-5, cand-5)

State win rate, 95% Wilson interval, 200 game seeds per cell (first play per seed).

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 35.0% [28.7, 41.8] | 33.5% [27.3, 40.3] | 75.5% [69.1, 80.9] | 63.5% [56.6, 69.9] |
| S-MIL | 67.0% [60.2, 73.1] | 64.0% [57.1, 70.3] | 93.5% [89.2, 96.2] | 73.5% [67.0, 79.1] |
| S-CON | 31.0% [25.0, 37.7] | 13.0% [9.0, 18.4] | 40.0% [33.5, 46.9] | 81.0% [75.0, 85.8] |
| S-ADAPT | 40.0% [33.5, 46.9] | 41.0% [34.4, 47.9] | 43.0% [36.3, 49.9] | 98.0% [95.0, 99.2] |

- Equal-weight roster average: State 55.5% [53.7, 57.4] (seed-cluster bootstrap, 2,000 draws). No faction exceeds the 60% roster trigger.
- Cell triggers: S-MIL vs P-SURV 93.5%, S-CON vs P-ADAPT 81.0%, S-ADAPT vs P-ADAPT 98.0%, S-CON vs P-EXP 13.0%. S-MIL vs P-POL (84.0% under `cand-4`) is 67.0% and no longer triggers.
- Player randomness: in 34 of the 160 repeated seed groups (21%), the winner changed with the player seed (`cand-4`: 32; `cand-3`: 42; `cand-2`: 35; `cand-1`: 47).
- Scoring routes (means over 3,520 games): State Support 24.5 + Legitimacy 10.2; PKK Opposition 11.6 + domestic Bases 1.5. Few games reach a threshold; most are decided on negative final margins.
- Domestic Bases are the strongest observed correlate of the result. PKK win rate by final domestic Bases: 0: 11.7% (1,162 games), 1: 34.6% (774), 2: 61.4% (748), 3: 80.3% (507), 4+: 89.7% (329). Observational, not causal.
- Equal final margins: 91 games (2.6%); the PKK won 79 through the tie order (lower Harm, then PKK).
- Diagnostics: State Pass share 39.5%, PKK 17.8%; mean unused Resources at the end State 4.8, PKK 1.3; no stop-rule flags.

Superseded matrices, same row and column order (% State wins): `cand-4` baseline-4 S-POL 40.0/26.5/77.0/69.0, S-MIL 84.0/68.5/87.5/74.0, S-CON 24.0/14.0/42.5/82.0, S-ADAPT 39.0/38.5/33.5/96.0. `cand-3` baseline-3 S-POL 36.0/25.0/66.0/65.5, S-MIL 66.5/53.5/89.5/76.0, S-CON 24.0/17.5/37.5/80.5, S-ADAPT 38.5/33.0/34.0/95.5. `cand-2` baseline-2 S-POL 35.0/28.6/69.5/38.2, S-MIL 74.1/60.5/90.5/83.6, S-CON 21.8/13.2/40.5/69.1, S-ADAPT 61.4/90.0/45.0/38.2. `cand-1` baseline-1 S-POL 26.4/25.0/66.8/34.1, S-MIL 59.1/63.6/82.7/77.3, S-CON 15.5/25.0/39.5/66.4, S-ADAPT 40.9/83.6/25.5/35.9. The roster average stays within 48-57% across generators; single cells do not.

## Option sensitivity (options-5)

50 games per cell per combination, reported separately: State roster average 56.9% [53.1, 60.3] without hot pursuit, 55.9% [52.1, 59.5] with Syria closed at Restricted, 57.9% [53.6, 61.9] with both denied. All overlap the baseline (`cand-4`: 56.9%, 58.1%, 56.1%). This shows insensitivity **for this roster** only: Cross-Border never occurred and Restricted Syria entry was rare, so the options were barely exercised.

## Adversarial controls (adversarial-6)

The six legacy controls lost all 480 games against the qualified opponents (0/240 State controls, 0/240 PKK controls), as in adversarial-2 to adversarial-5. Analysis v2 reports no roster average for this run, because it has no qualified-versus-qualified cell. The research 12 s7 screens found no exploit the qualified players do not already beat. They are weak screens, not evidence of balance.

## Review triggers, counters and confirmation

The confirmation cells were frozen from the `cand-1` and `cand-2` flags; `confirmation-5` repeats them on fresh seeds.

| Flag | Confirmation-5 (cand-5, 200 fresh seeds) | Confirmation-4 (cand-4) | Confirmation-3 (cand-3) | Confirmation-2 (cand-2) | Confirmation-1 (cand-1) | Attribution | Disposition |
|---|---|---|---|---|---|---|---|
| S-MIL vs P-SURV | 93.5% [89.2, 96.2] | 91.0% | 90.5% | 91.0% | 78.5% | Planning/evaluation: P-SURV preserves forces while S-MIL removes domestic Bases | Persistent. In-roster counter exists (P-SHIELD) |
| S-ADAPT vs P-EXP | 40.5% [33.9, 47.4] | 47.0% | 34.0% | 90.0% | 86.0% | *Hypothesis:* a generator or search artifact of `search-1` and `cand-2` | **Not confirmed** under `cand-3` to `cand-5` |
| S-CON vs P-POL | 21.5% [16.4, 27.7] | 25.5% | 25.0% | 25.0% | 19.0% | Evaluation: S-CON denies but builds little Support | Persistent. In-roster counter exists (S-MIL beats P-POL 67.0%) |
| S-CON vs P-ADAPT 81.0%, S-ADAPT vs P-ADAPT 98.0%, S-CON vs P-EXP 13.0% (baseline-5 only) | not run | not run | not run | not run | not run | P-ADAPT's static reply is exploitable by State adaptive and conservative play (*hypothesis*) | Exploratory; not confirmed; seen in baseline-3 to baseline-5. In-roster counters exist (P-POL and P-EXP against S-CON and S-ADAPT) |
| No PKK family above 36% vs S-MIL | — | — | — | — | — | Persistent dominant State pattern | Counter developed: **P-SHIELD@3** |
| P-SHIELD@3 (counter) | S-MIL 3.0% [1.4, 6.4], S-POL 9.5% [6.2, 14.4], S-CON 11.5% [7.8, 16.7], S-ADAPT 10.0% [6.6, 14.9] | 3.0%, 8.0%, 9.0%, 10.5% | 3.0%, 9.0%, 11.0%, 8.0% | 5.5%, 9.0%, 10.5%, 8.5% | 2.5%, 9.5%, 3.0%, 2.5% | See hypothesis below | **Accepted as a documented limitation** of this roster; design review recommended |
| S-SIEGE@3 (State counter to P-SHIELD) | 0.0% [0.0, 1.9] | 0.0% | 0.5% | 0.0% | 0.0% | Exposing Bases needs a two-card sequence; one-ply search does not plan it | Unsuccessful counter, recorded |

Confirmation-5 PKK roster average over its eight qualified cells: 76.3% (triggered, driven by the four P-SHIELD cells).

Development evidence (development seeds, `cand-1`, not estimates): P-SHIELD@3 won 158/160 against the State roster where P-POL@2, the family it extends, won 103/160 on the same seeds. S-POL@2, S-MIL@2, S-CON@2 and S-ADAPT@2 won 3/80 against it. The no-hoarding probe S-SPEND@3 cut unused State Resources from 4.3 to 0.8 and doubled State wins against P-POL@2 (21/40 vs 10/40), yet won only 3/40 against P-SHIELD.

**Hypothesis (unconfirmed):** protected Base networks dominate one-ply State play because (a) Assault cannot remove a Base while an Underground Guerrilla shares its space, so the State needs Sweep or Garrison first and Assault on a later card, while Rally flip, ARGK and Reset restore concealment; and (b) PKK conversion is cheaper (Agitation 1 per shift, no Legitimacy cap) than State conversion (2 per shift, Civic Action capped at half Legitimacy). Distinguishing a rules property from a planner limitation needs a State player that plans Sweep-then-Assault sequences (two-ply search over own actions) or human play. No threshold or rule was changed.

### Reviewed games

Fifteen games per run were selected reproducibly (five closest, five largest gaps, five seeded-random; no failures). Their full journals are in `experiments/runs/baseline-*/review/`. The baseline-1 review:

- Closest five: all ended on equal final margins; the tie order (lower Harm, then PKK) gave four to the PKK and one to the State. Attribution: rules (tie order) and chance.
- Largest gaps: PKK blowouts ended with 2 to 6 domestic Bases; State blowouts with none. Attribution: planning/evaluation (Base removal or protection).
- Random five: same Base pattern; the State passed 6 to 12 times per game. Attribution: evaluation (State values Resources over modest Operations).

## Coverage

No unresolved ledger entry in any run. Natural exposure covers Operations, Special Activities except Cross-Border, both Event sides, ARGK play, Redeploy, Reset, Civic Action and Agitation spending, Harm, Coercion, Guard upkeep and Guard Abuse, Europe changes and the opening and final victory paths. **Fixture-only (natural-use gaps, baseline-5):** simultaneous qualification, Harm gate at a check, final excess Harm, Syria Hostile, KDP Hostile/Aligned, PUK Host/Hostile/Aligned, Cross-Border and hot pursuit, March into a Restricted box, Leadership Abroad, ARGK decline and Emergency Rule moves (15 entries; 53 natural). PUK Host, March into a Restricted box and ARGK decline occurred naturally in baseline-4 but not baseline-5: they are rare. Displacement and Syria Aligned are not applicable in Scenario A. The ledger per run is in `analysis-v*/coverage.json`. Coverage is built by replay and now fails if any step diverges from its recorded hash; all 27 committed runs pass.

## Acceptance gates (19 s11)

| Gate | Status | Evidence |
|---|---|---|
| Reliability | ⚠️ Pass with one recorded failure | 39,999 of 40,000 evaluation games complete (`cand-5`: 8,000 of 8,000); all replay to their recorded hashes. One `cand-4` engine dead end (DEC-56) recorded with its valid prefix and no fallback |
| Competence | ⚠️ Pass with limits | Eight qualified players pass every fixture with no illegal submission or fallback; full decision-family coverage. Limits: one-ply search, heavy State passing, sanctuary actions rarely chosen |
| Coverage | ✅ Pass | Every applicable mechanic covered naturally or by reviewed fixture; gaps listed above |
| Strategic review | ✅ Pass | Every confirmed flag has a diagnosis, a tested or in-roster counter and a disposition; one unsuccessful counter recorded; one earlier flag not confirmed under `cand-3` to `cand-5`; three baseline-5 flags are exploratory |
| Reproducibility | ✅ Pass | Frozen manifests with fingerprints; archives replay every game; analysis reruns are deterministic |

These gates do not claim balance. The roster average near 50% hides strong matchup effects and a dominant counter-strategy.

## Recommendation and remaining risks

Successful scoring routes measured: **State:** Support through Train + Civic Action plus Base removal (S-MIL). **PKK:** protected domestic Base networks with Agitation (P-SHIELD); Bases plus Opposition (P-POL).

Remaining risks, highest first:

1. **Unconfirmed PKK dominance.** P-SHIELD may reveal a rules imbalance or only one-ply State planning. Next step: add a two-ply State planner (Sweep-then-Assault sequences) and rerun confirmation; in parallel, include a protected-Base line in the designer's IC-3a notes.
2. **State passivity.** The State passes on about 39% of its card choices in every roster. It is partly a player weakness (S-SPEND), so State win rates are likely underestimates.
3. **Sanctuary system unexercised.** Postures beyond Restricted, Cross-Border and hot pursuit never occurred naturally. The option results do not show those options are harmless.
4. **Tie order.** Equal final margins occur in about 3% of games and mostly go to the PKK. This is a designed rule, recorded for review.
5. **Roster and generator dependence.** Results apply to these families, budgets and generator. Generator changes moved single cells by up to 57 points while the roster average stayed within 48-57%.
6. **DEC-56 dead end (resolved by DEC-62).** When Host Pressure before March leaves no legal, affordable March, the engine waits for new March destinations that do not exist (seen once in 40,000 games: `options-4`, game `no-syria-march~S-MILv1~P-ADAPTv2~1001716~r0`, decision 59: PKK Resources 1; of every one-piece March, the only one that passes the movement rules costs more than 1). DEC-56 did not say what happens then. **Resolved by DEC-62 (designer decision 2026-11-04, option A):** the Operation ends with no locations; the roll, posture change and cost stand. The engine change applies to runs after these; the frozen runs above keep their engine and evidence.

Do not change thresholds on this evidence. The DEC-56 dead end is a rules gap, not a balance finding. The designer decides whether a protected-Base network warrants a rule review.

## Human checkpoint

IC-3a remains **open**: no designer playthrough of Scenario A in the UI and no exported notes exist in this work. Automation does not close it, does not amend the research initiative comparison and does not complete later scenario or Phase 4 gates.
