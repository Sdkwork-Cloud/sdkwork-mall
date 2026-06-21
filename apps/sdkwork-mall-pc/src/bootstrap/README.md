# Bootstrap

This directory is the app composition boundary for `sdkwork-mall-pc`.

Allowed content: environment resolution, runtime setup, SDK client construction, IAM runtime wiring, route assembly, providers, and host adapter registration. SDK family inventory comes from `@sdkwork/mall-pc-core` and `@sdkwork/mall-pc-admin-core`; backend-admin route surface types come from `@sdkwork/mall-pc-admin-shell`.

Forbidden content: business pages, long business services, raw HTTP SDK replacements, generated SDK edits, or secrets.
