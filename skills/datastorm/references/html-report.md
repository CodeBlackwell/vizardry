# Building the report

The deliverable is one self-contained HTML file in which **every option carries a live worked
example built from the real data**. That is the whole difference between a list of chart names
and a report someone can act on — and it is also the only honest way to write the failure-mode
field, because you find out what the chart actually does by drawing it.

Everything ships inlined: the libraries, the data, the styles, the charts. No fetch, no CDN, no
network. The page works from a `file://` path, from an email attachment, and under the Artifact
CSP, which blocks every external host.

## The five files

Work in a scratch directory. Only the last one leaves it.

| file | what it is |
|---|---|
| `prep.py` | reads the dataset, writes `chartdata.json`. Dataset-specific; you write it. |
| `page.html` | the document. Copy `assets/page.html` and fill it in. |
| `charts.js` | one render function per example, in a registry. You write it. |
| `chart-kit.js` | the runtime. Ships in `assets/`; do not rewrite it. |
| `build.mjs` | the assembler. Ships in `assets/`; do not rewrite it. |

```bash
python3 prep.py                       # -> chartdata.json
node <assets>/build.mjs ../<name>-brainstorm.html
```

Rebuilding is one command, so rebuild constantly. Every fix below was found by looking at the
page, not by reasoning about it.

## prep.py — compute in Python, draw in JavaScript

Every aggregate the page shows gets computed once, here, and lands in `chartdata.json`. Nothing
is recomputed in the browser and nothing is typed in by hand.

```python
D = {}
D['meta'] = dict(rows=int(len(df)), levels=LEVELS, groups=GROUPS)
D['c1']   = [dict(k=g, med=int(sub.value.median()), n=int(len(sub))) for g, sub in df.groupby('group')]
json.dump(D, open('chartdata.json', 'w'), separators=(',', ':'))
```

Two rules that matter more than they look:

- **Round in Python, never in the browser.** `int()` truncates; the prose says 68,088 and the
  chart says 68,087, and someone eventually notices. Use `round()`.
- **Ship the raw rows too** when any example plots individual points — a compact array of arrays
  plus a column-index map, not 5,000 objects. Rows carry the outliers, and outliers are usually
  the finding.

If an example needs a derived quantity, derive it here and name it in the option's Encoding
field. A robust peer residual, for instance, is a transform the reader has to be told about:

```python
g = df.groupby(['country', 'level']).salary
df['z'] = (df.salary - g.transform('median')) / g.transform(lambda s: s.quantile(.75) - s.quantile(.25))
```

## page.html — the document

`assets/page.html` carries the layout, the card anatomy, the theme wiring and the token names.
Fill every marker in it. What you supply beyond the prose:

- **The name.** Two to four words, specific to this dataset, in both the title tag and the
  masthead. It is how the page is identified in a list of many.
- **The palette.** Eight hues, marked at the top of the token block. **Re-pick them for the
  subject** — the sample values are one report's answer, and reusing them makes every dataset
  look like the same dataset. Then validate rather than eyeball, with the `dataviz` skill's
  `scripts/validate_palette.js`. The accent and warm hues double as the diverging poles, so that
  pair needs the widest separation under simulated color-vision deficiency.
- **The rail.** One line per option, grouped by band, with the ranked three pinned at the top.
  It is the table of contents for a page that is genuinely long.

Order is an argument. The profile table, the effect sizes and the correlation structure come
**before** the options, because they are what decides which options are honest. A constraint that
kills a whole chart family — no temporal column, a dimension that swamps every other — goes in a
callout above the table, not in a closing note where it arrives too late to help.

## charts.js — the examples

```js
var K = window.VZ, P = K.P, D = window.CD;
var R = {};

R.c1 = function (el) {
  var F = K.frame(el, 840, 320, { t: 12, r: 24, b: 34, l: 120 });
  var x = d3.scaleLinear().domain([0, d3.max(D.c1, function (d) { return d.med; })]).range([0, F.iw]);
  K.grid(F.g, x, F.ih);
  K.axisBottom(F.g, x, F.ih, null, function (t) { return t / 1000 + 'k'; });
  var bars = F.g.selectAll('rect').data(D.c1).join('rect') /* ... */;
  K.hov(bars, function (d) { return '<b>' + d.k + '</b><br>n = ' + d.n; });
};

K.boot(R);   // last line
```

