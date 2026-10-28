// Kurdish package 0.1.0 loaded once for engine tests.
import { join } from "node:path";
import { loadPackage, readPackageDir } from "../src/package/load.ts";

// Resolved from the working folder (sim/), so it also works under the jsdom environment.
export const kurdishDir = join(process.cwd(), "..", "game-packages", "kurdish-coin", "0.1.0");
const result = loadPackage(readPackageDir(kurdishDir));
if (!result.ok) throw new Error(`kurdish-coin must load: ${JSON.stringify(result.issues)}`);
export const kurdish = result;
