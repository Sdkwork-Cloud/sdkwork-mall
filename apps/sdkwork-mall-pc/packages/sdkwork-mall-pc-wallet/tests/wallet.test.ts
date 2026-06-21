import { describe, expect, it } from "vitest";
import {
  formatSdkworkCommerceCurrencyCny,
  formatSdkworkCommercePoints,
  formatSdkworkCommercePointsRate,
} from "@sdkwork/commerce-service";
import {
  createWalletRouteIntent,
  createWalletWorkspaceManifest,
  formatSdkworkWalletDelta,
  getSdkworkWalletAccountLevelLabel,
  walletPackageMeta,
} from "../src";

describe("sdkwork-mall-pc-wallet headless contract", () => {
  it("formats points, currency, and rate in a Sdkwork-aligned commerce style", () => {
    expect(formatSdkworkCommercePoints(5200)).toBe("5,200");
    expect(formatSdkworkCommerceCurrencyCny(199)).toContain("199");
    expect(formatSdkworkCommercePointsRate(200)).toBe("200 pts / CNY 1");
    expect(formatSdkworkWalletDelta(1200)).toBe("+1,200");
    expect(formatSdkworkWalletDelta(-240)).toBe("-240");
    expect(
      getSdkworkWalletAccountLevelLabel({
        level: 3,
        levelName: "Pro",
      }),
    ).toBe("Pro");
    expect(
      getSdkworkWalletAccountLevelLabel({
        level: null,
      }),
    ).toBe("Standard");
  });

  it("creates a wallet workspace manifest and route intent with the expected package selection", () => {
    expect(walletPackageMeta).toMatchObject({
      domain: "commerce",
      package: "@sdkwork/mall-pc-wallet",
    });

    expect(
      createWalletWorkspaceManifest({
        title: "Wallet",
      }),
    ).toMatchObject({
      capability: "wallet",
      packageNames: ["@sdkwork/mall-pc-wallet"],
      routePath: "/wallet",
      title: "Wallet",
    });

    expect(
      createWalletRouteIntent({
        sectionId: "recharge",
      }),
    ).toEqual({
      focusWindow: true,
      route: "/wallet?section=recharge",
      sectionId: "recharge",
      source: "wallet-workspace",
      type: "wallet-route-intent",
    });
  });
});
