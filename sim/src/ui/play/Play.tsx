// Play screen (08 s3): status bar, board, event or Propaganda panel, faction panel.
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { AnyCommand, Api, BoardView, CategoryRow, Head, HistoryItem, LegalChoices, RuleLookup, SessionRow } from "../api.ts";
import { createFocusStore } from "../focus-store.ts";
import { Help } from "../help/Help.tsx";
import { HistoryDrawer } from "../history/HistoryDrawer.tsx";
import { LogLines } from "../log/LogLines.tsx";
import { actionTitle } from "../log/plain.ts";
import { defaultAnchor } from "../notes/anchor.ts";
import { EndSession } from "../notes/EndSession.tsx";
import { NoteBar } from "../notes/NoteBar.tsx";
import { Legend, SpaceDetail } from "../board/Board.tsx";
import { MapCanvas } from "../board/MapCanvas.tsx";
import { withoutHidden } from "../board/markers.tsx";
import { words } from "../common/names.ts";
import { CardTable } from "../cards/CardTable.tsx";
import { EventPanel } from "../event/EventPanel.tsx";
import { PivotalPanel } from "../pivotal/PivotalPanel.tsx";
import { FactionPanel } from "../faction/FactionPanel.tsx";
import { arrowsOf, emptyPlans, plansReducer, type PlanEvent } from "../faction/plan.ts";
import { PropagandaPanel } from "../propaganda/PropagandaPanel.tsx";
import { SignalPrompt, signalEnabled } from "../propaganda/SignalPrompt.tsx";
import { ForcesBar } from "../status/Forces.tsx";
import { StatusBar } from "../status/StatusBar.tsx";
import { TrackCard } from "../status/TrackCard.tsx";
import { skipQuestion } from "../propaganda/phases.ts";
import { FullscreenButton } from "./FullscreenButton.tsx";

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
function LastAction({ item, view, onRule }: { readonly item: HistoryItem | undefined; readonly view: BoardView; readonly onRule: (ref: string) => Promise<RuleLookup> }) {
  if (item === undefined) return null;
  return (
    <details className="panel last-action supporting-details" aria-label="Last action">
      <summary>Last action: {actionTitle(item.action, view)}</summary>
      <LogLines item={item} view={view} playerOnly limit={12} onRule={onRule} />
    </details>
  );
}

