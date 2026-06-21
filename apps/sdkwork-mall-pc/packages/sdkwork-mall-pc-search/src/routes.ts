import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcSearchRoutes = [
  {
    auth: "public",
    capability: "search",
    domain: "commerce",
    id: "storefront.mall.search",
    packageName: "@sdkwork/mall-pc-search",
    path: "/search",
    screen: "search",
    surface: "storefront",
    title: "搜索",
    titleKey: "search.routes.search.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
