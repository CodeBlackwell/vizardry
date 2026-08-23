---
name: data-docket
description: Work out with someone, through a short multiple-choice survey, which questions their dataset can honestly be asked — each with ground under it, a query shape, and a stated honesty condition — then write it down as a data docket. Use before /datastorm to give the brainstorm real domain context and a focus, or when someone says "grill me about my data", "stress-test my analysis", "what can this data honestly answer", or wants a questions.md for a dataset.
---

# The data docket

Produce **one markdown file** naming what a dataset can honestly be asked, what each answer
stands on, and what would make each answer a lie. Then hand it to `/datastorm`, where it is
guiding context and never a chart list.

A profile measures what the columns are. It cannot tell you that two totals in the same table
must never be divided by each other, that an office column is really a contracting-activity
proxy one level coarser than the thing being claimed, or that the obvious question was already
asked and killed last month. That knowledge lives in the head of the person who works with the
data, and the only way out of that head is to ask.

**The grilling is the method, not a formality.** Someone who is not pushed hands over a wish
list: eight questions phrased as chart requests, no denominators, no coverage, no dead ends.
That list makes a brainstorm *worse*, because it narrows the option space without adding truth.

The interview is `/grilling`'s — design tree, frontier, a recommended answer under every
question, and no action until the user confirms a shared understanding. This skill is that
engine pointed at a dataset: it supplies the tree to walk and the artifact to write at the end,
the way `/grill-with-docs` supplies ADRs and a glossary.

## The seven things a profile cannot measure

Everything you are grilling for falls in here. Track which are still empty; that is the
frontier.

1. **The decision.** Who asks this, and what do they do differently depending on the answer. A
   question with no decision behind it is curiosity, and it competes for the same page space as
   a question someone acts on.
2. **The grain, in their words.** You can measure that a row is unique on three columns. Only
   they can say it is "one country-month" or "one attachment on one notice". Getting this wrong
   is the most expensive error available, because every question downstream inherits it.
3. **Proxies and label hazards.** Which column stands in for something it is not: an id that is
   really a department, a name spelled two ways, a prefix that is a filing artifact rather than
   a category. These do not show up as missingness; they show up as a plausible wrong answer.
4. **Denominators, and the frames they sit in.** Which totals exist, what each one bounds, and
   which pairs may never be mixed, divided, or quoted against each other. Almost every dishonest
   chart is an honest numerator over the wrong denominator. Then the harder half: whether any of
   it has been **re-measured over a different population**. A widened corpus, a new join, a
   changed filter — that is a second frame, not a correction, both sets of numbers stay live,
   and every figure has to say which one it belongs to.
5. **What may never be summed, and what may never be collapsed.** Rows that double-count under
   a total. Pair counts that inflate quadratically with one entity's reach. A distinction the
   domain treats as load-bearing that a chart would flatten by default: absent versus blank
   versus zero, declared-none versus silent, censored versus complete.
6. **Coverage, lag, and which way thin lies.** Where the data is thin, and the *direction* of
   the bias there. "Recent months look short because reporting lags 90 days" is worth more than
   any missingness percentage, and no profile produces it.
7. **Dead ends, and the not-yet-run.** Questions already asked and answered, already killed and
   why, off-limits by policy, or held by a pre-registered study that looking at would burn.
   Recording these is what stops the same dead end being proposed again next week. Ask for the
   other end of it too: what has **ground but no measurement** — a column that arrived last
   month, a join that just landed. That middle state is neither askable nor dead, it is usually
   where the most valuable question in the file is sitting, and nobody volunteers it unless
   asked.

## The procedure

### 1. Find every fact yourself first

**Never ask what the file can tell you.** Finding *facts* is your job; the *decisions* are
theirs. A question like "how many rows are there" spends their patience on something you could
have read, and it costs you the credibility that makes the hard questions land.

Profile the data the way `/datastorm` step 1 does — columns, types, cardinality, missingness,
range, and a first guess at the grain. Then read what is already written down:

```
README* CLAUDE.md AGENTS.md docs/ schema.sql migrations/ notebooks/ adr/ *.ipynb
```

Prior analysis is the richest seam here. A notebook with a hardcoded filter, a query with an
unexplained `WHERE`, a comment saying "excluding the 2024 rows" — every one of those is an
undocumented honesty condition and a question to put to them directly.

**Do not block on it.** Where subagents are available, send the profiling out as one and open
the first batch of questions in parallel. A pending fact is just an unsettled prerequisite, so
only the questions downstream of it wait, and the stakes stage needs no profile at all.
Everything that comes back arrives as **claims to confirm or correct**, never as blanks for
them to fill.

