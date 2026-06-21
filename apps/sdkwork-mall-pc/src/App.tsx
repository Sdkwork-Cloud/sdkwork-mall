import { BrowserRouter, HashRouter, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { SdkworkMallPcSurfaceShell } from "@sdkwork/mall-pc-shell";

import { AppRoutes } from "./AppRoutes";
import { AuthGate } from "./AuthGate";
import { hasSdkworkMallPcAuthenticatedSession } from "./authGateLogic";
import { createSdkworkMallPcRuntime } from "./bootstrap/runtime";

const runtime = createSdkworkMallPcRuntime();

/**
 * Tauri webview 使用 tauri:// 或 https://tauri.localhost 协议加载本地文件，
 * BrowserRouter 刷新非根路径会 404。检测 Tauri 环境后切换为 HashRouter，
 * 保证浏览器和 Tauri 中刷新页面、访问链接都能正常工作。
 */
function detectTauriEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const protocol = window.location.protocol;
  return (
    protocol === "tauri:" ||
    (protocol === "https:" && window.location.hostname === "tauri.localhost") ||
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
  );
}

const IS_TAURI_ENVIRONMENT = detectTauriEnvironment();

function MallLayout() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    hasSdkworkMallPcAuthenticatedSession(runtime.session.getSnapshot()),
  );

  useEffect(() => runtime.session.subscribe((snapshot) => {
    setIsAuthenticated(hasSdkworkMallPcAuthenticatedSession(snapshot));
  }), []);

  const shell = useMemo(() => (
    <SdkworkMallPcSurfaceShell
      isAuthenticated={isAuthenticated}
      pathname={location.pathname}
      runtime={runtime}
    >
      <AppRoutes runtime={runtime} />
    </SdkworkMallPcSurfaceShell>
  ), [isAuthenticated, location.pathname]);

  return shell;
}

export function App() {
  const Router = IS_TAURI_ENVIRONMENT ? HashRouter : BrowserRouter;
  return (
    <Router>
      <AuthGate runtime={runtime}>
        <MallLayout />
      </AuthGate>
    </Router>
  );
}
