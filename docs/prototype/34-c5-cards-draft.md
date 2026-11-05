# 34 C5 cards: encoding draft

Status: **approved by the designer 2026-11-05** (DEC-75): section 4 as proposed except points 1 and 11 (changed answers marked). P3b-07h to P3b-07k built; C5 is complete ([11](11-build-plan.md) section 4). Source: deck CSV rows DK-078 to DK-099; research 05 s5; 06 s3.3, s5.4; 07 s3, s4.7, s5, s6, s7.1, s8.2, s10.2; 08 s5, s7, s8. Format as [32](32-c3-cards-draft.md) and [33](33-c4-cards-draft.md).

Card text is the CSV prose and is not edited (04 s4.8). This draft lists how each side will be encoded, the engine additions it needs and the open points. Section 4 lists every open point with its approved answer.

## 1. Batches (5 cards per PR)

| Batch | Cards | Engine additions |
|---|---|---|
| P3b-07h | DK-079, DK-080, DK-085, DK-086, DK-087, Propaganda DK-099 | C1 |
| P3b-07i | DK-084, DK-089, DK-090, DK-091, DK-092 | None |
| P3b-07j | DK-078, DK-082, DK-083, DK-088, DK-097 | C3 |
| P3b-07k | DK-081, DK-094, DK-095, DK-096 | C4, C5 |

DK-093 Capture and DK-098 Coercive Diplomacy on Syria are built (P3b-06). Chains (08 s8): DK-079 before DK-080; DK-090 before DK-092. After P3b-07k, C5 has 19 eligible cards and DK-093 for a pile of 12, and a Propaganda card. V-CARDS stopped blocking the full campaign at P3b-07j (16 eligible cards, DEC-76).

## 2. Cards

### 2.1 P3b-07h: reports, harm and the flag case

**DK-079 Susurluk Car Crash (Nov 1996)**, T3. Chain: before DK-080.
- U: "Contained inquiry: reveal 1 Covert marker at random. A minister resigns: Legitimacy +1."
- S: "Reveal up to 2 Covert markers at random (07, section 10.2). Europe +1."
- Encoding: U, procedure `covert.revealRandom` once, Legitimacy +1. S, `covert.revealRandom`, then a choice (stop or reveal a second), Europe +1. See point 1.

**DK-080 Susurluk Commission Report (May 1997)**, T3. Chain: after DK-079.
- U: "Dissent notes limit the report: reveal 1 Covert marker at random. The State may then pay 1 Resource to remove 1 State Harm marker."
- S: "Reveal up to 2 Covert markers at random. Then apply Guard Abuse (07, section 4.7)."
- Encoding: U, `covert.revealRandom`, then as DK-018 shaded: `conditional` State Resources at least 1, a choice, then `forEachSpace` 0 to 1 spaces with a State Harm marker in a space with State Control (`control: state`) and a Police (`spaceHas police`) (State Resources -1, remove it). S, `covert.revealRandom`, then a choice (stop or reveal a second), then the Guard Abuse block of DK-006 shaded (`forEachSpace all`, DEC-57). No gap. See points 1 and 11.

**DK-085 HADEP Congress Flag Case (1996-1997)**, T0
- U: "Place the Closure Case marker if none is on the track. Legal Space to Prosecuted."
- S: "Convictions draw protest: Legitimacy -1. Europe +1."
- Encoding: U, a filing as DK-065 unshaded, `executors: [state]` (05 s5 item 1). S, track changes. See point 5.

**DK-086 Strasbourg Judgments (1997-1998)**, T2
- U: "Pay damages: State Resources -3. Remove 1 State Harm marker."
- S: "Legitimacy -1 per 2 State Harm markers on the map (round down, maximum -3). Europe +1."
- Encoding: U, State Resources -3 (to 0 at most: do as much as you can, 05 s5 item 3), then `forEachSpace` exactly 1 space with a State Harm marker (the executor chooses; none: nothing). S, procedure `strasbourg.report`, then Europe +1.
- Gap C1: procedure `strasbourg.report`. It counts State Harm markers only (not Disputed). It shares one function with `hrw.report`.

**DK-087 Migration Commission Report (Jan 1998)**, T2
- U: "Official count adopted: the State may pay Relief for up to 2 Reception markers at 1 Resource each."
- S: "Legitimacy -1 per 2 Displacement markers on the map (round down, maximum -3). Place 1 Reception marker in Western Cities."
- Encoding: U, twice: `conditional` State Resources at least 1, then `forEachSpace` 0 to 1 spaces with a Reception marker in a space with State Control (`control: state`) and a Police (`spaceHas police`) (State Resources -1, remove it). Two steps let both markers come from one space. S, procedure `hrw.report` (same count as DK-069 shaded, DEC-69 point 8), then `placeMarker reception` in Western Cities. See point 11.

