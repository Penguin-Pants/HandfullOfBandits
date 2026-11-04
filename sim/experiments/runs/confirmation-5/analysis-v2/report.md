# Experiment confirmation-5 (confirmation)

Experiment hash `2f0cee1ba4751e23da3c1944910ef7c72deeb63b364150cfc8ca5e959cf49151`. Analysis version 2.

## Completion

Scheduled 1600 games: complete 1600. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-SURV@2 | P-EXP@2 | P-POL@2 | P-SHIELD@3 |
|---|---|---|---|---|
| S-MIL@1 | 93.5% [89.2%, 96.2%] n=200 |  |  | 3.0% [1.4%, 6.4%] n=200 |
| S-ADAPT@1 |  | 40.5% [33.9%, 47.4%] n=200 |  | 10.0% [6.6%, 14.9%] n=200 |
| S-CON@1 |  |  | 21.5% [16.4%, 27.7%] n=200 | 11.5% [7.8%, 16.7%] n=200 |
| S-POL@1 |  |  |  | 9.5% [6.2%, 14.4%] n=200 |
| S-SIEGE@3 |  |  |  | 0.0% [0.0%, 1.9%] n=200 |

Equal-weight roster average (this roster only, not a human win probability): State 23.7% [22.3%, 25.3%] over 8 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-MIL@1 vs P-SURV@2 | 12.8 (3 / 13 / 23) | 6/0 | 13/0 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -2.0 (-16 / -3 / 15) | 2/3 | 2/6 | 0/0 |
| S-CON@1 vs P-POL@2 | -5.3 (-15 / -7 / 8) | 0/1 | 0/1 | 0/0 |
| S-MIL@1 vs P-SHIELD@3 | -12.4 (-21 / -12 / -4) | 1/10 | 2/12 | 0/0 |
| S-POL@1 vs P-SHIELD@3 | -11.0 (-20 / -12 / 0) | 0/7 | 2/10 | 0/0 |
| S-CON@1 vs P-SHIELD@3 | -8.4 (-19 / -7 / 1) | 0/3 | 0/8 | 0/0 |
| S-ADAPT@1 vs P-SHIELD@3 | -12.4 (-25 / -12 / 0) | 0/18 | 0/28 | 0/0 |
| S-SIEGE@3 vs P-SHIELD@3 | -25.9 (-33 / -27 / -19) | 0/87 | 0/99 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (baseline): State 93.5%
- S-MIL@1 vs P-SHIELD@3 (baseline): State 3.0%
- S-POL@1 vs P-SHIELD@3 (baseline): State 9.5%
- S-CON@1 vs P-SHIELD@3 (baseline): State 11.5%
- S-ADAPT@1 vs P-SHIELD@3 (baseline): State 10.0%
- S-SIEGE@3 vs P-SHIELD@3 (baseline): State 0.0%
- PKK roster average 76.3% > 60%
- S-MIL@1 vs P-SURV@2 (baseline): median margin difference 13.0
- S-MIL@1 vs P-SHIELD@3 (baseline): median margin difference -12.0
- S-POL@1 vs P-SHIELD@3 (baseline): median margin difference -11.5
- S-ADAPT@1 vs P-SHIELD@3 (baseline): median margin difference -12.0
- S-SIEGE@3 vs P-SHIELD@3 (baseline): median margin difference -27.0

## Scoring routes

Mean final components over 1600 completed games: State Support 20.1 + Legitimacy 10.1; PKK Opposition 15.8 + domestic Bases 3.5.
State winners (379): Support 28.5, Legitimacy 10.5. PKK winners (1221): Opposition 18.2, Bases 4.2.

## Review selection

Closest: baseline~S-ADAPTv1~P-EXPv2~1002322~r0, baseline~S-ADAPTv1~P-EXPv2~1002390~r0, baseline~S-ADAPTv1~P-EXPv2~1002395~r0, baseline~S-ADAPTv1~P-EXPv2~1002402~r0, baseline~S-ADAPTv1~P-EXPv2~1002434~r0

Largest gaps: baseline~S-SIEGEv3~P-SHIELDv3~1002314~r0, baseline~S-SIEGEv3~P-SHIELDv3~1002347~r0, baseline~S-ADAPTv1~P-SHIELDv3~1002386~r0, baseline~S-SIEGEv3~P-SHIELDv3~1002390~r0, baseline~S-SIEGEv3~P-SHIELDv3~1002481~r0

Seeded random: baseline~S-MILv1~P-SURVv2~1002405~r0, baseline~S-CONv1~P-POLv2~1002309~r0, baseline~S-POLv1~P-SHIELDv3~1002465~r0, baseline~S-MILv1~P-SURVv2~1002439~r0, baseline~S-MILv1~P-SURVv2~1002362~r0

Failures: none

## Coverage ledger

49 natural, 19 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 1600 |
| Win at the opening check | Victory | natural exposure | 138 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 1417 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 29 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 1599 |
| Train Civic Action | Political economy | natural exposure | 1597 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 1600 |
| Propaganda Agitation spending | Political economy | natural exposure | 1444 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 346 |
| State Harm placed | Civilian effects | natural exposure | 511 |
| PKK Harm placed | Civilian effects | natural exposure | 75 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 121 |
| Coerce places Coercion | Civilian effects | natural exposure | 425 |
| Guard upkeep paid | Civilian effects | natural exposure | 960 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 169 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 31 |
| Strike Collaborators | Civilian effects | natural exposure | 3 |
| Europe track change | Civilian effects | natural exposure | 852 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 362 |
| Reception marker placed | Civilian effects | natural exposure | 11 |
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
| Host Pressure | Sanctuary | reviewed fixture | 0 |
| Diplomacy | Sanctuary | natural exposure | 23 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 1600 |
| Unshaded Event executed | Sequence/cards | natural exposure | 1359 |
| Shaded Event executed | Sequence/cards | natural exposure | 1487 |
| ARGK played | Sequence/cards | natural exposure | 1312 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 1600 |
| Limited Op | Sequence/cards | natural exposure | 1600 |
| Op Only | Sequence/cards | natural exposure | 1600 |
| Op + SA | Sequence/cards | natural exposure | 1600 |
| Redeploy with moves | Sequence/cards | natural exposure | 386 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 1600 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 1462 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 1598 |
| Operation state.garrison | Sequence/cards | natural exposure | 1578 |
| Operation state.sweep | Sequence/cards | natural exposure | 1273 |
| Operation state.assault | Sequence/cards | natural exposure | 1537 |
| Operation pkk.rally | Sequence/cards | natural exposure | 1600 |
| Operation pkk.march | Sequence/cards | natural exposure | 1600 |
| Operation pkk.attack | Sequence/cards | natural exposure | 321 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 425 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 1599 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 61 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 1600 |

## Diagnostics

Pass share: State 37.5%, PKK 16.4%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 2.9, PKK 0.7. Games with a 3-Pass streak: {"state":766,"pkk":272}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":8933,"opSa":6491,"pass":13196,"event":3434,"opOnly":3130},"pkk":{"opOnly":5050,"limitedOp":9009,"opSa":10286,"event":3981,"pass":5546}}

