# Experiment dd25-v4b-thresholds-46-35 (pilot)

Experiment hash `55968c0f95d15061c8ecd851951643ed00858551200ab3675534d23a52f6f82a`. Analysis version 2.

## Completion

Scheduled 240 games: complete 240. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-POL@4 | 100.0% [79.6%, 100.0%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 20.0% [7.0%, 45.2%] n=15 |
| S-MIL@4 | 100.0% [79.6%, 100.0%] n=15 | 13.3% [3.7%, 37.9%] n=15 | 26.7% [10.9%, 52.0%] n=15 | 86.7% [62.1%, 96.3%] n=15 |
| S-CON@4 | 100.0% [79.6%, 100.0%] n=15 | 40.0% [19.8%, 64.3%] n=15 | 33.3% [15.2%, 58.3%] n=15 | 60.0% [35.7%, 80.2%] n=15 |
| S-ADAPT@4 | 100.0% [79.6%, 100.0%] n=15 | 53.3% [30.1%, 75.2%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 100.0% [79.6%, 100.0%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 54.2% [48.8%, 60.0%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@4 vs P-POL@4 | 26.6 (18 / 30 / 32) | 10/0 | 10/0 | 0/0 |
| S-POL@4 vs P-EXP@4 | -21.5 (-39 / -23 / -6) | 0/8 | 0/9 | 0/0 |
| S-POL@4 vs P-SURV@4 | -7.1 (-21 / -10 / 10) | 1/1 | 1/1 | 0/0 |
| S-POL@4 vs P-ADAPT@4 | -15.3 (-27 / -22 / 5) | 0/7 | 0/7 | 0/0 |
| S-MIL@4 vs P-POL@4 | 25.1 (18 / 28 / 30) | 7/0 | 8/0 | 0/0 |
| S-MIL@4 vs P-EXP@4 | -10.4 (-24 / -9 / 6) | 0/2 | 0/2 | 0/0 |
| S-MIL@4 vs P-SURV@4 | -8.5 (-27 / -8 / 10) | 0/2 | 0/2 | 0/0 |
| S-MIL@4 vs P-ADAPT@4 | 9.9 (0 / 11 / 18) | 1/0 | 1/0 | 0/0 |
| S-CON@4 vs P-POL@4 | 27.7 (25 / 29 / 31) | 12/0 | 12/0 | 0/0 |
| S-CON@4 vs P-EXP@4 | -5.6 (-22 / -7 / 11) | 0/1 | 0/1 | 0/0 |
| S-CON@4 vs P-SURV@4 | -6.9 (-17 / -10 / 5) | 0/0 | 0/0 | 1/0 |
| S-CON@4 vs P-ADAPT@4 | 8.3 (-13 / 11 / 27) | 3/0 | 3/0 | 0/0 |
| S-ADAPT@4 vs P-POL@4 | 27.1 (22 / 29 / 32) | 8/0 | 9/0 | 0/0 |
| S-ADAPT@4 vs P-EXP@4 | -2.6 (-13 / 3 / 11) | 0/1 | 0/1 | 1/0 |
| S-ADAPT@4 vs P-SURV@4 | -8.5 (-20 / -6 / -1) | 0/0 | 0/0 | 3/0 |
| S-ADAPT@4 vs P-ADAPT@4 | 17.9 (5 / 19 / 29) | 3/0 | 3/0 | 1/0 |

Review triggers (not balance pass/fail):

- S-POL@4 vs P-POL@4 (default): State 100.0%
- S-POL@4 vs P-EXP@4 (default): State 6.7%
- S-POL@4 vs P-SURV@4 (default): State 20.0%
- S-POL@4 vs P-ADAPT@4 (default): State 20.0%
- S-MIL@4 vs P-POL@4 (default): State 100.0%
- S-MIL@4 vs P-EXP@4 (default): State 13.3%
- S-MIL@4 vs P-ADAPT@4 (default): State 86.7%
- S-CON@4 vs P-POL@4 (default): State 100.0%
- S-ADAPT@4 vs P-POL@4 (default): State 100.0%
- S-ADAPT@4 vs P-SURV@4 (default): State 6.7%
- S-ADAPT@4 vs P-ADAPT@4 (default): State 100.0%
- S-POL@4 vs P-POL@4 (default): median margin difference 30.0
- S-POL@4 vs P-EXP@4 (default): median margin difference -23.0
- S-POL@4 vs P-SURV@4 (default): median margin difference -10.0
- S-POL@4 vs P-ADAPT@4 (default): median margin difference -22.0
- S-MIL@4 vs P-POL@4 (default): median margin difference 28.0
- S-MIL@4 vs P-ADAPT@4 (default): median margin difference 11.0
- S-CON@4 vs P-POL@4 (default): median margin difference 29.0
- S-CON@4 vs P-SURV@4 (default): median margin difference -10.0
- S-CON@4 vs P-ADAPT@4 (default): median margin difference 11.0
- S-ADAPT@4 vs P-POL@4 (default): median margin difference 29.0
- S-ADAPT@4 vs P-ADAPT@4 (default): median margin difference 19.0

## Scoring routes

Mean final components over 240 completed games: State Support 28.6 + Legitimacy 3.1; PKK Opposition 15.8 + domestic Bases 1.2.
State winners (130): Support 36.9, Legitimacy 3.1. PKK winners (110): Opposition 23.2, Bases 2.3.

## Review selection

Closest: default~S-ADAPTv4~P-SURVv4~7008~r0, default~S-CONv4~P-ADAPTv4~7012~r0, default~S-POLv4~P-SURVv4~7011~r0, default~S-ADAPTv4~P-EXPv4~7011~r0, default~S-CONv4~P-EXPv4~7006~r0

Largest gaps: default~S-POLv4~P-EXPv4~7009~r0, default~S-POLv4~P-EXPv4~7013~r0, default~S-MILv4~P-EXPv4~7013~r0, default~S-POLv4~P-EXPv4~7004~r0, default~S-ADAPTv4~P-ADAPTv4~7008~r0

Seeded random: default~S-ADAPTv4~P-ADAPTv4~7013~r0, default~S-ADAPTv4~P-EXPv4~7014~r0, default~S-POLv4~P-EXPv4~7008~r0, default~S-POLv4~P-POLv4~7001~r0, default~S-MILv4~P-ADAPTv4~7005~r0

Failures: none

## Coverage ledger

77 natural, 12 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 67 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 170 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 3 |
| Final margin reduced by excess Harm | Victory | natural exposure | 6 |
| Rally Agitation | Political economy | natural exposure | 212 |
| Train Civic Action | Political economy | natural exposure | 239 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 185 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 179 |
| State Harm placed | Civilian effects | natural exposure | 224 |
| PKK Harm placed | Civilian effects | natural exposure | 32 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 103 |
| Coerce places Coercion | Civilian effects | natural exposure | 139 |
| Guard upkeep paid | Civilian effects | natural exposure | 206 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 71 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 1 |
| Strike Collaborators | Civilian effects | natural exposure | 14 |
| Europe track change | Civilian effects | natural exposure | 237 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 185 |
| Reception marker placed | Civilian effects | natural exposure | 158 |
| Displacement marker placed | Civilian effects | natural exposure | 2 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 6 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 4 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 29 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 7 |
| Diplomacy | Sanctuary | natural exposure | 3 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 1 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 1 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 235 |
| Shaded Event executed | Sequence/cards | natural exposure | 238 |
| ARGK played | Sequence/cards | natural exposure | 149 |
| Pivotal window declined | Sequence/cards | natural exposure | 127 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 156 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 139 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 229 |
| Covert marker revealed | Civilian effects | natural exposure | 108 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 137 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 68 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 14 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 64 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 68 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 238 |
| Office placed | Political economy | natural exposure | 238 |
| State files a closure case | Political economy | natural exposure | 227 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 1 |
| Legal party banned (line 1) | Political economy | natural exposure | 210 |
| Successor party returns (line 2) | Political economy | natural exposure | 172 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 2 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 132 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 173 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 221 |
| Operation state.train | Sequence/cards | natural exposure | 240 |
| Operation state.garrison | Sequence/cards | natural exposure | 239 |
| Operation state.sweep | Sequence/cards | natural exposure | 240 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 157 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 139 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 1 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 113 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 77 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 34.8%, PKK 14.1%. Longest First Eligible streak: 50 cards. Mean unused Resources at the end: State 4.6, PKK 6.0. Games with a 3-Pass streak: {"state":151,"pkk":58}. Stop-rule flags: {"rule 4":1}.

Boxes by faction: {"state":{"limitedOp":2835,"opSa":3591,"event":1036,"pass":4554,"opOnly":1076},"pkk":{"opOnly":1408,"limitedOp":4013,"opSa":3060,"event":2562,"pass":1813}}

