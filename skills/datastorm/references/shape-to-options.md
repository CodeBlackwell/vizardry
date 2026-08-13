# Shape to options

Signatures on the left, families on the right, in three bands. **A floor, not a ceiling** — the
point of the brainstorm is what this table does not contain. Ids in `code` are charts in the
`d3-react-charts` corpus; retrieve them for working code.

Notation: `Q` quantitative, `T` temporal, `O` ordinal, `N` nominal, `G` geographic, `H`
hierarchical, `R` relational. `N(12)` means a nominal column with 12 distinct values.

---

## 1 T x 1 Q — one series over time

| band | families |
|---|---|
| conventional | line `line`, area `area`, bar over time `bar`, candlestick if OHLC `candlestick` |
| analytical | moving average with the raw series behind it `moving-average`; band of uncertainty `band`; Bollinger envelope `bollinger`; year-over-year index to 100 `index-chart`; first difference or growth rate `change-line`; deviation from a trend `difference`; distribution of the *changes* rather than the levels `histogram` |
| creative | calendar heatmap, which turns the axis into a grid and exposes weekday structure `calendar`; horizon chart, which trades vertical space for density `horizon`; radial year wrap for anything seasonal `radial-area`; a live replaying edge `realtime-horizon` |

**Watch:** irregular sampling drawn as an even line, and gaps drawn as zeros. `line-missing` and
`area-missing` exist for exactly this.

## 1 T x 1 Q x 1 N — many series over time

| band | families |
|---|---|
| conventional | multi-line `multi-line`, small multiples `methods-of-comparison`, stacked area if the parts sum to a meaningful whole `stacked-area` |
| analytical | normalized stack for share rather than level `normalized-stacked-area`; index every series to a common start `index-chart`; slope chart for exactly two periods `slope`; ridgeline when the series are distributions `ridgeline`; horizon stack when N is large `horizon`; one row per series as a sparkline table |
| creative | streamgraph with a centred baseline `streamgraph`; animated rank race `bar-chart-race`; connected scatterplot when two Qs move together over time `connected-scatterplot`; temporal force layout when membership changes `temporal-force-graph`; the transition itself as the chart `streamgraph-transitions` |

**Watch:** stacking hides individual shape above the first band. Past roughly 8 series a
categorical palette stops working — see `color-and-motion.md`.

## 2 Q — two measures

| band | families |
|---|---|
| conventional | scatterplot `scatterplot`, with shape or color for a third `scatterplot-shapes` |
| analytical | regression or LOESS overlay; residuals as their own chart; hexbin when overplotted `hexbin`; density contours `density-contours`; QQ against a reference `qq-plot`; marginal distributions on the axes |
| creative | Voronoi cells for hover targets and structure `us-airports-voronoi`; beeswarm when one axis is really a category `beeswarm`; a domain-loaded scatter where the axes carry meaning of their own `hr-diagram` |

**Watch:** past ~2,000 points a scatter is a blob. Bin, contour, or make opacity do work.

## 1 Q x 1 N — a measure per category

| band | families |
|---|---|
| conventional | bar `bar`, horizontal bar when labels are long `horizontal-bar`, dot plot `dot-plot` |
| analytical | sort by value, which is usually the entire insight; diverging around a reference `diverging-bar`; Pareto with a cumulative line; range plot when there are two values per row `inequality-in-cities`; distribution per category instead of a mean `box-plot`, `beeswarm-mirrored` |
| creative | treemap when the values are parts of a whole `treemap`; radial bars when the categories are cyclic `radial-stacked-bar`; packed circles `pack`; Marimekko when width is also a measure `marimekko` |

**Watch:** a bar chart of means, when the distributions overlap, is the most common quiet lie in
this table.

## Many Q per row — multivariate

| band | families |
|---|---|
| conventional | scatterplot matrix `splom`, correlation heatmap |
| analytical | brushable SPLOM with linked selection `brushable-splom`; parallel coordinates with reorderable axes `parallel-coordinates`; PCA or UMAP into 2D, then color by a held-out column; standardize before comparing |
| creative | radar per row when the measures are commensurate and few; parallel sets when the Qs are really categorical flows `parallel-sets` |

