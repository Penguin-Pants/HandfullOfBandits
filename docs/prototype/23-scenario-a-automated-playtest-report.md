# Scenario A automated playtest report

Date: 2026-11-03. Requirements: [19](19-scenario-a-automated-playtest-spec.md). Plan: [20](20-scenario-a-automated-playtest-build-plan.md). Players: [21](21-scenario-a-strategies.md). Status ledger: [22](22-scenario-a-automated-playtest-status.md).

## Bottom line

1. **Reliability:** 16,000 frozen evaluation games in two program runs completed. All replay hash by hash to their recorded final state. No crash, stall, illegal submission, generic fallback or replay mismatch.
2. **Headline result (candidate generator `cand-2`, current):** with the frozen eight-family roster, the State wins 53.7% [51.4, 55.9] of the equal-weight baseline matrix. This describes this roster only, not a human win probability. The superseded `cand-1` run gave 48.0% [46.2, 49.7] on other seeds; it is retained below.
3. **Main strategic finding, confirmed twice on fresh seeds:** a PKK counter, **P-SHIELD** (domestic Bases kept with an Underground Guerrilla), held every State family to 5.5-10.5% (`cand-2`) and 0.0-9.5% (`cand-1`). No State counter tried has beaten it. **Hypothesis, not a measured rules defect:** the Base-protection route is a dominant PKK line in Scenario A against one-ply State planning. It needs a stronger State planner or human play before any rule change.
4. **Human IC-3a stays open.** Automation supplements it and does not close it.

Measured results are labeled with game counts. Statements marked *hypothesis* are not established by these runs.

## Generator revision

PR #40 review found two pruning defects in candidate generation `cand-1`: Rally flip, Train Guards and Train Base plans could be pruned before their families, and a family cap could drop the most valuable Propaganda spending allocation. `cand-2` fixes both, with regression tests. The whole frozen program was rerun on fresh evaluation seeds under `cand-2` (`baseline-2`, `options-2`, `adversarial-3`, `confirmation-2`), with the same players and weights. The `cand-1` runs are retained as superseded evidence. Both runs give the same qualitative findings. Because they use different seeds, the 5.7-point change in the roster average is not a paired estimate of the fix's effect.

## Reproduce

All artifacts are in `sim/experiments/`. Each run directory holds the frozen manifest, identity (commit, engine and player fingerprints, lock hash, Node), players, the normalized package, the schedule, results, failures, the compact replay archive `replays.jsonl.gz` (every command and state hash), full journals of the reviewed games in `review/`, and `analysis-v1/` (report, coverage ledger, statistics).

1. `cd sim`
2. `npm run sim -- experiment replay experiments/runs/baseline-2` (checks all 3,520 games to their recorded final hashes)
3. `npm run sim -- experiment run experiments/manifests/baseline-2.json --out <new-dir>` regenerates the full journals. It refuses to start if the engine or player code differs from the frozen fingerprints.
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
| **baseline-2** | Frozen baseline | cand-2 | eval 1000500-1000699 | 3,520 | 3,520 | identical |
| **options-2** | Option sensitivity | cand-2 | eval 1000700-1000749 | 2,400 | 2,400 | identical |
| **adversarial-3** | Adversarial controls | cand-2 | eval 1000750-1000769 | 480 | 480 | identical |
| **confirmation-2** | Confirmation and counters | cand-2 | eval 1000800-1000999 | 1,600 | 1,600 | identical |

Baselines include the first 10 seeds with 3 player seeds each. adversarial-1 was refused by the freeze check before any game, because the Phase 8 counters changed the player fingerprint. adversarial-2 supersedes it, and sixteen baseline-1 games rerun on the later code reproduce their final hashes.

## Frozen roster

State families v1 and PKK families v2 (`ROSTER_VERSION`). v2 differs from v1 only in a capped conversion potential, tried after the pilot showed heavy State passing. Paired on the pilot seeds, v2 State play changed State wins by −3.1 points on average and v2 PKK play by −4.7 points (better for the PKK), with most intervals including zero (`experiments/dev-compare-v2.md`). The State keeps v1, the PKK uses v2. Qualification under `cand-2`: all eight roster players and both counters pass every applicable fixture (`experiments/qualification-cand2.json`); random and legacy baselines fail decisive fixtures.

## Baseline matrix (baseline-2, cand-2)

State win rate, 95% Wilson interval, 220 completed games per cell.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 35.0% [29.0, 41.5] | 28.6% [23.1, 34.9] | 69.5% [63.2, 75.2] | 38.2% [32.0, 44.8] |
| S-MIL | 74.1% [67.9, 79.4] | 60.5% [53.9, 66.7] | 90.5% [85.8, 93.7] | 83.6% [78.2, 87.9] |
| S-CON | 21.8% [16.9, 27.7] | 13.2% [9.3, 18.3] | 40.5% [34.2, 47.1] | 69.1% [62.7, 74.8] |
| S-ADAPT | 61.4% [54.8, 67.6] | 90.0% [85.3, 93.3] | 45.0% [38.6, 51.6] | 38.2% [32.0, 44.8] |

