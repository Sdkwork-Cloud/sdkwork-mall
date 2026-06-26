export interface SdkworkShopRemotePort {
  listShops(query: Record<string, unknown>): Promise<unknown>;
  retrieveShop(query: Record<string, unknown>): Promise<unknown>;
}

let shopRemotePort: SdkworkShopRemotePort | null = null;

export function configureSdkworkShopRemotePort(port: SdkworkShopRemotePort | null): void {
  shopRemotePort = port;
}

export function getSdkworkShopRemotePort(): SdkworkShopRemotePort {
  if (!shopRemotePort) {
    throw new Error(
      "SDKWork shop remote port is not configured. Call configureSdkworkShopRemotePort() from mall PC bootstrap.",
    );
  }
  return shopRemotePort;
}
