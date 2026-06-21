import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcAddressRoutes = [
  {
    auth: "required",
    capability: "address",
    domain: "commerce",
    id: "buyer.mall.addresses",
    packageName: "@sdkwork/mall-pc-address",
    path: "/buyer/addresses",
    screen: "addresses",
    surface: "buyer",
    title: "收货地址",
    titleKey: "address.routes.addresses.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
