# Map proposals: Kurdish-region provinces

Status: design mockups only. No rules, package, test or simulator file changed.
Confidence: medium. Shapes follow real province outlines. Pop, terrain and Iğdır are unverified design values.

## Open the mockup

- `index.html`: all three proposals on one page.
- `p1.png`, `p2.png`, `p3.png`: static renders (also `p1.svg` to `p3.svg`).

## What stayed the same

Board art, textures, borders, label style, counter style, Lake Van, Syria-Bekaa, KDP Zone, PUK Zone, Iran, Western Cities and Europe track.

## What changed

Number, name and shape of domestic spaces. Shapes come from Natural Earth 1:10m province polygons (public domain, same source as `game-packages/kurdish-coin/0.1.0/map/SOURCES.md`). Borders are simplified at 0.035 degrees with shared edges preserved. Projection: x = 185 + (lon - 37.55) * 168, y = 62 + (40.45 - lat) * 166. This is a new frame (1440 x 830), not the DEC-61 display projection.

## Comparison

| | Current | Proposal 1 | Proposal 2 | Proposal 3 |
|---|---:|---:|---:|---:|
| Name | n/a | Province for province | Paired provinces | Current groupings, real shapes |
| Domestic spaces | 13 | 19 | 16 | 14 |
| Cities | 2 | 3 | 3 | 3 |
| Total Pop | 32 | 32 | 32 | 33 |
| Domestic links (incl. Van City to Hakkari) | 20 | 33 | 28 | 22 |
| Colonial Twilight domestic spaces | 28 | 28 | 28 | 28 |
| Smallest label scale | 1.00 | 0.45 (Batman) | 0.60 | 0.60 |

Colonial Twilight has 25 Sectors and 3 Cities (counted from rulebook section 10 setup lists).

## Name corrections (all proposals)

| Current | Proposed | Reason |
|---|---|---|
| Botan | Şırnak (P1, P2), Şırnak-Siirt (P3) | Botan is a region name, not a province (`03-map-and-spaces.md` section 7) |
| Dersim | Tunceli (Dersim) | Province name first. Conflicts with DD-15.5, which prints Dersim as the space name. Needs a decision |
| Mardin-Batman | Mardin and Siirt-Batman (P2), Mardin and Batman (P1), unchanged (P3) | Splits two real provinces |
| Van-Bitlis | Van hinterland, Bitlis, Van City (P1, P2). Van-Bitlis hinterland, Van City (P3) | Van City added as a city |
| Ağrı | Ağrı and Iğdır (P1), Ağrı-Iğdır (P2, P3) | Iğdır is orange in the reference map |

## Proposal 1: Province for province

One space per province in the orange area. Densest option. Closest to Colonial Twilight sector granularity.

| Space | Terrain | Pop |
|---|---|---:|
| Hakkari | Mountain | 1 |
| Şırnak | Mountain | 1 |
| Siirt | Mountain | 1 |
| Van hinterland | Mountain | 1 |
| Bitlis | Mountain | 1 |
| Muş | Mountain | 2 |
| Bingöl | Mountain | 1 |
| Tunceli (Dersim) | Mountain | 1 |
| Elazığ | Plain | 2 |
| Batman | Plain | 1 |
| Mardin | Plain | 2 |
| Diyarbakır hinterland | Plain | 2 |
| Şanlıurfa | Plain | 4 |
| Adıyaman | Plain | 2 |
| Ağrı | Mountain | 2 |
| Iğdır | Mountain | 1 |
| Diyarbakır City | City | 2 |
| Van City | City | 2 |
| Western Cities | City | 3 |

- Pro: every space is one recognizable province. Names are exact.
- Con: Batman, Şırnak, Siirt and Iğdır render at label scale 0.45 to 0.6. Piece stacks will not fit at the current board size.
- Con: most spaces have Pop 1. Control swings are small per space.

## Proposal 2: Paired provinces

Neighbor provinces with Pop 1 pair up: Siirt-Batman, Bingöl-Tunceli, Ağrı-Iğdır. Şırnak, Hakkari, Van hinterland and Bitlis stay single.

| Space | Terrain | Pop |
|---|---|---:|
| Hakkari | Mountain | 1 |
| Şırnak | Mountain | 1 |
| Siirt-Batman | Mountain | 2 |
| Mardin | Plain | 2 |
| Van hinterland | Mountain | 1 |
| Bitlis | Mountain | 1 |
| Muş | Mountain | 2 |
| Bingöl-Tunceli | Mountain | 2 |
| Elazığ | Plain | 2 |
| Diyarbakır hinterland | Plain | 2 |
| Şanlıurfa | Plain | 4 |
| Adıyaman | Plain | 2 |
| Ağrı-Iğdır | Mountain | 3 |
| Diyarbakır City | City | 2 |
| Van City | City | 2 |
| Western Cities | City | 3 |

- Pro: no Pop 1 pair remains in a pair space. Labels stay readable.
- Con: Bingöl-Tunceli joins two separate bulbs of land. Tunceli (Dersim) loses its own name.

## Proposal 3: Current groupings, real shapes

Keeps today's 11 regions and 2 cities. Adds Van City and Iğdır. Redraws every shape from real provinces. Matches your decisions: Van City is Pop 2, Van-Bitlis hinterland is Pop 2, State Base moves to Van City, Van City links to Van-Bitlis hinterland and Hakkari.

| Space | Terrain | Pop |
|---|---|---:|
| Hakkari | Mountain | 1 |
| Şırnak-Siirt | Mountain | 2 |
| Mardin-Batman | Plain | 4 |
| Diyarbakır hinterland | Plain | 2 |
| Şanlıurfa | Plain | 4 |
| Adıyaman | Plain | 2 |
| Elazığ | Plain | 2 |
| Tunceli (Dersim) | Mountain | 1 |
| Bingöl-Muş | Mountain | 3 |
| Van-Bitlis hinterland | Mountain | 2 |
| Ağrı-Iğdır | Mountain | 3 |
| Diyarbakır City | City | 2 |
| Van City | City | 2 |
| Western Cities | City | 3 |

- Pro: smallest rules change. Existing Pop weights and links mostly stay.
- Con: Pop total rises to 33 (Iğdır adds 1). Van-Bitlis hinterland label sits at scale 0.6 because Lake Van and the city take most of the area.

## Open decisions

1. Which proposal. Recommendation: Proposal 2 (balanced). Confidence: low, no playtest.
2. Tunceli (Dersim) naming versus DD-15.5.
3. Iğdır in play. It became a province in 1992 (unverified assumption, check TÜİK or the Turkish Wikipedia article). The research window starts in 1984.
4. Kars, Erzurum, Kahramanmaraş and Gaziantep have small orange areas in the reference map. None is included. Malatya stays hatched as outside play.

## Unverified assumptions

- Pop: 1990 province totals from `03-map-and-spaces.md` divided by 250,000. Iğdır Pop 1 has no census source in the repo. Van City Pop 2 is your decision, not a census value.
- Terrain tags: carried over from `03-map-and-spaces.md`. Batman Plain, Siirt Mountain, Iğdır Mountain and Bingöl-Tunceli Mountain are new tags.
- Links: computed from shared border length above 18 map units. Verify against an official province map before print.
- Syria-Bekaa, KDP Zone, PUK Zone and Iran outlines are schematic clips of Natural Earth country polygons.
- The mockup shows an empty board (No control, Neutral). Pieces and markers are not drawn.
