import {
  createSdkworkAppCapabilityManifest,
  type CreateSdkworkAppCapabilityManifestOptions,
  type SdkworkAppCapabilityManifest,
} from "@sdkwork/appbase-pc-react";

export interface SdkworkMembershipWorkspaceManifest extends SdkworkAppCapabilityManifest {
  capability: "membership";
  routePath: string;
}

export interface CreateMembershipWorkspaceManifestOptions
  extends Partial<
    Pick<CreateSdkworkAppCapabilityManifestOptions, "description" | "host" | "id" | "packageNames" | "theme" | "title">
  > {
  routePath?: string;
}

export interface SdkworkMembershipRouteIntent {
  focusWindow: boolean;
  route: string;
  sectionId?: string;
  source: "membership-workspace";
  type: "membership-route-intent";
}

export interface CreateMembershipRouteIntentOptions {
  basePath?: string;
  focusWindow?: boolean;
  sectionId?: string;
}

export interface SdkworkMembershipBenefitDigestInput {
  claimed?: boolean;
  id: string;
  name: string;
  usageLimit?: number | null;
  usedCount?: number | null;
}

export interface SdkworkMembershipBenefitsDigest {
  claimedBenefits: number;
  limitedBenefits: number;
  totalBenefits: number;
  unusedLimitedBenefits: number;
}

export interface SdkworkMembershipLevelDigestInput {
  id: string;
  isCurrent?: boolean;
  levelValue: number;
  name: string;
  requiredPoints?: number | null;
}

export interface SdkworkMembershipLevelsDigest {
  currentLevelName?: string;
  currentLevelValue: number | null;
  highestLevelName?: string;
  levelCount: number;
  nextLevelName?: string;
}

function normalizeBasePath(basePath: string | undefined): string {
  const normalized = (basePath ?? "/memberships").trim();
  if (!normalized || normalized === "/") {
    return "/memberships";
  }

  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

export function summarizeSdkworkMembershipBenefits(
  benefits: readonly SdkworkMembershipBenefitDigestInput[],
): SdkworkMembershipBenefitsDigest {
  return benefits.reduce<SdkworkMembershipBenefitsDigest>(
    (summary, benefit) => {
      summary.totalBenefits += 1;

      if (benefit.claimed) {
        summary.claimedBenefits += 1;
      }

      if ((benefit.usageLimit ?? null) !== null) {
        summary.limitedBenefits += 1;
        if ((benefit.usedCount ?? 0) <= 0) {
          summary.unusedLimitedBenefits += 1;
        }
      }

      return summary;
    },
    {
      claimedBenefits: 0,
      limitedBenefits: 0,
      totalBenefits: 0,
      unusedLimitedBenefits: 0,
    },
  );
}

export function summarizeSdkworkMembershipLevels(
  levels: readonly SdkworkMembershipLevelDigestInput[],
): SdkworkMembershipLevelsDigest {
  const sortedLevels = [...levels].sort(
    (left, right) => left.levelValue - right.levelValue || left.name.localeCompare(right.name),
  );
  const currentLevel = sortedLevels.find((level) => level.isCurrent);
  const highestLevel = sortedLevels[sortedLevels.length - 1];
  const nextLevel = currentLevel
    ? sortedLevels.find((level) => level.levelValue > currentLevel.levelValue)
    : sortedLevels[0];

  return {
    currentLevelName: currentLevel?.name,
    currentLevelValue: currentLevel?.levelValue ?? null,
    highestLevelName: highestLevel?.name,
    levelCount: sortedLevels.length,
    nextLevelName: nextLevel?.name,
  };
}

export function createMembershipWorkspaceManifest({
  description = "Membership workspace for plan levels, benefit comparison, and premium upgrade routing.",
  host,
  id = "sdkwork-membership",
  packageNames = ["@sdkwork/mall-pc-membership"],
  routePath = "/memberships",
  theme,
  title = "Membership",
}: CreateMembershipWorkspaceManifestOptions = {}): SdkworkMembershipWorkspaceManifest {
  return {
    ...createSdkworkAppCapabilityManifest({
      description,
      host,
      id,
      packageNames,
      theme,
      title,
    }),
    capability: "membership",
    routePath: normalizeBasePath(routePath),
  };
}

export function createMembershipRouteIntent(
  options: CreateMembershipRouteIntentOptions = {},
): SdkworkMembershipRouteIntent {
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
    source: "membership-workspace",
    type: "membership-route-intent",
  };
}

export const membershipPackageMeta = {
  architecture: "pc-react",
  domain: "commerce",
  package: "@sdkwork/mall-pc-membership",
  status: "ready",
} as const;

export type MembershipPackageMeta = typeof membershipPackageMeta;
