import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  test: {
    /* Use jsdom so React components can render in Node */
    environment: "jsdom",

    /* Run setup file before each test file */
    setupFiles: ["./tests/setup.ts"],

    /* Glob patterns — keep unit tests co-located or in tests/ */
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules", ".next"],

    /* Coverage via v8 (built-in, no extra install) */
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/**",
        ".next/**",
        "tests/e2e/**",
        "src/**/*.d.ts",
        "src/app/**",          // Next.js pages are covered by E2E
        "vitest.config.ts",
        "playwright.config.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },

    /* Global test helpers available without imports */
    globals: true,
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
