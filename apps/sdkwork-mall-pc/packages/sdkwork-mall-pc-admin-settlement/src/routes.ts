import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcAdminSettlementRoutes = [
  {
    auth: "required",
    capability: "admin-settlement",
    domain: "commerce",
    id: "admin.mall.settlement",
    packageName: "@sdkwork/mall-pc-admin-settlement",
    path: "/admin/settlement",
    permissionHint: "commerce.settlement.read",
    screen: "settlement",
    surface: "backend-admin",
    title: "财务结算",
    titleKey: "adminSettlement.routes.settlement.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
