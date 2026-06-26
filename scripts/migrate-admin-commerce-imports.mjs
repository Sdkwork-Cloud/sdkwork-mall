#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packagesRoot = path.resolve(scriptDir, "../apps/sdkwork-mall-pc/packages");

const adminPages = [
  "sdkwork-mall-pc-admin-reports/src/pages/AdminReportsListPage.tsx",
  "sdkwork-mall-pc-admin-reports/src/pages/AdminAuditPage.tsx",
  "sdkwork-mall-pc-admin-reports/src/pages/AdminDashboardPage.tsx",
  "sdkwork-mall-pc-admin-marketing/src/pages/AdminMarketingPage.tsx",
  "sdkwork-mall-pc-admin-risk/src/pages/AdminRiskPage.tsx",
  "sdkwork-mall-pc-admin-shops/src/pages/AdminGovernancePages.tsx",
  "sdkwork-mall-pc-admin-shops/src/pages/AdminShopsPage.tsx",
  "sdkwork-mall-pc-admin-orders/src/pages/AdminOrdersPage.tsx",
  "sdkwork-mall-pc-admin-settlement/src/pages/AdminSettlementPage.tsx",
];

const importBlock =
  /import \{\r?\n  getSdkworkCommerceService,\r?\n  unwrapSdkwork(?:Commerce|Payment)Response,\r?\n\} from "@sdkwork\/commerce-service";/g;
const importNew = `import { unwrapSdkworkPaymentResponse } from "@sdkwork/payment-service";
import { getSdkworkAdminRemotePort } from "@sdkwork/mall-pc-admin-core/admin-remote-port";`;

for (const rel of adminPages) {
  const filePath = path.join(packagesRoot, rel);
  let source = readFileSync(filePath, "utf8");
  if (!source.includes("@sdkwork/commerce-service") && !source.includes("getSdkworkCommerceService")) {
    continue;
  }
  source = source.replace(importBlock, importNew);
  source = source.replaceAll("getSdkworkCommerceService()", "getSdkworkAdminRemotePort()");
  source = source.replaceAll("unwrapSdkworkCommerceResponse", "unwrapSdkworkPaymentResponse");
  writeFileSync(filePath, source);
  console.log(`updated ${rel}`);
}
