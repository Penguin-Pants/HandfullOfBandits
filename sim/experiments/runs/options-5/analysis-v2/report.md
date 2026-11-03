# Experiment options-5 (options)

Experiment hash `dfff7e6fdd9f81697a213f2351f00eceec0245f686fa14f4ba831033bed92a45`. Analysis version 2.

## Completion

Scheduled 2400 games: complete 2400. Incomplete games are not losses and are excluded from win rates.

## Condition no-hot-pursuit

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 34.0% [22.4%, 47.8%] n=50 | 30.0% [19.1%, 43.8%] n=50 | 68.0% [54.2%, 79.2%] n=50 | 68.0% [54.2%, 79.2%] n=50 |
| S-MIL@1 | 70.0% [56.2%, 80.9%] n=50 | 72.0% [58.3%, 82.5%] n=50 | 90.0% [78.6%, 95.7%] n=50 | 74.0% [60.4%, 84.1%] n=50 |
| S-CON@1 | 34.0% [22.4%, 47.8%] n=50 | 26.0% [15.9%, 39.6%] n=50 | 46.0% [33.0%, 59.6%] n=50 | 84.0% [71.5%, 91.7%] n=50 |
| S-ADAPT@1 | 36.0% [24.1%, 49.9%] n=50 | 36.0% [24.1%, 49.9%] n=50 | 42.0% [29.4%, 55.8%] n=50 | 100.0% [92.9%, 100.0%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 56.9% [53.1%, 60.3%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -3.5 (-16 / -5 / 9) | 1/0 | 1/0 | 0/0 |
| S-POL@1 vs P-EXP@2 | -7.1 (-19 / -8 / 5) | 0/0 | 0/2 | 0/0 |
| S-POL@1 vs P-SURV@2 | 4.5 (-5 / 5 / 16) | 0/0 | 1/0 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 6.2 (-6 / 7 / 21) | 2/0 | 4/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 6.6 (-6 / 6 / 20) | 1/0 | 1/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 6.4 (-9 / 7 / 17) | 0/0 | 2/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 11.4 (1 / 13 / 21) | 0/0 | 2/0 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 7.8 (-9 / 9 / 22) | 4/0 | 6/0 | 0/0 |
| S-CON@1 vs P-POL@2 | -4.2 (-13 / -5 / 5) | 0/0 | 0/0 | 0/0 |
| S-CON@1 vs P-EXP@2 | -5.7 (-19 / -6 / 5) | 0/2 | 0/2 | 0/0 |
| S-CON@1 vs P-SURV@2 | -0.9 (-14 / 0 / 11) | 1/0 | 1/0 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 12.5 (-2 / 14 / 27) | 7/0 | 10/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -4.7 (-19 / -4 / 13) | 0/3 | 0/3 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -3.7 (-17 / -5 / 14) | 0/0 | 0/0 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -4.0 (-20 / -3 / 10) | 0/0 | 1/3 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 25.6 (15 / 27 / 33) | 31/0 | 37/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (no-hot-pursuit): State 90.0%
- S-CON@1 vs P-ADAPT@2 (no-hot-pursuit): State 84.0%
- S-ADAPT@1 vs P-ADAPT@2 (no-hot-pursuit): State 100.0%
- S-MIL@1 vs P-SURV@2 (no-hot-pursuit): median margin difference 12.5
- S-CON@1 vs P-ADAPT@2 (no-hot-pursuit): median margin difference 14.0
- S-ADAPT@1 vs P-ADAPT@2 (no-hot-pursuit): median margin difference 27.0

## Condition no-syria-march

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 32.0% [20.8%, 45.8%] n=50 | 26.0% [15.9%, 39.6%] n=50 | 72.0% [58.3%, 82.5%] n=50 | 64.0% [50.1%, 75.9%] n=50 |
| S-MIL@1 | 66.0% [52.2%, 77.6%] n=50 | 76.0% [62.6%, 85.7%] n=50 | 84.0% [71.5%, 91.7%] n=50 | 74.0% [60.4%, 84.1%] n=50 |
| S-CON@1 | 32.0% [20.8%, 45.8%] n=50 | 22.0% [12.8%, 35.2%] n=50 | 52.0% [38.5%, 65.2%] n=50 | 84.0% [71.5%, 91.7%] n=50 |
| S-ADAPT@1 | 42.0% [29.4%, 55.8%] n=50 | 36.0% [24.1%, 49.9%] n=50 | 34.0% [22.4%, 47.8%] n=50 | 98.0% [89.5%, 99.6%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 55.9% [52.1%, 59.5%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -3.6 (-19 / -5 / 17) | 1/0 | 1/0 | 0/0 |
| S-POL@1 vs P-EXP@2 | -6.1 (-22 / -9 / 11) | 0/3 | 1/4 | 0/0 |
| S-POL@1 vs P-SURV@2 | 5.7 (-6 / 5 / 16) | 1/0 | 3/0 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 5.2 (-11 / 5 / 21) | 3/0 | 4/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 6.5 (-9 / 6 / 21) | 1/0 | 1/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 5.7 (-10 / 7 / 16) | 0/0 | 0/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 9.9 (-1 / 11 / 20) | 1/0 | 1/0 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 6.8 (-7 / 8 / 21) | 3/0 | 4/0 | 0/0 |
| S-CON@1 vs P-POL@2 | -3.4 (-13 / -4 / 7) | 0/0 | 0/0 | 0/0 |
| S-CON@1 vs P-EXP@2 | -6.8 (-18 / -8 / 3) | 0/2 | 0/2 | 0/0 |
| S-CON@1 vs P-SURV@2 | -0.1 (-14 / 1 / 10) | 0/0 | 0/0 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 10.9 (-8 / 14 / 21) | 3/1 | 5/1 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -3.2 (-15 / -3 / 11) | 0/2 | 0/2 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -4.5 (-18 / -7 / 13) | 0/0 | 0/1 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -4.7 (-22 / -4 / 8) | 0/0 | 0/1 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 22.7 (12 / 24 / 32) | 20/0 | 27/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (no-syria-march): State 84.0%
- S-CON@1 vs P-ADAPT@2 (no-syria-march): State 84.0%
- S-ADAPT@1 vs P-ADAPT@2 (no-syria-march): State 98.0%
- S-MIL@1 vs P-SURV@2 (no-syria-march): median margin difference 11.0
- S-CON@1 vs P-ADAPT@2 (no-syria-march): median margin difference 13.5
- S-ADAPT@1 vs P-ADAPT@2 (no-syria-march): median margin difference 24.0

## Condition neither

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@2 | P-EXP@2 | P-SURV@2 | P-ADAPT@2 |
|---|---|---|---|---|
| S-POL@1 | 40.0% [27.6%, 53.8%] n=50 | 24.0% [14.3%, 37.4%] n=50 | 72.0% [58.3%, 82.5%] n=50 | 66.0% [52.2%, 77.6%] n=50 |
| S-MIL@1 | 70.0% [56.2%, 80.9%] n=50 | 70.0% [56.2%, 80.9%] n=50 | 84.0% [71.5%, 91.7%] n=50 | 78.0% [64.8%, 87.2%] n=50 |
| S-CON@1 | 28.0% [17.5%, 41.7%] n=50 | 24.0% [14.3%, 37.4%] n=50 | 58.0% [44.2%, 70.6%] n=50 | 78.0% [64.8%, 87.2%] n=50 |
| S-ADAPT@1 | 50.0% [36.6%, 63.4%] n=50 | 36.0% [24.1%, 49.9%] n=50 | 48.0% [34.8%, 61.5%] n=50 | 100.0% [92.9%, 100.0%] n=50 |

Equal-weight roster average (this roster only, not a human win probability): State 57.9% [53.6%, 61.9%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@1 vs P-POL@2 | -2.8 (-18 / -3 / 11) | 0/1 | 1/2 | 0/0 |
| S-POL@1 vs P-EXP@2 | -7.6 (-22 / -7 / 7) | 0/3 | 0/5 | 0/0 |
| S-POL@1 vs P-SURV@2 | 6.2 (-6 / 6 / 20) | 1/0 | 2/1 | 0/0 |
| S-POL@1 vs P-ADAPT@2 | 6.4 (-6 / 7 / 21) | 3/0 | 7/0 | 0/0 |
| S-MIL@1 vs P-POL@2 | 7.4 (-6 / 7 / 21) | 2/0 | 2/0 | 0/0 |
| S-MIL@1 vs P-EXP@2 | 4.6 (-11 / 7 / 16) | 0/0 | 0/0 | 0/0 |
| S-MIL@1 vs P-SURV@2 | 10.1 (-2 / 13 / 22) | 1/0 | 2/1 | 0/0 |
| S-MIL@1 vs P-ADAPT@2 | 8.6 (-6 / 9 / 21) | 1/0 | 3/0 | 0/0 |
| S-CON@1 vs P-POL@2 | -4.5 (-15 / -5 / 6) | 0/0 | 0/0 | 0/0 |
| S-CON@1 vs P-EXP@2 | -5.9 (-18 / -6 / 7) | 0/2 | 0/2 | 0/0 |
| S-CON@1 vs P-SURV@2 | 1.1 (-11 / 2 / 12) | 0/1 | 0/1 | 0/0 |
| S-CON@1 vs P-ADAPT@2 | 10.1 (-4 / 12 / 25) | 4/0 | 6/0 | 0/0 |
| S-ADAPT@1 vs P-POL@2 | -1.5 (-19 / 1 / 14) | 1/2 | 1/2 | 0/0 |
| S-ADAPT@1 vs P-EXP@2 | -3.4 (-17 / -6 / 12) | 0/0 | 1/2 | 0/0 |
| S-ADAPT@1 vs P-SURV@2 | -2.1 (-15 / -2 / 11) | 0/2 | 0/2 | 0/0 |
| S-ADAPT@1 vs P-ADAPT@2 | 25.5 (18 / 26 / 33) | 30/0 | 36/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-MIL@1 vs P-SURV@2 (neither): State 84.0%
- S-ADAPT@1 vs P-ADAPT@2 (neither): State 100.0%
- S-MIL@1 vs P-SURV@2 (neither): median margin difference 12.5
- S-CON@1 vs P-ADAPT@2 (neither): median margin difference 12.0
- S-ADAPT@1 vs P-ADAPT@2 (neither): median margin difference 26.0

## Scoring routes

Mean final components over 2400 completed games: State Support 24.4 + Legitimacy 10.2; PKK Opposition 11.2 + domestic Bases 1.5.
State winners (1365): Support 29.8, Legitimacy 10.2. PKK winners (1035): Opposition 15.6, Bases 2.3.

## Review selection

Closest: neither~S-ADAPTv1~P-EXPv2~1002219~r0, neither~S-ADAPTv1~P-POLv2~1002235~r0, neither~S-ADAPTv1~P-POLv2~1002245~r0, neither~S-ADAPTv1~P-SURVv2~1002234~r0, neither~S-ADAPTv1~P-SURVv2~1002244~r0

Largest gaps: neither~S-MILv1~P-POLv2~1002235~r0, no-syria-march~S-CONv1~P-ADAPTv2~1002236~r0, neither~S-ADAPTv1~P-ADAPTv2~1002219~r0, no-hot-pursuit~S-ADAPTv1~P-ADAPTv2~1002236~r0, neither~S-ADAPTv1~P-ADAPTv2~1002226~r0

Seeded random: neither~S-MILv1~P-ADAPTv2~1002222~r0, no-hot-pursuit~S-CONv1~P-EXPv2~1002226~r0, no-hot-pursuit~S-POLv1~P-SURVv2~1002216~r0, neither~S-CONv1~P-EXPv2~1002205~r0, no-hot-pursuit~S-MILv1~P-EXPv2~1002214~r0

Failures: none

## Coverage ledger

53 natural, 15 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 2400 |
| Win at the opening check | Victory | natural exposure | 147 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 2187 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 60 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 2345 |
| Train Civic Action | Political economy | natural exposure | 2400 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 2400 |
| Propaganda Agitation spending | Political economy | natural exposure | 1962 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 374 |
| State Harm placed | Civilian effects | natural exposure | 650 |
| PKK Harm placed | Civilian effects | natural exposure | 157 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 270 |
| Coerce places Coercion | Civilian effects | natural exposure | 638 |
| Guard upkeep paid | Civilian effects | natural exposure | 1233 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 195 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 56 |
| Strike Collaborators | Civilian effects | natural exposure | 4 |
| Europe track change | Civilian effects | natural exposure | 1404 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 406 |
| Reception marker placed | Civilian effects | natural exposure | 25 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 2400 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 2400 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 138 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 2 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 2400 |
| puk posture reaches restricted | Sanctuary | natural exposure | 5 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 332 |
| Diplomacy | Sanctuary | natural exposure | 72 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 3 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 2400 |
| Unshaded Event executed | Sequence/cards | natural exposure | 2099 |
| Shaded Event executed | Sequence/cards | natural exposure | 2306 |
| ARGK played | Sequence/cards | natural exposure | 1254 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 2400 |
| Limited Op | Sequence/cards | natural exposure | 2400 |
| Op Only | Sequence/cards | natural exposure | 2400 |
| Op + SA | Sequence/cards | natural exposure | 2400 |
| Redeploy with moves | Sequence/cards | natural exposure | 450 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 2400 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 2253 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 2400 |
| Operation state.garrison | Sequence/cards | natural exposure | 2203 |
| Operation state.sweep | Sequence/cards | natural exposure | 1459 |
| Operation state.assault | Sequence/cards | natural exposure | 2400 |
| Operation pkk.rally | Sequence/cards | natural exposure | 2400 |
| Operation pkk.march | Sequence/cards | natural exposure | 2400 |
| Operation pkk.attack | Sequence/cards | natural exposure | 497 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 638 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 2400 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 62 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 2400 |

## Diagnostics

Pass share: State 38.7%, PKK 17.5%. Longest First Eligible streak: 20 cards. Mean unused Resources at the end: State 4.7, PKK 1.4. Games with a 3-Pass streak: {"state":1433,"pkk":425}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":13388,"opSa":11055,"pass":20258,"event":4962,"opOnly":2705},"pkk":{"opOnly":6630,"limitedOp":11532,"opSa":16048,"pass":8957,"event":7947}}

