---
name: d3-react-charts
description: Write Observable-grade data visualizations as React components with D3. Use when building, converting, or reviewing any chart, graph, map, or diagram in React — bar, line, area, scatter, distribution, hierarchy, network, geo, radial, calendar, or animated.
---

# D3 + React charts

**React owns rendering. D3 owns math and stateful gestures.** D3 computes scales, layouts,
shapes and paths; React puts marks on screen. The two never both write to the same DOM node.

## The routing rule

Decide this first. It determines the shape of the whole component.

```
DEFAULT      marks render as JSX; scales, shapes, layouts computed in useMemo
REF ESCAPE   d3-zoom, d3-brush, d3-drag, d3-force, path/shape morphing
ANIMATION    attribute level (x, y, r, fill, opacity)  -> motion, stays JSX
             shape morphing (the `d` attribute)        -> d3.transition inside a ref
```

There are exactly five escape triggers, listed on the REF ESCAPE line. **If a chart needs
none of them, it must contain no `d3.select` at all.** Reaching for a selection because it
feels like the D3 way is the single most common defect in generated chart code.

A chart that morphs commits *wholly* to the ref bucket. Do not mix: D3 transitions mutate the
DOM and the next React render erases them.

Roughly 8 in 9 charts route JSX.

## Component contract

```tsx
/** What a caller supplies. */
export type Data = { date: Date; value: number }[];

const DEMO: Data = […];                          // stable module-level default

export default function Chart({ data = DEMO, width }: { data?: Data; width: number }) {
  const height = Math.round(width * 0.6);        // derive it, never take it as a prop
  const scale = useMemo(() => …, [data, width]); // every hook runs before the guard below
  if (width === 0) return null;
  return <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}
              role="img" aria-label="…">…</svg>;
}
```

- **Data in as an optional prop**, typed by an exported `Data` alias, defaulting to a sample
  dataset so the component renders standalone. The default must be a **bare module-level
  identifier**, never an inline literal or a call: a fresh value every render busts every
  `useMemo` keyed on `data`. A chart whose subject is a procedure rather than a dataset — a
  clock, a projection demo, a sorting animation — takes no `data` prop and declares no alias.
- **Width in, height derived.** A fixed pixel width is a defect. Parents measure with
  `ResizeObserver` + `useLayoutEffect` and pass `width` down.
- **`return null` at `width === 0`**, because the first measurement is always 0.
- **Hooks cannot be conditional**, so every `useMemo` runs *before* that guard and must
  tolerate a zero width. D3 layouts throw on a zero-sized box rather than degrading, so floor
  the dimension: `Math.max(1, Math.min(width, MAX))`.
- **`viewBox` + `role="img"` + a real `aria-label`** that says what the chart shows, not
  "chart".

## React 18 hazards

These do not exist in vanilla D3 and are the failure modes worth checking every time.

**StrictMode double invocation.** Effects run twice in development. A ref effect that appends
without clearing renders two overlapping charts. Every ref-escape effect clears its subtree on
entry and cleans up on unmount.

**Scale recreation.** Scales, shape generators and layouts belong in `useMemo` keyed on data
and dimensions. Rebuilding them every render is the most common performance defect.

**Listener teardown.** Zoom, brush and drag attach handlers that leak across remounts. Return
a cleanup that detaches them.

**Transition versus reconciliation.** Never transition a JSX-rendered node. See the routing
rule.

**Timers.** Any `setInterval` / `requestAnimationFrame` returns a cleanup that clears it, or
StrictMode leaves two loops running and the animation plays at double speed.

## D3 v7 only

| dead | use instead |
|---|---|
| `d3.event` | the event argument passed to the handler |
| `.enter().append()` | `.join()` |
| `d3.nest()` | `d3.group()` or `d3.rollup()` |
| `d3.schemeCategory20` | `d3.schemeTableau10` or `d3.schemeObservable10` |
| `d3.scale.linear()`, `d3.layout.*` | `d3.scaleLinear()`, `d3.tree()` / `d3.pack()` / … |

Version drift is the single most common reason generated D3 throws at runtime.

## Animated charts

`motion` (formerly framer-motion) is the animation library. `AnimatePresence` maps onto D3
enter and exit, which is the primitive data visualization actually needs.

For anything that animates a *procedure* rather than a value — a sort, a traversal, a sampler:

- **Precompute the whole run as a trace, then hold one `step` integer in state.** Never mutate
  algorithm state inside a render or inside the timer callback. This is what makes a
  randomized algorithm deterministic and the animation cheap to scrub.
- **Seed the randomness.** A chart that renders differently on each load cannot be tested or
  reviewed. Use a seeded PRNG, not `Math.random`.
- **The first frame must already draw.** Server rendering runs no effects, so a component
  whose initial state is empty renders a blank SVG. Initialise state to the *completed* state
  and let the effect replay from the beginning; that also makes the static thumbnail the best
  frame.

## Further reading

- `references/using-this-skill.md` — **read this before writing a chart.** How to pick two or
  three exemplars from the 181-chart corpus, and how to verify what you wrote.
- `references/rationale.md` — why hybrid rather than all-JSX or all-ref, and the measured
  corpus composition behind the routing split.
- `references/verification.md` — what to assert about a generated chart, and the failure
  modes each check catches.
