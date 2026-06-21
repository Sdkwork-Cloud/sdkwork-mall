import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";

export interface MallHomeProductCard {
  id: string;
  imageUrl?: string;
  priceCny: number | null;
  shopName?: string;
  subtitle?: string;
  title: string;
}

export interface MallHomeCategory {
  id: string;
  name: string;
}

export interface MallHomeSnapshot {
  categories: MallHomeCategory[];
  featuredShops: MallHomeShopCard[];
  hotProducts: MallHomeProductCard[];
  newProducts: MallHomeProductCard[];
}

export interface MallHomeShopCard {
  description?: string;
  id: string;
  name: string;
}

function readProductCard(record: Record<string, unknown>): MallHomeProductCard {
  const media = record.primaryImage ?? record.coverImage ?? record.image;
  const imageUrl =
    typeof media === "object" && media !== null && "url" in media
      ? String((media as { url?: unknown }).url ?? "")
      : undefined;

  return {
    id: String(record.id ?? record.spuId ?? ""),
    title: String(record.title ?? record.name ?? "商品"),
    subtitle: typeof record.subtitle === "string" ? record.subtitle : undefined,
    priceCny:
      typeof record.salePrice === "number"
        ? record.salePrice
        : typeof record.price === "number"
          ? record.price
          : null,
    shopName: typeof record.shopName === "string" ? record.shopName : undefined,
    imageUrl: imageUrl || undefined,
  };
}

export async function loadMallHomeSnapshot(): Promise<MallHomeSnapshot> {
  const service = getSdkworkCommerceService();
  const [categoriesResult, hotResult, newResult, shopsResult] = await Promise.allSettled([
    service.catalog.categories.list({ page: 1, page_size: 10 }),
    service.catalog.spus.list({ page: 1, page_size: 8, sort: "sales" }),
    service.catalog.spus.list({ page: 1, page_size: 8, sort: "created_at" }),
    service.shops.list({ page: 1, page_size: 8 }),
  ]);

  const categoriesPayload = categoriesResult.status === "fulfilled"
    ? (unwrapSdkworkCommerceResponse(categoriesResult.value) as { items?: Record<string, unknown>[] })
    : { items: [] as Record<string, unknown>[] };
  const categories = categoriesPayload.items?.map((item) => ({
    id: String(item.id ?? ""),
    name: String(item.name ?? item.title ?? "类目"),
  })) ?? [];

  const hotPayload = hotResult.status === "fulfilled"
    ? (unwrapSdkworkCommerceResponse(hotResult.value) as { items?: Record<string, unknown>[] })
    : { items: [] as Record<string, unknown>[] };
  const hotProducts = hotPayload.items?.map((item) => readProductCard(item)) ?? [];

  const newPayload = newResult.status === "fulfilled"
    ? (unwrapSdkworkCommerceResponse(newResult.value) as { items?: Record<string, unknown>[] })
    : { items: [] as Record<string, unknown>[] };
  const newProducts = newPayload.items?.map((item) => readProductCard(item)) ?? [];

  const shopsPayload = shopsResult.status === "fulfilled"
    ? (unwrapSdkworkCommerceResponse(shopsResult.value) as { items?: Record<string, unknown>[] })
    : { items: [] as Record<string, unknown>[] };
  const featuredShops =
    shopsPayload.items?.map((item) => ({
      id: String(item.id ?? ""),
      name: String(item.name ?? item.title ?? item.shopName ?? "店铺"),
      description:
        typeof item.description === "string"
          ? item.description
          : typeof item.summary === "string"
            ? item.summary
            : undefined,
    })).filter((shop) => shop.id) ?? [];

  return { categories, featuredShops, hotProducts, newProducts };
}
