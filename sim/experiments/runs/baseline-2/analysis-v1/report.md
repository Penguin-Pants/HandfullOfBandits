# Experiment baseline-2 (baseline)

Experiment hash `64a93f0f34b9badc2ef1143825be557b8b034ebd5aba8b839d82df99c0f9fb3f`. Analysis version 1.

## Completion

Scheduled 3520 games: complete 3520. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 35.0% [29.0%, 41.5%] n=220 | 28.6% [23.1%, 34.9%] n=220 | 69.5% [63.2%, 75.2%] n=220 | 38.2% [32.0%, 44.8%] n=220 |
| S-MIL | 74.1% [67.9%, 79.4%] n=220 | 60.5% [53.9%, 66.7%] n=220 | 90.5% [85.8%, 93.7%] n=220 | 83.6% [78.2%, 87.9%] n=220 |
| S-CON | 21.8% [16.9%, 27.7%] n=220 | 13.2% [9.3%, 18.3%] n=220 | 40.5% [34.2%, 47.1%] n=220 | 69.1% [62.7%, 74.8%] n=220 |
| S-ADAPT | 61.4% [54.8%, 67.6%] n=220 | 90.0% [85.3%, 93.3%] n=220 | 45.0% [38.6%, 51.6%] n=220 | 38.2% [32.0%, 44.8%] n=220 |

Equal-weight roster average (this roster only, not a human win probability): State 53.7% [51.4%, 55.9%] over 16 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-POL | -4.1 (-21 / -4 / 14) | 2/4 | 3/6 | 0/0 |
| S-POL vs P-EXP | -7.1 (-23 / -9 / 11) | 0/9 | 2/11 | 0/0 |
| S-POL vs P-SURV | 4.8 (-8 / 5 / 16) | 3/0 | 8/0 | 0/0 |
| S-POL vs P-ADAPT | -3.9 (-19 / -5 / 15) | 3/4 | 11/8 | 0/0 |
| S-MIL vs P-POL | 6.2 (-10 / 8 / 18) | 1/1 | 2/1 | 0/0 |
| S-MIL vs P-EXP | 2.1 (-14 / 3 / 16) | 2/0 | 3/1 | 0/0 |
| S-MIL vs P-SURV | 11.7 (1 / 13 / 22) | 5/0 | 12/0 | 0/0 |
| S-MIL vs P-ADAPT | 12.4 (-4 / 13 / 26) | 35/0 | 47/0 | 0/0 |
| S-CON vs P-POL | -6.0 (-21 / -6 / 6) | 1/9 | 2/12 | 0/0 |
| S-CON vs P-EXP | -9.5 (-20 / -10 / 1) | 0/10 | 0/15 | 0/0 |
| S-CON vs P-SURV | -2.9 (-15 / -2 / 9) | 3/3 | 4/5 | 0/0 |
| S-CON vs P-ADAPT | 6.9 (-12 / 7 / 25) | 11/1 | 25/3 | 0/0 |
| S-ADAPT vs P-POL | 3.9 (-15 / 5 / 22) | 10/3 | 22/5 | 0/0 |
| S-ADAPT vs P-EXP | 16.2 (0 / 19 / 26) | 15/1 | 35/1 | 0/0 |
| S-ADAPT vs P-SURV | -2.5 (-20 / -1 / 13) | 6/6 | 6/14 | 0/0 |
| S-ADAPT vs P-ADAPT | -4.3 (-19 / -3 / 10) | 0/7 | 2/11 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (baseline): State 90.5%
- S-MIL@1 vs P-ADAPT@2 (baseline): State 83.6%
- S-CON@1 vs P-EXP@2 (baseline): State 13.2%
- S-ADAPT@1 vs P-EXP@2 (baseline): State 90.0%
- S-MIL@1 vs P-SURV@2 (baseline): median margin difference 13.0
- S-MIL@1 vs P-ADAPT@2 (baseline): median margin difference 13.0
- S-CON@1 vs P-EXP@2 (baseline): median margin difference -10.0
- S-ADAPT@1 vs P-EXP@2 (baseline): median margin difference 19.0

