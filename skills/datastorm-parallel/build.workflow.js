export const meta = {
  name: 'datastorm-parallel-build',
  description: 'Build, review and repair every option card concurrently, one agent per option',
  phases: [
    { title: 'Build', detail: 'write option-<id>.js, loop verify-option, escalate once if red' },
    { title: 'Review', detail: 'a second agent judges the drawn result against the report rules' },
    { title: 'Repair', detail: 'only cards the reviewer found defects in' }
  ]
}

/* Stages run as a pipeline, not as barriers: option 3 can be in Review while option 14 is
 * still building. Nothing crosses between options until the main context assembles the page,
 * so a barrier would only make every fast option wait for the slowest one.
 *
 * What this script owns, rather than asking an agent to honor it: the attempt caps, the model
 * ladder and its strictly-upward escalation, which stages run at all, and the shape of every
 * return. What it deliberately does NOT own is the authoritative verdict — the main context
 * re-runs verify-option.mjs over every fragment first-hand once this returns, because a
 * builder's own "it went green" is a claim, not evidence.
 *
 * args: { scratchDir, skillDir, specs, briefing, model?, maxTier? }
 *   scratchDir  absolute path to the report build directory
 *   skillDir    absolute path to the datastorm skill (bin/, references/, assets/)
 *   specs       the brainstorm's option specs, each { id, band, dataKeys, ...nine fields }
 *   briefing    shared context: profile summary, grain, palette notes, data caveats
 *   model       omitted (default): every stage inherits the active session model, no override.
 *               a model name (e.g. 'opus', 'fable'): every stage is pinned to that one model,
 *               no ladder. 'dynamic': the band-driven cost ladder below, escalating on failure.
 *   maxTier     only read when model is 'dynamic' — the ladder's ceiling, default 'opus'
 */

const TIERS = ['haiku', 'sonnet', 'opus']
const clampInt = (n, lo, hi, dflt) => Math.min(hi, Math.max(lo, Number(n) || dflt))
const capText = (s, n) => {
  const t = String(s == null ? '' : s)
  return t.length > n ? t.slice(0, n) + ' …[truncated]' : t
}

/* Anything a model or a tool produced while reading data is data, never instruction. */
const fence = (s) =>
  `<<<UNTRUSTED\n${capText(s, 2000).replace(/<<<UNTRUSTED|UNTRUSTED>>>/g, '[fence marker stripped]')}\nUNTRUSTED>>>`

/* agent() returns null for some failures and THROWS for others (schema retry-cap exhaustion).
 * A guard written for null is bypassed by a throw, so every call goes through here. */
const tryAgent = async (prompt, opts) => {
  try {
    return await agent(prompt, opts)
  } catch (err) {
    log(`agent "${(opts && opts.label) || 'unlabeled'}" failed: ${capText(err && err.message, 200)}`)
    return null
  }
}

/* A conventional bar chart does not need the tier an abstract layout does. Routed on the
 * spec's declared band — never on the id prefix, which a real run has already been observed
 * to name c1..c16 across all three bands. */
const startTier = (band) => (String(band || '').toLowerCase() === 'conventional' ? 'haiku' : 'sonnet')
const ladderFrom = (start, maxTier) => {
  const lo = Math.max(0, TIERS.indexOf(start))
  const hi = TIERS.indexOf(maxTier) >= 0 ? TIERS.indexOf(maxTier) : TIERS.length - 1
  return TIERS.slice(lo, Math.max(lo, hi) + 1)
}

const FIELDS = ['name', 'family', 'question', 'encoding', 'why', 'color', 'interaction',
  'failure', 'exemplar', 'caption']

/* The named checks a verifier run went red on. Two tiers red on the identical set is
 * evidence that the constraint binds rather than the model, which is the one thing the
 * ladder cannot otherwise see: its whole premise is that failure is capability-limited. */
const failSignature = (card) => {
  const names = [...String((card && card.detail) || '').matchAll(/FAIL\s+([a-z][\w-]*)/gi)]
    .map((m) => m[1].toLowerCase())
  return [...new Set(names)].sort().join('+')
}

const CARD = {
  type: 'object',
  required: ['id', 'status', ...FIELDS],
  properties: {
    id: { type: 'string' },
    // 'blocked' is the state a real run produced five of and had no word for: the chart
    // draws and is correct, but one check cannot be satisfied by ANY fragment, so the
    // builder can neither pass nor honestly call its own working chart a failure.
    status: { enum: ['built', 'failed', 'blocked'] },
    ...Object.fromEntries(FIELDS.map((k) => [k, { type: 'string', minLength: 1 }])),
    detail: { type: 'string' },
    filesTouched: { type: 'array', items: { type: 'string' } }
  }
}

