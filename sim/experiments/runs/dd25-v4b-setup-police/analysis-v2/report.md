# Experiment dd25-v4b-setup-police (pilot)

Experiment hash `5463650c7f95d3382500d7831300cf30aa44171c826624cb3c0ce779c4db4cf3`. Analysis version 2.

## Completion

Scheduled 240 games: complete 240. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-POL@4 | 86.7% [62.1%, 96.3%] n=15 | 0.0% [0.0%, 20.4%] n=15 | 26.7% [10.9%, 52.0%] n=15 | 13.3% [3.7%, 37.9%] n=15 |
| S-MIL@4 | 100.0% [79.6%, 100.0%] n=15 | 53.3% [30.1%, 75.2%] n=15 | 0.0% [0.0%, 20.4%] n=15 | 33.3% [15.2%, 58.3%] n=15 |
| S-CON@4 | 100.0% [79.6%, 100.0%] n=15 | 13.3% [3.7%, 37.9%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 13.3% [3.7%, 37.9%] n=15 |
| S-ADAPT@4 | 100.0% [79.6%, 100.0%] n=15 | 0.0% [0.0%, 20.4%] n=15 | 6.7% [1.2%, 29.8%] n=15 | 20.0% [7.0%, 45.2%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 35.8% [30.8%, 40.4%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@4 vs P-POL@4 | 12.5 (-4 / 11 / 27) | 3/0 | 3/0 | 0/0 |
| S-POL@4 vs P-EXP@4 | -26.9 (-36 / -27 / -17) | 0/8 | 0/8 | 0/0 |
| S-POL@4 vs P-SURV@4 | -6.4 (-15 / -5 / 3) | 0/0 | 0/1 | 0/0 |
| S-POL@4 vs P-ADAPT@4 | -16.3 (-28 / -22 / 2) | 1/6 | 1/6 | 0/0 |
| S-MIL@4 vs P-POL@4 | 20.8 (16 / 20 / 26) | 2/0 | 2/0 | 0/0 |
| S-MIL@4 vs P-EXP@4 | -4.7 (-20 / 1 / 7) | 0/0 | 0/0 | 2/0 |
| S-MIL@4 vs P-SURV@4 | -23.5 (-36 / -22 / -13) | 0/2 | 0/2 | 0/0 |
| S-MIL@4 vs P-ADAPT@4 | -7.1 (-24 / -5 / 9) | 0/1 | 0/1 | 0/0 |
| S-CON@4 vs P-POL@4 | 22.3 (15 / 21 / 29) | 6/0 | 7/0 | 0/0 |
| S-CON@4 vs P-EXP@4 | -11.9 (-26 / -8 / 1) | 0/2 | 0/2 | 0/0 |
| S-CON@4 vs P-SURV@4 | -9.3 (-21 / -6 / 0) | 0/0 | 0/0 | 0/0 |
| S-CON@4 vs P-ADAPT@4 | -15.7 (-33 / -14 / -0) | 0/4 | 0/4 | 0/0 |
| S-ADAPT@4 vs P-POL@4 | 23.3 (18 / 23 / 29) | 6/0 | 7/0 | 0/0 |
| S-ADAPT@4 vs P-EXP@4 | -16.2 (-31 / -16 / -3) | 0/0 | 0/0 | 1/0 |
| S-ADAPT@4 vs P-SURV@4 | -20.4 (-34 / -21 / -10) | 0/3 | 0/3 | 1/0 |
| S-ADAPT@4 vs P-ADAPT@4 | -8.6 (-24 / -3 / 2) | 0/2 | 0/2 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@4 vs P-POL@4 (default): State 86.7%
- S-POL@4 vs P-EXP@4 (default): State 0.0%
- S-POL@4 vs P-ADAPT@4 (default): State 13.3%
- S-MIL@4 vs P-POL@4 (default): State 100.0%
- S-MIL@4 vs P-SURV@4 (default): State 0.0%
- S-CON@4 vs P-POL@4 (default): State 100.0%
- S-CON@4 vs P-EXP@4 (default): State 13.3%
- S-CON@4 vs P-SURV@4 (default): State 6.7%
- S-CON@4 vs P-ADAPT@4 (default): State 13.3%
- S-ADAPT@4 vs P-POL@4 (default): State 100.0%
- S-ADAPT@4 vs P-EXP@4 (default): State 0.0%
- S-ADAPT@4 vs P-SURV@4 (default): State 6.7%
- S-ADAPT@4 vs P-ADAPT@4 (default): State 20.0%
- PKK roster average 64.2% > 60%
- S-POL@4 vs P-POL@4 (default): median margin difference 11.0
- S-POL@4 vs P-EXP@4 (default): median margin difference -27.0
- S-POL@4 vs P-ADAPT@4 (default): median margin difference -22.0
- S-MIL@4 vs P-POL@4 (default): median margin difference 20.0
- S-MIL@4 vs P-SURV@4 (default): median margin difference -22.0
- S-CON@4 vs P-POL@4 (default): median margin difference 21.0
- S-CON@4 vs P-ADAPT@4 (default): median margin difference -14.0
- S-ADAPT@4 vs P-POL@4 (default): median margin difference 23.0
- S-ADAPT@4 vs P-EXP@4 (default): median margin difference -16.0
- S-ADAPT@4 vs P-SURV@4 (default): median margin difference -21.0

## Scoring routes

Mean final components over 240 completed games: State Support 27.0 + Legitimacy 2.9; PKK Opposition 17.0 + domestic Bases 1.4.
State winners (86): Support 39.1, Legitimacy 2.7. PKK winners (154): Opposition 21.7, Bases 2.0.

## Review selection

Closest: default~S-ADAPTv4~P-ADAPTv4~7003~r0, default~S-ADAPTv4~P-EXPv4~7007~r0, default~S-CONv4~P-SURVv4~7001~r0, default~S-CONv4~P-SURVv4~7005~r0, default~S-CONv4~P-SURVv4~7006~r0

Largest gaps: default~S-CONv4~P-ADAPTv4~7001~r0, default~S-MILv4~P-ADAPTv4~7009~r0, default~S-MILv4~P-SURVv4~7002~r0, default~S-POLv4~P-EXPv4~7004~r0, default~S-MILv4~P-SURVv4~7009~r0

Seeded random: default~S-ADAPTv4~P-ADAPTv4~7013~r0, default~S-ADAPTv4~P-EXPv4~7014~r0, default~S-POLv4~P-EXPv4~7008~r0, default~S-POLv4~P-POLv4~7001~r0, default~S-MILv4~P-ADAPTv4~7005~r0

Failures: none

## Coverage ledger

74 natural, 15 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 46 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 191 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 7 |
| Final margin reduced by excess Harm | Victory | natural exposure | 4 |
| Rally Agitation | Political economy | natural exposure | 211 |
| Train Civic Action | Political economy | natural exposure | 236 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 190 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 162 |
| State Harm placed | Civilian effects | natural exposure | 229 |
| PKK Harm placed | Civilian effects | natural exposure | 31 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 93 |
| Coerce places Coercion | Civilian effects | natural exposure | 114 |
| Guard upkeep paid | Civilian effects | natural exposure | 194 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 58 |
| Guard Abuse (DK-006 shaded) | Civilian effects | reviewed fixture | 0 |
| Strike Collaborators | Civilian effects | natural exposure | 10 |
| Europe track change | Civilian effects | natural exposure | 240 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 173 |
| Reception marker placed | Civilian effects | natural exposure | 172 |
| Displacement marker placed | Civilian effects | natural exposure | 5 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 3 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 7 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 30 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 9 |
| Diplomacy | Sanctuary | natural exposure | 8 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 2 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 238 |
| Shaded Event executed | Sequence/cards | natural exposure | 240 |
| ARGK played | Sequence/cards | natural exposure | 193 |
| Pivotal window declined | Sequence/cards | natural exposure | 123 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 176 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 147 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 221 |
| Covert marker revealed | Civilian effects | natural exposure | 110 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 137 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 82 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 24 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 58 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 82 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 240 |
| Office placed | Political economy | natural exposure | 240 |
| State files a closure case | Political economy | natural exposure | 219 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 1 |
| Legal party banned (line 1) | Political economy | natural exposure | 213 |
| Successor party returns (line 2) | Political economy | natural exposure | 189 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 3 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 131 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 194 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 218 |
| Operation state.train | Sequence/cards | natural exposure | 237 |
| Operation state.garrison | Sequence/cards | natural exposure | 240 |
| Operation state.sweep | Sequence/cards | natural exposure | 240 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 147 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 114 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 4 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 121 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 65 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 34.1%, PKK 13.3%. Longest First Eligible streak: 45 cards. Mean unused Resources at the end: State 4.6, PKK 5.6. Games with a 3-Pass streak: {"state":153,"pkk":54}. Stop-rule flags: {"rule 4":1,"rule 6":1}.

Boxes by faction: {"state":{"limitedOp":3100,"opSa":3526,"pass":4451,"event":1002,"opOnly":955},"pkk":{"opOnly":1606,"limitedOp":3825,"opSa":3295,"event":2322,"pass":1692}}

