#!/usr/bin/env node
/**
 * Recompute every shipped file's hash against manifest.json, and fail on files the manifest
 * does not claim. This is the vizardry repo proving its own integrity in CI, independent of
 * the private gallery that generated it. Run from the repo root.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const sha = (path) => createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 16);

const bad = [];
for (const [file, hash] of Object.entries(manifest.sha256_16)) {
  try {
    if (sha(file) !== hash) bad.push(`stale    ${file}`);
  } catch {
    bad.push(`missing  ${file}`);
  }
}

// Same skip list as the generator's prune walk, plus the manifest itself (it cannot hash itself).
const skip = new Set(['.git', 'node_modules', '.verify-tmp', 'package-lock.json', 'manifest.json']);
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !skip.has(entry.name))
    .flatMap((entry) => {
      const path = dir === '.' ? entry.name : join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    });
for (const found of walk('.')) {
  if (!(found in manifest.sha256_16)) bad.push(`orphan   ${found}`);
}

if (bad.length) {
  console.error(`${bad.length} files disagree with the manifest:`);
  for (const line of bad.sort()) console.error(`  ${line}`);
  process.exit(1);
}
console.log(`${Object.keys(manifest.sha256_16).length} files match the manifest`);
