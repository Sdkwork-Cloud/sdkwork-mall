import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcAdminMarketingRoutes = [
  {
    auth: "required",
    capability: "admin-marketing",
    domain: "commerce",
    id: "admin.mall.marketing",
    packageName: "@sdkwork/mall-pc-admin-marketing",
    path: "/admin/marketing",
    permissionHint: "commerce.promotions.read",
    screen: "marketing",
    surface: "backend-admin",
    title: "营销平台",
    titleKey: "adminMarketing.routes.marketing.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
