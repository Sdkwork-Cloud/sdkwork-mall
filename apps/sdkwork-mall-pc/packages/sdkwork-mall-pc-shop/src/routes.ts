import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcShopRoutes = [
  {
    auth: "public",
    capability: "shop",
    domain: "commerce",
    id: "storefront.mall.shop",
    packageName: "@sdkwork/mall-pc-shop",
    path: "/shop/:shopId",
    screen: "shop-home",
    surface: "storefront",
    title: "店铺首页",
    titleKey: "shop.routes.shopHome.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
