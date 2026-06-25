import { listSdkworkMallPcBackendAdminSdkFamilies } from "@sdkwork/mall-pc-admin-core/composition";
import { listSdkworkMallPcAppSdkFamilies } from "@sdkwork/mall-pc-core/composition";
import type { SdkworkAppClient } from "sdkwork-commerce-app-sdk-generated-typescript";
import type { SdkworkBackendClient } from "sdkwork-commerce-backend-sdk-generated-typescript";

import type { SdkworkMallPcRuntimeConfig } from "./environment";

export interface SdkworkMallPcSdkClientInventory {
  appApiBaseUrl: string;
  backendApiBaseUrl?: string;
  commerceAppClient: SdkworkAppClient & { setTokenManager(manager: unknown): unknown };
  commerceBackendClient?: SdkworkBackendClient & { setTokenManager(manager: unknown): unknown };
  sdkFamilies: {
    app: string[];
    backendAdmin: string[];
  };
}

export function listSdkworkMallPcRegisteredSdkFamilies(
  config: SdkworkMallPcRuntimeConfig,
): SdkworkMallPcSdkClientInventory["sdkFamilies"] {
  void config;
  return {
    app: listSdkworkMallPcAppSdkFamilies()
      .filter((sdkFamily) => sdkFamily.surface === "app")
      .map((sdkFamily) => sdkFamily.family),
    backendAdmin: listSdkworkMallPcBackendAdminSdkFamilies().map((sdkFamily) => sdkFamily.family),
  };
}
