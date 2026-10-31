# Printable prototype rulebook

[Download the A4 portrait PDF](handful-of-bandits-rules-a4.pdf).

Scope: Scenario A, C1/C2, ruleset R3. This reading edition consolidates the implemented prototype and accepted designer decisions. It includes the complete current Event text, setup, rules differences and source notes. It does not enable the later Campaign systems.

The format follows the Colonial Twilight rulebook in `Penguin-Pants/COIN_Research/research/rules`, with comparative checks against other COIN PDFs and Markdown. A4 replaces the originals' US Letter page geometry. Typography uses embedded Liberation Serif and Sans equivalents. Publisher art, branding and third-party rules text are not copied.

Print A4 portrait at **100% / Actual size**. For duplex use long-edge binding. Grayscale is supported. Body text is 9.5 pt, following the principal reference, with two columns and 16 mm side margins.

## Rebuild

Run `make rulebook` from the repository root. Requires Python 3 with PyYAML, Pandoc, XeLaTeX and Liberation fonts. The template also uses the standard TeX packages multicol, titlesec, fancyhdr, booktabs, enumitem, needspace, microtype and tcolorbox.

- `prototype-rules.md`: editable rules and setup.
- `prototype-card-reference.md`: generated from current C1/C2 package text by the build script; do not edit directly.
- `prototype-notes.md`: scope, source notes and known differences.
- `rulebook-layout.tex` and `rulebook-tables.lua`: typography, A4 layout and column tables.
- `build-rulebook.py`: reusable local build entrypoint.

The shared cover illustration is `game-packages/kurdish-coin/0.1.0/map/atlas-terrain.png`. No game rule is derived from it. See `review.md` for content and print validation.