/* Single property on purpose. A long free-text field ahead of an array-of-objects is the shape
 * that makes a model close its JSON string early and leak the next field as a raw tag inside
 * it — the validator then reports a missing property, which never tells it the SHAPE was wrong.
 * One property means there is no second field to leak into. */
const REVIEW = {
  type: 'object',
  required: ['defects'],
  properties: {
    defects: {
      type: 'array',
      description: 'empty when the card holds up; one row per rule it actually breaks',
      items: {
        type: 'object',
        required: ['rule', 'evidence', 'fix'],
        properties: {
          rule: { type: 'string', description: 'the report rule broken, named' },
          evidence: { type: 'string', description: 'what in the drawn result shows it' },
          fix: { type: 'string', description: 'the smallest change that resolves it' }
        }
      }
    }
  }
}

const scratch = args.scratchDir
const skill = args.skillDir
const specs = Array.isArray(args.specs) ? args.specs : []

const modelArg = typeof args.model === 'string' ? args.model.trim() : ''
const dynamic = modelArg.toLowerCase() === 'dynamic'
// A named model with no ladder concept of its own — 'fable' is not a rung between sonnet and
// opus, it is a different family entirely, so a fixed model gets exactly one rung: itself.
const fixedModel = !dynamic && modelArg ? modelArg : undefined
const maxTier = dynamic ? (TIERS.includes(args.maxTier) ? args.maxTier : 'opus') : undefined
const describeTier = (t) => t || 'active'

// The ladder of models to try, in order, for one option. Dynamic keeps the existing
// band-driven escalation; a fixed model or the default (inherit) is a single rung.
const ladderFor = (spec) => (dynamic ? ladderFrom(startTier(spec.band), maxTier) : [fixedModel])

const optionFile = (id) => `${scratch}/option-${id}.js`
const evidenceFile = (id) => `${scratch}/.datastorm/evidence-${id}.json`

const verifyCmd = (spec) =>
  `node ${skill}/bin/verify-option.mjs ${optionFile(spec.id)}` +
  ` --data ${scratch}/chartdata.json --page ${scratch}/page.html --strict` +
  ` --keys ${(spec.dataKeys || []).join(',')} --emit ${evidenceFile(spec.id)}`

const buildBrief = (spec, prior) => `You are building ONE worked example for a datastorm report.
Read ${skill}/references/html-report.md (its "charts.js" and "Animation" sections) and the two
exemplar-*.js files beside it before writing a line.

Shared context:
${args.briefing}

Your option spec:
${JSON.stringify(spec, null, 2)}
${prior ? priorAttemptText(spec, prior) : ''}
Write exactly one file: ${optionFile(spec.id)} — a BARE fragment in the charts.js dialect: only
\`R.${spec.id} = function (el) {…}\` (plus one helper R key if the card genuinely has two panels).
No header, no K.boot — the assembler adds both once. Draw only from the dataKeys your spec
names; colors only from P (never a hex, never a d3.scheme*); tooltips via K.hov or K.show; any
playback through K.transport with an explicit opts.step, tweens through K.tdur. Touch no other
file.

Then loop until green, at most 2 attempts:
${verifyCmd(spec)}

Every failure line carries its own repair. The verifier is the bar, not your reading of it.

Return the card as structured output: status 'built', the nine fields as they stand AFTER
drawing (the chart routinely corrects a draft field — that correction is the point), plus
'caption' saying what the chart turned out to say, and 'filesTouched' listing every file you
wrote. If a dataKey you need is missing from chartdata.json, or your last verify still fails,
do NOT recompute data or write outside your one file: return status 'failed' with the
verifier's final output (or the missing key) in 'detail'.

There is a third state, and using it correctly is worth more than forcing either of the
others. Return status 'blocked' when the chart DRAWS and is correct, every other check is
green, and the one red check cannot be satisfied by any fragment — a rule about the spec or
the harness rather than about your code. Name the check and say in 'detail' why no code in
your file could change it, and fill the nine fields as normal: the file stays on disk and the
main context adjudicates. Do not reach for 'blocked' for a check you simply have not fixed —
'failed' is the honest word for that, and a wrongly blocked card is caught first-hand.`

/* Escalation only beats the failed tier's ceiling if it knows what failed — and that the
 * failed attempt's file is still sitting on disk waiting to mislead it. */
