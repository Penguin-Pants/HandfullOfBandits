# Experiment dd25-v4-variant-a (pilot)

Experiment hash `d07519e2082e78711f60badabc5079d6719da8be485a731d95008135df530165`. Analysis version 2.

## Completion

Scheduled 240 games: complete 240. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-POL@4 | 100.0% [79.6%, 100.0%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 40.0% [19.8%, 64.3%] n=15 | 53.3% [30.1%, 75.2%] n=15 |
| S-MIL@4 | 100.0% [79.6%, 100.0%] n=15 | 33.3% [15.2%, 58.3%] n=15 | 26.7% [10.9%, 52.0%] n=15 | 100.0% [79.6%, 100.0%] n=15 |
| S-CON@4 | 100.0% [79.6%, 100.0%] n=15 | 46.7% [24.8%, 69.9%] n=15 | 60.0% [35.7%, 80.2%] n=15 | 93.3% [70.2%, 98.8%] n=15 |
| S-ADAPT@4 | 100.0% [79.6%, 100.0%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 46.7% [24.8%, 69.9%] n=15 | 86.7% [62.1%, 96.3%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 63.3% [58.3%, 69.2%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@4 vs P-POL@4 | 30.3 (18 / 33 / 38) | 10/0 | 10/0 | 0/0 |
| S-POL@4 vs P-EXP@4 | -15.4 (-25 / -17 / -4) | 0/4 | 0/4 | 0/0 |
| S-POL@4 vs P-SURV@4 | -1.4 (-11 / -1 / 7) | 0/0 | 1/0 | 0/0 |
| S-POL@4 vs P-ADAPT@4 | 6.2 (-18 / 10 / 31) | 5/0 | 5/0 | 0/0 |
| S-MIL@4 vs P-POL@4 | 32.5 (28 / 32 / 38) | 14/0 | 14/0 | 0/0 |
| S-MIL@4 vs P-EXP@4 | -9.9 (-30 / -5 / 7) | 0/2 | 0/2 | 2/0 |
| S-MIL@4 vs P-SURV@4 | -6.5 (-22 / -5 / 2) | 0/0 | 0/0 | 2/0 |
| S-MIL@4 vs P-ADAPT@4 | 22.2 (12 / 23 / 31) | 3/0 | 4/0 | 0/0 |
| S-CON@4 vs P-POL@4 | 33.8 (29 / 33 / 40) | 13/0 | 13/0 | 0/0 |
| S-CON@4 vs P-EXP@4 | -2.6 (-20 / 0 / 13) | 0/0 | 0/0 | 1/0 |
| S-CON@4 vs P-SURV@4 | 3.2 (-6 / 4 / 11) | 0/0 | 0/0 | 0/0 |
| S-CON@4 vs P-ADAPT@4 | 22.0 (7 / 24 / 31) | 6/0 | 6/0 | 0/0 |
| S-ADAPT@4 vs P-POL@4 | 31.0 (20 / 33 / 38) | 11/0 | 12/0 | 0/0 |
| S-ADAPT@4 vs P-EXP@4 | -14.0 (-29 / -17 / 3) | 0/0 | 0/0 | 0/0 |
| S-ADAPT@4 vs P-SURV@4 | -2.8 (-21 / -8 / 16) | 0/0 | 1/0 | 0/0 |
| S-ADAPT@4 vs P-ADAPT@4 | 19.9 (3 / 23 / 31) | 4/0 | 5/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@4 vs P-POL@4 (default): State 100.0%
- S-POL@4 vs P-EXP@4 (default): State 6.7%
- S-MIL@4 vs P-POL@4 (default): State 100.0%
- S-MIL@4 vs P-ADAPT@4 (default): State 100.0%
- S-CON@4 vs P-POL@4 (default): State 100.0%
- S-CON@4 vs P-ADAPT@4 (default): State 93.3%
- S-ADAPT@4 vs P-POL@4 (default): State 100.0%
- S-ADAPT@4 vs P-EXP@4 (default): State 20.0%
- S-ADAPT@4 vs P-ADAPT@4 (default): State 86.7%
- State roster average 63.3% > 60%
- S-POL@4 vs P-POL@4 (default): median margin difference 33.0
- S-POL@4 vs P-EXP@4 (default): median margin difference -17.0
- S-POL@4 vs P-ADAPT@4 (default): median margin difference 10.0
- S-MIL@4 vs P-POL@4 (default): median margin difference 32.0
- S-MIL@4 vs P-ADAPT@4 (default): median margin difference 23.0
- S-CON@4 vs P-POL@4 (default): median margin difference 33.0
- S-CON@4 vs P-ADAPT@4 (default): median margin difference 24.0
- S-ADAPT@4 vs P-POL@4 (default): median margin difference 33.0
- S-ADAPT@4 vs P-EXP@4 (default): median margin difference -17.0
- S-ADAPT@4 vs P-ADAPT@4 (default): median margin difference 23.0

## Scoring routes

Mean final components over 240 completed games: State Support 28.5 + Legitimacy 2.6; PKK Opposition 15.6 + domestic Bases 1.2.
State winners (152): Support 35.8, Legitimacy 2.8. PKK winners (88): Opposition 23.7, Bases 2.6.

## Review selection

Closest: default~S-CONv4~P-EXPv4~7003~r0, default~S-CONv4~P-SURVv4~7012~r0, default~S-MILv4~P-EXPv4~7012~r0, default~S-MILv4~P-SURVv4~7001~r0, default~S-POLv4~P-EXPv4~7011~r0

Largest gaps: default~S-CONv4~P-POLv4~7003~r0, default~S-ADAPTv4~P-POLv4~7006~r0, default~S-CONv4~P-POLv4~7008~r0, default~S-MILv4~P-POLv4~7015~r0, default~S-ADAPTv4~P-POLv4~7003~r0

Seeded random: default~S-ADAPTv4~P-ADAPTv4~7013~r0, default~S-ADAPTv4~P-EXPv4~7014~r0, default~S-POLv4~P-EXPv4~7008~r0, default~S-POLv4~P-POLv4~7001~r0, default~S-MILv4~P-ADAPTv4~7005~r0

Failures: none

## Coverage ledger

75 natural, 14 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 72 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 163 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 6 |
| Final margin reduced by excess Harm | Victory | natural exposure | 5 |
| Rally Agitation | Political economy | natural exposure | 208 |
| Train Civic Action | Political economy | natural exposure | 240 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 179 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 195 |
| State Harm placed | Civilian effects | natural exposure | 237 |
| PKK Harm placed | Civilian effects | natural exposure | 31 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 104 |
| Coerce places Coercion | Civilian effects | natural exposure | 155 |
| Guard upkeep paid | Civilian effects | natural exposure | 215 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 53 |
| Guard Abuse (DK-006 shaded) | Civilian effects | reviewed fixture | 0 |
| Strike Collaborators | Civilian effects | natural exposure | 17 |
| Europe track change | Civilian effects | natural exposure | 240 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 203 |
| Reception marker placed | Civilian effects | natural exposure | 170 |
| Displacement marker placed | Civilian effects | natural exposure | 2 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 4 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 3 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 31 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 5 |
| Diplomacy | Sanctuary | natural exposure | 3 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 1 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 1 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 228 |
| Shaded Event executed | Sequence/cards | natural exposure | 240 |
| ARGK played | Sequence/cards | natural exposure | 209 |
| Pivotal window declined | Sequence/cards | natural exposure | 116 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 158 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 141 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 226 |
| Covert marker revealed | Civilian effects | natural exposure | 105 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 146 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 85 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 29 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 53 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 83 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 240 |
| Office placed | Political economy | natural exposure | 240 |
| State files a closure case | Political economy | natural exposure | 222 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 2 |
| Legal party banned (line 1) | Political economy | natural exposure | 201 |
| Successor party returns (line 2) | Political economy | natural exposure | 163 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 4 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 156 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 168 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 222 |
| Operation state.train | Sequence/cards | natural exposure | 240 |
| Operation state.garrison | Sequence/cards | natural exposure | 236 |
| Operation state.sweep | Sequence/cards | natural exposure | 240 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 219 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 155 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 1 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 106 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 111 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 37.0%, PKK 14.6%. Longest First Eligible streak: 52 cards. Mean unused Resources at the end: State 4.3, PKK 6.7. Games with a 3-Pass streak: {"state":170,"pkk":55}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":2355,"opSa":3733,"opOnly":1174,"pass":4798,"event":911},"pkk":{"opOnly":1184,"limitedOp":4342,"opSa":2489,"pass":1843,"event":2807}}

