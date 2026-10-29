import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          // components and helpers, in a simulated browser
          extends: true,
          test: {
            name: "unit",
            environment: "jsdom",
            include: ["src/**/*.test.{ts,tsx}"],
            setupFiles: ["./src/test/setup.ts"],
          },
        },
        {
          // security rules, against the Firestore emulator (npm run test:rules)
          extends: true,
          test: {
            name: "rules",
            environment: "node",
            include: ["tests/**/*.test.ts"],
          },
        },
      ],
    },
  }),
);
