export interface SdkworkCartRemotePort {
  createCheckoutOrder(sessionId: string, body: Record<string, unknown>): Promise<unknown>;
  createCheckoutQuote(sessionId: string, body: Record<string, unknown>): Promise<unknown>;
  createCheckoutSession(body: Record<string, unknown>): Promise<unknown>;
  createDiscountApplication(body: Record<string, unknown>): Promise<unknown>;
  createWalletHold(body: Record<string, unknown>): Promise<unknown>;
  deleteCartItem(cartItemId: string): Promise<unknown>;
  listAddresses(query: Record<string, unknown>): Promise<unknown>;
  listPaymentMethods(query: Record<string, unknown>): Promise<unknown>;
  listUserCoupons(query: Record<string, unknown>): Promise<unknown>;
  payOrder(orderId: string, body: Record<string, unknown>): Promise<unknown>;
  retrieveCurrentCart(): Promise<unknown>;
  retrieveOrderPaymentSuccess(orderId: string): Promise<unknown>;
  retrievePointsAccount(): Promise<unknown>;
  retrieveWalletOverview(): Promise<unknown>;
  setDefaultAddress(body: Record<string, unknown>): Promise<unknown>;
  updateCartItem(cartItemId: string, quantity: number): Promise<unknown>;
}

let cartRemotePort: SdkworkCartRemotePort | null = null;

export function configureSdkworkCartRemotePort(port: SdkworkCartRemotePort | null): void {
  cartRemotePort = port;
}

export function getSdkworkCartRemotePort(): SdkworkCartRemotePort {
  if (!cartRemotePort) {
    throw new Error(
      "SDKWork cart remote port is not configured. Call configureSdkworkCartRemotePort() from mall PC bootstrap.",
    );
  }
  return cartRemotePort;
}
