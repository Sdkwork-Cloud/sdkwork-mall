# Repository Guidelines

<!-- SDKWORK-AGENTS-GENERATED: v1 -->

## SDKWORK Soul

Read `../sdkwork-specs/SOUL.md` before executing tasks in this root.

## Application Identity

Read `apps/sdkwork-mall-pc/sdkwork.app.config.json` before changing application behavior, runtime config, SDK wiring, release metadata, or app-owned capabilities.

## Local Dictionary Structure

- `AGENTS.md`: repository agent entrypoint.
- `apps/sdkwork-mall-pc/`: PC application root (`sdkwork-mall-pc`).
- `apps/sdkwork-mall-pc/packages/`: `@sdkwork/mall-pc-*` feature packages.
- `../sdkwork-commerce/`: commerce foundation SDKs and services (consumer dependency).
- `.sdkwork/`: repository workspace skills and plugins.
- `specs/`: repository component contract.
- `tests/contract/`: cross-package architecture verification.

## Required Specs By Task Type

- PC app architecture: `../sdkwork-specs/APP_PC_ARCHITECTURE_SPEC.md`, `../sdkwork-specs/APP_PC_REACT_UI_SPEC.md`, `../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`
- SDK consumption: `../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md`, `../sdkwork-specs/SDK_SPEC.md`
- TypeScript/frontend: `../sdkwork-specs/TYPESCRIPT_CODE_SPEC.md`, `../sdkwork-specs/FRONTEND_CODE_SPEC.md`
- Config/release: `../sdkwork-specs/CONFIG_SPEC.md`, `../sdkwork-specs/APP_MANIFEST_SPEC.md`, `../sdkwork-specs/GITHUB_WORKFLOW_SPEC.md`

Commerce-owned HTTP/database/web-framework standards apply in `sdkwork-commerce`, not in this repository.

## Build, Test, and Verification

Run from this repository root:

- `pnpm dev` — mall PC Vite dev server
- `pnpm build` — production browser bundle
- `pnpm check` — typecheck + architecture contract test
- `pnpm verify` — check + app config validation + vitest

## Agent Execution Rules

Consume commerce capabilities only through generated SDKs and `@sdkwork/commerce-service`. No raw HTTP. No local SDK forks.
