# Experiment adversarial-6 (adversarial)

Experiment hash `d7a3974ce7b362cb74c357833fc5cfae8d24a4871e51c03a256f6759226cc359`. Analysis version 2.

## Completion

Scheduled 480 games: complete 480. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 | P-CTRL-sanctuary@1 | P-CTRL-concealment@1 | P-CTRL-coerce-only@1 |
|---|---|---|---|---|---|---|---|
| S-CTRL-concentration@1 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 |  |  |  |
| S-CTRL-civic-action@1 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 |  |  |  |
| S-CTRL-emergency-rule@1 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 |  |  |  |
| S-POL@1 |  |  |  |  | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 |
| S-MIL@1 |  |  |  |  | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 |
| S-CON@1 |  |  |  |  | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 |
| S-ADAPT@1 |  |  |  |  | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 |

Equal-weight roster average (this roster only, not a human win probability): State n/a [n/a, n/a] over 0 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-CTRL-concentration@1 vs P-POL@2 | -38.1 (-44 / -39 / -33) | 0/19 | 0/19 | 0/0 |
| S-CTRL-concentration@1 vs P-EXP@2 | -38.2 (-44 / -39 / -32) | 0/17 | 0/17 | 0/0 |
| S-CTRL-concentration@1 vs P-SURV@2 | -37.4 (-42 / -37 / -32) | 0/17 | 0/19 | 0/0 |
| S-CTRL-concentration@1 vs P-ADAPT@2 | -21.6 (-33 / -19 / -16) | 0/3 | 0/3 | 0/0 |
| S-CTRL-civic-action@1 vs P-POL@2 | -36.8 (-42 / -38 / -30) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action@1 vs P-EXP@2 | -38.0 (-44 / -38 / -34) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action@1 vs P-SURV@2 | -28.6 (-35 / -29 / -22) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action@1 vs P-ADAPT@2 | -31.4 (-36 / -32 / -26) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-POL@2 | -47.0 (-53 / -47 / -42) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-EXP@2 | -46.7 (-52 / -47 / -41) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-SURV@2 | -40.2 (-47 / -39 / -31) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-ADAPT@2 | -38.2 (-44 / -38 / -32) | 0/20 | 0/20 | 0/0 |
| S-POL@1 vs P-CTRL-sanctuary@1 | 37.6 (32 / 37 / 42) | 20/0 | 20/0 | 0/0 |
| S-POL@1 vs P-CTRL-concealment@1 | 34.0 (28 / 35 / 37) | 20/0 | 20/0 | 0/0 |
| S-POL@1 vs P-CTRL-coerce-only@1 | 32.2 (27 / 32 / 39) | 20/0 | 20/0 | 0/0 |
| S-MIL@1 vs P-CTRL-sanctuary@1 | 43.1 (38 / 45 / 47) | 20/0 | 20/0 | 0/0 |
| S-MIL@1 vs P-CTRL-concealment@1 | 30.3 (24 / 31 / 35) | 16/0 | 17/0 | 0/0 |
| S-MIL@1 vs P-CTRL-coerce-only@1 | 40.9 (37 / 41 / 45) | 20/0 | 20/0 | 0/0 |
| S-CON@1 vs P-CTRL-sanctuary@1 | 44.5 (41 / 45 / 47) | 20/0 | 20/0 | 0/0 |
| S-CON@1 vs P-CTRL-concealment@1 | 36.0 (33 / 36 / 40) | 20/0 | 20/0 | 0/0 |
| S-CON@1 vs P-CTRL-coerce-only@1 | 37.9 (35 / 39 / 40) | 20/0 | 20/0 | 0/0 |
| S-ADAPT@1 vs P-CTRL-sanctuary@1 | 27.4 (21 / 29 / 31) | 16/0 | 16/0 | 0/0 |
| S-ADAPT@1 vs P-CTRL-concealment@1 | 30.0 (24 / 31 / 35) | 19/0 | 19/0 | 0/0 |
| S-ADAPT@1 vs P-CTRL-coerce-only@1 | 29.4 (23 / 30 / 34) | 14/0 | 15/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-CTRL-concentration@1 vs P-POL@2 (baseline): State 0.0%
- S-CTRL-concentration@1 vs P-EXP@2 (baseline): State 0.0%
- S-CTRL-concentration@1 vs P-SURV@2 (baseline): State 0.0%
- S-CTRL-concentration@1 vs P-ADAPT@2 (baseline): State 0.0%
- S-CTRL-civic-action@1 vs P-POL@2 (baseline): State 0.0%
- S-CTRL-civic-action@1 vs P-EXP@2 (baseline): State 0.0%
- S-CTRL-civic-action@1 vs P-SURV@2 (baseline): State 0.0%
- S-CTRL-civic-action@1 vs P-ADAPT@2 (baseline): State 0.0%
- S-CTRL-emergency-rule@1 vs P-POL@2 (baseline): State 0.0%
- S-CTRL-emergency-rule@1 vs P-EXP@2 (baseline): State 0.0%
- S-CTRL-emergency-rule@1 vs P-SURV@2 (baseline): State 0.0%
- S-CTRL-emergency-rule@1 vs P-ADAPT@2 (baseline): State 0.0%
- S-POL@1 vs P-CTRL-sanctuary@1 (baseline): State 100.0%
- S-POL@1 vs P-CTRL-concealment@1 (baseline): State 100.0%
- S-POL@1 vs P-CTRL-coerce-only@1 (baseline): State 100.0%
- S-MIL@1 vs P-CTRL-sanctuary@1 (baseline): State 100.0%
- S-MIL@1 vs P-CTRL-concealment@1 (baseline): State 100.0%
- S-MIL@1 vs P-CTRL-coerce-only@1 (baseline): State 100.0%
- S-CON@1 vs P-CTRL-sanctuary@1 (baseline): State 100.0%
- S-CON@1 vs P-CTRL-concealment@1 (baseline): State 100.0%
- S-CON@1 vs P-CTRL-coerce-only@1 (baseline): State 100.0%
- S-ADAPT@1 vs P-CTRL-sanctuary@1 (baseline): State 100.0%
- S-ADAPT@1 vs P-CTRL-concealment@1 (baseline): State 100.0%
- S-ADAPT@1 vs P-CTRL-coerce-only@1 (baseline): State 100.0%
- S-CTRL-concentration@1 vs P-POL@2 (baseline): median margin difference -38.5
- S-CTRL-concentration@1 vs P-EXP@2 (baseline): median margin difference -39.0
- S-CTRL-concentration@1 vs P-SURV@2 (baseline): median margin difference -37.0
- S-CTRL-concentration@1 vs P-ADAPT@2 (baseline): median margin difference -19.0
- S-CTRL-civic-action@1 vs P-POL@2 (baseline): median margin difference -38.0
- S-CTRL-civic-action@1 vs P-EXP@2 (baseline): median margin difference -37.5
- S-CTRL-civic-action@1 vs P-SURV@2 (baseline): median margin difference -28.5
- S-CTRL-civic-action@1 vs P-ADAPT@2 (baseline): median margin difference -31.5
- S-CTRL-emergency-rule@1 vs P-POL@2 (baseline): median margin difference -47.0
- S-CTRL-emergency-rule@1 vs P-EXP@2 (baseline): median margin difference -46.5
- S-CTRL-emergency-rule@1 vs P-SURV@2 (baseline): median margin difference -39.0
- S-CTRL-emergency-rule@1 vs P-ADAPT@2 (baseline): median margin difference -38.0
- S-POL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 37.0
- S-POL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 34.5
- S-POL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 32.0
- S-MIL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 44.5
- S-MIL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 30.5
- S-MIL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 40.5
- S-CON@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 45.0
- S-CON@1 vs P-CTRL-concealment@1 (baseline): median margin difference 35.5
- S-CON@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 38.5
- S-ADAPT@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 29.0
- S-ADAPT@1 vs P-CTRL-concealment@1 (baseline): median margin difference 31.0
- S-ADAPT@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 30.0

