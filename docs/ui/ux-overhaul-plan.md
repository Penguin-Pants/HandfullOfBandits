# Map and UX overhaul

Final revision: prototype 03 is approved and integrated. It supersedes the initial constrained-space rail: only Europe and Western Cities use remote panels. See `ux-overhaul.md` and `ux-overhaul-progress.md` for the final design and verification.

## Architecture and safe edit boundary

The React 19 client uses SVG terrain and hit areas (`sim/src/ui/board`). `atlas-data.ts` owns presentation paths, polygon rings and old label/counter rectangles. `region.ts` matches the atlas only to its original coordinates; old saved layouts and other packages use the existing Voronoi fallback. Terrain images and international borders are independent layers. `Play.tsx` owns selection, shared operation plans, notes and overlays. Server views supply population, control, levels, counts and scores. The legal endpoint supplies action choices and eligible locations; validation supplies previews. SQLite sessions retain full engine state and package snapshots.

Only UI rendering, presentation geometry and UI tests may change. Engine, server, package, scenario and storage files must remain unchanged. Visual contact never creates a legal link. Existing approved geography already has tests for all 20 domestic land borders, the city hole and international exceptions.

## Baseline defects and priorities

| Priority | Defect | Change and dependency |
| --- | --- | --- |
| P0 | Atlas force stacks shrink to unreadable sizes; badges compress text | Establish minimum-size information layouts before styling |
| P1 | Small city and hinterland labels; fragmented information anchors | Deterministic interior layout with explicit constrained-space treatment |
| P1 | Resources take 240 px from map width; tools occupy the board | Dedicated tool row and compact resource strip |
| P1 | Next action competes with cards and event text | Task guide before supporting card information |
| P1 | No zoom, pan, reset or display layers | Presentation-only navigation and modes |

## Work sequence and acceptance

1. Audit: inspect baseline browser rendering and establish regression status. Record screenshots and environment issues.
2. Geometry: retain proven shared geography, simplify only where validation justifies it, validate paths, rings, anchors and independent hit areas. Establish structured presentation layout for all 18 spaces.
3. Information: minimum-size labels, compact control and full political meaning, counted forces and deterministic dense overflow with complete inspection access. No random placement or force shrinking.
4. Cartography and shell: retain parchment relief, separate boundary weights, compact trackers and arrange the sidebar by player task. Keep all resources, card wording and inventories accessible.
5. Interaction: selection inspector, server-supplied target emphasis, existing validation previews, zoom/pan/reset and Full/Forces/Political/Terrain modes. Preserve notes and shortcuts.

## Verification and review

Run `make check`, `make test`, production build and real Chromium workflows. Check 1920×1080, 1536×864 CSS pixels (1920×1080 at 125%), 2560×1440 and 1366×768. Inspect normal, selected, mixed/dense, empty, layer-mode and narrow states. Test keyboard selection, map navigation, both factions, preview/commit, undo, notes, scenario completion and persisted resume/export. Geometry tests must retain canonical land-border equivalence and the separate city hole.

Review the full diff in two passes: correctness and simplicity. Use independent technical and visual reviewers after implementation. Resolve P0/P1 findings, then rerun affected checks. Keep concrete evidence and any remaining blockers in `ux-overhaul-progress.md`.

## Risks

The atlas is used by saved sessions: preserve coordinate matching and fallback. SVG scaling can invalidate apparent font sizes: measure rendered text in Chromium. Dense stacks need bounded layout without dropping counts: inspection must remain immediate. Context highlights are candidate locations from the API, never a claim that an arbitrary plan is legal. Validation remains the only commit authority.
