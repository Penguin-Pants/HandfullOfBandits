# Experiment confirmation-2 (confirmation)

Experiment hash `046ee16cc0589016e4ab195a707f84cf0a3b23e730a92e3b4a07cde7bdf41075`. Analysis version 1.

## Completion

Scheduled 1600 games: complete 1600. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-SURV | P-EXP | P-POL | P-SHIELD |
|---|---|---|---|---|
| S-MIL | 91.0% [86.2%, 94.2%] n=200 |  |  | 5.5% [3.1%, 9.6%] n=200 |
| S-ADAPT |  | 90.0% [85.1%, 93.4%] n=200 |  | 8.5% [5.4%, 13.2%] n=200 |
| S-CON |  |  | 25.0% [19.5%, 31.4%] n=200 | 10.5% [7.0%, 15.5%] n=200 |
| S-POL |  |  |  | 9.0% [5.8%, 13.8%] n=200 |
| S-SIEGE |  |  |  | 0.0% [0.0%, 1.9%] n=200 |

Equal-weight roster average (this roster only, not a human win probability): State 29.9% [28.6%, 31.4%] over 8 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-MIL vs P-SURV | 12.3 (1 / 13 / 23) | 8/0 | 15/0 | 0/0 |
| S-ADAPT vs P-EXP | 16.1 (2 / 19 / 26) | 13/0 | 39/1 | 0/0 |
| S-CON vs P-POL | -5.4 (-18 / -6 / 8) | 0/3 | 0/5 | 0/0 |
| S-MIL vs P-SHIELD | -12.8 (-21 / -13 / -3) | 0/13 | 0/20 | 0/0 |
| S-POL vs P-SHIELD | -12.0 (-23 / -12 / -2) | 1/3 | 2/7 | 0/0 |
| S-CON vs P-SHIELD | -8.7 (-19 / -8 / 0) | 0/4 | 0/7 | 0/0 |
| S-ADAPT vs P-SHIELD | -12.5 (-24 / -13 / -1) | 0/13 | 0/20 | 0/0 |
| S-SIEGE vs P-SHIELD | -26.0 (-33 / -28 / -17) | 0/93 | 0/110 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (baseline): State 91.0%
- S-ADAPT@1 vs P-EXP@2 (baseline): State 90.0%
- S-MIL@1 vs P-SHIELD@3 (baseline): State 5.5%
- S-POL@1 vs P-SHIELD@3 (baseline): State 9.0%
- S-CON@1 vs P-SHIELD@3 (baseline): State 10.5%
- S-ADAPT@1 vs P-SHIELD@3 (baseline): State 8.5%
- S-SIEGE@3 vs P-SHIELD@3 (baseline): State 0.0%
- PKK roster average 70.1% > 60%
- S-MIL@1 vs P-SURV@2 (baseline): median margin difference 13.0
- S-ADAPT@1 vs P-EXP@2 (baseline): median margin difference 19.0
- S-MIL@1 vs P-SHIELD@3 (baseline): median margin difference -13.0
- S-POL@1 vs P-SHIELD@3 (baseline): median margin difference -12.0
- S-ADAPT@1 vs P-SHIELD@3 (baseline): median margin difference -13.0
- S-SIEGE@3 vs P-SHIELD@3 (baseline): median margin difference -28.0

## Scoring routes

Mean final components over 1600 completed games: State Support 21.3 + Legitimacy 10.2; PKK Opposition 15.2 + domestic Bases 3.4.
State winners (479): Support 31.1, Legitimacy 10.2. PKK winners (1121): Opposition 18.6, Bases 4.4.

## Review selection

Closest: baseline~S-ADAPTv1~P-SHIELDv3~1000816~r0, baseline~S-ADAPTv1~P-SHIELDv3~1000830~r0, baseline~S-ADAPTv1~P-SHIELDv3~1000930~r0, baseline~S-ADAPTv1~P-SHIELDv3~1000933~r0, baseline~S-CONv1~P-POLv2~1000805~r0

Largest gaps: baseline~S-ADAPTv1~P-SHIELDv3~1000986~r0, baseline~S-SIEGEv3~P-SHIELDv3~1000961~r0, baseline~S-SIEGEv3~P-SHIELDv3~1000866~r0, baseline~S-SIEGEv3~P-SHIELDv3~1000812~r0, baseline~S-SIEGEv3~P-SHIELDv3~1000978~r0

Seeded random: baseline~S-MILv1~P-SURVv2~1000905~r0, baseline~S-CONv1~P-POLv2~1000809~r0, baseline~S-POLv1~P-SHIELDv3~1000965~r0, baseline~S-MILv1~P-SURVv2~1000939~r0, baseline~S-MILv1~P-SURVv2~1000862~r0

Failures: none

## Coverage ledger

51 natural, 17 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 1600 |
| Win at the opening check | Victory | natural exposure | 151 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 1374 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 17 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 1596 |
| Train Civic Action | Political economy | natural exposure | 1600 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 1573 |
| Propaganda Agitation spending | Political economy | natural exposure | 1341 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 427 |
| State Harm placed | Civilian effects | natural exposure | 565 |
| PKK Harm placed | Civilian effects | natural exposure | 92 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 128 |
| Coerce places Coercion | Civilian effects | natural exposure | 506 |
| Guard upkeep paid | Civilian effects | natural exposure | 919 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 155 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 26 |
| Strike Collaborators | Civilian effects | natural exposure | 1 |
| Europe track change | Civilian effects | natural exposure | 885 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 441 |
| Reception marker placed | Civilian effects | natural exposure | 13 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 1600 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 1600 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 46 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| puk posture reaches restricted | Sanctuary | natural exposure | 1 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 1 |
| Diplomacy | Sanctuary | natural exposure | 20 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 1600 |
| Unshaded Event executed | Sequence/cards | natural exposure | 1390 |
| Shaded Event executed | Sequence/cards | natural exposure | 1503 |
| ARGK played | Sequence/cards | natural exposure | 1244 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 1600 |
| Limited Op | Sequence/cards | natural exposure | 1600 |
| Op Only | Sequence/cards | natural exposure | 1600 |
| Op + SA | Sequence/cards | natural exposure | 1600 |
| Redeploy with moves | Sequence/cards | natural exposure | 437 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 1600 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 1449 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 1600 |
| Operation state.garrison | Sequence/cards | natural exposure | 1562 |
| Operation state.sweep | Sequence/cards | natural exposure | 1220 |
| Operation state.assault | Sequence/cards | natural exposure | 1545 |
| Operation pkk.rally | Sequence/cards | natural exposure | 1600 |
| Operation pkk.march | Sequence/cards | natural exposure | 1600 |
| Operation pkk.attack | Sequence/cards | natural exposure | 439 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 506 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 1600 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 206 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 1600 |

## Diagnostics

Pass share: State 37.4%, PKK 16.7%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 3.4, PKK 0.8. Games with a 3-Pass streak: {"state":759,"pkk":270}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":8820,"opSa":6269,"pass":13132,"opOnly":3243,"event":3632},"pkk":{"opOnly":4923,"limitedOp":9039,"opSa":10096,"event":4141,"pass":5653}}

