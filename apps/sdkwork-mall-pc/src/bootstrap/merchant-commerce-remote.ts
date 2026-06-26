import { getSdkworkCommerceService } from "@sdkwork/commerce-service";
import { configureSdkworkMerchantRemotePort } from "@sdkwork/mall-pc-merchant";

export function configureSdkworkMallPcMerchantCommerceRemotePort(): void {
  const commerce = () => getSdkworkCommerceService();

  configureSdkworkMerchantRemotePort({
    afterSales: commerce().afterSales,
    promotions: commerce().promotions,
    shops: commerce().shops,
  });
}
