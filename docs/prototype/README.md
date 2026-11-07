# Digital COIN Prototype: Architecture and Build Plan

Status: Phases 1 and 2 complete. Phases 3a to 3c built; their designer checkpoints stay open. Phase 4 is in progress. P4-15 is complete and CL-01 is dropped under its size rule. Next code task: P4-09. P4-08 acceptance needs a new tester; IC-4 needs recorded comparison evidence. See [11-build-plan.md](11-build-plan.md) section 0.

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
| [11-build-plan.md](11-build-plan.md) | Tasks P0-01 to P4-08 with checkpoints |
| [12-architecture-review.md](12-architecture-review.md) | Critical review and resulting plan changes |
| [13-design-decisions.md](13-design-decisions.md) | Decisions, assumptions, open questions |
| [14-rtt-pattern-study.md](14-rtt-pattern-study.md) | Patterns from Rally the Troops COIN modules, with proposals |
| [15-vassal-study.md](15-vassal-study.md) | Patterns from the Vassal engine and its COIN modules, with proposals |
| [15-phase3a-review.md](15-phase3a-review.md) | Phase 3a TWO-PASS REVIEW |
| [16-board-art-direction.md](16-board-art-direction.md) | Board art direction (DEC-59) |
| [17-approved-atlas-board.md](17-approved-atlas-board.md) | Interactive atlas board (DEC-60) |
| [18-readable-atlas-layout.md](18-readable-atlas-layout.md) | Readable atlas layout (DEC-61) |
| [19-scenario-a-automated-playtest-spec.md](19-scenario-a-automated-playtest-spec.md) | Automated playtest requirements |
| [20-scenario-a-automated-playtest-build-plan.md](20-scenario-a-automated-playtest-build-plan.md) | Automated playtest build plan |
| [21-scenario-a-strategies.md](21-scenario-a-strategies.md) | Bot players and candidate generation |
| [22-scenario-a-automated-playtest-status.md](22-scenario-a-automated-playtest-status.md) | Automated playtest status ledger and review |
| [23-scenario-a-automated-playtest-report.md](23-scenario-a-automated-playtest-report.md) | Automated playtest results (current: `cand-5`) |
| [24-scenario-a-playtest-overview.md](24-scenario-a-playtest-overview.md) | One-page results overview |
| [25-p-shield-designer-notes.md](25-p-shield-designer-notes.md) | P-SHIELD briefing for the IC-3a playthrough |
| [26-bot-reference.md](26-bot-reference.md) | How the bots work, limits, review checklist |
| [27](27-village-clearance-draft.md) to [30](30-ceasefire-draft.md) | Approved Phase 3b texts: Village Clearance, Covert Action, Legal Politics, Ceasefire |
| [31-pivotals-structural-draft.md](31-pivotals-structural-draft.md) | Approved P3b-06 text: remaining Pivotals and structural cards (DEC-67) |
| [32-c3-cards-draft.md](32-c3-cards-draft.md), [33-c4-cards-draft.md](33-c4-cards-draft.md) | Approved P3b-07 card encoding drafts (DEC-68, DEC-69) |
| [34-c5-cards-draft.md](34-c5-cards-draft.md) | Approved P3b-07 C5 card encoding draft (DEC-75) |

## Method

Automated Scenario A testing is specified in
[19-scenario-a-automated-playtest-spec.md](19-scenario-a-automated-playtest-spec.md).
It defines the strategy portfolio, qualification, tournaments and evidence gates. Implementation status: [22](22-scenario-a-automated-playtest-status.md); players: [21](21-scenario-a-strategies.md); results: [23](23-scenario-a-automated-playtest-report.md).

1. Four bounded extraction passes (small model) read the design chapters, decisions, deck and evidence files.
2. One integration pass checked the extractions against chapters 05, 06 and 09 and the deck CSV.
3. One independent critical review (large model) read docs 01 to 11 and the rules chapters. Results are in 12.

## Next step

Next code task: P4-09, the regression UI. Human work remains: IC-3a to IC-3c, the P4-08 tester run and IC-4. See [11-build-plan.md](11-build-plan.md) sections 0 and 5 for requirements and dependencies.
