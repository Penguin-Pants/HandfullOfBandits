// App entry (`npm start`): local server on 127.0.0.1 (03 s4, s9). Store file and package root
// come from HOB_DB and HOB_PACKAGES, with defaults next to the repository.
import { fileURLToPath } from "node:url";
import { buildApp } from "./server/app.ts";
import { SessionService } from "./server/service.ts";
import { openStore } from "./store/migrate.ts";

export const appName = "handful-of-bandits-sim";

if (import.meta.main) {
  const db = openStore(process.env["HOB_DB"] ?? fileURLToPath(new URL("../playtest.sqlite", import.meta.url)));
  const packages = process.env["HOB_PACKAGES"] ?? fileURLToPath(new URL("../../game-packages", import.meta.url));
  const app = buildApp(new SessionService(db, packages));
  const port = Number(process.env["PORT"] ?? 5174);
  await app.listen({ host: "127.0.0.1", port });
  console.log(`${appName}: http://127.0.0.1:${String(port)}`);
}
