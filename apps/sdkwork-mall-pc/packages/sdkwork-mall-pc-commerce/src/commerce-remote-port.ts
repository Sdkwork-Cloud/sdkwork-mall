export interface SdkworkCommerceRemotePort {
  accounts: {
    current: {
      summary: {
        retrieve(query: Record<string, unknown>): Promise<unknown>;
      };
    };
  };
  afterSales: {
    requests: {
      list(query: Record<string, unknown>): Promise<unknown>;
    };
  };
  orders: {
    list(query: Record<string, unknown>): Promise<unknown>;
    statistics: {
      retrieve(query?: Record<string, unknown>): Promise<unknown>;
    };
  };
  payments: {
    methods: {
      list(query: Record<string, unknown>): Promise<unknown>;
    };
    records: {
      list(query: Record<string, unknown>): Promise<unknown>;
    };
    statistics: {
      retrieve(query?: Record<string, unknown>): Promise<unknown>;
    };
  };
  promotions: {
    offers: {
      list(query: Record<string, unknown>): Promise<unknown>;
    };
    userCoupons: {
      wallet: {
        list(query: Record<string, unknown>): Promise<unknown>;
      };
    };
  };
}

let commerceRemotePort: SdkworkCommerceRemotePort | null = null;

export function configureSdkworkCommerceRemotePort(port: SdkworkCommerceRemotePort | null): void {
  commerceRemotePort = port;
}

export function getSdkworkCommerceRemotePort(): SdkworkCommerceRemotePort {
  if (!commerceRemotePort) {
    throw new Error(
      "SDKWork commerce remote port is not configured. Call configureSdkworkCommerceRemotePort() from mall PC bootstrap.",
    );
  }
  return commerceRemotePort;
}
