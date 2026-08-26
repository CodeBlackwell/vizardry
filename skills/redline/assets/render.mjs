#!/usr/bin/env node
/**
 * Generates the redline page body from redline.json and injects it into shell.html.
 *
 *   node <assets>/render.mjs [--in redline.json] [--out page.html]
 *
 * The data file is written first and the page is generated from it, so the two cannot
 * disagree by accident. Every selector this emits is fixed by the table in
 * references/redline-format.md: one value, one element, and no label inside it — that is what
 * lets the page gate compare page against data with string equality.
 *
 * Run build.mjs afterwards to inline the libraries into a self-contained report.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The five properties every policyChange carries. A card missing one is a change with no address. */
const PC_FIELDS = ['owner', 'writtenInto', 'downstream', 'label', 'basis'];

/** The five inventory buckets, in the order the frame states them. */
const BUCKETS = ['findings', 'context', 'struck', 'reserve', 'declined'];

const flag = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};

/** Markup-significant characters only. Non-ASCII is build.mjs's job. */
const esc = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const field = (name, value) => `<span data-field="${name}">${esc(value)}</span>`;
const row = (label, name, value) => `<div class="f"><span class="k">${label}</span>${field(name, value)}</div>`;
const chartMount = (id) => `<figure><div class="chart" data-chart="${esc(id)}"></div></figure>`;
const section = (id, heading, note, body) =>
  `<section id="${id}">\n<h2>${heading}<span class="n">${note}</span></h2>\n${body}\n</section>`;

function seatCard(seat) {
  return `<div class="seat" data-seat="${esc(seat.code)}"><span class="chip">${esc(seat.code)}</span>` +
    `<h3 data-field="title">${esc(seat.title)}</h3>` +
    `<p data-field="decides">${esc(seat.decides)}</p></div>`;
}

function findingCard(finding) {
  const change = finding.policyChange;
  for (const key of PC_FIELDS) {
    if (change?.[key] === undefined) throw new Error(`${finding.id}: policyChange.${key} is missing`);
  }
  const who = finding.whoActs
    .map((w) => `<li data-seat="${esc(w.code)}"><span class="chip q2">${esc(w.code)}</span>` +
      `<span data-field="reason">${esc(w.reason)}</span></li>`)
    .join('\n');
  const steps = finding.tasker.steps.map((s) => `<li data-field="step">${esc(s)}</li>`).join('\n');
  return `<article class="find" id="${esc(finding.id)}">
<header><span class="chip">${esc(finding.id)}</span><h3 data-field="headline">${esc(finding.headline)}</h3></header>
<div class="body">

<div class="grp"><h4>The finding</h4>
${chartMount(finding.chart)}
${row('Magnitude', 'magnitude', finding.magnitude)}
${row('Shape', 'shape', finding.shape)}
</div>

<div class="grp"><h4>The routing</h4>
${row('Posture', 'posture', finding.posture)}
<div class="f"><span class="k">Who acts</span><ul class="who">
${who}
</ul></div>
<div class="f"><span class="k">Tasker</span><div><ol class="tasker">
${steps}
</ol>
<div class="produces"><b>What it produces</b>${field('produces', finding.tasker.produces)}</div>
</div></div>
</div>

<div class="grp"><h4>The honesty</h4>
<div class="fail"><h4>Kills it</h4><p class="q" data-field="killsIt">${esc(finding.killsIt)}</p></div>
${row('Provenance', 'provenance', finding.provenance)}
</div>

<div class="grp"><h4>The change</h4>
<div class="change">
${row('Owner', 'owner', change.owner)}
${row('Written into', 'writtenInto', change.writtenInto)}
<p class="label-line">Downstream &mdash; ${field('label', change.label)}, ${field('basis', change.basis)}</p>
${row('Cost', 'cost', change.downstream.cost)}
${row('Exposure', 'exposure', change.downstream.exposure)}
<p class="asym">${field('asymmetry', change.downstream.asymmetry)}</p>
</div>
</div>

</div></article>`;
}

function contextCard(entry) {
  return `<article class="find" id="${esc(entry.id)}">
<header><span class="chip">${esc(entry.id)}</span><h3 data-field="headline">${esc(entry.headline)}</h3></header>
<div class="body"><div class="grp">
${chartMount(entry.chart)}
${row('Magnitude', 'magnitude', entry.magnitude)}
${entry.reading === undefined ? '' : row('Reading', 'reading', entry.reading)}
</div></div></article>`;
}

function struckCard(entry) {
  return `<article class="find" id="${esc(entry.id)}">
<header><span class="chip">${esc(entry.id)}</span><h3>Drawn to be struck</h3></header>
<div class="body"><div class="grp">
${chartMount(entry.chart)}
${row('Invites', 'reading', entry.reading)}
${row('Struck', 'strike', entry.strike)}
</div></div></article>`;
}

const railLink = (id, key, label) =>
  `<a href="#${esc(id)}"><span class="k">${esc(key)}</span><span>${esc(label)}</span></a>`;

