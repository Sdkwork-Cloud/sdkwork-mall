export interface SdkworkActivityRemotePort {
  listPromotionOffers(query: Record<string, unknown>): Promise<unknown>;
  retrievePromotionOffer(query: Record<string, unknown>): Promise<unknown>;
}

let activityRemotePort: SdkworkActivityRemotePort | null = null;

export function configureSdkworkActivityRemotePort(port: SdkworkActivityRemotePort | null): void {
  activityRemotePort = port;
}

export function getSdkworkActivityRemotePort(): SdkworkActivityRemotePort {
  if (!activityRemotePort) {
    throw new Error(
      "SDKWork activity remote port is not configured. Call configureSdkworkActivityRemotePort() from mall PC bootstrap.",
    );
  }
  return activityRemotePort;
}