**DK-099 Propaganda**: as DK-035.

### 2.2 P3b-07i: Syria and northern Iraq

**DK-084 Ankara Process in Northern Iraq (1996-1997)**, T0
- U: "Move KDP posture or PUK posture one step toward Hostile, or from Hostile to Aligned with Turkey."
- S: "Calm in northern Iraq: move up to 3 Guerrillas between the KDP Zone and PUK Zone, free. Place 1 PKK Base in one of them (posture permitting)."
- Encoding: U, a choice: KDP or PUK `stepOrdinal next` (Host to Hostile, then Aligned, `tracks.yaml`; Aligned stays). S, a choice of direction, then `movePieces` 0 to 3; the Base as DK-070 shaded (Rally placement rules). The move has no posture limit, as DK-041 and DK-047 shaded. The text does not say Underground, so Guerrillas moved into a Hostile or Aligned zone arrive Active (07 s5.1; P3b-07i review). Guerrillas already there keep their face. See point 4.

**DK-089 Washington Agreement (Sep 1998)**, T0
- U: "The State conducts a free Diplomacy targeting KDP or PUK with +1."
- S: "Turkey not consulted: State Resources -2. PUK posture one step toward Host."
- Encoding: U, free `state.diplomacy` with `spaces: [kdp-zone, puk-zone]`, `bonus: 1` (as DK-009 unshaded). S, track and `stepOrdinal` PUK `previous`. No gap.

**DK-090 PKK Leader Leaves Syria (Oct 1998)**, T0. Chain: before DK-092.
- U: "If Syria is Restricted or Hostile: set Syria to Hostile and flip the Leadership to Abroad. Otherwise Syria posture one step toward Hostile."
- S: "Dispersal from Syria: move up to 3 Guerrillas from Syria-Bekaa to Mardin-Batman, Şanlıurfa or the KDP Zone, Underground. PKK Resources +2."
- Encoding: U, Syria `stepOrdinal next` in every case. Event posture steps run `shiftHost` (`coin/events.ts`): Restricted goes to Hostile, Hostile stays, and at Hostile the Leadership flips to Abroad if it is Present (07 s5.2 item 4). After Capture there is no marker to flip. S, one destination (choice), `movePieces` 0 to 3 `toState: underground`, as DK-071 shaded, then PKK Resources +2. No gap.

**DK-091 Adana Minutes (Oct 1998)**, Capability on U, T0
- U: "State Capability (Adana): while Syria is Hostile, Host Pressure may not target Syria. Remove all PKK Bases in Syria-Bekaa to Available now."
- S: "Slow implementation: if Syria is Hostile, move it to Restricted. PKK Resources +1."
- Encoding: U, Capability with `removePieces pkkBase` in Syria-Bekaa, count 12 (all; absent pieces are skipped). S, `conditional` Hostile, then `stepOrdinal previous` (the Leadership stays Abroad: nothing flips it back); then PKK Resources +1 in every case. See point 6.

**DK-092 Arrest in Rome (Nov 1998)**, T0. Chain: after DK-090.
- U: "If the Leadership is Abroad: the State conducts a free Diplomacy targeting the Europe track with +1."
- S: "Asylum campaign: Europe +1. The PKK conducts a free Rally on the Europe track."
- Encoding: U, `conditional` Leadership marker on its Abroad side in Syria-Bekaa (after Capture: no marker, no effect), then free `state.diplomacy` with `spaces: [europe]`, `bonus: 1`. S, Europe +1, then free `pkk.rally` with `spaces: [europe]`. At the Ban cap the Rally is refused and skipped (`rallyEuropeCap`). No gap.

### 2.3 P3b-07j: operations

**DK-078 Suicide Attacks (Jun-Oct 1996)**, T2
- U: "Place a PKK Harm marker in Dersim. Europe -1. The State conducts a free Garrison."
- S: "Block only: place a PKK Harm marker in Dersim. No other effect."
- Encoding: U, marker, track, free `state.garrison`. S `blockOnly: true`, marker. As DK-059. No gap.

