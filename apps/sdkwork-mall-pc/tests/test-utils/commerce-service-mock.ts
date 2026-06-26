import {
  configureSdkworkCommerceSessionTokenProvider,
  type SdkworkCommerceService,
  type SdkworkCommerceSessionTokens,
} from "@sdkwork/commerce-service";
import {
  configureSdkworkAccountSessionTokenProvider,
  type SdkworkAccountSessionTokens,
} from "@sdkwork/account-service";
import {
  configureSdkworkMembershipSessionTokenProvider,
  type SdkworkMembershipSessionTokens,
} from "@sdkwork/membership-service";
import {
  configureSdkworkPromotionSessionTokenProvider,
  type SdkworkPromotionSessionTokens,
} from "@sdkwork/promotion-service";
import {
  SDKWORK_COMMERCE_APP_SDK_REQUIRED_METHODS,
  SDKWORK_COMMERCE_BACKEND_SDK_REQUIRED_METHODS,
} from "@sdkwork/commerce-sdk-ports";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: infer TArgs) => infer TReturn ? (...args: TArgs) => TReturn : DeepPartial<T[K]>;
};

type MockNode = ReturnType<typeof missing> | { [key: string]: MockNode };

export function createCommerceServiceMock(
  overrides: DeepPartial<SdkworkCommerceService> = {},
): SdkworkCommerceService {
  return mergeCommerceService(createDefaultCommerceServiceMock(), overrides);
}

export function configureCommerceServiceMockSession(
  tokens: SdkworkCommerceSessionTokens = { authToken: "commerce-auth-token" },
): void {
  configureSdkworkCommerceSessionTokenProvider(() => tokens);
}

export function resetCommerceServiceMockSession(): void {
  configureSdkworkCommerceSessionTokenProvider(null);
}

function createDefaultCommerceServiceMock(): SdkworkCommerceService {
  const service = {} as SdkworkCommerceService & { [key: string]: MockNode };

  for (const method of SDKWORK_COMMERCE_APP_SDK_REQUIRED_METHODS) {
    addMissingMethod(service, method.replace(/^commerce\./, ""));
  }

  const admin = {} as SdkworkCommerceService["admin"] & { [key: string]: MockNode };
  for (const method of SDKWORK_COMMERCE_BACKEND_SDK_REQUIRED_METHODS) {
    addMissingMethod(admin, method.replace(/^commerce\./, ""));
  }
  service.admin = admin;

  return service;
}

function addMissingMethod(root: { [key: string]: MockNode }, method: string): void {
  let node = root;
  const segments = method.split(".");
  for (const segment of segments.slice(0, -1)) {
    const child = node[segment];
    if (!child || typeof child === "function") {
      node[segment] = {};
    }
    node = node[segment] as { [key: string]: MockNode };
  }

  node[segments.at(-1)!] = missing(method);
}

function missing(name: string) {
  return async () => {
    throw new Error(`Missing commerce service test method: ${name}`);
  };
}

function mergeCommerceService<T>(base: T, overrides: DeepPartial<T>): T {
  for (const [key, value] of Object.entries(overrides as Record<string, unknown>)) {
    if (
      value
      && typeof value === "object"
      && !Array.isArray(value)
      && typeof (base as Record<string, unknown>)[key] === "object"
    ) {
      mergeCommerceService((base as Record<string, unknown>)[key], value as DeepPartial<unknown>);
    } else {
      (base as Record<string, unknown>)[key] = value;
    }
  }

  return base;
}

export function createPaymentServiceMock(
  overrides: DeepPartial<SdkworkCommerceService> = {},
) {
  return createCommerceServiceMock(overrides);
}

export const configurePaymentServiceMockSession = configureCommerceServiceMockSession;
export const resetPaymentServiceMockSession = resetCommerceServiceMockSession;

export function createOrderServiceMock(
  overrides: DeepPartial<SdkworkCommerceService> = {},
) {
  return createCommerceServiceMock(overrides);
}

export function createMembershipServiceMock(
  overrides: DeepPartial<SdkworkCommerceService> = {},
) {
  return createCommerceServiceMock(overrides);
}

export function createPromotionServiceMock(
  overrides: DeepPartial<SdkworkCommerceService> = {},
) {
  return createCommerceServiceMock(overrides);
}

export function createAccountServiceMock(
  overrides: DeepPartial<SdkworkCommerceService> = {},
) {
  return createCommerceServiceMock(overrides);
}

export const configureOrderServiceMockSession = configureCommerceServiceMockSession;
export const resetOrderServiceMockSession = resetCommerceServiceMockSession;
export function configureMembershipServiceMockSession(
  tokens: SdkworkMembershipSessionTokens = { authToken: "membership-auth-token" },
): void {
  configureSdkworkMembershipSessionTokenProvider(() => tokens);
}

export function resetMembershipServiceMockSession(): void {
  configureSdkworkMembershipSessionTokenProvider(null);
}
export function configurePromotionServiceMockSession(
  tokens: SdkworkPromotionSessionTokens = { authToken: "promotion-auth-token" },
): void {
  configureSdkworkPromotionSessionTokenProvider(() => tokens);
}

export function resetPromotionServiceMockSession(): void {
  configureSdkworkPromotionSessionTokenProvider(null);
}
export function configureAccountServiceMockSession(
  tokens: SdkworkAccountSessionTokens = { authToken: "account-auth-token" },
): void {
  configureSdkworkAccountSessionTokenProvider(() => tokens);
}

export function resetAccountServiceMockSession(): void {
  configureSdkworkAccountSessionTokenProvider(null);
}
