// Play screen (08 s3): status bar, board, event or Propaganda panel, faction panel.
import { useCallback, useEffect, useState } from "react";
import type { AnyCommand, Api, Head, LegalChoices, SessionRow } from "../api.ts";
import { Board, SpaceDetail } from "../board/Board.tsx";
import { EventPanel } from "../event/EventPanel.tsx";
import { FactionPanel } from "../faction/FactionPanel.tsx";
import { PropagandaPanel } from "../propaganda/PropagandaPanel.tsx";
import { StatusBar } from "../status/StatusBar.tsx";

export interface PlayProps {
  readonly api: Api;
  readonly sessionId: string;
}

export function Play({ api, sessionId }: PlayProps) {
  const [data, setData] = useState<{ session: SessionRow; head: Head } | null>(null);
  const [legal, setLegal] = useState<LegalChoices | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [, setDraft] = useState<AnyCommand | null>(null);

  const load = useCallback(async () => {
    const [s, l] = await Promise.all([api.session(sessionId), api.legal(sessionId)]);
    setData(s);
    setLegal(l);
  }, [api, sessionId]);
  useEffect(() => {
    void load();
  }, [load]);

  const commit = async (command: AnyCommand): Promise<void> => {
    if (data === null) return;
    setError(null);
    try {
      await api.submit(sessionId, command, data.head.actionId);
      setSelected([]);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null;
      if (target !== null && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.key === " " && legal?.advance === true) {
        e.preventDefault();
        void commit({ type: "Advance" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  });

  if (data === null || legal === null) return <p className="screen">Loading…</p>;
  const view = data.head.view;
  const select = (id: string, add: boolean): void => {
    setSelected(add ? (selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]) : [id]);
  };
  const detail = view.spaces.find((s) => s.id === selected.at(-1));
  const eventOpen = legal.boxes?.some((b) => b.box === "event" && b.allowed) ?? false;
  return (
    <div className="screen">
      <StatusBar view={view} />
      {error !== null && <p className="bad">{error}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 16 }}>
        <Board view={view} selected={selected} onSelect={select} />
        <aside style={{ display: "grid", gap: 8, alignContent: "start" }}>
          {view.status.phase === "propaganda" ? (
            <PropagandaPanel view={view} legal={legal} selected={selected} onCommit={(c) => void commit(c)} />
          ) : (
            <EventPanel api={api} sessionId={sessionId} view={view} faction={legal.faction} eventOpen={eventOpen} onCommit={(c) => void commit(c)} />
          )}
          {legal.faction !== null && <FactionPanel api={api} sessionId={sessionId} legal={legal} selected={selected} onCommit={(c) => void commit(c)} onDraft={setDraft} />}
          {legal.faction === null && view.status.phase === "setup" && (
            <button type="button" onClick={() => void commit({ type: "Advance" })}>
              Reveal first card (Space)
            </button>
          )}
          {detail !== undefined && <SpaceDetail space={detail} />}
        </aside>
      </div>
    </div>
  );
}
