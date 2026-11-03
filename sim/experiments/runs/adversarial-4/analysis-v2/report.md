# Experiment adversarial-4 (adversarial)

Experiment hash `ccda8e24ff65926b1b1322311d4bb97aab5116a2e7edd6a762bdad67c955bc3d`. Analysis version 2.

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
| S-CTRL-concentration@1 vs P-POL@2 | -38.5 (-45 / -38 / -32) | 0/17 | 0/17 | 0/0 |
| S-CTRL-concentration@1 vs P-EXP@2 | -37.5 (-43 / -37 / -34) | 0/19 | 0/19 | 0/0 |
| S-CTRL-concentration@1 vs P-SURV@2 | -35.5 (-42 / -35 / -31) | 0/18 | 0/19 | 0/0 |
| S-CTRL-concentration@1 vs P-ADAPT@2 | -22.6 (-32 / -21 / -16) | 0/4 | 0/4 | 0/0 |
| S-CTRL-civic-action@1 vs P-POL@2 | -36.5 (-45 / -37 / -28) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action@1 vs P-EXP@2 | -38.1 (-47 / -37 / -33) | 0/20 | 0/20 | 0/0 |
| S-CTRL-civic-action@1 vs P-SURV@2 | -31.6 (-37 / -31 / -27) | 0/18 | 0/20 | 0/0 |
| S-CTRL-civic-action@1 vs P-ADAPT@2 | -34.1 (-37 / -34 / -31) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-POL@2 | -47.4 (-51 / -48 / -43) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-EXP@2 | -48.2 (-54 / -47 / -44) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-SURV@2 | -40.7 (-48 / -42 / -31) | 0/20 | 0/20 | 0/0 |
| S-CTRL-emergency-rule@1 vs P-ADAPT@2 | -40.1 (-47 / -40 / -32) | 0/20 | 0/20 | 0/0 |
| S-POL@1 vs P-CTRL-sanctuary@1 | 39.4 (35 / 40 / 43) | 20/0 | 20/0 | 0/0 |
| S-POL@1 vs P-CTRL-concealment@1 | 36.3 (30 / 36 / 41) | 20/0 | 20/0 | 0/0 |
| S-POL@1 vs P-CTRL-coerce-only@1 | 32.7 (27 / 33 / 37) | 20/0 | 20/0 | 0/0 |
| S-MIL@1 vs P-CTRL-sanctuary@1 | 45.6 (42 / 46 / 49) | 20/0 | 20/0 | 0/0 |
| S-MIL@1 vs P-CTRL-concealment@1 | 30.9 (28 / 30 / 34) | 19/0 | 19/0 | 0/0 |
| S-MIL@1 vs P-CTRL-coerce-only@1 | 41.6 (39 / 42 / 46) | 20/0 | 20/0 | 0/0 |
| S-CON@1 vs P-CTRL-sanctuary@1 | 46.9 (43 / 48 / 50) | 20/0 | 20/0 | 0/0 |
| S-CON@1 vs P-CTRL-concealment@1 | 37.4 (31 / 38 / 41) | 20/0 | 20/0 | 0/0 |
| S-CON@1 vs P-CTRL-coerce-only@1 | 39.4 (36 / 40 / 42) | 20/0 | 20/0 | 0/0 |
| S-ADAPT@1 vs P-CTRL-sanctuary@1 | 28.8 (25 / 28 / 34) | 17/0 | 17/0 | 0/0 |
| S-ADAPT@1 vs P-CTRL-concealment@1 | 29.5 (26 / 30 / 34) | 20/0 | 20/0 | 0/0 |
| S-ADAPT@1 vs P-CTRL-coerce-only@1 | 30.4 (26 / 31 / 36) | 18/0 | 18/0 | 0/0 |

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
- S-CTRL-concentration@1 vs P-POL@2 (baseline): median margin difference -38.0
- S-CTRL-concentration@1 vs P-EXP@2 (baseline): median margin difference -36.5
- S-CTRL-concentration@1 vs P-SURV@2 (baseline): median margin difference -35.0
- S-CTRL-concentration@1 vs P-ADAPT@2 (baseline): median margin difference -21.0
- S-CTRL-civic-action@1 vs P-POL@2 (baseline): median margin difference -37.0
- S-CTRL-civic-action@1 vs P-EXP@2 (baseline): median margin difference -36.5
- S-CTRL-civic-action@1 vs P-SURV@2 (baseline): median margin difference -31.0
- S-CTRL-civic-action@1 vs P-ADAPT@2 (baseline): median margin difference -34.0
- S-CTRL-emergency-rule@1 vs P-POL@2 (baseline): median margin difference -47.5
- S-CTRL-emergency-rule@1 vs P-EXP@2 (baseline): median margin difference -47.0
- S-CTRL-emergency-rule@1 vs P-SURV@2 (baseline): median margin difference -41.5
- S-CTRL-emergency-rule@1 vs P-ADAPT@2 (baseline): median margin difference -39.5
- S-POL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 40.0
- S-POL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 36.0
- S-POL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 33.0
- S-MIL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 45.5
- S-MIL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 30.0
- S-MIL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 41.5
- S-CON@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 48.0
- S-CON@1 vs P-CTRL-concealment@1 (baseline): median margin difference 38.0
- S-CON@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 39.5
- S-ADAPT@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 28.0
- S-ADAPT@1 vs P-CTRL-concealment@1 (baseline): median margin difference 29.5
- S-ADAPT@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 30.5

