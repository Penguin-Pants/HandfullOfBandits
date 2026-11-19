# 40 Thresholds 46/35 alone

Date: 2026-11-18. Follows [39](39-setup-lever-police.md) section 4, item 2. Same bots (roster v4), same 16 pairings and the same 15 development seeds as docs 37 to 39.

## 1. Bottom line

With State threshold 46, PKK threshold 35 and the setup unchanged, the State wins **54.2% [48.8%, 60.0%]** of bot games. The current rules (49/32) give 48.3%. The paired change is **+5.8 pp [-0.4, +12.5]** (verified, `results.json` of both runs). The 60 to 65% target is not reached. The prediction in doc 39 (about 61%) was too high. Confidence: medium on the direction, low on the size.

| Run | Rules | State wins | Change over `dd25-v4b` |
|---|---|---|---|
| `dd25-v4b` | 49/32 (game rules) | 48.3% [43.8, 52.9] | none |
| `dd25-v4b-setup-police` | 49/32, +1 Police | 35.8% [30.8, 40.4] | -12.5 pp |
| `dd25-v4b-thresholds-46-35` | 46/35, setup unchanged | 54.2% [48.8, 60.0] | +5.8 pp |
| `dd25-v4b-variant-b` | 46/35, +1 Police | 49.2% [44.2, 54.6] | +0.8 pp |
| `dd25-v4b-variant-a` | 43/38, +1 Police | 58.7% [54.6, 62.9] | +10.4 pp |

These are bot results on 15 seeds per pairing, not balance proof. The 46/35 package is a test package. The game package still says 49/32.

## 2. What was tested

| Item | Value |
|---|---|
| Package | `sim/experiments/packages/dd25-thresholds-46-35`, hash `7d1f4ab8…`. Copy removed 2026-11-19 (audit Plan 4 V3): now variant `game-packages/kurdish-coin/0.1.0/variants/dd25-thresholds-46-35.yaml`; the run keeps the copy's content in `package-content.json`. |
| Change | State threshold 46 (was 49), PKK threshold 35 (was 32). The start pieces were compared with the game package and are identical |
| Manifest | `sim/experiments/manifests/dd25-v4b-thresholds-46-35.json`; fingerprints as `dd25-v4b` |
| Run | `sim/experiments/runs/dd25-v4b-thresholds-46-35`: 240 of 240 complete, 240/240 replay identically |

## 3. Findings

1. **The prediction missed.** Doc 39 assumed the Police and threshold effects add up and predicted about 61%. The run gave 54.2%. The top of its range reaches 60.0%, the bottom is 48.8%. Verified.
2. **The effects do not add up.** Thresholds alone gave +5.8 pp, not the +13 inferred in doc 39 (49.2 minus 35.8). With the Police change, 46/35 added +13.4 over the Police-only run; without it, only +5.8 over the current rules. Inferred: the Police change costs the State about 12 points at 49/32 and about 5 points at 46/35. With 15 seeds per pairing, a difference of 5 points is within the noise. Doc 39 section 1 ("the thresholds alone give about +13 and +23") is withdrawn.
3. **The doc 36 paper re-score still overstates the gain.** It predicted +13.3 for 46/35; the measured gain is +5.8 [-0.4, +12.5]. Verified (doc 36 grid against this run). Doc 38 finding 2 was partly right for this reason.
4. **The PKK can win at a check.** The PKK wins 22 games at a check, the State 45. The State reaches 46 in 47 games, the PKK reaches 35 in 23. 2 of 240 games end before the C3 Propaganda round (the 10 s8 line is 1 in 5).
5. **Which State bots win.** S-ADAPT wins 39 of 60 games, S-CON 35, S-MIL 34, S-POL 22. P-POL loses every game against all four State bots (100% in those cells).
6. **Run time.** The median game takes 53.9 s.

## 4. Decide (designer)

1. **Is 54% enough, or test a bigger shift?** 46/35 keeps real PKK check wins (22) but stays under the target. 43/38 with the setup unchanged is the nearest untested step. Earlier, 43/38 with the Police change gave 58.7% but the PKK won only 8 games at a check. Without the Police change the State share is probably higher (unverified; the run is not done). Recommendation: run 43/38 alone next.
2. **Accept a lower share than 60 to 65%?** 54% with a working PKK check is a different trade-off from 59% with a barely working one.
3. **Confirm on fresh seeds before any rules change.** 50 seeds per pairing (800 games), as in docs 37 to 39. A single 15-seed run cannot separate 54% from 60%.

## 5. Two-pass review

No bot or rules code changed. The diff holds one test package (a copy of the game package with 1 changed line), one manifest, one run and this report.

| Class | Finding | Outcome |
|---|---|---|
| Fix | Doc 39 section 1 claimed thresholds-only effects of +13 and +23 and a 61% prediction | Withdrawn in finding 2; the run did not support it |
| Fix | The analysis script counted the State "reached" games at 49 instead of 46 | Recounted at 46 (47 games) |
| Drop | Cell-level swings (for example S-ADAPT vs P-EXP +33.3 pp) | Not used for conclusions; roster average only |

Validation: `make check` and `make test` pass. Windows: CI.

## 6. Not changed

The game package, research files, rules text, DD records and bot code are unchanged.
