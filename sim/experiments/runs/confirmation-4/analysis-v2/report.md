# Experiment confirmation-4 (confirmation)

Experiment hash `09aa2fc285f606ee52493c86a9045fdcdd9c2d4675708a0cb499ec7423d9b191`. Analysis version 2.

## Completion

Scheduled 1600 games: complete 1600. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-SURV@2 | P-EXP@2 | P-POL@2 | P-SHIELD@3 |
|---|---|---|---|---|
| S-MIL@1 | 91.0% [86.2%, 94.2%] n=200 |  |  | 3.0% [1.4%, 6.4%] n=200 |
| S-ADAPT@1 |  | 47.0% [40.2%, 53.9%] n=200 |  | 10.5% [7.0%, 15.5%] n=200 |
| S-CON@1 |  |  | 25.5% [20.0%, 32.0%] n=200 | 9.0% [5.8%, 13.8%] n=200 |
| S-POL@1 |  |  |  | 8.0% [5.0%, 12.6%] n=200 |
| S-SIEGE@3 |  |  |  | 0.0% [0.0%, 1.9%] n=200 |

Equal-weight roster average (this roster only, not a human win probability): State 24.3% [22.6%, 25.9%] over 8 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-MIL@1 vs P-SURV@2 | 12.1 (1 / 14 / 22) | 5/0 | 8/0 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -1.3 (-17 / -1 / 14) | 0/2 | 2/2 | 0/0 |
| S-CON@1 vs P-POL@2 | -5.5 (-16 / -6 / 7) | 0/6 | 0/7 | 0/0 |
| S-MIL@1 vs P-SHIELD@3 | -13.2 (-21 / -14 / -4) | 0/16 | 0/20 | 0/0 |
| S-POL@1 vs P-SHIELD@3 | -10.9 (-20 / -11 / -1) | 0/8 | 0/14 | 0/0 |
| S-CON@1 vs P-SHIELD@3 | -8.5 (-17 / -8 / 0) | 0/4 | 0/7 | 0/0 |
| S-ADAPT@1 vs P-SHIELD@3 | -13.9 (-26 / -15 / 0) | 0/24 | 0/38 | 0/0 |
| S-SIEGE@3 vs P-SHIELD@3 | -26.3 (-33 / -28 / -16) | 0/98 | 0/105 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (baseline): State 91.0%
- S-MIL@1 vs P-SHIELD@3 (baseline): State 3.0%
- S-POL@1 vs P-SHIELD@3 (baseline): State 8.0%
- S-CON@1 vs P-SHIELD@3 (baseline): State 9.0%
- S-ADAPT@1 vs P-SHIELD@3 (baseline): State 10.5%
- S-SIEGE@3 vs P-SHIELD@3 (baseline): State 0.0%
- PKK roster average 75.8% > 60%
- S-MIL@1 vs P-SURV@2 (baseline): median margin difference 14.0
- S-MIL@1 vs P-SHIELD@3 (baseline): median margin difference -14.0
- S-POL@1 vs P-SHIELD@3 (baseline): median margin difference -11.0
- S-ADAPT@1 vs P-SHIELD@3 (baseline): median margin difference -15.0
- S-SIEGE@3 vs P-SHIELD@3 (baseline): median margin difference -28.0

## Scoring routes

Mean final components over 1600 completed games: State Support 19.8 + Legitimacy 10.0; PKK Opposition 15.7 + domestic Bases 3.5.
State winners (388): Support 28.1, Legitimacy 10.1. PKK winners (1212): Opposition 18.3, Bases 4.3.

## Review selection

Closest: baseline~S-ADAPTv1~P-EXPv2~1001823~r0, baseline~S-ADAPTv1~P-EXPv2~1001833~r0, baseline~S-ADAPTv1~P-EXPv2~1001960~r0, baseline~S-ADAPTv1~P-EXPv2~1001978~r0, baseline~S-ADAPTv1~P-SHIELDv3~1001822~r0

Largest gaps: baseline~S-SIEGEv3~P-SHIELDv3~1001877~r0, baseline~S-SIEGEv3~P-SHIELDv3~1001859~r0, baseline~S-ADAPTv1~P-SHIELDv3~1001862~r0, baseline~S-SIEGEv3~P-SHIELDv3~1001872~r0, baseline~S-SIEGEv3~P-SHIELDv3~1001974~r0

Seeded random: baseline~S-MILv1~P-SURVv2~1001905~r0, baseline~S-CONv1~P-POLv2~1001809~r0, baseline~S-POLv1~P-SHIELDv3~1001965~r0, baseline~S-MILv1~P-SURVv2~1001939~r0, baseline~S-MILv1~P-SURVv2~1001862~r0

Failures: none

## Coverage ledger

49 natural, 19 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 1600 |
| Win at the opening check | Victory | natural exposure | 163 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 1397 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 23 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 1599 |
| Train Civic Action | Political economy | natural exposure | 1599 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 1600 |
| Propaganda Agitation spending | Political economy | natural exposure | 1440 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 354 |
| State Harm placed | Civilian effects | natural exposure | 614 |
| PKK Harm placed | Civilian effects | natural exposure | 72 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 114 |
| Coerce places Coercion | Civilian effects | natural exposure | 435 |
| Guard upkeep paid | Civilian effects | natural exposure | 960 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 199 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 29 |
| Strike Collaborators | Civilian effects | reviewed fixture | 0 |
| Europe track change | Civilian effects | natural exposure | 885 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 370 |
| Reception marker placed | Civilian effects | natural exposure | 7 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 1600 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 1600 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 44 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 1 |
| Diplomacy | Sanctuary | natural exposure | 27 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 1600 |
| Unshaded Event executed | Sequence/cards | natural exposure | 1371 |
| Shaded Event executed | Sequence/cards | natural exposure | 1502 |
| ARGK played | Sequence/cards | natural exposure | 1310 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 1600 |
| Limited Op | Sequence/cards | natural exposure | 1600 |
| Op Only | Sequence/cards | natural exposure | 1600 |
| Op + SA | Sequence/cards | natural exposure | 1600 |
| Redeploy with moves | Sequence/cards | natural exposure | 397 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 1600 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 1437 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 1599 |
| Operation state.garrison | Sequence/cards | natural exposure | 1578 |
| Operation state.sweep | Sequence/cards | natural exposure | 1241 |
| Operation state.assault | Sequence/cards | natural exposure | 1545 |
| Operation pkk.rally | Sequence/cards | natural exposure | 1600 |
| Operation pkk.march | Sequence/cards | natural exposure | 1600 |
| Operation pkk.attack | Sequence/cards | natural exposure | 321 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 435 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 1600 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 72 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 1600 |

## Diagnostics

Pass share: State 38.0%, PKK 16.7%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 3.0, PKK 0.8. Games with a 3-Pass streak: {"pkk":315,"state":774}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":8778,"opSa":6519,"event":3369,"pass":13439,"opOnly":3231},"pkk":{"opOnly":4955,"limitedOp":9058,"opSa":10105,"event":4237,"pass":5671}}

