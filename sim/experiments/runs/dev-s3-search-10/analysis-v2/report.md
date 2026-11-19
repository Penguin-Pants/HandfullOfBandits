# Experiment dev-s3-search-10 (development)

Experiment hash `1405552ba39e1880599140aab9515f75be66360cbba55134874209eb48d4c56c`. Analysis version 2.

## Completion

Scheduled 120 games: complete 120. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-SEARCH@1 | 100.0% [72.2%, 100.0%] n=10 | 0.0% [0.0%, 27.8%] n=10 | 0.0% [0.0%, 27.8%] n=10 | 20.0% [5.7%, 51.0%] n=10 |
| S-CON@5 | 70.0% [39.7%, 89.2%] n=10 | 0.0% [0.0%, 27.8%] n=10 | 0.0% [0.0%, 27.8%] n=10 | 0.0% [0.0%, 27.8%] n=10 |
| S-CON@4 | 100.0% [72.2%, 100.0%] n=10 | 30.0% [10.8%, 60.3%] n=10 | 30.0% [10.8%, 60.3%] n=10 | 90.0% [59.6%, 98.2%] n=10 |

Equal-weight roster average (this roster only, not a human win probability): State 36.7% [32.5%, 40.8%] over 12 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-SEARCH@1 vs P-POL@4 | 16.5 (9 / 15 / 26) | 2/0 | 2/0 | 0/0 |
| S-SEARCH@1 vs P-EXP@4 | -27.2 (-40 / -26 / -16) | 0/8 | 0/8 | 1/0 |
| S-SEARCH@1 vs P-SURV@4 | -14.7 (-25 / -16 / -3) | 0/1 | 0/2 | 0/0 |
| S-SEARCH@1 vs P-ADAPT@4 | -12.2 (-24 / -14 / 3) | 0/4 | 0/4 | 0/0 |
| S-CON@5 vs P-POL@4 | 10.4 (-3 / 11 / 26) | 2/0 | 2/0 | 0/0 |
| S-CON@5 vs P-EXP@4 | -24.4 (-38 / -24 / -11) | 0/3 | 0/3 | 2/0 |
| S-CON@5 vs P-SURV@4 | -20.9 (-28 / -23 / -14) | 0/4 | 0/4 | 0/0 |
| S-CON@5 vs P-ADAPT@4 | -11.8 (-21 / -10 / -3) | 0/1 | 0/1 | 0/0 |
| S-CON@4 vs P-POL@4 | 21.1 (13 / 19 / 31) | 4/0 | 4/0 | 0/0 |
| S-CON@4 vs P-EXP@4 | -7.4 (-29 / -4 / 6) | 0/2 | 0/2 | 0/0 |
| S-CON@4 vs P-SURV@4 | -7.6 (-17 / -14 / 6) | 1/0 | 1/0 | 0/0 |
| S-CON@4 vs P-ADAPT@4 | 13.7 (2 / 16 / 23) | 1/0 | 1/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-SEARCH@1 vs P-POL@4 (default): State 100.0%
- S-SEARCH@1 vs P-EXP@4 (default): State 0.0%
- S-SEARCH@1 vs P-SURV@4 (default): State 0.0%
- S-SEARCH@1 vs P-ADAPT@4 (default): State 20.0%
- S-CON@5 vs P-EXP@4 (default): State 0.0%
- S-CON@5 vs P-SURV@4 (default): State 0.0%
- S-CON@5 vs P-ADAPT@4 (default): State 0.0%
- S-CON@4 vs P-POL@4 (default): State 100.0%
- S-CON@4 vs P-ADAPT@4 (default): State 90.0%
- PKK roster average 63.3% > 60%
- S-SEARCH@1 vs P-POL@4 (default): median margin difference 15.0
- S-SEARCH@1 vs P-EXP@4 (default): median margin difference -25.5
- S-SEARCH@1 vs P-SURV@4 (default): median margin difference -16.0
- S-SEARCH@1 vs P-ADAPT@4 (default): median margin difference -13.5
- S-CON@5 vs P-POL@4 (default): median margin difference 11.0
- S-CON@5 vs P-EXP@4 (default): median margin difference -24.0
- S-CON@5 vs P-SURV@4 (default): median margin difference -22.5
- S-CON@4 vs P-POL@4 (default): median margin difference 19.0
- S-CON@4 vs P-SURV@4 (default): median margin difference -13.5
- S-CON@4 vs P-ADAPT@4 (default): median margin difference 16.0

## Scoring routes

Mean final components over 120 completed games: State Support 27.1 + Legitimacy 4.3; PKK Opposition 17.9 + domestic Bases 1.7.
State winners (44): Support 37.6, Legitimacy 4.0. PKK winners (76): Opposition 23.5, Bases 2.3.

## Review selection

Closest: default~S-CONv4~P-EXPv4~7101~r0, default~S-CONv4~P-EXPv4~7107~r0, default~S-CONv4~P-SURVv4~7106~r0, default~S-CONv5~P-ADAPTv4~7110~r0, default~S-CONv5~P-POLv4~7108~r0