### 2. Survey them in multiple choice

**The interview mechanics here are `/grilling`'s, deliberately.** If that skill is installed,
run it and let this file supply the two things it does not have: the tree below, and the
artifact at the end. What follows is that engine, restated so this skill also works alone —
with one deliberate departure, in how the questions reach them.

Map the interview as a **design tree**: every answer branches into the questions that hang off
it. The **frontier** is every question whose prerequisites are already settled — the ones you
can ask *now* without guessing at answers you have not heard. A question whose answer depends
on another still open belongs *later*, not now.

**Every question is a multiple choice, and it goes through `AskUserQuestion`.** Not a wall of
prose questions in a chat message. A dataset owner handed six paragraphs at once answers the
easy ones, drops the load-bearing one, and writes every answer without the benefit of the
others. Named options do the opposite: they make the expensive answer as cheap to give as the
easy one, and they show the person that the hard cases were already considered.

Each call carries **one to four questions, by judgement** — the tool presents them one at a
time, so the user always faces a single question, but the batch is what you have decided is
safe to ask without hearing any of the answers first. Send one alone when its answer would
rewrite the others. Send up to four when they are genuinely independent. Never send a question
whose framing you would change depending on an answer sitting in the same batch.

Write the options like this:

- **Two to four options, each a position someone could actually hold.** Not a scale, not
  degrees of the same answer. If you cannot name a second real position, the question is not a
  question and you should be stating it as a claim to correct instead.
- **The recommended option first, labelled `(Recommended)`.** The recommendation is not
  optional. Most of what you need back is "yes / no it is actually X / no idea", and your
  guess is what makes that cheap.
- **Each option names its consequence, not just its value.** "A sample, method unknown — every
  count in the file is then a proportion only, never a real count" beats "sample". The
  consequence is the part they can tell is wrong.
- **Never write an "Other" option.** It is supplied, and it is where the correction you most
  need will arrive.
- **`multiSelect` when the answers are not exclusive** — which claims matter, which fences
  apply. Most of the docket's content questions are multi-select; the grain is not.

Where an answer genuinely cannot be enumerated — their own list of questions, in their own
words — ask in prose. That is the exception, and it should be rare enough to notice.

**Re-derive the next batch from the answers you just got.** Settled questions push the frontier
outward; a surprise collapses whole branches and grows others. Learning the grain is "one
country-month" rather than "one event" retires half the proxy questions and creates a new one
about how the months were rolled up. Do not pre-write the survey and walk down it.

The tree's rough order, in dependency order — these are **stages the walk passes through**, not
a fixed agenda and not five tool calls:

**The stakes.** Who reads the answer and what they do with it. What one row is, in their words.
What claim or decision this data exists to support. Everything else hangs off these three,
which is why they are alone at the root.

**The ground.** Which surfaces are trustworthy. Which columns are proxies, and for what. Where
coverage is thin and which way thin biases. What the denominators are, which of them are not
interchangeable, and whether any have been re-measured over a different population. Ask for
hazards by name — "which column has ever fooled you" gets a better answer than "are there data
quality issues".

**The questions.** Their actual list, in their own words, plus the ones your profile suggests
they have not thought of. Then per question: has it been measured, with what n and over what
frame, and what would make the number a lie.

**The fences.** What may never be summed or collapsed. What is already killed, and why. What is
off the table by policy or by a study in flight. What has ground but has never been run.

**The pictures.** Last, because it needs the whole list in view: **which of these questions are
one picture?** A rate, the volume behind it and the exposure behind that are three entries and
one chart. Ask it directly — people answer it easily and never volunteer it — then ask the
follow-up that makes the answer safe to act on: *do those questions share a denominator, or
does the chart have to label two?* Almost always two, and that is the sentence that keeps a
combined view honest. Ask also whether any single entry already has a chart form its owner is
sure of, and what that form is forbidden to do.

**This is guidance, not an inventory.** The docket exists to give `/datastorm` real context and
a focus, and it does that job at roughly eight to fifteen entries. You are not obliged to walk
every branch, and a survey that grinds through forty questions to name every possible one has
stopped collaborating and started interrogating. **Stop when what is left would not change what
`/datastorm` draws** — which is usually sooner than an empty frontier, and always sooner than a
complete one.

### 3. Push back

The grilling *is* the pushback. Four moves, used relentlessly:

- **A question phrased as a chart goes back.** "I want a map of shipments by state" names a
  drawing, not a question. Ask what they would learn from it and what they would do about it,
  and write down *that*. Deciding the drawing is `/datastorm`'s job, and a docket that
  pre-empts it has thrown away the reason to run one.
