# Digital COIN Prototype: Architecture and Build Plan

Status: planning complete. Toolchain skeleton exists in `sim/` (P0-01).

## Bottom line

1. **Build:** a local web app (TypeScript, Node.js, React, SQLite) with a pure deterministic engine, YAML game packages, compiled rule modules and a playtest database.
2. **First playable milestone (M2):** scenario S0 on the real map and 1984 setup, one C1 pile of 8 cards, one final Propaganda round, with notes, undo, save and JSON export.
3. **Rules status:** the research is complete enough for a playable two-player game. 15 blocking gaps get labeled prototype assumptions (PA-01 to PA-17, incl. 2 competing-rule defaults). 91 event cards must be encoded from prose.
4. **Annotations:** designed with the engine. One key, type, Enter. Context and stable action IDs attach automatically.

## Read in this order

| File | Contents |
|---|---|
| [01-mechanics-inventory.md](01-mechanics-inventory.md) | 100 mechanics traced to research, with status and data or module need |
| [02-rules-gap-analysis.md](02-rules-gap-analysis.md) | Blocking, important and optional gaps. Provisional rules |
| [03-architecture.md](03-architecture.md) | Hybrid architecture, stack, modules, extension points |
| [04-game-package-spec.md](04-game-package-spec.md) | Package files, schemas, effect primitives, validation, versioning |
| [05-rules-engine-spec.md](05-rules-engine-spec.md) | State, commands, validation, resolution, determinism, scoring |
| [06-playtest-data-model.md](06-playtest-data-model.md) | IDs, tables, snapshots, undo, compatibility |
| [07-annotation-and-feedback-spec.md](07-annotation-and-feedback-spec.md) | Capture, anchors, context, review, exports |
| [08-ui-ux-spec.md](08-ui-ux-spec.md) | Screens, layout, shortcuts |
| [09-testing-and-replay.md](09-testing-and-replay.md) | Test suites, golden replays, regression cases |
| [10-mvp-scope.md](10-mvp-scope.md) | Milestones, S0 slice, deferrals, exclusions |
| [11-build-plan.md](11-build-plan.md) | Tasks P0-01 to P4-07 with checkpoints |
| [12-architecture-review.md](12-architecture-review.md) | Critical review and resulting plan changes |
| [13-design-decisions.md](13-design-decisions.md) | Decisions, assumptions, open questions |

## Method

1. Four bounded extraction passes (small model) read the design chapters, decisions, deck and evidence files.
2. One integration pass checked the extractions against chapters 05, 06 and 09 and the deck CSV.
3. One independent critical review (large model) read docs 01 to 11 and the rules chapters. Results are in 12.

## Next step

Start task P1-01 in [11-build-plan.md](11-build-plan.md).