- Equal-weight roster average: State 53.7% [51.4, 55.9] (seed-cluster bootstrap, 2,000 draws). No faction exceeds the 60% roster trigger. (`cand-1`, baseline-1: 48.0% [46.2, 49.7].)
- Cell triggers: S-MIL vs P-SURV 90.5%, S-MIL vs P-ADAPT 83.6%, S-ADAPT vs P-EXP 90.0%, S-CON vs P-EXP 13.2%.
- Player randomness: in 35 of the 160 repeated seed groups (22%), the winner changed with the player seed (`cand-1`: 47, 29%).
- Scoring routes (means over 3,520 games): State Support 23.9 + Legitimacy 10.2; PKK Opposition 12.0 + domestic Bases 1.6. Few games reach a threshold; most are decided on negative final margins.
- Domestic Bases are the strongest observed correlate of the result. PKK win rate by final domestic Bases: 0: 11.0% (1,083 games), 1: 33.2% (770), 2: 62.7% (769), 3: 80.2% (509), 4+: 93.8% (389). Observational, not causal.
- Equal final margins: 92 games (2.6%); the PKK won 79 through the tie order (lower Harm, then PKK).
- Diagnostics: State Pass share 38.4%, PKK 17.4%; mean unused Resources at the end State 4.4, PKK 1.0; no stop-rule flags.

`cand-1` baseline-1 matrix, for comparison: S-POL 26.4/25.0/66.8/34.1, S-MIL 59.1/63.6/82.7/77.3, S-CON 15.5/25.0/39.5/66.4, S-ADAPT 40.9/83.6/25.5/35.9 (% State wins, same column order).

## Option sensitivity (options-2)

50 games per cell per combination, reported separately: State roster average 51.4% [47.8, 55.1] without hot pursuit, 53.3% [49.0, 57.0] with Syria closed at Restricted, 50.6% [46.6, 54.6] with both denied. All overlap the baseline (`cand-1`: 47.4%, 48.4%, 48.8%). This shows insensitivity **for this roster** only: Cross-Border never occurred and Restricted Syria entry was rare, so the options were barely exercised.

## Adversarial controls (adversarial-3)

The six legacy controls lost all 480 games against the qualified opponents (0/240 State controls, 0/240 PKK controls), as in adversarial-2. The research 12 s7 screens found no exploit the qualified players do not already beat. They are weak screens, not evidence of balance.

## Review triggers, counters and confirmation

| Flag | Confirmation-2 (cand-2, 200 fresh seeds) | Confirmation-1 (cand-1) | Attribution | Disposition |
|---|---|---|---|---|
| S-MIL vs P-SURV | 91.0% [86.2, 94.2] | 78.5% [72.3, 83.6] | Planning/evaluation: P-SURV preserves forces while S-MIL removes domestic Bases | Persistent. In-roster counter exists (P-SHIELD) |
| S-ADAPT vs P-EXP | 90.0% [85.1, 93.4] | 86.0% [80.5, 90.1] | Evaluation: P-EXP spreads presence without protecting Bases | Persistent. In-roster counters exist (P-SURV 55% and P-ADAPT 62% PKK wins against S-ADAPT) |
| S-CON vs P-POL | 25.0% [19.5, 31.4] | 19.0% [14.2, 25.0] | Evaluation: S-CON denies but builds little Support | Persistent. In-roster counter exists (S-MIL beats P-POL 74.1%) |
| S-MIL vs P-ADAPT 83.6%, S-CON vs P-EXP 13.2% (baseline-2 only) | not run | not run | Same patterns as the rows above | Exploratory; not confirmed. Covered by the same counters |
| No PKK family above 41% vs S-MIL | — | — | Persistent dominant State pattern | Counter developed: **P-SHIELD@3** |
| P-SHIELD@3 (counter) | S-MIL 5.5% [3.1, 9.6], S-POL 9.0% [5.8, 13.8], S-CON 10.5% [7.0, 15.5], S-ADAPT 8.5% [5.4, 13.2] | 2.5%, 9.5%, 3.0%, 2.5% | See hypothesis below | **Accepted as a documented limitation** of this roster; design review recommended |
| S-SIEGE@3 (State counter to P-SHIELD) | 0.0% [0.0, 1.9] | 0.0% [0.0, 1.9] | Exposing Bases needs a two-card sequence; one-ply search does not plan it | Unsuccessful counter, recorded |

