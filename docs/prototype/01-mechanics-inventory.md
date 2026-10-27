# 01 Mechanics Inventory

Status: planning document. No application code exists.

## 1. Purpose

This inventory lists every mechanic that the simulator must represent for the selected prototype design. Each row traces to the research package under `research/research-final/`.

Path abbreviations:

| Short form | Path |
|---|---|
| 03 to 13 | `research/research-final/package-b-coin-design/NN-*.md` |
| DD-nn | `research/research-final/project-management/design-decisions.md` |
| DK-nnn | `research/research-final/data/prototype-deck.csv` |
| M-nnn | `research/research-final/data/mechanic-evidence-links.csv` |
| IR-nn | `research/research-final/audit/independent-critical-review.md` |

## 2. Method

1. Four bounded extraction passes read chapters 02 to 13, the decisions file, the gaps file, the deck CSV and the evidence CSV. Each pass wrote a raw inventory.
2. One integration pass read chapters 05, 06 and 09 in full and checked each raw row against the source text.
3. Raw "gaps" that came only from a pass not reading a cross-referenced chapter were removed. Example: "Propaganda timing of Reception drain is missing" is answered in 05, section 6.4.

Confidence: high for map, pieces, operations, sequence and victory rows (source read directly). Medium for chapter 07 rows (read through extraction and spot checks).

## 3. Selected design

The research package names one core design. This plan implements that design and nothing else.

| Item | Selection | Source |
|---|---|---|
| Factions | Turkish State and PKK (two players) | DD-02 |
| Non-player systems | Legal Politics, host postures, Village Guards, event-only actors | DD-02, DD-08 to DD-10 |
| Campaign | Five Campaigns, C1 1984-1986 to C5 1996-1999 | DD-01 |
| Sequence of play | Colonial Twilight (CT) initiative track | DD-04 |
| Map | 13 domestic spaces and 5 external boxes | DD-05 |
| Victory | State: Total Support + Legitimacy. PKK: Total Opposition + domestic PKK Bases. Harm gates | DD-14 |
| Optional modules | MOD-3B (3 factions), MOD-4A (4 factions), Concept B map | 13; DD-16 |

The optional modules are inventoried in section 12. The plan does not build them before the core design is playable (see 10-mvp-scope.md).

## 4. Status vocabulary

| Status | Meaning in this inventory |
|---|---|
| Approved | Rule text exists and a binding DD entry covers it |
| Recommended | Rule text exists in a chapter. No DD entry |
| Tune | Rule text exists. The value is marked `[tune]` |
| Competing | Two sources give different rules. The simulator must not pick one silently |
| Unresolved | The research names the item as open |
| Missing | A rule is needed and no source gives it. See 02-rules-gap-analysis.md |

Every mechanic also has research status "Hypothesis" (DD-15.1). That status applies to all rows and is not repeated.

## 5. Column key

| Column | Meaning |
|---|---|
| ID | Stable inventory ID. Package rule IDs reuse these (04-game-package-spec.md) |
| Rationale | Evidence IDs the source cites |
| Deps | Other inventory IDs this row needs |
| Cx | Implementation complexity: L low, M medium, H high |
| Data | Can the package express it as data? Y yes, P partly, N no |
| Ext | Does it need a custom rule module? Y yes, N no |

State variables, actions and automatic effects use the names in 05-rules-engine-spec.md.

## 6. Map and terrain

