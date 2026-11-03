# Experiment confirmation-3 (confirmation)

Experiment hash `b254ba743a07fc89fa69eeca6af897213a9edea45464747b22998590b8c1c75d`. Analysis version 2.

## Completion

Scheduled 1600 games: complete 1600. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-SURV@2 | P-EXP@2 | P-POL@2 | P-SHIELD@3 |
|---|---|---|---|---|
| S-MIL@1 | 90.5% [85.6%, 93.8%] n=200 |  |  | 3.0% [1.4%, 6.4%] n=200 |
| S-ADAPT@1 |  | 34.0% [27.8%, 40.8%] n=200 |  | 8.0% [5.0%, 12.6%] n=200 |
| S-CON@1 |  |  | 25.0% [19.5%, 31.4%] n=200 | 11.0% [7.4%, 16.1%] n=200 |
| S-POL@1 |  |  |  | 9.0% [5.8%, 13.8%] n=200 |
| S-SIEGE@3 |  |  |  | 0.5% [0.1%, 2.8%] n=200 |

Equal-weight roster average (this roster only, not a human win probability): State 22.6% [21.1%, 24.2%] over 8 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-MIL@1 vs P-SURV@2 | 12.9 (1 / 14 / 24) | 4/1 | 15/1 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -4.7 (-19 / -5 / 11) | 0/1 | 1/5 | 0/0 |
| S-CON@1 vs P-POL@2 | -5.7 (-19 / -6 / 8) | 2/4 | 2/5 | 0/0 |
| S-MIL@1 vs P-SHIELD@3 | -12.9 (-22 / -13 / -4) | 1/16 | 1/23 | 0/0 |
| S-POL@1 vs P-SHIELD@3 | -13.0 (-25 / -14 / -1) | 1/5 | 2/6 | 0/0 |
| S-CON@1 vs P-SHIELD@3 | -9.2 (-18 / -10 / 1) | 0/3 | 0/5 | 0/0 |
| S-ADAPT@1 vs P-SHIELD@3 | -14.6 (-25 / -15 / -2) | 0/25 | 0/31 | 0/0 |
| S-SIEGE@3 vs P-SHIELD@3 | -25.6 (-34 / -27 / -16) | 0/93 | 0/99 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (baseline): State 90.5%
- S-MIL@1 vs P-SHIELD@3 (baseline): State 3.0%
- S-POL@1 vs P-SHIELD@3 (baseline): State 9.0%
- S-CON@1 vs P-SHIELD@3 (baseline): State 11.0%
- S-ADAPT@1 vs P-SHIELD@3 (baseline): State 8.0%
- S-SIEGE@3 vs P-SHIELD@3 (baseline): State 0.5%
- PKK roster average 77.4% > 60%
- S-MIL@1 vs P-SURV@2 (baseline): median margin difference 14.0
- S-MIL@1 vs P-SHIELD@3 (baseline): median margin difference -13.0
- S-POL@1 vs P-SHIELD@3 (baseline): median margin difference -14.0
- S-CON@1 vs P-SHIELD@3 (baseline): median margin difference -10.0
- S-ADAPT@1 vs P-SHIELD@3 (baseline): median margin difference -15.0
- S-SIEGE@3 vs P-SHIELD@3 (baseline): median margin difference -27.0

## Scoring routes

Mean final components over 1600 completed games: State Support 19.7 + Legitimacy 10.1; PKK Opposition 16.3 + domestic Bases 3.6.
State winners (362): Support 29.2, Legitimacy 10.2. PKK winners (1238): Opposition 18.8, Bases 4.2.

## Review selection

Closest: baseline~S-ADAPTv1~P-EXPv2~1001340~r0, baseline~S-ADAPTv1~P-EXPv2~1001383~r0, baseline~S-ADAPTv1~P-EXPv2~1001401~r0, baseline~S-ADAPTv1~P-EXPv2~1001405~r0, baseline~S-ADAPTv1~P-EXPv2~1001424~r0

Largest gaps: baseline~S-SIEGEv3~P-SHIELDv3~1001303~r0, baseline~S-SIEGEv3~P-SHIELDv3~1001379~r0, baseline~S-SIEGEv3~P-SHIELDv3~1001452~r0, baseline~S-SIEGEv3~P-SHIELDv3~1001323~r0, baseline~S-SIEGEv3~P-SHIELDv3~1001395~r0

Seeded random: baseline~S-MILv1~P-SURVv2~1001405~r0, baseline~S-CONv1~P-POLv2~1001309~r0, baseline~S-POLv1~P-SHIELDv3~1001465~r0, baseline~S-MILv1~P-SURVv2~1001439~r0, baseline~S-MILv1~P-SURVv2~1001362~r0

Failures: none

## Coverage ledger

50 natural, 18 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 1600 |
| Win at the opening check | Victory | natural exposure | 156 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 1404 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 27 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 1597 |
| Train Civic Action | Political economy | natural exposure | 1599 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 1555 |
| Propaganda Agitation spending | Political economy | natural exposure | 1459 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 313 |
| State Harm placed | Civilian effects | natural exposure | 511 |
| PKK Harm placed | Civilian effects | natural exposure | 111 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 152 |
| Coerce places Coercion | Civilian effects | natural exposure | 397 |
| Guard upkeep paid | Civilian effects | natural exposure | 974 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 156 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 31 |
| Strike Collaborators | Civilian effects | natural exposure | 1 |
| Europe track change | Civilian effects | natural exposure | 853 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 334 |
| Reception marker placed | Civilian effects | natural exposure | 10 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 1600 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 1600 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 48 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 1600 |
| puk posture reaches restricted | Sanctuary | natural exposure | 2 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | reviewed fixture | 0 |
| Diplomacy | Sanctuary | natural exposure | 22 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 1600 |
| Unshaded Event executed | Sequence/cards | natural exposure | 1392 |
| Shaded Event executed | Sequence/cards | natural exposure | 1500 |
| ARGK played | Sequence/cards | natural exposure | 1326 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 1600 |
| Limited Op | Sequence/cards | natural exposure | 1600 |
| Op Only | Sequence/cards | natural exposure | 1600 |
| Op + SA | Sequence/cards | natural exposure | 1600 |
| Redeploy with moves | Sequence/cards | natural exposure | 367 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 1600 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 1444 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 1599 |
| Operation state.garrison | Sequence/cards | natural exposure | 1577 |
| Operation state.sweep | Sequence/cards | natural exposure | 1262 |
| Operation state.assault | Sequence/cards | natural exposure | 1545 |
| Operation pkk.rally | Sequence/cards | natural exposure | 1600 |
| Operation pkk.march | Sequence/cards | natural exposure | 1600 |
| Operation pkk.attack | Sequence/cards | natural exposure | 316 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 397 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 1600 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 90 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 1600 |

## Diagnostics

Pass share: State 37.2%, PKK 16.9%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 3.4, PKK 0.8. Games with a 3-Pass streak: {"state":721,"pkk":318}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":9021,"opSa":6561,"event":3634,"pass":13154,"opOnly":3006},"pkk":{"opOnly":4982,"limitedOp":9069,"opSa":10307,"pass":5738,"event":3954}}

