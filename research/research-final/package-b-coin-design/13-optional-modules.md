# Optional Modules

Status: three optional modules on the two-player core (DD-02). Terms follow [design-decisions.md](../project-management/design-decisions.md). Numbers are hypotheses marked [tune]. No module was played. See [02-faction-architecture-decision.md](02-faction-architecture-decision.md) for the reasons.

| Part | Module | Scope | Build step (02, section 6) |
|---|---|---|---|
| A | MOD-3B Legal Movement player | C3 to C5 | Step 5 |
| B | MOD-4A split state with Cohesion track | C3 to C5, needs Part A | Step 6 |
| C | Concept B hybrid map | Any Campaign | Step 7 |

Rule for all parts: change one thing per test (Sol `14-architecture-comparison.md`, "Architecture A").

## Part A. MOD-3B Legal Movement player module

### A.1 Purpose and scope

The module gives legal Kurdish politics a human player in C3 to C5. It replaces lines 2 to 5 of the non-player Legal Politics procedure table (07, section 6.4). The closure filing (07, section 6.3), line 1 (the ban) and the ceasefire step (07, section 7.3) stay. Section A.8 lists each change. It never applies in C1 or C2, because no legal pro-Kurdish party existed before HEP [E-0007; O-030; F-015].

It represents organizational continuity through closures. It does not stand for all Kurdish civilians (Sol `14`, "Architecture B"). It cannot command guerrillas, Guards or hosts. Its link to the PKK stays open [F-018; C-025]. No rule gives either armed player a gain from Legal Movement pieces (R5 D9).

Precedent: People Power has a government, one armed insurgent and one nonviolent faction (PP 1.4). Gandhi gives the Jail box and the space cap (GAN 1.3.9, 3.3).

### A.2 Pieces and markers

| Item | Count [tune] | Rule |
|---|---:|---|
| Offices | 8 | The DD-10 Office markers become Legal Movement pieces. Max one per space. Never count for Control (DD-10.2) |
| Activists | 15 | Cylinders. Inactive unless a Protest marker is in the space (PP 1.5.3 pattern). Never count for Control |
| Protest markers | 4 | No rival faction uses them. Scarcity is a design choice, not a precedent (PP 1.8.2 pool is shared; R5 D6) |
| Successor Ready marker | 1 | Shows a successor party is ready before a ban (see Refound). Not the core Successor marker |
| Appeal markers | 2 | Sit on the Europe track until the next Propaganda round |
| Detained box | | Holds arrested Activists (GAN 1.3.9 pattern) |
| Rights track | 0 to 6 | Records legal and rights gains. Moves only up by Appeal and Document and by events. Events may move it down |

Control stays as in DD-06.1. Only State and PKK pieces count. Legal Movement pieces neither give nor deny Control. This differs from PP 1.7 and GAN 1.7.1, where nonviolent pieces can deny Control. Judgment (Moderate): denial would let the Legal Movement swing State and PKK Control and make it a kingmaker.

The module adds no opinion marker. The Legal Movement does not score Support or Opposition. This fixes the shared-axis defect of the Claude draft (R5 D4).

### A.3 Operations

The Legal Movement pays 1 Resource per selected space unless stated (PP 3.3 pattern). The **Legal Space** track (DD-10.1) caps the number of spaces (GAN 3.3 Restraint pattern):

| Legal Space | Space cap per Operation |
|---|---|
| Open | 3 |
| Prosecuted | 2 |
| Banned | Refound only |

A Limited Operation uses one space, as for all factions.

| Operation | Effect | Basis |
|---|---|---|
| Campaign | In each selected space that is not at Active Support, place one Activist. If the space has an Office, place Activists up to its Pop | PP 3.3.1 Recruit; M-019 |
| Municipal Work | Cost 2 per space. In a space with two Activists, no Office and no PKK Control, replace two Activists with an Office | PP 3.3.1 Base pattern; F-016; Q-200 |
| Protest | In a space with Activists, place a Protest marker. Activists there flip Active | PP 3.3.4. No opinion shift |
| Appeal | Cost 2. Select the Europe track as one location. Place one Appeal marker | CT 3.3.1 track-as-location pattern; F-043 |
| Refound | Cost 3. See below | M-007; F-052 |

