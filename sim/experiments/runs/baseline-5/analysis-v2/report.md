# Experiment baseline-5 (baseline)

Experiment hash `db6ad04ba44bfbee1e59b7e1fb8475683542af79e2717772b43e8a6ccb10a6bd`. Analysis version 2.

## Completion

Scheduled 3520 games: complete 3520. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 35.0% [28.7%, 41.8%] n=200 | 33.5% [27.3%, 40.3%] n=200 | 75.5% [69.1%, 80.9%] n=200 | 63.5% [56.6%, 69.9%] n=200 |
| S-MIL@1 | 67.0% [60.2%, 73.1%] n=200 | 64.0% [57.1%, 70.3%] n=200 | 93.5% [89.2%, 96.2%] n=200 | 73.5% [67.0%, 79.1%] n=200 |
| S-CON@1 | 31.0% [25.0%, 37.7%] n=200 | 13.0% [9.0%, 18.4%] n=200 | 40.0% [33.5%, 46.9%] n=200 | 81.0% [75.0%, 85.8%] n=200 |
| S-ADAPT@1 | 40.0% [33.5%, 46.9%] n=200 | 41.0% [34.4%, 47.9%] n=200 | 43.0% [36.3%, 49.9%] n=200 | 98.0% [95.0%, 99.2%] n=200 |

Player-seed sensitivity: the winner changed in 34 of 160 repeated seed groups.

