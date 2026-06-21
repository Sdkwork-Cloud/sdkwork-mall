import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";

import {
  defaultMallCmsConfig,
  type MallCmsConfig,
  writeMallCmsConfig,
} from "./cms-config";

export const MALL_CMS_OFFER_MARKER = "sdkwork-mall-pc-cms-config";

let cachedConfig: MallCmsConfig | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseMallCmsConfigPayload(value: unknown): MallCmsConfig | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return parseMallCmsConfigPayload(JSON.parse(value));
    } catch {
      return null;
    }
  }

  if (!isRecord(value)) {
    return null;
  }

  if (Array.isArray(value.banners) && Array.isArray(value.floors) && Array.isArray(value.hotKeywords)) {
    return {
      ...defaultMallCmsConfig(),
      ...value,
      banners: value.banners as MallCmsConfig["banners"],
      floors: value.floors as MallCmsConfig["floors"],
      hotKeywords: value.hotKeywords as MallCmsConfig["hotKeywords"],
      updatedAt: String(value.updatedAt ?? new Date().toISOString()),
    };
  }

  return null;
}

function readOfferCmsPayload(offer: Record<string, unknown>): MallCmsConfig | null {
  const candidates = [
    offer.cmsConfigJson,
    offer.cms_config_json,
    offer.metadataJson,
    offer.metadata_json,
    offer.ruleJson,
    offer.rule_json,
    offer.description,
    offer.summary,
  ];

  for (const candidate of candidates) {
    const parsed = parseMallCmsConfigPayload(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function isMallCmsOffer(offer: Record<string, unknown>): boolean {
  const marker = [
    offer.code,
    offer.offerCode,
    offer.offer_code,
    offer.title,
    offer.name,
    offer.slug,
  ]
    .map((value) => String(value ?? ""))
    .join(" ")
    .toLowerCase();

  return marker.includes(MALL_CMS_OFFER_MARKER);
}

function serializeMallCmsOfferBody(config: MallCmsConfig): Record<string, unknown> {
  const payload = JSON.stringify(config);
  return {
    code: MALL_CMS_OFFER_MARKER,
    description: payload,
    metadataJson: { cmsConfig: config },
    ruleJson: { cmsConfig: config },
    status: "active",
    title: "商城 CMS 配置",
  };
}

async function findAdminCmsOffer(): Promise<{ id: string; record: Record<string, unknown> } | null> {
  const service = getSdkworkCommerceService();
  const response = await service.admin.promotions.offers.management.list({ page: 1, page_size: 50 });
  const payload = unwrapSdkworkCommerceResponse(response) as { items?: Record<string, unknown>[] };
  const offer = payload.items?.find(isMallCmsOffer);
  if (!offer) {
    return null;
  }
  return { id: String(offer.id ?? ""), record: offer };
}

async function findStorefrontCmsOffer(): Promise<Record<string, unknown> | null> {
  const service = getSdkworkCommerceService();
  const response = await service.promotions.offers.list({ page: 1, page_size: 50, status: "active" });
  const payload = unwrapSdkworkCommerceResponse(response) as { items?: Record<string, unknown>[] };
  return payload.items?.find(isMallCmsOffer) ?? null;
}

export async function loadMallCmsConfigRemote(): Promise<MallCmsConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const offer = await findStorefrontCmsOffer();
    if (offer) {
      const remoteConfig = readOfferCmsPayload(offer);
      if (remoteConfig) {
        cachedConfig = remoteConfig;
        writeMallCmsConfig(remoteConfig);
        return remoteConfig;
      }
    }
  } catch {
    // Remote CMS is optional; local fallback remains available.
  }

  return defaultMallCmsConfig();
}

export async function saveMallCmsConfigRemote(config: MallCmsConfig): Promise<MallCmsConfig> {
  const nextConfig = { ...config, updatedAt: new Date().toISOString() };
  writeMallCmsConfig(nextConfig);
  cachedConfig = nextConfig;

  try {
    const service = getSdkworkCommerceService();
    const existing = await findAdminCmsOffer();
    const body = serializeMallCmsOfferBody(nextConfig);

    if (existing?.id) {
      await service.admin.promotions.offers.update(existing.id, body);
    } else {
      await service.admin.promotions.offers.create(body);
    }
  } catch {
    // Persist locally even when admin API is unavailable in dev.
  }

  return nextConfig;
}

export function invalidateMallCmsConfigCache() {
  cachedConfig = null;
}
