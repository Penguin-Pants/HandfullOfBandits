# 33 C4 cards: encoding draft

Status: **approved by the designer 2026-11-04** (DEC-69): section 4 as proposed except points 1 and 9 (changed answers marked). To build in P3b-07d to P3b-07g ([11](11-build-plan.md) section 4). P3b-07d built; point 10 added at build (DEC-71). Source: deck CSV rows DK-056 to DK-077; research 05 s5; 07 s6.3, s6.4, s7; 08 s5, s7, s8. Format as [32](32-c3-cards-draft.md).

Card text is the CSV prose and is not edited (04 s4.8). This draft lists how each side will be encoded, the engine additions it needs and the open points. Section 4 lists every open point with its approved answer.

## 1. Batches (5 cards per PR)

| Batch | Cards | Engine additions |
|---|---|---|
| P3b-07d | DK-060, DK-065, DK-066, DK-067, DK-068, Propaganda DK-077 | B1 |
| P3b-07e | DK-056, DK-057, DK-058, DK-059, DK-073 | B2 |
| P3b-07f | DK-061, DK-062, DK-063, DK-064, DK-069 | B3 |
| P3b-07g | DK-070, DK-071, DK-072, DK-074, DK-075 | B4, B5 |

DK-076 Area Domination is built (P3b-06b). Chains (08 s8): DK-056 before DK-057, DK-058 and DK-059; DK-061 before DK-064; DK-066 before DK-068.

## 2. Cards

### 2.1 P3b-07d: legal parties

**DK-060 Constitutional Court Dissolves HEP (Jul 1993)**, T0
- U: "If a Closure Case marker is on the track, resolve Legal Politics line 1 now (ban)."
- S: "The ban draws protest: Europe +1. Shift Diyarbakır City one level toward Opposition if it has no Office."
- Encoding: U, `conditional` on flag `closureCase`, then procedure `legal.ban`. `executors: [state]` (bans the party, 05 s5 item 1). S, as DK-042 shaded with one space.

**DK-065 DEP Founded (May 1993)**, T0
- U: "The State may place the Closure Case marker if none is on the track."
- S: "Non-player side: if Legal Space is Banned, resolve Legal Politics line 2 now. Otherwise place 1 Office in the line 4 order."
- Encoding: U, as HEP Founded unshaded (choice; a filing also sets Legal Space to Prosecuted, 07 s6.3), only while Legal Space is Open or Prosecuted (point 10), `executors: [state]`. S, `conditional` Banned, then procedure `legal.successor`, else procedure `legal.officeLines` (lines 3 and 4: no Office at the limit, DEC-69). Open to both factions (05 s5 item 1 exception). See points 1, 2 and 10.

**DK-066 Parliament Lifts DEP Immunity (Mar 1994)**, T0
- U: "Remove 2 Offices. Legitimacy -1."
- S: "Arrests of deputies draw protest: Legitimacy -2. Europe +1."
- Encoding: U, `forEachSpace` over spaces with an Office, exactly 2 if there are 2 (the executor chooses), `executors: [state]` (removes Offices). See point 3.

**DK-067 HADEP Founded (May 1994)**, T0
- U: "Legal Space to Prosecuted if it is Open."
- S: "Non-player side: if Legal Space is Banned, resolve Legal Politics line 2 now without the minus 1. Otherwise place 1 Office in the line 4 order."
- Encoding: U, `setTrack` with `ifEquals: open`, `executors: [state]` (moves Legal Space). S, as DK-065 shaded with procedure `legal.successorFull` (Successor number, minimum 1).

**DK-068 Constitutional Court Dissolves DEP (Jun 1994)**, T0. Chain: after DK-066.
- U: "If a Closure Case marker is on the track, resolve Legal Politics line 1 now. Otherwise place the Closure Case marker."
- S: "Deputies leave for Europe: Europe +1. Legitimacy -1."
- Encoding: U, `conditional` on `closureCase`: then `legal.ban`, else a filing. `executors: [state]`. See point 4.

**DK-077 Propaganda**: as DK-035.

### 2.2 P3b-07e: ceasefire cards

**DK-056 PKK Unilateral Ceasefire (Mar 1993)**, T0
- U: "Ceasefire not recognized: State Resources +3. The State conducts a free Garrison."
- S: "Declare Ceasefire for the PKK: Ceasefire to Declared and Europe +1 (07, section 7.1). Shift up to 2 spaces with PKK pieces and no Office one level toward Opposition."
- Encoding: U, track and free Garrison (it counts for the ceasefire table, DEC-66). S, procedure `ceasefire.declare`, then `forEachSpace` 0 to 2 domestic spaces with a Guerrilla or PKK Base and no Office. See point 5.

