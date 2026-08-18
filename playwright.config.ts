import { defineConfig, devices } from "@playwright/test";

try {
  // Specs talk to the real Postgres database directly (via Prisma) to seed
  // test users and reset tokens, so this process needs the same env vars as
  // `npm run dev`. Loaded here (not per-spec) so worker processes inherit it.
  process.loadEnvFile();
} catch {
  // .env is optional — CI environments provide these vars directly.
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
