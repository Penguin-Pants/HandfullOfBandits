// Piece icons (08 s3.1 item 2; DEC-29, DEC-30). The approved State and PKK pieces use pre-rendered
// painted-wood sprites from the package map folder. Other factions keep the flat SVG shape:
// faction color, lighter shade for `colorVariant: light`, star disc only on an Active Guerrilla.
import type { PieceView } from "../api.ts";

const SIZE = 16;
/** Sprite canvas edge in map units. The canvas is 192 px with the top face centered at (96, 84). */
const SPRITE = 54;
const TOP_FACE = 84 / 192 - 0.5;
/** Up to this many sprites show for one counted group; the count stays printed beside them. */
const PILE = 3;

const SPRITES: Readonly<Record<string, string>> = {
  "state:cube:base": "troops", "state:cube:light": "police", "state:cylinder:base": "guards", "state:disc:base": "state-base",
  "pkk:disc:base": "pkk-base", "pkk:octagon:base": "guerrilla-underground",
};

/** Sprite file name for a piece, or null where the package has no painted-wood artwork. */
export function spriteOf(piece: PieceView): string | null {
  const name = SPRITES[`${piece.faction}:${piece.shape}:${piece.colorVariant}`] ?? null;
  return name === "guerrilla-underground" && piece.emblem === "starCircle" ? "guerrilla-active" : name;
}

/** `bare`: the shape only, with no count (legend). */
export function PieceIcon({ piece, color, x, y, bare = false }: { readonly piece: PieceView; readonly color: string; readonly x: number; readonly y: number; readonly bare?: boolean }) {
  const code: Readonly<Record<string,string>> = {troops:"T",police:"P",guards:"G"};
  const letter=code[piece.piece];
  const factionColor = piece.faction === "state" ? "#bd1f2c" : piece.faction === "pkk" ? "#26734e" : color;
  const fill = piece.colorVariant === "light" ? `color-mix(in srgb, ${factionColor} 55%, white)` : factionColor;
  const stroke = piece.isBase ? "black" : "var(--token-line)";
  const h = SIZE / 2;
  const sprite = spriteOf(piece);
  if (sprite !== null) {
    const size = bare ? SPRITE / 2 : SPRITE;
    const pile = bare ? 1 : Math.max(1, Math.min(PILE, piece.count));
    return (
      <g aria-label={bare ? undefined : `${piece.piece} ${piece.face} ${String(piece.count)}`} data-sprite={sprite}>
        {Array.from({ length: pile }, (_, i) => pile - 1 - i).map(back => <image key={back} href={`/pieces/${sprite}.png`} x={x - size / 2 - back * 5} y={y - size / 2 - back * 5} width={size} height={size} />)}
        {letter !== undefined && <text x={x} y={y + size * TOP_FACE} textAnchor="middle" dominantBaseline="central" className="piece-code" style={bare ? { fontSize: 5 } : undefined} fill={piece.colorVariant === "light" ? "#3a1218" : "#fff"}>{letter}</text>}
        {!bare && <text x={x + (piece.shape === "disc" ? 18 : 14)} y={y + 5} className="map-count">{piece.count}</text>}
      </g>
    );
  }
  let shape;
  switch (piece.shape) {
    case "cube":
      shape = <rect x={x - h} y={y - h} width={SIZE} height={SIZE} fill={fill} stroke={stroke} />;
      break;
    case "cylinder":
      shape = <rect x={x - h + 2} y={y - h} width={SIZE - 4} height={SIZE} rx={4} fill={fill} stroke={stroke} />;
      break;
    case "disc":
      shape = <circle cx={x} cy={y} r={h} fill={fill} stroke={stroke} strokeWidth={2} />;
      break;
    default: {
      const k = h * 0.41;
      const pts = [[-k, -h], [k, -h], [h, -k], [h, k], [k, h], [-k, h], [-h, k], [-h, -k]].map(([dx = 0, dy = 0]) => `${String(x + dx)},${String(y + dy)}`).join(" ");
      shape = <polygon points={pts} fill={fill} stroke={stroke} />;
    }
  }
  return (
    <g aria-label={bare ? undefined : `${piece.piece} ${piece.face} ${String(piece.count)}`}>
      {shape}
      {letter !== undefined && <text x={x} y={y+3} textAnchor="middle" className="piece-code" fill={piece.colorVariant === "light" ? "#332c20" : "#fff"}>{letter}</text>}
      {piece.emblem === "starCircle" && <>
        <circle cx={x} cy={y} r={h * 0.7} fill="#e5be52" />
        <polygon points={Array.from({ length: 10 }, (_, i) => {
          const angle = -Math.PI / 2 + i * Math.PI / 5;
          const radius = h * (i % 2 === 0 ? 0.52 : 0.23);
          return `${String(x + radius * Math.cos(angle))},${String(y + radius * Math.sin(angle))}`;
        }).join(" ")} fill="#bd1f2c" />
      </>}
      {!bare && (
        <text x={x + h + 2} y={y + 5} className="map-count">
          {piece.count}
        </text>
      )}
    </g>
  );
}
