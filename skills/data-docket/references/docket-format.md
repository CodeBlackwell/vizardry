# The docket format

One file. Seven sections, in this order, and four fields on every entry. The shape is what makes
it machine-usable downstream: `/datastorm` reads the entry fields directly into option cards, so
an entry missing a field is an option card missing a field.

```
# The data docket: <what this data is>

<preamble: one paragraph. What one entry is, the date the file was begun, and the
rule that it grows in place — git log is the history, so no changelog lives inside it.>

## The surfaces a query can stand on
## The rules that bind every query
## The vocabulary            (only if the domain has terms a reader would get wrong)
## Askable now
## One chart, several questions
## Newly askable, not yet measured
## Not askable, and why
```

**Three buckets, not two** — and the docket's namesake is the reason they are worth keeping
apart. A matter is on the docket, or admitted and not yet heard, or dismissed with the reason
recorded so it is not refiled. A question is askable (ground exists and a number has been taken),
newly askable (ground exists, nobody has measured it), or not askable (no ground, or killed).
Collapsing the middle into either neighbour is the common mistake: filed as askable it implies a
measurement that was never run, and filed as not askable it hides work that is one query away.

## The surfaces

A table per data source, or one table if there is one source. Per surface: its **grain** (what
one row is, in words), and the **columns questions actually use** — not every column, the ones
that appear in the entries below.

Then the fill and coverage facts, measured, with the date they were taken:

> Metadata fill, measured at the 2026-08-21 rebuild over 107,339 rows: `program` and `date`
> 107,339/107,339, `psc` 101,329 (94.4%), `naics` 102,636 (95.6%).

Every later percentage stands on one of these, so they are stated once here rather than
re-derived per entry. Where a surface is derived — a join, an export, a cached extract — say so
and say what it is **stale relative to**. A derived surface that predates a correction will
silently disagree with the live one, and the entry that trusts the wrong copy is the one that
gets quoted.

## The rules that bind every query

The short list that binds everything below, stated once. Typically:

- **The denominators**, enumerated, each with what it bounds, and an explicit statement that
  they are not interchangeable — **grouped by frame** where more than one exists. A frame is the
  population a set of denominators was taken over. When the same totals are re-measured over a
  wider population, that is a second frame and not a replacement: both sets stay in the file,
  every figure states which frame it sits in, and a figure from one frame may not be quoted
  against the other. Silently overwriting the old numbers is how a rate acquires the wrong
  denominator months later, when nobody remembers the population changed.
- **What may never be summed** and why — rows that double-count, pair counts that grow
  quadratically with one entity's reach, per-category counts that exceed the distinct total.
- **Distinctions that may never be collapsed** — absent versus blank versus zero, declared-none
  versus silent, censored versus complete.
- **Known label hazards** — the columns that have already fooled someone, named.
- **Standing verification debt** — what has been checked by a human, what has not.

This section is the one `/datastorm` mines hardest, because these are the failure modes that
apply to *every* chart rather than one.

## The vocabulary

Only when the domain has terms a competent outsider would read wrong. One line each. Skip the
section entirely rather than padding it with definitions anyone could guess.

## Askable now

Numbered `Q1`, `Q2`, ... The number is an address other documents cite, so **numbers are never
reused and never renumbered** — a retired question is struck in place, not deleted.

**Questions merge as understanding improves, and the merge is recorded rather than performed.**
Two things happen to an entry that turns out not to be its own question:

- **Absorbed.** Two columns over the same population are one question, not two. The absorbed
  entry's measurement moves *inside* the absorbing entry under a heading naming its old number
  — "The forward column (Q22, absorbed here)" — so a citation of Q22 still resolves and the
  number is never reissued.
- **Demoted to evidence.** A question that verifies to a negative can survive as an evidence
  tier for a broader one: "Q2 and Q3 are this question's evidence tiers now — byte-identical
  strongest, clause fingerprint weaker, deliverable pair weakest." Rank the tiers. The entry
  stays in place so the negative is not re-proposed, and gains a line saying where its
  machinery went.

**An entry may inherit another's honesty conditions by reference** rather than restating them —
"inherits Q7's verification debt whole", "under Q8's rule". Restating is how two copies drift
apart; a reference cannot.

Each entry: a bold question **phrased the way its asker says it out loud**, then four fields.

> **Q7. How much moved on silent rights defaults?** Ground: `posture` joined to dollar keys.
> Query: keys whose election set is a subset of {unstated, commercial}, dollar-dedup sum,
> filtered by `naics2`. Measured 2026-08-19: $617M of $702M rights-bearing matched dollars moved
> with no stated election (250 of 262 hygiene-clean keys). Honesty: quote the sector-conditioned
> figure; classifier precision is the binding limit.

| field | what it holds | what fails |
|---|---|---|
| **Ground** | the surfaces and columns this stands on, named | "the database" — if the columns cannot be named the question is not askable yet |
| **Query** | the shape of the computation: group by what, filtered how, aggregated how | a restatement of the question in different words |
| **Measured** | the answer with **n**, **frame**, and **date** — or the words "not measured" | a number with no denominator, or one that was remembered rather than run |
| **Honesty** | what makes this number a lie: the proxy, the lag, the thin cell, the debt | omitting the field because none was found; say that instead |

An entry may carry more than four fields' worth of prose — a hard-won decomposition belongs
here in full — but never fewer.

**Prose above the entries carries the frame.** When a batch of measurements shares a caveat, say
it once before them rather than in each: "every measurement below dated 2026-08-20 or earlier
was taken over the Army-era corpus of 25,798 rows, and the corpus is now 107,339." That
paragraph is worth more to a chart than any single entry, because it decides which numbers may
appear on the same axis.

