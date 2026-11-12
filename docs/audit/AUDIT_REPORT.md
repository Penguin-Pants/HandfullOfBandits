# Rules audit: A Handful of Bandits (R4, full game)

Date: 2026-11-12. Audited commit: `7d05919`. Audit target: `docs/rules/prototype-rules.md` (R4, dated 8 November 2026) with Appendix A and Appendix B, the card package and the engine.

This report lists problems only. It changes no rule and no code.

## 1. Summary

**Counts by severity**

| Severity | Count |
|:--|--:|
| Blocker | 1 |
| Major | 12 |
| Minor | 27 |
| Total | 40 |

Balance notes (4, not counted) are in section 6.

**Fix these five first**

1. **B-01**: a Negotiated Outcome cannot happen before the final round in any scenario. It can never happen in Scenarios A, B and C. The Covert waiver can never apply.
2. **M-01**: 8.6 says a State breach during Declared stops the State from accepting "that ceasefire". Reset removes the marker, and then the State can accept.
3. **M-03**: March activation depends on "group size". The rules do not define a group. The engine lets the PKK split a move into groups of one.
4. **M-07**: the First Eligible faction chooses its box. A one-location Operation can be an Op Only (initiative passes) or a Limited Op (initiative stays). The rules give no test.
5. **M-02**: the Ban marker caps Europe, but no rule says what places it. 8.4 files it under Legal Politics, where a different "Ban" exists.

**Method limits**

- Rules vs prototype findings come from reading the engine source. The test suite and the simulator were not run. Confidence is stated per finding.
- History checks: 3 web searches and the project's own research audit files. Most card dates were not checked again. Section 5 says which.
- The printed PDF and the two HTML handouts were not audited. `docs/rules/review.md:65` says the PDF is stale.

**Severity rule used**

- **Blocker**: an end condition or a victory condition cannot work as written.
- **Major**: two careful readers can reach different game states, or the rules and the engine give different results.
- **Minor**: wording, dead text or a difference with no effect on the result in most games.

**Finding types**: Contradiction, Gap, Ambiguity, Rules vs prototype, Structure, History.

**Citation format**: `R` = `docs/rules/prototype-rules.md`. `R:746` is line 746 of that file. Engine paths are relative to `sim/src/engine/`. Package paths are relative to `game-packages/kurdish-coin/0.1.0/`.

## 2. Blocker

### B-01 Negotiated Outcome cannot happen before the final round

- **Type**: Gap (end condition that cannot trigger). Also Contradiction and Rules vs prototype.
- **Locations**: R 6.0 (R:527), R 6.5 (R:566), R 7.5 (R:647), R 8.6 (R:737, R:750 to R:757), R 10.8 (R:973). Engine: `coin/propaganda/ceasefire-step.ts:32-38, 81`, `coin/propaganda/pipeline.ts:89-93`.
- **Evidence**
  1. Declaration is legal only from C3: "From C3, the PKK may Declare Ceasefire" (R:737). The C3 switch is set at the Reset of the C2 round (R:973).
  2. Each ceasefire step needs one more Propaganda round. Step 2: "Reciprocal Restraint that was already in force at the previous Propaganda round" (R:751). Step 3: "Talks that were already in force at the previous Propaganda round" (R:752).
  3. Full campaign: Declared in C3, Reciprocal Restraint at round 3, Talks at round 4, Negotiated Outcome at round 5. Round 5 is the final round (R:813).
  4. R 6.0 says: "A Negotiated Outcome (8.6) can end the game in any round before the final one." (R:527). No such round exists.
  5. Scenarios B and C have two rounds. The best case is Reciprocal Restraint at round 1 and Talks at round 2. No Outcome step is left.
  6. Scenario A has no Declare Ceasefire (C1 and C2 only).
  7. No card sets Talks. `grep -i talks cards/*.yaml` finds only a note on DK-058. DK-057 sets Reciprocal Restraint during C4 (procedure `ceasefire.accept`, `coin/procedures.ts:40-47`), which does not shorten the full-campaign path.
  8. R 7.5 waives the Covert penalty "when Talks have held through two full Campaigns" (R:647). That needs an Outcome at round 6 or later. The engine reads `negotiated.waiveCovertRounds = 2` (`ceasefire-step.ts:81`). It can never be true.
  9. The engine does allow the Outcome in the final round. The Legal Politics phase runs in the final round and `ceasefireStep` has no final-round test. This differs from R:527.
- **Impact**: the Talks track, the Negotiated Outcome, 7.5 and the Covert waiver are unreachable (three scenarios) or reachable only in the last round (full campaign). In the last round the Outcome only replaces final scoring with the same margins, a label and a possible "no winner". Confidence: high (rules text and code agree on the timing).
- **Related open item**: `docs/rules/review.md:56` already records that no source says who chooses which Guerrillas the PKK removes. The engine accepts any split (`ceasefire-step.ts:47-52`).
- **Fix options** (not chosen)
  1. Shorten the path: let acceptance, the Talks vote or both happen during card play, or drop the "already in force at the previous round" test for one step. Trade-off: faster peace track, less time for breaches to matter.
  2. Open Declare Ceasefire earlier, or start Scenarios B and C with a ceasefire step already reached. Trade-off: touches the historical framing of C1 and C2 and the setups.
  3. Keep the timing and say in the rules that the Outcome is a final-round result only. Then remove or change the Covert waiver and the sentence at R:527. Trade-off: least work, but the system has almost no effect on play.

