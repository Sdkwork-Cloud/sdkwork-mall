import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcMessagesRoutes = [
  {
    auth: "required",
    capability: "messages",
    domain: "commerce",
    id: "buyer.mall.messages",
    packageName: "@sdkwork/mall-pc-messages",
    path: "/buyer/messages",
    screen: "messages",
    surface: "buyer",
    title: "消息中心",
    titleKey: "messages.routes.messages.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
