# Misc fixes implementation plan (2026-11-20)

Source: the requirements agreed in the session of 2026-11-20 (R1 to R5 below). Status: in progress. Phase 4 has one product gate: the user picks a mockup.

## Progress

| Phase | Status | Pull request | Notes |
| --- | --- | --- | --- |
| 1 | ✅ Done | Penguin-Pants/HandfullOfBandits#137 | CI green, Codex review clean. See "Phase 1 outcome" |
| 2 | ✅ Done | Penguin-Pants/HandfullOfBandits#138 | CI green, Codex review clean. See "Phase 2 outcome" |
| 3 | ✅ Done | Penguin-Pants/HandfullOfBandits#139 | See "Phase 3 outcome" |
| 4 | Next | – | Start here. Gate: build the mockup page, then the user picks a variant. Node 24 is required (`sim/package.json` engines) |
| 5 | Not started | – | – |
| 6 | Not started | – | – |

## Requirements (source of truth)

Requirement IDs come from the requirements response. Acceptance criteria (AC) IDs are new. Each AC restates one confirmed requirement or edge case as a check.

| ID | Requirement |
| --- | --- |
| R1.1 | Pause between bot actions. Default 1.5 s |
| R1.2 | Play-screen control: Slow, Normal, Fast, Pause. Saved in localStorage |
| R1.3 | Animate each bot action so its changes are visible |
| R1.4 | Undo and errors keep working |
| R2.1 | The PKK can build Guerrilla Redeploy routes in the panel |
| R2.2 | Legal destinations follow `sim/src/engine/coin/propaganda/redeploy.ts:35` |
| R2.3 | A failing UI test reproduces the defect first |
| R3.1 | March: B's own 2 pieces move to C while A's 2 pieces stop in B. This is legal |
| R3.2 | A space that pieces enter or leave counts as changed |
| R3.3 | Regression test for the A, B and C case |
| R4.1 | "State X/Y" and "PKK X/Y" are always visible |
| R4.2 | One static HTML mockup page with 3 variants. The user picks one |
| R4.3 | The collapsible victory track stays |
| R5.1 | README top: the game, the COIN series, install, setup and play. Links to the tester docs |
| R5.2 | Developer sections stay below, trimmed |

| AC | Check |
| --- | --- |
| AC1.1 | With Normal speed, the next `botStep` request is sent 1.5 s or more after the previous bot action loads |
| AC1.2 | Slow, Normal and Fast use different delays. The choice survives a page reload |
| AC1.3 | With Pause, no `botStep` request is sent. Resume sends one |
| AC1.4 | During the delay, the board shows the last bot action's moves as arrows and its changed spaces as outlines |
| AC1.5 | Undo during a delay cancels the pending bot step. No `botStep` is sent for the old head |
| AC1.6 | A speed change during a delay applies to the next delay |
| AC1.7 | A `botStep` error stops pacing and shows the current bot error text |
| AC1.8 | With `prefers-reduced-motion`, there is no motion animation. The arrows and outlines still show |
| AC2.1 | A human PKK (hotseat or with a State bot) can add a Guerrilla route with map selections and commit it |
| AC2.2 | The committed command holds `guerrilla: [{from, to, count}]` |
| AC2.3 | An illegal Guerrilla route shows the server violation message (`redeployWhere`) |
| AC2.4 | A Restricted destination shows its Resource cost before commit (`redeploy.ts:56`) |
| AC3.1 | A March with A to B (2) and B to C (2), on 2 Guerrillas in each of A, B and C, has no `locationNoEffect` violation |
| AC3.2 | A March location where nothing moves and nothing changes still gets `locationNoEffect` (`pkk-ops.test.ts:57` stays green) |
| AC3.3 | The same rule applies to free March from an Event (`sim/src/engine/coin/events.ts:269`) |
| AC4.1 | Both X/Y values show on the Play screen with no click, at every phase |
| AC4.2 | A missing threshold shows as "X/–". A score above Y still shows |
| AC4.3 | The "Victory track" details element is still present |
| AC5.1 | The README has, in this order: game, COIN series, install, setup, play, development |
| AC5.2 | Each command in the README matches a Makefile target or npm script |

## Repository evidence

