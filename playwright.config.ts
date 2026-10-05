import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  workers: 1, // one browser profile at a time; the mock server is shared
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
});
