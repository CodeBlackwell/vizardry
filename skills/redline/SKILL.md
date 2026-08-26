---
name: redline
description: Turn a built /datastorm report into findings that force a change — each one routed to a named seat, priced with a downstream figure, and written as a sentence that goes into a document that seat already owes. Requires a mandate docket and refuses without one. Use when someone asks what an organization should change rather than what a dataset should look like, wants an efficiency or policy read, or says "who acts on this".
---

# The redline

Given a **built `/datastorm` report** and a **mandate docket**, produce a second page whose unit
is not a chart option but a **policy change**: a sentence, an owner, the document it goes into,
and what it is worth.

`/datastorm` asks what can be drawn. This asks what must change, who can change it, and where
the sentence lands. A chart earns its place here only by making a step unavoidable.

The failure this exists to prevent is the interesting-observations memo. Nine measurements, all
true, all quotable, none of which names anyone who could act, so nothing happens and the reader
concludes the analysis was decorative. **A finding that reaches no seat is not a finding.** It
is context, and this skill has a section for context precisely so that demoting something is
cheap rather than a loss.

## The procedure

### 0. The mandate docket, and the refusal

**Look for `docs/mandate.md` or `mandate.md`. Without one, stop.**

Three of the four fields that make a finding forceable cannot be derived from data at any price:

| field | comes from |
|---|---|
| Downstream | the data |
| Seat | the recipient's org |
| Owner | who signs, and whether they recommend or impose |
| Written into | the documents that org already owes |

Invent those three and every policy change degrades to advice wearing a costume. So this skill
does not synthesize a recipient, does not run in a "hypothetical" mode, and does not accept a
plausible-sounding org chart. Point at `/mandate-docket` and stop.

**But a mandate is not a client, and the refusal is not asking for one.** What the docket needs
is named seats, directives citable by section, and documents already owed. Public law supplies
all three for free: a charter section with a filing deadline, a statute that has required four
inspections a year since 1977, a regulation whose annual report a named office already
publishes. Nobody has to have hired anyone. The bar is a citable mandate, and the reason the
bar is absolute is that **nothing in a redline may be hypothetical**, not that the work must be
commissioned.

### 1. Ingest the built report

This skill runs **downstream of a built report**, not beside one. If there is no
`report-build/` directory with a `chartdata.json` in it, run `/datastorm` first — the substrate
is the point.

Read four things out of it:

| file | what it gives you |
|---|---|
| `chartdata.json` | every aggregate already computed and already verified. This is your evidence base **and** your numeral allowlist. |
| `charts.js` | render functions that already passed the twelve per-option checks. Reuse them; do not redraw what exists. |
| the option list | with each option's declared `dataKeys`, which tells you what columns it touched |
| the palette | already CVD-validated for that report. Inherit it when you are extending that report; re-pick and re-validate when the redline stands alone, which is what `page.html`'s own header tells you to do. Either way run `validate-palette.mjs`. |

**Read the report as an evidence substrate, not as a candidate list.** Its options were selected
for what is worth drawing, which is a different question from what forces a change, and a
finding is not disqualified for having no option behind it. What consuming the report buys you
is three things a fresh start does not: computed numbers that have already been checked, charts
that already render, and — the one that matters most — a **closed inventory** that falls out of
the data rather than out of your memory. See step 7.

**All four are the built report's, and a substrate that is only `chartdata.json` gives you one.**
That is a runnable case, not a refusal — but it costs the option list, so read step 7 before you
start rather than after, and expect to write more render functions than you reuse.

The data docket, if there is one, comes along as meaning context under the same rule
`/datastorm` uses: **the profile wins on facts and the docket wins on meaning.**

### 2. Mine against the shapes

Read `references/inefficiency-shapes.md`. Ten shapes, each a way an organization's own numbers
mislead the people reading them, each carrying the columns it needs, the query shape, the kind
of policy change it justifies, and **the misread it invites** — which prefills the finding
card's `Kills it` field, so a shape that fires arrives with half its honesty already written.

Run every shape against `chartdata.json` first. Some are satisfiable directly from aggregates
that already exist: concentration needs only a total and its parts. Others need a window nobody
drew.

**Re-querying the source data is allowed and expected**, and it comes with one absolute rule:

> **Write the result into `chartdata.json` before writing any sentence that uses it.**

**When the substrate is read-only** — a shared input, someone else's build, a file you must not
edit — write your values to a second file instead and pass both: `--data chartdata.json --data
redline-data.json`. The rule is that no number reaches the page without passing through a file,
not that it passes through one particular file. What you may never do is leave the number
unwritten, and that includes the shares step 3 computes: a swept concentration that exists only
in your head is exactly the kind of number this gate is built to stop.

