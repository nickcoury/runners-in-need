import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "ci-smoke.spec.ts",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4322",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run preview -- --port 4322",
    port: 4322,
    timeout: 15_000,
    reuseExistingServer: false,
  },
});
