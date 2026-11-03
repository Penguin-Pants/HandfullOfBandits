# Experiment dev-counter-variants (development)

Experiment hash `329ba6406670c2ad82786b8eea57de4690b1af78fc7c3a61e56bf7082f0be5bb`. Analysis version 1.

## Completion

Scheduled 80 games: complete 80. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-SHIELD |
|---|---|
| S-POL | 15.0% [5.2%, 36.0%] n=20 |
| S-MIL | 0.0% [0.0%, 16.1%] n=20 |
| S-CON | 0.0% [0.0%, 16.1%] n=20 |
| S-ADAPT | 0.0% [0.0%, 16.1%] n=20 |

Equal-weight roster average (this roster only, not a human win probability): State 3.8% [0.0%, 7.5%] over 4 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-SHIELD | -7.5 (-18 / -9 / 2) | 1/0 | 1/0 | 0/0 |
| S-MIL vs P-SHIELD | -12.4 (-18 / -13 / -6) | 0/2 | 0/3 | 0/0 |
| S-CON vs P-SHIELD | -13.3 (-21 / -13 / -8) | 0/0 | 0/0 | 0/0 |
| S-ADAPT vs P-SHIELD | -18.8 (-25 / -18 / -13) | 0/6 | 0/8 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@2 vs P-SHIELD@3 (baseline): State 15.0%
- S-MIL@2 vs P-SHIELD@3 (baseline): State 0.0%
- S-CON@2 vs P-SHIELD@3 (baseline): State 0.0%
- S-ADAPT@2 vs P-SHIELD@3 (baseline): State 0.0%
- PKK roster average 96.3% > 60%
- S-MIL@2 vs P-SHIELD@3 (baseline): median margin difference -13.0
- S-CON@2 vs P-SHIELD@3 (baseline): median margin difference -13.0
- S-ADAPT@2 vs P-SHIELD@3 (baseline): median margin difference -18.0

## Scoring routes

Mean final components over 80 completed games: State Support 19.7 + Legitimacy 9.9; PKK Opposition 18.6 + domestic Bases 4.9.
State winners (3): Support 32.0, Legitimacy 12.3. PKK winners (77): Opposition 18.9, Bases 4.9.

## Review selection

Closest: baseline~S-CONv2~P-SHIELDv3~3105~r0, baseline~S-MILv2~P-SHIELDv3~3104~r0, baseline~S-POLv2~P-SHIELDv3~3108~r0, baseline~S-POLv2~P-SHIELDv3~3119~r0, baseline~S-POLv2~P-SHIELDv3~3110~r0

Largest gaps: baseline~S-MILv2~P-SHIELDv3~3119~r0, baseline~S-ADAPTv2~P-SHIELDv3~3102~r0, baseline~S-CONv2~P-SHIELDv3~3107~r0, baseline~S-ADAPTv2~P-SHIELDv3~3110~r0, baseline~S-POLv2~P-SHIELDv3~3103~r0

Seeded random: baseline~S-MILv2~P-SHIELDv3~3107~r0, baseline~S-MILv2~P-SHIELDv3~3118~r0, baseline~S-CONv2~P-SHIELDv3~3111~r0, baseline~S-MILv2~P-SHIELDv3~3111~r0, baseline~S-POLv2~P-SHIELDv3~3106~r0

Failures: none

## Coverage ledger

44 natural, 24 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 80 |
| Win at the opening check | Victory | natural exposure | 9 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 68 |
| Equal final margins decided by Harm, then PKK | Victory | reviewed fixture | 0 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 80 |
| Train Civic Action | Political economy | natural exposure | 80 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 80 |
| Propaganda Agitation spending | Political economy | natural exposure | 80 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 13 |
| State Harm placed | Civilian effects | natural exposure | 47 |
| PKK Harm placed | Civilian effects | natural exposure | 5 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 7 |
| Coerce places Coercion | Civilian effects | natural exposure | 22 |
| Guard upkeep paid | Civilian effects | natural exposure | 56 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 13 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 4 |
| Strike Collaborators | Civilian effects | reviewed fixture | 0 |
| Europe track change | Civilian effects | natural exposure | 55 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 13 |
| Reception marker placed | Civilian effects | reviewed fixture | 0 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 80 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 80 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 80 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 80 |
| kdp posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 80 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | reviewed fixture | 0 |
| Diplomacy | Sanctuary | reviewed fixture | 0 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 80 |
| Unshaded Event executed | Sequence/cards | natural exposure | 69 |
| Shaded Event executed | Sequence/cards | natural exposure | 78 |
| ARGK played | Sequence/cards | natural exposure | 80 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 80 |
| Limited Op | Sequence/cards | natural exposure | 80 |
| Op Only | Sequence/cards | natural exposure | 80 |
| Op + SA | Sequence/cards | natural exposure | 80 |
| Redeploy with moves | Sequence/cards | natural exposure | 27 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 80 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 71 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 80 |
| Operation state.garrison | Sequence/cards | natural exposure | 80 |
| Operation state.sweep | Sequence/cards | natural exposure | 66 |
| Operation state.assault | Sequence/cards | natural exposure | 70 |
| Operation pkk.rally | Sequence/cards | natural exposure | 80 |
| Operation pkk.march | Sequence/cards | natural exposure | 80 |
| Operation pkk.attack | Sequence/cards | natural exposure | 25 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 22 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 80 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 17 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 80 |

## Diagnostics

Pass share: State 39.0%, PKK 15.8%. Longest First Eligible streak: 15 cards. Mean unused Resources at the end: State 1.0, PKK 1.4. Games with a 3-Pass streak: {"state":48,"pkk":17}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":438,"opSa":309,"pass":699,"opOnly":168,"event":178},"pkk":{"opSa":497,"limitedOp":435,"opOnly":252,"event":258,"pass":270}}

