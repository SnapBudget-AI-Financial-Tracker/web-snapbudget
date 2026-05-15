import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function runTest(workspace) {
  return new Promise((resolve) => {
    console.log(
      `\n${BLUE}${BOLD}=========================================${RESET}`,
    );
    console.log(
      `${BLUE}${BOLD}🏃 Running tests for: ${workspace.toUpperCase()}${RESET}`,
    );
    console.log(
      `${BLUE}${BOLD}=========================================${RESET}\n`,
    );

    const workspacePath = path.join(rootDir, workspace);
    const proc = spawn(
      /^win/.test(process.platform) ? "npm.cmd" : "npm",
      ["run", "test"],
      {
        cwd: workspacePath,
        stdio: "inherit",
        shell: true,
      },
    );

    proc.on("close", (code) => {
      if (code === 0) {
        console.log(
          `\n${GREEN}${workspace.toUpperCase()} tests passed successfully!${RESET}\n`,
        );
        resolve({ workspace, success: true });
      } else {
        console.log(
          `\n${RED}${workspace.toUpperCase()} tests failed with exit code ${code}${RESET}\n`,
        );
        resolve({ workspace, success: false });
      }
    });
  });
}

async function runAllTests() {
  console.log(`${BOLD}Starting Global Test Suite...${RESET}`);

  const results = [];

  // Run backend tests
  results.push(await runTest("backend"));

  // Run frontend tests
  results.push(await runTest("frontend"));

  console.log(`\n${BOLD}GLOBAL TEST SUMMARY:${RESET}`);
  console.log(`-----------------------------------------`);

  let allPassed = true;
  for (const result of results) {
    if (result.success) {
      console.log(`${GREEN}✔ ${result.workspace.padEnd(10)} : PASSED${RESET}`);
    } else {
      console.log(`${RED}✖ ${result.workspace.padEnd(10)} : FAILED${RESET}`);
      allPassed = false;
    }
  }
  console.log(`-----------------------------------------\n`);

  if (!allPassed) {
    console.error(
      `${RED}${BOLD}SOME TESTS FAILED. Please check the logs above.${RESET}`,
    );
    process.exit(1);
  } else {
    console.log(`${GREEN}${BOLD}ALL TESTS PASSED SUCCESSFULLY!${RESET}`);
    process.exit(0);
  }
}

runAllTests();