const priorAttemptText = (spec, prior) => {
  const lines = [`\nAn earlier attempt at this option (${prior.tier}) already FAILED.`]
  if (!prior.card) lines.push('It died before returning — treat anything it left as unproven.')
  else if (prior.card.detail) lines.push(`Its own account: ${fence(prior.card.detail)}`)
  lines.push(
    `${optionFile(spec.id)} MAY ALREADY CONTAIN that attempt's code. Read it first, then amend ` +
    'or discard it — do not assume any of it is correct, and do not assume it exists either.'
  )
  return lines.join('\n') + '\n'
}

const reviewBrief = (spec, card) => `You are reviewing ONE finished chart in a datastorm report.
You did not build it. Your job is to find where it breaks a rule the verifier cannot check,
and to find nothing when it holds up — an invented defect costs more than a missed one.

Read ${skill}/references/html-report.md, section "Rules the page has to hold to".

The evidence of what was actually DRAWN is at ${evidenceFile(spec.id)} — read it. It carries the
keys the chart really read, its mark count, its axis labels and a live tooltip sample. Read
${optionFile(spec.id)} too. Judge the drawn result, never a screenshot: do not open a browser.

The card its builder returned:
${fence(JSON.stringify(card, null, 2))}

The spec it was built from:
${fence(JSON.stringify(spec, null, 2))}

Check exactly these, and report only what you can point at in the evidence:
  - The caption says what the chart turned OUT to say, not what it displays.
  - The card's own claims match the drawing. If its text sets a floor of n=10, no cell below
    n=10 was drawn.
  - No hardcoded finding: a count or a class named in prose is computed from the data, not typed.
  - A no-data state, if the chart has one, is visibly its own fill and not the ramp's lightest step.
  - Colour meaning two things is stated in one caption line.
  - A chord past roughly 12-15 groups occludes; it should be cropped and the caption should say so.
  - An arguable baseline gets the reader the other one (a toggle), sort order invariant under it.

Return { defects: [] } when it holds up. One row per rule ACTUALLY broken.`

const repairBrief = (spec, card, defects, blocking) => `Repair ONE chart in a datastorm report.
It renders; a reviewer found it breaks rules the verifier cannot check.

The file, which you may edit and which is the ONLY file you may touch: ${optionFile(spec.id)}

The defects:
${fence(JSON.stringify(defects, null, 2))}

The card as it stands:
${fence(JSON.stringify(card, null, 2))}

Fix the smallest thing that resolves each defect. A defect about the caption or a field is
fixed by correcting that text in your returned card, not by redrawing. A defect about the
drawing is fixed in the fragment. Do not redesign the chart.

Re-verify before returning:
${verifyCmd(spec)}
${blocking ? `\nThis card is BLOCKED on \`${blocking}\`, which no code in this file can satisfy — that is already established and is not yours to fix. Every OTHER check must stay green; do not chase a clean exit code you cannot reach, and do not change the chart to try.\n`
  : ''}

