# Experiment dev-s2-state-sweep (development)

Experiment hash `fccb59a68d623baea5d6d0f31a5b32f3bd497666a2122b275557a79042f9d2f6`. Analysis version 2.

## Completion

Scheduled 64 games: complete 64. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-CON@6 | 100.0% [51.0%, 100.0%] n=4 | 25.0% [4.6%, 69.9%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 75.0% [30.1%, 95.4%] n=4 |
| S-ADAPT@6 | 100.0% [51.0%, 100.0%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 75.0% [30.1%, 95.4%] n=4 |
| S-CON@7 | 75.0% [30.1%, 95.4%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 25.0% [4.6%, 69.9%] n=4 | 50.0% [15.0%, 85.0%] n=4 |
| S-ADAPT@7 | 100.0% [51.0%, 100.0%] n=4 | 25.0% [4.6%, 69.9%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 50.0% [15.0%, 85.0%] n=4 |

Equal-weight roster average (this roster only, not a human win probability): State 43.8% [37.5%, 56.3%] over 16 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-CON@6 vs P-POL@4 | 26.5 (25 / 27 / 28) | 3/0 | 3/0 | 0/0 |
| S-CON@6 vs P-EXP@4 | -16.8 (-29 / -19 / -3) | 0/2 | 0/2 | 0/0 |
| S-CON@6 vs P-SURV@4 | -14.3 (-20 / -13 / -9) | 0/0 | 0/0 | 0/0 |
| S-CON@6 vs P-ADAPT@4 | 2.5 (-2 / 1 / 8) | 0/0 | 0/0 | 0/0 |
| S-ADAPT@6 vs P-POL@4 | 22.0 (18 / 22 / 26) | 1/0 | 1/0 | 0/0 |
| S-ADAPT@6 vs P-EXP@4 | -18.5 (-32 / -14 / -9) | 0/1 | 0/1 | 0/0 |
| S-ADAPT@6 vs P-SURV@4 | -12.0 (-18 / -13 / -6) | 0/0 | 0/0 | 1/0 |
| S-ADAPT@6 vs P-ADAPT@4 | 2.0 (-20 / 10 / 18) | 0/1 | 0/1 | 0/0 |
| S-CON@7 vs P-POL@4 | 16.8 (0 / 23 / 28) | 2/0 | 2/0 | 0/0 |
| S-CON@7 vs P-EXP@4 | -32.3 (-41 / -30 / -26) | 0/2 | 0/2 | 0/0 |
| S-CON@7 vs P-SURV@4 | -10.8 (-31 / -6 / 5) | 0/1 | 0/1 | 0/0 |
| S-CON@7 vs P-ADAPT@4 | -4.3 (-23 / -6 / 16) | 0/1 | 0/1 | 0/0 |
| S-ADAPT@7 vs P-POL@4 | 18.8 (10 / 18 / 28) | 1/0 | 1/0 | 0/0 |
| S-ADAPT@7 vs P-EXP@4 | -16.8 (-38 / -13 / 2) | 0/1 | 0/1 | 1/0 |
| S-ADAPT@7 vs P-SURV@4 | -16.0 (-28 / -14 / -6) | 0/1 | 0/1 | 1/0 |
| S-ADAPT@7 vs P-ADAPT@4 | 8.3 (0 / 7 / 18) | 0/0 | 0/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-CON@6 vs P-POL@4 (default): State 100.0%
- S-CON@6 vs P-SURV@4 (default): State 0.0%
- S-ADAPT@6 vs P-POL@4 (default): State 100.0%
- S-ADAPT@6 vs P-EXP@4 (default): State 0.0%
- S-ADAPT@6 vs P-SURV@4 (default): State 0.0%
- S-CON@7 vs P-EXP@4 (default): State 0.0%
- S-ADAPT@7 vs P-POL@4 (default): State 100.0%
- S-ADAPT@7 vs P-SURV@4 (default): State 0.0%
- S-CON@6 vs P-POL@4 (default): median margin difference 26.5
- S-CON@6 vs P-EXP@4 (default): median margin difference -18.5
- S-CON@6 vs P-SURV@4 (default): median margin difference -13.0
- S-ADAPT@6 vs P-POL@4 (default): median margin difference 21.5
- S-ADAPT@6 vs P-EXP@4 (default): median margin difference -14.0
- S-ADAPT@6 vs P-SURV@4 (default): median margin difference -12.5
- S-CON@7 vs P-POL@4 (default): median margin difference 23.0
- S-CON@7 vs P-EXP@4 (default): median margin difference -29.5
- S-ADAPT@7 vs P-POL@4 (default): median margin difference 18.0
- S-ADAPT@7 vs P-EXP@4 (default): median margin difference -13.0
- S-ADAPT@7 vs P-SURV@4 (default): median margin difference -14.0

## Scoring routes

Mean final components over 64 completed games: State Support 29.3 + Legitimacy 2.6; PKK Opposition 16.3 + domestic Bases 1.0.
State winners (28): Support 39.5, Legitimacy 2.6. PKK winners (36): Opposition 22.5, Bases 1.8.

## Review selection

Closest: default~S-ADAPTv7~P-ADAPTv4~7002~r0, default~S-ADAPTv7~P-ADAPTv4~7003~r0, default~S-CONv7~P-SURVv4~7001~r0, default~S-CONv6~P-ADAPTv4~7001~r0, default~S-CONv6~P-ADAPTv4~7002~r0

Largest gaps: default~S-ADAPTv7~P-EXPv4~7004~r0, default~S-CONv7~P-EXPv4~7002~r0, default~S-CONv7~P-SURVv4~7004~r0, default~S-ADAPTv6~P-EXPv4~7001~r0, default~S-ADAPTv7~P-SURVv4~7002~r0

Seeded random: default~S-ADAPTv6~P-ADAPTv4~7004~r0, default~S-CONv6~P-POLv4~7001~r0, default~S-CONv7~P-ADAPTv4~7001~r0, default~S-CONv7~P-ADAPTv4~7002~r0, default~S-ADAPTv6~P-ADAPTv4~7003~r0

Failures: none

## Coverage ledger

75 natural, 14 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 64 |
| Win at the opening check | Victory | natural exposure | 17 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 47 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 3 |
| Final margin reduced by excess Harm | Victory | natural exposure | 3 |
| Rally Agitation | Political economy | natural exposure | 55 |
| Train Civic Action | Political economy | natural exposure | 64 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 64 |
| Propaganda Agitation spending | Political economy | natural exposure | 47 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 48 |
| State Harm placed | Civilian effects | natural exposure | 59 |
| PKK Harm placed | Civilian effects | natural exposure | 15 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 32 |
| Coerce places Coercion | Civilian effects | natural exposure | 32 |
| Guard upkeep paid | Civilian effects | natural exposure | 59 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 37 |
| Guard Abuse (DK-006 shaded) | Civilian effects | reviewed fixture | 0 |
| Strike Collaborators | Civilian effects | natural exposure | 5 |
| Europe track change | Civilian effects | natural exposure | 64 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 50 |
| Reception marker placed | Civilian effects | natural exposure | 34 |
| Displacement marker placed | Civilian effects | natural exposure | 3 |
| syria posture reaches host | Sanctuary | natural exposure | 64 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 64 |
| syria posture reaches restricted | Sanctuary | natural exposure | 7 |
| syria posture reaches hostile | Sanctuary | natural exposure | 4 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 64 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 64 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 7 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 14 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 64 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | reviewed fixture | 0 |
| Diplomacy | Sanctuary | natural exposure | 33 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 2 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 2 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | natural exposure | 4 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 64 |
| Unshaded Event executed | Sequence/cards | natural exposure | 64 |
| Shaded Event executed | Sequence/cards | natural exposure | 64 |
| ARGK played | Sequence/cards | natural exposure | 35 |
| Pivotal window declined | Sequence/cards | natural exposure | 35 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 44 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 37 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 61 |
| Covert marker revealed | Civilian effects | natural exposure | 31 |
| Strike Collaborators after the Operation | Civilian effects | natural exposure | 2 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 44 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 27 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 7 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 15 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 26 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 64 |
| Office placed | Political economy | natural exposure | 64 |
| State files a closure case | Political economy | natural exposure | 59 |
| Prosecutor files at the Office limit (line 6) | Political economy | reviewed fixture | 0 |
| Legal party banned (line 1) | Political economy | natural exposure | 57 |
| Successor party returns (line 2) | Political economy | natural exposure | 47 |
| Europe Ban marker placed (DK-064) | Sanctuary | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 64 |
| Limited Op | Sequence/cards | natural exposure | 64 |
| Op Only | Sequence/cards | natural exposure | 64 |
| Op + SA | Sequence/cards | natural exposure | 64 |
| Redeploy with moves | Sequence/cards | natural exposure | 40 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 64 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 47 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 60 |
| Operation state.train | Sequence/cards | natural exposure | 64 |
| Operation state.garrison | Sequence/cards | natural exposure | 63 |
| Operation state.sweep | Sequence/cards | natural exposure | 64 |
| Operation state.assault | Sequence/cards | natural exposure | 64 |
| Operation pkk.rally | Sequence/cards | natural exposure | 64 |
| Operation pkk.march | Sequence/cards | natural exposure | 64 |
| Operation pkk.attack | Sequence/cards | natural exposure | 42 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 32 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 64 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 3 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 35 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 19 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 64 |

## Diagnostics

Pass share: State 32.0%, PKK 15.5%. Voluntary Pass share (Resources for the cheapest Operation): State 11.0%, PKK 7.9%. Longest First Eligible streak: 49 cards. Mean unused Resources at the end: State 0.5, PKK 8.8. Games with a 3-Pass streak: {"pkk":20,"state":33}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":724,"opSa":970,"event":433,"pass":1133,"opOnly":279},"pkk":{"opOnly":379,"limitedOp":1003,"opSa":794,"pass":538,"event":758}}

| Player | Card choices | Pass | Voluntary Pass | Unused Resources at the end |
|:--|--:|--:|--:|--:|
| P-ADAPT@4 | 882 | 18.0% | 11.9% | 13.9 |
| P-EXP@4 | 847 | 10.7% | 0.0% | 0.6 |
| P-POL@4 | 878 | 21.0% | 14.1% | 18.5 |
| P-SURV@4 | 865 | 12.0% | 5.3% | 2.0 |
| S-ADAPT@6 | 911 | 31.8% | 14.4% | 0.5 |
| S-ADAPT@7 | 878 | 30.2% | 11.7% | 0.1 |
| S-CON@6 | 850 | 32.0% | 9.4% | 0.6 |
| S-CON@7 | 900 | 34.0% | 8.2% | 0.8 |