## 3. Major findings

### M-01 Ceasefire acceptance after a State Restraint Broken marker

- **Type**: Contradiction.
- **Locations**: R 8.6 (R:746, R:750), R 6.9 step 4 (R:593), R 8.4 (R:712). Engine: `coin/propaganda/ceasefire-step.ts:33-35`, `coin/propaganda/reset.ts:21`.
- **Evidence**
  - R:746: "A State action during Declared only places the marker; the State can then no longer accept that ceasefire."
  - R:593: "Remove Restraint Broken markers, if present." R:712: "Reset removes both."
  - R:750 lets the State accept when Declared has "no State Restraint Broken marker". The PKK may keep Declared through the round.
  - The engine tests only for the marker on the map. After Reset the State can accept the same ceasefire.
- **Impact**: after one Reset the two rules disagree on whether the State may accept. The engine follows 6.9. Confidence: high.
- **Fix options**
  1. Make 8.6 say the block lasts until the next Reset. Trade-off: matches the engine, weakens the cost of a State action during Declared.
  2. Keep the marker (or a flag) until the ceasefire ends. Trade-off: needs an engine change and a new exception in 6.9.
  3. End a Declared ceasefire at the ceasefire step when the State marker is present. Trade-off: simple, but removes the PKK choice to keep Declared.

### M-02 Ban marker: no placement rule, and two different bans

- **Type**: Gap and Contradiction.
- **Locations**: R 1.7 (R:122), R 3.3.1 (R:256), R 8.4 (R:710), R 8.5 line 1 (R:724). Card: `cards/c4.yaml:223` (DK-064). Engine: `coin/ops/common.ts:68-70`, `coin/propaganda/legal-politics.ts:111-120`.
- **Evidence**
  - R:122: "While the Ban marker is on the map, Europe cannot exceed 3."
  - R:710 puts it under "Closure Case, Successor and Ban: Legal Politics markers (8.5)".
  - 8.5 never places a Ban marker. Line 1 is named "Ban" and gives "Europe +1" (R:724).
  - Only DK-064 unshaded places it: "Place the Ban marker on the Europe track". It is the German ban of the PKK. The engine `ban()` procedure places no marker.
  - No rule or card removes the marker.
- **Impact**: a reader of the rules can place the Europe cap marker when the legal party is banned. That gives Europe +1 and a cap of 3 at the same moment. The correct trigger exists only in C4 card text, which Appendix A does not print. Confidence: high.
- **Fix options**
  1. Rename one of the two (for example "Europe Ban marker" and "party ban") and state in 1.7 that only the named card places it. Trade-off: text only.
  2. Move the marker out of the Legal Politics list in 8.4 into a Europe paragraph, and state that it is permanent. Trade-off: text only, makes permanence a rule.
  3. Add a removal condition. Trade-off: new rule, needs a design reason.

### M-03 March "group" is not defined

- **Type**: Gap. Also Rules vs prototype.
- **Locations**: R 3.3.2 (R:266 to R:271), R 9.0 (no entry). Engine: `coin/ops/pkk/march.ts:27-48, 89-94`, `coin/ops/plan.ts:31-44`.
- **Evidence**
  - R:266 to R:269: a "moving group becomes Active" when the destination is at Support or the move crosses a border, and "Its group size plus State pieces in the destination is **more than three**".
  - No rule says what one group is: all Guerrillas that enter one destination, all from one origin, or any set the player names.
  - In the engine each entry of the `moves` list is one group (`group: m.count`). Two entries with the same origin are two groups. The plan reader does not merge them.
- **Impact**: the PKK can move four Guerrillas from one origin as four groups of one. With two State pieces in the destination, no group reaches "more than three". As one group of four they would all Activate. Confidence: high for the code path, not run.
- **Fix options**
  1. Define a group as all Guerrillas that enter one destination in this March. Trade-off: strictest, differs from the reference series (group per origin).
  2. Define a group as all Guerrillas that move from one origin to one destination. Trade-off: matches the reference series, still lets several origins feed one destination.
  3. Keep free grouping and say so. Trade-off: the activation test then seldom applies.

### M-04 Strike Collaborators timing

- **Type**: Rules vs prototype.
- **Locations**: R 2.7 (R:189), R 4.3.3 (R:423). Engine: `coin/ops/sa/strike-collaborators.ts:18-23`, `coin/ops/choose-operation.ts:104`.
- **Evidence**
  - R:189: "Cross-Border, Ambush and Strike Collaborators use before timing."
  - The engine enforces timing only when a handler has a `timing` field. Only `cross-border.ts:21` has one. Strike Collaborators and Ambush have none.