Return the card with every field as it now stands, status 'built'. If a defect cannot be fixed
inside this one file, return the card with status 'built' anyway and name the unresolved defect
in 'detail' — do not reach outside the file, and do not silently drop it.`

// ---------------------------------------------------------------------------------------
phase('Build')
log(`Building ${specs.length} option${specs.length === 1 ? '' : 's'} concurrently, ` +
  (dynamic ? `ladder capped at ${maxTier}` : fixedModel ? `model fixed at ${fixedModel}` : 'using the active session model'))

const attempts = clampInt(args.attemptsPerTier, 1, 3, 1)

const results = await pipeline(
  specs,

  // Build. Dynamic mode walks a strictly-upward ladder — iterating the array IS the "one
  // shot per tier" rule, there is no branch that reruns a rung, so it cannot happen. A fixed
  // or default model is a ladder of one, so this loop still gives it its `attempts` retries.
  async (_prev, spec) => {
    const ladder = ladderFor(spec)
    let prior = null
    let priorSig = null
    for (const tier of ladder) {
      for (let a = 0; a < attempts; a++) {
        const opts = { label: `build:${spec.id}:${describeTier(tier)}`, phase: 'Build', schema: CARD }
        if (tier) opts.model = tier
        const card = await tryAgent(buildBrief(spec, prior), opts)
        if (card && card.status === 'built') return { spec, card, tier }
        // A chart that draws but cannot influence the check holding it red is not going to
        // be rescued by a larger model. Take it as it stands and let the main context judge.
        if (card && card.status === 'blocked') {
          log(`${spec.id} blocked at ${describeTier(tier)}: ${capText(card.detail, 140)}`)
          return { spec, card, tier, blocked: true }
        }
        prior = { tier: describeTier(tier), card }
      }
      const sig = failSignature(prior && prior.card)
      if (sig && sig === priorSig) {
        log(`${spec.id} red on the same check at two tiers (${sig}) — stopping the ladder, ` +
          'this is constraint-limited rather than model-limited')
        return { spec, card: prior.card, tier, exhausted: true, repeatedSignature: sig }
      }
      priorSig = sig
      if (tier !== ladder[ladder.length - 1]) {
        log(`${spec.id} red at ${describeTier(tier)} — escalating with the failed attempt's evidence`)
      }
    }
    log(`${spec.id} exhausted the ladder (${ladder.map(describeTier).join(' -> ')}) — it becomes a rejected row`)
    return { spec, card: prior && prior.card, tier: ladder[ladder.length - 1], exhausted: true }
  },

  // Review. A built card only; a failed one has nothing to judge. Dynamic mode pins the
  // reviewer to sonnet regardless of build tier, by design; fixed/default modes follow suit.
  async (built) => {
    // A blocked card IS drawn, so it gets the same independent judgment. Skipping it would
    // mean the main context could only accept an unreviewed card, which is the one promise
    // this pipeline exists to keep.
    if (!built || !built.card || built.exhausted) return built
    const reviewModel = dynamic ? 'sonnet' : fixedModel
    const opts = { label: `review:${built.spec.id}`, phase: 'Review', schema: REVIEW }
    if (reviewModel) opts.model = reviewModel
    const review = await tryAgent(reviewBrief(built.spec, built.card), opts)
    // A dead reviewer is no evidence of a clean card. Say so rather than calling it green.
    if (!review) return { ...built, reviewFailed: true }
    return { ...built, defects: review.defects || [] }
  },

  // Repair, only where the reviewer actually found something.
  async (reviewed) => {
    if (!reviewed || !reviewed.defects || reviewed.defects.length === 0) return reviewed
    const { spec, card, defects } = reviewed
    log(`${spec.id}: ${defects.length} defect(s) — ${defects.map((d) => d.rule).join('; ')}`)
    const repairModel = dynamic ? (reviewed.tier === 'haiku' ? 'sonnet' : reviewed.tier) : fixedModel
    const opts = { label: `repair:${spec.id}`, phase: 'Repair', schema: CARD }
    if (repairModel) opts.model = repairModel
    const repaired = await tryAgent(
      repairBrief(spec, card, defects, reviewed.blocked ? failSignature(card) : ''), opts)
    if (!repaired) return { ...reviewed, unrepaired: defects }
    return { ...reviewed, card: repaired, repairedFrom: defects }
  }
)

const rows = results.filter(Boolean)
const built = rows.filter((r) => r.card && !r.exhausted && !r.blocked)
const blocked = rows.filter((r) => r.blocked && r.card)
const failed = rows.filter((r) => r.exhausted || !r.card)
const unrepaired = rows.filter((r) => r.unrepaired)
const unreviewed = rows.filter((r) => r.reviewFailed)

log(`Done: attempted ${specs.length}, built ${built.length}, blocked ${blocked.length}, ` +
  `failed ${failed.length}, repaired ${rows.filter((r) => r.repairedFrom).length}, ` +
  `unrepaired ${unrepaired.length}, unreviewed ${unreviewed.length}`)

const asCard = (r) => ({
  ...r.card,
  id: r.spec.id,
  band: r.spec.band,
  tier: r.tier,
  defectsFound: (r.defects || []).length,
  unrepaired: r.unrepaired || undefined
})

return {
  cards: built.map(asCard),
  // Drawn, reviewed, and green but for one check no fragment can satisfy. These are NOT
  // rejected rows: the file is on disk and the main context decides, which is the whole
  // point of the state — five working charts were once discarded for want of this word.
  blocked: blocked.map(asCard),
  failed: failed.map((r) => ({
    id: r.spec.id,
    band: r.spec.band,
    detail: (r.card && r.card.detail) || 'the builder died before returning a card',
    tier: r.tier,
    // Set when the ladder stopped early because two tiers went red identically.
    repeatedSignature: r.repeatedSignature || undefined
  })),
  // Named so the main context can tell "reviewed and clean" from "never reviewed".
  unreviewed: unreviewed.map((r) => r.spec.id)
}
