# Archive

This folder holds content that is out of the game package and out of the test run. Nothing here is loaded, built or tested.

## Why

Designer decision, 2026-11-12: design and test the **full game** (five Campaigns) first. Scenarios A, B and C and the S0 test scenario are archived. One shorter scenario returns after the full game is validated.

## Contents

| Path | Content | Came from |
|:--|:--|:--|
| `scenarios/kurdish-coin-0.1.0/` | `s0.yaml`, `scenario-a.yaml`, `scenario-b.yaml`, `scenario-c.yaml` | `game-packages/kurdish-coin/0.1.0/scenarios/` |
| `tests/scenario-a.test.ts` | Scenario A setup values and golden replay | `sim/test/` |
| `tests/scenarios-bc.test.ts` | Scenario B and C setup values, the Scenario B threshold option and golden replays | `sim/test/` |
| `golden/` | Seed 7 golden replays of S0 and Scenarios A, B and C | `sim/test/golden/` |

The tests are in the state of the last commit before the archive. The golden files were last regenerated before the archive, so their hashes do not match the current package.

## Not moved

- `sim/experiments/` (manifests, runs, qualification records): records of Scenario A experiments. They name `scenario-a` and older package hashes. They stay as history and do not run again.
- `docs/prototype/` and `research/`: design history. They still describe the archived scenarios.

## Removed with Scenario B

The session option `threshold.state` was in `manifest.yaml`. Only Scenario B listed it. To restore it, add these lines under `options:` in `manifest.yaml`:

```yaml
  threshold.state:
    values: [48, 46]
    description: "Scenario B State threshold (09 s2.3; DEC-24, DEC-77). Default 48. Other scenarios ignore it"
```

## Rules that changed after these files were written

A restored scenario or test must follow the current rules:

- No Talks and no Negotiated Outcome. The Ceasefire track has three steps and there is no `ceasefireRounds` track.
- The Europe cap marker has the id `europeBan` (was `ban`).
- A First Eligible Op Only needs two or more locations.

## How to restore a scenario

1. Move its YAML file back to `game-packages/kurdish-coin/0.1.0/scenarios/`.
2. Run `make validate DIR=game-packages/kurdish-coin/0.1.0` and correct each issue.
3. Move its test file back to `sim/test/` and correct the import paths (`./board.ts`, `./kurdish-package.ts`).
4. Regenerate its golden replay: `cd sim` then `UPDATE_GOLDEN=1 npx vitest run test/<file>`.
5. Add the scenario to rules 10.1 and write its setup in rules 10.6 or 10.7.
6. Regenerate the full campaign golden replay, because the package hash changes.

## Short games in tests

Tests that need a short game use `sim/test/short-game.ts`. It builds one fixture from `full-campaign.yaml` in a temporary package copy: `short-c1` (one Campaign, 8 Event cards, Propaganda last). The fixture is test data only. It is not a scenario of the game.
