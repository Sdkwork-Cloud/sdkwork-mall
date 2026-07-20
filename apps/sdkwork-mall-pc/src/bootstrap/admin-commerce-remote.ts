import {
  configureSdkworkAdminRemotePort,
  type SdkworkAdminCommerceNamespace,
} from "@sdkwork/mall-pc-admin-core/admin-remote-port";

import {
  createSdkCommandPortAdapter,
  splitSdkQueryId,
} from "./sdk-command-port-adapter";
import type { SdkworkMallPcSdkClientInventory } from "./sdkClients";

const ADMIN_COMMAND_PATHS = [
  "afterSales.reviews.create",
  "shops.approve",
  "shops.riskSignals.resolve",
  "shops.settlementProfile.approve",
  "shops.suspend",
] as const;

export function configureSdkworkMallPcAdminCommerceRemotePort(
  sdkClients: SdkworkMallPcSdkClientInventory,
): void {
  configureSdkworkAdminRemotePort(
    sdkClients.commerceBackendClient
      ? {
          admin: createSdkCommandPortAdapter<SdkworkAdminCommerceNamespace>(
            sdkClients.commerceBackendClient,
            {
              argumentRules: {
                "shops.depositAccount.retrieve": ([query]) => [splitSdkQueryId(query, "shopId")[0]],
                "shops.riskSignals.list": ([query]) => splitSdkQueryId(query, "shopId"),
              },
              commandPaths: ADMIN_COMMAND_PATHS,
            },
          ),
        }
      : null,
  );
}
