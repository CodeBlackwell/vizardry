/**
 * The rules a chart must satisfy, shared by the render harness and the holdout eval.
 *
 * These live in one place on purpose. A grader that reimplements the harness drifts from
 * it, and then the eval score stops describing the thing the harness enforces.
 */

/** A chart that renders an axis and nothing else would clear a naive >0 check. */
export const MARK_FLOOR = 8;

/**
 * Geo charts legitimately batch thousands of features into a handful of MultiPolygon paths,
 * so element count alone understates them. Substantial path geometry counts as drawn content.
 */
export const PATH_DATA_FLOOR = 500;

export function pathDataLength(html: string): number {
  return (html.match(/\sd="[^"]*"/g) ?? []).reduce((sum, attr) => sum + attr.length, 0);
}

export function markCount(html: string): number {
  return (html.match(/<(rect|circle|path|line|text|polygon|ellipse)\b/g) ?? []).length;
}

export function drewSomething(html: string): boolean {
  return markCount(html) >= MARK_FLOOR || pathDataLength(html) >= PATH_DATA_FLOOR;
}

/** Comments stripped so a line explaining "not Math.random" does not trip a source rule. */
export function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/** `fix` is phrased as an instruction, because the verifier hands it straight to a model. */
export const DEAD_API: ReadonlyArray<{ pattern: RegExp; why: string; fix: string }> = [
  {
    pattern: /\bd3\.event\b/,
    why: 'd3.event was removed in v6',
    fix: "take the event as the handler's first argument: .on('click', (event, d) => …)"
  },
  {
    pattern: /\.enter\(\)\s*\.append\(/,
    why: 'use .join() instead',
    fix: 'replace .enter().append(tag) with .join(tag)'
  },
  {
    pattern: /\bd3\.nest\b/,
    why: 'use d3.group/d3.rollup',
    fix: 'replace d3.nest() with d3.group() or d3.rollup()'
  },
  {
    pattern: /schemeCategory20/,
    why: 'scheme was removed in v5',
    fix: 'replace d3.schemeCategory20 with d3.schemeTableau10 or d3.schemeObservable10'
  }
];

export const NON_DETERMINISM: ReadonlyArray<{ pattern: RegExp; why: string; fix: string }> = [
  {
    pattern: /Math\.random\s*\(/,
    why: 'unseeded randomness makes renders differ per load',
    fix: 'replace Math.random() with a seeded PRNG so every render is byte-identical'
  },
  {
    pattern: /\bfetch\s*\(/,
    why: 'the gallery renders offline; data must be embedded',
    fix: 'remove the fetch and embed the data as a module-level literal or a seeded generator'
  }
];

/** Any d3.select is the ref escape. A chart without one is routed jsx by construction. */
export function inferRoute(source: string): 'jsx' | 'ref' {
  return /\bd3\.select(All)?\s*\(/.test(stripComments(source)) ? 'ref' : 'jsx';
}

/**
 * The floor a chart's markup has to clear, which is NOT the same for both routes.
 *
 * A jsx-routed chart renders its whole dataset, so `MARK_FLOOR` separates a real chart from
 * one that drew an axis and gave up. A ref-routed chart is often a handful of large marks
 * built by an effect — a single animated arc is three — so the corpus settled on `> 0` for
 * those, which is still the check that matters: the effect either ran or it did not.
 *
 * Callers with no registry to consult pass the source and let `inferRoute` decide.
 */
export function drewEnough(html: string, source: string): boolean {
  return inferRoute(source) === 'ref' ? markCount(html) > 0 : drewSomething(html);
}

export function floorFor(source: string): string {
  return inferRoute(source) === 'ref'
    ? 'a ref-routed chart must draw at least one mark once its effect runs'
    : `a jsx-routed chart must clear ${MARK_FLOOR} marks or ${PATH_DATA_FLOOR} chars of path data`;
}

/**
 * The five escape triggers from the routing rule. A chart reaching for `d3.select` without
 * one of these is doing rendering that JSX owns, which is the most common defect in
 * generated chart code.
 *
 * Whitespace is permissive because `d3\n  .brush<Cell>()` is common, and generics are
 * allowed after the factory name.
 *
 * Morphing is the inexact one. `also` makes it a conjunction: a d3 transition must be
 * present AND it must write path geometry (`.attr('d'`) or run a custom interpolator
 * (`.attrTween`, `.styleTween`, `.tween`), which is what `motion` cannot express
 * declaratively.
 *
 * What it misses, in both directions:
 * - It deliberately does NOT count a plain `.transition().attr('x', …)`. Attribute-level
 *   animation routes to `motion` and stays JSX, so counting it would excuse exactly the
 *   defect this check exists to catch. The cost is that a chart animating geometry through
 *   bare attribute transitions — the gallery has one, `zoomable-treemap` — reads as a
 *   violation. That is the rule's own edge, not a bug in the detector.
 * - The conjunction is per file, not per statement, so a chart that transitions somewhere
 *   and separately writes `d` from a plain selection escapes. Tightening that needs a
 *   parse, not a regex.
 */
export const ESCAPE_TRIGGERS: ReadonlyArray<{ name: string; pattern: RegExp; also?: RegExp }> = [
  { name: 'd3-zoom', pattern: /\bd3\s*\.\s*zoom\s*[<(]|from\s*['"]d3-zoom['"]/ },
  { name: 'd3-brush', pattern: /\bd3\s*\.\s*brush[XY]?\s*[<(]|from\s*['"]d3-brush['"]/ },
  { name: 'd3-drag', pattern: /\bd3\s*\.\s*drag\s*[<(]|from\s*['"]d3-drag['"]/ },
  { name: 'd3-force', pattern: /\bd3\s*\.\s*force[A-Z]\w*\s*[<(]|from\s*['"]d3-force['"]/ },
  {
    name: 'morphing',
    pattern: /\.\s*attr\s*\(\s*['"`]d['"`]|\.\s*(attrTween|styleTween|tween)\s*\(/,
    also: /\.\s*transition\s*\(/
  }
];

/** Which escapes a source file can justify. Empty means `d3.select` has no excuse. */
export function escapeTriggers(source: string): string[] {
  const code = stripComments(source);
  return ESCAPE_TRIGGERS.filter(
    ({ pattern, also }) => pattern.test(code) && (!also || also.test(code))
  ).map(({ name }) => name);
}

/** A chart routes jsx, or it reaches for a selection and can name the trigger that justifies it. */
export function routeOk(source: string): boolean {
  return inferRoute(source) === 'jsx' || escapeTriggers(source).length > 0;
}

// ------------------------------------------------------------------ house structure
//
// The component contract from SKILL.md, as predicates. These are the half of the eval with
// dynamic range: the pilot measured conformance as saturated, and the one visible difference
// between the arms was idiom, which conformance does not score.
//
// render.test.tsx runs this whole list over every gallery chart, so a predicate that is too
// strict for real work fails there rather than quietly deflating an eval score.

/** The props destructured by the default-exported component, '' when there is no match. */
function propsOf(source: string): string {
  return /export default function \w+\s*\(\s*\{([^}]*)\}/.exec(source)?.[1] ?? '';
}

/**
 * Which of the three data shapes a component is in.
 *
 * `full`     an exported `Data` alias and a `data?: Data` prop defaulting to a bare identifier
 * `none`     neither, which is legal only for a chart whose subject is a procedure
 * `partial`  an alias with no prop, a prop with no alias, or a default that is a literal or a
 *            call — a fresh value every render, which busts every `useMemo` keyed on data
 *
 * The verifier rejects only `partial`, because a procedural chart is a legitimate `none`.
 * The eval rubric demands `full`, because every request it scores describes a dataset.
 */
export function dataContract(source: string): 'full' | 'none' | 'partial' {
  const alias = /^export type Data =/m.test(source);
  const props = propsOf(source);
  const prop = /\bdata\b/.test(props);
  if (!alias && !prop) return 'none';
  if (!alias || !prop) return 'partial';
  return /\bdata\s*=\s*[A-Za-z_$][\w$]*\s*(?:,|$)/.test(props) && /\bdata\?:\s*Data\b/.test(source)
    ? 'full'
    : 'partial';
}

/** Width arrives as a prop and height is derived from it; a fixed pixel width is the defect. */
export function widthContract(source: string): boolean {
  const props = propsOf(source);
  return /\bwidth\b/.test(props) && !/\bheight\b/.test(props) && !/\bwidth\s*=\s*\d/.test(props);
}

const PLACEHOLDER = /^(a |an |the )?(chart|graph|plot|diagram|map|visuali[sz]ation|figure|svg)$/i;

/**
 * The `aria-label` expression as written, delimiters included, or null when there is none.
 * Matched by delimiter rather than by regex because the corpus writes it as a multi-line
 * template holding quotes and interpolations, which no attribute-value pattern survives.
 */
function ariaLabelExpression(source: string): string | null {
  const at = source.indexOf('aria-label=');
  if (at < 0) return null;
  const rest = source.slice(at + 'aria-label='.length).trimStart();
  if (rest[0] === '"' || rest[0] === "'") {
    const end = rest.indexOf(rest[0], 1);
    return end < 0 ? null : rest.slice(0, end + 1);
  }
  if (rest[0] !== '{') return null;
  let depth = 0;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '{') depth++;
    else if (rest[i] === '}' && --depth === 0) return rest.slice(1, i).trim();
  }
  return null;
}

/**
 * `role="img"` plus a label saying what the chart shows, not that it is a chart.
 *
 * A computed label passes unjudged: an interpolated string or an identifier cannot be the
 * bare "chart" placeholder this rule exists to catch, and resolving it needs a parse.
 */
export function ariaLabelOk(source: string): boolean {
  if (!/role="img"/.test(source)) return false;
  const expression = ariaLabelExpression(source);
  if (expression === null) return false;
  const literal = /^(['"])([\s\S]*)\1$|^`([^`$]*)`$/.exec(expression);
  if (!literal) return true;
  const label = (literal[2] ?? literal[3]).trim();
  return label.length >= 12 && !PLACEHOLDER.test(label);
}

/**
 * The d3 constructors whose rebuild-per-render is the defect the card names. Deliberately
 * narrow: scales, layouts and binning. Shape generators (`d3.line`, `d3.arc`) are left out
 * because they are cheap and are routinely built inline at the call site in the corpus.
 */
const CONSTRUCTED =
  /\bd3\s*\.\s*(scale[A-Z]\w*|tree|cluster|pack|treemap|partition|hierarchy|stack|bin|forceSimulation)\s*[(<]/g;

/**
 * Byte spans of the balanced argument list following each `name(` in `code`. The optional
 * generic matters: `useMemo<Frame[]>(…)` is idiomatic in the corpus and a bare `name\s*\(`
 * pattern misses every one of them.
 */
function callSpans(code: string, names: string[]): Array<[number, number]> {
  const spans: Array<[number, number]> = [];
  for (const match of code.matchAll(new RegExp(`\\b(?:${names.join('|')})\\s*(?:<[^(]*>)?\\s*\\(`, 'g'))) {
    let depth = 0;
    for (let i = match.index + match[0].length - 1; i < code.length; i++) {
      if (code[i] === '(') depth++;
      else if (code[i] === ')' && --depth === 0) {
        spans.push([match.index, i]);
        break;
      }
    }
  }
  return spans;
}

/**
 * Scales and layouts built in the component body but outside a hook, which is the most common
 * performance defect in generated chart code. Returns the offending constructors.
 *
 * `useEffect` counts alongside `useMemo`: a ref-routed chart builds its scales inside the
 * effect that owns the subtree, and that is rebuilt on its deps, not on every render.
 *
 * Anything before `export default function` is module-level and therefore already constant.
 * A helper defined *after* the component that builds a scale would read as a violation; no
 * chart in the corpus is written that way, and catching it needs a parse rather than an index.
 */
export function unmemoizedConstruction(source: string): string[] {
  const code = stripComments(source);
  const body = code.indexOf('export default function');
  if (body < 0) return [];
  const hooks = callSpans(code, ['useMemo', 'useEffect', 'useLayoutEffect', 'useCallback']);
  const offenders = [...code.matchAll(CONSTRUCTED)]
    .filter((m) => m.index > body && !hooks.some(([a, b]) => m.index > a && m.index < b))
    .map((m) => `d3.${m[1]}`);
  return [...new Set(offenders)];
}

/**
 * The rubric, as one list so the verifier and the grader score the same thing in the same
 * order. `fix` is phrased as an instruction because the verifier hands it to a model.
 *
 * `data-prop` is the lenient form here — see `dataContract`. The eval grader tightens it.
 */
export const HOUSE_RULES: ReadonlyArray<{
  name: string;
  ok: (source: string) => boolean;
  fix: (source: string) => string;
}> = [
  {
    name: 'data-prop',
    ok: (source) => dataContract(source) !== 'partial',
    fix: () =>
      'take the dataset as `data?: Data` defaulting to a bare module-level identifier, and ' +
      'export the `Data` alias — an alias without a prop advertises a contract the chart does ' +
      'not honour, and a default that is a literal or a call busts every useMemo keyed on data'
  },
  {
    name: 'width-contract',
    ok: widthContract,
    fix: () =>
      'take `width` as a prop and derive the height from it — a fixed pixel width, or a height ' +
      'taken as a prop, breaks the responsive contract every parent in the gallery relies on'
  },
  {
    name: 'aria-label',
    ok: ariaLabelOk,
    fix: () =>
      'give the root <svg> role="img" and an aria-label that says what the chart shows, not ' +
      '"chart"'
  },
  {
    name: 'memoized-scales',
    ok: (source) => unmemoizedConstruction(source).length === 0,
    fix: (source) => {
      const offenders = unmemoizedConstruction(source);
      return (
        `${offenders.join(', ')} ${offenders.length > 1 ? 'are' : 'is'} rebuilt on every ` +
        'render — move the construction into a useMemo keyed on the data and the dimensions'
      );
    }
  }
];
