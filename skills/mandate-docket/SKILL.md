---
name: mandate-docket
description: Work out with someone, through a short multiple-choice survey, who in a recipient body can actually act, what each seat holds the pen on, and which documents it already owes — then write it down as a mandate docket. Use before /redline, which will not run without one, or when someone says "who would this even go to", "what can they actually change", "grill me about the recipient", or wants the routing behind a set of findings written down.
---

# The mandate docket

Produce **one markdown file** naming who can act inside a recipient body, what instrument each
seat signs, which standing directive gives it that power, and which documents it already owes on
a known date. Then hand it to `/redline`, which turns findings into policy changes routed to
named seats.

A `/redline` finding has four fields: **who acts**, **the document the change is written into**,
**the change itself**, and **a downstream magnitude**. Only the change and the magnitude can be
derived from data. The other two — the seat and the document — cannot be derived from a dataset
at any price, because they are facts about an institution rather than about a table. That is the
entire reason this skill exists, and it is why **`/redline` refuses to run without a mandate
docket.** Not degrades, refuses. A finding without a seat is advice, and advice was already
free.

**The grilling is the method, not a formality.** Someone who is not pushed hands over an org
chart: eight names, no instruments, no citations, no calendar. That list makes routing *worse*,
because it looks like an answer and every finding built on it lands in the wrong inbox with a
confident label on it.

The interview is `/grilling`'s — design tree, frontier, a recommended answer under every
question, and no action until the user confirms a shared understanding. This skill is that
engine pointed at a recipient, the way `/data-docket` is that engine pointed at a dataset: it
supplies the tree to walk and the artifact to write at the end.

## A mandate is not a client

State this early to whoever you are grilling, because it is the distinction the whole file rests
on and almost everyone gets it backwards in both directions.

**The docket needs three things: named seats, directives citable by section, and documents
already owed.** It does not need anyone to have hired you, and it does not need a relationship,
an introduction, or a contract. **Public law supplies all three for free.** A city charter
section with a filing deadline is a directive with a clock on it. A statute that has required
four inspections a year since 1977 is a standing duty with an unbroken record. A regulation
whose annual report a named office already publishes is a document with a next edition, an
author, and a section where a sentence fits. None of that requires permission and all of it is
citable.

The bar is a **citable mandate, not a commercial relationship.** A funded engagement with no
citable directive is a weaker mandate than a statute nobody has ever paid you to read.

The failure this guards against runs the other way. **Inventing a recipient is what turns a
policy change back into advice.** A plausible-sounding office, a directive paraphrased instead
of cited, an annual report assumed to exist because bodies like this one usually publish
something — each of those produces a finding that reads as routed and is not, which is strictly
worse than a finding that admits it has nowhere to go.

**So the skill refuses rather than synthesizes.** If, after the interview, no seat can be named
with a power and no directive can be cited by section, stop and say so plainly: this recipient
has no mandate docket, and `/redline` will not run. Do not write a file with a placeholder seat
in it. Do not write a file whose directives are described rather than cited. An empty refusal is
a finding of its own and it costs nothing; a fabricated docket costs whoever acts on it.

## The eight things a document cannot tell you

Everything you are grilling for falls in here. Track which are still empty; that is the
frontier.

1. **The seat, and whether it recommends or imposes.** Not the person, the seat: the title, the
   office, and the **instrument it signs** — a vote, an order, a rule, a memo, a letter. The
   difference between imposing and recommending decides whether a finding is a tasking or a
   recommendation, and it is the single most load-bearing fact in the file. **A seat that can
   only recommend still belongs, labelled.** Then the harder half, which no charter contains:
   **has it ever.** A power that is formally present and has not been exercised in twenty years
   is a recommendation wearing a statute, and only someone inside can tell you which one you
   are looking at.
2. **The node.** Where the seat sits: who it reports to, who reports to it, and which peers can
   block it. A finding routed one level too high dies in an inbox that receives four hundred a
   week. Routed one level too low it reaches someone who agrees with it and cannot act. The node
   is what makes the difference visible before the finding is written rather than after it is
   ignored.
