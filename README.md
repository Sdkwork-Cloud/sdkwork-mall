# SDKWork Mall

Independent SDKWork application repository for the **Mall PC** e-commerce platform (storefront, buyer console, merchant console, platform admin).

## Architecture

| Repository | Responsibility |
| --- | --- |
| **sdkwork-mall** (this repo) | Mall application UI, routes, packages under `apps/sdkwork-mall-pc/` |
| **sdkwork-commerce** | Shared commerce foundation: product center, trading, payment, VIP, marketing, Rust APIs, database, generated SDKs |
| **sdkwork-appbase** | IAM login/session, runtime bootstrap |
| **sdkwork-utils** | Cross-cutting TypeScript utilities (via `@sdkwork/commerce-service`) |

Mall consumes commerce through workspace sibling paths declared in `pnpm-workspace.yaml`. Do not fork generated SDK output or raw HTTP transport.

## Application root

- Manifest: `apps/sdkwork-mall-pc/sdkwork.app.config.json`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Verify: `pnpm verify`

## Standards

Follow `../sdkwork-specs/README.md`. Agent entrypoint: `AGENTS.md`.