Largest gaps: default~S-CONv5~P-EXPv4~7105~r0, default~S-SEARCHv1~P-EXPv4~7109~r0, default~S-SEARCHv1~P-EXPv4~7103~r0, default~S-CONv5~P-EXPv4~7103~r0, default~S-SEARCHv1~P-EXPv4~7110~r0

Seeded random: default~S-CONv4~P-EXPv4~7107~r0, default~S-CONv5~P-ADAPTv4~7110~r0, default~S-SEARCHv1~P-EXPv4~7109~r0, default~S-CONv4~P-POLv4~7101~r0, default~S-CONv5~P-ADAPTv4~7101~r0

Failures: none

## Coverage ledger

80 natural, 9 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 120 |
| Win at the opening check | Victory | natural exposure | 33 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 86 |
| Equal final margins decided by Harm, then PKK | Victory | reviewed fixture | 0 |
| Final margin reduced by excess Harm | Victory | natural exposure | 3 |
| Rally Agitation | Political economy | natural exposure | 110 |
| Train Civic Action | Political economy | natural exposure | 119 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 120 |
| Propaganda Agitation spending | Political economy | natural exposure | 100 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 66 |
| State Harm placed | Civilian effects | natural exposure | 96 |
| PKK Harm placed | Civilian effects | natural exposure | 43 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 59 |
| Coerce places Coercion | Civilian effects | natural exposure | 73 |
| Guard upkeep paid | Civilian effects | natural exposure | 112 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 70 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 6 |
| Strike Collaborators | Civilian effects | natural exposure | 15 |
| Europe track change | Civilian effects | natural exposure | 118 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 77 |
| Reception marker placed | Civilian effects | natural exposure | 62 |
| Displacement marker placed | Civilian effects | natural exposure | 4 |
| syria posture reaches host | Sanctuary | natural exposure | 120 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 120 |
| syria posture reaches restricted | Sanctuary | natural exposure | 6 |
| syria posture reaches hostile | Sanctuary | natural exposure | 1 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 120 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 120 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 17 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 16 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 120 |
| puk posture reaches restricted | Sanctuary | natural exposure | 6 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 1 |
| Diplomacy | Sanctuary | natural exposure | 39 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 3 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 2 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | natural exposure | 1 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | natural exposure | 1 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 120 |
| Unshaded Event executed | Sequence/cards | natural exposure | 119 |
| Shaded Event executed | Sequence/cards | natural exposure | 120 |
| ARGK played | Sequence/cards | natural exposure | 84 |
| Pivotal window declined | Sequence/cards | natural exposure | 55 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 81 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 60 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 105 |
| Covert marker revealed | Civilian effects | natural exposure | 32 |
| Strike Collaborators after the Operation | Civilian effects | natural exposure | 3 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 68 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 31 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 14 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 33 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 28 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 116 |
| Office placed | Political economy | natural exposure | 116 |
| State files a closure case | Political economy | natural exposure | 102 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 1 |
| Legal party banned (line 1) | Political economy | natural exposure | 93 |
| Successor party returns (line 2) | Political economy | natural exposure | 83 |
| Europe Ban marker placed (DK-064) | Sanctuary | natural exposure | 5 |
| Pass | Sequence/cards | natural exposure | 120 |
| Limited Op | Sequence/cards | natural exposure | 120 |
| Op Only | Sequence/cards | natural exposure | 120 |
| Op + SA | Sequence/cards | natural exposure | 120 |
| Redeploy with moves | Sequence/cards | natural exposure | 81 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 120 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 87 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 100 |
| Operation state.train | Sequence/cards | natural exposure | 120 |
| Operation state.garrison | Sequence/cards | natural exposure | 116 |
| Operation state.sweep | Sequence/cards | natural exposure | 120 |
| Operation state.assault | Sequence/cards | natural exposure | 120 |
| Operation pkk.rally | Sequence/cards | natural exposure | 120 |
| Operation pkk.march | Sequence/cards | natural exposure | 120 |
| Operation pkk.attack | Sequence/cards | natural exposure | 85 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 73 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 120 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 4 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 36 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 42 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 120 |

## Diagnostics

Pass share: State 30.4%, PKK 12.9%. Voluntary Pass share (Resources for the cheapest Operation): State 8.0%, PKK 4.5%. Longest First Eligible streak: 44 cards. Mean unused Resources at the end: State 0.4, PKK 3.4. Games with a 3-Pass streak: {"pkk":23,"state":32}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":1281,"opSa":1557,"opOnly":591,"pass":1921,"event":962},"pkk":{"opOnly":721,"limitedOp":2001,"opSa":1682,"pass":795,"event":983}}

| Player | Card choices | Pass | Voluntary Pass | Unused Resources at the end |
|:--|--:|--:|--:|--:|
| P-ADAPT@4 | 1579 | 15.8% | 7.0% | 6.7 |
| P-EXP@4 | 1391 | 9.6% | 0.2% | 0.4 |
| P-POL@4 | 1644 | 14.0% | 6.9% | 5.4 |
| P-SURV@4 | 1568 | 11.7% | 3.4% | 1.0 |
| S-CON@4 | 2208 | 35.5% | 15.9% | 0.5 |
| S-CON@5 | 2149 | 28.8% | 4.2% | 0.4 |
| S-SEARCH@1 | 1955 | 26.5% | 3.2% | 0.3 |

