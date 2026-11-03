# Experiment dev-probe-spend (development)

Experiment hash `85b6f8a017a299b0766481ac34ac8b3a5ab578740df939376f8743a191350b0f`. Analysis version 1.

## Completion

Scheduled 80 games: complete 80. Incomplete games are not losses and are excluded from win rates.

## Condition baseline

State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.

| State \ PKK | P-SHIELD | P-POL |
|---|---|---|
| S-SPEND | 7.5% [2.6%, 19.9%] n=40 | 52.5% [37.5%, 67.1%] n=40 |

Equal-weight roster average (this roster only, not a human win probability): State 30.0% [21.3%, 37.5%] over 2 cells; seed-cluster bootstrap.

| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |
|---|---|---|---|---|
| S-SPEND vs P-SHIELD | -11.2 (-22 / -11 / -1) | 0/2 | 0/3 | 0/0 |
| S-SPEND vs P-POL | -1.6 (-17 / 1 / 14) | 2/1 | 2/3 | 0/0 |

Review triggers (not balance pass/fail):

- S-SPEND@3 vs P-SHIELD@3 (baseline): State 7.5%
- PKK roster average 70.0% > 60%
- S-SPEND@3 vs P-SHIELD@3 (baseline): median margin difference -10.5

## Scoring routes

Mean final components over 80 completed games: State Support 21.9 + Legitimacy 10.9; PKK Opposition 16.4 + domestic Bases 3.8.
State winners (24): Support 28.3, Legitimacy 10.3. PKK winners (56): Opposition 19.0, Bases 4.7.

## Review selection

Closest: baseline~S-SPENDv3~P-SHIELDv3~3033~r0, baseline~S-SPENDv3~P-POLv2~3003~r0, baseline~S-SPENDv3~P-POLv2~3013~r0, baseline~S-SPENDv3~P-POLv2~3016~r0, baseline~S-SPENDv3~P-POLv2~3028~r0

Largest gaps: baseline~S-SPENDv3~P-SHIELDv3~3011~r0, baseline~S-SPENDv3~P-POLv2~3037~r0, baseline~S-SPENDv3~P-SHIELDv3~3034~r0, baseline~S-SPENDv3~P-POLv2~3004~r0, baseline~S-SPENDv3~P-SHIELDv3~3007~r0

Seeded random: baseline~S-SPENDv3~P-SHIELDv3~3007~r0, baseline~S-SPENDv3~P-SHIELDv3~3018~r0, baseline~S-SPENDv3~P-POLv2~3031~r0, baseline~S-SPENDv3~P-SHIELDv3~3011~r0, baseline~S-SPENDv3~P-SHIELDv3~3026~r0

Failures: none

## Coverage ledger

47 natural, 21 fixture only, 2 not applicable, 0 unresolved.