- **Impact**: the engine accepts Strike Collaborators after the Operation. Example: Rally places an Underground Guerrilla in a Guard space, then the Strike uses it. The rules forbid this. For Ambush the missing field has no effect, because the Attack resolves the Ambush spaces itself. The engine looks wrong, because the rule is explicit in two places. Confidence: high for the code path, not run.
- **Fix options**
  1. Add the timing to the engine handler. Trade-off: none for the rules.
  2. Change the rule to "before or after". Trade-off: makes Rally or March plus Strike a one-card combination.

### M-05 Reception does not block Event shifts in the engine

- **Type**: Rules vs prototype.
- **Locations**: R 1.6 (R:114), R 8.4 (R:702). Package: `markers.yaml` (reception has no `blocks`). Engine: `core/effects/shift-level.ts:14-23`, `coin/ops/state/civic-action.ts:60`.
- **Evidence**
  - R:114: "Reception also blocks Support shifts until relieved."
  - The generic shift effect blocks on a marker's `blocks` list. State Harm, PKK Harm and Coercion have one. Reception does not.
  - Only the Civic Action check tests Reception.
- **Impact**: an Event that shifts Diyarbakır City or Western Cities toward Support (for example DK-039 unshaded) works in the engine with a Reception marker there. By R:114 it is blocked. The rules sentence at R:702 ("before shifting that space toward Support") can also be read as Civic Action only. Confidence: high.
- **Fix options**
  1. Add `blocks: [support]` to the Reception marker. Trade-off: Reception gets stronger against State Events.
  2. Limit R:114 to Civic Action. Trade-off: text only, Reception stays weak.

### M-06 Coerce in a Support space with a PKK Harm marker

- **Type**: Ambiguity. Also Rules vs prototype.
- **Locations**: R 1.6 (R:114), R 3.3.4 (R:291 to R:293). Engine: `coin/ops/pkk/coerce.ts:39-44`, `core/effects/shift-level.ts:20-23`.
- **Evidence**
  - R:291: "a space at Support shifts one level toward Neutral, then receives one Coercion." R:293 names only an existing Coercion marker as a block.
  - R:114: "PKK Harm blocks shifts toward Opposition."
  - The engine treats Support toward Neutral as a move in the Opposition direction. A PKK Harm marker blocks it. The Coercion marker is still placed.
- **Two readings**
  1. "Toward Neutral" is not "toward Opposition". PKK Harm does not block Coerce.
  2. Any move down the scale is toward Opposition. PKK Harm blocks Coerce. (Engine.)
- **Impact**: different level and score after the same action. Village Clearance has the same structure and its rule does name the block (R:385). Coerce does not. Confidence: high.
- **Fix options**
  1. State in 3.3.4 that PKK Harm also blocks the Coerce shift. Trade-off: matches the engine and Village Clearance.
  2. Exempt "toward Neutral" shifts from Harm blocks in general. Trade-off: also changes Village Clearance (R:385).

### M-07 Op Only with one location: the box is a free choice

- **Type**: Structure. Known and unresolved (Appendix B.3).
- **Locations**: R 2.3 (R:144 to R:150), R 2.4 (R:170 to R:173), `docs/rules/prototype-notes.md:32`. Engine: `coin/ops/choose-operation.ts:85-89`, `coin/sequence/ct.ts:75-79`.
- **Evidence**
  - R:144: "First Eligible selects one box". R:148: "The simulator permits one or more locations".
  - R:172 to R:173: Op Only passes First Eligible to the other faction. Limited Op keeps it.
  - In the reference two-faction volume the cylinder goes in the box that matches what the faction did (one location with no Special Activity is always a Limited Op).
- **Impact**: the same one-location Operation has two initiative results and two response menus, by declaration. A First Eligible faction can pick "Op Only" to limit the opponent to Limited Op or Pass, or "Limited Op" to keep the initiative. The rules state no reason for this departure. Confidence: high.
- **Fix options**
  1. Box follows the action (reference pattern). Trade-off: removes a tactical choice, needs an engine change.
  2. Op Only needs two or more locations for First Eligible (research 05 wording). Trade-off: same effect as option 1 with less text.
  3. Keep the free choice and state it as a deliberate rule with its reason. Trade-off: no engine change.

### M-08 Legal Politics bans the party on a fixed timer

