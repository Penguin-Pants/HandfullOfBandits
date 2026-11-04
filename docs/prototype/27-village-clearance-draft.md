# 27 Village Clearance: approved text

Status: **approved by the designer 2026-11-04 and built** (P3b-02, [11](11-build-plan.md) section 4). Decisions: DEC-63 (condition 2) and PA-18 (blocked shift). Source: research 06 s3.4, 07 s3, 07 s8, 09 s7.1.

## 1. Rule as it will be built

**Accompanies:** Sweep or Garrison. Action ID `state.village-clearance` (already in `HARMFUL_ACTIONS`).

**Conditions, all required** (06 s3.4):

1. Emergency Rule is OHAL or OHAL Extended Powers.
2. The OHAL Powers event was played (flag `ohalPowers`), or the Campaign is C3 or later.
3. Target: one Mountain or Plain space that the Op selected. State Control, at least 1 Troop and 1 Police. Neutral or Opposition. No Displacement marker.
4. Legitimacy is at least (2 x target Pop) + 1.

**Effects, in this order:**

1. Shift the space one level toward Neutral (no shift if Neutral).
2. Legitimacy -2 x Pop.
3. Place a Displacement marker, New side.
4. Place a State Harm marker.
5. Place a Reception marker in Diyarbakır City or Western Cities (State choice). If no Reception marker is available: Legitimacy -1 instead.
6. Activate all Guerrillas in the space.
7. If the space holds an Office: Legitimacy -1.

The space keeps its Pop. Existing code already applies the Displacement Rally, Extort and Coerce block, the Propaganda drain and Return.

## 2. Player-facing strings

### 2.1 Action panel (`server/forms.ts`)

- **Label:** Village Clearance
- **Cost:** Legitimacy 2 x Pop
- **Summary:** "Forced evacuation of a village area. With Sweep or Garrison, at OHAL or OHAL Extended Powers, from C3 or after OHAL Powers. In one selected Mountain or Plain space with State Control, Troops and Police, at Neutral or Opposition and with no Displacement marker: shift 1 level toward Neutral, Legitimacy -2 x Pop, place Displacement (New) and State Harm, place Reception in Diyarbakır City or Western Cities and Activate all Guerrillas. An Office there costs Legitimacy 1 more. The space keeps its Pop. New Displacement costs Legitimacy 1 at the next Propaganda round (06 s3.4)."
- **Field:** Reception space (select: Diyarbakır City, Western Cities).

### 2.2 Violation messages

| Code | Text |
|---|---|
| `clearanceStep` | Village Clearance: Emergency Rule is {step}. Needs OHAL or OHAL Extended Powers (06 s3.4 condition 1). |
| `clearancePowers` | Village Clearance needs the OHAL Powers event or Campaign C3 or later (06 s3.4 condition 2). |
| `clearanceSpaces` | Select exactly 1 space for Village Clearance. |
| `clearanceOpSpace` | Village Clearance must target a space that the Sweep or Garrison selected. |
| `clearanceTerrain` | Village Clearance targets a Mountain or Plain space only. |
| `clearanceWhere` | Village Clearance needs State Control, Troops and Police in the space. |
| `clearanceLevel` | Village Clearance needs a Neutral or Opposition space. |
| `clearanceDisplaced` | This space already has a Displacement marker. |
| `clearanceLegitimacy` | Village Clearance needs Legitimacy {2 x Pop + 1} or more. Legitimacy is {n}. |
| `clearanceReception` | Place Reception in Diyarbakır City or Western Cities. |

### 2.3 Log lines (existing generic text, cause "Village Clearance")

1. "Hakkari shifted from Passive Opposition to Neutral."
2. "Legitimacy changed from 10 to 8."
3. "Displacement (New) marker placed in Hakkari."
4. "State Harm marker placed in Hakkari."
5. "Reception marker placed in Diyarbakır City (Amed)." or "Legitimacy changed from 8 to 7."
6. "2 Guerrillas in Hakkari flipped from Underground to Active."
7. "Legitimacy changed from 7 to 6."

## 3. Resolved points

1. **OHAL Powers card:** none exists. Keep flag `ohalPowers` for a later card. Until then Village Clearance is legal only from C3 (DEC-63).
2. **Offices:** no placement until P3b-04. Effect 7 is built and tested now.
3. **Tone:** keep the opening sentence of the summary.
4. **Blocked shift:** an existing State Harm or Coercion marker blocks the effect-1 shift; the other effects apply (PA-18).
