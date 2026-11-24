// HTTP API (11 P2-11; 03 s4, s7). Bound to 127.0.0.1 only (03 s9 item 1). Every route returns
// JSON; a ServiceError maps to its status with `{error, detail}`.
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import Fastify, { type FastifyInstance } from "fastify";
import type { UiFocus } from "../annotate/types.ts";
import type { AnyCommand, JsonObject } from "../engine/core/types.ts";
import { getSession } from "../store/repos/sessions.ts";
import { NOTE_STATUSES, type Anchor, type NoteStatus } from "../store/repos/annotations.ts";
import { exportCsv, metricsCsv } from "../export/csv.ts";
import { exportJson, validateExport } from "../export/json.ts";
import { CLIENT_ERROR_KINDS, feedbackPrompt, type ClientError } from "../export/feedback-prompt.ts";
import { exportMarkdown } from "../export/markdown.ts";
import { metricsTable } from "../export/metrics.ts";
import { codeFingerprint, git } from "../package/fingerprint.ts";
import { APP_VERSION, ServiceError, type SessionService } from "./service.ts";

interface Id {
  readonly id: string;
}

const ANCHORS: readonly Anchor[] = ["executed", "proposed", "decision", "state", "session", "debrief"];
const NO_FOCUS: UiFocus = { panel: "board", selectedSpace: null, selectedPieces: [], hoveredActionId: null };

function body<T>(value: unknown): Partial<T> {
  return typeof value === "object" && value !== null ? (value) : {};
}

/** Client errors of a feedback request; entries that are not client errors drop out. */
function clientErrors(value: unknown): ClientError[] {
  const errors = body<{ errors: unknown }>(value).errors;
  return Array.isArray(errors) ? errors.filter((e): e is ClientError => typeof e === "object" && e !== null && (CLIENT_ERROR_KINDS as readonly unknown[]).includes((e as ClientError).kind) && typeof (e as ClientError).message === "string") : [];
}

function command(value: unknown): AnyCommand {
  if (typeof value !== "object" || value === null || typeof (value as { type?: unknown }).type !== "string") throw new ServiceError(400, "command must be an object with a type.");
  return value as AnyCommand;
}

const TYPES: Readonly<Record<string, string>> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" };

