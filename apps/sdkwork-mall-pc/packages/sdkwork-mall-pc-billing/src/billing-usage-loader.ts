import type { SdkworkBillingUsageRecord } from "./billing";

export interface LoadSdkworkBillingUsageRecordsOptions {
  referenceDate?: Date | string;
}

export type SdkworkBillingUsageRecordsLoader = (
  options?: LoadSdkworkBillingUsageRecordsOptions,
) => Promise<SdkworkBillingUsageRecord[]>;

let billingUsageRecordsLoader: SdkworkBillingUsageRecordsLoader | null = null;

export function configureSdkworkBillingUsageRecordsLoader(
  loader: SdkworkBillingUsageRecordsLoader | null,
): void {
  billingUsageRecordsLoader = loader;
}

export function getSdkworkBillingUsageRecordsLoader(): SdkworkBillingUsageRecordsLoader | null {
  return billingUsageRecordsLoader;
}