**DK-057 Ceasefire Extended at Bar Elias (Apr 1993)**, T0. Chain: after DK-056.
- U: "If Ceasefire is Declared, the State may accept now: Ceasefire to Reciprocal Restraint and Legitimacy +1. Otherwise no effect."
- S: "If Ceasefire is None, set it to Declared. PUK posture one step toward Host. Europe +1."
- Encoding: U, `conditional` Declared, then a choice (accept or not). S, `conditional` None, then Declared with flag `ceasefireDeclaredByPkk`; `stepOrdinal` PUK posture `previous`; Europe +1. See point 6.

**DK-058 President Özal Dies (Apr 1993)**, T0. Chain: after DK-056.
- U: "Spoiler: if Ceasefire is Declared or Reciprocal Restraint, set it to None with no Restraint Broken marker. State Resources +2."
- S: "Uncertainty in Ankara: State Resources -3. PKK Resources +1."
- Encoding: U, `conditional` then procedure `ceasefire.end` (as `endCeasefire`: rounds and flag reset). Talks is not listed, so Talks stays.

**DK-059 Bingöl Road Killings (May 1993)**, T2. Chain: after DK-056.
- U: "Place a PKK Harm marker in Bingöl-Muş. Ceasefire to None; place the PKK Restraint Broken marker. Europe -1."
- S: "Block only: place a PKK Harm marker in Bingöl-Muş. Ceasefire to None. No other effect."
- Encoding: U, marker, `ceasefire.end`, procedure `ceasefire.pkkBroken` (places the PKK marker in Bingöl-Muş unless one is on the map), Europe -1. S `blockOnly: true`, marker and `ceasefire.end`. See point 7.

**DK-073 Second Unilateral Ceasefire (Dec 1995)**, T0
- U: "Ceasefire not recognized: the State conducts a free Sweep in one Mountain space. State Resources +2."
- S: "Declare Ceasefire for the PKK: Ceasefire to Declared and Europe +1. PKK Resources +2."
- Encoding: U, free Sweep with `terrain: [mountain]`, `maxLocations: 1`. S, `ceasefire.declare` (point 5).

### 2.3 P3b-07f: Europe, harm and the report

**DK-061 PKK Attacks on Turkish Offices in Europe (Jun 1993)**, T1
- U: "Europe -2. Legitimacy +1."
- S: "Diaspora networks raise funds: PKK Resources +2. Europe -1."
- No gap.

**DK-062 Deputy Shot Dead in Batman (Sep 1993)**, T3
- U: "Place a Disputed Harm marker in Mardin-Batman. A prosecution opens: Legitimacy +1."
- S: "Place a Disputed Harm marker in Mardin-Batman. Reveal 1 Covert marker at random. Europe +1."
- Encoding: as DK-049 (`covert.revealRandom`). No gap.

**DK-063 Destruction in Lice (Oct 1993)**, T2
- U: "Block only: place a State Harm marker in Diyarbakır Rural and 1 Reception marker in Diyarbakır City. No other effect."
- S: "Place a State Harm marker in Diyarbakır Rural and 1 Reception marker in Diyarbakır City. Legitimacy -1. Shift Diyarbakır City one level toward Opposition."
- Encoding: as DK-045. No gap.

**DK-064 Germany Bans PKK and ERNK (Nov 1993)**, T0. Chain: after DK-061.
- U: "Place the Ban marker on the Europe track (04, section 3.6). If Europe is above 3, set it to 3. PKK Resources -2."
- S: "Protests across Europe: Europe +1. Do not place the Ban marker."
- Encoding: U, `placeMarker ban` in the Europe space (the cap already reads it, `europeCap`), then Europe set to `europe.banCap` when above it. No gap.

**DK-069 HRW Forced-Displacement Report (Oct 1994)**, T0
- U: "Official denial: if fewer than 2 Displacement markers are on the map, Legitimacy +1; otherwise Legitimacy -1."
- S: "Legitimacy -1 per 2 Displacement markers on the map (round down, maximum -3). Europe +1."
- Gap B3: procedures `hrw.denial` and `hrw.report`. They count New and Old Displacement markers; numbers in parameters. See point 8.

### 2.4 P3b-07g: Northern Iraq, Momentum and Guards

**DK-070 KDP-PUK Civil War (May 1994)**, T0
- U: "KDP seeks Turkish help: KDP posture one step toward Aligned with Turkey."
- S: "Vacuum widens: place 2 Guerrillas in the PUK Zone and 1 PKK Base in the KDP Zone or PUK Zone (posture permitting)."
- Encoding: U, `stepOrdinal` KDP posture `next`. S, as DK-040 shaded (Rally placement rules; place what you can). No gap.

**DK-071 Operation Steel (Mar-May 1995)**, T1
- U: "The State conducts a free Sweep and a free Assault in the KDP Zone through Cross-Border, moving up to 10 Troops from Hakkari or Botan (access and Disputed Harm rules apply)."
- S: "Fighters disperse and return: move up to 4 Guerrillas from the KDP Zone to Hakkari or Botan, Underground. Legitimacy -1. Europe +1."
- Encoding: U, as DK-041 (one lift with the Sweep, `noLift` on the Assault). S, one destination (choice), `toState: underground`.
- Gap B5: free action constraint `maxLift: 10` replaces `crossBorder.maxTroops` (6) for this lift.

