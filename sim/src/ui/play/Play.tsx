// Play screen (08 s3; UI simplification): menu bar with the status line, the tracks and forces
// strip, the board, and the side panel with the game actions (faction, event or Propaganda panel).
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { MenuBar, type Menu } from "../common/MenuBar.tsx";
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
import { MAP_MODES, MapCanvas, type MapControls, type MapMode } from "../board/MapCanvas.tsx";
import { withoutHidden } from "../board/markers.tsx";
import { words } from "../common/names.ts";
import { ActiveCards } from "../cards/ActiveCards.tsx";
import { CardFace, EventPanel } from "../event/EventPanel.tsx";
import { PivotalPanel } from "../pivotal/PivotalPanel.tsx";
import { FactionPanel } from "../faction/FactionPanel.tsx";
import { arrowsOf, emptyPlans, plansReducer, type PlanEvent } from "../faction/plan.ts";
import { PropagandaPanel } from "../propaganda/PropagandaPanel.tsx";
import { SignalPrompt, signalEnabled } from "../propaganda/SignalPrompt.tsx";
import { Forces, ForcesBar } from "../status/Forces.tsx";
import { StatusBar } from "../status/StatusBar.tsx";
import { TrackCard } from "../status/TrackCard.tsx";
import { skipQuestion } from "../propaganda/phases.ts";
import { useFullscreen } from "./fullscreen.ts";
import { BotWhy } from "../history/BotWhy.tsx";
import { BOT_DELAYS, BOT_SPEED_LABELS, BOT_SPEEDS, botMoves, saveBotSpeed, savedBotSpeed } from "./bot-speed.ts";

export interface PlayProps {
  readonly api: Api;
  readonly sessionId: string;
  /** Screen items (Home, Feedback review, ...) at the top of the Game menu. */
  readonly screens?: Menu["items"];
  /** After End session. */
  readonly onExit?: () => void;
  readonly onOpenState?: (before: string | null, after: string) => void;
}

/** Spaces whose pieces, markers, level or Control differ between two views. */
export function changedSpaces(before: BoardView, after: BoardView): string[] {
  const key = (s: BoardView["spaces"][number]): string => JSON.stringify([s.pieces, s.markers, s.level, s.control]);
  const was = new Map(before.spaces.map((s) => [s.id, key(s)]));
  return after.spaces.filter((s) => was.get(s.id) !== key(s)).map((s) => s.id);
}

/** What the last committed action did, from its log entries, and why when a bot chose it. */
function LastAction({ item, view, onRule }: { readonly item: HistoryItem | undefined; readonly view: BoardView; readonly onRule: (ref: string) => Promise<RuleLookup> }) {
  if (item === undefined) return null;
  return (
    <details className="panel last-action supporting-details" aria-label="Last action">
      <summary>Last action: {actionTitle(item.action, view)}</summary>
      <LogLines item={item} view={view} playerOnly limit={12} onRule={onRule} />
      <BotWhy records={item.bot ?? []} view={view} />
    </details>
  );
}

/** Bot player ID per faction from the session row; {} for hotseat play. */
function seatsOf(session: SessionRow): Readonly<Record<string, string>> {
  try {
    return JSON.parse(session.seats) as Record<string, string>;
  } catch {
    return {};
  }
}

/** The human's faction when exactly one seat is a bot; null otherwise (hotseat or bot-only). */
function humanOf(seats: Readonly<Record<string, string>>): string | null {
  const bots = Object.keys(seats);
  if (bots.length !== 1) return null;
  return bots[0] === "state" ? "pkk" : "state";
}

/** The click-to-open space detail panel. Off: the map hover text gives the same data (see spaceTooltip). */
const SPACE_INSPECTOR: boolean = false;

