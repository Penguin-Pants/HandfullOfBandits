# Experiment options-4 (options)

Experiment hash `de1872b06a3dbb03ef703c1fce55308337362c8f276f3231df889a1ecef05c9d`. Analysis version 2.

## Completion

Scheduled 2400 games: complete 2399, failed 1. Incomplete games are not losses and are excluded from win rates.

## Condition no-hot-pursuit

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 36.0% [24.1%, 49.9%] n=50 | 32.0% [20.8%, 45.8%] n=50 | 66.0% [52.2%, 77.6%] n=50 | 72.0% [58.3%, 82.5%] n=50 |
| S-MIL@1 | 82.0% [69.2%, 90.2%] n=50 | 68.0% [54.2%, 79.2%] n=50 | 90.0% [78.6%, 95.7%] n=50 | 74.0% [60.4%, 84.1%] n=50 |
| S-CON@1 | 26.0% [15.9%, 39.6%] n=50 | 12.0% [5.6%, 23.8%] n=50 | 44.0% [31.2%, 57.7%] n=50 | 78.0% [64.8%, 87.2%] n=50 |
| S-ADAPT@1 | 48.0% [34.8%, 61.5%] n=50 | 42.0% [29.4%, 55.8%] n=50 | 40.0% [27.6%, 53.8%] n=50 | 100.0% [92.9%, 100.0%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 56.9% [53.5%, 60.6%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -3.5 (-18 / -7 / 16) | 0/2 | 0/4 | 0/0 |
| S-POL@1 vs P-EXP@2 | -3.6 (-20 / -5 / 14) | 0/0 | 1/2 | 0/0 |
| S-POL@1 vs P-SURV@2 | 3.6 (-7 / 5 / 15) | 0/0 | 0/1 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 6.9 (-6 / 8 / 21) | 1/0 | 4/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 8.2 (-1 / 9 / 17) | 3/0 | 3/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 3.9 (-8 / 4 / 19) | 0/0 | 2/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 12.6 (2 / 14 / 23) | 2/0 | 3/0 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 7.9 (-7 / 6 / 26) | 7/0 | 7/0 | 0/0 |
| S-CON@1 vs P-POL@2 | -5.6 (-17 / -6 / 7) | 0/1 | 0/2 | 0/0 |
| S-CON@1 vs P-EXP@2 | -10.1 (-20 / -11 / 1) | 0/2 | 1/4 | 0/0 |
| S-CON@1 vs P-SURV@2 | -2.3 (-16 / -3 / 11) | 1/0 | 1/0 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 10.0 (-4 / 10 / 23) | 5/0 | 5/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -2.5 (-17 / -2 / 10) | 0/1 | 0/2 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -1.9 (-13 / -3 / 10) | 0/0 | 1/0 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -4.5 (-19 / -1 / 7) | 0/2 | 0/5 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 23.8 (12 / 25 / 33) | 27/0 | 30/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-POL@2 (no-hot-pursuit): State 82.0%
- S-MIL@1 vs P-SURV@2 (no-hot-pursuit): State 90.0%
- S-CON@1 vs P-EXP@2 (no-hot-pursuit): State 12.0%
- S-ADAPT@1 vs P-ADAPT@2 (no-hot-pursuit): State 100.0%
- S-MIL@1 vs P-SURV@2 (no-hot-pursuit): median margin difference 14.0
- S-CON@1 vs P-EXP@2 (no-hot-pursuit): median margin difference -11.0
- S-CON@1 vs P-ADAPT@2 (no-hot-pursuit): median margin difference 10.0
- S-ADAPT@1 vs P-ADAPT@2 (no-hot-pursuit): median margin difference 25.0

## Condition no-syria-march

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 46.0% [33.0%, 59.6%] n=50 | 36.0% [24.1%, 49.9%] n=50 | 64.0% [50.1%, 75.9%] n=50 | 74.0% [60.4%, 84.1%] n=50 |
| S-MIL@1 | 82.0% [69.2%, 90.2%] n=50 | 74.0% [60.4%, 84.1%] n=50 | 90.0% [78.6%, 95.7%] n=50 | 75.5% [61.9%, 85.4%] n=49 (+1 incomplete) |
| S-CON@1 | 32.0% [20.8%, 45.8%] n=50 | 10.0% [4.3%, 21.4%] n=50 | 34.0% [22.4%, 47.8%] n=50 | 80.0% [67.0%, 88.8%] n=50 |
| S-ADAPT@1 | 48.0% [34.8%, 61.5%] n=50 | 46.0% [33.0%, 59.6%] n=50 | 40.0% [27.6%, 53.8%] n=50 | 98.0% [89.5%, 99.6%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 58.1% [54.8%, 61.4%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -1.1 (-18 / -4 / 19) | 0/1 | 1/1 | 0/0 |
| S-POL@1 vs P-EXP@2 | -4.5 (-18 / -6 / 10) | 0/0 | 0/0 | 0/0 |
| S-POL@1 vs P-SURV@2 | 2.7 (-14 / 6 / 12) | 0/1 | 0/1 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 6.7 (-10 / 7 / 21) | 4/0 | 8/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 6.5 (-3 / 8 / 17) | 0/0 | 0/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 4.7 (-9 / 5 / 16) | 0/0 | 1/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 10.8 (1 / 13 / 20) | 1/0 | 2/0 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 8.2 (-10 / 8 / 25) | 6/0 | 8/0 | 0/0 |
| S-CON@1 vs P-POL@2 | -4.4 (-17 / -5 / 8) | 0/0 | 0/2 | 0/0 |
| S-CON@1 vs P-EXP@2 | -10.4 (-20 / -11 / 0) | 0/2 | 0/3 | 0/0 |
| S-CON@1 vs P-SURV@2 | -4.1 (-15 / -6 / 10) | 1/0 | 1/0 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 10.0 (-11 / 13 / 25) | 5/0 | 7/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -2.2 (-19 / -1 / 12) | 0/1 | 1/2 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -0.7 (-12 / -2 / 11) | 0/0 | 1/0 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -4.2 (-19 / -2 / 12) | 1/1 | 1/1 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 23.3 (16 / 24 / 33) | 21/0 | 25/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-POL@2 (no-syria-march): State 82.0%
- S-MIL@1 vs P-SURV@2 (no-syria-march): State 90.0%
- S-CON@1 vs P-EXP@2 (no-syria-march): State 10.0%
- S-CON@1 vs P-ADAPT@2 (no-syria-march): State 80.0%
- S-ADAPT@1 vs P-ADAPT@2 (no-syria-march): State 98.0%
- S-MIL@1 vs P-SURV@2 (no-syria-march): median margin difference 12.5
- S-CON@1 vs P-EXP@2 (no-syria-march): median margin difference -11.0
- S-CON@1 vs P-ADAPT@2 (no-syria-march): median margin difference 13.0
- S-ADAPT@1 vs P-ADAPT@2 (no-syria-march): median margin difference 24.0

## Condition neither

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 42.0% [29.4%, 55.8%] n=50 | 32.0% [20.8%, 45.8%] n=50 | 72.0% [58.3%, 82.5%] n=50 | 64.0% [50.1%, 75.9%] n=50 |
| S-MIL@1 | 84.0% [71.5%, 91.7%] n=50 | 66.0% [52.2%, 77.6%] n=50 | 88.0% [76.2%, 94.4%] n=50 | 80.0% [67.0%, 88.8%] n=50 |
| S-CON@1 | 26.0% [15.9%, 39.6%] n=50 | 12.0% [5.6%, 23.8%] n=50 | 38.0% [25.9%, 51.8%] n=50 | 82.0% [69.2%, 90.2%] n=50 |
| S-ADAPT@1 | 54.0% [40.4%, 67.0%] n=50 | 36.0% [24.1%, 49.9%] n=50 | 24.0% [14.3%, 37.4%] n=50 | 98.0% [89.5%, 99.6%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 56.1% [53.0%, 59.0%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -1.6 (-18 / -3 / 17) | 1/2 | 2/5 | 0/0 |
| S-POL@1 vs P-EXP@2 | -5.4 (-22 / -8 / 13) | 0/1 | 1/1 | 0/0 |
| S-POL@1 vs P-SURV@2 | 4.7 (-5 / 6 / 12) | 0/0 | 0/0 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 5.3 (-9 / 6 / 21) | 6/0 | 7/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 8.4 (-3 / 9 / 20) | 2/0 | 2/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 4.0 (-10 / 4 / 19) | 1/0 | 1/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 11.0 (0 / 12 / 20) | 1/0 | 2/0 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 9.5 (-6 / 11 / 26) | 8/0 | 8/0 | 0/0 |
| S-CON@1 vs P-POL@2 | -4.9 (-16 / -5 / 9) | 0/1 | 0/1 | 0/0 |
| S-CON@1 vs P-EXP@2 | -9.5 (-20 / -9 / 1) | 0/0 | 0/2 | 0/0 |
| S-CON@1 vs P-SURV@2 | -3.5 (-16 / -4 / 9) | 0/0 | 0/0 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 10.4 (-8 / 11 / 26) | 8/0 | 8/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | 0.3 (-17 / 3 / 12) | 1/1 | 2/1 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -2.2 (-13 / -5 / 14) | 0/0 | 0/0 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -6.5 (-22 / -6 / 7) | 0/2 | 0/5 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 24.1 (11 / 25 / 33) | 27/0 | 30/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-POL@2 (neither): State 84.0%
- S-MIL@1 vs P-SURV@2 (neither): State 88.0%
- S-MIL@1 vs P-ADAPT@2 (neither): State 80.0%
- S-CON@1 vs P-EXP@2 (neither): State 12.0%
- S-CON@1 vs P-ADAPT@2 (neither): State 82.0%
- S-ADAPT@1 vs P-ADAPT@2 (neither): State 98.0%
- S-MIL@1 vs P-SURV@2 (neither): median margin difference 12.0
- S-MIL@1 vs P-ADAPT@2 (neither): median margin difference 10.5
- S-CON@1 vs P-ADAPT@2 (neither): median margin difference 10.5
- S-ADAPT@1 vs P-ADAPT@2 (neither): median margin difference 25.0

## Scoring routes

Mean final components over 2399 completed games: State Support 24.6 + Legitimacy 10.0; PKK Opposition 11.4 + domestic Bases 1.5.
State winners (1368): Support 30.0, Legitimacy 10.0. PKK winners (1031): Opposition 16.1, Bases 2.3.

## Review selection

Closest: neither~S-ADAPTv1~P-EXPv2~1001713~r0, neither~S-ADAPTv1~P-POLv2~1001702~r0, neither~S-ADAPTv1~P-POLv2~1001711~r0, neither~S-ADAPTv1~P-SURVv2~1001711~r0, neither~S-ADAPTv1~P-SURVv2~1001718~r0

Largest gaps: no-syria-march~S-ADAPTv1~P-POLv2~1001709~r0, no-syria-march~S-ADAPTv1~P-ADAPTv2~1001739~r0, neither~S-ADAPTv1~P-ADAPTv2~1001746~r0, neither~S-ADAPTv1~P-ADAPTv2~1001708~r0, no-hot-pursuit~S-ADAPTv1~P-ADAPTv2~1001708~r0

Seeded random: no-hot-pursuit~S-CONv1~P-ADAPTv2~1001738~r0, no-syria-march~S-MILv1~P-POLv2~1001717~r0, neither~S-POLv1~P-POLv2~1001713~r0, no-hot-pursuit~S-MILv1~P-POLv2~1001723~r0, neither~S-ADAPTv1~P-POLv2~1001729~r0

Failures: no-syria-march~S-MILv1~P-ADAPTv2~1001716~r0

## Coverage ledger

55 natural, 13 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 2400 |
| Win at the opening check | Victory | natural exposure | 161 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 2177 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 61 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 2321 |
| Train Civic Action | Political economy | natural exposure | 2400 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 2400 |
| Propaganda Agitation spending | Political economy | natural exposure | 1942 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 365 |
| State Harm placed | Civilian effects | natural exposure | 841 |
| PKK Harm placed | Civilian effects | natural exposure | 182 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 233 |
| Coerce places Coercion | Civilian effects | natural exposure | 589 |
| Guard upkeep paid | Civilian effects | natural exposure | 1258 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 183 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 31 |
| Strike Collaborators | Civilian effects | natural exposure | 2 |
| Europe track change | Civilian effects | natural exposure | 1376 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 390 |
| Reception marker placed | Civilian effects | natural exposure | 28 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 2400 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| syria posture reaches restricted | Sanctuary | natural exposure | 1 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 2400 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 97 |
| kdp posture reaches hostile | Sanctuary | natural exposure | 1 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| puk posture reaches restricted | Sanctuary | natural exposure | 2 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 337 |
| Diplomacy | Sanctuary | natural exposure | 42 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 5 |
| March into a Restricted box (+1, activates) | Sanctuary | natural exposure | 1 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 2400 |
| Unshaded Event executed | Sequence/cards | natural exposure | 2152 |
| Shaded Event executed | Sequence/cards | natural exposure | 2307 |
| ARGK played | Sequence/cards | natural exposure | 1161 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 2400 |
| Limited Op | Sequence/cards | natural exposure | 2400 |
| Op Only | Sequence/cards | natural exposure | 2400 |
| Op + SA | Sequence/cards | natural exposure | 2400 |
| Redeploy with moves | Sequence/cards | natural exposure | 437 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 2400 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 2238 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 2400 |
| Operation state.garrison | Sequence/cards | natural exposure | 2187 |
| Operation state.sweep | Sequence/cards | natural exposure | 1409 |
| Operation state.assault | Sequence/cards | natural exposure | 2400 |
| Operation pkk.rally | Sequence/cards | natural exposure | 2400 |
| Operation pkk.march | Sequence/cards | natural exposure | 2400 |
| Operation pkk.attack | Sequence/cards | natural exposure | 536 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 589 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 2400 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 65 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 2400 |

## Diagnostics

Pass share: State 39.2%, PKK 17.1%. Longest First Eligible streak: 20 cards. Mean unused Resources at the end: State 4.8, PKK 1.3. Games with a 3-Pass streak: {"state":1511,"pkk":399}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":13479,"opSa":10951,"pass":20522,"opOnly":2516,"event":4948},"pkk":{"opOnly":6639,"limitedOp":11436,"opSa":16346,"event":8061,"pass":8773}}

