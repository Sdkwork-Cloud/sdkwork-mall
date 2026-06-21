export type SdkworkMallPcSdkSurface = "app" | "open";

export type SdkworkMallPcCredentialScope = "api-key-provider" | "global-session";

export type SdkworkMallPcRouteSurface =
  | "storefront"
  | "buyer"
  | "merchant"
  | "backend-admin";

export interface SdkworkMallPcRouteContribution {
  readonly auth: "public" | "required";
  readonly capability: string;
  readonly domain: "commerce";
  readonly id: string;
  readonly packageName: string;
  readonly path: string;
  readonly permissionHint?: string;
  readonly screen: string;
  readonly surface: SdkworkMallPcRouteSurface;
  readonly title: string;
  readonly titleKey: string;
}

export interface SdkworkMallPcSdkFamilyInventoryItem {
  readonly authority: string;
  readonly family: string;
  readonly generationInputSpec: string;
  readonly generatedPackageName?: string;
  readonly surface: SdkworkMallPcSdkSurface;
  readonly tokenManagerScope: SdkworkMallPcCredentialScope;
}

export const sdkworkMallPcRuntimeIdentity = {
  appKey: "sdkwork-mall-pc",
  architecture: "pc-react",
  domain: "commerce",
  runtimeFamily: "web",
} as const;

export const sdkworkMallPcAppSdkFamilies = [
  {
    authority: "sdkwork-commerce-app-api",
    family: "sdkwork-commerce-app-sdk",
    generationInputSpec: "apis/app-api/commerce/commerce-app-api.openapi.json",
    generatedPackageName: "sdkwork-commerce-app-sdk-generated-typescript",
    surface: "app",
    tokenManagerScope: "global-session",
  },
  {
    authority: "sdkwork-appbase-app-api",
    family: "sdkwork-appbase-app-sdk",
    generationInputSpec: "../sdkwork-appbase/sdks/sdkwork-appbase-app-sdk/openapi/sdkwork-appbase-app-api.openapi.yaml",
    generatedPackageName: "@sdkwork/appbase-app-sdk",
    surface: "app",
    tokenManagerScope: "global-session",
  },
  {
    authority: "sdkwork-commerce-open-api",
    family: "sdkwork-commerce-sdk",
    generationInputSpec: "apis/open-api/commerce/commerce-open-api.openapi.json",
    surface: "open",
    tokenManagerScope: "api-key-provider",
  },
] as const satisfies readonly SdkworkMallPcSdkFamilyInventoryItem[];

export function listSdkworkMallPcAppSdkFamilies(): readonly SdkworkMallPcSdkFamilyInventoryItem[] {
  return sdkworkMallPcAppSdkFamilies;
}

export function createSdkworkMallPcRouteRegistry(
  ...routeGroups: readonly (readonly SdkworkMallPcRouteContribution[])[]
): readonly SdkworkMallPcRouteContribution[] {
  return routeGroups.flat();
}
