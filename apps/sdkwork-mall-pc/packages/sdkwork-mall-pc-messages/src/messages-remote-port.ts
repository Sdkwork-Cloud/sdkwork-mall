export interface SdkworkMessagesRemotePort {
  listAfterSalesRequests(query: Record<string, unknown>): Promise<unknown>;
  listOrders(query: Record<string, unknown>): Promise<unknown>;
}

let messagesRemotePort: SdkworkMessagesRemotePort | null = null;

export function configureSdkworkMessagesRemotePort(port: SdkworkMessagesRemotePort | null): void {
  messagesRemotePort = port;
}

export function getSdkworkMessagesRemotePort(): SdkworkMessagesRemotePort {
  if (!messagesRemotePort) {
    throw new Error(
      "SDKWork messages remote port is not configured. Call configureSdkworkMessagesRemotePort() from mall PC bootstrap.",
    );
  }
  return messagesRemotePort;
}
