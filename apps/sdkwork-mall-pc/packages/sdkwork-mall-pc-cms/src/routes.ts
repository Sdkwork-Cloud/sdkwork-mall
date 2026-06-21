import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcCmsRoutes = [
  {
    auth: "required",
    capability: "admin-cms",
    domain: "commerce",
    id: "admin.mall.cms",
    packageName: "@sdkwork/mall-pc-cms",
    path: "/admin/cms",
    permissionHint: "commerce.cms.write",
    screen: "cms",
    surface: "backend-admin",
    title: "内容 CMS",
    titleKey: "cms.routes.cms.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
