// Play screen (08 s3): status bar, board, event or Propaganda panel, faction panel.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AnyCommand, Api, CategoryRow, Head, HistoryItem, LegalChoices, SessionRow } from "../api.ts";
import { createFocusStore } from "../focus-store.ts";
import { HistoryDrawer } from "../history/HistoryDrawer.tsx";
import { defaultAnchor } from "../notes/anchor.ts";
import { EndSession } from "../notes/EndSession.tsx";
import { NoteBar } from "../notes/NoteBar.tsx";
import { Board, SpaceDetail } from "../board/Board.tsx";
import { EventPanel } from "../event/EventPanel.tsx";
import { FactionPanel } from "../faction/FactionPanel.tsx";
import { PropagandaPanel } from "../propaganda/PropagandaPanel.tsx";
import { StatusBar } from "../status/StatusBar.tsx";

export interface PlayProps {
  readonly api: Api;
  readonly sessionId: string;
  readonly onExit?: () => void;
  readonly onOpenState?: (before: string | null, after: string) => void;
}

export function Play({ api, sessionId, onExit, onOpenState }: PlayProps) {
  const [data, setData] = useState<{ session: SessionRow; head: Head } | null>(null);
  const [legal, setLegal] = useState<LegalChoices | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const draft = useRef<AnyCommand | null>(null);
  const last = useRef<{ id: string | null; at: number | null }>({ id: null, at: null });
  const focusStore = useMemo(createFocusStore, []);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [ending, setEnding] = useState(false);

  const load = useCallback(async () => {
    const [s, l, h] = await Promise.all([api.session(sessionId), api.legal(sessionId), api.history(sessionId)]);
    setData(s);
    setLegal(l);
    setHistory(h);
  }, [api, sessionId]);
  useEffect(() => {
    void api.categories().then(setCategories);
  }, [api]);
  useEffect(() => {
    void load();
  }, [load]);

  const commit = async (command: AnyCommand): Promise<void> => {
    if (data === null) return;
    setError(null);
    try {
      const result = await api.submit(sessionId, command, data.head.actionId);
      last.current = { id: result.actionId, at: Date.now() };
      draft.current = null;
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
      if (e.key === "h" || e.key === "H") setShowHistory((v) => !v);
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) void undo();
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
    const next = add ? (selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]) : [id];
    setSelected(next);
    focusStore.set({ panel: "board", selectedSpace: next.at(-1) ?? null });
  };
  const anchor = (): ReturnType<typeof defaultAnchor> =>
    defaultAnchor({ lastActionId: last.current.id, lastActionAt: last.current.at, now: Date.now(), draft: draft.current, selectedSpace: focusStore.get().selectedSpace });
  const undo = async (): Promise<void> => {
    if (!window.confirm("Undo the last action?")) return;
    setError(null);
    try {
      const result = await api.undo(sessionId, data.head.actionId);
      if (result.undoneAfterRandom) setError(`Undid ${result.undone}. It used a random result; the undo is flagged.`);
      last.current = { id: null, at: null };
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const end = async (debrief: string | null): Promise<void> => {
    await api.endSession(sessionId, debrief);
    setEnding(false);
    onExit?.();
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
          {legal.faction !== null && <FactionPanel api={api} sessionId={sessionId} legal={legal} selected={selected} onCommit={(c) => void commit(c)} onDraft={(c) => { draft.current = c; }} />}
          {legal.faction === null && view.status.phase === "setup" && (
            <button type="button" onClick={() => void commit({ type: "Advance" })}>
              Reveal first card (Space)
            </button>
          )}
          {detail !== undefined && <SpaceDetail space={detail} />}
          <div className="row">
            <button type="button" onClick={() => { setShowHistory(!showHistory); }}>
              History (H)
            </button>
            <button type="button" onClick={() => void undo()}>
              Undo (Ctrl+Z)
            </button>
            <button type="button" onClick={() => { setEnding(true); }}>
              End session
            </button>
          </div>
        </aside>
      </div>
      {ending && <EndSession onEnd={(d) => void end(d)} onCancel={() => { setEnding(false); }} />}
      <NoteBar
        categories={categories}
        anchor={anchor}
        focus={() => focusStore.get()}
        onSave={async (note) => {
          const { annotationId } = await api.annotate(sessionId, note);
          void load();
          return annotationId;
        }}
      />
      {showHistory && <HistoryDrawer items={history} onOpen={(item) => onOpenState?.(item.action.state_hash_before, item.action.state_hash_after)} />}
    </div>
  );
}
