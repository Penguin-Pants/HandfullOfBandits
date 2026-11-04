# 32 C3 cards: encoding draft

Status: **approved by the designer 2026-11-04** (DEC-68): all section 4 points as proposed. Built in P3b-07a to P3b-07c ([11](11-build-plan.md) section 4). Source: deck CSV rows DK-036 to DK-055; research 05 s5; 07 s6.4, s10.1; 08 s5, s7, s8. C4 and C5 follow in later drafts.

Card text is the CSV prose and is not edited (04 s4.8). This draft lists how each side will be encoded, the engine additions it needs and the open points. Section 4 lists every open point with its approved answer.

## 1. Batches (5 cards per PR)

| Batch | Cards | Engine additions |
|---|---|---|
| P3b-07a | DK-036, DK-039, DK-042, DK-051, DK-052, Propaganda DK-055 | None |
| P3b-07b | DK-043, DK-045, DK-048, DK-049, DK-053 | A1, A2 |
| P3b-07c | DK-038, DK-041, DK-044, DK-047, DK-050 | A3 to A6 |

DK-054 Serhildan, DK-037 and DK-040 are built (P3b-06). DK-046 is a research lead outside normal draws (08 s3.1; CSV `deck_eligible: no`). Proposed: leave it out of the package (point 1).

## 2. Cards

### 2.1 P3b-07a: law, politics and one clash

**DK-036 OHAL Powers (KHK 413, Apr 1990)**, T0
- U: "If Emergency Rule is OHAL, set it to OHAL Extended Powers. Village Clearance is now available (DD-07.2; 07, section 8.2)."
- S: "Press curbs: Legitimacy -2. Europe +1."
- Encoding: U, `conditional` (Emergency Rule is OHAL) then `setTrack` to OHAL Extended Powers. S, `adjustTrack` twice; Europe goes through the Ban cap.
- Gap: the second U sentence has no effect. Village Clearance is open from C3 by DEC-63, and this is a C3 card. See point 2.

**DK-039 Law 3713 (Apr 1991)**, T0
- U: "Language ban lifted: Legitimacy +2. Shift one City with State Control and Police one level toward Support."
- S: "Article 8 prosecutions: Legitimacy -1. Europe +1."
- Encoding: U, `forEachSpace` over City terrain (Diyarbakır City, Western Cities) with State Control and Police, exactly 1 if any. Normal shift rule (State Harm or Coercion blocks). No gap.

**DK-042 Election Brings HEP Deputies to Parliament (Oct 1991)**, T0. Chain: after DK-037.
- U: "Deputies enter parliament: Legitimacy +1. If Legal Space is Open, run Legal Politics line 4 once."
- S: "Votes in the southeast: shift Mardin-Batman or Diyarbakır Rural one level toward Opposition if it has no Office."
- Encoding: U, `procedure legal.officeLines` once, inside a Legal Space Open condition. Line 4 places only below the line 3 limit (07 s6.4, line 4 condition). S, `forEachSpace` over the two spaces without an Office, exactly 1 if any.
- Restriction: none. U places an Office but does not remove one (05 s5 item 1), so the PKK may execute it.

**DK-051 Prosecutor Files to Close HEP (Jul 1992)**, T0. Chain: after DK-037.
- U: "Place the Closure Case marker now if none is on the track. Legal Space to Prosecuted."
- S: "The case draws attention abroad: Europe +1."
- Encoding: U, as the HEP Founded filing (flag `closureCase`, Legal Space to Prosecuted), with `executors: [state]` (05 s5 item 1). See point 3.

**DK-052 Attack on Boğazköy Gendarme Station (Nov 1992)**, T1
- U: "Reinforcement: place 2 Police and 1 Troop in Diyarbakır Rural."
- S: "The PKK conducts a free Attack with Ambush in Diyarbakır Rural or an adjacent space with an Underground Guerrilla."
- Encoding: U, `placePieces` from Available (places what is there). S, as DK-002 shaded: free `pkk.attack` with `pkk.ambush`, 1 location from Diyarbakır Rural and its 6 neighbors. Ambush already needs an Underground Guerrilla. No gap.

**DK-055 Propaganda**: as DK-035.

### 2.2 P3b-07b: harm cards (T2, T3)

