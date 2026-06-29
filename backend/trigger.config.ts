import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "urban-ai-platform",
  runtime: "node",
  logLevel: "log",
  maxDuration: 3600,
  retries: {
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
});
