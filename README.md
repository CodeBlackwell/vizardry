# Vizardry

A Claude Code plugin for data visualization that holds up. It covers the whole arc: deciding
what to draw, drawing it in a dialect that survives React, and checking that what came out
actually works.

## Install

In Claude Code:

```
/plugin marketplace add CodeBlackwell/vizardry
/plugin install vizardry@vizardry
```

The skills work immediately. The verifiers need their toolchain once per install — the first
run tells you the exact directory to `npm install` in if it is missing.

## Quickstart

1. Install, as above.
2. In any repo, run `/datastorm` — name a CSV or JSON file, or let it find one. No data
   handy? Ask for the bundled sample, 400 quakes from the USGS catalog.
3. Open the report it writes. Every option on the page is a live chart drawn from the real
   data, ranked, with the failure modes stated.

## What's in it

| | |
|---|---|
| **`/datastorm`** | Profiles a dataset — one you name, or one it finds and reads — and writes a self-contained HTML report: 12 to 20 options from conventional through creative, each with its encoding, color scale, interaction, failure mode, an exemplar to build it from, and **the chart itself, drawn live from the real data**. |
| **`/datastorm-parallel`** | The same report with the worked examples built by concurrent agents through a gated pipeline — build, verify, independent review, repair — one builder per option, every fragment re-verified first-hand afterwards and every card judged by an agent that did not build it. The wall clock is the slowest option, not the sum of all of them. |
| **The dialect** | React owns rendering, D3 owns math. The routing rule, its five escape triggers, the component contract, and the React 18 hazards that do not exist in vanilla D3. Always in context. |
| **212 exemplars** | Every one a single self-contained `.tsx` file that renders on its own, takes its dataset as a prop, and embeds its own demo data. No network, no fetch. |
| **Four verifiers** | For charts: source rules, `tsc`, and a real jsdom render over any `.tsx` in any repo. For reports: the page's own scripts run in jsdom and the whole page contract is gated — every chart drew, all nine fields per option, exemplar ids, mojibake. For a single report chart: the same jsdom feedback on one `charts.js` fragment before the page around it exists — the loop `/datastorm-parallel`'s builders run, gating tooltips that actually fire, data adherence against the option's declared keys, palette membership and the animation policy. For a redline: every card field, every seat resolving against the mandate docket, the roll-up covering each change exactly once, and every numeral in the prose resolving to a value that was actually computed. |
| **`/redline`** | Runs downstream of a built report and turns its aggregates into policy changes routed to named seats: every finding carries the document it is written into, the office that signs it, and a magnitude labelled exact or estimated. Refuses without a mandate docket, because a change addressed to nobody is advice. |
| **The two dockets** | `/data-docket` grills a dataset's owner into what it can honestly be asked — the surfaces, the denominators, what may never be summed. `/mandate-docket` does the same for authority: who can impose, who can only recommend, and which documents they already owe. |
| **`/stormclips`** | Renders deterministic MP4 clips of a built report's chart cards: CDP virtual time steps every animation at an exact frame rate, so playback speed is a creative choice rather than a capture constraint. Needs `puppeteer-core`, Chrome, and `ffmpeg`. |

The skills compose: `/datastorm` decides what to draw and names the exemplar, the chart
skill builds it, the verifiers say whether it holds up, `/redline` turns the finished report
into changes someone has to answer for, and `/stormclips` takes it to video.

**See it before you run it:** [vizardry.codeblackwell.ai](https://vizardry.codeblackwell.ai)
carries a full `/datastorm` report built from the GitHub Innovation Graph at
[/report.html](https://vizardry.codeblackwell.ai/report.html), and one from the USGS
earthquake catalog at
[/earthquakes.html](https://vizardry.codeblackwell.ai/earthquakes.html).

## Requirements

- Node 18+. The verifiers' toolchain (`esbuild`, `jsdom`, `typescript`) comes from one
  `npm install` in the plugin checkout; each verifier checks for it and prints the exact
  directory when it is missing.
- `/stormclips` alone needs Chrome and `ffmpeg`, and asks for them when you run it. No
  other skill uses them.
- Assembling a report page resolves d3 from a `node_modules` above the working directory. A
  build inside a repo that has none — a Python tree, most often — needs one pointed at it.
- Developed on macOS, CI-verified on Linux. Windows is untested.

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
