# Repository Guidelines

## SDKWORK Soul

Read `../../../sdkwork-specs/SOUL.md` before executing tasks in this application root.

## Application Identity

Read `sdkwork.app.config.json` — app key `sdkwork-mall-pc`, comprehensive e-commerce platform (storefront + buyer + merchant + admin).

## Product Requirements

Full PRD: `README.prd.md` (JD/Tmall-style mall). Four surfaces:

- **storefront** — C-end shopping (home, search, catalog, PDP, cart, checkout)
- **buyer** — post-purchase console (orders, after-sales, addresses, assets)
- **merchant** — seller console (onboarding, products, orders, settlement)
- **backend-admin** — platform governance (shops, products, membership)

## Verification

```bash
pnpm dev
pnpm build
pnpm --dir apps/sdkwork-mall-pc run test:config
pnpm typecheck
pnpm verify
```

Consume commerce via `@sdkwork/commerce-service` and generated `sdkwork-commerce-*` SDKs — no raw HTTP. Currency formatting uses `@sdkwork/commerce-service` backed by `@sdkwork/utils`.
