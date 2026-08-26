# The mandate format

One file. Ten sections, in this order, and a fixed field set on every entry. The shape is what
makes it machine-usable downstream: `/redline` reads the entry fields directly into a finding's
routing block, so an entry missing a field is a finding missing a field, and a finding missing
its seat is not a finding at all.

```
# The mandate docket: <whose mandate this is>

<preamble: one paragraph. What one entry is, the date the file was begun, and the
rule that it grows in place — git log is the history, so no changelog lives inside it.>

## The body, and the reach it has
## The rules that bind every finding
## The vocabulary            (only if the body has terms an outsider would read wrong)
## Standing directives
## Owed artifacts
## Seats that can impose
## Seats that can only recommend
## Routes: a seat, a directive, and a date
## Already in flight
## Named but out of reach, and why
```

The directives and the artifacts come **before** the seats because they are the ground a seat
stands on, and because a seat entry cites their addresses. A file that introduces `S1` before
`D1` reads backwards and, worse, invites a seat entry that describes its authority instead of
citing it.

**Three buckets, not two** — and the same reasoning that gives `/data-docket` its middle bucket
gives this file one. A seat **imposes** (it signs the instrument and the thing is done), or it
**only recommends** (it can put the change in front of someone who signs, and no further), or it
is **named but out of reach** (a finding reaches it and it cannot act, or it will not).
Collapsing the middle into either neighbour is the common mistake, and it fails in both
directions: filed as imposing, a recommending seat promises an action nobody there can take, and
the finding is discredited by the first person who reads it; filed as out of reach, it discards
a real route, and advisory seats whose recommendations trigger a mandatory written response are
frequently the cheapest route in the whole building.

## The body, and the reach it has

Two or three sentences, not a profile. What the organization is, under what enabling authority
it exists, **what it has jurisdiction over and what it does not**, and its rough size and shape
(how many seats of consequence, one board or several, appointed or elected).

The jurisdiction sentence does the most work in this section, because it is the cheapest possible
filter: it kills whole classes of finding before any of them are drafted, and it kills them for a
reason a reader can check rather than a reason a reader has to trust.

## The rules that bind every finding

The short list that binds everything below, stated once. Typically:

- **The jurisdiction edges**, named, with what sits on the other side of each and which body owns
  it. A finding across an edge does not need rerouting inside this file; it needs a different
  docket.
- **The instruments and their clocks**, contrasted. "A rule change needs a Board vote and a
  45-day comment period; a change in how a rule is applied needs one memo from the Executive
  Officer" is two routes with two speeds, and the difference is the single most useful sentence
  a finding-writer can read before drafting.
- **Where a signature and a pen are different seats**, stated once here and repeated as a field
  on the artifacts it affects. This is the failure that produces a perfectly routed finding
  arriving after the text is closed.
- **Standing quorum, cycle and calendar facts** — when the board meets, how far ahead an agenda
  closes, what a recess does to the clock. These are what turn a due date into a real deadline.
- **Standing verification debt** — which of the facts below are attested to a public source, and
  which are one representative's word.

This section is the one `/redline` mines hardest, because these are the constraints that apply
to *every* finding rather than one.

## The vocabulary

Only when the body has terms a competent outsider would read wrong: a "determination" that is
binding and a "finding" that is not, a "member" who is staff, a "docket" that means a comment
file rather than a case. One line each. Skip the section entirely rather than padding it.

## Standing directives

Numbered `D1`, `D2`, ... **Addresses are assigned in order of discovery, never reused and never
renumbered.** A repealed directive is struck in place with the repeal date, because a finding
written last quarter cites it and a reader needs the citation to resolve.

> **D2. Calder County Code §41-8(c), adopted 2019, amended 2023.** Binds: S1; obliges. Clock:
> 45-day comment period on any rule amendment, no recurrence. Amendable by: the Board of
> Supervisors, not the District Board. Attested: county code portal, read 2026-08-25.

| field | what it holds | what fails |
|---|---|---|
| **Citation** | instrument, section, **subsection**, adoption date, and the date of the version you read | "their inspection policy" — a described directive is not a directive, and a finding standing on one stands on nothing |
| **Binds** | which seats (`S` addresses), and whether it **obliges or merely permits** | a permissive clause quoted as a duty; "may" and "shall" are different findings |
| **Clock** | the deadline, the recurrence, or the explicit words "no clock" | inventing a cadence from the fact that the body has published three of something |
| **Amendable by** | who can change this text, and through what process | leaving it off, which lets a finding propose a change to a directive the recipient cannot touch |
| **Attested** | the source and the date read, or the representative and the date, marked unverified | a citation nobody opened |

