# UX review prompt

Task: simplify the Handful of Bandits UI. Produce a short analysis, then a plan. Do not edit code until the plan is approved.

## Read only these

- `docs/ui/ux-review-screenshots/` (6 screenshots of the current UI at 1600x900)
- `sim/src/ui/` (the React UI source)
- `sim/src/ui/styles.css`

## Ignore completely

Do not open anything else in `docs/ui/`. It is old and no longer valid. This includes `coin-visual-redesign*`, `europe-track/`, `ui-readability/`, `ux-overhaul*` and all older screenshots, JSON and plans.

## Goals

1. Make the screen cleaner. Remove or merge elements that do not help the next game decision.
2. Give the map more screen space. Target: the map is the largest element at 1366x768 and 1920x1080.
3. Add a classic toolbar at the top (menu bar with drop-down menus) for all non-game features. Candidates seen in the screenshots: Home, Feedback review, Fit map, zoom, Full, Political, Terrain, Key, Tracks, Hide Covert, Hide actions, Fullscreen, Map only, Bot level, Help, History, Note, Undo, End session.
4. Keep game actions (eligibility boxes, Commit, Clear, Pass, Execute card) in the side panel or on the map.

## Constraints

- Keep all current features reachable. Moving into a menu is allowed. Deleting is not, unless you justify it.
- Keep keyboard shortcuts (M, N, H, ?, Ctrl+Z, Esc, Enter) working and show them in the menu items.
- Text stays at least 16 px.
- Run `make check`, `make test` and `make ux` before you finish.

## Output

1. Findings: max 8 items, each cites a screenshot number.
2. Proposed layout: one Mermaid diagram or ASCII sketch.
3. Menu structure: menu name, items, shortcut.
4. Implementation plan: max 5 steps, each with files touched.
