export interface SdkworkMallPcNavigationRoute {
  readonly id: string;
  readonly path: string;
  readonly surface: string;
  readonly title: string;
}

export const sdkworkMallPcBrand = {
  mark: "商城",
  name: "SDKWork 商城",
} as const;

export { sdkworkMallPcCategoryNav } from "./category-nav";

export function getSdkworkMallPcStorefrontRoutes<T extends SdkworkMallPcNavigationRoute>(
  routes: readonly T[],
): readonly T[] {
  return routes.filter((route) => route.surface === "storefront");
}

export function getSdkworkMallPcBuyerRoutes<T extends SdkworkMallPcNavigationRoute>(
  routes: readonly T[],
): readonly T[] {
  return routes.filter((route) => route.surface === "buyer");
}

export function getSdkworkMallPcMerchantRoutes<T extends SdkworkMallPcNavigationRoute>(
  routes: readonly T[],
): readonly T[] {
  return routes.filter((route) => route.surface === "merchant");
}

export function getSdkworkMallPcBackendAdminRoutes<T extends SdkworkMallPcNavigationRoute>(
  routes: readonly T[],
): readonly T[] {
  return routes.filter((route) => route.surface === "backend-admin");
}

/** @deprecated Use getSdkworkMallPcBuyerRoutes */
export function getSdkworkMallPcAppRoutes<T extends SdkworkMallPcNavigationRoute>(
  routes: readonly T[],
): readonly T[] {
  return getSdkworkMallPcBuyerRoutes(routes);
}
