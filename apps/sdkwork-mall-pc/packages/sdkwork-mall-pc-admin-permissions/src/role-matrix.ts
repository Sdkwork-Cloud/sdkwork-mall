export const mallAdminRolePermissions = {
  超级管理员: ["commerce.*"],
  商家运营: ["commerce.shops.read", "commerce.shops.review", "commerce.products.read", "commerce.shops.manage"],
  订单督导: ["commerce.orders.read", "commerce.afterSales.read"],
  营销运营: ["commerce.promotions.read", "commerce.promotions.write", "commerce.cms.write"],
  财务: ["commerce.settlement.read", "commerce.reports.read"],
  风控分析: ["commerce.risk.read", "commerce.audit.read"],
} as const satisfies Record<string, readonly string[]>;

export const MALL_ADMIN_ROLE_STORAGE_KEY = "sdkwork-mall-pc-admin-role";

export function listMallAdminRoleNames(): readonly string[] {
  return Object.keys(mallAdminRolePermissions);
}

export function readSelectedMallAdminRole(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(MALL_ADMIN_ROLE_STORAGE_KEY);
}

export function writeSelectedMallAdminRole(roleName: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(MALL_ADMIN_ROLE_STORAGE_KEY, roleName);
}

export function listMallAdminRolePermissions(roleName: string | null): readonly string[] {
  if (roleName && roleName in mallAdminRolePermissions) {
    return mallAdminRolePermissions[roleName as keyof typeof mallAdminRolePermissions];
  }
  return mallAdminRolePermissions.超级管理员;
}

export function matchesMallAdminPermissionHint(
  granted: readonly string[],
  permissionHint: string,
): boolean {
  return granted.some((permission) => {
    if (permission === permissionHint) {
      return true;
    }
    if (permission.endsWith(".*")) {
      return permissionHint.startsWith(permission.slice(0, -1));
    }
    return false;
  });
}
