# Why the dialect is shaped this way

Read only if you are changing the rules in `SKILL.md`, or need to justify one of them.

## Why hybrid, not a single global choice

The two clean answers both lose.

**Everything behind a ref** (the classic "React owns the div, D3 owns the SVG" pattern) makes
every chart pay for machinery that most do not need: manual enter/exit, manual teardown, and
a DOM React cannot see. **Everything as JSX** means reimplementing `d3-zoom`, `d3-brush`,
`d3-drag` and `d3-force` in React, which is a large amount of work to arrive back where D3
already is.

The corpus is what settles it. Measured over 173 ObservableHQ notebooks:

| measure | count |
|---|---|
| static, no transition or behaviour | 132 |
| any transition | 29 |
| shape morphing (`attrTween`, `styleTween`, `.tween`) | 13 |
| attribute-only transitions | 16 |
| stateful behaviour (zoom, brush, drag, force) | 16 |

So roughly three quarters need nothing from a ref, and about a quarter need something D3 does
well and React does not. A single global choice mismatches one side or the other. The five
escape triggers are drawn exactly around the cases where D3 owns real stateful behaviour or
mutates a `d` attribute over time.

Observed distribution after converting the corpus: **161 JSX, 20 ref** across 181 charts.

## Why the escape list is closed

The triggers are mechanically checkable, which is the point. "Use a ref when it feels right"
is not a rule, it is a preference, and it produces the failure this dialect exists to prevent:
a `d3.select` in a chart that had no need for one, with React and D3 both writing the same
nodes.

## Why `motion` and not react-spring

`AnimatePresence` maps directly onto D3's enter and exit selections, which is the primitive
data visualization needs and the one general-purpose animation libraries usually lack. It is
also better represented in model training data, which matters when the goal is reliable
generation rather than a one-off.

## Why a skill plus retrieval, not a fine-tune

The gap in base-model D3 output is idiom, exemplars and verification. None of those is a
knowledge gap, so none of them is what fine-tuning fixes. A fine-tune would also pin quality
to today's base model, while rules, exemplars and a verifier all inherit every future model
improvement for free.

This was measured, not assumed. A pilot eval over held-out notebooks scored **65/66 for a
bare control prompt and 65/66 with the idiom card plus retrieval** — a dead heat. Given an
explicit component contract, a competent model already renders, stays deterministic, survives
StrictMode and emits no dead v7 API without any of this. The conformance checks are saturated
at that difficulty.

The one signal with dynamic range was **route correctness**: the control reached for
`d3.select` on a stacked-to-grouped transition that the routing rule sends to JSX. That is why
`SKILL.md` leads with routing and why the verifier checks it first. It is the thing this
dialect actually buys.
