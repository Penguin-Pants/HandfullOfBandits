// Read-only state viewer (08 s2; 11 P2-17): the board at a state hash, with a before and after
// toggle for an action.
import { useEffect, useState } from "react";
import type { Api, BoardView } from "../api.ts";
import { Board, SpaceDetail } from "../board/Board.tsx";
import { StatusBar } from "../status/StatusBar.tsx";

export interface StateViewerProps {
  readonly api: Api;
  readonly sessionId: string;
  readonly before: string | null;
  readonly after: string;
  readonly onBack: () => void;
}

export function StateViewer({ api, sessionId, before, after, onBack }: StateViewerProps) {
  const [showBefore, setShowBefore] = useState(false);
  const [view, setView] = useState<BoardView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const hash = showBefore && before !== null ? before : after;
  useEffect(() => {
    let current = true;
    setView(null);
    setError(null);
    void api.stateView(sessionId, hash).then((next) => {
      if (current) setView(next);
    }, (e: unknown) => {
      if (current) setError(e instanceof Error ? e.message : String(e));
    });
    return () => { current = false; };
  }, [api, sessionId, hash, reload]);
  const detail = view?.spaces.find((s) => s.id === selected);
  return (
    <div className="screen" aria-label="State viewer">
      <div className="row">
        <button type="button" onClick={onBack}>
          Back
        </button>
        <strong>Read only</strong>
        <span className="muted">{hash.slice(0, 12)}</span>
        {before !== null && (
          <div role="group" aria-label="Before and after">
            <button type="button" aria-pressed={showBefore} onClick={() => { setShowBefore(true); }}>
              Before
            </button>
            <button type="button" aria-pressed={!showBefore} onClick={() => { setShowBefore(false); }}>
              After
            </button>
          </div>
        )}
      </div>
      {error !== null && <div><p role="alert">Could not load state: {error}</p><button type="button" onClick={() => { setReload((n) => n + 1); }}>Retry</button></div>}
      {view === null && error === null && <p role="status">Loading state…</p>}
      {view !== null && (
        <>
          <StatusBar view={view} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
            <Board view={view} selected={selected === null ? [] : [selected]} onSelect={(id) => { setSelected(id); }} />
            <aside>{detail !== undefined && <SpaceDetail space={detail} />}</aside>
          </div>
        </>
      )}
    </div>
  );
}
