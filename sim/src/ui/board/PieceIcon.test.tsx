import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PieceView } from "../api.ts";
import { PieceIcon } from "./PieceIcon.tsx";

function icon(piece: Partial<PieceView>): string {
  const view: PieceView = {
    piece: "guerrilla", faction: "pkk", face: "underground", count: 0,
    shape: "octagon", colorVariant: "base", emblem: null, isBase: false, ...piece,
  };
  return renderToStaticMarkup(<svg><PieceIcon piece={view} color="#2e7d32" x={9} y={9} bare /></svg>);
}

describe("approved piece faces", () => {
  it("keeps both Bases as plain colored discs", () => {
    const state = icon({ piece: "stateBase", faction: "state", shape: "disc", emblem: "crescentStar", isBase: true });
    const pkk = icon({ piece: "pkkBase", shape: "disc", isBase: true });
    expect(state).toContain('fill="#bd1f2c"');
    expect(pkk).toContain('fill="#26734e"');
    expect(state).not.toContain("<polygon");
    expect(pkk).not.toContain("<polygon");
  });

  it("shows a symbol only on the Active Guerrilla face", () => {
    const underground = icon({});
    const active = icon({ face: "active", emblem: "starCircle" });
    expect(underground).toContain('fill="#26734e"');
    expect(underground).not.toContain("<circle");
    expect(active).toContain('fill="#e5be52"');
    expect(active).toContain('fill="#bd1f2c"');
  });
});
