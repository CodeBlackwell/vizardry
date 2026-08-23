#!/usr/bin/env node
/**
 * Verify one report chart in isolation, before the page around it exists. This is the
 * execution-feedback surface for a single charts.js fragment — the unit a parallel option
 * builder produces — so an agent can run its own fix loop without waiting for the assembled
 * report, and every failure carries the repair as an instruction.
 *
 *   node verify-option.mjs <option.js> [more.js ...] [--data chartdata.json] [--page page.html]
 *                          [--keys a,b,c] [--strict] [--emit evidence.json]
 *   node verify-option.mjs --check-keys --data chartdata.json --specs specs.json
 *
 * `--keys` are the option spec's declared dataKeys; without them the two adherence checks do
 * not run, which is what keeps the serial /datastorm path unchanged. `--strict` turns the
 * tooltip warning into a failure, which an option card wants and a profile-section chart does
 * not. `--emit` writes what was actually drawn — keys read, mark count, axis labels, tooltip
 * sample — so a reviewing agent judges the result rather than the source.
 *
 * Scope note: `no-raw-timers` and `hand-rolled-transport` read the whole file, so a bare
 * fragment and a complete charts.js can disagree — a timer in a top-level helper fails the
 * file even though no individual fragment contains one. The fragment is the unit that matters.
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
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args.splice(i, 2)[1];
};
const bool = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
};
const dataFlag = flag('--data');
const pageFlag = flag('--page');
// Declared dataKeys. Absent = the adherence checks do not run, which is what keeps the
// serial /datastorm path byte-identical to before they existed.
const declaredKeys = (flag('--keys') ?? '').split(',').map((k) => k.trim()).filter(Boolean);
const emitPath = flag('--emit');
// GATE-SPECS's preflight: resolve every spec's dataKeys against chartdata.json with no
// fragment and no jsdom. Takes a specs file ([{id, dataKeys}]) or a bare --keys list.
const specsFlag = flag('--specs');
const checkKeys = bool('--check-keys');
// The parallel builder passes --strict for an option card; a profile-section chart does not.
const strict = bool('--strict');
const files = args;

// --- spec preflight ---------------------------------------------------------------------
// The gate's own promise is that a missing aggregate costs one line here and a whole builder
// after. That only holds if it can be checked, so: a pure set difference over chartdata.json,
// every spec at once, in milliseconds, before the fan-out spends anything.
if (checkKeys) {
  const dataPath = dataFlag ?? 'chartdata.json';
  if (!existsSync(dataPath)) {
    console.error(`--check-keys: no data file at ${dataPath}`);
    process.exit(1);
  }
  // Refuse rather than report a vacuous pass: a gate that reads green having checked
  // nothing is worse than no gate, because it is believed.
  if (!specsFlag && declaredKeys.length === 0) {
    console.error('--check-keys needs something to check: pass --specs specs.json or --keys a,b,c');
    process.exit(1);
  }
  const available = new Set(Object.keys(JSON.parse(readFileSync(dataPath, 'utf8'))));
  const specs = specsFlag
    ? JSON.parse(readFileSync(specsFlag, 'utf8'))
    : [{ id: '(--keys)', dataKeys: declaredKeys }];
  let failingSpecs = 0;
  console.log(dataPath);
  for (const spec of specs) {
    const declared = (spec.dataKeys ?? []).filter(Boolean);
    const missing = declared.filter((k) => !available.has(k));
    if (missing.length) failingSpecs += 1;
    console.log(`  ${missing.length ? 'FAIL' : 'PASS'}  ${spec.id}` +
      (missing.length ? `\n        absent from the data: ${missing.join(', ')}` : ''));
  }
  console.log(failingSpecs
    ? `\n${failingSpecs} of ${specs.length} spec(s) declare an aggregate prep.py does not ` +
      'compute. Add it and rebuild chartdata.json before dispatching.'
    : `\nAll ${specs.length} spec(s) resolve against the data.`);
  process.exit(failingSpecs ? 1 : 0);
}

// Loaded here rather than at the top because only RUNNING a fragment needs a DOM. The
// preflight above is a set difference over JSON, and making the earliest and cheapest gate
// the one with the heaviest prerequisite is how it ends up not being run.
const { JSDOM, VirtualConsole } = await import('jsdom');

if (files.length === 0 || files.some((f) => !existsSync(f))) {
  console.error('usage: verify-option.mjs <option.js> [more.js ...] [--data chartdata.json] ' +
    '[--page page.html] [--keys a,b,c] [--strict] [--emit evidence.json]\n' +
    '       verify-option.mjs --check-keys --data chartdata.json [--specs specs.json | --keys a,b]');
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
<script>
// Data adherence is measured, not asserted: a get trap records which top-level aggregates the
// fragment actually read, so a declared dataKey it ignored and an aggregate it invented are
// both visible afterwards. A get-only trap is transparent to everything else.
(function () {
  var RAW = ${dataSource};
  window.__reads = [];
  window.CD = new Proxy(RAW, {
    get: function (t, k) {
      if (typeof k === 'string' && window.__reads.indexOf(k) === -1) window.__reads.push(k);
      return t[k];
    }
  });
})();
</script>
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
const evidenceOut = [];

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const code = stripComments(source);
  const keys = [...new Set([...code.matchAll(/\bR\.([A-Za-z_$][\w$]*)\s*=/g)].map((m) => m[1]))];
  const checks = [];
  const warnings = [];
  const check = (name, ok, detail) => checks.push({ name, ok, detail: ok ? [] : detail });
  // What was actually drawn, for --emit. A reviewing agent judges these facts; it never
  // re-derives them from the fragment's source.
  const evidence = { file, keys };

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
        // jsdom has no matchMedia either, and chart-kit's boot() calls it unguarded (the RM
        // read at the top of the kit IS guarded, which is why the kit still loads). Without
        // this shim boot throws after renderAll, the theme-redraw observer never registers,
        // and every run carries a swallowed error that pollutes real failure detail.
        window.matchMedia = (q) => ({
          matches: false, media: q, onchange: null,
          addEventListener() {}, removeEventListener() {},
          addListener() {}, removeListener() {}, dispatchEvent: () => false
        });
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
    evidence.marks = nodes.reduce((n, el) => n + el.querySelectorAll(`svg :is(${MARKS})`).length, 0);
    evidence.axisLabels = [...new Set([...markup.matchAll(/<text[^>]*>([^<]+)<\/text>/g)]
      .map((m) => m[1].trim()).filter(Boolean))].slice(0, 40);
    check('no-nan', !/NaN|Infinity/.test(markup) && !/="undefined"/.test(markup), [
      'a NaN, Infinity or undefined reached an attribute and the browser silently drops that ' +
        'mark — check the domain against the real chartdata.json and floor any derived dimension'
    ]);

    const win = dom.window;

    // --- tooltip, executed rather than grepped -------------------------------------------
    // `K.hov` binds pointerenter/pointermove and `show` sets exactly innerHTML + opacity, so
    // firing a real event is the only way to tell a bound tooltip from one wired to an empty
    // selection. jsdom has no PointerEvent; MouseEvent carries the same clientX/clientY.
    const tip = win.document.getElementById('tip');
    const Pointer = win.PointerEvent || win.MouseEvent;
    let tipFired = false;
    outer: for (const n of nodes) {
      // Not just the first mark: grid lines and axis paths are drawn before the data marks
      // and carry no handler, so scanning is what tells "no tooltip" from "tooltip on the
      // bars". Bounded so a 5,000-mark scatter does not walk the whole selection.
      const marks = [...n.querySelectorAll(`svg :is(${MARKS})`)].slice(0, 60);
      if (n.querySelector('canvas')) marks.push(n.querySelector('canvas'));
      for (const mark of marks) {
        for (const type of ['pointerenter', 'pointermove']) {
          try {
            mark.dispatchEvent(new Pointer(type, { bubbles: true, cancelable: true, clientX: 40, clientY: 40 }));
          } catch { /* a mark with no pointer surface simply never fires */ }
        }
        if (tip && tip.style.opacity === '1' && tip.innerHTML.trim()) { tipFired = true; break outer; }
      }
    }
    evidence.tooltip = tipFired ? tip.innerHTML.slice(0, 200) : null;
    const tipDetail = [
      'no tooltip fired: a pointermove over every data mark left #tip empty. Bind it with ' +
        'K.hov(sel, fn) on the selection that carries the data (or K.show from a canvas ' +
        'pointermove) — a K.hov on an empty selection looks right in source and does nothing'
    ];
    if (strict) check('tooltip-fires', tipFired, tipDetail);
    else if (!tipFired) warnings.push(tipDetail[0] + '; only a profile-section chart may skip it');

    // --- data adherence ------------------------------------------------------------------
    // `meta` is exempt in ONE direction only. Reading D.meta.* without declaring it is the
    // no-hardcoded-findings rule done right, so it is never an undeclared extra. It is NOT
    // exempt from `missing`: a spec may legitimately declare it, and stripping it from the
    // reads before that comparison made the check unsatisfiable by any fragment — the chart
    // could read meta, prove it in the evidence, and still be told it never did.
    const read = win.__reads || [];
    evidence.keysRead = read;
    if (declaredKeys.length) {
      const missing = declaredKeys.filter((k) => !read.includes(k));
      const extra = read.filter((k) => k !== 'meta' && !declaredKeys.includes(k));
      check('keys-declared', missing.length === 0, [
        `declared but never read: ${missing.join(', ')}`,
        'the spec names the aggregates this example draws from — draw from them, or say in ' +
          'the card that the spec changed'
      ]);
      check('keys-only', extra.length === 0, [
        `read but not declared: ${extra.join(', ')}`,
        'every number drawn traces to a dataKey the spec named. Add the aggregate to prep.py ' +
          'and re-declare it rather than reaching for a neighbouring key'
      ]);
    }

    // --- palette membership, checked against the kit's own live P ------------------------
    // Derived from the running kit, not restated here, so the two cannot drift.
    const members = win.VZ && win.VZ.P ? new Set(Object.keys(win.VZ.P)) : null;
    if (members) {
      const used = [...new Set([...code.matchAll(/\bP\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1]))];
      const unknown = used.filter((k) => !members.has(k));
      // d3's built-in categorical schemes are the other way a color escapes the palette. Only
      // scheme* — d3.interpolate* legitimately blends two P colors and drives tweens.
      const schemes = [...new Set([...code.matchAll(/\bd3\.(scheme[A-Za-z0-9]*)/g)].map((m) => m[1]))];
      check('palette-members', unknown.length === 0 && schemes.length === 0, [
        ...(unknown.length ? [`not a palette member: ${unknown.map((k) => 'P.' + k).join(', ')}`] : []),
        ...(schemes.length ? [`a d3 built-in scheme bypasses the palette: ${schemes.map((s) => 'd3.' + s).join(', ')}`] : []),
        `P carries exactly: ${[...members].sort().join(', ')} — anything else is undefined at ` +
          'runtime and silently drops the color, and a built-in scheme is fixed ink that never ' +
          'flips with the theme'
      ]);
    }

    // --- legend, structural rather than textual ------------------------------------------
    // A source grep for K.legend( misses a file-local wrapper that calls the kit, and misses
    // a hand-rolled legend entirely. The rendered node catches all three the same way.
    const hasLegend = nodes.some((n) => n.querySelector('.legend'));
    evidence.legend = hasLegend;
    // Axis ticks are <text> too, so "it has labels" cannot be the escape hatch — the trigger
    // is a categorical color scale specifically, which is the case a reader cannot decode
    // without a key.
    const ordinal = /scaleOrdinal|d3\.schemeCategory|\bcolou?rBy\b/.test(code);
    if (ordinal && !hasLegend) {
      warnings.push(
        'color appears to encode a category but no .legend node rendered and no direct labels ' +
          'were drawn — K.legend(el, [{c, t}]) for classes, K.rampKey(el, lo, hi, fn) for a ramp'
      );
    }
  }

  // `&#8594;` (→) and friends are HTML character references in tooltip strings, not colors.
  // Strip them first or every arrow in a tooltip reads as a hardcoded hex.
  const noEntities = code.replace(/&#\d+;/g, '');
  check('no-hex', !/#[0-9a-fA-F]{3,8}\b/.test(noEntities), [
    'a hardcoded hex color never survives the theme flip — colors come from P (P.acc, ' +
      'P.seq(t), P.div(t)), which is filled from the page tokens and redrawn on theme change'
  ]);

  check('no-raw-timers', !/\b(setInterval|setTimeout|requestAnimationFrame)\s*\(/.test(code), [
    'nothing autoplays and nothing loops uninvited — playback goes through K.transport, ' +
      'durations through K.tdur, delays divided by K.spd; a raw timer bypasses pause, ' +
      'scrub, speed and prefers-reduced-motion at once'
  ]);

  // --- animation policy ------------------------------------------------------------------
  // Playback is the kit's job. A chart that rolls its own gets no pause, no scrub, no speed
  // select and no prefers-reduced-motion, and nothing above catches it because it draws fine.
  const transported = /\bK\.transport\s*\(/.test(code);
  evidence.transport = transported;
  check('hand-rolled-transport', !/\bfunction\s+transport\s*\(|\btransport\s*=\s*function\b/.test(code), [
    'this fragment defines its own transport() — K.transport(el, n, draw, opts) is the whole ' +
      'playback surface (play/pause, scrubber, replay, opt-in loop, speed select, frame stamp) ' +
      'and a local copy silently loses every one of them'
  ]);

  if (transported) {
    check('transport-opts', /\bstep\s*:/.test(code), [
      'K.transport was called without opts.step — it falls back to 560ms per frame, and a tween ' +
        'sized for a slower frame outruns its own frame at any speed above 1x'
    ]);
    const tweens = /\.duration\s*\(|\.delay\s*\(/.test(code);
    check('tween-routing', !tweens || /\bK\.(tdur|spd)\s*\(/.test(code), [
      'a raw .duration() or .delay() in a transported chart bypasses the speed select and ' +
        'prefers-reduced-motion at once — route durations through K.tdur(el, base, step) and ' +
        'divide any hand-rolled delay by K.spd(el)'
    ]);
  }

  if (emitPath) evidenceOut.push(evidence);

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

if (emitPath) writeFileSync(emitPath, JSON.stringify(evidenceOut, null, 2));

process.exit(failed ? 1 : 0);
