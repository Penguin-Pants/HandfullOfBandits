# Feedback prompt implementation plan (2026-11-23)

Source: the feature request of 2026-11-23 (R1 to R6 below). Status: approved. The user decided D1 and D2 on 2026-11-23 (see "Decisions").

## Goal

While playing, the user writes one feedback note. The app turns it into one Markdown prompt. The prompt holds everything a new Claude Code session needs to find, reproduce and fix the problem. The user copies or downloads it and pastes it into a session.

## Progress

| Phase | Status | Pull request | Notes |
| --- | --- | --- | --- |
| 1 | Merged | [#147](https://github.com/Penguin-Pants/HandfullOfBandits/pull/147) | Prompt builder (server, pure). Review done. Waiting for the go-ahead for Phase 2 |
| 2 | Merged | [#148](https://github.com/Penguin-Pants/HandfullOfBandits/pull/148) | Client diagnostics buffer. Review done. Waiting for the go-ahead for Phase 3 |
| 3 | Merged | [#150](https://github.com/Penguin-Pants/HandfullOfBandits/pull/150) | UI: "Report to Claude" in the note bar. Review done |
| 4 | Merged | [#151](https://github.com/Penguin-Pants/HandfullOfBandits/pull/151) | Replay record, `replayFile` with options and variant, tester docs. Review done |

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

1. Add the replay record to the prompt (AC6.1 to AC6.3, D2, D3): the command and replay hash, and a separate .json file above 60 KB. `replayFile` applies the session options.
2. Integration test: play a seeded session to a known state, build the prompt, take out the replay record, run `replayFile`, compare the hash (AC6.1).
3. Add a short "Report a problem" section to the tester docs (`docs/tester`).

## Decisions

| ID | Question | Decision |
| --- | --- | --- |
| D1 | Does the user copy the prompt by hand, or does the app open a GitHub issue with it? | ✅ Copy and download only. No GitHub issue: that needs a token in the app and makes the game state public |
| D2 | Size limit before the replay record moves to a separate file? | ✅ 60 KB. Above it, the replay record goes to a separate .json file |
| D3 | Which phase adds the replay record (AC6.1 to AC6.3) to the prompt? | ✅ Phase 4 (decided by Claude at the user's request, 2026-11-23). It is server builder work with the reproduction test that proves it; Phase 3 is UI only. Phase 4 also makes `replayFile` apply session options (`sim/src/cli/replay.ts:19`) |

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
| AC6.1 to AC6.3 (replay record in the prompt) are in no phase. Also `replayFile` (`sim/src/cli/replay.ts:19`) ignores session options | Decide | ✅ D3: Phase 4 |

## Phase 2 review (2026-11-23)

| Finding | Class | Outcome |
| --- | --- | --- |
| F1: a rejected fetch (network failure) or a non-JSON error body skipped the buffer | Fix | ✅ `call()` records status 0 or the status text. Test in `sim/src/ui/api.test.ts` |
| The buffer keeps the query string of a request path | Drop | The server keeps only the path (`feedback-prompt.ts` `clientErrors`), and the buffer stays in memory |
| Clear the buffer after a sent report | Drop | Not in the plan; a second report on the same problem keeps its errors |

## Phase 3 review (2026-11-23)

| Finding | Class | Outcome |
| --- | --- | --- |
| F3: opening the note bar again hid the prompt dialog | Fix | ✅ The open bar renders the dialog too. Test in `sim/src/ui/notes/notes.test.tsx` |
| F2: a denied clipboard write failed with no message | Fix | ✅ Status line: "Copied." or "Copy failed. Select the text and copy it." Test added |
| Cmd+Enter on macOS does not report | Drop | The plan names Ctrl+Enter, and Ctrl+Enter works on macOS too |
| Esc does not close the dialog | Drop | The Close button closes it; the note bar keeps Esc |
| Codex: after a failed report, Enter saved a normal note with no prompt | Fix | ✅ Enter retries a failed report as a report. Test in `notes.test.tsx` |
| "Copied." stays after a second report while the dialog is open | Drop | It names the last Copy click; low impact |

## Phase 4 review (2026-11-24)

| Finding | Class | Outcome |
| --- | --- | --- |
| Codex: `replay()` compared a null hash (a command inside a stored action) with the real hash | Fix | ✅ A null hash joins the next step (`sim/src/cli/play.ts`). Test in `sim/test/feedback.test.ts` |
| Codex: `replayFile` ignored the record's session options | Fix | ✅ `withSessionOptions` (`sim/src/cli/replay.ts`). Integration test with `threshold.state` |
| Codex: a session with a setup variant replayed as "differs at step 0" | Fix | ✅ The record holds `variant`; `replayFile` uses `loadVariant`. Integration test with `dd25-variant-a` |
| Codex: the endpoint dropped the separate record | Fix | ✅ Endpoint returns `replay: { file, record }`; dialog has "Download replay .json". Tests in `feedback.test.ts` and `notes.test.tsx` |
| Windows CI: the options test edited `manifest.yaml` with `"options:\n"`, which a CRLF checkout does not match | Fix | ✅ Pattern `\r?\n`; the edit throws on no match |
| F1: `package.hash` in the record had no reader, so a package mismatch gave no cause | Fix | ✅ `replayFile` prints a warning line. Test in `feedback.test.ts` |
| Pass 2: `replayRecord` exported with no outside caller | Fix | ✅ Module-private |
| `ReplayRecord` (export) copies the `PlayRecord` shape (cli) | Drop | The layer rule forbids export to import cli (`sim/eslint/boundaries.js:23`); the integration tests prove the shapes match |
| An action with no commands would drop out of the record | Drop | Only setup has no commands (`sim/src/server/service.ts:376`) |
| The prompt's `sim replay` command | Drop | Checked by hand: `identical (158 commands)` on `test/golden/full-campaign-seed-7.json` |

## Resume here

All four phases are complete and merged ([#147](https://github.com/Penguin-Pants/HandfullOfBandits/pull/147), [#148](https://github.com/Penguin-Pants/HandfullOfBandits/pull/148), [#150](https://github.com/Penguin-Pants/HandfullOfBandits/pull/150), [#151](https://github.com/Penguin-Pants/HandfullOfBandits/pull/151)). Phase 4: the prompt has a "Replay record" section with the `sim replay` command and the expected state hash (AC6.1, AC6.2); above 60 KB the record moves to `replay-<session>.json`, which the endpoint returns and the dialog downloads (AC6.3); `replayFile` applies the record's options and variant and warns on another package hash; `docs/tester/HOW-TO-PLAY.md` section 6 is "Report a problem". The two-pass review is done, all Codex threads are resolved and `make test` is green (1930 tests, Node 24). No work is open in this plan.
