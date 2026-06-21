import {
  SdkworkMallPcAdminRuntimeBoundary,
  type SdkworkMallPcAdminSurface,
} from "@sdkwork/mall-pc-admin-core";

export type { SdkworkMallPcAdminSurface } from "@sdkwork/mall-pc-admin-core";

export interface SdkworkMallPcAdminRouteContribution {
  readonly id: string;
  readonly path: string;
  readonly permissionHint?: string;
  readonly surface: SdkworkMallPcAdminSurface;
  readonly title: string;
}

export const SdkworkMallPcAdminShell = {
  navigationLabel: "Mall Admin",
  routePrefix: SdkworkMallPcAdminRuntimeBoundary.routePrefix,
  surface: SdkworkMallPcAdminRuntimeBoundary.surface,
} as const;

export function isSdkworkMallPcBackendAdminRoute(route: { readonly surface: string }): boolean {
  return route.surface === SdkworkMallPcAdminRuntimeBoundary.surface;
}

export function getSdkworkMallPcBackendAdminRoutes<T extends { readonly surface: string }>(
  routes: readonly T[],
): readonly T[] {
  return routes.filter(isSdkworkMallPcBackendAdminRoute);
}
