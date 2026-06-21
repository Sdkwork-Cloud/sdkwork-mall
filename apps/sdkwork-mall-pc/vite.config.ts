import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from 'vite';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(appRoot, "../..");
const DEFAULT_PLATFORM_GATEWAY_TARGET = "http://127.0.0.1:3900";
const workspaceNodeModules = path.join(workspaceRoot, "node_modules");
const workspacePnpmStore = path.join(workspaceNodeModules, ".pnpm");
const appbaseRoot = path.resolve(workspaceRoot, "../sdkwork-appbase");
const uiRoot = path.resolve(workspaceRoot, "../sdkwork-ui");
const sdkCommonsRoot = path.resolve(workspaceRoot, "../sdkwork-sdk-commons");

const sharedRuntimePackages = [
  "@radix-ui/react-avatar",
  "@radix-ui/react-checkbox",
  "@radix-ui/react-context-menu",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-hover-card",
  "@radix-ui/react-label",
  "@radix-ui/react-menubar",
  "@radix-ui/react-popover",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-scroll-area",
  "@radix-ui/react-select",
  "@radix-ui/react-separator",
  "@radix-ui/react-slider",
  "@radix-ui/react-slot",
  "@radix-ui/react-switch",
  "@radix-ui/react-tabs",
  "@radix-ui/react-tooltip",
  "@tanstack/react-table",
  "class-variance-authority",
  "clsx",
  "cmdk",
  "i18next",
  "lucide-react",
  "react-day-picker",
  "react-hook-form",
  "react-i18next",
  "react-resizable-panels",
  "sonner",
  "tailwind-merge",
];

function packageStorePrefix(packageName: string): string {
  const [scope, name] = packageName.startsWith("@")
    ? packageName.split("/")
    : ["", packageName];
  return scope ? `${scope}+${name}@` : `${name}@`;
}

function resolveWorkspacePackage(packageName: string): string {
  const directPath = path.join(workspaceNodeModules, packageName);
  if (existsSync(directPath)) {
    return directPath;
  }

  if (!existsSync(workspacePnpmStore)) {
    return packageName;
  }

  const pnpmEntry = readdirSync(workspacePnpmStore)
    .filter((entry) => {
      const packagePath = path.join(workspacePnpmStore, entry, "node_modules", packageName);
      return entry.startsWith(packageStorePrefix(packageName)) || existsSync(packagePath);
    })
    .sort()
    .at(-1);

  if (!pnpmEntry) {
    return packageName;
  }

  return path.join(workspacePnpmStore, pnpmEntry, "node_modules", packageName);
}

function escapeRegExp(pattern: string): string {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type TsconfigAliasEntry = {
  find: string | RegExp;
  replacement: string;
};

function loadTsconfigAliases(): TsconfigAliasEntry[] {
  const tsconfigBasePath = path.join(workspaceRoot, "tsconfig.base.json");
  const tsconfigBase = JSON.parse(readFileSync(tsconfigBasePath, "utf8"));
  const pathMappings = tsconfigBase?.compilerOptions?.paths ?? {};
  const runtimeAliases = new Set([
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
  ]);

  const entries: TsconfigAliasEntry[] = [];
  for (const [find, replacements] of Object.entries(pathMappings)) {
    if (runtimeAliases.has(find)) {
      continue;
    }

    const replacement = Array.isArray(replacements) ? replacements[0] : undefined;
    if (typeof replacement !== "string") {
      continue;
    }

    const resolvedReplacement = path.resolve(
      workspaceRoot,
      replacement.endsWith("/*") ? replacement.slice(0, -2) : replacement,
    );

    // 精确映射（如 "@sdkwork/mall-pc-order"）只匹配包名本身，
    // 不匹配子路径导入（如 "@sdkwork/mall-pc-order/order-page"），
    // 让 vite 通过 node 解析和 package.json exports 字段解析子路径。
    // 通配符映射（如 "@sdkwork/*"）保持前缀匹配。
    if (find.endsWith("/*")) {
      entries.push({
        find: find.slice(0, -2),
        replacement: resolvedReplacement,
      });
    } else {
      entries.push({
        find: new RegExp(`^${escapeRegExp(find)}$`),
        replacement: resolvedReplacement,
      });
    }
  }

  return entries.sort((left, right) => {
    const leftLen = typeof left.find === "string" ? left.find.length : left.find.source.length;
    const rightLen = typeof right.find === "string" ? right.find.length : right.find.source.length;
    return rightLen - leftLen;
  });
}

function resolveDevProxyTarget(
  value: string | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^https?:\/\//iu.test(trimmed)) {
    try {
      return new URL(trimmed).origin;
    } catch {
      return fallback;
    }
  }

  return fallback;
}

