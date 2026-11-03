# Scenario A automated playtest report

Date: 2026-11-03. Requirements: [19](19-scenario-a-automated-playtest-spec.md). Plan: [20](20-scenario-a-automated-playtest-build-plan.md). Players: [21](21-scenario-a-strategies.md). Status ledger: [22](22-scenario-a-automated-playtest-status.md).

## Bottom line

1. **Reliability:** 8,000 frozen evaluation games (baseline, options, adversarial, confirmation) completed. All replay hash by hash. No crash, stall, illegal submission, generic fallback or replay mismatch.
2. **Roster result:** with the frozen eight-family roster, the State wins 48.0% [46.2, 49.7] of the equal-weight baseline matrix. This describes this roster only, not a human win probability.
3. **Main strategic finding:** a PKK counter, **P-SHIELD** (domestic Bases kept with an Underground Guerrilla), held every State family to 0.0-9.5% on 200 fresh seeds per cell. No State counter tried (S-SIEGE, four v2 variants, a no-hoarding probe) won more than 3 of 20 development games against it. **Hypothesis, not a measured rules defect:** the Base-protection route is a dominant PKK line in Scenario A against one-ply State planning. It needs a stronger State planner or human play before any rule change.
4. **Human IC-3a stays open.** Automation supplements it and does not close it.

Measured results are labeled with game counts. Statements marked *hypothesis* are not established by these runs.

## Reproduce

All artifacts are in `sim/experiments/`. Each run directory holds the frozen manifest, identity (commit, engine and player fingerprints, lock hash, Node), players, the normalized package, the schedule, results, failures, the compact replay archive `replays.jsonl.gz` (every command and state hash), full journals of the reviewed games in `review/`, and `analysis-v1/` (report, coverage ledger, statistics).

1. `cd sim`
2. `npm run sim -- experiment replay experiments/runs/baseline-1` (checks all 3,520 games hash by hash)
3. `npm run sim -- experiment run experiments/manifests/baseline-1.json --out <new-dir>` regenerates the full journals. It refuses to start if the engine or player code differs from the frozen fingerprints.
4. `npm run sim -- experiment qualify <out.json>` reruns the qualification suite.

| Run | Stage | Seeds | Games | Complete | Replay |
|---|---|---|---|---|---|
| qualification-dev-1 | Qualification (v1) | dev 101-105 | 200 | 200 | identical |
| pilot-1 | Pilot (v1 roster) | dev 1001-1020 | 320 | 320 | identical |
| dev-compare-v2 | Version comparison, includes the pilot of the frozen roster | dev 1001-1020 | 640 | 640 | identical |
| baseline-1 | Frozen baseline | eval 1000000-1000199 (first 10 x 3 player seeds) | 3,520 | 3,520 | identical |
| options-1 | Option sensitivity | eval 1000200-1000249 | 2,400 | 2,400 | identical |
| adversarial-2 | Adversarial controls | eval 1000250-1000269 | 480 | 480 | identical |
| confirmation-1 | Confirmation and counters | eval 1000300-1000499 | 1,600 | 1,600 | identical |
| dev-counter-shield, dev-counter-siege, dev-counter-variants, dev-probe-spend | Counter development | dev 3001-3040, 3101-3120 | 800 | 800 | identical |

adversarial-1 was refused by the freeze check before any game: the Phase 8 counters changed the player fingerprint. adversarial-2 supersedes it. Sixteen baseline games rerun with the later code reproduce their final hashes, so frozen-roster play is unchanged.

## Frozen roster

State families v1 and PKK families v2 (`ROSTER_VERSION`). v2 differs from v1 only in a capped conversion potential, tried after the pilot showed heavy State passing. Paired on the pilot seeds, v2 State play changed State wins by −3.1 points on average and v2 PKK play by −4.7 points (better for the PKK), with most intervals including zero (`experiments/dev-compare-v2.md`). The State keeps v1, the PKK uses v2. Qualification: all eight pass all applicable fixtures (`experiments/qualification-roster.json`); random and legacy baselines fail several.

## Baseline matrix (baseline-1)