Development evidence (development seeds, `cand-1`, not estimates): P-SHIELD@3 won 158/160 against the State roster where P-POL@2, the family it extends, won 103/160 on the same seeds. S-POL@2, S-MIL@2, S-CON@2 and S-ADAPT@2 won 3/80 against it. The no-hoarding probe S-SPEND@3 cut unused State Resources from 4.3 to 0.8 and doubled State wins against P-POL@2 (21/40 vs 10/40), yet won only 3/40 against P-SHIELD.

**Hypothesis (unconfirmed):** protected Base networks dominate one-ply State play because (a) Assault cannot remove a Base while an Underground Guerrilla shares its space, so the State needs Sweep or Garrison first and Assault on a later card, while Rally flip, ARGK and Reset restore concealment; and (b) PKK conversion is cheaper (Agitation 1 per shift, no Legitimacy cap) than State conversion (2 per shift, Civic Action capped at half Legitimacy). Distinguishing a rules property from a planner limitation needs a State player that plans Sweep-then-Assault sequences (two-ply search over own actions) or human play. No threshold or rule was changed.

### Reviewed games

Fifteen games per baseline were selected reproducibly (five closest, five largest gaps, five seeded-random; no failures). Their full journals are in `experiments/runs/baseline-*/review/`. The baseline-1 review:

- Closest five: all ended on equal final margins; the tie order (lower Harm, then PKK) gave four to the PKK and one to the State. Attribution: rules (tie order) and chance.
- Largest gaps: PKK blowouts ended with 2 to 6 domestic Bases; State blowouts with none. Attribution: planning/evaluation (Base removal or protection).
- Random five: same Base pattern; the State passed 6 to 12 times per game. Attribution: evaluation (State values Resources over modest Operations).

## Coverage

No unresolved ledger entry in any run. Natural exposure covers Operations, Special Activities except Cross-Border, both Event sides, ARGK play, Redeploy, Reset, Civic Action and Agitation spending, Harm, Coercion, Guard upkeep and Guard Abuse, Europe changes and the opening and final victory paths. **Fixture-only (natural-use gaps, baseline-2):** simultaneous qualification, Harm gate at a check, final excess Harm, Syria Restricted/Hostile, KDP and PUK Hostile/Aligned, PUK Host, Cross-Border and hot pursuit, March into a Restricted box, Leadership Abroad, ARGK decline and Emergency Rule moves. Displacement and Syria Aligned are not applicable in Scenario A. The ledger per run is in `analysis-v1/coverage.json`.

## Acceptance gates (19 s11)

| Gate | Status | Evidence |
|---|---|---|
| Reliability | ✅ Pass | 16,000 evaluation games complete; all replay to their recorded final hashes; no failures |
| Competence | ⚠️ Pass with limits | Eight qualified players pass every fixture with no illegal submission or fallback; full decision-family coverage. Limits: one-ply search, heavy State passing, sanctuary actions rarely chosen |
| Coverage | ✅ Pass | Every applicable mechanic covered naturally or by reviewed fixture; gaps listed above |
| Strategic review | ✅ Pass | Every confirmed flag has a diagnosis, a tested or in-roster counter and a disposition; one unsuccessful counter recorded; two baseline-2 flags are exploratory |
| Reproducibility | ✅ Pass | Frozen manifests with fingerprints; archives replay every game; analysis reruns are deterministic |

These gates do not claim balance. The roster average near 50% hides strong matchup effects and a dominant counter-strategy.

## Recommendation and remaining risks

Successful scoring routes measured: **State:** Support through Train + Civic Action plus Base removal (S-MIL). **PKK:** protected domestic Base networks with Agitation (P-SHIELD); Bases plus Opposition (P-POL).

Remaining risks, highest first:

1. **Unconfirmed PKK dominance.** P-SHIELD may reveal a rules imbalance or only one-ply State planning. Next step: add a two-ply State planner (Sweep-then-Assault sequences) and rerun confirmation; in parallel, include a protected-Base line in the designer's IC-3a notes.
2. **State passivity.** The State passes on about 38% of its card choices in every roster. It is partly a player weakness (S-SPEND), so State win rates are likely underestimates.
3. **Sanctuary system unexercised.** Postures beyond Restricted, Cross-Border and hot pursuit never occurred naturally. The option results do not show those options are harmless.
4. **Tie order.** Equal final margins occur in about 2.5% of games and mostly go to the PKK. This is a designed rule, recorded for review.
5. **Roster and generator dependence.** Results apply to these families, budgets and generator; the `cand-1` to `cand-2` change moved the roster average by several points.

Do not change thresholds on this evidence. The designer decides whether a protected-Base network warrants a rule review.

## Human checkpoint

IC-3a remains **open**: no designer playthrough of Scenario A in the UI and no exported notes exist in this work. Automation does not close it, does not amend the research initiative comparison and does not complete later scenario or Phase 4 gates.