- **Type**: Gap (condition that always triggers). Also Ambiguity.
- **Locations**: R 5.4 (R:505), R 8.5 (R:718, R:724 to R:731), R 10.7 (R:942). Engine: `coin/propaganda/legal-politics.ts:134-160`.
- **Evidence**
  - HEP Founded places two Offices. Line 4 adds one each round. At four Offices line 6 files: "The prosecutor files: place the Closure Case marker" (R:729). Line 1 bans at the next phase.
  - Full campaign with no card effect and one eligible space in each round: 3 Offices at round 3, 4 Offices and a filing at round 4, ban at round 5 (the final round). The State loses 2 Legitimacy just before final scoring.
  - After a ban, the Successor returns at Prosecuted with the limit of 3 and the cycle starts again.
  - Scenario C starts with the Closure Case marker on the track (R:942). The ban at round 1 is certain.
  - No rule gives a faction a direct choice to stop the timer. The State can only make it faster (closure filing). The PKK cannot execute Legal Politics Events (R:448).
  - Indirect delay is possible. Line 4 places an Office only in a space with Pop 2 or more, no Office, no PKK Control and no Active level (R:727, `legal-politics.ts:28-31`). If no space in the line 4 order is eligible, no Office is placed, the limit is not reached and line 6 does not file. That needs PKK Control or an Active level in every listed space with no Office (9 of 11 spaces when 2 Offices are out). It is possible by the rules but not a practical plan.
  - Line 6 does not change Legal Space. A State filing and an Event filing both set Prosecuted (R:718). A line 6 filing leaves Open, so the Office limit stays 4 and gain 7(a) (R:557) still applies in the round before the ban.
- **Two readings of line 6**
  1. Line 6 is a filing like the others, so Legal Space goes to Prosecuted.
  2. Line 6 only places the marker. (Engine, `legal-politics.ts:160`.)
- **Impact**: a 2 Legitimacy loss on a schedule that no player controls in practice. It lands on the final round of the full campaign. Confidence: high for the sequence, by hand trace.
- **Fix options**
  1. Keep the timer and state it in 8.5 as intended, with the line 6 reading made explicit. Trade-off: text only.
  2. Give one faction a way to delay or stop the line 6 filing. Trade-off: new rule and new balance questions.
  3. Remove line 6 so only the State or an Event files. Trade-off: the State filing then needs a reason to exist (see balance note 3).

### M-09 Capture can be revealed before the Leadership can be Abroad

- **Type**: Gap (sequence). Also History.
- **Locations**: R 5.3 (R:479, R:483), R 5.4 (R:507), R 8.1.5 (R:667 to R:669), R 10.3 (R:886). Card: `cards/c5.yaml:6` (DK-093).
- **Evidence**
  - R:507: "If the Leadership is Abroad, apply Capture (8.1.5). If it is Present, nothing happens."
  - DK-093 is in the top eight C5 cards (R:497). It can be the first C5 card.
  - The Leadership goes Abroad only when Syria reaches Hostile (R:667). The State Pivotal for that is legal from C5, in a window that opens after the Always line (R:483).
  - The chain table has DK-090 before DK-092 only (R:886). Nothing puts DK-090 or the Pivotal before DK-093.
  - R:669: "Capture happens only through the C5 card DK-093".
- **Impact**: when DK-093 comes before Syria is Hostile, Capture cannot happen in that game. The Always line then does nothing. History order was: left Syria 9 October 1998, captured 15 February 1999. Confidence: high.
- **Fix options**
  1. Add a chain: DK-090 (or any Syria-to-Hostile card) before DK-093. Trade-off: DK-090 is not mandatory, so it needs the chain protection of 10.3 step 3.
  2. Let Capture apply later: when the Leadership goes Abroad after DK-093 was revealed. Trade-off: new lasting state.
  3. Keep it and say that Capture is not certain. Trade-off: text only.

### M-10 Event box with no effect

- **Type**: Ambiguity.
- **Locations**: R 2.3 (R:164), R 2.4 (R:173), R 5.1 (R:450). Engine: `coin/events.ts:222-227`, `coin/event-command.ts:26-47`.
- **Evidence**: R:164: "Pass is a distinct choice; taking the Event box and declining its text is not a substitute for Pass."
- **Two readings**
  1. A faction may not take the Event box when it will apply none of the text.
  2. A faction may take the Event box and decline everything. It gets no Pass Resources. (Engine: a free action can be answered with "skip" and "up to" counts accept zero.)
- **Impact**: Event keeps First Eligible (R:173) and limits the opponent to Op + SA or Pass. Under reading 2 a faction can do that with no board effect. Confidence: high.
- **Fix options**
  1. Require at least one applied effect to take the Event box. Trade-off: needs a test for "applied".
  2. Allow it and say so. Trade-off: text only, keeps a cheap initiative hold.

### M-11 Rally with too few Available Guerrillas

- **Type**: Rules vs prototype.
- **Locations**: R 1.4.2 (R:92), R 3.1 (R:199). Engine: `coin/ops/pkk/rally.ts:106-107`, `core/effects/place-pieces.ts:11`, `coin/ops/state/train.ts:84-87`.
- **Evidence**
  - R:92: "An ordinary Operation must meet its placement and stacking requirements. An Event does as much as possible".
  - Rally is refused only when zero Guerrillas are Available. A plan for five with two Available is legal and places two.
  - Train is strict: it is refused when the plan needs more pieces than Available.
