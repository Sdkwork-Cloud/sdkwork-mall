import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const SdkworkMallPcBillingRoutes = [
  {
    auth: "required",
    capability: "billing",
    domain: "commerce",
    id: "app.commerce.billing.dashboard",
    packageName: "@sdkwork/mall-pc-billing",
    path: "/app/billing",
    screen: "dashboard",
    surface: "buyer",
    title: "Billing",
    titleKey: "billing.routes.dashboard.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
