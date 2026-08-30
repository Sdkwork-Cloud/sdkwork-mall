export type SdkworkMallPcAdminSurface = "backend-admin";

export interface SdkworkMallPcBackendAdminSdkFamilyInventoryItem {
  readonly authority: string;
  readonly family: string;
  readonly generationInputSpec: string;
  readonly generatedPackageName: string;
  readonly surface: SdkworkMallPcAdminSurface;
  readonly tokenManagerScope: "global-session";
}

export const SdkworkMallPcAdminRuntimeBoundary = {
  permissionScope: "operator",
  routePrefix: "/admin",
  surface: "backend-admin",
} as const;

export const SdkworkMallPcBackendAdminSdkFamilies = [
  {
    authority: "sdkwork-commerce-backend-api",
    family: "sdkwork-commerce-backend-sdk",
    generationInputSpec: "apis/backend-api/commerce/commerce-backend-api.openapi.json",
    generatedPackageName: "@sdkwork/cloudrouter-backend-sdk",
    surface: "backend-admin",
    tokenManagerScope: "global-session",
  },
  {
    authority: "sdkwork-iam-backend-api",
    family: "sdkwork-iam-backend-sdk",
    generationInputSpec: "../sdkwork-iam/sdks/sdkwork-iam-backend-sdk/openapi/sdkwork-iam-backend-api.openapi.yaml",
    generatedPackageName: "@sdkwork/iam-backend-sdk",
    surface: "backend-admin",
    tokenManagerScope: "global-session",
  },
] as const satisfies readonly SdkworkMallPcBackendAdminSdkFamilyInventoryItem[];

export function listSdkworkMallPcBackendAdminSdkFamilies(): readonly SdkworkMallPcBackendAdminSdkFamilyInventoryItem[] {
  return SdkworkMallPcBackendAdminSdkFamilies;
}

export {
  configureSdkworkAdminRemotePort,
  getSdkworkAdminRemotePort,
  type SdkworkAdminCommerceNamespace,
  type SdkworkAdminMembershipsNamespace,
  type SdkworkAdminRemotePort,
} from "./admin-remote-port";
