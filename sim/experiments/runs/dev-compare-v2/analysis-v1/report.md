# Experiment dev-compare-v2 (development)

Experiment hash `49dd3cedc9f22c93bf4dec19276acf7b5e3b21635ebfc5722286af5b5341c18b`. Analysis version 1.

## Completion

Scheduled 640 games: complete 640. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|---|---|---|---|
| S-POL | 50.0% [29.9%, 70.1%] n=20 | 55.0% [34.2%, 74.2%] n=20 | 75.0% [53.1%, 88.8%] n=20 | 70.0% [48.1%, 85.5%] n=20 |  |  |  |  |
| S-MIL | 55.0% [34.2%, 74.2%] n=20 | 65.0% [43.3%, 81.9%] n=20 | 80.0% [58.4%, 91.9%] n=20 | 100.0% [83.9%, 100.0%] n=20 |  |  |  |  |
| S-CON | 10.0% [2.8%, 30.1%] n=20 | 5.0% [0.9%, 23.6%] n=20 | 45.0% [25.8%, 65.8%] n=20 | 80.0% [58.4%, 91.9%] n=20 |  |  |  |  |
| S-ADAPT | 60.0% [38.7%, 78.1%] n=20 | 10.0% [2.8%, 30.1%] n=20 | 40.0% [21.9%, 61.3%] n=20 | 25.0% [11.2%, 46.9%] n=20 |  |  |  |  |
| S-POL |  |  |  |  | 15.0% [5.2%, 36.0%] n=20 | 35.0% [18.1%, 56.7%] n=20 | 80.0% [58.4%, 91.9%] n=20 | 30.0% [14.5%, 51.9%] n=20 |
| S-MIL |  |  |  |  | 75.0% [53.1%, 88.8%] n=20 | 70.0% [48.1%, 85.5%] n=20 | 75.0% [53.1%, 88.8%] n=20 | 100.0% [83.9%, 100.0%] n=20 |
| S-CON |  |  |  |  | 15.0% [5.2%, 36.0%] n=20 | 15.0% [5.2%, 36.0%] n=20 | 30.0% [14.5%, 51.9%] n=20 | 65.0% [43.3%, 81.9%] n=20 |
| S-ADAPT |  |  |  |  | 45.0% [25.8%, 65.8%] n=20 | 80.0% [58.4%, 91.9%] n=20 | 20.0% [8.1%, 41.6%] n=20 | 40.0% [21.9%, 61.3%] n=20 |

