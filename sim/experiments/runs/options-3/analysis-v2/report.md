# Experiment options-3 (options)

Experiment hash `5ef431c92f74c59eab4313f76549b680390b4dc2315fbcd07b7775ce60e26ace`. Analysis version 2.

## Completion

Scheduled 2400 games: complete 2400. Incomplete games are not losses and are excluded from win rates.

## Condition no-hot-pursuit

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 34.0% [22.4%, 47.8%] n=50 | 24.0% [14.3%, 37.4%] n=50 | 64.0% [50.1%, 75.9%] n=50 | 62.0% [48.2%, 74.1%] n=50 |
| S-MIL@1 | 66.0% [52.2%, 77.6%] n=50 | 60.0% [46.2%, 72.4%] n=50 | 84.0% [71.5%, 91.7%] n=50 | 70.0% [56.2%, 80.9%] n=50 |
| S-CON@1 | 20.0% [11.2%, 33.0%] n=50 | 12.0% [5.6%, 23.8%] n=50 | 36.0% [24.1%, 49.9%] n=50 | 84.0% [71.5%, 91.7%] n=50 |
| S-ADAPT@1 | 42.0% [29.4%, 55.8%] n=50 | 24.0% [14.3%, 37.4%] n=50 | 30.0% [19.1%, 43.8%] n=50 | 98.0% [89.5%, 99.6%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 50.6% [47.4%, 54.0%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -3.6 (-16 / -5 / 14) | 0/0 | 1/0 | 0/0 |
| S-POL@1 vs P-EXP@2 | -6.9 (-24 / -7 / 15) | 1/2 | 1/4 | 0/0 |
| S-POL@1 vs P-SURV@2 | 3.2 (-9 / 4 / 17) | 0/0 | 2/0 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 4.7 (-6 / 4 / 15) | 0/0 | 2/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 3.5 (-11 / 5 / 16) | 1/0 | 1/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 3.4 (-13 / 5 / 18) | 1/0 | 1/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 10.7 (-1 / 10 / 23) | 1/0 | 4/0 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 8.5 (-9 / 11 / 25) | 6/0 | 6/0 | 0/0 |
| S-CON@1 vs P-POL@2 | -6.4 (-18 / -6 / 3) | 0/1 | 0/2 | 0/0 |
| S-CON@1 vs P-EXP@2 | -8.5 (-17 / -9 / 2) | 0/1 | 0/1 | 0/0 |
| S-CON@1 vs P-SURV@2 | -4.0 (-16 / -5 / 6) | 0/1 | 0/1 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 9.9 (-10 / 10 / 26) | 5/0 | 7/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -4.3 (-21 / -4 / 12) | 0/4 | 0/5 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -7.7 (-19 / -10 / 6) | 0/0 | 0/2 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -6.2 (-19 / -6 / 8) | 0/2 | 0/3 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 24.5 (14 / 27 / 32) | 23/0 | 33/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (no-hot-pursuit): State 84.0%
- S-CON@1 vs P-POL@2 (no-hot-pursuit): State 20.0%
- S-CON@1 vs P-EXP@2 (no-hot-pursuit): State 12.0%
- S-CON@1 vs P-ADAPT@2 (no-hot-pursuit): State 84.0%
- S-ADAPT@1 vs P-ADAPT@2 (no-hot-pursuit): State 98.0%
- S-MIL@1 vs P-ADAPT@2 (no-hot-pursuit): median margin difference 11.0
- S-CON@1 vs P-ADAPT@2 (no-hot-pursuit): median margin difference 10.0
- S-ADAPT@1 vs P-ADAPT@2 (no-hot-pursuit): median margin difference 27.0

## Condition no-syria-march

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 38.0% [25.9%, 51.8%] n=50 | 16.0% [8.3%, 28.5%] n=50 | 62.0% [48.2%, 74.1%] n=50 | 72.0% [58.3%, 82.5%] n=50 |
| S-MIL@1 | 70.0% [56.2%, 80.9%] n=50 | 60.0% [46.2%, 72.4%] n=50 | 90.0% [78.6%, 95.7%] n=50 | 80.0% [67.0%, 88.8%] n=50 |
| S-CON@1 | 32.0% [20.8%, 45.8%] n=50 | 10.0% [4.3%, 21.4%] n=50 | 32.0% [20.8%, 45.8%] n=50 | 78.0% [64.8%, 87.2%] n=50 |
| S-ADAPT@1 | 42.0% [29.4%, 55.8%] n=50 | 28.0% [17.5%, 41.7%] n=50 | 32.0% [20.8%, 45.8%] n=50 | 100.0% [92.9%, 100.0%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 52.6% [49.4%, 56.1%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -4.8 (-18 / -5 / 8) | 0/0 | 0/0 | 0/0 |
| S-POL@1 vs P-EXP@2 | -11.0 (-26 / -12 / 6) | 0/3 | 0/6 | 0/0 |
| S-POL@1 vs P-SURV@2 | 3.7 (-10 / 6 / 15) | 0/0 | 1/0 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 7.0 (-8 / 7 / 21) | 7/0 | 8/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 6.0 (-10 / 6 / 20) | 2/0 | 3/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 2.6 (-13 / 5 / 17) | 0/0 | 1/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 9.2 (1 / 10 / 20) | 0/0 | 0/0 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 9.2 (-5 / 9 / 24) | 5/0 | 6/0 | 0/0 |
| S-CON@1 vs P-POL@2 | -5.5 (-18 / -4 / 5) | 0/1 | 0/2 | 0/0 |
| S-CON@1 vs P-EXP@2 | -8.9 (-18 / -8 / 0) | 0/1 | 0/1 | 0/0 |
| S-CON@1 vs P-SURV@2 | -5.3 (-15 / -5 / 5) | 0/1 | 0/1 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 10.5 (-9 / 13 / 24) | 5/0 | 8/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -3.7 (-20 / -6 / 10) | 0/1 | 0/2 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -5.3 (-18 / -3 / 8) | 0/0 | 0/0 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -5.4 (-20 / -6 / 10) | 0/3 | 1/4 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 26.7 (17 / 28 / 35) | 31/0 | 35/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@1 vs P-EXP@2 (no-syria-march): State 16.0%
- S-MIL@1 vs P-SURV@2 (no-syria-march): State 90.0%
- S-MIL@1 vs P-ADAPT@2 (no-syria-march): State 80.0%
- S-CON@1 vs P-EXP@2 (no-syria-march): State 10.0%
- S-ADAPT@1 vs P-ADAPT@2 (no-syria-march): State 100.0%
- S-POL@1 vs P-EXP@2 (no-syria-march): median margin difference -12.0
- S-MIL@1 vs P-SURV@2 (no-syria-march): median margin difference 10.0
- S-CON@1 vs P-ADAPT@2 (no-syria-march): median margin difference 13.0
- S-ADAPT@1 vs P-ADAPT@2 (no-syria-march): median margin difference 27.5

## Condition neither

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 36.0% [24.1%, 49.9%] n=50 | 26.0% [15.9%, 39.6%] n=50 | 62.0% [48.2%, 74.1%] n=50 | 72.0% [58.3%, 82.5%] n=50 |
| S-MIL@1 | 66.0% [52.2%, 77.6%] n=50 | 60.0% [46.2%, 72.4%] n=50 | 92.0% [81.2%, 96.8%] n=50 | 80.0% [67.0%, 88.8%] n=50 |
| S-CON@1 | 26.0% [15.9%, 39.6%] n=50 | 10.0% [4.3%, 21.4%] n=50 | 42.0% [29.4%, 55.8%] n=50 | 88.0% [76.2%, 94.4%] n=50 |
| S-ADAPT@1 | 40.0% [27.6%, 53.8%] n=50 | 18.0% [9.8%, 30.8%] n=50 | 34.0% [22.4%, 47.8%] n=50 | 96.0% [86.5%, 98.9%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 53.0% [49.9%, 56.1%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -4.5 (-18 / -7 / 13) | 1/0 | 2/1 | 0/0 |
| S-POL@1 vs P-EXP@2 | -8.0 (-22 / -8 / 7) | 0/2 | 0/3 | 0/0 |
| S-POL@1 vs P-SURV@2 | 4.0 (-8 / 4 / 17) | 2/0 | 3/0 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 8.2 (-6 / 7 / 21) | 5/0 | 7/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 3.9 (-11 / 6 / 17) | 0/0 | 0/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 2.7 (-13 / 5 / 14) | 1/0 | 1/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 11.0 (2 / 10 / 22) | 1/0 | 2/0 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 9.1 (-6 / 9 / 25) | 6/0 | 6/0 | 0/0 |
| S-CON@1 vs P-POL@2 | -4.5 (-15 / -3 / 6) | 0/1 | 0/2 | 0/0 |
| S-CON@1 vs P-EXP@2 | -9.1 (-17 / -11 / 0) | 0/1 | 0/1 | 0/0 |
| S-CON@1 vs P-SURV@2 | -3.2 (-15 / -2 / 7) | 0/0 | 0/0 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 12.0 (-5 / 13 / 27) | 5/0 | 8/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -4.3 (-21 / -3 / 10) | 0/4 | 0/4 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -8.7 (-21 / -9 / 5) | 0/0 | 0/1 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -4.7 (-18 / -6 / 7) | 0/2 | 0/2 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 24.2 (13 / 25 / 35) | 24/0 | 33/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (neither): State 92.0%
- S-MIL@1 vs P-ADAPT@2 (neither): State 80.0%
- S-CON@1 vs P-EXP@2 (neither): State 10.0%
- S-CON@1 vs P-ADAPT@2 (neither): State 88.0%
- S-ADAPT@1 vs P-EXP@2 (neither): State 18.0%
- S-ADAPT@1 vs P-ADAPT@2 (neither): State 96.0%
- S-MIL@1 vs P-SURV@2 (neither): median margin difference 10.0
- S-CON@1 vs P-EXP@2 (neither): median margin difference -10.5
- S-CON@1 vs P-ADAPT@2 (neither): median margin difference 13.0
- S-ADAPT@1 vs P-ADAPT@2 (neither): median margin difference 25.0

## Scoring routes

Mean final components over 2400 completed games: State Support 23.7 + Legitimacy 10.3; PKK Opposition 11.9 + domestic Bases 1.5.
State winners (1250): Support 29.8, Legitimacy 10.3. PKK winners (1150): Opposition 16.3, Bases 2.3.

## Review selection

Closest: neither~S-ADAPTv1~P-EXPv2~1001240~r0, neither~S-ADAPTv1~P-POLv2~1001214~r0, neither~S-ADAPTv1~P-POLv2~1001225~r0, neither~S-ADAPTv1~P-POLv2~1001240~r0, neither~S-ADAPTv1~P-POLv2~1001241~r0

Largest gaps: neither~S-ADAPTv1~P-ADAPTv2~1001210~r0, no-hot-pursuit~S-ADAPTv1~P-ADAPTv2~1001210~r0, no-syria-march~S-ADAPTv1~P-ADAPTv2~1001238~r0, no-hot-pursuit~S-ADAPTv1~P-ADAPTv2~1001235~r0, no-syria-march~S-ADAPTv1~P-ADAPTv2~1001203~r0

Seeded random: neither~S-MILv1~P-ADAPTv2~1001222~r0, no-hot-pursuit~S-CONv1~P-EXPv2~1001226~r0, no-hot-pursuit~S-POLv1~P-SURVv2~1001216~r0, neither~S-CONv1~P-EXPv2~1001205~r0, no-hot-pursuit~S-MILv1~P-EXPv2~1001214~r0

Failures: none

## Coverage ledger

53 natural, 15 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 2400 |
| Win at the opening check | Victory | natural exposure | 164 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 2169 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 48 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 2343 |
| Train Civic Action | Political economy | natural exposure | 2400 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 2361 |
| Propaganda Agitation spending | Political economy | natural exposure | 2049 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 325 |
| State Harm placed | Civilian effects | natural exposure | 696 |
| PKK Harm placed | Civilian effects | natural exposure | 240 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 228 |
| Coerce places Coercion | Civilian effects | natural exposure | 569 |
| Guard upkeep paid | Civilian effects | natural exposure | 1240 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 152 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 30 |
| Strike Collaborators | Civilian effects | natural exposure | 1 |
| Europe track change | Civilian effects | natural exposure | 1264 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 361 |
| Reception marker placed | Civilian effects | natural exposure | 21 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 2400 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| syria posture reaches restricted | Sanctuary | natural exposure | 1 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 2400 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 105 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| puk posture reaches restricted | Sanctuary | natural exposure | 1 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 326 |
| Diplomacy | Sanctuary | natural exposure | 43 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 7 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 2400 |
| Unshaded Event executed | Sequence/cards | natural exposure | 2152 |
| Shaded Event executed | Sequence/cards | natural exposure | 2245 |
| ARGK played | Sequence/cards | natural exposure | 1280 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 2400 |
| Limited Op | Sequence/cards | natural exposure | 2400 |
| Op Only | Sequence/cards | natural exposure | 2400 |
| Op + SA | Sequence/cards | natural exposure | 2400 |
| Redeploy with moves | Sequence/cards | natural exposure | 462 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 2400 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 2236 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 2400 |
| Operation state.garrison | Sequence/cards | natural exposure | 2211 |
| Operation state.sweep | Sequence/cards | natural exposure | 1499 |
| Operation state.assault | Sequence/cards | natural exposure | 2400 |
| Operation pkk.rally | Sequence/cards | natural exposure | 2400 |
| Operation pkk.march | Sequence/cards | natural exposure | 2400 |
| Operation pkk.attack | Sequence/cards | natural exposure | 488 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 569 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 2400 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 45 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 2400 |

## Diagnostics

Pass share: State 38.0%, PKK 17.0%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 4.6, PKK 1.2. Games with a 3-Pass streak: {"state":1355,"pkk":376}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":13439,"opSa":11031,"pass":19742,"opOnly":2558,"event":5166},"pkk":{"opOnly":6523,"limitedOp":11565,"opSa":16556,"event":7382,"pass":8630}}

