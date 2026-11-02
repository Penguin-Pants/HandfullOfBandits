# Approved map and play UI

The approved prototype 03 is integrated into the React/SVG board. Every domestic space carries its own name, control, population, alignment and counted forces. Only Europe and Western Cities use the left off-map column. The circular Diyarbakir City retains its earlier sepia artwork at 30% opacity beneath live information.

Malatya fills the former unlabeled gap with grey hatching and an OUTSIDE PLAY label. It is decorative context, not a game space. Adıyaman and Elazığ do not share a border or a rules link. The 20 domestic land links and all 25 authoritative links remain unchanged. The provincial-border distinction is also documented in the [Turkish parliamentary record](https://www.tbmm.gov.tr/Milletvekili/UyeGenelKurulKonusmalariDetay?eid=104649).

## Board and interaction

The board uses parchment terrain, brown playable-area borders and slate dash-dot country boundaries. Selection is gold. Dashed teal outlines show the selected space's rules connections. Highlighting Diyarbakir hinterland leaves the enclosed city's boundary separate. A country frontier does not grant movement permission. Iran is labeled EVENTS ONLY and Europe TRACK ONLY.

Names use Georgia at 22 SVG units. Status uses 14-unit system type and population uses 16 units. Counted pieces retain their original shapes, with T/P/G letters on State cubes and 18-unit counts. Dense spaces show an explicit remaining-group count. Inspection keeps every piece, face, marker and count available.

Full, Forces, Political and Terrain modes change rendering only. Search, keyboard selection, zoom, pan and Fit map remain available in every mode. Smaller or shorter viewports start zoomed in to preserve readable type. Search and keyboard focus reveal the actual presentation position, including the remote panels. Mouse focus preserves the camera while selecting or dragging.

The resource strip remains above the map with expandable scales. The sidebar puts the current task and faction choices before the card archive and event text. Selected-space details remain available in the map inspector. The original validation, preview, commit, note, undo and export flows are retained.

## Geometry maintenance

`sim/src/ui/board/atlas-data.ts` contains presentation paths, sampled rings, information anchors and original package reference coordinates. `docs/ux-overhaul/approved-map-geometry.json` records the approved shared-border construction. Reversed shared curves use the same coordinates, avoiding seams. The city has an even-odd hole in the hinterland. Lake Van retains the sourced outline fitted inside Van-Bitlis.

`layout.ts` supplies the fixed approved information anchors and status hierarchy. Normal forces occupy a compact grid. Groups that would cross a boundary become explicit overflow, with full contents in inspection. The previous interior-placement solver and domestic panel rail were removed.

The atlas viewBox is `0 0 1280 960`. Other packages and older schematic saves retain their existing `0 0 1000 700` fallback. The atlas guard uses the original package coordinates, not the new display positions. No engine, server, storage, package YAML, golden replay or application dependency changes are required.

## Verification

Run `make check`, `make test`, `make e2e` and `make ux`. Browser checks use optional Playwright and `HOB_CHROMIUM=/usr/bin/chromium` in the review environment. They cover content containment, text collisions, normal force visibility, posture placement, four viewport sizes, keyboard and mouse navigation, dense/empty views, legacy rendering and gameplay.

Screenshots and the viewport report are in [ux-overhaul/screenshots](ux-overhaul/screenshots). The 125% case uses a 1536×864 CSS viewport and 1.25 device-pixel ratio. Dense and empty screenshots use synthetic view fixtures only. The approved standalone mock-up is in [ux-overhaul/approved-prototype.png](ux-overhaul/approved-prototype.png).

At 1366×768 the initial view shows part of the map at readable size. Fit, pan and search expose the full board. Linux/Chromium are verified locally; Windows is covered by repository CI rather than a local execution claim.
