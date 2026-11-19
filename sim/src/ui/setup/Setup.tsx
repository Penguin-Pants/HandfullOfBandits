// Setup editor (audit Plan 4 V2; 7.2): edit one scenario's start setup as a variant of a package.
// The editor keeps only the fields that differ from the package (the overlay). The server checks
// each edit; its issues show in the row they belong to. Totals are live: on map + Available + Out
// of Play = total, with Available derived. Save writes variants/<name>.yaml; Home then starts it.
import { useEffect, useRef, useState } from "react";
import { ApiError, type Api, type PackageSummary, type SetupBase, type SetupChange, type VariantCheck } from "../api.ts";
import type { PackageIssue } from "../../package/validate.ts";
import { words } from "../common/names.ts";

type Overlay = Record<string, unknown>;
type Counts = number | Readonly<Record<string, number>>;
interface SpaceEntry {
  readonly level?: number | undefined;
  readonly pieces?: Readonly<Record<string, Counts>> | undefined;
  readonly markers?: Readonly<Record<string, Counts>> | undefined;
}

/** A number or step ID as input text; anything else as empty. */
const asText = (v: unknown): string => (typeof v === "number" || typeof v === "string" ? String(v) : "");

const same = (a: unknown, b: unknown): boolean => JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b));
function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (typeof v === "object" && v !== null) return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]));
  return v;
}
const record = (v: unknown): Record<string, unknown> => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/**
 * Set `field.key` of the overlay to `value`, or drop it when it equals the package value. A field
 * with no keys left is dropped too, so the overlay names only changes.
 */
export function setKey(overlay: Overlay, field: string, key: string, value: unknown, baseValue: unknown): Overlay {
  const inner = { ...record(overlay[field]) };
  if (value === undefined || same(value, baseValue)) Reflect.deleteProperty(inner, key);
  else inner[key] = value;
  const next = { ...overlay, [field]: inner };
  if (Object.keys(inner).length === 0) Reflect.deleteProperty(next, field);
  return next;
}

type Piece = SetupBase["pieces"][number];
/** Faces the editor shows for a piece type: its flip states, or one unnamed face. */
const facesOf = (p: Piece): readonly string[] => (p.faces.length === 0 ? [""] : p.faces);

/** Count of one face in a space entry. A bare count is on the `placedAs` face. */
export function faceCount(entry: SpaceEntry, p: Piece, face: string): number {
  const v = entry.pieces?.[p.id];
  if (v === undefined) return 0;
  if (typeof v === "number") return face === "" || face === p.placedAs ? v : 0;
  return face === "" ? Object.values(v).reduce((a, b) => a + b, 0) : (v[face] ?? 0);
}

/** The entry with one face count set. Writes a bare count when only the `placedAs` face is used. */
export function withFace(entry: SpaceEntry, p: Piece, face: string, n: number): SpaceEntry {
  const faces = facesOf(p);
  const counts = Object.fromEntries(faces.map((f) => [f, f === face ? n : faceCount(entry, p, f)]));
  const used = Object.entries(counts).filter(([, c]) => c > 0);
  const pieces = { ...entry.pieces };
  if (used.length === 0) Reflect.deleteProperty(pieces, p.id);
  else if (face === "" || used.every(([f]) => f === p.placedAs)) pieces[p.id] = used.reduce((a, [, c]) => a + c, 0);
  else pieces[p.id] = Object.fromEntries(used);
  const next: { -readonly [K in keyof SpaceEntry]: SpaceEntry[K] } = { ...entry, pieces };
  if (Object.keys(pieces).length === 0) Reflect.deleteProperty(next, "pieces");
  return next;
}

/** The entry with its level set; Neutral (0) is written as no level. */
export function withLevel(entry: SpaceEntry, n: number): SpaceEntry {
  const next: { -readonly [K in keyof SpaceEntry]: SpaceEntry[K] } = { ...entry, level: n };
  if (n === 0) Reflect.deleteProperty(next, "level");
  return next;
}

