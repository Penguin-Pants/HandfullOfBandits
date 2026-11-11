# Handful of Bandits: implemented visual system

Implements `docs/coin-visual-redesign.md`. Geometry, identifiers, links, rules and game state are unchanged.

## Architecture

- The React 19 and SVG board is kept. The design adds no canvas, no 3D engine and no new dependency.
- Static raster layers sit below the existing vector paths. The existing area paths from `sim/src/ui/board/atlas-data.ts` clip them. That file is unchanged and stays the single source of geometry.
- Assets are served from `game-packages/kurdish-coin/0.1.0/map/`, the Vite public folder.
- `sim/src/server/app.ts` has one added MIME entry for `.webp`.
- Other packages and old schematic saves keep the schematic fallback. It uses flat shapes or compact 30-unit sprites.

## Layer order (bottom to top)

1. Terrain textures (`Terrain.tsx`):
   - `board-outside.webp` covers the full board.
   - `board-highland.webp` at 42% opacity covers external Mountain spaces.
   - `board-plains.webp` covers domestic Plain spaces.
   - `board-highland.webp` covers domestic Mountain spaces.
2. Left inset band, Malatya hatch (outside play), area fills and the city circle. The city circle uses the earlier sepia city artwork at 30% opacity.
3. Area borders, Lake Van, national border and country names (`Board.tsx`, `Atlas.tsx`).
4. Printed information: area names, Control counter, population square, Support or Opposition counter and tracks.
5. Pieces and marker chips. Then selection and planned-move arrows. Then HTML panels.

## Palette

| Element | Value |
|---|---|
| Highland (mean) | About #96754F, warm brown, shaded relief |
| Plains | About #C1B37B, ochre with olive mottling |
| Outside play | About #CEC9BA, neutral gray-beige |
| Area border | Cream #f4ecd6 line, 2.2 px, over dark #2e2114 casing, 5.5 px |
| National border | #3f3a33 dash-dot, 2.6 px, over cream halo |
| Lake Van | Fill #93a8ad, stroke #5d747b |
| Labels | Ink #231d14 with cream #f6edd6 halo, Crimson Pro (`--label-font`) |
| State | #bd1f2c |
| Police shade | #db8496 |
| PKK | #26734e |
| Active Guerrilla emblem | Gold #e5be52 with a red star |
| Table behind board | #2a2622 |
| Panels | Parchment #f3ead6 with ink #2b241a |

## Pieces

Seven transparent PNG sprites sit in `map/pieces/`. Each is 192 x 192 px and 15 to 25 KB. The names are `troops`, `police`, `guards`, `state-base`, `pkk-base`, `guerrilla-underground` and `guerrilla-active`.

- One projection serves all sprites. It is orthographic, with the camera about 60 degrees above the horizon. Light comes from the upper left. The paint is matte with faint grain. A soft contact shadow is baked in. The top face center is at pixel (96, 84).
- `spriteOf` in `PieceIcon.tsx` maps faction, shape and color variant to a sprite. The `starCircle` emblem selects the active Guerrilla face.
- Shapes come from `pieces.yaml`: cube (Troops, Police), cylinder (Guards), disc (both Bases) and octagon (Guerrilla).
- On the atlas, a sprite is 54 map units. The T, P and G codes stay on State forces.
- An area draws its pieces one by one when all of them fit inside its border. One group shows at most 6 sprites. A group of 7 or more also prints its exact total. `spreadPlan` in `layout.ts` gives the positions.
- An area where the pieces do not fit shows piles: at most 3 piled sprites for one group, with the exact count. Thus one area can show single pieces while its neighbor shows piles.
- The accessible label of each group and the space inspector always give the exact count.
- Placement uses the existing deterministic grid in `Stack` in `Atlas.tsx`, with 46 x 33 unit cells. A group that would cross the area border becomes a "+N" overflow. The space inspector lists everything.

## Counters and feedback

