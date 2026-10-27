# 08 UI and UX Specification

Status: planning document. Wireframes are text sketches.

## 1. Principles

1. Critical information stays on screen: active faction, current card, Resources, Legitimacy, scores.
2. No modal dialogs during play, except confirm on "Undo" and "End session". The "End session" dialog and the game end screen show an optional debrief box (07 s3). Home has a [Debrief] button per saved session to add or edit it later.
3. Every illegal action shows why.
4. Every action shows its expected effects before commit, where no roll is needed.
5. Notes never take the user out of context.
6. Keyboard first for frequent steps. Mouse for map selection.
7. Plain styling. Light and dark themes through CSS variables only.

## 2. Screens

| Screen | Purpose | Phase |
|---|---|---|
| Home | Choose package and scenario, set seed and options, name session. List saved sessions | 2 |
| Play | Board, faction panel, event panel, status bar, note bar, history drawer | 2 |
| Session history | Full unified history for one session with filters | 2 |
| Feedback review | Notes across sessions (07 s7) | 2 basic, 4 full |
| State viewer | Read-only board at any state hash. Before and after toggle | 2 basic, 4 full |
| Package check | Validation report for a package folder | 2 |
| Settings | Categories, hotkeys, backups, prompted notes | 2 basic |
| Regression | Cases and runs | 4 |

## 3. Play screen layout

```
+----------------------------------------------------------------------------+
| C2  Card 7/13  DK-021 "Title"   1st: PKK (Op+SA)  2nd: State   [N] note  |  <- status bar
| State Res 14  Legit 9  Score 27/49 (-22)  Harm 1/6 | PKK Res 6  Score 12/30 (-18)  Harm 2/6 |
| ER: Martial Law  Syria Host  KDP Tolerant  PUK Tolerant  Europe 2  CF None |
+-----------------------------------------------+----------------------------+
|                                               | EVENT PANEL                |
|   SCHEMATIC BOARD (SVG)                       | DK-021 title, date, tier   |
|   nodes = spaces, edges = links               | Unshaded (State): text     |
|   each node: name, Pop, terrain icon,         |   [Execute] effects preview|
|   level band, Control ring,                   | Shaded (PKK): text         |
|   piece counts by type, marker chips          |   [Execute] effects preview|
|   external boxes on the right edge            | Pivotal: ARGK Formed       |
|   Europe as a track                           |   precondition: not met (why)
|                                               +----------------------------+
|                                               | FACTION PANEL: PKK         |
|                                               | Box: [Event][Ltd][Op][Op+SA][Pass]
|                                               | Ops: Rally  1/loc   OK     |
|                                               |      March  1/dest  OK     |
|                                               |      Attack 1/space OK     |
|                                               |      Coerce  -- no space: needs Underground Guerrilla at Neutral or Support
|                                               | SA:  Extort OK  Ambush (needs Attack)
|                                               | Plan: Rally Botan(opt 3), Hakkari(opt 1)  cost 2
|                                               | Preview: +3 Guerrillas Botan ...       |
|                                               | [Commit Enter]  [Clear Esc]            |
+-----------------------------------------------+----------------------------+
| NOTE BAR: Note on: PKK Rally (A-0042) | #balance | text...           [Enter] |
+----------------------------------------------------------------------------+
| HISTORY DRAWER (toggle H): last 10 entries, notes inline                    |
+----------------------------------------------------------------------------+
```

### 3.1 Board

1. Node positions come from `map.yaml` `layout`. No geographic art.
2. Click a node to select it. Shift-click adds to a multi-select (for plan locations).
3. Selected node shows a detail card: all pieces with flip state, markers with sides, level, Control, Pop, terrain, tags, confidence note.
4. Hidden markers show as "Covert (face down)". A view toggle hides them (Phase 4, GAP-O01).

### 3.2 Faction panel

1. Shows the faction whose turn it is. Title shows "First Eligible" or "Second Eligible".
2. Box buttons show only boxes the responder matrix allows. Others are grey with the reason on hover.
3. Op list: each row has name, cost rule, state (OK, or the first violation).
4. Building a plan: select op, click locations on the board, set per-location options in a small inline form. Validation runs on each change (server round trip under 100 ms target).
5. Preview lists cost per location, total, and deterministic effects.
6. Commit with Enter. Rolls and Decisions follow inline in the panel.

### 3.3 Decision prompts

Inline in the faction panel. Shows deciding faction, prompt, legal answers and the rule ref. Number keys pick an answer.

### 3.4 Propaganda flow

The event panel becomes a phase list with the current phase highlighted. Automatic phases show their results as a short list. Phases with choices (Civic Action spend, Emergency Rule step, closure filing, Redeploy, ceasefire votes) open an inline form. `Space` advances when nothing is open.

### 3.5 Status bar

Turn position, eligibility, all tracks, both scores with threshold and margin, Harm counts with limit, active Capabilities and Momentum as chips with hover text, active PA count with a link to the list.

## 4. Keyboard shortcuts

| Key | Action |
|---|---|
| `N` | Open note bar |
| `Enter` | Commit plan, save note, answer Decision |
| `Esc` | Clear plan, cancel note |
| `1` to `5` | Pick box: Event, Limited Op, Op Only, Op + SA, Pass |
| `U` / `S` | Choose unshaded or shaded event side |
| `Space` | Advance (next card or phase) when nothing is open |
| `H` | Toggle history drawer |
| `Ctrl+Z` | Undo last action (confirm) |
| `F` | Open feedback review |
| `Alt+1` to `Alt+9` | Toggle note category |
| `?` | Shortcut list |

## 5. History and feedback views

1. Session history: one row per log entry or note. Columns: ID, turn position, faction, kind, text. Expand row for data and rule refs. Click a row to open the state viewer at that point.
2. Feedback review: as in 07 s7.

## 6. Home screen

```
+----------------------------------------------------------+
| Package: [kurdish-coin 0.3.1 (R7)  v]   Check: 0 errors, 4 warnings (PA list)
| Scenario: [Scenario A 1984-1989  v]                       |
| Options: syriaMarchRestricted [B v]                        |
| Seed: [ 482913 ] [random]   Name: [ A-seed482913-try2  ]  |
| [Start]                                                   |
+----------------------------------------------------------+
| Saved sessions: name | package | scenario | turn | status | [Resume] [Export]
+----------------------------------------------------------+
```

The Start button is disabled while validation has errors. Warnings list each PA.

## 7. Accessibility and scale

1. Minimum target size 32 px for board nodes.
2. Text contrast meets WCAG AA in both themes.
3. Layout targets 1366 x 768 and larger. Mobile layout is out of scope.

## 8. UI acceptance checks

| ID | Check |
|---|---|
| T-UI-01 | From Home to first committed action in under 10 clicks |
| T-UI-02 | Note saved with 1 key, text and Enter. No focus loss on the board |
| T-UI-03 | Each grey action shows a reason |
| T-UI-04 | Undo restores the board and the faction panel |
| T-UI-05 | Resume a saved session at an open Decision |
| T-UI-06 | "End session" with debrief text saves one `debrief` note. Skip saves none |

Next step: read 09-testing-and-replay.md.