**A directive with no clock is a weaker directive and the entry says so** in the Clock field
rather than by omission. Both kinds belong in the file: the clocked ones are where a magnitude
becomes a schedule, and the unclocked ones are still the authority a seat acts under.

Where a directive is **fixed** — amendable only by a legislature, a voter initiative, a level
this body cannot reach — say so in Amendable by. That single word converts the directive from a
possible target into a permanent constraint, which is exactly what a finding-writer needs to
know before spending a paragraph on it.

## Owed artifacts

Numbered `A1`, `A2`, ... Same address discipline.

> **A1. Annual Monitoring Report.** Owner: S1 signs, S4 drafts. Compelled by: D1 §12(b)(4).
> Cadence: annual, published each March. Next edition: March 2027, text set by January 2027.
> Insertion point: Section 4, "Inspection coverage and gaps", which already carries a per-source
> table. Attested: the March 2026 edition, read 2026-08-25.

| field | what it holds | what fails |
|---|---|---|
| **Owner** | the seat that signs (`S` address) and, **if different, the seat that drafts** | naming only the signer, which is how a finding arrives after the text is closed |
| **Compelled by** | the directive that requires it (`D` address), or the explicit words "published by practice, not compelled" | assuming a report is required because it exists; a voluntary publication can stop without notice |
| **Cadence** | annual, quarterly, per-event, one-off — and how many editions have actually appeared | a stated cadence contradicted by the publication record; say the record |
| **Next edition** | the publication date **and the date the text must be in hand**, or the explicit words "no next edition" | one date where there are two; the printed date is never the deadline that matters |
| **Insertion point** | the named section a sentence would go into, and what that section already contains | "the report" — a named document without a named section is half an answer |
| **Attested** | the last edition actually read, with the date | describing a document from its title |

**An artifact with no next edition is a much weaker target, and the file says which is which.**
A document already owed on a known date is the cheapest place in the world to put a sentence,
because the drafting, review, sign-off and publication are already funded and scheduled. A
document with no next edition needs someone to decide to open it first, and that decision is a
second finding nobody wrote. Never list the two as though they were the same kind of
opportunity.

## Seats that can impose

Numbered `S1`, `S2`, ... Same address discipline. The address space is **shared across both seat
buckets** and assigned in order of discovery, so `S3` may sit above `S2` in the file; that is
correct and is what keeps a citation stable when a seat is later reclassified.

Each entry: the seat in bold, **by title and office, never by the person's name**, then six
fields.

> **S3. The Executive Officer.** Node: reports to S1; every section chief reports to this seat.
> Power: imposes, by guidance memo, over how an existing rule is applied; last exercised three
> times in 2025, so the power is live and not nominal. Under: D1 §12(b), delegation clause.
> Pen: A2. Limits: a memo cannot change an inspection frequency set in D1; that is a legislative
> change. Attested: stated by the public information officer 2026-08-24, confirmed against the
> published memo index.

| field | what it holds | what fails |
|---|---|---|
| **Node** | who it reports to, who reports to it, which peers can block it | a level, with no relations; "senior" routes nothing |
| **Power** | **impose or recommend**, the **instrument** it signs, and **when it was last used** | a power asserted with no instrument, or with no exercise date — a dormant authority is a recommendation wearing a statute |
| **Under** | the directives (`D` addresses) that grant it, cited to subsection | "it's their remit" |
| **Pen** | the artifacts (`A` addresses) it signs, and separately the ones it drafts | conflating the two; they are frequently different seats and always different deadlines |
| **Limits** | the ceiling, the delegation floor, what needs a level above, the jurisdiction edges that bind this seat specifically | an empty field; say "no limit found" if that is the truth, because unfound and absent are different claims |
| **Attested** | the public source and read date, or the representative and date, marked unverified | a seat assembled from what bodies like this one usually have |

A seat entry may carry more than six fields' worth of prose — a hard-won account of how a power
is actually exercised belongs here in full — but never fewer.

**Prose above the entries carries the frame.** When a batch of seats shares a caveat, say it once
before them: "every seat below was confirmed against the March 2026 minutes; the two appointed
in June are attested only to the appointment notice."

## Seats that can only recommend

Same six fields, same address space, and **Power always names what the recommendation triggers.**
That is the field that decides whether the seat is worth routing to at all. "Written
recommendation entered into the board packet, and D2 §41-8(c)(2) requires the board to respond in
writing to each one" is a real route with a forcing function. "Advises informally" is a seat that
belongs in the next section but one.

The bar for this bucket is deliberately generous. **A seat that can only recommend still
belongs, labelled.** `/redline` writes a different sentence for it — a recommendation rather
than a tasking — and that is a formatting decision downstream, not a reason to drop the seat.

