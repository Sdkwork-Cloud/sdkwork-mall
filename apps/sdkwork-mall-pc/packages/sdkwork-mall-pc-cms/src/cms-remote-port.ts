export interface SdkworkCmsRemotePort {
  createAdminPromotionOffer(body: Record<string, unknown>): Promise<unknown>;
  listAdminPromotionOffers(query: Record<string, unknown>): Promise<unknown>;
  listStorefrontPromotionOffers(query: Record<string, unknown>): Promise<unknown>;
  updateAdminPromotionOffer(offerId: string, body: Record<string, unknown>): Promise<unknown>;
}

let cmsRemotePort: SdkworkCmsRemotePort | null = null;

export function configureSdkworkCmsRemotePort(port: SdkworkCmsRemotePort | null): void {
  cmsRemotePort = port;
}

export function getSdkworkCmsRemotePort(): SdkworkCmsRemotePort {
  if (!cmsRemotePort) {
    throw new Error(
      "SDKWork CMS remote port is not configured. Call configureSdkworkCmsRemotePort() from mall PC bootstrap.",
    );
  }
  return cmsRemotePort;
}
