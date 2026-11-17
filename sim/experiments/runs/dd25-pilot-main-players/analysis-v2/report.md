# Experiment dd25-pilot-main-players (pilot)

Experiment hash `d7a675475b4f6687f7b132f50c35eb9352728c6e41e901c7a02989e9bbb7e844`. Analysis version 2.

## Completion

Scheduled 240 games: complete 240. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 80.0% [54.8%, 93.0%] n=15 | 13.3% [3.7%, 37.9%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 13.3% [3.7%, 37.9%] n=15 |
| S-MIL@1 | 100.0% [79.6%, 100.0%] n=15 | 53.3% [30.1%, 75.2%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 80.0% [54.8%, 93.0%] n=15 |
| S-CON@1 | 100.0% [79.6%, 100.0%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 73.3% [48.0%, 89.1%] n=15 |
| S-ADAPT@1 | 46.7% [24.8%, 69.9%] n=15 | 0.0% [0.0%, 20.4%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 40.0% [19.8%, 64.3%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 42.1% [35.4%, 48.8%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | 7.3 (-7 / 6 / 21) | 1/0 | 1/0 | 0/0 |
| S-POL@1 vs P-EXP@2 | -16.6 (-33 / -18 / -1) | 0/1 | 0/1 | 0/0 |
| S-POL@1 vs P-SURV@2 | -14.1 (-27 / -19 / 8) | 1/0 | 1/0 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | -11.7 (-33 / -9 / 12) | 2/1 | 2/1 | 0/0 |
| S-MIL@1 vs P-POL@2 | 14.3 (2 / 13 / 25) | 2/0 | 2/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 3.1 (-9 / 5 / 18) | 0/0 | 0/0 | 1/1 |
| S-MIL@1 vs P-SURV@2 | -17.3 (-33 / -19 / -5) | 0/1 | 0/2 | 2/0 |
| S-MIL@1 vs P-ADAPT@2 | 9.1 (-5 / 10 / 22) | 3/0 | 3/0 | 0/0 |
| S-CON@1 vs P-POL@2 | 18.1 (7 / 19 / 26) | 3/0 | 5/0 | 0/0 |
| S-CON@1 vs P-EXP@2 | -7.7 (-19 / -8 / 4) | 0/0 | 0/0 | 0/0 |
| S-CON@1 vs P-SURV@2 | -11.0 (-23 / -9 / -2) | 0/0 | 0/0 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 7.7 (-7 / 11 / 20) | 3/0 | 3/0 | 1/0 |
| S-ADAPT@1 vs P-POL@2 | -2.5 (-24 / -8 / 19) | 3/2 | 3/3 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -20.9 (-31 / -23 / -5) | 0/7 | 0/7 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -14.6 (-24 / -15 / 4) | 0/2 | 0/3 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | -4.8 (-25 / -5 / 19) | 1/4 | 1/4 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@1 vs P-POL@2 (default): State 80.0%
- S-POL@1 vs P-EXP@2 (default): State 13.3%
- S-POL@1 vs P-SURV@2 (default): State 20.0%
- S-POL@1 vs P-ADAPT@2 (default): State 13.3%
- S-MIL@1 vs P-POL@2 (default): State 100.0%
- S-MIL@1 vs P-SURV@2 (default): State 6.7%
- S-MIL@1 vs P-ADAPT@2 (default): State 80.0%
- S-CON@1 vs P-POL@2 (default): State 100.0%
- S-CON@1 vs P-EXP@2 (default): State 20.0%
- S-CON@1 vs P-SURV@2 (default): State 6.7%
- S-ADAPT@1 vs P-EXP@2 (default): State 0.0%
- S-ADAPT@1 vs P-SURV@2 (default): State 20.0%
- S-POL@1 vs P-EXP@2 (default): median margin difference -18.0
- S-POL@1 vs P-SURV@2 (default): median margin difference -19.0
- S-MIL@1 vs P-POL@2 (default): median margin difference 13.0
- S-MIL@1 vs P-SURV@2 (default): median margin difference -19.0
- S-MIL@1 vs P-ADAPT@2 (default): median margin difference 10.0
- S-CON@1 vs P-POL@2 (default): median margin difference 19.0
- S-CON@1 vs P-ADAPT@2 (default): median margin difference 11.0
- S-ADAPT@1 vs P-EXP@2 (default): median margin difference -23.0
- S-ADAPT@1 vs P-SURV@2 (default): median margin difference -15.0

## Scoring routes

Mean final components over 240 completed games: State Support 27.8 + Legitimacy 3.5; PKK Opposition 17.0 + domestic Bases 1.1.
State winners (101): Support 37.5, Legitimacy 3.7. PKK winners (139): Opposition 21.4, Bases 1.7.

## Review selection

Closest: default~S-MILv1~P-EXPv2~7013~r0, default~S-MILv1~P-EXPv2~7014~r0, default~S-CONv1~P-ADAPTv2~7006~r0, default~S-CONv1~P-EXPv2~7013~r0, default~S-CONv1~P-SURVv2~7006~r0

Largest gaps: default~S-ADAPTv1~P-EXPv2~7010~r0, default~S-ADAPTv1~P-POLv2~7006~r0, default~S-ADAPTv1~P-SURVv2~7010~r0, default~S-MILv1~P-SURVv2~7005~r0, default~S-POLv1~P-ADAPTv2~7013~r0

Seeded random: default~S-ADAPTv1~P-ADAPTv2~7013~r0, default~S-ADAPTv1~P-EXPv2~7014~r0, default~S-POLv1~P-EXPv2~7008~r0, default~S-POLv1~P-POLv2~7001~r0, default~S-MILv1~P-ADAPTv2~7005~r0

Failures: none

## Coverage ledger

77 natural, 12 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 37 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 198 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 2 |
| Final margin reduced by excess Harm | Victory | natural exposure | 5 |
| Rally Agitation | Political economy | natural exposure | 238 |
| Train Civic Action | Political economy | natural exposure | 240 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 233 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 188 |
| State Harm placed | Civilian effects | natural exposure | 233 |
| PKK Harm placed | Civilian effects | natural exposure | 75 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 118 |
| Coerce places Coercion | Civilian effects | natural exposure | 196 |
| Guard upkeep paid | Civilian effects | natural exposure | 227 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 29 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 1 |
| Strike Collaborators | Civilian effects | natural exposure | 22 |
| Europe track change | Civilian effects | natural exposure | 240 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 215 |
| Reception marker placed | Civilian effects | natural exposure | 173 |
| Displacement marker placed | Civilian effects | natural exposure | 4 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 9 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 8 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 39 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | natural exposure | 1 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 42 |
| Diplomacy | Sanctuary | natural exposure | 19 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 1 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 1 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 240 |
| Shaded Event executed | Sequence/cards | natural exposure | 240 |
| ARGK played | Sequence/cards | natural exposure | 239 |
| Pivotal window declined | Sequence/cards | natural exposure | 177 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 207 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 155 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 230 |
| Covert marker revealed | Civilian effects | natural exposure | 66 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 141 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 88 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 39 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 54 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 84 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 239 |
| Office placed | Political economy | natural exposure | 239 |
| State files a closure case | Political economy | natural exposure | 229 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 1 |
| Legal party banned (line 1) | Political economy | natural exposure | 220 |
| Successor party returns (line 2) | Political economy | natural exposure | 200 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 1 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 161 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 203 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 230 |
| Operation state.train | Sequence/cards | natural exposure | 240 |
| Operation state.garrison | Sequence/cards | natural exposure | 207 |
| Operation state.sweep | Sequence/cards | natural exposure | 232 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 233 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 196 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 2 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 67 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 140 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 40.5%, PKK 14.1%. Longest First Eligible streak: 52 cards. Mean unused Resources at the end: State 10.5, PKK 6.1. Games with a 3-Pass streak: {"state":201,"pkk":59}. Stop-rule flags: {"rule 4":1}.

Boxes by faction: {"state":{"limitedOp":2331,"opSa":3293,"pass":5366,"event":1367,"opOnly":885},"pkk":{"opOnly":1344,"limitedOp":3872,"opSa":3136,"pass":1814,"event":2739}}

