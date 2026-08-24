#!/usr/bin/env node
/**
 * Verify a built datastorm report. Runs the page's own scripts in jsdom and checks the
 * structural contract page.html declares — this is the execution-feedback surface of the
 * report skill, so every failure carries the repair as an instruction.
 *
 *   node verify-report.mjs <report.html> [--min N] [--catalog path]
 *
 * Exit 0 when every hard check passes. Number cross-checks are warnings only: parsing
 * formatted numerals out of prose cannot be made false-positive-free, and a gate nobody
 * trusts is worse than a warning everybody reads.
 *
 * What jsdom cannot check, and what covers it instead: layout (no scrollWidth), so wide
 * content is checked by wrapper class instead; canvas pixels (no 2D context), so a canvas
 * chart passes on element presence — getContext is stubbed below so chart code runs at all.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// A missing toolchain answers with the npm install to run, not a module-not-found stack —
// this tool ships into a plugin whose dependencies the user installs separately.
const { JSDOM, VirtualConsole } = await import('jsdom').catch(() => {
  let root = here;
  while (!existsSync(join(root, 'package.json')) && dirname(root) !== root) root = dirname(root);
  console.error(`jsdom is not installed — run \`npm install\` in ${root} first`);
  process.exit(1);
});

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args.splice(i, 2)[1];
};
const catalogFlag = flag('--catalog');
const minOptions = Number(flag('--min') ?? 12);
const file = args[0];

if (!file || !existsSync(file)) {
  console.error('usage: verify-report.mjs <report.html> [--min N] [--catalog path]');
  process.exit(1);
}

/** Gallery layout first, then the installed-plugin layout, then an explicit override. */
function catalogIds() {
  const path = [
    catalogFlag,
    join(here, '../../docs/catalog.json'),
    join(here, '../../d3-react-charts/catalog/catalog.json')
  ].filter(Boolean).find(existsSync);
  if (!path) return null; // exemplar check degrades to a warning rather than lying
  return new Set(JSON.parse(readFileSync(path, 'utf8')).charts.map((c) => c.id));
}

const MARKS = 'path,rect,circle,line,polygon,polyline,ellipse,text,image';
const FIELDS = ['name', 'family', 'question', 'encoding', 'why', 'color', 'interaction', 'failure', 'exemplar'];
const SECTIONS = ['data', 'shape', 'recommended', 'conventional', 'analytical', 'creative', 'rejected', 'notes'];

const raw = readFileSync(resolve(file), 'utf8');

// Silence jsdom's "not implemented" noise; script errors surface through the checks below.
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', () => {});

const dom = new JSDOM(raw, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    // jsdom has no 2D context; without this every canvas chart throws inside chart-kit and
    // reads as undrawn. The proxy absorbs the whole context API so the chart code completes.
    const ctx = new Proxy(function () {}, { get: () => ctx, set: () => true, apply: () => ctx });
    window.HTMLCanvasElement.prototype.getContext = () => ctx;
    // chart-kit's boot() calls matchMedia unguarded, and jsdom has none — without this shim
    // boot throws after renderAll on every run and the theme-redraw observer never registers.
    window.matchMedia = (q) => ({
      matches: false, media: q, onchange: null,
      addEventListener() {}, removeEventListener() {},
      addListener() {}, removeListener() {}, dispatchEvent: () => false
    });
  }
});

const { document } = dom.window;
const checks = [];
const warnings = [];
const check = (name, ok, detail) => checks.push({ name, ok, detail: ok ? [] : detail });

// ---------------------------------------------------------------- scripts ran

const booted = typeof dom.window.VZ === 'object' && dom.window.VZ !== null;
check('boot', booted && typeof dom.window.CD === 'object', [
  'window.VZ or window.CD is missing after the page\'s scripts ran — the build did not ' +
    'substitute /*KIT*/ or /*DATA*/, or a script threw before K.boot; rebuild with build.mjs ' +
    'and check its output for placeholder errors'
]);

// ---------------------------------------------------------------- charts drew