**Refound.** It works in two ways.

1. While Legal Space is Prosecuted: place the Successor Ready marker. If a ban comes while it is in place, remove only half the Offices (round down). This models HADEP, founded before the DEP ban [E-0013; E-0014].
2. While Legal Space is Banned: set Legal Space to Prosecuted. Place Offices equal to half (round down) of the core Successor count, in spaces with Activists.

Refound competes with ordinary work for the same action (Sol `03-faction-configurations.md`, "Three factions"). It replaces the automatic successor of DD-10.3. The core Successor marker still records the Office count before the ban. Confidence (space cap and Refound): Moderate.

### A.4 Special activities

The Legal Movement has two special activities, so its "Op + Special Activity" option is not empty (R5 D5).

| Special activity | With | Effect | Cost |
|---|---|---|---|
| Document | Campaign or Protest | In one space with an Activist and a Harm marker (DD-07.1), mark the Harm as Documented. Rights +1, max once per Propaganda round. At the next Propaganda round a Documented State Harm costs the State 1 Legitimacy. A Documented PKK Harm costs the PKK 1 Resource. A "disputed" Harm costs neither armed player | One Activist in the space flips Active and can be arrested |
| Distance | Any Operation | In up to two spaces with an Office, place a Distance marker until the next Reset. The PKK may not Rally or Agitate there | Remove one Activist from the map to Available |

Document follows DD-15.3: both armed sides carry harm costs, and equal costs do not claim equal acts. Distance replaces the Claude Proximity track (M-020). R5 D11 asked to cut Proximity for the first test. Distance never changes the cost of a ban, so C-025 stays open (Claude `scenarios-and-victory/03-scenarios.md`, section 3.4). Confidence: Low.

### A.5 State and PKK actions against the Legal Movement

1. **Closure case** (DD-10.4; 07, sections 6.3 and 6.4). Filing is unchanged: in the Legal Politics phase the State may file if Legal Space is Open or Prosecuted, at least one Office is on the map and no Closure Case marker is on the track. Place the Closure Case marker and set Legal Space to Prosecuted. At the next Legal Politics phase, line 1 resolves the ban: Legal Space to Banned, place the Successor marker at the number of Offices on the map, remove all Offices (only half, round down, if a Successor Ready marker is in place) and all Protest markers, Legitimacy -2, Europe +1. Then remove the Closure Case and Successor Ready markers. The ban costs the State Legitimacy at every board state [F-052; E-0009; E-0014].
2. **Arrest.** State Assault (CT 3.2.4 pattern) may remove Active Activists to the Detained box. It may not remove Inactive Activists. At each Propaganda round the State pays 1 Resource per Detained Activist (GAN 6.2.2 pattern, 2 in GAN) [tune]. At each Reset, half the Detained Activists (round up) return to Available.
3. **Events.** Killings of legal-party figures enter as events with a "disputed" Harm marker [F-019; E-0177; E-0098]. No State or PKK operation targets Offices directly.
4. **Coerce.** PKK Coerce in a space removes any Protest marker there (PP 1.8.2 pattern). It does not remove Offices.
5. **Offices cap their space at Passive Support and Passive Opposition** (DD-18.4, unchanged in this module).

### A.6 Three-faction eligibility (People Power pattern)

From C3 the module replaces the CT Initiative track (DD-04) with the PP sequence of play (PP 2.3.1 to 2.3.6). This overrides DD-04.6 for C3 to C5 only.

