# sdkwork-mall component contract

Application repository for Mall PC. Backend commerce APIs, database lifecycle, and `sdkwork-web-framework` integration are owned by individual T1 capability repositories (`sdkwork-shop`, `sdkwork-order`, `sdkwork-payment`, `sdkwork-merchandise`, etc.). The `sdkwork-commerce` monolith has been dissolved per `../sdkwork-specs/MIGRATION_SPEC.md` §8.

Transitional TypeScript packages and generated SDKs are consumed from the vendored snapshot at `../sdkwork-clawrouter/vendor/sdkwork-commerce/` until per-T1 SDK families fully replace the remaining surfaces.

See `apps/sdkwork-mall-pc/specs/component.spec.json` for the application component contract.
