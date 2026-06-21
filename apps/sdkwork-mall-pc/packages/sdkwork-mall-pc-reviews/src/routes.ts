import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcReviewsRoutes = [
  {
    auth: "required",
    capability: "reviews",
    domain: "commerce",
    id: "buyer.mall.reviews",
    packageName: "@sdkwork/mall-pc-reviews",
    path: "/buyer/reviews",
    screen: "reviews",
    surface: "buyer",
    title: "我的评价",
    titleKey: "reviews.routes.reviews.title",
  },
  {
    auth: "required",
    capability: "footprint",
    domain: "commerce",
    id: "buyer.mall.footprint",
    packageName: "@sdkwork/mall-pc-reviews",
    path: "/buyer/footprint",
    screen: "footprint",
    surface: "buyer",
    title: "浏览足迹",
    titleKey: "reviews.routes.footprint.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
