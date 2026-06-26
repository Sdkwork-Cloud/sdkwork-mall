import {
  composeMallHubOfferDashboard,
  createMallHubEmptyOfferDashboard,
  loadMallHubPaymentDashboard,
  type MallHubFeaturedOffer,
  type MallHubOfferDashboard,
  type MallHubOfferDigest,
  type MallHubPaymentDashboard,
  type MallHubPaymentRecord,
} from "./commerce-hub-aggregates";
import {
  createSdkworkCommerceMessages,
  formatSdkworkCommerceTemplate,
  type SdkworkCommerceMessagesOverrides,
} from "./commerce-copy";
import {
  createSdkworkCouponService,
  type SdkworkCouponDashboardData,
  type SdkworkCouponService,
  type SdkworkUserCoupon,
} from "@sdkwork/mall-pc-coupon";
import {
  createSdkworkInvoiceService,
  type SdkworkInvoiceDashboardData,
  type SdkworkInvoiceService,
  type SdkworkInvoiceSummary,
} from "@sdkwork/mall-pc-invoice";
import {
  createSdkworkOrderService,
  type SdkworkOrderDashboardData,
  type SdkworkOrderService,
  type SdkworkOrderSummary,
} from "@sdkwork/mall-pc-order";
import {
  createSdkworkPointsService,
  type SdkworkPointsDashboardData,
  type SdkworkPointsService,
  type SdkworkPointsTransaction,
} from "@sdkwork/mall-pc-points";
import {
  createSdkworkMembershipService,
  type SdkworkMembershipDashboardData,
  type SdkworkMembershipService,
} from "@sdkwork/mall-pc-membership";
import {
  createSdkworkWalletService,
  type SdkworkWalletOverview,
  type SdkworkWalletService,
} from "@sdkwork/mall-pc-wallet";

export type SdkworkCommerceAlertSeverity = "danger" | "info" | "warning";

export interface SdkworkCommerceSummary {
  actionablePayments: number;
  availableCoupons: number;
  availablePoints: number;
  availablePaymentMethods: number;
  bestOfferSavingsCny: number;
  claimableCoupons: number;
  claimedBenefits: number;
  currentLevelName: string;
  expiringSoonCoupons: number;
  featuredOffers: number;
  invoiceActionRequired: number;
  invoicePendingCount: number;
  isAuthenticated: boolean;
  pendingPaymentOrders: number;
  totalOrders: number;
  totalSpentCny: number | null;
  membershipRemainingDays: number | null;
}

export interface SdkworkCommerceAnalyticsSummary {
  activeAlerts: number;
  averageOrderValueCny: number;
  totalRevenueCny: number;
  totalRevenueRecords: number;
  totalSuccessfulOrders: number;
}

export interface SdkworkCommerceRevenueTrendPoint {
  averageOrderValueCny: number;
  bucketKey: string;
  label: string;
  orders: number;
  revenueCny: number;
}

export interface SdkworkCommerceRevenueRecord {
  amountCny: number;
  channel: string;
  id: string;
  orderNo: string;
  productTitle: string;
  status: string;
  timestamp: string;
}

export interface SdkworkCommerceProductPerformance {
  id: string;
  orderCount: number;
  sharePercent: number;
  title: string;
  totalRevenueCny: number;
  trendDeltaPercent: number;
}

export interface SdkworkCommerceAlert {
  description: string;
  id: string;
  metric: string;
  severity: SdkworkCommerceAlertSeverity;
  title: string;
}

export interface SdkworkCommerceSnapshot {
  alerts: SdkworkCommerceAlert[];
  analyticsSummary: SdkworkCommerceAnalyticsSummary;
  featuredOffers: SdkworkCommerceFeaturedOffer[];
  offerDigest: SdkworkOfferDigest;
  productPerformance: SdkworkCommerceProductPerformance[];
  recentCoupons: SdkworkUserCoupon[];
  recentInvoices: SdkworkInvoiceSummary[];
  recentOrders: SdkworkOrderSummary[];
  recentPayments: SdkworkCommercePaymentSummary[];
  recentRevenueRecords: SdkworkCommerceRevenueRecord[];
  recentTransactions: SdkworkPointsTransaction[];
  revenueTrend: SdkworkCommerceRevenueTrendPoint[];
  summary: SdkworkCommerceSummary;
}

export type SdkworkOfferDigest = MallHubOfferDigest;

export interface SdkworkCommerceFeaturedOffer {
  action: MallHubFeaturedOffer["action"];
  description?: string;
  estimatedSavingsCny: number;
  group: MallHubFeaturedOffer["group"];
  id: string;
  includedPoints?: number | null;
  kind: string;
  priceCny: number | null;
  recommended: boolean;
  tags: readonly string[];
  title: string;
}