**Watch:** parallel coordinates depend entirely on axis order. If the order is not chosen, the
chart is arbitrary.

## 1 Q x G — a measure per place

| band | families |
|---|---|
| conventional | choropleth `us-state-choropleth`, `world-choropleth`; proportional symbols `bubble-map` |
| analytical | normalize by population or area before shading — a raw-count choropleth is a population map; bivariate choropleth for two measures at once `bivariate-choropleth`; spikes when the range is extreme `spike-map`; hexbin the points before aggregating `hexbin-map`; small multiples across time |
| creative | non-contiguous cartogram, sizing by the measure `non-contiguous-cartogram`; an unusual projection when the subject is oceanic or polar `spilhaus`, `projection-comparison`; a draggable globe `versor-dragging`; growth animated as a spreading front `walmarts-growth` |

**Watch:** area is not population. Almost every misleading map in the wild is a count shaded by
administrative polygon.

## H — hierarchy

| band | families |
|---|---|
| conventional | tree `tree`, indented list `indented-tree`, treemap `treemap` |
| analytical | icicle for depth comparison `icicle`; hierarchical bars when only one level is in view `hierarchical-bar`; cluster layout when leaves should align `cluster`; nested treemap to keep the grouping visible `nested-treemap` |
| creative | sunburst `sunburst`; zoomable sunburst or icicle so depth is navigable `zoomable-sunburst`, `zoomable-icicle`; circle packing `pack`, `zoomable-circle-packing`; radial tree `radial-tree`; sequence sunburst for path analysis `sequences-sunburst` |

**Watch:** radial layouts spend area on outer rings. They flatter breadth and punish depth.

## R — relationships

| band | families |
|---|---|
| conventional | node-link force layout `force-directed-graph`, arc diagram `arc-diagram` |
| analytical | adjacency matrix once the graph is dense — order the rows by cluster and the structure appears; chord for flows between a small fixed set `chord`; Sankey when the flow is staged and conserved `sankey`; hierarchical edge bundling when the nodes have a natural grouping `edge-bundling`; degree distribution as its own chart |
| creative | tangled tree for lineage `tangled-tree`; bilevel bundling `edge-bundling-bilevel`; a force layout that settles on interaction rather than on load `disjoint-force-graph` |

**Watch:** past ~150 nodes a force layout is a hairball that looks like insight. Matrix, or
aggregate to communities first.

## 1 Q — one distribution

| band | families |
|---|---|
| conventional | histogram `histogram`, box plot `box-plot` |
| analytical | KDE over the histogram `kde`; QQ against normal `normal-quantile`; ECDF; log scale when spanning orders of magnitude; bin-width sensitivity shown, not chosen silently |
| creative | beeswarm so every observation stays visible `beeswarm`; ridgeline across a grouping column `ridgeline`; violin when comparing shapes side by side |

**Watch:** bin width is a parameter, and a histogram with an unstated one is an assertion.

## Text

| band | families |
|---|---|
| conventional | frequency bars, which beat a word cloud at nearly every task |
| analytical | TF-IDF against a reference corpus; term frequency over time as small multiples; co-occurrence as a network |
| creative | occlusion-aware word layout `word-cloud`, `occlusion` — engaging, and weak for comparison. Say so when proposing it |

---

## Cross-cutting moves

These apply to almost any signature and are where most of the non-obvious options come from:

- **Change the unit.** Value to rank. Level to change. Count to rate. Absolute to per-capita.
  Observed to deviation-from-expected. Each is a different chart of the same table.
- **Change the grain.** Aggregate up, or drill down to one row per observation. The most common
  missed option is *stop averaging*.
- **Add a reference.** A baseline, a target, a previous period, a null model. A chart with
  nothing to compare against answers "what" and never "so what".
- **Facet.** One small panel per category beats one crowded chart more often than it does not.
- **Order as the message.** Sorting by value, by cluster, by seriation — the ordering is
  frequently the finding, not the layout.
- **Wrap the axis.** Anything cyclic — hour, weekday, month, angle, phase — can go radial, and
  the wrap exposes periodicity a linear axis buries.
- **Show the process, not the result.** If the rows are steps of a procedure, animate the run and
  hold one step index in state. The corpus's `Algorithms` category is entirely this move.
