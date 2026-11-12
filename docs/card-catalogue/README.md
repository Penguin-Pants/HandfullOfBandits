# Card catalogue and print review

The catalogue covers all 99 unique card records in `game-packages/kurdish-coin/0.1.0/cards`: 16 in C1, 19 in C2, 18 in C3, 21 in C4 and 21 in C5, plus four Pivotal Events (one each in C1, C3, C4 and C5). Five campaign records are Propaganda cards. The campaign totals exclude Pivotal Events. Cards are ordered by stable ID.

## Files and printing

- `catalogue.json` is the editing source for the PDF and HTML. `printed` holds card wording; `implementation` retains the package fields and structured effects, without a second copy of side text. Italic flavor text has no game effect. It is new editorial historical context and is not part of the implemented package; Propaganda flavor summarizes its campaign rather than a single event. A null value indicates absent text. The JSON retains pivotal side text such as “None (single-sided Pivotal Event)” where present in the package. Original package paths and research IDs remain in the records.
- `cards-a4.pdf` is 25 A4 pages with four 95 × 140 mm cards per sheet. Print at **actual size / 100%**, with scaling and fit-to-page disabled. Card outlines are cutting lines; short corner guides are provided. The sheet has 10 mm side and 8.5 mm top and bottom margins. All body text is at least 9 pt. Use a test sheet to confirm the printer does not scale.
- `index.html` is an offline searchable reference. Cards DK-001–DK-035 have contextual images, captions and linked credits. Expand a card to see implementation data and sources.
- `conflicts.csv` contains the seven side-text differences found against the older research deck CSV, with both versions. The implemented package is used for side wording.

## Open items

- **Images: 35 contextual images; 64 placeholders.** The illustrated cards in `index.html` use maps, flags, a logo and photographs with source and license details in the catalogue and captions. Several images postdate the events and illustrate a location or organization, not the event itself. The Bismil panorama was resized; all other images are displayed at reduced size. The print PDF still uses placeholders and has not yet been updated for these images. The supplied Spiegel and Alamy pages did not establish permission for reuse. This is not a finished illustrated deck.
- **Flavor: editorial text on all 99 cards.** The implemented package has no flavor field. The new sentences use the deck titles and the project’s historical research references; they need historical and editorial review before publication. The five Propaganda cards use campaign context.
- **DK-016:** the C1 Propaganda package entry has no printed rule. The reference says “conduct 6.0. No player Event choice.” The mockup explicitly marks the missing package text; it does not silently substitute this wording.
- **Always instructions:** seven cards have structured Always effects. The package does not provide a separate complete printed Always line. Supporting document wording is included and labelled as a source note, not represented as package card text. DK-037, DK-040 and DK-093 use approved design-document language that includes explanatory or implementation details. DK-040 refers to an internal flag; player-facing wording needs a design decision. Verify the final wording of all seven against the implemented behavior before production.
- **Older source differences:** DK-002, DK-003, DK-005, DK-008 and DK-100 differ on the shaded side from the research CSV. DK-064 differs on both sides. See `conflicts.csv`. These differences are recorded without deciding whether older wording was erroneous. Some implementation is handled outside declarative effects, as shown in encoding notes. Empty effect arrays do not necessarily mean no behavior.

## Regenerate and verify

Requires Python 3, ReportLab and the DejaVu Sans regular, bold and oblique fonts at `/usr/share/fonts/truetype/dejavu/`. Run `python generate.py` in this folder. It reads only `catalogue.json` and creates the PDF and HTML. The script checks layout and exits with an error if text exceeds its allocated box. If changing fonts or a card's text, rerun the script and inspect a printed test sheet.

Checks performed: package IDs were compared with the catalogue (99 records, 99 unique IDs); all package side text was transferred directly; the generated PDF has 25 A4 pages and its extracted text contains each ID exactly once; layout measurement reports no overflow and a 9 pt minimum body size. This is a programmatic fit check, not a physical print proof.
