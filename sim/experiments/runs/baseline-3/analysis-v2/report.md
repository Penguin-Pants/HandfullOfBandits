# Experiment baseline-3 (baseline)

Experiment hash `6f62222618707f7ff9f85adff296f1e0374eb31ada7e40df1895869765392dfe`. Analysis version 2.

## Completion

Scheduled 3520 games: complete 3520. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 36.0% [29.7%, 42.9%] n=200 | 25.0% [19.5%, 31.4%] n=200 | 66.0% [59.2%, 72.2%] n=200 | 65.5% [58.7%, 71.7%] n=200 |
| S-MIL@1 | 66.5% [59.7%, 72.7%] n=200 | 53.5% [46.6%, 60.3%] n=200 | 89.5% [84.5%, 93.0%] n=200 | 76.0% [69.6%, 81.4%] n=200 |
| S-CON@1 | 24.0% [18.6%, 30.4%] n=200 | 17.5% [12.9%, 23.4%] n=200 | 37.5% [31.1%, 44.4%] n=200 | 80.5% [74.5%, 85.4%] n=200 |
| S-ADAPT@1 | 38.5% [32.0%, 45.4%] n=200 | 33.0% [26.9%, 39.8%] n=200 | 34.0% [27.8%, 40.8%] n=200 | 95.5% [91.7%, 97.6%] n=200 |

Player-seed sensitivity: the winner changed in 42 of 160 repeated seed groups.

Equal-weight roster average (this roster only, not a human win probability): State 52.2% [50.3%, 54.1%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -4.8 (-21 / -6 / 14) | 2/4 | 3/7 | 0/0 |
| S-POL@1 vs P-EXP@2 | -7.3 (-22 / -8 / 9) | 3/6 | 4/7 | 0/0 |
| S-POL@1 vs P-SURV@2 | 4.2 (-9 / 5 / 16) | 1/0 | 4/1 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 6.4 (-9 / 6 / 21) | 16/0 | 36/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 4.3 (-11 / 6 / 18) | 2/0 | 5/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 0.9 (-14 / 2 / 15) | 1/0 | 3/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 11.9 (1 / 13 / 22) | 9/1 | 14/1 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 7.9 (-11 / 9 / 23) | 11/0 | 26/0 | 0/0 |
| S-CON@1 vs P-POL@2 | -5.7 (-19 / -6 / 9) | 1/5 | 1/6 | 0/0 |
| S-CON@1 vs P-EXP@2 | -8.4 (-19 / -9 / 3) | 0/7 | 0/12 | 0/0 |
| S-CON@1 vs P-SURV@2 | -2.6 (-13 / -2 / 8) | 5/3 | 6/4 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 11.3 (-6 / 13 / 25) | 15/0 | 34/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -4.5 (-19 / -5 / 13) | 1/4 | 1/7 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -5.2 (-20 / -6 / 12) | 1/2 | 1/8 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -4.4 (-19 / -4 / 9) | 0/6 | 0/12 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 24.4 (13 / 26 / 34) | 141/0 | 159/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (baseline): State 89.5%
- S-CON@1 vs P-EXP@2 (baseline): State 17.5%
- S-CON@1 vs P-ADAPT@2 (baseline): State 80.5%
- S-ADAPT@1 vs P-ADAPT@2 (baseline): State 95.5%
- S-MIL@1 vs P-SURV@2 (baseline): median margin difference 13.0
- S-CON@1 vs P-ADAPT@2 (baseline): median margin difference 13.0
- S-ADAPT@1 vs P-ADAPT@2 (baseline): median margin difference 26.0

## Scoring routes

Mean final components over 3520 completed games: State Support 23.9 + Legitimacy 10.1; PKK Opposition 11.7 + domestic Bases 1.5.
State winners (1836): Support 30.2, Legitimacy 10.1. PKK winners (1684): Opposition 16.2, Bases 2.3.

## Review selection

Closest: baseline~S-ADAPTv1~P-ADAPTv2~1001073~r0, baseline~S-ADAPTv1~P-EXPv2~1001000~r1, baseline~S-ADAPTv1~P-EXPv2~1001014~r0, baseline~S-ADAPTv1~P-EXPv2~1001036~r0, baseline~S-ADAPTv1~P-EXPv2~1001042~r0

Largest gaps: baseline~S-ADAPTv1~P-POLv2~1001084~r0, baseline~S-ADAPTv1~P-ADAPTv2~1001136~r0, baseline~S-ADAPTv1~P-ADAPTv2~1001084~r0, baseline~S-ADAPTv1~P-ADAPTv2~1001095~r0, baseline~S-ADAPTv1~P-ADAPTv2~1001187~r0

Seeded random: baseline~S-MILv1~P-SURVv2~1001115~r0, baseline~S-ADAPTv1~P-POLv2~1001050~r0, baseline~S-ADAPTv1~P-EXPv2~1001156~r0, baseline~S-CONv1~P-SURVv2~1001056~r0, baseline~S-POLv1~P-EXPv2~1001128~r0

Failures: none

## Coverage ledger

54 natural, 14 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 3520 |
| Win at the opening check | Victory | natural exposure | 247 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 3158 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 102 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 3417 |
| Train Civic Action | Political economy | natural exposure | 3520 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 3468 |
| Propaganda Agitation spending | Political economy | natural exposure | 2939 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 527 |
| State Harm placed | Civilian effects | natural exposure | 1177 |
| PKK Harm placed | Civilian effects | natural exposure | 299 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 372 |
| Coerce places Coercion | Civilian effects | natural exposure | 884 |
| Guard upkeep paid | Civilian effects | natural exposure | 1866 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 288 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 79 |
| Strike Collaborators | Civilian effects | natural exposure | 8 |
| Europe track change | Civilian effects | natural exposure | 2013 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 581 |
| Reception marker placed | Civilian effects | natural exposure | 40 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 3520 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| syria posture reaches restricted | Sanctuary | natural exposure | 2 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 3520 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 206 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 1 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| puk posture reaches restricted | Sanctuary | natural exposure | 1 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 480 |
| Diplomacy | Sanctuary | natural exposure | 62 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 6 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 3520 |
| Unshaded Event executed | Sequence/cards | natural exposure | 3124 |
| Shaded Event executed | Sequence/cards | natural exposure | 3371 |
| ARGK played | Sequence/cards | natural exposure | 1848 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 3520 |
| Limited Op | Sequence/cards | natural exposure | 3520 |
| Op Only | Sequence/cards | natural exposure | 3520 |
| Op + SA | Sequence/cards | natural exposure | 3520 |
| Redeploy with moves | Sequence/cards | natural exposure | 549 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 3520 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 3273 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 3520 |
| Operation state.garrison | Sequence/cards | natural exposure | 3197 |
| Operation state.sweep | Sequence/cards | natural exposure | 2201 |
| Operation state.assault | Sequence/cards | natural exposure | 3520 |
| Operation pkk.rally | Sequence/cards | natural exposure | 3520 |
| Operation pkk.march | Sequence/cards | natural exposure | 3520 |
| Operation pkk.attack | Sequence/cards | natural exposure | 788 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 884 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 3520 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 100 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 3519 |

## Diagnostics

Pass share: State 39.2%, PKK 17.8%. Longest First Eligible streak: 21 cards. Mean unused Resources at the end: State 4.7, PKK 1.2. Games with a 3-Pass streak: {"state":2169,"pkk":689}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":19861,"opSa":16060,"event":7331,"pass":30474,"opOnly":3922},"pkk":{"opOnly":9682,"limitedOp":16912,"opSa":23993,"event":11722,"pass":13491}}

