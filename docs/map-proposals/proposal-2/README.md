# Proposal 2 v2: mockup for review

Status: design mockup only. No rules, package or simulator file changed.
Confidence: medium. Pop, terrain and Batman values are unverified design values.

## Open the mockup

- `index.html`: the map on one page.
- `map.png` and `map.svg`: the same map as image files.

## What changed from Proposal 2 v1

| # | Request | Result |
|---|---|---|
| 1 | Batman as a small city plus a Batman province | Batman City (Pop 1, small circle) and Batman hinterland (Plain, Pop 1). Siirt is now its own space (Mountain, Pop 1). "Siirt-Batman" no longer exists |
| 2 | Diyarbakır City overlaps other provinces and has no city art | Every city circle is now fitted fully inside its own province. A check confirms no circle touches another province. Diyarbakır City uses the game's `diyarbakir-city.png` at the same low opacity |
| 3 | City art for Batman and Van from real photos | Two real photos (CC BY-SA 4.0) converted to the sepia etching look. See `SOURCES.md` |

## Spaces (18 domestic)

| Space | Terrain | Pop |
|---|---|---:|
| Hakkari | Mountain | 1 |
| Şırnak | Mountain | 1 |
| Siirt | Mountain | 1 |
| Batman hinterland | Plain | 1 |
| Batman City | City | 1 |
| Mardin | Plain | 2 |
| Van hinterland | Mountain | 1 |
| Van City | City | 2 |
| Bitlis | Mountain | 1 |
| Muş | Mountain | 2 |
| Bingöl-Tunceli | Mountain | 2 |
| Elazığ | Plain | 2 |
| Diyarbakır hinterland | Plain | 2 |
| Diyarbakır City (Amed) | City | 2 |
| Şanlıurfa | Plain | 4 |
| Adıyaman | Plain | 2 |
| Ağrı-Iğdır | Mountain | 3 |
| Western Cities | City | 3 |

Total Pop 33 (v1 was 32). The extra point is Batman City.
Colonial Twilight has 25 Sectors and 3 Cities. This map has 14 non-city spaces and 4 cities.

## Links

30 land links computed from shared border length above 18 map units. Add the Van City to Hakkari link you set earlier: 31. Verify against an official province map before print.

## Display choices to check

1. **Local magnification near Batman.** Batman is the smallest space. At true scale its labels were unreadable (scale 0.35). The map applies a smooth 1.9x magnification inside a 330-unit radius around Batman. Borders stay shared and none cross. This is a schematic display change, like DEC-61. Neighbor shapes near Batman (Siirt, Bitlis, Mardin, Diyarbakır) stretch slightly.
2. **Frame.** 1700 x 960 units. Province shapes are 19 percent larger than in v1 so labels fit.
3. **City art opacity.** 42 percent over a parchment base for all three cities. The game uses 30 percent for Diyarbakır. Pick one value.
4. **Smallest label scales.** Batman City 0.55, Bitlis 0.65, Batman hinterland 0.7. Piece stacks still need a larger board or smaller pieces in these spaces.

## Unverified assumptions

- Batman City Pop 1 and Batman hinterland Pop 1. Batman province had 344,669 people in 1990 (research 03), which is Pop 1.4 at 250,000 per Pop. Two Pop 1 spaces overstate it. Needs your call.
- Terrain tags: Batman Plain, Siirt Mountain. Not source-checked.
- Real city locations are approximate. Circles are moved only as far as needed to stay inside their province.
- The mockup shows an empty board (No control, Neutral). Pieces are not drawn.
