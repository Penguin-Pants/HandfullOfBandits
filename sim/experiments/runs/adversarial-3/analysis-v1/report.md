# Experiment adversarial-3 (adversarial)

Experiment hash `e6565f2f0d4c0584ba57b66020959edd8663f7880629f7e3ceb7b597b3fddafb`. Analysis version 1.

## Completion

Scheduled 480 games: complete 480. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT | P-CTRL-sanctuary | P-CTRL-concealment | P-CTRL-coerce-only |
|---|---|---|---|---|---|---|---|
| S-CTRL-concentration | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 |  |  |  |
| S-CTRL-civic-action | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 |  |  |  |
| S-CTRL-emergency-rule | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 | 0.0% [0.0%, 16.1%] n=20 |  |  |  |
| S-POL |  |  |  |  | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 |
| S-MIL |  |  |  |  | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 |
| S-CON |  |  |  |  | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 |
| S-ADAPT |  |  |  |  | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 | 100.0% [83.9%, 100.0%] n=20 |

Equal-weight roster average (this roster only, not a human win probability): State 50.0% [50.0%, 50.0%] over 24 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-CTRL-concentration vs P-POL | -39.0 (-43 / -39 / -35) | 0/19 | 0/19 | 0/0 |
| S-CTRL-concentration vs P-EXP | -38.0 (-43 / -38 / -34) | 0/19 | 0/20 | 0/0 |
| S-CTRL-concentration vs P-SURV | -37.9 (-41 / -38 / -34) | 0/20 | 0/20 | 0/0 |
| S-CTRL-concentration vs P-ADAPT | -21.1 (-34 / -20 / -14) | 0/4 | 0/4 | 0/0 |
| S-CTRL-civic-action vs P-POL | -37.5 (-44 / -39 / -30) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action vs P-EXP | -38.6 (-44 / -39 / -33) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action vs P-SURV | -31.5 (-37 / -32 / -26) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action vs P-ADAPT | -31.5 (-37 / -31 / -25) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule vs P-POL | -46.7 (-51 / -47 / -43) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule vs P-EXP | -47.8 (-51 / -48 / -44) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule vs P-SURV | -40.9 (-47 / -42 / -34) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule vs P-ADAPT | -40.1 (-48 / -40 / -35) | 0/20 | 0/20 | 0/0 |
| S-POL vs P-CTRL-sanctuary | 40.2 (35 / 41 / 45) | 20/0 | 20/0 | 0/0 |
| S-POL vs P-CTRL-concealment | 36.6 (30 / 38 / 42) | 20/0 | 20/0 | 0/0 |
| S-POL vs P-CTRL-coerce-only | 34.0 (29 / 34 / 38) | 20/0 | 20/0 | 0/0 |
| S-MIL vs P-CTRL-sanctuary | 45.5 (42 / 46 / 49) | 20/0 | 20/0 | 0/0 |
| S-MIL vs P-CTRL-concealment | 30.8 (28 / 31 / 33) | 20/0 | 20/0 | 0/0 |
| S-MIL vs P-CTRL-coerce-only | 41.2 (38 / 41 / 43) | 20/0 | 20/0 | 0/0 |
| S-CON vs P-CTRL-sanctuary | 47.3 (43 / 48 / 50) | 20/0 | 20/0 | 0/0 |
| S-CON vs P-CTRL-concealment | 37.9 (33 / 38 / 42) | 20/0 | 20/0 | 0/0 |
| S-CON vs P-CTRL-coerce-only | 39.5 (36 / 39 / 42) | 20/0 | 20/0 | 0/0 |
| S-ADAPT vs P-CTRL-sanctuary | 26.4 (21 / 27 / 32) | 13/0 | 13/0 | 0/0 |
| S-ADAPT vs P-CTRL-concealment | 26.6 (19 / 28 / 33) | 15/0 | 15/0 | 0/0 |
| S-ADAPT vs P-CTRL-coerce-only | 31.1 (27 / 31 / 37) | 19/0 | 20/0 | 0/0 |

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
- S-CTRL-concentration@1 vs P-EXP@2 (baseline): median margin difference -37.5
- S-CTRL-concentration@1 vs P-SURV@2 (baseline): median margin difference -38.0
- S-CTRL-concentration@1 vs P-ADAPT@2 (baseline): median margin difference -20.0
- S-CTRL-civic-action@1 vs P-POL@2 (baseline): median margin difference -38.5
- S-CTRL-civic-action@1 vs P-EXP@2 (baseline): median margin difference -39.0
- S-CTRL-civic-action@1 vs P-SURV@2 (baseline): median margin difference -31.5
- S-CTRL-civic-action@1 vs P-ADAPT@2 (baseline): median margin difference -31.0
- S-CTRL-emergency-rule@1 vs P-POL@2 (baseline): median margin difference -47.0
- S-CTRL-emergency-rule@1 vs P-EXP@2 (baseline): median margin difference -48.0
- S-CTRL-emergency-rule@1 vs P-SURV@2 (baseline): median margin difference -42.0
- S-CTRL-emergency-rule@1 vs P-ADAPT@2 (baseline): median margin difference -39.5
- S-POL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 41.0
- S-POL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 38.0
- S-POL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 34.0
- S-MIL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 46.0
- S-MIL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 31.0
- S-MIL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 41.0
- S-CON@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 47.5
- S-CON@1 vs P-CTRL-concealment@1 (baseline): median margin difference 38.0
- S-CON@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 39.0
- S-ADAPT@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 26.5
- S-ADAPT@1 vs P-CTRL-concealment@1 (baseline): median margin difference 27.5
- S-ADAPT@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 31.0

