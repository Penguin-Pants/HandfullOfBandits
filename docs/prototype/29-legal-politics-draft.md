# 29 Legal Politics: draft for designer approval

Status: **draft, five open points** (P3b-04 step 3, [11](11-build-plan.md) section 0). No code exists yet. Source: research 07 s6, 05 s6.5, 04 s3.7.

## 1. Rule as it will be built

Legal Politics phase, from C3, skipped while Legal Space is Absent (05 s6.5):

1. **Closure filing (State choice, 07 s6.3):** legal if Legal Space is Open or Prosecuted, 1 or more Offices on the map and no Closure Case marker. Place the Closure Case marker; Legal Space to Prosecuted. No cost.
2. **Procedure table (07 s6.4), lines in order:**
   1. Closure Case marker present at phase start: ban. Legal Space to Banned. Successor marker at the Office count. Remove all Offices. Legitimacy -2. Europe +1. Remove Closure Case. Stop.
   2. Legal Space Banned: Legal Space to Prosecuted. Place Successor - 1 Offices (minimum 1) in line 4 order. Remove Successor. Stop.
   3. Office limit: Open 4, Prosecuted 3 (new parameters, [tune]).
   4. Fewer Offices than the limit: place 1 Office in the first eligible space: Diyarbakır City, Western Cities, Mardin-Batman, Van-Bitlis, Şanlıurfa, Bingöl-Muş, Diyarbakır Rural, Botan, Ağrı, Adıyaman, Elazığ. Eligible: Pop 2 or more, no Office, no PKK Control, not at an Active level.
   5. More Offices than the limit: remove Offices latest in the line 4 order until at the limit.
   6. Offices equal the limit and no Closure Case: the prosecutor files (place Closure Case).
3. **Ceasefire step:** P3b-05.

Acceptance (plan): two runs of the table on the same board give identical Offices.

## 2. Player-facing strings

### 2.1 Phase guide (`ui/propaganda/phases.ts`)

- **Title:** Legal Politics
- **What:** "From C3. The State may file a closure case. Then the procedure table runs by itself: a pending case bans the party, a banned party returns as a successor with fewer Offices, and Offices are placed or removed toward the limit (Open 4, Prosecuted 3). At the limit, the prosecutor files a case."
- **You:** "State: file a closure case, or press Advance."

### 2.2 Violation messages

| Code | Text |
|---|---|
| `closureSpace` | A closure case needs Legal Space Open or Prosecuted. |
| `closureOffice` | A closure case needs at least 1 Office on the map. |
| `closurePending` | A Closure Case marker is already on the track. |

### 2.3 Log lines (existing generic text, cause "Legal Politics phase")

- "Closure Case marker placed in {holder}." then "Legal Space changed from Open to Prosecuted."
- Ban: "Legal Space changed from Prosecuted to Banned.", "Office marker removed from Diyarbakır City (Amed).", "Legitimacy changed from 10 to 8.", "Europe changed from 1 to 2."
- Placement: "Office marker placed in Diyarbakır City (Amed)."

## 3. Open points for the designer

1. **Line 5, Offices outside the list.** An Event can place an Office in a space not on the line 4 list (for example Hakkari or Dersim). When line 5 removes Offices, does such an Office go first, last or never?
2. **Line 6 in the same phase as line 4.** Lines run in order. If line 4 brings the Offices up to the limit, line 6 files a case in the same phase, and line 1 bans at the next round. Accept this, or let line 6 see only the count from the phase start?
3. **Line 2, too few eligible spaces.** If fewer eligible spaces exist than Offices to place, place as many as possible and lose the rest?
4. **Successor at 0.** Events can remove Offices after a filing. A ban with 0 Offices sets Successor 0; line 2 still places 1 Office (minimum 1). Accept?
5. **PKK event restriction (05 s5 item 1)**: the PKK may not execute an Event side that places or resolves a Closure Case, bans the party, removes Offices or moves Legal Space. Build it in P3b-04, or with the cards in P3b-07?
