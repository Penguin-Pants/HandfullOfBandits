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

it.fails("sends a failed botStep call with the feedback request", async () => {
  const { api } = await import("./api.ts");
  fetchMock.mockResolvedValueOnce(reply(409, { error: "The session moved on.", detail: null }));
  await expect(api.botStep("S1", "A1", "h1")).rejects.toThrow("The session moved on.");
  expect(await sentErrors(api)).toEqual([{ kind: "request", method: "POST", path: "/api/sessions/S1/bot-step", status: 409, message: "The session moved on." }]);
});
