import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const SdkworkMallPcCheckoutRoutes = [
  {
    auth: "required",
    capability: "checkout",
    domain: "commerce",
    id: "app.commerce.checkout.dashboard",
    packageName: "@sdkwork/mall-pc-checkout",
    path: "/app/checkout",
    screen: "dashboard",
    surface: "buyer",
    title: "Checkout",
    titleKey: "checkout.routes.dashboard.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
