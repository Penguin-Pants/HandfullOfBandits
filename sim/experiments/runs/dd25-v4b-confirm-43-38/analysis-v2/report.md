# Experiment dd25-v4b-confirm-43-38 (confirmation)

Experiment hash `c396e0110f90a112e29260023cb0fe3170a61c68e256a2b263e08656f1bb7d37`. Analysis version 2.

## Completion

Scheduled 800 games: complete 800. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-POL@4 | 100.0% [92.9%, 100.0%] n=50 | 8.0% [3.2%, 18.8%] n=50 | 48.0% [34.8%, 61.5%] n=50 | 36.0% [24.1%, 49.9%] n=50 |
| S-MIL@4 | 100.0% [92.9%, 100.0%] n=50 | 44.0% [31.2%, 57.7%] n=50 | 30.0% [19.1%, 43.8%] n=50 | 94.0% [83.8%, 97.9%] n=50 |
| S-CON@4 | 100.0% [92.9%, 100.0%] n=50 | 68.0% [54.2%, 79.2%] n=50 | 60.0% [46.2%, 72.4%] n=50 | 90.0% [78.6%, 95.7%] n=50 |
| S-ADAPT@4 | 100.0% [92.9%, 100.0%] n=50 | 60.0% [46.2%, 72.4%] n=50 | 68.0% [54.2%, 79.2%] n=50 | 96.0% [86.5%, 98.9%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 68.9% [66.4%, 71.4%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@4 vs P-POL@4 | 29.5 (13 / 33 / 38) | 36/0 | 36/0 | 0/0 |
| S-POL@4 vs P-EXP@4 | -21.0 (-37 / -22 / -5) | 0/23 | 0/25 | 0/0 |
| S-POL@4 vs P-SURV@4 | 0.6 (-20 / 0 / 19) | 7/2 | 7/2 | 0/0 |
| S-POL@4 vs P-ADAPT@4 | -7.7 (-33 / -12 / 20) | 7/9 | 7/10 | 0/0 |
| S-MIL@4 vs P-POL@4 | 32.0 (28 / 31 / 38) | 40/0 | 44/0 | 0/0 |
| S-MIL@4 vs P-EXP@4 | -4.3 (-29 / -1 / 11) | 0/5 | 0/5 | 1/0 |
| S-MIL@4 vs P-SURV@4 | -4.7 (-17 / -6 / 9) | 0/1 | 0/1 | 7/0 |
| S-MIL@4 vs P-ADAPT@4 | 16.8 (3 / 17 / 31) | 12/0 | 13/0 | 0/0 |
| S-CON@4 vs P-POL@4 | 33.5 (29 / 33 / 38) | 45/0 | 47/0 | 0/0 |
| S-CON@4 vs P-EXP@4 | 5.4 (-16 / 9 / 21) | 2/0 | 2/0 | 0/1 |
| S-CON@4 vs P-SURV@4 | 4.7 (-10 / 7 / 18) | 6/0 | 6/0 | 1/0 |
| S-CON@4 vs P-ADAPT@4 | 21.8 (3 / 27 / 33) | 26/0 | 28/0 | 0/0 |
| S-ADAPT@4 vs P-POL@4 | 32.3 (27 / 32 / 38) | 33/0 | 38/0 | 0/0 |
| S-ADAPT@4 vs P-EXP@4 | 2.5 (-13 / 5 / 16) | 0/1 | 0/1 | 6/0 |
| S-ADAPT@4 vs P-SURV@4 | 4.5 (-12 / 6 / 22) | 5/0 | 5/0 | 7/0 |
| S-ADAPT@4 vs P-ADAPT@4 | 24.9 (15 / 27 / 35) | 21/0 | 23/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@4 vs P-POL@4 (default): State 100.0%
- S-POL@4 vs P-EXP@4 (default): State 8.0%
- S-MIL@4 vs P-POL@4 (default): State 100.0%
- S-MIL@4 vs P-ADAPT@4 (default): State 94.0%
- S-CON@4 vs P-POL@4 (default): State 100.0%
- S-CON@4 vs P-ADAPT@4 (default): State 90.0%
- S-ADAPT@4 vs P-POL@4 (default): State 100.0%
- S-ADAPT@4 vs P-ADAPT@4 (default): State 96.0%
- State roster average 68.9% > 60%
- S-POL@4 vs P-POL@4 (default): median margin difference 33.0
- S-POL@4 vs P-EXP@4 (default): median margin difference -22.0
- S-POL@4 vs P-ADAPT@4 (default): median margin difference -12.0
- S-MIL@4 vs P-POL@4 (default): median margin difference 31.0
- S-MIL@4 vs P-ADAPT@4 (default): median margin difference 17.0
- S-CON@4 vs P-POL@4 (default): median margin difference 33.0
- S-CON@4 vs P-ADAPT@4 (default): median margin difference 27.0
- S-ADAPT@4 vs P-POL@4 (default): median margin difference 32.0
- S-ADAPT@4 vs P-ADAPT@4 (default): median margin difference 26.5

## Scoring routes

Mean final components over 800 completed games: State Support 29.0 + Legitimacy 3.4; PKK Opposition 15.5 + domestic Bases 1.2.
State winners (551): Support 34.6, Legitimacy 3.6. PKK winners (249): Opposition 26.0, Bases 2.8.

## Review selection

Closest: default~S-ADAPTv4~P-EXPv4~1002545~r0, default~S-ADAPTv4~P-SURVv4~1002508~r0, default~S-ADAPTv4~P-SURVv4~1002523~r0, default~S-MILv4~P-EXPv4~1002500~r0, default~S-MILv4~P-SURVv4~1002536~r0

Largest gaps: default~S-CONv4~P-POLv4~1002515~r0, default~S-POLv4~P-EXPv4~1002545~r0, default~S-ADAPTv4~P-ADAPTv4~1002531~r0, default~S-POLv4~P-POLv4~1002544~r0, default~S-ADAPTv4~P-POLv4~1002517~r0

Seeded random: default~S-POLv4~P-EXPv4~1002546~r0, default~S-POLv4~P-EXPv4~1002508~r0, default~S-CONv4~P-POLv4~1002506~r0, default~S-MILv4~P-POLv4~1002548~r0, default~S-POLv4~P-ADAPTv4~1002522~r0

Failures: none

## Coverage ledger

75 natural, 14 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 800 |
| Win at the opening check | Victory | natural exposure | 281 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 500 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 11 |
| Final margin reduced by excess Harm | Victory | natural exposure | 23 |
| Rally Agitation | Political economy | natural exposure | 699 |
| Train Civic Action | Political economy | natural exposure | 791 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 800 |
| Propaganda Agitation spending | Political economy | natural exposure | 612 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 556 |
| State Harm placed | Civilian effects | natural exposure | 738 |
| PKK Harm placed | Civilian effects | natural exposure | 116 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 309 |
| Coerce places Coercion | Civilian effects | natural exposure | 427 |
| Guard upkeep paid | Civilian effects | natural exposure | 668 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 240 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 7 |
| Strike Collaborators | Civilian effects | natural exposure | 48 |
| Europe track change | Civilian effects | natural exposure | 793 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 555 |
| Reception marker placed | Civilian effects | natural exposure | 525 |
| Displacement marker placed | Civilian effects | natural exposure | 11 |
| syria posture reaches host | Sanctuary | natural exposure | 800 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 800 |
| syria posture reaches restricted | Sanctuary | natural exposure | 14 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 800 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 800 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 17 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 80 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 800 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 16 |
| Diplomacy | Sanctuary | natural exposure | 9 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 800 |
| Unshaded Event executed | Sequence/cards | natural exposure | 784 |
| Shaded Event executed | Sequence/cards | natural exposure | 799 |
| ARGK played | Sequence/cards | natural exposure | 493 |
| Pivotal window declined | Sequence/cards | natural exposure | 419 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 522 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 464 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 739 |
| Covert marker revealed | Civilian effects | natural exposure | 334 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 492 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 225 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 72 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 225 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 219 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 800 |
| Office placed | Political economy | natural exposure | 800 |
| State files a closure case | Political economy | natural exposure | 721 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 8 |
| Legal party banned (line 1) | Political economy | natural exposure | 642 |
| Successor party returns (line 2) | Political economy | natural exposure | 507 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 11 |
| Pass | Sequence/cards | natural exposure | 800 |
| Limited Op | Sequence/cards | natural exposure | 800 |
| Op Only | Sequence/cards | natural exposure | 800 |
| Op + SA | Sequence/cards | natural exposure | 800 |
| Redeploy with moves | Sequence/cards | natural exposure | 465 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 800 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 519 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 722 |
| Operation state.train | Sequence/cards | natural exposure | 796 |
| Operation state.garrison | Sequence/cards | natural exposure | 797 |
| Operation state.sweep | Sequence/cards | natural exposure | 797 |
| Operation state.assault | Sequence/cards | natural exposure | 800 |
| Operation pkk.rally | Sequence/cards | natural exposure | 800 |
| Operation pkk.march | Sequence/cards | natural exposure | 800 |
| Operation pkk.attack | Sequence/cards | natural exposure | 548 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 427 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 800 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 6 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 347 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 272 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 800 |

## Diagnostics

Pass share: State 35.0%, PKK 14.1%. Longest First Eligible streak: 56 cards. Mean unused Resources at the end: State 4.6, PKK 5.4. Games with a 3-Pass streak: {"state":547,"pkk":187}. Stop-rule flags: {"rule 4":9}.

Boxes by faction: {"state":{"limitedOp":9496,"opSa":11612,"event":3455,"opOnly":3611,"pass":15140},"pkk":{"opOnly":4625,"limitedOp":13252,"opSa":10412,"event":8190,"pass":5998}}

