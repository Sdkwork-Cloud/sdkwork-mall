import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcHomeRoutes = [
  {
    auth: "public",
    capability: "home",
    domain: "commerce",
    id: "storefront.mall.home",
    packageName: "@sdkwork/mall-pc-home",
    path: "/",
    screen: "home",
    surface: "storefront",
    title: "首页",
    titleKey: "home.routes.home.title",
  },
  {
    auth: "public",
    capability: "help",
    domain: "commerce",
    id: "storefront.mall.help",
    packageName: "@sdkwork/mall-pc-home",
    path: "/help",
    screen: "help",
    surface: "storefront",
    title: "帮助中心",
    titleKey: "home.routes.help.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
