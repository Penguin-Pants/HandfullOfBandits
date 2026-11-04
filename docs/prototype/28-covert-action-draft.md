# 28 Covert Action: approved text

Status: **approved by the designer 2026-11-04 and built** (P3b-03, [11](11-build-plan.md) section 4). Source: research 06 s3.5, 05 s6.4 step 5, 09 s3 step 1.

## 1. Rule as it will be built

- **Accompanies:** Garrison or Sweep. From C3. Needs Legitimacy 4 or more.
- **Target:** one space with State Control, Police and at least 1 Underground Guerrilla. The Op does not need to select it (SA, 06 s1 item 3).
- **Effect:** remove 1 Underground Guerrilla (no Activation). Place 1 face-down Covert marker.
- **Refused:** no Covert marker available, or the space holds an Office.
- **Reveal (already built):** Event, Propaganda exposure or final scoring. The marker becomes State Harm and Legitimacy -2. Each unrevealed marker costs the State 2 at each victory check.

## 2. Player-facing strings

### 2.1 Action panel

- **Label:** Covert Action
- **Cost:** 0 Resources. Hidden: Legitimacy 2 when revealed.
- **Summary:** "Covert Killings. With Garrison or Sweep, from C3, at Legitimacy 4 or more. In one space with State Control, Police and an Underground Guerrilla: remove 1 Underground Guerrilla without Activation and place 1 face-down Covert marker. The space need not be one the Operation selected. When the marker is revealed (by Event, Propaganda exposure or final scoring), it becomes State Harm and Legitimacy -2. Each unrevealed marker costs the State 2 at each victory check (06 s3.5, 09 s3)."

### 2.2 Violation messages

| Code | Text |
|---|---|
| `covertCampaign` | Covert Action is available from Campaign C3. |
| `covertLegitimacy` | Covert Action needs Legitimacy 4 or more. Legitimacy is {n}. |
| `covertSpaces` | Select exactly 1 space for Covert Action. |
| `covertWhere` | Covert Action needs State Control, Police and an Underground Guerrilla in the space. |
| `covertOffice` | Covert Action never targets a space with an Office. |
| `covertSupply` | No Covert marker is available. |

### 2.3 Log lines (cause "Covert Action"; shown to both players, designer decision)

1. "1 Underground Guerrilla removed from Botan."
2. "Covert marker placed in Botan."

## 3. Resolved points (designer, 2026-11-04)

1. **Log:** show the Covert marker placement line.
2. **Tone:** the summary opens with "Covert Killings."
3. **Target:** an SA space; the Op need not select it.
4. **Office rule:** "never targets an Office or any non-player marker" (06 s3.5 item 4) means no Covert Action in a space with an Office. The other non-player Legal Politics markers (Closure Case, Successor) never sit in map spaces.