**DK-082 Operation Hammer (May-Jul 1997)**, T1
- U: "With KDP help: the State conducts a free Sweep and a free Assault in the KDP Zone through Cross-Border. If KDP is Hostile, ignore the Mountain modifier and move KDP one step toward Aligned with Turkey."
- S: "Fighters shift to the PUK Zone: move up to 4 Guerrillas from the KDP Zone to the PUK Zone, Underground. State Resources -2."
- Encoding: U, as DK-047 unshaded (one lift with the Sweep, `noLift` on the Assault, access rules apply), with the condition Hostile only; in the Hostile branch `ignoreMountain` on both, then KDP `stepOrdinal next`. S, `movePieces` 0 to 4 from the KDP Zone to the PUK Zone, `toState: underground`, then State Resources -2. See point 3.

**DK-083 US Designates the PKK (Oct 1997)**, T0
- U: "Europe -1. PKK Resources -2."
- S: "Networks adapt: the PKK conducts a free Rally on the Europe track."
- Encoding: U, tracks. S, free `pkk.rally` with `spaces: [europe]` (as DK-092 shaded). No gap.

**DK-088 Third Unilateral Ceasefire (Sep 1998)**, T0
- U: "Ceasefire not recognized: the State conducts a free Sweep in up to 2 spaces."
- S: "Declare Ceasefire for the PKK: Ceasefire to Declared and Europe +1. PKK Resources +2."
- Encoding: U, free `state.sweep` with `maxLocations: 2` (it counts for the ceasefire table, DEC-66). S, as DK-073 shaded (`ceasefire.declare`, DEC-69 point 5). No gap.

**DK-097 Leader Calls for Withdrawal (Aug 1999)**, T0
- U: "Withdrawal under pressure: the State conducts a free Assault in one space with Active Guerrillas."
- S: "Declare Ceasefire for the PKK: Ceasefire to Declared and Europe +1. Move up to 4 Guerrillas from domestic spaces to the KDP Zone or PUK Zone (posture permitting), Underground."
- Encoding: U, free `state.assault` with `maxLocations: 1` and `activeGuerrillas: true`. S, `ceasefire.declare`, then a choice of zone, then `forEachPiece` 0 to 4 Guerrillas in domestic spaces, each `movePieces` 1 from the selected space, `toState: underground`.
- Gap C3: free action constraint `activeGuerrillas`: each location needs an Active Guerrilla. Without it the Assault could take a space with only a Base. See point 10.

### 2.4 P3b-07k: late politics

**DK-081 Emergency Rule Narrowed (1996-1998)**, T0
- U: "Province relief: Legitimacy +1. The State may move Emergency Rule one step toward Normalizing now."
- S: "Emergency rule renewed elsewhere: Legitimacy -1. Europe +1."
- Encoding: U, Legitimacy +1, then a choice (move or not); the move is a `conditional` on the step with `setTrack`. S, tracks. See point 2.

**DK-094 HADEP Wins Local Offices (Apr 1999)**, T0
- U: "Elections held on time: Legitimacy +1. If Legal Space is Prosecuted, set it to Open."
- S: "Non-player side: place 2 Offices in the line 4 order, up to the Office limit plus 1."
- Encoding: U, Legitimacy +1, `setTrack legalSpace open` with `ifEquals: prosecuted`, `executors: [state]` (moves Legal Space, 05 s5 item 1). S, procedure `legal.localWins`, no owner and no `executors` (05 s5 item 1 exception).
- Gap C4: procedure `legal.localWins`. Place up to 2 Offices in the line 4 order, stopping at the line 3 limit plus 1. It reuses the line 4 placement of `legal.officeLines`; the numbers are parameters. See points 7 and 8.

**DK-095 Return to Village Project (1999)**, T0
- U: "Return event: the State may remove up to 2 Displacement markers for 3 Resources each (07, section 3.3; no Support, Harm stays). Legitimacy +1."
- S: "Return stays small: Legitimacy -1 if 3 or more Displacement markers are on the map."
- Encoding: U, `forEachSpace` 0 to 2 spaces with a Displacement marker in a space with State Control (`control: state`) and a Police (`spaceHas police`) (one per space: Village Clearance refuses a second); in each, `conditional` State Resources at least 3, then Resources -3 and remove the marker on its New or Old side; then Legitimacy +1. S, `conditional` `markersAtLeast` Displacement 3, then Legitimacy -1.
- Gap C5: condition `markersAtLeast` (marker IDs and a value, counted on the map, all sides). See point 11.

