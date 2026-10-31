# B.0 Prototype Notes and Sources

## B.1 Edition Boundary

This is the playable **Scenario A, C1/C2** ruleset R3, dated 31 October 2026. It is a consolidated reading edition, not a new rules revision. The simulator source reviewed for this edition is main commit **4b5dbe8**. No rule, parameter or Event encoding was changed to make this document.

Scenarios B and C, the five-Campaign game, Legal Politics procedure, party closure, Village Clearance, Covert Action, ceasefire negotiations, later Pivotals and optional third-player modules are **not implemented as complete playable systems in this edition**. References to their tracks or markers explain existing components and generic adjustments; they do not authorize those actions in Scenario A. IC-3a still requires the designer to finish Scenario A and export notes.

## B.2 Rule Precedence and Consolidation

The latest explicit designer decisions take precedence over older research wording. This edition incorporates:

- **DD-20:** no income in the final Propaganda; Propaganda Agitation uses a PKK Base or PKK Control; Ambush has no roll, one activation and one State removal, with no attrition or bonus; five revised C1 Event sides and the Strike Collaborators warning.
- **DEC-53:** Reset flips all Guerrillas Underground, including Hostile/Aligned camps.
- **DEC-54 and DEC-56:** Host Pressure interruptions retain the roll and paid cost while replanning the same Rally or March.
- **DEC-55:** ARGK flips Guerrillas in every PKK Base space, not only spaces receiving recruits.
- **DEC-57:** Guard Abuse applies once in every qualifying space.
- **PA-01 to PA-10 and PA-13/14/16/17:** executing-faction choices, bounded tracks, modified die totals, Coerce order, no-roll Ambush, detection after movement, finite supply, victory ties, seeded randomness, Air Mobility's domestic-only limits and Scenario A options/Pivotal scope.

The passing and eligibility procedure is the recorded DD-04 model. Passing does not automatically promote Second Eligible to First Eligible. The fixed default simulator seed of 1 is a reproducibility choice; select Random for a new game seed.

## B.3 Differences That Need Design Review

These differences are made explicit rather than silently resolved. For **current simulator play**, this reading edition describes the implemented behavior. For a physical test using the research alternative, record the variant.

**Op Only locations.** Research 05 §2.2 describes First Eligible Op Only as two or more locations. The current engine accepts one or more. Its initiative effect is still the full Op Only effect, even at one location. A future decision must reconcile the restriction if the research wording is intended to bind.

**Reclaiming on-map pieces.** Research 04 §2.1 permits some owner-chosen removals to replenish an exhausted Available supply, excluding Guards and external pieces. Current Operation handlers require Available supply and do not offer this withdrawal mechanism. This edition does not invent a simulator withdrawal action.

No general COIN-series rule should be imported to fill either difference without recording the change. These are implementation/research differences, not additional printed-game advantages.

## B.4 Primary Rule Sources

The source files below are in the *HandfullOfBandits* repository. Numbers in original card text refer to these research chapters, not necessarily to the section numbers of this consolidated book.

- **03 Map and Spaces:** space names, terrain, Pop, stacking and adjacency. The actual movement graph is `game-packages/kurdish-coin/0.1.0/map.yaml`; Iran has no gameplay movement links.
- **04 Pieces, Tracks and Markers:** inventory, Resources, Legitimacy, marker meanings and political levels.
- **05 Sequence of Play:** deck building, initiative, Pivotal windows, Propaganda and Reset.
- **06 Operations and Special Activities:** action procedures, costs and pairing.
- **07 Political, Civilian and Sanctuary Systems:** Civic Action, Agitation, Harm, Guards, Emergency Rule and hosts.
- **08 Event Deck:** pools, lasting effects, chain constraints and attribution.
- **09 Victory and Scoring:** thresholds, Harm gate, final margins and ties.
- **10 Scenarios and Setup:** Scenario A position and starting checks.

All eight chapters are under `research/research-final/package-b-coin-design/`. The decision register is `research/research-final/project-management/design-decisions.md`; prototype decisions are in `docs/prototype/13-design-decisions.md`. Package parameters, assumptions, scenario files and current card YAML supplied the implemented values.

## B.5 Format Reference

The PDF and Markdown rule library in **Penguin-Pants/COIN_Research**, `research/rules`, was inspected at commit **b0e7c64**. The main format model is *Colonial Twilight*, revised May 2018. Comparative checks included *Cuba Libre*, *A Distant Plain*, *The British Way: Malaya* and *People Power*. The library's 22 rule PDFs and corresponding Markdown files were inventoried for structure and page format.

This edition follows their numbered-rule hierarchy, compact two-column body, serif reading text, bold headings, running folios, italic examples, tables and illustrated title/contents page. The layout is adapted to **A4 portrait, 210 × 297 mm**. The principal originals use US Letter or similar sizes, so line endings and page counts cannot be identical. Openly available Liberation font equivalents replace the originals' embedded Times/Myriad fonts. Publisher logos, third-party cover art and official publication claims are not reproduced.

**Printing:** use A4 portrait at **100% / Actual size**. The PDF has searchable text, embedded fonts, running page numbers and a linked contents list. It can be printed in grayscale; color is not needed to interpret a rule. For duplex printing, use long-edge binding. No bleed or crop marks are required.
