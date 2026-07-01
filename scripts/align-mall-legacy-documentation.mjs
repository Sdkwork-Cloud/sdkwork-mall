#!/usr/bin/env node
/**
 * Removes pre-launch legacy documentation references in sdkwork-mall:
 * - sdkwork-commerce (deleted) snapshot paths
 * - @sdkwork/commerce-service transitional naming
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const REPLACEMENTS = [
  [/sdkwork-commerce \(deleted\)\/apps\/sdkwork-mall-pc\/packages\//g, 'apps/sdkwork-mall-pc/packages/'],
  [/sdkwork-commerce \(deleted\)-app-sdk/g, 'sdkwork-commerce-app-sdk'],
  [/sdkwork-commerce \(deleted\)-backend-sdk/g, 'sdkwork-commerce-backend-sdk'],
  [/`\.\.\/sdkwork-commerce \(deleted\)\/sdks\//g, '`sdks/'],
  [/\.\.\/sdkwork-commerce \(deleted\)\/sdks\//g, 'sdks/'],
  [/@sdkwork\/commerce-service/g, '@sdkwork/mall-commerce-service'],
  [/sdkwork-commerce \(deleted\)/g, 'sdkwork-mall'],
];

function walkMarkdownFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
      continue;
    }
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkMarkdownFiles(absolute, results);
      continue;
    }
    if (entry.name.endsWith('.md')) {
      results.push(absolute);
    }
  }
  return results;
}

function fixPackageSpecRoot(filePath, text) {
  const packageMatch = filePath.match(/packages[\\/](sdkwork-mall-pc-[^\\/]+)[\\/]specs[\\/]README\.md$/u);
  if (!packageMatch) {
    return text;
  }

  const packageDir = packageMatch[1];
  const canonicalRoot = `apps/sdkwork-mall-pc/packages/${packageDir}`;
  return text.replace(
    /\| Root \| `[^`]+` \|/u,
    `| Root | \`${canonicalRoot}\` |`,
  );
}

function alignFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = original;

  for (const [pattern, replacement] of REPLACEMENTS) {
    updated = updated.replace(pattern, replacement);
  }

  updated = fixPackageSpecRoot(filePath, updated);

  if (updated === original) {
    return false;
  }

  fs.writeFileSync(filePath, updated);
  return true;
}

function alignRootReadmes() {
  const specsReadme = path.join(repoRoot, 'specs', 'README.md');
  if (fs.existsSync(specsReadme)) {
    const text = fs.readFileSync(specsReadme, 'utf8');
    const updated = [
      '# SDKWork Mall Specs',
      '',
      'Application repository for Mall PC. Backend commerce APIs, database lifecycle, and `sdkwork-web-framework` integration are owned by individual T1 capability repositories (`sdkwork-shop`, `sdkwork-order`, `sdkwork-payment`, `sdkwork-merchandise`, `sdkwork-membership`, `sdkwork-promotion`, `sdkwork-account`).',
      '',
      'Mall-owned generated commerce transport SDKs live under `sdks/`. Federated storefront and admin remote ports use `@sdkwork/mall-commerce-service` with mall-local SDK families. Migrated PC packages consume T1 domain services (`@sdkwork/account-service`, `@sdkwork/order-service`, …).',
      '',
      'Authority: `../sdkwork-specs/README.md`, `../sdkwork-specs/MIGRATION_SPEC.md` section 8.',
      '',
    ].join('\n');
    if (text !== updated) {
      fs.writeFileSync(specsReadme, updated);
      return true;
    }
  }

  const cratesReadme = path.join(repoRoot, 'crates', 'README.md');
  if (fs.existsSync(cratesReadme)) {
    const updated = [
      '# Crates',
      '',
      'This mall application repository does not author Rust crates. Commerce APIs and database layers live in sibling T1 capability repositories (`sdkwork-shop`, `sdkwork-order`, `sdkwork-payment`, `sdkwork-merchandise`, and related domains).',
      '',
    ].join('\n');
    const text = fs.readFileSync(cratesReadme, 'utf8');
    if (text !== updated) {
      fs.writeFileSync(cratesReadme, updated);
      return true;
    }
  }

  const apisReadme = path.join(repoRoot, 'apis', 'README.md');
  if (fs.existsSync(apisReadme)) {
    const updated = [
      '# APIs',
      '',
      'Mall PC consumes commerce HTTP APIs through mall-owned generated SDKs under `sdks/` and T1 capability SDK families from sibling repositories. This repository does not own OpenAPI authorities.',
      '',
    ].join('\n');
    const text = fs.readFileSync(apisReadme, 'utf8');
    if (text !== updated) {
      fs.writeFileSync(apisReadme, updated);
      return true;
    }
  }

  return false;
}

const changed = [];
for (const filePath of walkMarkdownFiles(repoRoot)) {
  if (alignFile(filePath)) {
    changed.push(path.relative(repoRoot, filePath));
  }
}

if (alignRootReadmes()) {
  changed.push('specs|crates|apis README canonical rewrite');
}

if (changed.length === 0) {
  console.log('align-mall-legacy-documentation: no changes');
  process.exit(0);
}

console.log(`align-mall-legacy-documentation: updated ${changed.length} file(s)`);
for (const file of changed.sort()) {
  console.log(`  - ${file}`);
}
