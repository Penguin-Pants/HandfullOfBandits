# 07 Annotation and Feedback Specification

Status: planning document. Annotation capture is part of the first playable milestone (Phase 2).

## 1. Goals

1. A note takes one key press, typing and Enter. No dialog.
2. The app fills every context field it knows. The user types only the observation.
3. Each note links to stable IDs, not only to turn numbers or timestamps.
4. Notes and game history form one chronological record.
5. Exports let a person or an AI assistant analyze many sessions without the database.

## 2. Capture flow

| Step | User action | App action |
|---|---|---|
| 1 | Press `N` anywhere (or click the note bar) | Focus the note bar. Freeze a copy of the current UI context |
| 2 | Type text. Optional: type `#balance` or press `Alt+1` to `Alt+9` for categories | Show category chips. Show the anchor chip (section 3) |
| 3 | Press `Enter` | Save. Show "Saved, linked to A-0042" for 2 seconds. Return focus to the board |
| 4 | Press `Esc` | Cancel. Nothing is saved |

`Shift+Enter` adds a line. `Tab` cycles the anchor (section 3). The game state does not change while the bar is open.

### 2.1 After an action

After an action commits, the note bar shows "Note on: PKK Rally (A-0042)" for the next 20 seconds or until the next command, whichever comes first. A note saved in that window anchors to that action by default.

### 2.2 Before an action

When the user is building an action plan (faction panel open, op selected, locations chosen), the note anchors to a proposed action by default. The note stores the draft plan and its validation result, even if the plan is illegal.

## 3. Anchors

| Anchor | When | Links |
|---|---|---|
| `executed` | Note about an action that committed | `action_id`, `state_hash_before`, `state_hash_after`, log entry IDs |
| `proposed` | Note made while a plan is drafted or an action is shown as illegal | Draft plan, validation result, `state_hash` (current), no `action_id` |
| `decision` | Note while a Decision is open | Decision ID, parent `action_id`, current `state_hash` |
| `state` | Note while inspecting the board or a score | `state_hash`, selected space or panel |
| `session` | General note | `session_id` only |

A proposed note gains a link if the same plan is then executed. It keeps `anchor: proposed` and adds `executed_as: <action_id>`. This keeps "before" and "after" notes apart.

## 4. Automatic context

### 4.1 Always captured

| Field | Source |
|---|---|
| `annotation_id` | Store |
| `session_id`, `branch_id` | Session |
| `package_id`, `version`, `ruleset_version`, `package_hash` | Session package |
| `scenario_id` | Session |
| `campaign`, `propaganda_round`, `card_index`, `phase` | State turn |
| `active_faction`, `first_eligible`, `second_eligible` | State initiative |
| `current_card_id`, `current_card_title` | State deck |
| `state_hash`, `state_seq` | Current head |
| `last_action_id` | History head |
| `resources`, `tracks` | All track values |
| `scores`, `thresholds`, `margins`, `harm_counts` | Derived view |
| `ui_focus` | Panel with focus: board, faction, event, status, history, review |
| `selected_space`, `selected_pieces` | Selection store |
| `hovered_action_id` | Faction panel, if any |
| `created_at` | Store clock |
| `app_version` | Build |

### 4.2 Added for action anchors

| Field | Source |
|---|---|
| `action_id`, `action_kind`, `op_id`, `sa_id` | Action record |
| `plan` | Command payload |
| `preconditions` | Validation checks that passed, with rule refs |
| `costs` | `CostPaid` entries |
| `validation` | Violations and warnings at submit |
| `state_changes` | Compact diff: tracks, pieces, levels, markers, Control |
| `calculations` | Die rolls, activation counts, removal counts |
| `rule_refs`, `assumption_refs` | From log entries |
| `rule_sources` | Research references of those rules (from the package) |
| `legal_choices_summary` | For proposed and decision anchors: legal boxes, actions and answers at note time |

### 4.3 Size control

Context JSON stores values, not full state. The full state is reachable by `state_hash`. Target size: under 8 KB per note.

### 4.4 Prompted notes (optional, off by default)

The research logging sheet asks two per-round questions (12 s4 items 4 and 13). A setting adds a one-line prompt at each Propaganda round: "Did Legal Space or Offices change a decision this round? y/n" and stores the answer as an annotation with category `legal-politics-signal`.

## 5. Categories

Seed list (configurable, 06-playtest-data-model.md s3.9):

