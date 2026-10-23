import { createHash } from "node:crypto";
import path from "node:path";
import { defineWebExtConfig } from "wxt";
import { PLAYGROUND_URL } from "./constants/playground.mjs";

const sourceDir = path.resolve(".output/chrome-mv3-dev");
const hash = createHash("sha256").update(sourceDir).digest("hex").slice(0, 32);
const extensionId = [...hash]
  .map((char) => String.fromCharCode(97 + Number.parseInt(char, 16)))
  .join("");

export default defineWebExtConfig({
  startUrls: process.env.PLAYGROUND === "1" ? [PLAYGROUND_URL] : undefined,
  chromiumPref: {
    "extensions.pinned_extensions": [extensionId],
  },
});
