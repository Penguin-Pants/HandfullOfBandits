// Canonical serialization and state hash (05 s8 item 6).
// Rules: object keys sorted by UTF-16 code unit, arrays in order, strings as JSON,
// only safe integers, booleans and null. Anything else throws with its path,
// so a value that cannot hash the same way twice never reaches the store.
import { createHash } from "node:crypto";

function isPlainObject(value: object): boolean {
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function write(value: unknown, path: string): string {
  if (value === null) return "null";
  switch (typeof value) {
    case "boolean":
      return value ? "true" : "false";
    case "string":
      return JSON.stringify(value);
    case "number":
      if (!Number.isSafeInteger(value)) {
        throw new TypeError(`Canonical JSON allows only safe integers, got ${String(value)} at ${path}`);
      }
      return String(value); // String(-0) is "0"
    case "object":
      if (Array.isArray(value)) {
        const parts: string[] = [];
        for (let i = 0; i < value.length; i++) {
          const itemPath = `${path}[${String(i)}]`;
          if (!(i in value)) throw new TypeError(`Canonical JSON has no holes, got one at ${itemPath}`);
          parts.push(write(value[i], itemPath));
        }
        return `[${parts.join(",")}]`;
      }
      if (isPlainObject(value)) {
        const record = value as Record<string, unknown>;
        const parts = Object.keys(record)
          .sort()
          .map((key) => `${JSON.stringify(key)}:${write(record[key], `${path}.${key}`)}`);
        return `{${parts.join(",")}}`;
      }
      throw new TypeError(`Canonical JSON allows only plain objects and arrays at ${path}`);
    default:
      throw new TypeError(`Canonical JSON does not allow ${typeof value} at ${path}`);
  }
}

/** Canonical JSON text of a value. */
export function canonicalJson(value: unknown): string {
  return write(value, "$");
}

/** Lowercase hex SHA-256 of the canonical JSON text in UTF-8. */
export function canonicalHash(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value), "utf8").digest("hex");
}