export interface SdkworkCommercePaymentSummary {
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

export interface CreateSdkworkCommerceServiceOptions {
  couponService?: Pick<SdkworkCouponService, "getDashboard">;
  invoiceService?: Pick<SdkworkInvoiceService, "getDashboard">;
  locale?: string | null;
  loadPaymentDashboard?: () => Promise<MallHubPaymentDashboard>;
  messages?: SdkworkCommerceMessagesOverrides;
  orderService?: Pick<SdkworkOrderService, "getDashboard">;
  pointsService?: Pick<SdkworkPointsService, "getDashboard">;
  membershipService?: Pick<SdkworkMembershipService, "getDashboard">;
  walletService?: Pick<SdkworkWalletService, "getOverview">;
}

export interface SdkworkCommerceHubService {
  getEmptySnapshot(): SdkworkCommerceSnapshot;
  getSnapshot(): Promise<SdkworkCommerceSnapshot>;
}

function createEmptySnapshot(guestLabel: string): SdkworkCommerceSnapshot {
  const offerDashboard = createMallHubEmptyOfferDashboard();

  return {
    alerts: [],
    analyticsSummary: {
      activeAlerts: 0,
      averageOrderValueCny: 0,
      totalRevenueCny: 0,
      totalRevenueRecords: 0,
      totalSuccessfulOrders: 0,
    },
    featuredOffers: [],
    offerDigest: offerDashboard.digest,
    productPerformance: [],
    recentCoupons: [],
    recentInvoices: [],
    recentOrders: [],
    recentPayments: [],
    recentRevenueRecords: [],
    recentTransactions: [],
    revenueTrend: [],
    summary: {
      actionablePayments: 0,
      availableCoupons: 0,
      availablePoints: 0,
      availablePaymentMethods: 0,
      bestOfferSavingsCny: 0,
      claimableCoupons: 0,
      claimedBenefits: 0,
      currentLevelName: guestLabel,
      expiringSoonCoupons: 0,
      featuredOffers: 0,
      invoiceActionRequired: 0,
      invoicePendingCount: 0,
      isAuthenticated: false,
      pendingPaymentOrders: 0,
      totalOrders: 0,
      totalSpentCny: null,
      membershipRemainingDays: null,
    },
  };
}

function roundMetric(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function toTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatTrendLabel(value: string, locale: string): string {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(timestamp);
}

function createSummary(
  walletOverview: SdkworkWalletOverview,
  couponDashboard: SdkworkCouponDashboardData,
  membershipDashboard: SdkworkMembershipDashboardData,
  offerDashboard: MallHubOfferDashboard,
  visibleFeaturedOffersCount: number,
  orderDashboard: SdkworkOrderDashboardData,
  invoiceDashboard: SdkworkInvoiceDashboardData,
  paymentDashboard: MallHubPaymentDashboard,
  guestLabel: string,
): SdkworkCommerceSummary {
  return {
    actionablePayments: paymentDashboard.digest.actionablePayments,
    availableCoupons: couponDashboard.userDigest.availableCoupons,
    availablePoints: walletOverview.account.availablePoints,
    availablePaymentMethods: paymentDashboard.methods.filter((method) => method.available).length,
    bestOfferSavingsCny: offerDashboard.digest.highlightedSavingsCny,
    claimableCoupons: couponDashboard.catalogDigest.claimableCoupons,
    claimedBenefits: membershipDashboard.benefits.filter((benefit) => benefit.claimed).length,
    currentLevelName:
      membershipDashboard.summary.currentLevelName
      || guestLabel,
    expiringSoonCoupons: couponDashboard.userDigest.expiringSoonCoupons,
    featuredOffers: visibleFeaturedOffersCount,
    invoiceActionRequired: invoiceDashboard.digest.actionableInvoices,
    invoicePendingCount: invoiceDashboard.statistics.pendingInvoices,
    isAuthenticated: walletOverview.isAuthenticated,
    pendingPaymentOrders: orderDashboard.statistics.pendingPayment,
    totalOrders: orderDashboard.statistics.totalOrders,
    totalSpentCny: membershipDashboard.summary.totalSpent,
    membershipRemainingDays: membershipDashboard.summary.remainingDays,
  };
}

function createAnalyticsSummary(
  orderDashboard: SdkworkOrderDashboardData,
  alerts: readonly SdkworkCommerceAlert[],
): SdkworkCommerceAnalyticsSummary {
  const totalRevenueCny = orderDashboard.statistics.totalAmountCny ?? 0;
  const totalRevenueRecords = orderDashboard.statistics.totalOrders;

  return {
    activeAlerts: alerts.length,
    averageOrderValueCny:
      totalRevenueRecords > 0 ? roundMetric(totalRevenueCny / totalRevenueRecords) : 0,
    totalRevenueCny,
    totalRevenueRecords,
    totalSuccessfulOrders: orderDashboard.statistics.completed,
  };
}

function createRevenueRecords(
  paymentDashboard: MallHubPaymentDashboard,
  orderDashboard: SdkworkOrderDashboardData,
  fallbackTitle: string,
): SdkworkCommerceRevenueRecord[] {
  const orderById = new Map(orderDashboard.orders.map((order) => [order.id, order]));

  return paymentDashboard.records
    .filter((record) => record.status === "success")
    .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt))
    .slice(0, 10)
    .map((record) => {
      const order = record.orderId ? orderById.get(record.orderId) : undefined;

      return {
        amountCny: record.amountCny ?? 0,
        channel: record.paymentProvider || record.paymentMethod || "--",
        id: record.orderId || record.id,
        orderNo: record.outTradeNo || record.orderId || record.id,
        productTitle: order?.subject || fallbackTitle,
        status: record.status,
        timestamp: record.createdAt,
      };
    });
}

