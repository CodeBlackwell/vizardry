# The redline format

One page. Nine sections, in this order, and a card whose fields are grouped in four. The shape
is what makes the report checkable: `bin/verify-redline.mjs` reads these fields directly, so a
card missing one is a card the gate rejects.

```
# The redline: <what must change, and who changes it>

<the frame: one paragraph. The recipient, the inventory counts, the verification debt,
and the denominators. Every count here is checked against the cards below.>

## What every figure stands on
## Where these land
## The findings
## Context
## Drawn to be struck
## The refusals
## Considered and declined
## What this data must refuse
## The documents these rewrite
## The mandate this stands on
```

**The report's payload is the last section, not the first.** A reader who takes away nine
findings has taken away a briefing. A reader who takes away "these fifteen changes land on four
documents, and nine of them on one" has taken away the thesis, which is that the data supports
writing one thing. Findings are the evidence for that sentence. Order the work accordingly:
mine the findings, then look at where they land, and if they land nowhere in particular that is
itself the finding and the report says so.

## The frame

One paragraph, and every number in it is checked. It carries four things:

- **The recipient**, by seat and node, not by person. "Director, Office of X" rather than a
  name — names go stale between the analysis and the reading, and the seat is what actually
  holds the pen.
- **The inventory**, as a closed count. "Nineteen measurements: 9 findings, 6 context, 2 drawn
  only to be struck, 1 held in reserve, 1 declined." These must sum to the measurements the
  report actually contains, and the gate adds them up.
- **The verification debt**, stated once for the whole report. Which findings rest on a
  model-judged label, and what that costs. Stating it globally is what lets the cards stay
  short; every affected card still admits it on its face.
- **The denominators**, enumerated with what each bounds, and the explicit sentence that they
  are not interchangeable. Every dollar figure and every rate below declares which one it
  stands on.

## What every figure stands on

The short list that binds the whole report, stated once so no card restates it. Typically:

- **The denominators**, expanded from the frame. Each with its population, its count, and the
  figures that may be quoted against it. A rate over one and a total over another do not belong
  on the same axis and this section is where that is settled.
- **The trust tiers.** Three, and they are not interchangeable either. A figure built from a
  raw field carries no verification debt. A figure derived by a computation carries the
  computation's assumptions. A figure resting on a model-judged label carries a precision limit
  that no downstream arithmetic removes. Say which tier each denominator supports.
- **The standing analytic stance.** State it plainly, because it changes how every number below
  should be read: **aggregates on this data are traps and singles are findings**. Concentration
  before total, every time. A total of $928.8M across 237 items is one item at 72% of it, and
  the second sentence is the true one.
- **The snapshot date.** Every figure is true of the data as it stood on a date. Say the date
  once here rather than in each card.

## Where these land

**The seat roster, and it goes before the findings rather than after them.** A reader meets `CMP`
on the first card; the roster is what makes that legible without leaving the page. Put it early,
render it as a grid of small cards, and give the section a subtitle that says how many seats and
what the list is not — *six seats, not an org chart*.

One card per seat: the **code**, the **title**, and one sentence on **what it decides**. Not its
reporting line, not its parent organization, not its staff. A seat earns a card by owning a
decision a finding can land on.

> **CMP** — Competition and acquisition. Turns FPDS posture into questions a contracting
> activity can answer.

**Say out loud that the codes are a reading aid.** One line under the heading: *findings are
tagged with the seats they reach; the tags are a reading aid for this document and nothing more,
and the recipient knows its own structure.* Without that line a roster reads as an org chart
drawn by an outsider, which is both wrong and insulting — and the recipient will spend its
attention correcting your boxes instead of reading your findings.

Every code used on any card appears here, and no code appears here that no card uses. The gate
checks both directions.

## The findings

Numbered `F1`, `F2`, ... **Numbers are addresses other documents cite, so they are never reused
and never renumbered.** A finding that dies is struck in place with the reason, not deleted.

Each card carries ten fields in four groups. The grouping is what makes ten fields writable:
each group answers one question.

**The finding** — what was measured.