1. **Card order.** Each C3 to C5 card prints a three-symbol faction order. The core game ignores it. Print it now, so one deck serves both modes (R5 D13).
2. **Transition.** At the Reset that ends C2, remove the Initiative track. Place all three cylinders in the Eligible box.
3. **1st Eligible** may take Op + Special Activity, Op Only, Limited Op, Event or Pass (PP 2.3.3).
4. **2nd Eligible.** After Op + SA: Op Only or the Event. After Op Only or the Event: Op with or without SA. A Limited Op or Pass is always allowed (PP 2.3.3).
5. **3rd Eligible:** Limited Op or Pass only (PP 2.3.3).
6. **Pass and Limited Op** keep the faction Eligible. The next Eligible faction moves up (PP 2.3.4, 2.3.5).
7. **Adjust Eligibility.** A faction that took an Op (not Limited) or the Event is Ineligible on the next card. All others are Eligible (PP 2.3.6).
8. **Pass reward.** State +2, PKK +1, Legal Movement +1. Design choice: this keeps DD-04.4 values. PP gives the Government +3 (PP 2.3.4). Confidence: Moderate.
9. **Pivotal Events.** A faction may play its Pivotal Event before the 1st Eligible faction acts (CT 2.3.7, FITL 2.3.8 pattern). It counts as that faction taking the Event. Design choice. Confidence: Low.

### A.7 Income and victory

**Income** at each Propaganda round: Legal Movement Resources plus the number of Offices plus 2 [tune]. Then each Appeal marker becomes Rights +1 and returns to the pool. The one-round delay models slow court and EU effects [F-042; F-043].

**Victory** (CT 7.2 and 7.3 pattern, DD-14):

| Faction | Score | Note |
|---|---|---|
| State | Total Support plus Legitimacy, with Harm gate | DD-14.2, unchanged |
| PKK | Total Opposition plus PKK Bases in domestic spaces, with Harm gate | DD-14.3, unchanged |
| Legal Movement | Represented Pop (Pop of spaces with an Office or a Protest marker) plus Rights | New. Threshold from C3 setup [tune]. Confidence: Low |

Check thresholds at each Propaganda round from C3. Margins decide after the final round. Ties go to the Legal Movement, then the PKK, then the State (PP 7.3 order). Displaced spaces keep their Pop (DD-07.3). No score counts removed pieces or harm (DD-07.4).

Design checks (Claude `faction-architectures/04-mod-3b-three-paths.md`, section 5):

1. The Legal Movement can win without a PKK defeat.
2. It can lose through State action (bans, arrests) or PKK action (Coerce against Protest).
3. The PKK gains nothing from Legal Movement survival.

**Start pieces** [tune]: One Office in Diyarbakır City. Activists: 2 in Diyarbakır City, 1 in Western Cities, 1 in Mardin-Batman. Resources 3. Rights 0.

**When the start pieces enter.** In the campaign, HEP Founded is a mandatory C3 card in the top 8 of the pile (05, section 1.1; 10, section 6.1). Under this module its Always line sets Legal Space to Open and places the start pieces. It does not run line 4 twice. Until that card is revealed, Legal Space is Absent and the Legal Movement may only Pass (design choice). Scenario B starts with Legal Space Absent (10, section 4.1), so the same card rule applies. Scenario C starts in C4 with no HEP card: use its Legal Space, Closure Case marker and 3 Offices (10, section 5.1). Activist, Resources and Rights start values for Scenario C are not yet set (open gap).

### A.8 How it replaces the non-player procedure

The table maps each part of the core procedure in 07, section 6 and 05, section 6.5 to its module treatment. DD-16.2 permits the overrides marked "Replaced". All other parts stay unchanged.

| Core rule (07 or 05) | Module treatment |
|---|---|
| Closure filing (07, section 6.3) | Unchanged |
| Line 1: ban (Banned, Successor marker, remove all Offices, Legitimacy -2, Europe +1) | Unchanged, with two additions: a Successor Ready marker limits the removal to half the Offices (round down), and the ban also removes all Protest markers (A.5) |
| Line 2: automatic successor at the next round (Prosecuted, Successor number minus 1 Offices, minimum 1) | Replaced (DD-10.3 override) by Refound, by player choice and cost: half the Successor number, round down, in spaces with Activists (A.3). Legal Space stays Banned until the player Refounds |
| Line 3: Office limit (Open 4, Prosecuted 3) | Replaced. No automatic Office limit. The 8 Office pieces and the space cap per Operation (A.3) limit growth |
| Lines 4 and 5: automatic Office placement by priority and removal above the limit | Replaced by Municipal Work. The player chooses the spaces |
| HEP Founded Always line: Legal Space Open, run line 4 twice (10, section 6.1) | Replaced: Legal Space Open and the A.7 start pieces |
| Ceasefire step (07, section 7.3) | Unchanged. It still runs in the Legal Politics phase |
| Offices: no Control, cap the space at Passive Support and Passive Opposition, add to neither armed score (07, section 6.2) | Unchanged |
| Legitimacy: +1 if Open with 2 or more Offices; -1 more for Village Clearance in an Office space (07, section 2) | Unchanged |
| Events move Legal Space and Offices (07, section 6.4 note 3) | Unchanged. Events that place Offices give a free Municipal Work instead |
| PKK cannot move Legal Space or Offices (DD-10.5) | Unchanged. The PKK can remove Protest markers only |