| ID | Name | Description | Source | Rationale | Status | Deps | State variables | Actions | Automatic effects | Cx | Data | Ext |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MAP-01 | Domestic spaces | 13 spaces with terrain, Pop and border tags. Total Pop 32 | 03 s2 | Q-004 to Q-125 (Low) | Approved | none | space.pop, space.terrain | all | none | L | Y | N |
| MAP-02 | Adjacency | 20 undirected land links. Western Cities has none | 03 s4 | Province borders, Moderate | Recommended | MAP-01 | static graph | March, Sweep | none | L | Y | N |
| MAP-03 | External boxes | Syria-Bekaa, KDP Zone, PUK Zone, Iran, Europe. No Control, no Pop for victory | 03 s3 | F-007, F-022, F-025 | Approved | MAP-01 | box pieces | Rally, March, Cross-Border | none | L | Y | N |
| MAP-04 | External links | Syria-Bekaa to Mardin-Batman and Şanlıurfa. KDP Zone to Hakkari, Botan, PUK Zone. PUK Zone to KDP Zone only | 03 s3, s4 | L-031, L-032 | Approved | MAP-03 | posture | March | none | L | Y | N |
| MAP-05 | Mountain modifier | Activation 1 per 2 eligible State pieces. Assault 1 removal per 2 Troops. Round down. Applies in KDP and PUK Zones | 03 s2.1; 06 s1.6 | CT 3.2.2 to 3.2.4 | Approved | MAP-01 | terrain | Sweep, Garrison, Assault | none | L | Y | N |
| MAP-06 | City rules | Police count as Troops for Assault. PKK Rally only at Neutral or Opposition | 03 s2.1 | CT 3.2.4, 3.3.1 | Approved | MAP-01 | level | Assault, Rally | none | L | Y | N |
| MAP-07 | Western Cities exceptions | No land links. No March, Sweep or Garrison into or out of it. PKK Rally also at Passive or Active Support. No PKK Base | 03 s2.1, s4.2; 06 s4.1 | IR-36 | Tune | MAP-06 | level | Rally, Train, Air Mobility | none | M | P | N |
| MAP-08 | Stacking | Max 2 Bases per faction per space. Max 2 PKK Bases per box. Max 3 Guards per space | 03 s5 | CT 1.4.2 | Tune | MAP-01 | piece counts | all placements | placement refused | L | Y | N |
| MAP-09 | Control | Faction pieces exceed enemy pieces. Offices never count. Guards count | 03 s6 | CT 1.7; DD-10.2 | Approved | PCS-01 to PCS-06 | derived | none | recompute after each step | L | Y | N |

## 7. Pieces, tracks and markers