- **A number with no n and no frame is not measured.** Take it anyway, and record it as stated
  and unverified with the date. A remembered number that turns out to be wrong is a finding;
  a remembered number laundered into the docket as measured is a defect you shipped.
- **"It depends" is an answer that has not been given yet.** Ask what it depends on. That
  dependency is usually the honesty condition, stated sideways.
- **A question with no honesty condition is not finished.** Every real question has a way to
  lie. If neither of you can name one, say so in the entry rather than leaving the field off;
  an unfound failure mode and an absent one are different claims.

### 4. Write it

**Not before they confirm.** An empty frontier is your judgement that nothing is left
unasked; it is not their agreement. Summarize what you now believe — the grain, the
denominators, the fences, the pairings — in a dozen lines, and ask whether that is a shared
understanding. What comes back is usually one more correction, and it is usually a load-bearing
one. Writing the file before that turns their correction into an edit of a document instead of
an answer to a question, and people revise a document less honestly than they answer a
question.

Then follow `references/docket-format.md` — the sections, the four fields per entry, and a worked
skeleton. Write to `docs/questions.md` if a `docs/` directory exists, otherwise `questions.md`
in the working directory, unless they name a path.

Then read it back against these, and fix what fails:

- Every entry has **Ground**, **Query**, **Measured** and **Honesty**. An entry that cannot get
  Ground is not askable — move it down and say why.
- Every number carries its **n**, its **frame**, and the **date** it was taken. A measurement
  is true of the data it was taken over, not forever.
- **The "Not askable" section is not empty.** If nothing was killed, no grilling happened —
  go back to the fences stage. Every real dataset has questions it cannot answer, and the ones that
  *look* answerable are exactly the expensive ones.
- **A question with no measurement is in "Newly askable", not in "Askable now".** An entry
  reading "Measured: not measured" is in the wrong section, and filed as askable it implies a
  number nobody has taken.
- **Every entry in "One chart, several questions" names the denominators its panels do not
  share.** A pairing without that line is the one that produces a chart reading as a single
  population.
- Nothing in the file is a number you invented. Measured, quoted from them, or absent.

Hand back the path, the entry count, the sharpest thing you learned that the profile could not
have told you, and anything they left as unknown.

## What /datastorm does with it

Say this when you hand it over, because the distinction is the whole point:

**It guides.** The docket supplies the questions worth answering, the vocabulary for each
option's "the question it answers" field, the honesty conditions that become real failure-mode
fields instead of generic ones, the denominators a chart must not blend, and a rejected list
with reasons already written. Two sections carry more than the rest: **"One chart, several
questions"** hands over combined views someone already thinks belong together, along with the
denominators their panels do not share, and **"Newly askable"** is a list of questions with
ground under them and no answer yet — which is where an unexpected option is most welcome.

**It does not rule.** `/datastorm` still profiles the data itself, still generates 12 to 20
options across all three bands, and still proposes options the docket never mentions — the
creative-abstract band especially, which exists to find what nobody thought to ask. A docket
with eight questions does not mean eight options, and an option is not disqualified for being
absent from it.

**When the two disagree, the profile wins on facts and the docket wins on meaning.** If the
docket says a column is a count and the file says it is text, the file is right and the
report says so. If the file says two columns are correlated and the docket says one is a
proxy for the other, the docket is right and the correlation is not a finding.

## Rules

- **Measured, quoted, or absent.** Every fact in the docket either came from the data, came
  from the user with attribution, or is not in the file. Never a plausible-looking third thing.
- **One entry per question, and it grows in place.** No changelog section inside the file; git
  log is the history. An entry that is re-measured is edited, and the new frame stated.
- **Askable means measured; newly askable means only that the ground exists.** A question with
  a surface and no number belongs in the middle bucket, and a question whose surface does not
  exist at all goes in "Not askable" naming the surface it would need — that one is a
  data-collection request, and the user deserves to know which of the three they are looking at.
  Interesting has nothing to do with it.
- **Do not resolve their disagreements with themselves.** If two answers conflict, put the
  conflict in the file as an open question. A docket that quietly picks one is a docket
  that invented a fact.
- **Ask in multiple choice, one to four per call.** Named options with a recommendation first,
  never a wall of prose questions. The exception is an answer that genuinely cannot be
  enumerated, and it should be rare enough to notice.
- **Stop when the rest would not change what `/datastorm` draws**, not when the list looks long
  and not when the frontier is technically empty. Twelve entries that each carry a denominator
  and a failure mode beat thirty that do not.
