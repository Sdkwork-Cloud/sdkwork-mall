import type { SdkworkMallPcRouteContribution } from "@sdkwork/mall-pc-core";

export const sdkworkMallPcAdminProductRoutes = [
  {
    auth: "required",
    capability: "product-admin",
    domain: "commerce",
    id: "admin.commerce.product-admin.catalog",
    packageName: "@sdkwork/mall-pc-admin-product",
    path: "/admin/products",
    permissionHint: "commerce.products.read",
    screen: "catalog",
    surface: "backend-admin",
    title: "商品治理",
    titleKey: "admin.commerce.product.routes.catalog.title",
  },
] as const satisfies readonly SdkworkMallPcRouteContribution[];