- **Bot loop:** a `useEffect` calls `api.botStep` as soon as `data` changes (`sim/src/ui/play/Play.tsx:152-171`). It is guarded by `stepped` (one request per head) and `undoing`.
- **Change display:** `changedSpaces(prev, next)` already outlines changed spaces (`Play.tsx:39`, `Play.tsx:134`, dashed outline in `sim/src/ui/board/Board.tsx:143`). `Board` already draws move arrows from an `arrows` prop (`Board.tsx:86`, `Board.tsx:406`).
- **Move data:** each piece move logs `EffectApplied` with `{effect: "movePieces", from, to, count}` (`sim/src/engine/core/effects/move-pieces.ts:26`). History items carry these entries (`sim/src/ui/api.ts:51-57`, `HistoryEntry` in `sim/src/server/service.ts:50`).
- **localStorage pattern:** `SIGNAL_SETTING` in `sim/src/ui/propaganda/SignalPrompt.tsx:11`.
- **March no-effect defect:** `unchangedLocations` compares only the canonical JSON of each space before and after (`sim/src/engine/coin/ops/no-effect.ts:10-13`). B ends with 2 Guerrillas of the same face, so it reads as unchanged. The engine already moves B's original pieces, not A's arrivals (`sim/src/engine/coin/ops/pkk/march.ts:24-46`, "each piece moves once"). This matches rules: "A moving piece can move only once" (`docs/rules/prototype-rules.md:271`). It has three callers: `choose-operation.ts:154`, `choose-operation.ts:168` and `events.ts:269`.
- **Redeploy UI:** `RedeployForm` (`sim/src/ui/propaganda/RedeployForm.tsx`) has a piece toggle, origin from `selected[0]` and a count stepper. It has no Guerrilla face choice. `PropagandaPanel` gets `selected={plans.faction.op.locations}` (`Play.tsx:355` area), but the map highlights `plan[plan.target].locations` (`Play.tsx:223`). If the target is not `op`, map clicks do not reach the form. This is the leading root-cause candidate (unverified assumption). Phase 2 step 1 verifies it. The current test covers only a State Troops route (`sim/src/ui/propaganda/redeploy.test.tsx`).
- **Scores:** `view.status.scores` and `view.status.thresholds` (`sim/src/server/view.ts:185-186`). The track is in a closed `<details>` (`sim/src/ui/status/StatusBar.tsx:32`).
- **Tests:** vitest with jsdom (`sim/package.json`), `mockApi` (`sim/test/ui/mock-api.ts`) and the bot-seat tests (`sim/src/ui/play/bot-seat.test.tsx`).

## Design decisions

1. **March fix in one helper:** `unchangedLocations` takes the dry run's log entries. A location that is the `from` or `to` of an applied `movePieces` entry counts as changed. All three callers pass `ctx.entries`. No new module and no rule-text change.
2. **Pacing on the client only:** the delay and the speed setting live in `Play.tsx`. No server or API change. The bot stays one request per head.
3. **Animation reuses the arrows and outlines:** during the delay, the `Board` `arrows` prop shows the last bot action's moves (from its history entries), with the existing changed outlines. A CSS fade or pulse is added and switched off under `prefers-reduced-motion`. No piece-sliding engine.
4. **No new dependencies.**
5. **No data, schema or replay migration.** Phase 1 changes legality only, so it allows more commands. Stored sessions replay the same way, because any March that was accepted before is still accepted.

## Phase 1: Legal March through a space whose count does not change

**Goal:** The A, B and C March from R3 is accepted. Real no-effect locations are still refused.

**Requirements covered:** R3.1 to R3.3. AC3.1 to AC3.3.

**Changes**
- `sim/src/engine/coin/ops/no-effect.ts`: `unchangedLocations(before, after, locations, entries)`. A location named as `from` or `to` in an `EffectApplied` `movePieces` entry is changed.
- `sim/src/engine/coin/ops/choose-operation.ts:154` and `:168`: pass `ctx.entries`.
- `sim/src/engine/coin/events.ts:269`: pass `ctx.entries.slice(mark)`.

**Implementation notes**
- Keep the comment that refers to Decision 18 (m-17). Add one line: a space where pieces entered or left changed, even when its count is the same.
- Do not count `EffectSkipped` entries. A skipped move changed nothing.

**Tests** (`sim/src/engine/coin/ops/pkk/pkk-ops.test.ts`)
- Write the AC3.1 case first and confirm that it fails with `locationNoEffect`.
- AC3.2: the existing assertion at line 57 stays green.
- AC3.3: a free March from an Event with the same board, in the events tests next to the other free-action tests.
- A unit test for `unchangedLocations` with and without move entries.

