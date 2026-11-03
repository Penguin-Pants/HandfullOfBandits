# Experiment dev-counter-siege (development)

Experiment hash `0f4ad01db9d38eb22fae2fdf20e84b5ecfed269255005c98ca201364ac1ac2de`. Analysis version 1.

## Completion

Scheduled 320 games: complete 320. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-SHIELD | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|---|
| S-SIEGE | 0.0% [0.0%, 8.8%] n=40 | 30.0% [18.1%, 45.4%] n=40 | 65.0% [49.5%, 77.9%] n=40 | 72.5% [57.2%, 83.9%] n=40 | 72.5% [57.2%, 83.9%] n=40 |
| S-MIL |  |  | 60.0% [44.6%, 73.7%] n=40 | 82.5% [68.1%, 91.3%] n=40 | 97.5% [87.1%, 99.6%] n=40 |

Equal-weight roster average (this roster only, not a human win probability): State 60.0% [55.9%, 64.1%] over 8 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-SIEGE vs P-SHIELD | -25.8 (-34 / -28 / -12) | 0/19 | 0/22 | 0/0 |
| S-SIEGE vs P-POL | -4.0 (-18 / -5 / 13) | 1/0 | 1/1 | 0/0 |
| S-SIEGE vs P-EXP | 4.9 (-15 / 7 / 23) | 1/0 | 1/0 | 0/0 |
| S-SIEGE vs P-SURV | 6.4 (-7 / 9 / 20) | 2/0 | 2/1 | 0/0 |
| S-SIEGE vs P-ADAPT | 8.3 (-11 / 10 / 25) | 4/0 | 5/1 | 0/0 |
| S-MIL vs P-EXP | 1.1 (-14 / 2 / 11) | 0/0 | 0/0 | 0/0 |
| S-MIL vs P-SURV | 8.9 (-6 / 10 / 20) | 0/0 | 0/0 | 0/0 |
| S-MIL vs P-ADAPT | 13.1 (2 / 14 / 24) | 5/0 | 7/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-SIEGE@3 vs P-SHIELD@3 (baseline): State 0.0%
- S-MIL@1 vs P-SURV@2 (baseline): State 82.5%
- S-MIL@1 vs P-ADAPT@2 (baseline): State 97.5%
- S-SIEGE@3 vs P-SHIELD@3 (baseline): median margin difference -27.5
- S-SIEGE@3 vs P-ADAPT@2 (baseline): median margin difference 10.0
- S-MIL@1 vs P-SURV@2 (baseline): median margin difference 10.0
- S-MIL@1 vs P-ADAPT@2 (baseline): median margin difference 14.0

## Scoring routes

Mean final components over 320 completed games: State Support 23.0 + Legitimacy 10.5; PKK Opposition 11.8 + domestic Bases 1.2.
State winners (192): Support 28.7, Legitimacy 10.7. PKK winners (128): Opposition 18.2, Bases 2.3.

## Review selection

Closest: baseline~S-MILv1~P-ADAPTv2~3039~r0, baseline~S-MILv1~P-EXPv2~3007~r0, baseline~S-MILv1~P-EXPv2~3036~r0, baseline~S-SIEGEv3~P-EXPv2~3028~r0, baseline~S-MILv1~P-EXPv2~3013~r0

Largest gaps: baseline~S-SIEGEv3~P-SHIELDv3~3026~r0, baseline~S-SIEGEv3~P-ADAPTv2~3038~r0, baseline~S-SIEGEv3~P-SHIELDv3~3023~r0, baseline~S-SIEGEv3~P-SHIELDv3~3024~r0, baseline~S-SIEGEv3~P-SHIELDv3~3040~r0

Seeded random: baseline~S-SIEGEv3~P-EXPv2~3036~r0, baseline~S-SIEGEv3~P-ADAPTv2~3033~r0, baseline~S-SIEGEv3~P-SHIELDv3~3001~r0, baseline~S-SIEGEv3~P-EXPv2~3002~r0, baseline~S-MILv1~P-SURVv2~3032~r0

Failures: none

## Coverage ledger

49 natural, 19 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 320 |
| Win at the opening check | Victory | natural exposure | 32 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 279 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 4 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 309 |
| Train Civic Action | Political economy | natural exposure | 320 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 320 |
| Propaganda Agitation spending | Political economy | natural exposure | 253 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 53 |
| State Harm placed | Civilian effects | natural exposure | 119 |
| PKK Harm placed | Civilian effects | natural exposure | 28 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 26 |
| Coerce places Coercion | Civilian effects | natural exposure | 94 |
| Guard upkeep paid | Civilian effects | natural exposure | 200 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 63 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 16 |
| Strike Collaborators | Civilian effects | reviewed fixture | 0 |
| Europe track change | Civilian effects | natural exposure | 186 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 58 |
| Reception marker placed | Civilian effects | natural exposure | 2 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 320 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 320 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 320 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 320 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 6 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 320 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 8 |
| Diplomacy | Sanctuary | reviewed fixture | 0 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 320 |
| Unshaded Event executed | Sequence/cards | natural exposure | 289 |
| Shaded Event executed | Sequence/cards | natural exposure | 314 |
| ARGK played | Sequence/cards | natural exposure | 107 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 320 |
| Limited Op | Sequence/cards | natural exposure | 320 |
| Op Only | Sequence/cards | natural exposure | 320 |
| Op + SA | Sequence/cards | natural exposure | 320 |
| Redeploy with moves | Sequence/cards | natural exposure | 41 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 320 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 288 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 320 |
| Operation state.garrison | Sequence/cards | natural exposure | 305 |
| Operation state.sweep | Sequence/cards | natural exposure | 232 |
| Operation state.assault | Sequence/cards | natural exposure | 317 |
| Operation pkk.rally | Sequence/cards | natural exposure | 320 |
| Operation pkk.march | Sequence/cards | natural exposure | 320 |
| Operation pkk.attack | Sequence/cards | natural exposure | 106 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 94 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 320 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 6 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 320 |

## Diagnostics

Pass share: State 36.3%, PKK 17.4%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 1.0, PKK 0.9. Games with a 3-Pass streak: {"state":154,"pkk":44}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":1973,"opSa":1412,"opOnly":410,"pass":2547,"event":666},"pkk":{"opSa":2010,"limitedOp":1715,"opOnly":791,"event":1185,"pass":1200}}

