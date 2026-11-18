# 38 Test variant B: thresholds 46/35 and +1 Police

Date: 2026-11-17. Follows [37](37-bot-retune-v4.md) section 4, item 1. Same bots (roster v4), same 16 pairings and the same 15 development seeds as the runs in doc 37.

## 1. Bottom line

The smaller threshold change does not move the result. With State 46, PKK 35 and +1 Police in Siirt and Bitlis, the State wins **49.2% [44.2%, 54.6%]** of bot games. The current rules (49/32) give 48.3%. The 43/38 variant gives 58.7%. Confidence: medium. It is a pilot sample, so one run can be off by about 5 points either way.

| Run | Rules | State roster average | Early wins (before C3) | Check wins State / PKK |
|---|---|---|---|---|
| `dd25-v4b` | 49/32 (game rules) | 48.3% [43.8, 52.9] | 2/240 | 22 / 30 |
| `dd25-v4b-variant-b` | 46/35, +1 Police in Siirt and Bitlis | 49.2% [44.2, 54.6] | 2/240 | 32 / 19 |
| `dd25-v4b-variant-a` | 43/38, +1 Police in Siirt and Bitlis | 58.7% [54.6, 62.9] | 0/240 | 54 / 8 |

Paired changes (by cell and seed, 2,000-draw seed-cluster bootstrap, verified from each run's `results.json`):

- Variant B against the current rules: **+0.8 pp [-5.4, +7.1]**.
- Variant B against variant A: **-9.6 pp [-16.2, -2.9]**.

The 60 to 65% target is not reached. These are bot results, not balance proof. Variant B is a test package. The game package still says 49/32.

## 2. What was tested

| Item | Value | Where |
|---|---|---|
| Package | `sim/experiments/packages/dd25-variant-b`, hash `79a01c86…` | `scenarios/full-campaign.yaml` in the copy |
| Thresholds | State 46 (was 49), PKK 35 (was 32) | same file |
| Setup | Siirt and Bitlis 2 Police each; Available Police 2 | same file |
| Manifest | `sim/experiments/manifests/dd25-v4b-variant-b.json` | engine and player fingerprints as `dd25-v4b` |
| Run | `sim/experiments/runs/dd25-v4b-variant-b`: 240 of 240 complete, 240/240 replay identically | run folder |

## 3. Findings

1. **A 6-point shift does nothing; a 12-point shift gives about +10 points.** Variant B favors the State by 3 points on each threshold (6 in total) and moves the average by +0.8 pp. Variant A favors it by 12 in total and adds 10.4 pp over the current rules. Inferred: the effect needs a larger shift, and the pilot sample cannot tell a small effect from none.
2. **The paper re-score overstates the gain.** Doc 36 re-scored the old-bot games and predicted 42% for 46/35 (a gain of 13 points). The real run gave 49.2% (a gain of 0.8 over the same bots' current-rules run). Games change when a check can end them, so a re-count of finished games is not a reliable guide in this range. Verified (grid in doc 36 against this run).
3. **The PKK check works again.** The PKK wins 19 games at a check, against 8 in variant A, and 26 games end with the PKK at 35 or more (variant A: 9 at 38). The State reaches 46 in 33 games. The thresholds now decide some games at the checks.
4. **The +1 Police is not isolated.** Both variants change the Police and the thresholds together. This run does not show what the Police change does alone. Not tested.
5. **No early sudden victory.** 2 of 240 games end before the C3 Propaganda round (the 10 s8 line is 1 in 5).
6. **Run time.** The median game takes 51 s, against 72 to 76 s in the earlier v4b runs. Cause unknown (unverified assumption: less load on the machine; check by rerunning one cell).

## 4. Decide (designer)

1. **Which lever next?** Options, with what each tests:
   - A threshold shift between B and A, for example 44/37, to find where the gain starts. Likely still near 55%.
   - A setup lever on its own, for example more State Police or State start Resources, with the thresholds left at 49/32. This shows what the setup alone does.
   - A rules lever outside thresholds and setup. Needs a rules decision.
   Recommendation: the setup lever on its own, one change per run. It also isolates the Police change that finding 4 leaves open.
2. **Do the 60 to 65% target and "the PKK can win at a check" fit together?** In these runs the State only reaches 59% when the PKK barely wins at a check (variant A: 8 games). At 46/35 the PKK wins checks, and the State is at 49%. If both goals matter, the answer may be a rules lever, not a threshold.
3. **Confirm on fresh seeds before any rules change.** 50 seeds per pairing (800 games), as in doc 37.

## 5. Two-pass review

No code changed. The diff holds one test package (a copy of variant A with 3 changed values), one manifest, one run and this report.

| Class | Finding | Outcome |
|---|---|---|
| Fix | First launch of the run had the 30-minute background limit and would have stopped it partway | Stopped at once, partial folder deleted, restarted with the 2-hour limit; the committed run is the restarted one |
| Fix | The analysis script counted the State's "reached" games at 49, not 46 | Recounted at 46 (33 games); the PKK count already used 35 (26 games) |
| Drop | Test package is a byte copy of 9.2 MB of map art | Git stores identical files once; no new weight in the repository |

Validation: `make check` and `make test` pass (110 files, 1,623 tests). Windows: CI.

## 6. Not changed

The game package, research files, rules text, DD records and bot code are unchanged.
