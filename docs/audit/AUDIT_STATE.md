# Audit state: A Handful of Bandits rules audit

Started: 2026-11-11. Branch: `clawd/admiring-einstein-kmwmvh`. Base commit: `7d05919`.

## Phase status

All seven phases are complete (2026-11-12).

| Phase | Status | Output |
|:--|:--|:--|
| 0. Find sources | Done | This file |
| 1. Inventory | Done | `AUDIT_REPORT.md`, Appendix |
| 2. Contradictions | Done | `AUDIT_REPORT.md` sections 2 to 4 |
| 3. Gaps | Done | `AUDIT_REPORT.md` sections 2 to 4 |
| 4. Ambiguities | Done | `AUDIT_REPORT.md` sections 3 and 4 |
| 5. Rules vs prototype | Done (source read, engine not run) | `AUDIT_REPORT.md` sections 3 and 4 |
| 6. Structure check | Done | `AUDIT_REPORT.md` section 7 |
| 7. History flags | Done (3 web searches, project audit files) | `AUDIT_REPORT.md` section 5 |

Result: 1 Blocker, 12 Major, 27 Minor. Decisions for the designer: `OPEN_QUESTIONS.md`. Test states: `TEST_SCENARIOS.md`.

## Sources found

**Draft rules (audit target)**

- `docs/rules/prototype-rules.md`: the rules, edition "Full game, Playable prototype, R4", dated 8 November 2026. Sections 1.0 to 10.8.
- `docs/rules/prototype-notes.md`: Appendix B (edition boundary, precedence, known differences).
- `docs/rules/prototype-card-reference.md`: Appendix A, generated C1 and C2 card text only.
- `docs/rules/review.md`: earlier two-pass reviews of the rules text.
- `docs/rules/handful-of-bandits-rules-a4.pdf`: stale PDF (review.md says it was not rebuilt after the full-game revision). Not audited.
- `docs/handouts/pkk-handout.html`, `docs/handouts/turkish-state-handout.html`: player handouts.
- `docs/tester/HOW-TO-PLAY.md`: tester guide.

**Prototype (data and code)**

- `game-packages/kurdish-coin/0.1.0/`: package data. `parameters.yaml`, `map.yaml`, `pieces.yaml`, `markers.yaml`, `tracks.yaml`, `victory.yaml`, `sequence.yaml`, `assumptions.yaml`, `scenarios/*.yaml`, `cards/c1.yaml` to `c5.yaml`, `cards/pivotal.yaml`.
- `game-packages/kurdish-coin/0.1.0/rules.yaml`: generated copy of the research chapters. Not a rules source.
- `sim/src/engine/coin/`: rules engine (sequence, operations, special activities, events, Propaganda, victory).
- `sim/src/engine/core/`: effect primitives.

**Design history (context, not audit target)**

- `research/research-final/package-b-coin-design/01` to `13`: research design chapters.
- `research/research-final/project-management/design-decisions.md`: DD register.
- `docs/prototype/13-design-decisions.md`: DEC register. `docs/prototype/27` to `34`: approved texts for later systems and cards.
- `docs/prototype/02-rules-gap-analysis.md`: earlier gap list (GAP and PA numbers).
- `playtestresults.md`, `docs/prototype/23-scenario-a-automated-playtest-report.md`: playtest results.

**Structural references**

- `Penguin-Pants/COIN_Research` was not local. It was attached to the session and cloned (read only) to `/home/user/coin_research`, commit `b0e7c64`.
- Used: `research/rules/md/` (rulebooks) and `research/analysis/` (common system, variation matrix, Colonial Twilight notes). Used for structure and terms only. No text copied.

## Assumptions

1. The audit target is `docs/rules/prototype-rules.md` plus its two appendices. Where the rules send the reader to the card package (C3 to C5 card text), the card YAML text is part of the rules.
2. The prototype is the package data plus `sim/src/engine`. The UI is out of scope except where it adds or removes a rule choice.
3. The request said to use COIN_Research "if available locally". It was not local. Attaching it read only is treated as in scope, because the structure check needs it. No file in that repo was changed.
4. "Do not edit the rules or the prototype" includes generated files. Nothing outside `docs/audit/` is written.
5. Documented, intentional differences (Appendix B.3) are still reported when they leave a rule question open. They are marked as known.
6. Balance is out of scope. A balance worry gets one line and is deferred to bot playtests.
7. Severity: Blocker = play cannot continue by the written rules, or a victory or end condition cannot work as written. Major = two players can reach different game states from the same text, or the rules and the prototype differ in outcome. Minor = wording, dead text or cosmetic differences.
8. Repository privacy: see the push log below.

## Push log

- ⚠️ 2026-11-12: the privacy check did not pass. `gh repo view --json visibility` is blocked in this session (GraphQL returns HTTP 403). The REST search `gh api -X GET search/repositories -f q='repo:Penguin-Pants/HandfullOfBandits'` returned `"private": false, "visibility": "public"`.
- First action: the audit files were committed locally on `clawd/admiring-einstein-kmwmvh`. No push.
- 2026-11-12, later: the designer was told that the repository reports as public and answered "Push". The branch was then pushed and a pull request was opened.

## Resume notes

- Nothing is left to do in the audit. The next step is the designer's answers in `OPEN_QUESTIONS.md`.
- Not done, by scope: the engine and its tests were not run, the PDF and the HTML handouts were not audited, and most C2 to C5 card dates were not checked again.
- Engine files read: all of `sim/src/engine/coin/` (non-test files) and the effect primitives used by the findings in `sim/src/engine/core/effects/`.
- Card files read: `cards/c1.yaml` to `c5.yaml` and `cards/pivotal.yaml` (text of every side, mandatory flags, chains, executors).
- Setup arithmetic was checked by script for all four scenarios: piece totals, scores, Harm counts and Control. No mismatch.