## Scoring routes

Mean final components over 3520 completed games: State Support 23.9 + Legitimacy 10.2; PKK Opposition 12.0 + domestic Bases 1.6.
State winners (1890): Support 29.7, Legitimacy 10.1. PKK winners (1630): Opposition 16.6, Bases 2.5.

## Review selection

Closest: baseline~S-ADAPTv1~P-ADAPTv2~1000504~r0, baseline~S-ADAPTv1~P-ADAPTv2~1000540~r0, baseline~S-ADAPTv1~P-ADAPTv2~1000543~r0, baseline~S-ADAPTv1~P-ADAPTv2~1000557~r0, baseline~S-ADAPTv1~P-ADAPTv2~1000615~r0

Largest gaps: baseline~S-MILv1~P-ADAPTv2~1000617~r0, baseline~S-ADAPTv1~P-SURVv2~1000508~r1, baseline~S-ADAPTv1~P-EXPv2~1000503~r2, baseline~S-MILv1~P-POLv2~1000698~r0, baseline~S-POLv1~P-ADAPTv2~1000601~r0

Seeded random: baseline~S-MILv1~P-SURVv2~1000615~r0, baseline~S-ADAPTv1~P-POLv2~1000550~r0, baseline~S-ADAPTv1~P-EXPv2~1000656~r0, baseline~S-CONv1~P-SURVv2~1000556~r0, baseline~S-POLv1~P-EXPv2~1000628~r0

Failures: none

## Coverage ledger

52 natural, 16 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 3520 |
| Win at the opening check | Victory | natural exposure | 155 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 3243 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 92 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 3366 |
| Train Civic Action | Political economy | natural exposure | 3514 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 3480 |
| Propaganda Agitation spending | Political economy | natural exposure | 2984 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 559 |
| State Harm placed | Civilian effects | natural exposure | 1041 |
| PKK Harm placed | Civilian effects | natural exposure | 248 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 348 |
| Coerce places Coercion | Civilian effects | natural exposure | 942 |
| Guard upkeep paid | Civilian effects | natural exposure | 1808 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 274 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 82 |
| Strike Collaborators | Civilian effects | natural exposure | 2 |
| Europe track change | Civilian effects | natural exposure | 2006 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 599 |
| Reception marker placed | Civilian effects | natural exposure | 41 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 3520 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 3520 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 157 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| puk posture reaches restricted | Sanctuary | natural exposure | 3 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 33 |
| Diplomacy | Sanctuary | natural exposure | 72 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 2 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 3520 |
| Unshaded Event executed | Sequence/cards | natural exposure | 3062 |
| Shaded Event executed | Sequence/cards | natural exposure | 3350 |
| ARGK played | Sequence/cards | natural exposure | 1952 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 3520 |
| Limited Op | Sequence/cards | natural exposure | 3520 |
| Op Only | Sequence/cards | natural exposure | 3520 |
| Op + SA | Sequence/cards | natural exposure | 3520 |
| Redeploy with moves | Sequence/cards | natural exposure | 540 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 3520 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 3365 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 3516 |
| Operation state.garrison | Sequence/cards | natural exposure | 3349 |
| Operation state.sweep | Sequence/cards | natural exposure | 2224 |
| Operation state.assault | Sequence/cards | natural exposure | 3520 |
| Operation pkk.rally | Sequence/cards | natural exposure | 3520 |
| Operation pkk.march | Sequence/cards | natural exposure | 3520 |
| Operation pkk.attack | Sequence/cards | natural exposure | 1057 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 942 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 3520 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 231 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 3520 |

## Diagnostics

Pass share: State 38.4%, PKK 17.4%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 4.4, PKK 1.0. Games with a 3-Pass streak: {"state":1979,"pkk":608}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":20739,"opSa":15661,"event":7292,"pass":29798,"opOnly":4030},"pkk":{"opOnly":11010,"limitedOp":16717,"opSa":23921,"pass":13178,"event":10742}}

