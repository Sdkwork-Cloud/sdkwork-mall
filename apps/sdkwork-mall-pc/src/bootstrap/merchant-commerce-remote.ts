import { getSdkworkCommerceService } from "@sdkwork/mall-commerce-service";
import {
  configureSdkworkMerchantRemotePort,
  type SdkworkMerchantRemotePort,
} from "@sdkwork/mall-pc-merchant";

export function configureSdkworkMallPcMerchantCommerceRemotePort(): void {
  const commerce = () => getSdkworkCommerceService();

  configureSdkworkMerchantRemotePort({
    afterSales: commerce().afterSales,
    promotions: commerce().promotions,
    shops: commerce().shops as SdkworkMerchantRemotePort["shops"],
  });
}
