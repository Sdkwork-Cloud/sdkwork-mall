#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'tests',
  'contract',
  'verify-mall-standard-architecture.test.mjs',
);

let source = fs.readFileSync(testPath, 'utf8');

const contextualFixes = [
  {
    before: 'const shellSource = read("apps/sdkwork-mall-pc/packages/sdkwork-mall-pc-shell/src/index.tsx");\n  assert.match(shellSource, /isAuthenticated/);\n',
    pattern: /assert\.match\(shellSource, \/[^/]+\/\);/u,
    replacement: 'assert.match(shellSource, /我的账户/);',
  },
  {
    before: 'const appRoutesSource = read("apps/sdkwork-mall-pc/src/AppRoutes.tsx");\n  assert.match(appRoutesSource, /hasSdkworkMallPcRoutePermission/);\n',
    pattern: /assert\.match\(appRoutesSource, \/[^/]+\/\);/u,
    replacement: 'assert.match(appRoutesSource, /无权访问/);',
  },
  {
    before: 'assert.match(merchantSource, /shops\\.current\\.orders\\.list/);\n',
    pattern: /assert\.match\(merchantSource, \/[^/]+\/\);\n  assert\.match\(merchantSource, \/shops\.current\.categoryBindings\.list/,
    replacement: 'assert.match(merchantSource, /客服中心/);\n  assert.match(merchantSource, /shops.current.categoryBindings.list',
  },
  {
    before: 'assert.match(merchantSource, /shops.current.categoryBindings.list/);\n',
    pattern: /assert\.match\(merchantSource, \/[^/]+\/\);\n  assert\.match\(merchantSource, \/customerServices\.list/,
    replacement: 'assert.match(merchantSource, /设置中心/);\n  assert.match(merchantSource, /customerServices.list',
  },
  {
    before: 'const appRoutesLoadingSource = read("apps/sdkwork-mall-pc/src/AppRoutes.tsx");\n',
    pattern: /assert\.match\(appRoutesLoadingSource, \/[^/]+\/\);/u,
    replacement: 'assert.match(appRoutesLoadingSource, /加载中/);',
  },
  {
    before: 'const adminShopsSource = read("apps/sdkwork-mall-pc/packages/sdkwork-mall-pc-admin-shops/src/pages/AdminGovernancePages.tsx");\n',
    pattern: /assert\.match\(adminShopsSource, \/[^/]+\/\);/u,
    replacement: 'assert.match(adminShopsSource, /用户中心/);',
  },
  {
    before: 'assert.match(searchSource, /shopId/);\n',
    pattern: /assert\.match\(searchSource, \/[^/]+\/\);\n  assert\.match\(searchSource, \/[^/]+\/\);\n  assert\.match\(searchSource, \/[^/]+\/\);/u,
    replacement: [
      'assert.match(searchSource, /热卖推荐/);',
      'assert.match(searchSource, /最低价/);',
      'assert.match(searchSource, /相关店铺/);',
    ].join('\n  '),
  },
  {
    before: 'const buyerFavoritesSource = read("apps/sdkwork-mall-pc/packages/sdkwork-mall-pc-commerce/src/pages/BuyerFavoritesPage.tsx");\n',
    pattern: /assert\.match\(buyerFavoritesSource, \/[^/]+\/\);/u,
    replacement: 'assert.match(buyerFavoritesSource, /关注店铺/);',
  },
];

for (const fix of contextualFixes) {
  const index = source.indexOf(fix.before);
  if (index < 0) {
    continue;
  }
  const tail = source.slice(index + fix.before.length);
  const match = tail.match(fix.pattern);
  if (!match) {
    continue;
  }
  source = `${source.slice(0, index + fix.before.length)}${tail.replace(fix.pattern, fix.replacement)}`;
}

if (/\/\?+\//u.test(source)) {
  console.error('fix-architecture-test-encoding: unresolved corrupted regex literals remain');
  process.exit(1);
}

fs.writeFileSync(testPath, source, 'utf8');
console.log('fix-architecture-test-encoding: updated test file');
