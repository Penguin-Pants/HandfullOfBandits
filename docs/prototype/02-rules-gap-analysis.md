# 02 Rules Gap Analysis

Status: planning document. No application code exists.

## 1. Verdict

The research contains enough detail to implement a complete playable two-player game. Confidence: medium.

1. Costs, prerequisites, sequence, income, victory and setup are defined for all four scenarios (05, 06, 09, 10).
2. 15 blocking gap rows remain (one is a confirmation, GAP-B13). All PAs now have a designer decision (13-design-decisions.md, section 2). Each one stops the engine from executing a rule the same way twice. Each gets a provisional rule below, labeled as a prototype assumption (PA).
3. The largest work item is not a gap. It is the encoding of 91 prose event cards into effect data (section 6).

## 2. Severity definitions

| Severity | Meaning |
|---|---|
| Blocking | The engine cannot execute a rule correctly without a decision |
| Important | The engine can execute, but results can be inconsistent or unrealistic |
| Optional | Can be deferred without stopping a complete playthrough |

## 3. Rules for provisional assumptions

1. Each PA has an ID, a scope and the text that it fills.
2. The package marks each PA rule with `provisional: true` and `assumption: PA-nn` (04-game-package-spec.md, section 7).
3. The engine logs every time a PA rule fires. The log entry shows "Prototype assumption PA-nn".
4. The session start screen lists all PAs active in the package.
5. A PA is never presented as a historical finding. The designer accepts or replaces it. Then it moves to 13-design-decisions.md.

## 4. Blocking gaps and provisional rules

| ID | Gap | Source text | Provisional rule (prototype assumption) |
|---|---|---|---|
| GAP-B01 | Choice maker on event text that does not name one | DK-026 S, DK-029 U, DK-084 U, DK-089 U | PA-01 (accepted): The executing faction makes every choice that the card does not assign. CT 5.1 pattern |
| GAP-B02 | Diplomacy direction | 06 s3.3 item 4: "shift the posture one step toward Hostile" and "from Hostile to Aligned with Turkey needs a modified 6 or more" | PA-02 (accepted): Diplomacy moves a posture one step along Host, Tolerant, Restricted, Hostile, Aligned. The step from Hostile to Aligned needs modified 6 or more. Syria has no Aligned step, so Syria at Hostile is no effect |
| GAP-B03 | Modified die rolls outside 1 to 6 | 06 s3.3 | PA-03 (accepted): Use the modified total as is. No automatic success or failure on a natural roll |
| GAP-B04 | Track movement past an end | 06 s5.3 (Europe -1 at 0); 06 s5.4 (shift past Host) | PA-04 (accepted): A track or posture change that passes an end stops at the end. The excess is lost. Legitimacy keeps its own overflow rule (04 s3.2) |
| GAP-B05 | Coerce when a Coercion marker is already present | 06 s4.4 item 3 against 07 s1.2 item 1 | PA-05 (accepted, reorders source steps): Coerce resolves its shift before it places a marker. If a Coercion marker is already present, the existing marker blocks the shift. Activation still happens |
| GAP-B06 | Ambush against Attack step 2 | 06 s5.1: "Activate only one Underground Guerrilla"; 06 s4.3 item 2: "Activate all Guerrillas" | PA-06 (accepted after the S0 playtests): in an Ambush space 06 s5.1 governs. No roll, Activate 1 Underground Guerrilla, remove 1 State piece, no attrition |
| GAP-B07 | Do pieces moved in count for activation? | 06 s2.2 item 2; 06 s2.3 item 3 | PA-07 (accepted): Count pieces in the space after the movement step. CT 3.2.3 pattern |
| GAP-B08 | Assault removal above removable pieces | 06 s2.4 items 2 and 3 | PA-08 (accepted): Unused removals are lost. (The Base rule is already source text, 06 s2.4 item 3) |
| GAP-B09 | Marker supply exhausted | 04 s4 (only Covert has a rule) | PA-09 (accepted): If no marker of the type is available, the placement does not happen. The log records "supply exhausted". For Harm markers the engine also raises a validation warning, because Harm gates depend on them |
| GAP-B10 | Equal margins at a victory check | 09 s3 step 4 (no tie rule); 09 s4 item 5 (final ties) | PA-10 (accepted): Use the final-scoring tie order: lower Harm count, then PKK |
| GAP-B11 | Talks vote with one yes and one no | 07 s7.3 step 2 | PA-11 (replaced): Any no vote ends the ceasefire. Ceasefire goes to None |
| GAP-B12 | Extort selection | 06 s5.2: "In each space with ..." | PA-12 (replaced): The PKK chooses any subset of qualifying spaces and boxes. Each chosen location activates one Guerrilla and gives +1 Resource. This overrides the source text "In each space" |
| GAP-B13 | Random source for hidden and random selections | 05 s6.4 step 5; 07 s10.2 item 2 | PA-13 (accepted): All random selections use the session seeded generator (05-rules-engine-spec.md, section 8). Not a game rule change. Listed so the designer sees it |
| GAP-B14 | Air Mobility with Troops in an external box | 06 s3.1 | PA-14 (accepted): Air Mobility never uses an external box as origin or destination. Troops leave a box only at Redeploy (05 s6.7) |
| GAP-B15 | Event card with undefined target | DK-066 U (no space for "Remove 2 Offices"). DK-053 is not a gap: it applies 07 s10.1, which has a tie order | PA-15 (replaced): The executing faction chooses any 2 Offices to remove. Legitimacy -1 |

