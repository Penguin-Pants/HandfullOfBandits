# Readable atlas layout: TWO-PASS REVIEW

Status: complete, 2 November 2026. Decision: DEC-61. The designer approved the corrected interim mockup on 1 November. Confidence in the verified implementation: high.

## Scope, dependencies and acceptance

This presentation phase depends on DEC-60, its province outlines, research 03 §2/§4 and existing board interactions. The accepted layout uses the map width for playable areas, larger interior names and counters, a top ribbon for Western Cities and Europe and sidebar resource summaries. The original province network must remain coherent without overlapping domestic interiors. The city circle, sourced Lake Van, separate country borders, all 18 selectable spaces and all 25 legal links remain usable. Rules and saved sessions must remain compatible.

Implementation uses a common display projection of the approved province outlines. It removes the local rectangular expansion patches from the earlier readable mockup. Shared boundaries draw once. The city circle remains separate from the hinterland. Main names use 19-unit text, counter words 12 and normal counts 17; dense stacks continue to fit their reserved rectangles. Both off-map spaces remain interactive. Resources retain their existing full scales in native disclosures. Full card titles remain beside the smaller deck and discard display. All game values come from the server view.

## Pass 1: correctness

After local tests passed, traced the complete phase diff from Play and StateViewer into Board, atlas matching, paths, clipping, live information, pieces, markers and tracks. Traced Play's map-only and normal sidebar branches and CardTable's title display. Matching retains original package coordinates, so the display projection does not change saved state. Generic cells still serve other layouts. SVG screen-matrix inversion still maps clicks and drags into display coordinates.

Geometry tests verify all 20 domestic land adjacencies, city/hinterland separation, the KDP/Syria frontier and absence of a Mardin/KDP edge. Grid sampling checks for overlapping domestic interiors. Browser measurements check rendered labels, population, counters and stacks against their actual area paths, plus counter-word widths and name/population separation. Browser checks exercise the top ribbon, keyboard disclosures, Shift selection and drag planning. Empty stacks return no graphics; dense stacks retain the existing fit behavior and complete values in detail.

- **Fix:** Space on a focused resource summary could bubble into Play's Advance shortcut. The real-caller regression reproduced an API submission before the fix. Stopping propagation on Space preserves the native disclosure action and prevents Advance; the regression and browser check pass.
- **Fix:** the Western Cities label overlapped its population square. The measured browser assertion reproduced it; adjusted ribbon spacing passes the name/population separation check.
- **Fix:** the temporary full/compact TrackCard switch retained an unused layout. All runtime callers now use the reviewed disclosures; the old branch, option and unused label CSS were removed.
- **Drop:** no remaining border-overlap, legal-link, city hit-target, drag or save-compatibility defect reproduced in geometry, replay and browser validation. Generic fallback remains covered.
- **Propose/Decide:** none. The accepted interim appearance needs no new product decision. Existing Scenario A designer playtesting and later-campaign work remain open in the plan.

## Pass 2: simplicity

Reused PieceIcon, MarkerChips, level labels, existing Scale, board selection and drag planning. Presentation coordinates remain static data. No runtime GIS, geography fetch, new dependency or embedded mock setup is added. Replaced the old generated inset layout with the same static layout data used by the map. Removed unused country-name and track-name CSS after checking references. Kept the generic renderer because older layouts and other packages call it. One-time generation scripts are not committed.

No production filesystem code changes. Existing public asset URLs work with the same Vite build. Linux and installed Chromium were exercised; Windows execution is not available in this environment.

## Validation and phase status

The initial readable-layout assertions failed before implementation. The Space/Advance regression also failed before correction. Final validation after fixes:

- `make test`: 836 tests in 63 files pass, including unchanged golden replays and the new layout, topology and keyboard regressions.
- `make check`: TypeScript and ESLint pass. `git diff --check` passes.
- `HOB_CHROMIUM=/usr/bin/chromium make e2e`: production build and full S0/Scenario A browser smoke pass. Checks cover 1908 × 904 readability and containment, loaded artwork, separate country borders, city separation, ribbon selection, track expansion, dark-theme contrast, map-only mode, narrower layouts, drag plans, action commit, note, undo, export and both Scenario A rounds. The existing large-bundle advisory is non-blocking.
- Package validation retains hash `1565e7a338b2f810ba612fbf4a297c0d0ba6c19db658b8f4703802b0730b0720`. Scenario A has no blockers. Existing full-campaign/C3–C5 exclusions remain expected. No engine source, package YAML or golden replay changes.

All phase acceptance criteria pass. No blockers or proposed out-of-scope fixes remain. IC-3a still needs the designer's full Scenario A game and notes. This phase does not complete later campaigns or rebuild the historical printed map or rulebook. Prior PRs #35 and #36 are merged; this branch starts from main at dd30e64.