## Routes: a seat, a directive, and a date

**The section `/redline` reads hardest, and the one a mandate file usually lacks.** Several
entries above are usually one route: a seat that can act, the directive it acts under, and the
document with the next date on it. Name those combinations here, with what each one costs.

Three rules make the section safe to act on:

- **A route names every seat it crosses and the earlier of its dates.** When the signer and the
  drafter differ, the route's real deadline is the drafting date, and the entry states that date
  rather than the published one. A route with only the publication date on it is the one that
  arrives after the text is closed.
- **State the route's speed and its durability together.** The fastest route is often the
  weakest: a memo needs no vote and no comment period, and a memo is undone by a memo. A vote is
  slow and holds. `/redline` chooses between them per finding, and it cannot choose without both
  facts on the page.
- **These are routes, not findings.** A route says a seat, a directive and a document hold
  together. It does not say what should be written, and it does not bind whoever writes it.

Also record **seats with a standing invitation** — a comment docket open now, a scheduled
listening session, an advisory committee soliciting input — with the closing date attached.
Those are routes with an expiry, and they are the only entries in the file that go stale on a
known day.

## Already in flight

A bullet per matter already moving, with the date it opened and the date it closes or lands.
Three kinds, and each changes what a finding becomes:

- **Open for comment.** A finding on this subject is not a new proposal, it is a comment, and it
  has a deadline. Write the deadline.
- **Already accepted, not yet executed.** A recommendation the body has adopted and scheduled. A
  finding aimed here is aimed at something already moving; the useful finding is about the
  execution, not the decision.
- **Revision already scheduled.** A document or rule with a reopening on the calendar. This is
  the strongest kind of target in the file, because the pen is about to be picked up anyway.

**A finding aimed at something already being fixed is stale on arrival**, and this is the section
that catches it before it ships rather than after someone points it out.

## Named but out of reach, and why

A bullet per seat a finding can reach and that cannot act on it. Four kinds, and each earns its
place:

- **Reachable, no authority** — it will read the finding and can do nothing about it. Say what it
  *can* do, because that is usually a different and smaller finding.
- **Out of jurisdiction** — the matter belongs to another body. Name that body; this is a
  different docket in disguise, not a dead end.
- **Refuses by policy or by decision already taken** — the body has decided this is not what it
  does. Say who decided and when, so it is not re-proposed next quarter.
- **Unreachable** — no public contact, no filing route, no meeting a finding can enter. Rare, and
  worth distinguishing from the others because it can change.

**This section is never empty in a real docket.** An empty one means the seats were collected
rather than tested.

## A skeleton

Illustrative shape only — the body, the citations, the dates and the seats below are **invented**,
and no real organization is behind any of them.