State win rate, 95% Wilson interval, 220 completed games per cell (200 seeds plus 20 repeated player seeds).

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 26.4% [21.0, 32.6] | 25.0% [19.7, 31.1] | 66.8% [60.4, 72.7] | 34.1% [28.1, 40.6] |
| S-MIL | 59.1% [52.5, 65.4] | 63.6% [57.1, 69.7] | 82.7% [77.2, 87.1] | 77.3% [71.3, 82.3] |
| S-CON | 15.5% [11.3, 20.8] | 25.0% [19.7, 31.1] | 39.5% [33.3, 46.1] | 66.4% [59.9, 72.3] |
| S-ADAPT | 40.9% [34.6, 47.5] | 83.6% [78.2, 87.9] | 25.5% [20.2, 31.6] | 35.9% [29.9, 42.4] |

- Equal-weight roster average: State 48.0% [46.2, 49.7] (seed-cluster bootstrap, 2,000 draws). No faction exceeds the 60% roster trigger.
- Player randomness: in 47 of the 160 repeated seed groups (29%), the winner changed with the player seed.
- Scoring routes (means over 3,520 games): State Support 22.9 + Legitimacy 10.2; PKK Opposition 12.9 + domestic Bases 1.7. Few games reach a threshold; most are decided on negative final margins.
- Domestic Bases are the strongest observed correlate of the result. PKK win rate by final domestic Bases: 0: 13.9% (998 games), 1: 42.8% (680), 2: 61.1% (854), 3: 84.0% (532), 4+: 95.0% (456). Observational, not causal.
- Equal final margins: 89 games (2.5%); the PKK won 74, by lower Harm in 36 and by the PKK tie rule otherwise. The tie order measurably favors the PKK in close games.
- Diagnostics: State Pass share 38.0%, PKK 17.0%; mean unused Resources at the end State 4.3, PKK 0.9; no stop-rule flags.

## Option sensitivity (options-1)

50 games per cell per combination, reported separately: State roster average 47.4% [43.9, 50.8] without hot pursuit, 48.4% [44.5, 52.5] with Syria closed at Restricted, 48.8% [45.6, 51.9] with both denied. Every cell lies within its interval of the baseline cell. This shows insensitivity **for this roster**: Cross-Border never occurred and Restricted Syria entry was rare, so the options were barely exercised.

## Adversarial controls (adversarial-2)

The six legacy controls lost all 480 games against the qualified opponents (0/240 State controls, 0/240 PKK controls). The research 12 s7 screens found no exploit the qualified players do not already beat. They are weak screens, not evidence of balance.

## Review triggers, counters and confirmation

| Flag (baseline) | Confirmation-1 (200 fresh seeds) | Attribution | Disposition |
|---|---|---|---|
| S-MIL vs P-SURV 82.7% | 78.5% [72.3, 83.6] | Planning/evaluation: P-SURV preserves forces while S-MIL removes domestic Bases | Persistent. In-roster counter exists (P-SHIELD, below) |
| S-ADAPT vs P-EXP 83.6% | 86.0% [80.5, 90.1] | Evaluation: P-EXP spreads presence without protecting Bases | Persistent. In-roster counters exist (P-POL, P-SURV, P-ADAPT each beat S-ADAPT) |
| S-CON vs P-POL 15.5% | 19.0% [14.2, 25.0] | Evaluation: S-CON denies but builds little Support | Persistent. In-roster counter exists (S-MIL beats P-POL 59.1%) |
| No PKK family above 41% vs S-MIL | — | Persistent dominant State pattern | Counter developed: **P-SHIELD@3** |
| P-SHIELD@3 (counter) | S-MIL 2.5% [1.1, 5.7], S-POL 9.5% [6.2, 14.4], S-CON 3.0% [1.4, 6.4], S-ADAPT 2.5% [1.1, 5.7] | See hypothesis below | **Accepted as a documented limitation** of this roster; design review recommended |
| S-SIEGE@3 (State counter to P-SHIELD) | 0.0% [0.0, 1.9] | Exposing Bases needs a two-card sequence; one-ply search does not plan it | Unsuccessful counter, recorded |

Development evidence (development seeds, not estimates): P-SHIELD@3 won 158/160 against the State roster where P-POL@2, the family it extends, won 103/160 on the same seeds. S-POL@2, S-MIL@2, S-CON@2 and S-ADAPT@2 won 3/80 against it. The no-hoarding probe S-SPEND@3 cut unused State Resources from 4.3 to 0.8 and doubled State wins against P-POL@2 (21/40 vs 10/40), yet won only 3/40 against P-SHIELD.

