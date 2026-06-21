import type { CSSProperties } from "react";
import type { SdkworkAuthRuntimeConfig } from "@sdkwork/auth-pc-react";

export interface SdkworkMallPcAuthAppearanceConfig {
  asidePanelClassName?: string;
  asidePanelStyle?: CSSProperties;
  bodyClassName?: string;
  contentContainerClassName?: string;
  pageClassName?: string;
  qrFrameClassName?: string;
  shellClassName?: string;
  slotProps?: {
    asidePanel?: { className?: string; style?: CSSProperties };
    background?: { className?: string };
    page?: { className?: string };
    shell?: { className?: string };
  };
  theme?: Record<string, string>;
}

export type SdkworkMallPcAuthRuntimeConfig = SdkworkAuthRuntimeConfig;
const COMMERCE_VERIFICATION_POLICY = {
  emailCodeLoginEnabled: true,
  emailRegistrationVerificationRequired: false,
  phoneCodeLoginEnabled: true,
  phoneRegistrationVerificationRequired: false,
};

export function resolveSdkworkMallPcAuthRuntimeConfig(): SdkworkMallPcAuthRuntimeConfig {
  return {
    leftRailMode: "qr-only",
    loginMethods: ["password", "emailCode", "phoneCode"],
    oauthLoginEnabled: false,
    oauthProviders: [],
    qrLoginEnabled: true,
    recoveryMethods: ["email", "phone"],
    registerMethods: ["email", "phone"],
    verificationPolicy: COMMERCE_VERIFICATION_POLICY,
  };
}

export function resolveSdkworkMallPcAuthAppearance(): SdkworkMallPcAuthAppearanceConfig {
  return {
    asidePanelClassName: "sdkwork-mall-pc-auth-aside-panel",
    asidePanelStyle: {
      backgroundColor: "#f8fafc",
      backgroundImage: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
      color: "#0f172a",
    },
    bodyClassName: "sdkwork-mall-pc-auth-body",
    contentContainerClassName: "sdkwork-mall-pc-auth-content",
    pageClassName: "sdkwork-mall-pc-auth-page",
    qrFrameClassName: "sdkwork-mall-pc-auth-qr-frame",
    shellClassName: "sdkwork-mall-pc-auth-card-shell",
    slotProps: {
      asidePanel: {
        style: {
          backgroundColor: "#f8fafc",
          backgroundImage: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
          color: "#0f172a",
        },
      },
      background: {
        className: "sdkwork-mall-pc-auth-background",
      },
      page: {
        className: "sdkwork-mall-pc-auth-page",
      },
      shell: {
        className: "sdkwork-mall-pc-auth-card-shell",
      },
    },
  };
}

export function resolveSdkworkMallPcAuthLocale(defaultLocale: string): string {
  return defaultLocale;
}
