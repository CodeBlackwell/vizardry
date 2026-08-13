# Color and motion

**Color and interactivity beat static by default.** They add channels: color carries a variable
the position axes are already full of, and interaction lets one chart answer overview questions
and detail questions at once instead of forcing a choice.

They are also the two easiest things to spend without buying anything. Both sections below are
about which spend is real.

## Choosing the color scale

The scale follows the column's type, and getting this wrong is the most common color defect —
more common than a bad palette.

| the column is | scale | corpus default |
|---|---|---|
| nominal, <= 8 values | categorical | `d3.schemeObservable10`, `d3.schemeTableau10` |
| nominal, 9-20 values | categorical, but pair it with direct labels | see `direct-labels` |
| nominal, > 20 values | **not color.** Use position, faceting, or search-and-highlight | |
| ordinal or unipolar quantitative | sequential | `d3.interpolateBlues`, `Viridis` |
| quantitative with a meaningful midpoint | diverging, midpoint pinned to that value | `d3.interpolateRdBu` |
| cyclic — hour, angle, month | cyclic | `d3.interpolateRainbow`, used only here |

Rules that hold across all of them:

- **A diverging scale needs a real zero.** Diverging around the mean of the data is a decision
  disguised as a default, and the picture changes when a row is added.
- **Perceptually uniform, always.** Viridis, Cividis, Magma. A rainbow ramp on a quantitative
  column invents boundaries at the yellow and cyan bands that are not in the data.
- **Deuteranopia is ~8% of men.** Red-green as the only difference between two encoded states
  fails for a large minority of readers. Test the pair, or vary lightness as well as hue.
- **Bin a continuous ramp when the reader has to name a value**; keep it continuous when they
  have to see a gradient. Choropleths usually want quantile or Jenks bins, not a raw ramp.
- **Reserve one high-salience color for the subject** and desaturate everything else. A chart
  where twelve series are equally loud has no subject. `variable-color-line` and
  `threshold-encoding` show color doing work rather than decorating.
- **Color the mark, and label it too.** A legend costs a saccade; a direct label costs none.
  `direct-labels` and `inline-labels` are the corpus's answer.
- **Dark and light both.** Pick colors that survive both backgrounds, or the chart is broken for
  half its readers.

## Interaction that earns its place

Ask what question the interaction answers that the static chart cannot. If there is no such
question, it is a feature, not a finding.

| interaction | the question it answers | when it is the right call |
|---|---|---|
| hover / tooltip | "what exactly is this mark" | almost always, at effectively zero cost — `line-with-tooltip` |
| brush + linked highlight | "where do these points go in the other view" | multivariate, SPLOM, map-plus-chart — `brushable-scatterplot`, `brushable-splom` |
| zoom + pan | "what is inside this dense region" | anything overplotted or larger than the viewport — `zoomable-area`, `smooth-zooming` |
| drill-down | "what is this made of" | hierarchies, always — `zoomable-sunburst`, `zoomable-treemap` |
| filter / toggle | "what if I remove this group" | many categories, or a suspected confound |
| reorder / sort | "does an ordering reveal structure" | matrices, parallel coordinates, bar charts of many rows |
| search / find | "where is the row I care about" | past ~50 labelled marks, this replaces color |

**Overview first, zoom and filter, details on demand.** If an interaction is the only way to see
the main finding, the main finding is hidden. The default view has to carry the headline.

**Interaction is not a substitute for a second chart.** Two linked simple views usually beat one
view with four modes.

## Animation that earns its place

Animation is a strong signal and a small budget. Spend it on one of these three, and be suspicious
of anything else:

1. **Transition between two states of the same data**, so the reader tracks objects instead of
   re-reading the chart. Sorting, filtering, changing a measure, switching a grouping.
   `stacked-to-grouped`, `bar-transitions`, `pie-update`.
2. **Time as time.** When the temporal column *is* the subject and the reader should feel pace and
   ordering rather than scan an axis. `bar-chart-race`, `wealth-health`, `walmarts-growth`.
3. **A procedure running.** Sorting, sampling, traversal, simulation — where the algorithm is the
   subject and its intermediate states are the content. The entire `Algorithms` category.

Rules:

- **Animation on load, once, is decoration.** Nothing was compared.
- **Keep object constancy.** A mark must keep its identity across the transition or the eye has
  nothing to follow, and the animation actively costs comprehension.
- **Always give a scrubber.** Anything that autoplays needs pause and a step control, or the
  reader cannot re-examine the moment that mattered. Precompute the run as a trace and hold one
  step index in state, which makes scrubbing free.
- **150-500ms** for a state transition. Under 100ms is not perceived as motion; over a second the
  reader waits.
- **Respect `prefers-reduced-motion`** by rendering the end state directly.
- **The first frame must already say something.** A chart that starts empty and fills in is blank
  in every screenshot, every thumbnail and every server render.

## When static is right

Defend it, then use it. Legitimate reasons: print or PDF; a small multiple where the comparison is
across panels and per-panel interaction would break it; a reference chart that is deliberately
quiet next to a loud one; an audience reading a still image in a slide or a paper.