| field | what it holds | what fails |
|---|---|---|
| **Headline** | the finding as a sentence someone would say out loud in a meeting | a chart title, or a noun phrase with no claim in it |
| **Magnitude** | the number, with its **n**, its **denominator**, and its **date** | a number with no denominator, or one carried over from a prior frame |
| **Chart** | the option id in `chartdata.json` this stands on | a description of a chart that was never built |
| **Shape** | which entry in `inefficiency-shapes.md` fired | "analysis" — if no shape fired, ask why this is a finding |

**The routing** — who does something about it.

| field | what it holds | what fails |
|---|---|---|
| **Posture** | `standard` or `actor`: does this target how a rule is written, or who is behaving badly | omitting it, which is how a report drifts into ranking parties nobody meant to rank |
| **Who acts** | **every** seat this finding reaches, each with the reason it matters *to that seat* — one line each. A finding that reaches three seats for three different reasons is routed three times, not once | one seat when more were reachable, or the same sentence repeated under two codes, which means neither was read |
| **Tasker** | numbered steps, then **What it produces** on its own line. Steps are imperatives a person could execute on Monday | a prose paragraph describing an intention, or a task with no artifact at the end of it |

**Addresses are mnemonics, not serial numbers.** `CMP` for competition, `STD` for standard
language, `GOV` for data governance — a reader meeting `CMP` mid-card can guess it, and a reader
meeting `S2` cannot. Sequential codes push the whole meaning of the routing into a lookup nobody
performs, which is how a card stops being readable where the reader actually is.

**The honesty** — what would make this wrong.

| field | what it holds | what fails |
|---|---|---|
| **Kills it** | the most quotable **wrong sentence** this finding invites, verbatim | a category of error rather than a sentence; write what a reader would actually say |
| **Provenance** | `raw`, `derived`, or `model-judged` | leaving it off a model-judged finding, which is the only case where it matters |

**The change** — the sentence and its home.

| field | what it holds | what fails |
|---|---|---|
| **Policy change** | all required: **Owner** (the seat that signs, and whether it imposes or recommends), **Written into** (the named document, by section where one exists), a three-part **Downstream** — the **cost**, the **exposure** it is set against, and the **asymmetry** sentence that weighs them — plus its **label** (`exact` or `estimated`) and its **basis**, the projection it came from | "someone should" — a change with no document is advice, a downstream with no label is a number nobody can check, and a downstream with one side is not a comparison |

**The Downstream is the punch, and it is a comparison rather than a number — so it is three
fields rather than one sentence.** A figure alone lands as trivia. What lands is the cost set
against what the cost buys: *twenty-five short memos a year is the entire cost of making a
$647.2M pattern visible at award time rather than two years later.* A Downstream that states only
the benefit is asking for a blank cheque; one that states only the cost is arguing against itself.

The split exists because **no check over a single sentence can tell which side of a comparison a
number is on.** So `cost` and `exposure` are separate fields, **each carrying a figure that was
actually computed**, and `asymmetry` is the sentence that sets them against each other. The gate
requires both sides to be priced, requires the two to be different figures, and requires the
sentence to carry a figure from each — otherwise the sides are decorative.

**Write `asymmetry` rather than composing it.** The clause doing the real work in the card below
is *rather than two years later in an analysis like this one*: a counterfactual that lives in
neither side, and that changes in kind from card to card — a time here, a threshold elsewhere, an
audience somewhere else. A fourth field for it would be a slot for whatever was left over.

**What this does not buy.** Three labelled boxes are three plausible clauses, and filling a
labelled box plausibly is the easiest thing a writer under deadline does. The shape prevents a
one-sided Downstream. It does not prevent an empty one, and no check here claims to.

**Its label line carries the basis.** Not `estimated` alone but `estimated, rate projected from
61 awards in 22.3 months` — the reader can then reject your projection instead of rejecting your
report. This is the single field most likely to be quoted out of the document, so it travels with
the thing that would falsify it.

**Write `basis` as the projection alone.** The label line is composed from `label` and `basis`, so
a basis that opens with `exact` or `estimated` stutters — *exact, exact, counted over the 22
months* — and `basis-renders-clean` rejects it. The word is `label`'s job; the sentence is yours.

