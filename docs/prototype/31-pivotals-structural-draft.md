# 31 Remaining Pivotals and structural cards: approved text

Status: **approved by the designer 2026-11-04** (DEC-67): section 7 as proposed, Area Domination Assault in the Sweep spaces, section 8 plan changes. Sections 5 and 8 items 2 and 3 built in P3b-06a; sections 1 to 4 built in P3b-06b ([11](11-build-plan.md) section 4). Source: research 05 s4, s5; 07 s5, s6; 08 s2.2, s2.3, s4; 10 s6.1; deck CSV rows DK-037, DK-040, DK-054, DK-076, DK-093, DK-098.

Each section gives the rule as it will be built, then the open points. Section 7 lists every open point with its approved answer.

## 1. Pivotal window, all four cards

**Built now:** the window, Second Eligible priority, decline, one Pivotal per card and ARGK Formed (P3a-05, `coin/pivotal.ts`). The window code accepts ARGK only.

**To build:**

1. The window offers each Pivotal that the faction holds when its Campaign is at or after the card's earliest Campaign and its board precondition is met (05 s4 steps 1 to 3).
2. A faction with two eligible Pivotals chooses one. Only one Pivotal per card (05 s4 step 7).
3. The current card's Always line applies before the window opens (05 s4 step 4). Code does this now.
4. Answers use the Event answer flow (spaces, free action plans), as for Event cards.

## 2. Serhildan (DK-054, PKK, earliest C3)

**Precondition:** Total Opposition is 14 or more, and Mardin-Batman or Botan is at Passive or Active Opposition.

**Effect:**

1. Shift up to 3 domestic spaces with a PKK piece (Guerrilla or Base) and no Office one level toward Opposition. Diyarbakır City may be one of them.
2. Europe +1. The German Ban cap applies (04 s3.6).

The normal shift rule applies: a PKK Harm or Coercion marker in the space blocks a shift toward Opposition (`markers.yaml` `blocks`, as PA-18 for Village Clearance). The same rule applies to the shaded shifts in section 5.

## 3. Area Domination (DK-076, State, earliest C4, tier T1)

**Precondition:** Emergency Rule is OHAL Extended Powers, and Total Opposition is 12 or more.

**Effect:**

1. Free Sweep in up to 3 Mountain spaces.
2. Village Clearance may accompany the Sweep, after it, in one of its spaces. Normal Legitimacy cost and all four conditions apply (06 s3.4). Village Clearance accompanies Sweep or Garrison only, so it cannot accompany the Assault.
3. Free Assault in the spaces the Sweep selected (any number of them).

Assault and Village Clearance count for the ceasefire table, with the breach warning (free Event actions count, DEC-66).

## 4. Coercive Diplomacy on Syria (DK-098, State, earliest C5)

**Precondition:** Syria posture is Tolerant or Restricted, and Legitimacy is 5 or more.

**Effect:** Syria posture to Hostile, with the normal Hostile entry: Guerrillas in Syria-Bekaa Activate and the Leadership flips to Abroad (07 s5.1, s5.2 item 4).

"PKK pieces in Syria-Bekaa stay but earn nothing" needs no new rule: Hostile gives no Base income and an Abroad Leadership gives no income (`propaganda/resources.ts:19-23`).

## 5. Structural cards

### 5.1 HEP Founded (DK-037, C3)

1. **Always:** Legal Space to Open. Then run procedure lines 3 and 4 twice (07 s6.4). From an empty map this places 2 Offices, normally in Diyarbakır City and Western Cities. Lines 5 and 6 do not run, so no prosecutor filing.
2. **Unshaded (State):** the State may file a closure case now if no Closure Case marker is on the track. As a filing: place the marker and set Legal Space to Prosecuted (07 s6.3). The ban follows at the next Legal Politics phase (line 1).
3. **Shaded (PKK):** shift 1 domestic space with a PKK Base and no Office one level toward Opposition. Normal shift rule.
4. **PKK restriction (05 s5 item 1, DD-10.5):** the PKK may not execute the unshaded side. This is the first card with the restriction; the check is new (open since P2-09).

### 5.2 Northern Iraq Vacuum (DK-040, C3)

1. **Always:** set flag `northernIraqVacuum`. It stays for the rest of the game. Code already reads it: Tolerant then allows Cross-Border (from C3) and PKK Bases in the KDP Zone and PUK Zone (`ops/sa/cross-border.ts`, `ops/common-pkk.ts`).
2. **Unshaded (State):** free Sweep in the KDP Zone with a free Cross-Border lift from Hakkari or Botan (up to 6 Troops). Normal Cross-Border access applies: if the KDP posture is Host, nothing happens.
3. **Shaded (PKK):** choose the KDP Zone or the PUK Zone. Place 2 Underground Guerrillas and 1 PKK Base there, as a Rally may: Guerrillas need Host or Tolerant; the Base needs Host, or Tolerant after this card's Always line. Stacking applies. Place as much as you can.

