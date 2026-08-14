#!/usr/bin/env node
/**
 * Assembles the report into one self-contained file. Run from the directory holding
 * page.html, charts.js and chartdata.json:
 *
 *   node <assets>/build.mjs                       -> ./report.html
 *   node <assets>/build.mjs ../my-brainstorm.html
 *
 * Two things it does that a cat > out.html would not:
 *
 * 1. Inlines the vendor libraries and the data, so the page has no network dependency and
 *    survives being emailed, opened from a file:// path, or published as an Artifact under a
 *    CSP that blocks every external host.
 * 2. Escapes every non-ASCII character in the authored content — HTML numeric entities in the
 *    markup, \uXXXX in the scripts, and JSON re-dumped. A charset <meta> is prepended as well,
 *    but the escaping is what makes the page charset-INDEPENDENT: a server that serves it as
 *    latin-1 still renders it correctly. Skipping this is how a report ships with a sidebar
 *    full of mojibake.
 */
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(process.argv[2] || 'report.html');

const NON_ASCII = /[\u0080-\uffff]/g;
const entities = (s) => s.replace(NON_ASCII, (c) => '&#' + c.charCodeAt(0) + ';');
const escapes = (s) => s.replace(NON_ASCII, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
const json = (path) => escapes(JSON.stringify(JSON.parse(readFileSync(path, 'utf8'))));

/** Vendor libraries come from the nearest node_modules above the working directory. */
function vendor(rel) {
  for (let dir = process.cwd(); ; dir = dirname(dir)) {
    const path = join(dir, 'node_modules', rel);
    if (existsSync(path)) return path;
    if (dir === dirname(dir)) return null;
  }
}

function need(rel, install) {
  const path = vendor(rel);
  if (path) return path;
  console.error(`missing ${rel}\n  npm install ${install}`);
  process.exit(1);
}

/** Beside this script first, so the kit travels with it; then the working directory. */
const local = (name) => (existsSync(join(here, name)) ? join(here, name) : name);

let html = entities(readFileSync('page.html', 'utf8'));

// A part is inlined only if its placeholder is in the page — a report with nothing
// geographic on it should not carry a 100KB atlas.
const parts = {
  '/*D3*/': () => readFileSync(need('d3/dist/d3.min.js', 'd3'), 'utf8'),
  '/*TOPO*/': () => readFileSync(need('topojson-client/dist/topojson-client.min.js', 'topojson-client'), 'utf8'),
  '/*ATLAS*/': () => json(existsSync('atlas.json') ? 'atlas.json' : need('world-atlas/countries-110m.json', 'world-atlas')),
  '/*DATA*/': () => json('chartdata.json'),
  '/*KIT*/': () => escapes(readFileSync(local('chart-kit.js'), 'utf8')),
  '/*CHARTS*/': () => escapes(readFileSync('charts.js', 'utf8'))
};

// The kit and the charts are not optional: a page whose placeholders were renamed would
// otherwise build clean and render nothing.
for (const key of ['/*KIT*/', '/*CHARTS*/']) {
  if (!html.includes(key)) {
    console.error(`page.html has no ${key} placeholder — nothing would render`);
    process.exit(1);
  }
}

const used = [];
for (const [key, load] of Object.entries(parts)) {
  // A placeholder quoted in a comment is the first occurrence, so the library lands in the
  // comment and the script tag keeps its placeholder — a page that builds clean and half runs.
  const seen = html.split(key).length - 1;
  if (seen === 0) continue;
  if (seen > 1) {
    console.error(`page.html mentions ${key} ${seen} times; it must appear exactly once`);
    process.exit(1);
  }
  const text = load();
  html = html.replace(key, () => text); // function form: $& in minified vendor code is literal
  used.push(`${key.slice(2, -2)} ${(Buffer.byteLength(text) / 1024).toFixed(0)}KB`);
}

writeFileSync(out, '<meta charset="utf-8">\n' + html);

const residue = (html.match(NON_ASCII) || []).length;
console.log(`${out}  ${(statSync(out).size / 1024 / 1024).toFixed(2)}MB`);
console.log(`  ${used.join(' · ')}`);
console.log(`  non-ASCII left: ${residue} (vendor library internals only — authored content is 0)`);
