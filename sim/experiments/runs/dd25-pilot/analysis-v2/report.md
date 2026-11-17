# Experiment dd25-pilot (pilot)

Experiment hash `062aa47f18f11bc3671499023f6f9d3ab20e866eef6279ab571423d3fab392db`. Analysis version 2.

## Completion

Scheduled 240 games: complete 240. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 46.7% [24.8%, 69.9%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 13.3% [3.7%, 37.9%] n=15 | 20.0% [7.0%, 45.2%] n=15 |
| S-MIL@1 | 73.3% [48.0%, 89.1%] n=15 | 26.7% [10.9%, 52.0%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 40.0% [19.8%, 64.3%] n=15 |
| S-CON@1 | 100.0% [79.6%, 100.0%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 26.7% [10.9%, 52.0%] n=15 |
| S-ADAPT@1 | 40.0% [19.8%, 64.3%] n=15 | 0.0% [0.0%, 20.4%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 13.3% [3.7%, 37.9%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 28.8% [23.8%, 34.2%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | 0.0 (-26 / -2 / 21) | 4/2 | 4/2 | 0/0 |
| S-POL@1 vs P-EXP@2 | -23.2 (-33 / -24 / -14) | 0/4 | 0/4 | 0/0 |
| S-POL@1 vs P-SURV@2 | -15.2 (-31 / -17 / 3) | 0/0 | 0/0 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | -10.6 (-28 / -7 / 9) | 0/2 | 0/2 | 0/0 |
| S-MIL@1 vs P-POL@2 | 7.0 (-8 / 12 / 19) | 3/0 | 3/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | -8.5 (-33 / -4 / 6) | 1/1 | 1/2 | 1/0 |
| S-MIL@1 vs P-SURV@2 | -17.6 (-29 / -20 / -3) | 0/0 | 0/0 | 2/0 |
| S-MIL@1 vs P-ADAPT@2 | -4.7 (-28 / -3 / 15) | 1/2 | 1/2 | 1/0 |
| S-CON@1 vs P-POL@2 | 18.7 (7 / 18 / 28) | 6/0 | 6/0 | 0/0 |
| S-CON@1 vs P-EXP@2 | -14.5 (-27 / -15 / -3) | 0/2 | 0/2 | 0/0 |
| S-CON@1 vs P-SURV@2 | -5.6 (-12 / -7 / 4) | 0/0 | 0/0 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | -11.5 (-27 / -14 / 5) | 0/1 | 0/1 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -8.0 (-33 / -4 / 16) | 1/4 | 1/4 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -25.1 (-32 / -29 / -13) | 0/10 | 0/10 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -14.9 (-37 / -18 / 10) | 1/0 | 1/1 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | -18.0 (-29 / -23 / 3) | 0/7 | 0/7 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@1 vs P-EXP@2 (default): State 6.7%
- S-POL@1 vs P-SURV@2 (default): State 13.3%
- S-POL@1 vs P-ADAPT@2 (default): State 20.0%
- S-MIL@1 vs P-SURV@2 (default): State 6.7%
- S-CON@1 vs P-POL@2 (default): State 100.0%
- S-CON@1 vs P-EXP@2 (default): State 6.7%
- S-CON@1 vs P-SURV@2 (default): State 20.0%
- S-ADAPT@1 vs P-EXP@2 (default): State 0.0%
- S-ADAPT@1 vs P-SURV@2 (default): State 20.0%
- S-ADAPT@1 vs P-ADAPT@2 (default): State 13.3%
- PKK roster average 71.2% > 60%
- S-POL@1 vs P-EXP@2 (default): median margin difference -24.0
- S-POL@1 vs P-SURV@2 (default): median margin difference -17.0
- S-MIL@1 vs P-POL@2 (default): median margin difference 12.0
- S-MIL@1 vs P-SURV@2 (default): median margin difference -20.0
- S-CON@1 vs P-POL@2 (default): median margin difference 18.0
- S-CON@1 vs P-EXP@2 (default): median margin difference -15.0
- S-CON@1 vs P-ADAPT@2 (default): median margin difference -14.0
- S-ADAPT@1 vs P-EXP@2 (default): median margin difference -29.0
- S-ADAPT@1 vs P-SURV@2 (default): median margin difference -18.0
- S-ADAPT@1 vs P-ADAPT@2 (default): median margin difference -23.0

## Scoring routes

Mean final components over 240 completed games: State Support 24.1 + Legitimacy 4.3; PKK Opposition 19.2 + domestic Bases 1.6.
State winners (69): Support 37.1, Legitimacy 4.6. PKK winners (171): Opposition 22.3, Bases 2.0.

## Review selection

Closest: default~S-ADAPTv1~P-ADAPTv2~7006~r0, default~S-CONv1~P-SURVv2~7014~r0, default~S-MILv1~P-EXPv2~7009~r0, default~S-POLv1~P-ADAPTv2~7002~r0, default~S-ADAPTv1~P-ADAPTv2~7004~r0

Largest gaps: default~S-ADAPTv1~P-ADAPTv2~7013~r0, default~S-MILv1~P-ADAPTv2~7002~r0, default~S-ADAPTv1~P-EXPv2~7012~r0, default~S-ADAPTv1~P-SURVv2~7005~r0, default~S-ADAPTv1~P-SURVv2~7014~r0

Seeded random: default~S-ADAPTv1~P-ADAPTv2~7013~r0, default~S-ADAPTv1~P-EXPv2~7014~r0, default~S-POLv1~P-EXPv2~7008~r0, default~S-POLv1~P-POLv2~7001~r0, default~S-MILv1~P-ADAPTv2~7005~r0

Failures: none

## Coverage ledger

77 natural, 12 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 52 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 186 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 4 |
| Final margin reduced by excess Harm | Victory | natural exposure | 4 |
| Rally Agitation | Political economy | natural exposure | 239 |
| Train Civic Action | Political economy | natural exposure | 240 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 234 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 166 |
| State Harm placed | Civilian effects | natural exposure | 222 |
| PKK Harm placed | Civilian effects | natural exposure | 65 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 100 |
| Coerce places Coercion | Civilian effects | natural exposure | 167 |
| Guard upkeep paid | Civilian effects | natural exposure | 199 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 27 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 4 |
| Strike Collaborators | Civilian effects | natural exposure | 10 |
| Europe track change | Civilian effects | natural exposure | 236 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 192 |
| Reception marker placed | Civilian effects | natural exposure | 142 |
| Displacement marker placed | Civilian effects | natural exposure | 5 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 5 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 15 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 27 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | natural exposure | 1 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 38 |
| Diplomacy | Sanctuary | natural exposure | 18 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | natural exposure | 1 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 237 |
| Shaded Event executed | Sequence/cards | natural exposure | 240 |
| ARGK played | Sequence/cards | natural exposure | 231 |
| Pivotal window declined | Sequence/cards | natural exposure | 164 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 210 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 169 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 211 |
| Covert marker revealed | Civilian effects | natural exposure | 70 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 130 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 80 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 36 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 34 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 77 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 232 |
| Office placed | Political economy | natural exposure | 232 |
| State files a closure case | Political economy | natural exposure | 209 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 1 |
| Legal party banned (line 1) | Political economy | natural exposure | 198 |
| Successor party returns (line 2) | Political economy | natural exposure | 182 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 1 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 148 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 188 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 209 |
| Operation state.train | Sequence/cards | natural exposure | 240 |
| Operation state.garrison | Sequence/cards | natural exposure | 230 |
| Operation state.sweep | Sequence/cards | natural exposure | 239 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 226 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 167 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 3 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 74 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 132 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 35.8%, PKK 11.8%. Longest First Eligible streak: 51 cards. Mean unused Resources at the end: State 8.9, PKK 4.5. Games with a 3-Pass streak: {"state":159,"pkk":40}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":2535,"opSa":3370,"opOnly":801,"pass":4528,"event":1418},"pkk":{"opOnly":1318,"limitedOp":3685,"event":2356,"opSa":3520,"pass":1449}}

