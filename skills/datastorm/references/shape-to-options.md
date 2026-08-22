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
| analytical | moving average with the raw series behind it `moving-average`; band of uncertainty `band`; Bollinger envelope `bollinger`; year-over-year index to 100 `index-chart`; first difference or growth rate `change-line`; deviation from a trend `difference`; a fitted trend over noisy anomalies `temperature-trends`; annotate the exogenous events on the series `nz-tourists`; distribution of the *changes* rather than the levels `histogram` |
| creative | calendar heatmap, which turns the axis into a grid and exposes weekday structure `calendar`; horizon chart, which trades vertical space for density `horizon`; radial year wrap for anything seasonal `radial-area`; the line colored by its own value `gradient-encoding`; a live replaying edge `realtime-horizon` |

**Watch:** irregular sampling drawn as an even line, and gaps drawn as zeros. `line-missing` and
`area-missing` exist for exactly this. A series longer than the viewport can pan `pannable-chart`.

## 1 T x 1 Q x 1 N — many series over time

| band | families |
|---|---|
| conventional | multi-line `multi-line`, small multiples `methods-of-comparison`, stacked area if the parts sum to a meaningful whole `stacked-area`, `music-format-revenue` |
| analytical | normalized stack for share rather than level `normalized-stacked-area`, `us-population-by-state`; index every series to a common start `index-chart`; slope chart for exactly two periods `slope`, a few ordered stages `survival-rates`; heatmap the T x N grid when N is large `electric-usage`, `impact-of-vaccines`, `population-by-age`; ridgeline when the series are distributions `ridgeline`, `psr-b1919-21`; horizon stack when N is large `horizon`; one row per series as a sparkline table |
| creative | streamgraph with a centred baseline `streamgraph`; animated rank race `bar-chart-race`; overlay the years as one cycle per line `sea-ice-extent`; connected scatterplot when two Qs move together over time `connected-scatterplot`; temporal force layout when membership changes `temporal-force-graph`; the transition itself as the chart `streamgraph-transitions` |

**Watch:** stacking hides individual shape above the first band. Past roughly 8 series a
categorical palette stops working — see `color-and-motion.md`.

## Intervals — a (start, end) per row

| band | families |
|---|---|
| conventional | timeline bars on a shared axis `world-history-timeline` |
| analytical | sort by start, then by duration — each ordering answers a different question; overlap count over time as its own chart |
| creative | time-distance diagram when the rows travel a shared route, so slope is speed `mareys-trains` |

**Watch:** rows sorted alphabetically bury the scheduling structure that is usually the point.

## 2 Q — two measures

| band | families |
|---|---|
| conventional | scatterplot `scatterplot`, with shape or color for a third `scatterplot-shapes` |
| analytical | regression or LOESS overlay; residuals as their own chart; hexbin when overplotted `hexbin`, with cell area as the count `hexbin-area`; density contours `density-contours`; QQ against a reference `qq-plot`; marginal distributions on the axes |
| creative | Voronoi cells for hover targets and structure `us-airports-voronoi`; beeswarm when one axis is really a category `beeswarm`; phase portrait when both Qs evolve in time `predator-and-prey`; a domain-loaded scatter where the axes carry meaning of their own `hr-diagram` |

**Watch:** past ~2,000 points a scatter is a blob. Bin, contour, or make opacity do work.

## 1 Q x 1 N — a measure per category

| band | families |
|---|---|
| conventional | bar `bar`, horizontal bar when labels are long `horizontal-bar`, dot plot `dot-plot`, pie `pie` or donut `donut` when the parts sum to a whole and N is small |
| analytical | sort by value, which is usually the entire insight; diverging around a reference `diverging-bar`; Pareto with a cumulative line; range plot when there are two values per row `inequality-in-cities`; distribution per category instead of a mean `box-plot`, `beeswarm-mirrored`; when N is too large to read, zoom the band axis `zoomable-bar-chart` |
| creative | treemap when the values are parts of a whole `treemap`; radial bars when the categories are cyclic `radial-stacked-bar`; packed circles `pack`, `bubble-chart`; Marimekko when width is also a measure `marimekko` |

**Watch:** a bar chart of means, when the distributions overlap, is the most common quiet lie in
this table.

## 1 Q x 2 N — a measure crossed by two categories

| band | families |
|---|---|
| conventional | grouped bar `grouped-bar`, stacked bar `stacked-bar`, horizontal when the outer labels are long `stacked-horizontal-bar` |
| analytical | normalized stack for share within each group `stacked-normalized-horizontal-bar`; diverging stack around a neutral midpoint when one N is ordered — the Likert answer `diverging-stacked-bar`; heatmap of the crosstab; facet one N and chart the other |
| creative | Marimekko when both margins carry a measure `marimekko`; radial grouped stack when the outer N is cyclic `radial-stacked-bar-grouped` |

**Watch:** grouped bars compare within a group; stacked bars compare totals. Choosing between
them *is* choosing the question — say which one the option answers.

## Many Q per row — multivariate

| band | families |
|---|---|
| conventional | scatterplot matrix `splom`, correlation heatmap |
| analytical | brushable SPLOM with linked selection `brushable-splom`; parallel coordinates with reorderable axes `parallel-coordinates`; PCA or UMAP into 2D, then color by a held-out column, or animate the projections as a tour `scatterplot-tour`; standardize before comparing |
| creative | radar per row when the measures are commensurate and few; parallel sets when the Qs are really categorical flows `parallel-sets` |

**Watch:** parallel coordinates depend entirely on axis order. If the order is not chosen, the
chart is arbitrary.

## 1 Q x G — a measure per place

