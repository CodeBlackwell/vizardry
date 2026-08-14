# Vizardry

A Claude Code plugin for data visualization that holds up. It covers the whole arc: deciding
what to draw, drawing it in a dialect that survives React, and checking that what came out
actually works.

## What's in it

| | |
|---|---|
| **`/datastorm`** | Profiles a dataset — one you name, or one it finds and reads — and writes a self-contained HTML report: 12 to 20 options from conventional through creative, each with its encoding, color scale, interaction, failure mode, an exemplar to build it from, and **the chart itself, drawn live from the real data**. |
| **The dialect** | React owns rendering, D3 owns math. The routing rule, its five escape triggers, the component contract, and the React 18 hazards that do not exist in vanilla D3. Always in context. |
| **181 exemplars** | Every one a single self-contained `.tsx` file that renders on its own, takes its dataset as a prop, and embeds its own demo data. No network, no fetch. |
| **A verifier** | Source rules, `tsc`, and a real jsdom render over what the model wrote. Runs on any `.tsx` in any repo. |

The two skills compose: `/datastorm` decides what to draw and names the exemplar, the chart
skill builds it, the verifier says whether it holds up.

## Using the tools directly

```bash
npm install    # esbuild, jsdom, typescript

node skills/d3-react-charts/bin/retrieve.mjs "flows between stages over time" --why
node skills/d3-react-charts/bin/verify.mjs path/to/Chart.tsx
```

Charts under test resolve their own imports from your project, so the exemplars name their npm
prerequisites in their headers rather than pulling them in here.

## Provenance

Every exemplar is translated from a real notebook or gist — 173 ObservableHQ notebooks and
Mike Bostock's *Visualizing Algorithms* — and rewritten rather than ported: the sources are
compiled OJS and D3 v3, both dead in v7. Each one is held to the same render harness the
dialect describes, so the corpus and the rules cannot drift apart.

## This repo is generated

Built by `scripts/build-plugin.mjs` in the source gallery. **Edit there, not here** — a change
made in this repo is overwritten by the next build, and `manifest.json` carries a content hash
of every shipped file so a stale copy is detectable rather than silent.
