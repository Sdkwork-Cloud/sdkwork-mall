import { getSdkworkCommerceService } from "@sdkwork/mall-commerce-service";
import { configureSdkworkCommerceRemotePort } from "@sdkwork/mall-pc-commerce/commerce-remote-port";
import { getSdkworkOrderService } from "@sdkwork/order-service";
import { getSdkworkPaymentService } from "@sdkwork/payment-service";
import { getSdkworkPromotionService } from "@sdkwork/promotion-service";

export function configureSdkworkMallPcCommerceBuyerHubRemotePort(): void {
  const commerce = () => getSdkworkCommerceService();
  const payments = getSdkworkPaymentService().payments;

  configureSdkworkCommerceRemotePort({
    accounts: commerce().accounts,
    afterSales: commerce().afterSales,
    orders: getSdkworkOrderService().orders,
    payments: {
      methods: payments.methods,
      records: payments.records,
      statistics: {
        retrieve: payments.statistics.summary.retrieve,
      },
    },
    promotions: getSdkworkPromotionService().promotions,
  });
}
