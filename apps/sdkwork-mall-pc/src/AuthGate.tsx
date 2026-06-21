import { lazy, type ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SdkworkIamAuthRoutes } from "@sdkwork/auth-pc-react";

import {
  resolveSdkworkMallPcAuthAppearance,
  resolveSdkworkMallPcAuthLocale,
  resolveSdkworkMallPcAuthRuntimeConfig,
} from "./bootstrap/authConfig";
import type { SdkworkMallPcRuntime } from "./bootstrap/runtime";
import {
  hasSdkworkMallPcAuthenticatedSession,
  resolveSdkworkMallPcAuthGateDecision,
} from "./authGateLogic";

export interface AuthGateProps {
  children: ReactNode;
  runtime: SdkworkMallPcRuntime;
}

export function AuthGate({ children, runtime }: AuthGateProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState(() => runtime.session.getSnapshot());

  useEffect(() => runtime.session.subscribe(setSnapshot), [runtime.session]);

  const decision = useMemo(
    () =>
      resolveSdkworkMallPcAuthGateDecision({
        hasSession: hasSdkworkMallPcAuthenticatedSession(snapshot),
        homePath: "/",
        location,
      }),
    [location, snapshot],
  );

  useEffect(() => {
    if (decision.kind !== "redirect") {
      return;
    }
    navigate(decision.to, { replace: true });
  }, [decision, navigate]);

  if (decision.kind === "redirect") {
    return null;
  }

  if (decision.kind === "auth-route") {
    const authProps = {
      appearance: resolveSdkworkMallPcAuthAppearance(),
      basePath: "/auth",
      getRuntime: () => runtime.iamRuntime,
      homePath: "/",
      locale: resolveSdkworkMallPcAuthLocale(runtime.config.i18n.defaultLocale),
      runtimeConfig: resolveSdkworkMallPcAuthRuntimeConfig(),
      viewportMode: "flow" as const,
    };

    return <SdkworkIamAuthRoutes {...(authProps as unknown as Parameters<typeof SdkworkIamAuthRoutes>[0])} />;
  }

  return <>{children}</>;
}
