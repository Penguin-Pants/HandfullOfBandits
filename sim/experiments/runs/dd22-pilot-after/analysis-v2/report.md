# Experiment dd22-pilot-after (pilot)

Experiment hash `53ce892d5b795fd34da6aa98f937d53879caef1d077bcdeea05155c270fbda1f`. Analysis version 2.

## Completion

Scheduled 240 games: complete 237, failed 3. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 73.3% [48.0%, 89.1%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 13.3% [3.7%, 37.9%] n=15 | 80.0% [54.8%, 93.0%] n=15 |
| S-MIL@1 | 100.0% [79.6%, 100.0%] n=15 | 71.4% [45.4%, 88.3%] n=14 (+1 incomplete) | 35.7% [16.3%, 61.2%] n=14 (+1 incomplete) | 80.0% [54.8%, 93.0%] n=15 |
| S-CON@1 | 100.0% [79.6%, 100.0%] n=15 | 85.7% [60.1%, 96.0%] n=14 (+1 incomplete) | 60.0% [35.7%, 80.2%] n=15 | 100.0% [79.6%, 100.0%] n=15 |
| S-ADAPT@1 | 100.0% [79.6%, 100.0%] n=15 | 46.7% [24.8%, 69.9%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 80.0% [54.8%, 93.0%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 65.8% [59.9%, 71.8%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | 10.1 (-11 / 16 / 23) | 7/0 | 7/0 | 0/0 |
| S-POL@1 vs P-EXP@2 | -17.4 (-30 / -17 / -7) | 0/5 | 0/5 | 0/0 |
| S-POL@1 vs P-SURV@2 | -10.3 (-23 / -12 / 8) | 1/1 | 1/1 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 12.3 (-7 / 16 / 24) | 7/0 | 7/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 18.3 (13 / 17 / 25) | 6/0 | 6/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 8.3 (-2 / 6 / 22) | 4/0 | 4/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | -5.7 (-20 / -12 / 9) | 1/0 | 1/0 | 1/0 |
| S-MIL@1 vs P-ADAPT@2 | 12.0 (-2 / 16 / 21) | 6/0 | 6/0 | 0/0 |
| S-CON@1 vs P-POL@2 | 17.5 (12 / 16 / 24) | 4/0 | 4/0 | 0/0 |
| S-CON@1 vs P-EXP@2 | 11.7 (0 / 10 / 26) | 4/0 | 4/0 | 1/0 |
| S-CON@1 vs P-SURV@2 | -0.2 (-23 / 5 / 15) | 0/0 | 0/1 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 15.7 (5 / 16 / 25) | 8/0 | 8/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | 13.5 (3 / 13 / 23) | 5/0 | 5/0 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -1.9 (-27 / -2 / 19) | 2/0 | 2/0 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -11.6 (-29 / -15 / 12) | 1/0 | 1/2 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 10.1 (-3 / 13 / 23) | 5/0 | 5/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@1 vs P-EXP@2 (default): State 6.7%
- S-POL@1 vs P-SURV@2 (default): State 13.3%
- S-POL@1 vs P-ADAPT@2 (default): State 80.0%
- S-MIL@1 vs P-POL@2 (default): State 100.0%
- S-MIL@1 vs P-ADAPT@2 (default): State 80.0%
- S-CON@1 vs P-POL@2 (default): State 100.0%
- S-CON@1 vs P-EXP@2 (default): State 85.7%
- S-CON@1 vs P-ADAPT@2 (default): State 100.0%
- S-ADAPT@1 vs P-POL@2 (default): State 100.0%
- S-ADAPT@1 vs P-SURV@2 (default): State 20.0%
- S-ADAPT@1 vs P-ADAPT@2 (default): State 80.0%
- State roster average 65.8% > 60%
- S-POL@1 vs P-POL@2 (default): median margin difference 16.0
- S-POL@1 vs P-EXP@2 (default): median margin difference -17.0
- S-POL@1 vs P-SURV@2 (default): median margin difference -12.0
- S-POL@1 vs P-ADAPT@2 (default): median margin difference 16.0
- S-MIL@1 vs P-POL@2 (default): median margin difference 17.0
- S-MIL@1 vs P-SURV@2 (default): median margin difference -12.0
- S-MIL@1 vs P-ADAPT@2 (default): median margin difference 16.0
- S-CON@1 vs P-POL@2 (default): median margin difference 16.0
- S-CON@1 vs P-EXP@2 (default): median margin difference 10.0
- S-CON@1 vs P-ADAPT@2 (default): median margin difference 16.0
- S-ADAPT@1 vs P-POL@2 (default): median margin difference 13.0
- S-ADAPT@1 vs P-SURV@2 (default): median margin difference -15.0
- S-ADAPT@1 vs P-ADAPT@2 (default): median margin difference 13.0

## Scoring routes

Mean final components over 237 completed games: State Support 33.7 + Legitimacy 4.0; PKK Opposition 12.8 + domestic Bases 0.7.
State winners (156): Support 39.3, Legitimacy 4.6. PKK winners (81): Opposition 19.0, Bases 1.6.

## Review selection

Closest: default~S-CONv1~P-EXPv2~7005~r0, default~S-CONv1~P-SURVv2~7015~r0, default~S-MILv1~P-ADAPTv2~7010~r0, default~S-MILv1~P-EXPv2~7006~r0, default~S-POLv1~P-ADAPTv2~7009~r0

Largest gaps: default~S-CONv1~P-SURVv2~7012~r0, default~S-ADAPTv1~P-EXPv2~7012~r0, default~S-ADAPTv1~P-SURVv2~7005~r0, default~S-ADAPTv1~P-SURVv2~7009~r0, default~S-POLv1~P-ADAPTv2~7008~r0

Seeded random: default~S-ADAPTv1~P-POLv2~7003~r0, default~S-MILv1~P-EXPv2~7004~r0, default~S-ADAPTv1~P-ADAPTv2~7002~r0, default~S-POLv1~P-EXPv2~7004~r0, default~S-ADAPTv1~P-EXPv2~7015~r0

Failures: default~S-MILv1~P-EXPv2~7008~r0, default~S-MILv1~P-SURVv2~7008~r0, default~S-CONv1~P-EXPv2~7009~r0

## Coverage ledger

76 natural, 13 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 67 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 167 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 5 |
| Final margin reduced by excess Harm | Victory | natural exposure | 2 |
| Rally Agitation | Political economy | natural exposure | 238 |
| Train Civic Action | Political economy | natural exposure | 240 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 228 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 208 |
| State Harm placed | Civilian effects | natural exposure | 227 |
| PKK Harm placed | Civilian effects | natural exposure | 65 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 124 |
| Coerce places Coercion | Civilian effects | natural exposure | 183 |
| Guard upkeep paid | Civilian effects | natural exposure | 230 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 27 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 6 |
| Strike Collaborators | Civilian effects | natural exposure | 11 |
| Europe track change | Civilian effects | natural exposure | 238 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 205 |
| Reception marker placed | Civilian effects | natural exposure | 169 |
| Displacement marker placed | Civilian effects | reviewed fixture | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 6 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 6 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 36 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | natural exposure | 1 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 26 |
| Diplomacy | Sanctuary | natural exposure | 14 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 2 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 2 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 2 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 239 |
| Shaded Event executed | Sequence/cards | natural exposure | 240 |
| ARGK played | Sequence/cards | natural exposure | 80 |
| Pivotal window declined | Sequence/cards | natural exposure | 125 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 124 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 112 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 220 |
| Covert marker revealed | Civilian effects | natural exposure | 71 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 143 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 70 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 46 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 51 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 69 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 240 |
| Office placed | Political economy | natural exposure | 240 |
| State files a closure case | Political economy | natural exposure | 217 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 2 |
| Legal party banned (line 1) | Political economy | natural exposure | 196 |
| Successor party returns (line 2) | Political economy | natural exposure | 164 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 2 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 142 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 170 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 216 |
| Operation state.train | Sequence/cards | natural exposure | 240 |
| Operation state.garrison | Sequence/cards | natural exposure | 239 |
| Operation state.sweep | Sequence/cards | natural exposure | 228 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 205 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 183 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | reviewed fixture | 0 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 76 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 117 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 39.5%, PKK 15.8%. Longest First Eligible streak: 53 cards. Mean unused Resources at the end: State 7.8, PKK 4.4. Games with a 3-Pass streak: {"state":205,"pkk":50}. Stop-rule flags: {"rule 4":1}.

Boxes by faction: {"state":{"limitedOp":2766,"opSa":2756,"pass":5096,"event":1370,"opOnly":900},"pkk":{"opOnly":1344,"event":2939,"opSa":3174,"limitedOp":3266,"pass":2012}}

