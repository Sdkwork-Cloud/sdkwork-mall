import { getSdkworkCommerceService } from "@sdkwork/mall-commerce-service";
import { configureSdkworkCmsRemotePort } from "@sdkwork/mall-pc-cms";

export function configureSdkworkMallPcCmsCommerceRemotePort(): void {
  const commerce = () => getSdkworkCommerceService();

  configureSdkworkCmsRemotePort({
    createAdminPromotionOffer(body) {
      return commerce().admin.promotions.offers.create(body);
    },
    listAdminPromotionOffers(query) {
      return commerce().admin.promotions.offers.management.list(query);
    },
    listStorefrontPromotionOffers(query) {
      return commerce().promotions.offers.list(query);
    },
    updateAdminPromotionOffer(offerId, body) {
      return commerce().admin.promotions.offers.update(offerId, body);
    },
  });
}