function rail(data) {
  const group = (title, links) => links.length === 0 ? '' : `<h5>${title}</h5>\n${links.join('\n')}`;
  return `<nav class="rail">
${group('The frame', [
    railLink('frame', '&sect;', 'The frame'),
    railLink('stands', '&sect;', 'What every figure stands on'),
    railLink('seats', '&sect;', 'Where these land')
  ])}
${group('The findings', data.findings.map((f) => railLink(f.id, f.id, f.headline)))}
${group('Context', data.context.map((c) => railLink(c.id, c.id, c.headline)))}
${group('Drawn to be struck', data.struck.map((s) => railLink(s.id, s.id, s.reading)))}
${group('Closing', [
    railLink('refusals', '&sect;', 'The refusals'),
    railLink('declined', '&sect;', 'Considered and declined'),
    railLink('must-refuse', '&sect;', 'What this data must refuse'),
    railLink('rollup', '&sect;', 'The documents these rewrite'),
    railLink('mandate', '&sect;', 'The mandate this stands on')
  ])}
</nav>`;
}

function body(data) {
  const inventory = BUCKETS
    .map((b) => `<tr><td>${b}</td><td class="n">${esc(data.frame.inventory[b])}</td></tr>`)
    .join('\n');
  const reserve = data.reserve.length === 0 ? '' :
    `<h4>Held in reserve</h4>\n<ul>\n${data.reserve
      .map((r) => `<li>${esc(r.headline ?? r.reason ?? r)}</li>`).join('\n')}\n</ul>`;

  return `${rail(data)}

<main class="main">
<header class="mast">
  <div class="eyebrow">The redline</div>
  <h1>What must change, and who changes it</h1>
  <p class="sub">Prepared for the ${esc(data.frame.recipient)}.</p>
</header>

<section id="frame">
<p class="lede">Prepared for the <strong>${esc(data.frame.recipient)}</strong>. Every count below is
closed: it sums to the entries this page actually carries.</p>
<div class="tw"><table>
<thead><tr><th>Bucket</th><th class="n">Count</th></tr></thead>
<tbody>
${inventory}
</tbody></table></div>
<div class="call warn"><h4>Verification debt</h4><p>${esc(data.frame.verificationDebt)}</p></div>
<div class="call"><h4>Denominators</h4><p>${esc(data.frame.denominators)}</p></div>
${reserve}
</section>

${section('stands', 'What every figure stands on', 'stated once, restated nowhere',
    `<p>${esc(data.standsOn)}</p>`)}

${section('seats', 'Where these land', `${data.seats.length} seats, not an org chart`,
    `<p class="lede">Findings are tagged with the seats they reach. The tags are a reading aid for this
document and nothing more, and the recipient knows its own structure.</p>
<div class="seats">
${data.seats.map(seatCard).join('\n')}
</div>`)}

${section('findings', 'The findings', 'numbered, and never renumbered',
    data.findings.map(findingCard).join('\n\n'))}

${section('context', 'Context', 'placed, not routed',
    data.context.map(contextCard).join('\n\n'))}

${section('struck', 'Drawn to be struck', 'built so they can be refused',
    data.struck.map(struckCard).join('\n\n'))}

${section('refusals', 'The refusals', 'the product', `<div class="tw"><table>
<thead><tr><th>The wrong sentence</th><th>What to say instead</th></tr></thead>
<tbody>
${data.refusals.map((r) =>
      `<tr><td data-field="wrong">${esc(r.wrong)}</td><td data-field="instead">${esc(r.instead)}</td></tr>`)
      .join('\n')}
</tbody></table></div>`)}

${section('declined', 'Considered and declined', 'with reasons', `<ul>
${data.declined.map((d) => `<li id="${esc(d.id)}"><span data-field="reason">${esc(d.reason)}</span></li>`)
      .join('\n')}
</ul>`)}

${section('must-refuse', 'What this data must refuse', 'foreclosed before they are asked', `<ul>
${data.mustRefuse.map((m) =>
      `<li><b data-field="question">${esc(m.question)}</b><br>` +
      `<span data-field="reason">${esc(m.reason)}</span></li>`).join('\n')}
</ul>`)}

${section('rollup', 'The documents these rewrite', 'the payload',
    `<p class="lede">${esc(data.rollupThesis)}</p>
<div class="tw"><table>
<thead><tr><th>Document</th><th>Owner</th><th class="n">Changes</th><th>Findings</th></tr></thead>
<tbody>
${data.rollup.map((r) => `<tr><td data-field="document">${esc(r.document)}</td>` +
      `<td class="role" data-field="owner">${esc(r.owner)}</td>` +
      `<td class="n">${r.findings.length}</td><td class="role">${esc(r.findings.join(', '))}</td></tr>`).join('\n')}
</tbody></table></div>`)}

${section('mandate', 'The mandate this stands on', 'the bibliography', `<p>${esc(data.mandate)}</p>`)}

</main>`;
}

/** Beside this script first, so the shell travels with it; then the gallery layout. */
const shellPath = [join(here, 'shell.html'), join(here, '../assets/shell.html')].find(existsSync);
if (!shellPath) throw new Error(`shell.html not found beside ${here} or in the gallery`);

const data = JSON.parse(readFileSync(flag('--in', 'redline.json'), 'utf8'));
const out = flag('--out', 'page.html');
writeFileSync(out, readFileSync(shellPath, 'utf8').replace('<!--BODY-->', () => body(data)));
console.log(`${out}  ${data.findings.length} findings, ${data.seats.length} seats`);