Equal-weight roster average (this roster only, not a human win probability): State 55.5% [53.7%, 57.4%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -3.9 (-19 / -4 / 11) | 1/4 | 2/8 | 0/0 |
| S-POL@1 vs P-EXP@2 | -6.7 (-24 / -8 / 11) | 1/11 | 3/18 | 0/0 |
| S-POL@1 vs P-SURV@2 | 5.9 (-4 / 6 / 17) | 0/0 | 2/1 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 4.7 (-9 / 5 / 18) | 11/0 | 14/1 | 0/0 |
| S-MIL@1 vs P-POL@2 | 5.5 (-10 / 7 / 19) | 6/0 | 10/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 3.8 (-12 / 5 / 19) | 1/0 | 5/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 12.7 (2 / 14 / 23) | 6/0 | 16/0 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 8.2 (-9 / 7 / 27) | 27/0 | 38/0 | 0/0 |
| S-CON@1 vs P-POL@2 | -3.9 (-15 / -6 / 12) | 0/1 | 0/3 | 0/0 |
| S-CON@1 vs P-EXP@2 | -9.1 (-20 / -10 / 2) | 0/7 | 0/10 | 0/0 |
| S-CON@1 vs P-SURV@2 | -1.8 (-13 / -2 / 10) | 0/1 | 1/2 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 12.2 (-4 / 13 / 26) | 33/0 | 51/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -4.2 (-20 / -5 / 12) | 1/7 | 4/10 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -2.5 (-18 / -3 / 13) | 1/2 | 4/4 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -3.6 (-18 / -3 / 10) | 1/9 | 1/15 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 24.1 (13 / 26 / 33) | 130/0 | 142/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (baseline): State 93.5%
- S-CON@1 vs P-EXP@2 (baseline): State 13.0%
- S-CON@1 vs P-ADAPT@2 (baseline): State 81.0%
- S-ADAPT@1 vs P-ADAPT@2 (baseline): State 98.0%
- S-MIL@1 vs P-SURV@2 (baseline): median margin difference 14.0
- S-CON@1 vs P-EXP@2 (baseline): median margin difference -10.0
- S-CON@1 vs P-ADAPT@2 (baseline): median margin difference 13.0
- S-ADAPT@1 vs P-ADAPT@2 (baseline): median margin difference 26.0

## Scoring routes

Mean final components over 3520 completed games: State Support 24.5 + Legitimacy 10.2; PKK Opposition 11.6 + domestic Bases 1.5.
State winners (1955): Support 30.1, Legitimacy 10.2. PKK winners (1565): Opposition 16.3, Bases 2.4.

## Review selection

Closest: baseline~S-ADAPTv1~P-ADAPTv2~1002122~r0, baseline~S-ADAPTv1~P-EXPv2~1002004~r1, baseline~S-ADAPTv1~P-EXPv2~1002039~r0, baseline~S-ADAPTv1~P-EXPv2~1002128~r0, baseline~S-ADAPTv1~P-EXPv2~1002195~r0

Largest gaps: baseline~S-ADAPTv1~P-ADAPTv2~1002011~r0, baseline~S-ADAPTv1~P-ADAPTv2~1002054~r0, baseline~S-ADAPTv1~P-ADAPTv2~1002190~r0, baseline~S-ADAPTv1~P-POLv2~1002171~r0, baseline~S-ADAPTv1~P-ADAPTv2~1002082~r0

Seeded random: baseline~S-MILv1~P-SURVv2~1002115~r0, baseline~S-ADAPTv1~P-POLv2~1002050~r0, baseline~S-ADAPTv1~P-EXPv2~1002156~r0, baseline~S-CONv1~P-SURVv2~1002056~r0, baseline~S-POLv1~P-EXPv2~1002128~r0

Failures: none

## Coverage ledger

53 natural, 15 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 3520 |
| Win at the opening check | Victory | natural exposure | 261 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 3155 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 91 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 3443 |
| Train Civic Action | Political economy | natural exposure | 3520 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 3520 |
| Propaganda Agitation spending | Political economy | natural exposure | 2855 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 563 |
| State Harm placed | Civilian effects | natural exposure | 1141 |
| PKK Harm placed | Civilian effects | natural exposure | 276 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 344 |
| Coerce places Coercion | Civilian effects | natural exposure | 955 |
| Guard upkeep paid | Civilian effects | natural exposure | 1863 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 319 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 76 |
| Strike Collaborators | Civilian effects | natural exposure | 7 |
| Europe track change | Civilian effects | natural exposure | 2046 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 594 |
| Reception marker placed | Civilian effects | natural exposure | 42 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 3520 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| syria posture reaches restricted | Sanctuary | natural exposure | 1 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 3520 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 206 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| puk posture reaches restricted | Sanctuary | natural exposure | 3 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 491 |
| Diplomacy | Sanctuary | natural exposure | 72 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 4 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 3520 |
| Unshaded Event executed | Sequence/cards | natural exposure | 3118 |
| Shaded Event executed | Sequence/cards | natural exposure | 3361 |
| ARGK played | Sequence/cards | natural exposure | 1798 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 3520 |
| Limited Op | Sequence/cards | natural exposure | 3520 |
| Op Only | Sequence/cards | natural exposure | 3520 |
| Op + SA | Sequence/cards | natural exposure | 3520 |
| Redeploy with moves | Sequence/cards | natural exposure | 521 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 3520 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 3259 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 3520 |
| Operation state.garrison | Sequence/cards | natural exposure | 3209 |
| Operation state.sweep | Sequence/cards | natural exposure | 2063 |
| Operation state.assault | Sequence/cards | natural exposure | 3520 |
| Operation pkk.rally | Sequence/cards | natural exposure | 3520 |
| Operation pkk.march | Sequence/cards | natural exposure | 3520 |
| Operation pkk.attack | Sequence/cards | natural exposure | 758 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 955 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 3520 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 106 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 3519 |

## Diagnostics

Pass share: State 39.5%, PKK 17.8%. Longest First Eligible streak: 20 cards. Mean unused Resources at the end: State 4.8, PKK 1.3. Games with a 3-Pass streak: {"state":2175,"pkk":669}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":19991,"opSa":15963,"event":7317,"pass":30728,"opOnly":3793},"pkk":{"opOnly":9785,"limitedOp":16835,"opSa":24090,"event":11792,"pass":13492}}

