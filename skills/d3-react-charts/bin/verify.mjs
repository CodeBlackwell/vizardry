#!/usr/bin/env node
/**
 * Verify a React + D3 chart component. Runs on any .tsx file, in any repo, with no gallery
 * around it — this is the execution-feedback surface of the chart skill, so every failure
 * carries the repair as an instruction rather than a diagnosis.
 *
 *   node bin/verify.mjs <file.tsx> [more.tsx ...]
 *
 * Exit 0 when every file passes every check, 1 otherwise. All three tiers always run: a type
 * error and a render failure are usually one root cause and seeing both is what makes it
 * diagnosable. Capping the repair loop is the caller's job, not this script's.
 *
 * src/gallery/__tests__/chartRules.ts is the single rule oracle and is transpiled at runtime
 * rather than restated here. Packaging copies it next to this file, so both layouts resolve.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// A missing toolchain answers with the npm install to run, not a module-not-found stack —
// this tool ships into a plugin whose dependencies the user installs separately.
let toolRoot = here;
while (!existsSync(join(toolRoot, 'package.json')) && dirname(toolRoot) !== toolRoot) {
  toolRoot = dirname(toolRoot);
}
for (const dep of ['esbuild', 'jsdom', 'typescript']) {
  try {
    createRequire(import.meta.url).resolve(dep);
  } catch {
    console.error(`${dep} is not installed — run \`npm install\` in ${toolRoot} first`);
    process.exit(1);
  }
}
const { build, transform } = await import('esbuild');
const { JSDOM } = await import('jsdom');

const TSC_FLAGS = [
  '--noEmit', '--jsx', 'react-jsx', '--esModuleInterop', '--skipLibCheck', '--strict',
  '--target', 'es2020', '--module', 'esnext', '--moduleResolution', 'bundler'
];

function chartRulesSource() {
  const candidates = [
    join(here, 'chartRules.ts'), // packaged plugin layout
    join(here, '../src/gallery/__tests__/chartRules.ts') // gallery layout
  ];
  const found = candidates.find(existsSync);
  if (!found) throw new Error(`chartRules.ts not found beside ${here} or in the gallery`);
  return found;
}

/** node resolves react and d3 from here, so scratch output must live inside the target's tree. */
function projectRoot(file) {
  let dir = dirname(resolve(file));
  while (!existsSync(join(dir, 'package.json')) && dirname(dir) !== dir) dir = dirname(dir);
  return existsSync(join(dir, 'package.json')) ? dir : dirname(resolve(file));
}

// ---------------------------------------------------------------- tier 1: source rules

function sourceChecks(source, rules) {
  const code = rules.stripComments(source);
  const hit = (list) => list.filter(({ pattern }) => pattern.test(code));

  const dead = hit(rules.DEAD_API);
  const random = hit(rules.NON_DETERMINISM);

  return [
    {
      name: 'dead-api',
      ok: dead.length === 0,
      detail: dead.map((d) => `${d.why} — ${d.fix}`)
    },
    {
      name: 'determinism',
      ok: random.length === 0,
      detail: random.map((d) => `${d.why} — ${d.fix}`)
    },
    {
      name: 'routing',
      ok: rules.routeOk(source),
      detail: [
        'this chart calls d3.select but none of the five escape triggers applies ' +
          '(d3-zoom, d3-brush, d3-drag, d3-force, path/shape morphing) — delete the ' +
          'selection, compute scales and shapes in useMemo, and render the marks as JSX'
      ]
    },
    // The component contract. Every one of these passes on all 181 gallery charts and on
    // every exemplar, so a failure here is the generated file departing from the house
    // structure rather than the rule being too strict for real work.
    ...rules.HOUSE_RULES.map(({ name, ok, fix }) => ({
      name,
      ok: ok(source),
      detail: [fix(source)]
    }))
  ];
}

// ---------------------------------------------------------------- tier 2: type check

