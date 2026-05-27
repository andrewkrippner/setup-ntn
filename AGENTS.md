# Agents.MD

GitHub Action that installs the `ntn` (Notion) CLI and configures auth.

## Layout

- `src/setup-ntn.ts` — action entrypoint (bundled into `dist/setup/index.js`)
- `src/installer.ts` — installs the ntn CLI
- `src/auth.ts` — exports `NOTION_API_TOKEN` and friends to the workflow env
- `action.yml` — action metadata; inputs are documented here
- `dist/` — committed build output that GitHub Actions executes

## Workflow

- Default branch: `master` (do not use `main`).
- After editing `src/` or `action.yml`, run `npm run pre-checkin` to format and rebuild `dist/`. Commit `dist/` along with source changes — the action runs from `dist/`.
- PRs target `master`: `gh pr create --base master`.

## Auth notes

`notion_api_token` accepts both Notion personal access tokens (recommended) and integration tokens. It is exported as `NOTION_API_TOKEN`, which is the env var the ntn CLI reads. Don't rename it.
