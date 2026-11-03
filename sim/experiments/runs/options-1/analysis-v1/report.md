# Experiment options-1 (options)

Experiment hash `4cd37f05b100849d1f8d521cce478efe6935c6692405293985b32779ae7c863e`. Analysis version 1.

## Completion

Scheduled 2400 games: complete 2400. Incomplete games are not losses and are excluded from win rates.

## Condition no-hot-pursuit

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 26.0% [15.9%, 39.6%] n=50 | 16.0% [8.3%, 28.5%] n=50 | 52.0% [38.5%, 65.2%] n=50 | 32.0% [20.8%, 45.8%] n=50 |
| S-MIL | 56.0% [42.3%, 68.8%] n=50 | 68.0% [54.2%, 79.2%] n=50 | 80.0% [67.0%, 88.8%] n=50 | 84.0% [71.5%, 91.7%] n=50 |
| S-CON | 28.0% [17.5%, 41.7%] n=50 | 24.0% [14.3%, 37.4%] n=50 | 34.0% [22.4%, 47.8%] n=50 | 64.0% [50.1%, 75.9%] n=50 |
| S-ADAPT | 42.0% [29.4%, 55.8%] n=50 | 86.0% [73.8%, 93.0%] n=50 | 30.0% [19.1%, 43.8%] n=50 | 36.0% [24.1%, 49.9%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 47.4% [43.9%, 50.8%] over 16 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-POL | -7.3 (-25 / -9 / 15) | 1/1 | 2/2 | 0/0 |
| S-POL vs P-EXP | -10.3 (-24 / -11 / 4) | 0/4 | 1/4 | 0/0 |
| S-POL vs P-SURV | 1.1 (-12 / 2 / 15) | 0/0 | 0/0 | 0/0 |
| S-POL vs P-ADAPT | -4.6 (-21 / -3 / 10) | 1/0 | 3/0 | 0/0 |
| S-MIL vs P-POL | 1.6 (-15 / 4 / 15) | 1/0 | 1/0 | 0/0 |
| S-MIL vs P-EXP | 5.7 (-9 / 4 / 22) | 2/0 | 3/0 | 0/0 |
| S-MIL vs P-SURV | 7.5 (-4 / 8 / 19) | 0/0 | 1/0 | 0/0 |
| S-MIL vs P-ADAPT | 12.7 (-2 / 15 / 25) | 8/0 | 10/0 | 0/0 |
| S-CON vs P-POL | -6.4 (-20 / -9 / 7) | 1/3 | 1/3 | 0/0 |
| S-CON vs P-EXP | -8.5 (-21 / -10 / 3) | 0/0 | 0/1 | 0/0 |
| S-CON vs P-SURV | -3.2 (-13 / -4 / 8) | 0/3 | 1/3 | 0/0 |
| S-CON vs P-ADAPT | 6.4 (-8 / 6 / 24) | 2/0 | 6/0 | 0/0 |
| S-ADAPT vs P-POL | -0.0 (-21 / -5 / 24) | 4/2 | 6/2 | 0/0 |
| S-ADAPT vs P-EXP | 13.7 (-0 / 17 / 26) | 4/0 | 7/0 | 0/0 |
| S-ADAPT vs P-SURV | -4.9 (-20 / -5 / 15) | 2/0 | 2/1 | 0/0 |
| S-ADAPT vs P-ADAPT | -3.6 (-23 / -5 / 19) | 1/3 | 2/5 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@1 vs P-EXP@2 (no-hot-pursuit): State 16.0%
- S-MIL@1 vs P-SURV@2 (no-hot-pursuit): State 80.0%
- S-MIL@1 vs P-ADAPT@2 (no-hot-pursuit): State 84.0%
- S-ADAPT@1 vs P-EXP@2 (no-hot-pursuit): State 86.0%
- S-POL@1 vs P-EXP@2 (no-hot-pursuit): median margin difference -10.5
- S-MIL@1 vs P-ADAPT@2 (no-hot-pursuit): median margin difference 15.0
- S-CON@1 vs P-EXP@2 (no-hot-pursuit): median margin difference -10.0
- S-ADAPT@1 vs P-EXP@2 (no-hot-pursuit): median margin difference 17.0

## Condition no-syria-march

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 24.0% [14.3%, 37.4%] n=50 | 16.0% [8.3%, 28.5%] n=50 | 68.0% [54.2%, 79.2%] n=50 | 36.0% [24.1%, 49.9%] n=50 |
| S-MIL | 56.0% [42.3%, 68.8%] n=50 | 74.0% [60.4%, 84.1%] n=50 | 70.0% [56.2%, 80.9%] n=50 | 80.0% [67.0%, 88.8%] n=50 |
| S-CON | 26.0% [15.9%, 39.6%] n=50 | 26.0% [15.9%, 39.6%] n=50 | 34.0% [22.4%, 47.8%] n=50 | 76.0% [62.6%, 85.7%] n=50 |
| S-ADAPT | 40.0% [27.6%, 53.8%] n=50 | 84.0% [71.5%, 91.7%] n=50 | 32.0% [20.8%, 45.8%] n=50 | 32.0% [20.8%, 45.8%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 48.4% [44.5%, 52.5%] over 16 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-POL | -7.6 (-23 / -12 / 15) | 0/2 | 1/3 | 0/0 |
| S-POL vs P-EXP | -10.7 (-24 / -11 / 3) | 0/2 | 1/3 | 0/0 |
| S-POL vs P-SURV | 2.3 (-15 / 4 / 14) | 0/1 | 0/1 | 0/0 |
| S-POL vs P-ADAPT | -3.6 (-16 / -5 / 11) | 0/0 | 2/0 | 0/0 |
| S-MIL vs P-POL | 3.1 (-14 / 4 / 15) | 2/0 | 3/0 | 0/0 |
| S-MIL vs P-EXP | 6.6 (-8 / 7 / 21) | 1/0 | 2/0 | 0/0 |
| S-MIL vs P-SURV | 6.5 (-7 / 8 / 22) | 2/0 | 2/1 | 0/0 |
| S-MIL vs P-ADAPT | 12.2 (-5 / 14 / 25) | 8/0 | 8/0 | 0/0 |
| S-CON vs P-POL | -6.8 (-20 / -7 / 7) | 0/3 | 0/3 | 0/0 |
| S-CON vs P-EXP | -8.4 (-22 / -8 / 5) | 0/0 | 0/1 | 0/0 |
| S-CON vs P-SURV | -4.2 (-16 / -5 / 6) | 0/2 | 0/2 | 0/0 |
| S-CON vs P-ADAPT | 9.6 (-8 / 15 / 26) | 3/0 | 4/1 | 0/0 |
| S-ADAPT vs P-POL | -0.8 (-20 / -4 / 24) | 5/1 | 7/2 | 0/0 |
| S-ADAPT vs P-EXP | 12.8 (-2 / 16 / 24) | 3/0 | 3/0 | 0/0 |
| S-ADAPT vs P-SURV | -5.3 (-20 / -5 / 8) | 0/3 | 0/5 | 0/0 |
| S-ADAPT vs P-ADAPT | -5.4 (-21 / -6 / 13) | 0/2 | 1/2 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@1 vs P-EXP@2 (no-syria-march): State 16.0%
- S-MIL@1 vs P-ADAPT@2 (no-syria-march): State 80.0%
- S-ADAPT@1 vs P-EXP@2 (no-syria-march): State 84.0%
- S-POL@1 vs P-POL@2 (no-syria-march): median margin difference -11.5
- S-POL@1 vs P-EXP@2 (no-syria-march): median margin difference -11.0
- S-MIL@1 vs P-ADAPT@2 (no-syria-march): median margin difference 14.0
- S-CON@1 vs P-ADAPT@2 (no-syria-march): median margin difference 14.5
- S-ADAPT@1 vs P-EXP@2 (no-syria-march): median margin difference 15.5

## Condition neither

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 32.0% [20.8%, 45.8%] n=50 | 20.0% [11.2%, 33.0%] n=50 | 58.0% [44.2%, 70.6%] n=50 | 24.0% [14.3%, 37.4%] n=50 |
| S-MIL | 58.0% [44.2%, 70.6%] n=50 | 78.0% [64.8%, 87.2%] n=50 | 82.0% [69.2%, 90.2%] n=50 | 84.0% [71.5%, 91.7%] n=50 |
| S-CON | 24.0% [14.3%, 37.4%] n=50 | 28.0% [17.5%, 41.7%] n=50 | 36.0% [24.1%, 49.9%] n=50 | 68.0% [54.2%, 79.2%] n=50 |
| S-ADAPT | 46.0% [33.0%, 59.6%] n=50 | 88.0% [76.2%, 94.4%] n=50 | 22.0% [12.8%, 35.2%] n=50 | 32.0% [20.8%, 45.8%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 48.8% [45.6%, 51.9%] over 16 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-POL | -6.9 (-23 / -11 / 14) | 1/2 | 2/3 | 0/0 |
| S-POL vs P-EXP | -11.1 (-29 / -12 / 5) | 0/6 | 0/8 | 0/0 |
| S-POL vs P-SURV | 3.2 (-8 / 4 / 17) | 0/0 | 0/0 | 0/0 |
| S-POL vs P-ADAPT | -7.7 (-21 / -10 / 10) | 1/2 | 2/4 | 0/0 |
| S-MIL vs P-POL | 3.0 (-12 / 4 / 16) | 3/0 | 3/0 | 0/0 |
| S-MIL vs P-EXP | 6.6 (-8 / 7 / 22) | 3/0 | 3/0 | 0/0 |
| S-MIL vs P-SURV | 7.7 (-5 / 8 / 18) | 1/0 | 2/0 | 0/0 |
| S-MIL vs P-ADAPT | 12.8 (-4 / 16 / 25) | 7/0 | 9/0 | 0/0 |
| S-CON vs P-POL | -6.3 (-18 / -8 / 7) | 1/0 | 1/1 | 0/0 |
| S-CON vs P-EXP | -7.6 (-20 / -8 / 5) | 0/0 | 0/1 | 0/0 |
| S-CON vs P-SURV | -2.6 (-13 / -2 / 10) | 0/2 | 2/3 | 0/0 |
| S-CON vs P-ADAPT | 7.9 (-9 / 10 / 24) | 3/1 | 6/1 | 0/0 |
| S-ADAPT vs P-POL | 1.0 (-18 / -4 / 24) | 6/3 | 7/3 | 0/0 |
| S-ADAPT vs P-EXP | 14.3 (-0 / 16 / 26) | 5/0 | 9/0 | 0/0 |
| S-ADAPT vs P-SURV | -6.8 (-19 / -7 / 6) | 2/2 | 2/4 | 0/0 |
| S-ADAPT vs P-ADAPT | -5.7 (-21 / -7 / 13) | 0/0 | 1/1 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@1 vs P-EXP@2 (neither): State 20.0%
- S-MIL@1 vs P-SURV@2 (neither): State 82.0%
- S-MIL@1 vs P-ADAPT@2 (neither): State 84.0%
- S-ADAPT@1 vs P-EXP@2 (neither): State 88.0%
- S-POL@1 vs P-POL@2 (neither): median margin difference -11.0
- S-POL@1 vs P-EXP@2 (neither): median margin difference -12.0
- S-MIL@1 vs P-ADAPT@2 (neither): median margin difference 15.5
- S-ADAPT@1 vs P-EXP@2 (neither): median margin difference 15.5

## Scoring routes

Mean final components over 2400 completed games: State Support 23.2 + Legitimacy 10.2; PKK Opposition 12.7 + domestic Bases 1.7.
State winners (1156): Support 30.0, Legitimacy 10.1. PKK winners (1244): Opposition 17.1, Bases 2.5.

## Review selection

Closest: neither~S-ADAPTv1~P-ADAPTv2~1000242~r0, neither~S-ADAPTv1~P-EXPv2~1000213~r0, neither~S-CONv1~P-ADAPTv2~1000220~r0, neither~S-CONv1~P-ADAPTv2~1000236~r0, neither~S-CONv1~P-POLv2~1000230~r0

Largest gaps: neither~S-MILv1~P-ADAPTv2~1000225~r0, neither~S-POLv1~P-POLv2~1000225~r0, neither~S-MILv1~P-ADAPTv2~1000235~r0, no-syria-march~S-MILv1~P-ADAPTv2~1000214~r0, no-hot-pursuit~S-POLv1~P-POLv2~1000202~r0

Seeded random: neither~S-MILv1~P-ADAPTv2~1000222~r0, no-hot-pursuit~S-CONv1~P-EXPv2~1000226~r0, no-hot-pursuit~S-POLv1~P-SURVv2~1000216~r0, neither~S-CONv1~P-EXPv2~1000205~r0, no-hot-pursuit~S-MILv1~P-EXPv2~1000214~r0

Failures: none

## Coverage ledger

51 natural, 17 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 2400 |
| Win at the opening check | Victory | natural exposure | 134 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 2197 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 49 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 2311 |
| Train Civic Action | Political economy | natural exposure | 2394 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 2352 |
| Propaganda Agitation spending | Political economy | natural exposure | 2091 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 366 |
| State Harm placed | Civilian effects | natural exposure | 719 |
| PKK Harm placed | Civilian effects | natural exposure | 234 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 258 |
| Coerce places Coercion | Civilian effects | natural exposure | 556 |
| Guard upkeep paid | Civilian effects | natural exposure | 1485 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 293 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 71 |
| Strike Collaborators | Civilian effects | natural exposure | 3 |
| Europe track change | Civilian effects | natural exposure | 1398 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 394 |
| Reception marker placed | Civilian effects | natural exposure | 20 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 2400 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 2400 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 102 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| puk posture reaches restricted | Sanctuary | natural exposure | 5 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 22 |
| Diplomacy | Sanctuary | natural exposure | 49 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 2400 |
| Unshaded Event executed | Sequence/cards | natural exposure | 2104 |
| Shaded Event executed | Sequence/cards | natural exposure | 2282 |
| ARGK played | Sequence/cards | natural exposure | 1374 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 2400 |
| Limited Op | Sequence/cards | natural exposure | 2400 |
| Op Only | Sequence/cards | natural exposure | 2400 |
| Op + SA | Sequence/cards | natural exposure | 2400 |
| Redeploy with moves | Sequence/cards | natural exposure | 382 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 2400 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 2266 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 2396 |
| Operation state.garrison | Sequence/cards | natural exposure | 2303 |
| Operation state.sweep | Sequence/cards | natural exposure | 1449 |
| Operation state.assault | Sequence/cards | natural exposure | 2400 |
| Operation pkk.rally | Sequence/cards | natural exposure | 2400 |
| Operation pkk.march | Sequence/cards | natural exposure | 2400 |
| Operation pkk.attack | Sequence/cards | natural exposure | 609 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 556 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 2400 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 57 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 2400 |

## Diagnostics

Pass share: State 38.3%, PKK 17.1%. Longest First Eligible streak: 20 cards. Mean unused Resources at the end: State 4.3, PKK 1.1. Games with a 3-Pass streak: {"state":1404,"pkk":422}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":14309,"opSa":10808,"pass":20400,"event":5112,"opOnly":2651},"pkk":{"opOnly":7532,"limitedOp":11426,"opSa":16713,"pass":8858,"event":7377}}