A worked card:

> **F4. Full and open competition drew one offer on a quarter of these awards.**
> Magnitude: 61 of 237 awards, 25.7%, over the competed denominator, measured 2026-08-25.
> Chart: `opt-c3`. Shape: outcome contradicting posture. Posture: standard. Provenance: raw.
>
> **Who acts.**
> `CMP` — 61 awards is a nameable list, and nothing in it depends on a classifier.
> `DIR` — the finding to lead with, precisely because it needs no instrument machinery to be true.
>
> **Tasker.** 01 Name the 61 awards. 02 Send each to the competition advocate with one question:
> what did market research predict, and what did the debrief show. 03 Report dollars and counts,
> never a percentage of awards.
> **What it produces.** Sixty-one answered files, and a documented reason for each large
> competition the market did not answer. Neither exists today.
>
> **Kills it:** "a quarter of competitions were rigged."
>
> **The policy change.** Above a stated dollar threshold, a full and open solicitation returning
> a single offer files a short written comparison of what market research predicted against what
> arrived, attached to the award.
> Owner: `CMP`, which recommends the record and does not impose it.
> Written into: the annual competition advocate report, the coverage paragraph.
> Downstream — *estimated, rate projected from 61 awards in 22.3 months*
> Cost: 25 short memos a year, one per award the record attaches to.
> Exposure: roughly $348M a year moving under a record nobody reads until an analysis like this.
> **Twenty-five short memos a year is the entire cost of making a $348M pattern visible at award
> time rather than two years later in an analysis like this one.**

**Posture is not decoration and the gate reads it.** A finding marked `actor` names a party, and
a party can be wrong about being named in a way an office cannot be wrong about owning a
document. Every `actor` finding must survive the question "would I publish this sentence with
the name in it," and a report whose findings are all `actor` has usually found a scandal rather
than a policy.

**A finding inherits the report's debt by reference rather than restating it** — "under the
verification debt in the frame". Restating is how two copies drift apart.

## Context

Measurements that place the findings without being findings. A context entry needs **Headline**,
**Magnitude** and **Chart**, plus a **Reading** saying what it places and, when it was demoted
from a finding, which seat it would have needed. It carries no Tasker and no Policy change: it
routes to nobody, and that is precisely what makes it context rather than a finding. Keep the
routing sentence in `reading` — putting it in `magnitude` buries authority prose in the field the
gate reads as a measurement.

**This section is where a demoted candidate lands.** A measurement that could not name a seat
and a document is not thrown away; it is placed here, and the inventory count in the frame
accounts for it. That is what makes the inventory closed.

## Drawn to be struck

Charts built **specifically so they can be refused**. Two is the usual number and more than
three is a report arguing with itself.

The entry carries the chart, the reading it invites, and the sentence that kills that reading.
The chart is real and was really built — a described-but-unbuilt refusal proves nothing, and
the whole reason to draw one is that a reader who sees the plausible chart and then sees it
struck will not go build it themselves next month.

## The refusals

**The refusals are the product.** A report that only adds findings leaves every wrong reading of
the data exactly as available as it was before. This section closes them.

One entry per refused reading: the **wrong sentence**, quoted the way someone would actually say
it, and the **corrected wording** beside it. Both are sentences. A refusal whose correction is a
caveat rather than a replacement has not given the reader anything to say instead, and they will
go on saying the wrong one.

Every finding's `Kills it` field appears here. The gate checks that pairing in both directions:
a wrong sentence with no replacement fails, and a finding whose `Kills it` never reaches this
section fails.

The strongest entries are the ones where **the publisher has already issued the correction** —
an agency FAQ, a methodology page, an inspector general's report. Quote it and cite it. A
refusal in the subject's own words is one nobody argues with.

## Considered and declined

A bullet per killed candidate, with the reason. Four kinds, and each earns its place:

- **Declined on routing** — the measurement holds up and reaches no seat that can act on it.
  This is the most common kind and it is not a failure; say which seat it would have needed.