**DK-043 Newroz Killings (Mar 1992)**, T2
- U: "Block only: place a State Harm marker in Mardin-Batman and in Botan. No other effect."
- S: "Place a State Harm marker in Mardin-Batman and in Botan. Legitimacy -1. Europe +1. Shift Mardin-Batman one level toward Opposition."
- Encoding: U `blockOnly: true`, 2 `placeMarker`. S adds 2 tracks and 1 shift. State Harm blocks only shifts toward Support, so the shift is not blocked by the new marker. No gap.

**DK-045 Şırnak Town Battle (Aug 1992)**, T2
- U: "Block only: place a State Harm marker in Botan and 1 Reception marker in Diyarbakır City. No other effect."
- S: "Place a State Harm marker in Botan and 1 Reception marker in Diyarbakır City. Legitimacy -1. Shift Diyarbakır City one level toward Opposition."
- Encoding: as DK-043. No gap.

**DK-048 Houses Burned at Kelekçi (Nov 1992)**, T2
- U: "Block only: place a State Harm marker in Diyarbakır Rural. No other effect."
- S: "Place a State Harm marker in Diyarbakır Rural. Legitimacy -1. Europe +1."
- No gap.

**DK-049 Journalists and Press Staff Killed (1992)**, T3
- U: "Block only: place a Disputed Harm marker in Diyarbakır City. No other effect."
- S: "Place a Disputed Harm marker in Diyarbakır City. Reveal 1 Covert marker at random. Europe +1."
- Gap A1: random Covert reveal (07 s10.2 item 2). New procedure `covert.revealRandom`: picks one face-down marker with the game RNG, as Propaganda exposure does (PA-13), then the existing reveal (State Harm, Legitimacy -2). No marker on the map: nothing. DK-079 and DK-080 (C5) reuse it.

**DK-053 Unattributed Killings in the Southeast (1992)**, T3
- U: "Apply 07, section 10.1: remove 1 Office or 1 Guerrilla, in that priority, from the highest-Pop eligible space among Botan, Mardin-Batman, Diyarbakır City and Diyarbakır Rural. Place a Disputed Harm marker there."
- S: "Apply 07, section 10.1 as unshaded. Then Europe +1 (calls for an inquiry)."
- Gap A2: new procedure `hizbullah.unattributed` (07 s10.1 item 2). The 4 spaces and the tie order (Mardin-Batman, Diyarbakır City, Diyarbakır Rural, Botan) go in parameters. The executing faction makes no choice. See points 4 to 6.

### 2.3 P3b-07c: operations and Momentum

**DK-038 KHK 430 (Dec 1990)**, Momentum on U, T2
- U: "State Momentum: until the next Reset, Sweep costs 1 Resource per space at any Emergency Rule step. The State conducts a free Garrison."
- S: "Near-immunity for governors draws scrutiny: Legitimacy -2."
- Gap A3: modifier `khk430`. Sweep reads it and uses `sweep.costOhalExtended` (1) at every step.

**DK-041 Operation in Northern Iraq (Aug 1991)**, T1. Chain: after DK-040.
- U: "The State conducts a free Sweep and a free Assault in the KDP Zone through Cross-Border (access and Disputed Harm rules apply)."
- S: "Criticism of the operation: Legitimacy -1. Move up to 3 Guerrillas from the KDP Zone to the PUK Zone, Underground."
- Encoding: U, free Sweep with Cross-Border in the KDP Zone (as DK-040), then free Assault in the KDP Zone with Cross-Border. The Assault already places Disputed Harm with Cross-Border (06 s3.2). S, as DK-017 shaded with one destination.
- Gap A4: free action constraint `noLift`: the Assault's Cross-Border moves no Troops. Without it the card allows two lifts of up to 6 Troops. See point 7.

**DK-044 Turkey-Syria Accord (1992)**, T0
- U: "Bekaa camp closed: Syria posture one step toward Hostile. Remove 1 PKK Base from Syria-Bekaa if 2 or more are there."
- S: "Leader stays: move up to 2 Guerrillas from Syria-Bekaa to Mardin-Batman or Şanlıurfa, free. State Resources -2."
- Encoding: U, `stepOrdinal` on Syria posture (normal Hostile entry), then the count check after the step. S, one destination as DK-005 and DK-017 shaded (choice, then up to 2). Moved Guerrillas keep their face (no "Underground" in the text).
- Gap A5: condition `spaceHas` gets an optional `min` (default 1): "2 or more PKK Bases".

