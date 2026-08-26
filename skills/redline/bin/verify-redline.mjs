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
 * The numeral check is the reason this file exists. Every number in every prose field must
 * resolve to a value in chartdata.json under some ordinary rendering of it — $1.2M for
 * 1200000, 25.7% for 0.257 or 25.7. Four-digit years are exempt because a year is a label, not
 * a measurement. Nothing else is exempt: a number that needs to be in the report needs to be in
 * the data file first, which costs one query and closes the hole permanently.
 */
import { existsSync, readFileSync } from 'node:fs';
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
const [redlinePath] = args;

if (!redlinePath) {
  console.error('usage: verify-redline.mjs <redline.json> [--data chartdata.json] [--mandate mandate.md]');
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
const parse = (path, what) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    console.error(`${path} does not parse as JSON, so ${what} cannot be read: ${error.message}`);
    console.error('the gate reads the redline as data, not the rendered page — write ' +
      'redline.json first and build the HTML from it');
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
// Every number anywhere in chartdata, plus the renderings a writer actually uses for it.
const values = new Set();
const addValue = (n) => {
  if (!Number.isFinite(n)) return;
  const forms = [n, Math.round(n), Math.abs(n)];
  for (const scale of [1, 1e-3, 1e-6, 1e-9, 100]) forms.push(n * scale);
  for (const form of forms) {
    if (!Number.isFinite(form)) continue;
    values.add(String(form));
    values.add(form.toFixed(0));
    values.add(form.toFixed(1));
    values.add(form.toFixed(2));
    values.add(String(Math.round(form)));
  }
};
const walk = (node) => {
  if (typeof node === 'number') return addValue(node);
  if (typeof node === 'string') {
    const parsed = Number(node.replace(/[$,%\s]/g, ''));
    if (node.trim() !== '' && Number.isFinite(parsed)) addValue(parsed);
    return;
  }
  if (Array.isArray(node)) return node.forEach(walk);
  if (node && typeof node === 'object') return Object.values(node).forEach(walk);
};
walk(data);

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
  entry.policyChange?.downstream, entry.policyChange?.writtenInto, entry.reading, entry.strike,
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
  if (!pc.downstream) gaps.push(`${f.id}: policy change has no Downstream`);
  if (!pc.basis) gaps.push(`${f.id}: Downstream has no basis — name the projection it came from, ` +
    'so a reader can reject the projection instead of the report');
  return gaps;
});
check('policy-change-complete', changeGaps.length === 0, changeGaps.length ? changeGaps :
  ['a change with no document is advice — "someone should" is not a policy change']);

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
