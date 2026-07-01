# SDKWork Mall Specs

Application repository for Mall PC. Backend commerce APIs, database lifecycle, and `sdkwork-web-framework` integration are owned by individual T1 capability repositories (`sdkwork-shop`, `sdkwork-order`, `sdkwork-payment`, `sdkwork-merchandise`, `sdkwork-membership`, `sdkwork-promotion`, `sdkwork-account`).

Mall-owned generated commerce transport SDKs live under `sdks/`. Federated storefront and admin remote ports use `@sdkwork/mall-commerce-service` with mall-local SDK families. Migrated PC packages consume T1 domain services (`@sdkwork/account-service`, `@sdkwork/order-service`, …).

Authority: `../sdkwork-specs/README.md`, `../sdkwork-specs/MIGRATION_SPEC.md` section 8.
