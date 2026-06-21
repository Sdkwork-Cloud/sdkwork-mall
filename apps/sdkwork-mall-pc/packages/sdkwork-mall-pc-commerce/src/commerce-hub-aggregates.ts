import {
  getSdkworkCommerceService,
  hasSdkworkCommerceSession,
  unwrapSdkworkCommerceResponse,
  type SdkworkCommerceService,
} from "@sdkwork/commerce-service";
import type { SdkworkCouponDashboardData } from "@sdkwork/mall-pc-coupon";
import type { SdkworkMembershipDashboardData } from "@sdkwork/mall-pc-membership";

export interface MallHubOfferDigest {
  couponOffers: number;
  featuredOffers: number;
  highlightedSavingsCny: number;
  membershipOffers: number;
  rechargeOffers: number;
}

export interface MallHubOfferDashboard {
  digest: MallHubOfferDigest;
  featuredOffers: readonly MallHubFeaturedOffer[];
}

export interface MallHubFeaturedOffer {
  action: {
    capability: string;
    intent: string;
    route: string;
  };
  description?: string;
  estimatedSavingsCny: number;
  group: "coupon" | "membership" | "recharge";
  id: string;
  includedPoints?: number | null;
  kind: string;
  priceCny: number | null;
  recommended: boolean;
  tags: readonly string[];
  title: string;
}

export interface MallHubPaymentMethod {
  available: boolean;
  label: string;
}

export interface MallHubPaymentRecord {
  amountCny: number | null;
  createdAt: string;
  id: string;
  orderId?: string;
  outTradeNo?: string;
  paymentMethod?: string;
  paymentProvider?: string;
  paymentSn?: string;
  status: string;
  statusLabel: string;
}

export interface MallHubPaymentDashboard {
  digest: {
    actionablePayments: number;
  };
  methods: MallHubPaymentMethod[];
  records: MallHubPaymentRecord[];
  statistics: {
    pendingPayments: number;
  };
}

const EMPTY_OFFER_DIGEST: MallHubOfferDigest = {
  couponOffers: 0,
  featuredOffers: 0,
  highlightedSavingsCny: 0,
  membershipOffers: 0,
  rechargeOffers: 0,
};

export function createMallHubEmptyOfferDashboard(): MallHubOfferDashboard {
  return {
    digest: { ...EMPTY_OFFER_DIGEST },
    featuredOffers: [],
  };
}

export function composeMallHubOfferDashboard(input: {
  couponDashboard: SdkworkCouponDashboardData;
  membershipDashboard: SdkworkMembershipDashboardData;
  isAuthenticated: boolean;
}): MallHubOfferDashboard {
  if (!input.isAuthenticated) {
    return createMallHubEmptyOfferDashboard();
  }

  return {
    digest: {
      couponOffers: input.couponDashboard.catalogDigest.claimableCoupons,
      featuredOffers: 0,
      highlightedSavingsCny: 0,
      membershipOffers: input.membershipDashboard.benefits.length,
      rechargeOffers: 0,
    },
    featuredOffers: [],
  };
}

function createMallHubEmptyPaymentDashboard(): MallHubPaymentDashboard {
  return {
    digest: {
      actionablePayments: 0,
    },
    methods: [],
    records: [],
    statistics: {
      pendingPayments: 0,
    },
  };
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function toOptionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatPaymentStatusLabel(status: string): string {
  if (status === "success") {
    return "Completed";
  }
  if (status === "pending" || status === "default") {
    return "Pending payment";
  }
  if (status === "failed") {
    return "Failed";
  }
  if (status === "closed") {
    return "Closed";
  }
  if (status === "timeout") {
    return "Timed out";
  }
  return status || "Unknown";
}

function mapPaymentStatus(value: string | undefined): string {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "success" || normalized === "paid") {
    return "success";
  }
  if (normalized === "failed" || normalized === "fail") {
    return "failed";
  }
  if (normalized === "closed" || normalized === "close") {
    return "closed";
  }
  if (normalized === "timeout" || normalized === "expired") {
    return "timeout";
  }
  if (normalized === "pending" || normalized === "paying" || normalized === "default") {
    return "pending";
  }
  return normalized || "unknown";
}

function summarizePaymentRecords(records: readonly MallHubPaymentRecord[]) {
  return records.reduce(
    (summary, record) => {
      if (record.status === "pending" || record.status === "default") {
        summary.actionablePayments += 1;
      }
      if (record.status === "pending") {
        summary.pendingPayments += 1;
      }
      return summary;
    },
    {
      actionablePayments: 0,
      pendingPayments: 0,
    },
  );
}

export async function loadMallHubPaymentDashboard(
  commerceService?: SdkworkCommerceService,
): Promise<MallHubPaymentDashboard> {
  if (!hasSdkworkCommerceSession()) {
    return createMallHubEmptyPaymentDashboard();
  }

  const service = commerceService ?? getSdkworkCommerceService();
  const clientType = "WEB";

  try {
    const [methodsPayload, statisticsPayload, pagePayload] = await Promise.all([
      service.payments.methods.list({ clientType }),
      service.payments.statistics.retrieve(),
      service.payments.records.list({
        page: 1,
        pageSize: 20,
        sortDirection: "desc",
        sortField: "createdAt",
      }),
    ]);

    const methods = unwrapSdkworkCommerceResponse<Record<string, unknown>[]>(methodsPayload);
    const statistics = unwrapSdkworkCommerceResponse<Record<string, unknown> | null>(statisticsPayload);
    const page = unwrapSdkworkCommerceResponse<{ content?: Record<string, unknown>[] }>(pagePayload);

    const records = (page.content ?? []).map((payment) => {
      const status = mapPaymentStatus(toOptionalString(payment.status));

      return {
        amountCny: toOptionalNumber(payment.amount),
        createdAt: toOptionalString(payment.createdAt) ?? new Date(0).toISOString(),
        id: toOptionalString(payment.paymentId) ?? "unknown-payment",
        orderId: toOptionalString(payment.orderId),
        outTradeNo: toOptionalString(payment.outTradeNo),
        paymentMethod: toOptionalString(payment.paymentMethod),
        paymentProvider: toOptionalString(payment.paymentProvider),
        paymentSn: toOptionalString(payment.paymentSn),
        status,
        statusLabel: toOptionalString(payment.statusName) ?? formatPaymentStatusLabel(status),
      };
    });

    const digest = summarizePaymentRecords(records);

    return {
      digest: {
        actionablePayments: digest.actionablePayments,
      },
      methods: methods.map((method) => ({
        available: method.available !== false,
        label: toOptionalString(method.methodName) ?? toOptionalString(method.name) ?? "Payment",
      })),
      records,
      statistics: {
        pendingPayments:
          typeof statistics?.pendingPayments === "number" && Number.isFinite(statistics.pendingPayments)
            ? statistics.pendingPayments
            : digest.pendingPayments,
      },
    };
  } catch {
    return createMallHubEmptyPaymentDashboard();
  }
}
