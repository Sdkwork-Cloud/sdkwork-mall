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

source = source
  .replaceAll('@sdkwork/commerce-service', '@sdkwork/mall-commerce-service')
  .replaceAll('@sdkwork\\/commerce-service', '@sdkwork\\/mall-commerce-service')
  .replaceAll('/commerce-service/', '/mall-commerce-service/')
  .replaceAll(
    'assert.match(sdkClientsSource, /sdkwork-commerce-app-sdk-generated-typescript/);',
    'assert.match(sdkClientsSource, /@sdkwork\\/clawrouter-app-sdk\\/domains/);',
  )
  .replaceAll(
    'assert.equal(dependencyIds.includes("sdkwork-commerce"), true, "packaging workflow must declare sdkwork-commerce dependency");',
    [
      'assert.equal(',
      '    dependencyIds.includes("sdkwork-commerce"),',
      '    false,',
      '    "packaging workflow must not declare retired sdkwork-commerce dependency",',
      '  );',
      '  assert.equal(dependencyIds.includes("sdkwork-appbase"), true, "packaging workflow must declare sdkwork-appbase dependency");',
    ].join('\n  '),
  );

const markdownTest = `
test("mall markdown must not reference deleted commerce snapshot paths", () => {
  const legacyPatterns = [
    /sdkwork-commerce \\(deleted\\)/,
    /@sdkwork\\/commerce-service(?!-)/,
    /apps\\/sdkwork-commerce-pc\\/packages\\/sdkwork-mall-pc/,
  ];

  const violations = collectFiles(workspaceRoot, (filePath) => {
    if (!filePath.endsWith(".md") || filePath.includes(\`\${path.sep}node_modules\${path.sep}\`)) {
      return false;
    }
    const markdownSource = readFileSync(filePath, "utf8");
    return legacyPatterns.some((pattern) => pattern.test(markdownSource));
  }).map((filePath) => path.relative(workspaceRoot, filePath).replaceAll("\\\\", "/"));

  assert.deepEqual(violations, []);
});
`;

if (!source.includes('mall markdown must not reference deleted commerce snapshot paths')) {
  source = source.replace(
    'test("mall domain-migrated packages must not declare stale commerce-service peers", () => {',
    `${markdownTest}\n\ntest("mall domain-migrated packages must not declare stale commerce-service peers", () => {`,
  );
  source = source.replace(
    'test("mall domain-migrated packages must not declare stale commerce-service peers", () => {',
    'test("mall domain-migrated packages must not declare stale mall-commerce-service peers", () => {',
  );
}

fs.writeFileSync(testPath, source, 'utf8');
console.log('align-architecture-test-commerce-naming: updated');
