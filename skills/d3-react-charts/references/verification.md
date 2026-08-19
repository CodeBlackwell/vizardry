# Verifying a generated chart

What to assert, cheapest check first, and the specific failure each one catches. This is the
contract the gallery's own harness enforces over all 197 charts.

## 1. Source rules (regex, free)

- **No dead v7 API**: `d3.event`, `.enter().append(`, `d3.nest`, `schemeCategory20`.
- **No `d3.select` unless an escape trigger applies.** This is the routing rule, and the only
  check measured to differentiate a good generation from a mediocre one.
- **Deterministic**: no `Math.random(`. A chart that differs on every render cannot be
  regression-tested or reviewed.

## 2. Type check

`tsc --noEmit`. Empirically this is the *entire* failure surface at this difficulty: in the
pilot eval, every failure in both arms was a type error and nothing else. Do not skip it on
the grounds that the chart renders.

## 3. Render

Render the component directly with a plain `width` prop.

- mounts without throwing, no console errors
- emits an `<svg>` with a `viewBox`
- **drew something**: `marks >= 8` **OR** `path data >= 500 characters`. Element count alone
  is wrong — geo charts legitimately batch thousands of features into a handful of paths, and
  a maze batches every carved passage into one. Either condition passing is enough.
- no `NaN`, `Infinity` or `"undefined"` in any attribute value
- returns `null` at `width={0}` rather than throwing
- still valid at a narrow width (320px)
- **StrictMode double-mount yields the same mark count as a single mount.** This is the direct
  test for a ref effect that appends without clearing, and nothing else catches it.

Ref-routed charts need a DOM environment: server rendering never runs effects, so a ref chart
correctly renders empty under `renderToStaticMarkup` and must be asserted in jsdom instead.

## Do not verify by driving a browser

Chrome does not deliver the initial `ResizeObserver` callback in a background tab. Every chart
then correctly returns `null` at width 0 and the whole page looks broken, which reads as a
catastrophic failure and is not one. Charts take `width` as a plain prop — render them
directly and pass a number.

## Repairing

Every failure should return the rule *and* the repair, phrased as an instruction. Cap the
repair loop at two attempts and then surface the remaining failures rather than grinding — a
chart that fails the same check three times is usually wrong in a way the check cannot
describe.
