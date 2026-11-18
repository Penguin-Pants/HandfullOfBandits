# Experiment dd25-v4b-thresholds-43-38 (pilot)

Experiment hash `d116a4e084a09d46f8c44ac0f43f3b9c8efce580636668bfacbc33ded68de189`. Analysis version 2.

## Completion

Scheduled 240 games: complete 240. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-POL@4 | 100.0% [79.6%, 100.0%] n=15 | 13.3% [3.7%, 37.9%] n=15 | 46.7% [24.8%, 69.9%] n=15 | 20.0% [7.0%, 45.2%] n=15 |
| S-MIL@4 | 100.0% [79.6%, 100.0%] n=15 | 33.3% [15.2%, 58.3%] n=15 | 33.3% [15.2%, 58.3%] n=15 | 80.0% [54.8%, 93.0%] n=15 |
| S-CON@4 | 100.0% [79.6%, 100.0%] n=15 | 53.3% [30.1%, 75.2%] n=15 | 60.0% [35.7%, 80.2%] n=15 | 100.0% [79.6%, 100.0%] n=15 |
| S-ADAPT@4 | 100.0% [79.6%, 100.0%] n=15 | 46.7% [24.8%, 69.9%] n=15 | 53.3% [30.1%, 75.2%] n=15 | 100.0% [79.6%, 100.0%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 65.0% [60.8%, 69.2%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@4 vs P-POL@4 | 29.1 (15 / 33 / 37) | 11/0 | 11/0 | 0/0 |
| S-POL@4 vs P-EXP@4 | -18.4 (-29 / -21 / -2) | 0/8 | 0/9 | 0/0 |
| S-POL@4 vs P-SURV@4 | -1.8 (-15 / -3 / 8) | 1/0 | 1/0 | 0/0 |
| S-POL@4 vs P-ADAPT@4 | -10.5 (-20 / -10 / 3) | 0/4 | 0/4 | 0/0 |
| S-MIL@4 vs P-POL@4 | 31.5 (29 / 32 / 35) | 11/0 | 12/0 | 0/0 |
| S-MIL@4 vs P-EXP@4 | -7.2 (-22 / -4 / 9) | 0/1 | 0/1 | 0/0 |
| S-MIL@4 vs P-SURV@4 | -2.7 (-16 / -7 / 16) | 0/0 | 0/0 | 2/0 |
| S-MIL@4 vs P-ADAPT@4 | 10.3 (-3 / 12 / 22) | 2/0 | 2/0 | 0/0 |
| S-CON@4 vs P-POL@4 | 31.1 (26 / 33 / 35) | 11/0 | 11/0 | 0/0 |
| S-CON@4 vs P-EXP@4 | 2.4 (-11 / 1 / 17) | 1/0 | 1/0 | 2/0 |
| S-CON@4 vs P-SURV@4 | 4.2 (-14 / 5 / 21) | 3/0 | 3/0 | 0/0 |
| S-CON@4 vs P-ADAPT@4 | 21.7 (10 / 22 / 32) | 7/0 | 7/0 | 0/0 |
| S-ADAPT@4 vs P-POL@4 | 34.1 (30 / 35 / 39) | 12/0 | 13/0 | 0/0 |
| S-ADAPT@4 vs P-EXP@4 | 0.5 (-19 / 0 / 16) | 0/0 | 0/0 | 1/0 |
| S-ADAPT@4 vs P-SURV@4 | 0.3 (-5 / 1 / 9) | 0/0 | 0/0 | 1/0 |
| S-ADAPT@4 vs P-ADAPT@4 | 25.0 (17 / 26 / 31) | 6/0 | 6/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@4 vs P-POL@4 (default): State 100.0%
- S-POL@4 vs P-EXP@4 (default): State 13.3%
- S-POL@4 vs P-ADAPT@4 (default): State 20.0%
- S-MIL@4 vs P-POL@4 (default): State 100.0%
- S-MIL@4 vs P-ADAPT@4 (default): State 80.0%
- S-CON@4 vs P-POL@4 (default): State 100.0%
- S-CON@4 vs P-ADAPT@4 (default): State 100.0%
- S-ADAPT@4 vs P-POL@4 (default): State 100.0%
- S-ADAPT@4 vs P-ADAPT@4 (default): State 100.0%
- State roster average 65.0% > 60%
- S-POL@4 vs P-POL@4 (default): median margin difference 33.0
- S-POL@4 vs P-EXP@4 (default): median margin difference -21.0
- S-POL@4 vs P-ADAPT@4 (default): median margin difference -10.0
- S-MIL@4 vs P-POL@4 (default): median margin difference 32.0
- S-MIL@4 vs P-ADAPT@4 (default): median margin difference 12.0
- S-CON@4 vs P-POL@4 (default): median margin difference 33.0
- S-CON@4 vs P-ADAPT@4 (default): median margin difference 22.0
- S-ADAPT@4 vs P-POL@4 (default): median margin difference 35.0
- S-ADAPT@4 vs P-ADAPT@4 (default): median margin difference 26.0

## Scoring routes

Mean final components over 240 completed games: State Support 28.4 + Legitimacy 3.4; PKK Opposition 16.1 + domestic Bases 1.3.
State winners (156): Support 34.4, Legitimacy 3.6. PKK winners (84): Opposition 24.9, Bases 2.6.

## Review selection

Closest: default~S-ADAPTv4~P-EXPv4~7002~r0, default~S-ADAPTv4~P-SURVv4~7007~r0, default~S-CONv4~P-EXPv4~7012~r0, default~S-ADAPTv4~P-SURVv4~7013~r0, default~S-CONv4~P-EXPv4~7007~r0

Largest gaps: default~S-POLv4~P-POLv4~7009~r0, default~S-ADAPTv4~P-POLv4~7002~r0, default~S-ADAPTv4~P-POLv4~7006~r0, default~S-CONv4~P-POLv4~7008~r0, default~S-MILv4~P-POLv4~7004~r0

Seeded random: default~S-ADAPTv4~P-ADAPTv4~7013~r0, default~S-ADAPTv4~P-EXPv4~7014~r0, default~S-POLv4~P-EXPv4~7008~r0, default~S-POLv4~P-POLv4~7001~r0, default~S-MILv4~P-ADAPTv4~7005~r0

Failures: none

## Coverage ledger

75 natural, 14 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 78 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 159 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 3 |
| Final margin reduced by excess Harm | Victory | natural exposure | 6 |
| Rally Agitation | Political economy | natural exposure | 204 |
| Train Civic Action | Political economy | natural exposure | 235 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 189 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 168 |
| State Harm placed | Civilian effects | natural exposure | 223 |
| PKK Harm placed | Civilian effects | natural exposure | 40 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 95 |
| Coerce places Coercion | Civilian effects | natural exposure | 134 |
| Guard upkeep paid | Civilian effects | natural exposure | 196 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 58 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 1 |
| Strike Collaborators | Civilian effects | natural exposure | 24 |
| Europe track change | Civilian effects | natural exposure | 240 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 172 |
| Reception marker placed | Civilian effects | natural exposure | 160 |
| Displacement marker placed | Civilian effects | reviewed fixture | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 3 |
| syria posture reaches hostile | Sanctuary | natural exposure | 1 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 6 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 30 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 9 |
| Diplomacy | Sanctuary | natural exposure | 1 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | natural exposure | 1 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 233 |
| Shaded Event executed | Sequence/cards | natural exposure | 239 |
| ARGK played | Sequence/cards | natural exposure | 157 |
| Pivotal window declined | Sequence/cards | natural exposure | 116 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 164 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 136 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 223 |
| Covert marker revealed | Civilian effects | natural exposure | 103 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 145 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 77 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 22 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 58 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 75 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 240 |
| Office placed | Political economy | natural exposure | 240 |
| State files a closure case | Political economy | natural exposure | 217 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 6 |
| Legal party banned (line 1) | Political economy | natural exposure | 194 |
| Successor party returns (line 2) | Political economy | natural exposure | 156 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 2 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 146 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 162 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 219 |
| Operation state.train | Sequence/cards | natural exposure | 239 |
| Operation state.garrison | Sequence/cards | natural exposure | 239 |
| Operation state.sweep | Sequence/cards | natural exposure | 239 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 156 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 134 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | reviewed fixture | 0 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 108 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 74 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 35.4%, PKK 12.9%. Longest First Eligible streak: 54 cards. Mean unused Resources at the end: State 4.8, PKK 5.5. Games with a 3-Pass streak: {"state":162,"pkk":50}. Stop-rule flags: {"rule 4":1}.

Boxes by faction: {"state":{"limitedOp":2760,"opSa":3525,"pass":4574,"opOnly":1075,"event":970},"pkk":{"opOnly":1362,"limitedOp":4009,"opSa":3104,"event":2532,"pass":1627}}