Otherwise the numeral gate stops meaning anything and the report reacquires the failure mode it
exists to prevent. The allowlist is an append target, not a fence. What it forbids is a number
that reached the page without passing through a file, and a number you queried and wrote down
has passed through a file. A number you remembered has not.

Prefer the shapes that interrogate the instrument over the shapes that rank the actors. The
shapes file argues this at length and the short version is that a finding about how a standard
is written lands on a document the recipient owns and names no private party, which is what
makes it both more forceable and safer to publish.

### 3. The concentration sweep

Deterministic, and a tool rather than a judgement. For **every** total that appears anywhere in
`chartdata.json`, compute the top-1 share and the top-decile share. Where either crosses the
threshold, **the concentration is the finding** and the card is rewritten to lead with it.

This runs over everything, including totals that belong to options you have already discarded,
because the sweep is cheap and the misread it prevents is the most common one in the genre. A
total of $928.8M across 237 items reads as breadth. One item at 72% of it is the true sentence,
and nobody who quotes the total will find that out on their own.

### 4. Route to a seat, or demote

**The gate.** Every candidate must name a seat from the mandate docket **and** a document that
seat owns. Cannot name both, it does not stay a finding:

- **To context** if the measurement holds up and simply reaches nobody. Say which seat it would
  have needed.
- **To declined** if it fails for a stated reason: no ground, already in flight, or a posture
  nobody should publish.

Never invent a seat to save a candidate. A finding routed to a job title that has no docket
entry behind it is routed to nobody, and the verifier fails it.

**Name every seat the finding reaches, each with the reason it matters to that seat.** One
finding often lands on three desks for three different reasons: the seat that signs cares that it
needs no instrument machinery to be true, the seat that owns the words cares which words change,
the seat carrying it to a program cares what it means for a schedule. One seat where three were
reachable is a finding routed at a third of its strength — and the same sentence pasted under two
codes means neither desk was actually read. The gate checks both.

**Build the roster as you go.** Every code you use gets a card in *Where these land*: the code,
the title, and one sentence on what it decides. That section goes before the findings, not after
them, because a reader meets the code on the first card. State on it that the codes are a reading
aid for this document and nothing more — the recipient knows its own structure, and a roster that
reads as an outsider's org chart spends the recipient's attention on correcting your boxes.

**Set `Posture` here, honestly.** A finding that targets how a rule is written is `standard`. A
finding that targets who is behaving badly is `actor`. Both are legitimate; the label is what
stops the second kind accumulating unnoticed. A report whose findings are all `actor` has found
a scandal rather than a policy, and that is worth knowing before it ships.

### 5. Classify provenance

Mechanical, one question: **does this number depend on a classifier or a hand-assigned label?**

`raw` from a recorded field. `derived` from a computation over recorded fields. `model-judged`
where any input was categorized rather than recorded. Model-judged findings collect into the
single verification-debt paragraph in the frame, stated once globally, and each affected card
admits it on its face. Stating it once is what keeps the cards short; admitting it per card is
what stops a reader quoting one without the caveat.

### 6. Build the refusal set

**The refusals are the product.** A report that only adds findings leaves every wrong reading of
the data exactly as available as it was before.

For each finding, take the `Kills it` sentence and write the **replacement** beside it. Both are
sentences. A correction that is a caveat rather than a replacement has given the reader nothing
to say instead, so they go on saying the wrong one.

Then promote two — rarely three — to **charts drawn to be struck**. Build them for real. A
described-but-unbuilt refusal proves nothing, and the point of drawing the plausible chart is
that a reader who watches it get struck will not go build it themselves next month.

**Hunt for a refusal the publisher has already issued**, in an FAQ, a methodology note, a
technical users' guide, an inspector general's report. A correction in the subject's own words
is one nobody argues with, and it converts the report's posture from "you are wrong" to "your
own document says this and the number in circulation ignores it."

### 7. Roll up, and close the inventory

Group every policy change by the document it is written into. **This table is the payload**, not
the findings above it. Fifteen changes landing on four artifacts, nine of them on one, is a
report arguing the recipient should write one thing. Non-convergence is also a finding and gets
said out loud rather than hidden.

**Convergence is only real if the `Written into` fields underneath it are specific.** Two changes
routed to "the guidance" collapse into one row and read as agreement, when what happened is that
neither was aimed. The verifier cannot see this — both entries are complete, both name a
document, and the count reconciles — so check it by hand: if two rows merged, ask whether the
second change really lands on the first one's artifact, or whether you stopped looking once a
plausible document was named.

