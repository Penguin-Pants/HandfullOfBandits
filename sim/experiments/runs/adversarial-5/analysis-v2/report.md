# Experiment adversarial-5 (adversarial)

Experiment hash `13465b509691585748ced4dbcbd8b742bc7faccb086de83322cc317d0a476418`. Analysis version 2.

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
| S-CTRL-concentration@1 vs P-POL@2 | -36.9 (-42 / -35 / -32) | 0/16 | 0/16 | 0/0 |
| S-CTRL-concentration@1 vs P-EXP@2 | -37.3 (-41 / -38 / -33) | 0/18 | 0/18 | 0/0 |
| S-CTRL-concentration@1 vs P-SURV@2 | -36.5 (-40 / -36 / -34) | 0/20 | 0/20 | 0/0 |
| S-CTRL-concentration@1 vs P-ADAPT@2 | -20.1 (-28 / -19 / -15) | 0/0 | 0/0 | 0/0 |
| S-CTRL-civic-action@1 vs P-POL@2 | -34.6 (-42 / -34 / -26) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action@1 vs P-EXP@2 | -35.9 (-40 / -36 / -31) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action@1 vs P-SURV@2 | -30.4 (-35 / -31 / -24) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action@1 vs P-ADAPT@2 | -30.9 (-38 / -32 / -25) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-POL@2 | -47.3 (-51 / -48 / -43) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-EXP@2 | -46.0 (-50 / -46 / -42) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-SURV@2 | -40.6 (-44 / -42 / -35) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-ADAPT@2 | -39.4 (-44 / -40 / -36) | 0/20 | 0/20 | 0/0 |
| S-POL@1 vs P-CTRL-sanctuary@1 | 38.6 (34 / 39 / 44) | 20/0 | 20/0 | 0/0 |
| S-POL@1 vs P-CTRL-concealment@1 | 37.3 (31 / 37 / 42) | 20/0 | 20/0 | 0/0 |
| S-POL@1 vs P-CTRL-coerce-only@1 | 32.8 (28 / 33 / 39) | 19/0 | 20/0 | 0/0 |
| S-MIL@1 vs P-CTRL-sanctuary@1 | 45.0 (43 / 45 / 48) | 20/0 | 20/0 | 0/0 |
| S-MIL@1 vs P-CTRL-concealment@1 | 31.1 (28 / 30 / 35) | 20/0 | 20/0 | 0/0 |
| S-MIL@1 vs P-CTRL-coerce-only@1 | 40.9 (38 / 41 / 43) | 20/0 | 20/0 | 0/0 |
| S-CON@1 vs P-CTRL-sanctuary@1 | 45.4 (43 / 46 / 48) | 20/0 | 20/0 | 0/0 |
| S-CON@1 vs P-CTRL-concealment@1 | 38.7 (32 / 39 / 44) | 20/0 | 20/0 | 0/0 |
| S-CON@1 vs P-CTRL-coerce-only@1 | 37.8 (35 / 38 / 40) | 20/0 | 20/0 | 0/0 |
| S-ADAPT@1 vs P-CTRL-sanctuary@1 | 29.9 (23 / 30 / 35) | 18/0 | 18/0 | 0/0 |
| S-ADAPT@1 vs P-CTRL-concealment@1 | 29.9 (26 / 31 / 34) | 18/0 | 18/0 | 0/0 |
| S-ADAPT@1 vs P-CTRL-coerce-only@1 | 30.2 (22 / 31 / 35) | 16/0 | 17/0 | 0/0 |

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
- S-CTRL-concentration@1 vs P-POL@2 (baseline): median margin difference -35.0
- S-CTRL-concentration@1 vs P-EXP@2 (baseline): median margin difference -38.0
- S-CTRL-concentration@1 vs P-SURV@2 (baseline): median margin difference -35.5
- S-CTRL-concentration@1 vs P-ADAPT@2 (baseline): median margin difference -18.5
- S-CTRL-civic-action@1 vs P-POL@2 (baseline): median margin difference -34.0
- S-CTRL-civic-action@1 vs P-EXP@2 (baseline): median margin difference -36.0
- S-CTRL-civic-action@1 vs P-SURV@2 (baseline): median margin difference -31.0
- S-CTRL-civic-action@1 vs P-ADAPT@2 (baseline): median margin difference -32.0
- S-CTRL-emergency-rule@1 vs P-POL@2 (baseline): median margin difference -47.5
- S-CTRL-emergency-rule@1 vs P-EXP@2 (baseline): median margin difference -45.5
- S-CTRL-emergency-rule@1 vs P-SURV@2 (baseline): median margin difference -41.5
- S-CTRL-emergency-rule@1 vs P-ADAPT@2 (baseline): median margin difference -40.0
- S-POL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 38.5
- S-POL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 37.0
- S-POL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 32.5
- S-MIL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 44.5
- S-MIL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 30.0
- S-MIL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 41.0
- S-CON@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 46.0
- S-CON@1 vs P-CTRL-concealment@1 (baseline): median margin difference 39.0
- S-CON@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 38.0
- S-ADAPT@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 29.5
- S-ADAPT@1 vs P-CTRL-concealment@1 (baseline): median margin difference 30.5
- S-ADAPT@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 30.5

