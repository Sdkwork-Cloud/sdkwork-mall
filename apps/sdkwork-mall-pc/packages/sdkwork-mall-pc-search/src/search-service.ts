import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";

export interface MallSearchProduct {
  id: string;
  imageUrl?: string;
  priceCny: number | null;
  shopId?: string;
  shopName?: string;
  title: string;
  brand?: string;
  origin?: string;
  inStock?: boolean;
  selfOperated?: boolean;
  freeShipping?: boolean;
  rating?: number;
  salesCount?: number;
}

export interface MallSearchResult {
  items: MallSearchProduct[];
  total: number;
}

function readSearchProduct(record: Record<string, unknown>): MallSearchProduct {
  const media = record.primaryImage ?? record.coverImage;
  const imageUrl =
    typeof media === "object" && media !== null && "url" in media
      ? String((media as { url?: unknown }).url ?? "")
      : undefined;

  const brand =
    typeof record.brand === "string"
      ? record.brand
      : typeof record.brandName === "string"
        ? record.brandName
        : undefined;

  const origin =
    typeof record.origin === "string"
      ? record.origin
      : typeof record.shipFrom === "string"
        ? record.shipFrom
        : typeof record.originPlace === "string"
          ? record.originPlace
          : undefined;

  const stock =
    typeof record.stock === "number"
      ? record.stock
      : typeof record.stockQuantity === "number"
        ? record.stockQuantity
        : undefined;
  const inStock = stock == null ? undefined : stock > 0;

  const selfOperated =
    typeof record.selfOperated === "boolean"
      ? record.selfOperated
      : typeof record.self_operated === "boolean"
        ? record.self_operated
        : typeof record.isSelfOperated === "boolean"
          ? record.isSelfOperated
          : undefined;

  const freeShipping =
    typeof record.freeShipping === "boolean"
      ? record.freeShipping
      : typeof record.free_shipping === "boolean"
        ? record.free_shipping
        : typeof record.isFreeShipping === "boolean"
          ? record.isFreeShipping
          : undefined;

  const rating =
    typeof record.rating === "number"
      ? record.rating
      : typeof record.averageRating === "number"
        ? record.averageRating
        : undefined;

  const salesCount =
    typeof record.salesCount === "number"
      ? record.salesCount
      : typeof record.sales === "number"
        ? record.sales
        : undefined;

  return {
    id: String(record.id ?? record.spuId ?? ""),
    title: String(record.title ?? record.name ?? "商品"),
    priceCny:
      typeof record.salePrice === "number"
        ? record.salePrice
        : typeof record.price === "number"
          ? record.price
          : null,
    shopId:
      typeof record.shopId === "string"
        ? record.shopId
        : typeof record.shop_id === "string"
          ? record.shop_id
          : undefined,
    shopName: typeof record.shopName === "string" ? record.shopName : undefined,
    imageUrl: imageUrl || undefined,
    brand,
    origin,
    inStock,
    selfOperated,
    freeShipping,
    rating,
    salesCount,
  };
}

export async function listMallCategories(): Promise<Array<{ id: string; name: string }>> {
  const service = getSdkworkCommerceService();
  const response = await service.catalog.categories.list({ page: 1, pageSize: 50, status: "active" });
  const payload = unwrapSdkworkCommerceResponse(response) as { items?: Record<string, unknown>[] };
  return (
    payload.items?.map((item) => ({
      id: String(item.id ?? ""),
      name: String(item.name ?? item.title ?? "类目"),
    })) ?? []
  );
}

export async function searchMallProducts(input: {
  categoryId?: string;
  page?: number;
  pageSize?: number;
  query?: string;
  shopId?: string;
  sort?: string;
}): Promise<MallSearchResult> {
  const service = getSdkworkCommerceService();
  // SDK 的 catalog.spus.list 不支持 shop_id 服务端过滤，当指定 shopId 时
  // 拉取较大批次后在前端过滤，避免分页丢数据。
  const requestPageSize = input.shopId
    ? Math.max(input.pageSize ?? 20, 100)
    : input.pageSize ?? 20;
  const response = await service.catalog.spus.list({
    categoryId: input.categoryId,
    page: input.page ?? 1,
    pageSize: requestPageSize,
    q: input.query,
  });
  const payload = unwrapSdkworkCommerceResponse(response) as {
    items?: Record<string, unknown>[];
    total?: number;
  };

  let items = payload.items?.map(readSearchProduct) ?? [];

  if (input.shopId) {
    items = items.filter((item) => !item.shopId || item.shopId === input.shopId);
  }

  // SDK 的 catalog.spus.list 不支持 sort 参数，在前端按 sort 排序
  if (items.length > 0 && input.sort) {
    items = sortSearchProducts(items, input.sort);
  }

  // 当指定 shopId 时，total 以过滤后的条数为准；
  // 否则使用服务端返回的 total
  const total = input.shopId ? items.length : payload.total ?? items.length;

  // 当指定 shopId 时，对结果做分页截取
  if (input.shopId && input.page && input.pageSize) {
    const start = (input.page - 1) * input.pageSize;
    items = items.slice(start, start + input.pageSize);
  }

  return { items, total };
}

function sortSearchProducts(items: MallSearchProduct[], sort: string): MallSearchProduct[] {
  const sorted = [...items];
  switch (sort) {
    case "sales":
      // 销量排序（无销量字段时保持原序）
      return sorted;
    case "price-asc":
      return sorted.sort((a, b) => (a.priceCny ?? 0) - (b.priceCny ?? 0));
    case "price-desc":
      return sorted.sort((a, b) => (b.priceCny ?? 0) - (a.priceCny ?? 0));
    case "rating":
      // 好评排序（无评分字段时保持原序）
      return sorted;
    case "created_at":
      // 上新排序（无时间字段时保持原序）
      return sorted;
    default:
      return sorted;
  }
}

export interface MallSearchShop {
  description?: string;
  id: string;
  name: string;
  operationStatus?: string;
}

export async function searchMallShops(input: {
  page?: number;
  pageSize?: number;
  query?: string;
}): Promise<{ items: MallSearchShop[]; total: number }> {
  const service = getSdkworkCommerceService();
  const response = await service.shops.list({
    page: input.page ?? 1,
    page_size: input.pageSize ?? 10,
    q: input.query,
  });
  const payload = unwrapSdkworkCommerceResponse(response) as {
    items?: Record<string, unknown>[];
    total?: number;
  };
  const items =
    payload.items?.map((item) => ({
      id: String(item.id ?? ""),
      name: String(item.name ?? item.title ?? item.shopName ?? "店铺"),
      description:
        typeof item.description === "string"
          ? item.description
          : typeof item.summary === "string"
            ? item.summary
            : undefined,
      operationStatus: String(item.operationStatus ?? item.operation_status ?? ""),
    })).filter((shop) => shop.id) ?? [];

  return {
    items,
    total: payload.total ?? items.length,
  };
}