## Scoring routes

Mean final components over 480 completed games: State Support 28.3 + Legitimacy 11.5; PKK Opposition 17.9 + domestic Bases 3.4.
State winners (240): Support 47.6, Legitimacy 11.6. PKK winners (240): Opposition 33.1, Bases 5.9.

## Review selection

Closest: baseline~S-CTRL-concentrationv1~P-ADAPTv2~1001269~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1001260~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1001264~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1001261~r0, baseline~S-CTRL-concentrationv1~P-ADAPTv2~1001262~r0

Largest gaps: baseline~S-CTRL-emergency-rulev1~P-EXPv2~1001250~r0, baseline~S-CTRL-emergency-rulev1~P-POLv2~1001262~r0, baseline~S-CTRL-emergency-rulev1~P-EXPv2~1001258~r0, baseline~S-CTRL-emergency-rulev1~P-EXPv2~1001254~r0, baseline~S-CTRL-concentrationv1~P-POLv2~1001259~r0

Seeded random: baseline~S-CTRL-civic-actionv1~P-POLv2~1001267~r0, baseline~S-CONv1~P-CTRL-concealmentv1~1001269~r0, baseline~S-CONv1~P-CTRL-sanctuaryv1~1001254~r0, baseline~S-MILv1~P-CTRL-coerce-onlyv1~1001250~r0, baseline~S-POLv1~P-CTRL-concealmentv1~1001262~r0

Failures: none

## Coverage ledger

50 natural, 18 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 480 |
| Win at the opening check | Victory | natural exposure | 450 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 27 |
| Equal final margins decided by Harm, then PKK | Victory | reviewed fixture | 0 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 239 |
| Train Civic Action | Political economy | natural exposure | 320 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 240 |
| Propaganda Agitation spending | Political economy | natural exposure | 240 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 91 |
| State Harm placed | Civilian effects | natural exposure | 78 |
| PKK Harm placed | Civilian effects | natural exposure | 156 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 207 |
| Coerce places Coercion | Civilian effects | natural exposure | 95 |
| Guard upkeep paid | Civilian effects | natural exposure | 390 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 6 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 33 |
| Strike Collaborators | Civilian effects | natural exposure | 3 |
| Europe track change | Civilian effects | natural exposure | 288 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 87 |
| Reception marker placed | Civilian effects | natural exposure | 24 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 480 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 480 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 480 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 480 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 91 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 480 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 1 |
| Diplomacy | Sanctuary | reviewed fixture | 0 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 1 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 1 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 480 |
| Unshaded Event executed | Sequence/cards | natural exposure | 445 |
| Shaded Event executed | Sequence/cards | natural exposure | 251 |
| ARGK played | Sequence/cards | natural exposure | 199 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 451 |
| Limited Op | Sequence/cards | natural exposure | 480 |
| Op Only | Sequence/cards | natural exposure | 480 |
| Op + SA | Sequence/cards | natural exposure | 423 |
| Redeploy with moves | Sequence/cards | natural exposure | 51 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 480 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 30 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 460 |
| Operation state.garrison | Sequence/cards | natural exposure | 62 |
| Operation state.sweep | Sequence/cards | natural exposure | 107 |
| Operation state.assault | Sequence/cards | natural exposure | 155 |
| Operation pkk.rally | Sequence/cards | natural exposure | 400 |
| Operation pkk.march | Sequence/cards | natural exposure | 265 |
| Operation pkk.attack | Sequence/cards | natural exposure | 118 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 95 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 68 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 26 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 240 |

## Diagnostics

Pass share: State 24.9%, PKK 27.5%. Longest First Eligible streak: 16 cards. Mean unused Resources at the end: State 6.8, PKK 5.6. Games with a 3-Pass streak: {"pkk":89,"state":138}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":2372,"opOnly":1405,"pass":2580,"event":3227,"opSa":784},"pkk":{"opOnly":1740,"limitedOp":1490,"opSa":3133,"pass":2800,"event":1006}}

