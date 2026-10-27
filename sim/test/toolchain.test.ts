import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { appName } from "../src/main.ts";

describe("toolchain", () => {
  it("imports application source", () => {
    expect(appName).toBe("handful-of-bandits-sim");
  });

  // P0-01 risk check: the native SQLite module loads on this platform.
  it("opens an in-memory SQLite database", () => {
    const db = new Database(":memory:");
    const row = db.prepare("select 1 + 1 as two").get() as { two: number };
    db.close();
    expect(row.two).toBe(2);
  });
});
