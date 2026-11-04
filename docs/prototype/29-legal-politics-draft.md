# 29 Legal Politics: approved text

Status: **approved by the designer 2026-11-04 and built** (P3b-04, [11](11-build-plan.md) section 4; DEC-65). Source: research 07 s6, 05 s6.5, 04 s3.7.

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

- "Closure Case is now in force." then "Legal Space changed from Open to Prosecuted." (built as flag `closureCase`; the approved draft had a placeholder holder here)
- Ban also logs "Successor Offices changed from 0 to 1." and "Closure Case is now off."
- Ban: "Legal Space changed from Prosecuted to Banned.", "Office marker removed from Diyarbakır City (Amed).", "Legitimacy changed from 10 to 8.", "Europe changed from 1 to 2."
- Placement: "Office marker placed in Diyarbakır City (Amed)."

## 3. Resolved points (designer, 2026-11-04)

1. **Offices outside the list** (only Hakkari and Dersim, Pop 1, by Event): line 5 removes them first.
2. **Line 6 in the same phase as line 4:** yes.
3. **Too few eligible spaces in line 2:** place as many as possible; the rest are lost.
4. **Ban with 0 Offices:** the successor still returns with 1 Office.
5. **PKK event-side restriction:** built with the cards in P3b-07.
