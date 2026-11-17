# 36 DD-25 balance pilot

Date: 2026-11-17. Sources: DD-22 and DD-25 (`research/research-final/project-management/design-decisions.md`), 09 s2.2 and s8, 10 s8, docs 19, 21, 22, 23, 26 and 35 s0.

## 1. Bottom line

After DD-25 the bot roster favors the PKK. The State roster average fell from 65.8% (`dd22-pilot-after`) to 28.8% [23.8%, 34.2%] (`dd25-pilot`). The PKK roster average is 71.2%, above the 60% review trigger. Confidence: medium that the direction is real, low on the size.

Two causes, measured separately with a control run (`dd25-pilot-main-players`: new package, old players):

| Change | Paired State roster change | 95% CI | Evidence |
|---|---:|---|---|
| DD-25 setup and PKK threshold 32 (players unchanged) | -23.8 pp | [-29.3, -18.6] | dd22-pilot-after vs dd25-pilot-main-players (verified) |
| Player fix: the potential estimate counts every income before the final round | -13.3 pp | [-18.8, -7.9] | dd25-pilot-main-players vs dd25-pilot (verified) |
| Both | -36.9 pp | [-41.3, -32.9] | dd22-pilot-after vs dd25-pilot (verified) |

Early sudden victory is not a problem on this evidence: 8 of 240 games (3.3% [1.7%, 6.4%]) end before the C3 Propaganda round. The 10 s8 limit is 1 game in 5 (verified, `dd25-pilot/results.json`).

These are bot results on a pilot sample: 15 seeds per cell, development seeds, one play per seed. The players were tuned on Scenario A and are not tuned for C3 to C5 (doc 26). They are not balance proof. Do not change thresholds on this evidence alone (19 s10: "Do not tune thresholds to compensate for an unqualified player").

## 2. Step 1: player review

Search: threshold literals, space ids, Pop sums and score targets in `sim/src/cli/strategies/`, `players.ts`, `player-registry.ts`, `candidates.ts`, plus `qualification.ts` (Step 3 input). Lines refer to `ec55833` (main before this change).

| # | Finding | Location | Class | Outcome |
|---|---|---|---|---|
| 1 | Potential estimate counts at most one future income (`round < finalRound - 1 ? 1 : 0`). Right for 2 rounds; the full campaign has up to 4 incomes before the final round (no final income: `engine/coin/propaganda/resources.ts:37`) | `strategies/evaluation.ts:106` | Fix | `max(0, finalRound - 1 - round)`. Same value when `finalRound` is 2 |
| 2 | Cross-Border lifts hard-code `hakkari` and `sirnak`. DD-22 item 7 made them parameter `crossBorder.origins` | `candidates.ts:362-364` | Fix | Reads `crossBorderOrigins(r)` (engine helper). Same candidates on the current package |
| 3 | C2 qualification fixtures have 2 piles. In the full campaign C3 to C5 still follow, so the fixture timing saw the game as almost over | `qualification.ts:73` | Fix | Keeps the dealt C3 to C5 piles. Suite hash changes |
| 4 | Thresholds | `strategies/evaluation.ts:99, 137, 138` | Drop | Already read from the scenario. No literal 30, 32 or 49 in the player code |
| 5 | Independent oracle thresholds `{49, 32}` | `qualification.ts:15` | Drop | Deliberate: the oracle is written from the rules, not the package, and a test checks it against the engine (`test/player-qualification.test.ts:139`). PR 113 set 32 |
| 6 | P-SURV converts only in the last campaign (`round >= finalRound - 1`) | `strategies/evaluation.ts:198` | Decide | In a 5-round game P-SURV preserves forces through C1 to C4. Strategy question (Decide 4) |
| 7 | Strategy weights tuned on Scenario A | `strategies/scenario-a.ts:42-57` | Decide | Out of task: retuning is tuning (Decide 5) |
| 8 | Box ids literal: `ZONES`, `HOSTS`, Diplomacy targets | `candidates.ts:63, 64, 387` | Propose | Unchanged by DD-22 and DD-25. Read external boxes from `map.yaml` (Proposal 4) |
| 9 | `western-cities` excluded from Rally Base | `candidates.ts:269` | Propose | Duplicates the stacking rule `map.yaml:71`. Engine validation still rejects it. Read the stacking limit (Proposal 4) |
| 10 | Redeploy fallback `diyarbakir-city` | `candidates.ts:612` | Drop | Unreachable: the 18-space map has 4 Cities, so `dests` is never empty |
| 11 | `/ 8` top-part size | `strategies/evaluation.ts:198` | Propose | Equals `deck.topSize` (8). Not a Scenario A assumption. Read the parameter (Proposal 5) |
| 12 | Pruning bounds (Rally top 7 locations and others) sized on 13 spaces | `candidates.ts:286` | Drop | The bounded-vs-broad audit already runs on the current 18-space package (`test/candidates.test.ts:109`) |

