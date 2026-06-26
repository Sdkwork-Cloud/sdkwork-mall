export interface SdkworkHomeRemotePort {
  listCategories(query: Record<string, unknown>): Promise<unknown>;
  listShops(query: Record<string, unknown>): Promise<unknown>;
  listSpus(query: Record<string, unknown>): Promise<unknown>;
}

let homeRemotePort: SdkworkHomeRemotePort | null = null;

export function configureSdkworkHomeRemotePort(port: SdkworkHomeRemotePort | null): void {
  homeRemotePort = port;
}

export function getSdkworkHomeRemotePort(): SdkworkHomeRemotePort {
  if (!homeRemotePort) {
    throw new Error(
      "SDKWork home remote port is not configured. Call configureSdkworkHomeRemotePort() from mall PC bootstrap.",
    );
  }
  return homeRemotePort;
}
