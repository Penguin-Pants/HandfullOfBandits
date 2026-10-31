# Printable rules: TWO-PASS REVIEW

Status: complete, 31 October 2026. Scope explicitly confirmed by the designer: the current playable Scenario A, C1/C2. This is an editorial and print-layout change. No engine, package rule, parameter, scenario or card encoding changed.

## Reference review

Reviewed the PDF and Markdown Colonial Twilight rules closely, including introduction, initiative, Operations, Special Activities, Events, Propaganda, victory and setup. Measured its 9.5 pt Times body and bold sans headings, running folios and US Letter page size. Compared the PDF/Markdown structures of Cuba Libre, A Distant Plain, The British Way: Malaya and People Power. Inventoried all 22 rule PDFs and their available Markdown counterparts. Source checkout: `Penguin-Pants/COIN_Research` commit `b0e7c647d24dd13e0a0771acb2fa2b1b08c12ec8`.

The A4 edition retains the principal reference's rule hierarchy, two-column reading layout, title/art/contents composition, italic examples and compact tables. It uses embedded metric-compatible Liberation fonts. It does not reproduce publisher marks, cover art or third-party rules text. A4 changes the line breaks and pagination from US Letter.

## Pass 1: correctness

Traced the reading edition against research chapters 03–10, the current R3 manifest, parameters, assumptions, Scenario A setup and C1/C2 card YAML. Checked engine call paths for deck building, First Eligible order, Pass income, Operation cost/SA timing, piece supply, movement, Civic Action/Agitation, host posture, Pivotal, Propaganda, Redeploy/Reset and victory. Explicit decisions DD-20 and DEC-53 to DEC-57 override older draft prose.

- **Fix:** the initial draft gave an unsupported C1 chain. The package's sole C1/C2 `chainAfter` is DK-028 before DK-029. Rule 10.3 now names exactly that pair.
- **Fix:** the initial draft restricted Agitation to domestic spaces. The engine accepts marker removal at an external PKK Base, while rejecting political shifts where no level exists. Removed the added restriction and checked an external-Base Redress command through engine validation.
- **Fix:** the cover footer spilled onto an extra page. Reduced the cover's occupied height and used the reference's two-column contents layout. The digital preflight now confirms no near-empty page, physical/logical page agreement and correct bookmark destinations.
- **Fix:** source paths overprinted the adjacent column and one four-column table slightly exceeded its width. PDF text bounds and TeX overfull warnings reproduced the problem. Wrapping paths and adjusting column widths remove all overfull boxes; the final preflight passes.
- **Decide, documented:** research says First Eligible Op Only needs two or more locations, but the current engine accepts one. Reproduced a legal one-location Op Only. Appendix B records both meanings without changing the rule or engine.
- **Decide, documented:** research permits some map-to-Available withdrawals; current Operation handlers enforce Available supply without this choice. Appendix B records the difference. No withdrawal mechanism was invented for the simulator.
- **Drop:** no shuffle or Pass defect reproduced. The fixed initial seed and first-player-only eligibility are the documented current behavior and are explained in the book.
- **Propose:** none added beyond the two recorded design questions. IC-3a remains open and is not closed by producing the book.

Card audit: all 66 dual-use sides match the normalized current YAML text. Both Propaganda cards and the ARGK Pivotal are included, for 36 card entries. ARGK's ambiguous phrase is explicitly clarified by DEC-55. All 18 locations and 25 movement links are represented. Setup piece counts, Available/Out of Play, levels, scores and margins match Scenario A.

## Pass 2: simplicity

One Markdown rules source and one notes source supply the reading edition. The card appendix is generated directly from package YAML. One Pandoc/XeLaTeX target rebuilds the standalone PDF; Lua only adapts column tables and wrapping source paths. The existing atlas artwork supplies the cover. No duplicate rule implementation, runtime dependency or one-time script is committed. Source paths use `pathlib` and the command runs from its own source directory.

## Validation

- `make rulebook`: successful rebuild, 12 pages, each 595.28 × 841.89 pt (210 × 297 mm), portrait. The PDF embeds all eight used font subsets, has searchable text and has 12 linked contents entries with matching bookmarks. No near-empty page or horizontal text-area overflow.
- TeX audit: zero overfull boxes and zero missing-glyph warnings. Rendered all pages in a contact sheet and inspected the cover, representative rules/tables, card appendix and final source page at reading size. No physical printer was available.
- Content checks: 66 Event sides, two Propaganda entries, ARGK, current decision identifiers and the actual deck chain. Legal-command probes verify one-location Op Only and external-Base Agitation Redress.
- `make check`: TypeScript and ESLint pass. `make test`: 807 tests across 62 files pass. Existing golden replays remain unchanged.

Print A4 portrait at 100% / Actual size. Duplex uses long-edge binding. Grayscale does not change any rule meaning. The rebuild needs Python/PyYAML, Pandoc, XeLaTeX, Liberation fonts and the TeX packages listed in the local README. Linux verified; Windows execution not run.
