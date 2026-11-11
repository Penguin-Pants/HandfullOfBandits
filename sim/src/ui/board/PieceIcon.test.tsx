import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PieceView } from "../api.ts";
import { PieceIcon, spriteOf } from "./PieceIcon.tsx";

const base: PieceView = { piece: "guerrilla", faction: "pkk", face: "underground", count: 0, shape: "octagon", colorVariant: "base", emblem: null, isBase: false };
const of = (piece: Partial<PieceView>): PieceView => ({ ...base, ...piece });
const icon = (piece: Partial<PieceView>, bare = true): string => renderToStaticMarkup(<svg><PieceIcon piece={of(piece)} color="#2e7d32" x={9} y={9} bare={bare} /></svg>);

describe("painted-wood piece sprites", () => {
  it("gives every package piece type and face its own sprite", () => {
    const sprites = [
      spriteOf(of({ piece: "troops", faction: "state", shape: "cube" })),
      spriteOf(of({ piece: "police", faction: "state", shape: "cube", colorVariant: "light" })),
      spriteOf(of({ piece: "guards", faction: "state", shape: "cylinder" })),
      spriteOf(of({ piece: "stateBase", faction: "state", shape: "disc", emblem: "crescentStar", isBase: true })),
      spriteOf(of({ piece: "pkkBase", shape: "disc", isBase: true })),
      spriteOf(of({})),
      spriteOf(of({ face: "active", emblem: "starCircle" })),
    ];
    expect(sprites).toEqual(["troops", "police", "guards", "state-base", "pkk-base", "guerrilla-underground", "guerrilla-active"]);
  });

  it("draws the sprite image and keeps the T, P and G codes on State forces", () => {
    const troops = icon({ piece: "troops", faction: "state", shape: "cube" });
    expect(troops).toContain('href="/pieces/troops.png"');
    expect(troops).toContain(">T</text>");
    expect(icon({})).not.toContain("piece-code");
  });

  it("piles at most three sprites and always prints the exact count", () => {
    const images = (count: number): number => icon({ count }, false).split("<image").length - 1;
    expect([1, 2, 3, 9].map(images)).toEqual([1, 2, 3, 3]);
    expect(icon({ count: 9 }, false)).toContain(">9</text>");
  });

  it("keeps the flat faction-colored shape for a piece without artwork", () => {
    const other = icon({ faction: "other", shape: "cube" });
    expect(other).not.toContain("<image");
    expect(other).toContain('fill="#2e7d32"');
    const star = icon({ faction: "other", face: "active", emblem: "starCircle" });
    expect(star).toContain('fill="#e5be52"');
  });
});