```markdown
# The mandate docket: the Calder County Air District

Begun 2026-08-25. One entry per seat: where it sits, what instrument it signs, the directive
that gives it the power, the documents it holds the pen on, and what it cannot do. A seat that
can only recommend is filed as such rather than promoted; a seat a finding can reach but that
cannot act is listed at the bottom with the reason, so it is not re-routed. Addresses are
assigned in order of discovery and never reused. Grows in place; git log is the history.

## The body, and the reach it has

The Calder County Air District, a county body created under the State Air Act of 1977, with
permitting and inspection authority over stationary sources within the county and **no
authority over mobile sources**, which are the state board's. Roughly 40 staff, one appointed
Board of five, one Executive Officer, one standing advisory committee.

## The rules that bind every finding

- **Mobile sources are out of jurisdiction.** Roughly a third of county emissions sit there and
  none of it is reachable from this file; that is the state board's docket, not this one.
- **The Board imposes, the Executive Officer implements.** A change to a rule needs a Board vote
  plus a 45-day comment period; a change to how an existing rule is applied needs one memo.
  Roughly four months against roughly two weeks, and the memo is undone by a memo.
- **Signature and pen are different seats on A1.** S1 signs the Annual Monitoring Report and S4
  drafts it. A finding sent only to S1 arrives after the text is set.
- **The Board meets monthly and its agenda closes 10 days ahead.** Anything needing a vote in a
  given month must be with staff two weeks before that.
- **Verification debt:** D1, D2, A1 and S1 are attested to published sources. S3's exercise
  history is one representative's word, confirmed only against a public memo index.

## Standing directives

**D1. State Air Act of 1977, §12(b).** Binds: S1, S3; obliges. Clock: four source inspections
per year, per permitted source, unbroken since 1977. Amendable by: the state legislature only,
so this is a fixed constraint and never a target. Attested: state code as published, read
2026-08-25.

**D2. Calder County Code §41-8(c), adopted 2019, amended 2023.** Binds: S1, S2; obliges. Clock:
45-day comment period on any rule amendment; no recurrence. Amendable by: the county Board of
Supervisors, not the District Board. Attested: county code portal, read 2026-08-25.

## Owed artifacts

**A1. Annual Monitoring Report.** Owner: S1 signs, S4 drafts. Compelled by: D1 §12(b)(4).
Cadence: annual, 9 consecutive editions. Next edition: published March 2027, text in hand by
January 2027. Insertion point: Section 4, "Inspection coverage and gaps", which already carries
a per-source count table. Attested: the March 2026 edition, read 2026-08-25.

**A2. Executive Officer's guidance memos.** Owner: S3 signs and drafts. Compelled by: nothing;
published by practice. Cadence: irregular, three in 2025, one in 2024. Next edition: none
scheduled, so this is a weak target and a finding aimed here waits on a decision nobody has
made. Insertion point: whole document. Attested: the District's memo index, read 2026-08-25.

## Seats that can impose

**S1. The District Board (five appointed members, chaired).** Node: top of the District;
reports to the county Board of Supervisors on budget only, not on rules; every section chief
reaches it through S3. Power: imposes, by recorded vote on a rule amendment; exercised twice in
2025. Under: D1 for the duty, D2 for the process. Pen: signs A1, drafts nothing. Limits: cannot
amend D1, cannot act on mobile sources, cannot vote before the 45-day comment period has run.
Attested: governance page and the March 2026 minutes, read 2026-08-25.

**S3. The Executive Officer.** Node: reports to S1; every section chief reports to this seat.
Power: imposes, by guidance memo, over how an existing rule is applied; last exercised three
times in 2025, so the power is live and not nominal. Under: D1 §12(b), delegation clause. Pen:
signs and drafts A2. Limits: a memo cannot change an inspection frequency set in D1, and cannot
create a duty the rule does not already carry. Attested: stated by the public information
officer 2026-08-24, confirmed against the published memo index.

## Seats that can only recommend

**S2. The Technical Advisory Committee.** Node: advises S1, appointed by S1, meets quarterly.
Power: recommends only, by written recommendation entered into the Board packet; **D2
§41-8(c)(2) requires the Board to respond to each one in writing**, which is what makes this
seat worth routing to. Under: D2 §41-8(c)(2). Pen: none, but its recommendations are appended
verbatim to A1. Limits: no vote, cannot set the Board's agenda, cannot compel anything beyond
the written response. Attested: committee charter, read 2026-08-25.

## Routes: a seat, a directive, and a date

- **The inspection-coverage route (S1 under D1, written into A1).** The Board can direct that
  Section 4 of the Annual Monitoring Report state per-source inspection counts against D1's
  minimum of four. Two seats: S4 drafts and S1 signs, so the real deadline is **January 2027**,
  not the March publication date. Slow and durable: it survives a change of Executive Officer.
- **The application route (S3, no directive change, into A2).** Anything about how an existing
  rule is applied goes to S3 as a memo request, needing no vote and no comment period. Fastest
  route in the file and the weakest: a memo is undone by a memo, and A2 has no next edition, so
  this route also needs S3 to decide to publish at all.
- **Standing invitation, expires 2026-09-15.** The flare-monitoring comment docket (see below)
  accepts written comment from anyone. No seat required, and the only route here that goes
  stale on a known day.

## Already in flight

- **A rule amendment on flare monitoring opened for comment 2026-08-01**, closing 2026-09-15.
  A finding on flare monitoring is a comment, not a proposal, and it has that deadline.
  Anything else routed to S1 queues behind it.
- **S2's 2026 recommendation on continuous monitoring was accepted by S1 in June** and is
  scheduled for a rule amendment in 2027. A finding aimed at continuous monitoring is aimed at
  something already moving; the open question is execution, not the decision.

## Named but out of reach, and why

- **The county Board of Supervisors.** Reachable, and it appoints S1, but its authority over the
  District runs to the budget only. A rule finding sent here is a jurisdiction error. It *can*
  amend D2, which is a different and much larger finding.
- **The state board.** Holds mobile sources, where a third of county emissions sit. Out of
  jurisdiction: it needs its own docket with its own seats, not a reroute from this one.
- **The Permitting Section Chief.** Named and reachable, but the seat's authority runs to
  individual permits, not to the rules behind them. A finding phrased as a rule change dies
  here; the same substance phrased as a permit-condition change is S3's, not this seat's.
- **Enforcement penalties.** Refused by decision, recorded in the March 2024 minutes: the Board
  resolved that penalty levels are the state's to set and it will not entertain proposals.
```
