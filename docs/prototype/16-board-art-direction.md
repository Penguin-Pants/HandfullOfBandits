# Board art direction

Source: the designer's attached visual reference and instructions, 2026-10-31. DEC-59 supersedes the prior plain/no-relief styling constraint. Research 03, `map.yaml` and the engine remain authoritative for geography and gameplay.

## Implemented

The simulator and printed draft use light ivory and warm parchment, fine brown boundaries, muted slate-blue water, serif map labels and illustrated mountain/foothill relief. The generated artwork contains no reference labels, boundaries, routes, pieces, counters or panels. It approximates a regional terrain atmosphere; it is not surveyed elevation and supplies no game rule.

`game-packages/kurdish-coin/0.1.0/map/atlas-terrain.png` is shared artwork. The adjacent `draft-map.svg` references it beneath independent labels, river vectors and existing game polygons. Keep both files together when sharing the printed board. The SVG remains a draft at its existing 1366 by 768 size. No region path, location or adjacency changed.

`sim/src/ui/board/Terrain.tsx` displays the same artwork independently of the selectable region layer. Existing game terrain tags control stronger Mountain masks. Rivers and Lake Van retain their existing vector geometry. Labels, pieces, markers, selection outlines, movement arrows and tracks remain separate. Support/Opposition fills use a lighter tint; explicit level markers remain visible. Board colors remain light in either application theme. No runtime dependency, schema or rule value changed. The ruleset remains R3 and existing golden replays remain valid.

Vite's public asset directory points at the package map directory, so development and production serve the same files without importing package code into UI layers. The HTTP static handler supplies PNG MIME metadata. No new endpoint or game flow was added.

## TWO-PASS REVIEW

Pass 1 traced Board to Terrain, the public image request through Vite/build and HTTP serving, clipping through existing region geometry and printed SVG image references. Checked selection, drag arrows, Support/Opposition, both application themes, host tracks, responsive layout, resume, undo and exported notes through the existing browser acceptance flow. Compared all region path IDs and coordinates against the prior SVG; all 18 paths are identical. The existing map test confirms all and only 25 research borders. Existing CLI goldens pass unchanged. Browser previews were inspected for label and boundary visibility.

- Fix: passive level badges inherited the dark application's panel fill. The new 4.5:1 contrast assertion failed before the fix. Map-local light panel colors restore legibility and the assertion passes. Confidence: high.
- Drop: no new rule or topology defect reproduced. Artwork has no role in engine validation, location selection or adjacency.
- Propose: none added.
- Decide: none added. IC-3a remains open for the designer playthrough.

Pass 2 removed the replaced procedural noise filter and its obsolete style variables. The existing Terrain function moved into its own module; geometry helpers, clipping and overlays are reused. One PNG serves both boards. No duplicate raster, new package dependency or generated script remains in the repository.

Validation: `make check`; `make test` (807 tests across 62 files); UI production build and complete `make e2e` flow with installed Chromium. Browser assertions verify the independent artwork decodes and all level labels meet 4.5:1 contrast in dark mode. Light/dark simulator and printed SVG were also rendered for visual inspection. Linux verified; Windows execution not available. Public asset paths use file URL helpers.