### A.9 Test criteria for promotion

Promotion means the module becomes the default for C3 to C5 (DD-02 flip trigger). All counts come from recorded sessions. They are pass or fail screens, not statistics. Ten games cannot separate small differences (R5 D10).

| # | Test | Pass |
|---|---|---|
| 1 | Distinct legal options per turn | Mean of 4 or more (Claude spec 5.3 threshold) |
| 2 | Special activity use | Op + SA in at least one third of Legal Movement 1st or 2nd Eligible actions |
| 3 | Own win path | Legal Movement has the top margin in at least 2 of 10 games, with a positive PKK margin in at least one |
| 4 | Kingmaker | Fewer than 1 in 4 games where the Legal Movement has no path to win (margin below -5 [tune] before C5) and its later actions change the State and PKK order |
| 5 | Neutrality on C-025 | No recorded PKK or State strategy depends on Legal Movement pieces as its own asset |
| 6 | Load | C3 to C5 play time rises by no more than 25 percent [tune] over the core |
| 7 | Core comparison | The same C3 to C5 card sequence in core mode fails the DD-02 passivity test (02, section 5.1) |

Fail on tests 1, 3 or 5: keep the non-player system and report the limit (Sol `14`, "Architecture B").

## Part B. MOD-4A split-state experiment with Cohesion track

### B.1 Status and scope

MOD-4A is a documented experiment, not a fallback (DD-02.3; Sol `03`, "Four factions"). Seats: Ankara, Security, PKK and Legal Movement. It runs in C3 to C5 only and needs Part A. In C1 and C2 it would play as MOD-3A, which both inputs rate low for those years (Ankara has little to do in 1984-1987, Claude CSV note).

The Cohesion track (M-023) leaves the core (DD-03.2) and becomes part of this experiment. Claude's own MOD-4A draft did not use Cohesion (Claude `06-mod-4a.md`, section 8). The combination here is new. Cohesion serves as the shared state gate and minimum-obligation rule that Sol required for any split (Sol `14`, "Architecture C").

### B.2 Factions

| Faction | Pieces and tools | Basis |
|---|---|---|
| Ankara | Police. Civic Action. Diplomacy (DD-09.4). Closure case (DD-10.4). Steps Emergency Rule down (DD-12.4). Holds State Resources | Design choice. No source assigns closure power to one center (Claude `06`, section 4) |
| Security | Troops and Village Guards (DD-08). Cross-Border and Village Clearance (DD-07.2) | F-027; F-059 |

Both share State Control: their pieces together must exceed PKK pieces (FITL 1.7 shared COIN Control pattern). Police include the Gendarmerie, a military force. Police are not a "reform" piece. The assignment is an abstraction (Sol `03`).

### B.3 Cohesion track

Cohesion runs 0 to 6. Start 4 [tune]. Confidence in these rules: Low.

1. **Budget obligation.** At each Propaganda round Ankara transfers Resources to Security. If the transfer is below a minimum [tune], Cohesion -1.
2. **Joint action.** If both State factions act against the PKK in the same space on one card, Cohesion +1, max once per Campaign.
3. **Scandal.** Exposure events lower Cohesion [E-0015; E-0016].
4. **Cost shift.** If one State faction's action costs Legitimacy, Cohesion -1 unless the other State faction agreed before the action.
5. **Gates.** At Cohesion 4 or more, Diplomacy may move a host posture two steps [M-011; E-0018]. At 2 or less, Ankara cannot step Emergency Rule down and the State cannot accept Talks (DD-11).

