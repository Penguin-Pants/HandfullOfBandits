// Play screen (08 s3): status bar, board, event or Propaganda panel, faction panel.
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { AnyCommand, Api, BoardView, CategoryRow, Head, HistoryItem, LegalChoices, SessionRow } from "../api.ts";
import { createFocusStore } from "../focus-store.ts";
import { Help } from "../help/Help.tsx";
import { HistoryDrawer } from "../history/HistoryDrawer.tsx";
import { LogLines } from "../log/LogLines.tsx";
import { actionTitle } from "../log/plain.ts";
import { defaultAnchor } from "../notes/anchor.ts";
import { EndSession } from "../notes/EndSession.tsx";
import { NoteBar } from "../notes/NoteBar.tsx";
import { Board, Legend, SpaceDetail } from "../board/Board.tsx";
import { CardTable } from "../cards/CardTable.tsx";
import { EventPanel } from "../event/EventPanel.tsx";
import { PivotalPanel } from "../pivotal/PivotalPanel.tsx";
import { FactionPanel } from "../faction/FactionPanel.tsx";
import { arrowsOf, emptyPlans, plansReducer, type PlanEvent } from "../faction/plan.ts";
import { PropagandaPanel } from "../propaganda/PropagandaPanel.tsx";
import { ForcesBar } from "../status/Forces.tsx";
import { StatusBar } from "../status/StatusBar.tsx";
import { TrackCard } from "../status/TrackCard.tsx";
import { skipQuestion } from "../propaganda/phases.ts";

export interface PlayProps {
  readonly api: Api;
  readonly sessionId: string;
  readonly onExit?: () => void;
  readonly onReview?: () => void;
  readonly onOpenState?: (before: string | null, after: string) => void;
}

/** Spaces whose pieces, markers, level or Control differ between two views. */
export function changedSpaces(before: BoardView, after: BoardView): string[] {
  const key = (s: BoardView["spaces"][number]): string => JSON.stringify([s.pieces, s.markers, s.level, s.control]);
  const was = new Map(before.spaces.map((s) => [s.id, key(s)]));
  return after.spaces.filter((s) => was.get(s.id) !== key(s)).map((s) => s.id);
}

/** What the last committed action did, from its log entries. */
function LastAction({ item, view }: { readonly item: HistoryItem | undefined; readonly view: BoardView }) {
  if (item === undefined) return null;
  return (
    <section className="panel last-action" aria-label="Last action">
      <h3>Last action: {actionTitle(item.action, view)}</h3>
      <LogLines item={item} view={view} playerOnly limit={12} />
    </section>
  );
}

