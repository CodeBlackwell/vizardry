---
name: datastorm
description: Brainstorm visualization options for a dataset — conventional through creative and abstract — grounded in the measured shape of the data, and delivered as a self-contained HTML report in which every option is drawn live from the real data. Use when someone has data and does not yet know what to draw, asks "how should I visualize this", wants more options than the obvious bar chart, or wants to find the deeper insight hiding in a table.
---

# Datastorm

Given a dataset, produce **a report page**: a wide, ranked field of ways to draw it, each one
traced back to something measured in the data rather than to a chart-type list, and each one
**shown as a live chart drawn from the real data**.

The failure this exists to prevent is the three-option answer — bar, line, scatter — which is what
a reader gets when the recommender never looked at the data. Breadth is the product. So is depth:
an option nobody can act on is not an option.

The worked examples are what keep the second half honest. An option that is only described can
claim anything; an option that is drawn either works or visibly does not, and the difference
shows up in its own failure-mode field.

## The procedure

### 1. Get the data shape

**If the user described the shape, use their description** and say so in the report. Do not go
looking for a file to contradict them.

**If they did not, retrieve it.** Look for the dataset before asking for it:

```
*.csv *.tsv *.json *.ndjson *.parquet *.db *.sqlite
data/  datasets/  fixtures/  public/data/  notebooks/
```

Pick the largest plausible candidate, or ask which one when several are equally likely. Then
**profile it by reading it**, never by inferring from the filename:

```bash
# Columns, types, cardinality, missingness, range — the five facts every later step needs.
python3 -c "
import pandas as pd, sys
df = pd.read_csv(sys.argv[1])
print(df.shape)
for c in df.columns:
    s = df[c]
    print(f'{c:24} {str(s.dtype):10} uniq={s.nunique():<7} null={s.isna().mean():.1%} '
          f'{repr(list(s.dropna().unique()[:3]))[:60]}')
" path/to/data.csv
```

Any equivalent works — `duckdb`, `jq` over JSON, a node script. What matters is that every number
in the report came from the file.

**If the data cannot be read at all** — no file, a binary format with no reader, a URL behind
auth — stop and say so. Then offer to proceed from a shape the user describes. Never invent a
profile; a brainstorm built on a guessed schema recommends charts the data cannot support, and
that is worse than no brainstorm.

### 2. Type every column

Assign each column exactly one role. This vocabulary is what the option space is indexed on:

| role | test | what it unlocks |
|---|---|---|
| **quantitative** | arithmetic is meaningful | position, length, area, thickness, color ramp |
| **temporal** | orderable dates or times | the x axis, animation frames, cyclic wrapping |
| **ordinal** | ranked categories | position along a meaningful order, sequential color |
| **nominal** | unranked categories | grouping, faceting, categorical color, adjacency |
| **geographic** | lat/lon, country/state codes, place names | projections, choropleths, spatial adjacency |
| **hierarchical** | a parent key or a path-like string | containment, nesting, radial partition |
| **relational** | source and target both name rows | node-link, matrix, ribbons |
| **textual** | free prose | frequency, occlusion-packed layout — usually a last resort |
| **identifier** | unique per row, no meaning | never encode it; use it for hover identity |

Record for each: **cardinality**, **range or extent**, **missingness**, and **skew** for
quantitatives. These four decide more than the type does. A nominal column with 4 values takes
categorical color; the same column with 400 values takes a search box and no color at all.

Then record the **grain**: what one row is. "One patent lawsuit", "one country-year", "one sensor
reading". Getting this wrong is the single most expensive error available here, because every
option downstream inherits it.

### 3. Write the shape signature

One line naming the combination, because the combination is what has options, not the columns
individually:

```
1 temporal x 1 quantitative x 1 nominal(12) — 8,400 rows, grain = country-month
```

Look this up in `references/shape-to-options.md`, which maps signatures to families across all
three bands. **That reference is a floor, not a ceiling.** Read it, then keep going.

### 4. Generate options in three bands

Aim for **12 to 20 total**, distributed roughly:

- **Conventional (4-6)** — what a competent analyst draws first. These are not filler. One of
  them is often the right answer, and naming them is what makes the abstract ones credible.
- **Analytical (4-8)** — a transform of the data earns the chart: rank instead of value,
  deviation from a baseline, distribution instead of mean, a derived rate, a second axis, a
  matrix instead of a node-link, one panel per category.
- **Creative / abstract (4-6)** — encodings that reward attention: radial and cyclic layouts,
  physical metaphors, packing and tessellation, ordering as the message, sonification-adjacent
  time replay, deliberate distortion like a cartogram. Every one still has to be **readable and
  honest**. An abstract option that cannot be decoded is decoration, and the report should say so
  rather than list it.

**Each option gets all nine of these.** An option missing any of them is not thought through:

1. **Name and family** — what it is called, so the user can search for more of it.
2. **The question it answers** — phrased the way the user would ask it out loud. If two options
   answer the same question, one of them is redundant; cut it or sharpen it.
3. **Encoding** — which column goes to which channel, explicitly. `x = month, y = cumulative
   deaths, color = country, thickness = population`.
4. **Why this data supports it** — cite the profile. "12 nominal values fits a categorical scale";
   "the 40x40 relational grain is a hairball as node-link"; "3% missingness means gaps, not zeros".
5. **Color** — the specific scale and why. See `references/color-and-motion.md`.
6. **Interaction and animation** — what changes the reader's understanding, not what moves. Also
   see that reference. A static option is allowed, but it has to be defended.
7. **Failure mode** — the condition under which this chart lies or collapses. Overplotting past N
   points. A category count that outruns the palette. A log axis that hides a zero. Simpson's
   paradox in an aggregate. **Every option has one.** An option listed without a failure mode is
   the one that will be built and then quietly abandoned.
8. **Exemplar** — a chart id from the sibling corpus, so the user can go straight to working code.
9. **A worked example** — the chart itself, drawn from this dataset, on the page. Not a mockup and
   not demo data. This is the field that fails loudest: an option whose example cannot be drawn is
   an option that was never real, and finding that out here is the point.

### 5. Find the exemplars

The `d3-react-charts` skill ships 181 self-contained charts with a retrieval index. Use it:

```bash
node ../d3-react-charts/bin/retrieve.mjs "rank changes between seasons" --top 5 --why
```

Paths, whichever layout is on disk:

| | retrieval | catalog to browse |
|---|---|---|
| installed plugin | `../d3-react-charts/bin/retrieve.mjs` | `../d3-react-charts/catalog/digest.md` |
| this repo | `bin/retrieve.mjs` | `docs/digest.md` |

Retrieval returns neighbours, not answers. When nothing close exists, **say the corpus has no
exemplar** and name the closest relative anyway. A wrong exemplar costs more than a missing one.

### 6. Rank, and commit to a recommendation

Close with a ranked short list — **top 3, in order, with the reasoning** — and one sentence on
what the user should build first. A brainstorm that ends in twenty equal options has handed the
hard part back.

Also list **what was considered and rejected**, with the reason. This is the part that proves the
space was actually searched, and it stops the same dead end being proposed again next week.

### 7. Build the page

**Read `references/html-report.md` before writing a line of it.** It is the build procedure: the
five files, the assembler, the layout contract, and the failures that are only visible once the
page is rendered. `assets/` ships the document shell, the chart runtime and the assembler, so the
work is the prose, the aggregates and the twelve to twenty render functions — not the scaffolding.

Expect the examples to change the analysis. A ranking flattens once it is drawn, a matrix turns
out to be mostly empty, a number written before the chart existed turns out to be wrong. Fix the
text when that happens, and say so when you hand the page over.

## Output

**One self-contained HTML file**, `<dataset>-brainstorm.html`, in the user's working directory
unless they name a path. Libraries, data, styles and charts are all inlined; nothing is fetched.
Sections, in order:

```
The data                 profile as measured: grain, rows, the column table from step 2, and
                         the effect sizes and correlation structure as charts
Shape signature          one line, plus what it rules in and out
Recommended              top 3 ranked, with the reasoning, and what to build first
Conventional             4-6 option cards, nine fields each
Analytical               4-8 cards
Creative / abstract      4-6 cards
Considered and rejected  with reasons
Notes on the data        anything found while profiling that changes what is drawable —
                         missingness, outliers, a suspicious grain, a column that is
                         secretly an identifier
```

Publish it as an Artifact and give the user the URL alongside the path, then the top
recommendation, what the examples changed, and anything left unverified. Do not paste the file
back.

Write the markdown version only if the user asks for one. The page is the report.

## Rules

- **Measured, not assumed.** Every claim about the data traces to the profile. If a number was
  not measured, do not write it. The same rule binds the examples: nothing on the page is a
  hardcoded finding, and a chart that states which cells are empty computes which cells are empty.
- **Every option is drawn.** A described option is a claim; a drawn one is a result. If an option
  cannot be drawn from this data, it is not an option — move it to the rejected list and say why.
- **Color and motion by default.** A static grayscale option needs a reason — print, a tiny
  multiple, a deliberately quiet reference chart. See `references/color-and-motion.md`.
- **The abstract band is not a licence to be unreadable.** Novelty that costs decoding accuracy
  is a downgrade. Say which abstract options trade accuracy for engagement, and by how much.
- **No chart the data cannot support.** A geographic option needs a geographic column. A network
  option needs a real edge list. Wanting one is not having one.
- **Name the transform.** If an option needs the data pivoted, ranked, binned, joined or
  aggregated first, write that step down. An option whose input does not exist yet is a project,
  not a chart, and the user deserves to know which is which.