Cohesion never decides whether the army or the cabinet "won" (Claude `political-and-military-systems/01-political-systems.md`, section 7).

### B.4 Victory

1. **Shared gate.** No State faction can win unless the DD-14 State score is at or above a gate [tune] and Cohesion is 2 or more. Both can lose if their rivalry undermines the state outcome (Sol `14`).
2. **Ankara:** Total Support plus Legitimacy (DD-14.2 formula).
3. **Security:** State-Controlled domestic Pop plus the number of host postures at Restricted, Hostile or Aligned with Turkey.
4. **PKK** and **Legal Movement:** as in Part A.

The Claude draft scored Security on PKK pieces removed (Claude `06`, section 5). That breaks DD-07.4 and is removed. Security scores containment, not kills. No faction scores for war continuing (Sol `02-priority-design-questions.md`). Confidence in these formulas: Low.

### B.5 Test criteria

| # | Test | Reject if |
|---|---|---|
| 1 | Scores diverge | The two State factions finish adjacent in rank in more than 7 of 10 games |
| 2 | Budget denial | Routine best play cuts the budget below the minimum (Sol `14`, "weakest version") |
| 3 | Cohesion choices | Players never trade a gain for Cohesion |
| 4 | Agreement | The two State factions never prefer the same action. A split that forces constant conflict is manufactured (Sol `02`) |
| 5 | Evidence | No source set shows durable, separate aims on the Kurdish question [F-026; F-060] |

Confidence that MOD-4A improves on the core: Low.

## Part C. Concept B hybrid map experiment

### C.1 Purpose

DD-05 fixes thirteen domestic spaces grouped from provinces. Concept B tests whether finer spaces and corridors add decisions. It merges the Claude hybrid regions map (Claude `map-and-components/02-map-concept-b-hybrid-regions.md`) with the Sol province and corridor map (Sol `04-map-architecture.md`, "Concept B").

### C.2 Splits

Split only DD-05 spaces where an input names distinct local conditions. Pop values are design allocations of the DD-05 values, labeled [design]. No district census exists in this research.

| DD-05 space (Pop) | Concept B spaces (Pop) | Reason |
|---|---|---|
| Botan (2) | Şırnak (1); Siirt-Eruh (1) | Border plain against mountain district (Claude map B) |
| Mardin-Batman (4) | Mardin (2); Batman (2) [design split of 4; 1990 shares 2.2 and 1.4] | Syrian border against oil town |
| Şanlıurfa (4) | Urfa (3); Siverek (1) | Siverek tribal base [L-013; O-061] |
| Bingöl-Muş (3) | Bingöl (1); Muş-Varto (2) | Different security administration (Sol map B) |

Result: seventeen domestic spaces. The Pop total stays 32, with Western Cities at 3 (DD-05).

### C.3 Corridors

Add two corridor markers: Bingöl-Elazığ road [L-034] and Habur-Silopi road [L-060]. A corridor has no Pop. It affects State Redeploy routes only. It is not a generic sabotage economy (Sol `04`, "Concept B").

### C.4 Kept from DD-05 and DD-07

1. Syria-Bekaa stays an off-map box. The Claude map B drew Syria as a sanctuary space. That breaks DD-05.1.
2. Western Cities keep Pop 3. The Claude map B started them at 0 and filled them by Displacement. That breaks DD-05 and DD-07.3. Displacement places Reception markers only (DD-07.2).
3. KDP and PUK Zones stay restricted, with Pop 0.
4. Batman and Şırnak became provinces in 1990. In C1 and C2 the scenario notes must say the split spaces are not administrative units.

### C.5 Test

Play the same eight-card sequence on both maps (Sol `04`). Record:

1. New dilemmas that the DD-05 map could not show.
2. Set-up and turn time.
3. Card text that needs a sub-space exception.
4. Whether a Pop 1 space is too cheap to Control. Test a rule that it needs two pieces (Claude map B, section 5).

Promote Concept B if the DD-05 map merges incompatible local conditions or adjacency allows unrealistic border bypass. Keep DD-05 if the larger map adds only bookkeeping (Sol `04`, "What would change the recommendation"). Confidence that Concept B improves play: Low.
