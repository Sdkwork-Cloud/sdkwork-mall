# @sdkwork/mall-pc-core

Shared Mall PC runtime metadata and app-side SDK family inventory.

This package is infrastructure only. It may describe app/open SDK families, runtime identity, TokenManager binding expectations, and host adapter contracts. It must not own business pages, business services, internal admin SDK wrappers, backend base URL resolvers, or generated SDK output.

## Standards

- `../../../../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`
- `../../../../../../sdkwork-specs/APP_PC_ARCHITECTURE_SPEC.md`
- `../../../../../../sdkwork-specs/TYPESCRIPT_CODE_SPEC.md`
- `../../../../../../sdkwork-specs/COMPONENT_SPEC.md`

## Verification

```bash
pnpm --filter @sdkwork/mall-pc-core typecheck
node --test sdks/test/verify-commerce-standard-architecture.test.mjs
```
