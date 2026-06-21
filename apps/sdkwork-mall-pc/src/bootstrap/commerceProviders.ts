import { createCommerceRuntime } from "@sdkwork/commerce-runtime";
import {
  configureSdkworkCommerceServiceProvider,
  configureSdkworkCommerceSessionTokenProvider,
  createSdkworkCommerceService,
} from "@sdkwork/commerce-service";
import type { CommerceAppSdkClient, CommerceBackendSdkClient } from "@sdkwork/commerce-sdk-ports";

import type { SdkworkMallPcIamRuntime } from "./iamRuntime";
import type { SdkworkMallPcSdkClientInventory } from "./sdkClients";
import type { SdkworkMallPcRuntimeConfig } from "./environment";

export interface SdkworkMallPcCommerceProviders {
  commerceService: ReturnType<typeof createSdkworkCommerceService>;
}

const APP_API_PREFIX = "/app/v3/api";

export function configureSdkworkMallPcProviders(input: {
  config: SdkworkMallPcRuntimeConfig;
  iamRuntime: SdkworkMallPcIamRuntime;
  sdkClients: SdkworkMallPcSdkClientInventory;
}): SdkworkMallPcCommerceProviders {
  const commerceAppClient = augmentCommerceAppClient(input.sdkClients.commerceAppClient);
  const appClient = {
    commerce: commerceAppClient,
  } as unknown as CommerceAppSdkClient;
  const backendClient = input.sdkClients.commerceBackendClient
    ? ({
        commerce: input.sdkClients.commerceBackendClient,
      } as unknown as CommerceBackendSdkClient)
    : undefined;

  const commerceRuntime = createCommerceRuntime({
    clients: {
      app: appClient,
      ...(backendClient ? { backend: backendClient } : {}),
    },
    config: {
      appApiBaseUrl: input.config.appApiBaseUrl,
      appId: input.config.appKey,
      backendApiBaseUrl: input.config.backendApiBaseUrl,
      deploymentMode: "saas",
      environment: input.config.environment,
    },
  });

  configureSdkworkCommerceServiceProvider(() => commerceRuntime.service);
  configureSdkworkCommerceSessionTokenProvider(() => {
    const snapshot = input.iamRuntime.session.getSnapshot();
    return {
      accessToken: snapshot.accessToken,
      authToken: snapshot.authToken,
      refreshToken: snapshot.refreshToken,
    };
  });

  return {
    commerceService: commerceRuntime.service,
  };
}

function augmentCommerceAppClient(client: SdkworkMallPcSdkClientInventory["commerceAppClient"]): SdkworkMallPcSdkClientInventory["commerceAppClient"] {
  const http = (client as unknown as { http: { patch: <T>(path: string, body?: unknown) => Promise<T> } }).http;
  if (!http || typeof http.patch !== "function" || !client.afterSales?.requests) {
    return client;
  }

  const requests = client.afterSales.requests as unknown as {
    list: (...args: unknown[]) => Promise<unknown>;
    create: (...args: unknown[]) => Promise<unknown>;
    retrieve: (...args: unknown[]) => Promise<unknown>;
    update?: (afterSalesRequestId: string, body?: unknown) => Promise<unknown>;
  };

  if (typeof requests.update === "function") {
    return client;
  }

  const updateFn = async (afterSalesRequestId: string, body?: unknown) => {
    return http.patch(`${APP_API_PREFIX}/after_sales/requests/${encodeURIComponent(afterSalesRequestId)}`, body);
  };

  Object.defineProperty(requests, "update", {
    value: updateFn,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  return client;
}
