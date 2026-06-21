import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";
import { MALL_CMS_OFFER_MARKER } from "@sdkwork/mall-pc-cms/cms-service";

/**
 * 活动类型枚举（对齐 PRD 7.2.9）
 * - flash-sale: 秒杀
 * - limited-rush: 限时抢购
 * - brand-day: 品牌日
 * - quantity-tier: 满量会场
 * - member-day: 会员日
 * - big-promo: 大促专题
 * - category-venue: 类目会场
 * - new-launch: 新品首发
 */
export type MallActivityType =
  | "flash-sale"
  | "limited-rush"
  | "brand-day"
  | "quantity-tier"
  | "member-day"
  | "big-promo"
  | "category-venue"
  | "new-launch"
  | "general";

export interface MallActivityOffer {
  id: string;
  title: string;
  description?: string;
  status: string;
  startAt?: string;
  endAt?: string;
  activityType: MallActivityType;
  bannerUrl?: string;
  rules?: string[];
  tags?: string[];
  highlight?: string;
  discountText?: string;
}

const ACTIVITY_TYPE_LABELS: Record<MallActivityType, string> = {
  "flash-sale": "秒杀",
  "limited-rush": "限时抢购",
  "brand-day": "品牌日",
  "quantity-tier": "满量会场",
  "member-day": "会员日",
  "big-promo": "大促专题",
  "category-venue": "类目会场",
  "new-launch": "新品首发",
  general: "活动",
};

export function getMallActivityTypeLabel(type: MallActivityType): string {
  return ACTIVITY_TYPE_LABELS[type] ?? "活动";
}

const DEFAULT_RULES: string[] = [
  "活动期间内，每位用户均可参与。",
  "优惠不可与其他活动叠加使用，具体以订单页为准。",
  "平台保留活动最终解释权。",
];

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
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

function detectActivityType(record: Record<string, unknown>): MallActivityType {
  const text = [
    record.code,
    record.offerCode,
    record.offer_code,
    record.title,
    record.name,
    record.description,
    record.type,
    record.activityType,
    record.activity_type,
    record.tag,
    record.tags,
  ]
    .map((value) => (typeof value === "string" ? value.toLowerCase() : ""))
    .join(" ");

  if (/秒杀|flash|seckill/.test(text)) return "flash-sale";
  if (/限时|抢购|rush|limited/.test(text)) return "limited-rush";
  if (/品牌日|brand.?day/.test(text)) return "brand-day";
  if (/满量|满减|满赠|quantity|tier/.test(text)) return "quantity-tier";
  if (/会员日|member.?day/.test(text)) return "member-day";
  if (/大促|双11|618|年货节|big.?promo|festival/.test(text)) return "big-promo";
  if (/类目|category|品类/.test(text)) return "category-venue";
  if (/新品|首发|new.?launch|launch/.test(text)) return "new-launch";
  return "general";
}

function readBannerUrl(record: Record<string, unknown>): string | undefined {
  const banner = record.banner ?? record.bannerUrl ?? record.banner_url ?? record.coverImage ?? record.cover;
  if (typeof banner === "object" && banner !== null && "url" in banner) {
    const url = (banner as { url?: unknown }).url;
    if (typeof url === "string" && url) return url;
  }
  if (typeof banner === "string" && banner) return banner;
  return undefined;
}

function readActivityOffer(item: Record<string, unknown>): MallActivityOffer {
  const rules = readStringList(item.rules) ?? readStringList(item.rule) ?? readStringList(item.activityRules);
  const tags = readStringList(item.tags) ?? readStringList(item.tag);
  return {
    id: String(item.id ?? ""),
    title: String(item.title ?? item.name ?? "活动"),
    description: readString(item.description),
    status: String(item.status ?? "active"),
    startAt: readString(item.startAt) ?? readString(item.start_at),
    endAt: readString(item.endAt) ?? readString(item.end_at),
    activityType: detectActivityType(item),
    bannerUrl: readBannerUrl(item),
    rules: rules ?? DEFAULT_RULES,
    tags: tags,
    highlight: readString(item.highlight) ?? readString(item.subtitle),
    discountText: readString(item.discountText) ?? readString(item.discount_text),
  };
}

export async function listMallActivities(): Promise<MallActivityOffer[]> {
  const service = getSdkworkCommerceService();
  const response = await service.promotions.offers.list({ page: 1, page_size: 20 });
  const payload = unwrapSdkworkCommerceResponse(response) as { items?: Record<string, unknown>[] };
  return (
    payload.items
      ?.filter((item) => {
        const marker = [item.code, item.offerCode, item.offer_code, item.title, item.name]
          .map((value) => String(value ?? ""))
          .join(" ")
          .toLowerCase();
        return !marker.includes(MALL_CMS_OFFER_MARKER);
      })
      .map(readActivityOffer) ?? []
  );
}

export async function retrieveMallActivity(eventId: string): Promise<MallActivityOffer | null> {
  const service = getSdkworkCommerceService();
  const response = await service.promotions.offers.retrieve({ offerId: eventId });
  const item = unwrapSdkworkCommerceResponse(response) as Record<string, unknown>;
  if (!item || !item.id) {
    return null;
  }
  return readActivityOffer(item);
}

/**
 * 计算活动状态对应的倒计时目标时间
 * - upcoming: 距离开始时间
 * - active: 距离结束时间
 * - ended: null
 */
export function getActivityCountdownTarget(activity: MallActivityOffer): { target: Date; phase: "upcoming" | "active" | "ended" } | null {
  const now = Date.now();
  const startAt = activity.startAt ? new Date(activity.startAt).getTime() : null;
  const endAt = activity.endAt ? new Date(activity.endAt).getTime() : null;

  if (startAt && now < startAt) {
    return { target: new Date(startAt), phase: "upcoming" };
  }
  if (endAt && now < endAt) {
    return { target: new Date(endAt), phase: "active" };
  }
  if (endAt && now >= endAt) {
    return { target: new Date(endAt), phase: "ended" };
  }
  // 无时间信息，视为进行中无倒计时
  return null;
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function formatCountdown(target: Date): CountdownParts {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);
  return { days, hours, minutes, seconds };
}
