import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcAdminPermissionsRoutes = [
  {
    auth: "required",
    capability: "admin-permissions",
    domain: "commerce",
    id: "admin.mall.permissions",
    packageName: "@sdkwork/mall-pc-admin-permissions",
    path: "/admin/permissions",
    permissionHint: "commerce.permissions.read",
    screen: "permissions",
    surface: "backend-admin",
    title: "权限管理",
    titleKey: "adminPermissions.routes.permissions.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
