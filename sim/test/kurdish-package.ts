// Kurdish package 0.1.0 loaded once for engine tests.
import { fileURLToPath } from "node:url";
import { loadPackage, readPackageDir } from "../src/package/load.ts";

export const kurdishDir = fileURLToPath(new URL("../../game-packages/kurdish-coin/0.1.0", import.meta.url));
const result = loadPackage(readPackageDir(kurdishDir));
if (!result.ok) throw new Error(`kurdish-coin must load: ${JSON.stringify(result.issues)}`);
export const kurdish = result;
