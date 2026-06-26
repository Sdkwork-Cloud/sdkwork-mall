import { getSdkworkCommerceService } from "@sdkwork/commerce-service";
import { configureSdkworkCommerceRemotePort } from "@sdkwork/mall-pc-commerce/commerce-remote-port";

export function configureSdkworkMallPcCommerceBuyerHubRemotePort(): void {
  const commerce = () => getSdkworkCommerceService();

  configureSdkworkCommerceRemotePort({
    accounts: commerce().accounts,
    afterSales: commerce().afterSales,
    orders: commerce().orders,
    payments: commerce().payments,
    promotions: commerce().promotions,
  });
}
