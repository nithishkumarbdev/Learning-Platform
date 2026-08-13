import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Unit tests only. Playwright owns `e2e/` — including it here makes Vitest try to
// execute Playwright's test.describe() outside a Playwright runner and fail.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
    environment: "node",
  },
});
