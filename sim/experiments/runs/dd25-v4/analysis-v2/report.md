# Experiment dd25-v4 (pilot)

Experiment hash `5a31782184dfb7e1028301c3ea8bf4db4912d2fa64425b0b7fccb3e296d9a5af`. Analysis version 2.

## Completion

Scheduled 240 games: complete 240. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-POL@4 | 93.3% [70.2%, 98.8%] n=15 | 0.0% [0.0%, 20.4%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 53.3% [30.1%, 75.2%] n=15 |
| S-MIL@4 | 100.0% [79.6%, 100.0%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 73.3% [48.0%, 89.1%] n=15 |
| S-CON@4 | 100.0% [79.6%, 100.0%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 80.0% [54.8%, 93.0%] n=15 |
| S-ADAPT@4 | 93.3% [70.2%, 98.8%] n=15 | 0.0% [0.0%, 20.4%] n=15 | 0.0% [0.0%, 20.4%] n=15 | 46.7% [24.8%, 69.9%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 43.8% [39.6%, 47.5%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@4 vs P-POL@4 | 16.2 (3 / 17 / 28) | 4/0 | 4/0 | 0/0 |
| S-POL@4 vs P-EXP@4 | -28.7 (-36 / -27 / -24) | 0/14 | 0/14 | 0/0 |
| S-POL@4 vs P-SURV@4 | -15.3 (-28 / -15 / -4) | 0/1 | 0/1 | 0/0 |
| S-POL@4 vs P-ADAPT@4 | 0.1 (-22 / 1 / 23) | 3/0 | 3/0 | 0/0 |
| S-MIL@4 vs P-POL@4 | 22.6 (15 / 24 / 28) | 5/0 | 7/0 | 0/0 |
| S-MIL@4 vs P-EXP@4 | -21.1 (-34 / -22 / -8) | 0/4 | 0/4 | 1/0 |
| S-MIL@4 vs P-SURV@4 | -15.9 (-32 / -13 / -3) | 0/0 | 0/0 | 3/0 |
| S-MIL@4 vs P-ADAPT@4 | 5.3 (-7 / 6 / 16) | 1/0 | 1/0 | 0/0 |
| S-CON@4 vs P-POL@4 | 21.0 (15 / 23 / 29) | 5/0 | 5/0 | 0/0 |
| S-CON@4 vs P-EXP@4 | -12.2 (-27 / -15 / 6) | 0/2 | 0/2 | 0/0 |
| S-CON@4 vs P-SURV@4 | -5.5 (-16 / -6 / 1) | 1/0 | 1/0 | 0/0 |
| S-CON@4 vs P-ADAPT@4 | 11.1 (-4 / 10 / 24) | 3/0 | 3/0 | 0/0 |
| S-ADAPT@4 vs P-POL@4 | 19.1 (10 / 21 / 26) | 2/0 | 2/0 | 0/0 |
| S-ADAPT@4 vs P-EXP@4 | -19.5 (-32 / -20 / -4) | 0/1 | 0/1 | 0/0 |
| S-ADAPT@4 vs P-SURV@4 | -15.7 (-26 / -12 / -9) | 0/2 | 0/2 | 1/0 |
| S-ADAPT@4 vs P-ADAPT@4 | -3.5 (-29 / -3 / 11) | 0/2 | 0/2 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@4 vs P-POL@4 (default): State 93.3%
- S-POL@4 vs P-EXP@4 (default): State 0.0%
- S-POL@4 vs P-SURV@4 (default): State 6.7%
- S-MIL@4 vs P-POL@4 (default): State 100.0%
- S-MIL@4 vs P-EXP@4 (default): State 6.7%
- S-MIL@4 vs P-SURV@4 (default): State 6.7%
- S-CON@4 vs P-POL@4 (default): State 100.0%
- S-CON@4 vs P-EXP@4 (default): State 20.0%
- S-CON@4 vs P-SURV@4 (default): State 20.0%
- S-CON@4 vs P-ADAPT@4 (default): State 80.0%
- S-ADAPT@4 vs P-POL@4 (default): State 93.3%
- S-ADAPT@4 vs P-EXP@4 (default): State 0.0%
- S-ADAPT@4 vs P-SURV@4 (default): State 0.0%
- S-POL@4 vs P-POL@4 (default): median margin difference 17.0
- S-POL@4 vs P-EXP@4 (default): median margin difference -27.0
- S-POL@4 vs P-SURV@4 (default): median margin difference -15.0
- S-MIL@4 vs P-POL@4 (default): median margin difference 24.0
- S-MIL@4 vs P-EXP@4 (default): median margin difference -22.0
- S-MIL@4 vs P-SURV@4 (default): median margin difference -13.0
- S-CON@4 vs P-POL@4 (default): median margin difference 23.0
- S-CON@4 vs P-EXP@4 (default): median margin difference -15.0
- S-CON@4 vs P-ADAPT@4 (default): median margin difference 10.0
- S-ADAPT@4 vs P-POL@4 (default): median margin difference 21.0
- S-ADAPT@4 vs P-EXP@4 (default): median margin difference -20.0
- S-ADAPT@4 vs P-SURV@4 (default): median margin difference -12.0

## Scoring routes

Mean final components over 240 completed games: State Support 28.6 + Legitimacy 2.9; PKK Opposition 16.0 + domestic Bases 1.1.
State winners (105): Support 39.4, Legitimacy 2.7. PKK winners (135): Opposition 21.5, Bases 1.8.

## Review selection

Closest: default~S-ADAPTv4~P-POLv4~7010~r0, default~S-CONv4~P-SURVv4~7014~r0, default~S-MILv4~P-SURVv4~7005~r0, default~S-POLv4~P-ADAPTv4~7001~r0, default~S-ADAPTv4~P-EXPv4~7003~r0

Largest gaps: default~S-POLv4~P-EXPv4~7014~r0, default~S-MILv4~P-EXPv4~7013~r0, default~S-ADAPTv4~P-ADAPTv4~7013~r0, default~S-POLv4~P-EXPv4~7012~r0, default~S-ADAPTv4~P-EXPv4~7009~r0

Seeded random: default~S-ADAPTv4~P-ADAPTv4~7013~r0, default~S-ADAPTv4~P-EXPv4~7014~r0, default~S-POLv4~P-EXPv4~7008~r0, default~S-POLv4~P-POLv4~7001~r0, default~S-MILv4~P-ADAPTv4~7005~r0

Failures: none

## Coverage ledger

75 natural, 14 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 50 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 188 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 4 |
| Final margin reduced by excess Harm | Victory | natural exposure | 5 |
| Rally Agitation | Political economy | natural exposure | 210 |
| Train Civic Action | Political economy | natural exposure | 240 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 179 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 187 |
| State Harm placed | Civilian effects | natural exposure | 234 |
| PKK Harm placed | Civilian effects | natural exposure | 27 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 101 |
| Coerce places Coercion | Civilian effects | natural exposure | 150 |
| Guard upkeep paid | Civilian effects | natural exposure | 212 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 78 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 1 |
| Strike Collaborators | Civilian effects | natural exposure | 10 |
| Europe track change | Civilian effects | natural exposure | 231 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 197 |
| Reception marker placed | Civilian effects | natural exposure | 162 |
| Displacement marker placed | Civilian effects | natural exposure | 2 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 5 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 1 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 40 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 8 |
| Diplomacy | Sanctuary | natural exposure | 4 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 236 |
| Shaded Event executed | Sequence/cards | natural exposure | 239 |
| ARGK played | Sequence/cards | natural exposure | 214 |
| Pivotal window declined | Sequence/cards | natural exposure | 101 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 150 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 127 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 216 |
| Covert marker revealed | Civilian effects | natural exposure | 98 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 145 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 93 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 27 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 62 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 92 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 227 |
| Office placed | Political economy | natural exposure | 227 |
| State files a closure case | Political economy | natural exposure | 213 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 2 |
| Legal party banned (line 1) | Political economy | natural exposure | 205 |
| Successor party returns (line 2) | Political economy | natural exposure | 186 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 4 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 143 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 190 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 215 |
| Operation state.train | Sequence/cards | natural exposure | 240 |
| Operation state.garrison | Sequence/cards | natural exposure | 231 |
| Operation state.sweep | Sequence/cards | natural exposure | 240 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 205 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 150 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 1 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 105 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 96 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 239 |

## Diagnostics

Pass share: State 38.2%, PKK 15.3%. Longest First Eligible streak: 55 cards. Mean unused Resources at the end: State 4.7, PKK 7.2. Games with a 3-Pass streak: {"state":172,"pkk":63}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":2089,"opSa":3670,"opOnly":1264,"pass":4881,"event":872},"pkk":{"opOnly":1058,"limitedOp":4469,"event":2808,"opSa":2225,"pass":1907}}

