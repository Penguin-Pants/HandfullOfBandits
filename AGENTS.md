Project tier:
Conventions version: 1.0

# AGENTS.md

A Handful of Bandits: a two-player COIN-series board game prototype (State vs PKK, 1984-1999). The repository holds the rules, the card text, the game package data, a local simulator app and playtest records. Project context lives in this file; `docs/project-context.md` does not exist.

## Stack

- Simulator in `sim/`: Node.js 24+, TypeScript 6, React 19, Vite 8, Fastify 5, better-sqlite3, Zod 4, Vitest 5, ESLint 10. Versions: `sim/package.json`.
- Print set: Python 3 with PyYAML and reportlab, Pandoc, XeLaTeX, Liberation fonts (`docs/rules/README.md`).
- CI: `make install`, `make check`, `make test` on Windows only, Node 24 (`.github/workflows/ci.yml`). Write path-safe code: no POSIX-only paths or shell in npm scripts.

## Commands

Run from the repository root. Without Make, run the npm script inside `sim/`.

- `make check`: typecheck and lint. Run before every commit.
- `make test`: all Vitest tests. Run before every commit. Single file: `cd sim && npx vitest run test/<file>.test.ts`.
- `make validate DIR=game-packages/kurdish-coin/0.1.0`: after any package change.
- `make rules DIR=game-packages/kurdish-coin/0.1.0`: after a change in `research/`. Rewrites `rules.yaml`; `make test` fails while it is stale.
- `make schema`: after a change in `sim/src/package/schema/`. Rewrites `game-packages/_schema/`.
- `make print`: after a change to rules, cards, scenario or a print source. `make test` (`sim/test/print-drift.test.ts`) fails until it runs.
- `make e2e`, `make ux`: browser checks. Need Playwright with Chromium.
- `UPDATE_GOLDEN=1 make test`: rewrite golden replays. Only after a deliberate rules change.

## Map

- `sim/src/engine/`: pure rules engine. `sim/src/server/`, `sim/src/ui/`, `sim/src/cli/`, `sim/src/store/`: app layers. Module boundaries: `sim/eslint/boundaries.js`, tested by `sim/test/arch.test.ts`.
- `game-packages/kurdish-coin/0.1.0/`: the game package (YAML data, cards, scenarios, variants).
- `research/`: rules source of truth for `rules.yaml`.
- `docs/prototype/`: specs, build plan (`11-build-plan.md`) and decision log (`13-design-decisions.md`, `DEC-NN`).
- `docs/rules/`, `docs/card-catalogue/`: print sources and generated PDFs.
- Spec citations in code use `<doc> s<section>`: `05 s8` is `docs/prototype/05-rules-engine-spec.md` section 8.

## Boundaries

**Always**

- Run `make check` and `make test` before a commit. Report each skipped check and its reason.
- Run the regenerate target from Commands after a change to its source.
- Cite the spec section or `DEC-NN` in a code comment for a rule implementation.

**Ask first**

- Game design or rules decisions. Record the outcome in `docs/prototype/13-design-decisions.md`.
- New dependencies, CI workflow changes or changes to module boundaries.
- Golden replay rewrites (`UPDATE_GOLDEN=1`).

**Never**

- Edit files listed under `managed` in `.agents/ownership.json`. The sync bot overwrites them. Propose the change for the upstream standards repository.
- Hand-edit generated files: `rules.yaml`, `game-packages/_schema/*.json`, `docs/rules/prototype-card-reference.md`, `*.pdf`, `*.inputs.json`, `sim/test/golden/`. Run the generator. If its tools are missing, say so.
- Load, build or fix tests in `archive/`. It is out of the run by design.
- Commit secrets or playtest databases (`*.sqlite`).

## Output rules

User has diagnosed ADHD. Optimize every reply for scannability, brevity and single-threaded focus. These rules apply to chat, commits, code comments and docs. They are stricter than the shared instructions.

01. Write in ASD-STE100. Plain, warm peer tone. Profanity allowed for emphasis when context fits.
02. Multi-turn tasks: line 1 is `Step X/Y: <summary>`, then a blank line, then the body.
03. Next line: the answer, command, file path or diff. Rationale below it.
04. Unprompted explanations: max ~150 words. Elaborate only when asked.
05. Lists: max 5 items; group longer lists by priority. Number ordered steps sequentially (1., 2., 3.), never repeated 1.
06. One issue at a time. End actionable replies with one next step (file or command). No time estimates.
07. State required context inline. Never ask the user to remember anything across turns.
08. No "I" narration of process. State results and changes in concrete terms.
09. No apologies, sycophancy or preamble. On error: fix, then state what changed.
10. No code snippets except out-of-task diffs for approval.
11. Emoji only as status markers (✅ ❌ ⚠️). Max one per line. Never in prose, headings or code.
12. No em dashes. No Oxford commas.

## Project additions to shared rules

- Out-of-task diff >40 lines: give a 1-line summary first; user chooses view or proceed.
- Every error found, in any file, gets a root-cause fix: apply in-task fixes, propose out-of-task fixes.
- New pattern replaces old: migrate all call sites and delete the old implementation in the same change.
- Delete test assertions that still pass with the requirement inverted.
- Instruction files (SKILL.md, **/prompts/**, AGENTS.md, CLAUDE.md): format only with `mdformat --number --end-of-line keep` (keeps CRLF line endings).

## Required shared instructions

Before any work, read and follow `.agents/shared/instructions.md`. It defines process, edits, testing, two-pass review (F1 to F4), Git, security and subagent rules. Rules in this file are additive and do not weaken the shared authorization, safety or security requirements. On conflict, the shared instructions take precedence.

@.agents/shared/instructions.md
