import { sync as commandExists } from "command-exists";
import {
  getInput,
  debug,
  startGroup,
  endGroup,
} from "@actions/core";
import { exec } from "@actions/exec";

export const install = async () => {
  startGroup("ntn installer");
  const version = getInput("tools-version");
  let command = "npm install -g ntn";

  if (!commandExists("npm")) {
    throw new Error(
      "npm is required to install ntn. Did you forget to add actions/setup-node before this step?"
    );
  }

  if (version) {
    debug(`Using ntn version ${version}`);
    command = `${command}@${version}`;
  }

  await exec(command);
  endGroup();
};