export function Play({ api, sessionId, onExit, onReview, onOpenState }: PlayProps) {
  const [data, setData] = useState<{ session: SessionRow; head: Head } | null>(null);
  const [legal, setLegal] = useState<LegalChoices | null>(null);
  // The map-built plans (UC-5): one for the Faction panel, one for an Event's free action. Map
  // clicks and drags build the active one.
  const [plans, dispatch] = useReducer(plansReducer, emptyPlans);
  const plan = plans[plans.active];
  const onRule = useCallback((ref: string) => api.rule(sessionId, ref), [api, sessionId]);
  const toFaction = useCallback((e: PlanEvent): void => { dispatch({ ...e, owner: "faction" }); }, []);
  const toEvent = useCallback((e: PlanEvent): void => { dispatch({ ...e, owner: "event" }); }, []);
  /** The space last clicked, shown in the space detail. */
  const [factionTargets, setFactionTargets] = useState<readonly string[] | null>(null);
  const [eventTargets, setEventTargets] = useState<readonly string[] | null>(null);
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
  const [actionsHidden, setActionsHidden] = useState(false);
  const actionToggle = useRef<HTMLButtonElement>(null);
  const panelsToggle = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const toggleMapOnly = (): void => {
    if (!mapOnly && sidebar.current?.contains(document.activeElement)) panelsToggle.current?.focus();
    setMapOnly(!mapOnly);
  };
  // Face-down markers show by default in solo play (DEC-23); the toggle hides them (P4-07).
  const [hideCovert, setHideCovert] = useState(false);
  const [ending, setEnding] = useState(false);
  const [changed, setChanged] = useState<string[]>([]);
  /** Head on screen before a reload, to outline what the next action changed. */
  const shown = useRef<Head | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);
  const loadVersion = useRef(0);
  const load = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoadError(null);
    try {
      const [s, l, h, c] = await Promise.all([api.session(sessionId), api.legal(sessionId), api.history(sessionId), api.categories()]);
      if (version !== loadVersion.current) return;
      const prev = shown.current;
      if (prev === null || prev.actionId !== s.head.actionId) setChanged(prev === null ? [] : changedSpaces(prev.view, s.head.view));
      shown.current = s.head;
      setData(s);
      setLegal(l);
      setHistory(h);
      setCategories(c);
    } catch (e) {
      if (version === loadVersion.current) setLoadError(e instanceof Error ? e.message : String(e));
    }
  }, [api, sessionId]);
  useEffect(() => {
    void load();
    return () => { loadVersion.current++; };
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
      if (data === null || legal === null) return;
      const target = e.target as HTMLElement | null;
      if (target !== null && (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable)) return;
      if (e.key === "h" || e.key === "H") setShowHistory((v) => !v);
      if (e.key === "?") setShowHelp((v) => !v);
      if (e.key === "m" || e.key === "M") toggleMapOnly();
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {e.preventDefault(); void undo();}
      if (e.key === " " && (target === null || target === document.body) && legal.advance === true) {
        e.preventDefault();
        const status = data.head.view.status;
        const skip = status.phase === "propaganda" ? skipQuestion(status.propagandaPhases[status.propagandaStep] ?? "", status.emergencyMoves) : null;
        if (skip !== null && !window.confirm(skip)) return;
        void commit({ type: "Advance" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  });

  const pathIds = useMemo(() => history.filter((h) => h.action.status !== "undone").map((h) => h.action.action_id), [history]);
  const loadFailure = loadError === null ? null : <div><p role="alert">Could not load session: {loadError}</p><button type="button" onClick={() => void load()}>Retry</button><button type="button" onClick={onExit}>Home</button></div>;
  if (data === null || legal === null) return <div className="screen">{loadFailure ?? <p>Loading…</p>}</div>;
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
  const branch = async (actionId: string): Promise<void> => {
    if (!window.confirm(`Start a new branch at ${actionId}? The current branch stays stored.`)) return;
    setError(null);
    try {
      await api.branch(sessionId, actionId, data.head.actionId, data.head.stateHash);
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
  const board = hideCovert ? withoutHidden(view) : view;
  const detail = board.spaces.find((s) => s.id === focused);
  const eventOpen = legal.boxes?.some((b) => b.box === "event" && b.allowed) ?? false;
  const mapTools = (
              <div className="row">
              <button type="button" aria-pressed={showKey} onClick={() => { setShowKey(!showKey); }}>
                Key
              </button>
              <button type="button" aria-pressed={showTracks} onClick={() => { setShowTracks(!showTracks); }}>
                Tracks
              </button>
              <button type="button" aria-pressed={hideCovert} onClick={() => { setHideCovert(!hideCovert); }}>
                Hide Covert
              </button>
              <button ref={actionToggle} type="button" aria-controls="action-panels" aria-expanded={!actionsHidden && !mapOnly} onClick={() => {
                actionToggle.current?.focus();
                setActionsHidden(!actionsHidden && !mapOnly);
                if (mapOnly) setMapOnly(false);
              }}>{actionsHidden || mapOnly ? "Show actions" : "Hide actions"}</button>
              <FullscreenButton />
              <button ref={panelsToggle} type="button" aria-pressed={mapOnly} onClick={toggleMapOnly}>
                {mapOnly ? "Show panels (M)" : "Map only (M)"}
              </button>
              </div>
  );
  // One view (UC-3, UC-4): map with the forces bar below it on the left, status at the top of
  // the scrolling right column, note bar at the bottom. Help, History and End session
  // overlay. Map focus mode (M) hides the status bar and the right column.
  return (
    <div className={`screen play-screen${mapOnly ? " map-only" : ""}${actionsHidden ? " actions-hidden" : ""}`}>
      {showHelp && (
        <div className="overlay">
          <Help onClose={() => { setShowHelp(false); }} view={view} forms={legal.forms ?? []} />
        </div>
      )}
      <div className="play">
        <div className="play-main">
          {loadFailure}
          {error !== null && <p className="bad">{error}</p>}
          <div className="panel map-panel">
            {showTracks && <TrackCard view={view} />}
            <div className="map-body">
            <MapCanvas tools={mapTools} eligible={plans.active === "event" ? eventTargets : factionTargets} view={board} selected={selected} onSelect={select} changed={changed} onDrag={(from, to) => { dispatch({ type: "drag", from, to }); }} arrows={arrowsOf(plan)} />
            </div>
            {detail !== undefined && <div className="space-inspector" aria-live="polite"><button type="button" aria-label="Close space details" onClick={() => {setFocused(null);}}>×</button><SpaceDetail space={detail} tracks={view.status.tracks} /><p className="hint">{(legal.actions ?? []).filter(a => a.locations.includes(detail.id)).map(a => a.label).join(" · ") || "No standalone operation target listed for the acting faction."} Complete plans are checked by the rules engine.</p></div>}
            {showKey && (
              <div className="map-key">
                <Legend view={board} />
              </div>
            )}
          </div>
          {!mapOnly && <ForcesBar view={view} />}
        </div>
        <aside ref={sidebar} className="side" aria-label="Side panel" hidden={mapOnly}>
          {!mapOnly && <StatusBar view={view}>
            <button type="button" onClick={onExit}>Home</button>
            <button type="button" onClick={onReview}>Feedback review</button>
          </StatusBar>}
          <div id="action-panels" className="action-panels" hidden={actionsHidden}>
          <section className="panel next-task" aria-label="Next action">
            <span className="eyebrow">{legal.faction === null ? words(view.status.phase) : `${words(legal.faction)} · ${legal.first === true ? "First" : "Second"} Eligible`}</span>
            <h2>{view.status.pending?.prompt ?? (view.status.ended !== null ? "Game complete" : view.status.phase === "setup" ? "Reveal the first card" : legal.advance === true ? "Advance the sequence" : "Choose your action")}</h2>
            <p>{legal.faction === null ? "Follow the card or phase instructions below." : "Choose an eligibility box, build a plan on the map and check its preview."}</p>
          </section>
          {legal.faction !== null && <FactionPanel onTargets={setFactionTargets} api={api} sessionId={sessionId} view={view} legal={legal} plan={plans.faction} dispatch={toFaction} onCommit={(c) => void commit(c)} onDraft={(c) => { draft.current = c; }} />}
          <CardTable view={view} onReveal={legal.faction === null && view.status.phase === "setup" ? () => void commit({ type: "Advance" }) : null} />
          {view.status.phase === "pivotal" ? <PivotalPanel key={view.status.pending?.id} view={view} onCommit={c => void commit(c)} api={api} sessionId={sessionId} forms={legal.forms ?? []} plan={plans.event} dispatch={toEvent} onTargets={setEventTargets} onFreeAction={(open) => { dispatch({ type: "activate", owner: open ? "event" : "faction" }); }} /> : view.status.phase === "propaganda" ? (
            <>
              {signalEnabled() && <SignalPrompt api={api} sessionId={sessionId} view={view} headActionId={data.head.actionId} pathIds={pathIds} focus={focusStore.get()} />}
              <PropagandaPanel view={view} legal={legal} selected={plans.faction.op.locations} onCommit={(c) => void commit(c)} />
            </>
          ) : (
            <EventPanel onTargets={setEventTargets} api={api} sessionId={sessionId} view={view} faction={legal.faction} eventOpen={eventOpen} onCommit={(c) => void commit(c)} forms={legal.forms ?? []} plan={plans.event} dispatch={toEvent} onFreeAction={(open) => { dispatch({ type: "activate", owner: open ? "event" : "faction" }); }} />
          )}
          <LastAction item={history.filter((h) => h.action.status !== "undone").at(-1)} view={view} onRule={onRule} />
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
          <HistoryDrawer items={history} view={view} onRule={onRule} onClose={() => { setShowHistory(false); }} onBranch={(item) => void branch(item.action.action_id)} headActionId={data.head.actionId} onOpen={(item) => onOpenState?.(item.action.state_hash_before, item.action.state_hash_after)} />
        </div>
      )}
    </div>
  );
}