| ID | Name | Description | Source | Rationale | Status | Deps | State variables | Actions | Automatic effects | Cx | Data | Ext |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PCS-01 | Troops | 30. State | 04 s2 | O-091 | Approved | none | pools, per space | Train, Sweep, Assault, Air Mobility, Cross-Border | to Available on removal | L | Y | N |
| PCS-02 | Police | 24. State | 04 s2 | O-092 | Approved | none | pools, per space | Train, Garrison | as PCS-01 | L | Y | N |
| PCS-03 | Village Guards | 16. Out of Play until Law 3175. Never move. Count for Control | 04 s2; DD-08 | E-0004, F-010 | Approved | CRD-04 | pools, per space | Train option 2 | upkeep | M | Y | N |
| PCS-04 | State Bases | 8. Never move. Never in a box | 04 s2 | CT 1.4 | Approved | none | pools, per space | Train option 3 | income term | L | Y | N |
| PCS-05 | Guerrillas | 30. Underground or Active. Placed Underground | 04 s2 | F-009 | Approved | none | pools, per space, flip state | Rally, March, Attack | Reset flip | L | Y | N |
| PCS-06 | PKK Bases | 12. Domestic Bases score | 04 s2; DD-14.3 | F-007 | Approved | none | pools, per space | Rally option 2 | score, income | L | Y | N |
| PCS-07 | Piece shortage | Owner may take a piece from the map, except Guards and box pieces | 04 s2.1 | CT 1.4.1 | Recommended | PCS-01 to PCS-06 | pools | placements | none | M | P | N |
| TRK-01 | Resources | State and PKK, 0 to 50 | 04 s3.1 | CT 1.8 | Approved | none | resources | all | clamp | L | Y | N |
| TRK-02 | Legitimacy | 0 to 20. Unpaid loss costs 2 Resources per point | 04 s3.2 | DD-06.3 | Tune | TRK-01 | legitimacy | many | clamp, overflow to Resources | M | P | Y |
| TRK-03 | Emergency Rule | Martial Law, OHAL, OHAL Extended Powers, Normalizing. Explicit move table | 04 s3.3; 07 s8 | DD-12, DD-17.4 | Approved | none | emergencyRule | Propaganda step | drain | M | Y | N |
| TRK-04 | Host postures | Syria 4 steps. KDP and PUK 5 steps with Aligned | 04 s3.4; 07 s5 | DD-09 | Approved | MAP-03 | posture x3 | Diplomacy, Host Pressure | Leadership flip at Syria Hostile | M | Y | N |
| TRK-05 | Ceasefire | None, Declared, Reciprocal Restraint, Talks | 04 s3.5; 07 s7 | DD-11 | Approved | none | ceasefire | Declare Ceasefire | restriction checks | H | P | Y |
| TRK-06 | Europe | 0 to 5. Income 0, 1 or 2. Legitimacy -1 at 4 or 5. Ban caps at 3 | 04 s3.6; 07 s9 | F-040 | Recommended | none | europe, banMarker | Rally (Europe), Diplomacy | income, drain | M | Y | N |
| TRK-07 | Legal Space | Absent, Open, Prosecuted, Banned | 04 s3.7; 07 s6 | DD-10 | Approved | none | legalSpace | events | procedure table | M | Y | N |
| TRK-08 | Campaign | C1 to C5 | 04 s3 | DD-01 | Approved | none | campaign | none | Reset advance | L | Y | N |
| TRK-09 | Support scale | Five levels. Totals Pop x1 or x2 | 04 s4.1; 07 s1.2 | DD-06.2 | Approved | MAP-01 | level per space | shifts | derived totals | L | Y | N |
| TRK-10 | Shift blocks | Coercion blocks both ways. State Harm blocks toward Support. PKK Harm blocks toward Opposition. Office caps at Passive | 07 s1.2 | DD-06.5, DD-18.4 | Approved | MKR-01 to MKR-03 | markers | all shifts | shift refused | M | Y | N |
| MKR-01 | Harm markers | State 12, PKK 12, Disputed 6. Stay until removed | 04 s4; 07 s3.1 | DD-07.1 | Approved | none | markers | Clearance, Strike, Cross-Border | Harm counts | L | Y | N |
| MKR-02 | Coercion | 8. Counts in PKK Harm. Reset removes one per space | 04 s4; DD-17.5 | M-040 | Approved | none | markers | Coerce | Reset removal | L | Y | N |
| MKR-03 | Displacement | 10. New and Old sides. Blocks PKK Rally, Extort, Coerce | 04 s4; 07 s3.2 | F-050 | Recommended | none | markers | Clearance, Return | Propaganda flip | L | Y | N |
| MKR-04 | Reception | 8. In Diyarbakır City or Western Cities. Relief 1 each | 04 s4; 07 s3.2 | M-018 | Recommended | none | markers | Civic Action | drain at 3 or more | L | Y | N |
| MKR-05 | Covert markers | 6. Face down. Reveal: State Harm and Legitimacy -2 | 04 s4; 06 s3.5 | M-009 | Approved | MKR-01 | hidden markers | Covert Action | check penalty, reveal | M | P | Y |
| MKR-06 | Offices | 8. No Control. Placed by procedure | 04 s4; 07 s6.2 | DD-10.2 | Approved | TRK-07 | markers | none (non-player) | caps level | M | Y | N |
| MKR-07 | Closure Case and Successor | One of each | 04 s4; 07 s6.3 | DD-10.4 | Approved | TRK-07 | flags | closure filing | procedure | L | Y | N |
| MKR-08 | Leadership | Present or Abroad. Removed by Capture | 04 s2; 07 s5.2 | DD-09.6 | Approved | TRK-04 | leadership | Host Pressure | income term | L | Y | N |
| MKR-09 | Restraint Broken | One per faction. Reset removes | 04 s4; 05 s6.8 | DD-11 | Approved | TRK-05 | flags | breach | Reset removal | L | Y | N |
| MKR-10 | Capability and Momentum | Capability lasts the game. Momentum lasts to Reset | 04 s4; 08 s5 | DD-13.5 | Approved | CRD-01 | modifiers | events | Reset discard | H | P | Y |

## 8. Sequence of play

