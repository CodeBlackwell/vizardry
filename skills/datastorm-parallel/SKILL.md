---
name: datastorm-parallel
description: Run /datastorm with the option cards built by parallel agents — same procedure, same report, one builder per worked example, each gated by the per-option verifier before it returns. Use when someone asks for a parallel or faster datastorm, or when a 12-to-20-option build should not serialize twenty verify-fix loops through one context.
---

# Datastorm, parallel

**This is /datastorm with one phase fanned out, not a different product.** The deliverable,
the nine fields, the report contract and every content rule are the serial skill's — read
`../datastorm/SKILL.md` and `../datastorm/references/html-report.md` first, and follow them
everywhere this file is silent.

What changes is who draws. Serially, twenty worked examples and their fix loops run through
one context, so chart fourteen's third repair blocks chart fifteen from starting. Here each
option gets its own agent running its own build-verify-fix loop, and the wall clock becomes
the slowest option instead of the sum of all of them. The price is tokens: every builder
carries the shared brief, so a 16-option run pays for it roughly 16 times. When the dataset
is small or the option count is low, plain /datastorm is the better trade.

If the Workflow tool is not available in the session, say so and run /datastorm serially
rather than imitating the fan-out with sequential agents.

## What stays sequential, and why

Steps 1 through 6 of the serial skill run unchanged, in the main context, before any agent
spawns — they are cheap, and they need one pair of eyes:

- **Profile, column roles, grain, shape signature** — one pass over the data. Builders never
  re-read or re-profile the dataset; sixteen slightly different profiles is how a report
  contradicts itself.
- **The brainstorm** — one context generates all 12 to 20 specs, because two of the rules
  need cross-option vision: no two options answering the same question, and the band
  distribution. Each spec carries the nine fields in draft plus `dataKeys`: the named
  aggregates its example will draw from.
- **`prep.py` and `chartdata.json`** — written after the brainstorm, computing every
  `dataKeys` entry the specs name. This is the builders' single source of numbers.
- **The palette** — picked once, validated with `../datastorm/assets/validate-palette.mjs`,
  and written into `page.html` before fan-out. Builders inherit it through `P`; none of them
  touches a color value.

Ranking also stays out of the fan-out, but on the other side: the serial skill's rule is that
the examples change the analysis, so the top three are committed only after the workflow
returns, with every drawn result and failure in view.

## The fan-out

Set up the scratch directory per `html-report.md` (`page.html`, `prep.py`, `chartdata.json`,
the kit beside them via the assembler's resolution), then run one workflow:

```js
export const meta = {
  name: 'datastorm-parallel-build',
  description: 'Build and verify every option card concurrently, one agent per option',
  phases: [{ title: 'Build', detail: 'write option-<id>.js, loop verify-option until green' }]
}
// args: { scratchDir, skillDir, specs, briefing }
//   scratchDir  absolute path to the report build directory
//   skillDir    absolute path to the datastorm skill (bin/, references/, assets/)
//   specs       the brainstorm's option specs, each { id, band, dataKeys, ...nine fields }
//   briefing    the shared context: profile summary, grain, palette notes, data caveats

const FIELD = { type: 'string', minLength: 1 }
const CARD = {
  type: 'object',
  required: ['id', 'status', 'name', 'family', 'question', 'encoding', 'why', 'color',
             'interaction', 'failure', 'exemplar', 'caption'],
  properties: Object.fromEntries(
    ['id', 'name', 'family', 'question', 'encoding', 'why', 'color', 'interaction',
     'failure', 'exemplar', 'caption', 'detail'].map((k) => [k, FIELD])
  )
}
CARD.properties.status = { enum: ['built', 'failed'] }

const brief = (spec) => `You are building ONE worked example for a datastorm report.
Read ${args.skillDir}/references/html-report.md ("charts.js" and "Animation" sections) and
the two exemplar-*.js files beside it before writing a line.

Shared context:
${args.briefing}

Your option spec:
${JSON.stringify(spec, null, 2)}

Write exactly one file: ${args.scratchDir}/option-${spec.id}.js — a BARE fragment in the
charts.js dialect: only \`R.${spec.id} = function (el) {…}\` (plus a helper R key if the card
genuinely has two panels). No header, no K.boot — the assembler adds both once. Draw only
from the dataKeys named in your spec; colors only from P; tooltips via K.hov; any playback
through K.transport. Touch no other file.

Then loop until green, at most 3 attempts:
  node ${args.skillDir}/bin/verify-option.mjs ${args.scratchDir}/option-${spec.id}.js
Clear the tooltip WARN too — it is only tolerated for profile-section charts, which yours
is not.

Return the finished card as structured output: status 'built', the nine fields as they stand
AFTER drawing (the chart routinely corrects a draft field — that correction is the point),
plus 'caption' (what the chart turned out to say) and optionally 'detail' (anything the
drawing changed about the analysis). If a dataKey you need is missing from chartdata.json,
or the third verify attempt still fails, do NOT recompute data or exceed the file fence:
return status 'failed' with the verifier's last output (or the missing key) in 'detail'.`

phase('Build')
const cards = await parallel(args.specs.map((spec) => () =>
  agent(brief(spec), { label: 'build:' + spec.id, schema: CARD })
))
return { cards: cards.filter(Boolean) }
```

## After the workflow

Back in the main context, deterministic work plus the one judgment call:

1. **Assemble `charts.js`**: the standard header (`var K = window.VZ, P = K.P, D = window.CD;
   var R = {};`), then every built fragment in card order, then one `K.boot(R);`.
2. **Failures become rejected rows.** A card that returned `failed` moves to the
   Considered-and-rejected table with its `detail` as the reason — the serial skill's own
   rule, and finding it out here is the point. If failures leave a band under its floor,
   brainstorm replacements and re-run the workflow with only the new specs.
3. **Blocked cards re-run cheaply.** For a `failed` card whose `detail` names a missing
   dataKey, add the aggregate to `prep.py`, rebuild `chartdata.json`, and re-dispatch just
   that spec.
4. **Write the cards into `page.html`** from the returned fields — the builders never touch
   the page — then rank the top three with the results in view, and finish the rail,
   recommended, rejected and notes sections.
5. **Gate and deliver exactly as the serial skill does**: `build.mjs`, then
   `../datastorm/bin/verify-report.mjs` green before the page ships, then publish per
   /datastorm's Output section.

## Fences

- A builder writes its own `option-<id>.js` and nothing else — not `prep.py`, not
  `page.html`, and never anything under the skill's `assets/`.
- Fragments are bare `R.<id>` assignments. Header and boot exist exactly once, added at
  assembly.
- Every number a builder draws comes from `chartdata.json`. A missing aggregate is reported
  back, never recomputed by a builder from the raw file.
- `verify-option.mjs` green is the bar for returning `built`; `verify-report.mjs` green is
  the bar for delivering. Neither is optional.
