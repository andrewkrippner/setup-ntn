import {
  warning,
  startGroup,
  setSecret,
  setOutput,
  endGroup,
  info,
  setFailed,
  getInput,
} from "@actions/core";
import { getExecOutput } from "@actions/exec";

import { login } from "./auth.js";
import { install } from "./installer.js";
import { setupProject } from "./project.js";

export const run = async () => {
  const token = getInput("notion_api_token");
  if (token) {
    setSecret(token);
  }

  try {
    await install();
    await login();
    await setupProject();
    await printEnvDetailsAndSetOutput();
  } catch (ex) {
    setFailed(ex instanceof Error ? ex.message : JSON.stringify(ex));
  }
};

const printEnvDetailsAndSetOutput = async () => {
  startGroup("Environment details");

  for (const tool of ["node", "ntn"]) {
    const output = (await getToolVersion(tool, ["--version"])).trim();
    info(`${tool}: ${output}`);

    if (tool === "ntn" && output) {
      // `ntn --version` prints "ntn 0.14.1"; expose just the semver.
      const semver = output.replace(/^ntn\s+/, "");
      setOutput("ntn-version", semver);
    }
  }

  endGroup();
};

const getToolVersion = async (tool: string, options: string[]) => {
  try {
    const { stdout, stderr, exitCode } = await getExecOutput(tool, options, {
      ignoreReturnCode: true,
      silent: true,
    });

    if (exitCode > 0) {
      warning(`[warning]${stderr}`);
      return "";
    }

    return stdout;
  } catch {
    return "";
  }
};
