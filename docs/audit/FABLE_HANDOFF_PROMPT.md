# Prompt for Fable 5.2: finish the Handful of Bandits rules change

Paste everything below the line into a new session on branch `clawd/tender-lamport-rzx5u5`.

---

## Job

Finish the work that follows the designer's decisions for the Handful of Bandits rules audit. The rules text is done and open as PR #100 (Penguin-Pants/HandfullOfBandits). Your job is the engine, data, tests and scenario archive that must match those rules.

## Why

The designer decided 14 open questions (see `docs/audit/OPEN_QUESTIONS.md`, section "Decisions"). The rules in `docs/rules/prototype-rules.md` already say the new behavior. The engine in `sim/` still follows the old behavior. Rules and engine must agree before playtests.

The designer also decided to design and test only the **full game** (five Campaigns) first. Scenarios A, B, C and S0 are archived. One shorter scenario returns later, after the full game is validated.

## Read first

1. `AGENTS.md` (project rules). Follow it exactly: ASD-STE100 writing, `Step X/Y:` first line on multi-turn replies, TDD, two-pass review, no em dashes, no Oxford commas, Makefile targets first.
2. `docs/audit/OPEN_QUESTIONS.md`, section "Decisions".
3. `docs/audit/AUDIT_REPORT.md` for the evidence on each finding.
4. `git diff main...HEAD -- docs` to see the exact rules text change.

## State at hand-off

- Branch: `clawd/tender-lamport-rzx5u5`. PR #100 is open. Codex review: no findings.
- Rules text: done. Engine, data and tests: not changed.
- Test baseline: 109 files, 1522 tests pass in about 72 seconds.
- This machine has Node 22. The repo asks for Node 24. Install with `cd sim && npm ci --engine-strict=false`. Run tests with `npx vitest run` from `sim/`.
- GitHub MCP tools can drop and reconnect. Load them with ToolSearch when needed.

## Work packages (do in this order, one commit each, tests green at each commit)

### WP1. Remove Talks and the Negotiated Outcome

Decision: no negotiated settlement exists. Ceasefires stay (None, Declared, Reciprocal Restraint). Talks, the Talks vote, the Outcome, the removal of Guerrillas and the Covert waiver are gone.

- Engine: `sim/src/engine/coin/propaganda/ceasefire-step.ts` (lines 32-38, 47-52, 81), `propaganda/pipeline.ts` (89-93), `coin/victory.ts` (about 98-107), the `negotiated.waiveCovertRounds` parameter, the `ceasefire` track steps in the package, UI forms and help text, procedures that set Talks.
- Keep: breaches, Restraint Broken markers, Europe effects, gain 7(b), the State acceptance step.
- Tests: delete tests of the Outcome and Talks. Add a test that a ceasefire never ends the game. Add a test that the step list has three steps.

### WP2. Engine and data changes from decisions

| Item | Change | Where to look |
|:--|:--|:--|
| M-03 | One March group = all Guerrillas from one origin to one destination. Merge entries with the same origin and destination before the Activation test. | `coin/ops/pkk/march.ts`, `coin/ops/plan.ts` |
| M-07 | Box follows the action. Op Only needs two or more locations. One location with no Special Activity is a Limited Op. | `coin/ops/choose-operation.ts`, `coin/sequence/ct.ts` |
| M-08 | Legal Politics line 6 also sets Legal Space to Prosecuted. | `coin/propaganda/legal-politics.ts` (about line 160) |
| M-02 | Rename the cap marker to "Europe Ban marker" in data, UI and engine strings. Keep it permanent. | `markers.yaml`, `coin/ops/common.ts`, UI |
| M-05 | Reception blocks every shift toward Support. Add `blocks: [support]`. | `markers.yaml` |
| M-12 | Print the evidence grade for the KDP break date on DK-005. | `cards/c1.yaml` (about line 145) |

Already correct in the engine, so write a test but change no code: M-01 (block until Reset), M-04 (Strike Collaborators before or after), M-06 (PKK Harm blocks Coerce), M-10 (empty Event allowed), M-11 (Rally places what is Available).

For each change: write a failing test first. Prove failure on an assertion, not a compile error. Then write the minimum code.

### WP3. Archive Scenarios A, B, C and S0, including tests

Decision (designer): archive everything, port tests to the full campaign. Do not delete rule coverage.

Facts already measured:

- Full campaign and Scenario A share one start position. S0 also shares it. Differences: campaigns, final round, deck size (S0 uses `pileSize: 8` and `propagandaLast`), and Pivotal lists (A has only DK-015 for the PKK).
- A trial rename of fixture ids to `full-campaign`, with the four YAML files moved out, left 25 of 109 test files failing (60 of 1487 tests). Without the rename, 75 files fail.
- Failing files in the trial include: `test/player-qualification.test.ts`, `test/api.test.ts`, `test/mechanics-a.test.ts`, `test/scenario-a.test.ts`, `test/regression.test.ts`, `test/p2-12.test.ts`, `test/metrics-review.test.ts`, `test/kurdish.test.ts`, `test/ic2a.test.ts`, `src/ui/home/home.test.tsx`, `test/player-observation.test.ts`, `test/full-campaign.test.ts`, `test/event-move-session.test.ts`, `src/engine/coin/propaganda/propaganda.test.ts`, `test/scenarios-bc.test.ts`, `test/package-diff.test.ts`.
- Other references: `test/golden/*.json` (replays), `experiments/runs/*` (recorded run identities), `sim/e2e/*.mjs`, `sim/src/cli/strategies/scenario-a.ts`, `cli/main.ts`, `cli/batch.ts`, `cli/qualification.ts`, `cli/experiment-manifest.ts` (`z.literal("scenario-a")`), `test/board.ts` (S0 fixture), `test/ui/mock-api.ts`.

Steps:

1. Create an archive folder outside the package and outside the test glob, for example `archive/scenarios/` (YAML) and `archive/tests/` (tests that only check A, B or C setups). Add a short README there with the reason and the way to restore.
2. Move the four scenario YAML files. Keep `full-campaign.yaml` as the only scenario.
3. Port fixtures: replace the ids, then triage each failing file one at a time. Rebuild golden replays for the full campaign with a fixed seed. Archive tests that check only A, B or C setup values.
4. Where a test needs a short game, build a small fixture inside the test helper. Do not add a scenario to the package for it. Mock data lives only in tests.
5. Update docs: rules 10.0 to 10.8 (remove Scenarios A to C and S0 text, keep full campaign and the campaign switches), `docs/rules/prototype-notes.md`, `README.md`, `docs/rules/README.md`. Mark the stale PDF in `docs/rules/review.md`.
6. Rule 6.0 still says "round 2 in Scenarios A to C". Fix it.

## Subagents (token cost)

Default to the cheapest adequate model (AGENTS.md). Follow `.agents/skills/shared/SUBAGENT-STEERABILITY.md` if it exists.

| Task | Agent | Model |
|:--|:--|:--|
| Find every reference to a scenario id, marker name or file (read-only search) | Explore | haiku |
| Run the test suite and report only failing file names plus the first assertion message | general-purpose | haiku |
| Triage one failing test file into: rename only, fixture rebuild, archive | general-purpose | sonnet |
| Mechanical edits: id rename, doc text edits, README links | general-purpose | haiku |
| Rebuild golden replays and compare diffs | general-purpose | sonnet |
| Engine changes in WP1 and WP2, two-pass review, final judgment | You | fable |

Rules for subagents:

- Ask the designer before using a downgraded model for engineering work (edits, design, debugging). Mechanical, read-only, git and docs work needs no prompt.
- Give each subagent one file or one question, the exact output format, and a turn limit.
- Verify completion yourself. If a subagent hits the turn limit, retry with a higher limit and report it with a ⚠️.
- Run independent subagents in parallel. Do not paste full test output into your context. Ask for a summary.

## Review and finish

1. After tests pass for a work package, run the TWO-PASS REVIEW from AGENTS.md on that diff. Classify each finding as Fix, Propose, Decide or Drop. Fix defects in the same change, with a test that fails without the fix.
2. Run `make check` and `make test` (from the repo root, with the Node 22 install step above). Report counts.
3. Commit per work package. End commit messages with the attribution lines from the session reminder.
4. Update the PR #100 description: remove "Pending" items that are done, list the new commits. If the diff is large, open a second PR instead and say why.
5. Do not merge or approve.

## Done means

- Every row of the Decisions table in `OPEN_QUESTIONS.md` has matching rules text, engine behavior and a passing test.
- `grep -ri "talks\|negotiated"` in `sim/src`, the package and the rules finds nothing except archive and history files.
- `game-packages/kurdish-coin/0.1.0/scenarios/` holds only `full-campaign.yaml`.
- `make check` and `make test` pass. The test count is lower than 1522 only by archived tests, and you list those by file.
- The PR description matches the diff.

## Do not

- Decide items 15 to 24 of `OPEN_QUESTIONS.md`. They are open. Ask one question at a time if one blocks you.
- Change the rules text for a decided item without asking.
- Skip, disable or quarantine a failing test to get green.
- Use general knowledge for specifics (APIs, versions, history). Cite the file and line.
- Commit one-time scripts. Run them from `/tmp` and delete them.
- Make the repository private. Item 24 needs the designer.

## Report format

One line per work package: status, commit, test counts. Then one next step. State confidence (high, medium, low) on each diagnosis.
