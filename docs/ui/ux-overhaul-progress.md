# Approved map integration review

The approved prototype 03 replaces the earlier domestic panel rail. The final city-background correction is included. All 18 spaces remain selectable. Only Europe and Western Cities use off-map panels. Rules, server, package and storage files remain unchanged.

## Two-pass review

Correctness review traced the board caller, atlas guard, shared paths, live information, posture tracks, search/focus camera, selection and drag planning. The domestic-border test compares displayed adjacency against all 20 authoritative land links. Country boundaries remain decorative and all 25 rules links remain authoritative. The city hole preserves independent city/hinterland hit areas. Malatya is non-selectable context.

| Finding | Outcome |
| --- | --- |
| Domestic information in remote panels | Fix: replaced the rail with the approved area shapes and on-map anchors. A regression requires exactly the two approved remote panels |
| Unlabeled gap between Adıyaman and Elazığ | Fix: labeled and hatched Malatya outside play; no new rules space or link |
| Hinterland selection implied a city connection | Fix: highlight only the hinterland's outer rim. Exact Elazığ-neighbor regression excludes the city |
| Restored city illustration | Fix: original city asset at 30% opacity, clipped inside its circle below live labels and counters |
| Posture tracks below the map | Fix: position each track below its actual force rows. Browser geometry checks every track against its space |
| Label and count readability | Fix: browser-measured type sizes, Elazığ glyph clearance and count/label separation across the viewport matrix |
| CLI tests blocked from starting subprocesses | Environment: rerun the full suite with subprocess access |

Simplicity review removed the domestic callout rail, interior-placement solver and stale callout styles. The existing PieceIcon, selection handlers, legal API, operation plans and schematic fallback remain in use. No new application dependency was added. Confidence in the verified implementation: high.

## Validation

The full suite passes 857 tests across 65 files. Static checks and both browser suites are recorded with the final screenshots and `screenshots/validation.json`. Browser coverage includes normal/dense/empty states, region and posture containment, no overlapping map text, normal force visibility, the viewport matrix, display layers, mouse and keyboard navigation, candidate targeting, legacy fallback and gameplay.

The smallest viewport starts with a partial board view to preserve readable type. Dense contents use explicit overflow plus complete inspection. The 125% case is browser emulation. Repository CI supplies the separate Windows and Node-version checks.
