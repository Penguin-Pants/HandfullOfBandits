# Experiment dev-s2-state-v5 (development)

Experiment hash `30260692d8ed7ef9a9e4bd1f57f557276ed1c141394c38b4ba80bbb220bac091`. Analysis version 2.

## Completion

Scheduled 128 games: complete 128. Incomplete games are not losses and are excluded from win rates.

## Condition default

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL@4 | P-EXP@4 | P-SURV@4 | P-ADAPT@4 |
|---|---|---|---|---|
| S-POL@5 | 100.0% [51.0%, 100.0%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 25.0% [4.6%, 69.9%] n=4 |
| S-MIL@5 | 50.0% [15.0%, 85.0%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 50.0% [15.0%, 85.0%] n=4 |
| S-CON@5 | 75.0% [30.1%, 95.4%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 25.0% [4.6%, 69.9%] n=4 |
| S-ADAPT@5 | 100.0% [51.0%, 100.0%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 50.0% [15.0%, 85.0%] n=4 |
| S-POL@4 | 100.0% [51.0%, 100.0%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 25.0% [4.6%, 69.9%] n=4 | 0.0% [0.0%, 49.0%] n=4 |
| S-MIL@4 | 100.0% [51.0%, 100.0%] n=4 | 0.0% [0.0%, 49.0%] n=4 | 25.0% [4.6%, 69.9%] n=4 | 75.0% [30.1%, 95.4%] n=4 |
| S-CON@4 | 100.0% [51.0%, 100.0%] n=4 | 25.0% [4.6%, 69.9%] n=4 | 50.0% [15.0%, 85.0%] n=4 | 50.0% [15.0%, 85.0%] n=4 |
| S-ADAPT@4 | 100.0% [51.0%, 100.0%] n=4 | 25.0% [4.6%, 69.9%] n=4 | 25.0% [4.6%, 69.9%] n=4 | 75.0% [30.1%, 95.4%] n=4 |

Equal-weight roster average (this roster only, not a human win probability): State 39.1% [25.0%, 53.1%] over 32 qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL@5 vs P-POL@4 | 17.8 (6 / 21 / 28) | 2/0 | 2/0 | 0/0 |
| S-POL@5 vs P-EXP@4 | -31.0 (-35 / -33 / -25) | 0/3 | 0/4 | 0/0 |
| S-POL@5 vs P-SURV@4 | -21.5 (-31 / -24 / -10) | 0/3 | 0/3 | 0/0 |
| S-POL@5 vs P-ADAPT@4 | -21.0 (-41 / -30 / 6) | 1/3 | 1/3 | 0/0 |
| S-MIL@5 vs P-POL@4 | 7.0 (-6 / 4 / 22) | 1/0 | 1/0 | 0/0 |
| S-MIL@5 vs P-EXP@4 | -29.8 (-36 / -31 / -22) | 0/2 | 0/2 | 0/0 |
| S-MIL@5 vs P-SURV@4 | -16.8 (-29 / -18 / -4) | 0/1 | 0/1 | 0/0 |
| S-MIL@5 vs P-ADAPT@4 | -11.3 (-33 / -3 / 4) | 0/1 | 0/1 | 0/0 |
| S-CON@5 vs P-POL@4 | 11.0 (-0 / 13 / 21) | 0/0 | 0/0 | 0/0 |
| S-CON@5 vs P-EXP@4 | -26.8 (-39 / -33 / -10) | 0/3 | 0/3 | 0/0 |
| S-CON@5 vs P-SURV@4 | -23.0 (-26 / -23 / -20) | 0/0 | 0/0 | 0/0 |
| S-CON@5 vs P-ADAPT@4 | -7.5 (-24 / -10 / 11) | 0/1 | 0/1 | 0/0 |
| S-ADAPT@5 vs P-POL@4 | 18.8 (12 / 21 / 24) | 1/0 | 1/0 | 0/0 |
| S-ADAPT@5 vs P-EXP@4 | -27.3 (-35 / -28 / -19) | 0/2 | 0/2 | 0/0 |
| S-ADAPT@5 vs P-SURV@4 | -15.3 (-27 / -16 / -3) | 0/0 | 0/0 | 0/0 |
| S-ADAPT@5 vs P-ADAPT@4 | 1.3 (-15 / 3 / 17) | 1/1 | 1/1 | 0/0 |
| S-POL@4 vs P-POL@4 | 20.3 (13 / 19 / 29) | 1/0 | 1/0 | 0/0 |
| S-POL@4 vs P-EXP@4 | -15.3 (-27 / -14 / -5) | 0/1 | 0/1 | 0/0 |
| S-POL@4 vs P-SURV@4 | -13.3 (-19 / -19 / -3) | 0/0 | 0/0 | 0/0 |
| S-POL@4 vs P-ADAPT@4 | -28.5 (-32 / -29 / -25) | 0/0 | 0/1 | 0/0 |
| S-MIL@4 vs P-POL@4 | 27.3 (24 / 26 / 31) | 3/0 | 4/0 | 0/0 |
| S-MIL@4 vs P-EXP@4 | -31.0 (-40 / -28 / -25) | 0/2 | 0/2 | 0/0 |
| S-MIL@4 vs P-SURV@4 | -11.5 (-27 / -10 / 3) | 0/1 | 0/1 | 0/0 |
| S-MIL@4 vs P-ADAPT@4 | 4.5 (1 / 3 / 10) | 0/0 | 0/0 | 0/0 |
| S-CON@4 vs P-POL@4 | 25.3 (17 / 29 / 31) | 3/0 | 3/0 | 0/0 |
| S-CON@4 vs P-EXP@4 | -16.0 (-27 / -20 / -2) | 0/0 | 0/0 | 0/0 |
| S-CON@4 vs P-SURV@4 | -6.5 (-19 / -4 / 3) | 0/0 | 0/0 | 0/0 |
| S-CON@4 vs P-ADAPT@4 | 2.3 (-10 / 0 / 17) | 0/0 | 0/0 | 0/0 |
| S-ADAPT@4 vs P-POL@4 | 21.5 (15 / 24 / 27) | 0/0 | 2/0 | 1/0 |
| S-ADAPT@4 vs P-EXP@4 | -2.0 (-6 / -5 / 4) | 0/0 | 0/0 | 0/0 |
| S-ADAPT@4 vs P-SURV@4 | -6.3 (-10 / -8 / -1) | 0/0 | 0/0 | 0/0 |
| S-ADAPT@4 vs P-ADAPT@4 | 7.0 (-4 / 10 / 17) | 0/0 | 0/0 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@5 vs P-POL@4 (default): State 100.0%
- S-POL@5 vs P-EXP@4 (default): State 0.0%
- S-POL@5 vs P-SURV@4 (default): State 0.0%
- S-MIL@5 vs P-EXP@4 (default): State 0.0%
- S-MIL@5 vs P-SURV@4 (default): State 0.0%
- S-CON@5 vs P-EXP@4 (default): State 0.0%
- S-CON@5 vs P-SURV@4 (default): State 0.0%
- S-ADAPT@5 vs P-POL@4 (default): State 100.0%
- S-ADAPT@5 vs P-EXP@4 (default): State 0.0%
- S-ADAPT@5 vs P-SURV@4 (default): State 0.0%
- S-POL@4 vs P-POL@4 (default): State 100.0%
- S-POL@4 vs P-EXP@4 (default): State 0.0%
- S-POL@4 vs P-ADAPT@4 (default): State 0.0%
- S-MIL@4 vs P-POL@4 (default): State 100.0%
- S-MIL@4 vs P-EXP@4 (default): State 0.0%
- S-CON@4 vs P-POL@4 (default): State 100.0%
- S-ADAPT@4 vs P-POL@4 (default): State 100.0%
- PKK roster average 60.9% > 60%
- S-POL@5 vs P-POL@4 (default): median margin difference 20.5
- S-POL@5 vs P-EXP@4 (default): median margin difference -33.0
- S-POL@5 vs P-SURV@4 (default): median margin difference -23.5
- S-POL@5 vs P-ADAPT@4 (default): median margin difference -30.0
- S-MIL@5 vs P-EXP@4 (default): median margin difference -31.0
- S-MIL@5 vs P-SURV@4 (default): median margin difference -17.5
- S-CON@5 vs P-POL@4 (default): median margin difference 13.0
- S-CON@5 vs P-EXP@4 (default): median margin difference -32.5
- S-CON@5 vs P-SURV@4 (default): median margin difference -23.0
- S-ADAPT@5 vs P-POL@4 (default): median margin difference 21.0
- S-ADAPT@5 vs P-EXP@4 (default): median margin difference -28.0
- S-ADAPT@5 vs P-SURV@4 (default): median margin difference -16.0
- S-POL@4 vs P-POL@4 (default): median margin difference 18.5
- S-POL@4 vs P-EXP@4 (default): median margin difference -13.5
- S-POL@4 vs P-SURV@4 (default): median margin difference -18.5
- S-POL@4 vs P-ADAPT@4 (default): median margin difference -28.5
- S-MIL@4 vs P-POL@4 (default): median margin difference 26.0
- S-MIL@4 vs P-EXP@4 (default): median margin difference -27.5
- S-CON@4 vs P-POL@4 (default): median margin difference 28.5
- S-CON@4 vs P-EXP@4 (default): median margin difference -20.0
- S-ADAPT@4 vs P-POL@4 (default): median margin difference 23.5

## Scoring routes

Mean final components over 128 completed games: State Support 26.6 + Legitimacy 3.7; PKK Opposition 17.8 + domestic Bases 1.5.
State winners (50): Support 39.2, Legitimacy 3.1. PKK winners (78): Opposition 23.4, Bases 2.3.

## Review selection

Closest: default~S-CONv5~P-EXPv4~7003~r0, default~S-MILv4~P-ADAPTv4~7004~r0, default~S-MILv5~P-SURVv4~7001~r0, default~S-ADAPTv4~P-SURVv4~7003~r0, default~S-ADAPTv5~P-SURVv4~7002~r0

Largest gaps: default~S-MILv4~P-EXPv4~7004~r0, default~S-POLv5~P-ADAPTv4~7002~r0, default~S-MILv5~P-ADAPTv4~7002~r0, default~S-CONv5~P-EXPv4~7002~r0, default~S-MILv5~P-EXPv4~7003~r0

Seeded random: default~S-MILv5~P-POLv4~7004~r0, default~S-ADAPTv4~P-EXPv4~7001~r0, default~S-POLv4~P-ADAPTv4~7001~r0, default~S-CONv5~P-SURVv4~7003~r0, default~S-MILv5~P-SURVv4~7001~r0

Failures: none

## Coverage ledger

76 natural, 13 fixture only, 1 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 128 |
| Win at the opening check | Victory | natural exposure | 37 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 86 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 3 |
| Final margin reduced by excess Harm | Victory | natural exposure | 1 |
| Rally Agitation | Political economy | natural exposure | 112 |
| Train Civic Action | Political economy | natural exposure | 127 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 128 |
| Propaganda Agitation spending | Political economy | natural exposure | 101 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 84 |
| State Harm placed | Civilian effects | natural exposure | 116 |
| PKK Harm placed | Civilian effects | natural exposure | 17 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 58 |
| Coerce places Coercion | Civilian effects | natural exposure | 66 |
| Guard upkeep paid | Civilian effects | natural exposure | 107 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 48 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 5 |
| Strike Collaborators | Civilian effects | natural exposure | 4 |
| Europe track change | Civilian effects | natural exposure | 126 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 92 |
| Reception marker placed | Civilian effects | natural exposure | 53 |
| Displacement marker placed | Civilian effects | natural exposure | 2 |
| syria posture reaches host | Sanctuary | natural exposure | 128 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 128 |
| syria posture reaches restricted | Sanctuary | natural exposure | 4 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 128 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 128 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 5 |
| kdp posture reaches hostile | Sanctuary | natural exposure | 2 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | natural exposure | 11 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 128 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | reviewed fixture | 0 |
| Diplomacy | Sanctuary | natural exposure | 23 |
| Cross-Border Sweep or Assault | Sanctuary | natural exposure | 1 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | natural exposure | 1 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 128 |
| Unshaded Event executed | Sequence/cards | natural exposure | 126 |
| Shaded Event executed | Sequence/cards | natural exposure | 127 |
| ARGK played | Sequence/cards | natural exposure | 94 |
| Pivotal window declined | Sequence/cards | natural exposure | 69 |
| Serhildan played (DK-054, from C3) | Sequence/cards | natural exposure | 81 |
| Area Domination played (DK-076, from C4) | Sequence/cards | natural exposure | 70 |
| Coercive Diplomacy on Syria played (DK-098, from C5) | Sequence/cards | reviewed fixture | 0 |
| Emergency Rule reaches OHAL Extended Powers (from C3) | Sequence/cards | natural exposure | 110 |
| Covert marker revealed | Civilian effects | natural exposure | 52 |
| Strike Collaborators after the Operation | Civilian effects | natural exposure | 1 |
| Ceasefire Declared (from C3) | Political economy | natural exposure | 71 |
| Ceasefire reaches Reciprocal Restraint | Political economy | natural exposure | 45 |
| Ceasefire breach (Restraint Broken marker and Ceasefire to None) | Political economy | natural exposure | 9 |
| State Restraint Broken marker during Declared (no breach) | Political economy | natural exposure | 24 |
| Ceasefire ended at the ceasefire step | Political economy | natural exposure | 42 |
| Legal Space opens (HEP Founded) | Political economy | natural exposure | 120 |
| Office placed | Political economy | natural exposure | 120 |
| State files a closure case | Political economy | natural exposure | 109 |
| Prosecutor files at the Office limit (line 6) | Political economy | natural exposure | 2 |
| Legal party banned (line 1) | Political economy | natural exposure | 103 |
| Successor party returns (line 2) | Political economy | natural exposure | 89 |
| Europe Ban marker placed (DK-064) | Sanctuary | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 128 |
| Limited Op | Sequence/cards | natural exposure | 128 |
| Op Only | Sequence/cards | natural exposure | 128 |
| Op + SA | Sequence/cards | natural exposure | 128 |
| Redeploy with moves | Sequence/cards | natural exposure | 70 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 128 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 91 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | natural exposure | 111 |
| Operation state.train | Sequence/cards | natural exposure | 127 |
| Operation state.garrison | Sequence/cards | natural exposure | 127 |
| Operation state.sweep | Sequence/cards | natural exposure | 128 |
| Operation state.assault | Sequence/cards | natural exposure | 128 |
| Operation pkk.rally | Sequence/cards | natural exposure | 128 |
| Operation pkk.march | Sequence/cards | natural exposure | 128 |
| Operation pkk.attack | Sequence/cards | natural exposure | 86 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 66 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 128 |
| Special Activity state.village-clearance | Sequence/cards | natural exposure | 2 |
| Special Activity state.covert-action | Sequence/cards | natural exposure | 59 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 37 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 128 |

## Diagnostics

Pass share: State 31.8%, PKK 12.9%. Voluntary Pass share (Resources for the cheapest Operation): State 12.1%, PKK 5.2%. Longest First Eligible streak: 51 cards. Mean unused Resources at the end: State 2.7, PKK 5.1. Games with a 3-Pass streak: {"state":55,"pkk":28}. Stop-rule flags: {"rule 4":1}.

Boxes by faction: {"state":{"limitedOp":1493,"opSa":1680,"event":748,"pass":2128,"opOnly":650},"pkk":{"opOnly":841,"limitedOp":2038,"opSa":1651,"pass":849,"event":1179}}

| Player | Card choices | Pass | Voluntary Pass | Unused Resources at the end |
|:--|--:|--:|--:|--:|
| P-ADAPT@4 | 1641 | 14.3% | 6.9% | 7.4 |
| P-EXP@4 | 1472 | 10.1% | 0.1% | 0.8 |
| P-POL@4 | 1742 | 17.2% | 9.8% | 11.3 |
| P-SURV@4 | 1703 | 9.7% | 3.5% | 0.8 |
| S-ADAPT@4 | 910 | 33.4% | 22.7% | 0.9 |
| S-ADAPT@5 | 864 | 28.5% | 5.4% | 0.4 |
| S-CON@4 | 884 | 34.7% | 15.6% | 0.7 |
| S-CON@5 | 805 | 29.3% | 3.0% | 0.1 |
| S-MIL@4 | 815 | 33.4% | 11.7% | 0.5 |
| S-MIL@5 | 829 | 29.0% | 3.1% | 0.4 |
| S-POL@4 | 887 | 33.4% | 23.9% | 16.9 |
| S-POL@5 | 705 | 32.2% | 8.8% | 2.1 |

