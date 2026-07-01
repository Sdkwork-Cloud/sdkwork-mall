import type { AccountAppSdkClient } from "@sdkwork/account-sdk-ports";
import {
  configureSdkworkAccountAppServiceProvider,
  configureSdkworkAccountSessionTokenProvider,
  createSdkworkAccountAppService,
} from "@sdkwork/account-service";
import type { MembershipAppSdkClient } from "@sdkwork/membership-sdk-ports";
import {
  configureSdkworkMembershipAppServiceProvider,
  configureSdkworkMembershipSessionTokenProvider,
  createSdkworkMembershipAppService,
} from "@sdkwork/membership-service";
import type { OrderAppSdkClient } from "@sdkwork/order-sdk-ports";
import {
  configureSdkworkOrderAppServiceProvider,
  configureSdkworkOrderSessionTokenProvider,
  createSdkworkOrderAppService,
} from "@sdkwork/order-service";
import type { PaymentAppSdkClient } from "@sdkwork/payment-sdk-ports";
import {
  configureSdkworkPaymentAppServiceProvider,
  configureSdkworkPaymentSessionTokenProvider,
  createSdkworkPaymentAppService,
} from "@sdkwork/payment-service";
import type { PromotionAppSdkClient } from "@sdkwork/promotion-sdk-ports";
import {
  configureSdkworkPromotionAppServiceProvider,
  configureSdkworkPromotionSessionTokenProvider,
  createSdkworkPromotionAppService,
} from "@sdkwork/promotion-service";

export interface SdkworkMallPcDomainSessionTokens {
  accessToken?: string;
  authToken?: string;
  refreshToken?: string;
}

type CommerceAppSlice = AccountAppSdkClient["commerce"];

export function configureSdkworkMallPcDomainServiceProviders(
  getCommerceAppSlice: () => CommerceAppSlice,
  readSessionTokens: () => SdkworkMallPcDomainSessionTokens,
): void {
  const commerceClient = () => getCommerceAppSlice();

  configureSdkworkAccountAppServiceProvider(() => createSdkworkAccountAppService({
    appClient: { commerce: commerceClient() } as unknown as AccountAppSdkClient,
  }));
  configureSdkworkMembershipAppServiceProvider(() => createSdkworkMembershipAppService({
    appClient: { commerce: commerceClient() } as unknown as MembershipAppSdkClient,
  }));
  configureSdkworkOrderAppServiceProvider(() => createSdkworkOrderAppService({
    appClient: { commerce: commerceClient() } as unknown as OrderAppSdkClient,
  }));
  configureSdkworkPaymentAppServiceProvider(() => createSdkworkPaymentAppService({
    appClient: { commerce: commerceClient() } as unknown as PaymentAppSdkClient,
  }));
  configureSdkworkPromotionAppServiceProvider(() => createSdkworkPromotionAppService({
    appClient: { commerce: commerceClient() } as unknown as PromotionAppSdkClient,
  }));

  configureSdkworkAccountSessionTokenProvider(readSessionTokens);
  configureSdkworkMembershipSessionTokenProvider(readSessionTokens);
  configureSdkworkOrderSessionTokenProvider(readSessionTokens);
  configureSdkworkPaymentSessionTokenProvider(readSessionTokens);
  configureSdkworkPromotionSessionTokenProvider(readSessionTokens);
}
