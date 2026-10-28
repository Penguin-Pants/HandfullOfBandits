// package_versions (06 s3.1, 04 s10.3): package content saved once under its hash.
import { now, pack, unpack } from "../common.ts";
import type { Db } from "../migrate.ts";

export interface PackageVersionInput {
  readonly packageHash: string;
  readonly packageId: string;
  readonly version: string;
  readonly rulesetVersion: string;
  readonly schemaVersion: number;
  readonly parentVersion: string | null;
  readonly changeDescription: string | null;
  /** Canonical JSON of the normalized package content, the text the hash covers. */
  readonly content: string;
  readonly appVersion: string;
}

/** Insert unless the hash is already stored. The first row and its app version stay. */
export function savePackageVersion(db: Db, p: PackageVersionInput): void {
  db.prepare(
    `INSERT OR IGNORE INTO package_versions (package_hash, package_id, version, ruleset_version, schema_version,
       parent_version, change_description, content, app_version, stored_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(p.packageHash, p.packageId, p.version, p.rulesetVersion, p.schemaVersion, p.parentVersion, p.changeDescription, pack(p.content), p.appVersion, now());
}

/** Canonical JSON content of a stored package, or null. */
export function loadPackageContent(db: Db, packageHash: string): string | null {
  const row = db.prepare("SELECT content FROM package_versions WHERE package_hash = ?").get(packageHash) as { content: Buffer } | undefined;
  return row === undefined ? null : unpack(row.content);
}