## 5. Competing rules (no silent choice)

Designer decisions recorded 2026-10-27. Status per PA is in 13-design-decisions.md, section 2.

| ID | Topic | Option A | Option B | Prototype default |
|---|---|---|---|---|
| GAP-I02 | Syria March at Restricted | 03 s3: Host or Tolerant only | 06 s4.2 and 07 s5.1: Restricted allowed, +1 Resource, group Activates | Accepted as PA-16 (option B). Reason: two chapters agree and 06 is the operation text. Package option `syriaMarchRestricted` |
| GAP-I05 | Scenario A Pivotals | 10 s3: State none, PKK ARGK Formed | 10 s2.3: full campaign list | Accepted as PA-17 (option A). Reason: section 3 is the scenario text. State Pivotals cannot play before C4 anyway |
| ALT-01 | Initiative system | CT track | Ranked choice | CT track. Ranked choice is a Phase 5 option |

## 6. Event card encoding gap

This is the largest gap by work.

1. The deck CSV holds card effects as prose. The engine needs structured effects.
2. Extraction found about 24 effect primitives. Track adjustments cover 129 of 191 card sides (extraction count, medium confidence).
3. About 35 cards need a rule-module hook: 4 Pivotals, 7 structural cards, 5 Capabilities, 7 Momentum cards and about 12 procedure or modifier cards.
4. Each encoded card keeps its prose text and the encoder's name. A validation test compares encoded effects with the prose (09-testing-and-replay.md, section 5).
5. A card that is not encoded is "not playable". Package validation blocks deck building if a pile needs that card. The designer can mark it `excluded` for a session. The session record then lists it.

Severity: blocking for each card that a scenario needs. Not blocking for the engine.

## 7. Important gaps

The engine can run. Results can be odd. The engine logs each case.

| ID | Gap | Source | Engine behavior |
|---|---|---|---|
| GAP-I01 | Leadership never returns to Present | 07 s5.2 | Abroad is permanent. Logged |
| GAP-I03 | Europe saturates at 5 | IR-39; DD-19.7 | No change. Metric tracked per round |
| GAP-I04 | Scenario B State threshold out of reach | IR-37; DD-19.7 | Threshold is a package value. Tune between versions |
| GAP-I06 | Coerce is most efficient PKK action | IR-38 | Action-use metrics per session (06-playtest-data-model.md) |
| GAP-I07 | Emergency Rule has no cost in C1 and C2 | 11 s1.6 | No change. Logged |
| GAP-I08 | State Resources run dry by card 4 | 11 s1.6 | Resource curve exported per round |
| GAP-I09 | Terrain tags and adjacency unverified | 03 s2 note 3, s4 | Map data carries `confidence` fields |
| GAP-I10 | Village Clearance can deny a PKK win at a check | 09 s7.1 | Logged as watch item when it fires before a check |
| GAP-I11 | Cross-Border Sweep has no lasting effect | IR-43 | No change |
| GAP-I12 | Covert summary table says "Hidden Legitimacy 2"; body has no up-front cost | 06 s6 against 06 s3.5 | Follow the body (cost on reveal). The body is the rule text |
| GAP-I13 | Deck chapter says 91 eligible; CSV gives 90 | 08 s1; DK-046 | Use the CSV value |
| GAP-I14 | All values marked [tune] | 03 to 09 | All `[tune]` values are package parameters, never code constants |

## 8. Optional gaps

| ID | Gap | Deferral |
|---|---|---|
| GAP-O01 | Hidden information for two human players | Solo play shows all. A "hide face-down" view toggle is Phase 4 |
| GAP-O02 | MOD-3B and MOD-4A rules | Phase 5 evaluation |
| GAP-O03 | Concept B map | Phase 5 evaluation |
| GAP-O04 | Kurdish place names not verified | Display label only |

## 9. Checklist by required category

| Category | Defined? | Notes |
|---|---|---|
| Action costs | Yes | 06 s6. Ambiguity in Covert table (GAP-I12) |
| Legal action prerequisites | Yes | 06. Ceasefire limits in 07 s7.2 |
| Piece placement limits | Yes | 03 s5. Supply exhaustion PA-09 |
| Movement restrictions | Mostly | PA-14, PA-16 |
| Action resolution sequences | Mostly | PA-05 to PA-08 |
| Event card effects | Prose only | Section 6 |
| Control calculations | Yes | 03 s6 |
| Resource limits | Yes | 0 to 50 |
| Faction eligibility | Yes | 05 s2.4 |
| Scoring thresholds | Yes, [tune] | 09 s2 |
| Victory checks | Yes | PA-10 for ties |
| Turn progression | Yes | 05 s6 |
| Exceptional cases | Partly | PA-04, PA-09 |

## 10. Package validation must detect

1. A rule reference with no definition (error).
2. A rule marked `missing` (error, blocks session start).
3. A rule marked `provisional` (warning, listed at session start).
4. A deck pile that needs an unencoded card (error, unless the session excludes it).
5. Any `[tune]` parameter without a value (error).
6. Competing options with no selected value in the scenario (error).

Next step: read 03-architecture.md.
