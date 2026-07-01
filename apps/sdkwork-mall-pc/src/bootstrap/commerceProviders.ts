import {
  configureSdkworkCommerceServiceProvider,
  configureSdkworkCommerceSessionTokenProvider,
  createSdkworkCommerceService,
} from "@sdkwork/mall-commerce-service";
import type { CommerceAppSdkClient, CommerceBackendSdkClient } from "@sdkwork/mall-commerce-sdk-ports";

import { configureSdkworkMallPcCommerceBuyerHubRemotePort } from "./commerce-buyer-hub-remote";
import { configureSdkworkMallPcDomainServiceProviders } from "./domain-service-providers";
import { configureSdkworkMallPcBillingUsageRecordsLoader } from "./billing-usage-records";
import { configureSdkworkMallPcInvoiceRemotePort } from "./invoice-commerce-remote";
import { configureSdkworkMallPcAdminCommerceRemotePort } from "./admin-commerce-remote";
import { configureSdkworkMallPcAddressRemotePort } from "./address-commerce-remote";
import { configureSdkworkMallPcBuyerCommerceRemotePorts } from "./buyer-commerce-remote";
import { configureSdkworkMallPcCartCommerceRemotePort } from "./cart-commerce-remote";
import { configureSdkworkMallPcCmsCommerceRemotePort } from "./cms-commerce-remote";
import { configureSdkworkMallPcMerchantCommerceRemotePort } from "./merchant-commerce-remote";
import { configureSdkworkMallPcStorefrontCommerceRemotePorts } from "./storefront-commerce-remote";
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

  const commerceService = createSdkworkCommerceService({
    appClient,
    backendClient,
  });

  configureSdkworkCommerceServiceProvider(() => commerceService);
  configureSdkworkCommerceSessionTokenProvider(() => {
    const snapshot = input.iamRuntime.session.getSnapshot();
    return {
      accessToken: snapshot.accessToken,
      authToken: snapshot.authToken,
      refreshToken: snapshot.refreshToken,
    };
  });

  configureSdkworkMallPcDomainServiceProviders(
    () => commerceAppClient as CommerceAppSdkClient["commerce"],
    () => {
      const snapshot = input.iamRuntime.session.getSnapshot();
      return {
        accessToken: snapshot.accessToken,
        authToken: snapshot.authToken,
        refreshToken: snapshot.refreshToken,
      };
    },
  );

  configureSdkworkMallPcBillingUsageRecordsLoader();
  configureSdkworkMallPcInvoiceRemotePort();
  configureSdkworkMallPcAddressRemotePort();
  configureSdkworkMallPcStorefrontCommerceRemotePorts();
  configureSdkworkMallPcBuyerCommerceRemotePorts();
  configureSdkworkMallPcCommerceBuyerHubRemotePort();
  configureSdkworkMallPcCartCommerceRemotePort();
  configureSdkworkMallPcMerchantCommerceRemotePort();
  configureSdkworkMallPcAdminCommerceRemotePort();
  configureSdkworkMallPcCmsCommerceRemotePort();

  return {
    commerceService,
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