3. **The drafting hand behind the signature.** Who actually writes the text the seat signs. A
   commissioner who signs an annual report and never drafts a line of it is the right seat for
   authority and the wrong one for a sentence, and a finding sent only there arrives after the
   text is set. Ask directly; nobody volunteers it, and it is often a different office entirely.
4. **The standing directive, by section.** Not "the agency has a policy on this" but the
   citation: the instrument, the date, the subsection, and whether it carries a **deadline or a
   recurrence**. A directive with a date on it is what makes a downstream figure a schedule
   rather than a wish, because the arithmetic then attaches to a day someone is already
   obligated to meet. Ask also who can amend the directive itself, which is a different and
   usually higher seat than the one that operates under it.
5. **The owed artifacts, with cadence and next due date.** A document already owed on a known
   date is the cheapest place in the world to put a sentence, because the drafting, the review,
   the sign-off and the publication are all already funded and scheduled. Get the cadence, get
   the next edition, and get the **drafting window behind it** — the date the text has to be in
   hand, which is always earlier and is never the date printed on the document. **An artifact
   with no next edition is a much weaker target, and the file says which is which** rather than
   listing both as though they were the same kind of opportunity.
6. **What the seat cannot do.** Its ceiling, its delegation floor, the classes of action that
   require a level above it, and the jurisdictional edges. This is where a finding gets
   misrouted, and it is the field people leave empty because limits feel like an admission.
   Every real seat has one; a seat with no limit recorded has not been grilled.
7. **What is already in flight.** A rulemaking open now, a comment period closing next month, a
   recommendation already accepted and scheduled, a revision already underway. **A finding aimed
   at something already being fixed is stale on arrival**, and this is the field that catches it
   before it ships. It also converts work: a finding about a matter under active comment is not
   a new proposal, it is a comment, and it has a deadline.
8. **The refusals.** What this recipient will not act on — by policy, by jurisdiction, or by a
   decision already taken and recorded. Writing these down is what stops the same dead route
   being proposed again next quarter, and a jurisdiction refusal in particular saves a whole
   line of findings rather than one.

## The procedure

### 1. Find every citation yourself first

**Never ask what the public record can tell you.** Finding *citations* is your job; the
*judgements* are theirs. Asking "does the Board publish an annual report" spends their patience
on something you could have read in ninety seconds, and it costs you the credibility that makes
"has anyone actually used that power" land.

Pull what is published before you open a single question:

```
enabling statute   charter    municipal code    the code of regulations
org chart / "leadership" page    board minutes + agendas    meeting calendar
the last two editions of every report the body publishes    open comment dockets
```

Board minutes are the richest seam here. A vote recorded on a rule amendment tells you the seat,
the instrument, the quorum and the clock in one document, and a recommendation entered into a
packet with a written response tells you an advisory seat is worth routing to. Open comment
dockets are the second: they are item 7 in published form.

Every one of those arrives at the interview as a **claim to confirm or correct**, never as a
blank for them to fill. "I read §41-8(c) as requiring a 45-day comment period on any rule
amendment, which puts the real deadline in January rather than March — is that right?" is a
question they can answer in four seconds and correct precisely. "What is the process?" is a
question that costs them ten minutes and returns a paraphrase.

**Do not block on it.** Where subagents are available, send the record-pulling out as one and
open the first batch of questions in parallel. Only the questions downstream of a pending
citation wait, and the body stage needs no citations at all.

### 2. Survey them in multiple choice

**The interview mechanics here are `/grilling`'s, deliberately, and they are the same ones
`/data-docket` uses.** If that skill is installed, run it and let this file supply the two things
it does not have: the tree below, and the artifact at the end. Restated only as far as this skill
needs to stand alone:

