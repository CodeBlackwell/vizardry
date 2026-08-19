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
  look like the same dataset. Then validate rather than eyeball, with the validator that ships
  beside the shell — run it once per theme, against that theme's surface:

  ```bash
  node <assets>/validate-palette.mjs "#00707E,#0090A0,#C2611A,..." --surface "#FFFFFF"
  ```

  Pass the mark hues in token order (accent, accent-2, warm, indigo, olive, flag, good — not
  flag-bg, which is a background tint). It gates on contrast against the surface, on
  near-identical pairs under common color-vision deficiencies, and on the diverging poles —
  the accent-2 and warm hues carry polarity alone, so that pair needs the widest CVD gap.
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
  every ramp are where a fixed threshold gets it wrong. Set that ink as an inline `style`,
  never a `fill` attribute: the shell's `svg text{fill:var(--ink-2)}` rule outranks a
  presentation attribute and silently eats it. Make the label bold so it survives the fill,
  and budget the fit for the weight — bold glyphs run ~6.9 px/char, not 6.4. Where a cell is
  wide enough, carry its share of the total beside the name (bold name, lighter share, re-set
  every frame) so the chart is numerate without the tooltip; drop the share, then the label,
  as the cell narrows.
- **Fixed widths, not a resize observer.** The charts are documents, not a responsive app. Give
  each one a width in the 640-880 range; the `.chart` wrapper scrolls if it overflows.
- **Canvas past a few thousand marks** — a SPLOM, parallel coordinates, a Voronoi field. SVG for
  everything else, so hover targets stay free.
- **Every example gets a tooltip.** It is the interaction that costs nothing and answers "what
  exactly is this mark".

## Animation and choreography

The animation policy is absolute: **nothing autoplays and nothing loops uninvited.** Every
animated example is pausable, scrubbable and replayable, and looping is a toggle the reader
presses. `K.transport(el, n, draw, opts)` is that whole surface — play/pause, scrubber, replay,
opt-in loop, a 0.1x-10x speed select and a timestamp stamp — so an animated chart writes exactly
one function:

```js
function draw(f, animate, entrance) { /* render frame f; tween when animate is true */ }
K.transport(el, NQ, draw, { label: function (f) { return Q[f]; }, step: 560 });
```

It lands on the final frame so the first thing seen is meaningful, kills every tween under
`prefers-reduced-motion`, and re-arms a mid-play speed change without losing the current frame.
The current position must be unmissable at every frame: `opts.label` renders as a stamp pill
pinned beside the scrubber, and the scrubber's track fills to the current frame — both come
free from the kit, so never add a second frame caption inside the chart.
Inside `draw`, tween durations go through `K.tdur(el, base, step)` — clamped to the frame
interval before the speed factor, so a tween can never outlive its frame at any speed — and any
hand-rolled delay divides by `K.spd(el)`. A chart with its own controls but no frames still
takes the speed select via `K.speedCtrl(bar, el)`.

What the frames themselves have to hold to:

- **Fix the frame of reference.** Scales fixed at the all-frame max, the cell set fixed and
  colors frozen across every frame — otherwise frames are not comparable and object constancy
  is lost. The same discipline applies to toggles: build rows and cells ONCE and tween positions
  on reorder or re-baseline, never rebuild, or the reader's eye loses its place.
- **Entrances are interruption-safe.** Tween with `attrTween` over geometry cached on the
  element, writing the interpolated value back each tick, so an interrupted animation hands its
  true on-screen geometry to the next one instead of snapping.
- **Entrance grammar follows the family.** A chord: arcs sweep angularly from zero width,
  staggered by group, then ribbons unfurl from a sliver at the source midpoint across to the
  target. A multi-line: draw-on staggered by a meaningful order — fastest final growth first —
  not by index. Compose an entrance with playback through `opts.entranceMs`: replay runs it at
  frame 0 and playback waits for it.

Two worked files beside this document show these patterns whole, calling the kit rather than
re-implementing it: `exemplar-chord-entrance.js` (the interruption-safe chord entrance on a
transport) and `exemplar-transport-treemap.js` (a transported treemap with frozen colors and
per-cell label ink).

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
- **A chord occludes past ~12-15 groups.** Ribbons bury each other and the chart stops being
  readable; crop to the top N and say so in the caption.
- **When color means two things, say so in one caption line.** Hue for one relation and gray
  for the other is a fine dual encoding only if the caption states the rule and the gray leg
  stays visible rather than fading to nothing.
- **Baselines are a claim; give the reader the other one.** A diverging chart whose baseline is
  arguable gets a baseline toggle; an indexed chart gets an absolute toggle. Keep the sort
  order invariant under the toggle, which is what lets the marks build once and tween values.
- **Numerals in mono, with tabular figures.** Digits in a column that do not line up undo the
  impression that anything here was measured.
- **Wide things scroll inside their own box.** Tables live in a `.tw` wrapper, charts in a
  `.chart` wrapper, both with `overflow-x: auto`. The page body never scrolls sideways.

## Verifying it

**Run the verifier first.** It executes the page's scripts in jsdom and gates the whole
structural contract — every chart drew, all nine fields per card, sections, rail, exemplar
ids, mojibake — with an exit code, so it runs headless and a FAIL is a build stop:

```bash
node <skill>/bin/verify-report.mjs report.html
```

Its warnings matter too: a large numeral in prose that is not in `chartdata.json` is usually a
number that was typed instead of computed.

jsdom does no layout, so what remains is the part only a browser shows. Open the built file,
paste this in the console, and walk the page:

```js
const nodes = [...document.querySelectorAll('[data-chart]')];
console.log('too wide:', nodes.filter(n => n.scrollWidth > n.clientWidth).map(n => n.dataset.chart));
console.log('body overflow:', document.body.scrollWidth - innerWidth);
```

Look for label collisions, clipped axis text, marks pushed outside their frame, and a category
name too long for the margin it was given. Toggle to dark and check the second theme resolved
as a set. Click every control; a button that renders and does nothing is worse than no button.

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
