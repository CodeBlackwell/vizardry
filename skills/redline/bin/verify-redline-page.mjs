#!/usr/bin/env node
/**
 * Verify a rendered redline page against the redline it was built from. `verify-redline.mjs`
 * proves the data is a redline; this proves the page is that data and nothing else. They are two
 * tools because they answer two questions, and this one can only answer its own while it knows
 * where every value landed — the selector contract in `references/redline-format.md` is that
 * interface, and every selector below is quoted from it rather than guessed at.
 *
 *   node verify-redline-page.mjs <report.html> <redline.json> [--min-marks N]
 *
 * Every comparison is string equality over one element per value, never a substring search: a
 * page that merely mentions a magnitude somewhere is a page a writer can satisfy with prose,
 * which is the failure the whole gate exists to make impossible.
 *
 * What jsdom cannot check, and what covers it instead: layout (no scrollWidth), so wide content
 * is checked by wrapper class; canvas pixels (no 2D context), so a canvas mount passes on element
 * presence and is exempt from the mark floor — getContext is stubbed below so chart code runs.
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
const minMarks = Number(flag('--min-marks') ?? 0);
const [file, dataFile] = args;

if (!file || !dataFile) {
  console.error('usage: verify-redline-page.mjs <report.html> <redline.json> [--min-marks N]');
  console.error('both are required: this gate proves the page and the data agree, and one of ' +
    'them alone proves nothing');
  process.exit(1);
}
if (!existsSync(file)) {
  console.error(`no page at ${file} — build it from the redline with assets/render.mjs first`);
  process.exit(1);
}
if (!existsSync(dataFile)) {
  console.error(`no redline at ${dataFile} — the page is generated from that file, so without ` +
    'it there is nothing to check the page against; write redline.json first');
  process.exit(1);
}

// Being handed the rendered page in both slots is the one mistake worth a sentence rather than a
// stack trace, because the fix is to write a file the author may not have written yet.
let redline;
try {
  redline = JSON.parse(readFileSync(resolve(dataFile), 'utf8'));
} catch (error) {
  console.error(`${dataFile} does not parse as JSON, so the redline behind the page cannot be ` +
    `read: ${error.message}`);
  console.error('the second argument is the data the page was built from, not a second copy of ' +
    'the page');
  process.exit(1);
}

const MARKS = 'path,rect,circle,line,polygon,polyline,ellipse,text,image';
/** The eleven sections of the format, and the ids the selector contract pins them to. */
const SECTIONS = ['frame', 'stands', 'seats', 'findings', 'context', 'struck', 'refusals',
  'declined', 'must-refuse', 'rollup', 'mandate'];
// Pinned by a test against src/gallery/__tests__/chartRules.ts rather than imported from it:
// importing a .ts file would put esbuild in this skill's dependency list for two integers.
const MARK_FLOOR = 8;
const PATH_DATA_FLOOR = 500;
// --min-marks may only raise the floor. A flag that lowers it is a bypass with a command-line
// switch on it, which is worth more to a report under deadline than the check is worth to anyone.
const markFloor = Math.max(MARK_FLOOR, Number.isFinite(minMarks) ? minMarks : 0);

/** Every scalar the selector contract names, read off whichever entry kind carries it. */
const FIELD_OF = {
  headline: (e) => e.headline,
  magnitude: (e) => e.magnitude,
  shape: (e) => e.shape,
  posture: (e) => e.posture,
  killsIt: (e) => e.killsIt,
  provenance: (e) => e.provenance,
  reading: (e) => e.reading,
  strike: (e) => e.strike,
  wrong: (e) => e.wrong,
  instead: (e) => e.instead,
  reason: (e) => e.reason,
  title: (e) => e.title,
  decides: (e) => e.decides,
  produces: (e) => e.tasker?.produces,
  // A roll-up row carries its owner at the top level; a finding carries it under the change.
  owner: (e) => e.policyChange?.owner ?? e.owner,
  document: (e) => e.document,
  question: (e) => e.question,
  writtenInto: (e) => e.policyChange?.writtenInto,
  label: (e) => e.policyChange?.label,
  basis: (e) => e.policyChange?.basis,
  cost: (e) => e.policyChange?.downstream?.cost,
  exposure: (e) => e.policyChange?.downstream?.exposure,
  asymmetry: (e) => e.policyChange?.downstream?.asymmetry
};

