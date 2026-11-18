# Experiment dd25-v4b-variant-b (pilot)

Experiment hash `61b0375f4963d633677fa5ea3a50ea608d3b76ae03e965235131ba818d31c723`. Analysis version 2.

## Completion

Scheduled 240 games: complete 240. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-POL@4 | 100.0% [79.6%, 100.0%] n=15 | 0.0% [0.0%, 20.4%] n=15 | 20.0% [7.0%, 45.2%] n=15 | 20.0% [7.0%, 45.2%] n=15 |
| S-MIL@4 | 100.0% [79.6%, 100.0%] n=15 | 40.0% [19.8%, 64.3%] n=15 | 0.0% [0.0%, 20.4%] n=15 | 60.0% [35.7%, 80.2%] n=15 |
| S-CON@4 | 100.0% [79.6%, 100.0%] n=15 | 33.3% [15.2%, 58.3%] n=15 | 40.0% [19.8%, 64.3%] n=15 | 26.7% [10.9%, 52.0%] n=15 |
| S-ADAPT@4 | 100.0% [79.6%, 100.0%] n=15 | 33.3% [15.2%, 58.3%] n=15 | 46.7% [24.8%, 69.9%] n=15 | 66.7% [41.7%, 84.8%] n=15 |

Equal-weight roster average (this roster only, not a human win probability): State 49.2% [44.2%, 54.6%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@4 vs P-POL@4 | 18.5 (11 / 19 / 26) | 2/0 | 2/0 | 0/0 |
| S-POL@4 vs P-EXP@4 | -21.7 (-30 / -22 / -15) | 0/9 | 0/11 | 0/0 |
| S-POL@4 vs P-SURV@4 | -5.6 (-21 / -6 / 9) | 1/0 | 1/1 | 0/0 |
| S-POL@4 vs P-ADAPT@4 | -16.6 (-33 / -18 / 5) | 0/4 | 0/6 | 0/0 |
| S-MIL@4 vs P-POL@4 | 26.3 (21 / 27 / 33) | 8/0 | 9/0 | 0/0 |
| S-MIL@4 vs P-EXP@4 | -3.7 (-22 / -2 / 12) | 0/1 | 0/1 | 3/0 |
| S-MIL@4 vs P-SURV@4 | -20.7 (-29 / -21 / -7) | 0/1 | 0/2 | 2/0 |
| S-MIL@4 vs P-ADAPT@4 | 2.8 (-15 / 8 / 13) | 0/1 | 0/1 | 0/0 |
| S-CON@4 vs P-POL@4 | 24.0 (17 / 26 / 31) | 7/0 | 7/0 | 0/0 |
| S-CON@4 vs P-EXP@4 | -3.5 (-18 / -5 / 9) | 0/0 | 0/0 | 0/0 |
| S-CON@4 vs P-SURV@4 | -0.3 (-11 / 0 / 15) | 1/0 | 1/0 | 0/0 |
| S-CON@4 vs P-ADAPT@4 | -6.3 (-26 / -13 / 28) | 3/3 | 3/4 | 0/0 |
| S-ADAPT@4 vs P-POL@4 | 26.5 (15 / 30 / 35) | 9/0 | 9/0 | 0/0 |
| S-ADAPT@4 vs P-EXP@4 | -7.8 (-26 / -10 / 10) | 0/0 | 0/0 | 1/0 |
| S-ADAPT@4 vs P-SURV@4 | -4.7 (-21 / -4 / 10) | 0/0 | 0/0 | 2/0 |
| S-ADAPT@4 vs P-ADAPT@4 | 6.6 (-13 / 10 / 24) | 1/0 | 1/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@4 vs P-POL@4 (default): State 100.0%
- S-POL@4 vs P-EXP@4 (default): State 0.0%
- S-POL@4 vs P-SURV@4 (default): State 20.0%
- S-POL@4 vs P-ADAPT@4 (default): State 20.0%
- S-MIL@4 vs P-POL@4 (default): State 100.0%
- S-MIL@4 vs P-SURV@4 (default): State 0.0%
- S-CON@4 vs P-POL@4 (default): State 100.0%
- S-ADAPT@4 vs P-POL@4 (default): State 100.0%
- S-POL@4 vs P-POL@4 (default): median margin difference 19.0
- S-POL@4 vs P-EXP@4 (default): median margin difference -22.0
- S-POL@4 vs P-ADAPT@4 (default): median margin difference -18.0
- S-MIL@4 vs P-POL@4 (default): median margin difference 27.0
- S-MIL@4 vs P-SURV@4 (default): median margin difference -21.0
- S-CON@4 vs P-POL@4 (default): median margin difference 26.0
- S-CON@4 vs P-ADAPT@4 (default): median margin difference -13.0
- S-ADAPT@4 vs P-POL@4 (default): median margin difference 30.0
- S-ADAPT@4 vs P-EXP@4 (default): median margin difference -10.0
- S-ADAPT@4 vs P-ADAPT@4 (default): median margin difference 10.0

## Scoring routes

Mean final components over 240 completed games: State Support 27.3 + Legitimacy 3.3; PKK Opposition 17.2 + domestic Bases 1.4.
State winners (118): Support 36.1, Legitimacy 3.3. PKK winners (122): Opposition 24.1, Bases 2.3.

## Review selection

Closest: default~S-CONv4~P-SURVv4~7010~r0, default~S-CONv4~P-SURVv4~7012~r0, default~S-MILv4~P-EXPv4~7009~r0, default~S-ADAPTv4~P-EXPv4~7007~r0, default~S-ADAPTv4~P-POLv4~7011~r0

Largest gaps: default~S-ADAPTv4~P-POLv4~7001~r0, default~S-POLv4~P-EXPv4~7011~r0, default~S-ADAPTv4~P-POLv4~7015~r0, default~S-MILv4~P-SURVv4~7012~r0, default~S-POLv4~P-ADAPTv4~7001~r0

Seeded random: default~S-ADAPTv4~P-ADAPTv4~7013~r0, default~S-ADAPTv4~P-EXPv4~7014~r0, default~S-POLv4~P-EXPv4~7008~r0, default~S-POLv4~P-POLv4~7001~r0, default~S-MILv4~P-ADAPTv4~7005~r0

Failures: none

## Coverage ledger

76 natural, 13 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 240 |
| Win at the opening check | Victory | natural exposure | 51 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 181 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 3 |
| Final margin reduced by excess Harm | Victory | natural exposure | 8 |
| Rally Agitation | Political economy | natural exposure | 209 |
| Train Civic Action | Political economy | natural exposure | 236 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 192 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 164 |
| State Harm placed | Civilian effects | natural exposure | 227 |
| PKK Harm placed | Civilian effects | natural exposure | 34 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 88 |
| Coerce places Coercion | Civilian effects | natural exposure | 115 |
| Guard upkeep paid | Civilian effects | natural exposure | 194 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 59 |
| Guard Abuse (DK-006 shaded) | Civilian effects | reviewed fixture | 0 |
| Strike Collaborators | Civilian effects | natural exposure | 13 |
| Europe track change | Civilian effects | natural exposure | 238 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 166 |
| Reception marker placed | Civilian effects | natural exposure | 154 |
| Displacement marker placed | Civilian effects | natural exposure | 1 |
| syria posture reaches host | Sanctuary | natural exposure | 240 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 240 |
| syria posture reaches restricted | Sanctuary | natural exposure | 5 |
| syria posture reaches hostile | Sanctuary | natural exposure | 1 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 240 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 240 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 5 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 17 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 240 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 9 |
| Diplomacy | Sanctuary | natural exposure | 2 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 1 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 1 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | natural exposure | 1 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 240 |
| Unshaded Event executed | Sequence/cards | natural exposure | 234 |
| Shaded Event executed | Sequence/cards | natural exposure | 239 |
| ARGK played | Sequence/cards | natural exposure | 189 |
| Pivotal window declined | Sequence/cards | natural exposure | 135 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 168 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 140 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 224 |
| Covert marker revealed | Civilian effects | natural exposure | 103 |
| Strike Collaborators after the Operation | Civilian effects | reviewed fixture | 0 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 135 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 70 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 26 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 51 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 68 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 238 |
| Office placed | Political economy | natural exposure | 238 |
| State files a closure case | Political economy | natural exposure | 222 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 1 |
| Legal party banned (line 1) | Political economy | natural exposure | 211 |
| Successor party returns (line 2) | Political economy | natural exposure | 183 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 1 |
| Pass | Sequence/cards | natural exposure | 240 |
| Limited Op | Sequence/cards | natural exposure | 240 |
| Op Only | Sequence/cards | natural exposure | 240 |
| Op + SA | Sequence/cards | natural exposure | 240 |
| Redeploy with moves | Sequence/cards | natural exposure | 137 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 240 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 189 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 222 |
| Operation state.train | Sequence/cards | natural exposure | 239 |
| Operation state.garrison | Sequence/cards | natural exposure | 240 |
| Operation state.sweep | Sequence/cards | natural exposure | 240 |
| Operation state.assault | Sequence/cards | natural exposure | 240 |
| Operation pkk.rally | Sequence/cards | natural exposure | 240 |
| Operation pkk.march | Sequence/cards | natural exposure | 240 |
| Operation pkk.attack | Sequence/cards | natural exposure | 167 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 115 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 240 |
| Special Activity state.village-clearance | Sequence/cards | reviewed fixture | 0 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 105 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 81 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 34.3%, PKK 13.1%. Longest First Eligible streak: 49 cards. Mean unused Resources at the end: State 4.6, PKK 5.3. Games with a 3-Pass streak: {"state":150,"pkk":47}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":3097,"opSa":3492,"pass":4467,"event":968,"opOnly":1018},"pkk":{"opOnly":1554,"limitedOp":3960,"opSa":3289,"pass":1665,"event":2289}}

