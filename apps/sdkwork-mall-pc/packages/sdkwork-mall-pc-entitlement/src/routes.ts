import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const SdkworkMallPcEntitlementRoutes = [
  {
    auth: "required",
    capability: "entitlement",
    domain: "commerce",
    id: "app.commerce.entitlement.dashboard",
    packageName: "@sdkwork/mall-pc-entitlement",
    path: "/app/entitlement",
    screen: "dashboard",
    surface: "buyer",
    title: "Entitlements",
    titleKey: "entitlement.routes.dashboard.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
