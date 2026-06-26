import {
  createSdkworkAppCapabilityManifest,
  type CreateSdkworkAppCapabilityManifestOptions,
  type SdkworkAppCapabilityManifest,
} from "@sdkwork/appbase-pc-react";
import {
  formatSdkworkAccountPointsDelta,
} from "@sdkwork/account-service";
import type { SdkworkWalletAccount } from "./wallet-service";

export interface SdkworkWalletWorkspaceManifest extends SdkworkAppCapabilityManifest {
  capability: "wallet";
  routePath: string;
}

export interface CreateWalletWorkspaceManifestOptions
  extends Partial<
    Pick<CreateSdkworkAppCapabilityManifestOptions, "description" | "host" | "id" | "packageNames" | "theme" | "title">
  > {
  routePath?: string;
}

export interface SdkworkWalletRouteIntent {
  focusWindow: boolean;
  route: string;
  sectionId?: string;
  source: "wallet-workspace";
  type: "wallet-route-intent";
}

export type SdkworkWalletWithdrawDestinationCode = "bank_account" | "ALIPAY" | "WECHAT_PAY";

export interface SdkworkWalletWithdrawDestination {
  code: SdkworkWalletWithdrawDestinationCode;
  description: string;
  id: string;
  label: string;
}

export interface CreateWalletRouteIntentOptions {
  basePath?: string;
  focusWindow?: boolean;
  sectionId?: string;
}

function normalizeBasePath(basePath: string | undefined): string {
  const normalized = (basePath ?? "/wallet").trim();
  if (!normalized || normalized === "/") {
    return "/wallet";
  }

  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

export function formatSdkworkWalletDelta(
  value: number,
  language = "en-US",
): string {
  return formatSdkworkAccountPointsDelta(value, language);
}

export function getSdkworkWalletAccountLevelLabel(
  account: Pick<SdkworkWalletAccount, "level" | "levelName">,
): string {
  const levelName = account.levelName?.trim();
  if (levelName) {
    return levelName;
  }

  if (account.level !== null) {
    return `LV ${account.level}`;
  }

  return "Standard";
}

export function createWalletWorkspaceManifest({
  description = "Wallet workspace for balances, recharge, withdraw, and account overview surfaces.",
  host,
  id = "sdkwork-wallet",
  packageNames = ["@sdkwork/mall-pc-wallet"],
  routePath = "/wallet",
  theme,
  title = "Wallet",
}: CreateWalletWorkspaceManifestOptions = {}): SdkworkWalletWorkspaceManifest {
  return {
    ...createSdkworkAppCapabilityManifest({
      description,
      host,
      id,
      packageNames,
      theme,
      title,
    }),
    capability: "wallet",
    routePath: normalizeBasePath(routePath),
  };
}

export function createWalletRouteIntent(
  options: CreateWalletRouteIntentOptions = {},
): SdkworkWalletRouteIntent {
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
    source: "wallet-workspace",
    type: "wallet-route-intent",
  };
}

export function createDefaultSdkworkWalletWithdrawDestinations(): SdkworkWalletWithdrawDestination[] {
  return [
    {
      code: "bank_account",
      description: "Route the payout through the linked settlement bank account.",
      id: "withdraw-bank-account",
      label: "Bank account",
    },
    {
      code: "ALIPAY",
      description: "Submit the payout to the linked Alipay settlement rail.",
      id: "withdraw-alipay",
      label: "Alipay",
    },
    {
      code: "WECHAT_PAY",
      description: "Submit the payout to the linked WeChat Pay settlement rail.",
      id: "withdraw-wechat-pay",
      label: "WeChat Pay",
    },
  ];
}

export const walletPackageMeta = {
  architecture: "pc-react",
  domain: "commerce",
  package: "@sdkwork/mall-pc-wallet",
  status: "ready",
} as const;

export type WalletPackageMeta = typeof walletPackageMeta;
