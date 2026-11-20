# 37 Bot retune v4 and the 43/38 test variant

Date: 2026-11-17. Input: the designer's Bot Tuning Desk export (this session) and the answers to four questions. Sources: doc 36, docs 19, 21 and 26, research 09 s2.2 and s8, research 10 s8.

## 1. Bottom line

With the retuned bots (v4) and the test variant (State threshold 43, PKK threshold 38, +1 Police in Siirt and Bitlis), the State wins **58.7% [54.6%, 62.9%]** of bot games. That is just under the 60 to 65% target; the interval reaches into it. Confidence: medium on the direction, low on the size.

| Run | Bots | Rules | State roster average | Early wins (before C3 Propaganda) |
|---|---|---|---|---|
| `dd25-pilot` | v1 State, v2 PKK | DD-25 (49/32) | 28.8% [23.8, 34.2] | 8/240 |
| `dd25-v4b` | v4 | DD-25 (49/32) | 48.3% [43.8, 52.9] | 2/240 |
| `dd25-v4b-variant-a` | v4 | variant (43/38, +2 Police) | 58.7% [54.6, 62.9] | 0/240 |

Paired changes (by cell and seed, 2,000-draw seed-cluster bootstrap): v4 bots +19.6 pp [+12.9, +26.2]; variant rules on top +10.4 pp [+4.6, +16.2] (verified, `results.json` of each run).

`dd25-v4` (43.8%) and `dd25-v4-variant-a` (63.3%) ran with a defective 2-move line (section 3, finding 5). They stay as records, superseded by the `v4b` runs.

These are bot results on 15 development seeds per cell. They are not balance proof. The variant is a test package, not the game rules: the package, research 09 and the rules text still say 49/32.

## 2. What changed

| Item | Change | Evidence |
|---|---|---|
| Roster v4 | The 8 families with the exported dials: S-POL Legitimacy 0.35; S-CON capped; S-ADAPT own 0.9, opponent 1.15, Bases 3, Guerrillas 1.5, Legitimacy 0.8, capped; P-POL own 1.4, opponent 0.65, Legitimacy 0.3; P-EXP own 0.35; PKK families capped. v1 to v3 stay registered | `sim/src/cli/strategies/scenario-a.ts` (`V4_CHANGES`); test `sim/test/bot-retune-v4.test.ts` |
| 2-move planning | The top 3 plans are played on: the opponent's best reply (neutral weights), then the bot's own best next play. Only checked plans compete | `scenario-a.ts` (`deepLine`, `bestPlay`) |
| Budget | 1,800 steps per decision; 35% for the first pass (630, more than the 450 of v1) | `DEEP_RESERVE` |
| Legitimacy dial | Counts for the bot's own side: a PKK bot values a lower State Legitimacy (designer answer). No earlier PKK bot used it | `sim/src/cli/strategies/evaluation.ts:209` |
| Test package | `sim/experiments/packages/dd25-variant-a`: thresholds 43/38; Siirt and Bitlis 2 Police each; Available Police 2. Copy removed 2026-11-19 (audit Plan 4 V3): now variant `game-packages/kurdish-coin/0.1.0/variants/dd25-variant-a.yaml`; the run keeps the copy's content in `package-content.json`. | `scenarios/full-campaign.yaml` in the copy |

Qualification: 8 of 8 v4 players pass, random baselines fail (`sim/experiments/qualification-v4.json`, suite `9c5bc5ca…`).

"Retune must cover" items: the 18-space map, the Ambush removal, the DD-25 setup, threshold 32, five campaigns and C3 to C5. The engine applies all of them in every simulated line, so 2-move planning sees an Ambush reply or a C3 card through simulation. No dial targets any one of them. The income count for five campaigns was fixed in doc 36. Inferred: no item needs its own dial yet.

## 3. Findings

1. **Better bots help the State most.** v4 moves the State from 28.8% to 48.3% on the current rules. The variant rules add 10.4 points. Verified (runs above).
2. **With 43/38 the thresholds decide little at the checks.** The PKK reaches 38 in 9 of 240 games, the State 43 in 5 (at game end). 178 games go to final scoring, where 43/38 acts as a handicap of 6 + 6 points. State check wins: 54; PKK check wins: 8 (verified, `results.json`).
3. **No early sudden victory.** 0/240 in the variant, 2/240 on the current rules; the 10 s8 line is 1 in 5.
4. **Wide spread of matchups.** In the variant, 5 cells are at or above 93% State and 5 at or below 27%. P-POL loses every game. P-SURV still beats 3 of 4 State bots. The roster average hides this.
5. **Two 2-move defects found and fixed.** (a) Unchecked plans won the choice and hid the opponent's winning reply (own two-pass review; regression test). (b) PR 115 review: the deep value overwrote the sampled mean with one sample, and the line stopped after one opponent play although the opponent acts twice after Op Only or Op + SA (05 s2.4). Each fix has a test that fails without it. The first runs, `dd25-v4` and `dd25-v4-variant-a`, used the defective line; the defect also made S-POL lose 11 of 15 games to P-EXP at the C2 check, which is gone in `dd25-v4b`.
6. **No position found where 2-move planning beats 1-move play.** The Rally Base test position is passed by v1 too. The gain of planning is not proven.
7. **Cost.** v4 games take a median of 72 to 76 s against 18.8 s for the `dd25-pilot` players. No decision limit was hit.

## 4. Decide (designer)

1. **Adopt 43/38 and +2 Police as rules?** Recommendation: not yet. It gives 58.7%, just under the target, and works mostly as a final-scoring handicap (finding 2). Test a setup change that keeps a working PKK check, with a smaller threshold change.
2. **Accept the spread of matchups?** A human PKK that plays like P-SURV still beats most State styles.
3. **Confirm on fresh seeds.** 50 seeds per cell (800 games) before any rules change (doc 19 s7).

## 5. Two-pass review

Pass 1, correctness:

| Class | Finding | Outcome |
|---|---|---|
| Fix | Unchecked plans won the choice under 2-move planning | Fixed; test fails without it |
| Fix | Reply sample of 40 missed the winning reply among 135 plays | Replaced by a budget share in family rotation |
| Fix | PKK Legitimacy dial helped the State (designer intent was the opposite) | Side sign; test isolates the dial |
| Fix | Test assertion survived without the sign fix (a lower Legitimacy also lowers the State margin) | Rewritten to isolate the dial |
| Fix | PR 115 review: deep value overwrote the sampled mean | `combineDeep`; test fails without it; runs redone as `v4b` |
| Fix | PR 115 review: line stopped after one of two consecutive opponent plays | `deepLine` follows up to 2; test fails without it |
| Fix | PR 115 CI: `metrics-review` full-campaign API test over 5 s on Windows | Explicit 60 s timeout, as for the real-worker tests (doc 22) |
| Drop | The 2-move reply uses neutral weights, not the opponent's own | Same rule as the existing reply check; the opponent's weights are private |
| Drop | `dd25-v4-variant-a` resumed once | The runner design; replay of all 240 games is identical. Superseded by `dd25-v4b-variant-a` |

Pass 2, simplicity: one new search helper (`bestPlay`) serves both the reply and the own next play. The old adaptive reply check is kept unchanged for v1 to v3. The test package is a byte copy plus 3 changed lines; git stores the identical map art once.

Validation: `make check` and `make test` pass (110 files, 1,623 tests). Requalification after the review fixes: 8 of 8 pass. Windows: CI passes. Not run: a separating 2-move fixture (none found).

## 6. Not changed

The game package, research files, rules text and DD records are unchanged. Proposals from doc 36 section 8 stay open.
