# 13 Design Decisions

Status: planning document. Records simulator decisions (DEC-nn). Game design decisions stay in `research/research-final/project-management/design-decisions.md` (DD-nn).

## 1. Accepted decisions

| ID | Decision | Rejected alternatives | Reason | Confidence |
|---|---|---|---|---|
| DEC-01 | Hybrid simulator: engine, versioned data packages, compiled rule modules, local UI, playtest database | Dedicated hard-coded game. Universal board game engine | Brief preference. Research supports it with one revision (DEC-02) | High |
| DEC-02 | Procedures in code, values in data | Fully declarative operations | Kurdish ops are specific procedures (06). A declarative form would become a scripting language | High |
| DEC-03 | Local web app: Node.js, TypeScript, React, Vite, Fastify, SQLite | Electron now: heavier build and update path. Tauri: Rust toolchain on Windows. Python with a web UI: two languages. Browser-only with IndexedDB: weak file export and package folder access | One language, no native GUI toolchain, easy debug in the browser | High |
| DEC-04 | Engine runs on the server only. UI is a thin client | Engine in browser plus server | One source of truth for rules and logs | High |
| DEC-05 | YAML packages validated by Zod. JSON Schema generated | JSON only: no comments in card files. TOML: weak for nested lists | Card and rule notes need comments | Medium |
| DEC-06 | Rule modules are TypeScript in the repository, referenced by `id@major` | Sandboxed scripting (Lua, QuickJS) in packages | No untrusted code. Brief prefers primitives before a scripting language | High |
| DEC-07 | Closed set of condition and formula terms. No expression strings | Expression language | No code from packages. Easier validation | High |
| DEC-08 | Full state snapshot after every committed command, deduplicated by hash | Replay-only. Snapshots every N actions | State is small. Undo and review need no replay. Replay stays as an integrity check | High (13,751 bytes canonical per setup state, measured at P1-03) |
| DEC-09 | Append-only command and log tables. Undo marks, never deletes | Delete on undo | Notes on undone actions keep their evidence | High |
| DEC-10 | `branches` table from Phase 1, single branch until Phase 4 | Add branching later by migration | Branching later needs no data change | High |
| DEC-11 | Seeded generator inside engine core, state stored in game state | Library RNG | Full control of determinism and serialization | High |
| DEC-12 | Session stores full package content by hash | Rely on package folders | Old sessions stay reproducible if folders change | High |
| DEC-13 | Annotation anchors: executed, proposed, decision, state, session, debrief (one overall comment per session, exported for AI analysis) | Single note type | Brief requires before and after notes kept apart | High |
| DEC-14 | Engine-only CLI playthrough (IC-2a) before any UI work | UI-first slice | Rules proven before UI cost. Reduces rework | High |
| DEC-15 | M2 slice is test scenario S0: real map and setup, one C1 pile of 8 cards, one final Propaganda round | Abstract 4-space test game | Notes from S0 apply to the real design | Medium |
| DEC-16 | SA timing in MVP: before or after the Op only | Full interleaving | 06 s1.3 "during" is undefined. Interleaving later if play needs it | Medium |
| DEC-17 | Every `[tune]` value is a named parameter | Constants in code | Tuning is the main iteration loop | High |
| DEC-19 | Each session records app version, module semvers and a fingerprint of all rules code. A changed fingerprint forces a replay check | Pin by major version only. Module hashes only | Code drift in modules or shared handlers would change old replays silently (review R-04, PR review) | High |
| DEC-21 | Action seq allocated per session, not per branch | Branch-local seq in the ID | Unique IDs across branches (PR review) | High |
| DEC-20 | S0 deviations: no Pivotals, Propaganda last, result "not comparable" | Full 05 s1.1 build in S0 | Every card plays. No false win signal (review R-01) | High |
| DEC-22 | Accept S0 as the first playable test: real map, 1984 setup, 8 C1 cards, one final Propaganda round, no Pivotals, result marked "not comparable" | Full Scenario A first. S0 with test thresholds | Fastest path to a playable game with notes and export (Q-02) | High |
| DEC-23 | Show face-down Covert markers by default in solo play. Hide toggle later (P4-07) | Hide by default | The solo player controls both sides (Q-03) | High |
| DEC-24 | Scenario B State threshold is a session option: 48 or 46. Default not decided | Keep 48. Set 46 now | Lets playtests compare both values (Q-04; research DD-19.7) | Medium |
| DEC-25 | First optional module to evaluate in Phase 5: MOD-3B Legal Movement third player | MOD-4A. Ranked initiative. None | Research names it the top alternative (Q-05) | Medium |
| DEC-26 | Keep the responder matrix Event and Pass rows as designed | Other rows | Designer decision on research unresolved item 14 | Medium |
| DEC-29 | Pieces show as flat SVG icons. Shape per piece type in `pieces.yaml`: Troops cube, Police cube in a lighter shade, Village Guards cylinder, Bases disc, Guerrillas octagon | 3D models (Blender). Pictures per piece | Icons follow the COIN look at no art cost. Lighter Police shade follows other COIN games (designer decision 2026-10-27) | High |
| DEC-30 | Faction colors: State red, PKK green. Emblems: Turkish crescent and star on State Bases. Simple star in circle on Active Guerrillas only. Underground Guerrillas solid green | Period-accurate PKK flag. Abstract symbol. Emblems on all pieces | Readable at 16 px icon size. Flip state shows at a glance (designer decision 2026-10-27). Risk: some countries restrict PKK symbols (Germany, unverified). Recheck before any public release | Medium |
| DEC-31 | Boundary lint reads 03 s5 literally. "core types" and "shared types" mean `import type` only. `package` may import only `engine/modules/registry*`. Engine code may import only hash functions from `node:crypto`, no other package. A folder not in 03 s5 fails lint. Rules live in `sim/eslint/boundaries.js` | Third-party import plugin (extra dependency, path-zone config). Vitest-only import scan (no editor feedback) | No new dependency. Errors show in the editor and in `make check` (P1-01) | High |
| DEC-32 | Keep the own engine. Study Rally the Troops COIN modules (Andean Abyss, Vijayanagara) for patterns before P2 and P3. Copy no code or assets. Findings in 14-rtt-pattern-study.md | boardgame.io (dormant, covers only P1-02 to P1-05). Vassal and Tabletop Simulator (no rule enforcement). Ludii (abstract games) | No engine covers COIN rules, per-action notes or versioned rule packages (designer decision 2026-10-28) | High |
| DEC-33 | Adopt RTT study proposals (14 s3). A: undo stays allowed; an undo after a random result is flagged `undoneAfterRandom`. B: `forEachSpace`, `forEachPiece`, `count {min, max}` and terms `terrainIn`, `spaceKind`, `adjacentTo`, `selected`. C: T-FUZZ random-play suite in P2-12 | Block undo after rolls (RTT). Encode "up to N" cards as module procedures. No random-play test | 33 of 200 card sides need "up to N". Testers' repeated rolls become visible. Dead ends found before play (designer decision 2026-10-28) | High |
| DEC-34 | Simulator supports the research playtest plan (12 s4, s7, s9). Round metrics from M2 (P2-10). `StopRuleFlag` for stop rules 3 and 4, and a Pass-only proxy for stop rule 6 (second 3-card streak in a game). Scripted strategy batch runs in the CLI (P3a-09), never in the UI. Tester materials (P4-08) | Metrics only in Phase 4. Human-only strategy games. No tester guide | S0 can then measure open findings IR-02 and IR-06. Exploit screens need about 10 games each (designer decision 2026-10-28) | High |
| DEC-35 | RNG: xoshiro128** 1.1 with SplitMix64 seeding, seed a safe integer >= 0. Draws use rejection sampling. Canonical JSON: sorted keys, safe integers, plain objects and arrays; anything else throws with its path (P1-02) | PCG32 (needs 64-bit multiply, so BigInt on every draw). Modulo reduction (biased) | 32-bit arithmetic with `Math.imul`. Known-answer vectors from the rand_xoshiro reference tests | High |
| DEC-36 | State form (P1-03). Every space holds a count for every piece flip state and marker side, zero included. A piece with no flip states or a marker with one side uses face key `default`. Space `level` is signed steps from Neutral (positive toward Support), null without a support scale. Ordinal tracks hold the step ID, numeric tracks a number. Hands and initiative hold player factions only. Absent values are null, never a missing key. `emptyState(ruleset, scenarioId, seed)` fills `meta` and `rng`. Core defines the `Ruleset` fields it reads; the package compiles to them (P1-04) | Sparse counts (two forms of one board, two hashes). Level as a string. Ordinal as an index (silent meaning change when steps move). `emptyState(ruleset)` with placeholder meta | One board has one canonical form and one hash. Step IDs stay stable (04 s1 item 2) | High |
| DEC-18 | Faction-keyed state. Only the CT sequence model assumes two factions | Two-faction types everywhere | Keeps MOD-3B and MOD-4A possible | High |
| DEC-27 | Node.js 24 LTS minimum (`engines >=24`, `engine-strict`). CI also runs Node 26 | Node 22: maintenance LTS, and its npm 10 runs the `better-sqlite3` gyp build. Node 26 only: Active LTS from 2026-10-28 | Checked 2026-10-27 at P0-01: Node 24.22.1 is LTS (maintenance since 2026-10-20). Node 26 becomes Active LTS 2026-10-28. Sources: https://nodejs.org/dist/index.json, https://github.com/nodejs/Release/blob/main/schedule.json | High |
| DEC-28 | Keep `better-sqlite3` (13.0.3). `sim/.npmrc` sets `ignore-scripts=true` | `node:sqlite` fallback | Checked at P0-01: the npm tarball bundles Node-API prebuilds for win32-x64 and win32-arm64 (`prebuilds/`), so no compiler is needed. npm 10 still runs an implicit `node-gyp rebuild` (seen on Linux). `ignore-scripts` stops it. Windows proof: CI `windows-latest` job | High |

