export interface SdkworkMerchantRemotePort {
  afterSales: {
    requests: {
      list(query: Record<string, unknown>): Promise<unknown>;
      retrieve(afterSalesRequestId: string): Promise<unknown>;
    };
  };
  promotions: {
    offers: {
      list(query: Record<string, unknown>): Promise<unknown>;
    };
  };
  shops: {
    current: {
      applications: {
        create(body: Record<string, unknown>): Promise<unknown>;
        list(query: Record<string, unknown>): Promise<unknown>;
      };
      brandAuthorizations: {
        list(query: Record<string, unknown>): Promise<unknown>;
      };
      businessHours: {
        retrieve(query: Record<string, unknown>): Promise<unknown>;
      };
      categoryBindings: {
        list(query: Record<string, unknown>): Promise<unknown>;
      };
      channels: {
        list(query: Record<string, unknown>): Promise<unknown>;
        update(channelId: string, body: Record<string, unknown>): Promise<unknown>;
      };
      customerServices: {
        list(query: Record<string, unknown>): Promise<unknown>;
      };
      dashboard: {
        retrieve(query: Record<string, unknown>): Promise<unknown>;
      };
      depositAccount: {
        retrieve(query: Record<string, unknown>): Promise<unknown>;
      };
      fulfillmentProfile: {
        retrieve(query: Record<string, unknown>): Promise<unknown>;
      };
      inventory: {
        stocks: {
          adjustments: {
            create(stockId: string, body: Record<string, unknown>): Promise<unknown>;
          };
          list(query: Record<string, unknown>): Promise<unknown>;
        };
      };
      orders: {
        fulfillments: {
          create(orderId: string, body: Record<string, unknown>): Promise<unknown>;
        };
        list(query: Record<string, unknown>): Promise<unknown>;
        retrieve(orderId: string): Promise<unknown>;
      };
      policies: {
        list(query: Record<string, unknown>): Promise<unknown>;
        update(policyId: string, body: Record<string, unknown>): Promise<unknown>;
      };
      products: {
        create(body: Record<string, unknown>): Promise<unknown>;
        list(query: Record<string, unknown>): Promise<unknown>;
        publish(productId: string, body: Record<string, unknown>): Promise<unknown>;
        unpublish(productId: string, body: Record<string, unknown>): Promise<unknown>;
      };
      qualifications: {
        list(query: Record<string, unknown>): Promise<unknown>;
      };
      readiness: {
        retrieve(query: Record<string, unknown>): Promise<unknown>;
      };
      retrieve(query: Record<string, unknown>): Promise<unknown>;
      returnAddresses: {
        list(query: Record<string, unknown>): Promise<unknown>;
      };
      settlementProfile: {
        retrieve(query: Record<string, unknown>): Promise<unknown>;
      };
      settlements: {
        list(query: Record<string, unknown>): Promise<unknown>;
      };
      shippingTemplates: {
        list(query: Record<string, unknown>): Promise<unknown>;
      };
    };
  };
}

let merchantRemotePort: SdkworkMerchantRemotePort | null = null;

export function configureSdkworkMerchantRemotePort(port: SdkworkMerchantRemotePort | null): void {
  merchantRemotePort = port;
}

export function getSdkworkMerchantRemotePort(): SdkworkMerchantRemotePort {
  if (!merchantRemotePort) {
    throw new Error(
      "SDKWork merchant remote port is not configured. Call configureSdkworkMerchantRemotePort() from mall PC bootstrap.",
    );
  }
  return merchantRemotePort;
}
