#!/usr/bin/env node
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = ["apps/sdkwork-mall-pc/dist", "node_modules/.vite"];

for (const relativePath of targets) {
  rmSync(path.join(workspaceRoot, relativePath), { force: true, recursive: true });
}

process.stdout.write("[clean-artifacts] removed build artifacts\n");
