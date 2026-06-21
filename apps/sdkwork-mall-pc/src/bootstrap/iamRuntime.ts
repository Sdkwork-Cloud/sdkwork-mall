import { createClient as createAppbaseAppClient, type SdkworkAppClient } from "@sdkwork/appbase-app-sdk";
import {
  createSdkworkAppbasePcAuthRuntime,
  type SdkworkAppbasePcAuthRuntimeComposition,
  type SdkworkAppbasePcAuthRuntimeSdkClient,
} from "@sdkwork/auth-runtime-pc-react";
import type { IamAppContext, IamDeploymentMode, IamEnvironment } from "@sdkwork/iam-contracts";
import type { IamRuntime } from "@sdkwork/iam-runtime";
import { normalizeSdkworkApiBaseUrl } from "@sdkwork/runtime-bootstrap";
import { createClient as createCommerceAppClient } from "sdkwork-commerce-app-sdk-generated-typescript";
import { createClient as createCommerceBackendClient } from "sdkwork-commerce-backend-sdk-generated-typescript";

import type { SdkworkMallPcRuntimeConfig } from "./environment";
import {
  createSdkworkMallPcSessionStore,
  type SdkworkMallPcSessionSnapshot,
  type SdkworkMallPcSessionStore,
} from "./sessionStore";
import { createSdkworkMallPcSessionTokenManager } from "./sessionTokenManager";
import type { SdkworkMallPcSdkClientInventory } from "./sdkClients";

const APPBASE_APP_SDK_FAMILY_ID = "sdkwork-appbase-app-sdk";
const APP_API_PREFIX = "/app/v3/api";
const BACKEND_API_PREFIX = "/backend/v3/api";

export type SdkworkMallPcIamRuntime = IamRuntime & {
  composition: SdkworkAppbasePcAuthRuntimeComposition;
  session: SdkworkMallPcSessionStore;
};

export interface CreateSdkworkMallPcIamRuntimeOptions {
  config: SdkworkMallPcRuntimeConfig;
  sdkClients: SdkworkMallPcSdkClientInventory;
  session?: SdkworkMallPcSessionStore;
}

interface CommerceIamSessionLike {
  accessToken?: string;
  authToken?: string;
  refreshToken?: string;
  sessionId?: string;
  context?: IamAppContext;
}

export function createSdkworkMallPcIamRuntime(
  options: CreateSdkworkMallPcIamRuntimeOptions,
): SdkworkMallPcIamRuntime {
  const session = options.session ?? createSdkworkMallPcSessionStore(resolveSessionStorage());
  const tokenManager = createSdkworkMallPcSessionTokenManager(session);
  const appbaseAppClient = createAppbaseGeneratedAppClient(options.config, tokenManager);
  const composition = createSdkworkAppbasePcAuthRuntime({
    app: {
      appId: options.config.appKey,
      deploymentMode: toIamDeploymentMode(options.config.deploymentMode),
      environment: toIamEnvironment(options.config.environment),
      platform: "pc",
    },
    baseUrls: {
      appbaseAppApiBaseUrl: resolveAppbaseAppApiBaseUrl(options.config),
    },
    createAppbaseAppClient: () => appbaseAppClient,
    localeProvider: () => options.config.i18n.defaultLocale,
    sdkClients: [
      options.sdkClients.commerceAppClient,
      options.sdkClients.commerceBackendClient,
    ] as SdkworkAppbasePcAuthRuntimeSdkClient[],
    sessionBridge: {
      clearSession: () => {
        session.clearSession();
      },
      commitSession: (nextSession) => commitCommerceIamRuntimeSession(session, nextSession as CommerceIamSessionLike),
      readSession: () => toCommerceIamBridgeSession(session.getSnapshot()),
    },
    tokenManager,
  });

  return {
    ...composition.runtime,
    composition,
    session,
  };
}

export function createSdkworkMallPcSdkClientsWithTokenManager(
  config: SdkworkMallPcRuntimeConfig,
  tokenManager: ReturnType<typeof createSdkworkMallPcSessionTokenManager>,
): SdkworkMallPcSdkClientInventory {
  const commerceAppClient = createCommerceAppClient({
    authMode: "dual-token",
    baseUrl: normalizeGeneratedSdkBaseUrl(config.appApiBaseUrl, APP_API_PREFIX),
    platform: "pc",
    tokenManager,
  });
  const commerceBackendClient = config.backendApiBaseUrl
    ? createCommerceBackendClient({
        authMode: "dual-token",
        baseUrl: normalizeGeneratedSdkBaseUrl(config.backendApiBaseUrl, BACKEND_API_PREFIX),
        platform: "pc",
        tokenManager,
      })
    : undefined;

  commerceAppClient.setTokenManager(tokenManager);
  commerceBackendClient?.setTokenManager(tokenManager);

  return {
    appApiBaseUrl: normalizeSdkworkApiBaseUrl(config.appApiBaseUrl, "app"),
    backendApiBaseUrl: config.backendApiBaseUrl
      ? normalizeSdkworkApiBaseUrl(config.backendApiBaseUrl, "backend")
      : undefined,
    commerceAppClient,
    commerceBackendClient,
    sdkFamilies: {
      app: ["sdkwork-commerce-app-sdk", "sdkwork-appbase-app-sdk"],
      backendAdmin: ["sdkwork-commerce-backend-sdk", "sdkwork-appbase-backend-sdk"],
    },
  };
}

