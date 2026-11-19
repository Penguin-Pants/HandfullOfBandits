// App entry (`npm start`): local server on 127.0.0.1 (03 s4, s9). Store file and package root
// come from HOB_DB and HOB_PACKAGES, experiment runs from HOB_EXPERIMENTS, with defaults next to
// the repository.
import { fileURLToPath } from "node:url";
import { buildApp } from "./server/app.ts";
import { SessionService, type ExperimentRuns, type SeatBots } from "./server/service.ts";
import { botExtendsState, botToAct, checkSeats, joinStatePart, seatPlayers, seatStep } from "./cli/seat.ts";
import { experimentRuns } from "./cli/experiment-viewer.ts";
import { openStore } from "./store/migrate.ts";

export const appName = "handful-of-bandits-sim";

/** Bot seats for play sessions (audit Plan 2 S1). */
export const seatBots: SeatBots = { check: checkSeats, players: seatPlayers, toAct: botToAct, extendsState: botExtendsState, join: joinStatePart, step: seatStep };

if (import.meta.main) {
  const db = openStore(process.env["HOB_DB"] ?? fileURLToPath(new URL("../playtest.sqlite", import.meta.url)));
  const packages = process.env["HOB_PACKAGES"] ?? fileURLToPath(new URL("../../game-packages", import.meta.url));
  const runs: ExperimentRuns = experimentRuns(process.env["HOB_EXPERIMENTS"] ?? fileURLToPath(new URL("../experiments/runs", import.meta.url)));
  const app = buildApp(new SessionService(db, packages, seatBots, runs), fileURLToPath(new URL("../dist/ui", import.meta.url)));
  const port = Number(process.env["PORT"] ?? 5174);
  await app.listen({ host: "127.0.0.1", port });
  console.log(`${appName}: http://127.0.0.1:${String(port)}`);
}
