# Experiment baseline-1 (baseline)

Experiment hash `8b1c2b5cdfba5d0bdface0ef9443f18cff01b073442e795251939aadb6a35c94`. Analysis version 1.

## Completion

Scheduled 3520 games: complete 3520. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 26.4% [21.0%, 32.6%] n=220 | 25.0% [19.7%, 31.1%] n=220 | 66.8% [60.4%, 72.7%] n=220 | 34.1% [28.1%, 40.6%] n=220 |
| S-MIL | 59.1% [52.5%, 65.4%] n=220 | 63.6% [57.1%, 69.7%] n=220 | 82.7% [77.2%, 87.1%] n=220 | 77.3% [71.3%, 82.3%] n=220 |
| S-CON | 15.5% [11.3%, 20.8%] n=220 | 25.0% [19.7%, 31.1%] n=220 | 39.5% [33.3%, 46.1%] n=220 | 66.4% [59.9%, 72.3%] n=220 |
| S-ADAPT | 40.9% [34.6%, 47.5%] n=220 | 83.6% [78.2%, 87.9%] n=220 | 25.5% [20.2%, 31.6%] n=220 | 35.9% [29.9%, 42.4%] n=220 |

Equal-weight roster average (this roster only, not a human win probability): State 48.0% [46.2%, 49.7%] over 16 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-POL | -6.7 (-23 / -9 / 15) | 0/8 | 1/13 | 0/0 |
| S-POL vs P-EXP | -8.7 (-26 / -8 / 9) | 0/14 | 3/17 | 0/0 |
| S-POL vs P-SURV | 3.5 (-11 / 6 / 16) | 2/1 | 4/1 | 0/0 |
| S-POL vs P-ADAPT | -4.2 (-19 / -6 / 12) | 0/3 | 8/6 | 0/0 |
| S-MIL vs P-POL | 1.9 (-14 / 4 / 14) | 2/0 | 2/0 | 0/0 |
| S-MIL vs P-EXP | 3.5 (-13 / 4 / 19) | 4/0 | 7/1 | 0/0 |
| S-MIL vs P-SURV | 8.6 (-4 / 9 / 20) | 11/0 | 14/0 | 0/0 |
| S-MIL vs P-ADAPT | 8.7 (-8 / 10 / 24) | 21/1 | 28/1 | 0/0 |
| S-CON vs P-POL | -9.4 (-20 / -11 / 4) | 0/3 | 0/6 | 0/0 |
| S-CON vs P-EXP | -8.4 (-22 / -10 / 5) | 0/7 | 0/12 | 0/0 |
| S-CON vs P-SURV | -3.3 (-16 / -3 / 7) | 2/4 | 3/8 | 0/0 |
| S-CON vs P-ADAPT | 5.5 (-15 / 7 / 23) | 9/1 | 18/1 | 0/0 |
| S-ADAPT vs P-POL | -1.3 (-19 / -5 / 23) | 24/2 | 31/5 | 0/0 |
| S-ADAPT vs P-EXP | 11.8 (-7 / 15 / 24) | 7/0 | 13/0 | 0/0 |
| S-ADAPT vs P-SURV | -6.5 (-20 / -7 / 6) | 3/10 | 3/20 | 0/0 |
| S-ADAPT vs P-ADAPT | -3.4 (-21 / -5 / 15) | 5/7 | 7/9 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (baseline): State 82.7%
- S-CON@1 vs P-POL@2 (baseline): State 15.5%
- S-ADAPT@1 vs P-EXP@2 (baseline): State 83.6%
- S-MIL@1 vs P-ADAPT@2 (baseline): median margin difference 10.0
- S-CON@1 vs P-POL@2 (baseline): median margin difference -11.0
- S-CON@1 vs P-EXP@2 (baseline): median margin difference -10.0
- S-ADAPT@1 vs P-EXP@2 (baseline): median margin difference 15.0

## Scoring routes

