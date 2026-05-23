import {
  getInput,
  info,
  exportVariable,
  startGroup,
  endGroup,
} from "@actions/core";

export const setupProject = async () => {
  startGroup("Configure ntn workspace");

  const workspaceId = getInput("workspace_id");
  const notionEnv = getInput("notion_env");
  const workersConfigFile = getInput("workers_config_file");

  if (workspaceId) {
    info(`Setting NOTION_WORKSPACE_ID=${workspaceId}`);
    exportVariable("NOTION_WORKSPACE_ID", workspaceId);
  }

  if (notionEnv) {
    info(`Setting NOTION_ENV=${notionEnv}`);
    exportVariable("NOTION_ENV", notionEnv);
  }

  if (workersConfigFile) {
    info(`Setting NOTION_WORKERS_CONFIG_FILE=${workersConfigFile}`);
    exportVariable("NOTION_WORKERS_CONFIG_FILE", workersConfigFile);
  }

  endGroup();
};