### 5.3 Capture (DK-093, C5)

1. **Always:** if the Leadership is Abroad, apply Capture: remove the Leadership marker; PKK income -1 at each later Resources phase (new parameter `income.pkk.captured`, tune). The PKK keeps its pieces; the game does not end (07 s5.2 item 5). If the Leadership is Present, nothing happens.
2. **Unshaded (State):** if the Leadership is Present, Syria posture one step toward Hostile (normal Hostile entry applies). Otherwise Legitimacy +1 and PKK Resources -3.
3. **Shaded (PKK):** Europe +1 (Ban cap applies). Shift 1 domestic space with a PKK Base and no Office one level toward Opposition.

The Always line applies before either side, so after a Capture the unshaded side takes its "Otherwise" branch.

## 6. Player-facing strings

### 6.1 Pivotal window

- **Prompt:** "Play a Pivotal Event instead of this card, or decline for this card?"
- **Buttons:** "Play Serhildan", "Play Area Domination", "Play Coercive Diplomacy on Syria", "Decline for this card" (ARGK keeps "Play ARGK Formed").
- **Guide lines:**
  - Serhildan: "Shift up to 3 spaces with PKK pieces and no Office one level toward Opposition. Europe +1."
  - Area Domination: "Free Sweep in up to 3 Mountain spaces, Village Clearance may follow in one of them at normal cost, then free Assault in those spaces."
  - Coercive Diplomacy on Syria: "Syria to Hostile. Guerrillas there Activate and the Leadership goes Abroad."

### 6.2 Violation messages

| Code | Text |
|---|---|
| `pivotalCampaign` | {Card} is playable from Campaign {Cn}. |
| `pivotalPrecondition` | {Card} needs: {precondition text from section 2, 3 or 4}. |
| `sideRestricted` | The PKK may not execute this side: it places a Closure Case, bans the legal party, removes Offices or moves Legal Space (05 s5 item 1). |

### 6.3 Log lines

- HEP Founded Always: "HEP Founded: Legal Space to Open. Offices placed by procedure lines 3 and 4 (twice)."
- Capture Always, Abroad: "Capture: the Leadership marker is removed. PKK income -1 at each later Propaganda round."
- Capture Always, Present: "Capture: the Leadership is Present. The Always line does nothing."

## 7. Resolved points (designer, 2026-11-04: all as proposed)

1. **Serhildan "at Opposition":** Passive or Active Opposition. Proposed: yes.
2. **Area Domination spaces:** the Assault uses the spaces the Sweep selected. Alternative: any up to 3 Mountain spaces. Proposed: same spaces ("then" reads as one operation).
3. **Area Domination Village Clearance timing:** after the Sweep, so moved Troops count for its conditions. Proposed: after.
4. **HEP Founded unshaded and the Office condition:** 07 s6.3 asks for at least 1 Office for a filing; the card text does not. Event text overrides rules (05 s5 item 2). Proposed: card text only. After the Always line 2 Offices are normally on the map.
5. **Northern Iraq Vacuum shaded "posture permitting":** Rally placement rules for the chosen zone, place as much as you can. Proposed: yes.
6. **Capture income floor:** total PKK income at a Resources phase is never below 0. Proposed: yes.
7. **Carried from P3b-05 (ceasefire step while Legal Space is Absent):** does not reproduce. HEP Founded is mandatory in C3, so it is always in the top 8 cards, above the C3 Propaganda card (`coin/deck.ts:90-106`). No card sets Legal Space back to Absent. Proposed: no rule change; add a test that HEP Founded precedes the C3 Propaganda card.

## 8. Plan changes (approved)

1. **Split P3b-06 into two PRs** (400-line target): P3b-06a structural cards (DK-037, DK-040, DK-093), the PKK side restriction and the T-EVT "Always lines fire once" tests; P3b-06b the general Pivotal window and DK-054, DK-076, DK-098 with the UI.
2. **Move the Event Europe cap fix from P3b-07 into P3b-06a.** Serhildan and Capture shaded add Europe by Event. Route Event Europe changes through `adjustEurope` (`coin/ops/common.ts`).
3. **Encoding additions** (no designer text): a card effect that runs a named procedure (HEP lines 3 and 4; P3b-07 needs it for DK-065, DK-067, DK-094); a condition that reads a named space (Leadership side, Mardin-Batman or Botan level); a condition on a derived total (Total Opposition); free action timing `after` for an accompanying SA (Area Domination). Coercive Diplomacy encodes "to Hostile" as posture steps, because only Event `stepOrdinal` on a posture runs the Hostile entry (`coin/events.ts` `runOne`, `shiftHost`).
