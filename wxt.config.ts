import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: "Clean Copy",
    version: "1.0.3",
    author: {
      email: "contact@maciejtwarog.dev",
    },
    description:
      "Copy text exactly as selected - no extra links, source credits, or promotional text added by the website.",
    homepage_url: "https://github.com/maciekt07/clean-copy#readme",
    permissions: ["storage", "activeTab"],
  },
});