Tests (each fails on its assertion without the fix, verified with `git stash`): `sim/test/full-campaign-players.test.ts`.

## 3. Step 3: re-qualification

`npm run sim -- experiment qualify sim/experiments/qualification-dd25.json`, package `5a605bb7…`, suite `9c5bc5ca…`, after the fixes (verified).

| Player | Result | Fixtures |
|---|---|---|
| S-POL@1, S-MIL@1, S-CON@1, S-ADAPT@1 | ✅ pass | 12 of 12 each |
| P-POL@2, P-EXP@2, P-SURV@2, P-ADAPT@2 | ✅ pass | 13 of 13 each |
| S-RANDOM@1 (baseline) | ❌ fails as required | S-WIN-CHECK, S-DEFEND-CHECK, S-HARM-FINAL |
| P-RANDOM@1 (baseline) | ❌ fails as required | P-WIN-CHECK, P-WIN-AGIT, P-DEFEND-CHECK, P-SCORE-BASE |

No player dropped. Per-fixture results are in the JSON file. Each player played 60 pilot games without a failure (19 s6 asks for 20).

## 4. Step 4: runs

| Run | Package | Players | Thresholds | Games | Replay |
|---|---|---|---|---|---|
| `dd22-pilot-after` (record) | `109212a1…` (DD-22) | `faad9bf4…` | 49 / 30 | 237 of 240 complete, 3 failed | not rerun |
| `dd25-pilot-main-players` (control) | `5a605bb7…` (DD-25) | `faad9bf4…` (same as dd22) | 49 / 32 | 240 of 240 | 240/240 identical |
| `dd25-pilot` | `5a605bb7…` | `48d5cfbf…` (this change) | 49 / 32 | 240 of 240 | 240/240 identical |

All three: same 16 cells, development seeds 7001 to 7015, engine `031594a9…`. The control ran from `ec55833` in a worktree with its manifest not yet committed, so its `identity.json` records `gitDirty: true`. Its code fingerprints match the frozen values.

## 5. Step 5: comparison

`experiment compare` returned an empty table: it pairs player versions only, and these runs share versions (`sim/src/cli/experiment-analysis.ts:275`). The paired tables below pair games by cell and seed. Bootstrap: 2,000 draws, seed 1, seed clusters for the roster average. Seeds are paired, but games diverge after the first different choice, so pairing reduces variance only a little (inferred).

### 5.1 State win rate per cell, 95% Wilson interval (n = 15 unless noted)

| Cell | dd22-pilot-after | control | dd25-pilot |
|---|---|---|---|
| S-POL vs P-POL | 73.3% [48.0, 89.1] | 80.0% [54.8, 93.0] | 46.7% [24.8, 69.9] |
| S-POL vs P-EXP | 6.7% [1.2, 29.8] | 13.3% [3.7, 37.9] | 6.7% [1.2, 29.8] |
| S-POL vs P-SURV | 13.3% [3.7, 37.9] | 20.0% [7.0, 45.2] | 13.3% [3.7, 37.9] |
| S-POL vs P-ADAPT | 80.0% [54.8, 93.0] | 13.3% [3.7, 37.9] | 20.0% [7.0, 45.2] |
| S-MIL vs P-POL | 100.0% [79.6, 100] | 100.0% [79.6, 100] | 73.3% [48.0, 89.1] |
| S-MIL vs P-EXP | 71.4% [45.4, 88.3] n=14 | 53.3% [30.1, 75.2] | 26.7% [10.9, 52.0] |
| S-MIL vs P-SURV | 35.7% [16.3, 61.2] n=14 | 6.7% [1.2, 29.8] | 6.7% [1.2, 29.8] |
| S-MIL vs P-ADAPT | 80.0% [54.8, 93.0] | 80.0% [54.8, 93.0] | 40.0% [19.8, 64.3] |
| S-CON vs P-POL | 100.0% [79.6, 100] | 100.0% [79.6, 100] | 100.0% [79.6, 100] |
| S-CON vs P-EXP | 85.7% [60.1, 96.0] n=14 | 20.0% [7.0, 45.2] | 6.7% [1.2, 29.8] |
| S-CON vs P-SURV | 60.0% [35.7, 80.2] | 6.7% [1.2, 29.8] | 20.0% [7.0, 45.2] |
| S-CON vs P-ADAPT | 100.0% [79.6, 100] | 73.3% [48.0, 89.1] | 26.7% [10.9, 52.0] |
| S-ADAPT vs P-POL | 100.0% [79.6, 100] | 46.7% [24.8, 69.9] | 40.0% [19.8, 64.3] |
| S-ADAPT vs P-EXP | 46.7% [24.8, 69.9] | 0.0% [0.0, 20.4] | 0.0% [0.0, 20.4] |
| S-ADAPT vs P-SURV | 20.0% [7.0, 45.2] | 20.0% [7.0, 45.2] | 20.0% [7.0, 45.2] |
| S-ADAPT vs P-ADAPT | 80.0% [54.8, 93.0] | 40.0% [19.8, 64.3] | 13.3% [3.7, 37.9] |
| **Roster average (State)** | **65.8% [59.9, 71.8]** | **42.1% [35.4, 48.8]** | **28.8% [23.8, 34.2]** |

