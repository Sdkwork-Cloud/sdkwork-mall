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
- `../sdkwork-commerce (deleted)/`: archived transitional platform snapshot (vendored; see `../sdkwork-clawrouter/vendor/README.md` for debt tracking and removal criteria).
- `.sdkwork/`: repository workspace skills and plugins.
- `specs/`: repository component contract.
- `tests/contract/`: cross-package architecture verification.

## Required Specs By Task Type

- PC app architecture: `../sdkwork-specs/APP_PC_ARCHITECTURE_SPEC.md`, `../sdkwork-specs/APP_PC_REACT_UI_SPEC.md`, `../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`
- SDK consumption: `../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md`, `../sdkwork-specs/SDK_SPEC.md`
- TypeScript/frontend: `../sdkwork-specs/TYPESCRIPT_CODE_SPEC.md`, `../sdkwork-specs/FRONTEND_CODE_SPEC.md`
- Config/release: `../sdkwork-specs/CONFIG_SPEC.md`, `../sdkwork-specs/APP_MANIFEST_SPEC.md`, `../sdkwork-specs/GITHUB_WORKFLOW_SPEC.md`

HTTP/database/web-framework standards are defined in `../sdkwork-specs/` (e.g. `RUST_RPC_SPEC.md`, `DATABASE_FRAMEWORK_SPEC.md`, `WEB_FRAMEWORK_SPEC.md`), not in this repository.

## Documentation Canon

- [docs/README.md](docs/README.md)
- [docs/product/prd/PRD.md](docs/product/prd/PRD.md)
- [docs/architecture/tech/TECH_ARCHITECTURE.md](docs/architecture/tech/TECH_ARCHITECTURE.md)

## Build, Test, and Verification

Run from this repository root:

- `pnpm dev` 鈥?mall PC Vite dev server
- `pnpm build` 鈥?production browser bundle
- `pnpm check` 鈥?typecheck + architecture contract test
- `pnpm verify` 鈥?check + app config validation + vitest

## Agent Execution Rules

Consume commerce capabilities only through generated T1 SDKs and the vendored `@sdkwork/commerce-service` transitional adapter. No raw HTTP. No local SDK forks.

## HTTP API Response Envelope

All L2+ `app-api`, `backend-api`, and SDKWork-owned business `open-api` HTTP contracts `MUST` follow `API_SPEC.md` section 4.5, section 14, and section 15:

- **Input:** typed request bodies, section 14.1 list/search/command input, `SdkWorkListQuery`, and `q` for free-text search.
- **Success output:** `SdkWorkApiResponse` with `{ "code": 0, "data": <payload>, "traceId": "<server-uuid>" }`.
- **Error output:** HTTP 4xx/5xx `application/problem+json` (`ProblemDetail`) with numeric `code` and `traceId`.
- Success `code` is numeric `int32`; HTTP 2xx JSON bodies `MUST` use `0` only. REST semantics remain on HTTP status (`201`, `202`, etc.).
- Platform error codes are numeric non-zero values per section 15.3 (`40001`, `40101`, `40401`, …).
- Single resource: `data.item`
- Lists: `data.items` + `data.pageInfo` (`PageInfo.mode` is `offset` or `cursor`)
- Commands: `data.accepted` plus optional `resourceId` / `status`
- Async accept (`202`): `data.operationId`, `data.status`, optional `pollUrl`

Vendor compatibility `open-api` routes that mirror upstream tool or provider wire (for example OpenAI `/v1/*`, Claude Code, Codex) `MAY` opt out only when every exempt operation declares `x-sdkwork-wire-protocol: external` and `x-sdkwork-external-protocol-id` per `API_SPEC.md` section 4.5.2. SDKWork-owned business `open-api` operations `MUST NOT` opt out.

Errors `MUST` use HTTP 4xx/5xx with `application/problem+json` (`ProblemDetail`) including required numeric `code` and `traceId`. Business failures `MUST NOT` use HTTP 2xx with non-zero `code`, string wire codes, `success`, or human `message`.

Forbidden legacy envelopes and fields: `PlusApiResult`, `AppbaseApiResult`, `StoreApiResult`, `SdkWorkResponse`, per-domain `*ApiResult`, wire field `requestId`, bare domain DTOs at the HTTP root, and top-level `{ items, pageInfo, traceId }` without `data`.

Handlers `MUST` serialize success and map errors through `sdkwork-web-framework` response mapping. Generated HTTP SDKs (`--standard-profile sdkwork-v3`) unwrap `data` by default and expose typed numeric `ProblemDetail.code` / `traceId` on errors; use `.raw` when the full envelope is required.

Before completing API contract, SDK generation, or frontend service work, run:

```bash
node <sdkwork-specs>/tools/check-api-response-envelope.mjs --workspace <workspace-root>
```

Authority: `sdkwork-specs/API_SPEC.md` section 4.5 and sections 14–16, `SDK_SPEC.md` section 4.2, `FRONTEND_SPEC.md`, `MIGRATION_SPEC.md` section 4.2.

## HTTP API Response Envelope

All L2+ `app-api`, `backend-api`, and SDKWork-owned `open-api` success JSON bodies `MUST` use `SdkWorkResponse` from `API_SPEC.md` §15:

- Envelope: `{ "data": <payload>, "requestId": "<server-uuid>" }`
- Single resource: `data.item`
- Lists: `data.items` + `data.pageInfo` (`PageInfo.mode` is `offset` or `cursor`)
- Commands: `data.accepted` plus optional `resourceId` / `status`
- Async accept (`202`): `data.operationId`, `data.status`, optional `pollUrl`

Errors `MUST` use HTTP 4xx/5xx with `application/problem+json` (`ProblemDetail`). Business failures `MUST NOT` use HTTP 2xx with `success`, `code`, or `message`.

Forbidden legacy envelopes: `PlusApiResult`, `AppbaseApiResult`, `StoreApiResult`, per-domain `*ApiResult`, bare domain DTOs at the HTTP root, and top-level `{ items, pageInfo, requestId }` without `data`.

Handlers `MUST` serialize success and map errors through `sdkwork-web-framework` response mapping. Do not hand-build envelopes in controllers or route handlers.

Generated HTTP SDKs (`--standard-profile sdkwork-v3`) unwrap `data` by default; use `.raw` only when correlation headers or the full envelope are required.

Before completing API contract or handler work, run:

```bash
node <sdkwork-specs>/tools/check-api-response-envelope.mjs --workspace <workspace-root>
```

Authority: `sdkwork-specs/API_SPEC.md` §15–§16, `WEB_FRAMEWORK_SPEC.md`, `SDK_SPEC.md` §4.1, `MIGRATION_SPEC.md` §API Response Envelope Migration.