export function Play({ api, sessionId, onExit, onReview, onOpenState }: PlayProps) {
  const [data, setData] = useState<{ session: SessionRow; head: Head } | null>(null);
  const [legal, setLegal] = useState<LegalChoices | null>(null);
  // The map-built plans (UC-5): one for the Faction panel, one for an Event's free action. Map
  // clicks and drags build the active one.
  const [plans, dispatch] = useReducer(plansReducer, emptyPlans);
  const plan = plans[plans.active];
  const toFaction = useCallback((e: PlanEvent): void => { dispatch({ ...e, owner: "faction" }); }, []);
  const toEvent = useCallback((e: PlanEvent): void => { dispatch({ ...e, owner: "event" }); }, []);
  /** The space last clicked, shown in the space detail. */
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const draft = useRef<AnyCommand | null>(null);
  const last = useRef<{ id: string | null; at: number | null }>({ id: null, at: null });
  const focusStore = useMemo(createFocusStore, []);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showTracks, setShowTracks] = useState(true);
  const [mapOnly, setMapOnly] = useState(false);
  const [ending, setEnding] = useState(false);
  const [changed, setChanged] = useState<string[]>([]);
  /** Head on screen before a reload, to outline what the next action changed. */
  const shown = useRef<Head | null>(null);

  const load = useCallback(async () => {
    const [s, l, h] = await Promise.all([api.session(sessionId), api.legal(sessionId), api.history(sessionId)]);
    const prev = shown.current;
    if (prev === null || prev.actionId !== s.head.actionId) setChanged(prev === null ? [] : changedSpaces(prev.view, s.head.view));
    shown.current = s.head;
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
      const result = await api.submit(sessionId, command, data.head.actionId, data.head.stateHash);
      last.current = { id: result.actionId, at: Date.now() };
      draft.current = null;
      dispatch({ type: "resetAll" });
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
      if (e.key === "?") setShowHelp((v) => !v);
      if (e.key === "m" || e.key === "M") setMapOnly((v) => !v);
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) void undo();
      if (e.key === " " && legal?.advance === true) {
        e.preventDefault();
        const status = data?.head.view.status;
        const skip = status?.phase === "propaganda" ? skipQuestion(status.propagandaPhases[status.propagandaStep] ?? "", status.emergencyMoves) : null;
        if (skip !== null && !window.confirm(skip)) return;
        void commit({ type: "Advance" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  });

  if (data === null || legal === null) return <p className="screen">Loading…</p>;
  const view = data.head.view;
  const select = (id: string, add: boolean): void => {
    dispatch({ type: "click", id, add });
    setFocused(id);
    focusStore.set({ panel: "board", selectedSpace: id });
  };
  const selected = plan[plan.target].locations;
  const anchor = (): ReturnType<typeof defaultAnchor> =>
    defaultAnchor({ lastActionId: last.current.id, lastActionAt: last.current.at, now: Date.now(), draft: draft.current, selectedSpace: focusStore.get().selectedSpace });
  const undo = async (): Promise<void> => {
    if (!window.confirm("Undo the last action?")) return;
    setError(null);
    try {
      const result = await api.undo(sessionId, data.head.actionId, data.head.stateHash);
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
  const detail = view.spaces.find((s) => s.id === focused);
  const eventOpen = legal.boxes?.some((b) => b.box === "event" && b.allowed) ?? false;
  // One view (UC-3, UC-4): status on top, map with the forces bar below it on the left, a right
  // column that scrolls inside itself, note bar at the bottom. Help, History and End session
  // overlay. Map focus mode (M) hides the status bar and the right column.
  return (
    <div className={mapOnly ? "screen play-screen map-only" : "screen play-screen"}>
      {!mapOnly && (
        <StatusBar view={view}>
          <button type="button" onClick={onExit}>
            Home
          </button>
          <button type="button" onClick={onReview}>
            Feedback review
          </button>
        </StatusBar>
      )}
      {showHelp && (
        <div className="overlay">
          <Help onClose={() => { setShowHelp(false); }} view={view} forms={legal.forms ?? []} />
        </div>
      )}
      <div className="play">
        <div className="play-main">
          {error !== null && <p className="bad">{error}</p>}
          <div className="panel map-panel">
            <div className="map-tools">
              <button type="button" aria-pressed={showKey} onClick={() => { setShowKey(!showKey); }}>
                Key
              </button>
              <button type="button" aria-pressed={showTracks} onClick={() => { setShowTracks(!showTracks); }}>
                Tracks
              </button>
              <button type="button" aria-pressed={mapOnly} onClick={() => { setMapOnly(!mapOnly); }}>
                {mapOnly ? "Show panels (M)" : "Map only (M)"}
              </button>
            </div>
            <div className="map-body">
            <Board view={view} selected={selected} onSelect={select} changed={changed} onDrag={(from, to) => { dispatch({ type: "drag", from, to }); }} arrows={arrowsOf(plan)} />
            {showTracks && <TrackCard view={view} />}
            </div>
            {showKey && (
              <div className="map-key">
                <Legend view={view} />
              </div>
            )}
          </div>
          {!mapOnly && <ForcesBar view={view} />}
        </div>
        <aside className="side" aria-label="Side panel" hidden={mapOnly}>
          <CardTable view={view} onReveal={legal.faction === null && view.status.phase === "setup" ? () => void commit({ type: "Advance" }) : null} />
          {view.status.phase === "pivotal" ? <PivotalPanel key={view.status.pending?.id} view={view} onCommit={c => void commit(c)} /> : view.status.phase === "propaganda" ? (
            <PropagandaPanel view={view} legal={legal} selected={plans.faction.op.locations} onCommit={(c) => void commit(c)} />
          ) : (
            <EventPanel api={api} sessionId={sessionId} view={view} faction={legal.faction} eventOpen={eventOpen} onCommit={(c) => void commit(c)} forms={legal.forms ?? []} plan={plans.event} dispatch={toEvent} onFreeAction={(open) => { dispatch({ type: "activate", owner: open ? "event" : "faction" }); }} />
          )}
          {legal.faction !== null && <FactionPanel api={api} sessionId={sessionId} view={view} legal={legal} plan={plans.faction} dispatch={toFaction} onCommit={(c) => void commit(c)} onDraft={(c) => { draft.current = c; }} />}
          <LastAction item={history.filter((h) => h.action.status !== "undone").at(-1)} view={view} />
          {detail !== undefined && <SpaceDetail space={detail} />}
          <div className="row">
            <button type="button" onClick={() => { setShowHelp(!showHelp); }}>
              Help (?)
            </button>
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
      {ending && (
        <div className="overlay">
          <EndSession onEnd={(d) => void end(d)} onCancel={() => { setEnding(false); }} />
        </div>
      )}
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
      {showHistory && (
        <div className="overlay">
          <HistoryDrawer items={history} view={view} onClose={() => { setShowHistory(false); }} onOpen={(item) => onOpenState?.(item.action.state_hash_before, item.action.state_hash_after)} />
        </div>
      )}
    </div>
  );
}