function resolveMallPcDevProxyTarget({
  configuredApiBaseUrl,
  configuredSdkBaseUrl,
  env,
  explicitTarget,
}: {
  configuredApiBaseUrl?: string;
  configuredSdkBaseUrl?: string;
  env: Record<string, string>;
  explicitTarget?: string;
}): string {
  const platformGatewayUrl =
    env.VITE_SDKWORK_CLAW_ROUTER_PLATFORM_API_GATEWAY_HTTP_URL
    ?? env.SDKWORK_CLAW_ROUTER_PLATFORM_API_GATEWAY_HTTP_URL
    ?? env.VITE_SDKWORK_CLAW_ROUTER_APPLICATION_PUBLIC_HTTP_URL
    ?? env.SDKWORK_CLAW_ROUTER_APPLICATION_PUBLIC_HTTP_URL;

  return resolveDevProxyTarget(
    explicitTarget
      ?? configuredApiBaseUrl
      ?? configuredSdkBaseUrl
      ?? platformGatewayUrl,
    resolveDevProxyTarget(platformGatewayUrl, DEFAULT_PLATFORM_GATEWAY_TARGET),
  );
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, appRoot, "");
  const appApiProxyTarget = resolveMallPcDevProxyTarget({
    configuredApiBaseUrl: env.VITE_SDKWORK_COMMERCE_PC_APP_API_BASE_URL,
    configuredSdkBaseUrl: env.VITE_SDKWORK_COMMERCE_PC_SDK_BASE_URL,
    env,
    explicitTarget: process.env.SDKWORK_MALL_PC_DEV_APP_API_PROXY_TARGET,
  });
  const backendApiProxyTarget = resolveMallPcDevProxyTarget({
    configuredApiBaseUrl: env.VITE_SDKWORK_COMMERCE_PC_BACKEND_API_BASE_URL,
    configuredSdkBaseUrl: env.VITE_SDKWORK_COMMERCE_PC_SDK_BASE_URL,
    env,
    explicitTarget: process.env.SDKWORK_MALL_PC_DEV_BACKEND_API_PROXY_TARGET,
  });

  return {
  define: {
    "process.env.SDKWORK_ACCESS_TOKEN": JSON.stringify(env.SDKWORK_ACCESS_TOKEN ?? ""),
  },
  root: appRoot,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "react",
        replacement: path.join(workspaceNodeModules, "react"),
      },
      {
        find: "react-dom",
        replacement: path.join(workspaceNodeModules, "react-dom"),
      },
      {
        find: "react-router-dom",
        replacement: path.join(workspaceNodeModules, "react-router-dom"),
      },
      ...sharedRuntimePackages.map((packageName) => ({
        find: packageName,
        replacement: resolveWorkspacePackage(packageName),
      })),
      ...loadTsconfigAliases(),
    ],
    dedupe: [
      "react",
      "react-dom",
      "react-router",
      "react-router-dom",
      ...sharedRuntimePackages,
    ],
  },
  build: {
    outDir: "dist",
    sourcemap: mode !== "production",
  },
  server: {
    host: "127.0.0.1",
    port: 5175,
    proxy: {
      "/app/v3/api": {
        changeOrigin: true,
        target: appApiProxyTarget,
      },
      "/backend/v3/api": {
        changeOrigin: true,
        target: backendApiProxyTarget,
      },
    },
    fs: {
      allow: [
        appRoot,
        workspaceRoot,
        appbaseRoot,
        uiRoot,
        sdkCommonsRoot,
      ],
    },
  },
};
});
