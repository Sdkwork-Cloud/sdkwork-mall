# @sdkwork/mall-pc-subscription

## Purpose

Subscription checkout, coupon application, and premium membership selection.

## Placement

- Architecture: `pc-react`
- Domain: `commerce`
- Capability: `subscription`
- Status: `ready`

## Depends on

- `@sdkwork/ui-pc-react` for shared UI primitives and patterns
- `@sdkwork/promotion-service` for checkout coupon selection
- `@sdkwork/mall-pc-payment` for payment method selection
- `@sdkwork/mall-pc-membership` for membership purchase, renew, and upgrade mutations

## Ownership

This package is implemented as an independent SDKWork commerce capability. It owns its public React/service contracts and consumes commerce data through injected service boundaries with wallet and membership ownership kept separate.

## Runtime boundary

All remote access goes through `@sdkwork/promotion-service` or through sibling mall packages that compose the same T1 domain boundaries. Generated SDK clients remain behind the domain service contract.

## Verification

Use the package `typecheck` script and focused Vitest coverage for service, controller, and UI behavior when changing this package.

## SDKWork Documentation Contract

Domain: commerce
Capability: subscription
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

- `pnpm --filter @sdkwork/mall-pc-subscription typecheck`

### Owner And Status

Owner and lifecycle status are tracked in `specs/component.spec.json`.
