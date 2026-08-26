# Inefficiency shapes

Ten ways an organization's own numbers mislead the people who read them. Each entry is a signature you can test for, the query
that produces it, and the kind of policy sentence it justifies. Ids in `code` are charts in the `d3-react-charts` corpus.

Notation follows `shape-to-options.md`: `Q` quantitative, `T` temporal, `N` nominal, `O` ordinal, `R` relational. Beyond column
types, every signature names the non-column things that must also exist — a published threshold, a status vocabulary, a second
period of the same measure, a written procedure. Those are the hard part, and a shape without them is a pattern, not a finding.

---

## Preference order

**Shapes that interrogate the measuring instrument outrank shapes that rank the actors being measured.** Two independent
reasons, and each holds on its own:

- **Forceability.** A finding about how a standard is written lands on a document the recipient already owns and can change
  this quarter — a reporting instruction, a measure spec, a display spec, a catalog policy. A finding that ranks actors lands
  on nobody's desk, because whoever could change the ranking is not the recipient.
- **Publishability.** An instrument finding names no private party. It says the rate is computed over responders; it does not
  say which permittee stopped filing. That is what makes the report shippable without a legal read.

| tier | shapes | what the finding is about |
|---|---|---|
| instrument | `silence as a category`, `dead reference still in use`, `thin cell`, `level break` | the rule, the form, the window, the retirement policy. Whoever owns the document owns the defect |
| either way | `concentration`, `rank disagreement`, `mix shift as trend`, `exact duplication`, `pair inflation` | written badly they rank actors; written well they indict the disclosure rule that let the number stand unqualified |
| actor facing | `outcome contradicting posture` | the one shape whose evidence is inherently about named entities — handle per its Watch line |

**How to write the either-way shapes the safe way.** For `concentration`, the finding is never "this program is 41 percent of
the total" — it is "the total is published with no concentration disclosure, and here is the rule that should require one." For
`rank disagreement`, it is never a corrected leaderboard; it is "the scorecard publishes one of two defensible orderings and
never names the other." Same evidence, same charts, and only one of them lands on a document.

---

## 1. Concentration

**What it is.** A total that reads as a portfolio is one item wearing a portfolio's clothes. The distribution is skewed hard
enough that the aggregate describes its top row and almost nothing else.

**The signature.** `1 Q x 1 N`, N around ten or more, and the total is published or quoted on its own. Nothing else is required
— which is why the discipline lives in the Watch line rather than in the test.

**The query shape.** Sort descending by Q, cumulative sum over the total, read the share at k = 1, 3, 5 and the k where
cumulative crosses 50 and 80 percent. Then re-key and recount: group the top k by parent agency, vendor, or borough — whatever
owner the published grain hides. The second pass finds things. Federal improper payments: the top 5 programs are 70.7% of the
$171.6B total, and the top 3 all belong to one agency, which the program-level ranking never shows.

**The policy change it typically justifies.** A reporting rule, into a reporting instruction, a circular, a data-dictionary
entry or a dashboard spec: whenever this total is published, the top-1 and top-5 shares are published beside it, restated at
the owner level as well as the program level. A disclosure change, not a program change, which is why a recipient can say yes.

**The misread it invites.** "Improper payments are a government-wide control problem spread across hundreds of programs."

**Chart forms.** `horizontal-bar` sorted by value; `lollipop` past a dozen rows; cumulative share as `ecdf`; top-1 share
against a disclosure threshold `bullet-chart`; `treemap` or `waffle` when the reader should feel the share rather than read it.

**Watch:** concentration in an accounting total is frequently correct and uninteresting — Medicaid is large because Medicaid is
large. The finding is not the skew, it is that the figure is framed as a portfolio and no rule requires it to say otherwise.

## 2. Mix shift as trend

**What it is.** A series rises because its composition changed, not because the thing the label names grew. The subtype mix
moved underneath a label that stayed still.

**The signature.** `1 T x 1 Q x 1 N` where N is a subtype of the same measure and the total is what gets reported, plus two
periods with the breakdown intact. If only the total was ever published the shape is untestable, and the finding becomes the
disclosure gap — often the better finding.

**The query shape.** Put the total and the per-subtype counts on one axis, index each subtype to its own first period, then
normalize to share. Adoption looks like every subtype rising, or the total rising with shares flat. Mix shift looks like the
total flat while one share climbs and another falls by nearly the same amount. Enforcement: informal actions displacing formal
ones with total action count holding flat, which renders on a headline chart as a steady line.

