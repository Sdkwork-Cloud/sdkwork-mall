import {
  getSdkworkCommerceService,
} from "@sdkwork/mall-commerce-service";
import {
  configureSdkworkInvoiceRemotePort,
  type SdkworkInvoiceRemotePort,
} from "@sdkwork/mall-pc-invoice";

export function createCommerceInvoiceRemotePort(): SdkworkInvoiceRemotePort {
  const commerce = () => getSdkworkCommerceService();

  return {
    cancelInvoice(invoiceId, body) {
      return commerce().invoices.cancellations.create(invoiceId, body);
    },
    createInvoice(body) {
      return commerce().invoices.create(body);
    },
    listInvoiceItems(invoiceId) {
      return commerce().invoices.items.list(invoiceId);
    },
    listMineInvoices(query) {
      return commerce().invoices.mine.list(query);
    },
    retrieveInvoice(invoiceId) {
      return commerce().invoices.retrieve(invoiceId);
    },
    retrieveStatistics() {
      return commerce().invoices.statistics.retrieve();
    },
    submitInvoice(invoiceId) {
      return commerce().invoices.submissions.create(invoiceId, {});
    },
    updateInvoice(invoiceId, body) {
      return commerce().invoices.update(invoiceId, body);
    },
  };
}

export function configureSdkworkMallPcInvoiceRemotePort(): void {
  configureSdkworkInvoiceRemotePort(createCommerceInvoiceRemotePort());
}
