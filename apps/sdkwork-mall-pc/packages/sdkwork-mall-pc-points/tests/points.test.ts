import { describe, expect, it } from "vitest";
import {
  createPointsRouteIntent,
  createPointsWorkspaceManifest,
  pointsPackageMeta,
} from "../src";

describe("sdkwork-mall-pc-points headless contract", () => {
  it("creates a points workspace manifest and route intent for reusable host routing", () => {
    expect(pointsPackageMeta).toMatchObject({
      domain: "commerce",
      package: "@sdkwork/mall-pc-points",
    });

    expect(
      createPointsWorkspaceManifest({
        title: "Points",
      }),
    ).toMatchObject({
      capability: "points",
      packageNames: ["@sdkwork/mall-pc-points", "@sdkwork/mall-pc-wallet"],
      routePath: "/points",
      title: "Points",
    });

    expect(
      createPointsRouteIntent({
        sectionId: "transactions",
      }),
    ).toEqual({
      focusWindow: true,
      route: "/points?section=transactions",
      sectionId: "transactions",
      source: "points-workspace",
      type: "points-route-intent",
    });
  });
});
