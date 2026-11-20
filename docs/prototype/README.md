# Digital COIN Prototype: Architecture and Build Plan

Status (2026-11-20): Phases 1 and 2 complete. Phases 3a to 3c built; their designer checkpoints stay open. Phase 4 is in progress: P4-09 (regression UI), P4-11 and P4-13 are not built. Audit Plans 1 to 4 are done (docs 43 to 45). Current work: the designer plays the full campaign against the bot seat. See [11-build-plan.md](11-build-plan.md) section 0.

## Bottom line

1. **Build:** a local web app (TypeScript, Node.js, React, SQLite) with a pure deterministic engine, YAML game packages, compiled rule modules and a playtest database.
2. **First playable milestone (M2):** was scenario S0 (archived, see `archive/README.md`). The app now plays the full campaign (C1 to C5) with notes, undo, save, JSON export and a bot seat.
3. **Rules status:** the research is complete enough for a playable two-player game. 15 blocking gaps got labeled prototype assumptions (PA-01 to PA-17, incl. 2 competing-rule defaults). All 99 package cards are encoded.
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
| [11-build-plan.md](11-build-plan.md) | Tasks P0-01 to P4-08 with checkpoints |
| [13-design-decisions.md](13-design-decisions.md) | Decisions, assumptions, open questions |
| [19-scenario-a-automated-playtest-spec.md](19-scenario-a-automated-playtest-spec.md) | Automated playtest requirements |
| [21-scenario-a-strategies.md](21-scenario-a-strategies.md) | Bot players and candidate generation |
| [26-bot-reference.md](26-bot-reference.md) | How the bots work, limits, review checklist |
| [27](27-village-clearance-draft.md) to [30](30-ceasefire-draft.md) | Approved Phase 3b texts: Village Clearance, Covert Action, Legal Politics, Ceasefire |
| [31-pivotals-structural-draft.md](31-pivotals-structural-draft.md) | Approved P3b-06 text: remaining Pivotals and structural cards (DEC-67) |
| [32-c3-cards-draft.md](32-c3-cards-draft.md), [33-c4-cards-draft.md](33-c4-cards-draft.md) | Approved P3b-07 card encoding drafts (DEC-68, DEC-69) |
| [34-c5-cards-draft.md](34-c5-cards-draft.md) | Approved P3b-07 C5 card encoding draft (DEC-75) |
| [35-start-setup-options-draft.md](35-start-setup-options-draft.md) | 1984 start setup audit and options; decided as DD-25 |
| [36-dd25-balance-pilot.md](36-dd25-balance-pilot.md) | DD-25 player review, requalification and bot pilot (`dd25-pilot`) |
| [37-bot-retune-v4.md](37-bot-retune-v4.md) | Roster v4 (designer retune, 2-move planning) and the 43/38 test variant |
| [38-variant-b-test.md](38-variant-b-test.md) | Test variant B (46/35, +1 Police): no gain over the current rules |
| [39-setup-lever-police.md](39-setup-lever-police.md) | +1 Police alone lowers the State by 12 points; corrects doc 38 |
| [40-thresholds-46-35-alone.md](40-thresholds-46-35-alone.md) | 46/35 with the setup unchanged: 54.2% State; the doc 39 prediction missed |
| [41-thresholds-43-38-alone.md](41-thresholds-43-38-alone.md) | 43/38 with the setup unchanged: 65.0% State, inside the target |
| [42-confirm-43-38.md](42-confirm-43-38.md) | 43/38 on 50 fresh seeds per pairing: 68.9% State, above the target |
| [43-solo-opponent-plan2.md](43-solo-opponent-plan2.md) | Audit Plan 2: bot seat, decision review and C3 to C5 positions done; State retune blocked on forced passes |
| [44-simulation-analysis-plan3.md](44-simulation-analysis-plan3.md) | Audit Plan 3: paired run compare, studies without hashes, card side counts, report viewer in the app |
| [45-setup-controls-plan4.md](45-setup-controls-plan4.md) | Audit Plan 4: variant overlays with derived Available, setup editor, variants in studies, setup sheet |

## Method

Automated playtesting is specified in
[19-scenario-a-automated-playtest-spec.md](19-scenario-a-automated-playtest-spec.md) (written for Scenario A, now archived; the bots play the full campaign).
It defines the strategy portfolio, qualification, tournaments and evidence gates. Players: [21](21-scenario-a-strategies.md); how the bots work: [26](26-bot-reference.md).

1. Four bounded extraction passes (small model) read the design chapters, decisions, deck and evidence files.
2. One integration pass checked the extractions against chapters 05, 06 and 09 and the deck CSV.
3. One independent critical review (large model) read docs 01 to 11 and the rules chapters. The review file was removed.

## Next step

Next code task: P4-09, the regression UI. Human work remains: IC-3a to IC-3c, the P4-08 tester run and IC-4. See [11-build-plan.md](11-build-plan.md) sections 0 and 5 for requirements and dependencies.

## Removed documents

Docs 10, 12, 14, 15 (Vassal study), 15 (Phase 3a review), 16, 17, 18, 20, 22, 23, 24 and 25 were removed on 2026-11-20. No code, test or live spec cited them. Mentions of them in older docs are marked "(removed)". Recover any file from Git history (`git log --diff-filter=D -- docs/prototype/<file>`).