**DK-096 Repentance Law (Aug 1999)**, T0
- U: "Surrender offer: remove up to 3 Active Guerrillas from domestic spaces to Available. Legitimacy +1."
- S: "Few take the offer: PKK Resources +1. Flip all Guerrillas in up to 2 spaces Underground."
- Encoding: U, `forEachPiece` 0 to 3 Active Guerrillas in domestic spaces, each `removePieces` 1, then Legitimacy +1. S, PKK Resources +1, then `forEachSpace` 0 to 2 spaces with an Active Guerrilla, `setPieceState` all to Underground. See point 9.

## 3. Engine additions (no designer text)

| ID | Addition | Cards |
|---|---|---|
| C1 | Procedure `strasbourg.report`: Legitimacy -1 per 2 State Harm markers, at most 3. One function with `hrw.report`; parameters `hrw.markersPerLoss` and `hrw.maxLoss` become `report.markersPerLoss` and `report.maxLoss` | DK-086 |
| C3 | Free action constraint `activeGuerrillas` | DK-097 |
| C4 | Procedure `legal.localWins`, parameters `legal.localWinsOffices` (2) and `legal.localWinsOverLimit` (1) | DK-094 |
| C5 | Condition `markersAtLeast` (schema change, `make schema`) | DK-095 |

The "move ... Underground" sides (DK-082, DK-090, DK-097 shaded) meet carried follow-up 2 ([11](11-build-plan.md) section 0): `movePieces` moves Underground Guerrillas first. That fix is outside this draft.

## 4. Resolved points (designer, 2026-11-05)

1. **"Reveal up to 2 Covert markers at random" (DK-079 and DK-080 shaded):** **approved: the executor may stop after 1.** Each reveal is random (07 s10.2 item 2); after the first, the executor chooses to stop or reveal a second. The proposed "always 2" was not chosen.
2. **DK-081 "one step toward Normalizing":** follow the 07 s8.2 moves. OHAL Extended Powers goes to OHAL; OHAL goes to Normalizing; at Normalizing nothing happens. The move is free and is not the State's Propaganda step. Alternative: the track order, so OHAL Extended Powers goes straight to Normalizing.
3. **DK-082 order:** read KDP posture once, before the free actions. The KDP step comes after the Assault, as printed. Alternative: step first, so the Assault meets KDP at Aligned and removes one piece per Troop (`assault.ts`).
4. **DK-084 shaded "between":** one direction, chosen by the executor, up to 3 Guerrillas. Alternative: both directions in one Event, 3 in all.
5. **DK-085 unshaded while Legal Space is Banned:** nothing happens, as DK-051, DK-065 and DK-068 (DEC-72, DEC-71, DEC-69 point 4). With a case already filed, only "Legal Space to Prosecuted" applies (no change). Alternative: file anyway.
6. **DK-091 Capability, Host Pressure clause:** Host Pressure on Syria already needs the Leadership Present (06 s5.4), and Syria reaching Hostile flips it to Abroad (07 s5.2 item 4). No scenario starts Syria at Hostile (Scenario C starts Restricted with the Leadership Present, research 10 s5), and no rule flips the Leadership back. So the clause is already true in every reachable state. Approved: no modifier; a test proves Host Pressure on Syria is refused after DK-091 with Syria Hostile. Not chosen: modifier `adana` with its own Host Pressure check.
7. **DK-094 unshaded with a Closure Case marker on the track:** the marker stays (the text does not withdraw it), so line 1 still bans at the next Legal Politics phase. Alternative: remove the marker with the move to Open.
8. **DK-094 shaded while Legal Space is Banned:** nothing happens. Line 3 sets no limit while Banned, so "the Office limit plus 1" is undefined. At the next Legal Politics phase line 5 removes the Office over the limit. Alternative: run line 2, as DK-065 shaded.
9. **DK-096 shaded in a Hostile or Aligned host box:** not eligible. Guerrillas there are Active by the posture rule (07 s5.1), and Reset is the only exception (DEC-53). Alternative: any space with Guerrillas.
10. **DK-097 shaded "(posture permitting)":** a zone is open if PKK March may enter it: Host, Tolerant or Restricted (07 s5.1). The Restricted March cost and activation do not apply (free, Underground as printed). With both zones closed, no Guerrilla moves; the declaration still applies.
11. **Civic Action conditions on event spending (DK-080, DK-087, DK-095 unshaded):** **approved: require State Control and at least 1 Police in the space, as Civic Action (07 s1.3).** The printed cost applies. No new engine code: conditions `control` and `spaceHas`. The proposed "no conditions" was not chosen.