Mean final components over 3520 completed games: State Support 22.9 + Legitimacy 10.2; PKK Opposition 12.9 + domestic Bases 1.7.
State winners (1688): Support 29.2, Legitimacy 10.1. PKK winners (1832): Opposition 17.3, Bases 2.5.

## Review selection

Closest: baseline~S-ADAPTv1~P-ADAPTv2~1000097~r0, baseline~S-ADAPTv1~P-ADAPTv2~1000177~r0, baseline~S-ADAPTv1~P-ADAPTv2~1000182~r0, baseline~S-ADAPTv1~P-ADAPTv2~1000185~r0, baseline~S-ADAPTv1~P-EXPv2~1000017~r0

Largest gaps: baseline~S-CONv1~P-POLv2~1000027~r0, baseline~S-ADAPTv1~P-SURVv2~1000044~r0, baseline~S-ADAPTv1~P-SURVv2~1000169~r0, baseline~S-POLv1~P-ADAPTv2~1000105~r0, baseline~S-ADAPTv1~P-ADAPTv2~1000099~r0

Seeded random: baseline~S-MILv1~P-SURVv2~1000115~r0, baseline~S-ADAPTv1~P-POLv2~1000050~r0, baseline~S-ADAPTv1~P-EXPv2~1000156~r0, baseline~S-CONv1~P-SURVv2~1000056~r0, baseline~S-POLv1~P-EXPv2~1000128~r0

Failures: none

## Coverage ledger

53 natural, 15 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 3520 |
| Win at the opening check | Victory | natural exposure | 151 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 3278 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 89 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 3383 |
| Train Civic Action | Political economy | natural exposure | 3510 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 3464 |
| Propaganda Agitation spending | Political economy | natural exposure | 3081 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 554 |
| State Harm placed | Civilian effects | natural exposure | 1131 |
| PKK Harm placed | Civilian effects | natural exposure | 283 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 421 |
| Coerce places Coercion | Civilian effects | natural exposure | 834 |
| Guard upkeep paid | Civilian effects | natural exposure | 2164 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 421 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 99 |
| Strike Collaborators | Civilian effects | natural exposure | 4 |
| Europe track change | Civilian effects | natural exposure | 2014 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 595 |
| Reception marker placed | Civilian effects | natural exposure | 22 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 3520 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 3520 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 161 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| puk posture reaches restricted | Sanctuary | natural exposure | 3 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 35 |
| Diplomacy | Sanctuary | natural exposure | 78 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 3520 |
| Unshaded Event executed | Sequence/cards | natural exposure | 3108 |
| Shaded Event executed | Sequence/cards | natural exposure | 3366 |
| ARGK played | Sequence/cards | natural exposure | 2081 |
| ARGK declined | Sequence/cards | natural exposure | 1 |
| Pass | Sequence/cards | natural exposure | 3520 |
| Limited Op | Sequence/cards | natural exposure | 3520 |
| Op Only | Sequence/cards | natural exposure | 3520 |
| Op + SA | Sequence/cards | natural exposure | 3520 |
| Redeploy with moves | Sequence/cards | natural exposure | 524 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 3520 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 3369 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 3511 |
| Operation state.garrison | Sequence/cards | natural exposure | 3322 |
| Operation state.sweep | Sequence/cards | natural exposure | 2164 |
| Operation state.assault | Sequence/cards | natural exposure | 3520 |
| Operation pkk.rally | Sequence/cards | natural exposure | 3520 |
| Operation pkk.march | Sequence/cards | natural exposure | 3520 |
| Operation pkk.attack | Sequence/cards | natural exposure | 893 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 834 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 3520 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 63 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 3520 |

## Diagnostics

Pass share: State 38.0%, PKK 17.0%. Longest First Eligible streak: 20 cards. Mean unused Resources at the end: State 4.3, PKK 0.9. Games with a 3-Pass streak: {"state":1997,"pkk":593}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":21163,"opSa":15833,"pass":29626,"event":7521,"opOnly":3809},"pkk":{"opOnly":11157,"limitedOp":16538,"opSa":24720,"event":10559,"pass":12897}}

