#!/usr/bin/env node
/**
 * Validate a report palette instead of eyeballing it. Dependency-free.
 *
 *   node validate-palette.mjs "#00707E,#0090A0,#C2611A,#42509E,#8A7A18,#9E3B10,#0F6F5C" \
 *     --surface "#FFFFFF" [--poles 1,2]
 *
 * Pass the mark hues in token order (accent, accent-2, warm, indigo, olive, flag, good —
 * not flag-bg, which is a background tint). --surface is the surface they sit on; run once
 * per theme. --poles indexes the two diverging poles, default accent-2 and warm.
 *
 * Three checks, from the rules in html-report.md:
 *   contrast   every hue >= 3:1 against the surface (WCAG graphical objects)   hard
 *   distinct   no pair within deltaE 6 (near-identical); hard under normal,
 *              protanopia and deuteranopia, warning under tritanopia, weighted
 *              by prevalence (deutan ~5% of males, tritan ~0.001%)
 *   poles      the diverging pair >= deltaE 25 under normal AND every CVD      hard
 * Pairs under deltaE 15 print as warnings: adjacent steps of one hue (accent/accent-2)
 * are a legitimate design, but every such pair should be a choice, not a surprise.
 *
 * CVD simulation is Machado et al. 2009 at full severity, applied in linear RGB; distance
 * is CIE76 in Lab, which is coarse but monotone enough to rank confusability.
 */

const MACHADO = {
  protanopia: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deuteranopia: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
  tritanopia: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039]
};

const hexToRgb = (hex) => {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`not a hex color: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
};

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

const applyMatrix = (m, [r, g, b]) => [
  m[0] * r + m[1] * g + m[2] * b,
  m[3] * r + m[4] * g + m[5] * b,
  m[6] * r + m[7] * g + m[8] * b
].map(clamp01);

/** linear RGB -> XYZ (sRGB, D65) -> Lab */
function lab(linear) {
  const [r, g, b] = linear;
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

const deltaE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const luminance = (linear) => 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// ---------------------------------------------------------------- CLI

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args.splice(i, 2)[1];
};
const surfaceHex = flag('--surface', '#FFFFFF');
const poles = flag('--poles', '1,2').split(',').map(Number);
const hexes = (args[0] ?? '').split(',').map((s) => s.trim()).filter(Boolean);

if (hexes.length < 2) {
  console.error('usage: validate-palette.mjs "<hex,hex,...>" [--surface <hex>] [--poles i,j]');
  process.exit(1);
}

const linears = hexes.map((h) => hexToRgb(h).map(toLinear));
const surface = hexToRgb(surfaceHex).map(toLinear);
const conditions = { normal: null, ...MACHADO };

const seen = (cond, rgb) => lab(cond ? applyMatrix(cond, rgb) : rgb);

let failed = false;
const report = (ok, line) => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${line}`);
  if (!ok) failed = true;
};

// contrast against the surface
for (let i = 0; i < linears.length; i++) {
  const ratio = contrast(linears[i], surface);
  report(ratio >= 3, `contrast  ${hexes[i]} vs ${surfaceHex}  ${ratio.toFixed(2)}:1 (floor 3:1)`);
}

// pairwise distinguishability, normal and simulated
for (const [name, matrix] of Object.entries(conditions)) {
  const labs = linears.map((rgb) => seen(matrix, rgb));
  let worst = { d: Infinity, pair: '' };
  for (let i = 0; i < labs.length; i++) {
    for (let j = i + 1; j < labs.length; j++) {
      const d = deltaE(labs[i], labs[j]);
      if (d < worst.d) worst = { d, pair: `${hexes[i]} / ${hexes[j]}` };
      if (d < 15 && d >= 6) console.log(`  WARN  ${name}: ${hexes[i]} / ${hexes[j]} deltaE ${d.toFixed(1)} — close; make sure it is a chosen adjacency`);
    }
  }
  if (name === 'tritanopia' && worst.d < 6) {
    console.log(`  WARN  distinct  ${name}: worst pair ${worst.pair} deltaE ${worst.d.toFixed(1)} — tritanopia is rare; not a gate`);
  } else {
    report(worst.d >= 6, `distinct  ${name}: worst pair ${worst.pair} deltaE ${worst.d.toFixed(1)} (floor 6)`);
  }

  const poleD = deltaE(labs[poles[0]], labs[poles[1]]);
  report(poleD >= 25, `poles     ${name}: ${hexes[poles[0]]} / ${hexes[poles[1]]} deltaE ${poleD.toFixed(1)} (floor 25 — the diverging pair carries polarity alone)`);
}

process.exit(failed ? 1 : 0);
