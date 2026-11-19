# Card catalogue and print review

The catalogue covers all 99 unique card records in `game-packages/kurdish-coin/0.1.0/cards`: 16 in C1, 19 in C2, 18 in C3, 21 in C4 and 21 in C5, plus four Pivotal Events (one each in C1, C3, C4 and C5). Five campaign records are Propaganda cards. The campaign totals exclude Pivotal Events. Cards are ordered by stable ID.

## Files and printing

- **Card text has one source.** Titles, types and side text come from the package card files. Always lines come from the rules 5.4 table, plus the package note on DK-005 (evidence grade). Pivotals print their rules 5.3 condition row and effect paragraph. Propaganda cards print “Conduct a Propaganda round (6.0). No player Event choice.” `docs/printdata.py` reads all of these for both this catalogue and rules Appendix A.
- `catalogue.json` holds only editorial data: flavor text, images, source references and open questions. Italic flavor text has no game effect. It is new editorial historical context and is not part of the implemented package; Propaganda flavor summarizes its campaign rather than a single event. A null value indicates absent text.
- `cards-a4.pdf` is 25 A4 pages with four 95 × 140 mm cards per sheet. Print at **actual size / 100%**, with scaling and fit-to-page disabled. Card outlines are cutting lines; short corner guides are provided. The sheet has 10 mm side and 8.5 mm top and bottom margins. All body text is at least 9 pt. Use a test sheet to confirm the printer does not scale.
- `index.html` is an offline searchable reference. Cards DK-001–DK-035 have contextual images, captions and linked credits. Expand a card to see its sources.

## Open items

- **Images: 35 contextual images; 64 placeholders.** The illustrated cards in `index.html` use maps, flags, a logo and photographs with source and license details in the catalogue and captions. Several images postdate the events and illustrate a location or organization, not the event itself. The Bismil panorama was resized; all other images are displayed at reduced size. The print PDF still uses placeholders and has not yet been updated for these images. The supplied Spiegel and Alamy pages did not establish permission for reuse. This is not a finished illustrated deck.
- **Flavor: editorial text on all 99 cards.** The implemented package has no flavor field. The new sentences use the deck titles and the project’s historical research references; they need historical and editorial review before publication. The five Propaganda cards use campaign context.
- **Older research wording:** `research/research-final/data/prototype-deck.csv` keeps the research-era card text, including the old 13-space map names. It is history; the package text is printed.

## Regenerate and verify

Requires Python 3, PyYAML, ReportLab and the DejaVu Sans regular, bold and oblique fonts at `/usr/share/fonts/truetype/dejavu/`. Run `make cards` (or `make print` for the rulebook too) from the repository root. The script checks layout and exits with an error if text exceeds its allocated box. After a font or text change, inspect a printed test sheet.

**Drift check.** The script writes `cards-a4.pdf.inputs.json`: its input files and their SHA-256. `make test` (`sim/test/print-drift.test.ts`) fails when the package cards, the rules, `catalogue.json` or a generator changed after the last build, or when `index.html` or Appendix A misses any package text. The layout check is programmatic, not a physical print proof.