Map the interview as a **design tree** with a **frontier** — every question whose prerequisites
are already settled. **Every question goes through `AskUserQuestion` as a multiple choice**, two
to four named options, **the recommended one first and labelled `(Recommended)`**, each option
naming its consequence rather than just its value. **One to four questions per call, by
judgement**: one alone when its answer would rewrite the others, up to four when they are
genuinely independent. **Never write an "Other" option** — it is supplied, and it is where the
correction you most need will arrive. `multiSelect` when the answers are not exclusive, which
here is most of them: which instruments a seat signs, which artifacts it touches, which limits
bind it. The seat's power is not multi-select; impose and recommend are different files.

**Re-derive the next batch from the answers you just got.** Learning that the Executive Officer
can move by memo without a vote retires half the questions about the Board's calendar and creates
a new one about what a memo cannot do.

The tree's rough order, in dependency order — **stages the walk passes through**, not a fixed
agenda:

**The body.** Which organization, under what enabling authority, over what jurisdiction. What it
is actually for, in their words. Who reads a finding first when one arrives cold. Everything else
hangs off these, which is why they are alone at the root.

**The seats.** Who holds what power, at what node, signing what instrument, and **when they last
used it**. Ask for the advisory seats by name too, because people volunteer only the ones with
votes, and an advisory seat whose recommendations get a mandatory written response is often the
cheapest route in the building.

**The directives.** What compels this body, cited by section. Which carry deadlines, which carry
recurrences, which are fixed constraints nobody in the room can amend. Ask "which of these has
a date in it" directly; that answer is what separates a schedule from a wish.

**The calendar.** What is owed, on what cadence, next due when, drafted by whom and by when.
Then the question people answer instantly and never volunteer: **where in the document would a
sentence like this actually go?** A named section beats a named document by a wide margin.

**The fences.** Ceilings, delegation floors, jurisdiction edges, and the refusals. What is
already in flight, which belongs here because it fences a route the same way a limit does.

**The routes.** Last, because it needs the whole file in view: **which seat, which directive and
which document are one route?** Ask it directly, then ask the follow-up that makes the answer
safe to act on: *does the seat that can act also own the pen on that document, or does the route
cross two seats?* Very often two, and that is the sentence that keeps a finding from arriving
after the text is closed.

**This is guidance, not a census.** The docket exists to let `/redline` route findings, and it
does that job at roughly four to ten seats with their directives and artifacts attached. **Stop
when what is left would not change where a finding goes** — which is sooner than an empty
frontier and always sooner than a complete org chart.

### 3. Push back

The grilling *is* the pushback. Four moves, used relentlessly:

- **A name is not a seat.** "Talk to Dana" names a person, not an authority. Ask what Dana signs
  and under what section, and write down *that*. If nobody can name the instrument, the seat
  belongs in the out-of-reach section until somebody can, however senior the name sounds.
- **"They have a policy on this" is not a directive.** Ask for the section, the date, and whether
  it obliges or merely permits. An uncited directive is an opinion with a letterhead on it, and
  a finding that stands on one is a finding standing on nothing.
- **A power nobody has exercised is a recommendation until proven otherwise.** Ask for the last
  time it was used and take the answer as stated. A seat with a live power used three times last
  year and a seat with the same power dormant since 1998 are different routes, and only the file
  can tell the difference because the charter cannot.
- **A seat with no limit named is not finished.** Every real seat has a ceiling and a floor. If
  neither of you can name one, say so in the entry rather than leaving the field off; an
  unfound limit and an absent one are different claims, and the first is where misrouting lives.

### 4. Write it

**Not before they confirm.** An empty frontier is your judgement that nothing is left unasked;
it is not their agreement. Summarize what you now believe — the seats and their instruments, the
directives with clocks, the next due dates, the routes, the refusals — in a dozen lines, and ask
whether that is a shared understanding. What comes back is usually one more correction, and it
is usually the one that moves a finding from the wrong seat to the right one. People revise a
document less honestly than they answer a question.

