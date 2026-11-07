# Vertical Europe track

Europe is now a read-only vertical scale in the left map margin. All six values appear, with 5 at the top and 0 at the bottom. A teal circle and Current label mark the live value. Western Cities retains its space frame and normal interactions.

Europe has no playable hit area, control banner or piece counters. Its accessible meter announces the value and range. Keyboard focus brings the scale into view. The existing map search groups Europe track separately from spaces and pans to it without changing the operation plan or space selection. The track remains visible in every display mode and in the schematic fallback.

The server's existing range and value supply the scale. No rules, package data, geography, server APIs or saved formats change. The previously approved resource cards, compact sidebar, larger controls, fullscreen and action toggle remain intact.

Validation:

- All 229 UI tests passed across 25 files, including current values 0, 3 and 5, read-only behavior and Western Cities selection.
- `make check` and production builds passed.
- `HOB_CHROMIUM=/usr/bin/chromium make e2e` passed.
- `DISPLAY=:99 HOB_SCREENSHOTS=/workspace/work/europe-evidence make ux` passed. Checks include all six nodes, the current marker, focus visibility, legacy layouts and the existing native fullscreen, zoom and decision checks.
- Correctness and simplicity reviews completed; `git diff --check` passed.

[Board overview](overview.png) · [Focused Europe track](focused.png)