/** Live totals per piece type: on map, Available (derived), Out of Play and the total. */
export function totals(setup: SetupBase, overlay: Overlay): { readonly piece: Piece; readonly onMap: number; readonly available: number; readonly outOfPlay: number; readonly total: number }[] {
  const spaces = { ...setup.values.spaces, ...record(overlay["spaces"]) } as Record<string, SpaceEntry>;
  return setup.pieces.map((p) => {
    const onMap = Object.values(spaces).reduce((sum, e) => sum + faceCount(e, p, ""), 0);
    const outOfPlay = Number(record(overlay["outOfPlay"])[p.id] ?? setup.values.outOfPlay[p.id] ?? 0);
    const total = Number(record(overlay["pieces"])[p.id] ?? p.count);
    return { piece: p, onMap, outOfPlay, total, available: total - onMap - outOfPlay };
  });
}

/** Row an issue belongs to: `space:<id>`, `piece:<id>`, `threshold:<id>`, `track:<id>`, or null. */
export function rowOf(issue: PackageIssue, pieces: readonly string[]): string | null {
  const [head, key] = issue.path.split(".");
  if (head === "spaces" && key !== undefined) return `space:${key}`;
  if (head === "thresholds" && key !== undefined) return `threshold:${key}`;
  if (head === "tracks" && key !== undefined) return `track:${issue.id ?? key}`;
  if ((head === "pieces" || head === "outOfPlay") && key !== undefined) return `piece:${key}`;
  if (issue.code === "V-PIECES" && issue.id !== null && pieces.includes(issue.id)) return `piece:${issue.id}`;
  return null;
}

/** One change against the package in words, for example "Siirt: Police 1 to 2". */
export function changeText(c: SetupChange, setup: SetupBase): string {
  const space = c.space === null ? "" : `${setup.spaces.find((s) => s.id === c.space)?.name ?? c.space}: `;
  const what = c.id === null ? "" : words(c.id);
  const face = c.face === null ? "" : ` (${words(c.face)})`;
  const label: Record<SetupChange["kind"], string> = {
    threshold: `${setup.factions.find((f) => f.id === c.id)?.name ?? what} threshold`,
    track: setup.tracks.find((t) => t.id === c.id)?.display ?? what,
    level: "level",
    piece: `${what}${face}`,
    marker: `${what}${face}`,
    available: `Available ${what}`,
    outOfPlay: `Out of Play ${what}`,
    total: `${what} total`,
  };
  const value = (v: number | string | null): string => (v === null ? "none" : typeof v === "string" ? words(v) : String(v));
  return `${space}${label[c.kind]} ${value(c.from)} to ${value(c.to)}`;
}

function Issues({ list }: { readonly list: readonly PackageIssue[] }) {
  if (list.length === 0) return null;
  return (
    <ul className="issues">
      {list.map((i) => (
        <li key={`${i.code}${i.path}${i.message}`} className={i.level === "error" ? "bad" : "warn"}>
          {i.level === "error" ? "❌" : "⚠️"} {i.code}: {i.message}
        </li>
      ))}
    </ul>
  );
}

export interface SetupProps {
  readonly api: Api;
  readonly pkg: PackageSummary;
  readonly scenarioId: string;
  readonly onBack: () => void;
}

