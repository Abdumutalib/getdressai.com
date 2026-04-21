# Super Robot Verification Guide

`Super Robot` in this project refers to the local quality-check flow mentioned in [PROJECT.txt](./PROJECT.txt).

## Main command

Run from the repository root:

```bash
npm run verify
```

This now matches the documentation and performs:

1. `npm run test --prefix getdressai`
2. `node --check dressai-api/server.js`
3. `node scripts/verify-services.mjs`

## Live service checks

If you also want HTTP checks against running local services:

```bash
npm run verify:live
```

That runs the same verification plus:

- `dressai-api` health check
- `dressai-api /config` response check
- `getdressai` homepage availability check

Expected local defaults:

- API: `http://127.0.0.1:3000`
- Web: `http://127.0.0.1:8787`

## Supporting files

- [PROJECT.txt](./PROJECT.txt): mentions `Desktop\super_robot\run_dressai_quality.bat`
- [README.md](./README.md): root verification command
- [scripts/verify-services.mjs](./scripts/verify-services.mjs): env and HTTP verification logic
- [.github/workflows/ci.yml](./.github/workflows/ci.yml): CI runs the same core checks

## Important note

The batch file `Desktop\super_robot\run_dressai_quality.bat` is not stored in this repository. The repo contains the commands and scripts that batch file is expected to call.
