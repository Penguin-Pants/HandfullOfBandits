// CLI entry: `npm run sim -- <command> [args]`.
import { validateCommand } from "./validate.ts";

const usage = "Usage: sim validate <package-dir>";
const [command, dir] = process.argv.slice(2);

if (command === "validate" && dir !== undefined) {
  const { exitCode, lines } = validateCommand(dir);
  for (const line of lines) console.log(line);
  process.exitCode = exitCode;
} else {
  console.error(usage);
  process.exitCode = 2;
}
