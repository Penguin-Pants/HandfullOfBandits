# 41 Thresholds 43/38 alone

Date: 2026-11-18. Follows [40](40-thresholds-46-35-alone.md) section 4, item 1. Same bots (roster v4), same 16 pairings and the same 15 development seeds as docs 37 to 40.

## 1. Bottom line

With State threshold 43, PKK threshold 38 and the setup unchanged, the State wins **65.0% [60.8%, 69.2%]** of bot games. This is inside the 60 to 65% target (top edge). The current rules (49/32) give 48.3%. The paired change is **+16.7 pp [+10.4, +22.9]** (verified, `results.json` of both runs). Confidence: medium on the direction, low on the size.

| Run | Rules | State wins | Change over `dd25-v4b` |
|---|---|---|---|
| `dd25-v4b` | 49/32 (game rules) | 48.3% [43.8, 52.9] | none |
| `dd25-v4b-thresholds-46-35` | 46/35, setup unchanged | 54.2% [48.8, 60.0] | +5.8 pp |
| `dd25-v4b-thresholds-43-38` | 43/38, setup unchanged | 65.0% [60.8, 69.2] | +16.7 pp |
| `dd25-v4b-variant-a` | 43/38, +1 Police | 58.7% [54.6, 62.9] | +10.4 pp |

Paired, 43/38 alone against 46/35 alone: **+10.8 pp [+5.0, +17.1]**. Against 43/38 with +1 Police: **+6.2 pp [+0.8, +11.7]**.

These are bot results on 15 seeds per pairing, not balance proof. The 43/38 package is a test package. The game package still says 49/32.

## 2. What was tested

| Item | Value |
|---|---|
| Package | `sim/experiments/packages/dd25-thresholds-43-38`, hash `5f2bfccd…` |
| Change | State threshold 43 (was 49), PKK threshold 38 (was 32). Setup unchanged |
| Manifest | `sim/experiments/manifests/dd25-v4b-thresholds-43-38.json`; fingerprints as `dd25-v4b` |
| Run | `sim/experiments/runs/dd25-v4b-thresholds-43-38`: 240 of 240 complete, 240/240 replay identically |

## 3. Findings

1. **The target is reached with thresholds alone.** 65.0%, interval 60.8 to 69.2. The +1 Police change lowered the State again: removing it adds 6.2 pp to 43/38. Verified.
2. **The PKK check is weaker than at 46/35.** Check wins: State 65, PKK 13 (46/35: 45 and 22; current rules: 22 and 30). The PKK reaches 38 in 14 games at game end and the State reaches 43 in 67. 162 games go to final scoring. Verified (`results.json`).
3. **The PKK can still win at a check.** 8 wins at C3, 1 at C4, 4 at C5. This is more than variant A (8 in total) and about half of 46/35.
4. **No early sudden victory.** 0 of 240 games end before the C3 Propaganda round.
5. **Which bots win.** S-CON 47 of 60, S-ADAPT 45, S-MIL 37, S-POL 27. PKK side: P-EXP 38 of 60, P-SURV 31, P-ADAPT 15, P-POL 0. P-POL loses every game.
6. **Spread of matchups stays wide.** 5 cells are at 100% State, S-POL vs P-EXP is at 13%. The roster average hides this (doc 37 finding 4).

## 4. Decide (designer)

1. **Adopt 43/38 as the rules?** It reaches the target, and the PKK still wins about 1 check in 6 (13 of 78 check games). Recommendation: confirm on fresh seeds first, then decide. No rules change was made.
2. **Is a check where the PKK wins 13 of 78 enough?** At 46/35 it was 22 of 67. The trade is 11 points of State share for 9 more PKK check wins.
3. **Confirm on fresh seeds.** 50 seeds per pairing (800 games), as in docs 37 to 40. A 15-seed run cannot separate 61% from 69%.
4. **Keep the +1 Police change out.** Doc 39 and this run both show it lowers the State.

## 5. Two-pass review

No bot or rules code changed. The diff holds one test package (a copy of the game package with thresholds changed), one manifest, one run and this report.

| Class | Finding | Outcome |
|---|---|---|
| Fix | The analysis script counted "reached" at the wrong threshold in earlier runs | Recounted at 43 and 38 here |
| Drop | Cell swings (for example S-MIL vs P-EXP -53 pp against variant A) | Not used for conclusions; roster average only |
| Drop | Median game time | Not recorded in `results.json`; not reported |

Validation: `make check` and `make test` pass (110 files, 1,623 tests). Windows: CI.

## 6. Not changed

The game package, research files, rules text, DD records and bot code are unchanged.
