import { getSdkworkCommerceService } from "@sdkwork/commerce-service";
import {
  configureSdkworkAdminRemotePort,
  type SdkworkAdminCommerceNamespace,
} from "@sdkwork/mall-pc-admin-core/admin-remote-port";

export function configureSdkworkMallPcAdminCommerceRemotePort(): void {
  const commerce = () => getSdkworkCommerceService();

  configureSdkworkAdminRemotePort({
    admin: commerce().admin as SdkworkAdminCommerceNamespace,
  });
}
