# @sdkwork/mall-pc-billing

## Purpose

Billing posture, metered usage, budget alerts, and reusable billing-center surfaces.

## Placement

- Architecture: `pc-react`
- Domain: `commerce`
- Capability: `billing`
- Status: `ready`

## Depends on

- `@sdkwork/ui-pc-react` for shared UI primitives and patterns
- `@sdkwork/account-service` for authenticated session checks via the T1 account domain module
- `@sdkwork/payment-service` for currency normalization and payment dashboard composition
- `@sdkwork/mall-pc-invoice`, `@sdkwork/mall-pc-offer`, `@sdkwork/mall-pc-payment`, `@sdkwork/mall-pc-subscription`, and `@sdkwork/mall-pc-wallet` for composed billing-center surfaces

## Ownership

This package owns billing posture, usage breakdown, budget alerts, and reusable billing-center surfaces. Child mall packages supply wallet, subscription, payment, invoice, and offer context.

## Runtime boundary

Authenticated dashboards compose T1 domain-backed mall packages. Metered usage history still loads through the transitional commerce app SDK slice (`billing.history.list`) behind an injectable `loadUsageRecords` boundary.

## Verification

Use the package `typecheck` script and focused Vitest coverage for service, controller, and UI behavior when changing this package.

## SDKWork Documentation Contract

Domain: commerce
Capability: billing
Package type: react-package
Status: ready

### Public API

Public exports are declared in `specs/component.spec.json` under `contracts.publicExports`.

### Required SDK Surface

- None declared in `specs/component.spec.json`.

### Configuration

Configuration keys and runtime entrypoints are declared in `specs/component.spec.json`.

### SaaS/Private/Local Behavior

This module follows the canonical standards linked from `specs/component.spec.json`, including deployment and runtime configuration rules where applicable.

### Security

Do not add secrets, live tokens, manual auth headers, or app-local credential handling to this module.

### Extension Points

Extension points are limited to declared public exports, runtime entrypoints, SDK clients, events, and config keys.

### Verification

- `pnpm --filter @sdkwork/mall-pc-billing typecheck`

### Owner And Status

Owner and lifecycle status are tracked in `specs/component.spec.json`.
