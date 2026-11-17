# Experiment dd25-v4b-variant-a (pilot)

Experiment hash `005ec9aa2815eb3da7c10eb39e70b8c5a41cbf33c797c233937b50ee5dbbdb4e`. Analysis version 2.

## Completion

Scheduled 240 games: complete 240. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-POL@4 | 100.0% [79.6%, 100.0%] n=15 | 13.3% [3.7%, 37.9%] n=15 | 53.3% [30.1%, 75.2%] n=15 | 13.3% [3.7%, 37.9%] n=15 |
| S-MIL@4 | 100.0% [79.6%, 100.0%] n=15 | 86.7% [62.1%, 96.3%] n=15 | 26.7% [10.9%, 52.0%] n=15 | 93.3% [70.2%, 98.8%] n=15 |
| S-CON@4 | 100.0% [79.6%, 100.0%] n=15 | 53.3% [30.1%, 75.2%] n=15 | 46.7% [24.8%, 69.9%] n=15 | 26.7% [10.9%, 52.0%] n=15 |
| S-ADAPT@4 | 100.0% [79.6%, 100.0%] n=15 | 53.3% [30.1%, 75.2%] n=15 | 13.3% [3.7%, 37.9%] n=15 | 60.0% [35.7%, 80.2%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 58.7% [54.6%, 62.9%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@4 vs P-POL@4 | 30.3 (23 / 32 / 36) | 12/0 | 12/0 | 0/0 |
| S-POL@4 vs P-EXP@4 | -17.0 (-35 / -20 / 2) | 2/3 | 2/3 | 0/0 |
| S-POL@4 vs P-SURV@4 | 5.7 (-10 / 6 / 27) | 3/0 | 3/0 | 0/0 |
| S-POL@4 vs P-ADAPT@4 | -14.7 (-29 / -16 / -1) | 0/4 | 0/5 | 0/0 |
| S-MIL@4 vs P-POL@4 | 30.1 (23 / 32 / 37) | 10/0 | 10/0 | 0/0 |
| S-MIL@4 vs P-EXP@4 | 10.5 (-0 / 6 / 23) | 2/0 | 2/0 | 0/0 |
| S-MIL@4 vs P-SURV@4 | -7.5 (-18 / -11 / 7) | 0/0 | 0/0 | 1/0 |
| S-MIL@4 vs P-ADAPT@4 | 14.1 (6 / 16 / 24) | 2/0 | 2/0 | 0/0 |
| S-CON@4 vs P-POL@4 | 29.3 (24 / 29 / 34) | 10/0 | 10/0 | 0/0 |
| S-CON@4 vs P-EXP@4 | -1.7 (-17 / 2 / 11) | 0/0 | 0/0 | 0/0 |
| S-CON@4 vs P-SURV@4 | 1.7 (-7 / 0 / 10) | 1/0 | 1/0 | 0/0 |
| S-CON@4 vs P-ADAPT@4 | -5.1 (-22 / -3 / 15) | 1/0 | 1/0 | 0/0 |
| S-ADAPT@4 vs P-POL@4 | 29.2 (22 / 31 / 36) | 10/0 | 10/0 | 0/0 |
| S-ADAPT@4 vs P-EXP@4 | -1.1 (-25 / 2 / 17) | 0/0 | 0/0 | 1/0 |
| S-ADAPT@4 vs P-SURV@4 | -5.5 (-17 / -4 / 2) | 0/0 | 0/0 | 1/0 |
| S-ADAPT@4 vs P-ADAPT@4 | 2.1 (-16 / 5 / 19) | 1/1 | 1/1 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@4 vs P-POL@4 (default): State 100.0%
- S-POL@4 vs P-EXP@4 (default): State 13.3%
- S-POL@4 vs P-ADAPT@4 (default): State 13.3%
- S-MIL@4 vs P-POL@4 (default): State 100.0%
- S-MIL@4 vs P-EXP@4 (default): State 86.7%
- S-MIL@4 vs P-ADAPT@4 (default): State 93.3%
- S-CON@4 vs P-POL@4 (default): State 100.0%
- S-ADAPT@4 vs P-POL@4 (default): State 100.0%
- S-ADAPT@4 vs P-SURV@4 (default): State 13.3%
- S-POL@4 vs P-POL@4 (default): median margin difference 32.0
- S-POL@4 vs P-EXP@4 (default): median margin difference -20.0
- S-POL@4 vs P-ADAPT@4 (default): median margin difference -16.0
- S-MIL@4 vs P-POL@4 (default): median margin difference 32.0
- S-MIL@4 vs P-SURV@4 (default): median margin difference -11.0
- S-MIL@4 vs P-ADAPT@4 (default): median margin difference 16.0
- S-CON@4 vs P-POL@4 (default): median margin difference 29.0
- S-ADAPT@4 vs P-POL@4 (default): median margin difference 31.0

## Scoring routes

Mean final components over 240 completed games: State Support 26.8 + Legitimacy 3.1; PKK Opposition 17.2 + domestic Bases 1.3.
State winners (141): Support 33.1, Legitimacy 3.6. PKK winners (99): Opposition 25.3, Bases 2.3.

## Review selection

Closest: default~S-ADAPTv4~P-SURVv4~7004~r0, default~S-ADAPTv4~P-SURVv4~7011~r0, default~S-CONv4~P-ADAPTv4~7007~r0, default~S-CONv4~P-ADAPTv4~7008~r0, default~S-CONv4~P-SURVv4~7005~r0

Largest gaps: default~S-POLv4~P-EXPv4~7004~r0, default~S-MILv4~P-POLv4~7004~r0, default~S-ADAPTv4~P-POLv4~7009~r0, default~S-POLv4~P-POLv4~7015~r0, default~S-MILv4~P-POLv4~7008~r0

Seeded random: default~S-ADAPTv4~P-ADAPTv4~7013~r0, default~S-ADAPTv4~P-EXPv4~7014~r0, default~S-POLv4~P-EXPv4~7008~r0, default~S-POLv4~P-POLv4~7001~r0, default~S-MILv4~P-ADAPTv4~7005~r0

Failures: none

## Coverage ledger

78 natural, 11 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 62 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 177 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 8 |
| Final margin reduced by excess Harm | Victory | natural exposure | 3 |
| Rally Agitation | Political economy | natural exposure | 214 |
| Train Civic Action | Political economy | natural exposure | 237 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 189 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 154 |
| State Harm placed | Civilian effects | natural exposure | 229 |
| PKK Harm placed | Civilian effects | natural exposure | 42 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 79 |
| Coerce places Coercion | Civilian effects | natural exposure | 126 |
| Guard upkeep paid | Civilian effects | natural exposure | 196 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 53 |
| Guard Abuse (DK-006 shaded) | Civilian effects | reviewed fixture | 0 |
| Strike Collaborators | Civilian effects | natural exposure | 17 |
| Europe track change | Civilian effects | natural exposure | 240 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 161 |
| Reception marker placed | Civilian effects | natural exposure | 162 |
| Displacement marker placed | Civilian effects | natural exposure | 2 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 8 |
| syria posture reaches hostile | Sanctuary | natural exposure | 1 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 8 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 27 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 10 |
| Diplomacy | Sanctuary | natural exposure | 2 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 1 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 1 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 2 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | natural exposure | 1 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 236 |
| Shaded Event executed | Sequence/cards | natural exposure | 240 |
| ARGK played | Sequence/cards | natural exposure | 189 |
| Pivotal window declined | Sequence/cards | natural exposure | 124 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 170 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 157 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 229 |
| Covert marker revealed | Civilian effects | natural exposure | 95 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 115 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 61 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 13 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 49 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 58 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 240 |
| Office placed | Political economy | natural exposure | 240 |
| State files a closure case | Political economy | natural exposure | 225 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 1 |
| Legal party banned (line 1) | Political economy | natural exposure | 204 |
| Successor party returns (line 2) | Political economy | natural exposure | 177 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 2 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 126 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 178 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 226 |
| Operation state.train | Sequence/cards | natural exposure | 239 |
| Operation state.garrison | Sequence/cards | natural exposure | 240 |
| Operation state.sweep | Sequence/cards | natural exposure | 240 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 161 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 126 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 1 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 100 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 70 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 33.8%, PKK 12.6%. Longest First Eligible streak: 49 cards. Mean unused Resources at the end: State 4.8, PKK 4.2. Games with a 3-Pass streak: {"state":152,"pkk":50}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":3177,"opSa":3528,"pass":4398,"event":971,"opOnly":938},"pkk":{"opOnly":1602,"limitedOp":3945,"opSa":3327,"event":2278,"pass":1604}}

