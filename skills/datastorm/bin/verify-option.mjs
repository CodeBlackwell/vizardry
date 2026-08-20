#!/usr/bin/env node
/**
 * Verify one report chart in isolation, before the page around it exists. This is the
 * execution-feedback surface for a single charts.js fragment — the unit a parallel option
 * builder produces — so an agent can run its own fix loop without waiting for the assembled
 * report, and every failure carries the repair as an instruction.
 *
 *   node verify-option.mjs <option.js> [more.js ...] [--data chartdata.json] [--page page.html]
 *
 * A fragment is one or more `R.<id> = function (el) {…}` assignments in the charts.js
 * dialect. A complete charts.js (header and `K.boot(R)` included) also verifies, so the
 * assembled file can be re-checked with the same tool.
 *
 * `--data` and `--page` default to files beside the first fragment, then the working
 * directory; the page falls back to the shipped shell, whose tokens are only a stand-in for
 * the report's real palette. Everything else — the kit, d3 — resolves the way build.mjs
 * resolves it, so passing here predicts passing there.
 *
 * jsdom does not cascade CSS custom properties, so the page's :root tokens are fed to the
 * kit through a getComputedStyle shim. Without it every P.* color is '' and a NaN check
 * would gate on the harness rather than the chart.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const here = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args.splice(i, 2)[1];
};
const dataFlag = flag('--data');
const pageFlag = flag('--page');
const files = args;

if (files.length === 0 || files.some((f) => !existsSync(f))) {
  console.error('usage: verify-option.mjs <option.js> [more.js ...] [--data chartdata.json] [--page page.html]');
  process.exit(1);
}

const beside = dirname(resolve(files[0]));
const find = (explicit, name, fallback) =>
  [explicit, join(beside, name), name, fallback].filter(Boolean).find(existsSync) ?? null;

const dataPath = find(dataFlag, 'chartdata.json');
const pagePath = find(pageFlag, 'page.html', join(here, '../assets/page.html'));
const kitPath = join(here, '../assets/chart-kit.js');

if (!dataPath) {
  console.error('no chartdata.json beside the fragment or in the working directory — pass --data');
  process.exit(1);
}

/** Vendor libraries resolve exactly as build.mjs resolves them: nearest node_modules above. */
function vendor(rel, from) {
  for (let dir = from; ; dir = dirname(dir)) {
    const path = join(dir, 'node_modules', rel);
    if (existsSync(path)) return path;
    if (dir === dirname(dir)) return null;
  }
}
const need = (rel, install) => {
  // The fragment's own tree first (its d3 is the one the report will inline), then the
  // working directory, then beside this script — which is what serves a bare scratch dir
  // in the gallery layout.
  const path = vendor(rel, beside) ?? vendor(rel, process.cwd()) ?? vendor(rel, here);
  if (path) return path;
  console.error(`missing ${rel}\n  npm install ${install}`);
  process.exit(1);
};

const MARKS = 'path,rect,circle,line,polygon,polyline,ellipse,text,image';
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

/** The light-theme token block, same extraction as verify-report's contrast check. */
const pageRaw = readFileSync(pagePath, 'utf8');
const tokens = {};
for (const [, k, v] of (/:root\s*\{([^}]*)\}/.exec(pageRaw)?.[1] ?? '')
  .matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) tokens[k] = v.trim();
const styleBlock = /<style>([\s\S]*?)<\/style>/.exec(pageRaw)?.[1] ?? '';

const d3Source = readFileSync(need('d3/dist/d3.min.js', 'd3'), 'utf8');
const kitSource = readFileSync(kitPath, 'utf8');
const dataSource = JSON.stringify(JSON.parse(readFileSync(dataPath, 'utf8')));

