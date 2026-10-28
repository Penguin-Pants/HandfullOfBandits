import { createHash } from "node:crypto";

export const hash = createHash("sha256").update("x").digest("hex");
