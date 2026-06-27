# SDKWork Mall

Independent SDKWork application repository for the **Mall PC** e-commerce platform (storefront, buyer console, merchant console, platform admin).

## Architecture

| Repository | Responsibility |
| --- | --- |
| **sdkwork-mall** (this repo) | Mall application UI, routes, packages under `apps/sdkwork-mall-pc/` |
| **T1 capability repos** | Individual commerce capability backends: `sdkwork-shop`, `sdkwork-order`, `sdkwork-payment`, `sdkwork-merchandise`, `sdkwork-membership`, `sdkwork-promotion`, `sdkwork-invoice`, `sdkwork-inventory`, `sdkwork-account` |
| **sdkwork-appbase** | IAM login/session, runtime bootstrap |
| **sdkwork-utils** | Cross-cutting TypeScript utilities |

The `sdkwork-commerce` monolith has been dissolved. Mall consumes T1 capability packages and SDKs through workspace sibling paths declared in `pnpm-workspace.yaml`. Transitional TypeScript packages and generated SDKs are sourced from the vendored snapshot at `../sdkwork-clawrouter/vendor/sdkwork-commerce/` until per-T1 SDK families fully replace the remaining surfaces. Do not fork generated SDK output or raw HTTP transport.

## Application root

- Manifest: `apps/sdkwork-mall-pc/sdkwork.app.config.json`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Verify: `pnpm verify`

## Standards

Follow `../sdkwork-specs/README.md`. Agent entrypoint: `AGENTS.md`.

## Documentation Canon

- [docs/README.md](docs/README.md)
- [docs/product/prd/PRD.md](docs/product/prd/PRD.md)
- [docs/architecture/tech/TECH_ARCHITECTURE.md](docs/architecture/tech/TECH_ARCHITECTURE.md)

## Application Roots

- [apps directory index](apps/README.md)