## 2. Prototype assumptions (rules)

Designer decisions recorded 2026-10-27. Rule text for each PA is in 02-rules-gap-analysis.md, sections 4 and 5.

| ID | Rule | Status |
|---|---|---|
| PA-01 | Executing faction makes every unassigned event choice | accepted |
| PA-02 | Diplomacy moves one step along Host, Tolerant, Restricted, Hostile, Aligned. Hostile to Aligned needs modified 6 or more. Syria stops at Hostile | accepted |
| PA-03 | Modified die totals used as is. No automatic results | accepted |
| PA-04 | Track changes stop at the end. Excess lost. Legitimacy keeps its unpaid-loss rule (2 State Resources per point) | accepted |
| PA-05 | Coerce shifts first, then places its marker. A marker already present blocks the shift. The Guerrilla still activates | accepted |
| PA-06 | In an Ambush space, resolve Attack as normal (activate all, roll, attrition, bonus Guerrilla on a 1) and also remove 1 extra State piece | replaced |
| PA-07 | Count State pieces after the move when activating | accepted |
| PA-08 | Assault removals beyond legal targets are lost | accepted |
| PA-09 | Exhausted marker supply: skip placement, log "supply exhausted", warn when Harm markers run out | accepted |
| PA-10 | Equal check margins: lower Harm count wins, then PKK | accepted |
| PA-11 | Any no vote on Talks ends the ceasefire (Ceasefire to None) | replaced |
| PA-12 | PKK chooses any subset of qualifying Extort locations. Each chosen location activates a Guerrilla and gives +1 Resource | replaced |
| PA-13 | Random selections use the seeded session generator, logged and replayable | accepted |
| PA-14 | Air Mobility never uses KDP or PUK Zone boxes. Troops leave boxes only at Redeploy | accepted |
| PA-15 | DK-066: executing faction chooses any 2 Offices to remove. Legitimacy -1 | replaced |
| PA-16 | PKK March into Syria-Bekaa allowed at Restricted with +1 Resource; the group activates | accepted |
| PA-17 | Scenario A Pivotals: PKK ARGK Formed only. State has none | accepted |

Responder matrix design rows (research unresolved item 14): keep both. After Event, the Second Eligible may take Op + SA or Pass. After Pass, it may take any box. Status: accepted.

## 3. Unresolved questions for the designer

| ID | Question | Status |
|---|---|---|
| Q-01 | Accept or replace PA-01 to PA-17 | Closed. See section 2 |
| Q-02 | S0 as first playable test | Closed. DEC-22 |
| Q-03 | Show face-down Covert markers in solo play | Closed. DEC-23 |
| Q-04 | Scenario B State threshold | Partly closed. DEC-24. Open: the default value (48 or 46). Needed by P3b-08 |
| Q-05 | First optional module for Phase 5 | Closed. DEC-25 |

## 4. Research items this plan depends on but does not resolve

1. Responder matrix Event and Pass rows are design choices (research unresolved item 14). Designer kept them (DEC-26).
2. Thresholds and Harm limit are `[tune]` (research unresolved item 13).
3. Two or three players (research unresolved item 11). The plan keeps both possible (DEC-18).

Next step: read 12-architecture-review.md.
