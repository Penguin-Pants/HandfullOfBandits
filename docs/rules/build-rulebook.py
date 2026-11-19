#!/usr/bin/env python3
"""Build the A4 reading edition and derive the Event appendix from package data."""
from pathlib import Path
import subprocess
import sys

import yaml

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import printdata  # noqa: E402

PACKAGE = printdata.PACKAGE
SOURCES = ["prototype-rules.md", "prototype-card-reference.md", "prototype-notes.md", "rulebook-layout.tex", "rulebook-tables.lua"]


CAMPAIGNS = [("C1", "1984–1986"), ("C2", "1987–1989"), ("C3", "1990–1992"), ("C4", "1993–1995"), ("C5", "1996–1999")]


def card_reference() -> str:
    """Appendix A from docs/printdata.py: package card text and the rules 5.4 Always lines."""
    cards = list(printdata.cards().values())
    lines = [
        "# A.0 Card Reference", "",
        "Current package text is reproduced below for reading beside the rules. "
        "Original card cross-references use research chapter numbers (Appendix B). "
        "U means unshaded and S shaded; either faction may choose either side unless restricted (5.1). "
        "Always instructions apply on reveal (5.4). A card need not be drawn in every game.", "",
    ]
    for n, (campaign, years) in enumerate(CAMPAIGNS, start=1):
        lines += [f"## A.{n} Campaign {campaign}: {years}", ""]
        for card in (c for c in cards if c["campaign"] == campaign and c["type"] != "pivotal"):
            lines += [f"### {card['id']} · {card['title']}", ""]
            if card["type"] == "propaganda":
                lines += ["**Propaganda:** " + card["unshaded"], ""]
                continue
            if card["mandatory"]:
                lines += ["**Mandatory structural card.**", ""]
            if card["always"]:
                lines += ["**Always:** " + card["always"], ""]
            lines += [f"**U:** {card['unshaded']}", "", f"**S:** {card['shaded']}", ""]
    lines += [f"## A.{len(CAMPAIGNS) + 1} Pivotal Events in Hand", "", "See 5.3 for the window, timing and initiative.", ""]
    for card in (c for c in cards if c["type"] == "pivotal"):
        lines += [f"### {card['id']} · {card['title']}", "", card["unshaded"], ""]
    return "\n".join(lines)


def main() -> None:
    (HERE / "prototype-card-reference.md").write_text(card_reference(), encoding="utf-8")
    manifest = yaml.safe_load((PACKAGE / "manifest.yaml").read_text(encoding="utf-8"))
    subprocess.run([
        "pandoc", *SOURCES[:3],
        "--from=markdown+raw_tex", "--pdf-engine=xelatex",
        "--template=rulebook-layout.tex", "--lua-filter=rulebook-tables.lua",
        "--toc", "--toc-depth=1", "--standalone",
        "--metadata=ruleset:" + manifest["rulesetVersion"],
        "--output=handful-of-bandits-rules-a4.pdf",
    ], cwd=HERE, check=True)
    pdf = HERE / "handful-of-bandits-rules-a4.pdf"
    printdata.write_stamp(pdf, [printdata.ROOT / "docs/printdata.py", Path(__file__), *(HERE / f for f in SOURCES), PACKAGE / "manifest.yaml", *printdata.CARD_FILES])
    print(pdf)


if __name__ == "__main__":
    main()
