import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const SdkworkMallPcOfferRoutes = [
  {
    auth: "required",
    capability: "offer",
    domain: "commerce",
    id: "app.commerce.offer.dashboard",
    packageName: "@sdkwork/mall-pc-offer",
    path: "/app/offer",
    screen: "dashboard",
    surface: "buyer",
    title: "Offers",
    titleKey: "offer.routes.dashboard.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