**Acceptance criteria:** AC3.1 to AC3.3 pass. `make check` and `make test` pass.

**Dependencies:** None.

**Phase 1 outcome (done)**
- `unchangedLocations` takes the dry-run log entries. An applied `movePieces` entry between two different spaces marks both spaces as changed. A move with the same origin and destination is not a change (Codex finding on #137: Garrison accepts such a route).
- Callers updated: `choose-operation.ts` (Operation check and replacement probe) and `events.ts` (Event free action).
- Side effect, intended by R3.2: State Sweep and Garrison pass-through moves follow the same rule.
- Tests: `pkk-ops.test.ts` (Operation and Event free March), `no-effect.test.ts` (helper), `state-ops.test.ts` (same-space Garrison is refused). `make test`: 1851 tests pass.

## Phase 2: PKK Guerrilla Redeploy in the panel

**Goal:** A human PKK can redeploy Guerrillas in Propaganda.

**Requirements covered:** R2.1 to R2.3. AC2.1 to AC2.4.

**Changes**
1. Reproduce first. Add failing tests in `sim/src/ui/propaganda/redeploy.test.tsx` (panel level) and `sim/src/ui/play/bot-seat.test.tsx` (Play screen with a State bot and `redeployHead`). Each test selects the map spaces and builds a Guerrilla route.
2. Fix the confirmed root cause. If the cause is the selection mismatch, pass the same `selected` to `PropagandaPanel` that the map uses (`Play.tsx:223`). If the tests show a different cause, fix that cause and record it in the commit message.
3. `sim/src/ui/propaganda/RedeployForm.tsx`: show the server violation for the route (AC2.3). This already comes through `legal.violations` in `PropagandaPanel`. Confirm it and only add code if it does not show. Show the Restricted entry cost (AC2.4) as one line of text when the destination is Restricted.

**Implementation notes**
- No Guerrilla face control unless the reproduction shows it is needed. The engine moves Underground first when no face is given (`redeploy.ts:40`). That is a valid default.
- The server stays the only rule check (the header comment in `RedeployForm.tsx`).
- The Restricted state must come from view data already sent to the client. If no such field exists, add the smallest field to `sim/src/server/view.ts` and its type. Search for an existing host-entry field first.

**Tests:** AC2.1 in hotseat and with a State bot. AC2.2 checks the exact command shape. AC2.3 covers an illegal destination. AC2.4 covers a Restricted destination.

**Acceptance criteria:** AC2.1 to AC2.4 pass. The current Troops test stays green.

**Dependencies:** None. This phase can run in parallel with Phase 1.

**Phase 2 outcome (done)**
- Corrected root cause: the plan's selection-mismatch theory did not reproduce (a Play test with a State bot built a route). The real defect was the panel flow: the destination was the current map selection and "Use ... as origin" copied that same selection, so one space showed as both origin and destination (user report, 2026-11-20).
- `RedeployForm.tsx`: the next map click sets the origin, the click after it sets the destination. "Clear origin" starts over. "Add route" clears both.
- AC2.4: `SpaceView` has `hostEntry` and `hostEntryCost` (`sim/src/server/view.ts`, from `entryToBox` and `march.restrictedExtraCost`). The panel names the Active arrival and the cost for a Restricted Guerrilla destination.
- AC2.3: unchanged; the server violation shows on commit.
- `phases.ts`: the Redeploy guide text describes the click flow.
- Tests: `redeploy.test.tsx` (two-click route, next route and Clear origin, Restricted cost), `bot-seat.test.tsx` (human PKK route after the bot State part). `make test`: 1854 tests pass.

## Phase 3: Paced and animated bot actions

**Goal:** You can follow each bot action on the board.

**Requirements covered:** R1.1 to R1.4. AC1.1 to AC1.8.

**Changes**
- `sim/src/ui/play/Play.tsx`: wrap the `botStep` call in a timer with the chosen delay. Clear it on unmount, on head change, on undo, on branch and when Pause is on.
- New `sim/src/ui/play/BotSpeed.tsx`: a small segmented control (Slow, Normal, Fast, Pause) placed in the existing map tools row (`mapTools`, `Play.tsx` ~275). It shows only when the session has a bot seat. The key `hob.botSpeed` follows the `SIGNAL_SETTING` pattern.
- Delays: Slow 3 s, Normal 1.5 s, Fast 0.5 s. These are normal engineering defaults, not requirements. Only Normal = 1.5 s is confirmed.
- Last bot moves: derive `{from, to, count}[]` from the newest bot history item's `EffectApplied` `movePieces` entries. While no human plan is active, pass them to `Board` `arrows`.
- `sim/src/ui/styles.css`: one keyframe pulse for changed outlines and bot arrows, inside `@media (prefers-reduced-motion: no-preference)`.

**Implementation notes**
- Keep the `stepped` ref guard so there is still one request per head. Put the timer before the request, not after the load.
- The first bot action after a human action also waits. This lets you see your own change land first.
- If a human plan has arrows, the plan arrows win. Bot arrows show only on bot turns or on the human turn right after a bot action, until the first map click.

**Tests** (`sim/src/ui/play/bot-seat.test.tsx`, vitest fake timers)
- AC1.1: no `botStep` before 1.5 s, one after.
- AC1.2: each speed, and a value saved in localStorage is read on mount.
- AC1.3: Pause, then resume.
- AC1.4: arrows render for a mocked bot history item with a move entry.
- AC1.5: undo during the wait sends no stale `botStep`.
- AC1.6: change the speed mid-wait.
- AC1.7: a rejected `botStep` shows the error and starts no new timer.
- AC1.8: a CSS check only. Covered in the Phase 6 review by reading the CSS.

**Acceptance criteria:** AC1.1 to AC1.8 pass. The existing bot-seat tests stay green. Some existing tests may now need timers advanced. Change them only in that way, and never remove an assertion.

**Dependencies:** None in code. Run it after Phase 2, because both edit `Play.tsx`. This avoids conflicts.

**Phase 3 outcome (done)**
- `Play.tsx`: a timer runs before each `botStep`, with the `stepped` guard kept. A new head, a speed change, Pause, a bot error and unmount clear it. Undo and branch skip it. A new head clears an old bot error (review fix: the bot stayed stuck after Undo past an error).
- AC1.6 decision: a speed change during a wait starts that wait again at the new speed.
- New `BotSpeed.tsx`: the control (`hob.botSpeed`) and `botMoves`, which adds up the applied `movePieces` entries per route.
- `Board.tsx`: a `lastMoves` prop ("Last bot moves" group). A human plan or map click hides it. Changed outlines carry a `changed-outline` class.
- `styles.css`: one `bot-pulse` keyframe inside `@media (prefers-reduced-motion: no-preference)` (AC1.8).
- Tests: 16 new in `bot-seat.test.tsx` (fake timers, with a `jest` alias for Testing Library). `make test`: 1870 tests pass.

## Phase 4: Score X/Y display (gated)

**Goal:** Both scores are always visible as X/Y without making the UI busier.

**Requirements covered:** R4.1 to R4.3. AC4.1 to AC4.3.

**Changes**
1. **Mockup (gate):** `docs/ui/score-xy-mockups.html`, one static page with 3 variants of the status bar. Use the real class names and colors from `sim/src/ui/styles.css`.
   - A: two small chips in `status-meta` ("State 12/40", "PKK 8/35").
   - B: the X/Y values put inside the existing `<summary>` text of the victory track ("Victory track · State 12/40 · PKK 8/35").
   - C: a slim two-line badge at the right edge of the status bar, in faction colors.
   - Stop. The user chooses A, B or C.
2. **Build the chosen variant** in `sim/src/ui/status/StatusBar.tsx`, from `view.status.scores` and `view.status.thresholds`.
3. Delete the mockup page after the build. It is a one-time artifact (AGENTS.md Edits 8).

**Implementation notes**
- Find the "sometimes disappears" cause during the build: compare `view.status.thresholds` (scenario-based, `view.ts:186`) with the variant thresholds (`sim/src/package/schema/variant.ts:13`). If a variant threshold is dropped, fix it in this phase (AGENTS.md Edits 3). This is a check, not a new requirement.

**Tests** (`sim/src/ui/status/` test file, or `sim/src/ui/board/board.test.tsx` where StatusBar is tested now)
- AC4.1: X/Y text present for both factions in Operations and Propaganda views.
- AC4.2: a missing threshold gives "X/–". A score above the threshold renders.
- AC4.3: the details element still exists.

**Acceptance criteria:** AC4.1 to AC4.3 pass. The user approved the chosen variant. `make ux` (Playwright viewport checks) passes, or is reported as not run when Playwright is not available.

**Dependencies:** The user's choice of mockup. Otherwise none.

## Phase 5: README for players

**Goal:** A new player can understand, install and play the game from the README.

**Requirements covered:** R5.1 and R5.2. AC5.1 and AC5.2.

**Changes**
- `README.md`: new top sections: About the game, The COIN series, Install (summary plus link to `docs/tester/INSTALL.md`), Setup (scenario and setup variants), Play (summary plus link to `docs/tester/HOW-TO-PLAY.md`). Then Development, with the current developer content trimmed (batch, experiments and regression shortened to command lists).
- Mention the bot speed control (Phase 3) and the score display (Phase 4) in the Play section.

**Implementation notes**
- Use ASD-STE100 style (AGENTS.md Output 01). Do not repeat what the tester docs already say. Link to them instead.
- Describe the COIN series in general terms only, with no copied publisher text. Any claim about the series must cite a source URL or be cut.

**Tests:** AC5.2 is checked by hand against `Makefile` and `sim/package.json`.

**Acceptance criteria:** AC5.1 and AC5.2 are met.

**Dependencies:** Phases 3 and 4, because the README describes their UI.

## Phase 6: Review, validate and ship

**Goal:** The full diff passes the two-pass review and CI.

**Requirements covered:** all, as verification.

**Changes:** only fixes from the review findings.

**Steps**
1. Run `make check` and `make test`. Run `make e2e` and `make ux` if Playwright is available.
2. Run the TWO-PASS REVIEW (AGENTS.md) on the full diff. Report one line per finding.
3. Push to `clawd/gifted-hamilton-y3cd3e` and open a PR.

**Acceptance criteria:** CI is green and each review finding is classified and resolved.

**Dependencies:** Phases 1 to 5.

## Cross-cutting work

| Concern | Owner |
| --- | --- |
| Compatibility: legality only widens, so there is no replay or session migration | Phase 1 |
| Accessibility: the speed control uses `aria-pressed` buttons (the existing pattern). Reduced motion is respected. The X/Y text is real text, not color alone | Phases 3 and 4 |
| Cleanup: delete the mockup page | Phase 4 |
| Documentation: README | Phase 5 |
| Rollback: one commit per phase, so each can be reverted alone | All phases |

## Traceability

| Requirement | Planned phase | Verification |
| --- | --- | --- |
| R1.1 | 3 | AC1.1 test |
| R1.2 | 3 | AC1.2, AC1.3, AC1.6 tests |
| R1.3 | 3 | AC1.4 test, AC1.8 CSS review |
| R1.4 | 3 | AC1.5, AC1.7 tests |
| R2.1 | 2 | AC2.1, AC2.2 tests |
| R2.2 | 2 | AC2.3, AC2.4 tests (server rules) |
| R2.3 | 2 | The failing test is committed before the fix |
| R3.1 | 1 | AC3.1 test |
| R3.2 | 1 | AC3.1, AC3.3 tests and the unit test |
| R3.3 | 1 | AC3.1 test |
| R4.1 | 4 | AC4.1, AC4.2 tests |
| R4.2 | 4 | Mockup page and the user's choice |
| R4.3 | 4 | AC4.3 test |
| R5.1 | 5 | AC5.1 review |
| R5.2 | 5 | AC5.1, AC5.2 review |

## Out of scope and deferred

- **Out of scope:** bot strategy changes, Redeploy rule changes and removing the victory track.
- **Deferred:** a "replay last bot turn" button and bot speed stored on the server.

## Two-pass review of this plan

| Finding | Class | Outcome |
| --- | --- | --- |
| The first draft had a piece-sliding animation engine, which is more than R1.3 needs | Fix | Replaced with the existing arrows and outlines plus a CSS pulse |
| March: an earlier idea checked the plan's `moves` instead of the log entries. That misses Event free March and skipped moves | Fix | Use applied `movePieces` entries for all three callers |
| The Redeploy root cause is not proven | Fix | Phase 2 starts with a reproduction, and the fix depends on its result |
| Phases 2 and 3 both edit `Play.tsx` | Fix | They now run in sequence |
| Exact Slow and Fast delays were not confirmed | Drop | These are normal engineering defaults. Only Normal = 1.5 s is a requirement |
| Score "disappears" root cause is unknown | Fix | Added as a check in Phase 4. No new behavior |
| A Guerrilla face control could be added | Drop | Not required. The engine default is valid |