**The policy change it typically justifies.** A disaggregation rule, into the reporting instruction or the performance-measure
definition: the measure is published broken out by subtype, and any narrative claim about the total states the subtype shares
for the same periods. Where the subtypes differ in force or legal effect, that belongs in the definition, not a footnote.

**The misread it invites.** "Enforcement activity held steady this year."

**Chart forms.** `normalized-stacked-area` for share; `stacked-area` when the total is genuinely meaningful;
`music-format-revenue` for successive displacement labelled in place; `index-chart` for per-subtype growth off a shared start;
`slope` for exactly two periods; `marimekko` when a subtype's weight and its split both matter; `stacked-to-grouped` when the
reader must see both readings are the same numbers.

**Watch:** composition and adoption are not exclusive. There is usually a real rise inside a mix shift, and calling the whole
movement composition overshoots. Report the decomposition, not the verdict.

## 3. Level break inside a smoothed window

**What it is.** A trailing average, a multi-year window or a rolling rate spreads a step change into a slope. The reader sees
gradual movement where the data actually contains a date.

**The signature.** `1 T x 1 Q`, plus a smoothing or aggregation window the publication applies (12-month rolling, 3-year
average, since-inception), plus raw grain fine enough to split it. It fires with no smoothing at all when a single reported
period straddles a rule change.

**The query shape.** Split at the window midpoint and at every candidate date, comparing halves on means, medians and the full
distribution — not the mean alone. Then bring the candidate dates in from outside the data: statutory effective dates,
inflation-adjustment dates, system migrations, form revisions. Penalty distributions step at the statutory maximum's
inflation-adjustment dates, so a "rising penalties" series measures the CPI schedule while the reader is told it measures
severity.

**The policy change it typically justifies.** A window-and-annotation rule into the publication spec: any series crossing a
known effective date is broken at that date or annotated with it, and the smoothing window is stated with the series rather
than assumed. Then the sentence that makes it durable — the effective-date list is maintained as data beside the series, not as
prose a chart cannot reach.

**The misread it invites.** "Penalties have been climbing steadily for a decade."

**Chart forms.** `moving-average` when the window choice is itself the subject; `nz-tourists` for dated event rules over a long
series; `change-line` for the first difference, where a step reads as a spike; `difference` against an unadjusted baseline;
`ecdf` or `beeswarm` per half when the break is distributional rather than a shift in the mean.

**Watch:** a break test run over enough candidate dates always finds a break. Bring the date from the statute, the migration
log or the form revision, and say where it came from — a break with no external date is a hypothesis in a finding's clothes.

## 4. Outcome contradicting posture

**What it is.** The stated procedure and the realized outcomes disagree, and both are published. The only shape whose evidence
is inherently two documents rather than one table.

**The signature.** A status or stage column with an ordered vocabulary (`O`), plus a separate event table of the actions that
vocabulary presumes, plus a written statement of what is supposed to follow what. That last one is load-bearing: without it you
have a pattern and no contradiction. Grain is normally one entity-period.

**The query shape.** Build the run per entity — consecutive periods carrying the escalating status. Left-join the action table
on entity and window. Count entities whose run exceeds the threshold the procedure names while matching zero actions, and
report the whole run-length distribution, because the tail is the finding and the count is not. Facilities carrying
significant-noncompliance status across many consecutive quarters, in a program whose monitoring strategy presumes escalation,
with no matching enforcement action anywhere.

**The policy change it typically justifies.** This lands on a procedure document — an enforcement response policy, a monitoring
strategy, an SOP. Either the escalation trigger becomes a reviewable event with a named owner and a due date, or the procedure
is amended to describe what actually happens. The forceable version asks for a documented disposition per run, not enforcement.

**The misread it invites.** "The compliance rate is 87 percent, so the escalation policy is working."

**Chart forms.** `gantt` with one lane per entity so runs read as spans; `world-history-timeline` when the runs must pack into
few rows; `parallel-sets` from status stage to action stage; `sankey` when the flow is conserved and the leak is the point;
`sequences-sunburst` for the ordered path; `diverging-bar` for run length against the policy threshold; `bullet-chart` per
program against its own stated trigger.