function createRevenueTrend(
  records: readonly SdkworkCommerceRevenueRecord[],
  locale: string,
): SdkworkCommerceRevenueTrendPoint[] {
  const buckets = new Map<string, { orders: number; revenueCny: number }>();

  for (const record of records) {
    const bucketKey = record.timestamp.slice(0, 10);
    const current = buckets.get(bucketKey) ?? {
      orders: 0,
      revenueCny: 0,
    };

    current.orders += 1;
    current.revenueCny += record.amountCny;
    buckets.set(bucketKey, current);
  }

  return Array.from(buckets.entries())
    .sort((left, right) => toTimestamp(left[0]) - toTimestamp(right[0]))
    .map(([bucketKey, bucket]) => ({
      averageOrderValueCny: bucket.orders > 0 ? roundMetric(bucket.revenueCny / bucket.orders) : 0,
      bucketKey,
      label: formatTrendLabel(bucketKey, locale),
      orders: bucket.orders,
      revenueCny: roundMetric(bucket.revenueCny),
    }));
}

function createProductPerformance(
  records: readonly SdkworkCommerceRevenueRecord[],
  fallbackTitle: string,
): SdkworkCommerceProductPerformance[] {
  const rows = new Map<string, { orderCount: number; totalRevenueCny: number; title: string }>();

  for (const record of records) {
    const key = record.productTitle.trim().toLowerCase() || record.id;
    const current = rows.get(key) ?? {
      orderCount: 0,
      title: record.productTitle || fallbackTitle,
      totalRevenueCny: 0,
    };

    current.orderCount += 1;
    current.totalRevenueCny += record.amountCny;
    rows.set(key, current);
  }

  const totalRevenue = Array.from(rows.values()).reduce((sum, row) => sum + row.totalRevenueCny, 0);

  return Array.from(rows.entries())
    .map(([key, row]) => ({
      id: key,
      orderCount: row.orderCount,
      sharePercent: totalRevenue > 0 ? roundMetric((row.totalRevenueCny / totalRevenue) * 100, 1) : 0,
      title: row.title,
      totalRevenueCny: roundMetric(row.totalRevenueCny),
      trendDeltaPercent: 0,
    }))
    .sort((left, right) => right.totalRevenueCny - left.totalRevenueCny);
}

function createAlerts(
  summary: SdkworkCommerceSummary,
  paymentDashboard: MallHubPaymentDashboard,
  copy: ReturnType<typeof createSdkworkCommerceMessages>["service"],
): SdkworkCommerceAlert[] {
  const alerts: SdkworkCommerceAlert[] = [];

  if (summary.pendingPaymentOrders > 0 || paymentDashboard.statistics.pendingPayments > 0) {
    const pendingCount = Math.max(summary.pendingPaymentOrders, paymentDashboard.statistics.pendingPayments);
    alerts.push({
      description: formatSdkworkCommerceTemplate(copy.pendingPaymentDescriptionValue, {
        value: String(pendingCount),
      }),
      id: "payments-pending",
      metric: formatSdkworkCommerceTemplate(copy.pendingPaymentMetricValue, {
        value: String(pendingCount),
      }),
      severity: "warning",
      title: copy.pendingPaymentTitle,
    });
  }

  if (summary.invoiceActionRequired > 0) {
    alerts.push({
      description: formatSdkworkCommerceTemplate(copy.invoiceActionRequiredDescriptionValue, {
        value: String(summary.invoiceActionRequired),
      }),
      id: "invoices-action-required",
      metric: formatSdkworkCommerceTemplate(copy.invoiceActionRequiredMetricValue, {
        value: String(summary.invoiceActionRequired),
      }),
      severity: "danger",
      title: copy.invoiceActionRequiredTitle,
    });
  }

  if (!summary.isAuthenticated) {
    alerts.push({
      description: copy.authRequiredDescription,
      id: "commerce-auth-required",
      metric: copy.authRequiredMetric,
      severity: "info",
      title: copy.authRequiredTitle,
    });
  }

  if (summary.availablePaymentMethods <= 1) {
    alerts.push({
      description: copy.paymentCoverageDescription,
      id: "payment-method-coverage",
      metric: formatSdkworkCommerceTemplate(copy.paymentCoverageMetricValue, {
        value: String(summary.availablePaymentMethods),
      }),
      severity: "warning",
      title: copy.paymentCoverageTitle,
    });
  }

  return alerts;
}