## Scoring routes

Mean final components over 480 completed games: State Support 28.2 + Legitimacy 11.8; PKK Opposition 18.2 + domestic Bases 3.4.
State winners (240): Support 47.2, Legitimacy 11.8. PKK winners (240): Opposition 33.7, Bases 6.0.

## Review selection

Closest: baseline~S-CTRL-concentrationv1~P-ADAPTv2~1000754~r0, baseline~S-ADAPTv1~P-CTRL-concealmentv1~1000761~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1000758~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1000759~r0, baseline~S-ADAPTv1~P-CTRL-sanctuaryv1~1000761~r0

Largest gaps: baseline~S-CTRL-emergency-rulev1~P-EXPv2~1000750~r0, baseline~S-CONv1~P-CTRL-sanctuaryv1~1000753~r0, baseline~S-CTRL-emergency-rulev1~P-POLv2~1000769~r0, baseline~S-MILv1~P-CTRL-sanctuaryv1~1000756~r0, baseline~S-CTRL-emergency-rulev1~P-EXPv2~1000768~r0

Seeded random: baseline~S-CTRL-civic-actionv1~P-POLv2~1000767~r0, baseline~S-CONv1~P-CTRL-concealmentv1~1000769~r0, baseline~S-CONv1~P-CTRL-sanctuaryv1~1000754~r0, baseline~S-MILv1~P-CTRL-coerce-onlyv1~1000750~r0, baseline~S-POLv1~P-CTRL-concealmentv1~1000762~r0

Failures: none

## Coverage ledger

49 natural, 19 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 480 |
| Win at the opening check | Victory | natural exposure | 449 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 29 |
| Equal final margins decided by Harm, then PKK | Victory | reviewed fixture | 0 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 240 |
| Train Civic Action | Political economy | natural exposure | 320 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 240 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 94 |
| State Harm placed | Civilian effects | natural exposure | 121 |
| PKK Harm placed | Civilian effects | natural exposure | 143 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 219 |
| Coerce places Coercion | Civilian effects | natural exposure | 88 |
| Guard upkeep paid | Civilian effects | natural exposure | 391 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 15 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 33 |
| Strike Collaborators | Civilian effects | reviewed fixture | 0 |
| Europe track change | Civilian effects | natural exposure | 287 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 90 |
| Reception marker placed | Civilian effects | natural exposure | 33 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 480 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 480 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 480 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 480 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 104 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 480 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 19 |
| Diplomacy | Sanctuary | reviewed fixture | 0 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 1 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 1 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 480 |
| Unshaded Event executed | Sequence/cards | natural exposure | 450 |
| Shaded Event executed | Sequence/cards | natural exposure | 239 |
| ARGK played | Sequence/cards | natural exposure | 207 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 459 |
| Limited Op | Sequence/cards | natural exposure | 480 |
| Op Only | Sequence/cards | natural exposure | 480 |
| Op + SA | Sequence/cards | natural exposure | 418 |
| Redeploy with moves | Sequence/cards | natural exposure | 38 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 480 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 31 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 460 |
| Operation state.garrison | Sequence/cards | natural exposure | 61 |
| Operation state.sweep | Sequence/cards | natural exposure | 105 |
| Operation state.assault | Sequence/cards | natural exposure | 151 |
| Operation pkk.rally | Sequence/cards | natural exposure | 400 |
| Operation pkk.march | Sequence/cards | natural exposure | 270 |
| Operation pkk.attack | Sequence/cards | natural exposure | 115 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 88 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 65 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 9 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 24.7%, PKK 27.9%. Longest First Eligible streak: 16 cards. Mean unused Resources at the end: State 7.3, PKK 5.7. Games with a 3-Pass streak: {"pkk":84,"state":138}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":2375,"opOnly":1330,"pass":2628,"event":3563,"opSa":760},"pkk":{"opOnly":1819,"limitedOp":1418,"opSa":3333,"pass":2920,"event":959}}