**Watch:** the most hazardous shape in the file — the entities are usually named and usually private. Write the finding against
the procedure's missing disposition step, report the count and the distribution, and do not list the entities. If it does not
survive dropping the names, it was never a policy finding.

## 5. Dead reference still in use

**What it is.** A retired, superseded or frozen thing is still being cited, published, or measured against. Nothing breaks
loudly enough to throw an error, which is precisely why it survives for years.

**The signature.** A reference carrying a version, an effective window, or a status value (`N` with a retired or superseded
member), plus a citation or publication pointing at it, plus timestamps on both. Very often there is no status column at all,
and the evidence is a last-updated field going stale beside a target still being rendered.

**The query shape.** Two joins. Citation to reference on id, keeping rows where the reference's status is retired or its
effective window closed before the citation's date. Then, for artifacts with no status vocabulary, last-modified against the
period the artifact claims to cover and against the period a reader would assume. Chicago's published pothole Performance
Metrics dataset carries a 7-day response target, was last updated in 2019, and its final rows show 75.97 and 93.46 average
days. The target and the breach are both frozen in place, and both are still published.

**The policy change it typically justifies.** A retirement rule with an owner, into the data-publishing policy or the catalog's
governance document: every published dataset carries a status field and a review date, an asset past that date is marked stale
on its public page, and a target no longer measured against is retired rather than left rendering. The cheapest sentence here.

**The misread it invites.** "The city's pothole response target is 7 days, and recent performance is 93 days against it."

**Chart forms.** `threshold-encoding` so the crossing reads as a hard color flip; `bullet-chart` for the frozen target with
the realized band beside it; `line-missing` so the series stops where the data stops instead of implying continuity;
`world-history-timeline` for validity windows of reference and citation side by side; `nz-tourists` for a dated retirement rule.

**Watch:** a stale dataset is not automatically a dead reference — the finding needs the citing, the rendering, or the
measuring-against. A file nobody reads that has not changed since 2019 is archival, and calling that a finding spends
credibility you will want for the next one.

## 6. Silence as a category

**What it is.** Not-elected, not-reported, not-submitted and declined-to-state are each distinct from absent, and each distinct
from zero. Collapse them and every rate the publication prints is computed over whoever happened to answer.

**The signature.** A column with a null or sentinel value the domain treats as meaningful, plus — decisively — a written rule
saying the value is required or the election is available. That rule is what converts missingness into a finding. Two sub-cases
worth separating: silence as a blank (`Q` null where a value or target was expected) and silence as a coded value (`N` carrying
an explicit non-submission member).

**The query shape.** Count the sentinel as its own category and publish it as a share. Then recompute every headline rate twice
— once over the full population, once over responders — and report the gap as the finding. Where silence is coded, split
violation counts by exceedance versus non-receipt, because a naive exceedance rate scores a permittee who filed nothing as
clean. NYC's Mayor's Management Report indicator dataset: 89.2% of 768,409 rows carry no target value. EPA discharge
monitoring: non-receipt of a required report is itself a coded violation type.

**The policy change it typically justifies.** A rate-definition rule plus a completeness disclosure, into the reporting
instruction and the dashboard spec: every published rate names its denominator population, states the non-response share for
the same period, and is not published at all when non-response exceeds a stated bound unless that bound is shown. Where the
silence is an election the entity may make, the fix is a distinct code — never an imputation.

**The misread it invites.** "Eighty-nine percent of city indicators are performing at or near target."

**Chart forms.** `area-missing` and `line-missing` so gaps stay gaps; `calendar` for reporting coverage day by day;
`impact-of-vaccines` for the entity-by-period grid where the empty cells are the entire chart; `waffle` for the
answered-versus-silent split when the reader should count units; `diverging-stacked-bar` when silence sits between agree and
disagree as its own band; `stacked-normalized-horizontal-bar` for response share per program.

**Watch:** not every blank is a silence. A target field empty on an indicator that has no target by design is correct, and a
finding that does not separate the two is really arguing the schema is wrong. Get the required-field rule in writing first.

## 7. Exact duplication

**What it is.** The same item recorded twice, byte for byte or key for key. Sometimes a defect, sometimes the most useful thing
in the file — a duplicate proves two processes already emit identical output and so already agree on an unwritten standard.

**The signature.** A candidate key you can hash, plus a second identifier that should have been the same one. Column count,
column names and a last-updated timestamp are usually enough. It also needs a stated uniqueness expectation somewhere — an
inventory mandate, a primary key, a catalog policy. Without one, duplication is a curiosity.

