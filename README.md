# setup-ntn

GitHub Action that installs the [ntn (Notion) CLI](https://www.npmjs.com/package/ntn) and wires up authentication so your workflow can deploy and manage Notion Workers from CI/CD. Pass a Notion [personal access token](https://developers.notion.com/guides/get-started/personal-access-tokens) (recommended) or integration token as a secret.

Inspired by [`w9jds/setup-firebase`](https://github.com/w9jds/setup-firebase).

## What this action does

- Installs `ntn` (latest, or the version you specify) via `npm install -g`
- Takes a Notion credential (PAT or integration token) as input and exports it as `NOTION_API_TOKEN` so subsequent `ntn` steps are authenticated
- Sets `NOTION_KEYRING=0` so the CLI uses file-based auth instead of trying to reach a non-existent OS keychain on the runner
- Optionally exports `NOTION_WORKSPACE_ID`, `NOTION_ENV`, and `NOTION_WORKERS_CONFIG_FILE`
- Prints `node` and `ntn` versions, and sets an `ntn-version` output

It does **not** run `ntn workers deploy` for you — that goes in your own `run:` step, the same way `setup-firebase` leaves `firebase deploy` to the caller.

## Requirements

- A runner with `npm` available. Use [`actions/setup-node`](https://github.com/actions/setup-node) immediately before this action.
- A Notion credential stored as a GitHub secret. Use a [**personal access token (PAT)**](https://developers.notion.com/guides/get-started/personal-access-tokens) — this is Notion's recommended credential for CLI/automation use. An integration token also works (the `ntn` CLI accepts either in the same env var), but PATs are preferred for new setups.
- Linux or macOS runners. The `ntn` npm package only ships prebuilt binaries for `darwin-{arm64,x64}` and `linux-{arm64,x64}`.

## Usage

### Basic

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: andrewkrippner/setup-ntn@v1
        with:
          notion_api_token: ${{ secrets.NOTION_PAT }}
      - run: ntn workers deploy
```

### Pin a version and select a workspace

```yaml
- uses: andrewkrippner/setup-ntn@v1
  with:
    tools-version: 0.14.1
    notion_api_token: ${{ secrets.NOTION_PAT }}
    workspace_id: ${{ secrets.NOTION_WORKSPACE_ID }}
    notion_env: prod
    workers_config_file: ./apps/my-worker/workers.json
- run: ntn workers list
  working-directory: ./apps/my-worker
- run: ntn workers deploy
  working-directory: ./apps/my-worker
```

## Inputs

| Input | Required | Description |
|---|---|---|
| `tools-version` | No | `ntn` version to install (e.g. `0.14.1`). Defaults to the latest published version. |
| `notion_api_token` | **Yes** | Notion credential — a [personal access token](https://developers.notion.com/guides/get-started/personal-access-tokens) (recommended) or integration token. Exported as `NOTION_API_TOKEN`, which is the env var the `ntn` CLI reads. The value is registered as a secret with `core.setSecret`. |
| `workspace_id` | No | Exported as `NOTION_WORKSPACE_ID`. |
| `notion_env` | No | One of `local`, `dev`, `stg`, `prod`. Exported as `NOTION_ENV`. |
| `workers_config_file` | No | Path to a `workers.json` file. Exported as `NOTION_WORKERS_CONFIG_FILE`. |

## Outputs

| Output | Description |
|---|---|
| `ntn-version` | The installed `ntn --version` string. |

## How auth works

The `ntn` CLI supports two auth paths: an interactive `ntn login` (which stores credentials in the OS keychain), and reading `NOTION_API_TOKEN` from the environment. GitHub runners have no keychain, so this action uses the env-var path: it takes whatever you pass as `notion_api_token` and exports it as `NOTION_API_TOKEN` via `core.exportVariable`, which writes it into `GITHUB_ENV` so every subsequent step in the job sees it. The `ntn` CLI then picks it up automatically — no `ntn login` step needed.

`NOTION_KEYRING=0` is set unconditionally to prevent the CLI from attempting to access the OS keychain.

The credential itself can be either a [personal access token](https://developers.notion.com/guides/get-started/personal-access-tokens) or an integration token; the CLI accepts either in `NOTION_API_TOKEN`. PATs are Notion's recommended credential for new automation, so use a PAT unless you have a specific reason to use an integration token.

## Development

```bash
npm install
npm run build   # produces dist/setup/index.js via @vercel/ncc
```

`dist/` is committed because GitHub Actions executes `dist/setup/index.js` directly — there is no install step at action runtime.

## License

MIT