- **Declined on ground** — the data cannot carry the claim. Name the surface it would need.
- **Declined on posture** — the only interesting version names a party, and naming that party is
  not worth what it costs. Say so plainly rather than pretending the analysis failed.
- **Declined as already in flight** — a rulemaking is open, a recommendation is already accepted,
  a revision is already scheduled. A finding aimed at something already being fixed is stale on
  arrival, and the mandate docket's in-flight section is what catches it.

**This section is never empty in a real redline.** An empty one means candidates were collected
rather than tested.

## What this data must refuse

Questions the recipient will reasonably ask that this data cannot answer, listed before they
ask. Distinct from the refusals above, which correct readings of findings that exist; these
foreclose findings that do not.

Three or four is usually right. Each names the question, the surface that would be required, and
whether that surface is obtainable. A question whose surface is one query away is not a refusal,
it is a next step, and it belongs in the roll-up as one.

## The documents these rewrite

**The payload.** A table grouping every policy change by the document it is written into.

| document | owner | changes | findings |
|---|---|---|---|
| the annual competition advocate report | S2 | 4 | F1, F4, F9, F12 |

Then the sentence the table supports, stated explicitly: how many documents absorb how many
changes, and whether they converge. **Convergence is the thesis.** Fifteen changes landing on
four artifacts, nine of them on one, is a report arguing that the recipient should write one
measurement standard, with fifteen pieces of evidence behind it.

**Non-convergence is also a finding and the report says so rather than hiding it.** Fifteen
changes landing on fifteen documents means the recipient has no instrument that would hold them,
and that absence is worth more than any single change in the list.

The gate checks that this table covers **every** policy change exactly once. A change that
appears in a card and not here, or twice here, fails.

## The mandate this stands on

Short. The seats cited, by address and title, and the directives cited, by section. This is the
report's bibliography and it exists so a reader can check the routing without opening the
mandate docket. Every `S`-address used above appears here; the gate checks it.

## The selector contract

`redline.json` is written first and the page is generated from it by `assets/render.mjs`, so the
page and the data cannot disagree by accident. `bin/verify-redline-page.mjs` proves they do not
disagree on purpose either, and it can only do that if it knows where every value landed. This
table is that interface. Change it in one place and both sides break loudly; change it in the
renderer alone and the gate silently stops checking.

| what | selector |
|---|---|
| a section | `<section id="frame\|stands\|seats\|findings\|context\|struck\|refusals\|declined\|must-refuse\|rollup\|mandate">` |
| a finding card | `<article class="find" id="F1">` |
| a scalar field | `[data-field="headline\|magnitude\|shape\|posture\|killsIt\|provenance\|owner\|writtenInto\|label\|basis\|cost\|exposure\|asymmetry\|produces\|reading\|strike\|wrong\|instead\|reason\|title\|decides\|document\|question"]` |
| a seat, on the roster and on a card | `[data-seat="STD"]` |
| one `whoActs` entry | `<li data-seat="INT">` inside `.who`, its reason in `[data-field="reason"]` |
| one tasker step | `<li data-field="step">` inside `ol.tasker`, in order |
| a chart mount | `<div class="chart" data-chart="opt-a2">` |
| a rail link | `<a href="#F1">` inside `.rail`, its label in the last `<span>` | 

**One value, one element, and nothing else in it.** A `[data-field]` element holds the value and
no label: the word "Magnitude:" lives in a sibling. That single rule is what lets the gate compare
page against data with string equality instead of a substring search, and a substring search is
how a check that looks strict turns out to be satisfiable by prose.

## The data file the page is built from

**Write `redline.json` first and build the page from it.** Every section above is one key, every
card field is one property, and the gate reads this file rather than the rendered HTML — a check
that scrapes prose can be satisfied by prose.

