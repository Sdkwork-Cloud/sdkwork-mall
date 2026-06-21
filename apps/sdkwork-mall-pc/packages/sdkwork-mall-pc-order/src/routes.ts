import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcOrderRoutes = [
  {
    auth: "required",
    capability: "order",
    domain: "commerce",
    id: "buyer.mall.orders",
    packageName: "@sdkwork/mall-pc-order",
    path: "/buyer/orders",
    screen: "dashboard",
    surface: "buyer",
    title: "我的订单",
    titleKey: "order.routes.dashboard.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
