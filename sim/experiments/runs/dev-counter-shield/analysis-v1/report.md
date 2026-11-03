# Experiment dev-counter-shield (development)

Experiment hash `24f5dda535542558297b5cfedd4a929926e8745612e2f673e1e23c692057baa5`. Analysis version 1.

## Completion

Scheduled 320 games: complete 320. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-SHIELD | P-POL |
|---|---|---|
| S-POL | 5.0% [1.4%, 16.5%] n=40 | 25.0% [14.2%, 40.2%] n=40 |
| S-MIL | 0.0% [0.0%, 8.8%] n=40 | 62.5% [47.0%, 75.8%] n=40 |
| S-CON | 0.0% [0.0%, 8.8%] n=40 | 22.5% [12.3%, 37.5%] n=40 |
| S-ADAPT | 0.0% [0.0%, 8.8%] n=40 | 32.5% [20.1%, 48.0%] n=40 |

Equal-weight roster average (this roster only, not a human win probability): State 18.4% [14.7%, 22.2%] over 8 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-POL vs P-SHIELD | -13.4 (-24 / -14 / -4) | 0/2 | 1/3 | 0/0 |
| S-MIL vs P-SHIELD | -12.6 (-23 / -11 / -5) | 0/2 | 0/2 | 0/0 |
| S-CON vs P-SHIELD | -10.4 (-14 / -11 / -4) | 0/0 | 0/1 | 0/0 |
| S-ADAPT vs P-SHIELD | -21.6 (-33 / -21 / -11) | 0/11 | 0/12 | 0/0 |
| S-POL vs P-POL | -6.1 (-19 / -9 / 14) | 0/0 | 0/0 | 0/0 |
| S-MIL vs P-POL | 3.6 (-8 / 4 / 16) | 2/0 | 2/0 | 0/0 |
| S-CON vs P-POL | -7.5 (-18 / -10 / 7) | 0/1 | 1/1 | 0/0 |
| S-ADAPT vs P-POL | -3.6 (-22 / -8 / 23) | 3/1 | 4/1 | 0/0 |

Review triggers (not balance pass/fail):

- S-POL@1 vs P-SHIELD@3 (baseline): State 5.0%
- S-MIL@1 vs P-SHIELD@3 (baseline): State 0.0%
- S-CON@1 vs P-SHIELD@3 (baseline): State 0.0%
- S-ADAPT@1 vs P-SHIELD@3 (baseline): State 0.0%
- PKK roster average 81.6% > 60%
- S-POL@1 vs P-SHIELD@3 (baseline): median margin difference -14.0
- S-MIL@1 vs P-SHIELD@3 (baseline): median margin difference -10.5
- S-CON@1 vs P-SHIELD@3 (baseline): median margin difference -10.5
- S-ADAPT@1 vs P-SHIELD@3 (baseline): median margin difference -21.0
- S-CON@1 vs P-POL@2 (baseline): median margin difference -10.0

## Scoring routes

Mean final components over 320 completed games: State Support 19.9 + Legitimacy 9.9; PKK Opposition 16.3 + domestic Bases 3.4.
State winners (59): Support 30.2, Legitimacy 9.5. PKK winners (261): Opposition 18.1, Bases 4.0.

## Review selection

Closest: baseline~S-MILv1~P-POLv2~3001~r0, baseline~S-MILv1~P-POLv2~3002~r0, baseline~S-MILv1~P-SHIELDv3~3019~r0, baseline~S-ADAPTv1~P-POLv2~3026~r0, baseline~S-CONv1~P-POLv2~3014~r0

Largest gaps: baseline~S-ADAPTv1~P-SHIELDv3~3023~r0, baseline~S-ADAPTv1~P-SHIELDv3~3018~r0, baseline~S-ADAPTv1~P-SHIELDv3~3019~r0, baseline~S-CONv1~P-SHIELDv3~3016~r0, baseline~S-ADAPTv1~P-SHIELDv3~3011~r0

Seeded random: baseline~S-MILv1~P-POLv2~3036~r0, baseline~S-CONv1~P-SHIELDv3~3033~r0, baseline~S-POLv1~P-POLv2~3001~r0, baseline~S-MILv1~P-POLv2~3002~r0, baseline~S-CONv1~P-POLv2~3032~r0

Failures: none

## Coverage ledger

48 natural, 20 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 320 |
| Win at the opening check | Victory | natural exposure | 22 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 292 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 3 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 318 |
| Train Civic Action | Political economy | natural exposure | 320 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 310 |
| Propaganda Agitation spending | Political economy | natural exposure | 312 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 45 |
| State Harm placed | Civilian effects | natural exposure | 124 |
| PKK Harm placed | Civilian effects | natural exposure | 24 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 24 |
| Coerce places Coercion | Civilian effects | natural exposure | 57 |
| Guard upkeep paid | Civilian effects | natural exposure | 207 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 33 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 3 |
| Strike Collaborators | Civilian effects | reviewed fixture | 0 |
| Europe track change | Civilian effects | natural exposure | 198 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 50 |
| Reception marker placed | Civilian effects | natural exposure | 3 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 320 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 320 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 320 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 320 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 10 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 320 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | reviewed fixture | 0 |
| Diplomacy | Sanctuary | natural exposure | 2 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 320 |
| Unshaded Event executed | Sequence/cards | natural exposure | 280 |
| Shaded Event executed | Sequence/cards | natural exposure | 301 |
| ARGK played | Sequence/cards | natural exposure | 263 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 320 |
| Limited Op | Sequence/cards | natural exposure | 320 |
| Op Only | Sequence/cards | natural exposure | 320 |
| Op + SA | Sequence/cards | natural exposure | 320 |
| Redeploy with moves | Sequence/cards | natural exposure | 116 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 320 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 298 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 320 |
| Operation state.garrison | Sequence/cards | natural exposure | 305 |
| Operation state.sweep | Sequence/cards | natural exposure | 220 |
| Operation state.assault | Sequence/cards | natural exposure | 317 |
| Operation pkk.rally | Sequence/cards | natural exposure | 320 |
| Operation pkk.march | Sequence/cards | natural exposure | 320 |
| Operation pkk.attack | Sequence/cards | natural exposure | 75 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 57 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 320 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 25 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 320 |

## Diagnostics

Pass share: State 38.7%, PKK 16.8%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 4.7, PKK 1.5. Games with a 3-Pass streak: {"state":177,"pkk":82}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":1736,"opSa":1427,"pass":2715,"opOnly":413,"event":717},"pkk":{"opSa":2156,"limitedOp":1723,"opOnly":900,"event":836,"pass":1130}}

