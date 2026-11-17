# Experiment dd25-v4b (pilot)

Experiment hash `669d5519d61c8e0cceb1c5460ef3e76ba76a5a56194382344fa9f4f3fe324f25`. Analysis version 2.

## Completion

Scheduled 240 games: complete 240. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-POL@4 | 80.0% [54.8%, 93.0%] n=15 | 0.0% [0.0%, 20.4%] n=15 | 26.7% [10.9%, 52.0%] n=15 | 6.7% [1.2%, 29.8%] n=15 |
| S-MIL@4 | 100.0% [79.6%, 100.0%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 66.7% [41.7%, 84.8%] n=15 |
| S-CON@4 | 100.0% [79.6%, 100.0%] n=15 | 33.3% [15.2%, 58.3%] n=15 | 33.3% [15.2%, 58.3%] n=15 | 86.7% [62.1%, 96.3%] n=15 |
| S-ADAPT@4 | 100.0% [79.6%, 100.0%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 13.3% [3.7%, 37.9%] n=15 | 93.3% [70.2%, 98.8%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 48.3% [43.8%, 52.9%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@4 vs P-POL@4 | 12.5 (-1 / 14 / 24) | 3/0 | 3/0 | 0/0 |
| S-POL@4 vs P-EXP@4 | -28.6 (-36 / -29 / -22) | 0/10 | 0/10 | 0/0 |
| S-POL@4 vs P-SURV@4 | -10.1 (-25 / -16 / 8) | 2/0 | 2/2 | 0/0 |
| S-POL@4 vs P-ADAPT@4 | -19.1 (-33 / -20 / -7) | 0/6 | 0/7 | 0/0 |
| S-MIL@4 vs P-POL@4 | 21.3 (16 / 21 / 26) | 5/0 | 5/0 | 0/0 |
| S-MIL@4 vs P-EXP@4 | -20.4 (-39 / -25 / -4) | 0/6 | 0/6 | 0/0 |
| S-MIL@4 vs P-SURV@4 | -19.4 (-31 / -19 / -6) | 0/3 | 0/3 | 4/0 |
| S-MIL@4 vs P-ADAPT@4 | 2.5 (-22 / 9 / 18) | 1/0 | 1/0 | 0/0 |
| S-CON@4 vs P-POL@4 | 21.0 (10 / 22 / 29) | 6/0 | 6/0 | 0/0 |
| S-CON@4 vs P-EXP@4 | -9.3 (-33 / -6 / 8) | 1/2 | 1/2 | 0/0 |
| S-CON@4 vs P-SURV@4 | -7.0 (-28 / -7 / 9) | 1/2 | 1/2 | 0/0 |
| S-CON@4 vs P-ADAPT@4 | 12.7 (0 / 17 / 22) | 1/0 | 1/0 | 0/0 |
| S-ADAPT@4 vs P-POL@4 | 21.7 (16 / 23 / 26) | 1/0 | 2/0 | 0/0 |
| S-ADAPT@4 vs P-EXP@4 | -9.7 (-26 / -9 / 5) | 0/0 | 0/0 | 3/0 |
| S-ADAPT@4 vs P-SURV@4 | -7.9 (-15 / -10 / 4) | 0/0 | 0/0 | 1/0 |
| S-ADAPT@4 vs P-ADAPT@4 | 14.5 (7 / 18 / 22) | 1/1 | 1/1 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@4 vs P-POL@4 (default): State 80.0%
- S-POL@4 vs P-EXP@4 (default): State 0.0%
- S-POL@4 vs P-ADAPT@4 (default): State 6.7%
- S-MIL@4 vs P-POL@4 (default): State 100.0%
- S-MIL@4 vs P-EXP@4 (default): State 6.7%
- S-MIL@4 vs P-SURV@4 (default): State 6.7%
- S-CON@4 vs P-POL@4 (default): State 100.0%
- S-CON@4 vs P-ADAPT@4 (default): State 86.7%
- S-ADAPT@4 vs P-POL@4 (default): State 100.0%
- S-ADAPT@4 vs P-EXP@4 (default): State 20.0%
- S-ADAPT@4 vs P-SURV@4 (default): State 13.3%
- S-ADAPT@4 vs P-ADAPT@4 (default): State 93.3%
- S-POL@4 vs P-POL@4 (default): median margin difference 14.0
- S-POL@4 vs P-EXP@4 (default): median margin difference -29.0
- S-POL@4 vs P-SURV@4 (default): median margin difference -16.0
- S-POL@4 vs P-ADAPT@4 (default): median margin difference -20.0
- S-MIL@4 vs P-POL@4 (default): median margin difference 21.0
- S-MIL@4 vs P-EXP@4 (default): median margin difference -25.0
- S-MIL@4 vs P-SURV@4 (default): median margin difference -19.0
- S-CON@4 vs P-POL@4 (default): median margin difference 22.0
- S-CON@4 vs P-ADAPT@4 (default): median margin difference 17.0
- S-ADAPT@4 vs P-POL@4 (default): median margin difference 23.0
- S-ADAPT@4 vs P-SURV@4 (default): median margin difference -10.0
- S-ADAPT@4 vs P-ADAPT@4 (default): median margin difference 18.0

## Scoring routes

Mean final components over 240 completed games: State Support 29.1 + Legitimacy 3.2; PKK Opposition 15.5 + domestic Bases 1.2.
State winners (116): Support 39.2, Legitimacy 3.1. PKK winners (124): Opposition 22.3, Bases 2.1.

## Review selection

Closest: default~S-ADAPTv4~P-EXPv4~7006~r0, default~S-POLv4~P-POLv4~7012~r0, default~S-CONv4~P-ADAPTv4~7010~r0, default~S-CONv4~P-EXPv4~7008~r0, default~S-MILv4~P-ADAPTv4~7015~r0

Largest gaps: default~S-POLv4~P-EXPv4~7006~r0, default~S-MILv4~P-EXPv4~7013~r0, default~S-MILv4~P-EXPv4~7003~r0, default~S-MILv4~P-EXPv4~7009~r0, default~S-POLv4~P-SURVv4~7002~r0

Seeded random: default~S-ADAPTv4~P-ADAPTv4~7013~r0, default~S-ADAPTv4~P-EXPv4~7014~r0, default~S-POLv4~P-EXPv4~7008~r0, default~S-POLv4~P-POLv4~7001~r0, default~S-MILv4~P-ADAPTv4~7005~r0

Failures: none

## Coverage ledger

75 natural, 14 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 52 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 184 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 2 |
| Final margin reduced by excess Harm | Victory | natural exposure | 8 |
| Rally Agitation | Political economy | natural exposure | 207 |
| Train Civic Action | Political economy | natural exposure | 238 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 184 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 174 |
| State Harm placed | Civilian effects | natural exposure | 225 |
| PKK Harm placed | Civilian effects | natural exposure | 37 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 105 |
| Coerce places Coercion | Civilian effects | natural exposure | 132 |
| Guard upkeep paid | Civilian effects | natural exposure | 208 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 81 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 1 |
| Strike Collaborators | Civilian effects | natural exposure | 15 |
| Europe track change | Civilian effects | natural exposure | 240 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 176 |
| Reception marker placed | Civilian effects | natural exposure | 156 |
| Displacement marker placed | Civilian effects | natural exposure | 4 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 5 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 6 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 34 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 11 |
| Diplomacy | Sanctuary | natural exposure | 5 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 233 |
| Shaded Event executed | Sequence/cards | natural exposure | 239 |
| ARGK played | Sequence/cards | natural exposure | 150 |
| Pivotal window declined | Sequence/cards | natural exposure | 123 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 156 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 121 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 216 |
| Covert marker revealed | Civilian effects | natural exposure | 95 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 141 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 85 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 16 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 53 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 84 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 238 |
| Office placed | Political economy | natural exposure | 238 |
| State files a closure case | Political economy | natural exposure | 214 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 2 |
| Legal party banned (line 1) | Political economy | natural exposure | 207 |
| Successor party returns (line 2) | Political economy | natural exposure | 181 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 3 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 140 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 188 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 214 |
| Operation state.train | Sequence/cards | natural exposure | 239 |
| Operation state.garrison | Sequence/cards | natural exposure | 237 |
| Operation state.sweep | Sequence/cards | natural exposure | 240 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 160 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 132 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 2 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 100 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 72 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 35.7%, PKK 14.4%. Longest First Eligible streak: 53 cards. Mean unused Resources at the end: State 5.0, PKK 7.3. Games with a 3-Pass streak: {"state":162,"pkk":61}. Stop-rule flags: {"rule 4":1}.

Boxes by faction: {"state":{"limitedOp":2789,"opSa":3492,"pass":4608,"event":1054,"opOnly":982},"pkk":{"opOnly":1322,"limitedOp":3926,"opSa":3006,"event":2585,"pass":1823}}

