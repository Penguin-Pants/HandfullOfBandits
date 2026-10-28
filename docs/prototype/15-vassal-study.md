# 15 Vassal Pattern Study

Status: study for P2 to P4 (DEC-32). B and C approved, A rejected (DEC-47). Nothing is copied into this repository yet.

## Bottom line

1. Vassal code gives us no reuse. It is Java 17 desktop code (LGPL v2). The simulator is TypeScript. Our engine already covers its log, undo and replay model.
2. Vassal COIN modules give us the series UX standard. Players know it from years of online play. The goal is a physical game, so the simulator board must look like a physical COIN board, not a schematic graph (08 s3.1 item 1 conflicts).
3. A Vassal module of our map, pieces and cards lets testers play the finished design with no rule enforcement. Build it after IC-4 (DEC-47).

## 1. Sources

| Source | Size | Date read |
|---|---|---|
| `github.com/vassalengine/vassal` master, `VASSAL/command`, `VASSAL/counters`, `VASSAL/build/module` | 3 packages | 2026-10-28 |
| Colonial Twilight module v2.2 (`Colonial Twilight v2-2.vmod`, sha256 `5f7ffef5...`, from the Vassal library API) | 11 MB, 182 images, `buildFile` 254 KB | 2026-10-28 |
| Vassal library, tag `series:GMT COIN Series` | 13 projects | 2026-10-28 |

Colonial Twilight is the closest model: COIN, 2 factions (Government and FLN), Pivotal Events.

## 2. Findings

| # | Pattern in Vassal | Our plan | Action |
|---|---|---|---|
| 1 | Every change is a `Command` with `append` and `getUndoCommand` (`command/Command.java:163`, `:178`). `ChangePiece` stores old and new state for undo (`command/ChangePiece.java:111`) | Command list with state hashes (05, 09) | No change. Ours also checks rules and hashes |
| 2 | `BasicLogger.blockUndo` stops undo past a point (`build/module/BasicLogger.java:579`) | Undo allowed, flagged `undoneAfterRandom` (DEC-33 A) | No change. Same intent, ours keeps more data |
| 3 | `.vlog` log files step forward through commands; `.vsav` saves state | JSON export, replay (09) | No change |
| 4 | Pieces are a base plus stacked traits (`counters/Decorator.java`, `Embellishment.java` for flip faces) | Counts per flip state (DEC-36) | No change |
| 5 | Map spaces are polygon `Zone`s on one map image. CT has 122 zones on a 4080 x 2640 map | Node graph with `layout` positions, no art (08 s3.1) | Proposal A |
| 6 | Wooden piece images about 49 x 74 px (`Wood_FLN Guerrilla.png`); Bases are discs, troops and police cubes, guerrillas cylinders | Flat SVG icons (08 s3.1 item 2) | Proposal A |
| 7 | CT toolbar: Draw Card, End Card Play, End Faction Play, Propaganda Reset, Control Snapshot, Undo. Eligibility pawns show 1st and 2nd Eligible. Card slots for current, Capabilities and Momentum | Status bar, faction panel, event panel (08 s3) | Proposal B |
| 8 | Global properties hold auto totals: `TotalSupport`, `TotalOppose`, `OppPlusBases`, `RES_GOVT`, `RES_FLN` | Derived totals and scores (P1-09) | No change. Use the same edge-track view (Proposal A) |
| 9 | Hover over a stack shows its contents (`CounterDetailViewer`, delay 700 ms, min 2 pieces) | Click a node for a detail card (08 s3.1 item 4) | Proposal B |
| 10 | Module readme: support and Control are set by right-click on the space; "module won't do this for you" for card choices | Rules enforced, with notes | Confirms our reason to build an own engine |

## 3. Proposals

### A. COIN series board look (08 s3.1), rejected

1. Replace "No geographic art" with one map image plus a polygon per space in `map.yaml`. Keep the node graph as a debug view.
2. Draw pieces in the series shapes: cubes for State troops and police, cylinders for Guerrillas, discs for Bases. Keep DEC-30 colors and emblems.
3. Add the series edge track (0 to 99 style) for Resources and scores, and the Sequence of Play box with eligibility cylinders.
4. Art stays original. CT images are reference for size and layout only.

### B. Vassal player habits (08 s3), approved

1. Right-click menu on a space and a piece, next to the faction panel.
2. Hover shows stack contents.
3. Toolbar names match Vassal COIN modules: "End Card Play", "Propaganda", "Undo".

### C. Vassal module after IC-4 (PV-01), approved

1. Build a plain `.vmod` from the package: map, spaces, pieces, cards, tracks. No automation.
2. Build it after IC-4, from the draft maps and final package data. Notes go in the existing feedback form (07).
3. Generate the module from the package YAML where it is cheap, so both stay in step.

Next step: PV-01 waits for IC-4 in 11-build-plan.md.
