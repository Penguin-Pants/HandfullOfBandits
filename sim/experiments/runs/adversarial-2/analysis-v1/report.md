# Experiment adversarial-2 (adversarial)

Experiment hash `66fb4e0fe9dc95e68903330da0d66b6d2ee5f0e4f489a7399641f24c39d330bf`. Analysis version 1.

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
| S-CTRL-concentration vs P-POL | -41.0 (-45 / -41 / -37) | 0/20 | 0/20 | 0/0 |
| S-CTRL-concentration vs P-EXP | -38.5 (-43 / -40 / -31) | 0/18 | 0/18 | 0/0 |
| S-CTRL-concentration vs P-SURV | -39.3 (-44 / -39 / -36) | 0/19 | 0/20 | 0/0 |
| S-CTRL-concentration vs P-ADAPT | -25.3 (-36 / -23 / -16) | 0/7 | 0/7 | 0/0 |
| S-CTRL-civic-action vs P-POL | -35.1 (-42 / -36 / -27) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action vs P-EXP | -39.0 (-43 / -40 / -36) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action vs P-SURV | -33.1 (-38 / -33 / -29) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action vs P-ADAPT | -34.2 (-41 / -33 / -30) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule vs P-POL | -47.9 (-53 / -48 / -42) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule vs P-EXP | -48.0 (-52 / -48 / -44) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule vs P-SURV | -41.3 (-48 / -40 / -37) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule vs P-ADAPT | -37.8 (-46 / -37 / -31) | 0/20 | 0/20 | 0/0 |
| S-POL vs P-CTRL-sanctuary | 40.0 (34 / 40 / 46) | 20/0 | 20/0 | 0/0 |
| S-POL vs P-CTRL-concealment | 35.1 (30 / 34 / 39) | 20/0 | 20/0 | 0/0 |
| S-POL vs P-CTRL-coerce-only | 34.3 (30 / 35 / 38) | 20/0 | 20/0 | 0/0 |
| S-MIL vs P-CTRL-sanctuary | 46.9 (44 / 47 / 51) | 20/0 | 20/0 | 0/0 |
| S-MIL vs P-CTRL-concealment | 30.1 (27 / 30 / 33) | 19/0 | 19/0 | 0/0 |
| S-MIL vs P-CTRL-coerce-only | 41.9 (39 / 42 / 44) | 20/0 | 20/0 | 0/0 |
| S-CON vs P-CTRL-sanctuary | 46.1 (42 / 47 / 49) | 20/0 | 20/0 | 0/0 |
| S-CON vs P-CTRL-concealment | 35.9 (30 / 35 / 41) | 20/0 | 20/0 | 0/0 |
| S-CON vs P-CTRL-coerce-only | 41.9 (39 / 41 / 46) | 20/0 | 20/0 | 0/0 |
| S-ADAPT vs P-CTRL-sanctuary | 26.9 (20 / 27 / 34) | 15/0 | 15/0 | 0/0 |
| S-ADAPT vs P-CTRL-concealment | 28.9 (23 / 29 / 34) | 17/0 | 17/0 | 0/0 |
| S-ADAPT vs P-CTRL-coerce-only | 32.5 (28 / 32 / 37) | 19/0 | 19/0 | 0/0 |

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
- S-CTRL-concentration@1 vs P-POL@2 (baseline): median margin difference -40.5
- S-CTRL-concentration@1 vs P-EXP@2 (baseline): median margin difference -40.0
- S-CTRL-concentration@1 vs P-SURV@2 (baseline): median margin difference -38.5
- S-CTRL-concentration@1 vs P-ADAPT@2 (baseline): median margin difference -23.0
- S-CTRL-civic-action@1 vs P-POL@2 (baseline): median margin difference -35.5
- S-CTRL-civic-action@1 vs P-EXP@2 (baseline): median margin difference -39.5
- S-CTRL-civic-action@1 vs P-SURV@2 (baseline): median margin difference -32.5
- S-CTRL-civic-action@1 vs P-ADAPT@2 (baseline): median margin difference -33.0
- S-CTRL-emergency-rule@1 vs P-POL@2 (baseline): median margin difference -48.0
- S-CTRL-emergency-rule@1 vs P-EXP@2 (baseline): median margin difference -48.0
- S-CTRL-emergency-rule@1 vs P-SURV@2 (baseline): median margin difference -40.0
- S-CTRL-emergency-rule@1 vs P-ADAPT@2 (baseline): median margin difference -37.0
- S-POL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 39.5
- S-POL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 34.0
- S-POL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 35.0
- S-MIL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 46.5
- S-MIL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 30.0
- S-MIL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 42.0
- S-CON@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 47.0
- S-CON@1 vs P-CTRL-concealment@1 (baseline): median margin difference 35.0
- S-CON@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 41.0
- S-ADAPT@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 27.0
- S-ADAPT@1 vs P-CTRL-concealment@1 (baseline): median margin difference 29.0
- S-ADAPT@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 32.0