## Scoring routes

Mean final components over 480 completed games: State Support 27.8 + Legitimacy 11.5; PKK Opposition 17.7 + domestic Bases 3.4.
State winners (240): Support 46.4, Legitimacy 11.5. PKK winners (240): Opposition 32.5, Bases 6.0.

## Review selection

Closest: baseline~S-ADAPTv1~P-CTRL-sanctuaryv1~1002256~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1002258~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1002251~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1002255~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1002265~r0

Largest gaps: baseline~S-CTRL-emergency-rulev1~P-EXPv2~1002250~r0, baseline~S-CTRL-emergency-rulev1~P-EXPv2~1002268~r0, baseline~S-CTRL-emergency-rulev1~P-POLv2~1002250~r0, baseline~S-CTRL-emergency-rulev1~P-POLv2~1002261~r0, baseline~S-CTRL-emergency-rulev1~P-POLv2~1002255~r0

Seeded random: baseline~S-CTRL-civic-actionv1~P-POLv2~1002267~r0, baseline~S-CONv1~P-CTRL-concealmentv1~1002269~r0, baseline~S-CONv1~P-CTRL-sanctuaryv1~1002254~r0, baseline~S-MILv1~P-CTRL-coerce-onlyv1~1002250~r0, baseline~S-POLv1~P-CTRL-concealmentv1~1002262~r0