export function Play({ api, sessionId, screens = [], onExit, onOpenState }: PlayProps) {
  const [data, setData] = useState<{ session: SessionRow; head: Head; botToAct?: string | null; botExtends?: boolean } | null>(null);
  // Bot seat (audit Plan 2 S1): the bot State part a human PKK extends, the head the bot last
  // stepped from (one request per head) and a stop while Undo or a branch changes the head.
  const [statePart, setStatePart] = useState<Readonly<Record<string, unknown>> | null>(null);
  const [pkkOptions, setPkkOptions] = useState<readonly Readonly<Record<string, unknown>>[] | null>(null);
  const [botError, setBotError] = useState<string | null>(null);
  const stepped = useRef<string | null>(null);
  const rewinding = useRef(false);
  /** The pending wait before a bot step; Undo and a branch clear it before they change the head. */
  const botTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [speed, setSpeed] = useState(savedBotSpeed);
  /** The action whose bot moves a map click hid: the player's own plan takes the map (R1.3). */
  const [movesSeen, setMovesSeen] = useState<string | null>(null);
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
  const [showForces, setShowForces] = useState(false);
  const [mapOnly, setMapOnly] = useState(false);
  const [mode, setMode] = useState<MapMode>("full");
  const mapControls = useRef<MapControls>(null);
  const noteBar = useRef<{ readonly open: () => void }>(null);
  const fullscreen = useFullscreen();
  const sidebar = useRef<HTMLElement>(null);
  /** Map only hides the side panel; focus inside it moves to the page so keys keep working. */
  const toggleMapOnly = (): void => {
    if (!mapOnly && sidebar.current?.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
    setMapOnly(!mapOnly);
  };
  /** The setup head the UI last revealed the first card from, so it sends one Advance per head. */
  const revealed = useRef<string | null>(null);
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
      // An Operation that pauses for a question continues the same action: compare the state too.
      if (prev === null || prev.actionId !== s.head.actionId || prev.stateHash !== s.head.stateHash) {
        setChanged(prev === null ? [] : changedSpaces(prev.view, s.head.view));
        setStatePart(null);
        setPkkOptions(null);
        setBotError(null);
      }
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

  // The seated bot acts after the chosen wait when the head is its decision (R1.1). A new head,
  // a speed change, Pause, a bot error and unmount clear the wait; so do Undo and a branch.
  const botToAct = data?.botToAct ?? null;
  useEffect(() => {
    if (data === null || botToAct === null || rewinding.current || speed === "pause" || botError !== null) return;
    // One request per head state: a continued Operation keeps its action ID but changes the state.
    const at = `${data.head.actionId}:${data.head.stateHash}`;
    if (stepped.current === at) return;
    const timer = setTimeout(() => {
      stepped.current = at;
      api.botStep(sessionId, data.head.actionId, data.head.stateHash).then((r) => {
        if (r.partial !== null) {
          setStatePart(r.partial);
          setPkkOptions(r.options);
        }
        else void load();
      }).catch((e: unknown) => {
        stepped.current = null;
        setBotError(e instanceof Error ? e.message : String(e));
      });
    }, BOT_DELAYS[speed]);
    botTimer.current = timer;
    return () => { clearTimeout(timer); };
  }, [api, sessionId, data, botToAct, load, speed, botError]);

  // The first card is revealed without a click, like every later card (engine turn.ts). Undo never
  // goes back past it (see `undoable`), so a reveal happens once per setup head.
  const setupHead = data !== null && legal !== null && data.head.view.status.phase === "setup" && legal.faction === null && legal.advance === true ? `${data.head.actionId}:${data.head.stateHash}` : null;
  useEffect(() => {
    if (setupHead === null || revealed.current === setupHead) return;
    revealed.current = setupHead;
    void commit({ type: "Advance" });
  }, [setupHead]);

  const commit = async (command: AnyCommand): Promise<void> => {
    if (data === null) return;
    setError(null);
    try {
      // A human State part of a joint phase goes to the PKK bot, which extends and commits it.
      const toPkkBot = data.botExtends === true && (command.type === "PropagandaChoice" || command.type === "Advance");
      const result = toPkkBot
        ? await api.botStep(sessionId, data.head.actionId, data.head.stateHash, command.type === "Advance" ? {} : ((command["choice"] ?? {}) as Record<string, unknown>))
        : await api.submit(sessionId, command, data.head.actionId, data.head.stateHash);
      last.current = { id: result.actionId, at: Date.now() };
      draft.current = null;
      dispatch({ type: "resetAll" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  // A layout effect: the listener of a render is attached in the same commit that shows that
  // render. A passive effect runs later, and a key in that gap went to the stale listener.
  useLayoutEffect(() => {
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

  // The session start and the first card reveal are both setup actions: nothing before play to undo.
  const undoable = history.some((h) => h.action.status !== "undone" && h.action.phase !== "setup");
  const pathIds = useMemo(() => history.filter((h) => h.action.status !== "undone").map((h) => h.action.action_id), [history]);
  const loadFailure = loadError === null ? null : <div><p role="alert">Could not load session: {loadError}</p><button type="button" onClick={() => void load()}>Retry</button><button type="button" onClick={onExit}>Home</button></div>;
  if (data === null || legal === null) return <div className="screen">{loadFailure ?? <p>Loading…</p>}</div>;
  const view = data.head.view;
  const lastItem = history.filter((h) => h.action.status !== "undone").at(-1);
  const planArrows = arrowsOf(plan);
  const lastMoves = planArrows.length === 0 && lastItem !== undefined && movesSeen !== lastItem.action.action_id ? botMoves(lastItem) : [];
  const select = (id: string, add: boolean): void => {
    setMovesSeen(lastItem?.action.action_id ?? null);
    dispatch({ type: "click", id, add });
    setFocused(id);
    focusStore.set({ panel: "board", selectedSpace: id });
  };
  const selected = plan[plan.target].locations;
  const anchor = (): ReturnType<typeof defaultAnchor> =>
    defaultAnchor({ lastActionId: last.current.id, lastActionAt: last.current.at, now: Date.now(), draft: draft.current, selectedSpace: focusStore.get().selectedSpace });
  const undo = async (): Promise<void> => {
    if (!undoable) return;
    // With a bot seat, Undo goes back past the bot's actions to the human's last action.
    const committed = history.filter((h) => h.action.status !== "undone").reverse();
    // A bot-only action has bot records and no human part; a joint action the human completed stops the walk.
    const botOnly = (h: HistoryItem): boolean => (h.bot ?? []).length > 0 && !(h.bot ?? []).some((r) => r.humanJoined === true);
    let steps = humanOf(seatsOf(data.session)) === null ? 1 : committed.findIndex((h) => !botOnly(h)) + 1;
    if (steps <= 0) steps = committed.length;
    if (!window.confirm(steps > 1 ? `Undo your last action and the ${String(steps - 1)} bot action(s) after it?` : "Undo the last action?")) return;
    setError(null);
    clearTimeout(botTimer.current);
    rewinding.current = true;
    try {
      let at = { actionId: data.head.actionId, stateHash: data.head.stateHash };
      for (let i = 0; i < steps; i++) {
        const result = await api.undo(sessionId, at.actionId, at.stateHash);
        if (result.undoneAfterRandom) setError(`Undid ${result.undone}. It used a random result; the undo is flagged.`);
        const head = result.state;
        if (head === undefined) break;
        at = { actionId: head.actionId, stateHash: head.stateHash };
      }
      last.current = { id: null, at: null };
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      rewinding.current = false;
      stepped.current = null;
      await load();
    }
  };
  const branch = async (actionId: string): Promise<void> => {
    if (!window.confirm(`Start a new branch at ${actionId}? The current branch stays stored.`)) return;
    setError(null);
    clearTimeout(botTimer.current);
    rewinding.current = true;
    try {
      await api.branch(sessionId, actionId, data.head.actionId, data.head.stateHash);
      last.current = { id: null, at: null };
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      rewinding.current = false;
      // A branch can return to a head the bot already stepped from: let it act there again.
      stepped.current = null;
      await load();
    }
  };
  const end = async (debrief: string | null): Promise<void> => {
    await api.endSession(sessionId, debrief);
    setEnding(false);
    onExit?.();
  };
  const seats = seatsOf(data.session);
  const human = humanOf(seats);
  const botTurn = botToAct !== null && statePart === null;
  const board = hideCovert ? withoutHidden(view) : view;
  const detail = board.spaces.find((s) => s.id === focused);
  const eventOpen = legal.boxes?.some((b) => b.box === "event" && b.allowed) ?? false;
  const check = (label: string, checked: boolean, toggle: () => void, shortcut?: string): Menu["items"][number] => ({ label, checked, onSelect: toggle, ...(shortcut === undefined ? {} : { shortcut }) });
  const menus: Menu[] = [
    { label: "Game", items: [
      ...screens,
      ...(screens.length > 0 ? ["separator" as const] : []),
      { label: "Undo", shortcut: "Ctrl+Z", disabled: !undoable, onSelect: () => void undo() },
      { label: "History", shortcut: "H", onSelect: () => { setShowHistory(!showHistory); } },
      { label: "Note", shortcut: "N", onSelect: () => { noteBar.current?.open(); } },
      "separator",
      { label: "End session", onSelect: () => { setEnding(true); } },
    ] },
    { label: "View", items: [
      check("Map only", mapOnly, toggleMapOnly, "M"),
      { label: fullscreen.active ? "Exit fullscreen" : "Fullscreen", disabled: fullscreen.pending, onSelect: () => void fullscreen.toggle() },
      "separator",
      check("Tracks", showTracks, () => { setShowTracks(!showTracks); }),
      check("Forces table", showForces, () => { setShowForces(!showForces); }),
      check("Key", showKey, () => { setShowKey(!showKey); }),
    ] },
    { label: "Map", items: [
      ...MAP_MODES.map((m) => ({ label: words(m), radio: true, checked: mode === m, onSelect: () => { setMode(m); } })),
      "separator",
      { label: "Zoom in", onSelect: () => { mapControls.current?.zoomIn(); } },
      { label: "Zoom out", onSelect: () => { mapControls.current?.zoomOut(); } },
      { label: "Fit map", onSelect: () => { mapControls.current?.fit(); } },
      "separator",
      check("Hide Covert", hideCovert, () => { setHideCovert(!hideCovert); }),
    ] },
    ...(Object.keys(seats).length > 0 ? [{ label: "Bot", items: BOT_SPEEDS.map((b) => ({ label: BOT_SPEED_LABELS[b], radio: true, checked: speed === b, onSelect: () => { saveBotSpeed(b); setSpeed(b); } })) }] : []),
    { label: "Help", items: [{ label: "Help and keys", shortcut: "?", onSelect: () => { setShowHelp(!showHelp); } }] },
  ];
  // One view (UC-3, UC-4): menu bar with the status line, the tracks and forces strip, the map and
  // the side panel with the game actions. Help, History and End session overlay. Map only (M)
  // hides the side panel and the forces.
  return (
    <div className={`screen play-screen${mapOnly ? " map-only" : ""}`}>
      <MenuBar menus={menus} status={<StatusBar view={view} />} />
      {fullscreen.message !== null && <p className="fullscreen-message" role="status">{fullscreen.message}</p>}
      {showHelp && (
        <div className="overlay">
          <Help onClose={() => { setShowHelp(false); }} view={view} forms={legal.forms ?? []} />
        </div>
      )}
      {(showTracks || !mapOnly) && (
        <div className="status-strip">
          {showTracks && <TrackCard view={view} />}
          {!mapOnly && <ForcesBar view={view} />}
        </div>
      )}
      {showForces && <div className="forces-row"><Forces view={view} /></div>}
      <div className="play">
        <div className="play-main">
          {loadFailure}
          {error !== null && <p className="bad">{error}</p>}
          <div className="panel map-panel">
            <div className="map-body">
            <MapCanvas controls={mapControls} mode={mode} eligible={plans.active === "event" ? eventTargets : factionTargets} view={board} selected={selected} onSelect={select} changed={changed} onDrag={(from, to) => { dispatch({ type: "drag", from, to }); }} arrows={planArrows} lastMoves={lastMoves} />
            </div>
            {SPACE_INSPECTOR && detail !== undefined && <div className="space-inspector" aria-live="polite"><button type="button" aria-label="Close space details" onClick={() => {setFocused(null);}}>×</button><SpaceDetail space={detail} tracks={view.status.tracks} /><p className="hint">{(legal.actions ?? []).filter(a => a.locations.includes(detail.id)).map(a => a.label).join(" · ") || "No standalone operation target listed for the acting faction."} Complete plans are checked by the rules engine.</p></div>}
            {showKey && (
              <div className="map-key">
                <Legend view={board} />
              </div>
            )}
          </div>
        </div>
        <aside ref={sidebar} className="side" aria-label="Side panel" hidden={mapOnly}>
          {legal.faction === null && (
            <section className="panel next-task" aria-label="Next action">
              <span className="eyebrow">{words(view.status.phase)}</span>
              <h2>{view.status.pending?.prompt ?? (view.status.ended !== null ? "Game complete" : view.status.phase === "setup" ? "Revealing the first card" : legal.advance === true ? "Advance the sequence" : "Follow the card or phase instructions below")}</h2>
            </section>
          )}
          {botTurn && (
            <section className="panel" aria-label="Bot turn">
              <p>{words(botToAct)} bot ({seats[botToAct] ?? ""}) is choosing…</p>
              {botError !== null && (
                <>
                  <p className="bad">{botError}</p>
                  <button type="button" onClick={() => { setBotError(null); void load(); }}>Retry</button>
                </>
              )}
            </section>
          )}
          {!botTurn && legal.faction !== null && <FactionPanel onTargets={setFactionTargets} api={api} sessionId={sessionId} view={view} legal={legal} plan={plans.faction} dispatch={toFaction} onCommit={(c) => void commit(c)} onDraft={(c) => { draft.current = c; }} />}
          {(botTurn || view.status.phase === "pivotal" || view.status.phase === "propaganda") && <CardFace view={view} />}
          {botTurn ? null : view.status.phase === "pivotal" ? <PivotalPanel key={view.status.pending?.id} view={view} onCommit={c => void commit(c)} api={api} sessionId={sessionId} forms={legal.forms ?? []} plan={plans.event} dispatch={toEvent} onTargets={setEventTargets} onFreeAction={(open) => { dispatch({ type: "activate", owner: open ? "event" : "faction" }); }} /> : view.status.phase === "propaganda" ? (
            <>
              {signalEnabled() && <SignalPrompt api={api} sessionId={sessionId} view={view} headActionId={data.head.actionId} pathIds={pathIds} focus={focusStore.get()} />}
              <PropagandaPanel view={view} legal={legal} selected={plans.faction.op.locations} onCommit={(c) => void commit(c)} human={human} statePart={statePart} pkkOptions={pkkOptions} />
            </>
          ) : (
            <EventPanel onTargets={setEventTargets} api={api} sessionId={sessionId} view={view} faction={legal.faction} eventOpen={eventOpen} onCommit={(c) => void commit(c)} forms={legal.forms ?? []} plan={plans.event} dispatch={toEvent} onFreeAction={(open) => { dispatch({ type: "activate", owner: open ? "event" : "faction" }); }} />
          )}
          <ActiveCards view={view} />
          <LastAction item={lastItem} view={view} onRule={onRule} />
        </aside>
      </div>
      {ending && (
        <div className="overlay">
          <EndSession onEnd={(d) => void end(d)} onCancel={() => { setEnding(false); }} />
        </div>
      )}
      <NoteBar
        handle={noteBar}
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
