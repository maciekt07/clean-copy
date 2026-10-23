import { spawn } from "node:child_process";
import { PLAYGROUND_PORT } from "../constants/playground.mjs";

process.env.PLAYGROUND_PORT ??= PLAYGROUND_PORT.toString();
await import("./playground-server.mjs");

const args = process.argv.slice(2).join(" ");
const wxt = spawn(`pnpm exec wxt ${args}`, {
  shell: true,
  stdio: "inherit",
  env: { ...process.env, PLAYGROUND: "1" },
});

wxt.on("exit", (code) => process.exit(code ?? 0));
