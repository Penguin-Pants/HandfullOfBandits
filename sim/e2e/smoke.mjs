/* global process, console, fetch, setTimeout, document, innerHeight, innerWidth, Image, DOMPoint, getComputedStyle */
// IC-2 item 1: Playwright smoke (11 IC-2). Home, start the first unblocked scenario, one action, one note, undo, JSON export.
// Needs a built UI (`npm run build`) and Playwright with Chromium (not a project dependency).
// Run: make e2e
import { createEngine } from "../src/engine/index.ts";
import { menu } from "./menu.mjs";
import { coinHandlers } from "../src/engine/coin/handlers.ts";
import { loadPackage, readPackageDir } from "../src/package/load.ts";
import { scriptedPolicy } from "../src/cli/play.ts";
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
  browser = await chromium.launch({ executablePath: process.env.HOB_CHROMIUM });
  const page = await browser.newPage({ viewport: { width: 1908, height: 904 } });
  page.on("dialog", (d) => void d.accept());
  await page.goto(base);
  const start = page.getByRole("button", { name: "Start" });
  await start.waitFor();
  for (let i = 0; i < 50 && !(await start.isEnabled()); i++) await page.waitForTimeout(100);
  check(await start.isEnabled(), "Home: Start is enabled for the first unblocked scenario");
  // Hotseat: both sides human (the bot seat has its own check below).
  await page.getByLabel("Opponent", {exact: true}).selectOption("");
  await start.click();
  await page.locator('[aria-label^="Current card "]').first().waitFor();
  check(true, "Play: first card revealed without a click");
  check(await page.getByLabel('Status', {exact: true}).evaluate(el => el.closest('[role="menubar"]') !== null), "game status is in the menu bar");
  check(await page.getByLabel('Scores', {exact: true}).count() === 0, "repeated score summaries are removed");
  await page.locator('.score-details summary').click();
  const victoryFits = await page.locator('.status-victory-scroll').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.left >= 0 && r.right <= innerWidth && document.documentElement.scrollWidth <= innerWidth;
  });
  check(victoryFits, "expanded victory track opens on screen without page scroll");
  await page.locator('.score-details summary').click();
  const artwork = await page.evaluate(async () => {
    const hrefs = [...document.querySelectorAll('[data-artwork="printed-board"] image')].map((el) => el.getAttribute("href") ?? "");
    const loaded = await Promise.all(hrefs.map(async (href) => {
      const image = new Image();
      image.src = href;
      await image.decode();
      return image.naturalWidth > 0;
    }));
    return { count: hrefs.length, loaded: loaded.every(Boolean) };
  });
  check(artwork.count === 4 && artwork.loaded, "printed board artwork (4 images) loads independently of game regions", artwork);
  const atlas = await page.evaluate(async () => {
    const svg = document.querySelector('[aria-label="Board"]');
    const outside = [];
    for (const info of svg.querySelectorAll('[data-info]:not([data-callout])')) {
      const area = svg.querySelector(`[data-space="${info.dataset.info}"] .atlas-area`);
      for (const el of info.querySelectorAll('text, rect, circle, polygon')) {
        const b = el.getBBox();
        const matrix = area.getCTM().inverse().multiply(el.getCTM());
        for (const [x,y] of [[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]]) {
          if (!area.isPointInFill(new DOMPoint(x,y).matrixTransform(matrix))) outside.push(`${info.dataset.info}: ${el.textContent}`);
        }
      }
    }
    for (const info of svg.querySelectorAll('[data-info]')) {
      const pop = info.querySelector('.atlas-population rect')?.getBBox();
      if (pop === undefined) continue;
      for (const name of info.querySelectorAll('.map-label')) {
        const b = name.getBBox();
        if (b.x < pop.x + pop.width && b.x + b.width > pop.x && b.y < pop.y + pop.height && b.y + b.height > pop.y) outside.push(`name overlaps population: ${info.dataset.info}`);
      }
    }
    for (const counter of svg.querySelectorAll('.atlas-counter')) {
      const r = counter.querySelector('rect').getBBox();
      for (const text of counter.querySelectorAll('text')) {
        const b = text.getBBox();
        if (b.x < r.x || b.x + b.width > r.x + r.width) outside.push(`counter text: ${text.textContent}`);
      }
    }
    const art = {"diyarbakir-city": ["diyarbakir-rural", "/diyarbakir-city.png"], "van-city": ["van-rural", "/van-city.webp"], "batman-city": ["batman-rural", "/batman-city.webp"]};
    let citySeparated = true;
    let city = true;
    for (const [id, [hinterland, href]] of Object.entries(art)) {
      const circle = svg.querySelector(`#clip-city-${id} circle`);
      const cityPoint = new DOMPoint(Number(circle.getAttribute("cx")), Number(circle.getAttribute("cy")));
      citySeparated = citySeparated && svg.querySelector(`[data-space="${id}"] .atlas-area`).isPointInFill(cityPoint) && !svg.querySelector(`[data-space="${hinterland}"] .atlas-area`).isPointInFill(cityPoint);
      const image = new Image(); image.src = href; await image.decode();
      city = city && image.naturalWidth > 0;
    }
    return {outside, citySeparated, city, countries: svg.querySelectorAll('[data-geography="country-borders"]').length, countryLength: svg.querySelector('[data-geography="country-borders"]').getTotalLength(), rivers: svg.querySelectorAll('.map-river').length};
  });
  check(atlas.outside.length === 0, `atlas labels, population, counters and stacks remain inside their areas: ${atlas.outside.join(', ')}`);
  check(atlas.city && atlas.citySeparated && atlas.countries === 1 && atlas.countryLength > 500 && atlas.rivers === 0, 'city art loads, country borders are separate and rivers are absent');
  const readable = await page.evaluate(() => {
    // Large spaces keep the full reviewed sizes. The smallest spaces draw their block at a reduced scale (DD-22), so they get a lower floor.
    const pixels = el => parseFloat(getComputedStyle(el).fontSize) * Math.abs(el.getScreenCTM().d);
    const sizes = (ids, name, counter, count) => ids.every(id => {
      const info = document.querySelector(`[data-info="${id}"]`);
      return pixels(info.querySelector('.map-label')) >= name && pixels(info.querySelector('.atlas-counter text')) >= counter && [...info.querySelectorAll('.map-count')].every(t => pixels(t) >= count);
    });
    return sizes(['hakkari','mardin','sanliurfa'], 18, 11.5, 14) && sizes(['sirnak','batman-city'], 11, 7, 8);
  });
  check(readable, 'reviewed name, counter and piece-count sizes at 1908 x 904 (reduced floor for the smallest spaces)');
  const legitimacy = page.locator('[aria-label="Resources and politics"] [aria-label="Legitimacy"]');
  await legitimacy.locator('summary').focus();
  await page.keyboard.press('Space');
  check(await legitimacy.evaluate(el => el.open), 'compact tracks expand with the keyboard');
  await page.keyboard.press('Space');
  await page.getByLabel('Find space').selectOption('europe');
  const europe = page.getByRole('meter', {name:'Europe track',exact:true});
  check(await europe.getAttribute('aria-valuemin') === '0' && await europe.getAttribute('aria-valuemax') === '5' && await page.getByRole('button', {name:'Europe',exact:true}).count() === 0, 'Europe is a read-only 0 to 5 track');
  const europeSteps = await europe.locator('[data-track-value]').allTextContents();
  check(europeSteps.join(',') === '5,4,3,2,1,0', 'Europe shows all six values in descending order');
  await page.getByRole('button', {name:'Fit map',exact:true}).click();
  await page.getByRole('button', {name:'Western Cities',exact:true}).click();
  await page.getByRole('button', {name:'Hakkari',exact:true}).click({modifiers:['Shift']});
  check(await page.getByRole('button', {name:'Western Cities',exact:true}).getAttribute('aria-pressed') === 'true' && await page.getByRole('button', {name:'Hakkari',exact:true}).getAttribute('aria-pressed') === 'true', 'Western Cities remains selectable with Shift');
  await page.getByRole('button', {name:'Clear (Esc)',exact:true}).click();
  await page.emulateMedia({ colorScheme: "dark" });
  const contrast = await page.evaluate(() => {
    const luminance = color => {
      const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
      return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    };
    return [...document.querySelectorAll(".level-marker")].every(text => {
      const ink = luminance(getComputedStyle(text).fill);
      const paper = luminance("rgb(245, 238, 220)");
      return (Math.max(ink, paper) + .05) / (Math.min(ink, paper) + .05) >= 4.5;
    });
  });
  check(contrast, "Support and Opposition labels retain readable contrast in dark theme");
  await page.emulateMedia({ colorScheme: "light" });
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
      forcesAboveMap: box("Forces").bottom <= box("Board").top,
      order: ["Faction panel", "Event panel"].map((l) => order.indexOf(l)),
    };
  });
  check(layout.fits, "one view: no page scroll at 1920 x 950");
  check(layout.panelVisible, "one view: Faction panel fully visible");
  check(layout.forcesAboveMap, "forces in the strip above the map");
  // UC-4: the map is large enough to read at the designer's 1907 x 863 screen.
  await page.setViewportSize({ width: 1907, height: 863 });
  await page.reload();
  await page.getByRole("button", {name:"Resume", exact:true}).first().click();
  await page.getByRole("heading", {name:/(First|Second) Eligible$/}).first().waitFor();
  await page.waitForTimeout(300);
  const mapHeight = await page.evaluate(() => document.querySelector('[aria-label="Board"]').getBoundingClientRect().height);
  const mapText = await page.locator('.atlas-label:not(.city-name)').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize) * el.ownerSVGElement.getScreenCTM().a);
  check(mapHeight >= 300 && mapText >= 18, `readable map at 1907 x 863 (${String(Math.round(mapHeight))} px high, ${mapText.toFixed(1)} px names)`);
  // The approved resource strip stays above the map.
  const card = await page.evaluate(() => document.querySelector('.status-strip > [aria-label="Resources and politics"]') !== null);
  check(card, "Resources and politics strip is above the map");
  await page.keyboard.press("m");
  await page.keyboard.press("n");
  await page.getByLabel("Note text").waitFor();
  const mapOnly = await page.evaluate(() => {
    const r = (l) => document.querySelector(`[aria-label="${l}"]`).getBoundingClientRect();
    const box = document.querySelector('[aria-label="Note text"]').getBoundingClientRect();
    return r("Board").top >= 0 && box.top >= r("Note bar").top && box.bottom <= r("Note bar").bottom && r("Note bar").bottom <= innerHeight;
  });
  check(mapOnly, "map only: map and open note both fully visible");
  await page.keyboard.press("Escape");
  await page.keyboard.press("m");
  await page.setViewportSize({ width: 800, height: 900 });
  await page.waitForTimeout(300);
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "narrow screen: no sideways scroll at 800 px");
  check(layout.order.every((n, i, a) => n >= 0 && (i === 0 || n > a[i - 1])), "right column order: faction choices, then the card");
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.waitForTimeout(300);
  // UC-7 review: at 1366 x 768 the card covers no space name on the map.
  const clear = await page.evaluate(() => {
    const c = document.querySelector('[aria-label="Resources and politics"]').getBoundingClientRect();
    const m = document.querySelector('[aria-label="Board"]').getBoundingClientRect();
    return [...document.querySelectorAll("text.map-label")].every((t) => { const r = t.getBoundingClientRect(); const clipped = {left:Math.max(r.left,m.left),right:Math.min(r.right,m.right),top:Math.max(r.top,m.top),bottom:Math.min(r.bottom,m.bottom)}; return clipped.right <= clipped.left || clipped.bottom <= clipped.top || clipped.right <= c.left || clipped.left >= c.right || clipped.bottom <= c.top || clipped.top >= c.bottom; });
  });
  check(clear, "Resources and politics card covers no space name at 1366 x 768");
  // UC-9: Note is in the Game menu, so no fixed button covers the right column.
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.waitForTimeout(300);
  check(await page.locator(".note-closed button").count() === 0, "no fixed Note button over the right column at 1600 x 900");
  await page.getByRole("button", {name:"Fit map"}).click();
  // UC-5: a March is planned by a mouse drag on the map, never by typed text.
  await page.getByRole("button", { name: "Limited Op" }).click();
  await page.getByRole("button", { name: "March", exact: true }).click();
  const centre = async (name) => {
    const b = await page.locator("text.map-label", { hasText: name }).first().boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  const [from, to] = [await centre("Hakkari"), await centre("Şırnak")];
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
  await page.getByLabel("Move Hakkari to Şırnak", { exact: true }).waitFor();
  await page.getByLabel("Preview").waitFor();
  check((await page.locator("[aria-label='Planned moves'] line").count()) === 1, "March planned by a drag: move row, arrow and legal preview");
  check((await page.locator("aside input, aside select, aside textarea").count()) === 0, "no text, number or list fields in the right column");
  await page.getByRole("button", { name: "Clear (Esc)" }).click();
  await page.getByRole("button", { name: "Pass" }).last().click();
  await page.getByLabel("Status", { exact: true }).getByText(/^1st: PKK \(Pass\)/).waitFor();
  check(true, "one action committed (PKK Pass)");
  await page.locator("svg").first().click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("n");
  await page.getByLabel("Note text").fill("Smoke note on the pass #balance");
  await page.keyboard.press("Enter");
  await page.getByRole("status").filter({ hasText: /Saved, linked to/ }).waitFor();
  check(true, "note saved and linked to the action");
  await menu(page, "Game", "Undo");
  await page.getByLabel("Status", { exact: true }).getByText(/^1st: PKK · /).waitFor();
  check(true, "undo restored the board");
  const sessions = await (await fetch(`${base}/api/sessions`)).json();
  const exported = await (await fetch(`${base}/api/sessions/${sessions[0].session_id}/export`)).json();
  check(exported.exportMeta.schema === "coin-sim-export/1" && exported.annotations.length === 1 && exported.actions.some((a) => a.status === "undone"), "JSON export holds the note and the undone action");
  // Phase 3a automated flow. IC-3a still requires the designer's own UI playthrough.
  await menu(page, "Game", "Home");
  await page.getByLabel("Scenario", {exact: true}).selectOption("full-campaign");
  await page.getByLabel("Seed", {exact: true}).fill("7");
  await page.getByLabel("Opponent", {exact: true}).selectOption("");
  check(await page.getByRole("button", {name: "Start",exact: true}).isEnabled(), "Home: the full campaign starts without exclusions");
  // P4-12: the Home row links to every export format; each link downloads a file.
  const row = page.getByRole("row").filter({hasText: sessions[0].name});
  const links = await Promise.all(["JSON", "Markdown", "Notes", "Actions", "Metrics"].map((name) => row.getByRole("link", {name, exact: true}).getAttribute("href")));
  const bodies = await Promise.all(links.map(async (href) => (await fetch(`${base}${href}`)).text()));
  check(links.every((h) => h !== null) && bodies[1].includes("# Playtest export") && bodies[2].startsWith("annotation_id") && bodies[3].startsWith("action_id") && bodies[4].length > 0, "Home row links download JSON, Markdown and the three CSV files");
  const creation = page.waitForResponse(r => r.url().endsWith("/api/sessions") && r.request().method() === "POST");
  await page.getByRole("button", {name: "Start",exact: true}).click();
  const created = await (await creation).json();
  const packages = await (await fetch(`${base}/api/packages`)).json();
  const pkg = packages.find(p => p.packageId === "kurdish-coin");
  const loaded = loadPackage(readPackageDir(pkg.dir));
  check(loaded.ok, "Package loads for automated play");
  const engine = createEngine(coinHandlers);
  // The UI reveals the first card by itself: wait for it, then script from the current head.
  await page.locator('[aria-label^="Current card "]').first().waitFor();
  let head = (await (await fetch(`${base}/api/sessions/${created.sessionId}`)).json()).head;
  let steps = 0;
  while (head.state.ended === null) {
    if (steps++ >= 2000) throw new Error("The full campaign exceeded 2000 commands");
    const command = scriptedPolicy(engine,loaded.ruleset,head.state);
    const response = await fetch(`${base}/api/sessions/${created.sessionId}/commands`, {method: "POST",headers: {"content-type": "application/json"},body: JSON.stringify({command,headActionId: head.actionId,headStateHash: head.stateHash})});
    if (!response.ok) throw new Error(await response.text());
    head = (await response.json()).head;
  }
  check(head.state.turn.propagandaRound === 5, "The full campaign completes five rounds through the session API");
  await page.reload();
  await page.getByRole("row").filter({hasText: "full-campaign-seed7"}).getByRole("button", {name: "Resume",exact: true}).click();
  await page.getByLabel("Status", { exact: true }).getByText(/^Game over:/).waitFor();
  check(true, "Full campaign result renders in the UI");
  await page.keyboard.press("n");
  await page.getByLabel("Note text").fill("Automated full campaign smoke note; designer IC-3a remains pending.");
  await page.keyboard.press("Enter");
  await page.getByRole("status").filter({hasText: /Saved/}).waitFor();
  const aExport = await (await fetch(`${base}/api/sessions/${created.sessionId}/export`)).json();
  check(aExport.sessions[0].scenario_id === "full-campaign" && aExport.annotations.length === 1 && aExport.metrics.filter(m => m.propaganda_round !== undefined).length === 5, "Full campaign export contains the session, five round metrics and UI note");
  // Audit Plan 2 S1: a State bot seat. The human PKK passes on card 1; the bot then acts by itself and says why.
  await menu(page, "Game", "Home");
  await page.getByLabel("Seed", {exact: true}).fill("8");
  await page.getByLabel("Name", {exact: true}).fill("bot-seat");
  const opponent = page.getByLabel("Opponent", {exact: true});
  check((await opponent.inputValue()).startsWith("S-"), "Home: a State bot is the default opponent");
  const botCreation = page.waitForResponse(r => r.url().endsWith("/api/sessions") && r.request().method() === "POST");
  await page.getByRole("button", {name: "Start",exact: true}).click();
  const botSession = await (await botCreation).json();
  await page.locator('[aria-label^="Current card "]').first().waitFor();
  const now = await (await fetch(`${base}/api/sessions/${botSession.sessionId}`)).json();
  const pass = await fetch(`${base}/api/sessions/${botSession.sessionId}/commands`, {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({command: {type: "Pass", faction: "pkk"}, headActionId: now.head.actionId, headStateHash: now.head.stateHash})});
  check(pass.ok, "the human PKK passes on card 1");
  await page.reload();
  await page.getByRole("row").filter({hasText: "bot-seat"}).getByRole("button", {name: "Resume",exact: true}).click();
  await page.getByLabel("Last action").getByText(/^Last action: State /).waitFor({timeout: 60_000});
  await page.getByLabel("Last action").locator("summary").first().click();
  await page.getByText("Why?", {exact: true}).click();
  check(await page.getByText(/^Chosen: /).count() === 1, "the State bot acted on its own and the Last action shows why");
} finally {
  await browser?.close();
  // Windows holds the SQLite file open until the server exits; rmSync before that throws EPERM.
  const exited = server.exitCode === null && server.signalCode === null ? new Promise((r) => server.once("exit", r)) : undefined;
  server.kill();
  await exited;
  rmSync(dir, { recursive: true, force: true });
}
