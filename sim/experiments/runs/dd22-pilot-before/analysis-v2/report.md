# Experiment dd22-pilot-before (pilot)

Experiment hash `1ca3c9fccbd38d1afcf4a5acfaae8b458da262ad8fdeddd683da27cebaffa88e`. Analysis version 2.

## Completion

Scheduled 240 games: complete 240. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 73.3% [48.0%, 89.1%] n=15 | 46.7% [24.8%, 69.9%] n=15 | 86.7% [62.1%, 96.3%] n=15 | 93.3% [70.2%, 98.8%] n=15 |
| S-MIL@1 | 100.0% [79.6%, 100.0%] n=15 | 80.0% [54.8%, 93.0%] n=15 | 80.0% [54.8%, 93.0%] n=15 | 100.0% [79.6%, 100.0%] n=15 |
| S-CON@1 | 93.3% [70.2%, 98.8%] n=15 | 46.7% [24.8%, 69.9%] n=15 | 73.3% [48.0%, 89.1%] n=15 | 93.3% [70.2%, 98.8%] n=15 |
| S-ADAPT@1 | 86.7% [62.1%, 96.3%] n=15 | 26.7% [10.9%, 52.0%] n=15 | 46.7% [24.8%, 69.9%] n=15 | 80.0% [54.8%, 93.0%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 75.4% [68.3%, 81.7%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | 5.1 (-18 / 6 / 27) | 2/1 | 2/1 | 0/0 |
| S-POL@1 vs P-EXP@2 | -4.9 (-33 / -15 / 26) | 2/2 | 2/3 | 0/0 |
| S-POL@1 vs P-SURV@2 | 8.9 (-3 / 9 / 20) | 5/0 | 5/0 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 19.5 (2 / 22 / 34) | 8/0 | 8/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 21.4 (11 / 22 / 33) | 6/0 | 6/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 9.2 (-14 / 14 / 25) | 2/1 | 2/1 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 9.6 (-6 / 8 / 27) | 4/1 | 4/1 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 26.7 (18 / 26 / 34) | 13/0 | 13/0 | 0/0 |
| S-CON@1 vs P-POL@2 | 21.4 (10 / 25 / 30) | 7/0 | 7/0 | 0/0 |
| S-CON@1 vs P-EXP@2 | 0.5 (-14 / -1 / 21) | 2/1 | 2/1 | 0/0 |
| S-CON@1 vs P-SURV@2 | 9.3 (-6 / 16 / 22) | 7/0 | 7/0 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 26.8 (23 / 28 / 34) | 13/0 | 13/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | 18.1 (2 / 25 / 31) | 7/1 | 8/1 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -11.8 (-29 / -17 / 10) | 0/3 | 0/3 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -1.2 (-14 / -3 / 16) | 1/2 | 1/2 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 9.2 (-26 / 18 / 28) | 6/2 | 6/2 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@1 vs P-SURV@2 (default): State 86.7%
- S-POL@1 vs P-ADAPT@2 (default): State 93.3%
- S-MIL@1 vs P-POL@2 (default): State 100.0%
- S-MIL@1 vs P-EXP@2 (default): State 80.0%
- S-MIL@1 vs P-SURV@2 (default): State 80.0%
- S-MIL@1 vs P-ADAPT@2 (default): State 100.0%
- S-CON@1 vs P-POL@2 (default): State 93.3%
- S-CON@1 vs P-ADAPT@2 (default): State 93.3%
- S-ADAPT@1 vs P-POL@2 (default): State 86.7%
- S-ADAPT@1 vs P-ADAPT@2 (default): State 80.0%
- State roster average 75.4% > 60%
- S-POL@1 vs P-EXP@2 (default): median margin difference -15.0
- S-POL@1 vs P-ADAPT@2 (default): median margin difference 22.0
- S-MIL@1 vs P-POL@2 (default): median margin difference 22.0
- S-MIL@1 vs P-EXP@2 (default): median margin difference 14.0
- S-MIL@1 vs P-ADAPT@2 (default): median margin difference 26.0
- S-CON@1 vs P-POL@2 (default): median margin difference 25.0
- S-CON@1 vs P-SURV@2 (default): median margin difference 16.0
- S-CON@1 vs P-ADAPT@2 (default): median margin difference 28.0
- S-ADAPT@1 vs P-POL@2 (default): median margin difference 25.0
- S-ADAPT@1 vs P-EXP@2 (default): median margin difference -17.0
- S-ADAPT@1 vs P-ADAPT@2 (default): median margin difference 18.0

## Scoring routes

Mean final components over 240 completed games: State Support 35.5 + Legitimacy 4.0; PKK Opposition 9.4 + domestic Bases 0.6.
State winners (181): Support 40.5, Legitimacy 4.3. PKK winners (59): Opposition 19.4, Bases 1.7.

## Review selection

Closest: default~S-ADAPTv1~P-POLv2~7009~r0, default~S-ADAPTv1~P-EXPv2~7015~r0, default~S-CONv1~P-EXPv2~7003~r0, default~S-CONv1~P-EXPv2~7009~r0, default~S-CONv1~P-SURVv2~7010~r0

Largest gaps: default~S-CONv1~P-EXPv2~7013~r0, default~S-POLv1~P-EXPv2~7015~r0, default~S-POLv1~P-POLv2~7013~r0, default~S-CONv1~P-ADAPTv2~7008~r0, default~S-POLv1~P-ADAPTv2~7014~r0

Seeded random: default~S-ADAPTv1~P-ADAPTv2~7013~r0, default~S-ADAPTv1~P-EXPv2~7014~r0, default~S-POLv1~P-EXPv2~7008~r0, default~S-POLv1~P-POLv2~7001~r0, default~S-MILv1~P-ADAPTv2~7005~r0

Failures: none

## Coverage ledger

76 natural, 13 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 99 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 139 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 1 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 224 |
| Train Civic Action | Political economy | natural exposure | 239 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 196 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 190 |
| State Harm placed | Civilian effects | natural exposure | 221 |
| PKK Harm placed | Civilian effects | natural exposure | 65 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 108 |
| Coerce places Coercion | Civilian effects | natural exposure | 115 |
| Guard upkeep paid | Civilian effects | natural exposure | 221 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 26 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 3 |
| Strike Collaborators | Civilian effects | natural exposure | 20 |
| Europe track change | Civilian effects | natural exposure | 237 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 184 |
| Reception marker placed | Civilian effects | natural exposure | 161 |
| Displacement marker placed | Civilian effects | natural exposure | 1 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 11 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 32 |
| kdp posture reaches hostile | Sanctuary | natural exposure | 4 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 31 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | natural exposure | 2 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 65 |
| Diplomacy | Sanctuary | natural exposure | 40 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 4 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 3 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 236 |
| Shaded Event executed | Sequence/cards | natural exposure | 240 |
| ARGK played | Sequence/cards | natural exposure | 144 |
| Pivotal window declined | Sequence/cards | natural exposure | 109 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 95 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 80 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 203 |
| Covert marker revealed | Civilian effects | natural exposure | 40 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 118 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 75 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 25 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 33 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 72 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 229 |
| Office placed | Political economy | natural exposure | 229 |
| State files a closure case | Political economy | natural exposure | 200 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 1 |
| Legal party banned (line 1) | Political economy | natural exposure | 178 |
| Successor party returns (line 2) | Political economy | natural exposure | 141 |
| Europe Ban marker placed (DK-064) | Sanctuary | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 131 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 141 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 201 |
| Operation state.train | Sequence/cards | natural exposure | 240 |
| Operation state.garrison | Sequence/cards | natural exposure | 238 |
| Operation state.sweep | Sequence/cards | natural exposure | 214 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 147 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 115 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | reviewed fixture | 0 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 46 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 80 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 36.0%, PKK 19.2%. Longest First Eligible streak: 50 cards. Mean unused Resources at the end: State 6.2, PKK 6.4. Games with a 3-Pass streak: {"state":175,"pkk":59}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":2985,"opSa":2906,"pass":4453,"event":1151,"opOnly":869},"pkk":{"opOnly":1225,"limitedOp":2939,"opSa":2858,"event":2818,"pass":2334}}