## Scoring routes

Mean final components over 480 completed games: State Support 28.5 + Legitimacy 11.8; PKK Opposition 18.6 + domestic Bases 3.5.
State winners (240): Support 47.8, Legitimacy 11.6. PKK winners (240): Opposition 34.1, Bases 6.3.

## Review selection

Closest: baseline~S-CTRL-concentrationv1~P-ADAPTv2~1000269~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1000254~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1000262~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1000263~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1000261~r0

Largest gaps: baseline~S-CTRL-emergency-rulev1~P-POLv2~1000258~r0, baseline~S-CTRL-emergency-rulev1~P-EXPv2~1000256~r0, baseline~S-CTRL-emergency-rulev1~P-EXPv2~1000258~r0, baseline~S-CTRL-emergency-rulev1~P-POLv2~1000263~r0, baseline~S-CONv1~P-CTRL-sanctuaryv1~1000265~r0

Seeded random: baseline~S-CTRL-civic-actionv1~P-POLv2~1000267~r0, baseline~S-CONv1~P-CTRL-concealmentv1~1000269~r0, baseline~S-CONv1~P-CTRL-sanctuaryv1~1000254~r0, baseline~S-MILv1~P-CTRL-coerce-onlyv1~1000250~r0, baseline~S-POLv1~P-CTRL-concealmentv1~1000262~r0

Failures: none

## Coverage ledger

47 natural, 21 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 480 |
| Win at the opening check | Victory | natural exposure | 454 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 25 |
| Equal final margins decided by Harm, then PKK | Victory | reviewed fixture | 0 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 240 |
| Train Civic Action | Political economy | natural exposure | 320 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 239 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 95 |
| State Harm placed | Civilian effects | natural exposure | 194 |
| PKK Harm placed | Civilian effects | natural exposure | 154 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 191 |
| Coerce places Coercion | Civilian effects | natural exposure | 88 |
| Guard upkeep paid | Civilian effects | natural exposure | 382 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 6 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 24 |
| Strike Collaborators | Civilian effects | reviewed fixture | 0 |
| Europe track change | Civilian effects | natural exposure | 298 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 95 |
| Reception marker placed | Civilian effects | natural exposure | 37 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 480 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 480 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 480 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 480 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 85 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 480 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 16 |
| Diplomacy | Sanctuary | reviewed fixture | 0 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 480 |
| Unshaded Event executed | Sequence/cards | natural exposure | 455 |
| Shaded Event executed | Sequence/cards | natural exposure | 263 |
| ARGK played | Sequence/cards | natural exposure | 211 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 449 |
| Limited Op | Sequence/cards | natural exposure | 480 |
| Op Only | Sequence/cards | natural exposure | 480 |
| Op + SA | Sequence/cards | natural exposure | 427 |
| Redeploy with moves | Sequence/cards | natural exposure | 40 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 480 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 26 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 457 |
| Operation state.garrison | Sequence/cards | natural exposure | 58 |
| Operation state.sweep | Sequence/cards | natural exposure | 101 |
| Operation state.assault | Sequence/cards | natural exposure | 164 |
| Operation pkk.rally | Sequence/cards | natural exposure | 400 |
| Operation pkk.march | Sequence/cards | natural exposure | 266 |
| Operation pkk.attack | Sequence/cards | natural exposure | 116 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 88 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 74 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 17 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 24.7%, PKK 27.3%. Longest First Eligible streak: 18 cards. Mean unused Resources at the end: State 6.8, PKK 5.8. Games with a 3-Pass streak: {"pkk":92,"state":134}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":2373,"opOnly":1357,"pass":2654,"event":3487,"opSa":857},"pkk":{"opOnly":1907,"limitedOp":1407,"opSa":3236,"pass":2871,"event":1096}}

