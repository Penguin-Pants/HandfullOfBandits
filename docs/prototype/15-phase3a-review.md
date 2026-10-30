# Phase 3a TWO-PASS REVIEW

Status: implementation review complete against base `711ce32`. Draft PR [#32](https://github.com/Penguin-Pants/HandfullOfBandits/pull/32) now requires integration of the newer DD-20 changes in main ([#31](https://github.com/Penguin-Pants/HandfullOfBandits/pull/31)) and validation again before it is ready to merge. P3a-01 to P3a-10 are implemented. The phase exit remains open for IC-3a, the designer's own Scenario A UI playthrough and notes export. Automated browser play is recorded separately and does not close that checkpoint.

Review scope: the complete Phase 3a diff, including P3a-08 in `acb2428` and the remaining Scenario A implementation. Passes ran after local tests passed. Fixes were reproduced and checked again. Confidence in the verified fixes: high.

## Pass 1: correctness

Traced each changed runtime function from its caller: UI and HTTP commands into session validation, saved Operation continuation into its existing action transaction, replay and undo, card reveal through Always and Pivotal windows, Propaganda through Reset and the next reveal, card effects into core primitives and batch policies into engine validation. Checked error branches, stale requests, empty selections, supply, posture caps, first and final rounds and paired seeds. Compared card effects with the deck CSV and research 05 to 10. Card prose still matches the CSV exactly.

| Class | Finding | Verification and outcome |
|---|---|---|
| Fix | Reset revealed the next card before ending the old phase and changed the new card's step | The order assertion failed (`9 < 8`). Reset now ends before reveal; next-card step is zero |
| Fix | Continued action IDs allowed stale-tab requests against a newer state | The stale request did not throw. Submit and undo check state hashes; the UI sends them. Resume, replay and undo retain one action boundary |
| Fix | Individual-piece selection accepted an unknown piece face | Loader regression failed (`true` instead of `false`). Reused the existing piece-face validator |
| Fix | Free Strike Collaborators still charged Resources | Regression failed (`4` instead of `5`). Cost and execution respect `free` |
| Fix | Pass-only detection missed Capability and Momentum Events | A legal Capability at zero Resources returned `false`. The Event types now match the execution handler |
| Fix | Sanctuary policy treated Europe as a camp | Closed-host regression selected Europe instead of the fallback. Camp candidates now use the host-box registry |
| Fix | Early-victory rounds lacked metrics and could inherit prior-round income | Regressions found zero winning-round entries and stale income `19,4` instead of `0,0`. The Propaganda pipeline now logs the winning round with zero income before Resources. Removed the batch workaround |
| Fix | P3a-08 backup collisions, multiline Markdown notes and FTS result ordering | Its earlier review reproduced each defect and added passing regressions. The complete suite still covers all three |
| Decide resolved | Reset and Host Pressure interruptions | DEC-53 flips every Guerrilla at Reset. DEC-54 and DEC-56 retain the Host Pressure roll and paid cost, then replan Rally or March |
| Decide resolved | ARGK and Guard Abuse scope | DEC-55 flips at every PKK Base, including zero-placement plays. DEC-57 applies Guard Abuse once in every qualifying space. Regressions cover both |
| Decide resolved | Batch seat swapping | DEC-58 swaps each policy between factions, uses its legal scripted fallback as the other faction and pairs seeds |
| Drop | Repeated First Eligible Event streak | Research 05 s2.4 keeps First Eligible after an Event. The sessions do not prove a defect |
| Drop | Multi-step Syria posture effect might reach Aligned | The Syria ordinal track already ends at Hostile. The PA-02 edge-case test passes without a new fix |
| Propose | Severe win-rate screen | PKK won 9/10 in the concentration/sanctuary screen. Carry the flag into Phase 4 and the designer playtest. No rules value or balance fix was invented |

The map has 18 polygons and all and only the 25 research borders. A temporary geometry check also found no area overlaps. Integer coordinates plus a scale preserve canonical package hashing. The SVG was rendered and inspected at 1366 × 768. Linux execution is verified. Windows execution is not available here; paths use Node path and file-URL helpers.

The automated browser flow creates Scenario A through Home, plays both rounds through the session API, resumes the saved game, shows the result and saves and exports a UI note with both round metrics. Test corrections used the existing Home/Resume flow and the documented export field `propaganda_round`; no app navigation behavior changed.

## Card text review batches

The planned encoding review size was kept at five cards or fewer. The implementation was validated as a complete phase diff. It is now in draft PR #32, pending the main-branch integration noted above.

| Batch | Cards |
|---|---|
| 1 | DK-004, 006, 007, 009, 010 |
| 2 | DK-011, 013, 015, 017, 018 |
| 3 | DK-019, 020, 021, 022, 023 |
| 4 | DK-024, 025, 026, 027, 028 |
| 5 | DK-029, 030, 031, 032, 033 |
| 6 | DK-034, 035 |

There are fixtures for both sides of all 33 dual-use C1/C2 cards: the existing 16 S0 fixtures plus 50 new side fixtures. ARGK has separate window, allocation, flip, decline, responder and eligibility tests. Always lines and per-card free-action constraints are covered. New encodings are marked reviewed against the text. Full-campaign V-ENCODE blocks for later Campaigns and Pivotals remain expected.

## Pass 2: simplicity

Reused core effects, the event runner, form metadata, the plan reducer, action rows and replay commands. A saved Operation appends its reply to the existing action instead of creating a second undo boundary. March and Redeploy share host entry checks. Modifier values remain package data. Individual-piece selection reuses count and space questions; automatic every-space effects reuse `forEachSpace`. Removed the batch metrics workaround and the redundant Operation validation view in policy decision routing. Unchanged C1 blocks retain their formatting. No new runtime dependency was added; temporary scripts were kept outside the repository.

## Acceptance and validation

All P3a task acceptance criteria are covered by implementation and local checks. Scenario A uses the full campaign setup, C1/C2 only and the PKK ARGK hand. It completes at round two, passes V-ENCODE and has a CLI-verified golden replay. Schema 2 packages and the previous schema 1 packages load. S0 and Scenario A goldens reflect the deliberate R2 package content changes.

Final validation: 62 files and 799 tests passed. Static checks and targeted regressions passed after the last cleanup. Scenario A CLI replay is identical across 65 commands. The tested package is R2, hash `3befb6091727ff7bf48a58ff6babda0312f5ade226d6da8d3b2515d4fbab2cb9`. The command results are also recorded in `11-build-plan.md`. The UI build and S0 plus Scenario A browser smokes pass with installed Chromium through a temporary launcher because the Playwright-managed browser is absent. Required child-process tests run outside the restricted child-process sandbox.

| Paired screen, seeds 0 to 4 | State wins | PKK wins | Outcome |
|---|---:|---:|---|
| concentration / sanctuary | 1/10 | 9/10 | PKK flagged for review |
| civic-action / concealment | 5/10 | 5/10 | No win-rate flag |
| emergency-rule / coerce-only | 3/10 | 7/10 | No win-rate flag |

Actual round CSVs are in `phase3a-results/`. Policies are small legal-choice screens and use fallbacks after faction swaps. These results do not establish game balance. IC-3a remains the only phase checkpoint not completed; Phase 3b must wait for it.