Source: each run's `analysis-v2/report.md` (verified). Cells at 100% or 0% in `dd25-pilot`: S-CON vs P-POL (State always wins) and S-ADAPT vs P-EXP (PKK always wins). Paired per-cell differences: 7 of 16 cells fall for dd22 to control, 4 of 16 for control to dd25 (95% interval entirely below 0).

### 5.2 Margins

Final margin = score - threshold - Harm penalty (09 s4). Over all completed games (verified, `results.json`):

| Run | State margin p10 / p50 / p90 (mean) | PKK margin p10 / p50 / p90 (mean) | Mean end score S / P |
|---|---|---|---|
| dd22-pilot-after | -28 / -10 / 1 (-11.3) | -23 / -19 / -6 (-16.5) | 37.7 / 13.5 |
| control | -30 / -18 / -2 (-17.8) | -23 / -16 / -2 (-13.9) | 31.3 / 18.1 |
| dd25-pilot | -34 / -22 / -5 (-20.7) | -22 / -13 / 1 (-11.2) | 28.4 / 20.8 |

Per-cell margin-difference distributions (State minus PKK, p10 / p50 / p90) are in each run's report. In `dd25-pilot`, 14 of 16 cells have a negative median. 10 cells cross the median-gap trigger of 10.

Scoring routes in `dd25-pilot`: State winners Support 37.1 + Legitimacy 4.6. PKK winners Opposition 22.3 + domestic Bases 2.0 (verified, report).

### 5.3 First qualifying round (09 s8, 10 s8)

A qualification at a non-final check ends the game (09 s3), so the end round of a victory-check win is the first qualifying round. The check in round 1 is skipped. "Before the C3 Propaganda round" means a win at round 2 (verified, `results.json`).

| Run | Round 2 S / P | Round 3 S / P | Round 4 S / P | Round 5 check S / P | Final scoring | Win before C3 Propaganda |
|---|---|---|---|---|---|---|
| dd22-pilot-after | 0 / 0 | 17 / 2 | 22 / 2 | 22 / 2 | 170 | 0/237, 0.0% [0.0, 1.6] |
| control | 0 / 1 | 0 / 7 | 7 / 4 | 12 / 6 | 203 | 1/240, 0.4% [0.1, 2.3] |
| dd25-pilot | 0 / 8 | 1 / 21 | 9 / 2 | 7 / 4 | 188 | 8/240, 3.3% [1.7, 6.4] |

- Overall: far below 1 in 5. The PKK threshold 32 is not too low on this test (confidence medium).
- 7 of the 8 early wins in `dd25-pilot` are against S-ADAPT: S-ADAPT vs P-ADAPT 4/15 (26.7% [10.9, 52.0]) and S-ADAPT vs P-EXP 3/15. The cell interval is wide and includes 20%.
- PKK wins at the C3 check rose from 2 to 21. With the new players the PKK reaches 32 mid-game often.

### 5.4 Threshold reached and Harm

Counts over completed games, at game end (verified, `results.json`, matches the report columns):

| Run | State score ≥ 49 | PKK score ≥ threshold | State Harm > 6 | PKK Harm > 6 |
|---|---|---|---|---|
| dd22-pilot-after (PKK 30) | 61 | 9 | 2 | 0 |
| control (PKK 32) | 21 | 21 | 4 | 1 |
| dd25-pilot (PKK 32) | 17 | 37 | 4 | 0 |