Then follow `references/mandate-format.md` — the sections, the fields per seat, directive and
artifact entry, and a worked skeleton. Write to `docs/mandate.md` if a `docs/` directory exists,
otherwise `mandate.md` in the working directory, unless they name a path.

Then read it back against these, and fix what fails:

- **Every seat entry has an instrument and a limit.** A seat that cannot name what it signs is
  not a seat; move it to "Named but out of reach" and say why.
- **Every directive is cited to a subsection with the date of the version read.** A directive
  described rather than cited does not go in the file.
- **Every artifact says whether it has a next edition**, and if it does, both the publication
  date and the date the text must be in hand. An artifact with no next edition is labelled as
  the weak target it is.
- **Every fact is attested**: verified from a named public source with the date it was read, or
  stated by a named representative on a date and marked unverified. Never a plausible third
  thing.
- **The "Named but out of reach" section is not empty.** If nothing was ruled out, no grilling
  happened — go back to the fences stage. Every real body has seats a finding reaches and that
  cannot act, and the ones that *look* actionable are exactly the expensive ones.
- **A seat that can only recommend is in the recommend bucket, not the impose bucket.** Filed as
  imposing, it promises an action nobody there can take.
- **Every route names the seats it crosses and the earlier of its two dates.** A route without
  the drafting date is the one that arrives after the document closed.

Hand back the path, the seat count by bucket, the earliest actionable due date in the file, the
sharpest thing you learned that the public record could not have told you, and anything they
left unknown.

## What /redline does with it

Say this when you hand it over:

**It routes.** The docket supplies the seat a finding names, the instrument that seat signs
(which decides whether the finding is written as a tasking or a recommendation), the document
the change is written into and the section of it, and the date the text must be in hand, which
is what converts a downstream magnitude into a schedule. Two sections carry more than the rest:
**"Routes"** hands over seat-plus-directive-plus-document combinations someone has already
confirmed hold together, and **"Already in flight"** is the list that kills stale findings
before they are drafted.

**It does not decide the finding.** `/redline` still derives the change and the magnitude from
the data and the data docket. A mandate docket with six seats does not mean six findings, and a
finding is not disqualified for landing on a seat nobody expected.

**When the two disagree, the record wins on citations and the docket wins on reachability.** If
the docket says a seat can amend a rule and the statute reserves that to a legislature, the
statute is right and the finding is rerouted. If the record shows a power on the books and the
docket says it has not been used since 1998, the docket is right and the finding is written as
a recommendation.

## Rules

- **Verified, attributed, or absent.** Every fact in the docket either came from a named public
  source with a read date, came from a named representative with a date and an unverified flag,
  or is not in the file. Never a plausible-looking third thing, and never a citation you did not
  open.
- **Refuse rather than synthesize.** No citable seat and no citable directive means no docket.
  Say so and stop. A placeholder recipient is the one defect in this file that cannot be caught
  downstream, because everything after it looks correctly routed.
- **Impose means the seat signs the instrument; recommend means it does not.** A seat whose
  recommendation triggers a mandatory written response is still a recommending seat, and it is
  often the best one in the file. Seniority has nothing to do with which bucket it lands in.
- **One entry per seat, and it grows in place.** No changelog section inside the file; git log is
  the history. Addresses are assigned in order of discovery, never reused and never renumbered,
  so a seat that is abolished is struck in place with the date.
- **A directive without a clock is a weaker directive, and the entry says so.** Do not dress a
  standing obligation with no date in it as though it were a deadline.
- **Do not resolve their disagreements with themselves.** If two answers conflict about who
  holds a power, put the conflict in the file as an open question. A docket that quietly picks
  one has invented an authority.
- **Ask in multiple choice, one to four per call.** Named options with a recommendation first,
  never a wall of prose questions. The exception is an answer that genuinely cannot be
  enumerated, and it should be rare enough to notice.
- **Stop when the rest would not change where a finding goes**, not when the org chart is
  complete. Four seats that each carry an instrument, a citation and a due date beat twenty
  names.
