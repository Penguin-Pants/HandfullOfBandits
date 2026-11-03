# Experiment options-2 (options)

Experiment hash `0a77674d72626974f74ec059e1ec6f64ca5d538c1c362903ce666c8b45345aeb`. Analysis version 1.

## Completion

Scheduled 2400 games: complete 2400. Incomplete games are not losses and are excluded from win rates.

## Condition no-hot-pursuit

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 30.0% [19.1%, 43.8%] n=50 | 28.0% [17.5%, 41.7%] n=50 | 68.0% [54.2%, 79.2%] n=50 | 40.0% [27.6%, 53.8%] n=50 |
| S-MIL | 78.0% [64.8%, 87.2%] n=50 | 52.0% [38.5%, 65.2%] n=50 | 94.0% [83.8%, 97.9%] n=50 | 86.0% [73.8%, 93.0%] n=50 |
| S-CON | 22.0% [12.8%, 35.2%] n=50 | 14.0% [7.0%, 26.2%] n=50 | 30.0% [19.1%, 43.8%] n=50 | 64.0% [50.1%, 75.9%] n=50 |
| S-ADAPT | 56.0% [42.3%, 68.8%] n=50 | 94.0% [83.8%, 97.9%] n=50 | 50.0% [36.6%, 63.4%] n=50 | 16.0% [8.3%, 28.5%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 51.4% [47.8%, 55.1%] over 16 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-POL | -5.2 (-19 / -6 / 12) | 0/0 | 0/0 | 0/0 |
| S-POL vs P-EXP | -7.0 (-22 / -9 / 11) | 0/0 | 0/1 | 0/0 |
| S-POL vs P-SURV | 4.6 (-6 / 6 / 16) | 1/0 | 2/0 | 0/0 |
| S-POL vs P-ADAPT | -2.7 (-18 / -4 / 13) | 2/0 | 3/0 | 0/0 |
| S-MIL vs P-POL | 7.0 (-8 / 9 / 19) | 2/0 | 2/0 | 0/0 |
| S-MIL vs P-EXP | 1.2 (-15 / 2 / 16) | 1/0 | 1/0 | 0/0 |
| S-MIL vs P-SURV | 11.2 (3 / 11 / 21) | 3/0 | 4/0 | 0/0 |
| S-MIL vs P-ADAPT | 12.4 (-1 / 15 / 24) | 5/0 | 6/0 | 0/0 |
| S-CON vs P-POL | -6.4 (-18 / -8 / 6) | 0/1 | 0/1 | 0/0 |
| S-CON vs P-EXP | -9.1 (-20 / -11 / 5) | 0/1 | 0/2 | 0/0 |
| S-CON vs P-SURV | -3.1 (-15 / -4 / 7) | 0/1 | 0/1 | 0/0 |
| S-CON vs P-ADAPT | 4.7 (-15 / 4 / 23) | 1/0 | 4/0 | 0/0 |
| S-ADAPT vs P-POL | 2.8 (-14 / 4 / 20) | 5/1 | 5/1 | 0/0 |
| S-ADAPT vs P-EXP | 17.0 (7 / 20 / 27) | 3/0 | 7/0 | 0/0 |
| S-ADAPT vs P-SURV | -1.8 (-14 / 0 / 10) | 0/2 | 0/3 | 0/0 |
| S-ADAPT vs P-ADAPT | -7.1 (-20 / -8 / 7) | 1/1 | 1/1 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (no-hot-pursuit): State 94.0%
- S-MIL@1 vs P-ADAPT@2 (no-hot-pursuit): State 86.0%
- S-CON@1 vs P-EXP@2 (no-hot-pursuit): State 14.0%
- S-ADAPT@1 vs P-EXP@2 (no-hot-pursuit): State 94.0%
- S-ADAPT@1 vs P-ADAPT@2 (no-hot-pursuit): State 16.0%
- S-MIL@1 vs P-SURV@2 (no-hot-pursuit): median margin difference 10.5
- S-MIL@1 vs P-ADAPT@2 (no-hot-pursuit): median margin difference 15.0
- S-CON@1 vs P-EXP@2 (no-hot-pursuit): median margin difference -11.0
- S-ADAPT@1 vs P-EXP@2 (no-hot-pursuit): median margin difference 19.5

## Condition no-syria-march

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 36.0% [24.1%, 49.9%] n=50 | 36.0% [24.1%, 49.9%] n=50 | 70.0% [56.2%, 80.9%] n=50 | 44.0% [31.2%, 57.7%] n=50 |
| S-MIL | 72.0% [58.3%, 82.5%] n=50 | 62.0% [48.2%, 74.1%] n=50 | 92.0% [81.2%, 96.8%] n=50 | 76.0% [62.6%, 85.7%] n=50 |
| S-CON | 28.0% [17.5%, 41.7%] n=50 | 14.0% [7.0%, 26.2%] n=50 | 50.0% [36.6%, 63.4%] n=50 | 52.0% [38.5%, 65.2%] n=50 |
| S-ADAPT | 58.0% [44.2%, 70.6%] n=50 | 92.0% [81.2%, 96.8%] n=50 | 48.0% [34.8%, 61.5%] n=50 | 22.0% [12.8%, 35.2%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 53.3% [49.0%, 57.0%] over 16 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-POL | -3.8 (-16 / -7 / 13) | 0/1 | 1/1 | 0/0 |
| S-POL vs P-EXP | -6.5 (-22 / -7 / 7) | 1/2 | 1/2 | 0/0 |
| S-POL vs P-SURV | 4.4 (-8 / 6 / 16) | 0/0 | 1/0 | 0/0 |
| S-POL vs P-ADAPT | -2.4 (-20 / -3 / 15) | 0/2 | 2/2 | 0/0 |
| S-MIL vs P-POL | 5.9 (-8 / 8 / 16) | 0/0 | 1/0 | 0/0 |
| S-MIL vs P-EXP | 2.6 (-18 / 6 / 19) | 1/0 | 2/0 | 0/0 |
| S-MIL vs P-SURV | 11.0 (3 / 12 / 20) | 2/0 | 3/0 | 0/0 |
| S-MIL vs P-ADAPT | 9.3 (-5 / 11 / 24) | 5/1 | 8/1 | 0/0 |
| S-CON vs P-POL | -5.4 (-19 / -7 / 9) | 0/2 | 0/2 | 0/0 |
| S-CON vs P-EXP | -9.8 (-21 / -11 / 2) | 0/1 | 0/1 | 0/0 |
| S-CON vs P-SURV | -1.2 (-13 / 0 / 8) | 0/0 | 1/0 | 0/0 |
| S-CON vs P-ADAPT | 2.2 (-15 / 2 / 17) | 0/1 | 0/1 | 0/0 |
| S-ADAPT vs P-POL | 3.5 (-14 / 4 / 20) | 2/0 | 3/0 | 0/0 |
| S-ADAPT vs P-EXP | 15.6 (1 / 18 / 24) | 0/0 | 4/0 | 0/0 |
| S-ADAPT vs P-SURV | -1.6 (-20 / -1 / 14) | 4/5 | 5/6 | 0/0 |
| S-ADAPT vs P-ADAPT | -5.6 (-16 / -6 / 8) | 1/2 | 2/2 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (no-syria-march): State 92.0%
- S-CON@1 vs P-EXP@2 (no-syria-march): State 14.0%
- S-ADAPT@1 vs P-EXP@2 (no-syria-march): State 92.0%
- S-MIL@1 vs P-SURV@2 (no-syria-march): median margin difference 12.0
- S-MIL@1 vs P-ADAPT@2 (no-syria-march): median margin difference 10.5
- S-CON@1 vs P-EXP@2 (no-syria-march): median margin difference -11.0
- S-ADAPT@1 vs P-EXP@2 (no-syria-march): median margin difference 18.0

## Condition neither

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 28.0% [17.5%, 41.7%] n=50 | 22.0% [12.8%, 35.2%] n=50 | 60.0% [46.2%, 72.4%] n=50 | 30.0% [19.1%, 43.8%] n=50 |
| S-MIL | 74.0% [60.4%, 84.1%] n=50 | 58.0% [44.2%, 70.6%] n=50 | 92.0% [81.2%, 96.8%] n=50 | 84.0% [71.5%, 91.7%] n=50 |
| S-CON | 22.0% [12.8%, 35.2%] n=50 | 16.0% [8.3%, 28.5%] n=50 | 36.0% [24.1%, 49.9%] n=50 | 60.0% [46.2%, 72.4%] n=50 |
| S-ADAPT | 58.0% [44.2%, 70.6%] n=50 | 96.0% [86.5%, 98.9%] n=50 | 48.0% [34.8%, 61.5%] n=50 | 26.0% [15.9%, 39.6%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 50.6% [46.6%, 54.6%] over 16 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-POL | -6.4 (-21 / -9 / 9) | 0/1 | 0/1 | 0/0 |
| S-POL vs P-EXP | -6.6 (-21 / -8 / 14) | 0/1 | 1/1 | 0/0 |
| S-POL vs P-SURV | 3.0 (-10 / 3 / 17) | 1/0 | 1/0 | 0/0 |
| S-POL vs P-ADAPT | -2.9 (-19 / -4 / 17) | 1/2 | 3/2 | 0/0 |
| S-MIL vs P-POL | 6.1 (-8 / 8 / 18) | 0/0 | 1/0 | 0/0 |
| S-MIL vs P-EXP | 2.2 (-16 / 4 / 17) | 2/0 | 3/0 | 0/0 |
| S-MIL vs P-SURV | 10.9 (2 / 11 / 22) | 2/0 | 3/0 | 0/0 |
| S-MIL vs P-ADAPT | 12.0 (-3 / 14 / 25) | 8/0 | 10/0 | 0/0 |
| S-CON vs P-POL | -6.3 (-19 / -7 / 5) | 0/2 | 0/2 | 0/0 |
| S-CON vs P-EXP | -9.2 (-20 / -11 / 4) | 0/1 | 0/1 | 0/0 |
| S-CON vs P-SURV | -3.1 (-17 / -2 / 6) | 0/1 | 0/1 | 0/0 |
| S-CON vs P-ADAPT | 3.5 (-20 / 4 / 21) | 1/1 | 3/1 | 0/0 |
| S-ADAPT vs P-POL | 5.6 (-13 / 6 / 22) | 4/0 | 6/0 | 0/0 |
| S-ADAPT vs P-EXP | 17.1 (10 / 18 / 24) | 3/0 | 6/0 | 0/0 |
| S-ADAPT vs P-SURV | -3.4 (-21 / -2 / 10) | 1/2 | 1/3 | 0/0 |
| S-ADAPT vs P-ADAPT | -3.6 (-15 / -6 / 11) | 1/0 | 2/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (neither): State 92.0%
- S-MIL@1 vs P-ADAPT@2 (neither): State 84.0%
- S-CON@1 vs P-EXP@2 (neither): State 16.0%
- S-ADAPT@1 vs P-EXP@2 (neither): State 96.0%
- S-MIL@1 vs P-SURV@2 (neither): median margin difference 11.0
- S-MIL@1 vs P-ADAPT@2 (neither): median margin difference 13.5
- S-CON@1 vs P-EXP@2 (neither): median margin difference -10.5
- S-ADAPT@1 vs P-EXP@2 (neither): median margin difference 18.0

## Scoring routes

Mean final components over 2400 completed games: State Support 23.7 + Legitimacy 10.0; PKK Opposition 12.0 + domestic Bases 1.6.
State winners (1242): Support 29.6, Legitimacy 9.9. PKK winners (1158): Opposition 16.4, Bases 2.5.

## Review selection

Closest: neither~S-ADAPTv1~P-ADAPTv2~1000745~r0, neither~S-ADAPTv1~P-POLv2~1000749~r0, neither~S-ADAPTv1~P-SURVv2~1000734~r0, neither~S-CONv1~P-ADAPTv2~1000704~r0, neither~S-CONv1~P-ADAPTv2~1000713~r0

Largest gaps: no-hot-pursuit~S-ADAPTv1~P-ADAPTv2~1000713~r0, neither~S-POLv1~P-POLv2~1000717~r0, no-syria-march~S-ADAPTv1~P-ADAPTv2~1000713~r0, neither~S-POLv1~P-ADAPTv2~1000710~r0, neither~S-POLv1~P-ADAPTv2~1000734~r0

Seeded random: neither~S-MILv1~P-ADAPTv2~1000722~r0, no-hot-pursuit~S-CONv1~P-EXPv2~1000726~r0, no-hot-pursuit~S-POLv1~P-SURVv2~1000716~r0, neither~S-CONv1~P-EXPv2~1000705~r0, no-hot-pursuit~S-MILv1~P-EXPv2~1000714~r0

Failures: none

## Coverage ledger

51 natural, 17 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 2400 |
| Win at the opening check | Victory | natural exposure | 99 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 2251 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 66 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 2303 |
| Train Civic Action | Political economy | natural exposure | 2398 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 2369 |
| Propaganda Agitation spending | Political economy | natural exposure | 2037 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 488 |
| State Harm placed | Civilian effects | natural exposure | 813 |
| PKK Harm placed | Civilian effects | natural exposure | 140 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 235 |
| Coerce places Coercion | Civilian effects | natural exposure | 682 |
| Guard upkeep paid | Civilian effects | natural exposure | 1278 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 193 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 59 |
| Strike Collaborators | Civilian effects | reviewed fixture | 0 |
| Europe track change | Civilian effects | natural exposure | 1205 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 504 |
| Reception marker placed | Civilian effects | natural exposure | 20 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 2400 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 2400 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 114 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| puk posture reaches restricted | Sanctuary | natural exposure | 7 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 24 |
| Diplomacy | Sanctuary | natural exposure | 44 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 2400 |
| Unshaded Event executed | Sequence/cards | natural exposure | 2087 |
| Shaded Event executed | Sequence/cards | natural exposure | 2301 |
| ARGK played | Sequence/cards | natural exposure | 1353 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 2400 |
| Limited Op | Sequence/cards | natural exposure | 2400 |
| Op Only | Sequence/cards | natural exposure | 2400 |
| Op + SA | Sequence/cards | natural exposure | 2400 |
| Redeploy with moves | Sequence/cards | natural exposure | 387 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 2400 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 2301 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 2398 |
| Operation state.garrison | Sequence/cards | natural exposure | 2309 |
| Operation state.sweep | Sequence/cards | natural exposure | 1465 |
| Operation state.assault | Sequence/cards | natural exposure | 2400 |
| Operation pkk.rally | Sequence/cards | natural exposure | 2400 |
| Operation pkk.march | Sequence/cards | natural exposure | 2400 |
| Operation pkk.attack | Sequence/cards | natural exposure | 733 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 682 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 2400 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 157 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 2400 |

## Diagnostics

Pass share: State 38.7%, PKK 17.0%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 4.4, PKK 1.0. Games with a 3-Pass streak: {"state":1415,"pkk":418}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":13921,"opSa":10464,"event":4853,"pass":20258,"opOnly":2872},"pkk":{"opOnly":7265,"limitedOp":11203,"opSa":16308,"pass":8686,"event":7553}}