`chart-kit.js` supplies `frame` and `canvas`, `grid` / `axisBottom` / `axisLeft`, the tooltip
(`hov`, `show`, `hide`), the controls (`ctrl`, `btns`), the keys (`legend`, `rampKey`), the
palette object `P`, and `fgOn`. Read it once before writing the first chart; nearly every helper
there exists because the fourth chart needed it.

Working inside that harness:

- **Colors come from `P`, never as hexes.** `P` is filled from the page's CSS tokens, and `boot`
  redraws on a theme change, which is what makes one chart file serve light and dark.
- **`P.seq(t)` for magnitude, `P.div(t)` for polarity** with `t` in [-1, 1] and a neutral middle.
- **Text on a saturated fill uses `K.fgOn(fill)`**, not a fixed threshold — the middle steps of
  every ramp are where a fixed threshold gets it wrong.
- **Fixed widths, not a resize observer.** The charts are documents, not a responsive app. Give
  each one a width in the 640-880 range; the `.chart` wrapper scrolls if it overflows.
- **Canvas past a few thousand marks** — a SPLOM, parallel coordinates, a Voronoi field. SVG for
  everything else, so hover targets stay free.
- **Every example gets a tooltip.** It is the interaction that costs nothing and answers "what
  exactly is this mark".

## Rules the page has to hold to

- **No hardcoded findings.** Everything drawn traces to `chartdata.json`. A legend that states
  which classes are empty must *compute* which classes are empty; hand-writing it is how a report
  ships a claim its own chart contradicts.
- **The example must agree with the fields.** If the option's text sets a floor of n=10, the
  chart draws no cell below n=10. A mismatch here reads as carelessness about the data.
- **The caption says what the chart turned out to say**, not what it shows. "Row-normalizing
  makes it flat" and "row-normalizing makes every row show the same gradient" are different
  claims, and only one of them is what happened.
- **Draw the no-data state.** Empty cells, unmapped regions and structural zeros get their own
  visible fill, never the lightest step of the ramp.
- **Numerals in mono, with tabular figures.** Digits in a column that do not line up undo the
  impression that anything here was measured.
- **Wide things scroll inside their own box.** Tables live in a `.tw` wrapper, charts in a
  `.chart` wrapper, both with `overflow-x: auto`. The page body never scrolls sideways.

## Verifying it

Open the built file and **look at it**. Then paste this into the console — it catches the four
things that are invisible in a screenshot:

```js
const nodes = [...document.querySelectorAll('[data-chart]')];
console.log('charts drawn:', nodes.filter(n => n.querySelector('svg,canvas')).length, '/', nodes.length);
console.log('failed:', nodes.filter(n => !n.querySelector('svg,canvas')).map(n => n.dataset.chart));
console.log('too wide:', nodes.filter(n => n.scrollWidth > n.clientWidth).map(n => n.dataset.chart));
console.log('body overflow:', document.body.scrollWidth - innerWidth);
console.log('mojibake:', (document.body.innerText.match(/Ã.|â/g) || []).length);
```

Then walk the page: label collisions, clipped axis text, marks pushed outside their frame, and a
category name too long for the margin it was given. Toggle to dark and check the second theme
resolved as a set. Click every control; a button that renders and does nothing is worse than no
button.

**Do not verify by driving a browser in a background tab.** Chrome throttles paint and animation
frames there, so screenshots come back blank and a scripted scroll plus a frame wait can hang
outright. Scroll with real input events, and read the numbers above rather than trusting an image.

## Delivering it

Publish the page as an Artifact and hand the user the URL alongside the local path. The file is
self-contained, so it needs no capabilities and nothing external is fetched.

Then say, in a few lines: the top recommendation, anything the examples changed about the
analysis, and anything left unverified. **Corrections belong here.** Building the charts routinely
overturns a number that was written before they existed — that correction is the most valuable
thing on the page, and burying it wastes it.
