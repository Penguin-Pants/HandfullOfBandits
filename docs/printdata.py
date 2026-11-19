"""Print data for the card catalogue and the rulebook appendix: one source for each printed text.

- Card titles, types and side text come from the game package card files.
- Always text comes from the rules 5.4 table, plus any `note` text in the card's package Always line.
- Propaganda cards print the rule 6.0 instruction.

Each generator writes a stamp file next to its PDF. The stamp lists the input files, their SHA-256 and the PDF's SHA-256.
`sim/test/print-drift.test.ts` recomputes the hash, so `make test` fails when an input changes and the
PDF is not rebuilt. The hash reads text with LF line endings, so a Windows checkout gives the same hash.
"""
from hashlib import sha256
from pathlib import Path
import json
import re

import yaml

ROOT = Path(__file__).resolve().parent.parent
PACKAGE = ROOT / "game-packages/kurdish-coin/0.1.0"
RULES = ROOT / "docs/rules/prototype-rules.md"
CARD_FILES = [PACKAGE / "cards" / f"{name}.yaml" for name in ("c1", "c2", "c3", "c4", "c5", "pivotal")]
PROPAGANDA_TEXT = "Conduct a Propaganda round (6.0). No player Event choice."
ALWAYS_ROW = re.compile(r"^\| C\d: (DK-\d{3}) [^|]+\| (.+?) \|$")


def text(path: Path) -> str:
    return path.read_text(encoding="utf-8").replace("\r\n", "\n")


def always_table() -> dict[str, str]:
    """Always text by card ID, from the rules 5.4 table."""
    rows = {}
    for line in text(RULES).split("\n"):
        match = ALWAYS_ROW.match(line)
        if match:
            rows[match.group(1)] = match.group(2)
    return rows


def cards() -> dict[str, dict]:
    """Printed fields of every package card by ID: id, campaign, type, title, mandatory, always, unshaded, shaded."""
    table = always_table()
    out = {}
    for path in CARD_FILES:
        for card in yaml.safe_load(text(path)):
            notes = [e["text"] for e in card.get("always", []) if e.get("type") == "note"]
            if card.get("always") and card["id"] not in table:
                raise SystemExit(f"{card['id']} has an Always line but no row in rules 5.4")
            always = " ".join([table[card["id"]], *notes]) if card.get("always") else None
            side = lambda key: " ".join(card[key]["text"].split()) if card.get(key) else None
            pivotal = card["type"] == "pivotal"
            out[card["id"]] = {
                "id": card["id"], "campaign": card["campaign"], "type": card["type"], "title": card["title"],
                "mandatory": bool(card.get("mandatory")), "always": always,
                "unshaded": PROPAGANDA_TEXT if card["type"] == "propaganda" else side("unshaded"),
                "shaded": None if pivotal else side("shaded"),
            }
    return out


def write_stamp(output: Path, inputs: list[Path]) -> None:
    """Write `<output>.inputs.json`: the input files (repository paths), their combined SHA-256 and the output's SHA-256."""
    names = [p.resolve().relative_to(ROOT).as_posix() for p in inputs]
    digest = sha256()
    for name in names:
        digest.update((name + "\n" + text(ROOT / name) + "\n").encode("utf-8"))
    stamp = output.with_name(output.name + ".inputs.json")
    stamp.write_text(json.dumps({"inputs": names, "sha256": digest.hexdigest(), "output_sha256": sha256(output.read_bytes()).hexdigest()}, indent=1) + "\n", encoding="utf-8")
