import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const SdkworkMallPcPricingRoutes = [
  {
    auth: "required",
    capability: "pricing",
    domain: "commerce",
    id: "app.commerce.pricing.dashboard",
    packageName: "@sdkwork/mall-pc-pricing",
    path: "/app/pricing",
    screen: "dashboard",
    surface: "buyer",
    title: "Pricing",
    titleKey: "pricing.routes.dashboard.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
