# Experiment pilot-1 (pilot)

Experiment hash `34f83b400d2c18921b92c96ed4cbc3be3b9af5109739ad4588e661ab5f80d540`. Analysis version 1.

## Completion

Scheduled 320 games: complete 320. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT |
|---|---|---|---|---|
| S-POL | 20.0% [8.1%, 41.6%] n=20 | 25.0% [11.2%, 46.9%] n=20 | 70.0% [48.1%, 85.5%] n=20 | 80.0% [58.4%, 91.9%] n=20 |
| S-MIL | 75.0% [53.1%, 88.8%] n=20 | 75.0% [53.1%, 88.8%] n=20 | 70.0% [48.1%, 85.5%] n=20 | 100.0% [83.9%, 100.0%] n=20 |
| S-CON | 5.0% [0.9%, 23.6%] n=20 | 5.0% [0.9%, 23.6%] n=20 | 40.0% [21.9%, 61.3%] n=20 | 95.0% [76.4%, 99.1%] n=20 |
| S-ADAPT | 45.0% [25.8%, 65.8%] n=20 | 90.0% [69.9%, 97.2%] n=20 | 25.0% [11.2%, 46.9%] n=20 | 55.0% [34.2%, 74.2%] n=20 |

Equal-weight roster average (this roster only, not a human win probability): State 54.7% [50.6%, 59.1%] over 16 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-POL | -7.7 (-22 / -9 / 12) | 0/1 | 0/2 | 0/0 |
| S-POL vs P-EXP | -8.4 (-23 / -9 / 8) | 0/1 | 2/1 | 0/0 |
| S-POL vs P-SURV | 4.3 (-11 / 5 / 16) | 0/0 | 1/0 | 0/0 |
| S-POL vs P-ADAPT | 8.6 (-4 / 11 / 15) | 1/0 | 1/0 | 0/0 |
| S-MIL vs P-POL | 6.1 (-5 / 9 / 18) | 1/0 | 1/0 | 0/0 |
| S-MIL vs P-EXP | 8.9 (-3 / 13 / 21) | 0/0 | 0/1 | 0/0 |
| S-MIL vs P-SURV | 7.0 (-18 / 12 / 22) | 3/0 | 3/0 | 0/0 |
| S-MIL vs P-ADAPT | 22.3 (14 / 24 / 30) | 11/0 | 11/0 | 0/0 |
| S-CON vs P-POL | -10.8 (-20 / -12 / -5) | 0/0 | 0/0 | 0/0 |
| S-CON vs P-EXP | -13.0 (-23 / -13 / -5) | 0/0 | 0/1 | 0/0 |
| S-CON vs P-SURV | -1.9 (-11 / -3 / 9) | 0/0 | 0/1 | 0/0 |
| S-CON vs P-ADAPT | 23.6 (18 / 24 / 30) | 8/0 | 10/0 | 0/0 |
| S-ADAPT vs P-POL | -1.4 (-22 / -5 / 23) | 1/0 | 3/2 | 0/0 |
| S-ADAPT vs P-EXP | 10.7 (2 / 13 / 21) | 1/0 | 2/0 | 0/0 |
| S-ADAPT vs P-SURV | -7.5 (-22 / -10 / 10) | 2/3 | 2/4 | 0/0 |
| S-ADAPT vs P-ADAPT | 3.6 (-25 / 4 / 26) | 4/0 | 4/2 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@1 vs P-POL@1 (baseline): State 20.0%
- S-POL@1 vs P-ADAPT@1 (baseline): State 80.0%
- S-MIL@1 vs P-ADAPT@1 (baseline): State 100.0%
- S-CON@1 vs P-POL@1 (baseline): State 5.0%
- S-CON@1 vs P-EXP@1 (baseline): State 5.0%
- S-CON@1 vs P-ADAPT@1 (baseline): State 95.0%
- S-ADAPT@1 vs P-EXP@1 (baseline): State 90.0%
- S-POL@1 vs P-ADAPT@1 (baseline): median margin difference 11.0
- S-MIL@1 vs P-EXP@1 (baseline): median margin difference 13.0
- S-MIL@1 vs P-SURV@1 (baseline): median margin difference 12.0
- S-MIL@1 vs P-ADAPT@1 (baseline): median margin difference 23.5
- S-CON@1 vs P-POL@1 (baseline): median margin difference -11.5
- S-CON@1 vs P-EXP@1 (baseline): median margin difference -13.0
- S-CON@1 vs P-ADAPT@1 (baseline): median margin difference 24.0
- S-ADAPT@1 vs P-EXP@1 (baseline): median margin difference 12.5
- S-ADAPT@1 vs P-SURV@1 (baseline): median margin difference -10.0

