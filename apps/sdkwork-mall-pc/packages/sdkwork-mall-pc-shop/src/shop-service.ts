import { unwrapSdkworkPaymentResponse } from "@sdkwork/payment-service";
import { getSdkworkShopRemotePort } from "./shop-remote-port";

/**
 * 店铺评分摘要（对齐 PRD 7.2.5 店铺首页 & 7.2.4 PDP 店铺信息）
 */
export interface MallShopRatingSummary {
  overall: number | null;
  descriptionMatch: number | null;
  logistics: number | null;
  service: number | null;
}

export interface MallShopDetail {
  id: string;
  name: string;
  description?: string;
  announcement?: string;
  bannerUrl?: string;
  logoUrl?: string;
  rating?: MallShopRatingSummary | null;
  followerCount?: number;
  productCount?: number;
  operationStatus?: string;
  categories?: string[];
  foundedAt?: string;
  location?: string;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function readImageUrl(value: unknown): string | undefined {
  if (typeof value === "object" && value !== null && "url" in value) {
    const url = (value as { url?: unknown }).url;
    if (typeof url === "string" && url) return url;
  }
  if (typeof value === "string" && value) return value;
  return undefined;
}

function readStringList(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const result = value
      .map((item) => (typeof item === "string" ? item : undefined))
      .filter((item): item is string => Boolean(item));
    return result.length > 0 ? result : undefined;
  }
  if (typeof value === "string") {
    return value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
}

function readShopRating(value: unknown): MallShopRatingSummary | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const overall = readNumber(record.overall ?? record.score ?? record.rating) ?? null;
  const descriptionMatch = readNumber(record.descriptionMatch ?? record.description_score ?? record.itemAsDescribed) ?? null;
  const logistics = readNumber(record.logistics ?? record.logistics_score ?? record.shipping) ?? null;
  const service = readNumber(record.service ?? record.service_score ?? record.attitude) ?? null;
  if (overall == null && descriptionMatch == null && logistics == null && service == null) {
    return null;
  }
  return { overall, descriptionMatch, logistics, service };
}

export async function retrieveMallShop(shopId: string): Promise<MallShopDetail | null> {
  const response = await getSdkworkShopRemotePort().retrieveShop({ shopId });
  const item = unwrapSdkworkPaymentResponse(response) as Record<string, unknown>;
  if (!item || !item.id) {
    return null;
  }

  const bannerUrl =
    readImageUrl(item.banner) ??
    readImageUrl(item.bannerUrl) ??
    readImageUrl(item.banner_url) ??
    readImageUrl(item.coverImage) ??
    readImageUrl(item.cover);

  const logoUrl =
    readImageUrl(item.logo) ??
    readImageUrl(item.logoUrl) ??
    readImageUrl(item.logo_url) ??
    readImageUrl(item.avatar);

  const rating = readShopRating(item.rating ?? item.shopRating ?? item.shop_rating ?? item.score);

  return {
    id: String(item.id ?? shopId),
    name: String(item.name ?? item.title ?? item.shopName ?? "店铺"),
    description: readString(item.description) ?? readString(item.summary),
    announcement: readString(item.announcement) ?? readString(item.notice),
    bannerUrl,
    logoUrl,
    rating,
    followerCount: readNumber(item.followerCount ?? item.follower_count ?? item.followers),
    productCount: readNumber(item.productCount ?? item.product_count ?? item.products),
    operationStatus: readString(item.operationStatus ?? item.operation_status),
    categories: readStringList(item.categories) ?? readStringList(item.categoryList),
    foundedAt: readString(item.foundedAt) ?? readString(item.founded_at) ?? readString(item.createdAt),
    location: readString(item.location) ?? readString(item.address),
  };
}

/**
 * 从店铺商品中提取分类（基于商品 brand 字段聚合，作为店铺内分类维度）
 */
export function extractShopCategories(products: Array<{ brand?: string }>): Array<{ id: string; name: string; count: number }> {
  const counts = new Map<string, { name: string; count: number }>();
  for (const product of products) {
    const brand = product.brand;
    if (!brand) continue;
    const existing = counts.get(brand);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(brand, { name: brand, count: 1 });
    }
  }
  return Array.from(counts.entries())
    .map(([id, { name, count }]) => ({ id, name, count }))
    .sort((a, b) => b.count - a.count);
}
