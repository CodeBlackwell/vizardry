# Changelog

Notable changes, newest first. Format follows [Keep a Changelog](https://keepachangelog.com).
The gallery itself is a working repo, but the plugin it compiles into is versioned and tagged;
`package.json` is the single source of that version and `build-plugin.mjs` stamps it into
`plugin/.claude-plugin/plugin.json`. Entries carry both the version and the date.

## Unreleased

### Added
- **`/redline`**, a seventh skill that runs downstream of a built `/datastorm` report and turns
  its aggregates into policy changes routed to named seats. The unit is not a chart option but
  a change: each finding carries the document it is written into, the office that signs it, a
  magnitude labelled `exact` or `estimated`, and the sentence that kills it. Ten inefficiency
  shapes in `references/inefficiency-shapes.md`, ordered so that shapes interrogating the
  measuring instrument outrank shapes ranking the actors — those land on a document the
  recipient owns, and they name no private party.
- **`/mandate-docket`**, its precondition. The authority analog of `/data-docket`: who can
  impose, who can only recommend, who is named but out of reach, and which documents each seat
  already owes. `/redline` refuses to run without one, so the two ship together.
- **`verify-redline.mjs`**, a fourth verifier. Sixteen deterministic checks over `redline.json`
  rather than over the rendered page, because a gate that scrapes prose can be satisfied by
  prose. Card completeness, Owner and Written-into on every change, seats resolving against the
  mandate docket, refusals paired in both directions, the roll-up covering each change exactly
  once, the inventory reconciling, and **every numeral in the prose resolving to a value in
  `chartdata.json`**. That last one is an error here where `/datastorm`'s verifier warns: a
  policy change priced with a number nobody computed is the failure this genre dies of. A
  missing mandate docket is a hard error rather than a skipped check.
- **A citation exemption in the redline numeral gate, earned by the skill's first real run.**
  `Written into` names its document by section, so `DoDI 5000.97` is that field's ordinary
  content, and the gate was flagging it as an uncomputed figure. The exemption is narrow in both
  directions: a numeral passes only if it reads syntactically as a citation **and** the mandate
  docket declares that exact instrument. An undeclared instrument is still caught, and so is a
  measurement that happens to follow a capitalized word — so a hole became a check, and you may
  cite only what your docket names.
- **`/redline` step 7 now warns that convergence can be manufactured.** Two changes routed to
  "the guidance" merge into one roll-up row and read as agreement when neither was aimed. No
  check can see it — both entries are complete and the count reconciles — so the skill says to
  check it by hand.
- **`/redline` tuned against a three-arm eval**, its first cold runs: two agents given the whole
  skill and one given only the format doc, none able to see the human-written artifact for the
  same task. Every arm passed the gate and built a page, and the notes they were asked for found
  more than the deliverables did.
  - **The concentration sweep produced numbers its own gate rejected.** Step 3 is mandatory and
    computes top-1 shares; step 2 requires every numeral to exist in `chartdata.json`; a
    read-only substrate made the second impossible, so both skill arms had to downgrade every
    swept concentration to a raw pair. `--data` now repeats, because the rule is that a number
    passes through *a* file, not one particular file, and step 2 teaches the second file.
  - **The citation exemption broke on a trailing comma.** `DFARS 227,` failed where `DFARS 227
    and` passed, because the thousands-separator class ate the comma. It cost one arm its only
    failing check.
  - **The legal shapes are now printed on failure.** The ablation arm probed roughly 400 names
    against the gate, found three, and shipped ten cards carrying two shapes — not because two
    described them but because two was the whole vocabulary reachable without the shapes file. A
    closed vocabulary a writer cannot enumerate is a trap.
  - **The frame is numeral-checked now**, along with `reserve`, and `struck` entries have their
    charts gated. The format doc claimed the frame was checked and it was not read at all.
  - **Posture and shape spread print as signals.** A report that is all one shape has found one
    defect described five ways, which is worth knowing for the reason the posture count exists.
  - **Two flat contradictions are resolved**: context entries could not both carry "nothing else"
    and name the seat they would have needed, and the palette could not be both inherited and
    re-picked. Step 8 now says the shipped `page.html` is `/datastorm`'s brainstorm shell rather
    than a redline template, and records that `build.mjs` resolves d3 from a `node_modules` above
    the working directory.
  - **Step 7 no longer claims the inventory is mechanical unconditionally.** It is mechanical
    only when step 1 handed over an option list; without one it is authored, and the skill now
    says to declare that in the frame rather than let a reconciling count imply closure.
- **Sixteen broken fixtures and 24 tests**, one deliberate mutation per check class, mirroring
  `verify.test.ts` and `report.test.ts`. A verifier that cannot discriminate is worse than none,
  because it is believed.

## 1.5.0 — 2026-08-24

### Added
- **Install instructions, a quickstart, and platform requirements in the README** — the two
  `/plugin` commands, a three-step first run, and the per-skill scope of every prerequisite.
- **A bundled sample dataset**, `skills/datastorm/sample/earthquakes.csv` (400 quakes from
  the USGS catalog), offered by `/datastorm` when a repo has no data — a first run needs
  nothing of the user's.
- **CI on the shipped vizardry repo**, independent of this gallery: every file re-hashed
  against `manifest.json` with orphan detection, retrieval answering a request, and one
  exemplar verified end to end (esbuild, tsc, jsdom render) in a bare project on Linux.
- **This changelog now ships with the plugin.**
- **A third build state, `blocked`.** A chart that draws, is correct, and is green but for one
  check its own fragment cannot influence had no honest word for itself: `built` was false and
  `failed` threw the work away. `blocked` keeps the file on disk, sends it through the same
  independent review, and returns it for the main context to adjudicate. The repair brief knows
  about it too, so a blocked card is never told to chase an exit code it cannot reach.
- **`verify-option.mjs --check-keys`**, a preflight that resolves every spec's `dataKeys`
  against `chartdata.json` with no fragment and no jsdom — a set difference, every spec at
  once, in milliseconds. GATE-SPECS always claimed a missing aggregate cost one line there and
  a whole builder after; that was only true once it could be checked. It refuses to run with
  nothing to check rather than reporting a vacuous pass, and its `jsdom` import is now lazy so
  the preflight runs anywhere.

### Changed
- **The three verifiers preflight their toolchain**: a missing `esbuild`, `jsdom` or
  `typescript` now answers with the exact `npm install` to run — directory included — instead
  of a module-resolution stack trace.
- **`/stormclips` checks for Chrome and `ffmpeg` before establishing anything else** and tells
  the user what to install. They are prerequisites of that skill only; no other skill asks.
- **`/datastorm-parallel`'s wall-clock claim is stated with its condition.** "The slowest
  option rather than the sum" holds only while the option count fits the concurrency cap of
  `min(16, CPUs - 2)`, which reviewers and repairs also draw on; past roughly a dozen options
  the cap sets the clock. Now written as `max(slowest chain, total agent time / cap)`.
- **The report is named at GATE-SPECS**, and where the profile or docket states the frame the
  data sits in, the name carries it. Renaming after delivery costs a rebuild and a republish.

### Fixed
- **`keys-declared` was unsatisfiable for any spec that declared `meta`, and it cost a real run
  five finished charts.** `verify-option.mjs` stripped `meta` from the recorded reads before
  *both* adherence comparisons, so a spec naming it could never satisfy the check: the chart
  read `D.meta`, the emitted evidence proved it, and the verifier still reported "declared but
  never read". Nothing in a fragment could change that, so five builders drew correct charts,
  diagnosed the harness honestly, climbed the whole model ladder to `opus`, and returned
  `failed` — and the main context rebuilt all five by hand. `meta` is now exempt in one
  direction only: never an undeclared extra, always a legitimate declaration. Measured on the
  run that surfaced it, **16 of 19 fragments read `meta` and every one was red** under the old
  rule; only five died because only five specs happened to declare it.
- **The model ladder escalated on failures no model could fix.** `build.workflow.js` treated
  every red as capability-limited and spent the next rung on it. It now compares the named
  checks a tier went red on against the previous tier's, and stops when they are identical —
  evidence the constraint binds rather than the model.
- **`plugin.json`'s description hardcoded "181 exemplars"** while the corpus stood at 212; the
  count is now templated from the catalog at build time.

## 1.4.0 — 2026-08-22

### Added
- **`/data-docket`**, a fifth plugin skill: grill a dataset's owner until every question they
  want to ask has ground under it, a query shape, a measurement with its n and frame, and a
  stated honesty condition — then write it down as a docket. It exists for the seven things a
  profile cannot measure: the decision behind a question, the grain in their words, proxies and
  label hazards, denominators that may never be mixed, counts that may never be totalled, which
  way thin data lies, and the dead ends. The interview is `/grilling`'s engine — design tree,
  frontier recomputed each round, a numbered question with a recommended answer under it, facts
  found rather than asked for, and no file written until the user confirms a shared
  understanding — pointed at a dataset, with this skill supplying the tree and the artifact.
  Three buckets rather than two, in the docket's own vocabulary: heard, admitted but not yet
  heard, dismissed with the reason recorded. Denominators are grouped by **frame**, so a
  re-measurement over a wider population coexists with the old numbers instead of overwriting
  them; questions **absorb** each other or demote to **evidence tiers** under stable,
  never-reused numbers; and a **"One chart, several questions"** section names the pairings
  whose panels are one picture, each stating the denominators those panels do not share.

### Changed
- **`/datastorm` gained a step 0** that reads a docket as **guiding context, never a
  specification**: it supplies vocabulary, real failure-mode fields and a head start on the
  rejected list, but never caps the option space. When the two disagree, the profile wins on
  facts and the docket wins on meaning. `/datastorm-parallel` reads one once in the main
  context and never ships it to builders, and its GATE-SPECS table gains a column naming the
  question each spec serves.
- **`/datastorm-parallel`'s model selection is no longer a hardcoded three-tier ladder by
  default.** `build.workflow.js` takes an optional `model` argument: omitted, every
  build/review/repair agent inherits the active session model; a model name (`opus`, `fable`,
  ...) pins every stage to it, no ladder; `'dynamic'` keeps the old band-driven cost ladder
  (conventional starts at haiku, everything else at sonnet, escalating on failure up to
  `opus`) under an explicit name instead of as the silent default.

## 1.3.0 — 2026-08-22

### Added
- **Gap wave: 15 dataset-taking chart families the corpus was missing** — violin, ecdf,
  lollipop, waffle, regression-overlay, residuals, error-bars, fan-chart, bump-chart,
  adjacency-matrix, correlation-heatmap, bullet-chart, waterfall, gantt, radar. 212 exemplars.
- **`/stormclips`**, a third plugin skill: deterministic MP4 clips of the charts in a built
  report.
- **`/datastorm-parallel`**, a fourth plugin skill: the datastorm report with its option cards
  built by concurrent agents through a staged, gated pipeline — Build with a strictly-upward
  model ladder, independent Review, conditional Repair — with one human gate at the spec list
  and the authoritative re-verify run first-hand by the main context afterward, so no builder
  certifies its own card.
- **`verify-option.mjs` grew from 5 checks to 12**: a tooltip that actually fires under a
  dispatched pointer event, data adherence against the option's declared `dataKeys`, palette
  membership against the live kit, and the animation policy (`transport-opts`, `tween-routing`,
  `hand-rolled-transport`). `--strict` hardens the tooltip for option cards; `--emit` writes the
  evidence the review stage judges. Calibrated across all 8 built reports, 117 fragments, zero
  false positives.
- **A/B eval harness** under `eval/datastorm/`: `run.mjs` generates candidates per arm and
  records cost, wall clock and per-model token usage; `grade.mjs` scores per arm and cuts
  `charts.js` into per-chart fragments for a rate rather than a binary verdict; `RUBRIC.md`
  gains a per-card craft dimension and a blinding requirement.
- **`hotels.csv`**, a fourth eval dataset: a seeded 3,000-row sample of the 119,390-row hotel
  booking demand data, 32 columns of genuinely mixed roles — 8 nominal, 9 quantitative,
  6 boolean, a composite arrival date, and real missingness (`company` 94% null).
- License provenance extended to all three corpora, plus an intake gate requiring a declared
  license before any new source enters the translation pool.

### Changed
- `shape-to-options.md` now cites every registry chart, with coverage enforced in both
  directions by a test.
- Gallery footer counts the registry rather than a stale notebook-corpus denominator.

### Fixed
- **`K.boot` threw on every verifier run, in both verifiers.** `chart-kit.js` guarded its
  `matchMedia` read in one place and not in the other; jsdom provides none, so the throw was
  swallowed by the virtual console while charts still drew. The theme-redraw path never
  registered, `K.RM` was always false, and the swallowed error polluted genuine failure detail.
- `no-hex` matched HTML character references, so tooltip arrows (`&#8594;`) read as hardcoded
  colors.
- **`/datastorm-parallel` could announce the fan-out and end its turn**, losing the workflow's
  return value and, in an unattended run, producing no report at all after paying full price
  for sixteen strict-green fragments. The skill now states that the return value gates every
  step after it.

## 1.2.0 — 2026-08-18

### Added
- Essay corpus: 16 original algorithm charts across four waves (pathfinding, wave function
  collapse, Bloom filter, Huffman coding, k-means, string search, and more). Corpus now
  197 charts.
- Datastorm chart kit playback primitives: `K.transport` (play/pause, scrubber, replay,
  opt-in loop, frame label, entrance composition), `K.speedCtrl` (0.1x to 10x select),
  `K.spd`, `K.tdur` (tween clamped to the frame interval), `K.RM`. Nothing autoplays or
  loops uninvited; prefers-reduced-motion kills every tween.
- Report-dialect exemplars `exemplar-chord-entrance.js` and `exemplar-transport-treemap.js`
  under `datastorm/references/`, demonstrating interruption-safe entrance choreography and
  the transport primitives by calling them.
- `tip-contrast` check in `verify-report.mjs` (now 12 checks): statically resolves both
  theme token blocks and fails tooltip text under WCAG 4.5:1, with a fixture mutation test.
- Animation and choreography authoring rules in `datastorm/references/html-report.md`:
  playback policy, entrance grammar, fixed frames of reference, label ink on saturated
  fills, chord occlusion cap, dual-encoding captions, baseline toggles.
- Vizardry landing page under `landing/`.

### Changed
- Transport timestamp made unmissable: the frame label renders as a `.stamp` pill (bold,
  accent ink, tabular numerals) beside the scrubber, and the scrubber track fills to the
  current frame via a `--p` custom property. Kit + report shell CSS.
- Animated treemap labels are numerate: a cell wide enough carries its share of the frame
  total beside the name (bold name, lighter share, re-set every frame, dropped before it
  overflows). Codified in `html-report.md` and `exemplar-transport-treemap.js`; the featured
  landing report rebuilt with both changes.

### Fixed
- Report shell tooltip title was hardcoded `#fff`, invisible on the light pill in dark
  theme; now `var(--surface-3)`, which inverts with the theme.
