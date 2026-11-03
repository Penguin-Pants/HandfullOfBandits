# Scenario A automated playtest: status and evidence

Status: in progress. This file records completed work, evidence, open findings and plan corrections for [the build plan](20-scenario-a-automated-playtest-build-plan.md). It is updated at each phase.

## Environment

- Node 24.22.2 (the container had Node 22; `sim/package.json` requires 24). `make check` and `make test` run in this container; CLI subprocess tests run without `EPERM`.
- 4 CPUs. One worker thread per CPU; about 55 games per minute for qualified players.

## Phase status

| Phase | Status | Evidence |
|---|---|---|
| 1 Manifest and freeze | Done | `sim/src/cli/experiment-manifest.ts`; `sim/test/experiment.test.ts` |
| 2 Durable runner, CLI, replay | Done | `experiment.ts`, `experiment-artifacts.ts`, `experiment-worker.ts`, `game-runner.ts`; `sim/test/experiment-cli.test.ts` |
| 3 Restricted player interface | Done | `player-observation.ts`; `sim/test/player-observation.test.ts` |
| 4 Candidates and diagnostics | Done | `candidates.ts`; `sim/test/candidates.test.ts`; [21](21-scenario-a-strategies.md) |
| 5 Strategies and qualification | Done | `strategies/`, `qualification.ts`; `sim/test/player-qualification.test.ts`; `sim/experiments/qualification-v*.json` |
| 6 Pilot and mechanic evidence | In progress | `sim/experiments/runs/pilot-1/` |
| 7 Frozen evaluation | Pending | |
| 8 Counters and disposition | Pending | |