const chartNodes = [...document.querySelectorAll('[data-chart]')];
const undrawn = chartNodes.filter(
  (n) => !(n.querySelector(`svg :is(${MARKS})`) || n.querySelector('canvas'))
);
check('charts-drawn', chartNodes.length > 0 && undrawn.length === 0, [
  ...undrawn.map((n) => {
    const err = /failed: (.*)$/.exec(n.textContent.trim());
    return `  ${n.getAttribute('data-chart')}: ${err ? err[1] : 'no svg marks or canvas rendered'}`;
  }),
  'every option\'s example must draw from the real data — a chart that cannot be drawn is ' +
    'not an option; fix its render function or move the option to the rejected list'
]);

// ---------------------------------------------------------------- cards complete

const cards = [...document.querySelectorAll('article.opt')];
const cardProblems = [];
for (const card of cards) {
  const id = card.id || '(no id)';
  for (const name of FIELDS) {
    const el = card.querySelector(`[data-field="${name}"]`);
    if (!el) cardProblems.push(`${id}: missing data-field="${name}"`);
    else if (!el.textContent.trim()) cardProblems.push(`${id}: data-field="${name}" is empty`);
  }
  if (!card.querySelector('.chart[data-chart]')) cardProblems.push(`${id}: no worked example (.chart[data-chart])`);
  if (!card.id) cardProblems.push('a card has no id, so the rail cannot link to it');
}
check('cards-complete', cards.length > 0 && cardProblems.length === 0, [
  ...cardProblems.map((p) => `  ${p}`),
  'each option carries all nine fields — an option missing any of them is not thought through'
]);

// ---------------------------------------------------------------- counts and sections

check('option-count', cards.length >= minOptions && cards.length <= 20, [
  `${cards.length} option cards — the report promises ${minOptions} to 20; breadth is the product`
]);

const missingSections = SECTIONS.filter((id) => !document.getElementById(id));
check('sections', missingSections.length === 0, [
  `missing section${missingSections.length === 1 ? '' : 's'}: ${missingSections.map((s) => '#' + s).join(', ')} — ` +
    'the page contract in page.html carries all eight'
]);

const recs = document.querySelectorAll('#recommended .rec').length;
check('recommended-three', recs === 3, [
  `#recommended holds ${recs} ranked entries, not 3 — a brainstorm that does not commit to a ` +
    'top three has handed the hard part back'
]);

for (const band of ['conventional', 'analytical', 'creative']) {
  const n = document.querySelectorAll(`#${band} article.opt`).length;
  if (n === 0) warnings.push(`the ${band} band has no option cards inside its section`);
}

const unlinked = cards.filter((c) => c.id && !document.querySelector(`.rail a[href="#${c.id}"]`));
check('rail', unlinked.length === 0, [
  `no rail link for: ${unlinked.map((c) => c.id).join(', ')} — the rail is the table of ` +
    'contents for a page this long; add one line per option'
]);

// ---------------------------------------------------------------- exemplars exist

const ids = catalogIds();
const cited = cards.flatMap((card) =>
  [...card.querySelectorAll('[data-field="exemplar"] .e, [data-field="exemplar"] a')]
    .map((el) => el.textContent.trim()).filter(Boolean)
);
if (!ids) {
  warnings.push('no catalog.json found beside this script or in the gallery — exemplar ids not checked');
} else {
  const unknown = cited.filter((id) => !ids.has(id) && !/^none\b/i.test(id));
  check('exemplars-exist', unknown.length === 0, [
    `not in the corpus catalog: ${[...new Set(unknown)].join(', ')} — a wrong exemplar costs ` +
      'more than a missing one; cite a real id or say the corpus has none'
  ]);
}

// ---------------------------------------------------------------- wrappers and mojibake

const bareTables = [...document.querySelectorAll('table')].filter((t) => !t.closest('.tw'));
const bareCharts = chartNodes.filter((n) => !n.classList.contains('chart'));
check('wrappers', bareTables.length === 0 && bareCharts.length === 0, [
  `${bareTables.length} table(s) outside .tw, ${bareCharts.length} [data-chart] node(s) without ` +
    'class="chart" — wide things scroll inside their own box; jsdom cannot measure layout, ' +
    'so the wrapper class is the check'
]);

const unfilled = (raw.match(/<!-- FILL/g) ?? []).length;
check('fill-markers', unfilled === 0, [
  `${unfilled} FILL marker(s) left from the shell — every one is a field the report promised ` +
    'and never wrote; fill it or delete the element it labels'
]);