| ID | Name | Description | Source | Rationale | Status | Deps | State variables | Actions | Automatic effects | Cx | Data | Ext |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SOP-01 | Deck build | 5 piles. Mandatory cards in top 8. Chain order. Propaganda in bottom 4 | 05 s1.1 | DD-13, DD-17.1 | Approved | CRD-01 | deck, seed | setup | seeded shuffle | M | P | Y |
| SOP-02 | Initiative track | Boxes Event, Limited Op, Op Only, Op + SA, Pass | 05 s2.1 | DD-04 | Approved | none | cylinders | all | none | M | Y | N |
| SOP-03 | Responder matrix | Adjacency graph. Event and Pass rows are design choices | 05 s2.3 | CT 2.3.2 | Recommended | SOP-02 | first choice | responder choice | legal box list | L | Y | N |
| SOP-04 | Eligibility | Op Only or Op + SA hands First to the other faction | 05 s2.4 | CT 2.3.5 | Approved | SOP-02 | eligibility | none | eligibility update | L | Y | N |
| SOP-05 | Limited Op | One location. Many origins, one destination | 05 s3.1 | CT 2.3.4 | Approved | SOP-02 | none | all Ops | location count check | M | P | N |
| SOP-06 | Pass | State +2, PKK +1 | 05 s3.2 | DD-04.4 | Approved | TRK-01 | resources | Pass | income | L | Y | N |
| SOP-07 | Pivotal Events | Two per faction. Campaign and board preconditions. Second Eligible has priority | 05 s4 | DD-13.4 | Approved | CRD-01 | hand | Pivotal | eligibility set | H | P | Y |
| SOP-08 | Event execution | Choose one side. Do as much as possible. Text overrides rules within limits | 05 s5 | CT 5.1 to 5.4 | Approved | CRD-01 | none | Event | partial execution log | H | P | Y |
| SOP-09 | Ownership limit | PKK may not execute sides that place or resolve a Closure Case, ban, remove Offices or move Legal Space | 05 s5.1; DD-10.5 | IR-31 | Approved | CRD-01 | none | Event | side refused | L | Y | N |
| SOP-10 | Propaganda round | Phases 6.1 to 6.8 in fixed order. No two in a row | 05 s6 | CT 6.0 | Approved | many | phase | Propaganda decisions | many | H | P | Y |
| SOP-11 | Income | State 8 + Legitimacy/2 + qualifying Pop. PKK Bases, hosts, Leadership, Europe | 05 s6.2 | CT 6.2 | Tune | TRK-01 | resources | none | income | M | P | Y |
| SOP-12 | Guard upkeep | 1 per 2 Guards, round up. Remove Guards on shortfall | 05 s6.3 | DD-08.3 | Tune | PCS-03 | resources | Guard removal choice | upkeep | L | Y | N |
| SOP-13 | Legitimacy phase | 8 ordered steps: drain, Displacement, Reception, Disputed, Covert exposure, Europe, gains, Emergency step | 05 s6.4 | DD-12 | Approved | many | many | Emergency step choice | many | H | P | Y |
| SOP-14 | Civic Action and Agitation phase | State then PKK. State cap Legitimacy/2 | 05 s6.6; 07 s1.3 | DD-18.2 | Tune | TRK-09 | resources | spend decisions | none | M | P | N |
| SOP-15 | Redeploy | State Troops to Cities or State Bases. PKK to adjacent PKK Base | 05 s6.7 | CT 6.4 | Approved | MAP-02 | pieces | redeploy moves | Control after both | M | P | N |
| SOP-16 | Reset | Coercion -1 per space, flip Underground, discard Momentum, remove Restraint Broken, advance Campaign, PKK First | 05 s6.8 | CT 6.5 | Approved | many | many | none | all listed | M | Y | N |
| SOP-17 | Structural switches | Per Campaign on and off switches | 10 s6.2 | DD-01 | Recommended | TRK-08 | flags | none | switch flags | M | Y | N |

## 9. Operations and special activities

