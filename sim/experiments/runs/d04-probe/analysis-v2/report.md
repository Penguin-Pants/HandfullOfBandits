# Experiment d04-probe (development)

Experiment hash `9a9c81ab74206614a3abe36656423154ce1b893e71d098319f3a125f9503c24f`. Analysis version 2.

## Completion

Scheduled 100 games: complete 100. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-PROBE@1 |
|---|---|
| S-PROBE@1 | 4.0% [1.6%, 9.8%] n=100 |

Equal-weight roster average (this roster only, not a human win probability): State n/a [n/a, n/a] over 0 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-PROBE@1 vs P-PROBE@1 | -17.0 (-30 / -16 / -3) | 0/6 | 0/6 | 1/3 |

Review triggers (not balance pass/fail):

- S-PROBE@1 vs P-PROBE@1 (default): State 4.0%
- S-PROBE@1 vs P-PROBE@1 (default): median margin difference -16.0

## Scoring routes

Mean final components over 100 completed games: State Support 15.8 + Legitimacy 4.6; PKK Opposition 18.1 + domestic Bases 2.3.
State winners (4): Support 26.0, Legitimacy 10.5. PKK winners (96): Opposition 18.5, Bases 2.4.

## Review selection

Closest: default~S-PROBEv1~P-PROBEv1~9038~r0, default~S-PROBEv1~P-PROBEv1~9092~r0, default~S-PROBEv1~P-PROBEv1~9017~r0, default~S-PROBEv1~P-PROBEv1~9036~r0, default~S-PROBEv1~P-PROBEv1~9045~r0

Largest gaps: default~S-PROBEv1~P-PROBEv1~9023~r0, default~S-PROBEv1~P-PROBEv1~9005~r0, default~S-PROBEv1~P-PROBEv1~9096~r0, default~S-PROBEv1~P-PROBEv1~9097~r0, default~S-PROBEv1~P-PROBEv1~9071~r0

Seeded random: default~S-PROBEv1~P-PROBEv1~9033~r0, default~S-PROBEv1~P-PROBEv1~9016~r0, default~S-PROBEv1~P-PROBEv1~9093~r0, default~S-PROBEv1~P-PROBEv1~9098~r0, default~S-PROBEv1~P-PROBEv1~9027~r0

Failures: none

## Coverage ledger

85 natural, 4 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 100 |
| Win at the opening check | Victory | natural exposure | 6 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 94 |
| Equal final margins decided by Harm, then PKK | Victory | reviewed fixture | 0 |
| Final margin reduced by excess Harm | Victory | natural exposure | 4 |
| Rally Agitation | Political economy | natural exposure | 75 |
| Train Civic Action | Political economy | natural exposure | 90 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 96 |
| Propaganda Agitation spending | Political economy | natural exposure | 100 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 67 |
| State Harm placed | Civilian effects | natural exposure | 94 |
| PKK Harm placed | Civilian effects | natural exposure | 94 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 81 |
| Coerce places Coercion | Civilian effects | natural exposure | 84 |
| Guard upkeep paid | Civilian effects | natural exposure | 100 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 91 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 63 |
| Strike Collaborators | Civilian effects | natural exposure | 89 |
| Europe track change | Civilian effects | natural exposure | 100 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 91 |
| Reception marker placed | Civilian effects | natural exposure | 82 |
| Displacement marker placed | Civilian effects | natural exposure | 67 |
| syria posture reaches host | Sanctuary | natural exposure | 100 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 100 |
| syria posture reaches restricted | Sanctuary | natural exposure | 19 |
| syria posture reaches hostile | Sanctuary | natural exposure | 38 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 100 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 100 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 60 |
| kdp posture reaches hostile | Sanctuary | natural exposure | 32 |
| kdp posture reaches aligned | Sanctuary | natural exposure | 16 |
| puk posture reaches host | Sanctuary | natural exposure | 9 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 100 |
| puk posture reaches restricted | Sanctuary | natural exposure | 72 |
| puk posture reaches hostile | Sanctuary | natural exposure | 47 |
| puk posture reaches aligned | Sanctuary | natural exposure | 18 |
| Host Pressure | Sanctuary | natural exposure | 96 |
| Diplomacy | Sanctuary | natural exposure | 100 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 83 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 52 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 38 |
| March into a Restricted box (+1, activates) | Sanctuary | natural exposure | 84 |
| Leadership flips Abroad | Sanctuary | natural exposure | 38 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 100 |
| Unshaded Event executed | Sequence/cards | natural exposure | 100 |
| Shaded Event executed | Sequence/cards | natural exposure | 100 |
| ARGK played | Sequence/cards | natural exposure | 75 |
| Pivotal window declined | Sequence/cards | natural exposure | 20 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 72 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 27 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | natural exposure | 37 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 42 |
| Covert marker revealed | Civilian effects | natural exposure | 16 |
| Strike Collaborators after the Operation | Civilian effects | natural exposure | 89 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 93 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 1 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 81 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 48 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 31 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 100 |
| Office placed | Political economy | natural exposure | 100 |
| State files a closure case | Political economy | reviewed fixture | 0 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 68 |
| Legal party banned (line 1) | Political economy | natural exposure | 79 |
| Successor party returns (line 2) | Political economy | natural exposure | 32 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 44 |
| Pass | Sequence/cards | natural exposure | 100 |
| Limited Op | Sequence/cards | natural exposure | 100 |
| Op Only | Sequence/cards | natural exposure | 100 |
| Op + SA | Sequence/cards | natural exposure | 100 |
| Redeploy with moves | Sequence/cards | natural exposure | 100 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 100 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 94 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 99 |
| Operation state.train | Sequence/cards | natural exposure | 100 |
| Operation state.garrison | Sequence/cards | natural exposure | 100 |
| Operation state.sweep | Sequence/cards | natural exposure | 100 |
| Operation state.assault | Sequence/cards | natural exposure | 92 |
| Operation pkk.rally | Sequence/cards | natural exposure | 100 |
| Operation pkk.march | Sequence/cards | natural exposure | 100 |
| Operation pkk.attack | Sequence/cards | natural exposure | 100 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 84 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 97 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 67 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 17 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 52 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 100 |

## Diagnostics

Pass share: State 19.6%, PKK 8.8%. Longest First Eligible streak: 12 cards. Mean unused Resources at the end: State 0.0, PKK 0.3. Games with a 3-Pass streak: {"state":1}. Stop-rule flags: {"rule 4":3}.

Boxes by faction: {"state":{"limitedOp":1123,"opSa":1418,"event":1761,"pass":1120,"opOnly":290},"pkk":{"opOnly":621,"limitedOp":1184,"event":614,"opSa":2596,"pass":482}}

