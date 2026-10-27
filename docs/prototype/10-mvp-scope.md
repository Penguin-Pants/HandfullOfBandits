# 10 MVP Scope

Status: planning document.

## 1. Milestones

| Milestone | Phase | Meaning |
|---|---|---|
| M1 Engine foundation | 1 | A small package loads, validates and runs one tested transition with a full action record and a stored note |
| M2 First playable slice | 2 | One short Kurdish COIN game plays to an end with notes, save, resume and JSON export. First useful milestone |
| M3 Scenario A | 3a | Research Scenario A (C1 and C2) plays from setup to end |
| M4 Full design | 3b and 3c | Scenarios B and C and the full campaign play from setup to end |
| M5 Analysis | 4 | Cross-session review, Markdown and CSV, branching, version compare, regression runs |

## 2. M2 slice definition

### 2.1 Scenario "S0 Opening" (test scenario)

| Item | Value | Source |
|---|---|---|
| Label | `testOnly: true`. Not a research scenario | This plan |
| Map | Full 13 domestic spaces and 5 external boxes | 03 |
| Factions | State and PKK | DD-02 |
| Setup | Full campaign setup, August 1984 | 10 s2 |
| Deck | 8 C1 event cards (DK-001, 002, 003, 005, 008, 012, 014, 100) plus the C1 Propaganda card (DK-016). DK-013 is excluded because it needs Cross-Border. Capability, Momentum and Pivotal cards are not dealt. Order: shuffle the 8 with the seed, then put the Propaganda card last, so every card plays | DK CSV; deviation from 05 s1.1 |
| Mandatory cards | DK-003 Law 3175 and DK-005 KDP Orders PKK Out | 08 s2.2 |
| Length | One Propaganda round, which is final | This plan |
| End | Final scoring (09 s4). The first round has no victory check (09 s3) | 09 |
| Thresholds | 49 and 30 are shown, but S0 never reaches them in 8 cards. The S0 result is labeled "test result, not comparable". The record shows each faction's score change from its start (State 21, PKK 4) | 09 s2.2 |
| Pivotals | Removed. ARGK Formed (earliest C1) would be legal, so its removal is a listed scenario deviation shown on the start screen | 10 s2.3 |

Reason for the scope: one Campaign is the shortest unit that runs every core loop (initiative, ops, events, Propaganda, scoring). It uses the real map and setup, so playtest notes from it apply to the real design.

### 2.2 Rules in the slice

| Area | In M2 | Deferred to |
|---|---|---|
| Sequence | Full CT track, responder matrix, eligibility, Pass, Limited Op | none |
| Pivotal Events | None in S0 (scenario deviation above) | 3a |
| State Ops | Train (3 options, Civic Action), Garrison, Sweep, Assault | none |
| State SAs | Air Mobility | Cross-Border, Diplomacy 3a. Village Clearance, Covert 3b |
| PKK Ops | Rally (no Europe Ban case), March, Attack, Coerce | none |
| PKK SAs | Ambush, Extort, Strike Collaborators (legal once DK-003 brings Guards into play) | Host Pressure 3a |
| Events | The 8 C1 cards above. All use primitives or a free action already in the slice (DK-002 free Garrison, free Attack with Ambush). Always lines for DK-003 and DK-005 | Capabilities, Momentum 3a |
| Propaganda | Victory skip, Resources, Upkeep, Legitimacy (all 8 steps), Civic Action and Agitation, final scoring | Redeploy and Reset 3a. Legal Politics 3b |
| Victory | Scores, Harm counts, final margin, tie order, record sheet | Checks in later rounds 3a |

### 2.3 Platform features in the slice

| Feature | In M2 |
|---|---|
| Package load and validation report | Yes |
| Start session with seed, name and options | Yes |
| Schematic board with counts, levels, markers and Control | Yes |
| Faction panel with legal and illegal actions and reasons | Yes |
| Plan preview and commit | Yes |
| Decisions inline | Yes |
| Event panel with both sides and effects preview | Yes |
| Status bar | Yes |
| Note bar with auto context, anchors, categories | Yes |
| Unified history drawer and session history screen | Yes |
| Basic feedback review (table, filters for faction, card, space, category, version, plain substring search) | Yes. FTS search in 3a |
| Read-only state viewer (before and after) | Yes |
| Undo last action | Yes |
| Save, resume, named sessions, version banner | Yes |
| Auto database backup | No (3a) |
| JSON export with integrity check | Yes |
| Minimal Markdown export | No (3a) |
| CLI: `validate`, `replay`, `export` | Yes |

### 2.4 M2 exit criteria

1. Play S0 from setup to final scoring with no manual rule bookkeeping.
2. Record at least one executed, one proposed and one state note. Each has full context (T-ANN-03).
3. Save in the middle of an action Decision. Restart. Resume.
4. Undo one action. Its note still opens before and after states.
5. Export JSON. The reference check passes. The file opens in a text editor and shows notes with action IDs.
6. CLI replay of the session gives identical hashes.

## 3. Deferred functionality

| Item | Phase |
|---|---|
| Remaining ops, SAs, events, Pivotals, Capabilities, Momentum | 3a and 3b |
| Redeploy, Reset, multi-round play, victory checks | 3a |
| Legal Politics, Ceasefire, Negotiated Outcome, Emergency Rule step options beyond C2 | 3b |
| Scenarios B and C, full campaign | 3b and 3c |
| Cross-session review polish, CSV, full Markdown | 4 |
| Branching, version compare, regression runs in the UI | 4 |
| Hidden information view toggle | 4 |

## 4. Explicit exclusions

1. AI opponents, bots or move suggestions.
2. LLM rule adjudication.
3. Networked multiplayer.
4. Geographic map art and animation.
5. Optional modules MOD-3B, MOD-4A and Concept B before M4 (Phase 5 evaluation).
6. Ranked initiative variant before M4.
7. Package authoring UI. Packages are edited as YAML in a text editor.
8. Cloud services, accounts or telemetry.

## 5. Size estimate in tasks

Phase 1: 13 tasks (P0-01 and P1-01 to P1-12). Phase 2: 18 tasks. See 11-build-plan.md. The plan gives no time estimates.

Next step: read 11-build-plan.md.
