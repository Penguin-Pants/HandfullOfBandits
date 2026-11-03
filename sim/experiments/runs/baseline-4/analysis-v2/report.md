# Experiment baseline-4 (baseline)

Experiment hash `961a740a8c1ddac46c136aaf46975945c228fd872e5585ffeb1a8b1935b7c0ac`. Analysis version 2.

## Completion

Scheduled 3520 games: complete 3520. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 40.0% [33.5%, 46.9%] n=200 | 26.5% [20.9%, 33.0%] n=200 | 77.0% [70.7%, 82.3%] n=200 | 69.0% [62.3%, 75.0%] n=200 |
| S-MIL@1 | 84.0% [78.3%, 88.4%] n=200 | 68.5% [61.8%, 74.5%] n=200 | 87.5% [82.2%, 91.4%] n=200 | 74.0% [67.5%, 79.6%] n=200 |
| S-CON@1 | 24.0% [18.6%, 30.4%] n=200 | 14.0% [9.9%, 19.5%] n=200 | 42.5% [35.9%, 49.4%] n=200 | 82.0% [76.1%, 86.7%] n=200 |
| S-ADAPT@1 | 39.0% [32.5%, 45.9%] n=200 | 38.5% [32.0%, 45.4%] n=200 | 33.5% [27.3%, 40.3%] n=200 | 96.0% [92.3%, 98.0%] n=200 |

Player-seed sensitivity: the winner changed in 32 of 160 repeated seed groups.