Equal-weight roster average (this roster only, not a human win probability): State 50.5% [46.9%, 54.7%] over 32 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-POL | 3.0 (-10 / 1 / 20) | 1/0 | 1/0 | 0/0 |
| S-POL vs P-EXP | 1.9 (-12 / 2 / 13) | 0/0 | 1/0 | 0/0 |
| S-POL vs P-SURV | 8.3 (-9 / 11 / 22) | 4/0 | 5/0 | 0/0 |
| S-POL vs P-ADAPT | 14.4 (-9 / 24 / 28) | 9/1 | 12/1 | 0/0 |
| S-MIL vs P-POL | 1.5 (-8 / 1 / 15) | 0/0 | 0/0 | 0/0 |
| S-MIL vs P-EXP | 5.8 (-12 / 9 / 23) | 1/0 | 2/0 | 0/0 |
| S-MIL vs P-SURV | 9.7 (-11 / 13 / 20) | 1/0 | 1/0 | 0/0 |
| S-MIL vs P-ADAPT | 18.6 (8 / 20 / 29) | 9/0 | 10/0 | 0/0 |
| S-CON vs P-POL | -9.4 (-17 / -11 / -1) | 0/0 | 0/0 | 0/0 |
| S-CON vs P-EXP | -13.8 (-24 / -14 / -6) | 0/2 | 0/2 | 0/0 |
| S-CON vs P-SURV | 0.5 (-6 / 0 / 11) | 1/0 | 1/0 | 0/0 |
| S-CON vs P-ADAPT | 14.1 (-6 / 16 / 26) | 6/0 | 8/0 | 0/0 |
| S-ADAPT vs P-POL | 1.4 (-21 / 2 / 21) | 1/0 | 2/0 | 0/0 |
| S-ADAPT vs P-EXP | -16.9 (-29 / -19 / -1) | 0/3 | 0/3 | 0/0 |
| S-ADAPT vs P-SURV | -4.5 (-19 / -7 / 15) | 0/1 | 0/2 | 0/0 |
| S-ADAPT vs P-ADAPT | -7.0 (-27 / -9 / 15) | 1/1 | 1/3 | 0/0 |
| S-POL vs P-POL | -8.1 (-21 / -8 / 10) | 0/0 | 0/1 | 0/0 |
| S-POL vs P-EXP | -5.1 (-21 / -8 / 14) | 0/1 | 1/1 | 0/0 |
| S-POL vs P-SURV | 7.4 (-4 / 7 / 19) | 1/0 | 1/0 | 0/0 |
| S-POL vs P-ADAPT | -1.8 (-12 / -5 / 15) | 0/0 | 0/0 | 0/0 |
| S-MIL vs P-POL | 5.3 (-7 / 5 / 17) | 0/0 | 1/0 | 0/0 |
| S-MIL vs P-EXP | 9.4 (-5 / 13 / 19) | 1/0 | 2/0 | 0/0 |
| S-MIL vs P-SURV | 9.1 (-15 / 14 / 20) | 1/0 | 2/0 | 0/0 |
| S-MIL vs P-ADAPT | 16.8 (7 / 18 / 25) | 4/0 | 5/0 | 0/0 |
| S-CON vs P-POL | -9.7 (-20 / -10 / 6) | 0/1 | 0/1 | 0/0 |
| S-CON vs P-EXP | -9.2 (-17 / -12 / 7) | 0/0 | 0/0 | 0/0 |
| S-CON vs P-SURV | -2.8 (-11 / -2 / 3) | 0/0 | 0/0 | 0/0 |
| S-CON vs P-ADAPT | -0.3 (-27 / 2 / 19) | 1/1 | 1/1 | 0/0 |
| S-ADAPT vs P-POL | 2.0 (-15 / -2 / 23) | 3/0 | 4/0 | 0/0 |
| S-ADAPT vs P-EXP | 11.9 (-7 / 15 / 26) | 2/0 | 3/0 | 0/0 |
| S-ADAPT vs P-SURV | -5.0 (-23 / -5 / 16) | 2/1 | 2/1 | 0/0 |
| S-ADAPT vs P-ADAPT | -3.0 (-16 / -4 / 12) | 0/1 | 0/1 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@2 vs P-SURV@1 (baseline): State 80.0%
- S-MIL@2 vs P-ADAPT@1 (baseline): State 100.0%
- S-CON@2 vs P-POL@1 (baseline): State 10.0%
- S-CON@2 vs P-EXP@1 (baseline): State 5.0%
- S-CON@2 vs P-ADAPT@1 (baseline): State 80.0%
- S-ADAPT@2 vs P-EXP@1 (baseline): State 10.0%
- S-POL@1 vs P-POL@2 (baseline): State 15.0%
- S-POL@1 vs P-SURV@2 (baseline): State 80.0%
- S-MIL@1 vs P-ADAPT@2 (baseline): State 100.0%
- S-CON@1 vs P-POL@2 (baseline): State 15.0%
- S-CON@1 vs P-EXP@2 (baseline): State 15.0%
- S-ADAPT@1 vs P-EXP@2 (baseline): State 80.0%
- S-ADAPT@1 vs P-SURV@2 (baseline): State 20.0%
- S-POL@2 vs P-SURV@1 (baseline): median margin difference 11.0
- S-POL@2 vs P-ADAPT@1 (baseline): median margin difference 23.5
- S-MIL@2 vs P-SURV@1 (baseline): median margin difference 12.5
- S-MIL@2 vs P-ADAPT@1 (baseline): median margin difference 20.0
- S-CON@2 vs P-POL@1 (baseline): median margin difference -10.5
- S-CON@2 vs P-EXP@1 (baseline): median margin difference -13.5
- S-CON@2 vs P-ADAPT@1 (baseline): median margin difference 16.0
- S-ADAPT@2 vs P-EXP@1 (baseline): median margin difference -19.0
- S-MIL@1 vs P-EXP@2 (baseline): median margin difference 13.0
- S-MIL@1 vs P-SURV@2 (baseline): median margin difference 14.0
- S-MIL@1 vs P-ADAPT@2 (baseline): median margin difference 17.5
- S-CON@1 vs P-POL@2 (baseline): median margin difference -10.0
- S-CON@1 vs P-EXP@2 (baseline): median margin difference -12.0
- S-ADAPT@1 vs P-EXP@2 (baseline): median margin difference 14.5

