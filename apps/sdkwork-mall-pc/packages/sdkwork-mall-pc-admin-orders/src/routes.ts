import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcAdminOrdersRoutes = [
  {
    auth: "required",
    capability: "admin-orders",
    domain: "commerce",
    id: "admin.mall.orders",
    packageName: "@sdkwork/mall-pc-admin-orders",
    path: "/admin/orders",
    permissionHint: "commerce.orders.read",
    screen: "orders",
    surface: "backend-admin",
    title: "订单监管",
    titleKey: "adminOrders.routes.orders.title",
  },
  {
    auth: "required",
    capability: "admin-after-sales",
    domain: "commerce",
    id: "admin.mall.after-sales",
    packageName: "@sdkwork/mall-pc-admin-orders",
    path: "/admin/after-sales",
    permissionHint: "commerce.afterSales.read",
    screen: "after-sales",
    surface: "backend-admin",
    title: "售后监管",
    titleKey: "adminOrders.routes.afterSales.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
