export interface SdkworkReviewsRemotePort {
  listOrders(query: Record<string, unknown>): Promise<unknown>;
}

let reviewsRemotePort: SdkworkReviewsRemotePort | null = null;

export function configureSdkworkReviewsRemotePort(port: SdkworkReviewsRemotePort | null): void {
  reviewsRemotePort = port;
}

export function getSdkworkReviewsRemotePort(): SdkworkReviewsRemotePort {
  if (!reviewsRemotePort) {
    throw new Error(
      "SDKWork reviews remote port is not configured. Call configureSdkworkReviewsRemotePort() from mall PC bootstrap.",
    );
  }
  return reviewsRemotePort;
}