const findings = redline.findings ?? [];
const context = redline.context ?? [];
const struck = redline.struck ?? [];

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
  'every finding\'s chart must draw from the real aggregates — a chart that cannot be drawn is ' +
    'not the ground a policy change stands on; fix its render function or strike the finding'
]);

// ---------------------------------------------------------------- sections and order

const missingSections = SECTIONS.filter((id) => !document.getElementById(id));
check('sections', missingSections.length === 0, [
  `missing section${missingSections.length === 1 ? '' : 's'}: ${missingSections.map((s) => '#' + s).join(', ')} — ` +
    'the selector contract carries all eleven, and a section absent from the page is a section ' +
    'of the format the report skipped'
]);

// The roster is a reading aid or it is nothing: a reader who meets `CMP` on the first card and
// has to scroll past every finding to resolve it has left the page, which is the whole cost.
const seatsSection = document.getElementById('seats');
const findingsSection = document.getElementById('findings');
const ordered = !!seatsSection && !!findingsSection &&
  !!(seatsSection.compareDocumentPosition(findingsSection) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
const rosterCards = seatsSection ? seatsSection.querySelectorAll('.seat[data-seat]').length : 0;
check('roster-first', ordered && rosterCards > 0, [
  ...(!seatsSection || !findingsSection ? ['#seats or #findings is missing, so the order cannot be read'] : []),
  ...(seatsSection && findingsSection && !ordered
    ? ['#seats comes after #findings — the roster goes before the findings, because a code is ' +
      'unreadable until the reader has met it'] : []),
  ...(seatsSection && rosterCards === 0
    ? ['#seats holds no .seat[data-seat] cards — a roster section with no seats in it resolves ' +
      'nothing'] : [])
]);

// ---------------------------------------------------------------- page matches data

const collapse = (s) => String(s).replace(/\s+/g, ' ').trim();
const short = (s) => JSON.stringify(s.length > 72 ? `${s.slice(0, 72)}...` : s);

const mismatches = [];
for (const [name, entries] of [
  ['findings', findings], ['context', context], ['struck', struck],
  ['seats', redline.seats ?? []], ['refusals', redline.refusals ?? []],
  ['declined', redline.declined ?? []],
  // The roll-up is the report's payload — the sentence a reader takes away is which documents
  // absorb which changes — so leaving it off this walk would leave the most load-bearing
  // section of the page the least checked.
  ['rollup', redline.rollup ?? []], ['must-refuse', redline.mustRefuse ?? []]
]) {
  const section = document.getElementById(name);
  if (!section) {
    if (entries.length) mismatches.push(`  #${name}: section missing, so its ${entries.length} entries are nowhere`);
    continue;
  }
  entries.forEach((entry, index) => {
    const label = entry.id ?? entry.code ?? `${name}[${index}]`;
    const root = entry.code ? section.querySelector(`[data-seat="${entry.code}"]`)
      : entry.id ? document.getElementById(entry.id) : null;
    if (entry.code && !root) {
      mismatches.push(`  ${label}: no [data-seat="${entry.code}"] inside #${name}`);
      return;
    }
    // An entry the renderer gives no id — a refusal row, a declined bullet — is matched by its
    // position inside its own section. That is why the arrays below compare counts too: a
    // dropped entry would otherwise slide every later comparison one place and read as clean.
    const at = (sel) => (root ? root.querySelector(sel) : section.querySelectorAll(sel)[index]);

    for (const [field, read] of Object.entries(FIELD_OF)) {
      const value = read(entry);
      if (typeof value !== 'string' || !value.trim()) continue;
      const el = at(`[data-field="${field}"]`);
      if (!el) {
        mismatches.push(`  ${label} ${field}: no [data-field="${field}"] on the page`);
        continue;
      }
      // Both sides collapse, because HTML collapses whitespace whatever the data held. Nothing
      // else is relaxed: this is equality, so a label rendered into the same element as its
      // value fails here rather than passing a substring search.
      const text = collapse(el.textContent);
      if (text !== collapse(value)) {
        mismatches.push(`  ${label} ${field}: page ${short(text)} != data ${short(collapse(value))}`);
      }
    }

    if (typeof entry.chart === 'string' && entry.chart) {
      const got = at('[data-chart]')?.getAttribute('data-chart') ?? null;
      if (got !== entry.chart) {
        mismatches.push(`  ${label} chart: page ${got === null ? '(no mount)' : short(got)} != data ${short(entry.chart)}`);
      }
    }

    for (const who of entry.whoActs ?? []) {
      const seat = root?.querySelector(`.who [data-seat="${who.code}"]`);
      if (!seat) {
        mismatches.push(`  ${label} whoActs ${who.code}: no [data-seat] for it inside .who`);
        continue;
      }
      const el = seat.querySelector('[data-field="reason"]');
      if (!el) mismatches.push(`  ${label} whoActs ${who.code}: no [data-field="reason"] on the entry`);
      else if (collapse(el.textContent) !== collapse(who.reason ?? '')) {
        mismatches.push(`  ${label} whoActs ${who.code}: page ${short(collapse(el.textContent))} != data ${short(collapse(who.reason ?? ''))}`);
      }
    }
    for (const seat of root?.querySelectorAll('.who [data-seat]') ?? []) {
      const code = seat.getAttribute('data-seat');
      if (!(entry.whoActs ?? []).some((w) => w.code === code)) {
        mismatches.push(`  ${label} whoActs ${code}: routed on the page and not in the data`);
      }
    }

    const steps = entry.tasker?.steps;
    if (Array.isArray(steps) && steps.length) {
      const onPage = [...(root?.querySelectorAll('ol.tasker [data-field="step"]') ?? [])];
      if (!onPage.length && root?.querySelector('[data-field="step"]')) {
        mismatches.push(`  ${label} tasker: steps are on the card but not inside ol.tasker`);
      }
      if (onPage.length !== steps.length) {
        mismatches.push(`  ${label} tasker: ${onPage.length} step(s) on the page, ${steps.length} in the data`);
      }
      steps.forEach((step, i) => {
        if (!onPage[i]) return;
        const text = collapse(onPage[i].textContent);
        if (text !== collapse(step)) {
          mismatches.push(`  ${label} tasker step ${i + 1}: page ${short(text)} != data ${short(collapse(step))}`);
        }
      });
    }
  });
}
check('page-matches-data', mismatches.length === 0, [
  ...mismatches,
  'the page is generated from the redline, so every difference here is either a renderer that ' +
    'edits what it renders or a page edited by hand after the build — regenerate it rather than ' +
    'fixing the HTML'
]);

// ---------------------------------------------------------------- routing reached the page

// Checked as a set in both directions, separately from the text above: a finding that reaches
// three seats and renders two has been silently unrouted, and the reason text of the two that
// survived is exactly right, so nothing else here would notice.
const whoGaps = [];
for (const f of findings) {
  const card = document.getElementById(f.id);
  if (!card) {
    whoGaps.push(`  ${f.id}: no element with that id, so its routing is nowhere on the page`);
    continue;
  }
  const onPage = [...card.querySelectorAll('.who [data-seat]')].map((el) => el.getAttribute('data-seat'));
  const inData = (f.whoActs ?? []).map((w) => w.code);
  for (const code of inData) if (!onPage.includes(code)) whoGaps.push(`  ${f.id}: ${code} is routed in the data and absent from the card`);
  for (const code of onPage) if (!inData.includes(code)) whoGaps.push(`  ${f.id}: the card routes ${code}, which the data does not`);
}
check('who-acts-rendered', whoGaps.length === 0, [
  ...whoGaps,
  'every seat a finding reaches appears on its card and nowhere else appears there — the routing ' +
    'is the half of a finding a reader acts on'
]);

// ---------------------------------------------------------------- chart mounts

const mounted = new Set(chartNodes.map((n) => n.getAttribute('data-chart')).filter(Boolean));
const cited = new Set([...findings, ...context, ...struck].map((e) => e.chart).filter(Boolean));
const mountGaps = [
  ...[...cited].filter((k) => !mounted.has(k)).map((k) => `  ${k} is cited in the data and has no mount on the page`),
  ...[...mounted].filter((k) => !cited.has(k)).map((k) => `  ${k} is mounted on the page and cited by no entry`)
];
check('chart-mounts-match', mountGaps.length === 0, [
  ...mountGaps,
  'the mounts and the Chart fields are one set — a mount nothing cites is a chart the report ' +
    'draws and never reads, and a citation with no mount is a chart that was described'
]);

// ---------------------------------------------------------------- the mark floor

// The predicate, not just the number: a geo chart legitimately batches thousands of features
// into a handful of very long paths, so a bare mark count calls the densest charts empty.
const thin = [];
for (const node of chartNodes) {
  if (node.querySelector('canvas')) continue; // jsdom has no pixels; charts-drawn is its only gate
  const marks = node.querySelectorAll(`svg :is(${MARKS})`).length;
  const pathData = [...node.querySelectorAll('svg path')]
    .reduce((n, p) => n + (p.getAttribute('d')?.length ?? 0), 0);
  if (!(marks >= markFloor || pathData >= PATH_DATA_FLOOR)) {
    thin.push(`  ${node.getAttribute('data-chart')}: ${marks} mark(s), ${pathData} chars of path data`);
  }
}
check('chart-floor', thin.length === 0, [
  ...thin,
  `a chart clears ${markFloor} marks or ${PATH_DATA_FLOOR} characters of path data — below that ` +
    'it rendered an axis and no data, which passes charts-drawn and shows a reader nothing'
]);

// A page of nothing but bars is a page of nothing but rankings, and a redline whose every
// finding is a ranking has usually found an actor problem it did not mean to argue.
const curves = chartNodes.reduce(
  (n, node) => n + node.querySelectorAll('svg path, svg circle').length, 0);
if (chartNodes.length >= 3 && curves === 0) {
  warnings.push(`${chartNodes.length} charts and not one path or circle among them — nothing on ` +
    'this page encodes a quantity as position along a path or as a point cloud; check whether ' +
    'every finding really is a ranking');
}

// ---------------------------------------------------------------- rail, wrappers, encoding

const cards = [...document.querySelectorAll('article.find')];
const unlinked = cards.filter((c) => c.id && !document.querySelector(`.rail a[href="#${c.id}"]`));
// The rail repeats each entry's headline, which makes it a second copy of a value the data
// holds — and an unchecked copy is one that can drift into saying something the card does not.
const railDrift = [...findings, ...context, ...struck].flatMap((entry) => {
  const link = entry.id && document.querySelector(`.rail a[href="#${entry.id}"]`);
  const said = entry.headline ?? entry.reading;
  if (!link || typeof said !== 'string' || !said.trim()) return [];
  const label = collapse([...link.querySelectorAll('span')].pop()?.textContent ?? '');
  return label === collapse(said) ? []
    : [`  ${entry.id}: rail reads ${short(label)} but the card reads ${short(collapse(said))}`];
});
check('rail-matches-data', railDrift.length === 0, railDrift.length ? railDrift
  : ['every rail label repeats the headline of the entry it points at']);

check('rail', unlinked.length === 0, [
  `no rail link for: ${unlinked.map((c) => c.id).join(', ')} — the rail is the table of ` +
    'contents for a page this long; add one line per finding'
]);

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

// ---------------------------------------------------------------- report

console.log(`${file}  (data: ${dataFile})`);
let failed = false;
for (const c of checks) {
  console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.name}`);
  if (c.ok) continue;
  failed = true;
  for (const line of c.detail) console.log(`        ${line}`);
}
// A signal, not a check. The mix of marks is the shape of the argument the page makes, and a
// page that is all one mark is worth looking at before it ships without being worth blocking.
const tally = (xs) => [...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map())]
  .sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ');
if (chartNodes.length) {
  const marks = chartNodes.flatMap((n) => [...n.querySelectorAll(`svg :is(${MARKS})`)]
    .map((el) => el.localName));
  console.log(`  signal  marks: ${tally(marks) || '(none — every mount is a canvas)'}`);
}
for (const w of warnings) console.log(`  WARN  ${w}`);
console.log('');
process.exit(failed ? 1 : 0);
