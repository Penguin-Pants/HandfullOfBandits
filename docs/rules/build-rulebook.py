#!/usr/bin/env python3
"""Build the A4 reading edition and derive the Event appendix from package data."""
from pathlib import Path
import subprocess
import yaml

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
PACKAGE = ROOT / "game-packages/kurdish-coin/0.1.0"


def card_reference() -> str:
    lines = [
        "# A.0 C1/C2 Card Reference", "",
        "Current package text is reproduced below for reading beside the rules. "
        "Original card cross-references use research chapter numbers (Appendix B). "
        "U means unshaded and S shaded; either faction may choose either side unless restricted. "
        "Always instructions apply on reveal. A card need not be drawn in every game.", "",
    ]
    always = {
        "DK-003": "Move all Guards from Out of Play to Available; Law 3175 is in effect.",
        "DK-005": "If KDP is Host, set its posture to Tolerant.",
        "DK-019": "If Syria is Host, set its posture to Tolerant.",
        "DK-020": "If Emergency Rule is Martial Law, set it to OHAL.",
    }
    for campaign, title in [("c1", "A.1 Campaign C1: 1984–1986"), ("c2", "A.2 Campaign C2: 1987–1989")]:
        lines += ["## " + title, ""]
        cards = yaml.safe_load((PACKAGE / "cards" / f"{campaign}.yaml").read_text(encoding="utf-8"))
        for card in cards:
            lines += [f"### {card['id']} · {card['title']}", ""]
            if card["type"] == "propaganda":
                lines += ["**Propaganda:** conduct 6.0. No player Event choice.", ""]
                continue
            if card.get("mandatory"):
                lines += ["**Mandatory structural card.**", ""]
            if card["id"] in always:
                lines += ["**Always:** " + always[card["id"]], ""]
            for side, label in [("unshaded", "U"), ("shaded", "S")]:
                text = " ".join(card[side]["text"].split())
                lines += [f"**{label}:** {text}", ""]
    lines += [
        "## A.3 PKK Pivotal in Hand", "", "### DK-015 · ARGK Formed", "",
        "At least eight domestic Guerrillas and two domestic PKK Bases. "
        "Place up to four Available Guerrillas at PKK Bases, flip all Guerrillas "
        "in every space with a PKK Base Underground and gain three PKK Resources. "
        "DEC-55 clarifies the original card's phrase ‘in those spaces’. See 5.3 for timing and initiative.", "",
    ]
    return "\n".join(lines)


def main() -> None:
    (HERE / "prototype-card-reference.md").write_text(card_reference(), encoding="utf-8")
    subprocess.run([
        "pandoc", "prototype-rules.md", "prototype-card-reference.md", "prototype-notes.md",
        "--from=markdown+raw_tex", "--pdf-engine=xelatex",
        "--template=rulebook-layout.tex", "--lua-filter=rulebook-tables.lua",
        "--toc", "--toc-depth=1", "--standalone",
        "--output=handful-of-bandits-rules-a4.pdf",
    ], cwd=HERE, check=True)
    print(HERE / "handful-of-bandits-rules-a4.pdf")


if __name__ == "__main__":
    main()
