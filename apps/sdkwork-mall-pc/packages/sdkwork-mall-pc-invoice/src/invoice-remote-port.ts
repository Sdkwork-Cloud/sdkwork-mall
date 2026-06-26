export interface SdkworkInvoiceRemotePort {
  cancelInvoice(invoiceId: string, body: { cancelReason?: string }): Promise<unknown>;
  createInvoice(body: Record<string, unknown>): Promise<unknown>;
  listMineInvoices(query: { page: number; pageSize: number }): Promise<unknown>;
  listInvoiceItems(invoiceId: string): Promise<unknown>;
  retrieveInvoice(invoiceId: string): Promise<unknown>;
  retrieveStatistics(): Promise<unknown>;
  submitInvoice(invoiceId: string): Promise<unknown>;
  updateInvoice(invoiceId: string, body: Record<string, unknown>): Promise<unknown>;
}

let invoiceRemotePort: SdkworkInvoiceRemotePort | null = null;

export function configureSdkworkInvoiceRemotePort(port: SdkworkInvoiceRemotePort | null): void {
  invoiceRemotePort = port;
}

export function getSdkworkInvoiceRemotePort(): SdkworkInvoiceRemotePort {
  if (!invoiceRemotePort) {
    throw new Error(
      "SDKWork invoice remote port is not configured. Call configureSdkworkInvoiceRemotePort() from mall PC bootstrap.",
    );
  }
  return invoiceRemotePort;
}