/** One invocation over every target, then diagnostics are attributed back by path. */
function typeCheck(root, files) {
  const rel = files.map((f) => relative(root, resolve(f)));
  const local = join(root, 'node_modules/.bin/tsc');
  const [cmd, lead] = existsSync(local) ? [local, []] : ['npx', ['tsc']];

  let output = '';
  try {
    execFileSync(cmd, [...lead, ...TSC_FLAGS, ...rel], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (error) {
    output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }

  const byFile = new Map(rel.map((r) => [r, []]));
  const elsewhere = [];
  for (const line of output.split('\n')) {
    const path = /^(\S[^(]*)\(\d+,\d+\): error /.exec(line)?.[1];
    if (!path) continue;
    (byFile.get(path) ?? elsewhere).push(line.trim());
  }
  return { byFile, elsewhere };
}

// ---------------------------------------------------------------- tier 3: render

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
  const keys = [
    'window', 'document', 'navigator', 'Element', 'HTMLElement', 'SVGElement', 'Node', 'Event',
    'MutationObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle'
  ];
  // navigator is a getter-only accessor on modern node, so plain assignment throws.
  for (const key of keys) {
    Object.defineProperty(globalThis, key, {
      value: dom.window[key],
      configurable: true,
      writable: true
    });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return dom;
}

/**
 * React and react-dom must come from the target file's own project, or the chart's React and
 * the renderer's React are two different instances and every hook throws.
 */
function loadReact(scratch) {
  const require_ = createRequire(join(scratch, 'resolve.mjs'));
  const React = require_('react');
  const { createRoot } = require_('react-dom/client');
  const { renderToStaticMarkup } = require_('react-dom/server');
  const act = React.act ?? require_('react-dom/test-utils').act;
  return { React, createRoot, renderToStaticMarkup, act };
}

/**
 * JSON is inlined rather than left external. Node's ESM loader demands an import attribute
 * for a .json module and the chart's own bundler does not, so externalising it would fail
 * charts that are correct — every atlas-backed geo chart, in practice.
 */
const bundleJson = {
  name: 'bundle-json',
  setup(esbuild) {
    esbuild.onResolve({ filter: /\.json$/ }, (args) => {
      if (!args.importer) return null;
      try {
        return { path: createRequire(args.importer).resolve(args.path), external: false };
      } catch {
        return null;
      }
    });
  }
};

async function bundle(file, scratch) {
  const out = join(scratch, `${basename(file).replace(/\.tsx?$/, '')}.mjs`);
  await build({
    entryPoints: [resolve(file)],
    outfile: out,
    bundle: true,
    packages: 'external', // react and d3 resolve from the target project at import time
    plugins: [bundleJson],
    format: 'esm',
    platform: 'node',
    target: 'es2020',
    jsx: 'automatic',
    logLevel: 'silent'
  });
  return out;
}

async function renderChecks(file, source, scratch, rules) {
  const { React, createRoot, renderToStaticMarkup, act } = loadReact(scratch);
  const mod = await import(pathToFileURL(await bundle(file, scratch)).href);
  const Component = mod.default;
  if (typeof Component !== 'function') {
    return [
      {
        name: 'render',
        ok: false,
        detail: ['no default export — export the chart as `export default function Chart(...)`']
      }
    ];
  }

  const mount = (element) => {
    const host = globalThis.document.createElement('div');
    globalThis.document.body.appendChild(host);
    const root = createRoot(host);
    act(() => root.render(element));
    const html = host.innerHTML;
    act(() => root.unmount());
    host.remove();
    return html;
  };

  const wide = mount(React.createElement(Component, { width: 900 }));
  const zero = mount(React.createElement(Component, { width: 0 }));
  const narrow = mount(React.createElement(Component, { width: 320 }));
  const strict = mount(
    React.createElement(React.StrictMode, null, React.createElement(Component, { width: 900 }))
  );

  /**
   * The floor is route-aware and lives in chartRules, mirroring the harness: `render.test.tsx`
   * returns early on a ref-routed chart before asserting the mark floor, and
   * `render.dom.test.tsx` asserts only `> 0` for those.
   *
   * It is cleared by the first paint OR the mounted state, because the two legitimately
   * differ in opposite directions: a ref chart draws nothing until its effect runs, and a
   * replay-animated chart renders its completed state on the server and then rewinds to frame
   * one the moment its effect fires. Requiring both would fail every chart of one kind or the
   * other. A chart that is genuinely empty is empty in both.
   */
  const server = renderToStaticMarkup(React.createElement(Component, { width: 900 }));
  const drew = rules.drewEnough(wide, source) || rules.drewEnough(server, source);

  return [
    {
      name: 'svg-viewbox',
      ok: /<svg/.test(wide) && /viewBox="[-\d. ]+"/.test(wide),
      detail: ['emit a root <svg> with viewBox={`0 0 ${width} ${height}`}, width="100%" and role="img"']
    },
    {
      name: 'drew-something',
      ok: drew,
      detail: [
        `only ${rules.markCount(wide)} marks and ${rules.pathDataLength(wide)} chars of path ` +
          `data at width 900 — ${rules.floorFor(source)}; the chart is rendering an empty ` +
          'frame, so check that the data reaches the marks'
      ]
    },
    {
      name: 'no-nan',
      ok: !/NaN|Infinity/.test(wide) && !/="undefined"/.test(wide),
      detail: [
        'a NaN, Infinity or undefined reached an attribute and the browser silently drops ' +
          'that mark — floor the dimensions (Math.max(1, …)) and give every scale a domain ' +
          'that cannot be empty'
      ]
    },
    {
      name: 'null-at-zero-width',
      ok: zero === '',
      detail: [
        'return null when width === 0 — the first ResizeObserver measurement is always 0, ' +
          'and the guard goes after every hook so hook order stays constant'
      ]
    },
    {
      name: 'narrow-width',
      ok: !/NaN|Infinity/.test(narrow),
      detail: ['invalid geometry at 320px — floor every derived dimension with Math.max(1, …)']
    },
    {
      name: 'strictmode-parity',
      ok: rules.markCount(strict) === rules.markCount(wide),
      detail: [
        `StrictMode drew ${rules.markCount(strict)} marks where a single mount drew ` +
          `${rules.markCount(wide)} — the effect appends without clearing; clear the subtree ` +
          'on entry (selection.selectAll("*").remove()) and return a cleanup that removes it'
      ]
    }
  ];
}

// ---------------------------------------------------------------- driver

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('usage: verify.mjs <file.tsx> [more.tsx ...]');
  process.exit(1);
}

const missing = files.filter((f) => !existsSync(f));
if (missing.length > 0) {
  console.error(`no such file: ${missing.join(', ')}`);
  process.exit(1);
}

const root = projectRoot(files[0]);
const foreign = files.filter((f) => projectRoot(f) !== root);
if (foreign.length > 0) {
  console.error(`all files must share one project root; ${foreign.join(', ')} do not`);
  process.exit(1);
}

// Scoped to the pid: two verifiers running at once must not delete each other's scratch.
// Nested under one parent so a killed run leaves at most one directory to ignore — the
// cleanup below never runs if the process is killed rather than exiting.
const scratch = join(root, '.verify-tmp', String(process.pid));
rmSync(scratch, { recursive: true, force: true });
mkdirSync(scratch, { recursive: true });

let failed = false;
try {
  const rulesJs = await transform(readFileSync(chartRulesSource(), 'utf8'), {
    loader: 'ts',
    format: 'esm'
  });
  const rulesFile = join(scratch, 'chartRules.mjs');
  writeFileSync(rulesFile, rulesJs.code);
  const rules = await import(pathToFileURL(rulesFile).href);

  installDom();
  const types = typeCheck(root, files);

  for (const file of files) {
    const rel = relative(root, resolve(file));
    const source = readFileSync(file, 'utf8');
    const checks = sourceChecks(source, rules);

    const diagnostics = types.byFile.get(rel) ?? [];
    checks.push({ name: 'types', ok: diagnostics.length === 0, detail: diagnostics });

    try {
      checks.push(...(await renderChecks(file, source, scratch, rules)));
    } catch (error) {
      checks.push({
        name: 'render',
        ok: false,
        detail: [
          `mounting threw: ${error.message}`,
          'fix the throw before the remaining render checks can run'
        ]
      });
    }

    console.log(file);
    for (const check of checks) {
      console.log(`  ${check.ok ? 'PASS' : 'FAIL'}  ${check.name}`);
      if (check.ok) continue;
      failed = true;
      for (const line of check.detail) console.log(`        ${line}`);
    }
    console.log('');
  }

  if (types.elsewhere.length > 0) {
    console.log('type errors outside the verified files:');
    for (const line of types.elsewhere) console.log(`  ${line}`);
    console.log('');
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
  // Leave nothing behind in someone else's project — but only if no concurrent run is using it.
  try {
    rmdirSync(dirname(scratch));
  } catch {
    /* still in use, or already gone */
  }
}

process.exit(failed ? 1 : 0);
