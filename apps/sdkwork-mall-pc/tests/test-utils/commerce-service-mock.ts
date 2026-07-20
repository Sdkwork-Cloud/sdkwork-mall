import {
  configureSdkworkCommerceSessionTokenProvider,
  type SdkworkCommerceService,
  type SdkworkCommerceSessionTokens,
} from "@sdkwork/mall-commerce-service";
import {
  configureSdkworkAccountSessionTokenProvider,
  type SdkworkAccountSessionTokens,
} from "@sdkwork/account-service";
import {
  configureSdkworkMembershipSessionTokenProvider,
  type SdkworkMembershipAppService,
  type SdkworkMembershipSessionTokens,
} from "@sdkwork/membership-service";
import { APP_MEMBERSHIP_METHOD_TREE } from "@sdkwork/membership-sdk-ports";
import { APP_PAYMENT_METHOD_TREE } from "@sdkwork/payment-sdk-ports";
import {
  configureSdkworkPaymentSessionTokenProvider,
  type SdkworkPaymentAppService,
  type SdkworkPaymentSessionTokens,
} from "@sdkwork/payment-service";
import {
  configureSdkworkPromotionSessionTokenProvider,
  type SdkworkPromotionSessionTokens,
} from "@sdkwork/promotion-service";
import {
  SDKWORK_COMMERCE_APP_SDK_REQUIRED_METHODS,
  SDKWORK_COMMERCE_BACKEND_SDK_REQUIRED_METHODS,
} from "@sdkwork/mall-commerce-sdk-ports";
import { APP_ORDER_METHOD_TREE } from "@sdkwork/order-sdk-ports";
import {
  configureSdkworkOrderSessionTokenProvider,
  type SdkworkOrderAppService,
  type SdkworkOrderSessionTokens,
} from "@sdkwork/order-service";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: infer TArgs) => infer TReturn ? (...args: TArgs) => TReturn : DeepPartial<T[K]>;
};

type MockNode = ReturnType<typeof missing> | { [key: string]: MockNode };
type MockMethodTree = { readonly [key: string]: true | MockMethodTree };

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

function addMissingMethodsFromTree(
  root: { [key: string]: MockNode },
  tree: MockMethodTree,
  prefix: readonly string[] = [],
): void {
  for (const [key, marker] of Object.entries(tree)) {
    const path = [...prefix, key];
    if (marker === true) {
      addMissingMethod(root, path.join("."));
    } else {
      addMissingMethodsFromTree(root, marker, path);
    }
  }
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
  overrides: DeepPartial<SdkworkPaymentAppService> = {},
): SdkworkPaymentAppService {
  const service = {} as SdkworkPaymentAppService & { [key: string]: MockNode };
  addMissingMethodsFromTree(service, { payments: APP_PAYMENT_METHOD_TREE.payments });
  return mergeCommerceService(service, overrides);
}

export function configurePaymentServiceMockSession(
  tokens: SdkworkPaymentSessionTokens = { authToken: "payment-auth-token" },
): void {
  configureSdkworkPaymentSessionTokenProvider(() => tokens);
}

export function resetPaymentServiceMockSession(): void {
  configureSdkworkPaymentSessionTokenProvider(null);
}

export function createOrderServiceMock(
  overrides: DeepPartial<SdkworkOrderAppService> = {},
): SdkworkOrderAppService {
  const service = {} as SdkworkOrderAppService & { [key: string]: MockNode };
  addMissingMethodsFromTree(service, APP_ORDER_METHOD_TREE);
  return mergeCommerceService(service, overrides);
}

export function createMembershipServiceMock(
  overrides: DeepPartial<SdkworkMembershipAppService> = {},
): SdkworkMembershipAppService {
  const service = {} as SdkworkMembershipAppService & { [key: string]: MockNode };
  addMissingMethodsFromTree(service, APP_MEMBERSHIP_METHOD_TREE);
  return mergeCommerceService(service, overrides);
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

export function configureOrderServiceMockSession(
  tokens: SdkworkOrderSessionTokens = { authToken: "order-auth-token" },
): void {
  configureSdkworkOrderSessionTokenProvider(() => tokens);
}

export function resetOrderServiceMockSession(): void {
  configureSdkworkOrderSessionTokenProvider(null);
}
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
