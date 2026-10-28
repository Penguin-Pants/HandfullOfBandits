// Flat SVG piece icons (08 s3.1 item 2; DEC-29, DEC-30): shape from pieces.yaml, faction color,
// lighter shade for `colorVariant: light`, emblem only on its face.
import type { PieceView } from "../api.ts";

const SIZE = 14;

export function PieceIcon({ piece, color, x, y }: { readonly piece: PieceView; readonly color: string; readonly x: number; readonly y: number }) {
  const fill = piece.colorVariant === "light" ? `color-mix(in srgb, ${color} 55%, white)` : color;
  const stroke = piece.isBase ? "black" : "none";
  const h = SIZE / 2;
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
    <g aria-label={`${piece.piece} ${piece.face} ${String(piece.count)}`}>
      {shape}
      {piece.emblem !== null && <circle cx={x} cy={y} r={h / 2} fill="none" stroke="white" strokeWidth={1.5} />}
      <text x={x + h + 2} y={y + 4} fontSize={10}>
        {piece.count}
      </text>
    </g>
  );
}
