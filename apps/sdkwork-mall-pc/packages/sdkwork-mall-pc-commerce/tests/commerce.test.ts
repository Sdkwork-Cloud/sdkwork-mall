import { describe, expect, it } from "vitest";
import {
  commercePackageMeta,
  createCommerceRouteIntent,
  createCommerceWorkspaceManifest,
} from "../src/legacy-hub";

describe("sdkwork-mall-pc-commerce headless contract", () => {
  it("creates reusable commerce manifests and route intents", () => {
    expect(commercePackageMeta).toMatchObject({
      domain: "commerce",
      package: "@sdkwork/mall-pc-commerce",
    });

    expect(
      createCommerceWorkspaceManifest({
        title: "Commerce",
      }),
    ).toMatchObject({
      capability: "commerce",
      packageNames: [
        "@sdkwork/mall-pc-commerce",
        "@sdkwork/mall-pc-wallet",
        "@sdkwork/mall-pc-points",
        "@sdkwork/mall-pc-membership",
        "@sdkwork/mall-pc-coupon",
        "@sdkwork/mall-pc-order",
        "@sdkwork/mall-pc-invoice",
      ],
      routePath: "/commerce",
      title: "Commerce",
    });

    expect(
      createCommerceRouteIntent({
        sectionId: "orders",
      }),
    ).toEqual({
      focusWindow: true,
      route: "/commerce?section=orders",
      sectionId: "orders",
      source: "commerce-workspace",
      type: "commerce-route-intent",
    });
  });
});
