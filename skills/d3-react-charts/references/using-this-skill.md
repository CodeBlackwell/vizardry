# Using the corpus and the tools

The rules in `SKILL.md` are the part that has to be in context. Everything below is on disk,
to be reached for per request rather than loaded up front.

Paths differ by where you are reading this from:

| | in the gallery repo | in the installed plugin |
|---|---|---|
| digest | `docs/digest.md` | `catalog/digest.md` |
| catalog | `docs/catalog.json` | `catalog/catalog.json` |
| exemplars | `exemplars/<id>.tsx` | `catalog/exemplars/<id>.tsx` |
| tools | `bin/` | `bin/` |

## Pick exemplars before writing anything

Read `digest.md` — one line per chart giving its id, category, route, when to use it, and the
data shape it takes. Pick two or three whose *when to use* and *data* match the request, then
read those exemplars in full and match their structure.

Match on the data and the question, not on the chart name the user happened to say. Someone
asking for "a graph of revenue by month" wants a bar or line chart; someone asking for "a
graph of who reports to whom" wants a hierarchy. The digest's data column is the tiebreak.

For a deterministic pick, or from a script:

```
node bin/retrieve.mjs "flows between stages over time" --top 3 --why
```

`--why` prints the terms that matched, which is the fastest way to see when a request is being
retrieved for the wrong reason.

## Exemplars are self-contained

Each one inlines every local import, so only bare npm packages remain and the header names
them. Two exceptions carry a companion: `d3-geo-projection` and `versor` ship no types, so the
four exemplars using them reference `untyped-modules.d.ts`, which sits beside them.

They are meant to be *imitated*, not edited into shape. Copying an exemplar and swapping the
dataset usually produces a worse chart than writing a fresh one in the same shape, because the
scales, the margins and the labels were all chosen for the data being replaced.

## Verify before handing anything back

```
node bin/verify.mjs path/to/Chart.tsx
```

Three tiers, cheapest first: source rules including the routing rule, then `tsc --noEmit`, then
a jsdom render that checks the chart draws, survives a zero and a narrow width, and produces
the same mark count under a StrictMode double-mount. Every failure prints the repair as an
instruction.

Type errors are the failure to expect. In the pilot eval every single failure in both arms was
a type error and nothing else, so a chart that renders is not thereby correct.

Cap the repair loop at two attempts, then surface what is still red rather than grinding — a
chart failing the same check three times is usually wrong in a way the check cannot describe.