export function Setup({ api, pkg, scenarioId, onBack }: SetupProps) {
  const [overlay, setOverlay] = useState<Overlay>({ scenario: scenarioId });
  const [check, setCheck] = useState<VariantCheck | null>(null);
  const [setup, setSetup] = useState<SetupBase | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ readonly text: string; readonly bad: boolean } | null>(null);
  const [exists, setExists] = useState(false);
  const latest = useRef(0);

  useEffect(() => {
    const ticket = ++latest.current;
    api.checkVariant({ dir: pkg.dir, overlay }).then((r) => {
      if (ticket !== latest.current) return;
      setCheck(r);
      if (r.setup !== null) setSetup(r.setup);
    }).catch((e: unknown) => { setMessage({ text: e instanceof Error ? e.message : String(e), bad: true }); });
  }, [api, pkg.dir, overlay]);

  /** Load an overlay from the server: an import or a saved variant. */
  const load = (request: Promise<VariantCheck>, loadedName: string | null): void => {
    setMessage(null);
    request.then((r) => {
      setOverlay(record(r.overlay));
      if (loadedName !== null) setName(loadedName);
    }).catch((e: unknown) => { setMessage({ text: e instanceof Error ? e.message : String(e), bad: true }); });
  };

  const save = (replace: boolean): void => {
    setMessage(null);
    api.saveVariant({ dir: pkg.dir, name, overlay, replace }).then((r) => {
      setExists(false);
      setMessage({ text: `Saved variant ${r.name} (hash ${(r.hash ?? "").slice(0, 12)}). Pick it on Home to start a session.`, bad: false });
    }).catch((e: unknown) => {
      if (e instanceof ApiError && e.status === 409) setExists(true);
      setMessage({ text: e instanceof Error ? e.message : String(e), bad: true });
    });
  };

  if (setup === null) return <div className="screen"><p>Loading setup…</p>{message !== null && <p className="bad">{message.text}</p>}</div>;
  const issues = check?.issues ?? [];
  const pieceIds = setup.pieces.map((p) => p.id);
  const at = (row: string): PackageIssue[] => issues.filter((i) => rowOf(i, pieceIds) === row);
  const general = issues.filter((i) => rowOf(i, pieceIds) === null);
  const spaces = record(overlay["spaces"]) as Record<string, SpaceEntry>;
  const entryOf = (id: string): SpaceEntry => spaces[id] ?? setup.values.spaces[id] ?? {};
  const setSpace = (id: string, entry: SpaceEntry): void => { setOverlay(setKey(overlay, "spaces", id, entry, setup.values.spaces[id] ?? {})); };
  const columns = setup.pieces.flatMap((p) => facesOf(p).map((face) => ({ p, face })));
  const range = Array.from({ length: setup.levelRange * 2 + 1 }, (_, i) => i - setup.levelRange);
  const errors = issues.filter((i) => i.level === "error").length;

  return (
    <div className="screen">
      <section className="panel" aria-label="Setup editor">
        <div className="row">
          <button type="button" onClick={onBack}>Back to Home</button>
          <strong>Setup editor: {pkg.title ?? pkg.packageId} {pkg.version}, scenario {scenarioId}</strong>
        </div>
        <div className="row">
          <label>
            Open variant{" "}
            <select aria-label="Open variant" value="" onChange={(e) => { if (e.target.value !== "") load(api.checkVariant({ dir: pkg.dir, name: e.target.value }), e.target.value); }}>
              <option value="">Choose…</option>
              {pkg.variants.map((v) => <option key={v.name} value={v.name}>{v.name}{v.ok ? "" : " (errors)"}</option>)}
            </select>
          </label>
          <label>
            Import YAML <input type="file" accept=".yaml,.yml" aria-label="Import YAML" onChange={(e) => { const file = e.target.files?.[0]; if (file !== undefined) load(file.text().then((text) => api.checkVariant({ dir: pkg.dir, text })), null); }} />
          </label>
          <button type="button" onClick={() => { setOverlay({ scenario: scenarioId }); setMessage(null); }}>Reset to package setup</button>
          {check?.yaml != null && <a href={`data:text/yaml;charset=utf-8,${encodeURIComponent(check.yaml)}`} download={`${name === "" ? "variant" : name}.yaml`}>Export YAML</a>}
        </div>
        <div className="row">
          <label>
            Variant name <input value={name} placeholder="thresholds-43-38" onChange={(e) => { setName(e.target.value); setExists(false); }} />
          </label>
          <button type="button" disabled={name === "" || errors > 0} title={errors > 0 ? "Fix the errors first." : ""} onClick={() => { save(false); }}>Save variant</button>
          {exists && <button type="button" onClick={() => { save(true); }}>Replace {name}</button>}
        </div>
        {message !== null && <p className={message.bad ? "bad" : "ok"} role="status">{message.text}</p>}
        <p>{errors === 0 ? "✅ No errors." : `❌ ${String(errors)} errors.`} {check?.hash != null ? `Variant hash ${check.hash.slice(0, 12)}.` : ""}</p>
        <Issues list={general} />
      </section>

      <section className="panel" aria-label="Thresholds and tracks">
        <div className="row">
          {setup.factions.map((f) => (
            <label key={f.id}>
              {f.name} threshold{" "}
              <input type="number" aria-label={`${f.name} threshold`} value={asText(record(overlay["thresholds"])[f.id] ?? setup.values.thresholds[f.id])}
                onChange={(e) => { setOverlay(setKey(overlay, "thresholds", f.id, e.target.value === "" ? undefined : Number(e.target.value), setup.values.thresholds[f.id])); }} />
              <Issues list={at(`threshold:${f.id}`)} />
            </label>
          ))}
        </div>
        <div className="row">
          {setup.tracks.map((t) => {
            const value = record(overlay["tracks"])[t.id] ?? setup.values.tracks[t.id];
            const set = (v: number | string): void => { setOverlay(setKey(overlay, "tracks", t.id, v, setup.values.tracks[t.id])); };
            return (
              <label key={t.id}>
                {t.display}{" "}
                {t.kind === "numeric"
                  ? <input type="number" aria-label={t.display} min={t.min ?? undefined} max={t.max ?? undefined} value={asText(value)} onChange={(e) => { set(Number(e.target.value)); }} />
                  : <select aria-label={t.display} value={asText(value)} onChange={(e) => { set(e.target.value); }}>{t.steps.map((s) => <option key={s} value={s}>{words(s)}</option>)}</select>}
                <Issues list={at(`track:${t.id}`)} />
              </label>
            );
          })}
        </div>
      </section>

      <section className="panel" aria-label="Piece totals">
        <table>
          <thead><tr><th>Piece</th><th>On map + Available + Out of Play = total</th><th>Out of Play</th><th>Total</th><th /></tr></thead>
          <tbody>
            {totals(setup, overlay).map((t) => (
              <tr key={t.piece.id} className={t.available < 0 ? "bad" : ""}>
                <td>{words(t.piece.id)}</td>
                <td>{words(t.piece.id)}: {t.onMap} on map + {t.available} Available + {t.outOfPlay} Out of Play = {t.onMap + t.available + t.outOfPlay} of {t.total}</td>
                <td><input type="number" min={0} className="count" aria-label={`${words(t.piece.id)} Out of Play`} value={t.outOfPlay} onChange={(e) => { setOverlay(setKey(overlay, "outOfPlay", t.piece.id, Number(e.target.value), setup.values.outOfPlay[t.piece.id] ?? 0)); }} /></td>
                <td><input type="number" min={1} className="count" aria-label={`${words(t.piece.id)} total`} value={t.total} onChange={(e) => { setOverlay(setKey(overlay, "pieces", t.piece.id, Number(e.target.value), t.piece.count)); }} /></td>
                <td><Issues list={at(`piece:${t.piece.id}`)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel" aria-label="Start position">
        <table>
          <thead>
            <tr>
              <th>Space</th>
              <th>Level</th>
              {columns.map(({ p, face }) => <th key={`${p.id}${face}`}>{words(p.id)}{face === "" ? "" : ` (${words(face)})`}</th>)}
              <th />
            </tr>
          </thead>
          <tbody>
            {setup.spaces.map((s) => {
              const entry = entryOf(s.id);
              const rowIssues = at(`space:${s.id}`);
              return (
                <tr key={s.id} className={rowIssues.some((i) => i.level === "error") ? "bad" : ""}>
                  <td>{s.name}</td>
                  <td>
                    {s.hasSupportScale
                      ? (
                        <select aria-label={`${s.name} level`} value={String(entry.level ?? 0)} onChange={(e) => { setSpace(s.id, withLevel(entry, Number(e.target.value))); }}>
                          {range.map((n) => <option key={n} value={n}>{n > 0 ? `+${String(n)}` : String(n)}</option>)}
                        </select>
                      )
                      : (entry.level === undefined ? "—" : String(entry.level))}
                  </td>
                  {columns.map(({ p, face }) => (
                    <td key={`${p.id}${face}`}>
                      <input type="number" min={0} className="count" aria-label={`${s.name} ${words(p.id)}${face === "" ? "" : ` ${words(face)}`}`} value={faceCount(entry, p, face)}
                        onChange={(e) => { setSpace(s.id, withFace(entry, p, face, Math.max(0, Number(e.target.value)))); }} />
                    </td>
                  ))}
                  <td><Issues list={rowIssues} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="panel" aria-label="Changes">
        <strong>Changes against the package setup ({check?.changes.length ?? 0})</strong>
        <ul>{(check?.changes ?? []).map((c, i) => <li key={i}>{changeText(c, setup)}</li>)}</ul>
      </section>
    </div>
  );
}
