# The judged half

Everything `verify-redline.mjs` and `verify-redline-page.mjs` check is a set operation, a field
presence test, or a string comparison. That is deliberate, and it is also the limit: a mechanical
gate proves two `whoActs` reasons are different strings and cannot ask whether they are different
*decisions*. This stage is the five questions that sit exactly where a check stops.

## Why review fans out where building cannot

`/datastorm-parallel` fences concurrent work by file: one option, one `charts.js` fragment, one
agent, no shared write. A redline finding has no such fence — it is an object inside one shared
`redline.json`, and two agents editing it race.

**The fence exists on the review side because a review is read-only.** Each reviewer reads one
finding's evidence block and returns a verdict keyed by that finding's id. Disjoint keys merge by
assignment, in any order, with no coordination. So the parallel unit is the judgment; the write
stays serial and stays in the main context. Nothing here needs a worktree, a model ladder, or a
conditional repair stage, because nothing here retries — a reviewer either rules or it does not.

## The procedure

```bash
node <skill>/bin/verify-redline.mjs redline.json --data chartdata.json \
  --mandate docs/mandate.md --emit evidence.json
```

`evidence.json` carries one block per finding: the seat behind every code with what the roster
says it decides, the chartdata paths behind every figure, the refusal that answers the finding, the
roll-up row that absorbs it.

**Read `sourceCount` before trusting a figure's `sources`.** A numeral is reported with every
chartdata path it could have come from, not the first one walked, because over a real substrate a
small integer is reachable from a dozen constants and naming one of them is a guess. Where
`sourceCount` is 1 the run resolved the figure; where it is high the run proved only that the
numeral appears somewhere in the file, and whether it is the right one is a question for the card's
own argument. Measured over a 485-constant substrate: a value above 1000 resolves unambiguously
75% of the time, an integer under 30 does 2% of the time. **A reviewer reads that, not the sources.** Handing a reviewer
`redline.json` and the docket makes it re-resolve what the run already resolved, and a reviewer
that re-runs the verifier by hand is a second verifier rather than a second opinion.

1. Fan out one agent per entry in `evidence.findings`. Give each its own block, this file, and
   nothing else it does not need.
2. Each returns one object keyed by its finding id, ruling on all five questions.
3. Merge the objects into `verdicts.json` — plain assignment, since the keys are disjoint.
4. Re-run the gate with `--review verdicts.json`. The main context runs this, not a reviewer:
   an agent that certifies its own work has certified nothing.

## The five questions

Each names the check it stands behind, so a reviewer can see it is not being asked to redo one.

| question | what the mechanical check already proved | what is left to judge |
|---|---|---|
| `seat-fit` | `who-acts`: the reasons differ as strings | is each reason **that seat's own decision**, given what the roster says it decides |
| `trade-real` | `downstream-priced` + `asymmetry-binds`: both sides carry distinct computed figures and the sentence carries one from each | does the sentence **trade** them, or state a benefit twice with a cost-shaped preamble |
| `shape-honest` | `shape-known`: the shape is one of the ten | is it **the one the magnitude actually shows** |
| `kills-it-kills` | `refusals-paired`: the sentence reaches the refusals with a replacement | would it **end** the finding, or is it a caveat the finding survives |
| `produces-is-artifact` | `tasker-substance`: `produces` clears the floor and repeats no step | does it name **something that exists after the steps**, rather than the work |

## Ruling

```json
{ "F1": { "seat-fit": { "ruling": "ok", "why": "..." } } }
```

- **`ok`** — the question is answered and the answer holds.
- **`doubt`** — you cannot tell from the evidence. Say what would settle it. A doubt prints as a
  signal and does not block the build, so ruling `doubt` costs nothing but a sentence.
- **`fail`** — this is wrong, and here is why. A fail is a build stop.

`why` is required on every ruling including `ok`, and a blank one fails the gate. The reason is
the part a person can disagree with, which is the only thing separating a review from a second
signature. Ruling `ok` on all five with five paraphrases of "looks right" is the failure mode this
stage has; if that is the honest answer, the evidence block was too thin and that is worth saying.