function assemble(fragment, keys) {
  const geo = /\btopojson\b|\bATLAS\b/.test(fragment);
  const topo = geo ? readFileSync(need('topojson-client/dist/topojson-client.min.js', 'topojson-client'), 'utf8') : '';
  const atlas = geo
    ? readFileSync(find(null, 'atlas.json', need('world-atlas/countries-110m.json', 'world-atlas')), 'utf8')
    : 'null';
  return `<!doctype html><html><head><style>${styleBlock}</style></head><body>
<div id="tip"></div>
${keys.map((k) => `<figure><div class="chart" data-chart="${k}"></div></figure>`).join('\n')}
<script>
(function () {
  var T = ${JSON.stringify(tokens)};
  var orig = window.getComputedStyle.bind(window);
  window.getComputedStyle = function (el) {
    var cs = orig(el);
    if (el !== document.documentElement) return cs;
    return { getPropertyValue: function (p) {
      var k = String(p).replace(/^--/, '');
      return k in T ? T[k] : cs.getPropertyValue(p);
    } };
  };
})();
</script>
<script>${d3Source}</script>
<script>${topo}</script>
<script>window.ATLAS=${atlas};</script>
<script>window.CD=${dataSource};</script>
<script>${kitSource}</script>
<script>
var K = window.VZ, P = K.P, D = window.CD;
var R = {};
${fragment}
;K.boot(R);
</script>
</body></html>`;
}

let failed = false;

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const code = stripComments(source);
  const keys = [...new Set([...code.matchAll(/\bR\.([A-Za-z_$][\w$]*)\s*=/g)].map((m) => m[1]))];
  const checks = [];
  const warnings = [];
  const check = (name, ok, detail) => checks.push({ name, ok, detail: ok ? [] : detail });

  check('render-fn', keys.length > 0, [
    'no `R.<id> = function (el) {…}` assignment found — a fragment is one or more render ' +
      'functions in the charts.js dialect; see references/html-report.md'
  ]);

  if (keys.length > 0) {
    const errors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', (e) => errors.push(e.detail?.message ?? e.message));
    const dom = new JSDOM(assemble(source, keys), {
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      virtualConsole,
      beforeParse(window) {
        // jsdom has no 2D context; the proxy absorbs the API so canvas charts complete.
        const ctx = new Proxy(function () {}, { get: () => ctx, set: () => true, apply: () => ctx });
        window.HTMLCanvasElement.prototype.getContext = () => ctx;
      }
    });

    const nodes = keys.map((k) => dom.window.document.querySelector(`[data-chart="${k}"]`));
    const undrawn = nodes.filter(
      (n) => !(n.querySelector(`svg :is(${MARKS})`) || n.querySelector('canvas'))
    );
    check('drawn', undrawn.length === 0, [
      ...undrawn.map((n) => {
        const err = /failed: (.*)$/.exec(n.textContent.trim());
        return `  ${n.getAttribute('data-chart')}: ${err ? err[1] : 'no svg marks or canvas rendered'}`;
      }),
      ...errors.slice(0, 3).map((e) => `  script error: ${e}`),
      'the render function must draw from window.CD through the kit — fix the throw or the ' +
        'empty selection before anything else here matters'
    ]);

    const markup = nodes.map((n) => n.innerHTML).join('');
    check('no-nan', !/NaN|Infinity/.test(markup) && !/="undefined"/.test(markup), [
      'a NaN, Infinity or undefined reached an attribute and the browser silently drops that ' +
        'mark — check the domain against the real chartdata.json and floor any derived dimension'
    ]);
  }

  check('no-hex', !/#[0-9a-fA-F]{3,8}\b/.test(code), [
    'a hardcoded hex color never survives the theme flip — colors come from P (P.acc, ' +
      'P.seq(t), P.div(t)), which is filled from the page tokens and redrawn on theme change'
  ]);

  check('no-raw-timers', !/\b(setInterval|setTimeout|requestAnimationFrame)\s*\(/.test(code), [
    'nothing autoplays and nothing loops uninvited — playback goes through K.transport, ' +
      'durations through K.tdur, delays divided by K.spd; a raw timer bypasses pause, ' +
      'scrub, speed and prefers-reduced-motion at once'
  ]);

  if (!/\b(hov|show)\s*\(/.test(code)) {
    warnings.push(
      'no tooltip — every option example gets one (K.hov, or K.show from a canvas ' +
        'pointermove); only a profile-section chart may skip it'
    );
  }

  console.log(file);
  for (const c of checks) {
    console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.name}`);
    if (c.ok) continue;
    failed = true;
    for (const line of c.detail) console.log(`        ${line}`);
  }
  for (const w of warnings) console.log(`  WARN  ${w}`);
  console.log('');
}

process.exit(failed ? 1 : 0);
