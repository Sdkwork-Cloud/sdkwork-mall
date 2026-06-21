import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcAfterSalesRoutes = [
  {
    auth: "required",
    capability: "after-sales",
    domain: "commerce",
    id: "buyer.mall.after-sales",
    packageName: "@sdkwork/mall-pc-after-sales",
    path: "/buyer/after-sales",
    screen: "after-sales",
    surface: "buyer",
    title: "售后中心",
    titleKey: "afterSales.routes.afterSales.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
