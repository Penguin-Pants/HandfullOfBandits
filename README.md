# A Handful of Bandits: Turkey and the PKK, 1984-1999


## Development

Needs Node.js 24 LTS or later and GNU Make. The simulator lives in `sim/`.

1. `make install`
2. `make check` (typecheck and lint)
3. `make test`
4. `make start` (builds the UI, then starts the app at http://127.0.0.1:5174)
5. `make schema` after a change to a package schema in `sim/src/package/schema/`
6. `make validate DIR=<package-dir>` to check a game package
7. Export sessions from `sim/`: `npm run sim -- export <sessionId...> --format json|markdown|csv --out <file or folder>`. CSV writes `annotations.csv`, `actions.csv` and `metrics.csv` into the folder. The **Metrics review** screen (Home nav) shows the per-round metrics and downloads `metrics.csv`.
8. Regression cases from notes (09 s7): `npm run sim -- regression create <annotationId>`, then `npm run sim -- regression run <caseId> --package <dir>` reports same, changed (per-round metric diff), incompatible or error. `regression list` shows cases; `regression compare <actionId> <actionId>` diffs the rounds of two branch paths.

After a change to the research documents, run `make rules DIR=<package-dir>`. It rewrites the package `rules.yaml`, the rule text behind each log rule ref. `npm run sim -- rules <dir> --check` only checks it, and `make test` fails when it is stale.

Windows without Make: run `npm ci`, `npm run check` or `npm test` inside `sim/`. To start the app, run `npm run build` then `npm start`.

Playtesters: install with [docs/tester/INSTALL.md](docs/tester/INSTALL.md) and play with [docs/tester/HOW-TO-PLAY.md](docs/tester/HOW-TO-PLAY.md). Print the text a log rule ref cites with `npm run sim -- rule "06 s3.2"` (the app shows the same text under the **Rule** button).

## Full campaign playtest

Start the app with `make start`. The Home screen offers one scenario: **Full campaign (1984-1999)**. It uses C1 to C5 and ends at the fifth Propaganda round. Design and tests use the full game only (decision of 2026-11-12).

Scenarios A, B and C and the S0 test scenario are archived in [archive/](archive/README.md), with their tests and golden replays. One shorter scenario returns after the full game is validated.

Run a paired policy screen with `cd sim` then `npm run sim -- batch --games 10 --strategy concentration,sanctuary --swap-seats --out metrics.csv`. Each adjacent pair uses the same seed with the policies assigned to opposite factions. A faction-specific policy uses the scripted legal fallback as its other faction. Use `--seed N` or `--package <dir>` when needed.

These batch policies are legacy screens, not qualified players: they read the full game state and fall back to the scripted policy for decisions they do not cover.

Run an automated playtest experiment with `cd sim` then `npm run sim -- experiment run <manifest.json> --out <new-dir>`. The manifests and runs in `sim/experiments/` are records of Scenario A experiments. They name `scenario-a` and an older package hash, so they do not run again. A new manifest names `full-campaign` and the current package hash. The manifest freezes rules, options, players, seeds and limits; the output directory holds every game journal, results and failures. `experiment replay <dir>` checks every state hash, `experiment analyze <dir>` writes the report, coverage ledger and statistics, `experiment qualify <out.json>` runs the player qualification fixtures, `experiment new <study.json> --out <manifest.json>` fills the package hash and fingerprints, `experiment compare <base> <variant> --paired --out <file.md>` compares two runs by cell and seed, and `experiment cards <run>... --out <file.md>` counts card side plays. In the app, "Experiment reports" shows each run's report and opens any game at a chosen decision ([doc 44](docs/prototype/44-simulation-analysis-plan3.md)). See [the Scenario A automated playtest status](docs/prototype/22-scenario-a-automated-playtest-status.md). The first full-campaign records are `dd22-pilot-before` (13-space map, main) and `dd22-pilot-after` (18-space map, DD-22): the same 16 qualified cells and 15 development seeds on the same engine. Their reports are in each run's `analysis-v2/report.md`. The current record is `dd25-pilot` (DD-25 setup, PKK threshold 32), with the control `dd25-pilot-main-players`; see [doc 36](docs/prototype/36-dd25-balance-pilot.md). The players were tuned and qualified on Scenario A, not on C3 to C5.

Policies from research 12 section 7: State `concentration` (no Civic Action), `civic-action` (least security first) and `emergency-rule`; PKK `sanctuary`, `concealment` and `coerce-only`. `scripted` is also available. Village Clearance and Legal Politics policies wait for their later-phase rules. CSV holds round scores, margins, Harm, income, Resources and political tracks. The report flags an 80% faction win rate across at least ten games. These runs screen for exploits; they do not establish balance.

The simulator uses the illustrated atlas with live counted pieces, linked panels for narrow regions and map navigation. Older saved layouts retain the schematic fallback. See [UX design and validation](docs/ux-overhaul.md). The printed-board look, wooden piece sprites and board-first layout are described in [the implemented visual system](docs/coin-visual-redesign-design.md).

## Printed rules

[Download the rulebook (A4 portrait PDF)](docs/rules/handful-of-bandits-rules-a4.pdf) and the [card sheets (A4 PDF)](docs/card-catalogue/cards-a4.pdf). Both are built from [prototype-rules.md](docs/rules/prototype-rules.md) and the package card text. Print at 100% / Actual size. Rebuild both with `make print` after a change to the rules, the cards or a print source; `make test` fails until you do. Editable sources and requirements are in [docs/rules](docs/rules/README.md) and [docs/card-catalogue](docs/card-catalogue/README.md).
