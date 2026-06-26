#!/usr/bin/env node
/**
 * Aligns migrated mall PC packages with T1 domain service ownership:
 * - removes stale @sdkwork/commerce-service peer dependencies
 * - updates README runtime boundary sections
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const mallRoot = path.resolve(scriptDir, "..", "apps", "sdkwork-mall-pc");
const packagesRoot = path.join(mallRoot, "packages");

const MIGRATED_PACKAGES = {
  "sdkwork-mall-pc-wallet": {
    domainService: "@sdkwork/account-service",
    dependsOn: [
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
      "`@sdkwork/account-service` for wallet balances, session checks, and response normalization via the T1 account domain module",
      "`@sdkwork/mall-pc-membership` for membership context kept separate from wallet ownership",
    ],
  },
  "sdkwork-mall-pc-order": {
    domainService: "@sdkwork/order-service",
    dependsOn: [
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
      "`@sdkwork/order-service` for order lifecycle, session checks, and response normalization via the T1 order domain module",
    ],
  },
  "sdkwork-mall-pc-membership": {
    domainService: "@sdkwork/membership-service",
    dependsOn: [
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
      "`@sdkwork/membership-service` for membership plans, purchases, and response normalization via the T1 membership domain module",
    ],
  },
  "sdkwork-mall-pc-coupon": {
    domainService: "@sdkwork/promotion-service",
    dependsOn: [
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
      "`@sdkwork/promotion-service` for coupon wallets, claims, and response normalization via the T1 promotion domain module",
    ],
  },
  "sdkwork-mall-pc-payment": {
    domainService: "@sdkwork/payment-service",
    dependsOn: [
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
      "`@sdkwork/payment-service` for payment methods, records, and response normalization via the T1 payment domain module",
    ],
  },
  "sdkwork-mall-pc-points": {
    domainService: "@sdkwork/account-service",
    dependsOn: [
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
      "`@sdkwork/mall-pc-wallet` and `@sdkwork/mall-pc-membership` for points balances composed from account and membership domain boundaries",
    ],
  },
  "sdkwork-mall-pc-offer": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/appbase-pc-react` for shared workspace primitives",
      "`@sdkwork/mall-pc-coupon`, `@sdkwork/mall-pc-points`, `@sdkwork/mall-pc-subscription`, `@sdkwork/mall-pc-membership`, and `@sdkwork/mall-pc-wallet` for composed commercial offer surfaces",
    ],
  },
  "sdkwork-mall-pc-subscription": {
    domainService: "@sdkwork/promotion-service",
    dependsOn: [
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
      "`@sdkwork/promotion-service` for checkout coupon selection",
      "`@sdkwork/mall-pc-payment` for payment method selection",
      "`@sdkwork/mall-pc-membership` for membership purchase, renew, and upgrade mutations",
    ],
  },
  "sdkwork-mall-pc-membership-purchase": {
    domainService: "@sdkwork/membership-service",
    dependsOn: [
      "`@sdkwork/appbase-pc-react` for shared workspace primitives",
      "`@sdkwork/mall-pc-membership` for membership purchase, renew, and upgrade mutations",
    ],
  },
  "sdkwork-mall-pc-checkout": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/appbase-pc-react` for shared workspace primitives",
      "`@sdkwork/mall-pc-coupon`, `@sdkwork/mall-pc-invoice`, `@sdkwork/mall-pc-offer`, `@sdkwork/mall-pc-order`, `@sdkwork/mall-pc-payment`, `@sdkwork/mall-pc-points`, `@sdkwork/mall-pc-pricing`, `@sdkwork/mall-pc-subscription`, and `@sdkwork/mall-pc-wallet` for composed checkout orchestration",
    ],
  },
  "sdkwork-mall-pc-pricing": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
      "`@sdkwork/account-service` for session checks and points formatting via the T1 account domain module",
      "`@sdkwork/payment-service` for currency formatting via the T1 payment domain module",
      "`@sdkwork/mall-pc-billing`, `@sdkwork/mall-pc-offer`, `@sdkwork/mall-pc-subscription`, and `@sdkwork/mall-pc-wallet` for composed pricing-center surfaces",
    ],
  },
  "sdkwork-mall-pc-billing": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
      "`@sdkwork/account-service` for authenticated session checks via the T1 account domain module",
      "`@sdkwork/payment-service` for currency normalization and payment dashboard composition",
      "`@sdkwork/mall-pc-invoice`, `@sdkwork/mall-pc-offer`, `@sdkwork/mall-pc-payment`, `@sdkwork/mall-pc-subscription`, and `@sdkwork/mall-pc-wallet` for composed billing-center surfaces",
    ],
  },
  "sdkwork-mall-pc-invoice": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
      "`@sdkwork/account-service` for session checks via the T1 account domain module",
      "`@sdkwork/payment-service` for currency normalization and response envelopes",
    ],
  },
  "sdkwork-mall-pc-address": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/account-service` for authenticated address management session checks",
      "`@sdkwork/mall-pc-core` for buyer route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-shop": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for response envelope normalization",
      "`@sdkwork/mall-pc-core` for storefront route composition",
      "`@sdkwork/mall-pc-search` for shop-scoped product discovery",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-home": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for response envelope normalization",
      "`@sdkwork/mall-pc-cms` for homepage CMS banners and content",
      "`@sdkwork/mall-pc-core` for storefront route composition",
      "`@sdkwork/mall-pc-search` for category and product discovery",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-search": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for response envelope normalization",
      "`@sdkwork/mall-pc-cms` for search landing CMS content",
      "`@sdkwork/mall-pc-core` for storefront route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-catalog": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for response envelope normalization",
      "`@sdkwork/mall-pc-commerce` for buyer favorites integration",
      "`@sdkwork/mall-pc-core` for storefront route composition",
      "`@sdkwork/mall-pc-search` for category listing and product discovery",
      "`@sdkwork/mall-pc-reviews` for footprint tracking",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-activity": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for response envelope normalization",
      "`@sdkwork/mall-pc-cms` for CMS offer marker filtering",
      "`@sdkwork/mall-pc-core` for storefront route composition",
      "`@sdkwork/mall-pc-search` for activity product discovery",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-reviews": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for response envelope normalization",
      "`@sdkwork/mall-pc-core` for buyer route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-messages": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for response envelope normalization",
      "`@sdkwork/mall-pc-core` for buyer route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-after-sales": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for currency formatting and response envelope normalization",
      "`@sdkwork/mall-pc-core` for buyer route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-cart": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for checkout response envelope normalization",
      "`@sdkwork/mall-pc-core` for storefront route composition",
      "`@sdkwork/mall-pc-search` for payment result product recommendations",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-cms": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for CMS offer payload normalization",
      "`@sdkwork/mall-pc-core` for admin route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-merchant": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for merchant dashboard response normalization",
      "`@sdkwork/mall-pc-core` for merchant route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-admin-shops": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for admin response envelope normalization",
      "`@sdkwork/mall-pc-admin-core` for injectable admin remote port boundaries",
      "`@sdkwork/mall-pc-core` for admin route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-admin-settlement": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for admin response envelope normalization",
      "`@sdkwork/mall-pc-admin-core` for injectable admin remote port boundaries",
      "`@sdkwork/mall-pc-core` for admin route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-admin-risk": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for admin response envelope normalization",
      "`@sdkwork/mall-pc-admin-core` for injectable admin remote port boundaries",
      "`@sdkwork/mall-pc-core` for admin route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-admin-reports": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for admin response envelope normalization",
      "`@sdkwork/mall-pc-admin-core` for injectable admin remote port boundaries",
      "`@sdkwork/mall-pc-core` for admin route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-admin-orders": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for admin response envelope normalization",
      "`@sdkwork/mall-pc-admin-core` for injectable admin remote port boundaries",
      "`@sdkwork/mall-pc-core` for admin route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-admin-marketing": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/payment-service` for admin response envelope normalization",
      "`@sdkwork/mall-pc-admin-core` for injectable admin remote port boundaries",
      "`@sdkwork/mall-pc-core` for admin route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-admin-product": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/mall-pc-admin-core` for catalog admin remote port boundaries",
      "`@sdkwork/mall-pc-core` for admin route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-admin-membership": {
    domainService: "@sdkwork/membership-service",
    dependsOn: [
      "`@sdkwork/membership-service` for admin session checks via the T1 membership domain module",
      "`@sdkwork/payment-service` for admin response envelope normalization",
      "`@sdkwork/mall-pc-admin-core` for injectable admin remote port boundaries",
      "`@sdkwork/mall-pc-core` for admin route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-admin-permissions": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/mall-pc-core` for admin route composition and permission guard integration",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
  "sdkwork-mall-pc-commerce": {
    domainService: null,
    dependsOn: [
      "`@sdkwork/account-service` for authenticated session checks and hub payment dashboard composition",
      "`@sdkwork/payment-service` for buyer hub and payment dashboard response normalization",
      "`@sdkwork/mall-pc-coupon`, `@sdkwork/mall-pc-invoice`, `@sdkwork/mall-pc-membership`, `@sdkwork/mall-pc-order`, `@sdkwork/mall-pc-points`, and `@sdkwork/mall-pc-wallet` for composed commerce hub surfaces",
      "`@sdkwork/mall-pc-core` for buyer route composition",
      "`@sdkwork/ui-pc-react` for shared UI primitives and patterns",
    ],
  },
};

function removeCommerceServicePeer(packageJson) {
  let changed = false;
  for (const section of ["peerDependencies", "devDependencies"]) {
    if (packageJson[section]?.["@sdkwork/commerce-service"]) {
      delete packageJson[section]["@sdkwork/commerce-service"];
      changed = true;
    }
  }
  if (packageJson.peerDependenciesMeta?.["@sdkwork/commerce-service"]) {
    delete packageJson.peerDependenciesMeta["@sdkwork/commerce-service"];
    changed = true;
  }
  return changed;
}

function ensurePeer(packageJson, name, version = "*") {
  packageJson.peerDependencies ??= {};
  if (packageJson.peerDependencies[name]) {
    return false;
  }
  packageJson.peerDependencies[name] = version;
  return true;
}

function ensureMigratedPeers(directory, packageJson) {
  let changed = false;
  if (directory.startsWith("sdkwork-mall-pc-admin-")) {
    changed = ensurePeer(packageJson, "@sdkwork/mall-pc-admin-core") || changed;
    if (directory !== "sdkwork-mall-pc-admin-permissions" && directory !== "sdkwork-mall-pc-admin-product") {
      changed = ensurePeer(packageJson, "@sdkwork/payment-service") || changed;
    }
    if (directory === "sdkwork-mall-pc-admin-membership") {
      changed = ensurePeer(packageJson, "@sdkwork/membership-service") || changed;
    }
    return changed;
  }
  if (
    [
      "sdkwork-mall-pc-cart",
      "sdkwork-mall-pc-cms",
      "sdkwork-mall-pc-commerce",
      "sdkwork-mall-pc-merchant",
      "sdkwork-mall-pc-reviews",
      "sdkwork-mall-pc-messages",
      "sdkwork-mall-pc-after-sales",
    ].includes(directory)
  ) {
    changed = ensurePeer(packageJson, "@sdkwork/payment-service") || changed;
  }
  if (directory === "sdkwork-mall-pc-admin-product") {
    changed = ensurePeer(packageJson, "@sdkwork/mall-pc-admin-core") || changed;
  }
  if (directory === "sdkwork-mall-pc-commerce") {
    changed = ensurePeer(packageJson, "@sdkwork/account-service") || changed;
  }
  return changed;
}

function updateReadme(packageDir, directory, config) {
  const readmePath = path.join(packageDir, "README.md");
  if (!existsSync(readmePath)) {
    return false;
  }

  let source = readFileSync(readmePath, "utf8");
  if (!source.includes("@sdkwork/commerce-service")) {
    return false;
  }

  const dependsSection = config.dependsOn.map((line) => `- ${line}`).join("\n");
  source = source.replace(
    /## Depends on\n\n(?:- .+\n)+/,
    `## Depends on\n\n${dependsSection}\n`,
  );

  const runtimeBoundary = config.domainService
    ? `All remote access goes through \`${config.domainService}\` or through sibling mall packages that compose the same T1 domain boundaries. Generated SDK clients remain behind the domain service contract.`
    : directory === "sdkwork-mall-pc-billing"
      ? "Authenticated dashboards compose T1 domain-backed mall packages. Metered usage history still loads through the transitional commerce app SDK slice (`billing.history.list`) behind an injectable `loadUsageRecords` boundary."
      : "This package composes sibling mall domain packages and does not call `@sdkwork/commerce-service` directly.";

  source = source.replace(
    /## Runtime boundary\n\n.+\n\n/,
    `## Runtime boundary\n\n${runtimeBoundary}\n\n`,
  );

  if (config.domainService) {
    source = source.replace(/@sdkwork\/commerce-service/g, config.domainService);
  }
  writeFileSync(readmePath, source, "utf8");
  return true;
}

let packageJsonUpdates = 0;
let readmeUpdates = 0;

for (const [directory, config] of Object.entries(MIGRATED_PACKAGES)) {
  const packageDir = path.join(packagesRoot, directory);
  const packageJsonPath = path.join(packageDir, "package.json");
  if (!existsSync(packageJsonPath)) {
    continue;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  let packageChanged = false;
  if (removeCommerceServicePeer(packageJson)) {
    packageChanged = true;
  }
  if (ensureMigratedPeers(directory, packageJson)) {
    packageChanged = true;
  }
  if (packageChanged) {
    writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
    packageJsonUpdates += 1;
  }

  if (updateReadme(packageDir, directory, config)) {
    readmeUpdates += 1;
  }
}

console.log(`Aligned mall domain migration metadata: ${packageJsonUpdates} package.json files, ${readmeUpdates} README files.`);
