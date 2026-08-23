---
name: datastorm-parallel
description: Run /datastorm with the option cards built by parallel agents through a gated pipeline — build, verify, independent review, repair — one builder per worked example, every card gated by the per-option verifier and judged by an agent that did not build it. Use when someone asks for a parallel or faster datastorm, or when a 12-to-20-option build should not serialize twenty verify-fix loops through one context.
---

# Datastorm, staged and gated

**This is /datastorm with one phase fanned out and gated, not a different product.** The
deliverable, the nine fields, the report contract and every content rule are the serial
skill's — read `../datastorm/SKILL.md` and `../datastorm/references/html-report.md` first, and
follow them everywhere this file is silent.

Two things change. **Who draws**: serially, twenty worked examples and their fix loops run
through one context, so chart fourteen's third repair blocks chart fifteen from starting. Here
each option gets its own agent and the wall clock becomes the slowest option rather than the
sum of all of them. **Who says it is good**: a builder no longer certifies its own card. Every
fragment is re-verified first-hand after the fan-out, and every card is judged by an agent that
did not build it.

The price is tokens: every builder carries the shared brief, and review adds roughly one more
agent per option. When the dataset is small or the option count is low, plain /datastorm is the
better trade.

If the Workflow tool is not available in the session, say so and run /datastorm serially rather
than imitating the fan-out with sequential agents.

## What the verifier now enforces

`../datastorm/bin/verify-option.mjs` is the gate, and it grew teeth. Beyond the original
`render-fn`, `drawn`, `no-nan`, `no-hex` and `no-raw-timers`:

- **`tooltip-fires`** dispatches a real pointer event over the data marks and requires `#tip` to
  fill. A `K.hov` bound to an empty selection reads fine in source and fails here. It is a
  warning by default and a failure under `--strict`, which is what an option card gets.
- **`keys-declared` / `keys-only`** record which top-level aggregates the chart actually read
  and compare them to the spec's `dataKeys`. This is what makes "everything drawn traces to
  `chartdata.json`" mechanical. `meta` is always allowed.
- **`palette-members`** fails any `P.<name>` the kit does not define — `P.accent` and
  `P.surface` look right and are `undefined` at runtime — and any `d3.scheme*`, which is fixed
  ink that never flips with the theme.
- **`transport-opts`, `tween-routing`, `hand-rolled-transport`** hold the animation policy: an
  explicit `opts.step`, durations through `K.tdur`, and no local reimplementation of the
  playback surface the kit already provides.

A legend warning fires when colour encodes a category and no key rendered.

## What stays sequential, and why

Steps 1 through 6 of the serial skill run unchanged, in the main context, before any agent
spawns — they are cheap, and they need one pair of eyes:

- **The data docket**, when there is one — read once here, never by a builder. Its
  guidance reaches the fan-out through the specs it shaped (the question wording and the
  failure-mode field), which is the whole of what a builder needs; shipping the file itself to
  sixteen agents buys nothing and costs its length every time.
- **Profile, column roles, grain, shape signature** — one pass over the data. Builders never
  re-read or re-profile the dataset; sixteen slightly different profiles is how a report
  contradicts itself.
- **The brainstorm** — one context generates all 12 to 20 specs, because two of the rules need
  cross-option vision: no two options answering the same question, and the band distribution.
  Each spec carries the nine fields in draft plus `dataKeys`: the named aggregates its example
  will draw from, which are also what the verifier checks it against.
- **`prep.py` and `chartdata.json`** — written after the brainstorm, computing every `dataKeys`
  entry the specs name. This is the builders' single source of numbers.
- **The palette** — picked once, validated with `../datastorm/assets/validate-palette.mjs`, and
  written into `page.html` before fan-out. Builders inherit it through `P`; none of them touches
  a colour value.

Ranking also stays out of the fan-out, but on the other side: the serial skill's rule is that
the examples change the analysis, so the top three are committed only after the workflow
returns, with every drawn result, defect and failure in view.

## GATE-SPECS

**Stop here and show the user the spec list before any builder spends a token.** One table: id,
band, the question, and `dataKeys`. This is the only gate in the run, and it is the last cheap
moment — a wrong option or a missing aggregate costs one line here and a whole builder after.

Check the band floors yourself while presenting, because nothing downstream does:
**conventional 4-6, analytical 4-8, creative-abstract 4-6**, 12 to 20 total.
`verify-report.mjs` only warns when a band is completely empty, so a band sitting one under its
floor ships silently otherwise.

When a docket guided the brainstorm, add a column naming the question each spec serves, or
`-` for the ones the profile found on its own. That column is the gate's real payload: it shows
at a glance which of the user's questions went unanswered, and it makes the `-` rows visible as
the deliberate excess they are rather than as drift.

Offer: approve all, cut or replace named options, or rebalance a band.

## The fan-out

