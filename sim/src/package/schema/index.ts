// Package file schemas (04 s3 to s4) and their JSON Schema form for editor hints (DEC-05).
import { z } from "zod";
import { factionsSchema } from "./factions.ts";
import { manifestSchema } from "./manifest.ts";
import { mapSchema } from "./map.ts";
import { markersSchema } from "./markers.ts";
import { parametersSchema } from "./parameters.ts";
import { piecesSchema } from "./pieces.ts";
import { scenarioSchema } from "./scenario.ts";
import { tracksSchema } from "./tracks.ts";

/** One schema per package file. `scenario` applies to each file in `scenarios/`. */
export const packageFileSchemas = {
  manifest: manifestSchema,
  parameters: parametersSchema,
  factions: factionsSchema,
  pieces: piecesSchema,
  map: mapSchema,
  tracks: tracksSchema,
  markers: markersSchema,
  scenario: scenarioSchema,
} as const;

export type PackageFile = keyof typeof packageFileSchemas;
export type PackageFileData<F extends PackageFile> = z.output<(typeof packageFileSchemas)[F]>;

export interface SchemaIssue {
  /** Dot path inside the file, for example `spaces.3.pop`. Empty for the file root. */
  readonly path: string;
  readonly message: string;
}

export type ParseResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly issues: readonly SchemaIssue[] };

/** V-SCHEMA: check parsed YAML data against the schema of its file. */
export function parsePackageFile<F extends PackageFile>(file: F, data: unknown): ParseResult<PackageFileData<F>> {
  const result = packageFileSchemas[file].safeParse(data);
  if (result.success) return { ok: true, value: result.data as PackageFileData<F> };
  return {
    ok: false,
    issues: result.error.issues.map((issue) => ({ path: issue.path.map(String).join("."), message: issue.message })),
  };
}

/** JSON Schema text per file name, for `game-packages/_schema/`. */
export function jsonSchemaFiles(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(packageFileSchemas).map(([file, schema]) => [
      `${file}.schema.json`,
      `${JSON.stringify(z.toJSONSchema(schema, { io: "input" }), null, 2)}\n`,
    ]),
  );
}
