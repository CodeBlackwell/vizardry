#!/usr/bin/env node
/**
 * Picks the exemplars to show a model for a given request.
 *
 *   node bin/retrieve.mjs "flows between stages over time" [--top 3] [--why]
 *
 * This is the deterministic half of retrieval. The agentic half is docs/digest.md, which a
 * model reads and picks from directly. Both run over the same catalog fields on purpose: if
 * the shipped tool lets the model pick and an eval measures this, the eval is not measuring
 * the product.
 *
 * There is no query-side synonym table. The earlier one was hand-written against 26 known
 * requests and could not generalize — "flows between stages" shared no token with anything in
 * the index. The fix was to enrich the documents instead: every chart carries authored
 * `when_to_use` text, 8 to 15 keywords across technique / question / data, and its `data_shape`.
 * Plain IDF works once the document side is rich enough, and the query side needs no table.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Words that separate nothing. The function words matter more than they look: the authored
 * `when_to_use` sentences are prose, so a word like "have" lands in a handful of documents,
 * earns a high IDF for being rare, and then outranks the actual subject of the request. Once
 * `have` was stopped, "I have dates and revenue" stopped retrieving a quantile plot.
 */
const STOP = new Set(['a', 'an', 'the', 'of', 'with', 'and', 'in', 'on', 'at', 'by', 'to',
  'per', 'each', 'that', 'for', 'from', 'into', 'its', 'it', 'is', 'are', 'was', 'were', 'be',
  'been', 'has', 'have', 'had', 'can', 'could', 'would', 'should', 'will', 'may', 'might',
  'not', 'but', 'than', 'then', 'when', 'where', 'which', 'who', 'what', 'how', 'why', 'this',
  'these', 'those', 'they', 'them', 'their', 'there', 'here', 'you', 'your', 'our', 'own',
  'all', 'any', 'some', 'more', 'most', 'less', 'least', 'other', 'same', 'such', 'just',
  'only', 'also', 'very', 'over', 'under', 'out', 'off', 'about', 'across', 'through',
  'one', 'two', 'several', 'many', 'few', 'both', 'either', 'neither',
  'chart', 'diagram', 'plot', 'show', 'want', 'need', 'make', 'draw', 'render', 'using', 'use',
  'data', 'dataset', 'visualization', 'visualisation', 'graph', 'd3', 'svg', 'react']);

/**
 * Crude singular form. Query and documents pass through the same function, so "series" losing
 * its final letter costs nothing as long as it loses it on both sides — matching is what
 * matters here, not linguistics. Without it "dates" and "date" are unrelated tokens.
 */
const singular = (word) =>
  word.length > 4 && word.endsWith('s') && !/(ss|us|is)$/.test(word) ? word.slice(0, -1) : word;

const terms = (text) =>
  (text.toLowerCase().match(/[a-z]+/g) ?? [])
    .filter((t) => t.length > 2 && !STOP.has(t))
    .map(singular);

export const tokens = (text) => new Set(terms(text));

/** Token counts, because how often a chart says "state" is the difference between a
 *  choropleth and a bar chart that happens to mention states once. */
const counts = (text) => {
  const bag = new Map();
  for (const t of terms(text)) bag.set(t, (bag.get(t) ?? 0) + 1);
  return bag;
};

/** Everything a chart says about itself, authored text included. */
const documentOf = (chart) =>
  [
    chart.id.replace(/-/g, ' '),
    chart.title,
    chart.category,
    chart.when_to_use ?? '',
    (chart.keywords ?? []).join(' '),
    chart.data_shape ?? '',
    chart.d3_apis.join(' ')
  ].join(' ');

export function buildIndex(charts) {
  const bags = new Map(charts.map((c) => [c.id, counts(documentOf(c))]));
  const idf = new Map();
  for (const bag of bags.values()) for (const t of bag.keys()) idf.set(t, (idf.get(t) ?? 0) + 1);
  for (const [t, df] of idf) idf.set(t, Math.log(charts.length / df));
  return { bags, idf };
}

/**
 * Ranked hits, best first. Ties break on id so the order is stable across runs rather than
 * dependent on catalog order, which changes whenever a chart is registered.
 */
export function retrieve(query, charts, index = buildIndex(charts), top = 3) {
  const wanted = tokens(query);
  return charts
    .map((chart) => {
      const bag = index.bags.get(chart.id);
      const matched = [...wanted].filter((t) => bag.has(t));
      return {
        chart,
        // Sublinear in frequency: the fourth mention of "state" should not count as much as
        // the first, or a long description would beat a precise one on length alone.
        score: matched.reduce((sum, t) => sum + index.idf.get(t) * (1 + Math.log(bag.get(t))), 0),
        matched
      };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.chart.id.localeCompare(b.chart.id))
    .slice(0, top);
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('retrieve.mjs');
if (invokedDirectly) {
  const args = process.argv.slice(2);
  const why = args.includes('--why');
  const topFlag = args.indexOf('--top');
  const top = topFlag === -1 ? 3 : Number(args[topFlag + 1]);
  // Guarded: with no --top present, `topFlag + 1` is 0 and this drops the query itself.
  const topValue = topFlag === -1 ? -1 : topFlag + 1;
  const query = args.filter((a, i) => !a.startsWith('--') && i !== topValue).join(' ');

  if (!query) {
    console.error('usage: node bin/retrieve.mjs "<request>" [--top N] [--why]');
    process.exit(1);
  }

  // Beside the script, then the plugin layout, then the gallery — one file works in all three.
  const catalogPath = [
    join(here, 'catalog.json'),
    join(here, '../catalog/catalog.json'),
    join(here, '../docs/catalog.json')
  ].find((p) => existsSync(p));

  if (!catalogPath) {
    console.error('no catalog.json found beside this script, in ../catalog/, or in ../docs/');
    process.exit(1);
  }
  const { charts } = JSON.parse(readFileSync(catalogPath, 'utf8'));

  const hits = retrieve(query, charts, buildIndex(charts), top);
  if (!hits.length) console.log('no exemplar matched');
  for (const hit of hits) {
    console.log(`${hit.score.toFixed(2).padStart(6)}  ${hit.chart.id}  — ${hit.chart.when_to_use}`);
    if (why) console.log(`        matched: ${hit.matched.sort().join(', ')}`);
  }
}