Set up the scratch directory per `html-report.md` (`page.html`, `prep.py`, `chartdata.json`, the
kit beside them via the assembler's resolution), then run the shipped workflow:

```
Workflow({
  scriptPath: '<this skill dir>/build.workflow.js',
  args: { scratchDir, skillDir, specs, briefing, model }
})
```

- `scratchDir` — absolute path to the report build directory
- `skillDir` — absolute path to the **datastorm** skill (its `bin/`, `references/`, `assets/`)
- `specs` — the approved specs, each `{ id, band, dataKeys, ...nine fields }`
- `briefing` — the shared context: profile summary, grain, palette notes, data caveats
- `model` — optional. Look for a trailing `--model <name>` in the slash-command's arguments and
  forward it verbatim; omit the field entirely otherwise. **Omitted (the default):** every
  build/review/repair agent inherits the active session model, no override — the right choice
  unless the user asked for something else. **A model name** (`opus`, `sonnet`, `haiku`,
  `fable`, ...): every stage is pinned to that one model, no ladder. **`dynamic`:** the
  band-driven cost ladder — conventional options start at haiku, everything else at sonnet,
  escalating one rung on failure up to `opus` — the old default, still available by name.

It runs three stages per option, pipelined so option 3 can be in review while option 14 is still
building: **Build** (loop the verifier, escalate once up the model ladder if red and `model` is
`dynamic`, carrying the failed attempt's evidence), **Review** (a different agent judges the
drawn result against the rules the verifier cannot check), **Repair** (only cards with defects).

It returns `{ cards, failed, unreviewed }`, and **that return value is the input to every step
below.** The cards carry the prose written into the page; `failed` becomes the rejected rows;
`unreviewed` is the list you have to judge yourself. None of it can be reconstructed from the
files on disk, because the reviewer's defects were never written there.

**The workflow is not fire and forget, and this is the one place this skill has actually
failed.** The tool returns a task id immediately and the real result arrives later. Do not
announce that the fan-out is running and end your turn. Measured 2026-08-21 on a headless run:
the main context said it would pick back up once the fan-out completed, ended its turn, and the
process exited. All 16 builders ran to completion and passed the strict gate — and the run
produced no report at all, because nothing resumed to assemble one. It cost full price for
nothing.

So: stay in the turn until the workflow returns, and treat announcing progress as something you
do *while still working*, never as a handoff. There may be no one to hand off to. If you are
resuming a session where the fan-out already completed, the fragments on disk are real and
strict-green, but the cards are not — re-verify first-hand per step 1 and rebuild any card
prose you cannot recover.

## After the workflow

Back in the main context, deterministic work plus the one judgment call:

1. **Re-verify first-hand. This is the real gate**, and it is deliberately not inside the
   workflow — a builder reporting `built` is a claim, and the main context can run the tool
   itself:

   ```bash
   node <skill>/bin/verify-option.mjs <scratch>/option-*.js --data <scratch>/chartdata.json --page <scratch>/page.html --strict
   ```

   Anything red here is red regardless of what its card said.

2. **Check the fence.** Compare the scratch directory's file list against what it held before
   the fan-out. Each builder may write only its own `option-<id>.js`. A changed `prep.py`,
   `page.html` or `chartdata.json` means a builder reached outside its brief, and that card's
   numbers can no longer be trusted.

3. **Assemble `charts.js`**: the standard header (`var K = window.VZ, P = K.P, D = window.CD;
   var R = {};`), then every built fragment in card order, then one `K.boot(R);`.

4. **Failures become rejected rows.** A card returned as `failed` moves to the
   Considered-and-rejected table with its `detail` as the reason — the serial skill's own rule,
   and finding it out here is the point. If failures leave a band under its floor, brainstorm
   replacements and re-run the workflow with only the new specs. For a `failed` card whose
   `detail` names a missing dataKey, add the aggregate to `prep.py`, rebuild `chartdata.json`,
   and re-dispatch just that spec.

5. **Read `unreviewed` and any `unrepaired`.** An id in `unreviewed` was never judged — its
   reviewer died — so review it yourself or say in the notes that it was not. An `unrepaired`
   defect is a known flaw: fix it or record it, never drop it.

6. **Write the cards into `page.html`** from the returned fields — builders never touch the
   page — then rank the top three with the results in view, and finish the rail, recommended,
   rejected and notes sections.

7. **Gate and deliver exactly as the serial skill does**: `build.mjs`, then
   `../datastorm/bin/verify-report.mjs` green before the page ships, then publish per
   /datastorm's Output section.

## Fences

- A builder writes its own `option-<id>.js` and nothing else — not `prep.py`, not `page.html`,
  and never anything under the skill's `assets/`. **Step 2 above checks this rather than
  trusting it.**
- Fragments are bare `R.<id>` assignments. Header and boot exist exactly once, added at assembly.
- Every number a builder draws comes from `chartdata.json`, and `keys-only` proves it. A missing
  aggregate is reported back, never recomputed by a builder from the raw file.
- `verify-option.mjs --strict` green is the bar for a card entering the page;
  `verify-report.mjs` green is the bar for delivering. Neither is optional, and neither is
  satisfied by an agent saying so.
