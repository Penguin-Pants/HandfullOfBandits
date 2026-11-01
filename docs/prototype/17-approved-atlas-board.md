# Approved interactive atlas: TWO-PASS REVIEW

Status: complete, 1 November 2026. The designer selected option 3 refinement 2, requested Lake Van's actual outline and a shared KDP–Syria frontier, then approved implementation. Decision: DEC-60. Confidence in the verified implementation: high.

## Requirements and scope

The simulator uses the approved closer regional atlas: gently bent province-based playable areas, a separate slate dash-dot layer for Turkey, Syria, Iraq and Iran, sourced Lake Van, no river lines and a circular illustrated Diyarbakir enclosed by Diyarbakir hinterland. The labels use the exact approved spelling. Display B prints population and uses separate live Control and Support/Opposition holding boxes. Empty slots mean No Control and Neutral; Passive and Active print ×1 and ×2.

All 18 locations remain present. The Western Cities domestic inset receives display B too. Europe and host-posture tracks remain visible. The interactive viewport includes the inset and the bottom posture tracks, extending slightly beyond the static preview's crop. No illustrative setup counters are embedded in the runtime assets. Pieces and markers fit reserved interior rectangles, scaling when stacks grow.

Gameplay keeps all 25 authoritative links, including exactly 20 domestic land links. Country lines do not add movement permissions. The KDP/Syria shared edge is for orientation. The printed draft and rulebook remain historical artifacts outside this simulator phase. Natural Earth sources, projection, licence and generated-art provenance are recorded in `game-packages/kurdish-coin/0.1.0/map/SOURCES.md`.

## Pass 1: correctness

Traced `boardView` through `Play` and `StateViewer` into `Board`, the package-layout match, selectable SVG paths, `AtlasInfo`, the existing piece/marker renderers and the separate decorative geography layer. The same area paths draw the selectable interiors and outlines. The hinterland explicitly uses even-odd fill so it cannot capture clicks on the enclosed city. Pointer selection, Shift selection, keyboard selection, drag planning and arrows continue to use space IDs. Decorations ignore pointer events.

Verified the approved domestic border graph against the research links and verified that city and hinterland interiors are distinct. KDP and Syria share their geographical frontier while the game graph still has no direct Syria–KDP or Mardin–KDP movement link. Actual browser text bounds, counter rectangles and rendered stacks fit their playable areas. Names and values are separate from the terrain and city artwork. Van-Bitlis information is beside the sourced lake rather than across its shoreline.

The view applies the two approved Kurdish display names without changing package YAML, stored names, package content hashes, state transitions or golden replays. Older views with the same geographical layout receive the atlas; older schematic layouts and other packages retain generated cells. Public asset URLs use the existing Vite public directory. The optional `HOB_CHROMIUM` smoke-test override supports installed Chromium while leaving the normal Playwright default intact. No filesystem-dependent production code is added.

- **Fix:** empty clipped country segments generated consecutive `M` commands, making the country path invisible. The new path assertion failed against that data. Removing empty segments fixed it; the browser now also checks a rendered frontier length greater than 500 map units. The inspected result is about 2164 units.
- **Fix:** long counter words extended beyond their printed squares. A browser measurement reproduced the overflow. Long words now fit the counter width, while short faction names retain their natural width. The browser checks every counter word at the 1366-pixel layout.
- **Fix:** applying display B only to geographical spaces would leave Western Cities without its printed population or holding boxes. The inset now uses the same live counter component; the render assertion covers all 17 information groups, and browser containment covers the inset too.
- **Drop:** no rule, replay, legal-link, city-selection or drag-planning defect remains. Geometry, both golden replays and browser interaction checks pass.
- **Decide:** none. The designer supplied the visual choices and final approval. **Propose:** none added. Existing Scenario A playtest and later-campaign tasks remain in the plan.

## Pass 2: simplicity

Retained the existing Board selection/drag implementation, PieceIcon, MarkerChips, level labels, posture tracks, legend and generic Voronoi helper. The new atlas data contains presentation geometry and placement only. The runtime does not need GIS libraries, image-generation services, geography downloads or new dependencies. The one-time generation script was removed after producing the checked-in data and city asset.

Removed the old approximate Turkey outline, hand-drawn lake, river coordinates, river rendering/CSS and obsolete border-clipping branches. Kept the generic renderer because it serves other packages and older schematic saves. Removed the duplicate detail-name alias after confirming that the shared server view already provides the approved names throughout the UI. Historical printed map data is not silently migrated.

## Validation and phase status

The initial three approved-board assertions failed before implementation and passed afterward. The country-path regression also failed before its correction.

- `make test`: 831 tests in 63 files pass, including the unchanged R4 golden replays and new atlas topology/containment coverage. After the final counter text correction, all 32 focused board/geometry tests pass again.
- `make check`: TypeScript and ESLint pass after the final correction. `git diff --check` passes.
- `HOB_CHROMIUM=/usr/bin/chromium make e2e`: production build and every S0/Scenario A browser assertion pass after the final correction. Checks cover loaded assets, rendered country lines, city/hinterland hit separation, interior labels/counters/stacks, counter word widths, dark-theme contrast, responsive layout, drag-to-plan, action commit, note, undo, export and both Scenario A rounds.
- Package validation retains hash `1565e7a338b2f810ba612fbf4a297c0d0ba6c19db658b8f4703802b0730b0720`. Scenario A has no blockers. The existing unencoded full-campaign/C3–C5 exclusions remain expected. No package or golden file changed.
- The actual game UI and map-only view were rendered for visual review. Linux and installed Chromium are verified; Windows execution and a physical print are not available here. The build's large-chunk advisory is non-blocking; geometry is bundled locally and requires no runtime fetch.

This presentation phase is complete. There are no open blockers or proposed out-of-scope fixes. IC-3a still requires the designer's full Scenario A playthrough and notes; this visual phase does not close it or start Phase 3b. The atlas branch starts from DD-21 PR #35 and its PR targets that branch until #35 is integrated.
