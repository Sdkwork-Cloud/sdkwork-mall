# @sdkwork/mall-pc-commerce

## Purpose

Commerce workflows, offers, and pricing-aware capability composition.

## Placement

- Architecture: `pc-react`
- Domain: `commerce`
- Capability: `commerce`
- Status: `ready`

## Depends on

- `@sdkwork/account-service` for authenticated session checks and hub payment dashboard composition
- `@sdkwork/payment-service` for buyer hub and payment dashboard response normalization
- `@sdkwork/mall-pc-coupon`, `@sdkwork/mall-pc-invoice`, `@sdkwork/mall-pc-membership`, `@sdkwork/mall-pc-order`, `@sdkwork/mall-pc-points`, and `@sdkwork/mall-pc-wallet` for composed commerce hub surfaces
- `@sdkwork/mall-pc-core` for buyer route composition
- `@sdkwork/ui-pc-react` for shared UI primitives and patterns

## Ownership

This package is implemented as an independent SDKWork commerce capability. It owns its public React/service contracts and consumes commerce data through injected service boundaries with wallet and membership ownership kept separate.

## Runtime boundary

This package composes sibling mall domain packages and does not call `@sdkwork/commerce-service` directly.

## Verification

Use the package `typecheck` script and focused Vitest coverage for service, controller, and UI behavior when changing this package.

## SDKWork Documentation Contract

Domain: commerce
Capability: commerce
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

- `pnpm --filter @sdkwork/mall-pc-commerce typecheck`

### Owner And Status

Owner and lifecycle status are tracked in `specs/component.spec.json`.
