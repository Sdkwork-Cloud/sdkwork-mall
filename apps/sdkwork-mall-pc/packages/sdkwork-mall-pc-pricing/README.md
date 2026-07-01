# @sdkwork/mall-pc-pricing

## Purpose

Price books, plan comparison, bundle strategy, and reusable pricing-center surfaces.

## Placement

- Architecture: `pc-react`
- Domain: `commerce`
- Capability: `pricing`
- Status: `ready`

## Depends on

- `@sdkwork/ui-pc-react` for shared UI primitives and patterns
- `@sdkwork/account-service` for session checks and points formatting via the T1 account domain module
- `@sdkwork/payment-service` for currency formatting via the T1 payment domain module
- `@sdkwork/mall-pc-billing`, `@sdkwork/mall-pc-offer`, `@sdkwork/mall-pc-subscription`, and `@sdkwork/mall-pc-wallet` for composed pricing-center surfaces

## Ownership

This package is implemented as an independent SDKWork commerce capability. It owns its public React/service contracts and consumes commerce data through injected service boundaries with wallet and membership ownership kept separate.

## Runtime boundary

This package composes sibling mall domain packages and does not call `@sdkwork/mall-commerce-service` directly.

## Verification

Use the package `typecheck` script and focused Vitest coverage for service, controller, and UI behavior when changing this package.

## SDKWork Documentation Contract

Domain: commerce
Capability: pricing
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

- `pnpm --filter @sdkwork/mall-pc-pricing typecheck`

### Owner And Status

Owner and lifecycle status are tracked in `specs/component.spec.json`.
