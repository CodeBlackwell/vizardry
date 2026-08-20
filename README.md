# Vizardry

A Claude Code plugin for data visualization that holds up. It covers the whole arc: deciding
what to draw, drawing it in a dialect that survives React, and checking that what came out
actually works.

## What's in it

| | |
|---|---|
| **`/datastorm`** | Profiles a dataset — one you name, or one it finds and reads — and writes a self-contained HTML report: 12 to 20 options from conventional through creative, each with its encoding, color scale, interaction, failure mode, an exemplar to build it from, and **the chart itself, drawn live from the real data**. |
| **`/datastorm-parallel`** | The same report with the worked examples built by concurrent agents — one per option, each looping the per-option verifier until its chart is green — so the wall clock is the slowest option, not the sum of all of them. |
| **The dialect** | React owns rendering, D3 owns math. The routing rule, its five escape triggers, the component contract, and the React 18 hazards that do not exist in vanilla D3. Always in context. |
| **197 exemplars** | Every one a single self-contained `.tsx` file that renders on its own, takes its dataset as a prop, and embeds its own demo data. No network, no fetch. |
| **Three verifiers** | For charts: source rules, `tsc`, and a real jsdom render over any `.tsx` in any repo. For reports: the page's own scripts run in jsdom and the whole page contract is gated — every chart drew, all nine fields per option, exemplar ids, mojibake. For a single report chart: the same jsdom feedback on one `charts.js` fragment before the page around it exists — the loop `/datastorm-parallel`'s builders run. |
| **`/stormclips`** | Renders deterministic MP4 clips of a built report's chart cards: CDP virtual time steps every animation at an exact frame rate, so playback speed is a creative choice rather than a capture constraint. Needs `puppeteer-core`, Chrome, and `ffmpeg`. |

The skills compose: `/datastorm` decides what to draw and names the exemplar, the chart
skill builds it, the verifiers say whether it holds up, and `/stormclips` takes the finished
report to video.

**See it before you run it:** a full report built by `/datastorm` from the USGS earthquake
catalog is live at [vizardry.codeblackwell.ai](https://vizardry.codeblackwell.ai).

## Using the tools directly

```bash
npm install    # esbuild, jsdom, typescript

node skills/d3-react-charts/bin/retrieve.mjs "flows between stages over time" --why
node skills/d3-react-charts/bin/verify.mjs path/to/Chart.tsx
node skills/datastorm/bin/verify-report.mjs path/to/report.html
```

Charts under test resolve their own imports from your project, so the exemplars name their npm
prerequisites in their headers rather than pulling them in here.

## Provenance

The exemplars come from three corpora: 173 ObservableHQ notebooks and Mike Bostock's
*Visualizing Algorithms* gists — rewritten rather than ported, since the sources are compiled
OJS and D3 v3, both dead in v7 — plus 16 original charts written fresh from the algorithms
with no external source at all. Each one is held to the same render harness the dialect
describes, so the corpus and the rules cannot drift apart.

The source notebooks are ISC, Apache 2.0 and MIT licensed; the *Visualizing Algorithms* gists
are GPL-3.0; the originals have no source and carry no exposure. Nothing from any corpus is
redistributed here: every chart is a fresh React + D3 v7 implementation of the technique, and
the per-source license record lives in the gallery's `docs/provenance-licenses.md`.

## This repo is generated

Built by `scripts/build-plugin.mjs` in the source gallery. **Edit there, not here** — a change
made in this repo is overwritten by the next build, and `manifest.json` carries a content hash
of every shipped file so a stale copy is detectable rather than silent.