**The query shape.** Hash the normalized row or the normalized schema, group by hash, keep groups larger than one with distinct
identifiers. Then classify each group: one source rendered twice (catalog defect), two sources converging on identical output
(a de facto standard), or one process writing twice (pipeline defect). The classification is the finding; the count is not.
NYC's 311 service request dataset exists under two portal IDs with identical name, identical 48 columns and identical
last-updated timestamp, in a city whose open data law mandates an inventory.

**The policy change it typically justifies.** Two different sentences out of one body of evidence. The defect version goes into
catalog governance: duplicate assets merge behind one canonical id with the retired id redirecting, and the inventory
reconciles on asset hashes rather than titles. The convergence version goes into a standards document: the fields these two
processes already agree on become the published minimum schema, because the cheapest standard to mandate is the one in effect.

**The misread it invites.** "The city publishes 2,400 distinct datasets."

**Chart forms.** `tangled-tree` when one asset legitimately has two parents in the catalog; `adjacency-matrix` of asset by
source with duplicates as off-diagonal cells; `disjoint-force-graph` where each component is one duplicate group; `arc-diagram`
when record order carries meaning; `dot-plot` for the two recorded values of the same item.

**Watch:** normalization decides the answer. Trim, case-folding and column-order choices both manufacture duplicates and hide
them, so state the normalization beside the count — and never report a duplicate rate without naming which of the three
classes it is, because they carry opposite consequences.

## 8. Thin cell

**What it is.** A statistic published on an n too small to carry it, usually with a documented imputation quietly filling the
hole. The number is real; what it mostly measures is the imputation source.

**The signature.** `1 Q x 1 N` plus a per-cell n, plus a written minimum n or an imputation rule — which normally lives in a
technical specification nobody reading the output ever opens. If n is not published at all the shape is untestable, and the
finding becomes the missing n, which is cleaner than the one you were chasing.

**The query shape.** Join the published statistic to its n and plot value against n; a funnel opening at low n is the signature
and it is visible before any test is run. Then compute the imputed fraction per cell from the documented rule and rank cells by
it. A nursing-home quality measure requiring 20 assessments, imputing the remainder from the statewide average below that, with
no marking on the published rating: at n = 4 the published star is roughly four fifths state average and one fifth facility.

**The policy change it typically justifies.** A suppression-or-mark rule into the measure specification and, separately, the
display spec: cells below the minimum are suppressed or visibly marked at the point of display, the imputed fraction is
published beside the value, and any star rating either excludes imputed cells or marks them inline. Marking at display rather
than in the technical spec is the half that changes what a reader believes.

**The misread it invites.** "This is a 5-star facility."

**Chart forms.** `error-bars` sorted, with intervals that cross the reference left visible; `scatterplot` of value against n
for the funnel; `beeswarm` so small cells stay individually visible; `hexbin` once there are too many cells to plot honestly;
`violin` or `histogram` on the n distribution itself, to show how much of the population sits under the floor.

**Watch:** shrinkage toward a mean is a legitimate estimator and calling it a defect is simply wrong. The finding is that the
shrinkage is invisible at the point of use — write it against the display rule, not against the statistician.

## 9. Rank disagreement

**What it is.** Two defensible orderings of the same entities disagree, and only one gets published. Counts against dollars,
rate against volume, percentage-of-goal against absolute gap.

**The signature.** `1 N x 2 Q` where the two Q are alternative measures of the same underlying thing, or one Q and a rate
derived over a different denominator. Requires that at least one ordering is actually published or used to allocate something
— otherwise this is exploratory and not a policy finding.

**The query shape.** Rank by each measure, compute the per-entity rank delta and the Spearman correlation across the set, and
report both together. A middling correlation with three violent movers is a completely different finding from a uniformly
scrambled ranking, and the correlation alone hides which one you have. Agencies ranked by percentage-of-goal versus by dollars
rank oppositely: a small agency at 140 percent of a small goal outranks a large agency whose 92 percent is a far larger sum.

**The policy change it typically justifies.** Written the safe way this is a scorecard-design rule, not a corrected
leaderboard. Into the performance-reporting instruction: the scorecard publishes both orderings, or publishes one and names the
other with its top rows, and the measure definition states which decision the chosen ordering supports. The unsafe version
ranks the actors and stops — less forceable, and it names parties for no gain.