- **Impact**: the PKK can pay for more Rally locations than it can fill. That matters for the Op Only and Limited Op boundary (M-07) and for Agitate access. The two Operations follow different supply rules. Confidence: high for the code path, not run.
- **Fix options**
  1. Make Rally strict like Train. Trade-off: engine change.
  2. Write "place as many as Available" into 3.3.1. Trade-off: R:92 then needs an exception.

### M-12 Structural card DK-005 depends on a disputed date

- **Type**: History.
- **Locations**: R 5.4 (R:502). Card: `cards/c1.yaml:145`.
- **Evidence**
  - The card is "KDP Orders PKK Out (Oct 1985)". It is mandatory in C1 and its Always line moves KDP from Host to Tolerant.
  - The project's own audit lists the break as unresolved: 1985, 1987 or 1988 (`COIN_Research/research/research-final/audit/unresolved-disagreements.md:14`). The deck data says "Date of the break is open [C-044]".
  - Web search on 2026-11-12 found the 1983 KDP and PKK agreement but no source for an order in October 1985 or an annulment in 1987.
- **Impact**: with a 1987 or 1988 date the card belongs in C2. That changes when KDP camps lose Base building and when normal Cross-Border access can open. Confidence: low on the date, high that it is unresolved.
- **Fix options**
  1. Keep C1 and print the evidence grade on the card and in 5.4. Trade-off: text only.
  2. Move the card to C2. Trade-off: C1 loses a mandatory card, C2 gets three.
  3. Make it a session option, as for hot pursuit (R:829). Trade-off: one more option to track.

## 4. Minor findings

Each row: ID, type, locations, evidence, impact. Fix options follow the table where there is more than one.