/** Serve the built UI (`npm run build`) from `uiDir`; unknown paths get index.html. */
function serveUi(app: FastifyInstance, uiDir: string): void {
  app.get("/*", (request, reply) => {
    const missing = () => reply.status(404).send({ error: "UI file not found.", detail: null });
    if (!existsSync(uiDir)) return reply.status(404).send({ error: "UI not built. Run npm run build.", detail: null });
    const root = realpathSync(uiDir);
    const inside = (file: string): boolean => {
      const path = relative(root, file);
      return path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path);
    };
    // Treat both URL separator forms alike on Windows and Linux.
    const url = decodeURIComponent(request.url.split("?")[0] ?? "/").replaceAll("\\", "/");
    const path = resolve(root, `.${url}`);
    if (!inside(path)) return missing();
    let file = join(root, "index.html");
    if (existsSync(path)) {
      const target = realpathSync(path);
      if (!inside(target)) return missing();
      if (statSync(target).isFile()) file = target;
    }
    if (!existsSync(file)) return missing();
    file = realpathSync(file);
    if (!inside(file)) return missing();
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

  // Setup editor (audit Plan 4 V2): check one overlay, save it as a variant of its package.
  app.post("/api/variants/check", (request) => {
    const b = body<{ dir: string; name: string; overlay: unknown; text: string }>(request.body);
    if (typeof b.dir !== "string") throw new ServiceError(400, "dir is required.");
    if ((b.name !== undefined && typeof b.name !== "string") || (b.text !== undefined && typeof b.text !== "string")) throw new ServiceError(400, "name and text must be strings.");
    return service.checkVariant({ dir: b.dir, ...(b.name === undefined ? {} : { name: b.name }), ...(b.overlay === undefined ? {} : { overlay: b.overlay }), ...(b.text === undefined ? {} : { text: b.text }) });
  });
  app.post("/api/variants", (request, reply) => {
    const b = body<{ dir: string; name: string; overlay: unknown; replace: boolean }>(request.body);
    if (typeof b.dir !== "string" || typeof b.name !== "string" || b.overlay === undefined) throw new ServiceError(400, "dir, name and overlay are required.");
    return reply.status(201).send(service.saveVariant({ dir: b.dir, name: b.name, overlay: b.overlay, replace: b.replace === true }));
  });

  app.get("/api/sessions", () => service.listSessions());
  app.get("/api/seat-players", () => service.seatPlayers());
  app.post("/api/sessions", (request, reply) => {
    const b = body<{ dir: string; scenarioId: string; seed: number; name: string; options: Record<string, string | number>; seats: unknown; variant: unknown }>(request.body);
    if (typeof b.dir !== "string" || typeof b.scenarioId !== "string" || typeof b.seed !== "number") throw new ServiceError(400, "dir, scenarioId and seed are required.");
    if (b.variant !== undefined && typeof b.variant !== "string") throw new ServiceError(400, "variant must be a variant name.");
    if (b.seats !== undefined && (typeof b.seats !== "object" || b.seats === null || Array.isArray(b.seats))) throw new ServiceError(400, "seats must be an object of faction to player ID.");
    const created = service.createSession({
      dir: b.dir, scenarioId: b.scenarioId, seed: b.seed, name: typeof b.name === "string" && b.name !== "" ? b.name : b.scenarioId,
      ...(b.options === undefined ? {} : { options: b.options }), ...(b.seats === undefined ? {} : { seats: b.seats as Record<string, unknown> }),
      ...(typeof b.variant === "string" ? { variant: b.variant } : {}),
    });
    return reply.status(201).send(created);
  });
  app.get<{ Params: Id }>("/api/sessions/:id", (request) => {
    const { session, head } = service.session(request.params.id);
    return { session, head, botToAct: service.botToAct(request.params.id), botExtends: service.botExtends(request.params.id) };
  });
  app.post<{ Params: Id }>("/api/sessions/:id/validate", (request) => service.validateCommand(request.params.id, command(body<{ command: unknown }>(request.body).command)));
  app.post<{ Params: Id }>("/api/sessions/:id/commands", (request) => {
    const b = body<{ command: unknown; headActionId: string; headStateHash?: string }>(request.body);
    if (typeof b.headActionId !== "string") throw new ServiceError(400, "headActionId is required.");
    return service.submit(request.params.id, command(b.command), b.headActionId, b.headStateHash);
  });
  app.post<{ Params: Id }>("/api/sessions/:id/bot-step", (request) => {
    const b = body<{ headActionId: string; headStateHash?: string; partial?: unknown }>(request.body);
    if (typeof b.headActionId !== "string") throw new ServiceError(400, "headActionId is required.");
    const partial = b.partial ?? null;
    if (partial !== null && (typeof partial !== "object" || Array.isArray(partial))) throw new ServiceError(400, "partial must be an object.");
    return service.botStep(request.params.id, b.headActionId, b.headStateHash, partial as JsonObject | null);
  });
  app.get<{ Params: Id; Querystring: { ref?: string } }>("/api/sessions/:id/rules", (request) => {
    const ref = request.query.ref;
    if (typeof ref !== "string" || ref.trim() === "") throw new ServiceError(400, "ref is required.");
    return service.ruleLookup(request.params.id, ref);
  });
  app.get<{ Params: Id }>("/api/sessions/:id/legal", (request) => service.legalChoices(request.params.id));
  app.get<{ Params: Id }>("/api/sessions/:id/history", (request) => service.history(request.params.id));
  app.get<{ Params: { hash: string } }>("/api/states/:hash", (request) => service.state(request.params.hash));
  app.get<{ Params: { id: string; hash: string } }>("/api/sessions/:id/states/:hash/view", (request) => service.stateView(request.params.id, request.params.hash));
  app.post<{ Params: Id }>("/api/sessions/:id/end", (request) => {
    const { debrief } = body<{ debrief: string | null }>(request.body);
    return service.endSession(request.params.id, typeof debrief === "string" ? debrief : null);
  });
  app.post<{ Params: Id }>("/api/sessions/:id/undo", (request) => {
    const { headActionId, headStateHash } = body<{ headActionId: string; headStateHash?: string }>(request.body);
    if (typeof headActionId !== "string") throw new ServiceError(400, "headActionId is required.");
    return service.undo(request.params.id, headActionId, headStateHash);
  });
  app.post<{ Params: Id }>("/api/sessions/:id/branches", (request, reply) => {
    const { actionId, headActionId, headStateHash } = body<{ actionId: string; headActionId: string; headStateHash?: string }>(request.body);
    if (typeof actionId !== "string" || typeof headActionId !== "string") throw new ServiceError(400, "actionId and headActionId are required.");
    return reply.status(201).send(service.branch(request.params.id, actionId, headActionId, headStateHash));
  });
  app.get<{ Querystring: Record<string, string> }>("/api/review", (request) => service.review(request.query));
  app.post("/api/review/status", (request) => {
    const b = body<{ annotationIds: unknown; status: NoteStatus }>(request.body);
    const ids = b.annotationIds;
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((i) => typeof i === "string") || b.status === undefined || !NOTE_STATUSES.includes(b.status)) {
      throw new ServiceError(400, `annotationIds (a non-empty list) and status (${NOTE_STATUSES.join(", ")}) are required.`);
    }
    return { updated: service.setNoteStatus(ids, b.status) };
  });
  // One checked export of one session; JSON, Markdown and CSV downloads share it (07 s8; P4-12).
  const sessionExport = (id: string, withStates: boolean) => {
    service.session(id);
    const data = exportJson(service.db, { sessionIds: [id], withStates, appVersion: APP_VERSION, exportedAt: new Date().toISOString() });
    const broken = validateExport(data);
    if (broken.length > 0) throw new ServiceError(500, "The export has unresolved references (T-EXP).", broken);
    return data;
  };
  app.get<{ Params: Id; Querystring: { states?: string } }>("/api/sessions/:id/export", (request, reply) =>
    reply.header("content-disposition", `attachment; filename="session-${request.params.id}.json"`).send(sessionExport(request.params.id, request.query.states === "1")));
  app.get<{ Params: Id }>("/api/sessions/:id/export.md", (request, reply) =>
    reply.type("text/markdown; charset=utf-8").header("content-disposition", `attachment; filename="session-${request.params.id}.md"`).send(exportMarkdown(sessionExport(request.params.id, false))));
  app.get<{ Params: Id; Querystring: { file?: string } }>("/api/sessions/:id/export.csv", (request, reply) => {
    const file = request.query.file;
    if (file !== "annotations" && file !== "actions" && file !== "metrics") throw new ServiceError(400, "file must be annotations, actions or metrics.");
    const data = sessionExport(request.params.id, false);
    return reply.type("text/csv; charset=utf-8").header("content-disposition", `attachment; filename="session-${request.params.id}-${file}.csv"`).send(exportCsv(data)[file]);
  });
  // Metrics review (P4-03): `sessions` is a comma list of session IDs; none means every session.
  const metricsExport = (sessions: string | undefined) => {
    const ids = sessions === undefined || sessions === "" ? service.listSessions().map((s) => s.session_id) : sessions.split(",");
    const unknown = ids.find((id) => getSession(service.db, id) === null);
    if (unknown !== undefined) throw new ServiceError(404, `Unknown session "${unknown}".`);
    return exportJson(service.db, { sessionIds: ids, withStates: false, appVersion: APP_VERSION, exportedAt: new Date().toISOString() });
  };
  app.get<{ Querystring: { sessions?: string } }>("/api/metrics", (request) => metricsTable(metricsExport(request.query.sessions)));
  app.get<{ Querystring: { sessions?: string } }>("/api/metrics.csv", (request, reply) => reply.type("text/csv; charset=utf-8").header("content-disposition", 'attachment; filename="metrics.csv"').send(metricsCsv(metricsExport(request.query.sessions))));
  // Experiment reports (audit Plan 3 A5): list runs, read one, open a game at a decision as a session.
  app.get("/api/experiments", () => service.experiments());
  app.get<{ Params: Id }>("/api/experiments/:id", (request) => service.experiment(request.params.id));
  app.post<{ Params: { id: string; gameId: string } }>("/api/experiments/:id/games/:gameId/open", (request, reply) => {
    const { decisions } = body<{ decisions: number | null }>(request.body);
    if (decisions !== undefined && decisions !== null && typeof decisions !== "number") throw new ServiceError(400, "decisions must be a number or null.");
    return reply.status(201).send(service.openExperimentGame(request.params.id, request.params.gameId, decisions ?? null));
  });
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
  // Feedback prompt (docs/23-Nov-26-Feedback-Prompt-Implementation-Plan.md, Phase 1): a feedback note and its Claude Code prompt.
  app.post<{ Params: Id }>("/api/sessions/:id/feedback", (request, reply) => {
    const b = body<{ anchor: Anchor; actionId: string | null; text: string; focus: UiFocus; diagnostics: unknown; proposed: unknown }>(request.body);
    const anchor = b.anchor ?? "state";
    if (!ANCHORS.includes(anchor) || typeof b.text !== "string") throw new ServiceError(400, `text is required; anchor must be one of ${ANCHORS.join(", ")}.`);
    const id = service.annotate(request.params.id, {
      anchor, actionId: b.actionId ?? null, text: b.text, categoryIds: ["feedback"], focus: b.focus ?? NO_FOCUS,
      ...(b.proposed === undefined ? {} : { proposed: command(b.proposed) }),
    });
    const data = sessionExport(request.params.id, true);
    const dirty = git(["status", "--porcelain", "--", "sim/src", "game-packages"]);
    const report = feedbackPrompt({
      annotation: data.annotations.find((n) => n["annotation_id"] === id) ?? {}, data, diagnostics: { errors: clientErrors(b.diagnostics) },
      code: { commit: git(["rev-parse", "HEAD"]), dirty: dirty !== "" && dirty !== "unknown", fingerprint: codeFingerprint() },
    });
    return reply.status(201).send({ annotationId: id, ...report });
  });
  if (uiDir !== null) serveUi(app, uiDir);
  return app;
}
