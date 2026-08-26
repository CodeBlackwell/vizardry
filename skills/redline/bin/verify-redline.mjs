#!/usr/bin/env node
/**
 * Verify a redline before it is a page. Every check here is a set operation or a field
 * presence test over structured input, which is deliberate: a gate that scrapes prose can be
 * satisfied by prose, and the failure this whole genre dies of — a policy change priced with a
 * number nobody computed — is exactly the one a prose scraper misses.
 *
 *   node verify-redline.mjs <redline.json> [--data chartdata.json] [--mandate docs/mandate.md]
 *
 * `redline.json` is the report as data: the frame, the findings with their ten fields, the
 * context and struck entries, the refusals, the declined list and the roll-up. The HTML page is
 * built from it, so checking the data checks the page, and a field cannot be present in the
 * render and absent from the gate.
 *
 * `--data` and `--mandate` default to files beside the redline, then the working directory.
 * A missing mandate is a hard error rather than a skipped check: `/redline` refuses to run
 * without one, so a verifier that passes without one would certify a report the skill would
 * not have produced.
 *
 * `--emit` writes a per-finding evidence artifact -- the resolved seat behind every code, the
 * chartdata path behind every figure, the refusal that answers each finding -- so a reviewer
 * judges what this run resolved instead of re-resolving it. `--review` reads the verdicts back
 * and turns them into one more check; without it that check does not run, which keeps a redline
 * that was never sent for review honest about not having been.
 *
 * The numeral check is the reason this file exists. Every number in every prose field must
 * resolve to a value in chartdata.json under some ordinary rendering of it — $1.2M for
 * 1200000, 25.7% for 0.257 or 25.7. Four-digit years are exempt because a year is a label, not
 * a measurement. Nothing else is exempt: a number that needs to be in the report needs to be in
 * the data file first, which costs one query and closes the hole permanently.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const SHAPES = new Set([
  'concentration', 'mix shift as trend', 'level break inside a smoothed window',
  'outcome contradicting posture', 'dead reference still in use', 'silence as a category',
  'exact duplication', 'thin cell', 'rank disagreement', 'pair inflation'
]);
const POSTURES = new Set(['standard', 'actor']);
const PROVENANCE = new Set(['raw', 'derived', 'model-judged']);
const LABELS = new Set(['exact', 'estimated']);
/** The ten card fields, in the four groups the format doc teaches them in. */
const FIELDS = ['headline', 'magnitude', 'chart', 'shape', 'posture', 'whoActs', 'tasker',
  'killsIt', 'provenance', 'policyChange'];

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args.splice(i, 2)[1];
};
// --data repeats. Step 2's rule is that no number reaches the page without passing through a
// file, not that it passes through one particular file — so a read-only substrate is answered by
// writing your own computed values beside it and passing both, rather than by going unwritten.
const dataFlags = [];
for (let next = flag('--data'); next; next = flag('--data')) dataFlags.push(next);
const mandateFlag = flag('--mandate');
const emitPath = flag('--emit');
const reviewPath = flag('--review');
const [redlinePath] = args;

if (!redlinePath) {
  console.error('usage: verify-redline.mjs <redline.json> [--data chartdata.json] ' +
    '[--mandate mandate.md] [--emit evidence.json] [--review verdicts.json]');
  process.exit(1);
}
if (!existsSync(redlinePath)) {
  console.error(`no redline at ${redlinePath}`);
  process.exit(1);
}
const beside = dirname(resolve(redlinePath));
const pick = (explicit, name) => {
  if (explicit) return explicit;
  for (const candidate of [join(beside, name), name, join(beside, 'docs', name)]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
};
const dataPaths = dataFlags.length ? dataFlags : [pick(null, 'chartdata.json')].filter(Boolean);
const dataPath = dataPaths.join(', ');
const mandatePath = pick(mandateFlag, 'mandate.md');

if (!dataPaths.length) {
  console.error('no chartdata.json — the numeral gate cannot run without it, and a redline ' +
    'whose numbers were never computed is the failure this tool exists to catch');
  process.exit(1);
}
// Not a skipped check. /redline refuses without a mandate docket, so passing here without one
// would certify a report the skill would have declined to write.
if (!mandatePath) {
  console.error('no mandate docket — /redline refuses to run without one, so this cannot be ' +
    'verified as a redline; run /mandate-docket first');
  process.exit(1);
}

// Being handed the rendered page instead of the data behind it is the one mistake worth a
// sentence rather than a stack trace, because the fix is to write a file that does not exist yet.
const parse = (path, what, hint = 'the gate reads the redline as data, not the rendered page — ' +
  'write redline.json first and build the HTML from it') => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    console.error(`${path} does not parse as JSON, so ${what} cannot be read: ${error.message}`);
    console.error(hint);
    process.exit(1);
  }
};
const redline = parse(redlinePath, 'the redline');
const data = Object.assign({}, ...dataPaths.map((f) => parse(f, 'the computed aggregates')));
const mandate = readFileSync(mandatePath, 'utf8');

