// HTTP API (11 P2-11; 03 s4, s7). Bound to 127.0.0.1 only (03 s9 item 1). Every route returns
// JSON; a ServiceError maps to its status with `{error, detail}`.
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import Fastify, { type FastifyInstance } from "fastify";
import type { UiFocus } from "../annotate/types.ts";
import type { AnyCommand } from "../engine/core/types.ts";
import type { Anchor } from "../store/repos/annotations.ts";
import { ServiceError, type SessionService } from "./service.ts";

interface Id {
  readonly id: string;
}

const ANCHORS: readonly Anchor[] = ["executed", "proposed", "decision", "state", "session", "debrief"];
const NO_FOCUS: UiFocus = { panel: "board", selectedSpace: null, selectedPieces: [], hoveredActionId: null };

function body<T>(value: unknown): Partial<T> {
  return typeof value === "object" && value !== null ? (value) : {};
}

function command(value: unknown): AnyCommand {
  if (typeof value !== "object" || value === null || typeof (value as { type?: unknown }).type !== "string") throw new ServiceError(400, "command must be an object with a type.");
  return value as AnyCommand;
}

const TYPES: Readonly<Record<string, string>> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };

/** Serve the built UI (`npm run build`) from `uiDir`; unknown paths get index.html. */
function serveUi(app: FastifyInstance, uiDir: string): void {
  app.get("/*", (request, reply) => {
    const path = normalize(join(uiDir, decodeURIComponent(request.url.split("?")[0] ?? "/")));
    const file = path.startsWith(uiDir) && existsSync(path) && statSync(path).isFile() ? path : join(uiDir, "index.html");
    if (!existsSync(file)) return reply.status(404).send({ error: "UI not built. Run npm run build.", detail: null });
    return reply.type(TYPES[extname(file)] ?? "application/octet-stream").send(readFileSync(file));
  });
}

export function buildApp(service: SessionService, uiDir: string | null = null): FastifyInstance {
  const app = Fastify({ logger: false });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ServiceError) return reply.status(error.status).send({ error: error.message, detail: error.detail });
    return reply.status(500).send({ error: error instanceof Error ? error.message : String(error), detail: null });
  });

  app.get("/api/packages", () => service.listPackages());
  app.post("/api/packages/validate", (request) => {
    const { dir } = body<{ dir: string }>(request.body);
    if (typeof dir !== "string") throw new ServiceError(400, "dir is required.");
    return service.validate(dir);
  });

  app.get("/api/sessions", () => service.listSessions());
  app.post("/api/sessions", (request, reply) => {
    const b = body<{ dir: string; scenarioId: string; seed: number; name: string; options: Record<string, string | number> }>(request.body);
    if (typeof b.dir !== "string" || typeof b.scenarioId !== "string" || typeof b.seed !== "number") throw new ServiceError(400, "dir, scenarioId and seed are required.");
    const created = service.createSession({ dir: b.dir, scenarioId: b.scenarioId, seed: b.seed, name: typeof b.name === "string" && b.name !== "" ? b.name : b.scenarioId, ...(b.options === undefined ? {} : { options: b.options }) });
    return reply.status(201).send(created);
  });
  app.get<{ Params: Id }>("/api/sessions/:id", (request) => {
    const { session, head } = service.session(request.params.id);
    return { session, head };
  });
  app.post<{ Params: Id }>("/api/sessions/:id/validate", (request) => service.validateCommand(request.params.id, command(body<{ command: unknown }>(request.body).command)));
  app.post<{ Params: Id }>("/api/sessions/:id/commands", (request) => {
    const b = body<{ command: unknown; headActionId: string }>(request.body);
    if (typeof b.headActionId !== "string") throw new ServiceError(400, "headActionId is required.");
    return service.submit(request.params.id, command(b.command), b.headActionId);
  });
  app.get<{ Params: Id }>("/api/sessions/:id/legal", (request) => service.legalChoices(request.params.id));
  app.get<{ Params: Id }>("/api/sessions/:id/history", (request) => service.history(request.params.id));
  app.get<{ Params: { hash: string } }>("/api/states/:hash", (request) => service.state(request.params.hash));
  app.get<{ Params: { id: string; hash: string } }>("/api/sessions/:id/states/:hash/view", (request) => service.stateView(request.params.id, request.params.hash));
  app.get("/api/categories", () => service.categories());
  app.get<{ Params: Id }>("/api/sessions/:id/annotations", (request) => service.annotations(request.params.id));
  app.post<{ Params: Id }>("/api/sessions/:id/annotations", (request, reply) => {
    const b = body<{ anchor: Anchor; actionId: string | null; text: string; categoryIds: string[]; focus: UiFocus; proposed: unknown }>(request.body);
    if (b.anchor === undefined || !ANCHORS.includes(b.anchor) || typeof b.text !== "string") throw new ServiceError(400, `anchor (${ANCHORS.join(", ")}) and text are required.`);
    const id = service.annotate(request.params.id, {
      anchor: b.anchor, actionId: b.actionId ?? null, text: b.text, categoryIds: b.categoryIds ?? [], focus: b.focus ?? NO_FOCUS,
      ...(b.proposed === undefined ? {} : { proposed: command(b.proposed) }),
    });
    return reply.status(201).send({ annotationId: id });
  });
  if (uiDir !== null) serveUi(app, uiDir);
  return app;
}
