#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packagesRoot = path.resolve(scriptDir, "../apps/sdkwork-mall-pc/packages");

const DOMAIN_MIGRATIONS = [
  { pkgDir: "sdkwork-mall-pc-payment", pkg: "payment", Prefix: "Payment" },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) {
    return out;
  }
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== "node_modules") {
      walk(fullPath, out);
    } else if (/\.(ts|tsx)$/.test(ent.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

function applyDomainMigration(source, { pkg, Prefix }) {
  return source
    .replaceAll("@sdkwork/commerce-service", `@sdkwork/${pkg}-service`)
    .replaceAll("getSdkworkCommerceService", `getSdkwork${Prefix}Service`)
    .replaceAll("hasSdkworkCommerceSession", `hasSdkwork${Prefix}Session`)
    .replaceAll("requireSdkworkCommerceSession", `requireSdkwork${Prefix}Session`)
    .replaceAll("toNullableSdkworkCommerce", `toNullableSdkwork${Prefix}`)
    .replaceAll("toSdkworkCommerce", `toSdkwork${Prefix}`)
    .replaceAll("unwrapSdkworkCommerce", `unwrapSdkwork${Prefix}`)
    .replaceAll("type SdkworkCommerceService", `type Sdkwork${Prefix}AppService`)
    .replaceAll(`commerceService?: SdkworkCommerceService`, `${pkg}Service?: Sdkwork${Prefix}AppService`)
    .replaceAll("options.commerceService", `options.${pkg}Service`)
    .replaceAll("getCommerceService", `get${Prefix}Service`)
    .replaceAll("const commerceService =", `const ${pkg}Service =`)
    .replaceAll("commerceService.", `${pkg}Service.`)
    .replaceAll("formatSdkworkCommerce", `formatSdkwork${Prefix}`)
    .replaceAll("createCommerceServiceMock", `create${Prefix}ServiceMock`)
    .replaceAll("configureCommerceServiceMockSession", `configure${Prefix}ServiceMockSession`)
    .replaceAll("resetCommerceServiceMockSession", `reset${Prefix}ServiceMockSession`)
    .replaceAll("commerceService:", `${pkg}Service:`);
}

function migratePackage({ pkgDir, pkg, Prefix }) {
  const root = path.join(packagesRoot, pkgDir);
  for (const file of [...walk(path.join(root, "src")), ...walk(path.join(root, "tests"))]) {
    const original = fs.readFileSync(file, "utf8");
    const next = applyDomainMigration(original, { pkg, Prefix });
    if (next !== original) {
      fs.writeFileSync(file, next);
    }
  }
  const packageJsonPath = path.join(root, "package.json");
  const packageJson = fs.readFileSync(packageJsonPath, "utf8").replaceAll(
    "@sdkwork/commerce-service",
    `@sdkwork/${pkg}-service`,
  );
  fs.writeFileSync(packageJsonPath, packageJson);
  console.log(`migrated ${pkgDir}`);
}

function stripCompositeCommerceService(relativePath) {
  const filePath = path.join(packagesRoot, relativePath);
  let source = fs.readFileSync(filePath, "utf8");
  const original = source;
  source = source.replace(/\r?\n  commerceService\?: SdkworkCommerceService;\r?\n/, "\n");
  source = source.replace(/import type \{ SdkworkCommerceService \} from "@sdkwork\/commerce-service";\r?\n/, "");
  source = source.replace(/,?\s*commerceService: options\.commerceService/g, "");
  source = source.replace(/\{\s*,\s*locale:/g, "{ locale:");
  source = source.replace(/createSdkworkWalletService\(\{\s*\}\)/g, "createSdkworkWalletService()");
  source = source.replace(/createSdkworkMembershipService\(\{\s*locale:/g, "createSdkworkMembershipService({ locale:");
  source = source.replace(/createSdkworkCouponService\(\{\s*locale:/g, "createSdkworkCouponService({ locale:");
  source = source.replace(/createSdkworkPointsService\(\{\s*\}\)/g, "createSdkworkPointsService()");
  source = source.replace(/createSdkworkPaymentService\(\{\s*\}\)/g, "createSdkworkPaymentService()");
  if (source !== original) {
    fs.writeFileSync(filePath, source);
    console.log(`fixed composite ${relativePath}`);
  }
}

function migrateSubscriptionPromotions() {
  const filePath = path.join(packagesRoot, "sdkwork-mall-pc-subscription/src/subscription-service.ts");
  let source = fs.readFileSync(filePath, "utf8");
  const original = source;
  source = applyDomainMigration(source, { pkg: "promotion", Prefix: "Promotion" });
  source = source.replace(/getPromotionService\(\)\.promotions/g, "getSdkworkPromotionService().promotions");
  if (source !== original) {
    fs.writeFileSync(filePath, source);
    console.log("fixed subscription promotions");
  }
}

for (const migration of DOMAIN_MIGRATIONS) {
  migratePackage(migration);
}

for (const relativePath of [
  "sdkwork-mall-pc-points/src/points-service.ts",
  "sdkwork-mall-pc-offer/src/offer-service.ts",
  "sdkwork-mall-pc-membership-purchase/src/membership-purchase-service.ts",
]) {
  stripCompositeCommerceService(relativePath);
}

migrateSubscriptionPromotions();
