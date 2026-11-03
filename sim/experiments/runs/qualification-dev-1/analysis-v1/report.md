# Experiment qualification-dev-1 (qualification)

Experiment hash `7cfe0eabc333bab02b8f294934fdaef4dab1761362dd2f5fcfe930451255e49c`. Analysis version 1.

## Completion

Scheduled 200 games: complete 200. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT | P-CTRL-sanctuary | P-CTRL-concealment | P-CTRL-coerce-only |
|---|---|---|---|---|---|---|---|
| S-POL | 20.0% [3.6%, 62.4%] n=5 | 60.0% [23.1%, 88.2%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 80.0% [37.6%, 96.4%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 100.0% [56.6%, 100.0%] n=5 |
| S-MIL | 60.0% [23.1%, 88.2%] n=5 | 60.0% [23.1%, 88.2%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 80.0% [37.6%, 96.4%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 100.0% [56.6%, 100.0%] n=5 |
| S-CON | 40.0% [11.8%, 76.9%] n=5 | 0.0% [0.0%, 43.4%] n=5 | 20.0% [3.6%, 62.4%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 100.0% [56.6%, 100.0%] n=5 |
| S-ADAPT | 60.0% [23.1%, 88.2%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 40.0% [11.8%, 76.9%] n=5 | 60.0% [23.1%, 88.2%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 100.0% [56.6%, 100.0%] n=5 | 100.0% [56.6%, 100.0%] n=5 |
| S-CTRL-concentration | 0.0% [0.0%, 43.4%] n=5 | 0.0% [0.0%, 43.4%] n=5 | 0.0% [0.0%, 43.4%] n=5 | 0.0% [0.0%, 43.4%] n=5 |  |  |  |
| S-CTRL-civic-action | 0.0% [0.0%, 43.4%] n=5 | 0.0% [0.0%, 43.4%] n=5 | 0.0% [0.0%, 43.4%] n=5 | 0.0% [0.0%, 43.4%] n=5 |  |  |  |
| S-CTRL-emergency-rule | 0.0% [0.0%, 43.4%] n=5 | 0.0% [0.0%, 43.4%] n=5 | 0.0% [0.0%, 43.4%] n=5 | 0.0% [0.0%, 43.4%] n=5 |  |  |  |

Equal-weight roster average (this roster only, not a human win probability): State 54.5% [53.5%, 55.0%] over 40 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-POL | -7.0 (-22 / -11 / 12) | 0/0 | 0/0 | 0/0 |
| S-POL vs P-EXP | -3.2 (-24 / 9 / 10) | 0/1 | 0/1 | 0/0 |
| S-POL vs P-SURV | 12.2 (8 / 12 / 17) | 0/0 | 0/0 | 0/0 |
| S-POL vs P-ADAPT | 8.2 (0 / 12 / 13) | 0/0 | 0/0 | 0/0 |
| S-MIL vs P-POL | -1.6 (-16 / 3 / 10) | 0/0 | 0/0 | 0/0 |
| S-MIL vs P-EXP | 5.2 (-12 / 11 / 19) | 0/0 | 0/0 | 0/0 |
| S-MIL vs P-SURV | 10.6 (9 / 10 / 13) | 0/0 | 0/0 | 0/0 |
| S-MIL vs P-ADAPT | 11.4 (-5 / 7 / 29) | 1/0 | 1/0 | 0/0 |
| S-CON vs P-POL | -6.6 (-22 / -3 / 8) | 0/0 | 0/0 | 0/0 |
| S-CON vs P-EXP | -14.8 (-27 / -17 / -2) | 0/2 | 0/2 | 0/0 |
| S-CON vs P-SURV | -3.0 (-6 / -4 / 0) | 0/0 | 0/0 | 0/0 |
| S-CON vs P-ADAPT | 20.8 (19 / 19 / 24) | 1/0 | 1/0 | 0/0 |
| S-ADAPT vs P-POL | 1.4 (-16 / 3 / 17) | 0/0 | 0/0 | 0/0 |
| S-ADAPT vs P-EXP | 19.2 (16 / 18 / 23) | 0/0 | 0/0 | 0/0 |
| S-ADAPT vs P-SURV | 3.2 (-7 / -4 / 18) | 0/0 | 1/0 | 0/0 |
| S-ADAPT vs P-ADAPT | -1.6 (-21 / 1 / 16) | 0/1 | 0/1 | 0/0 |
| S-POL vs P-CTRL-sanctuary | 41.2 (35 / 41 / 48) | 5/0 | 5/0 | 0/0 |
| S-POL vs P-CTRL-concealment | 37.0 (29 / 38 / 45) | 5/0 | 5/0 | 0/0 |
| S-POL vs P-CTRL-coerce-only | 35.2 (30 / 36 / 41) | 5/0 | 5/0 | 0/0 |
| S-MIL vs P-CTRL-sanctuary | 45.8 (39 / 48 / 52) | 5/0 | 5/0 | 0/0 |
| S-MIL vs P-CTRL-concealment | 28.8 (25 / 29 / 32) | 5/0 | 5/0 | 0/0 |
| S-MIL vs P-CTRL-coerce-only | 42.2 (38 / 41 / 47) | 5/0 | 5/0 | 0/0 |
| S-CON vs P-CTRL-sanctuary | 40.4 (36 / 38 / 46) | 5/0 | 5/0 | 0/0 |
| S-CON vs P-CTRL-concealment | 35.8 (32 / 38 / 39) | 5/0 | 5/0 | 0/0 |
| S-CON vs P-CTRL-coerce-only | 43.2 (41 / 43 / 46) | 5/0 | 5/0 | 0/0 |
| S-ADAPT vs P-CTRL-sanctuary | 30.8 (28 / 29 / 35) | 5/0 | 5/0 | 0/0 |
| S-ADAPT vs P-CTRL-concealment | 30.0 (27 / 28 / 34) | 5/0 | 5/0 | 0/0 |
| S-ADAPT vs P-CTRL-coerce-only | 30.4 (25 / 30 / 36) | 4/0 | 4/0 | 0/0 |
| S-CTRL-concentration vs P-POL | -38.4 (-45 / -35 / -33) | 0/5 | 0/5 | 0/0 |
| S-CTRL-concentration vs P-EXP | -36.8 (-42 / -34 / -33) | 0/4 | 0/5 | 0/0 |
| S-CTRL-concentration vs P-SURV | -38.4 (-44 / -39 / -33) | 0/5 | 0/5 | 0/0 |
| S-CTRL-concentration vs P-ADAPT | -13.8 (-17 / -13 / -11) | 0/0 | 0/0 | 0/0 |
| S-CTRL-civic-action vs P-POL | -39.0 (-43 / -39 / -35) | 0/5 | 0/5 | 0/0 |
| S-CTRL-civic-action vs P-EXP | -38.4 (-41 / -40 / -35) | 0/5 | 0/5 | 0/0 |
| S-CTRL-civic-action vs P-SURV | -25.2 (-27 / -26 / -23) | 0/5 | 0/5 | 0/0 |
| S-CTRL-civic-action vs P-ADAPT | -33.2 (-36 / -32 / -31) | 0/5 | 0/5 | 0/0 |
| S-CTRL-emergency-rule vs P-POL | -50.0 (-53 / -50 / -47) | 0/5 | 0/5 | 0/0 |
| S-CTRL-emergency-rule vs P-EXP | -48.6 (-53 / -47 / -45) | 0/5 | 0/5 | 0/0 |
| S-CTRL-emergency-rule vs P-SURV | -36.2 (-43 / -35 / -30) | 0/5 | 0/5 | 0/0 |
| S-CTRL-emergency-rule vs P-ADAPT | -39.4 (-43 / -40 / -36) | 0/5 | 0/5 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@1 vs P-POL@1 (baseline): State 20.0%
- S-POL@1 vs P-SURV@1 (baseline): State 100.0%
- S-POL@1 vs P-ADAPT@1 (baseline): State 80.0%
- S-MIL@1 vs P-SURV@1 (baseline): State 100.0%
- S-MIL@1 vs P-ADAPT@1 (baseline): State 80.0%
- S-CON@1 vs P-EXP@1 (baseline): State 0.0%
- S-CON@1 vs P-SURV@1 (baseline): State 20.0%
- S-CON@1 vs P-ADAPT@1 (baseline): State 100.0%
- S-ADAPT@1 vs P-EXP@1 (baseline): State 100.0%
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
- S-CTRL-concentration@1 vs P-POL@1 (baseline): State 0.0%
- S-CTRL-concentration@1 vs P-EXP@1 (baseline): State 0.0%
- S-CTRL-concentration@1 vs P-SURV@1 (baseline): State 0.0%
- S-CTRL-concentration@1 vs P-ADAPT@1 (baseline): State 0.0%
- S-CTRL-civic-action@1 vs P-POL@1 (baseline): State 0.0%
- S-CTRL-civic-action@1 vs P-EXP@1 (baseline): State 0.0%
- S-CTRL-civic-action@1 vs P-SURV@1 (baseline): State 0.0%
- S-CTRL-civic-action@1 vs P-ADAPT@1 (baseline): State 0.0%
- S-CTRL-emergency-rule@1 vs P-POL@1 (baseline): State 0.0%
- S-CTRL-emergency-rule@1 vs P-EXP@1 (baseline): State 0.0%
- S-CTRL-emergency-rule@1 vs P-SURV@1 (baseline): State 0.0%
- S-CTRL-emergency-rule@1 vs P-ADAPT@1 (baseline): State 0.0%
- S-POL@1 vs P-POL@1 (baseline): median margin difference -11.0
- S-POL@1 vs P-SURV@1 (baseline): median margin difference 12.0
- S-POL@1 vs P-ADAPT@1 (baseline): median margin difference 12.0
- S-MIL@1 vs P-EXP@1 (baseline): median margin difference 11.0
- S-MIL@1 vs P-SURV@1 (baseline): median margin difference 10.0
- S-CON@1 vs P-EXP@1 (baseline): median margin difference -17.0
- S-CON@1 vs P-ADAPT@1 (baseline): median margin difference 19.0
- S-ADAPT@1 vs P-EXP@1 (baseline): median margin difference 18.0
- S-POL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 41.0
- S-POL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 38.0
- S-POL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 36.0
- S-MIL@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 48.0
- S-MIL@1 vs P-CTRL-concealment@1 (baseline): median margin difference 29.0
- S-MIL@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 41.0
- S-CON@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 38.0
- S-CON@1 vs P-CTRL-concealment@1 (baseline): median margin difference 38.0
- S-CON@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 43.0
- S-ADAPT@1 vs P-CTRL-sanctuary@1 (baseline): median margin difference 29.0
- S-ADAPT@1 vs P-CTRL-concealment@1 (baseline): median margin difference 28.0
- S-ADAPT@1 vs P-CTRL-coerce-only@1 (baseline): median margin difference 30.0
- S-CTRL-concentration@1 vs P-POL@1 (baseline): median margin difference -35.0
- S-CTRL-concentration@1 vs P-EXP@1 (baseline): median margin difference -34.0
- S-CTRL-concentration@1 vs P-SURV@1 (baseline): median margin difference -39.0
- S-CTRL-concentration@1 vs P-ADAPT@1 (baseline): median margin difference -13.0
- S-CTRL-civic-action@1 vs P-POL@1 (baseline): median margin difference -39.0
- S-CTRL-civic-action@1 vs P-EXP@1 (baseline): median margin difference -40.0
- S-CTRL-civic-action@1 vs P-SURV@1 (baseline): median margin difference -26.0
- S-CTRL-civic-action@1 vs P-ADAPT@1 (baseline): median margin difference -32.0
- S-CTRL-emergency-rule@1 vs P-POL@1 (baseline): median margin difference -50.0
- S-CTRL-emergency-rule@1 vs P-EXP@1 (baseline): median margin difference -47.0
- S-CTRL-emergency-rule@1 vs P-SURV@1 (baseline): median margin difference -35.0
- S-CTRL-emergency-rule@1 vs P-ADAPT@1 (baseline): median margin difference -40.0

## Scoring routes

Mean final components over 200 completed games: State Support 27.4 + Legitimacy 10.8; PKK Opposition 15.1 + domestic Bases 2.6.
State winners (109): Support 40.2, Legitimacy 10.4. PKK winners (91): Opposition 27.7, Bases 4.9.

## Review selection

Closest: baseline~S-CONv1~P-EXPv1~103~r0, baseline~S-ADAPTv1~P-ADAPTv1~104~r0, baseline~S-CONv1~P-SURVv1~102~r0, baseline~S-CONv1~P-SURVv1~103~r0, baseline~S-ADAPTv1~P-POLv1~104~r0

Largest gaps: baseline~S-CTRL-emergency-rulev1~P-POLv1~103~r0, baseline~S-MILv1~P-CTRL-sanctuaryv1~104~r0, baseline~S-CTRL-emergency-rulev1~P-EXPv1~103~r0, baseline~S-CTRL-emergency-rulev1~P-EXPv1~102~r0, baseline~S-CTRL-emergency-rulev1~P-POLv1~105~r0

Seeded random: baseline~S-CONv1~P-POLv1~105~r0, baseline~S-CTRL-civic-actionv1~P-SURVv1~104~r0, baseline~S-POLv1~P-POLv1~104~r0, baseline~S-POLv1~P-CTRL-sanctuaryv1~101~r0, baseline~S-CTRL-civic-actionv1~P-ADAPTv1~102~r0

Failures: none

## Coverage ledger

52 natural, 17 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 200 |
| Win at the opening check | Victory | natural exposure | 119 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 79 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 1 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 137 |
| Train Civic Action | Political economy | natural exposure | 160 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 140 |
| Propaganda Agitation spending | Political economy | natural exposure | 119 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 40 |
| State Harm placed | Civilian effects | natural exposure | 84 |
| PKK Harm placed | Civilian effects | natural exposure | 42 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 71 |
| Coerce places Coercion | Civilian effects | natural exposure | 40 |
| Guard upkeep paid | Civilian effects | natural exposure | 157 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 16 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 13 |
| Strike Collaborators | Civilian effects | natural exposure | 1 |
| Europe track change | Civilian effects | natural exposure | 120 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 41 |
| Reception marker placed | Civilian effects | natural exposure | 14 |
| Displacement marker placed | Civilian effects | reviewed fixture | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 200 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 200 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 200 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 200 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 29 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 200 |
| puk posture reaches restricted | Sanctuary | natural exposure | 1 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 8 |
| Diplomacy | Sanctuary | natural exposure | 3 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | natural exposure | 15 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 200 |
| Unshaded Event executed | Sequence/cards | natural exposure | 182 |
| Shaded Event executed | Sequence/cards | natural exposure | 145 |
| ARGK played | Sequence/cards | natural exposure | 87 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 193 |
| Limited Op | Sequence/cards | natural exposure | 200 |
| Op Only | Sequence/cards | natural exposure | 200 |
| Op + SA | Sequence/cards | natural exposure | 185 |
| Redeploy with moves | Sequence/cards | natural exposure | 29 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 200 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 81 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 195 |
| Operation state.garrison | Sequence/cards | natural exposure | 81 |
| Operation state.sweep | Sequence/cards | natural exposure | 78 |
| Operation state.assault | Sequence/cards | natural exposure | 118 |
| Operation pkk.rally | Sequence/cards | natural exposure | 180 |
| Operation pkk.march | Sequence/cards | natural exposure | 145 |
| Operation pkk.attack | Sequence/cards | natural exposure | 58 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 40 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 97 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 9 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 140 |

## Diagnostics

Pass share: State 31.0%, PKK 23.3%. Longest First Eligible streak: 16 cards. Mean unused Resources at the end: State 5.3, PKK 3.9. Games with a 3-Pass streak: {"state":91,"pkk":37}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":1021,"opSa":595,"pass":1390,"opOnly":444,"event":1030},"pkk":{"opOnly":705,"limitedOp":745,"opSa":1327,"event":591,"pass":1025}}

