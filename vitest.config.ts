import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // The property site keeps JSX in some .js files (CRA convention).
  esbuild: { loader: "tsx", include: /\.(jsx?|tsx?)$/ },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      "server-only": path.resolve(__dirname, "tests/server-only.ts"),
    },
  },
  test: {
    include: [
      "app/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
      "lib/**/*.test.{ts,tsx}",
      "src/**/*.test.{ts,tsx}",
      "property/**/*.test.{ts,tsx,js,jsx}",
    ],
    exclude: ["node_modules/**", ".next/**", "property/server/tests/**"],
    setupFiles: ["tests/jsdom-setup.ts"],
  },
});