The Harm gate rarely binds (09 s8 row 3: "Harm gate never binds"). At most 5 games of 240 per run end above 6.

### 5.5 Failed or incomplete games

- `dd22-pilot-after`: 3 failed, same cause: a player search threw "Pick 0 to 1 different spaces from: …" (`failures.json`).
- `dd25-pilot` and control: 0 failed, 0 incomplete of 480. The dd22 failure did not recur. Not reproduced, so the cause is not confirmed as fixed (Proposal 6).

## 6. Interpretation

- Verified: the DD-25 setup and threshold 32, with unchanged players, cut the State roster average by about 24 pp.
- Inferred: the setup adds 6 Guerrillas (5 domestic) and 2 Passive Opposition spaces (DD-25 items 1 and 2). The PKK end score rose from 13.5 to 18.1 with unchanged players, which is more than the +2 threshold takes back.
- Verified: the income fix cut the State roster average by a further 13 pp.
- Inferred: with every income counted, both sides value future potential more, which favors the PKK in the bots' one-step search. Not checked against decision logs. Confidence low.
- The player fix is a correctness fix, so `dd25-pilot` is the current record. The control shows how much of the change comes from the rules alone.

## 7. Decide (designer)

1. **PKK roster average 71.2% (trigger at 60%).** Choose one: keep 32 and confirm on fresh seeds (Proposal 1), test the method value 33 (09 s2.2) in a paired run, or review the DD-25 additions (Batman hinterland and Van hinterland at Passive Opposition, Guerrillas). No change is made here.
2. **Early PKK wins against S-ADAPT** (26.7% in one cell, 3.3% overall). Accept as a bot weakness, or treat as a threshold signal? The overall rate does not meet the 10 s8 limit.
3. **Which record counts.** `dd25-pilot` (corrected players) or the control? Recommendation: `dd25-pilot`, with the control as attribution only.
4. **P-SURV conversion timing** (`strategies/evaluation.ts:198`): convert in the last campaign only, or before each check? Strategy question, not a rules question.
5. **Retune the roster for the full campaign?** The weights still come from Scenario A (doc 26 Part 1). Retuning changes the players and needs a new qualification.

## 8. Proposals (not applied)

1. Run a confirmation: the same 16 cells on 50 fresh seeds per cell (19 s7), before any threshold decision.
2. `research/research-final/package-b-coin-design/09-victory-and-scoring.md` s1 rule 1 says "Count only the 13 domestic spaces". DD-22 has 18. Change "13" to "18".
3. `design-decisions.md` has two headings with ID DD-22: the map (line 228) and the Ambush removal (line 287, after the decision record). Give the Ambush decision its own ID.
4. `candidates.ts`: read external boxes and the Western Cities Base limit from `map.yaml` (findings 8 and 9).
5. `strategies/evaluation.ts:198`: read `deck.topSize`, not `8`.
6. `experiment compare`: add a run-versus-run mode that pairs by cell and seed, for rules changes. This report used a scratch script.
7. If the "Pick 0 to 1 different spaces" failure returns, reproduce it from its journal prefix before any fix.

## 9. Two-pass review

Diff: `evaluation.ts`, `candidates.ts`, `qualification.ts`, the new test, docs 21, 26, 36, README files, manifests, runs and the qualification record.

Pass 1, correctness:

| Class | Finding | Outcome |
|---|---|---|
| Fix | Income count in the potential estimate (finding 1) | Fixed, test fails without it |
| Fix | Cross-Border origins literal (finding 2) | Fixed, test fails without it |
| Fix | C2 fixtures missing C3 to C5 piles (finding 3) | Fixed, test fails without it |
| Fix | Docs 21 and 26 described the old income rule | Updated |
| Drop | Income during a Propaganda round before its Resources phase is not counted | Same rule as before the change. Underestimates by at most one income in that phase |
| Drop | Control run `gitDirty: true` | Only the untracked manifest. Fingerprints are frozen and match. Recorded in section 4 |

Pass 2, simplicity: the Cross-Border fix reuses the engine helper `crossBorderOrigins`, so there is one source for the origins. No new dependency, no new runner code. The scratch scripts were not committed (AGENTS Edits 8).

Validation: `make check` and `make test` pass (109 files, 1,614 tests, including the 4 new ones).

## 10. Not run

- Windows: not available in this container.
- Replay of `dd22-pilot-after`: not rerun. Its record has no `replays.jsonl.gz`.
- Human IC-3a play: outside this task.
