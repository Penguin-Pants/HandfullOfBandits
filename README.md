# A Handful of Bandits: Turkey and the PKK, 1984-1999

## About the game

A two-player board game prototype about the conflict in southeastern Turkey from 1984 to 1999. One player is the State. The other player is the PKK. The game has five Campaigns (C1 to C5). Each Campaign has 12 Event cards and one Propaganda card. The fifth Propaganda round ends the game.

This repository holds the rules, the card text, the game package data, a local app to play the game and the playtest records.

## The COIN series

COIN (short for "COunterINsurgency") is a series of board games published by GMT Games. The games simulate historic insurgency and counterinsurgency conflicts. The first game is Andean Abyss (2012), designed by Volko Ruhnke. COIN games use a variable turn order: in Andean Abyss, a deck of Event cards sets the order in which the factions act. Source: [Wikipedia, "COIN (board game)"](https://en.wikipedia.org/wiki/COIN_(board_game)).

A Handful of Bandits is a COIN-series prototype for this conflict created by a fan. It is not associated with GMT nor published by them (yet!).

The rules are in [prototype-rules.md](docs/rules/prototype-rules.md).

## Install

You need Node.js 24 or later. Windows 10 or later and macOS work.

1. In the `sim` folder, run `npm ci`.
2. Run `npm run build`.
3. Run `npm start`, then open http://127.0.0.1:5174.

With GNU Make, `make install` and `make start` do the same steps. The full guide, with fixes for common errors, is [docs/tester/INSTALL.md](docs/tester/INSTALL.md).

## Setup

On the Home screen:

1. **Scenario:** **Full campaign (1984-1999)** is the only scenario.
2. **Setup:** **Package setup** is the standard start. A setup variant changes the start position, thresholds, tracks or piece pools. **Setup editor** makes a new variant.
3. **Opponent:** the recommended bot is the default. Choose **None: I play both sides** to play both factions yourself.
4. **Seed** and **Name**, then **Start**.

## Play

1. Click **Reveal first card**.
2. On each card, the First Eligible faction acts, then the Second Eligible faction. Choose a box (**Event**, **Limited Op**, **Op Only**, **Op + SA** or **Pass**), build the plan on the map and click **Commit (Enter)**.
3. On a Propaganda card, follow the steps in the right panel.
4. The status bar shows each score as X/Y: the score now and the score that wins ("Victory track · State 21/49 · PKK 6/32"). Open **Victory track** for the full track.
5. When a bot acts, the map shows its moves as arrows and outlines the spaces it changed. The **Bot** select in the map tools sets the wait between bot actions: Slow, Normal, Fast or Paused.
6. **Undo (Ctrl+Z)** takes back an action. **Help (?)** lists how to win, the actions and the keys. Press **N** to write a playtest note.

The step-by-step guide is [docs/tester/HOW-TO-PLAY.md](docs/tester/HOW-TO-PLAY.md). Print the [rulebook (A4 PDF)](docs/rules/handful-of-bandits-rules-a4.pdf) and the [card sheets (A4 PDF)](docs/card-catalogue/cards-a4.pdf) at 100% / Actual size.

## Development

Needs Node.js 24 LTS or later and GNU Make. The simulator is in `sim/`. Windows without Make: run the npm script of each target inside `sim/` (`npm ci`, `npm run check`, `npm test`, `npm run build` then `npm start`).

### Make targets

- `make install`: install the dependencies.
- `make check`: typecheck and lint.
- `make test`: run the tests.
- `make start`: build the UI and start the app at http://127.0.0.1:5174.
- `make schema`: after a change to a package schema in `sim/src/package/schema/`.
- `make validate DIR=<package-dir>`: check a game package and its variants.
- `make rules DIR=<package-dir>`: after a change to the research documents. It rewrites the package `rules.yaml`. `make test` fails when it is stale.
- `make e2e` and `make ux`: browser smoke and viewport checks (need Playwright).
- `make print`: rebuild the rulebook and card sheet PDFs after a change to the rules, the cards or a print source. `make test` fails until you do. Sources: [docs/rules](docs/rules/README.md) and [docs/card-catalogue](docs/card-catalogue/README.md).

### Simulator commands

Run these in `sim/` as `npm run sim -- <command>`.

- `export <sessionId...> --format json|markdown|csv --out <file or folder>`: export sessions.
- `rule "06 s3.2"`: print the rule text a log rule ref cites.
- `regression create <annotationId>`, `regression run <caseId> --package <dir>`, `regression list`, `regression compare <actionId> <actionId>`: regression cases from notes.
- `setup-sheet <package-dir> [--variant <name>] --out <file.md>`: print a setup sheet ([doc 45](docs/prototype/45-setup-controls-plan4.md)).
- `batch --games 10 --strategy concentration,sanctuary --swap-seats --out metrics.csv`: paired policy screens. These legacy policies screen for exploits. They do not establish balance.
- `experiment new|run|replay|analyze|qualify|compare|cards`: automated playtest experiments ([doc 44](docs/prototype/44-simulation-analysis-plan3.md)). Records are in `sim/experiments/`. The current record is `dd25-pilot` ([doc 36](docs/prototype/36-dd25-balance-pilot.md)).
- `diff <old-package-dir> <new-package-dir>`, `replay <file.json | sessionId>`, `fuzz [--seeds N]`.

Bot-against-bot studies are paused. Scenarios A, B and C and the S0 test scenario are in [archive/](archive/README.md). The UI design is in [docs/ui/ux-overhaul.md](docs/ui/ux-overhaul.md) and [docs/ui/coin-visual-redesign-design.md](docs/ui/coin-visual-redesign-design.md).