**The misread it invites.** "The top performers this year were the agencies at the top of the goal-attainment table."

**Chart forms.** `slope` for exactly two orderings; `bump-chart` for more than two, with every crossing visible; `scatterplot`
of rank against rank with the diagonal drawn; `dot-plot` for the two positions per row; `marimekko` when one measure is the
width and the other the split; `parallel-coordinates` past two measures, with the axis order stated.

**Watch:** rank disagreement is nearly guaranteed whenever a rate and a volume are compared, which makes it the easiest shape
here to fire spuriously. It is a finding only when a published product uses one ordering to allocate attention, money, or
scrutiny.

## 10. Pair inflation

**What it is.** A dataset of pairs where one side fans out combinatorially. k holders manufacture k(k-1)/2 pairs, so a pair
count measures the reach of the largest participant rather than the density of any relationship.

**The signature.** `R` where a row is a pair or a cross-product tuple, plus at least one side with a heavy-tailed degree
distribution. Multiplicative keys are the tell — payer times plan times code, provider times drug times quarter, vendor times
vehicle times agency. Degree per entity must be recoverable, or the inflation cannot be undone and that is itself the finding.

**The query shape.** Never count rows. Count distinct entities per side, then the degree distribution per side, then re-express
any pair total as pairs-per-entity and as the share of pairs contributed by the top entity. Recompute the headline after
dropping the single highest-degree participant; if the number halves, the number was that participant. Negotiated-rate pairs in
hospital price transparency files multiply across payer times plan times code, so a claim of millions of published rates
reports a cross-product size and is read as a coverage measure.

**The policy change it typically justifies.** A counting-rule sentence into the reporting instruction or the file
specification: pair counts are reported alongside distinct-entity counts on each side and the top contributor's share, and no
coverage claim rests on a cross-product row count. Where the file format itself causes the fan-out, the sentence belongs in the
schema spec instead — a slower door, but the right one.

**The misread it invites.** "The hospital disclosed over three million negotiated rates, so its pricing is well covered."

**Chart forms.** `adjacency-matrix` ordered by degree so a fan-out reads as a row rather than a cluster; `chord` only when both
sides are small and fixed; `edge-bundling` when the entities carry a natural grouping; `histogram` or `ecdf` of the degree
distribution itself; `lollipop` for pairs contributed per entity, sorted.

**Watch:** collapsing pairs to entities is not automatically right either. Sometimes the pair is the unit that matters, and a
distinct negotiated price per plan is a genuinely distinct thing. Decide which unit the claim needs before correcting the count.

---

## What disqualifies a candidate

**A shape firing is not a finding.** It is a measurement that something in the data is shaped a particular way. It becomes a
finding only when it can name a seat from the mandate docket and a document that seat owns, and state the sentence that goes
into that document. Anything that cannot do all three goes to context, or to the declined list with its reason written down.
Run these in order and stop at the first failure:

| test | fails when | where it goes |
|---|---|---|
| **Seat** | no office in the mandate docket has authority over the thing you want changed | context, or declined naming the authority it would need |
| **Document** | the seat exists but owns no instrument that could carry the sentence — no reporting instruction, spec, policy or SOP | declined, naming the document that would have to be created |
| **Sentence** | you cannot write the change as one or two sentences a drafter could paste | rewrite it smaller, or decline — a finding you cannot draft is an observation |
| **Standing evidence** | the signature leans on a rule, threshold or procedure you have not read in writing | context until the rule is found. Most shapes above name that requirement explicitly |
| **Names** | the finding stops being true once the entity names are removed | rewrite against the instrument, per the preference order. If it will not rewrite, decline it |
| **Consequence** | the shape is real, the sentence is draftable, and nothing a reader believes changes | declined as correct and uninteresting — the most common outcome, and a fine one |

Two rules about the declined list. **It is never empty** — a sweep that declined nothing did not apply the tests, and a report
whose every candidate survived is advertising that its bar is zero. And **the reason is recorded, not the verdict**: "no owning
document" is something a reader can check and a future sweep can reopen. "Weak" is not.

**Watch:** these tests reject candidates, they do not rank findings. A candidate that passes all six is admissible, not
important. Importance is the size of what the sentence changes, and that argument is made per finding in prose — never by
counting how many shapes fired.