**DK-072 EU-Turkey Customs Union (Mar 1995)**, Momentum on S, T0
- U: "Legitimacy +2. State Resources +3."
- S: "European conditions: Europe +1. PKK Momentum: until the next Reset, Village Clearance costs Legitimacy 1 more."
- Gap B4: modifier `customs-union` (`extra`), read by Village Clearance.

**DK-074 US Lending Conditions (1994)**, Momentum on S, T0
- U: "Aid flows: State Resources +4."
- S: "Conditions attached: Legitimacy -1. PKK Momentum: until the next Reset, each Village Clearance also costs 2 State Resources."
- Gap B4: modifier `lending-conditions` (`resources`), read by Village Clearance. See point 9.

**DK-075 Raid on Two Guard Villages (Jan 1994)**, T2
- U: "Place a PKK Harm marker in one space with a Village Guard (State choice). Europe -1. Place 1 Village Guard there."
- S: "Block only: place a PKK Harm marker in one space with a Village Guard (PKK choice). No other effect."
- Encoding: `forEachSpace` exactly 1 space with Guards. The executing faction chooses; "(State choice)" and "(PKK choice)" name the normal executor, as DK-021 (designer, PR 50 review). The Guard comes from Available (Guards start Out of Play, `pieces.yaml`); none Available: none placed. No space with Guards: no marker and no Guard, but unshaded Europe -1 still applies (it sits outside `forEachSpace`; do as much as you can, 05 s5 item 3).

## 3. Engine additions (no designer text)

| ID | Addition | Cards |
|---|---|---|
| B1 | Procedures `legal.ban` (line 1), `legal.successor` (line 2), `legal.successorFull` (line 2 without the minus 1). The Office side reuses `legal.officeLines`. The phase and the cards share one copy of each line | DK-060, DK-065, DK-067, DK-068 (later DK-094) |
| B2 | Procedures `ceasefire.declare` (shared with the DeclareCeasefire command), `ceasefire.end` (`endCeasefire`), `ceasefire.pkkBroken` | DK-056 to DK-059, DK-073 |
| B3 | Procedures `hrw.denial` and `hrw.report`, with parameters | DK-069 |
| B4 | Modifiers `customs-union` and `lending-conditions`, read by Village Clearance | DK-072, DK-074 |
| B5 | Free action constraint `maxLift` for Cross-Border | DK-071 |

## 4. Resolved points (designer, 2026-11-04)

1. **DK-065 and DK-067 "place 1 Office in the line 4 order":** **approved: respect the line 3 limit, as DK-042** (no Office at the limit). The proposed "place it anyway" was not chosen.
2. **DK-065 and DK-067 shaded while Legal Space is Absent:** cannot happen. HEP Founded is mandatory in C3, and no card returns Legal Space to Absent. No rule needed.
3. **DK-066 with fewer than 2 Offices:** remove what there is (do as much as you can, 05 s5 item 3).
4. **DK-068 filing:** "Otherwise place the Closure Case marker" is a filing, so Legal Space also goes to Prosecuted (07 s6.3), as HEP Founded and DK-051 do. While Legal Space is Banned, nothing happens (the successor has not returned). Alternative: place the marker only.
5. **"Declare Ceasefire for the PKK" (DK-056, DK-073 shaded) with a ceasefire already in force:** the declaration does nothing (no Europe +1), as the DeclareCeasefire command refuses then (07 s7.1). The other effects still apply. The declaration sets flag `ceasefireDeclaredByPkk`, so leaving the ceasefire later costs Europe as usual. If the State executes the shaded side, the result is the same: a PKK declaration.
6. **DK-057 shaded "set it to Declared":** a PKK declaration (flag `ceasefireDeclaredByPkk`) without the declaration's own Europe +1. The card's own Europe +1 applies once.
7. **DK-059 with Ceasefire already None:** place the PKK Restraint Broken marker anyway (the text is unconditional), unless one is already on the map. Alternative: place it only when a ceasefire was in force.
8. **DK-069 counts:** both New and Old Displacement markers count as "on the map". Shaded: Legitimacy -1 per 2 markers, maximum -3, then Europe +1.
9. **DK-074 with too few State Resources:** Village Clearance is refused when the State cannot pay the 2 Resources (as any unaffordable cost, `cannotPay`). On a free Village Clearance (Area Domination), the 2 Resources would still apply (proposed). **Approved: an action a card makes free skips it (05 s5 item 4). Area Domination's Village Clearance runs "at normal cost" (its card text), so it pays (designer, PR 50 review).**
10. **DK-065 unshaded while Legal Space is Banned** (found at build, owner decision 2026-11-04, DEC-71): **nothing happens, as DK-068 (point 4).** The filing runs only while Legal Space is Open or Prosecuted. Not chosen: file anyway (Prosecuted with no party; the next line 1 would ban again with Successor 0).