const findings = redline.findings ?? [];
const context = redline.context ?? [];
const struck = redline.struck ?? [];
const reserve = redline.reserve ?? [];
const declined = redline.declined ?? [];
const refusals = redline.refusals ?? [];
const rollup = redline.rollup ?? [];
const seats = redline.seats ?? [];
const frame = redline.frame ?? {};

const checks = [];
const check = (name, ok, detail) => checks.push({ name, ok: !!ok, detail: [].concat(detail ?? []) });

// --- the numeral allowlist ---------------------------------------------------------------
// Every number anywhere in chartdata, plus the renderings a writer actually uses for it. A Map
// rather than a Set because each form remembers where it came from: the gate only needs `has`,
// but `--emit` needs to tell a reviewer that 22 is `opt-a2.windowMonths` rather than merely
// that 22 resolves. First writer wins, so a form reached by two paths reports the earlier one.
const values = new Map();
const addValue = (n, from) => {
  if (!Number.isFinite(n)) return;
  const forms = [n, Math.round(n), Math.abs(n)];
  for (const scale of [1, 1e-3, 1e-6, 1e-9, 100]) forms.push(n * scale);
  for (const form of forms) {
    if (!Number.isFinite(form)) continue;
    for (const key of [String(form), form.toFixed(0), form.toFixed(1), form.toFixed(2),
      String(Math.round(form))]) {
      if (!values.has(key)) values.set(key, from);
    }
  }
};
const walk = (node, from) => {
  if (typeof node === 'number') return addValue(node, from);
  if (typeof node === 'string') {
    const parsed = Number(node.replace(/[$,%\s]/g, ''));
    if (node.trim() !== '' && Number.isFinite(parsed)) addValue(parsed, from);
    return;
  }
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${from}[${i}]`));
  if (node && typeof node === 'object') {
    return Object.entries(node).forEach(([k, v]) => walk(v, from ? `${from}.${k}` : k));
  }
};
walk(data, '');

const SCALES = { k: 1e3, m: 1e6, b: 1e9, '%': 1 };
/** Every numeral in a prose string, normalized to the forms the allowlist holds. */
const numeralsIn = (text) => {
  const found = [];
  // The lookbehinds are doing real work: they keep `F1`, `opt-a2`, the `08`/`25` of an ISO date
  // and the `963` of `MIL-STD-963` out of the gate, so an address, a datestamp and an instrument
  // name are not mistaken for measurements. The hyphen is only disqualifying when it sits inside
  // an identifier -- after a space it is a minus sign, and `-1,204` must look up as its own
  // magnitude rather than as the `204` a blanket hyphen exclusion would leave behind.
  // Thousands groups are exactly three digits, which is what keeps a trailing comma out of the
  // match: `DFARS 227,` must look up as `DFARS 227` or the exemption fails on punctuation alone.
  const re = /(?<![A-Za-z0-9_])(?<![A-Za-z0-9]-)\$?\d+(?:,\d{3})*(?:\.\d+)?\s*(?:%|[kKmMbB]\b)?/g;
  const source = String(text);
  for (const match of source.matchAll(re)) {
    const raw = match[0];
    if (isCitation(source, raw, match.index)) continue;
    const digits = raw.replace(/[$,\s]/g, '');
    const suffix = /[kKmMbB%]$/.exec(digits)?.[0]?.toLowerCase();
    const n = Number(digits.replace(/[kKmMbB%]$/, ''));
    if (!Number.isFinite(n)) continue;
    // A four-digit year is a label, not a measurement.
    if (!suffix && Number.isInteger(n) && n >= 1900 && n <= 2100 && !/\./.test(digits)) continue;
    found.push({ raw, candidates: [n, suffix ? n * SCALES[suffix] : n] });
  }
  return found;
};
// A citation is not a measurement. `Written into` names a document by section, so the field the
// format leans on hardest is the one most likely to carry DoDI 5000.97 or DFARS 227 — and a gate
// that cannot tell those from a number is a gate the format cannot live with. The exemption is
// deliberately narrow in both directions: the numeral must read syntactically as a citation (an
// identifier-shaped token in front of it), AND that exact pair must appear in the mandate docket.
// So a declared instrument passes, an invented one does not, and `Navy 0` is still a measurement
// because no docket declares it. The second half turns a hole into a check: you may only cite a
// document your mandate names.
const citations = new Set();
for (const [, token, num] of mandate.matchAll(/\b([A-Z][A-Za-z]*(?:-[A-Z]+)*)\s+(\d[\d.]*)/g)) {
  citations.add(`${token} ${num}`);
}
const isCitation = (text, raw, index) => {
  const before = /([A-Z][A-Za-z]*(?:-[A-Z]+)*)\s*$/.exec(text.slice(0, index));
  return !!before && citations.has(`${before[1]} ${raw.trim()}`);
};

const proseOf = (entry) => [
  entry.headline, entry.magnitude, entry.killsIt,
  ...(entry.whoActs ?? []).map((w) => w.reason),
  ...(entry.tasker?.steps ?? []), entry.tasker?.produces, entry.policyChange?.basis,
  // Named one by one rather than spread: `downstream` is an object, and an object survives
  // `.filter(Boolean)` to join as `[object Object]`, which carries no digits. Reaching for the
  // whole field here would take the Downstream out of the numeral gate without failing anything.
  entry.policyChange?.downstream?.cost, entry.policyChange?.downstream?.exposure,
  entry.policyChange?.downstream?.asymmetry,
  entry.policyChange?.writtenInto, entry.reading, entry.strike,
  entry.wrong, entry.instead, entry.reason
].filter(Boolean).join(' ');

// --- structure ---------------------------------------------------------------------------
const ids = findings.map((f) => f.id);
check('finding-ids-unique', new Set(ids).size === ids.length && ids.every((id) => /^F\d+$/.test(id)),
  ['finding ids are addresses other documents cite: they match /^F\\d+$/, are unique, and are ' +
    'never reused — a retired finding is struck in place, not renumbered']);

const missingFields = findings.flatMap((f) =>
  FIELDS.filter((k) => f[k] === undefined || f[k] === null || f[k] === '')
    .map((k) => `${f.id ?? '(no id)'}: missing ${k}`));
check('card-fields', missingFields.length === 0, missingFields.length ? missingFields :
  ['every finding carries all ten fields; the format doc groups them in four so ten is writable']);

const badShape = findings.filter((f) => !SHAPES.has(f.shape)).map((f) => `${f.id}: ${f.shape}`);
check('shape-known', badShape.length === 0,
  badShape.length ? badShape.concat(`legal shapes: ${[...SHAPES].join(', ')}`,
    'each is a section of references/inefficiency-shapes.md') :
    ['if no shape fired, ask why this is a finding rather than context']);

const badPosture = findings.filter((f) => !POSTURES.has(f.posture)).map((f) => `${f.id}: ${f.posture}`);
check('posture-declared', badPosture.length === 0, badPosture.length ? badPosture :
  ['posture is standard or actor — the label is what stops actor findings accumulating unnoticed']);

const badProv = findings.filter((f) => !PROVENANCE.has(f.provenance)).map((f) => `${f.id}: ${f.provenance}`);
check('provenance-declared', badProv.length === 0, badProv.length ? badProv :
  ['raw, derived, or model-judged — the classification is mechanical: does this number depend ' +
    'on a classifier or a hand-assigned label']);

// --- the policy change --------------------------------------------------------------------
const changeGaps = findings.flatMap((f) => {
  const pc = f.policyChange ?? {};
  const gaps = [];
  if (!pc.owner) gaps.push(`${f.id}: policy change has no Owner`);
  if (!pc.writtenInto) gaps.push(`${f.id}: policy change has no Written into`);
  // Three parts, because a Downstream is a comparison and no check over one string can tell
  // which side of it a number is on.
  for (const part of ['cost', 'exposure', 'asymmetry']) {
    if (!pc.downstream?.[part]) gaps.push(`${f.id}: Downstream has no ${part}`);
  }
  if (!pc.basis) gaps.push(`${f.id}: Downstream has no basis — name the projection it came from, ` +
    'so a reader can reject the projection instead of the report');
  return gaps;
});
check('policy-change-complete', changeGaps.length === 0, changeGaps.length ? changeGaps :
  ['a change with no document is advice — "someone should" is not a policy change']);

// Each side of the comparison has to carry a figure somebody computed, and they have to be
// different figures — a cost priced at the exposure is not a trade, it is the same number twice.
const priceGaps = findings.flatMap((f) => {
  const d = f.policyChange?.downstream ?? {};
  const sides = ['cost', 'exposure'].map((k) => ({ k, nums: numeralsIn(String(d[k] ?? '')) }));
  const bare = sides.filter((s) => !s.nums.length)
    .map((s) => `${f.id}: Downstream ${s.k} carries no figure — an unpriced side cannot be weighed`);
  if (bare.length) return bare;
  const [cost, exposure] = sides.map((s) => s.nums.map((n) => n.candidates[0]));
  return cost.every((c) => exposure.includes(c))
    ? [`${f.id}: Downstream cost and exposure resolve to the same figure, so nothing is compared`]
    : [];
});
check('downstream-priced', priceGaps.length === 0, priceGaps.length ? priceGaps :
  ['both sides of every Downstream carry a computed figure, and the two differ']);

// Without this the two sides are decorative: the sentence that does the arguing can ignore them.
const loose = findings.flatMap((f) => {
  const d = f.policyChange?.downstream ?? {};
  // Compared as resolved values, not as substrings: `includes('5')` is satisfied by the 5 inside
  // 25, and a gate that scrapes prose can be satisfied by prose.
  const said = new Set(numeralsIn(String(d.asymmetry ?? '')).map((n) => n.candidates[0]));
  return ['cost', 'exposure'].flatMap((k) => {
    const figures = numeralsIn(String(d[k] ?? ''));
    return figures.length && !figures.some((n) => said.has(n.candidates[0]))
      ? [`${f.id}: the asymmetry sentence carries no figure from the ${k} — `
        + figures.map((n) => n.raw.trim()).join(', ')]
      : [];
  });
});
check('asymmetry-binds', loose.length === 0, loose.length ? loose :
  ['every asymmetry sentence sets one side\'s figure against the other\'s']);

const unlabelled = findings.filter((f) => !LABELS.has(f.policyChange?.label))
  .map((f) => `${f.id}: label is ${JSON.stringify(f.policyChange?.label)}`);
check('downstream-labelled', unlabelled.length === 0, unlabelled.length ? unlabelled :
  ['every Downstream is exact or estimated — an unlabelled magnitude is read as exact, and ' +
    'most of them are not']);

// The label line renders as `*{label}, {basis}*`, so a basis that opens with the label word
// stutters: `*exact, exact, counted over the 22 months*`. The basis is the projection only.
const stutter = findings.filter((f) => /^\s*(exact|estimated)\b/i.test(String(f.policyChange?.basis ?? '')))
  .map((f) => `${f.id}: basis repeats the label word — the label line composes it already`);
check('basis-renders-clean', stutter.length === 0, stutter.length ? stutter
  : ['every basis is the projection alone, so the composed label line reads once']);

// --- routing ------------------------------------------------------------------------------
// A docket declares three kinds of address under three kinds of heading — seats, directives and
// artifacts — and only one of them can be told to do something. Scraping the whole file flattens
// them, so a finding addressed to `A2` (a document that is owed) resolves as cleanly as one
// addressed to a person who signs. The headings are what separate them.
const docketNamespaces = () => {
  const kinds = { seat: new Set(), directive: new Set(), artifact: new Set(), other: new Set() };
  let kind = 'other';
  for (const part of mandate.split(/^(#{1,6} .*)$/m)) {
    if (part.startsWith('#')) {
      kind = /\bseats?\b/i.test(part) ? 'seat'
        : /\bdirectives?\b/i.test(part) ? 'directive'
          : /\bartifacts?\b/i.test(part) ? 'artifact' : 'other';
      continue;
    }
    for (const [, code] of part.matchAll(/\*\*([A-Z][A-Z0-9]{0,7})\.\s/g)) kinds[kind].add(code);
  }
  return kinds;
};
const docket = docketNamespaces();
// A docket with no headings the parse recognises still has to work: fall back to every address
// it declares, which is the behaviour before namespaces existed.
const named = new Set([...docket.seat, ...docket.directive, ...docket.artifact, ...docket.other]);
const seatsInDocket = docket.seat.size ? docket.seat : named;
const notASeat = (code) => (docket.directive.has(code) ? 'a directive'
  : docket.artifact.has(code) ? 'an owed artifact' : null);
const rosterCodes = new Set(seats.map((s) => s.code).filter(Boolean));
// Owner is prose — "STD, which signs the notice and imposes it" — so the code is read off the
// front. Requiring it there is the discipline: the seat leads, the caveat follows.
const ownerCode = (owner) => /^([A-Z][A-Z0-9]{0,7})\b/.exec(String(owner ?? ''))?.[1];
const seatsUsed = [...new Set(findings.flatMap(
  (f) => [...(f.whoActs ?? []).map((w) => w.code), ownerCode(f.policyChange?.owner)]).filter(Boolean))];
const ownerless = findings.filter((f) => f.policyChange?.owner && !ownerCode(f.policyChange.owner))
  .map((f) => `${f.id}: Owner does not begin with a seat code`);
const unresolved = seatsUsed.filter((s) => !seatsInDocket.has(s));
check('seat-resolves', unresolved.length === 0,
  unresolved.length ? unresolved.map((s) => (notASeat(s)
    ? `${s} is ${notASeat(s)}, not a seat — a document cannot be told to act, only written into`
    : `${s} is in no mandate docket entry`))
    .concat(`docket seats: ${[...seatsInDocket].sort().join(', ') || '(none)'}`)
    : [`every seat resolves against ${mandatePath}`]);

// `S1` is a perfectly well-formed code and an unreadable address. A reader meeting it mid-card
// has to hold a lookup table in their head; a reader meeting `STD` does not.
const serial = [...new Set([...seatsUsed, ...rosterCodes])].filter((s) => /^S\d+$/.test(s));
check('seat-codes-mnemonic', serial.length === 0, serial.length
  ? serial.map((s) => `${s} is a serial number — seats are addressed by mnemonic, so a reader `
    + 'meeting the code on a card can guess what it governs')
  : ['seat codes are mnemonics rather than serial numbers']);

// Both directions, because the roster is what makes a code readable where the reader is: a code
// on a card with no roster entry is unreadable, and a roster entry no card uses is an org chart.
const rosterGaps = [
  ...seats.filter((s) => !s.code || !s.title || !s.decides)
    .map((s) => `roster entry ${s.code ?? '(no code)'} needs code, title and decides`),
  ...ownerless,
  ...seatsUsed.filter((s) => !rosterCodes.has(s)).map((s) => `${s} is cited but has no roster card`),
  ...[...rosterCodes].filter((s) => !seatsUsed.includes(s))
    .map((s) => `${s} has a roster card no finding uses`)
];
check('seat-roster', seats.length > 0 && rosterGaps.length === 0,
  seats.length === 0 ? ['no `seats` roster — a reader meeting a code mid-card has nowhere to ' +
    'resolve it without leaving the page, which is what the roster exists to prevent']
    : rosterGaps.length ? rosterGaps : [`${seats.length} seats, every code cited and every one carded`]);

// Two seats that decide the same thing are one seat written twice, and the roster stops being a
// reading aid the moment a reader cannot tell its entries apart.
const decisions = seats.map((s) => (s.decides ?? '').trim()).filter(Boolean);
const repeated = [...new Set(decisions.filter((d, i) => decisions.indexOf(d) !== i))];
check('roster-decides-distinct', repeated.length === 0, repeated.length
  ? repeated.map((d) => `two roster entries decide the same thing: ${JSON.stringify(d.slice(0, 60))}`)
  : ['every roster entry decides something the others do not']);

// A finding that reaches three seats for one reason reached one seat.
const actGaps = findings.flatMap((f) => {
  const acts = f.whoActs ?? [];
  if (!acts.length) return [`${f.id}: whoActs is empty — a finding reaching no seat is context`];
  const bad = acts.filter((w) => !w.code || !w.reason).map(() => `${f.id}: a whoActs entry lacks code or reason`);
  const reasons = acts.map((w) => (w.reason ?? '').trim());
  const dup = new Set(reasons).size !== reasons.length
    ? [`${f.id}: two seats carry the same reason, so neither was read for its own decision`] : [];
  return [...bad, ...dup];
});
check('who-acts', actGaps.length === 0, actGaps.length ? actGaps :
  ['every finding names each seat it reaches with the reason it matters to that seat']);

// A step is something a person could execute on Monday, so it is at minimum a sentence. The floor
// is low on purpose: it rejects a placeholder without pretending to judge whether a step is good.
const STEP_FLOOR = 20;
const taskerGaps = findings.flatMap((f) => {
  const t = f.tasker ?? {};
  const gaps = [];
  if (!Array.isArray(t.steps) || !t.steps.length) gaps.push(`${f.id}: tasker has no numbered steps`);
  if (!t.produces) gaps.push(`${f.id}: tasker names no artifact it produces`);
  return gaps;
});
check('tasker-produces', taskerGaps.length === 0, taskerGaps.length ? taskerGaps :
  ['steps a person could execute on Monday, and the artifact at the end of them']);

// Presence and substance are separate claims, so they are separate checks: a tasker can carry a
// steps array and a produces string and still say nothing, which is the shape of a filled box.
const thinTasker = findings.flatMap((f) => {
  const t = f.tasker ?? {};
  const gaps = (Array.isArray(t.steps) ? t.steps : [])
    .map((step, i) => (String(step).trim().length < STEP_FLOOR
      ? `${f.id}: step ${i + 1} is ${JSON.stringify(step)}, which nobody can execute` : null))
    .filter(Boolean);
  // A `produces` restating a step names the work again rather than the artifact at the end of it.
  if (t.produces && (t.steps ?? []).some((s) => String(s).trim() === String(t.produces).trim())) {
    gaps.push(`${f.id}: what it produces repeats a step verbatim, so it names no artifact`);
  }
  return gaps;
});
check('tasker-substance', thinTasker.length === 0, thinTasker.length ? thinTasker :
  [`every step clears ${STEP_FLOOR} characters and produces names something the steps do not`]);

const chartKeys = new Set(Object.keys(data));
const missingCharts = [...findings, ...struck].filter((f) => f.chart && !chartKeys.has(f.chart))
  .map((f) => `${f.id}: chart ${f.chart} is not a key in ${dataPath}`);
check('charts-exist', missingCharts.length === 0, missingCharts.length ? missingCharts :
  ['every Chart names an aggregate that exists — a described-but-unbuilt chart proves nothing']);

// --- honesty ------------------------------------------------------------------------------
const debtText = String(frame.verificationDebt ?? '');
const judged = findings.filter((f) => f.provenance === 'model-judged');
const undeclared = judged.filter((f) => !debtText.includes(f.id)).map((f) => `${f.id} is not in the frame's debt paragraph`);
check('debt-paragraph', undeclared.length === 0, undeclared.length ? undeclared :
  [judged.length ? 'model-judged findings are stated once globally and admitted once per card'
    : 'no model-judged findings, nothing to declare']);

const wrongSentences = new Set(refusals.map((r) => (r.wrong ?? '').trim()).filter(Boolean));
const unrefused = findings.filter((f) => !wrongSentences.has((f.killsIt ?? '').trim()))
  .map((f) => `${f.id}: its "kills it" sentence never reaches the refusals section`);
const unreplaced = refusals.filter((r) => !r.wrong?.trim() || !r.instead?.trim())
  .map((r) => `refusal without both halves: ${JSON.stringify(r.wrong ?? r.instead ?? r)}`);
check('refusals-paired', unrefused.length === 0 && unreplaced.length === 0,
  unrefused.concat(unreplaced).length ? unrefused.concat(unreplaced) :
    ['checked in both directions: every finding is refused, every refusal has a replacement ' +
      'sentence rather than a caveat']);

check('refusals-nonempty', refusals.length > 0,
  ['the refusals are the product — a report that only adds findings leaves every wrong reading ' +
    'as available as it was before']);
check('declined-nonempty', declined.length > 0,
  ['an empty "considered and declined" means candidates were collected rather than tested']);

// --- the roll-up and the inventory ----------------------------------------------------------
const rolledUp = rollup.flatMap((row) => row.findings ?? []);
const counted = new Map();
for (const id of rolledUp) counted.set(id, (counted.get(id) ?? 0) + 1);
const rollupErrors = [
  ...ids.filter((id) => !counted.has(id)).map((id) => `${id} has a policy change and no roll-up row`),
  ...[...counted].filter(([, n]) => n > 1).map(([id, n]) => `${id} appears in ${n} roll-up rows`),
  ...rolledUp.filter((id) => !ids.includes(id)).map((id) => `roll-up cites ${id}, which is not a finding`)
];
check('rollup-covers-once', rollupErrors.length === 0, rollupErrors.length ? rollupErrors :
  [`${rollup.length} document(s) absorb ${ids.length} change(s) — the roll-up is the payload`]);

const actual = {
  findings: findings.length, context: context.length, struck: struck.length,
  reserve: reserve.length, declined: declined.length
};
const claimed = frame.inventory ?? {};
const drift = Object.entries(actual).filter(([k, n]) => (claimed[k] ?? 0) !== n)
  .map(([k, n]) => `frame claims ${k}=${claimed[k] ?? 0}, page has ${n}`);
check('inventory-reconciles', drift.length === 0, drift.length ? drift :
  [`closed at ${Object.values(actual).reduce((a, b) => a + b, 0)}: every measurement placed exactly once`]);

// --- the numeral gate -----------------------------------------------------------------------
const strays = [];
const frameProse = { id: 'frame', headline: frame.verificationDebt, magnitude: frame.denominators };
for (const entry of [frameProse, ...findings, ...context, ...struck, ...reserve, ...refusals, ...declined]) {
  for (const { raw, candidates } of numeralsIn(proseOf(entry))) {
    // Only the DATA side is allowed to round. Rounding the prose numeral too would let $4.2M
    // satisfy itself against a 4 sitting anywhere in the file, which is a gate with a hole in it.
    const ok = candidates.some((n) => values.has(String(n)) || values.has(n.toFixed(1)) ||
      values.has(n.toFixed(2)));
    if (!ok) strays.push(`${entry.id ?? entry.wrong?.slice(0, 32) ?? '(entry)'}: ${raw}`);
  }
}
check('numerals-in-data', strays.length === 0, strays.length
  ? strays.concat(`no number reaches the page except through ${dataPath} — run the query and ` +
    'write the result back before writing the sentence')
  : ['every numeral resolves to a computed value']);

// --- the judged half ------------------------------------------------------------------------
// Five questions, each sitting exactly where a mechanical check stops. `who-acts` proves two
// reasons differ as strings and cannot ask whether they differ as decisions; `asymmetry-binds`
// proves the sentence carries both figures and cannot ask whether it trades them; `shape-known`
// proves membership, not fit; `refusals-paired` proves the pairing, not that the sentence kills;
// `tasker-substance` proves length and non-repetition, not that `produces` names a thing. A
// reviewer that answered anything else would be re-running this file by hand.
const QUESTIONS = {
  'seat-fit': 'is each whoActs reason that seat\'s own decision, given what the roster says it decides',
  'trade-real': 'does the asymmetry set a cost against an exposure, rather than stating a benefit twice',
  'shape-honest': 'is the declared shape the one the magnitude actually shows',
  'kills-it-kills': 'would the killsIt sentence end the finding, or is it a caveat it survives',
  'produces-is-artifact': 'does produces name something that exists after the steps, not the work'
};
const RULINGS = new Set(['ok', 'doubt', 'fail']);

// Reviews merge by finding id, and that is the whole answer to why review fans out where
// building cannot: a finding is an object inside one shared redline.json with no fence around
// it, but a verdict is a key each reviewer owns alone, so concurrent verdicts merge by
// assignment. The parallel unit is the judgment, not the write.
const doubts = [];
if (reviewPath) {
  const verdicts = parse(reviewPath, 'the review verdicts',
    'verdicts are one object per finding id, merged from the reviewers; see references/review.md');
  const gaps = [
    ...ids.filter((id) => !verdicts[id]).map((id) => `${id} was never reviewed`),
    ...Object.keys(verdicts).filter((id) => !ids.includes(id))
      .map((id) => `there is a verdict for ${id}, which is not a finding`)
  ];
  for (const id of ids.filter((i) => verdicts[i])) {
    for (const [q, asks] of Object.entries(QUESTIONS)) {
      const v = verdicts[id][q];
      if (!v) { gaps.push(`${id}: no ruling on ${q} -- ${asks}`); continue; }
      if (!RULINGS.has(v.ruling)) gaps.push(`${id} ${q}: ruling is ${JSON.stringify(v.ruling)}, not ok/doubt/fail`);
      if (!String(v.why ?? '').trim()) gaps.push(`${id} ${q}: ruled ${v.ruling} with no reason, which is a vote rather than a review`);
      if (v.ruling === 'fail') gaps.push(`${id} ${q}: FAILED review -- ${v.why}`);
      if (v.ruling === 'doubt') doubts.push(`${id} ${q}: ${v.why}`);
    }
  }
  check('review-complete', gaps.length === 0, gaps.length ? gaps
    : [`${ids.length} finding(s) reviewed on all ${Object.keys(QUESTIONS).length} judged questions`]);
}

// --- the evidence artifact ------------------------------------------------------------------
// What a reviewer judges instead of re-deriving. Every value here is a fact this run resolved:
// the seat behind a code, the chartdata path behind a numeral, the refusal that answers a
// finding. That is the whole point -- a reviewer handed the source has to redo the resolution
// before it can disagree with it, and a reviewer that redoes the resolution is a second verifier
// rather than a second opinion.
//
// Deliberately absent: mark counts. Those are page facts, this gate never opens the page, and a
// second process merging into this file would let a stale run's data facts survive a rebuild.
// verify-redline-page.mjs prints its tally as a signal line instead.
const figuresIn = (text) => numeralsIn(String(text ?? '')).map(({ raw, candidates }) => {
  const form = candidates.flatMap((n) => [String(n), n.toFixed(1), n.toFixed(2)])
    .find((k) => values.has(k));
  return { raw: raw.trim(), value: candidates[0], source: form === undefined ? null : values.get(form) };
});
const withFigures = (fields) => Object.fromEntries(
  Object.entries(fields).map(([k, v]) => [k, figuresIn(v)]).filter(([, f]) => f.length));

const seatByCode = new Map(seats.filter((s) => s.code).map((s) => [s.code, s]));
const refusalFor = (f) => refusals.find((r) => (r.wrong ?? '').trim() === (f.killsIt ?? '').trim()) ?? null;
const rollupFor = (f) => rollup.find((r) => (r.findings ?? []).includes(f.id)) ?? null;

const evidence = {
  redline: redlinePath,
  data: dataPaths,
  mandate: mandatePath,
  passed: checks.every((c) => c.ok),
  failedChecks: checks.filter((c) => !c.ok).map((c) => c.name),
  inventory: actual,
  findings: findings.map((f) => {
    const pc = f.policyChange ?? {};
    const code = ownerCode(pc.owner);
    return {
      id: f.id,
      headline: f.headline,
      shape: f.shape,
      posture: f.posture,
      provenance: f.provenance,
      chart: f.chart,
      // Resolved, not cited: the reviewer's question is whether this reason is genuinely THIS
      // seat's decision, and it cannot ask that while the seat is still a three-letter code.
      seatsReached: (f.whoActs ?? []).map((w) => ({
        code: w.code,
        title: seatByCode.get(w.code)?.title ?? null,
        decides: seatByCode.get(w.code)?.decides ?? null,
        reason: w.reason
      })),
      owner: { code: code ?? null, title: seatByCode.get(code)?.title ?? null, prose: pc.owner },
      writtenInto: pc.writtenInto,
      downstream: { label: pc.label, basis: pc.basis, ...(pc.downstream ?? {}) },
      tasker: { steps: f.tasker?.steps ?? [], produces: f.tasker?.produces },
      killsIt: f.killsIt,
      refusedBy: refusalFor(f),
      rollupRow: rollupFor(f) && { document: rollupFor(f).document, owner: rollupFor(f).owner },
      figures: withFigures({
        headline: f.headline, magnitude: f.magnitude, killsIt: f.killsIt,
        cost: pc.downstream?.cost, exposure: pc.downstream?.exposure,
        asymmetry: pc.downstream?.asymmetry, basis: pc.basis, writtenInto: pc.writtenInto,
        tasker: (f.tasker?.steps ?? []).concat(f.tasker?.produces ?? []).join(' ')
      })
    };
  })
};
if (emitPath) writeFileSync(emitPath, `${JSON.stringify(evidence, null, 2)}\n`);

console.log(`${redlinePath}  (data: ${dataPath}, mandate: ${mandatePath})`);
let failed = false;
for (const c of checks) {
  console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.name}`);
  if (c.ok) continue;
  failed = true;
  for (const line of c.detail) console.log(`        ${line}`);
}
// Signals, not checks. A report that is all one posture has found a scandal rather than a policy,
// and a report that is all one shape has found one defect described five ways — both are worth
// knowing before it ships and neither is a reason to block a build.
// A doubt is handed to a person, not blocked on: a reviewer who cannot tell has reported exactly
// that, and turning uncertainty into a build stop teaches reviewers to rule `ok` when unsure.
for (const doubt of doubts) console.log(`  signal  doubt: ${doubt}`);
const tally = (xs) => [...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map())]
  .sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ');
if (findings.length) {
  console.log(`  signal  posture: ${tally(findings.map((f) => f.posture))}`);
  console.log(`  signal  shape:   ${tally(findings.map((f) => f.shape))}`);
  const [, top] = [...findings.reduce((m, f) => m.set(f.shape, (m.get(f.shape) ?? 0) + 1), new Map())]
    .sort((a, b) => b[1] - a[1])[0];
  if (findings.length >= 4 && top / findings.length > 0.5) {
    console.log('          over half the findings are one shape — say so in the frame, or ask ' +
      'whether they are one finding described several ways');
  }
}

console.log('');
process.exit(failed ? 1 : 0);