| band | families |
|---|---|
| conventional | choropleth `us-state-choropleth`, county grain `choropleth`, `world-choropleth`; proportional symbols `bubble-map` |
| analytical | normalize by population or area before shading — a raw-count choropleth is a population map; bivariate choropleth for two measures at once `bivariate-choropleth`; spikes when the range is extreme `spike-map`; hexbin the points before aggregating `hexbin-map`; small multiples across time |
| creative | non-contiguous cartogram, sizing by the measure `non-contiguous-cartogram`; an unusual projection when the subject is oceanic or polar `spilhaus`, `projection-comparison`; a draggable globe `versor-dragging`; a guided tour of the regions `world-tour`; spherical Voronoi of the point sites `world-airports-voronoi`; zoom to a clicked region `zoom-to-bounding-box`; growth animated as a spreading front `walmarts-growth` |

**Watch:** area is not population. Almost every misleading map in the wild is a count shaded by
administrative polygon.

**Geo craft, when an option needs it:** bare outline `world-map`; graticule labeling
`graticule-labels`; antimeridian clipping `antimeridian-cutting`; projection distortion made
visible `tissots-indicatrix`; animated reprojection `projection-transitions`,
`ortho-to-equirect`. When the map is the sky: stars `star-map`, day-night `solar-terminator`,
the sun's seasonal path `solar-path`, a lunar calendar `phases-of-the-moon`.

## H — hierarchy

| band | families |
|---|---|
| conventional | tree `tree`, indented list `indented-tree`, treemap `treemap` |
| analytical | icicle for depth comparison `icicle`; hierarchical bars when only one level is in view `hierarchical-bar`; cluster layout when leaves should align `cluster`, radially `radial-cluster`; nested treemap to keep the grouping visible `nested-treemap`, `cascaded-treemap`; expand on demand when the tree is big `collapsible-tree` |
| creative | sunburst `sunburst`; zoomable sunburst or icicle so depth is navigable `zoomable-sunburst`, `zoomable-icicle`; circle packing `pack`, `zoomable-circle-packing`; radial tree `radial-tree`, at thousands of leaves `tree-of-life`; the hierarchy as a force layout `force-directed-tree`; the hierarchy over time `animated-treemap`; sequence sunburst for path analysis `sequences-sunburst`; a mathematical tree drawn as itself `stern-brocot-tree` |

**Watch:** radial layouts spend area on outer rings. They flatter breadth and punish depth.

## R — relationships

| band | families |
|---|---|
| conventional | node-link force layout `force-directed-graph`, arc diagram `arc-diagram` |
| analytical | adjacency matrix once the graph is dense — order the rows by cluster and the structure appears; chord for flows between a small fixed set `chord`, labelled `chord-labelled`, directed `directed-chord`, as a dependency wheel `chord-dependency`; edge types kept distinct on a directed graph `mobile-patent-suits`; Sankey when the flow is staged and conserved `sankey`; hierarchical edge bundling when the nodes have a natural grouping `edge-bundling`; degree distribution as its own chart |
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

## Q on a grid — a measured surface

| band | families |
|---|---|
| conventional | heatmap of the cells; contour bands over the grid `volcano-contours` |
| analytical | contours of a computed function rather than data `contours`; arrows when each cell carries a direction as well as a magnitude `vector-field` |
| creative | ridgeline the rows so the surface reads as a stack of profiles `psr-b1919-21` |

**Watch:** contour levels are bins — the bin-width caveat above applies with altitude.

## Text

| band | families |
|---|---|
| conventional | frequency bars, which beat a word cloud at nearly every task |
| analytical | TF-IDF against a reference corpus; term frequency over time as small multiples; co-occurrence as a network |
| creative | occlusion-aware word layout `word-cloud`, `occlusion` — engaging, and weak for comparison. Say so when proposing it |

## A procedure, not a table

When the subject is a process — a pipeline stage, a matching algorithm, a simulation, a queue —
the chart animates the run: precompute the whole trace, hold one step index in state. The
corpus's `Algorithms` category is entirely this move, grouped here by what the process does:

- **ordering:** `quicksort`, `quicksort-threads`, `mergesort`, `radix-sort`
- **searching and paths:** `string-search`, `pathfinding-compared`, `dp-wavefront`
- **sampling:** `uniform-sampling`, `best-candidate-sampling`, `poisson-disc-sampling`,
  `sampling-voronoi`, `reservoir-sampling`, `voronoi-stippling`
- **shuffling, and its bias:** `fisher-yates-shuffle`, `shuffle-bias`
- **structure growing:** `maze-random-traversal`, `maze-depth-first`, `maze-prims`,
  `maze-wilsons`, `maze-kruskals`, `maze-flood-fill`, `maze-tree`, `union-find`, `skip-list`,
  `huffman-coding`, `quadtree`
- **convergence:** `k-means`, `lloyd-relaxation`, `optimizer-race`
- **hashing and membership:** `bloom-filter`, `consistent-hashing`, `sieve`
- **constraint propagation:** `wave-function-collapse`
- **motion primitives, when an option needs one:** tweening an arc `arc-tween`, coupled
  rotation `epicyclic-gearing`, oriented agents `tadpoles`, generative texture `watercolor`

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
  the wrap exposes periodicity a linear axis buries. `radial-area`, `polar-clock`.
- **Show the process, not the result.** If the rows are steps of a procedure, animate the run and
  hold one step index in state — see "A procedure, not a table" above.
- **Craft primitives.** Styled axes `styled-axes`; label placement `voronoi-labels`,
  `centerline-labeling`; a standalone legend `color-legend`; the ramp catalog `color-schemes`;
  smallest enclosing circle `pack-enclose`.
