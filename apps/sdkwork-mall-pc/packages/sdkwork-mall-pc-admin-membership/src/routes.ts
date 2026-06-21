import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcAdminMembershipRoutes = [
  {
    auth: "required",
    capability: "membership-admin",
    domain: "commerce",
    id: "admin.commerce.membership-admin.dashboard",
    packageName: "@sdkwork/mall-pc-admin-membership",
    path: "/admin/membership",
    permissionHint: "commerce.memberships.read",
    screen: "dashboard",
    surface: "backend-admin",
    title: "会员运营",
    titleKey: "admin.commerce.membership.routes.dashboard.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
