import {
  hasSdkworkAccountSession,
} from "@sdkwork/account-service";
import {
  getSdkworkBillingUsageRecordsLoader,
  type LoadSdkworkBillingUsageRecordsOptions,
} from "./billing-usage-loader";
import {
  toSdkworkPaymentNumber,
} from "@sdkwork/payment-service";
import {
  createSdkworkInvoiceService,
  type SdkworkInvoiceService,
  type SdkworkInvoiceSummary,
} from "@sdkwork/mall-pc-invoice";
import {
  createSdkworkOfferService,
  type SdkworkOfferDashboardData,
  type SdkworkOfferService,
} from "@sdkwork/mall-pc-offer";
import {
  createSdkworkPaymentService,
  type SdkworkPaymentService,
  type SdkworkPaymentSummary,
} from "@sdkwork/mall-pc-payment";
import {
  createSdkworkSubscriptionService,
  type SdkworkSubscriptionDashboardData,
  type SdkworkSubscriptionService,
} from "@sdkwork/mall-pc-subscription";
import {
  createSdkworkWalletService,
  type SdkworkWalletOverview,
  type SdkworkWalletService,
} from "@sdkwork/mall-pc-wallet";
import {
  createEmptySdkworkBillingUsageSummary,
  createSdkworkBillingBudgetPolicy,
  evaluateSdkworkBillingPosture,
  summarizeSdkworkBillingUsage,
  type SdkworkBillingAlert,
  type SdkworkBillingBreakdownKey,
  type SdkworkBillingBreakdownRow,
  type SdkworkBillingBudgetPolicy,
  type SdkworkBillingDigest,
  type SdkworkBillingPosture,
  type SdkworkBillingRecommendedAction,
  type SdkworkBillingUsageRecord,
} from "./billing";
import {
  createSdkworkBillingMessages,
  type SdkworkBillingMessagesOverrides,
} from "./billing-copy";

export interface SdkworkBillingSummary {
  activeSubscriptionPlans: number;
  availablePoints: number;
  bestOfferSavingsCny: number;
  currentLevelName: string;
  totalSpentCny: number | null;
}

export interface SdkworkBillingPaymentAttention {
  actionablePayments: number;
  availablePaymentMethods: number;
  outstandingAmountCny: number;
  recentPayments: SdkworkPaymentSummary[];
}

export interface SdkworkBillingInvoiceAttention {
  actionableInvoices: number;
  pendingInvoices: number;
  recentInvoices: SdkworkInvoiceSummary[];
}

export interface SdkworkBillingDashboardData {
  alerts: SdkworkBillingAlert[];
  breakdowns: Record<SdkworkBillingBreakdownKey, SdkworkBillingBreakdownRow[]>;
  budgetPolicy: SdkworkBillingBudgetPolicy;
  digest: SdkworkBillingDigest;
  invoiceAttention: SdkworkBillingInvoiceAttention;
  paymentAttention: SdkworkBillingPaymentAttention;
  posture: SdkworkBillingPosture;
  recentUsage: SdkworkBillingUsageRecord[];
  summary: SdkworkBillingSummary;
  topAction: SdkworkBillingRecommendedAction | null;
}

export interface GetSdkworkBillingDashboardOptions {
  referenceDate?: Date | string;
}

export type { LoadSdkworkBillingUsageRecordsOptions } from "./billing-usage-loader";

export interface CreateSdkworkBillingServiceOptions {
  budgetPolicy?: Partial<SdkworkBillingBudgetPolicy>;
  invoiceService?: Partial<Pick<SdkworkInvoiceService, "getDashboard">>;
  loadUsageRecords?: (options?: LoadSdkworkBillingUsageRecordsOptions) => Promise<SdkworkBillingUsageRecord[]>;
  locale?: string | null;
  messages?: SdkworkBillingMessagesOverrides;
  offerService?: Partial<Pick<SdkworkOfferService, "getDashboard" | "getEmptyDashboard">>;
  paymentService?: Partial<Pick<SdkworkPaymentService, "getDashboard">>;
  subscriptionService?: Partial<Pick<SdkworkSubscriptionService, "getDashboard">>;
  walletService?: Partial<Pick<SdkworkWalletService, "getOverview">>;
}

export interface SdkworkBillingService {
  getDashboard(options?: GetSdkworkBillingDashboardOptions): Promise<SdkworkBillingDashboardData>;
  getEmptyDashboard(): SdkworkBillingDashboardData;
}

type SdkworkBillingServiceCopy = ReturnType<typeof createSdkworkBillingMessages>["service"];

function createEmptyDashboard(
  budgetPolicy: Partial<SdkworkBillingBudgetPolicy> | undefined,
  copy: SdkworkBillingServiceCopy,
): SdkworkBillingDashboardData {
  const resolvedBudgetPolicy = createSdkworkBillingBudgetPolicy(budgetPolicy);
  const summary = createEmptySdkworkBillingUsageSummary(resolvedBudgetPolicy);

  return {
    alerts: [],
    breakdowns: summary.breakdowns,
    budgetPolicy: resolvedBudgetPolicy,
    digest: summary.digest,
    invoiceAttention: {
      actionableInvoices: 0,
      pendingInvoices: 0,
      recentInvoices: [],
    },
    paymentAttention: {
      actionablePayments: 0,
      availablePaymentMethods: 0,
      outstandingAmountCny: 0,
      recentPayments: [],
    },
    posture: "healthy",
    recentUsage: [],
    summary: {
      activeSubscriptionPlans: 0,
      availablePoints: 0,
      bestOfferSavingsCny: 0,
      currentLevelName: copy.guestLevelName,
      totalSpentCny: null,
    },
    topAction: null,
  };
}

