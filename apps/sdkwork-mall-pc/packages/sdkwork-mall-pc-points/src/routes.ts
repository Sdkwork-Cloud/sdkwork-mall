import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcPointsRoutes = [
  {
    auth: "required",
    capability: "points",
    domain: "commerce",
    id: "buyer.mall.points",
    packageName: "@sdkwork/mall-pc-points",
    path: "/buyer/points",
    screen: "dashboard",
    surface: "buyer",
    title: "积分中心",
    titleKey: "points.routes.dashboard.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
