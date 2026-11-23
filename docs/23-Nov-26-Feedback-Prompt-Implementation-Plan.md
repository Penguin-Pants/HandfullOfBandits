# Feedback prompt implementation plan (2026-11-23)

Source: the feature request of 2026-11-23 (R1 to R6 below). Status: approved. The user decided D1 and D2 on 2026-11-23 (see "Decisions").

## Goal

While playing, the user writes one feedback note. The app turns it into one Markdown prompt. The prompt holds everything a new Claude Code session needs to find, reproduce and fix the problem. The user copies or downloads it and pastes it into a session.

## Progress

| Phase | Status | Pull request | Notes |
| --- | --- | --- | --- |
| 1 | Review done | [#147](https://github.com/Penguin-Pants/HandfullOfBandits/pull/147) | Prompt builder (server, pure). Review done. Waiting for the go-ahead for Phase 2 |
| 2 | Not started | – | Client diagnostics buffer |
| 3 | Not started | – | UI: "Report to Claude" in the note bar |
| 4 | Not started | – | Reproduction check and docs |

## Requirements (source of truth)

| ID | Requirement |
| --- | --- |
| R1 | Give feedback at any moment in play, with no need to stop the game |
| R2 | The output is one prompt for a Claude Code session |
| R3 | The prompt holds the game state: scenario, seed, Campaign, round, card, phase, active faction, tracks and scores |
| R4 | The prompt holds who plays each side (human or bot ID) |
| R5 | The prompt holds debug data: recent log entries, recent commands, validation results, client errors, app and code versions |
| R6 | The prompt holds enough data to reproduce the state in a fresh checkout |

| AC | Check |
| --- | --- |
| AC1.1 | From the Play screen, one key or one Game menu item opens the feedback form. The game state does not change (T-ANN-04 applies) |
| AC1.2 | Saving the form also saves a normal note, so it shows in Review and in exports |
| AC2.1 | The prompt starts with the user's text, then a task line: "Find the root cause, write a failing test, fix it" |
| AC2.2 | The prompt names the repository, the commit (code fingerprint) and the rule files to read (`docs/rules/prototype-rules.md`, `AGENTS.md`) |
| AC3.1 | The prompt shows Campaign, Propaganda round, card ID and title, phase, eligibility, Resources, Legitimacy, Europe, Legal Space, Ceasefire, scores, thresholds and Harm counts |
| AC3.2 | The prompt shows the space the user selected, with its pieces, markers, level and Control |
| AC4.1 | The prompt shows a seat table: State and PKK, each "human" or the bot player ID |
| AC4.2 | When the note is on a bot action, the prompt holds that bot's decision record (`store/repos/bot-decisions.ts`) |
| AC5.1 | The prompt holds the last N log entries (default 30) with rule refs, and the last N commands with validation results |
| AC5.2 | The prompt holds the last client errors (failed API calls and uncaught errors, default 10) |
| AC6.1 | The prompt holds a replay record that `sim replay <file.json>` accepts. Replaying it gives the same state hash as the note's state hash |
| AC6.2 | The prompt states the replay command and the expected state hash |
| AC6.3 | A prompt above the size limit (D2) moves the replay record to a separate file and says so |

## Existing parts to reuse (Edits 5)

| Part | File | Use |
| --- | --- | --- |
| Note bar (`N` key, Game menu) | `sim/src/ui/notes/NoteBar.tsx` | Add the "Report to Claude" action here. No new form |
| Note context builder | `sim/src/annotate/context.ts`, `sim/src/server/service.ts:605` | Source of state, action, rule refs and legal choices |
| Markdown export helpers | `sim/src/export/markdown.ts` | Reuse `changes()` and escaping for state diffs |
| Session export | `sim/src/server/app.ts:152` | Session, package and action data |
| Replay | `sim/src/cli/replay.ts` | Reproduction path for AC6.1 |
| Code fingerprint | `sim/src/package/fingerprint.ts` | Code version in AC2.2 |
| Seats | `sim/src/store/repos/sessions.ts:20` | Seat table in AC4.1 |

## Phases

### Phase 1: prompt builder (server, pure)

1. Add `sim/src/export/feedback-prompt.ts`. Input: a saved annotation row, the session export and a client diagnostics object. Output: one Markdown string.
2. Add `POST /api/sessions/:id/feedback`. It calls `service.annotate()` with a `feedback` category, then builds the prompt. It returns `{ annotationId, prompt }`.
3. Tests first: one test per AC2 to AC5 item, on a fixture session.

### Phase 2: client diagnostics buffer

1. Add a ring buffer in `sim/src/ui/api.ts`: failed requests (method, path, status, message) and `window.onerror` and `unhandledrejection` events. Max 10 entries. In memory only.
2. The feedback call sends the buffer. No other code reads it.
3. Tests: a failed `botStep` call shows in the buffer. The buffer drops the oldest entry past 10.

### Phase 3: UI

1. The note bar gets a "Report to Claude" button next to Save (keyboard: Ctrl+Enter).
2. On success, a dialog shows the prompt with "Copy" and "Download .md" buttons.
3. Tests: AC1.1 and AC1.2 in `sim/src/ui/notes/notes.test.tsx`.

### Phase 4: reproduction check and docs

1. Integration test: play a seeded session to a known state, build the prompt, take out the replay record, run `replayFile`, compare the hash (AC6.1).
2. Add a short "Report a problem" section to the tester docs (`docs/tester`).

## Decisions

| ID | Question | Decision |
| --- | --- | --- |
| D1 | Does the user copy the prompt by hand, or does the app open a GitHub issue with it? | ✅ Copy and download only. No GitHub issue: that needs a token in the app and makes the game state public |
| D2 | Size limit before the replay record moves to a separate file? | ✅ 60 KB. Above it, the replay record goes to a separate .json file |

## Risks

1. ⚠️ The prompt is useless if the commit in the prompt is not on GitHub. The prompt must say "Check out commit X" and warn when the working tree had local changes (`codeFingerprint` differs from the fingerprint of the commit). Confidence: medium. Needs a check of how `fingerprint.ts` reads the tree.
2. Client errors can include file paths from the user's computer. Keep only the path part of API URLs and the error message.

## Phase 1 review (2026-11-23)

| Finding | Class | Outcome |
| --- | --- | --- |
| F1: a note on a past action read the selected space and seats from that action's state, not the head state of the game state section | Fix | ✅ Reads `context.state_hash`. Test in `sim/src/export/feedback-prompt.test.ts` |
| F4: a limit of 0 showed every row (`slice(-0)`) | Fix | ✅ `last()` helper. Test added |
| F6: no warning when git could not read the commit | Fix | ✅ Warning line. Test added |
| Pass 2: client error kinds copied in `app.ts`; message cleanup written twice | Fix | ✅ `CLIENT_ERROR_KINDS` shared; one cleanup |
| Export with states is too heavy for each feedback call | Drop | Full campaign (158 commands): 3.3 MB, 46 ms |
| Backticks in log data break inline code | Drop | No engine message holds a backtick (grep) |
| Codex P2: the feedback route dropped a proposed command (`NoteBar.tsx:80-82` sends it) | Fix | ✅ Route forwards `proposed`; prompt shows a Proposed command section. Test in `sim/test/feedback.test.ts` |
| AC6.1 to AC6.3 (replay record in the prompt) are in no phase. Phase 4 assumes the prompt already holds the record. Also `replayFile` (`sim/src/cli/replay.ts:19`) ignores session options, so a session with options does not replay from a PlayRecord file | Decide | Open: which phase adds the replay record |

## Resume here

Phase 1 is complete on branch `feedback-prompt-phase-1` ([#147](https://github.com/Penguin-Pants/HandfullOfBandits/pull/147)): `sim/src/export/feedback-prompt.ts` builds the prompt (AC2.1 to AC5.2, Risk 1 and Risk 2), migration 5 (`sim/src/store/feedback.sql`) seeds the `feedback` category and `POST /api/sessions/:id/feedback` in `sim/src/server/app.ts` returns `{ annotationId, prompt }`. The two-pass review is done and every Fix finding is pushed with a test. `make test` is green (1908 tests, Node 24). Next: wait for the user's go-ahead, then start Phase 2 (client diagnostics buffer in `sim/src/ui/api.ts`) on a new branch `feedback-prompt-phase-2`. Open decision before Phase 4: which phase adds the replay record (AC6.1 to AC6.3) to the prompt.