**DK-047 Large Operation with KDP Help (Oct-Nov 1992)**, T1
- U: "The State conducts a free Sweep and a free Assault in the KDP Zone through Cross-Border. If KDP is Hostile or Aligned with Turkey, ignore the Mountain modifier."
- S: "Fighters slip away: move up to 4 Guerrillas from the KDP Zone to the PUK Zone or Hakkari, Underground. State Resources -3."
- Encoding: U, as DK-041, with the posture condition choosing the constraint. S, one destination as DK-005 and DK-017 shaded.
- Gap A6: free action constraint `ignoreMountain`: one Guerrilla per cube, one removal per Troop in the KDP Zone. See point 8. Chain: DK-046 (point 1).

**DK-050 Özgür Gündem Begins Publication (May 1992)**, Momentum on either side, T0
- U: "Press prosecutions: State Momentum: until the next Reset, Agitation in Diyarbakır City costs 1 more per step."
- S: "Reporting raises the cost of harm: Europe +1. PKK Momentum: until the next Reset, each revealed Covert marker costs Legitimacy 1 more."
- Gap A3: modifiers `pressProsecutions` (read by `agitationCost`, so Rally Agitate and Propaganda Agitation both pay) and `pressReporting` (read by the Covert reveal). See point 9.

## 3. Engine additions (no designer text)

| ID | Addition | Cards |
|---|---|---|
| A1 | Procedure `covert.revealRandom` | DK-049 (later DK-079, DK-080) |
| A2 | Procedure `hizbullah.unattributed`, parameters for its spaces and tie order | DK-053 |
| A3 | Modifiers `khk430`, `pressProsecutions`, `pressReporting` with their hooks | DK-038, DK-050 |
| A4 | Free action constraint `noLift` (Cross-Border with no Troop move) | DK-041, DK-047 |
| A5 | Condition `spaceHas` field `min` | DK-044 |
| A6 | Free action constraint `ignoreMountain` (Sweep and Assault) | DK-047 |

## 4. Resolved points (designer, 2026-11-04: all as proposed)

1. **DK-046:** leave it out of the package. It is a research lead (08 s3.1), never dealt, so the DK-046 to DK-047 chain has no effect. Alternative: add it as `notEncoded`, not deck-eligible.
2. **DK-036 Village Clearance sentence:** C3 already opens Village Clearance (DEC-63, `clearance.from`). No card before C3 can set flag `ohalPowers`. Proposed: encode only the Emergency Rule step, and delete the unused flag branch in `village-clearance.ts` (Edits 7). Alternative: set the flag anyway, with no effect in play.
3. **DK-051 with a case already filed:** nothing happens. Legal Space is then already Prosecuted (07 s6.3). Proposed: yes, as HEP Founded unshaded.
4. **DK-053 PKK restriction:** both sides may remove an Office, and 05 s5 item 1 bars the PKK from a side that removes Offices. Its exception lists only DK-065, DK-067 and DK-094. DK-053 is also non-player: the executor chooses nothing (08 s7.2 item 6). Proposed: open both sides to both factions and add DK-053 to the 05 s5 item 1 exception. Alternative: `executors: [state]` on both sides, so the PKK can never take this card's Event.
5. **DK-053 Guerrilla face:** the procedure removes an Underground Guerrilla first, then an Active one. The executor makes no choice, and Underground first is the engine default. Alternative: Active first.
6. **DK-053 no target:** no listed space has an Office or a Guerrilla. Nothing happens and no Disputed Harm marker is placed ("there" has no space). Shaded still gives Europe +1.
7. **DK-041 and DK-047 lift:** one Cross-Border lift, with the Sweep. The Assault uses Cross-Border for access and Disputed Harm only. Alternative: a second lift with the Assault (up to 12 Troops in all).
8. **DK-047 Mountain modifier:** ignore it for both the Sweep (Activation) and the Assault (removals). Alternative: Assault only. At Aligned the Assault already removes one piece per Troop (`assault.ts`).
9. **DK-050 "per step":** +1 per shift level bought by Agitation in Diyarbakır City. Coercion removal and Redress keep their cost. It applies to Rally Agitate and to Propaganda Agitation (one shared cost rule, DD-20).

## 5. Carried observation (Propose, outside P3b-07)

`movePieces` with no face moves Underground Guerrillas first (`core/effects/common.ts` `sourceFaces`). On "move ... Underground" sides (DK-005 and DK-017 shaded now; DK-041 and DK-047 shaded next) the PKK leaves its Active Guerrillas behind, which it would never choose. Proposed fix: when `toState` is set, move the other faces first. It changes C1 and C2 card play, so it needs approval. Not part of this draft's batches.