## One chart, several questions

**The section a visualization tool reads hardest, and the one a docket usually lacks.** Several
entries above are often one picture: a rate, the volume behind it, and the exposure behind that
are three questions and one denominated flow. Name those pairings here, with what each panel
holds.

Three rules make the section safe to act on:

- **A shared chart is not a merge.** Each question keeps its own denominator and its own honesty
  conditions, and the chart states its frame beside it. A combined view is exactly where a
  population claim sneaks in — three panels sharing an axis read as sharing a denominator — so
  the frame is not optional decoration.
- **Pick the grain where the counts are additive.** When per-category counts sum past the
  distinct total at one grain and not at another, the chart is drawn at the grain where the
  arithmetic works, and the entry says which and why. This one line prevents more bad charts
  than anything else in the file.
- **These are arguments, not build targets.** A pairing says two questions belong in one picture.
  It does not say the picture has been designed, and it does not bind whoever draws it.

Also record **singles with a stated chart form** — an entry whose owner already knows the shape
it wants, with the prohibition attached: "renders as a family-by-office matrix whose edge weight
is the evidence tier, counting digests or offices and never pairs."

## Newly askable, not yet measured

Questions whose ground arrived recently — a new column, a new join, a widened population — and
which nobody has run yet. **No number, no `Q` address**: a first recorded measurement is what
promotes an entry into "Askable now" and earns it one.

Each carries the ground it would stand on and, more importantly, the honesty conditions it
**inherits on arrival**, by reference to the entries it descends from. Those are knowable in
advance, and they are the cheapest thing to write down while the question is still hypothetical.

This is the section most useful to someone deciding what to build next, because every line is a
question with the ground already under it.

## Not askable, and why

A bullet per killed question, with the reason. Four kinds, and each earns its place:

- **Killed by measurement** — asked, answered, and the answer was that the question was wrong.
  Name what killed it, so it is not re-proposed.
- **Blocked by ground** — the surface does not exist yet. Say which surface it would need; this
  is a data-collection request in disguise.
- **Out of scope by decision** — someone decided this is not what the work is about. Say who
  decided and when.
- **Would burn something** — a pre-registered study whose arms cannot be peeked at, or an
  analysis a stakeholder must see first.

**This section is never empty in a real docket.** An empty one means the questions were
collected rather than tested.

## A skeleton

Illustrative shape only — the numbers below are invented and no dataset is behind them.

```markdown
# The data docket: support tickets, 2024 to date

Begun 2026-08-22. One entry per askable question: the ground it stands on, the query shape,
and the honesty conditions. A question whose ground exists but whose numbers are not yet taken
waits in the newly askable section; a question that cannot be asked is listed at the bottom
with the reason, so it is not re-proposed. Numbers are stable and never reused. Grows in
place; git log is the history.

## The surfaces a query can stand on

**`tickets.csv`**, one row per ticket:

| column | grain note | used by |
|---|---|---|
| `opened_at` | UTC, 100% filled | Q1, Q2 |
| `first_reply_min` | null where never answered, 8.4% | Q1, Q2 |
| `queue` | 11 values, but 3 are pre-2025 spellings of 2 of the others | newly askable |

Fill measured 2026-08-22 over 41,203 rows.

## The rules that bind every query

- **Two denominators, never interchangeable**: all tickets (41,203) and answered tickets
  (37,742). Response-time rates run over the second; volume claims over the first.
- **Never total per-tag counts.** A ticket carries 0 to 6 tags, so tag counts sum to 61,880
  against 41,203 tickets. Count tickets, or count tags; a total measures neither.
- **Null `first_reply_min` is never zero.** It means never answered, which is the finding.

## Askable now

**Q1. How long does a customer wait for a first human reply?** Ground: `opened_at`,
`first_reply_min`. Query: distribution of `first_reply_min` over answered tickets, by week.
Measured 2026-08-22: median 47 min, p90 6.2 h, n=37,742. Honesty: the 8.4% never answered are
excluded and are the worst cases, so every percentile here is optimistic; state the exclusion
with the number, and see Q2, which is that exclusion asked as its own question.

**Q2. How often does a ticket never get a human reply at all?** Ground: null `first_reply_min`.
Query: null share over all tickets, by week. Measured 2026-08-22: 3,461 of 41,203 (8.4%), rising
from 5.1% in the first quarter to 11.9% in the last. Honesty: a null is never-answered *or*
never-logged, and the two are not separable on this surface; the rise is the finding and its
cause is not.

## One chart, several questions

- **The wait panel (Q1 with Q2).** One picture: the wait distribution, with the never-answered
  share drawn as the band the distribution excludes rather than as a second chart. The two
  denominators differ on purpose — Q1 runs over answered tickets, Q2 over all of them — so both
  are labeled on the panel. Drawn separately, the reader reads the median as the experience of a
  typical customer, which it is not.

## Newly askable, not yet measured

- **Which queue is drowning?** Ground: `queue`, `first_reply_min`; p90 wait by queue, weekly.
  Nobody has run it. Inherits Q1's exclusion whole, and needs the three legacy spellings merged
  first or two real queues each appear twice at half volume.

## Not askable, and why

- **Whether faster replies retain customers.** No churn column on any surface; it would need the
  billing export joined on account id, which does not exist yet.
- **Agent-level performance.** Out of scope by decision, 2026-08-22: the queue is the unit of
  management here, and per-agent numbers over 11 queues of uneven difficulty compare nothing.
```
