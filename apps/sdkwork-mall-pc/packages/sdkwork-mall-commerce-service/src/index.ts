import type {
  CommerceAppSdkClient,
  CommerceBackendSdkClient,
  SdkworkCommerceService,
} from "@sdkwork/mall-commerce-sdk-ports";

export type { SdkworkCommerceService };

export type SdkworkCommerceServiceProvider = () => SdkworkCommerceService;

export interface SdkworkCommerceSessionTokens {
  accessToken?: string;
  authToken?: string;
  refreshToken?: string;
}

export type SdkworkCommerceSessionTokenProvider = () => SdkworkCommerceSessionTokens;

export interface CreateSdkworkCommerceServiceInput {
  appClient: CommerceAppSdkClient;
  backendClient?: CommerceBackendSdkClient;
}

export interface SdkworkCommerceResponseEnvelope<T> {
  code?: number | string;
  data?: T;
  message?: string;
  msg?: string;
}

let sdkworkCommerceServiceProvider: SdkworkCommerceServiceProvider | null = null;
let sdkworkCommerceSessionTokenProvider: SdkworkCommerceSessionTokenProvider = () => ({});

function isSuccessCode(code: unknown): boolean {
  if (code === undefined || code === null || code === "") {
    return true;
  }
  if (typeof code === "number") {
    return code === 0;
  }
  const normalized = String(code).trim();
  return normalized === "0" || normalized.toLowerCase() === "success";
}

export function configureSdkworkCommerceServiceProvider(
  provider: SdkworkCommerceServiceProvider | null,
): void {
  sdkworkCommerceServiceProvider = provider;
}

export function configureSdkworkCommerceSessionTokenProvider(
  provider: SdkworkCommerceSessionTokenProvider | null,
): void {
  sdkworkCommerceSessionTokenProvider = provider ?? (() => ({}));
}

export function getSdkworkCommerceService(): SdkworkCommerceService {
  if (!sdkworkCommerceServiceProvider) {
    throw new Error("Sdkwork commerce service provider is not configured.");
  }
  return sdkworkCommerceServiceProvider();
}

export function createSdkworkCommerceService(
  input: CreateSdkworkCommerceServiceInput,
): SdkworkCommerceService {
  const app = input.appClient.commerce;
  const backend = input.backendClient?.commerce;
  return {
    ...app,
    admin: backend ?? ({} as CommerceBackendSdkClient["commerce"]),
  } as SdkworkCommerceService;
}

export function unwrapSdkworkCommerceResponse<T>(
  value: unknown,
  fallbackMessage = "Request failed.",
): T {
  if (!value || typeof value !== "object") {
    return value as T;
  }
  if (!("data" in value) && !("code" in value)) {
    return value as T;
  }
  const envelope = value as SdkworkCommerceResponseEnvelope<T>;
  if (!isSuccessCode(envelope.code)) {
    throw new Error(String(envelope.message || envelope.msg || fallbackMessage).trim());
  }
  return (envelope.data ?? null) as T;
}

export function readSdkworkCommerceSessionTokens(): SdkworkCommerceSessionTokens {
  return sdkworkCommerceSessionTokenProvider();
}
