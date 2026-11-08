# B.0 Prototype Notes and Sources

## B.1 Edition Boundary

This is the **full game** ruleset R4, dated 8 November 2026: the full five-Campaign game and Scenarios A, B and C. The source baseline is main commit **f0e6415**. The rules text follows the engine and the approved decisions DEC-63 to DEC-75, which added Village Clearance, Covert Action, Legal Politics, ceasefire and Talks, the four Pivotals, the structural cards and the Campaign switches. The earlier Scenario A edition was based on commit **d9a6453**.

**Not covered in this edition:** the optional modules of research chapter 13 (including the third-player module) and the card appendix for Campaigns C3 to C5. Appendix A still reproduces C1 and C2 only. The C3 to C5 card text is in `game-packages/kurdish-coin/0.1.0/cards/`. The designer checkpoints IC-3a to IC-3c are still open, so the full-game systems are implemented but not yet playtested by the designer.

## B.2 Rule Precedence and Consolidation

The latest explicit designer decisions take precedence over older research wording. This edition incorporates:

- **DD-21:** ordinary Attack reuses its die for attrition. Only if Troops are removed and the result is less than or equal to the Troop count before the Attack, remove one Guerrilla per Troop removed. No second roll. Apply the roll-of-1 bonus afterward. Ambush remains exempt.

- **DD-20:** no income in the final Propaganda; Propaganda Agitation uses a PKK Base or PKK Control; Ambush has no roll, one activation and one State removal, with no attrition or bonus; five revised C1 Event sides and the Strike Collaborators warning.
- **DEC-53:** Reset flips all Guerrillas Underground, including Hostile/Aligned camps.
- **DEC-54 and DEC-56:** Host Pressure interruptions retain the roll and paid cost while replanning the same Rally or March.
- **DEC-62:** the replan also applies when the planned locations become unaffordable. With no legal, affordable replacement, the Operation ends; the roll, posture change and cost stand.
- **DEC-55:** ARGK flips Guerrillas in every PKK Base space, not only spaces receiving recruits.
- **DEC-57:** Guard Abuse applies once in every qualifying space.
- **DEC-63 to DEC-66 and DEC-74:** Village Clearance, Covert Action, Legal Politics and the ceasefire step, in the approved texts of `docs/prototype/27` to `30`. DEC-68 deleted the separate OHAL Powers flag, so Village Clearance depends on Campaign C3 and Emergency Rule only.
- **DEC-67 and DEC-69 to DEC-73, DEC-75:** the Pivotals, the structural cards and the C3 to C5 card encodings, including the PKK Event restriction.
- **DEC-77:** the Scenario B State threshold defaults to 48; 46 stays a session option.
- **PA-01 to PA-10 and PA-13/14/16 to 18:** executing-faction choices, bounded tracks, modified die totals, Coerce order, no-roll Ambush, detection after movement, finite supply, victory ties, seeded randomness, Air Mobility's domestic-only limits, the Syria March option and the Village Clearance shift block.

The passing and eligibility procedure is the recorded DD-04 model. Passing does not automatically promote Second Eligible to First Eligible. The fixed default simulator seed of 1 is a reproducibility choice; select Random for a new game seed.

## B.3 Differences That Need Design Review

These differences are made explicit rather than silently resolved. For **current simulator play**, this reading edition describes the implemented behavior. For a physical test using the research alternative, record the variant.

**Op Only locations.** Research 05 §2.2 describes First Eligible Op Only as two or more locations. The current engine accepts one or more. Its initiative effect is still the full Op Only effect, even at one location. A future decision must reconcile the restriction if the research wording is intended to bind.

**Reclaiming on-map pieces.** Research 04 §2.1 permits some owner-chosen removals to replenish an exhausted Available supply, excluding Guards and external pieces. Current Operation handlers require Available supply and do not offer this withdrawal mechanism. This edition does not invent a simulator withdrawal action.

**Talks vote.** Research 07 §7.3 step 2 has each faction choose yes or no to Talks in secret. The simulator takes both answers on one screen, State first (DEC-66). The printed rule in 8.6 says only that each faction votes. A future decision must say whether a physical game uses a secret vote.

No general COIN-series rule should be imported to fill any of these differences without recording the change. These are implementation/research differences, not additional printed-game advantages.

## B.4 Primary Rule Sources

The source files below are in the *HandfulOfBandits* project. Numbers in original card text refer to these research chapters, not necessarily to the section numbers of this consolidated book.

- **03 Map and Spaces:** space names, terrain, Pop, stacking and adjacency. The actual movement graph is `game-packages/kurdish-coin/0.1.0/map.yaml`; Iran has no gameplay movement links.
- **04 Pieces, Tracks and Markers:** inventory, Resources, Legitimacy, marker meanings and political levels.
- **05 Sequence of Play:** deck building, initiative, Pivotal windows, Propaganda and Reset.
- **06 Operations and Special Activities:** action procedures, costs and pairing.
- **07 Political, Civilian and Sanctuary Systems:** Civic Action, Agitation, Harm, Guards, Emergency Rule and hosts.
- **08 Event Deck:** pools, lasting effects, chain constraints and attribution.
- **09 Victory and Scoring:** thresholds, Harm gate, final margins and ties.
- **10 Scenarios and Setup:** the four setups, the structural cards and the Campaign switches.

The Phase 3b texts (`docs/prototype/27` to `31`) and the scenario files in `game-packages/kurdish-coin/0.1.0/scenarios/` give the current wording and values for Village Clearance, Covert Action, Legal Politics, ceasefire, the Pivotals and the setups.

All eight chapters are under `research/research-final/package-b-coin-design/`. The decision register is `research/research-final/project-management/design-decisions.md`; prototype decisions are in `docs/prototype/13-design-decisions.md`. Package parameters, assumptions, scenario files and current card YAML supplied the implemented values.

## B.5 Format Reference

Format model: *Colonial Twilight*, revised May 2018, checked against *Cuba Libre*, *A Distant Plain*, *The British Way: Malaya* and *People Power*. PDF and Markdown sources: **Penguin-Pants/COIN_Research**, `research/rules`, commit **b0e7c64**.

This edition follows the numbered rules, two-column serif text, running folios, examples, tables and illustrated contents page. It adapts the original US Letter format to **A4 portrait, 210 × 297 mm**, with embedded Liberation font equivalents. Publisher branding and third-party artwork are not reproduced.

**Printing:** A4 portrait, **100% / Actual size**. For duplex use long-edge binding. Grayscale is supported. Text is searchable and the contents links are active.
