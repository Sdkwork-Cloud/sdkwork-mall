import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";
import {
  listMallAdminRoleNames,
  listMallAdminRolePermissions,
  matchesMallAdminPermissionHint,
  readSelectedMallAdminRole,
  writeSelectedMallAdminRole,
} from "@sdkwork/mall-pc-admin-permissions/role-matrix";

import type { SdkworkMallPcRuntime } from "./bootstrap/runtime";
import { hasSdkworkMallPcAuthenticatedSession } from "./authGateLogic";

export {
  listMallAdminRoleNames as listSdkworkMallPcAdminRoles,
  writeSelectedMallAdminRole as setSdkworkMallPcAdminRole,
} from "@sdkwork/mall-pc-admin-permissions/role-matrix";

export function hasSdkworkMallPcBackendAdminAccess(runtime: SdkworkMallPcRuntime): boolean {
  if (!runtime.config.backendApiBaseUrl || !runtime.sdkClients.commerceBackendClient) {
    return false;
  }
  return hasSdkworkMallPcAuthenticatedSession(runtime.session.getSnapshot());
}

export function hasSdkworkMallPcRoutePermission(
  runtime: SdkworkMallPcRuntime,
  route: Pick<SdkworkMallPcRouteContribution, "permissionHint" | "surface">,
): boolean {
  if (route.surface !== "backend-admin") {
    return true;
  }

  if (!hasSdkworkMallPcBackendAdminAccess(runtime)) {
    return false;
  }

  if (!route.permissionHint) {
    return true;
  }

  const granted = listMallAdminRolePermissions(readSelectedMallAdminRole());
  return matchesMallAdminPermissionHint(granted, route.permissionHint);
}
