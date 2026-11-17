# 37 Bot retune v4 and the 43/38 test variant

Date: 2026-11-17. Input: the designer's Bot Tuning Desk export (this session) and the answers to four questions. Sources: doc 36, docs 19, 21 and 26, research 09 s2.2 and s8, research 10 s8.

## 1. Bottom line

With the retuned bots (v4) and the test variant (State threshold 43, PKK threshold 38, +1 Police in Siirt and Bitlis), the State wins **63.3% [58.3%, 69.2%]** of bot games. That is inside the 60 to 65% target. Confidence: medium on the direction, low on the size.

| Run | Bots | Rules | State roster average | Early wins (before C3 Propaganda) |
|---|---|---|---|---|
| `dd25-pilot` | v1 State, v2 PKK | DD-25 (49/32) | 28.8% [23.8, 34.2] | 8/240 |
| `dd25-v4` | v4 | DD-25 (49/32) | 43.8% [39.6, 47.5] | 13/240 |
| `dd25-v4-variant-a` | v4 | variant (43/38, +2 Police) | 63.3% [58.3, 69.2] | 0/240 |

Paired changes (by cell and seed, 2,000-draw seed-cluster bootstrap): v4 bots +15.0 pp [+7.9, +22.5]; variant rules on top +19.6 pp [+12.9, +25.4] (verified, `results.json` of each run).

These are bot results on 15 development seeds per cell. They are not balance proof. The variant is a test package, not the game rules: the package, research 09 and the rules text still say 49/32.

## 2. What changed

| Item | Change | Evidence |
|---|---|---|
| Roster v4 | The 8 families with the exported dials: S-POL Legitimacy 0.35; S-CON capped; S-ADAPT own 0.9, opponent 1.15, Bases 3, Guerrillas 1.5, Legitimacy 0.8, capped; P-POL own 1.4, opponent 0.65, Legitimacy 0.3; P-EXP own 0.35; PKK families capped. v1 to v3 stay registered | `sim/src/cli/strategies/scenario-a.ts` (`V4_CHANGES`); test `sim/test/bot-retune-v4.test.ts` |
| 2-move planning | The top 3 plans are played on: the opponent's best reply (neutral weights), then the bot's own best next play. Only checked plans compete | `scenario-a.ts` (`deepLine`, `bestPlay`) |
| Budget | 1,800 steps per decision; 35% for the first pass (630, more than the 450 of v1) | `DEEP_RESERVE` |
| Legitimacy dial | Counts for the bot's own side: a PKK bot values a lower State Legitimacy (designer answer). No earlier PKK bot used it | `sim/src/cli/strategies/evaluation.ts:209` |
| Test package | `sim/experiments/packages/dd25-variant-a`: thresholds 43/38; Siirt and Bitlis 2 Police each; Available Police 2 | `scenarios/full-campaign.yaml` in the copy |

Qualification: 8 of 8 v4 players pass, random baselines fail (`sim/experiments/qualification-v4.json`, suite `9c5bc5ca…`).

"Retune must cover" items: the 18-space map, the Ambush removal, the DD-25 setup, threshold 32, five campaigns and C3 to C5. The engine applies all of them in every simulated line, so 2-move planning sees an Ambush reply or a C3 card through simulation. No dial targets any one of them. The income count for five campaigns was fixed in doc 36. Inferred: no item needs its own dial yet.

## 3. Findings

1. **The rules variant does most of the work for the target.** On paper (doc 36 re-score with the old bots) 43/38 gave 51%. With v4 bots it gave 63.3%. The two changes stack. Verified (runs above).
2. **With 43/38 the PKK almost never reaches its threshold.** Only 6 of 240 games end with the PKK at 38 or more, 11 with the State at 43 or more. Most games go to final scoring, where 43/38 acts as a handicap of 6 + 6 points (verified, `results.json`). The thresholds then decide little at the checks: State check wins rose to 66 of 240, PKK check wins fell to 6.
3. **Early wins are gone in the variant** (0/240). In `dd25-v4` one cell broke the 10 s8 line: S-POL@4 vs P-EXP@4, 11 of 15 PKK wins at the C2 check (verified). P-EXP's own-potential dial fell to 0.35, so it scores now instead of building. Inferred.
4. **P-EXP and P-SURV stay strong.** In the variant the State wins 6.7% to 46.7% against P-EXP and 26.7% to 60% against P-SURV. P-POL loses every game (100% State in all 4 cells). The roster average hides a wide spread: 6 cells at or above 93%, 4 cells at or below 33%.
5. **2-move defect found and fixed.** The first version kept unchecked plans in the choice, so a high one-move score hid the opponent's winning reply. The test position (PKK one Rally Base from 32) failed for all four v4 State bots, then passed after the fix. The v1 bots also pass this position, so it does not prove that 2-move planning plays better. No position that separates them was found.
6. **Cost.** v4 games take a median of 64 s (max 103 s) against 18.8 s for the `dd25-pilot` players. No decision limit was hit. The variant run stopped once at the 2-hour task limit and resumed with `--resume`; all 240 games replay identically.

## 4. Decide (designer)

1. **Adopt 43/38 and +2 Police as rules?** Recommendation: not yet. It reaches the target, but mostly as a final-scoring handicap (finding 2). A lower PKK threshold with a setup change could give the same share with a working PKK check. Test that before a rules change.
2. **Accept the spread of matchups?** P-POL and P-ADAPT lose most games; P-EXP and P-SURV still win most. A human PKK that plays like P-EXP or P-SURV still beats the State.
3. **Confirm on fresh seeds.** 50 seeds per cell (800 games) before any rules change (doc 19 s7).

## 5. Two-pass review

Pass 1, correctness:

| Class | Finding | Outcome |
|---|---|---|
| Fix | Unchecked plans won the choice under 2-move planning | Fixed; test fails without it |
| Fix | Reply sample of 40 missed the winning reply among 135 plays | Replaced by a budget share in family rotation |
| Fix | PKK Legitimacy dial helped the State (designer intent was the opposite) | Side sign; test isolates the dial |
| Fix | Test assertion survived without the sign fix (a lower Legitimacy also lowers the State margin) | Rewritten to isolate the dial |
| Drop | The 2-move reply uses neutral weights, not the opponent's own | Same rule as the existing reply check; the opponent's weights are private |
| Drop | `dd25-v4-variant-a` resumed once | The runner design; replay of all 240 games is identical |

Pass 2, simplicity: one new search helper (`bestPlay`) serves both the reply and the own next play. The old adaptive reply check is kept unchanged for v1 to v3. The test package is a byte copy plus 3 changed lines; git stores the identical map art once.

Validation: `make check` and `make test` pass (110 files, 1,621 tests). Not run: Windows (CI covers it), a separating 2-move fixture (none found).

## 6. Not changed

The game package, research files, rules text and DD records are unchanged. Proposals from doc 36 section 8 stay open.
