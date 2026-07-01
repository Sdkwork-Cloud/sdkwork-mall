#!/usr/bin/env node
/**
 * Materializes mall-owned commerce SDK transport packages from the archived
 * sdkwork-commerce vendor snapshot in sdkwork-clawrouter git history.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const mallRoot = path.resolve(scriptDir, '..');
const clawrouterRoot = path.resolve(mallRoot, '..', 'sdkwork-clawrouter');
const sourceCommit = process.env.SDKWORK_COMMERCE_SDK_SOURCE_COMMIT ?? '8c5d3f0';

const SDK_SOURCES = [
  {
    gitPrefix: 'vendor/sdkwork-commerce/sdks/sdkwork-commerce-app-sdk',
    target: 'sdks/sdkwork-commerce-app-sdk',
  },
  {
    gitPrefix: 'vendor/sdkwork-commerce/sdks/sdkwork-commerce-backend-sdk',
    target: 'sdks/sdkwork-commerce-backend-sdk',
  },
];

function run(command) {
  return execSync(command, { cwd: clawrouterRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function listFiles(gitPrefix) {
  return run(`git ls-tree -r --name-only ${sourceCommit} -- ${gitPrefix}`)
    .split(/\r?\n/u)
    .filter(Boolean);
}

function readBlob(gitPath) {
  return run(`git show ${sourceCommit}:${gitPath}`);
}

function writeTarget(targetPath, content) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content.endsWith('\n') ? content : `${content}\n`);
}

function materializeSdk({ gitPrefix, target }) {
  const files = listFiles(gitPrefix);
  if (files.length === 0) {
    throw new Error(`No files found at ${sourceCommit}:${gitPrefix}`);
  }

  let written = 0;
  for (const gitPath of files) {
    if (gitPath.includes('/node_modules/')) {
      continue;
    }
    const relative = gitPath.slice(gitPrefix.length + 1);
    const targetPath = path.join(mallRoot, target, relative);
    writeTarget(targetPath, readBlob(gitPath));
    written += 1;
  }

  return written;
}

if (!fs.existsSync(path.join(clawrouterRoot, '.git'))) {
  console.error(`sdkwork-clawrouter git checkout not found at ${clawrouterRoot}`);
  process.exit(1);
}

let total = 0;
for (const source of SDK_SOURCES) {
  const count = materializeSdk(source);
  console.log(`materialized ${count} file(s) -> ${source.target}`);
  total += count;
}

console.log(`commerce SDK materialization complete (${total} files)`);
