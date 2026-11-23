// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { NoteInput } from "./api.ts";

// Feedback prompt Phase 2: the client error buffer. A fresh module per test gives an empty buffer.
const note: NoteInput = { anchor: "state", actionId: null, text: "x", categoryIds: [], focus: { panel: "board", selectedSpace: null, selectedPieces: [], hoveredActionId: null } };
const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.resetModules();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { vi.unstubAllGlobals(); });

const reply = (status: number, body: unknown): Response => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
/** The diagnostics the feedback call sent. */
async function sentErrors(api: typeof import("./api.ts").api): Promise<unknown[]> {
  fetchMock.mockResolvedValueOnce(reply(201, { annotationId: "N1", prompt: "p" }));
  await api.feedback("S1", note);
  const init = fetchMock.mock.calls.at(-1)?.[1];
  return (JSON.parse(init?.body as string) as { diagnostics: { errors: unknown[] } }).diagnostics.errors;
}

it("sends a failed botStep call with the feedback request", async () => {
  const { api } = await import("./api.ts");
  fetchMock.mockResolvedValueOnce(reply(409, { error: "The session moved on.", detail: null }));
  await expect(api.botStep("S1", "A1", "h1")).rejects.toThrow("The session moved on.");
  expect(await sentErrors(api)).toEqual([{ kind: "request", method: "POST", path: "/api/sessions/S1/bot-step", status: 409, message: "The session moved on." }]);
});

it("keeps the last 10 errors and drops the oldest", async () => {
  const { api } = await import("./api.ts");
  for (let i = 0; i < 11; i++) {
    fetchMock.mockResolvedValueOnce(reply(500, { error: `boom ${String(i)}`, detail: null }));
    await expect(api.legal("S1")).rejects.toThrow();
  }
  const sent = await sentErrors(api);
  expect(sent).toHaveLength(10);
  expect(sent[0]).toMatchObject({ message: "boom 1" });
  expect(sent[9]).toMatchObject({ message: "boom 10" });
});

it("records uncaught errors and unhandled rejections with the message only", async () => {
  const mod = await import("./api.ts");
  const stop = mod.captureWindowErrors(window);
  window.dispatchEvent(new ErrorEvent("error", { message: "x is undefined", filename: "C:/Users/me/app.js" }));
  window.dispatchEvent(Object.assign(new Event("unhandledrejection"), { reason: new Error("lost promise") }));
  stop();
  expect(await sentErrors(mod.api)).toEqual([{ kind: "error", message: "x is undefined" }, { kind: "rejection", message: "lost promise" }]);
});

it.fails("records a network failure and a non-JSON error response (review F1)", async () => {
  const { api } = await import("./api.ts");
  fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
  await expect(api.legal("S1")).rejects.toThrow("Failed to fetch");
  fetchMock.mockResolvedValueOnce(new Response("<html>proxy</html>", { status: 502, statusText: "Bad Gateway" }));
  await expect(api.legal("S1")).rejects.toThrow();
  expect(await sentErrors(api)).toEqual([
    { kind: "request", method: "GET", path: "/api/sessions/S1/legal", status: 0, message: "Failed to fetch" },
    { kind: "request", method: "GET", path: "/api/sessions/S1/legal", status: 502, message: "Bad Gateway" },
  ]);
});
