import { defineConfig } from "vitest/config";
import path from "node:path";

const resolveConfig = {
  alias: {
    "@": path.resolve(import.meta.dirname, "src"),
  },
};

export default defineConfig({
  resolve: resolveConfig,
  test: {
    projects: [
      {
        resolve: resolveConfig,
        test: {
          name: "frontend",
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
          include: [
            "src/components/**/*.test.tsx",
            "src/components/**/*.test.ts",
            "src/lib/**/*.test.ts",
            "src/test/**/*.test.ts"
          ],
        },
      },
      {
        resolve: resolveConfig,
        test: {
          name: "backend",
          environment: "node",
          setupFiles: ["./tests/setup.ts"],
          include: ["tests/**/*.test.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "src/components/**/*.tsx",
        "src/lib/**/*.ts",
        "src/config/**/*.ts",
        "src/controllers/**/*.ts",
        "src/database/**/*.ts",
        "src/jobs/**/*.ts",
        "src/middleware/**/*.ts",
        "src/repositories/**/*.ts",
        "src/routes/**/*.ts",
        "src/schemas/**/*.ts",
        "src/services/**/*.ts",
        "src/utils/**/*.ts"
      ],
      exclude: [
        "src/server.ts",
        "src/types/**",
        "src/lib/api.test.ts"
      ]
    }
  }
});
