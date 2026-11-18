# 39 Setup lever test: +1 Police alone

Date: 2026-11-18. Follows [38](38-variant-b-test.md) section 4, item 1. Same bots (roster v4), same 16 pairings and the same 15 development seeds as docs 37 and 38.

## 1. Bottom line

**Update (doc 40, 2026-11-18):** the additive prediction below (about 61% for 46/35 alone) was tested and missed: the run gave 54.2%. The sign of the Police effect holds; the threshold-only figures of +13 and +23 are withdrawn.

The +1 Police in Siirt and Bitlis **lowers** the State. With only that change and the thresholds left at 49/32, the State wins **35.8% [30.8%, 40.4%]** of bot games. The current rules give 48.3%. The paired change is **-12.5 pp [-18.3, -6.2]** (verified, `results.json` of both runs). Confidence: medium on the sign, low on the size.

This corrects doc 38. The variants A (43/38) and B (46/35) both contained the Police change, so it hid part of the threshold effect. Separated, the threshold effect matches the paper re-score of doc 36:

| Run | Rules | State wins | Change over `dd25-v4b` |
|---|---|---|---|
| `dd25-v4b` | 49/32, no Police change (game rules) | 48.3% [43.8, 52.9] | none |
| `dd25-v4b-setup-police` | 49/32, +1 Police | 35.8% [30.8, 40.4] | -12.5 pp |
| `dd25-v4b-variant-b` | 46/35, +1 Police | 49.2% [44.2, 54.6] | +0.8 pp |
| `dd25-v4b-variant-a` | 43/38, +1 Police | 58.7% [54.6, 62.9] | +10.4 pp |

Inferred (the effects are assumed to add): the thresholds alone give about +13 pp at 46/35 (49.2 minus 35.8) and about +23 pp at 43/38 (58.7 minus 35.8). The doc 36 paper re-score predicted +13.3 and +22.4. The prediction for 46/35 with the setup unchanged is about 61%, inside the 60 to 65% target. This is untested.

These are bot results on 15 seeds per pairing, not balance proof. The Police change was a test package only. The game package and DD-25 are unchanged.

## 2. What was tested

| Item | Value |
|---|---|
| Package | `sim/experiments/packages/dd25-setup-police`, hash `49dd2e97…` |
| Change | Siirt and Bitlis 2 Police each (was 1); Available Police 2 (was 4). Thresholds stay 49/32 |
| Manifest | `sim/experiments/manifests/dd25-v4b-setup-police.json`; engine and player fingerprints as `dd25-v4b` |
| Run | `sim/experiments/runs/dd25-v4b-setup-police`: 240 of 240 complete, 240/240 replay identically |

## 3. Findings

1. **The Police change hurts the State.** The range of the paired change is below 0. Verified.
2. **Why is unknown.** Candidate causes, none verified: (a) Available Police falls from 4 to 2, so the State has fewer Police to place with Train; (b) State Control in Siirt and Bitlis changes what the PKK does there. Check for (a): a test package with +1 Police in both spaces and the Available count kept at 4 (needs one more Police piece in `pieces.yaml` of the test copy).
3. **Doc 38 finding 2 is withdrawn.** It said the paper re-score overstates the gain. The Police change, not the re-score, caused the gap. Verified by the table in section 1.
4. **Cell results swing widely.** For example S-MIL vs P-EXP rises 46.7 pp while S-ADAPT vs P-ADAPT falls 73.3 pp. With 15 seeds per cell, only the roster average (240 games) is a reliable number.
5. **The PKK gains at the checks.** The PKK wins 28 games at a check (19 at C3), the State 18. No game ends before the C3 Propaganda round (0/240).
6. **Run time.** The median game takes 52.7 s.

## 4. Decide (designer)

1. **Keep the Police change out of any rules decision.** It lowers the State by about 12 points in this pilot, and DD-25 never contained it. Recommendation: drop it. The Available-Police check (finding 2) is optional.
2. **Test 46/35 with the setup unchanged.** Prediction: about 61% State wins, with the PKK still reaching 35 at the checks. Recommendation: run it next, on the same 15 seeds, as a test package.
3. **Confirm on fresh seeds before any rules change.** 50 seeds per pairing (800 games), as in docs 37 and 38.

## 5. Two-pass review

No bot or rules code changed. The diff holds one test package (a copy of the game package with 3 changed values), one manifest, one run, doc 39, a correction to doc 38 and the docs index.

| Class | Finding | Outcome |
|---|---|---|
| Fix | Doc 38 attributed the lack of gain to the threshold shift (findings 1, 2, 4) | Marked replaced or withdrawn, with a pointer to this doc |
| Drop | Large cell swings | Not used for conclusions; roster average only (finding 4) |
| Drop | Additive assumption in section 1 | Stated as inferred; the 46/35 run in Decide 2 tests it |

Validation: `make check` and `make test` pass. Windows: CI.

## 6. Not changed

The game package, research files, rules text, DD records and bot code are unchanged.
