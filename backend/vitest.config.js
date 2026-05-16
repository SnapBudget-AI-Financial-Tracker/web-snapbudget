import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.js"],
      exclude: [
        "src/index.js",
        "src/config/**",
        "src/scripts/**",
        "src/tests/**",
        "src/controllers/chatbotController.js",
        "src/controllers/savingGoalController.js",
        "src/controllers/userController.js",
        "src/services/chatbotService.js",
        "src/services/emailService.js",
        "src/services/inferenceService.js",
      ],
      thresholds: {
        lines: 10,
        branches: 10,
        functions: 10,
        statements: 10,
      },
    },
  },
});
