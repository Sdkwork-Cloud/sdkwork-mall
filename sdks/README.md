# Mall commerce SDK families

Mall-owned generated transport SDKs for the federated commerce app and backend API surfaces.

| SDK family | Generated package | Authority |
| --- | --- | --- |
| `sdkwork-commerce-app-sdk` | `sdkwork-commerce-app-sdk-generated-typescript` | Mall repository `sdks/sdkwork-commerce-app-sdk/` |
| `sdkwork-commerce-backend-sdk` | `sdkwork-commerce-backend-sdk-generated-typescript` | Mall repository `sdks/sdkwork-commerce-backend-sdk/` |

Regenerate with the SDKWork generator when OpenAPI authorities move into per-T1 repositories. Until that cutover completes, keep generated output in this repository and consume it through `@sdkwork/mall-commerce-service`.

Materialize archived transport output after a clean checkout:

```bash
node tools/materialize-commerce-sdks.mjs
```
