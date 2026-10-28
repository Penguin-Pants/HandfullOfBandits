// Home screen (08 s6): package, scenario, options, seed, name, saved sessions.
import { useEffect, useState } from "react";
import type { Api, PackageSummary, SessionRow } from "../api.ts";
import { startBlockers } from "./start-rule.ts";

export interface HomeProps {
  readonly api: Api;
  readonly onOpen: (sessionId: string) => void;
  readonly onCheck: (pkg: PackageSummary) => void;
}

export function Home({ api, onOpen, onCheck }: HomeProps) {
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [dir, setDir] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [options, setOptions] = useState<Record<string, string | number>>({});
  const [seed, setSeed] = useState("1");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api.packages().then((list) => {
      setPackages(list);
      const first = list[0];
      if (first !== undefined) {
        setDir(first.dir);
        setScenarioId(first.scenarios.find((s) => s.blockedBy.length === 0)?.id ?? first.scenarios[0]?.id ?? "");
      }
    });
    void api.sessions().then(setSessions);
  }, [api]);

  const pkg = packages.find((p) => p.dir === dir);
  const blockers = startBlockers(pkg, scenarioId, seed);
  const warnings = pkg?.issues.filter((i) => i.level === "warning") ?? [];

  const start = async (): Promise<void> => {
    setError(null);
    try {
      const created = await api.createSession({ dir, scenarioId, seed: Number(seed), name: name === "" ? `${scenarioId}-seed${seed}` : name, options });
      onOpen(created.sessionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="screen">
      <section className="panel" aria-label="New session">
        <div className="row">
          <label>
            Package{" "}
            <select value={dir} onChange={(e) => { setDir(e.target.value); }}>
              {packages.map((p) => (
                <option key={p.dir} value={p.dir}>
                  {p.packageId ?? p.dir} {p.version ?? ""}
                </option>
              ))}
            </select>
          </label>
          {pkg !== undefined && (
            <button type="button" onClick={() => { onCheck(pkg); }}>
              Check: {pkg.issues.filter((i) => i.level === "error").length} errors, {warnings.length} warnings
            </button>
          )}
        </div>
        <div className="row">
          <label>
            Scenario{" "}
            <select value={scenarioId} onChange={(e) => { setScenarioId(e.target.value); }}>
              {pkg?.scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                  {s.blockedBy.length > 0 ? " (blocked)" : ""}
                </option>
              ))}
            </select>
          </label>
          {Object.entries(pkg?.options ?? {}).map(([key, values]) => (
            <label key={key}>
              {key}{" "}
              <select value={String(options[key] ?? values[0] ?? "")} onChange={(e) => { setOptions({ ...options, [key]: e.target.value }); }}>
                {values.map((v) => (
                  <option key={String(v)} value={String(v)}>
                    {String(v)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="row">
          <label>
            Seed <input value={seed} onChange={(e) => { setSeed(e.target.value); }} size={12} />
          </label>
          <button type="button" onClick={() => { setSeed(String(Math.floor(Math.random() * 1_000_000_000))); }}>
            Random
          </button>
          <label>
            Name <input value={name} placeholder={`${scenarioId}-seed${seed}`} onChange={(e) => { setName(e.target.value); }} />
          </label>
          <button type="button" disabled={blockers.length > 0} title={blockers.join(" ")} onClick={() => void start()}>
            Start
          </button>
        </div>
        {blockers.length > 0 && <p className="bad">{blockers.join(" ")}</p>}
        {error !== null && <p className="bad">{error}</p>}
        {pkg !== undefined && pkg.assumptions.length > 0 && (
          <details>
            <summary>{pkg.assumptions.length} prototype assumptions active</summary>
            <ul>
              {pkg.assumptions.map((a) => (
                <li key={a.id}>
                  {a.id} ({a.status}): {a.text}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
      <section className="panel" aria-label="Saved sessions">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Scenario</th>
              <th>Seed</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.session_id}>
                <td>{s.name}</td>
                <td>{s.scenario_id}</td>
                <td>{s.seed}</td>
                <td>{s.status}</td>
                <td>
                  <button type="button" onClick={() => { onOpen(s.session_id); }}>
                    Resume
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
