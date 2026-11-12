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

## Scenario A playtest

Start the app with `make start`, then select **Scenario A: 1984-1989**. It uses C1 and C2, ends at the second Propaganda round and includes ARGK Formed. The designer UI playthrough and notes export are the remaining IC-3a checkpoint.

**Scenario B: 1990-1995** (C3 and C4) and **Scenario C: 1993-1999** (C4 and C5) are also on the Home screen (research 10 s4 and s5). Scenario B has the option `threshold.state`: State threshold 48 (default) or 46. Their designer playthroughs are checkpoint IC-3b.

Run a paired policy screen with `cd sim` then `npm run sim -- batch --games 10 --strategy concentration,sanctuary --swap-seats --out metrics.csv`. Each adjacent pair uses the same seed with the policies assigned to opposite factions. A faction-specific policy uses the scripted legal fallback as its other faction. Use `--seed N`, `--scenario scenario-a` or `--package <dir>` when needed.

These batch policies are legacy screens, not qualified players: they read the full game state and fall back to the scripted policy for decisions they do not cover.

Run an automated playtest experiment with `cd sim` then `npm run sim -- experiment run experiments/manifests/pilot-1.json --out <new-dir>`. The manifest freezes rules, options, players, seeds and limits; the output directory holds every game journal, results and failures. `experiment replay <dir>` checks every state hash, `experiment analyze <dir>` writes the report, coverage ledger and statistics, and `experiment qualify <out.json>` runs the player qualification fixtures. See [the automated playtest status](docs/prototype/22-scenario-a-automated-playtest-status.md).

Policies from research 12 section 7: State `concentration` (no Civic Action), `civic-action` (least security first) and `emergency-rule`; PKK `sanctuary`, `concealment` and `coerce-only`. `scripted` is also available. Village Clearance and Legal Politics policies wait for their later-phase rules. CSV holds round scores, margins, Harm, income, Resources and political tracks. The report flags an 80% faction win rate across at least ten games. These runs screen for exploits; they do not establish balance.

The draft physical map is [draft-map.svg](game-packages/kurdish-coin/0.1.0/map/draft-map.svg). The simulator uses the illustrated atlas with live counted pieces, linked panels for narrow regions and map navigation. Older saved layouts retain the schematic fallback. See [UX design and validation](docs/ux-overhaul.md). The printed-board look, wooden piece sprites and board-first layout are described in [the implemented visual system](docs/coin-visual-redesign-design.md).

## Printed rules

[Download the Scenario A rulebook (A4 portrait PDF)](docs/rules/handful-of-bandits-rules-a4.pdf). Includes current C1/C2 rules, setup and card text. Print at 100% / Actual size. Rebuild with `make rulebook`; editable sources and requirements are in [docs/rules](docs/rules/README.md).
