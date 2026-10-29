/* global process, console, fetch, setTimeout, document, innerHeight, innerWidth */
// IC-2 item 1: Playwright smoke (11 IC-2). Home, start S0, one action, one note, undo, JSON export.
// Needs a built UI (`npm run build`) and Playwright with Chromium (not a project dependency).
// Run: make e2e
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const dir = mkdtempSync(join(tmpdir(), "hob-e2e-"));
const port = 5199;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["src/main.ts"], { env: { ...process.env, HOB_DB: join(dir, "e2e.sqlite"), PORT: String(port) }, stdio: "inherit" });

function check(ok, message) {
  if (!ok) throw new Error(`IC-2 smoke failed: ${message}`);
  console.log(`ok ${message}`);
}

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`${base}/api/packages`)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("server did not start");
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  page.on("dialog", (d) => void d.accept());
  await page.goto(base);
  const start = page.getByRole("button", { name: "Start" });
  await start.waitFor();
  for (let i = 0; i < 50 && !(await start.isEnabled()); i++) await page.waitForTimeout(100);
  check(await start.isEnabled(), "Home: Start is enabled for S0");
  await start.click();
  await page.getByRole("button", { name: /Reveal first card/ }).click();
  await page.getByText(/^Card 1$/).waitFor();
  check(true, "Play: first card revealed");
  // UI clarity round R6: one view at 1920 x 1080 (content about 1920 x 950), right column order R3.
  await page.setViewportSize({ width: 1920, height: 950 });
  await page.waitForTimeout(300);
  const layout = await page.evaluate(() => {
    const box = (label) => document.querySelector(`[aria-label="${label}"]`)?.getBoundingClientRect();
    const side = document.querySelector(".side").getBoundingClientRect();
    const order = [...document.querySelector(".side").querySelectorAll("[aria-label]")].map((e) => e.getAttribute("aria-label"));
    return {
      fits: document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth,
      panelVisible: box("Faction panel").bottom <= side.bottom,
      forcesBelowMap: box("State forces").top > box("Board").bottom && Math.abs(box("State forces").top - box("PKK forces").top) < 2,
      order: ["Cards", "Event panel", "Faction panel"].map((l) => order.indexOf(l)),
    };
  });
  check(layout.fits, "one view: no page scroll at 1920 x 950");
  check(layout.panelVisible, "one view: Faction panel fully visible");
  check(layout.forcesBelowMap, "forces side by side below the map");
  check(layout.order.every((n, i, a) => n >= 0 && (i === 0 || n > a[i - 1])), "right column order: cards, card text, Faction panel");
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.getByRole("button", { name: "Pass" }).last().click();
  await page.getByText("1st: PKK (Pass)", { exact: true }).waitFor();
  check(true, "one action committed (PKK Pass)");
  await page.locator("svg").first().click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("n");
  await page.getByLabel("Note text").fill("Smoke note on the pass #balance");
  await page.keyboard.press("Enter");
  await page.getByRole("status").filter({ hasText: /Saved, linked to/ }).waitFor();
  check(true, "note saved and linked to the action");
  await page.getByRole("button", { name: "Undo (Ctrl+Z)" }).click();
  await page.getByText("1st: PKK", { exact: true }).waitFor();
  check(true, "undo restored the board");
  const sessions = await (await fetch(`${base}/api/sessions`)).json();
  const exported = await (await fetch(`${base}/api/sessions/${sessions[0].session_id}/export`)).json();
  check(exported.exportMeta.schema === "coin-sim-export/1" && exported.annotations.length === 1 && exported.actions.some((a) => a.status === "undone"), "JSON export holds the note and the undone action");
} finally {
  await browser?.close();
  server.kill();
  rmSync(dir, { recursive: true, force: true });
}
