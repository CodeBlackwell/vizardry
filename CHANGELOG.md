# Changelog

All notable changes to the Vizardry plugin. Versions are git tags on the
[vizardry](https://github.com/CodeBlackwell/vizardry) repo; this file ships with the plugin.

## 1.5.0 — 2026-08-24

- Install instructions, a quickstart, and platform requirements in the README.
- A bundled sample dataset (`skills/datastorm/sample/earthquakes.csv`, 400 quakes from the
  USGS catalog) so a first `/datastorm` run needs no data of the user's.
- The three verifiers preflight their toolchain: a missing dependency now answers with the
  exact `npm install` to run instead of a module-resolution stack trace.
- CI on the shipped repo: every file is re-hashed against `manifest.json`, retrieval answers
  a request, and one exemplar verifies end to end (esbuild, tsc, jsdom render) on Linux.
- `/stormclips` checks for Chrome and `ffmpeg` up front and tells the user what to install —
  they are prerequisites of that skill only, and no other skill asks for them.
- `/datastorm-parallel`: an option's meta can no longer be declared but unsatisfiable, which
  had the repair ladder paying for model attempts it could never pass.
- This changelog.

## 1.4.0 — 2026-08-22

- `/data-docket`: grills a dataset owner into a written record of what the data can honestly
  be asked — surfaces, denominators, honesty conditions, dead ends. `/datastorm` reads it as
  guiding context, never as a chart list.
- `/datastorm-parallel` defaults its builders to the session model instead of a pinned one.

## 1.3.0 — 2026-08-22

- The gap wave: 15 new dataset-taking original charts, bringing the corpus to 212 exemplars.
- The plugin version is stamped into `plugin.json` from the build, so an installed copy is
  identifiable.
- `/datastorm-parallel`: fixed the option-spec handoff between the gate and the builders.

## 1.2.0 — 2026-08-18

- First tagged release. `/datastorm`, `/datastorm-parallel`, `/stormclips`, the chart skill,
  197 exemplars with retrieval, and the three verifiers.
- The report verifier gates the whole page contract; the palette validator gates CVD and
  contrast; the datastorm eval ran green on the release bar.
- The live demo report at vizardry.codeblackwell.ai.