function createAppbaseGeneratedAppClient(
  config: SdkworkMallPcRuntimeConfig,
  tokenManager: ReturnType<typeof createSdkworkMallPcSessionTokenManager>,
): SdkworkAppClient {
  return createAppbaseAppClient({
    authMode: "dual-token",
    baseUrl: normalizeGeneratedSdkBaseUrl(resolveAppbaseAppApiBaseUrl(config), APP_API_PREFIX),
    platform: "pc",
    tokenManager,
  });
}

function resolveAppbaseAppApiBaseUrl(config: SdkworkMallPcRuntimeConfig): string {
  return config.sdkBaseUrls?.dependencySdkBaseUrls?.[APPBASE_APP_SDK_FAMILY_ID]?.appApiBaseUrl
    ?? config.appApiBaseUrl;
}

function normalizeGeneratedSdkBaseUrl(baseUrl: string, apiPrefix: string): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/u, "");
  const normalizedApiPrefix = apiPrefix.replace(/\/+$/u, "");
  if (normalizedBaseUrl.endsWith(normalizedApiPrefix)) {
    return normalizedBaseUrl.slice(0, -normalizedApiPrefix.length).replace(/\/+$/u, "");
  }
  return normalizedBaseUrl;
}

function commitCommerceIamRuntimeSession(
  session: SdkworkMallPcSessionStore,
  iamSession: CommerceIamSessionLike,
): CommerceIamSessionLike | undefined {
  const nextSession: SdkworkMallPcSessionSnapshot = {
    ...session.getSnapshot(),
    accessToken: iamSession.accessToken,
    authToken: iamSession.authToken,
    refreshToken: iamSession.refreshToken,
    sessionId: iamSession.sessionId ?? iamSession.context?.sessionId,
    context: iamSession.context
      ? {
          tenantId: iamSession.context.tenantId,
          userId: iamSession.context.userId,
          organizationId: iamSession.context.organizationId,
          sessionId: iamSession.context.sessionId,
          appId: iamSession.context.appId,
          environment: iamSession.context.environment,
          deploymentMode: iamSession.context.deploymentMode,
        }
      : undefined,
  };

  if (!nextSession.context) {
    delete nextSession.context;
  }

  session.setSession(nextSession);
  return toCommerceIamBridgeSession(session.getSnapshot()) ?? undefined;
}

function toCommerceIamBridgeSession(
  snapshot: SdkworkMallPcSessionSnapshot,
): CommerceIamSessionLike | null {
  if (!snapshot.authToken && !snapshot.accessToken && !snapshot.refreshToken) {
    return null;
  }

  return {
    ...(snapshot.accessToken ? { accessToken: snapshot.accessToken } : {}),
    ...(snapshot.authToken ? { authToken: snapshot.authToken } : {}),
    ...(snapshot.refreshToken ? { refreshToken: snapshot.refreshToken } : {}),
    ...(snapshot.sessionId ? { sessionId: snapshot.sessionId } : {}),
    ...(snapshot.context?.tenantId && snapshot.context.userId
      ? {
          context: {
            tenantId: snapshot.context.tenantId,
            userId: snapshot.context.userId,
            organizationId: snapshot.context.organizationId,
            sessionId: snapshot.context.sessionId,
            appId: snapshot.context.appId,
            environment: snapshot.context.environment,
            deploymentMode: snapshot.context.deploymentMode,
          } as IamAppContext,
        }
      : {}),
  };
}

function resolveSessionStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.sessionStorage;
}

function toIamDeploymentMode(value: SdkworkMallPcRuntimeConfig["deploymentMode"]): IamDeploymentMode {
  return value === "web" ? "saas" : value;
}

function toIamEnvironment(value: SdkworkMallPcRuntimeConfig["environment"]): IamEnvironment {
  if (value === "development") {
    return "dev";
  }
  if (value === "production") {
    return "prod";
  }
  if (value === "staging") {
    return "test";
  }
  return "test";
}