function sumOutstandingAmount(records: readonly SdkworkPaymentSummary[]): number {
  return Math.round(
    records.reduce((sum, record) => {
      if (record.status !== "default" && record.status !== "pending") {
        return sum;
      }

      return sum + toSdkworkPaymentNumber(record.amountCny);
    }, 0) * 100,
  ) / 100;
}

function createSummary(
  walletOverview: SdkworkWalletOverview,
  subscriptionDashboard: SdkworkSubscriptionDashboardData,
  offerDashboard: SdkworkOfferDashboardData,
  copy: SdkworkBillingServiceCopy,
): SdkworkBillingSummary {
  return {
    activeSubscriptionPlans: subscriptionDashboard.plans.length,
    availablePoints: walletOverview.account.availablePoints,
    bestOfferSavingsCny: offerDashboard.digest.highlightedSavingsCny,
    currentLevelName:
      subscriptionDashboard.summary.currentLevelName
      || offerDashboard.inventory.currentLevelName
      || copy.guestLevelName,
    totalSpentCny: subscriptionDashboard.summary.totalSpent,
  };
}

export function createSdkworkBillingService(
  options: CreateSdkworkBillingServiceOptions = {},
): SdkworkBillingService {
  const copy = createSdkworkBillingMessages(options.locale, options.messages).service;
  const resolvedBudgetPolicy = createSdkworkBillingBudgetPolicy(options.budgetPolicy);
  const childServiceOptions = {
    locale: options.locale,
  };
  const walletService: Pick<SdkworkWalletService, "getOverview"> = options.walletService
    ? {
        ...createSdkworkWalletService(),
        ...options.walletService,
      }
    : createSdkworkWalletService();
  const subscriptionService: Pick<SdkworkSubscriptionService, "getDashboard"> = options.subscriptionService
    ? {
        ...createSdkworkSubscriptionService(childServiceOptions),
        ...options.subscriptionService,
      }
    : createSdkworkSubscriptionService(childServiceOptions);
  const paymentService: Pick<SdkworkPaymentService, "getDashboard"> = options.paymentService
    ? {
        ...createSdkworkPaymentService(childServiceOptions),
        ...options.paymentService,
      }
    : createSdkworkPaymentService(childServiceOptions);
  const invoiceService: Pick<SdkworkInvoiceService, "getDashboard"> = options.invoiceService
    ? {
        ...createSdkworkInvoiceService(childServiceOptions),
        ...options.invoiceService,
      }
    : createSdkworkInvoiceService(childServiceOptions);
  const offerService: Pick<SdkworkOfferService, "getDashboard" | "getEmptyDashboard"> = options.offerService
    ? {
        ...createSdkworkOfferService(childServiceOptions),
        ...options.offerService,
      }
    : createSdkworkOfferService(childServiceOptions);
  const loadUsageRecords = options.loadUsageRecords ?? ((config?: LoadSdkworkBillingUsageRecordsOptions) => {
    const loader = getSdkworkBillingUsageRecordsLoader();
    if (!loader) {
      return Promise.resolve([]);
    }
    return loader(config);
  });

  return {
    getEmptyDashboard() {
      return createEmptyDashboard(resolvedBudgetPolicy, copy);
    },

    async getDashboard(config = {}) {
      if (!hasSdkworkAccountSession()) {
        return createEmptyDashboard(resolvedBudgetPolicy, copy);
      }

      const walletOverview = await walletService.getOverview();
      if (!walletOverview.isAuthenticated) {
        return createEmptyDashboard(resolvedBudgetPolicy, copy);
      }

      const [usageRecords, subscriptionDashboard, paymentDashboard, invoiceDashboard, offerDashboard] = await Promise.all([
        loadUsageRecords({
          referenceDate: config.referenceDate,
        }),
        subscriptionService.getDashboard(),
        paymentService.getDashboard(),
        invoiceService.getDashboard(),
        offerService.getDashboard(),
      ]);
      const usageSummary = summarizeSdkworkBillingUsage(usageRecords, {
        budgetPolicy: resolvedBudgetPolicy,
        referenceDate: config.referenceDate,
      });
      const outstandingAmountCny = sumOutstandingAmount(paymentDashboard.records);
      const digest: SdkworkBillingDigest = {
        ...usageSummary.digest,
        outstandingAmountCny,
        savingsOpportunityCny: offerDashboard.digest.highlightedSavingsCny,
      };
      const posture = evaluateSdkworkBillingPosture({
        actionablePayments: paymentDashboard.digest.actionablePayments,
        digest,
        invoiceActionRequired: invoiceDashboard.digest.actionableInvoices,
        locale: options.locale,
        messages: options.messages,
        warningThreshold: resolvedBudgetPolicy.warningThreshold,
      });

      return {
        alerts: posture.alerts,
        breakdowns: usageSummary.breakdowns,
        budgetPolicy: resolvedBudgetPolicy,
        digest,
        invoiceAttention: {
          actionableInvoices: invoiceDashboard.digest.actionableInvoices,
          pendingInvoices: invoiceDashboard.statistics.pendingInvoices,
          recentInvoices: invoiceDashboard.invoices.slice(0, 5),
        },
        paymentAttention: {
          actionablePayments: paymentDashboard.digest.actionablePayments,
          availablePaymentMethods: paymentDashboard.methods.filter((method) => method.available).length,
          outstandingAmountCny,
          recentPayments: paymentDashboard.records.slice(0, 5),
        },
        posture: posture.status,
        recentUsage: usageSummary.recentUsage,
        summary: createSummary(walletOverview, subscriptionDashboard, offerDashboard, copy),
        topAction: posture.topAction,
      };
    },
  };
}

export const sdkworkBillingService = createSdkworkBillingService();