Then close the inventory. Every measurement the report touched is placed in exactly one bucket
— finding, context, drawn to be struck, held in reserve, declined — and the frame states the
counts. **This is mechanical rather than authored when — and only when — step 1 handed you an option
list**, because that list is a set and the buckets are a partition of it plus whatever step 2
added. That is the single strongest reason this skill consumes a built report instead of running
beside one.

**If the option list was not in the inputs, the inventory is authored and you must say so in the
frame.** The gate checks that the counts reconcile against the cards you wrote, which proves
arithmetic and not closure: a report that quietly dropped four candidates reconciles just as
green as one that placed them. Name the substrate you actually had, and treat a missing option
list as the report's largest piece of verification debt rather than as a formatting detail.

### 8. Write `redline.json`, then assemble and verify

**Write the report as data before you write it as a page.** `redline.json` holds the frame, the
findings with their ten fields, the context and struck entries, the refusals, the declined list
and the roll-up; its shape is in `references/redline-format.md`. The page is built from it, so
checking the data checks the page, and a field cannot be rendered without being gated.

The page itself is `/datastorm`'s, unchanged: `page.html`, `chart-kit.js`, `build.mjs`,
`validate-palette.mjs`. **The shipped `page.html` is `/datastorm`'s brainstorm shell** — its
sections are Recommended through Rejected and its card fields are `encoding`, `exemplar`,
`failure`, none of which a redline has. Keep its `<style>` block, its tokens, its rail and its
card CSS; replace the body with the nine sections and the card shape in
`references/redline-format.md`, which gives them in markdown rather than as an HTML template.
Generate the page from `redline.json` so the two cannot drift. Do not rewrite the assembler.

`build.mjs` resolves d3 from a `node_modules` above the working directory. A redline built inside
a repo that has none — which is most of them, since dockets and corpora live in Python trees —
fails there. Point it at one, or run the assembly from a directory that has it.

```bash
node <skill>/bin/verify-redline.mjs redline.json --data chartdata.json --mandate docs/mandate.md
```

The gate is an exit code, so a FAIL is a build stop. It checks card completeness, that every
policy change carries an Owner and a Written into, that every Downstream is labelled, that every
seat resolves against the mandate docket, that every model-judged finding reaches the debt
paragraph, that every refused sentence has a replacement, that the roll-up covers each change
exactly once, that the inventory counts reconcile against the cards actually present, and that
**every numeral in the prose exists in `chartdata.json`**.

That last one is the check that matters. `/datastorm`'s verifier raises it as a warning; here it
is an error, because a policy change priced with a number nobody computed is the exact failure
this genre dies of.

## Rules

- **No mandate docket, no run.** Not a warning, not a hypothetical mode. Point at
  `/mandate-docket` and stop. Every other rule here is downstream of this one.
- **A mandate is not a client.** Public law, a published charter, a statutory deadline — all of
  these are mandates and none of them requires a commercial relationship. Refuse the invented
  recipient, not the uncommissioned one.
- **Measured, quoted, or absent.** Every number came from the data, came from a cited document
  with attribution, or is not in the report. Never a plausible-looking third thing.
- **Nothing reaches the page except through `chartdata.json`.** Re-query freely; write the
  result down first. The one exemption is a document number the mandate docket declares —
  a citation is not a measurement, and citing an instrument no docket names is caught.
- **The Downstream is a comparison, not a figure.** Recurring cost on one side, the exposure it
  makes visible on the other, in one sentence, and let the asymmetry argue: *twenty-five short
  memos a year is the entire cost of making a $647.2M pattern visible at award time.* State only
  the benefit and you are asking for a blank cheque; state only the cost and you are arguing
  against yourself. Its label carries the basis, so a reader can reject your projection instead
  of your report.
- **A finding that reaches no seat is context.** Demote it, count it in the inventory, and say
  which seat it would have needed. Do not delete it and do not invent a seat for it.
- **Every policy change names a document.** "Someone should" is not a policy change. If no
  document would carry the sentence, the finding is not ready and belongs in context.
- **Label every Downstream `exact` or `estimated`.** An unlabelled magnitude is read as exact,
  and most of them are not.
- **Concentration before total, every time.** Aggregates on this kind of data are traps and
  singles are findings.
- **Prefer the instrument to the actors.** Where a shape can be written either way, write the
  version that lands on how a standard is written. It is more forceable, it is safer to
  publish, and it is the version the recipient can actually act on alone.
- **Name seats, not people.** "Director, Office of X" and not the individual currently holding
  it. Names go stale between the analysis and the reading, and the seat is what holds the pen.
- **The refusals section is never empty, and neither is "considered and declined".** An empty
  one of either means candidates were collected rather than tested.
