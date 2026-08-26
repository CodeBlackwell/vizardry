# The redline format

One page. Nine sections, in this order, and a card whose fields are grouped in four. The shape
is what makes the report checkable: `bin/verify-redline.mjs` reads these fields directly, so a
card missing one is a card the gate rejects.

```
# The redline: <what must change, and who changes it>

<the frame: one paragraph. The recipient, the inventory counts, the verification debt,
and the denominators. Every count here is checked against the cards below.>

## What every figure stands on
## The findings
## Context
## Drawn to be struck
## The refusals
## Considered and declined
## What this data must refuse
## Where the changes land
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
| **Seat** | the address from the mandate docket, `S1`, `S4` | a seat invented for this finding, or a job title with no docket entry behind it |
| **Tasker** | what the seat is asked to do, and **what that produces** | a task with no artifact at the end of it |

**The honesty** — what would make this wrong.

| field | what it holds | what fails |
|---|---|---|
| **Kills it** | the most quotable **wrong sentence** this finding invites, verbatim | a category of error rather than a sentence; write what a reader would actually say |
| **Provenance** | `raw`, `derived`, or `model-judged` | leaving it off a model-judged finding, which is the only case where it matters |

**The change** — the sentence and its home.

| field | what it holds | what fails |
|---|---|---|
| **Policy change** | three sub-fields, all three required: **Owner** (the seat that signs), **Written into** (the named document, by section where one exists), **Downstream** (the consequence, labelled `exact` or `estimated`) | "someone should" — a change with no document is advice, and a downstream with no label is a number nobody can check |

A worked card:

> **F4. Full and open competition drew one offer on a quarter of these awards.**
> Magnitude: 61 of 237 awards, 25.7%, over the competed denominator, measured 2026-08-25.
> Chart: `opt-c3`. Shape: outcome contradicting posture. Posture: standard. Seat: S2.
> Tasker: the competition advocate's annual report already covers task orders above a
> threshold; extend its coverage note to single-offer awards under full and open procedures,
> which produces a count nobody currently publishes. Kills it: "a quarter of competitions were
> rigged." Provenance: raw. **Policy change** — Owner: S2. Written into: the annual competition
> advocate report, the coverage paragraph. Downstream: about 25 awards a year carrying roughly
> $348M, `estimated` from the three-year mean.

**Posture is not decoration and the gate reads it.** A finding marked `actor` names a party, and
a party can be wrong about being named in a way an office cannot be wrong about owning a
document. Every `actor` finding must survive the question "would I publish this sentence with
the name in it," and a report whose findings are all `actor` has usually found a scandal rather
than a policy.

**A finding inherits the report's debt by reference rather than restating it** — "under the
verification debt in the frame". Restating is how two copies drift apart.

## Context

Measurements that place the findings without being findings. A context entry needs **Headline**,
**Magnitude** and **Chart**, and nothing else: it routes to no seat, and that is precisely what
makes it context rather than a finding.

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

## Where the changes land

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

A finding carries an `id` plus the ten fields: `headline`, `magnitude`, `chart`, `shape`,
`posture`, `seat`, `tasker`, `killsIt`, `provenance`, and `policyChange` — whose own keys are
`owner`, `writtenInto`, `downstream` and `label`.

`frame.inventory` holds the five counts under exactly those bucket names, because the gate
compares each against the entries actually present. `chart` names a top-level key of
`chartdata.json`, which is what makes "the chart exists" a set operation rather than a promise.

## The rules a redline is read back against

Before handing it over, read it against these and fix what fails:

- **Every number in the prose exists in `chartdata.json`.** This is the single check that kills
  the failure mode these reports die of. A figure that reached the page without passing through
  the data file is a figure nobody computed. When a finding needs a number nobody drew, run the
  query and **write the result back into `chartdata.json`** before writing the sentence.
- **Every policy change names an Owner and a Written into.** Both, always. One without the other
  is a change with no address.
- **Every Downstream is labelled `exact` or `estimated`.** An unlabelled magnitude is read as
  exact, and most of them are not.
- **Every seat resolves** to an entry in the mandate docket. A seat that does not is a finding
  routed to nobody.
- **Every model-judged finding appears in the frame's verification debt.** Stated once globally,
  admitted once on the card.
- **Every refused sentence has a replacement sentence.** Not a caveat. A sentence.
- **The inventory reconciles.** The counts in the frame equal the cards on the page.
- **The roll-up covers every policy change exactly once.**
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

## The findings

**F1. Five of the last 22 months breached the published 30-day standard.**
Magnitude: 5 of 22 months, over reviewed filings, measured 2026-08-25. Chart: `opt-a2`.
Shape: level break inside a smoothed window. Posture: standard. Seat: S1.
Tasker: the annual service standards notice reports a fiscal-year mean; add the monthly
breach count beside it, which produces a figure the fiscal-year mean currently absorbs.
Kills it: "the office is missing its deadline." Provenance: derived.
**Policy change** — Owner: S1. Written into: the annual service standards notice, the
reporting paragraph. Downstream: 5 of 22 months, `exact`.

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

## Where the changes land

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
