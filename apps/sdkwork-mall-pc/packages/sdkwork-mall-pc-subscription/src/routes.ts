import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const SdkworkMallPcSubscriptionRoutes = [
  {
    auth: "required",
    capability: "subscription",
    domain: "commerce",
    id: "app.commerce.subscription.dashboard",
    packageName: "@sdkwork/mall-pc-subscription",
    path: "/app/subscription",
    screen: "dashboard",
    surface: "buyer",
    title: "Subscription",
    titleKey: "subscription.routes.dashboard.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