| ID | Type | Locations | Evidence and impact |
|:--|:--|:--|:--|
| m-01 | Gap (dead rule) | R 6.0 (R:527), R 10.3 (R:872). `coin/turn.ts:27-32` | "Skip an immediately consecutive Propaganda card". By 10.3 each pile has 8 Event cards on top, so two Propaganda cards are never consecutive. |
| m-02 | Gap (dead rule) | R 6.8 (R:584), R 6.9 (R:591). `coin/propaganda/redeploy.ts:45` | Redeploy into a Restricted camp "activates arrivals". Reset then flips all Guerrillas Underground. The activation has no effect. |
| m-03 | Gap (dead rule) | R 4.3.2 (R:419), R 1.3.1 (R:66 to R:80) | Extort needs "Pop of at least one". Every domestic space has Pop 1 or more. |
| m-04 | Contradiction | R 8.4 (R:708), R 5.1 (R:446). `cards/c4.yaml:283` (DK-066) | "Neither player chooses where" Offices go. DK-066 unshaded says "Remove 2 Offices" and the executing State chooses. |
| m-05 | Contradiction | R 4.2.4 (R:374), R 10.8 (R:973). `cards/c3.yaml:3` (DK-036) | Card text: "Village Clearance is now available". The rules open it at C3 for all games. The card sentence has no effect. |
| m-06 | Contradiction | R 5.3 (R:491). `cards/pivotal.yaml:57` (DK-076) | Card: "Village Clearance may accompany one of them" (Sweep or Assault). Rule: it follows the Sweep only. 4.2.4 does not allow it with Assault. |
| m-07 | Gap | R 4.2.4 (R:393). `coin/ops/sa/village-clearance.ts:63` | The rule names the Customs Union Momentum. It does not name US Lending Conditions (DK-074), which adds 2 Resources per Village Clearance. |
| m-08 | Rules vs prototype | R 6.3 (R:545). `coin/propaganda/upkeep.ts:45-50` | Rule: remove Guards "until it can pay for those remaining". The engine lets a short State remove more Guards than needed. |
| m-09 | Ambiguity, Rules vs prototype | R 4.2.3 (R:368), R 8.1.4 (R:665). `coin/ops/sa/host-actions.ts:13-18` | "a further move at Hostile has no posture effect". The engine Activates the Guerrillas in Syria-Bekaa again. Also unclear: does a move from Aligned back to Hostile "reach" Hostile and Activate? The engine says yes. |
| m-10 | Gap, Rules vs prototype | R 3.3.3 (R:277 to R:281). `coin/ops/pkk/attack.ts:21, 78` | (a) Attrition with fewer Guerrillas than Troops removed: no rule. Engine removes what is there. (b) "choose Troops or Police first": the engine takes all of one type first. It cannot remove one Troop and one Police when two of the first type are present. (c) The engine lets the PKK remove zero or one piece on a success. |
| m-11 | Ambiguity | R 3.2.2 (R:219), R 3.2.3 (R:227). `coin/ops/state/garrison.ts:36-43` | (a) Police move "among domestic spaces": adjacent only, or any distance? Engine: any distance. (b) Activate "up to" a number: may the State activate fewer? Engine: always the maximum. |
| m-12 | Gap | R 1.3.4 (R:86), R 1.4.3 (R:94). `map.yaml` stacking | The rules ban Guards in Western Cities only. The package bans Guards in every City, so also Diyarbakır City. |
| m-13 | Gap | R 8.1.5 (R:667 to R:669), R 7.4 (R:643), R 1.2 (R:43) | No rule or card returns the Leadership to Present. "does not by itself flip Leadership back" suggests a way exists. "Captured" is a third state with no marker side. |
| m-14 | Ambiguity | R 7.5 (R:647) | "Apply its concessions first." Then: "Reveal all face-down Covert markers first". Two steps are both "first". Engine order: concessions, reveal, margins. |
| m-15 | Ambiguity | R 5.1 (R:446), Appendix A (DK-004, DK-021, DK-025, DK-033) | Card text says "(State choice)" or "(PKK choice)". The rule gives the choice to the executing faction. The card wording says the opposite on its face. |
| m-16 | Ambiguity | R 5.5 (R:515). `cards/c1.yaml` DK-006 shaded | Guard Abuse applies with "any Harm marker". That includes PKK Harm, which the PKK places by Strike Collaborators in Guard spaces. The State then loses Legitimacy for a PKK act. Intent not stated. |
| m-17 | Gap | R 3.3.1 (R:256), R 4.2.3 (R:368), R 3.2.4 (R:237). `rally.ts:67-70`, `assault.ts:36` | Paid actions with no possible effect are legal in the engine: Rally in Europe at 5 with no Ban marker (the engine cap is then unlimited, `common.ts:68-70`; with the Ban marker the engine refuses a Rally at the cap of 3), Diplomacy against Europe at 0, Assault with one Troop in a Mountain. The rules are silent. A no-effect location also counts for M-07. |
| m-18 | Gap | R 5.3 (R:487). `coin/pivotal.ts:59, 100` | ARGK places "among spaces with PKK Bases". The engine accepts an external camp at any posture, also Hostile. 5.1 says card text does not waive other limits. |
| m-19 | Contradiction | R 1.7 (R:118), R 2.7 (R:189). `choose-operation.ts:111-121` | "Pay the full required cost before taking a voluntary action." An Extort before the Operation can supply the Resources for that Operation. |
| m-20 | Gap | R 10.3 (R:871 to R:886) | Chain order applies only "if both cards of a pair below are present". A later card can be in the pile with no earlier card (for example DK-057 with no DK-056). The rules do not say this is intended. |
| m-21 | Gap (documents) | R 1.0 (R:14), `README.md:41`, `docs/rules/review.md:65`, C3 to C5 card text | The PDF is stale. README still names it the Scenario A rulebook. C3 to C5 card text is not in Appendix A and cites research section numbers ("07, section 10.1"), not rule numbers. |
| m-22 | Ambiguity | R 5.2 (R:463). `rally.ts:83-86, 156` | Academy adds Guerrillas "in addition to its normal recruitment allowance". The engine adds them with any Rally option in Syria-Bekaa, also Base building and the flip option. |
| m-23 | Structure | R 7.2 (R:619), R 1.4.1 (R:90), R 6.2 (R:535), R 1.3.4 (R:86) | Departures from the reference series with no reason in the rules text: victory at "reaches or exceeds" (reference: exceeds), no Casualties box, no income in the final round, no Terror-type Operation. Each is consistent in itself. |
| m-24 | Gap | R 1.3.4 (R:86), R 6.8 (R:584) | Guerrillas in Western Cities can never leave: no March out, and Redeploy needs an adjacent Base space. Not stated as intended. |
| m-25 | Gap | R 5.3 (R:479) | Coercive Diplomacy needs Syria at Tolerant or Restricted. If Host Pressure returns Syria to Host, the Pivotal cannot be played. |
| m-26 | Gap | R 8.6 (R:746, R:753), R 6.4 (R:557), R 8.4 (R:712). `ceasefire.ts`, `reset.ts:21` | (a) The PKK Restraint Broken marker has no rule effect. Only the State marker is tested. (b) Gain 7(b) tests for no State marker, but a State breach already ends Reciprocal Restraint, so the test cannot fail. (c) Step 4: may one faction leave Talks and then Reciprocal Restraint in the same step? Engine: one move per faction, State first, so State then PKK can go from Talks to None in one step. |

**Fix options for selected Minor findings**

- **m-04**: (1) add DK-066 to the exceptions in 8.4. (2) Make DK-066 use the line 5 removal order. Trade-off: option 2 removes a State choice.
- **m-09**: (1) state that Activation happens only when the posture changes into Hostile or Aligned from a more open step. (2) Keep the engine reading and write it. Trade-off: option 1 needs an engine change.
- **m-10**: (1) write "as many as possible" for attrition and allow free mixing of Troops and Police. (2) Write the engine behavior (one type first) into 3.3.3.
- **m-16**: (1) limit Guard Abuse to State Harm and Disputed Harm. (2) Keep all three and add the reason.
- **m-17**: (1) forbid a location with no possible effect. (2) Allow it and say so. Option 1 also closes a route in M-07.
- **m-26 (c)**: (1) one move per faction per step. (2) A faction may leave fully (to None) in one step and pays the Europe cost once.

## 5. History flags (Phase 7)

