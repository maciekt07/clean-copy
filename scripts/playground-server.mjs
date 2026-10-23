import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import sirv from "sirv";
import {
  PLAYGROUND_HOST,
  PLAYGROUND_PORT,
  PLAYGROUND_URL,
} from "../constants/playground.mjs";

const root = fileURLToPath(new URL("../playground/", import.meta.url));
const serve = sirv(root, { dev: true, single: false });
const server = createServer(serve);

try {
  new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PLAYGROUND_PORT, PLAYGROUND_HOST, resolve);
  });
} catch (err) {
  console.error(`playground: failed to start on ${PLAYGROUND_URL}`);
  console.error(err.message);
  process.exit(1);
}

console.log(`playground: ${PLAYGROUND_URL}`);