Equal-weight roster average (this roster only, not a human win probability): State 56.3% [54.4%, 58.3%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -2.7 (-20 / -2 / 15) | 4/5 | 7/14 | 0/0 |
| S-POL@1 vs P-EXP@2 | -6.9 (-23 / -7 / 10) | 1/10 | 3/13 | 0/0 |
| S-POL@1 vs P-SURV@2 | 5.3 (-7 / 6 / 15) | 1/0 | 4/0 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 5.5 (-9 / 5 / 20) | 9/0 | 16/1 | 0/0 |
| S-MIL@1 vs P-POL@2 | 9.8 (-2 / 10 / 22) | 8/0 | 12/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 4.2 (-10 / 5 / 16) | 0/0 | 0/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 12.3 (-1 / 14 / 24) | 3/0 | 12/0 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 8.5 (-10 / 9 / 27) | 25/1 | 42/1 | 0/0 |
| S-CON@1 vs P-POL@2 | -4.3 (-15 / -6 / 7) | 0/2 | 2/2 | 0/0 |
| S-CON@1 vs P-EXP@2 | -8.1 (-18 / -9 / 3) | 0/4 | 1/9 | 0/0 |
| S-CON@1 vs P-SURV@2 | -1.1 (-12 / -1 / 10) | 2/4 | 5/6 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 11.7 (-5 / 13 / 26) | 23/0 | 33/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -3.9 (-20 / -4 / 15) | 2/5 | 2/10 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -2.8 (-18 / -2 / 13) | 2/1 | 2/5 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -3.9 (-18 / -4 / 9) | 2/5 | 3/12 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 23.4 (11 / 26 / 32) | 114/2 | 146/2 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-POL@2 (baseline): State 84.0%
- S-MIL@1 vs P-SURV@2 (baseline): State 87.5%
- S-CON@1 vs P-EXP@2 (baseline): State 14.0%
- S-CON@1 vs P-ADAPT@2 (baseline): State 82.0%
- S-ADAPT@1 vs P-ADAPT@2 (baseline): State 96.0%
- S-MIL@1 vs P-POL@2 (baseline): median margin difference 10.0
- S-MIL@1 vs P-SURV@2 (baseline): median margin difference 14.0
- S-CON@1 vs P-ADAPT@2 (baseline): median margin difference 13.0
- S-ADAPT@1 vs P-ADAPT@2 (baseline): median margin difference 26.0

## Scoring routes

Mean final components over 3520 completed games: State Support 24.6 + Legitimacy 10.3; PKK Opposition 11.4 + domestic Bases 1.5.
State winners (1980): Support 30.0, Legitimacy 10.3. PKK winners (1540): Opposition 16.3, Bases 2.4.

## Review selection

Closest: baseline~S-ADAPTv1~P-EXPv2~1001514~r0, baseline~S-ADAPTv1~P-EXPv2~1001568~r0, baseline~S-ADAPTv1~P-EXPv2~1001605~r0, baseline~S-ADAPTv1~P-EXPv2~1001630~r0, baseline~S-ADAPTv1~P-EXPv2~1001641~r0

Largest gaps: baseline~S-ADAPTv1~P-POLv2~1001680~r0, baseline~S-ADAPTv1~P-ADAPTv2~1001574~r0, baseline~S-ADAPTv1~P-ADAPTv2~1001620~r0, baseline~S-ADAPTv1~P-ADAPTv2~1001636~r0, baseline~S-ADAPTv1~P-ADAPTv2~1001561~r0

Seeded random: baseline~S-MILv1~P-SURVv2~1001615~r0, baseline~S-ADAPTv1~P-POLv2~1001550~r0, baseline~S-ADAPTv1~P-EXPv2~1001656~r0, baseline~S-CONv1~P-SURVv2~1001556~r0, baseline~S-POLv1~P-EXPv2~1001628~r0

Failures: none

## Coverage ledger

56 natural, 12 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 3520 |
| Win at the opening check | Victory | natural exposure | 235 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 3155 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 92 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 3439 |
| Train Civic Action | Political economy | natural exposure | 3520 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 3520 |
| Propaganda Agitation spending | Political economy | natural exposure | 2875 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 591 |
| State Harm placed | Civilian effects | natural exposure | 996 |
| PKK Harm placed | Civilian effects | natural exposure | 277 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 375 |
| Coerce places Coercion | Civilian effects | natural exposure | 932 |
| Guard upkeep paid | Civilian effects | natural exposure | 1894 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 318 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 71 |
| Strike Collaborators | Civilian effects | natural exposure | 4 |
| Europe track change | Civilian effects | natural exposure | 2000 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 645 |
| Reception marker placed | Civilian effects | natural exposure | 42 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 3520 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| syria posture reaches restricted | Sanctuary | natural exposure | 1 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 3520 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 183 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 1 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 3520 |
| puk posture reaches restricted | Sanctuary | natural exposure | 2 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 467 |
| Diplomacy | Sanctuary | natural exposure | 103 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | natural exposure | 1 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 3520 |
| Unshaded Event executed | Sequence/cards | natural exposure | 3191 |
| Shaded Event executed | Sequence/cards | natural exposure | 3375 |
| ARGK played | Sequence/cards | natural exposure | 1748 |
| ARGK declined | Sequence/cards | natural exposure | 1 |
| Pass | Sequence/cards | natural exposure | 3520 |
| Limited Op | Sequence/cards | natural exposure | 3520 |
| Op Only | Sequence/cards | natural exposure | 3520 |
| Op + SA | Sequence/cards | natural exposure | 3520 |
| Redeploy with moves | Sequence/cards | natural exposure | 564 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 3520 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 3285 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 3520 |
| Operation state.garrison | Sequence/cards | natural exposure | 3224 |
| Operation state.sweep | Sequence/cards | natural exposure | 2064 |
| Operation state.assault | Sequence/cards | natural exposure | 3520 |
| Operation pkk.rally | Sequence/cards | natural exposure | 3520 |
| Operation pkk.march | Sequence/cards | natural exposure | 3520 |
| Operation pkk.attack | Sequence/cards | natural exposure | 842 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 932 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 3520 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 122 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 3519 |

## Diagnostics

Pass share: State 39.4%, PKK 17.8%. Longest First Eligible streak: 20 cards. Mean unused Resources at the end: State 4.9, PKK 1.3. Games with a 3-Pass streak: {"state":2158,"pkk":698}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":19938,"opSa":15688,"pass":30485,"opOnly":3791,"event":7506},"pkk":{"opOnly":9913,"limitedOp":16696,"opSa":24089,"event":11486,"pass":13476}}

