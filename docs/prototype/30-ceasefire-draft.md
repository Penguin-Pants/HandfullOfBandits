# 30 Ceasefire: draft for designer approval

Status: **draft, five open points** (P3b-05, [11](11-build-plan.md) section 0). No code exists yet. Source: research 07 s7, 09 s5, 05 s4 item 6.

## 1. Rule as it will be built

1. **Declaration (07 s7.1):** from C3, the PKK may Declare Ceasefire as its card action, in the Limited Op box. Ceasefire must be None. Ceasefire to Declared. Europe +1.
2. **Restrictions (07 s7.2):**

| Ceasefire | PKK may not | State may not |
|---|---|---|
| Declared | Attack, Ambush, Strike Collaborators | None. Assault, Village Clearance, Cross-Border or Covert Action places the State Restraint Broken marker |
| Reciprocal Restraint, Talks | Attack, Ambush, Strike Collaborators, Coerce, place a domestic Base | Assault, Village Clearance, Cross-Border, Covert Action |

3. **Breach:** a forbidden action stays legal, with a warning before it is confirmed (05 s4 item 6). It places that faction's Restraint Broken marker and sets Ceasefire to None. PKK breach: Europe -1. State breach (Reciprocal Restraint or Talks only): Legitimacy -2. Free Event actions count.
4. **Ceasefire step (Legal Politics phase, 07 s7.3):**
   1. Declared, no State Restraint Broken marker: the State may accept (to Reciprocal Restraint). If not, the PKK keeps Declared or ends it (None, Europe -1).
   2. Reciprocal Restraint in force since the previous Propaganda round, no breach: each faction votes yes or no to Talks. Two yes: Talks.
   3. Talks in force since the previous Propaganda round, no breach: resolve the Negotiated Outcome.
   4. Either faction may leave Talks (to Reciprocal Restraint) or Reciprocal Restraint (to None). The PKK pays Europe -1 to leave Reciprocal Restraint.
5. **Negotiated Outcome (07 s7.4, 09 s5):** needs Talks through a full Campaign with no breach, Legal Space not Banned and both factions' consent. Concessions: Emergency Rule to Normalizing, Legal Space to Open, the PKK removes half its domestic Guerrillas (round up) to Available. The game ends. Final margins decide the label: "Negotiated outcome favorable to State", "favorable to PKK" or, with a margin difference of 2 or less, "Negotiated outcome, balanced". No Covert penalty if Talks held two full Campaigns.

## 2. Player-facing strings

### 2.1 Action and buttons

- **Declare Ceasefire (PKK card action):** "Declare Ceasefire. From C3, uses the Limited Op box. Ceasefire to Declared and Europe +1. While Declared the PKK may not Attack, Ambush or Strike Collaborators (07 s7.1)."
- **Ceasefire step buttons:** "Accept the ceasefire" (State), "Keep the ceasefire declared" and "End the ceasefire (Europe -1)" (PKK), "Vote yes to Talks" and "Vote no to Talks" (each faction), "Leave Talks" and "Leave Reciprocal Restraint" (each faction), "Accept the Negotiated Outcome" and "Refuse the Negotiated Outcome" (each faction).

### 2.2 Breach warnings (shown before confirm)

- PKK: "This breaks the ceasefire: PKK Restraint Broken, Ceasefire to None, Europe -1."
- State at Declared: "This places the State Restraint Broken marker. The State can no longer accept this ceasefire."
- State at Reciprocal Restraint or Talks: "This breaks the ceasefire: State Restraint Broken, Ceasefire to None, Legitimacy -2."

### 2.3 Violation messages

| Code | Text |
|---|---|
| `ceasefireCampaign` | Declare Ceasefire is available from Campaign C3. |
| `ceasefireActive` | A ceasefire is already in force. |
| `ceasefireBox` | Declare Ceasefire uses the Limited Op box. |

### 2.4 Phase guide addition (Legal Politics "What")

"Then the ceasefire step: the State may accept a declared ceasefire; after a full round of restraint both factions vote on Talks; after a full round of Talks both may accept a Negotiated Outcome, which ends the game."

## 3. Open points for the designer

1. **Talks vote with one no.** Research 07 s7.3 says "Two yes: Talks". PA-11 (any no ends the ceasefire) is marked "replaced" but no replacement text exists. Proposed: one no keeps Reciprocal Restraint.
2. **Secret vote in solo play.** One person plays both sides. Proposed: each faction votes in turn on screen, State first, as GAP-O01 (solo play shows all).
3. **"A full Campaign" of Talks.** Proposed: Talks was in force at the previous Propaganda round's ceasefire step with no breach since. This is the same test as step 3.
4. **Refused Negotiated Outcome.** "Talks continues or ends at that faction's choice." Proposed: ending goes to Reciprocal Restraint, as for leaving Talks in step 4.
5. **Choice order in the ceasefire step.** Proposed: State first, then PKK, at each sub-step.