## Scoring routes

Mean final components over 640 completed games: State Support 24.2 + Legitimacy 10.6; PKK Opposition 12.7 + domestic Bases 1.7.
State winners (323): Support 30.8, Legitimacy 10.6. PKK winners (317): Opposition 17.7, Bases 2.6.

## Review selection

Closest: baseline~S-ADAPTv1~P-ADAPTv2~1020~r0, baseline~S-ADAPTv1~P-EXPv2~1016~r0, baseline~S-ADAPTv1~P-SURVv2~1011~r0, baseline~S-CONv1~P-SURVv2~1011~r0, baseline~S-CONv1~P-SURVv2~1013~r0

Largest gaps: baseline~S-ADAPTv2~P-EXPv1~1012~r0, baseline~S-ADAPTv2~P-ADAPTv1~1019~r0, baseline~S-ADAPTv2~P-SURVv1~1009~r0, baseline~S-POLv1~P-EXPv2~1010~r0, baseline~S-ADAPTv2~P-ADAPTv1~1009~r0

Seeded random: baseline~S-CONv2~P-POLv1~1001~r0, baseline~S-ADAPTv1~P-ADAPTv2~1018~r0, baseline~S-ADAPTv1~P-EXPv2~1017~r0, baseline~S-ADAPTv2~P-EXPv1~1001~r0, baseline~S-CONv1~P-POLv2~1008~r0

Failures: none

## Coverage ledger

53 natural, 15 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 640 |
| Win at the opening check | Victory | natural exposure | 62 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 557 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 16 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 611 |
| Train Civic Action | Political economy | natural exposure | 640 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 624 |
| Propaganda Agitation spending | Political economy | natural exposure | 551 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 91 |
| State Harm placed | Civilian effects | natural exposure | 166 |
| PKK Harm placed | Civilian effects | natural exposure | 82 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 97 |
| Coerce places Coercion | Civilian effects | natural exposure | 166 |
| Guard upkeep paid | Civilian effects | natural exposure | 426 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 104 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 41 |
| Strike Collaborators | Civilian effects | reviewed fixture | 0 |
| Europe track change | Civilian effects | natural exposure | 392 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 113 |
| Reception marker placed | Civilian effects | natural exposure | 8 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 640 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 640 |
| syria posture reaches restricted | Sanctuary | natural exposure | 1 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 640 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 640 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 13 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 640 |
| puk posture reaches restricted | Sanctuary | natural exposure | 2 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 45 |
| Diplomacy | Sanctuary | natural exposure | 24 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | natural exposure | 70 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 640 |
| Unshaded Event executed | Sequence/cards | natural exposure | 570 |
| Shaded Event executed | Sequence/cards | natural exposure | 606 |
| ARGK played | Sequence/cards | natural exposure | 349 |
| ARGK declined | Sequence/cards | natural exposure | 2 |
| Pass | Sequence/cards | natural exposure | 640 |
| Limited Op | Sequence/cards | natural exposure | 640 |
| Op Only | Sequence/cards | natural exposure | 640 |
| Op + SA | Sequence/cards | natural exposure | 640 |
| Redeploy with moves | Sequence/cards | natural exposure | 119 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 640 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 578 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 640 |
| Operation state.garrison | Sequence/cards | natural exposure | 571 |
| Operation state.sweep | Sequence/cards | natural exposure | 334 |
| Operation state.assault | Sequence/cards | natural exposure | 640 |
| Operation pkk.rally | Sequence/cards | natural exposure | 640 |
| Operation pkk.march | Sequence/cards | natural exposure | 640 |
| Operation pkk.attack | Sequence/cards | natural exposure | 179 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 166 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 640 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 20 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 640 |

## Diagnostics

Pass share: State 37.4%, PKK 17.0%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 2.3, PKK 1.1. Games with a 3-Pass streak: {"pkk":87,"state":326}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":3875,"opSa":2752,"pass":5331,"opOnly":795,"event":1487},"pkk":{"opOnly":1983,"limitedOp":3066,"opSa":4549,"pass":2364,"event":1929}}