Rules that depend on a historical claim. "Checked" names the source used in this audit.

| ID | Rule or card | Claim | Status |
|:--|:--|:--|:--|
| H-01 | 5.4, DK-005 (Always) | KDP ordered the PKK out in October 1985 | Disputed. See M-12. |
| H-02 | 5.2, DK-010 "Rival Groups Form the TSK (1986)" | A rival coalition named TSK formed in 1986 | Not verified. Project data marks event E-0054 "unverified_inherited_claim" (`COIN_Research/.../data/historical-events.csv:55`). Web search found no source. "TSK" is also the usual short form of the Turkish Armed Forces, and the same data file uses it that way (line 29). Finding m-27 below. |
| H-03 | 5.3, DK-015 ARGK Formed (C1) | ARGK formed at the PKK Third Congress, October 1986 | Checked by web search. Several secondary sources agree on October 1986. |
| H-04 | 1.7, DK-064 Ban marker | Germany banned the PKK in November 1993 | Checked in the project audit: order dated 22 November 1993, published 26 November 1993 (`COIN_Research/.../audit/date-resolutions.csv`, conflict 3). Consistent with C4. |
| H-05 | 5.4, DK-003 Law 3175 (C1) | Village guard law, March 1985 | Checked in the project audit: 26 March 1985 (same file, conflict 1). |
| H-06 | 5.4 and 8.1.5, DK-093 Capture | Capture in February 1999, after the leader left Syria in October 1998 | Dates are on the cards. The rules do not enforce the order. See M-09. |
| H-07 | 4.2.2 and 10.1 option 1 | Early hot pursuit into the KDP zone, limit of three Troops | The rules call it "a low-evidence design assumption" (R:833). Not checked again. |
| H-08 | 4.2.3 | Syria penalty of 1 until C5, KDP bonus from C3 | Design weights tied to the 1998 crisis and the 1991 vacuum. Not checked. |
| H-09 | 10.6, 10.7 setups | Scenario B (January 1990) and Scenario C (January 1993) track values | Internally consistent with card dates (OHAL 1987, HEP case July 1992, vacuum 1991). Not checked against outside sources. |
| H-10 | Appendix A, DK-012, DK-032, DK-034 | Single events of May 1985 and September 1989 | Project data gives one source each and grade Moderate. Not checked. |

One more Minor finding comes from this table:

| ID | Type | Locations | Evidence and impact |
|:--|:--|:--|:--|
| m-27 | History | R 5.2 (R:464), `cards/c1.yaml:336` (DK-010) | Card title uses "TSK" for a Kurdish coalition. The claim is unverified in the project data and the acronym collides with the Turkish Armed Forces. A reader can take the card to be about the army. |

All other card dates (C2 to C5) were read but not checked again. The well-known ones (OHAL July 1987, HEP founded June 1990, PKK ceasefire March 1993, Adana October 1998) match general knowledge. That is an unverified assumption in this audit. To verify, compare each card date with `COIN_Research/research/research-final/data/historical-events.csv`.

## 6. Balance notes (deferred to bot playtests)

1. In C1 and C2 nothing needs OHAL, so the free move to Normalizing (R:675) removes the drain and keeps gain 7(c) (R:557).
2. Gain 7(c) applies in every round with no new Displacement, so it cancels the Martial Law and OHAL drain before C3.
3. A State closure filing (R:718) costs the State 2 Legitimacy and gain 7(a) one round later. Its benefit is not clear.
4. Village Clearance costs the State 2 x Pop Legitimacy to lower the PKK score by Pop at most.

## 7. Structure check (Phase 6)

Compared with the two-faction reference volume in `COIN_Research/research/rules/md/` and the series notes in `COIN_Research/research/analysis/`.

| Pattern | Reference series | This game | Result |
|:--|:--|:--|:--|
| Initiative boxes and response matrix | Five boxes, Second Eligible picks an adjacent box | Same (`sequence.yaml`) | Same |
| Which box the First Eligible uses | Follows the action done | Free choice | Departure, no reason stated. M-07 |
| Next-card order | First Eligible choice only | Same (R 2.4) | Same |
| Pass income | 1 and 2 | Same | Same |
| Pivotal window and priority | Before First Eligible acts, Second Eligible first | Same (R 5.3) | Same |
| Next-card preview | None in the two-faction volume | None (R 1.1) | Same, stated |
| Victory check | Start of each round but the first, "exceeds" | Same timing, "reaches or exceeds" plus Harm gate | Departure. m-23. Harm gate has a design note (R:18) |
| Support and Opposition | One level in the two-faction volume, two levels in most others | Two levels | Deliberate, no reason stated |
| Political spending cap | Commitment | Half Legitimacy (R:315) | Parallel |
| Agitation access | Pieces and no enemy Control | Base or Control (R:317) | Departure, recorded in Appendix B.2 (DD-20) |
| Propaganda phases | Victory, Resources, Support, Redeploy, Reset | Adds Upkeep, Legitimacy, Legal Politics | Deliberate additions |
| Reset | Terror removal, flip Underground, Momentum off, first faction reset | Same pattern with Coercion (R 6.9) | Same |
| Casualties | Casualties box | None (R:90) | Departure, no reason stated. m-23 |
| Final round | Ends after the Support phase | Ends after Agitation, and no income (R:535) | Departure for income, reason only in a code comment. m-23 |
| Non-player systems | None in the two-faction volume | Legal Politics, Hizbullah card procedure | Deliberate. M-08 for the timer |