| Mechanic | Area | Status | Games |
|---|---|---|---|
| First Propaganda skips the victory check | Victory | natural exposure | 80 |
| Win at the opening check | Victory | natural exposure | 5 |
| Both factions qualify at one check | Victory | reviewed fixture | 0 |
| Harm above six blocks an otherwise qualifying check | Victory | reviewed fixture | 0 |
| Final win with a negative margin | Victory | natural exposure | 72 |
| Equal final margins decided by Harm, then PKK | Victory | natural exposure | 1 |
| Final margin reduced by excess Harm | Victory | reviewed fixture | 0 |
| Rally Agitation | Political economy | natural exposure | 80 |
| Train Civic Action | Political economy | natural exposure | 80 |
| Propaganda Civic Action spending (Legitimacy cap) | Political economy | natural exposure | 80 |
| Propaganda Agitation spending | Political economy | natural exposure | 78 |
| Removal of blocking markers before a shift (Coercion, Harm, Reception) | Political economy | natural exposure | 16 |
| State Harm placed | Civilian effects | natural exposure | 31 |
| PKK Harm placed | Civilian effects | natural exposure | 9 |
| Disputed Harm placed (Cross-Border Assault) | Civilian effects | natural exposure | 5 |
| Coerce places Coercion | Civilian effects | natural exposure | 17 |
| Guard upkeep paid | Civilian effects | natural exposure | 67 |
| Guards removed for unpaid upkeep | Civilian effects | natural exposure | 18 |
| Guard Abuse (DK-006 shaded) | Civilian effects | natural exposure | 6 |
| Strike Collaborators | Civilian effects | reviewed fixture | 0 |
| Europe track change | Civilian effects | natural exposure | 59 |
| Harm or Coercion marker removed (Redress, Reset) | Civilian effects | natural exposure | 17 |
| Reception marker placed | Civilian effects | reviewed fixture | 0 |
| Displacement marker placed | Civilian effects | not applicable | 0 |
| syria posture reaches host | Sanctuary | natural exposure | 80 |
| syria posture reaches tolerant | Sanctuary | natural exposure | 80 |
| syria posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| syria posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| syria posture reaches aligned | Sanctuary | not applicable | 0 |
| kdp posture reaches host | Sanctuary | natural exposure | 80 |
| kdp posture reaches tolerant | Sanctuary | natural exposure | 80 |
| kdp posture reaches restricted | Sanctuary | natural exposure | 1 |
| kdp posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| kdp posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| puk posture reaches host | Sanctuary | reviewed fixture | 0 |
| puk posture reaches tolerant | Sanctuary | natural exposure | 80 |
| puk posture reaches restricted | Sanctuary | reviewed fixture | 0 |
| puk posture reaches hostile | Sanctuary | reviewed fixture | 0 |
| puk posture reaches aligned | Sanctuary | reviewed fixture | 0 |
| Host Pressure | Sanctuary | reviewed fixture | 0 |
| Diplomacy | Sanctuary | natural exposure | 9 |
| Cross-Border Sweep or Assault | Sanctuary | reviewed fixture | 0 |
| Early KDP hot pursuit (KDP Host or Tolerant) | Sanctuary | reviewed fixture | 0 |
| Operation resumed after Host Pressure (interrupted continuation) | Sanctuary | reviewed fixture | 0 |
| March into a Restricted box (+1, activates) | Sanctuary | reviewed fixture | 0 |
| Leadership flips Abroad | Sanctuary | reviewed fixture | 0 |
| Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020) | Sequence/cards | natural exposure | 80 |
| Unshaded Event executed | Sequence/cards | natural exposure | 73 |
| Shaded Event executed | Sequence/cards | natural exposure | 77 |
| ARGK played | Sequence/cards | natural exposure | 57 |
| ARGK declined | Sequence/cards | reviewed fixture | 0 |
| Pass | Sequence/cards | natural exposure | 80 |
| Limited Op | Sequence/cards | natural exposure | 80 |
| Op Only | Sequence/cards | natural exposure | 80 |
| Op + SA | Sequence/cards | natural exposure | 80 |
| Redeploy with moves | Sequence/cards | natural exposure | 41 |
| Reset (Momentum discarded or Guerrillas flipped) | Sequence/cards | natural exposure | 80 |
| Final round skips income, Redeploy and Reset | Sequence/cards | natural exposure | 75 |
| Emergency Rule step chosen (OHAL to Normalizing or back) | Sequence/cards | reviewed fixture | 0 |
| Operation state.train | Sequence/cards | natural exposure | 80 |
| Operation state.garrison | Sequence/cards | natural exposure | 78 |
| Operation state.sweep | Sequence/cards | natural exposure | 25 |
| Operation state.assault | Sequence/cards | natural exposure | 79 |
| Operation pkk.rally | Sequence/cards | natural exposure | 80 |
| Operation pkk.march | Sequence/cards | natural exposure | 80 |
| Operation pkk.attack | Sequence/cards | natural exposure | 19 |
| Operation pkk.coerce | Sequence/cards | natural exposure | 17 |
| Special Activity state.air-mobility | Sequence/cards | natural exposure | 80 |
| Special Activity pkk.ambush | Sequence/cards | natural exposure | 9 |
| Special Activity pkk.extort | Sequence/cards | natural exposure | 80 |

## Diagnostics

Pass share: State 38.6%, PKK 18.8%. Longest First Eligible streak: 19 cards. Mean unused Resources at the end: State 0.8, PKK 1.9. Games with a 3-Pass streak: {"state":47,"pkk":24}. Stop-rule flags: {}.

Boxes by faction: {"state":{"limitedOp":473,"opSa":316,"pass":676,"opOnly":66,"event":221},"pkk":{"opSa":533,"limitedOp":425,"opOnly":186,"pass":318,"event":233}}