| ID | Name | Description | Source | Rationale | Status | Deps | State variables | Actions | Automatic effects | Cx | Data | Ext |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| OPS-01 | Train | 2 per space. Three options. Civic Action in one space | 06 s2.1 | E-0004, F-011 | Approved | PCS-01 to PCS-04 | pools | Op | Control | M | P | N |
| OPS-02 | Garrison | 2 total. Move up to 6 Police. Activate in one space | 06 s2.2 | F-012 | Recommended | MAP-05 | pieces | Op | activation | M | P | N |
| OPS-03 | Sweep | 2 per space, 1 at OHAL Extended Powers. Adjacent Troops one step. Activate | 06 s2.3 | E-0202 | Tune | MAP-02, MAP-05 | pieces | Op | activation | M | P | N |
| OPS-04 | Assault | 2 per space. Remove per Troop. Active first. Bases last | 06 s2.4 | F-049 | Approved | MAP-05 | pieces | Op | removal | M | P | N |
| OPS-05 | Air Mobility | Up to 4 Troops among up to 3 spaces | 06 s3.1 | CT 4.2.2 | Approved | none | pieces | SA | none | M | P | N |
| OPS-06 | Cross-Border | +2 Resources. Posture access. Hot pursuit C1 and C2. Disputed Harm on removal | 06 s3.2 | E-0077, F-024 (Low) | Tune | TRK-04 | pieces, posture | SA | Disputed marker | H | P | Y |
| OPS-07 | Diplomacy | 2 Resources. One target. Die roll with modifiers | 06 s3.3 | F-056 | Recommended | TRK-04, TRK-06 | posture, europe, rng | SA | posture shift | M | P | N |
| OPS-08 | Village Clearance | Conditions and 7 ordered effects | 06 s3.4 | F-031 (Low), E-0200 | Approved | TRK-02, TRK-03, MKR-03, MKR-04 | many | SA | 7 effects | H | P | Y |
| OPS-09 | Covert Action | From C3. Legitimacy 4+. Remove 1 Underground Guerrilla. Face-down marker | 06 s3.5 | F-028 (alleged) | Approved | MKR-05 | hidden markers | SA | none now | M | P | Y |
| OPS-10 | Rally | 1 per location. Three options. Europe location. Agitate in one space | 06 s4.1 | F-007, F-040 | Tune | MAP-06, MAP-07, TRK-06 | pieces, europe | Op | Underground placement | H | P | N |
| OPS-11 | March | 1 per destination. Posture entry. Activation condition | 06 s4.2 | F-023 | Competing (see GAP-I02) | MAP-02, TRK-04 | pieces | Op | activation | M | P | N |
| OPS-12 | Attack | 1 per space. Activate all. Die roll. Attrition. Roll of 1 adds a Guerrilla | 06 s4.3 | E-0003 | Recommended | none | pieces, rng | Op | removal | M | P | N |
| OPS-13 | Coerce | 1 per space, 2 in Pop 3+. Coercion marker. Shift toward Neutral | 06 s4.4 | F-034; DD-19.4 | Tune | MKR-02 | markers | Op | shift | M | P | N |
| OPS-14 | Ambush | Up to 2 Attack spaces. No roll. Remove 1. No attrition | 06 s5.1 | E-0162 | Recommended | OPS-12 | pieces | SA | removal | M | P | N |
| OPS-15 | Extort | +1 per qualifying space or box. Activate one | 06 s5.2 | F-034 (Low) | Recommended | none | resources | SA | income | L | P | N |
| OPS-16 | Strike Collaborators | Needs Law 3175. Up to 2 spaces. PKK Harm. Europe -1 | 06 s5.3 | F-012 | Approved | PCS-03 | markers | SA | Harm, Europe | M | P | N |
| OPS-17 | Host Pressure | 2 Resources. Die roll per host. Backfire | 06 s5.4 | F-041 (Low) | Recommended | TRK-04 | posture, rng | SA | posture shift | M | P | N |
| OPS-18 | Civic Action costs | Coercion 1, Relief 1, Redress 3, Return 3, Shift 2. Max 2 shifts | 07 s1.3 | CT 6.3.1 | Recommended | TRK-09 | markers, level | Train, Propaganda | none | M | Y | N |
| OPS-19 | Agitation costs | Coercion 1, Redress 2, Shift 1. Max 2 shifts | 07 s1.3 | CT 6.3.2 | Recommended | TRK-09 | markers, level | Rally, Propaganda | none | M | Y | N |
| OPS-20 | Declare Ceasefire | From C3. Limited Op box. Europe +1 | 05 s2.3; 07 s7.1 | DD-17.3 | Approved | TRK-05 | ceasefire | Limited Op | Europe | L | Y | N |
| OPS-21 | Free actions | Event-granted actions cost nothing and do not change eligibility. Civic Action still costs | 05 s5.4 | CT 5.5 | Approved | SOP-08 | none | Event | none | M | P | N |

## 10. Political, civilian and sanctuary systems

