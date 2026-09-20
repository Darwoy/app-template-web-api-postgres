import { defineConfig } from "@playwright/test";

// BASE_URL set: test a running deployment (CI's compose stack, a preview).
// BASE_URL unset: start the api and the web here, against DATABASE_URL, so the
// suites run anywhere a Postgres is reachable - a laptop, or the build room.
const external = Boolean(process.env.BASE_URL);

// compose.yaml publishes Postgres on host port 5433 (5432 is often taken on a laptop). CI's scenarios
// job runs `docker compose up` without setting DATABASE_URL, so default to that mapping here; the build
// room and any caller that sets DATABASE_URL keep their value. (Found by a build session in step 3.)
process.env.DATABASE_URL ??= "postgres://app:app@localhost:5433/app";

export default defineConfig({
  testDir: ".",
  timeout: 30_000,
  retries: 0,
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000", trace: "retain-on-failure" },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: external
    ? undefined
    : [
        {
          command: "npm run migrate --workspace=api && npm run dev --workspace=api",
          cwd: "..",
          url: "http://localhost:3001/health",
          reuseExistingServer: true,
          timeout: 120_000,
          env: { PORT: "3001" },
        },
        {
          command: "npm run dev --workspace=web",
          cwd: "..",
          url: "http://localhost:3000",
          reuseExistingServer: true,
          timeout: 120_000,
          env: { API_URL: "http://localhost:3001", NEXT_TELEMETRY_DISABLED: "1" },
        },
      ],
});
