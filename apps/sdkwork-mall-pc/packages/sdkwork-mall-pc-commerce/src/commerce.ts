import {
  createSdkworkAppCapabilityManifest,
  type CreateSdkworkAppCapabilityManifestOptions,
  type SdkworkAppCapabilityManifest,
} from "@sdkwork/appbase-pc-react";

export interface SdkworkCommerceWorkspaceManifest extends SdkworkAppCapabilityManifest {
  capability: "commerce";
  routePath: string;
}

export interface CreateCommerceWorkspaceManifestOptions
  extends Partial<
    Pick<CreateSdkworkAppCapabilityManifestOptions, "description" | "host" | "id" | "packageNames" | "theme" | "title">
  > {
  routePath?: string;
}

export interface SdkworkCommerceRouteIntent {
  focusWindow: boolean;
  route: string;
  sectionId?: string;
  source: "commerce-workspace";
  type: "commerce-route-intent";
}

export interface CreateCommerceRouteIntentOptions {
  basePath?: string;
  focusWindow?: boolean;
  sectionId?: string;
}

function normalizeBasePath(basePath: string | undefined): string {
  const normalized = (basePath ?? "/commerce").trim();
  if (!normalized || normalized === "/") {
    return "/commerce";
  }

  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

export function createCommerceWorkspaceManifest({
  description = "Mall buyer commerce hub for wallet, coupons, membership, orders, and invoice composition across the active mall PC surface.",
  host,
  id = "sdkwork-mall-commerce",
  packageNames = [
    "@sdkwork/mall-pc-commerce",
    "@sdkwork/mall-pc-wallet",
    "@sdkwork/mall-pc-points",
    "@sdkwork/mall-pc-membership",
    "@sdkwork/mall-pc-coupon",
    "@sdkwork/mall-pc-order",
    "@sdkwork/mall-pc-invoice",
  ],
  routePath = "/commerce",
  theme,
  title = "Commerce",
}: CreateCommerceWorkspaceManifestOptions = {}): SdkworkCommerceWorkspaceManifest {
  return {
    ...createSdkworkAppCapabilityManifest({
      description,
      host,
      id,
      packageNames,
      theme,
      title,
    }),
    capability: "commerce",
    routePath: normalizeBasePath(routePath),
  };
}

export function createCommerceRouteIntent(
  options: CreateCommerceRouteIntentOptions = {},
): SdkworkCommerceRouteIntent {
  const basePath = normalizeBasePath(options.basePath);
  const queryParams = new URLSearchParams();

  if (options.sectionId) {
    queryParams.set("section", options.sectionId);
  }

  const querySuffix = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return {
    focusWindow: options.focusWindow !== false,
    route: `${basePath}${querySuffix}`,
    ...(options.sectionId ? { sectionId: options.sectionId } : {}),
    source: "commerce-workspace",
    type: "commerce-route-intent",
  };
}

export const commercePackageMeta = {
  architecture: "pc-react",
  domain: "commerce",
  package: "@sdkwork/mall-pc-commerce",
  status: "ready",
} as const;

export type CommercePackageMeta = typeof commercePackageMeta;