| ID | Name | Description | Source | Rationale | Status | Deps | State variables | Actions | Automatic effects | Cx | Data | Ext |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| POL-01 | Guard Abuse | Event effect. Guard in a space with a Harm marker: Legitimacy -1, remove 1 Guard | 07 s4.7 | Q-193 (Low) | Recommended | PCS-03, MKR-01 | markers | Event | as listed | M | P | Y |
| POL-02 | Posture effects table | Per step: Rally, March, income, Cross-Border | 07 s5.1 | DD-09 | Approved | TRK-04 | posture | Rally, March, Cross-Border | gates | M | Y | N |
| POL-03 | Leadership and Capture | Abroad at Syria Hostile. Capture only if Abroad. PKK income -1 after | 07 s5.2 | DD-09.6 | Tune | MKR-08 | leadership | Event | income term | M | P | Y |
| POL-04 | Legal Politics procedure | Lines 1 to 6 in order each phase from C3 | 07 s6.4 | DD-10, DD-19.1 | Approved | TRK-07, MKR-06, MKR-07 | many | closure filing | full procedure | H | P | Y |
| POL-05 | Office placement order | Fixed space order and eligibility test | 07 s6.4 line 4 | DD-10.5 | Approved | POL-04 | markers | none | placement | M | Y | N |
| POL-06 | Ceasefire restrictions | Per step lists of forbidden actions. Breach costs | 07 s7.2 | DD-11, DD-19.3 | Approved | TRK-05 | ceasefire | all Ops | breach detection | H | P | Y |
| POL-07 | Ceasefire step | Accept, Talks vote, Negotiated Outcome check, leave | 07 s7.3 | DD-11 | Tune | TRK-05 | ceasefire | votes | step change | M | P | Y |
| POL-08 | Negotiated Outcome | Talks through a full Campaign, Legal Space not Banned, both accept concessions | 07 s7.4; 09 s5 | DD-11.3 | Tune | POL-07 | many | accept or refuse | game end | M | P | Y |
| POL-09 | Emergency Rule moves | Card moves and Propaganda State step table | 07 s8.2 | DD-17.4 | Approved | TRK-03 | emergencyRule | step choice | Legitimacy -1 for Normalizing to OHAL | M | Y | N |
| POL-10 | Return | Remove Displacement for 3. Only C5, Normalizing or event | 07 s3.3 | E-0136 | Recommended | MKR-03 | markers | Civic Action | none | L | Y | N |
| POL-11 | Kurdish Hizbullah | Event-only procedure with priority list and ties | 07 s10.1 | F-058 | Recommended | MKR-06 | markers | Event | removal, Disputed | M | P | Y |
| POL-12 | Covert reveal events | Reveal up to 2 Covert markers at random | 07 s10.2 | E-0015 | Recommended | MKR-05 | hidden markers, rng | Event | reveal | M | P | N |
| POL-13 | Iran box | Events only. Low evidence: no hard effect | 03 s3; DD-15.4 | F-025 (Low) | Approved | MAP-03 | box pieces | Event | none | L | Y | N |

## 11. Event deck and victory

| ID | Name | Description | Source | Rationale | Status | Deps | State variables | Actions | Automatic effects | Cx | Data | Ext |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRD-01 | Event pool | 100 rows. 91 pool cards (90 deck-eligible), 4 Pivotal, 5 Propaganda | DK-001 to DK-100 | per card | Recommended | SOP-01 | deck | Event | per card | H | P | Y |
| CRD-02 | Effect primitives | About 24 effect types. Track adjust is most common (129 of 191 sides) | DK CSV; 08 | none | Recommended | CRD-01 | many | Event | per primitive | H | P | N |
| CRD-03 | Cards needing modules | About 35 cards need a rule hook (Pivotals, structural, capabilities, momentum, procedures) | DK CSV | none | Recommended | CRD-01 | many | Event | per card | H | N | Y |
| CRD-04 | Structural cards | 7 cards with Always lines (DK-003, 005, 019, 020, 037, 040, 093) | 08 s2.2; 10 s6.1 | DD-17.1 | Approved | SOP-01 | flags | none | on reveal | M | P | Y |
| CRD-05 | Chain pairs | 11 order rules | 08 s8 | none | Approved | SOP-01 | deck | none | ordering | M | Y | N |
| CRD-06 | Sensitivity tiers | T0 to T3. T2 harmer side is block-only | 08 s7 | DD-13.6 | Approved | CRD-01 | none | Event | none | L | Y | N |
| CRD-07 | Contested attribution | Disputed Harm marker. Neutral title | 05 s5.8 | DD-15.4 | Approved | MKR-01 | markers | Event | none | L | Y | N |
| VIC-01 | Scores | State: Total Support + Legitimacy. PKK: Total Opposition + domestic Bases | 09 s1 | DD-14.2, DD-14.3 | Approved | TRK-09 | derived | none | recompute | L | Y | N |
| VIC-02 | Thresholds | Easy-ceiling method. Values per scenario | 09 s2 | DD-18.1 | Tune | VIC-01 | scenario | none | none | L | Y | N |
| VIC-03 | Victory check | Each Propaganda round except first. Covert counted as revealed | 09 s3 | DD-19.2 | Approved | VIC-01, VIC-04 | derived | none | game end | M | Y | N |
| VIC-04 | Harm gate | Limit 6. PKK count includes Coercion | 09 s3.1 | DD-17.5 | Tune | MKR-01, MKR-02 | derived | none | blocks win | L | Y | N |
| VIC-05 | Final scoring | Reveal Covert. Margin minus 2 per Harm over limit. Ties: lower Harm, then PKK | 09 s4 | CT 7.1, 7.3 | Tune | VIC-01 | derived | none | game end | M | Y | N |
| VIC-06 | Outcome record sheet | Record only. Four board dimensions and a list of items | 09 s6 | DD-14.5 | Approved | many | derived | none | report | M | Y | N |

