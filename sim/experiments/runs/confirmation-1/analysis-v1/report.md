# Experiment confirmation-1 (confirmation)

Experiment hash `22dfcaa90902ad4a55de9cbe4b0401202933974ef292c554a6b760dfcd3bc306`. Analysis version 1.

## Completion

Scheduled 1600 games: complete 1600. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-SURV | P-EXP | P-POL | P-SHIELD |
|---|---|---|---|---|
| S-MIL | 78.5% [72.3%, 83.6%] n=200 |  |  | 2.5% [1.1%, 5.7%] n=200 |
| S-ADAPT |  | 86.0% [80.5%, 90.1%] n=200 |  | 2.5% [1.1%, 5.7%] n=200 |
| S-CON |  |  | 19.0% [14.2%, 25.0%] n=200 | 3.0% [1.4%, 6.4%] n=200 |
| S-POL |  |  |  | 9.5% [6.2%, 14.4%] n=200 |
| S-SIEGE |  |  |  | 0.0% [0.0%, 1.9%] n=200 |

Equal-weight roster average (this roster only, not a human win probability): State 25.1% [23.8%, 26.4%] over 8 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-MIL vs P-SURV | 8.1 (-4 / 8 / 20) | 0/0 | 7/0 | 0/0 |
| S-ADAPT vs P-EXP | 12.3 (-2 / 15 / 25) | 5/1 | 19/1 | 0/0 |
| S-CON vs P-POL | -8.3 (-19 / -9 / 4) | 0/1 | 1/2 | 0/0 |
| S-MIL vs P-SHIELD | -13.0 (-21 / -13 / -4) | 0/8 | 0/15 | 0/0 |
| S-POL vs P-SHIELD | -11.4 (-22 / -12 / -1) | 0/7 | 0/14 | 0/0 |
| S-CON vs P-SHIELD | -10.5 (-19 / -10 / -2) | 0/4 | 0/5 | 0/0 |
| S-ADAPT vs P-SHIELD | -20.7 (-30 / -22 / -11) | 0/66 | 0/93 | 0/0 |
| S-SIEGE vs P-SHIELD | -27.4 (-36 / -29 / -17) | 0/112 | 0/123 | 0/0 |

Review triggers (not balance pass/fail):

- S-ADAPT@1 vs P-EXP@2 (baseline): State 86.0%
- S-CON@1 vs P-POL@2 (baseline): State 19.0%
- S-MIL@1 vs P-SHIELD@3 (baseline): State 2.5%
- S-POL@1 vs P-SHIELD@3 (baseline): State 9.5%
- S-CON@1 vs P-SHIELD@3 (baseline): State 3.0%
- S-ADAPT@1 vs P-SHIELD@3 (baseline): State 2.5%
- S-SIEGE@3 vs P-SHIELD@3 (baseline): State 0.0%
- PKK roster average 74.9% > 60%
- S-ADAPT@1 vs P-EXP@2 (baseline): median margin difference 15.0
- S-MIL@1 vs P-SHIELD@3 (baseline): median margin difference -13.0
- S-POL@1 vs P-SHIELD@3 (baseline): median margin difference -12.0
- S-CON@1 vs P-SHIELD@3 (baseline): median margin difference -10.0
- S-ADAPT@1 vs P-SHIELD@3 (baseline): median margin difference -22.0
- S-SIEGE@3 vs P-SHIELD@3 (baseline): median margin difference -29.0

## Scoring routes

Mean final components over 1600 completed games: State Support 20.4 + Legitimacy 10.1; PKK Opposition 16.7 + domestic Bases 3.6.
State winners (402): Support 30.0, Legitimacy 10.2. PKK winners (1198): Opposition 19.7, Bases 4.4.

## Review selection

Closest: baseline~S-ADAPTv1~P-EXPv2~1000318~r0, baseline~S-ADAPTv1~P-EXPv2~1000353~r0, baseline~S-ADAPTv1~P-EXPv2~1000462~r0, baseline~S-CONv1~P-POLv2~1000346~r0, baseline~S-CONv1~P-POLv2~1000377~r0

Largest gaps: baseline~S-SIEGEv3~P-SHIELDv3~1000483~r0, baseline~S-SIEGEv3~P-SHIELDv3~1000315~r0, baseline~S-SIEGEv3~P-SHIELDv3~1000376~r0, baseline~S-SIEGEv3~P-SHIELDv3~1000386~r0, baseline~S-SIEGEv3~P-SHIELDv3~1000388~r0

Seeded random: baseline~S-MILv1~P-SURVv2~1000405~r0, baseline~S-CONv1~P-POLv2~1000309~r0, baseline~S-POLv1~P-SHIELDv3~1000465~r0, baseline~S-MILv1~P-SURVv2~1000439~r0, baseline~S-MILv1~P-SURVv2~1000362~r0

Failures: none

## Coverage ledger

48 natural, 20 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 1600 |
| Win at the opening check | Victory | natural exposure | 204 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 1320 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 23 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 1596 |
| Train Civic Action | Political economy | natural exposure | 1598 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 1536 |
| Propaganda Agitation spending | Political economy | natural exposure | 1390 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 349 |
| State Harm placed | Civilian effects | natural exposure | 580 |
| PKK Harm placed | Civilian effects | natural exposure | 105 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 129 |
| Coerce places Coercion | Civilian effects | natural exposure | 435 |
| Guard upkeep paid | Civilian effects | natural exposure | 1039 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 193 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 48 |
| Strike Collaborators | Civilian effects | reviewed fixture | 0 |
| Europe track change | Civilian effects | natural exposure | 927 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 383 |
| Reception marker placed | Civilian effects | natural exposure | 5 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 1600 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 1600 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 66 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | reviewed fixture | 0 |
| Diplomacy | Sanctuary | natural exposure | 11 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 1600 |
| Unshaded Event executed | Sequence/cards | natural exposure | 1391 |
| Shaded Event executed | Sequence/cards | natural exposure | 1512 |
| ARGK played | Sequence/cards | natural exposure | 1274 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 1600 |
| Limited Op | Sequence/cards | natural exposure | 1600 |
| Op Only | Sequence/cards | natural exposure | 1600 |
| Op + SA | Sequence/cards | natural exposure | 1600 |
| Redeploy with moves | Sequence/cards | natural exposure | 430 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 1600 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 1396 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 1600 |
| Operation state.garrison | Sequence/cards | natural exposure | 1566 |
| Operation state.sweep | Sequence/cards | natural exposure | 1222 |
| Operation state.assault | Sequence/cards | natural exposure | 1563 |
| Operation pkk.rally | Sequence/cards | natural exposure | 1600 |
| Operation pkk.march | Sequence/cards | natural exposure | 1600 |
| Operation pkk.attack | Sequence/cards | natural exposure | 470 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 435 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 1600 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 112 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 1600 |

## Diagnostics

Pass share: State 38.2%, PKK 17.6%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 3.2, PKK 1.0. Games with a 3-Pass streak: {"pkk":338,"state":813}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":8787,"opSa":6534,"pass":13594,"event":3668,"opOnly":2993},"pkk":{"opOnly":4952,"limitedOp":8692,"opSa":10112,"event":4512,"pass":6034}}

