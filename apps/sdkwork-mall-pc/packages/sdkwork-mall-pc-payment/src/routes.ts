import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const SdkworkMallPcPaymentRoutes = [
  {
    auth: "required",
    capability: "payment",
    domain: "commerce",
    id: "app.commerce.payment.dashboard",
    packageName: "@sdkwork/mall-pc-payment",
    path: "/app/payment",
    screen: "dashboard",
    surface: "buyer",
    title: "Payment",
    titleKey: "payment.routes.dashboard.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