## Scoring routes

Mean final components over 480 completed games: State Support 28.1 + Legitimacy 11.9; PKK Opposition 17.6 + domestic Bases 3.4.
State winners (240): Support 47.0, Legitimacy 12.0. PKK winners (240): Opposition 32.5, Bases 5.9.

## Review selection

Closest: baseline~S-CTRL-concentrationv1~P-ADAPTv2~1001758~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1001755~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1001769~r0, baseline~S-CTRL-civic-actionv1~P-ADAPTv2~1001751~r0, baseline~S-CTRL-civic-actionv1~P-SURVv2~1001753~r0

Largest gaps: baseline~S-CTRL-emergency-rulev1~P-POLv2~1001758~r0, baseline~S-CTRL-emergency-rulev1~P-EXPv2~1001758~r0, baseline~S-CTRL-emergency-rulev1~P-POLv2~1001756~r0, baseline~S-MILv1~P-CTRL-sanctuaryv1~1001758~r0, baseline~S-CTRL-emergency-rulev1~P-EXPv2~1001750~r0

Seeded random: baseline~S-CTRL-civic-actionv1~P-POLv2~1001767~r0, baseline~S-CONv1~P-CTRL-concealmentv1~1001769~r0, baseline~S-CONv1~P-CTRL-sanctuaryv1~1001754~r0, baseline~S-MILv1~P-CTRL-coerce-onlyv1~1001750~r0, baseline~S-POLv1~P-CTRL-concealmentv1~1001762~r0

Failures: none

## Coverage ledger

48 natural, 20 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 480 |
| Win at the opening check | Victory | natural exposure | 445 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 33 |
| Equal final margins decided by Harm, then PKK | Victory | reviewed fixture | 0 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 240 |
| Train Civic Action | Political economy | natural exposure | 320 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 240 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 86 |
| State Harm placed | Civilian effects | natural exposure | 118 |
| PKK Harm placed | Civilian effects | natural exposure | 149 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 212 |
| Coerce places Coercion | Civilian effects | natural exposure | 88 |
| Guard upkeep paid | Civilian effects | natural exposure | 383 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 9 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 34 |
| Strike Collaborators | Civilian effects | natural exposure | 1 |
| Europe track change | Civilian effects | natural exposure | 301 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 85 |
| Reception marker placed | Civilian effects | natural exposure | 30 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 480 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 480 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 480 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 480 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 101 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 480 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 1 |
| Diplomacy | Sanctuary | reviewed fixture | 0 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 480 |
| Unshaded Event executed | Sequence/cards | natural exposure | 452 |
| Shaded Event executed | Sequence/cards | natural exposure | 227 |
| ARGK played | Sequence/cards | natural exposure | 195 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 455 |
| Limited Op | Sequence/cards | natural exposure | 480 |
| Op Only | Sequence/cards | natural exposure | 480 |
| Op + SA | Sequence/cards | natural exposure | 428 |
| Redeploy with moves | Sequence/cards | natural exposure | 35 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 480 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 35 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 459 |
| Operation state.garrison | Sequence/cards | natural exposure | 58 |
| Operation state.sweep | Sequence/cards | natural exposure | 109 |
| Operation state.assault | Sequence/cards | natural exposure | 157 |
| Operation pkk.rally | Sequence/cards | natural exposure | 400 |
| Operation pkk.march | Sequence/cards | natural exposure | 266 |
| Operation pkk.attack | Sequence/cards | natural exposure | 112 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 88 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 74 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 23 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 24.6%, PKK 27.6%. Longest First Eligible streak: 18 cards. Mean unused Resources at the end: State 7.7, PKK 5.6. Games with a 3-Pass streak: {"state":135,"pkk":92}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":2360,"opOnly":1337,"pass":2577,"opSa":764,"event":3426},"pkk":{"opOnly":1787,"limitedOp":1477,"opSa":3220,"pass":2831,"event":954}}