function toSdkworkCommerceFeaturedOffer(
  offer: MallHubFeaturedOffer,
): SdkworkCommerceFeaturedOffer {
  return {
    action: offer.action,
    description: offer.description,
    estimatedSavingsCny: offer.estimatedSavingsCny,
    group: offer.group,
    id: offer.id,
    includedPoints: offer.includedPoints,
    kind: offer.kind,
    priceCny: offer.priceCny,
    recommended: offer.recommended,
    tags: offer.tags,
    title: offer.title,
  };
}

function toSdkworkCommercePaymentSummary(
  record: MallHubPaymentRecord,
): SdkworkCommercePaymentSummary {
  return {
    amountCny: record.amountCny,
    createdAt: record.createdAt,
    id: record.id,
    orderId: record.orderId,
    outTradeNo: record.outTradeNo,
    paymentMethod: record.paymentMethod,
    paymentProvider: record.paymentProvider,
    paymentSn: record.paymentSn,
    status: record.status,
    statusLabel: record.statusLabel,
  };
}

export function createSdkworkCommerceService(
  options: CreateSdkworkCommerceServiceOptions = {},
): SdkworkCommerceHubService {
  const locale = options.locale ?? "en-US";
  const copy = createSdkworkCommerceMessages(locale, options.messages);
  const walletService = options.walletService ?? createSdkworkWalletService({ locale });
  const couponService = options.couponService ?? createSdkworkCouponService({ locale });
  const pointsService = options.pointsService ?? createSdkworkPointsService({ locale });
  const membershipService = options.membershipService ?? createSdkworkMembershipService({ locale });
  const invoiceService = options.invoiceService ?? createSdkworkInvoiceService({ locale });
  const orderService = options.orderService ?? createSdkworkOrderService({ locale });
  const loadPaymentDashboard = options.loadPaymentDashboard ?? loadMallHubPaymentDashboard;

  return {
    getEmptySnapshot() {
      return createEmptySnapshot(copy.common.guest);
    },

    async getSnapshot() {
      const walletOverview = await walletService.getOverview();
      if (!walletOverview.isAuthenticated) {
        return createEmptySnapshot(copy.common.guest);
      }

      const [couponDashboard, pointsDashboard, membershipDashboard, invoiceDashboard, orderDashboard, paymentDashboard] = await Promise.all([
        couponService.getDashboard(),
        pointsService.getDashboard(),
        membershipService.getDashboard(),
        invoiceService.getDashboard(),
        orderService.getDashboard(),
        loadPaymentDashboard(),
      ]);
      const offerDashboard = composeMallHubOfferDashboard({
        couponDashboard,
        isAuthenticated: walletOverview.isAuthenticated,
        membershipDashboard,
      });
      const visibleFeaturedOffers = offerDashboard.featuredOffers
        .slice(0, 4)
        .map(toSdkworkCommerceFeaturedOffer);
      const summary = createSummary(
        walletOverview,
        couponDashboard,
        membershipDashboard,
        offerDashboard,
        visibleFeaturedOffers.length,
        orderDashboard,
        invoiceDashboard,
        paymentDashboard,
        copy.common.guest,
      );
      const alerts = createAlerts(summary, paymentDashboard, copy.service);
      const recentRevenueRecords = createRevenueRecords(
        paymentDashboard,
        orderDashboard,
        copy.service.commercialOrderFallback,
      );
      const revenueTrend = createRevenueTrend(recentRevenueRecords, locale);
      const productPerformance = createProductPerformance(
        recentRevenueRecords,
        copy.service.commercialOrderFallback,
      );

      return {
        alerts,
        analyticsSummary: createAnalyticsSummary(orderDashboard, alerts),
        featuredOffers: visibleFeaturedOffers,
        offerDigest: offerDashboard.digest,
        productPerformance,
        recentCoupons: couponDashboard.myCoupons.slice(0, 5),
        recentInvoices: invoiceDashboard.invoices.slice(0, 5),
        recentOrders: orderDashboard.orders.slice(0, 5),
        recentPayments: paymentDashboard.records.slice(0, 5).map(toSdkworkCommercePaymentSummary),
        recentRevenueRecords,
        recentTransactions: pointsDashboard.transactions.slice(0, 5),
        revenueTrend,
        summary,
      };
    },
  };
}

export const sdkworkCommerceService = createSdkworkCommerceService();
