import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcMembershipRoutes = [
  {
    auth: "required",
    capability: "membership",
    domain: "commerce",
    id: "buyer.mall.membership",
    packageName: "@sdkwork/mall-pc-membership",
    path: "/buyer/membership",
    screen: "dashboard",
    surface: "buyer",
    title: "会员中心",
    titleKey: "membership.routes.dashboard.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
