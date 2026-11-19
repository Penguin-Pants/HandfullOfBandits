# 42 Confirmation of 43/38 on fresh seeds

Date: 2026-11-19. Follows [41](41-thresholds-43-38-alone.md) section 4, item 3. Same bots (roster v4), same 16 pairings, same test package. New seeds: 50 evaluation seeds per pairing (1002500 to 1002549), 800 games. No earlier run used these seeds.

## 1. Bottom line

On fresh seeds, 43/38 with the setup unchanged gives the State **68.9% [66.4%, 71.4%]** (551 of 800 games). The development-seed pilot gave 65.0% [60.8%, 69.2%]. The two results agree: the new value lies inside the pilot interval. The target of 60 to 65% is **missed on the high side**: the whole new interval is above 65%. Confidence: medium on 43/38 being State-favored by 4 to 9 points above the target, low on the exact size.

| Run | Seeds | State wins |
|---|---|---|
| `dd25-v4b-thresholds-43-38` | 15 development | 65.0% [60.8, 69.2] |
| `dd25-v4b-confirm-43-38` | 50 evaluation | 68.9% [66.4, 71.4] |

These are bot results, not balance proof. The package is a test package. The game package still says 49/32. No rules change was made.

## 2. What was tested

| Item | Value |
|---|---|
| Package | `sim/experiments/packages/dd25-thresholds-43-38`, hash `5f2bfccd…` (State 43, PKK 38, setup unchanged) |
| Manifest | `sim/experiments/manifests/dd25-v4b-confirm-43-38.json`, stage `confirmation`, fingerprints as `dd25-v4b` |
| Run | `sim/experiments/runs/dd25-v4b-confirm-43-38`: 800 of 800 complete, 800/800 replay identically. Stopped once at the 2-hour limit (428 games) and resumed with `--resume` |

## 3. Findings

1. **The pilot held on fresh seeds.** 65.0% against 68.9%. The difference is 3.9 points, inside the pilot interval. Verified (`results.json`, `analysis-v2/report.md`).
2. **The State is above the target.** The lower end of the interval (66.4%) is above 65%. Verified.
3. **The PKK bot P-POL inflates the average.** P-POL loses all 200 of its games (100% State in 4 cells). The other 12 cells give the State 351 of 600 games, **58.5%**. P-POL was already at 0 of 60 in the pilot (doc 41 finding 5). Whether to count P-POL is a designer decision (section 4, item 2).
4. **The PKK check still works.** The State wins 240 games at a check, the PKK 41 (C3 18, C4 6, C5 17). 519 games go to final scoring. 0 of 800 games end before the C3 Propaganda round. The PKK check share is 41 of 281 check games (14.6%); the pilot had 13 of 78 (16.7%).
5. **Which bots win.** State side: S-ADAPT 162 of 200, S-CON 159, S-MIL 134, S-POL 96. PKK side: P-EXP 110 of 200, P-SURV 97, P-ADAPT 42, P-POL 0.
6. **The matchup spread is wide.** 6 cells are at 90% or more State (4 at 100%), 1 cell is at 8% (S-POL vs P-EXP). The roster average hides this.
7. **The State reaches 43 in 256 games; the PKK reaches 38 in 44** (at game end, from final standings).

## 4. Decide (designer)

1. **Is 68.9% too high?** Options: keep 43/38; test a smaller shift such as 44/37 or 45/36, between the pilot's 46/35 (54.2%) and 43/38 (65.0% pilot, 68.9% confirmed); or accept the number. Recommendation: test 45/36 next, on development seeds first. Estimated State share 58 to 62% (unverified, interpolation).
2. **Does P-POL count?** Without it the average is 58.5%, just under the target. A human PKK that plays like P-POL would lose every game. Recommendation: keep it in the report, but judge the target on both numbers.
3. **Keep the +1 Police change out.** Docs 39 and 41 show it lowers the State.
4. **Confirm any other candidate the same way.** 50 fresh seeds per pairing. Use a new block (1002550 and up).

## 5. Two-pass review

No bot, rules or package code changed. The diff holds one manifest, one run and this report.

| Class | Finding | Outcome |
|---|---|---|
| Fix | First probe launch started a real run in `/tmp` by mistake | Stopped at once, folder deleted, the committed run is the clean start in the run folder |
| Fix | Background limit stopped the run at 428 games | Resumed with `--resume`; all 800 replay identically |
| Drop | Cell swings against the pilot (n=15 each) | Not used; roster average and bot totals only |
| Drop | State "reached" counts at game end differ from check wins | Both reported, labeled |

Validation: `make check` and `make test` pass (110 files, 1,623 tests). Windows: CI.

## 6. Not changed

The game package, research files, rules text, DD records and bot code are unchanged.
