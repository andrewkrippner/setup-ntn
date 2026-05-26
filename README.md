# setup-ntn

GitHub Action that installs the [ntn (Notion) CLI](https://www.npmjs.com/package/ntn) and configures authentication so your workflow can deploy and manage Notion Workers from CI/CD.

Inspired by [`w9jds/setup-firebase`](https://github.com/w9jds/setup-firebase).

## What this action does

- Installs `ntn` (latest, or the version you specify) via `npm install -g`
- Exports `NOTION_API_TOKEN` from a secret so subsequent `ntn` steps are authenticated
- Sets `NOTION_KEYRING=0` so the CLI uses file-based auth instead of trying to reach a non-existent OS keychain on the runner
- Optionally exports `NOTION_WORKSPACE_ID`, `NOTION_ENV`, and `NOTION_WORKERS_CONFIG_FILE`
- Optionally changes the working directory before subsequent steps
- Prints `node` and `ntn` versions, and sets an `ntn-version` output

It does **not** run `ntn workers deploy` for you — that goes in your own `run:` step, the same way `setup-firebase` leaves `firebase deploy` to the caller.

## Requirements

- A runner with `npm` available. Use [`actions/setup-node`](https://github.com/actions/setup-node) immediately before this action.
- A Notion API token stored as a GitHub secret (e.g. `NOTION_API_TOKEN`).
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
          notion_api_token: ${{ secrets.NOTION_API_TOKEN }}
      - run: ntn workers deploy
```

### Pin a version and select a workspace

```yaml
- uses: andrewkrippner/setup-ntn@v1
  with:
    tools-version: 0.14.1
    notion_api_token: ${{ secrets.NOTION_API_TOKEN }}
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
| `notion_api_token` | **Yes** | Notion API token. Exported as `NOTION_API_TOKEN`. The value is registered as a secret with `core.setSecret`. |
| `workspace_id` | No | Exported as `NOTION_WORKSPACE_ID`. |
| `notion_env` | No | One of `local`, `dev`, `stg`, `prod`. Exported as `NOTION_ENV`. |
| `workers_config_file` | No | Path to a `workers.json` file. Exported as `NOTION_WORKERS_CONFIG_FILE`. |

## Outputs

| Output | Description |
|---|---|
| `ntn-version` | The installed `ntn --version` string. |

## How auth works

The `ntn` CLI reads `NOTION_API_TOKEN` from the environment and uses it instead of any keychain-stored credential. This action sets that variable via `core.exportVariable`, which writes it into `GITHUB_ENV` so every subsequent step in the job sees it.

`NOTION_KEYRING=0` is set unconditionally to prevent the CLI from attempting to access an OS keychain that doesn't exist on GitHub-hosted runners.

## Development

```bash
npm install
npm run build   # produces dist/setup/index.js via @vercel/ncc
```

`dist/` is committed because GitHub Actions executes `dist/setup/index.js` directly — there is no install step at action runtime.

## License

MIT