**Hypothesis (unconfirmed):** protected Base networks dominate one-ply State play because (a) Assault cannot remove a Base while an Underground Guerrilla shares its space, so the State needs Sweep or Garrison first and Assault on a later card, while Rally flip, ARGK and Reset restore concealment; and (b) PKK conversion is cheaper (Agitation 1 per shift, no Legitimacy cap) than State conversion (2 per shift, Civic Action capped at half Legitimacy). Distinguishing a rules property from a planner limitation needs a State player that plans Sweep-then-Assault sequences (two-ply search over own actions) or human play. No threshold or rule was changed.

### Reviewed games

Fifteen baseline games were selected reproducibly (five closest, five largest gaps, five seeded-random; no failures). Their full journals are in `experiments/runs/baseline-1/review/`.

- Closest five: all ended on equal final margins; the tie order (lower Harm, then PKK) gave four to the PKK and one to the State. Attribution: rules (tie order) and chance.
- Largest gaps: PKK blowouts ended with 2 to 6 domestic Bases; State blowouts with none. Attribution: planning/evaluation (Base removal or protection).
- Random five: same Base pattern; the State passed 6 to 12 times per game. Attribution: evaluation (State values Resources over modest Operations).

## Coverage

No unresolved ledger entry in any run. Natural exposure covers Operations, Special Activities except Cross-Border, both Event sides, ARGK play, Redeploy, Reset, Civic Action and Agitation spending, Harm, Coercion, Guard upkeep and Guard Abuse, Europe changes and the opening and final victory paths. **Fixture-only (natural-use gaps):** simultaneous qualification, Harm gate at a check, final excess Harm, Syria Restricted/Hostile, KDP and PUK Hostile/Aligned, PUK Host, Cross-Border and hot pursuit, March into a Restricted box, Leadership Abroad, ARGK decline in some runs, and Emergency Rule moves. Displacement and Syria Aligned are not applicable in Scenario A. The ledger per run is in `analysis-v1/coverage.json`.

## Acceptance gates (19 s11)

| Gate | Status | Evidence |
|---|---|---|
| Reliability | ✅ Pass | 8,000 evaluation games complete; all replay identical; no failures |
| Competence | ⚠️ Pass with limits | Eight qualified players pass every fixture with no illegal submission or fallback; full decision-family coverage. Limits: one-ply search, heavy State passing, sanctuary actions rarely chosen |
| Coverage | ✅ Pass | Every applicable mechanic covered naturally or by reviewed fixture; gaps listed above |
| Strategic review | ✅ Pass | Every persistent flag has a diagnosis, a tested counter or in-roster counter, and a disposition; one unsuccessful counter recorded |
| Reproducibility | ✅ Pass | Frozen manifests with fingerprints; archives replay every game; analysis reruns are deterministic |

These gates do not claim balance. The roster average near 50% hides strong matchup effects and a dominant counter-strategy.

## Recommendation and remaining risks

Successful scoring routes measured: **State:** Support through Train + Civic Action plus Base removal (S-MIL). **PKK:** protected domestic Base networks with Agitation (P-SHIELD); Bases plus Opposition (P-POL).

Remaining risks, highest first:

1. **Unconfirmed PKK dominance.** P-SHIELD may reveal a rules imbalance or only one-ply State planning. Next step: add a two-ply State planner (Sweep-then-Assault sequences) and rerun confirmation; in parallel, include a protected-Base line in the designer's IC-3a notes.
2. **State passivity.** The State passes on about 38% of its card choices in every roster. It is partly a player weakness (S-SPEND), so State win rates are likely underestimates.
3. **Sanctuary system unexercised.** Postures beyond Restricted, Cross-Border and hot pursuit never occurred naturally. The option results do not show those options are harmless.
4. **Tie order.** Equal final margins occur in about 2.5% of games and mostly go to the PKK. This is a designed rule, recorded for review.
5. **Roster dependence.** Results apply to these families and budgets only.

Do not change thresholds on this evidence. The designer decides whether a protected-Base network warrants a rule review.

## Human checkpoint

IC-3a remains **open**: no designer playthrough of Scenario A in the UI and no exported notes exist in this work. Automation does not close it, does not amend the research initiative comparison and does not complete later scenario or Phase 4 gates.
