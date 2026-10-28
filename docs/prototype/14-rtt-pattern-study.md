# 14 Rally the Troops Pattern Study

Status: study for P2 and P3 (DEC-32). No code from Rally the Troops (RTT) is copied into this repository.

## Bottom line

1. RTT confirms the plan's core choices: RNG state inside game state, a stack of game steps, Propaganda as ordered phases, victory margins as computed values.
2. One gap needs action before P1-07 (core effect primitives) and P2-05 (card schema): the event effect schema cannot express "up to N" or "in each of up to N spaces with X". 33 of 200 card sides in our deck need it.
3. Two cheap additions: a random-play fuzz test, and a flag for undo after a random result.

## 1. Sources

| Source | Size | Date read |
|---|---|---|
| Andean Abyss `rules.js` (COIN volume I, 4 factions) | 10,308 lines | 2026-10-28 |
| Vijayanagara `rules.js` (GMT 2023, COIN-style Commands and Decrees, 3 factions) | 7,188 lines | 2026-10-28 |
| RTT docs: rules framework, script syntax, utility library, fuzzer, module overview | 5 pages | 2026-10-28 |

Files were read from the public site, for example `https://www.rally-the-troops.com/andean-abyss/rules.js`, and from `https://www.rally-the-troops.com/docs`. The git host `git.rally-the-troops.com` asks for a login (HTTP 401). Colonial Twilight is not on RTT.

License: the RTT GitHub page says the framework is open source and many modules are "available for study and re-use", but "the games and their assets are only available under license from the game copyright holders". No license name was found. This study describes patterns in its own words only.

## 2. Findings

| # | Pattern in RTT | Our plan | Action |
|---|---|---|---|
| 1 | Rules are a state machine. Each click is one action. Legal actions are listed per state | Plan-then-commit command with validation and preview (05 s3) | Keep ours. It gives previews and notes on illegal plans. Use RTT's per-state legal list as a model for `legalChoices` |
| 2 | Undo is a snapshot stack. It is cleared at the start of each card and before every die roll or shuffle, so a player cannot undo a roll | Undo any committed action. RNG state is restored, so the same command gives the same roll. A different command order can give a different roll | Proposal A |
| 3 | RNG: multiplicative LCG, state in `game.seed`, `random(range)` uses modulo (small bias) | Seeded generator in core, rejection sampling (P1-02) | No change. Ours avoids the bias |
| 4 | Events are instruction lists (94 instruction types). Key ones: select 1 to N spaces or pieces that match a filter, then run nested effects in each; mark a space for later reference; repeat; if; switch the executing faction; roll a die | Flat primitives with `space or choice` and a fixed `count`. Conditions have no terrain or adjacency term (04 s5, s8) | Proposal B |
| 5 | Special Activity can start at any step of an Operation. The Op state is saved and restored after the SA | SA before or after the Op only (DEC-16) | No change for MVP. If interleaving is needed later, write Op handlers as resumable steps |
| 6 | Fuzzer plays random legal actions. It reports crashes, dead ends (no legal action, game not over) and games that run too long | No random-play test (09 s2) | Proposal C |
| 7 | Propaganda is a step counter with one function per phase | Ordered phase handlers named in the package (03 s6) | No change |
| 8 | Victory margins are plain functions per faction | Formula terms in data (04 s8) | No change |
| 9 | Pieces are a fixed index array (piece to space). Capabilities and Momentum are bit flags | Counts keyed by faction and space | No change. Ours supports N factions (DEC-18) |
| 10 | Each role gets a filtered view of hidden information | Solo play shows all (DEC-23) | No change |

## 3. Proposals (need designer approval)

### A. Undo after a random result (06 s6, 07 s8.1)

Mark an undo when the undone action used the RNG. Add `undoneAfterRandom: true` to the undo history entry and the JSON export. The export then shows possible "roll fishing" by outside testers. No rule change.

### B. Event selection primitives (04 s5, s8; before P1-07)

1. Add `forEachSpace`: `filter` (condition terms), `min`, `max`, `effects` (nested list). Add `forEachPiece` with the same fields.
2. Allow `count: {min, max}` on `placePieces`, `removePieces` and `movePieces` for "up to N".
3. Add condition terms `terrainIn`, `spaceKind`, `adjacentTo` and `selected` (refers to an earlier selection in the same card).
4. Example, DK-003 unshaded ("place up to 2 Village Guards in each of up to 2 Mountain or Plain spaces with State Control and Police"): `forEachSpace {filter: [terrainIn [mountain, plain], control state, spaceHas police], min 0, max 2, effects: [placePieces {piece: guards, count: {min 0, max 2}}]}`.

Evidence: in `research/research-final/data/prototype-deck.csv`, 33 card sides say "up to" and 28 filter spaces with "with" or "where".

### C. Random-play fuzz test (09 s2; after IC-2a)

Add suite T-FUZZ: for 50 seeds, play S0 with random legal choices through the CLI. Fail on an exception, a dead end, or more than 2,000 steps. Store the seed and command list of each failure as a regression case.

Next step: decide on proposals A, B and C. B blocks P1-07.