| key | holds |
|---|---|
| `frame` | `recipient`, `inventory`, `verificationDebt`, `denominators` |
| `findings` | the cards, each with an `id` and the ten fields |
| `context` | `id`, `headline`, `magnitude`, `chart` |
| `struck` | `id`, `chart`, `reading`, `strike` |
| `reserve` | the measurements held back; may be empty, and is still counted |
| `declined` | `id`, `reason` — never empty |
| `refusals` | `wrong` and `instead`, both required |
| `rollup` | `document`, `owner`, and `findings`, the ids that document absorbs |
| `seats` | the roster: one entry per seat with `code`, `title`, `decides`. Every code any card cites appears here |
| `standsOn` | what every figure stands on: the surfaces, the denominators, the frame |
| `mustRefuse` | the standing refusals — what this data may never be asked, independent of any finding |
| `mandate` | the bibliography: the seats cited by address and title, the directives by section |
| `rollupThesis` | the one sentence the roll-up table argues, convergence or its absence |

A finding carries an `id` plus the ten fields: `headline`, `magnitude`, `chart`, `shape`,
`posture`, `whoActs`, `tasker`, `killsIt`, `provenance`, and `policyChange`.

`whoActs` is an array of `{ code, reason }`, one per seat the finding reaches. `tasker` is
`{ steps: [...], produces }`. `policyChange` carries `owner`, `writtenInto`, `label`, `basis` —
the projection the downstream came from, which renders in the label line and does not repeat the
label word — and `downstream`, itself `{ cost, exposure, asymmetry }`.

`frame.inventory` holds the five counts under exactly those bucket names, because the gate
compares each against the entries actually present. `chart` names a top-level key of
`chartdata.json`, which is what makes "the chart exists" a set operation rather than a promise.
That key must address **one aggregate**, not the file it sits in: pointing every card at a
substrate dump satisfies "the key is real" while addressing nothing, so the gate also fails a
chart holding more sub-keys than all its siblings combined, and fails a report whose cards all
name the same key. A struck entry carries `reading` and `strike` and no headline — the page has
nowhere to render one, so a headline written there is a sentence only the JSON can see.

## The rules a redline is read back against

Before handing it over, read it against these and fix what fails:

- **Every number in the prose exists in `chartdata.json`.** This is the single check that kills
  the failure mode these reports die of. A figure that reached the page without passing through
  the data file is a figure nobody computed. When a finding needs a number nobody drew, run the
  query and **write the result back into `chartdata.json`** before writing the sentence. Every
  prose field is gated, not only the card's: the roster, the roll-up, what the data must refuse,
  `standsOn` and the frame's recipient all carry numbers and are all read.
- **Every policy change names an Owner and a Written into.** Both, always. One without the other
  is a change with no address.
- **Every Downstream is labelled `exact` or `estimated`.** An unlabelled magnitude is read as
  exact, and most of them are not.
- **Both sides of every Downstream carry a computed figure, and the two differ.** A cost priced at
  the exposure is the same number twice, which compares nothing.
- **Every asymmetry sentence carries a figure from each side.** Otherwise the two sides are
  decorative and the punch is a free string.
- **Every seat resolves** to a seat entry in the mandate docket — not to a directive and not to
  an owed artifact, which the gate now tells apart by the heading they sit under. A document
  cannot be told to act; it can only be written into.
- **Every seat code is a mnemonic.** `STD` and not `S1`. A serial code is well formed and
  unreadable: it makes the reader hold a lookup table to get through a card.
- **Every roster entry decides something the others do not.** Two seats with the same `decides`
  are one seat written twice.
- **Every tasker step is executable and `produces` names an artifact** the steps do not already
  name. A steps array holding `x` satisfies a presence check and nobody's Monday.
- **Every model-judged finding appears in the frame's verification debt.** Stated once globally,
  admitted once on the card.
- **Every refused sentence has a replacement sentence.** Not a caveat. A sentence.
- **The inventory reconciles.** The counts in the frame equal the cards on the page.
- **The roll-up covers every policy change exactly once.**
- **A document number is a citation, not a measurement — and only if the docket declares it.**
  `Written into` names its document by section, so DoDI 5000.97 and DFARS 227 belong in the
  prose. The gate exempts a numeral that reads as a citation *and* whose exact instrument
  appears in the mandate docket, which means you may cite only what your docket names. An
  instrument the docket does not carry is caught, and so is a measurement that happens to
  follow a capitalized word.
- **Nothing in the file is a number you invented.** Measured, quoted with attribution, or absent.