## 12. Scenarios

| ID | Name | Campaigns | Setup completeness | Source | Status |
|---|---|---|---|---|---|
| SCN-00 | Full campaign | C1 to C5 | Complete pieces and tracks. Thresholds 49 and 30 | 10 s2 | Recommended |
| SCN-A | Scenario A 1984-1989 | C1, C2 | Uses SCN-00 setup. Pivotal list conflicts (GAP-I05) | 10 s3 | Competing |
| SCN-B | Scenario B 1990-1995 | C3, C4 | Complete. Thresholds 48 and 41. State threshold deferred (DD-19.7) | 10 s4 | Unresolved |
| SCN-C | Scenario C 1993-1999 | C4, C5 | Complete with markers and Offices | 10 s5 | Recommended |

All scenarios reconcile piece totals (extraction check, medium confidence).

## 13. Optional modules (not in the core build)

| ID | Name | What changes | Source | Status |
|---|---|---|---|---|
| OPT-01 | MOD-3B Legal Movement player | Third faction from C3. New pieces, 5 Ops, 2 SAs, Rights track, PP 2.3 eligibility, own victory | 13 Part A | Unresolved (promotion tests in 12 s8) |
| OPT-02 | MOD-4A split State | Ankara and Security factions, Cohesion track, shared gate | 13 Part B | Unresolved (needs OPT-01 first) |
| OPT-03 | Concept B map | 17 domestic spaces, 2 corridor markers | 13 Part C | Unresolved |
| OPT-04 | Ranked initiative (Sol arm B) | Replaces the CT track for a comparison test | 12 s6 | Competing |

Engine impact: OPT-01 and OPT-02 need a sequence-of-play variant for three or four factions. 03-architecture.md, section 6, defines that extension point.

## 14. Competing alternatives

The simulator must expose these as package options. It must not choose one silently.

| ID | Topic | Alternative A | Alternative B | Source |
|---|---|---|---|---|
| ALT-01 | Initiative | CT track | Ranked choice | 12 s6 |
| ALT-02 | Players | Two (core) | Three (MOD-3B) | DD-02; 02 |
| ALT-03 | State | One faction | Split (MOD-4A) | DD-03; 13 |
| ALT-04 | Map | DD-05 map | Concept B | 13 |
| ALT-05 | Syria March at Restricted | Not allowed (03 s3) | Allowed with +1 and Activate (06 s4.2) | 03; 06 |
| ALT-06 | Scenario A Pivotals | State none, PKK ARGK Formed (10 s3) | All four (10 s2.3) | 10 |

## 15. Summary counts

| Group | Rows | Need a rule module |
|---|---:|---:|
| Map | 9 | 0 |
| Pieces, tracks, markers | 27 | 4 |
| Sequence of play | 17 | 6 |
| Operations | 21 | 3 |
| Political systems | 13 | 7 |
| Deck and victory | 13 | 3 |
| Total | 100 | 23 |

Next step: read 02-rules-gap-analysis.md for missing definitions.
