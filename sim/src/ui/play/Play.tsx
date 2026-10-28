// Play screen (08 s3): status bar, board with selection and detail card. Panels come with P2-15 to P2-17.
import { useEffect, useState } from "react";
import type { Api, Head, SessionRow } from "../api.ts";
import { Board, SpaceDetail } from "../board/Board.tsx";
import { StatusBar } from "../status/StatusBar.tsx";

export function Play({ api, sessionId }: { readonly api: Api; readonly sessionId: string }) {
  const [data, setData] = useState<{ session: SessionRow; head: Head } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    void api.session(sessionId).then(setData);
  }, [api, sessionId]);
  if (data === null) return <p className="screen">Loading…</p>;
  const view = data.head.view;
  const select = (id: string, add: boolean): void => {
    setSelected(add ? (selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]) : [id]);
  };
  const detail = view.spaces.find((s) => s.id === selected.at(-1));
  return (
    <div className="screen">
      <StatusBar view={view} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
        <Board view={view} selected={selected} onSelect={select} />
        <aside>{detail !== undefined && <SpaceDetail space={detail} />}</aside>
      </div>
    </div>
  );
}