## Appendix: Inventory (Phase 1)

**Factions** (R 1.0): State, PKK. Non-player: Legal party (8.5), Kurdish Hizbullah (5.6), hosts Syria, KDP, PUK (8.1).

**Pieces** (R 1.2): Troops 30, Police 24, Village Guards 16, State Bases 8, Guerrillas 30 (Underground, Active), PKK Bases 12, Leadership 1 (Present, Abroad).

**Markers** (R 1.2, 8.4): State Harm 12, PKK Harm 12, Disputed Harm 6, Coercion 8, Displacement 10 (New, Old), Reception 8, Covert 6, Office 8, Capability 12, Momentum 8, Restraint Broken 2 (State, PKK), Closure Case 1, Successor 1, Ban 1.

**Other components** (R 1.2): board, cards of C1 to C5, 4 Pivotal cards, 1 die, 2 initiative cylinders, track markers.

**Map** (R 1.3, 10.4): 13 domestic spaces (6 Mountain, 5 Plain, 2 City; table at R:66 to R:80), 5 external boxes (Syria-Bekaa, KDP Zone, PUK Zone, Iran, Europe), 20 domestic links, 5 external links.

**Tracks** (R 1.7, 8.1, 8.2, 8.5, 8.6): Resources (0 to 50, each faction), Legitimacy (0 to 20), Europe (0 to 5), Emergency Rule (4 steps), Host posture x3 (5 steps, Syria 4), Legal Space (4 steps), Ceasefire (4 steps), Campaign (C1 to C5).

**Sequence steps** (R 2.0, 6.0)

- Card: reveal (2.2), Always (5.1), Pivotal window (5.3), First Eligible choice (2.3), Second Eligible choice (2.3), eligibility (2.4).
- Boxes (2.3): Event, Limited Op, Op Only, Op + SA, Pass.
- Propaganda: Victory (6.1), Resources (6.2), Guard Upkeep (6.3), Legitimacy and Emergency Rule (6.4, eight steps), Legal Politics (6.5: filing, table lines 1 to 6, ceasefire step), Civic Action (6.6), Agitation (6.7), Redeploy (6.8), Reset (6.9, six steps).

**Actions**

- State Operations (3.2): Train, Garrison, Sweep, Assault.
- PKK Operations (3.3): Rally, March, Attack, Coerce.
- State Special Activities (4.2): Air Mobility, Cross-Border, Diplomacy, Village Clearance, Covert Action.
- PKK Special Activities (4.3): Ambush, Extort, Strike Collaborators, Host Pressure.
- Sub-actions (3.6): Civic Action (5 steps), Agitation (3 steps).
- Other card actions: Declare Ceasefire (2.3, 8.6), Pivotal play (5.3), closure filing (8.5), Emergency choice (6.4 step 8).

**Events** (R 5.0, package): 99 cards. C1 15 pool cards (2 mandatory), C2 18 (2), C3 17 (2), C4 20 (0), C5 20 (1), 5 Propaganda, 4 Pivotal. Lasting effects: 5.2. Mandatory cards: 5.4. Chains: 10.3.

**Victory conditions** (R 7.0)

- State score = Total Support + Legitimacy. PKK score = Total Opposition + domestic PKK Bases (7.1).
- Thresholds by scenario (7.1): 49 and 30, 48 (or 46) and 41, 44 and 48.
- Victory check (7.2): score at or above threshold and Harm at most 6. Ties: margin, then lower Harm, then PKK.
- Final scoring (7.3): margin less 2 per Harm above 6.
- Negotiated Outcome (7.5, 8.6).

**Defined terms** (R 9.0): Activate, Adjacent, Always, Available, Base, Campaign, Capability, Control, First and Second Eligible, Free, Harm gate, Location, Covert marker, Negotiated Outcome, Office, Pivotal Event, Margin, Momentum, Op and SA, Pop, Posture, Redress, Underground.

**Terms used but not defined in 9.0**: group (3.3.2, see M-03), Out of Play (1.2, 8.3), Support and Opposition levels (defined in 1.6 only), Harm count (1.8 only), Legitimacy (1.7 only), Relief and Return (3.6.1 only), structural card (5.4 only), switch (10.8 only), breach (8.6 only), Vacuum (5.4 only), Captured (7.4, see m-13), Ban marker (see M-02).

**Scenarios** (R 10.0): Full campaign, A, B, C, S0 test. Setup arithmetic was checked by script against `scenarios/*.yaml`: piece totals equal supply, and the printed scores, Harm counts and Control statements are correct for all four scenarios.
