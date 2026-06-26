export interface SdkworkSearchRemotePort {
  listCategories(query: Record<string, unknown>): Promise<unknown>;
  listShops(query: Record<string, unknown>): Promise<unknown>;
  listSpus(query: Record<string, unknown>): Promise<unknown>;
}

let searchRemotePort: SdkworkSearchRemotePort | null = null;

export function configureSdkworkSearchRemotePort(port: SdkworkSearchRemotePort | null): void {
  searchRemotePort = port;
}

export function getSdkworkSearchRemotePort(): SdkworkSearchRemotePort {
  if (!searchRemotePort) {
    throw new Error(
      "SDKWork search remote port is not configured. Call configureSdkworkSearchRemotePort() from mall PC bootstrap.",
    );
  }
  return searchRemotePort;
}