## Scoring routes

Mean final components over 320 completed games: State Support 25.0 + Legitimacy 10.5; PKK Opposition 12.1 + domestic Bases 1.5.
State winners (175): Support 32.1, Legitimacy 10.5. PKK winners (145): Opposition 17.8, Bases 2.6.

## Review selection

Closest: baseline~S-ADAPTv1~P-SURVv1~1011~r0, baseline~S-MILv1~P-EXPv1~1011~r0, baseline~S-MILv1~P-POLv1~1017~r0, baseline~S-POLv1~P-POLv1~1001~r0, baseline~S-ADAPTv1~P-SURVv1~1018~r0

Largest gaps: baseline~S-MILv1~P-ADAPTv1~1017~r0, baseline~S-ADAPTv1~P-ADAPTv1~1007~r0, baseline~S-ADAPTv1~P-POLv1~1002~r0, baseline~S-POLv1~P-EXPv1~1011~r0, baseline~S-CONv1~P-ADAPTv1~1003~r0

Seeded random: baseline~S-MILv1~P-EXPv1~1016~r0, baseline~S-CONv1~P-SURVv1~1013~r0, baseline~S-POLv1~P-ADAPTv1~1001~r0, baseline~S-MILv1~P-ADAPTv1~1002~r0, baseline~S-CONv1~P-EXPv1~1012~r0

Failures: none

## Coverage ledger

53 natural, 15 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 320 |
| Win at the opening check | Victory | natural exposure | 37 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 266 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 4 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 307 |
| Train Civic Action | Political economy | natural exposure | 320 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 314 |
| Propaganda Agitation spending | Political economy | natural exposure | 249 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 45 |
| State Harm placed | Civilian effects | natural exposure | 84 |
| PKK Harm placed | Civilian effects | natural exposure | 45 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 64 |
| Coerce places Coercion | Civilian effects | natural exposure | 66 |
| Guard upkeep paid | Civilian effects | natural exposure | 208 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 42 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 21 |
| Strike Collaborators | Civilian effects | natural exposure | 1 |
| Europe track change | Civilian effects | natural exposure | 174 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 58 |
| Reception marker placed | Civilian effects | natural exposure | 6 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 320 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 320 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 320 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 320 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 7 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 320 |
| puk posture reaches restricted | Sanctuary | natural exposure | 1 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | natural exposure | 31 |
| Diplomacy | Sanctuary | natural exposure | 7 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | natural exposure | 46 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 320 |
| Unshaded Event executed | Sequence/cards | natural exposure | 281 |
| Shaded Event executed | Sequence/cards | natural exposure | 309 |
| ARGK played | Sequence/cards | natural exposure | 175 |
| ARGK declined | Sequence/cards | natural exposure | 1 |
| Pass | Sequence/cards | natural exposure | 320 |
| Limited Op | Sequence/cards | natural exposure | 320 |
| Op Only | Sequence/cards | natural exposure | 320 |
| Op + SA | Sequence/cards | natural exposure | 320 |
| Redeploy with moves | Sequence/cards | natural exposure | 56 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 320 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 283 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 320 |
| Operation state.garrison | Sequence/cards | natural exposure | 263 |
| Operation state.sweep | Sequence/cards | natural exposure | 167 |
| Operation state.assault | Sequence/cards | natural exposure | 320 |
| Operation pkk.rally | Sequence/cards | natural exposure | 320 |
| Operation pkk.march | Sequence/cards | natural exposure | 320 |
| Operation pkk.attack | Sequence/cards | natural exposure | 104 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 66 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 320 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 28 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 320 |

## Diagnostics

Pass share: State 39.6%, PKK 16.1%. Longest First Eligible streak: 17 cards. Mean unused Resources at the end: State 3.9, PKK 1.0. Games with a 3-Pass streak: {"state":187,"pkk":45}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":1763,"opSa":1373,"pass":2819,"event":720,"opOnly":445},"pkk":{"opOnly":943,"limitedOp":1615,"opSa":2226,"pass":1116,"event":1045}}

