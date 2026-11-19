// Experiment reports (audit Plan 3 A5): pick a run, read its latest report, then open one of its
// games as a new session at a chosen decision (the number of recorded commands to replay). The
// session opens on the Play screen; its History shows every replayed action.
import { useEffect, useState } from "react";
import type { Api, ExperimentDetail, ExperimentGameRow, ExperimentSummary } from "../api.ts";

function GameRow({ api, run, game, onOpen }: { readonly api: Api; readonly run: string; readonly game: ExperimentGameRow; readonly onOpen: (sessionId: string) => void }) {
  const [decision, setDecision] = useState(String(game.commands));
  const [notice, setNotice] = useState<{ readonly text: string; readonly sessionId: string | null } | null>(null);
  const n = Number(decision);
  const valid = decision.trim() !== "" && Number.isInteger(n) && n >= 0 && n <= game.commands;
  const open = (): void => {
    setNotice(null);
    api.openExperimentGame(run, game.gameId, n).then((r) => {
      if (r.divergedAt === null) onOpen(r.sessionId);
      else setNotice({ text: `This engine plays decision ${String(r.divergedAt)} differently (rules code changed since the run). The session stops after decision ${String(r.applied)}.`, sessionId: r.sessionId });
    }).catch((e: unknown) => { setNotice({ text: e instanceof Error ? e.message : String(e), sessionId: null }); });
  };
  return (
    <tr>
      <td>{game.gameId}{game.review ? " (review)" : ""}</td>
      <td>{game.state}</td>
      <td>{game.pkk}</td>
      <td>{game.seed}</td>
      <td>{game.status}</td>
      <td>{game.winner ?? ""}</td>
      <td>
        <label>
          Decision <input type="number" min={0} max={game.commands} value={decision} onChange={(e) => { setDecision(e.target.value); }} aria-label={`Decision for ${game.gameId}`} /> of {game.commands}
        </label>{" "}
        <button type="button" disabled={!valid} onClick={open}>Open at decision</button>
        {notice !== null && (
          <p className="warn" role="status">
            {notice.text}{" "}
            {notice.sessionId !== null && <button type="button" onClick={() => { onOpen(notice.sessionId ?? ""); }}>Go to session</button>}
          </p>
        )}
      </td>
    </tr>
  );
}

export function Experiments({ api, onOpen }: { readonly api: Api; readonly onOpen: (sessionId: string) => void }) {
  const [runs, setRuns] = useState<ExperimentSummary[]>([]);
  const [detail, setDetail] = useState<ExperimentDetail | null>(null);
  const [reviewOnly, setReviewOnly] = useState(false);
  useEffect(() => { void api.experiments().then(setRuns); }, [api]);
  const games = detail === null ? [] : detail.games.filter((g) => !reviewOnly || g.review);

  return (
    <div className="screen experiments" aria-label="Experiment reports">
      <h2>Experiment reports</h2>
      {detail === null ? (
        <>
          <p className="muted">Runs under the experiment folder (HOB_EXPERIMENTS). Write a report with <code>sim experiment analyze &lt;run&gt;</code>.</p>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Run</th><th>Stage</th><th>State</th><th>Games</th><th>Report</th><th /></tr></thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id}>
                    <td title={r.description}>{r.id}</td>
                    <td>{r.stage}</td>
                    <td>{r.state}</td>
                    <td>{r.scheduled}</td>
                    <td>{r.hasReport ? "yes" : "no"}</td>
                    <td><button type="button" onClick={() => { void api.experiment(r.id).then(setDetail); }}>Open {r.id}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {runs.length === 0 && <p className="muted">No experiment runs found.</p>}
        </>
      ) : (
        <>
          <div className="row">
            <button type="button" onClick={() => { setDetail(null); }}>All runs</button>
            <strong>{detail.id}</strong> <span className="muted">{detail.description}</span>
          </div>
          {detail.report === null ? <p className="muted">No report yet.</p> : <pre aria-label="Report">{detail.report}</pre>}
          <h3>Games</h3>
          <label>
            <input type="checkbox" checked={reviewOnly} onChange={() => { setReviewOnly(!reviewOnly); }} /> Review selection only
          </label>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Game</th><th>State</th><th>PKK</th><th>Seed</th><th>Status</th><th>Winner</th><th>Open as a session</th></tr></thead>
              <tbody>{games.map((g) => <GameRow key={g.gameId} api={api} run={detail.id} game={g} onOpen={onOpen} />)}</tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
