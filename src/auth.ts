import {
  getInput,
  info,
  exportVariable,
  startGroup,
  endGroup,
} from "@actions/core";

export const login = async () => {
  startGroup("Notion authentication");
  const token = getInput("notion_api_token");

  if (!token) {
    throw new Error(
      "notion_api_token is required to authenticate ntn"
    );
  }

  info("Exporting NOTION_API_TOKEN for use by the CLI");
  exportVariable("NOTION_API_TOKEN", token);

  info("Setting NOTION_KEYRING=0 so ntn uses file-based auth (no OS keychain on CI)");
  exportVariable("NOTION_KEYRING", "0");

  endGroup();
};
