import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcAdminRiskRoutes = [
  {
    auth: "required",
    capability: "admin-risk",
    domain: "commerce",
    id: "admin.mall.risk",
    packageName: "@sdkwork/mall-pc-admin-risk",
    path: "/admin/risk",
    permissionHint: "commerce.risk.read",
    screen: "risk",
    surface: "backend-admin",
    title: "风控中心",
    titleKey: "adminRisk.routes.risk.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