const mojibake = (document.body.textContent.match(/Ã.|â€|Â./g) ?? []).length;
check('mojibake', mojibake === 0, [
  `${mojibake} mojibake sequence(s) in the rendered text — authored content was not ASCII-escaped; ` +
    'rebuild with build.mjs rather than assembling by hand'
]);

// ---------------------------------------------------------------- tooltip contrast

// The tooltip pill inverts (--ink background, --ground text), so a hardcoded color in it
// disappears in one theme. The colors are pure CSS, so they resolve statically: read each
// theme's token block, resolve the #tip rules against it, and gate WCAG contrast in both.
const cssTokens = (block) => {
  const map = {};
  for (const [, k, v] of (block ?? '').matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) map[k] = v.trim();
  return map;
};
const themes = {
  light: cssTokens(/:root\s*\{([^}]*)\}/.exec(raw)?.[1]),
  dark: cssTokens(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/.exec(raw)?.[1])
};
const decl = (block, prop) =>
  new RegExp(`(?:^|[;{])\\s*${prop}\\s*:\\s*([^;}]+)`).exec(block ?? '')?.[1]?.trim();
const tipRule = /#tip\s*\{([^}]*)\}/.exec(raw)?.[1];
const tipTitleRule = /#tip b\s*\{([^}]*)\}/.exec(raw)?.[1];
const resolveVar = (v, tokens) => {
  const m = /^var\(--([\w-]+)\)$/.exec(v ?? '');
  return m ? tokens[m[1]] : v;
};
const luminance = (hex) => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex ?? '');
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return x === null || y === null ? null : (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

{
  const tipProblems = [];
  let unresolved = false;
  for (const [theme, tokens] of Object.entries(themes)) {
    const bg = resolveVar(decl(tipRule, 'background'), tokens);
    const pairs = [
      ['body text', resolveVar(decl(tipRule, 'color'), tokens)],
      ['title (#tip b)', resolveVar(decl(tipTitleRule, 'color'), tokens)]
    ];
    for (const [what, fg] of pairs) {
      const ratio = contrast(fg, bg);
      if (ratio === null) unresolved = true;
      else if (ratio < 4.5) tipProblems.push(`  ${theme}: ${what} ${fg} on pill ${bg} = ${ratio.toFixed(2)}:1`);
    }
  }
  if (unresolved) {
    warnings.push('tooltip colors could not be statically resolved — tip-contrast not checked');
  } else {
    check('tip-contrast', tipProblems.length === 0, [
      ...tipProblems,
      'the tooltip pill inverts with the theme, so a hardcoded color in #tip or #tip b ' +
        'disappears in one of them — use inverted tokens (the shell uses var(--surface-3) ' +
        'for the title) and keep both themes at 4.5:1 or better'
    ]);
  }
}

// ---------------------------------------------------------------- numbers (warnings only)

if (booted && dom.window.CD) {
  const inData = new Set();
  (function walk(v) {
    if (typeof v === 'number' && Number.isFinite(v)) {
      inData.add(v);
      inData.add(Math.round(v));
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  })(dom.window.CD);

  const prose = [...document.querySelectorAll('.main p, .main dd, .main figcaption, .main td')]
    .map((el) => el.textContent).join(' ');
  const traced = (n) => {
    for (const d of inData) if (d !== 0 && Math.abs(n - d) / Math.abs(d) < 0.005) return true;
    return inData.has(n);
  };
  const suspects = [...new Set(
    (prose.match(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d{5,}(?:\.\d+)?/g) ?? [])
      .map((t) => Number(t.replace(/,/g, '')))
      .filter((n) => n >= 1000 && !(n >= 1900 && n <= 2100) && !traced(n))
  )];
  if (suspects.length > 0) {
    warnings.push(
      `${suspects.length} large numeral(s) in prose not found in chartdata.json ` +
        `(first few: ${suspects.slice(0, 5).join(', ')}) — every number on the page should be ` +
        'computed in prep.py, not typed in'
    );
  }
}

// ---------------------------------------------------------------- report

let failed = false;
console.log(file);
for (const c of checks) {
  console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.name}`);
  if (c.ok) continue;
  failed = true;
  for (const line of c.detail) console.log(`        ${line}`);
}
for (const w of warnings) console.log(`  WARN  ${w}`);
console.log('');
process.exit(failed ? 1 : 0);
