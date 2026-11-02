# Approved simulator atlas

Designer approval: option 3 refinement 2, then the Lake Van and KDP–Syria alignment correction, 1 November 2026. Implementation decision: DEC-60 in `docs/prototype/13-design-decisions.md`.

The runtime geometry and interior layouts are in `sim/src/ui/board/atlas-data.ts`. They are static presentation data. The package's 18 space IDs, 25 legal links, layout coordinates, rule values and hashes remain unchanged. The printed `draft-map.svg` and its package polygons remain the earlier schematic research artifact; the interactive simulator now uses the approved atlas.

## Geographical sources

Natural Earth data is [public domain](https://www.naturalearthdata.com/about/terms-of-use/). The following GeoJSON sources were retrieved on 1 November 2026:

- [Countries, 1:50m](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson): Turkey, Syria, Iraq and Iran. Full source SHA-256: `3e458fc036ad0a66411f2c1e6cac49c5d7bfb81cb1123bc513b22511a2b7fdeb`.
- [Provinces, 1:10m](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_1_states_provinces.geojson): Turkey's 81 provinces. Grouped exactly as research 03 §2 specifies, using coverage simplification at 0.085 degrees with exterior preservation, then rounding the shared edge network. The approved playable borders are schematic rather than survey boundaries.
- [Lakes, 1:10m](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_lakes.geojson): Lake Van, Natural Earth ID `1159126829`. The sourced shoreline replaces the previous approximate polygon.

Projection into board coordinates: `x = (longitude - 37.3) * 108 + 150`, `y = (40.4 - latitude) * 150`.

The curve network was sampled and polygonized into shared faces before label fitting. Those same faces draw the clickable areas, including the hole in Diyarbakir hinterland around the separate city circle. Domestic border tests verify all and only the 20 research land links. International borders have a separate slate dash-dot layer. They do not add movement links. KDP and Syria-Bekaa share the sourced Iraq–Syria frontier; the KDP/PUK dividing curve remains schematic and both zones are clipped to Iraq. This is not a reconstruction of party territorial control.

## Artwork and labels

`atlas-terrain.png` is the previously approved generated terrain illustration. `diyarbakir-city.png` is a generated sepia city illustration, not a historical photograph. Its prompt requested the basalt walls, old town and Ulu Cami of Diyarbakir, without text or game elements. It is rendered at 30% opacity inside the circular city space. Names, population, pieces, Control, Support/Opposition and markers are rendered separately from both images.

The approved UI names are `Diyarbakir` and `Diyarbakir hinterland`. The server applies these presentation names to Kurdish views, including saved sessions. Stored package names remain unchanged for replay and hash compatibility. The earlier printed draft and rulebook remain historical artifacts with their existing names.

Display B uses a printed population square and separate square Control and Support/Opposition holding boxes. Empty boxes mean No Control and Neutral. Passive markers print ×1; Active markers print ×2. All values come from the current server view. No illustrative setup state is embedded in the renderer. Piece/marker groups scale into reserved interior stack rectangles. External postures and Europe's track remain visible. River lines are removed.

## Readable simulator layout (DEC-61)

The designer approved the corrected interim layout on 1 November 2026. Implementation and validation completed on 2 November. The original DEC-60 province outlines remain the source. A common display projection widens the playable region and removes the empty western column: `x′ = 10 + sign(x − 163) × abs((x − 163) / 837)^1.22 × 1366`, `y′ = y − 60`. The body measures 1386 × 640 units with a 58-unit off-map ribbon above it. This is a schematic display projection, not a change to geographical evidence or movement permissions. No individual province receives a rectangular expansion patch. Shared area edges form a single drawn network. The enlarged city circle stays inside the full Diyarbakir province; its interior is excluded from the hinterland.

Western Cities and Europe use the top ribbon. Main area names use 19-unit text, counter words 12 and normal piece counts 17. Live population and statuses stay separate from the artwork. Dense stacks still fit their reserved rectangles; space detail retains full values. Resources and politics use sidebar summaries with the existing full scales on expansion. Space toggles a focused summary without advancing the game. The map-only view retains optional tracks. The generic renderer remains for other packages and old schematic layouts.

The package coordinates and YAML are unchanged. The original 18 IDs, 25 legal links, package hash and engine fingerprint are unchanged. Browser checks measure containment and readable sizes at 1908 × 904 and exercise narrower layouts. The historical printed draft and rulebook are not rebuilt in this presentation phase.

## Approved on-map prototype 03

The React board uses manually reshaped schematic areas approved after prototype review, with all 20 domestic borders checked against the existing land-link graph. The original package coordinates, links, country roles and Lake Van source remain unchanged. Shared-border construction is recorded in `docs/ux-overhaul/approved-map-geometry.json`. Malatya is hatched outside-play context between Adıyaman and Elazığ. The existing city asset is clipped inside the city circle at 30% opacity.