Failures: none

## Coverage ledger

46 natural, 22 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 480 |
| Win at the opening check | Victory | natural exposure | 441 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 35 |
| Equal final margins decided by Harm, then PKK | Victory | reviewed fixture | 0 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 240 |
| Train Civic Action | Political economy | natural exposure | 320 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 239 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 97 |
| State Harm placed | Civilian effects | natural exposure | 161 |
| PKK Harm placed | Civilian effects | natural exposure | 176 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 181 |
| Coerce places Coercion | Civilian effects | natural exposure | 96 |
| Guard upkeep paid | Civilian effects | natural exposure | 398 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 8 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 30 |
| Strike Collaborators | Civilian effects | reviewed fixture | 0 |
| Europe track change | Civilian effects | natural exposure | 312 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 89 |
| Reception marker placed | Civilian effects | natural exposure | 34 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 480 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 480 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 480 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 480 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 87 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 480 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | reviewed fixture | 0 |
| Diplomacy | Sanctuary | reviewed fixture | 0 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 480 |
| Unshaded Event executed | Sequence/cards | natural exposure | 447 |
| Shaded Event executed | Sequence/cards | natural exposure | 247 |
| ARGK played | Sequence/cards | natural exposure | 196 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 460 |
| Limited Op | Sequence/cards | natural exposure | 480 |
| Op Only | Sequence/cards | natural exposure | 480 |
| Op + SA | Sequence/cards | natural exposure | 427 |
| Redeploy with moves | Sequence/cards | natural exposure | 38 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 480 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 39 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 460 |
| Operation state.garrison | Sequence/cards | natural exposure | 63 |
| Operation state.sweep | Sequence/cards | natural exposure | 109 |
| Operation state.assault | Sequence/cards | natural exposure | 146 |
| Operation pkk.rally | Sequence/cards | natural exposure | 400 |
| Operation pkk.march | Sequence/cards | natural exposure | 267 |
| Operation pkk.attack | Sequence/cards | natural exposure | 125 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 96 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 72 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 33 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 25.2%, PKK 27.0%. Longest First Eligible streak: 15 cards. Mean unused Resources at the end: State 7.7, PKK 5.9. Games with a 3-Pass streak: {"pkk":93,"state":139}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":2259,"opOnly":1356,"pass":2630,"event":3355,"opSa":816},"pkk":{"opOnly":1728,"limitedOp":1473,"opSa":3164,"pass":2762,"event":1093}}