- Control, population, Support or Opposition and marker chips are cardboard counters: a face and an offset dark shadow. No SVG filters are used.
- Active Support or Opposition uses a solid faction color with white text. Passive uses a pale tint. Neutral uses italic text with no counter.
- The selected border is drawn again above all area and country borders, so no neighbor border covers it.
- Selected area: gold #f0c54a border with a 20% gold tint. Rules neighbors: dashed pale teal border.
- Keyboard focus: white casing with a dark #12323d line. It is defined after the eligibility rules, so candidate spaces keep it.

## Layout and navigation

- The Play screen fills the viewport at 1101 px and wider, with no page scroll.
- Toolbar: one row (45 px) at 1920 and at 1366. The resources and politics card shows one summary row by default. The full scales open from the "Scales" disclosure.
- Side panel: 420 px at 1920. "Hide actions" and "Map only (M)" collapse it. Action drafts stay mounted.
- From 1101 to 1500 px the side panel (320 px) takes no layout column. It lies over the right part of the map window, below the track card and the toolbar. Those rows and the forces bar have the full width. The board keeps clear of the open panel, so no area is under it.
- From 1101 to 1500 px the caption below the map shows only while it reports candidate targets. Its fixed hints are in each area tooltip.
- In Map only, the summary row floats over the lower board margin. The space inspector is a floating card at the lower left of the map. Its × button closes it.
- Wheel zoom centers on the pointer, from 100% to 400%. Drag on the board background, middle-button drag and Alt-drag pan. A drag that starts on a space still plans a move. "Fit map" resets the camera.

Measured board share of the viewport:

- 0.64 at 1920 x 1080 with panels open.
- 0.94 at 1920 x 1080 in Map only.
- 0.60 at 1366 x 768 with panels open (0.44 before the overlay side panel).
- 0.87 at 1366 x 768 in Map only.

## Asset generation

- The textures and sprites were generated once with Python (Pillow and numpy).
- Terrain uses fractal noise with hillshade. Pieces use a supersampled software render.
- The scripts are not in the repository, under the repository rule for one-time scripts.
- The artwork is original. It copies no published game art.

## Verification

- `make check` is clean.
- `make test` passes: 1520 tests in 109 files. UI tests: 259 pass.
- `make e2e` (smoke, 36 checks) and `make ux` (76 checks) pass on Linux with Chromium. They cover both target sizes, page scroll, board area thresholds, wheel zoom, selection, drag planning, commit, undo, notes and export.
- No console errors.
- Screenshots in `docs/coin-visual-redesign/`:

At 1920 x 1080:

- [Before](coin-visual-redesign/before-1920.jpg)
- [After](coin-visual-redesign/after-1920.jpg)
- [After, Map only](coin-visual-redesign/after-1920-map-only.jpg)
- [After, zoomed and selected](coin-visual-redesign/after-1920-zoomed-selected.jpg)

At 1366 x 768:

- [After](coin-visual-redesign/after-1366.jpg)
- [After, Map only](coin-visual-redesign/after-1366-map-only.jpg)

## Known limitations

1. At 1366 x 768 with the side panel open, the board has 60.2% of the viewport. The margin above the 60% target is small. "Hide actions" or "Map only (M)" gives more board.
2. The terrain is an illustrative texture, not surveyed elevation. It carries no game rule.
3. The legacy printed draft `draft-map.svg` and the rulebook are not restyled.
4. Browser checks ran on Linux Chromium only. Windows runs `make check` and `make test` in CI.
5. Rendering speed was measured in headless Chromium only (software rendering, no GPU). See "Rendering speed".

## Rendering speed

- Target: a median frame time of 33 ms or less during drag pan and wheel zoom.
- Load: a synthetic dense view. Every area holds four groups of six pieces and three markers (149 sprite images on the board).
- Machine: 4-core Intel Xeon at 2.1 GHz, headless Chromium 153, no GPU.
- Result at 1920 x 1080 and at 1366 x 768: animation frames have a 16.7 ms median during zoom and pan. Frames drawn by the compositor during pan have a 16.7 ms median and a 95th percentile of about 21 ms.
- The target is met. No speed fix was necessary.
