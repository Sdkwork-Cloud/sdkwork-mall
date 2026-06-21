import fs from "node:fs";
import path from "node:path";

const packagesRoot = path.resolve(import.meta.dirname, "..", "packages");

const routePageBarrels = [
  ["sdkwork-mall-pc-home", "storefront-pages", ["./pages/HomePage", "./pages/HelpPage"]],
  ["sdkwork-mall-pc-search", "storefront-pages", ["./pages/SearchPage"]],
  ["sdkwork-mall-pc-catalog", "storefront-pages", ["./pages/CatalogPage"]],
  ["sdkwork-mall-pc-cart", "storefront-pages", ["./pages/CartPage"]],
  ["sdkwork-mall-pc-shop", "storefront-pages", ["./pages/ShopPage"]],
  ["sdkwork-mall-pc-activity", "storefront-pages", ["./pages/ActivityPage"]],
  ["sdkwork-mall-pc-address", "buyer-pages", ["./pages/AddressPage"]],
  ["sdkwork-mall-pc-after-sales", "buyer-pages", ["./pages/AfterSalesPage"]],
  ["sdkwork-mall-pc-reviews", "buyer-pages", ["./pages/ReviewsPage"]],
  ["sdkwork-mall-pc-messages", "buyer-pages", ["./pages/MessagesPage"]],
  ["sdkwork-mall-pc-merchant", "merchant-pages", ["./pages/MerchantPage"]],
  ["sdkwork-mall-pc-cms", "admin-pages", ["./pages/CmsPage"]],
  ["sdkwork-mall-pc-admin-risk", "admin-pages", ["./pages/AdminRiskPage"]],
  ["sdkwork-mall-pc-admin-settlement", "admin-pages", ["./pages/AdminSettlementPage"]],
  ["sdkwork-mall-pc-admin-permissions", "admin-pages", ["./pages/AdminPermissionsPage"]],
  ["sdkwork-mall-pc-admin-orders", "admin-pages", ["./pages/AdminOrdersPage"]],
  ["sdkwork-mall-pc-admin-marketing", "admin-pages", ["./pages/AdminMarketingPage"]],
  ["sdkwork-mall-pc-admin-membership", "membership-admin-page", ["./pages/MembershipAdminPage"]],
  ["sdkwork-mall-pc-admin-product", "catalog-admin", ["./pages/CatalogAdminPage"]],
  ["sdkwork-mall-pc-commerce", "buyer-pages", [
    "./pages/BuyerDashboardPage",
    "./pages/BuyerFavoritesPage",
    "./pages/BuyerProfilePage",
    "./pages/BuyerSecurityPage",
    "./pages/BuyerGiftCardsPage",
  ]],
  ["sdkwork-mall-pc-admin-reports", "admin-pages", [
    "./pages/AdminDashboardPage",
    "./pages/AdminReportsListPage",
    "./pages/AdminAuditPage",
  ]],
  ["sdkwork-mall-pc-admin-shops", "admin-pages", ["./admin-shops-page", "./admin-governance-pages"]],
];

const perScreenSubpathExports = [
  ["sdkwork-mall-pc-commerce", "buyer-dashboard-page", "./src/pages/BuyerDashboardPage.tsx"],
  ["sdkwork-mall-pc-commerce", "buyer-favorites-page", "./src/pages/BuyerFavoritesPage.tsx"],
  ["sdkwork-mall-pc-commerce", "buyer-profile-page", "./src/pages/BuyerProfilePage.tsx"],
  ["sdkwork-mall-pc-commerce", "buyer-security-page", "./src/pages/BuyerSecurityPage.tsx"],
  ["sdkwork-mall-pc-commerce", "buyer-gift-cards-page", "./src/pages/BuyerGiftCardsPage.tsx"],
  ["sdkwork-mall-pc-admin-reports", "admin-dashboard-page", "./src/pages/AdminDashboardPage.tsx"],
  ["sdkwork-mall-pc-admin-reports", "admin-reports-page", "./src/pages/AdminReportsListPage.tsx"],
  ["sdkwork-mall-pc-admin-reports", "admin-audit-page", "./src/pages/AdminAuditPage.tsx"],
  ["sdkwork-mall-pc-admin-shops", "admin-shops-page", "./src/admin-shops-page.ts"],
  ["sdkwork-mall-pc-admin-shops", "admin-governance-pages", "./src/admin-governance-pages.ts"],
];

function addPackageExport(pkg, exportName, targetPath) {
  pkg.exports = pkg.exports ?? {};
  pkg.exports[`./${exportName}`] = {
    types: targetPath,
    import: targetPath,
    default: targetPath,
  };
}

for (const [directory, exportName, sources] of routePageBarrels) {
  const pkgDir = path.join(packagesRoot, directory);
  const barrelPath = path.join(pkgDir, "src", `${exportName}.ts`);
  const barrelContents = `${sources.map((source) => `export * from "${source}";`).join("\n")}\n`;
  fs.writeFileSync(barrelPath, barrelContents);

  const pkgJsonPath = path.join(pkgDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  addPackageExport(pkg, exportName, `./src/${exportName}.ts`);
  fs.writeFileSync(pkgJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`${directory} -> ./${exportName}`);
}

for (const [directory, exportName, targetPath] of perScreenSubpathExports) {
  const pkgJsonPath = path.join(packagesRoot, directory, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  addPackageExport(pkg, exportName, targetPath);
  fs.writeFileSync(pkgJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`${directory} -> ./${exportName} (${targetPath})`);
}
