// Package check screen (08 s2): the validation report for one package folder.
import type { PackageSummary } from "../api.ts";

export function PackageCheck({ pkg, onBack }: { readonly pkg: PackageSummary; readonly onBack: () => void }) {
  return (
    <div className="screen">
      <div className="row">
        <button type="button" onClick={onBack}>
          Back
        </button>
        <strong>
          {pkg.packageId} {pkg.version}
        </strong>
        <span className="muted">{pkg.dir}</span>
        <span className="muted">hash {pkg.hash?.slice(0, 12) ?? "none"}</span>
      </div>
      <table aria-label="Validation report">
        <thead>
          <tr>
            <th>Level</th>
            <th>Code</th>
            <th>File and path</th>
            <th>ID</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {pkg.issues.map((i, n) => (
            <tr key={n} className={i.level === "error" ? "bad" : ""}>
              <td>{i.level}</td>
              <td>{i.code}</td>
              <td>
                {i.file} {i.path}
              </td>
              <td>{i.id}</td>
              <td>
                {i.message}
                {i.scenario === undefined ? "" : ` (blocks scenario ${i.scenario})`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pkg.issues.length === 0 && <p>No issues.</p>}
    </div>
  );
}