| ID | Label | Hotkey |
|---|---|---|
| `balance` | Balance concern | Alt+1 |
| `rule-ambiguity` | Rule ambiguity | Alt+2 |
| `historical` | Unrealistic historical behavior | Alt+3 |
| `dull-decision` | Uninteresting decision | Alt+4 |
| `overpowered` | Overpowered action | Alt+5 |
| `underpowered` | Underpowered action | Alt+6 |
| `missing-mechanic` | Missing mechanic | Alt+7 |
| `pacing` | Game pacing | Alt+8 |
| `event-card` | Event-card issue | Alt+9 |
| `victory` | Victory-condition issue | none |
| `ui` | User interface issue | none |
| `bug` | Software bug | none |
| `idea` | Improvement idea | none |
| `general` | General observation | default |
| `alternative` | Best alternative and why (research sheet item 4) | none |

A note may have zero or more categories. Zero means `general`.

Optional fields after save (inline edit in the history view): `severity` (low, medium, high), `status` (open, addressed, wontfix), `addressed_in_version`, free tags.

## 6. Unified history

The history view merges two streams by `(action seq, entry n, created_at)`:

1. Log entries (card reveals, choices, costs, effects, rolls, Control changes, phases, score checks, undo markers).
2. Annotations.

Each annotation sits right after the action it anchors to. Proposed and state notes sit at the point where they were written. Undone actions stay in the list, struck through.

Filters on the history view: action kind, faction, card, space, "notes only", "rules with PA only".

## 7. Feedback review screen

A separate screen for notes across sessions.

| Feature | Detail |
|---|---|
| Table columns | Time, session, version, turn position, faction, card, action, space, categories, text (first line), status |
| Filters | Faction, action ID, card ID, space ID, category, package version, ruleset version, session, anchor, status, date range |
| Search | Full text on note text (SQLite FTS5) |
| Row detail | Full text, full context, linked log entries, state changes, rule refs with research sources |
| Open state | Read-only board view at `state_hash` (before and after for executed notes) |
| Bulk actions | Set status, add tag, export selection, create regression case |

No charts in MVP.

## 8. Exports

### 8.1 JSON (MVP)

One file per export. Schema `coin-sim-export/1`.

| Top-level key | Content |
|---|---|
| `exportMeta` | App version, export time, filter used, schema version |
| `packages` | Each package version referenced: manifest, hash, parameters, assumption list, rule index with research sources |
| `sessions` | Session rows with result and record sheet |
| `branches` | Branch rows referenced by sessions, actions and notes |
| `categories` | Category rows referenced by notes, including user-defined labels and inactive ones |
| `actions` | Action rows with commands and log entries |
| `states` | Always one record per referenced hash with its derived view (Control, tracks, scores, Harm counts). Full canonical content only with `--with-states` |
| `annotations` | Annotation rows with context |
| `metrics` | Per-round metrics |
| `index` | Maps from annotation to action, state, rules and package |

Relationships use IDs only. A validator checks that every reference in the file resolves inside the file (09-testing-and-replay.md, T-EXP).

### 8.2 Markdown (Phase 4, minimal form in Phase 2)

Structure for one or more sessions:

1. Header: export scope, versions, scenario, seed, result.
2. Active prototype assumptions.
3. Per session: a compact action log (one line per action) with notes inlined under their action.
4. Notes grouped by category, each with turn position, faction, card, action summary, state changes and rule refs with research sources.
5. Per-round metrics table.
6. Action use counts per faction.

The Markdown is written for an AI assistant. Each note line carries IDs in brackets, for example `[A-0042; DK-017; rule state.sweep; PA-07]`.

### 8.3 CSV (Phase 4)

Two files: `annotations.csv` (one row per note with flattened context) and `actions.csv` (one row per action with costs and key changes).

## 9. Notes as regression sources

1. From a note's detail view, "Make regression case" creates a case from session start to the linked action.
2. The case stores expectations taken from that action: the effects that the note complained about.
3. After a rules change, running the case shows whether those effects changed (09-testing-and-replay.md, section 7).
4. The note's status can move to `addressed` with the version that changed the outcome.

## 10. Acceptance tests for this spec

| ID | Test |
|---|---|
| T-ANN-01 | A note saved within 20 seconds after an action has `anchor: executed` and that action's ID |
| T-ANN-02 | A note saved with a drafted illegal plan has `anchor: proposed`, the plan and the violations |
| T-ANN-03 | Every field in section 4.1 is non-null when the source has a value |
| T-ANN-04 | Saving a note does not change `state_hash` |
| T-ANN-05 | After undo, the note still opens its original before and after states |
| T-ANN-06 | Filter by space returns notes whose `selected_space` or action locations include that space |
| T-ANN-07 | JSON export of a session with notes passes reference validation |

Next step: read 08-ui-ux-spec.md.