## A skeleton

Illustrative shape only. The recipient, the seats, the directive and every number below are
**invented**, and no organization or dataset is behind them.

```markdown
# The redline: permit review at the Office of Building Standards

Prepared for the Director, Office of Building Standards, and the four division chiefs beneath
that seat. Eleven measurements: 5 findings, 3 context, 2 drawn only to be struck, 1 declined.
Two findings (F2, F5) rest on a model-assigned category rather than a recorded field; that
label was checked against 60 hand-read records at 91% agreement, and no arithmetic below
removes that limit. Two denominators are in play and they are never interchangeable: all
filings (18,402) and reviewed filings (11,208). Figures are as of 2026-08-25.

## What every figure stands on

- **All filings, 18,402.** Volume claims run over this. It includes withdrawals.
- **Reviewed filings, 11,208.** Every duration and every rate runs over this. A rate quoted
  against all filings understates by 39%.
- **Trust tiers.** `intake_date` and `decision_date` are recorded fields. Durations are derived.
  `complexity` is model-judged and carries the limit stated in the frame.
- **The stance.** Aggregates here are traps and singles are findings. The mean review duration
  is 31 days; one division supplies 68% of everything above 90.

## Where these land

Findings are tagged with the seats they reach. The tags are a reading aid for this document and
nothing more.

- **`STD`** — Director, Office of Building Standards. Signs the annual service standards notice
  and the claim in it that has to survive being challenged.
- **`INT`** — Chief, Intake Division. Owns the intake procedure and the complexity tier a filing
  is assigned at the counter.

## The findings

**F1. Five of the last 22 months breached the published 30-day standard.**
Magnitude: 5 of 22 months, over reviewed filings, measured 2026-08-25. Chart: `opt-a2`.
Shape: level break inside a smoothed window. Posture: standard.
Who acts:
- `STD` — the breach count is the figure the notice it signs currently absorbs into a mean.
- `INT` — every breached month is a month intake set an expectation the review could not meet.

Tasker:
01 Pull the 5 breached months and the reviewed filings inside each.
02 Add a monthly breach count to the notice beside the fiscal-year mean.
03 Report months and counts, never a percentage of filings.
Produces: a monthly series the fiscal-year mean currently hides.
Kills it: "the office is missing its deadline." Provenance: derived.
**Policy change** — Owner: `STD`, which signs the notice and imposes its content.
Written into: the annual service standards notice, the reporting paragraph.
Downstream — *exact, counted over the 22 months in the window*: the notice carries 5 breached
months a reader can currently only infer, and the 22-month window stops averaging them away.

## Context

**Filing volume rose 14% across the window.** 18,402 filings, over all filings, measured
2026-08-25. Chart: `opt-a1`.

## Drawn to be struck

**Mean review duration by division.** `opt-b4`. It invites the reading that the slowest
division is the least efficient. Struck: three of the four divisions do not handle the
complexity tier that produces every duration above 90 days, so the chart ranks caseload mix.

## The refusals

| the wrong sentence | what to say instead |
|---|---|
| "The office is missing its deadline." | "The office met the standard in 17 of 22 months, and the fiscal-year mean hides the five it did not." |

## Considered and declined

- **Reviewer-level duration.** Declined on posture: the only interesting version ranks 31
  named individuals over uneven caseloads, which compares nothing and names people.

## What this data must refuse

- **Whether faster review produces worse buildings.** No outcome surface exists; it would need
  the inspection record joined on permit id, which is not currently linked.

## The documents these rewrite

| document | owner | changes | findings |
|---|---|---|---|
| the annual service standards notice | S1 | 3 | F1, F3, F4 |
| the intake procedure | S2 | 1 | F2 |

Four of the five changes land on two documents and three on one. The office does not need five
decisions; it needs one revision of the service standards notice.

## The mandate this stands on

- **S1** Director, Office of Building Standards. Signs the annual service standards notice.
- **S2** Chief, Intake Division. Owns the intake procedure; recommends, does not impose.
- **D1** Building Standards Ordinance § 4.2(c), which sets the 30-day standard and requires
  the annual notice.
```
