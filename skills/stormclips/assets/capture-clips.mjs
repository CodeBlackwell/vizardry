// capture-clips.mjs — deterministic MP4 capture of any datastorm report's chart cards.
//
//   node capture-clips.mjs --report <report.html> --out <dir> [--fps 30] [--chrome <path>] <id>=<spec> ...
//   node capture-clips.mjs --report <report.html> --out <dir> smoke <id>
//   MODE=patch node capture-clips.mjs ...   monkey-patched clock instead of CDP virtual time
//
// spec: <speed>           replay at that speed, run to completion
//       <speed>><speed>   entrance at the first speed, flip to the second when playback begins
//       hold:<seconds>    static capture, no interaction
//
// Frames go to <out>/frames/<id>/ (deleted after assembly), MP4s and manifest.md to <out>/.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync
} from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const USAGE =
  'usage: node capture-clips.mjs --report <report.html> --out <dir> [--fps 30] [--chrome <path>] ' +
  '(smoke <id> | <id>=<spec> ...)   spec: <speed> | <speed>><speed> | hold:<seconds>';
const die = (msg) => { console.error(msg); process.exit(1); };

// ---- CLI -------------------------------------------------------------------------------
const flags = {};
const jobs = [];
let smokeId = null;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--report' || a === '--out' || a === '--fps' || a === '--chrome') flags[a.slice(2)] = argv[++i];
  else if (a === 'smoke') smokeId = argv[++i];
  else if (a.includes('=')) jobs.push({ id: a.slice(0, a.indexOf('=')), raw: a.slice(a.indexOf('=') + 1) });
  else die(`unrecognized argument: ${a}\n${USAGE}`);
}
if (!flags.report || !flags.out || (!smokeId && !jobs.length)) die(USAGE);
const REPORT = resolve(flags.report);
if (!existsSync(REPORT)) die(`no report at ${REPORT}`);
const OUT = resolve(flags.out);
const FPS = +(flags.fps || 30);
if (!(FPS > 0)) die(`--fps must be a positive number, got ${flags.fps}`);
const DT = 1000 / FPS;
const FREEZE = Math.round(FPS / 2); // 0.5s tail, and the stillness window for entrance charts
const CAP = 90 * FPS;               // hard cap per clip
const MODE = process.env.MODE || 'vt';

for (const job of jobs) {
  const raw = job.raw;
  if (raw.startsWith('hold:')) job.spec = { hold: +raw.slice(5) };
  else {
    const [a, b] = raw.split('>');
    job.spec = { speed: +a, flip: b === undefined ? null : +b };
  }
  const bad = job.spec.hold !== undefined
    ? !(job.spec.hold > 0)
    : !(job.spec.speed > 0) || (job.spec.flip !== null && !(job.spec.flip > 0));
  if (bad) die(`bad spec for ${job.id}: ${raw}\n${USAGE}`);
}

// ---- tools -----------------------------------------------------------------------------
const CHROME = flags.chrome || process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(CHROME)) die(`no Chrome at ${CHROME} — pass --chrome or set CHROME_PATH`);

const FFMPEG = process.env.FFMPEG || 'ffmpeg';
try { execFileSync(FFMPEG, ['-version'], { stdio: 'ignore' }); }
catch { die('ffmpeg not found on PATH — install it or set FFMPEG to the binary'); }

async function loadPuppeteer() {
  try { return (await import('puppeteer-core')).default; } catch {}
  let path = null;
  try { path = createRequire(join(process.cwd(), 'x.js')).resolve('puppeteer-core'); } catch {}
  const hint = process.env.PUPPETEER_CORE_PATH;
  if (hint) { // the module directory or its entry file, either works
    path = existsSync(join(hint, 'package.json'))
      ? join(hint, JSON.parse(readFileSync(join(hint, 'package.json'), 'utf8')).main || 'index.js')
      : hint;
  }
  if (path) try { return (await import(pathToFileURL(path).href)).default; } catch {}
  die('puppeteer-core not found — npm i -D puppeteer-core, or set PUPPETEER_CORE_PATH to the module');
}

// ---- concurrency lock ------------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
const LOCK = join(OUT, '.capture-lock');
try { writeFileSync(LOCK, String(process.pid), { flag: 'wx' }); }
catch { die(`another capture holds ${LOCK} — never run two captures at once; delete it only if that run is dead`); }
process.on('exit', () => { try { unlinkSync(LOCK); } catch {} });
process.on('SIGINT', () => process.exit(130));
process.on('SIGTERM', () => process.exit(143));

// ---- virtual clock injected before any page script (MODE=patch fallback) ----------------
const PATCH = `(() => {
  let now = 0, rafs = new Map(), rid = 1, timers = new Map(), tid = 1;
  performance.now = () => now;
  Date.now = () => now;
  window.requestAnimationFrame = (cb) => { rafs.set(rid, cb); return rid++; };
  window.cancelAnimationFrame = (id) => rafs.delete(id);
  window.setTimeout = (fn, ms, ...a) => {
    timers.set(tid, { at: now + (+ms || 0), fn: () => fn(...a) }); return tid++;
  };
  window.setInterval = (fn, ms, ...a) => {
    timers.set(tid, { at: now + (+ms || 1), every: +ms || 1, fn: () => fn(...a) }); return tid++;
  };
  window.clearTimeout = window.clearInterval = (id) => timers.delete(id);
  window.__tick = (dt) => {
    const target = now + dt;
    for (;;) { // due timers in deadline order, timers may re-arm
      let best = null;
      for (const [id, t] of timers) if (t.at <= target && (!best || t.at < best.t.at)) best = { id, t };
      if (!best) break;
      now = Math.max(now, best.t.at);
      if (best.t.every) best.t.at += best.t.every; else timers.delete(best.id);
      best.t.fn();
    }
    now = target;
    const run = [...rafs.values()]; rafs.clear();
    run.forEach((cb) => cb(now));
  };
})();`;

async function boot() {
  const puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--force-device-scale-factor=1', '--run-all-compositor-stages-before-draw',
      '--disable-threaded-animation', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  if (MODE === 'patch') await page.evaluateOnNewDocument(PATCH);
  page.on('pageerror', (e) => console.error('pageerror', String(e)));
  await page.goto(pathToFileURL(REPORT).href, { waitUntil: 'networkidle0' });
  if (MODE === 'patch') { // pump the virtual clock so boot entrances settle
    for (let i = 0; i < 120; i++) await page.evaluate(() => window.__tick(1000 / 30));
  } else {
    await new Promise((r) => setTimeout(r, 2600)); // real-time boot entrances finish
  }
  await page.evaluate(() => {
    window.RIG = {
      info(id) {
        const card = document.querySelector('#' + id);
        const ctrl = card && card.querySelector('.ctrl');
        const btns = ctrl ? [...ctrl.querySelectorAll('button')] : [];
        return {
          card: !!card, ctrl: !!ctrl,
          scrub: !!(ctrl && ctrl.querySelector('input[type=range]')),
          replay: btns.some((b) => b.textContent.includes('replay')),
          select: !!(ctrl && ctrl.querySelector('select')),
        };
      },
      state(id) { // transport charts only: scrubber position + whether playback is running
        const ctrl = document.querySelector('#' + id + ' .ctrl');
        const r = ctrl.querySelector('input[type=range]');
        return {
          v: +r.value, max: +r.max,
          playing: [...ctrl.querySelectorAll('button')].some((b) => b.textContent.includes('pause')),
        };
      },
      speed(id, v) {
        const s = document.querySelector('#' + id + ' .ctrl select');
        s.value = String(v);
        if (s.value !== String(v)) return false; // not one of the select's options
        s.dispatchEvent(new Event('change'));
        return true;
      },
      replay(id) { // 'replay' on transport charts, 'replay reveal' on entrance-only ones
        const all = [...document.querySelectorAll('#' + id + ' .ctrl button')];
        (all.find((b) => b.textContent.trim() === 'replay') ||
         all.find((b) => b.textContent.includes('replay'))).click();
      },
      geom(id) { // total drawn length across the card's svg — smoke's "did anything move"
        let sum = 0;
        document.querySelectorAll('#' + id + ' svg *').forEach((n) => {
          if (typeof n.getTotalLength === 'function') { try { sum += n.getTotalLength(); } catch {} }
        });
        return +sum.toFixed(1);
      },
    };
  });
  const cdp = await page.createCDPSession();
  if (MODE === 'vt') await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' });
  return { browser, page, cdp };
}

function grant(cdp, ms) {
  return new Promise((resolveGrant) => {
    const done = () => { cdp.off('Emulation.virtualTimeBudgetExpired', done); resolveGrant(); };
    cdp.on('Emulation.virtualTimeBudgetExpired', done);
    cdp.send('Emulation.setVirtualTimePolicy',
      { policy: 'pauseIfNetworkFetchesPending', budget: ms });
  });
}

async function step(page, cdp) { // advance the world by exactly one output frame
  if (MODE === 'vt') await grant(cdp, DT);
  else await page.evaluate((dt) => window.__tick(dt), DT);
}

async function cardRect(page, id) {
  // span from the option's question (p.q) down through the chart figure, so every clip
  // carries the question the chart answers; a card without one crops to the figure alone
  return page.evaluate((id) => {
    const q = document.querySelector('#' + id + ' p.q');
    const f = document.querySelector('#' + id + ' figure');
    if (!f) return null;
    f.scrollIntoView({ block: 'center', behavior: 'instant' });
    const b = f.getBoundingClientRect();
    const a = q ? q.getBoundingClientRect() : b;
    const x = Math.min(a.x, b.x), y = a.y - 12;
    return {
      x: x + window.scrollX, y: y + window.scrollY,
      width: Math.max(a.right, b.right) - x, height: b.bottom - y,
    };
  }, id);
}

async function shot(cdp, rect, path) {
  const { data } = await cdp.send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: true,
    clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scale: 2 },
  });
  const buf = Buffer.from(data, 'base64');
  writeFileSync(path, buf);
  return buf;
}

function encode(dir, out, extra) {
  execFileSync(FFMPEG, [
    '-y', ...(extra || ['-framerate', String(FPS), '-i', join(dir, 'frame_%05d.png')]),
    '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', out,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
}

function pngDims(path) { // IHDR: width and height, big-endian, at bytes 16 and 20
  const b = readFileSync(path);
  return { w: b.readUInt32BE(16) & ~1, h: b.readUInt32BE(20) & ~1 }; // after the even crop
}

const framesDir = (id) => join(OUT, 'frames', id);
const fresh = (dir) => { rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true }); };
const hash = (buf) => createHash('sha256').update(buf).digest('hex');
const manifest = [];

async function requireCard(page, id, spec) {
  const info = await page.evaluate((id) => window.RIG.info(id), id);
  if (!info.card) die(`no #${id} in the report`);
  if (spec.hold !== undefined) return info;
  if (!info.ctrl || !info.replay) die(`#${id} has no replay control — only hold:<s> works on it`);
  if (spec.flip !== null && !info.scrub) die(`#${id} has no scrubber — a>b flip specs need a transport chart`);
  if (!info.select && spec.speed !== 1) die(`#${id} has no speed select — only speed 1 works on it`);
  return info;
}

async function setSpeed(page, id, v, hasSelect) {
  if (!hasSelect && v === 1) return; // requireCard already rejected v !== 1 without a select
  if (!(await page.evaluate((a) => window.RIG.speed(a.id, a.v), { id, v })))
    die(`#${id}: ${v} is not one of the speed select's options`);
}

async function runClip(page, cdp, id, spec) {
  const info = await requireCard(page, id, spec);
  const rect = await cardRect(page, id);
  if (!rect) die(`#${id} has no figure to crop to`);
  const dir = framesDir(id);
  fresh(dir);
  const fname = (k) => join(dir, 'frame_' + String(k).padStart(5, '0') + '.png');
  const out = join(OUT, id + '.mp4');

  if (spec.hold !== undefined) { // static: one frame looped for exactly hold seconds
    await shot(cdp, rect, join(dir, 'frame.png'));
    const dims = pngDims(join(dir, 'frame.png'));
    encode(dir, out, ['-loop', '1', '-framerate', String(FPS), '-t', String(spec.hold),
      '-i', join(dir, 'frame.png')]);
    rmSync(dir, { recursive: true, force: true });
    manifest.push({ id, spec: `hold:${spec.hold}`, dur: spec.hold, dims, capped: false });
    console.log(`${id} done — ${spec.hold.toFixed(2)}s static`);
    return;
  }

  await setSpeed(page, id, spec.speed, info.select);
  await page.evaluate((id) => window.RIG.replay(id), id);
  let k = 0, still = 0, last = '', capped = false;
  let flipped = spec.flip === null;
  for (;;) {
    const buf = await shot(cdp, rect, fname(k));
    k++;
    if (k >= CAP) { capped = true; break; }
    if (info.scrub) { // transport: done when the scrubber parks at max and playback stopped
      const st = await page.evaluate((id) => window.RIG.state(id), id);
      if (!flipped && st.playing) { flipped = true; await setSpeed(page, id, spec.flip, info.select); }
      if (k > 1 && st.v >= st.max && !st.playing) break;
    } else { // entrance-only: done after fps/2 consecutive byte-identical frames
      const h = hash(buf);
      if (h === last) { if (++still >= FREEZE) break; } else { still = 0; last = h; }
    }
    await step(page, cdp);
  }
  for (let i = 0; i < FREEZE; i++) copyFileSync(fname(k - 1), fname(k + i));
  const dims = pngDims(fname(0));
  encode(dir, out);
  rmSync(dir, { recursive: true, force: true });
  const dur = (k + FREEZE) / FPS;
  manifest.push({ id, spec: jobs.find((j) => j.id === id).raw, dur, dims, capped });
  console.log(`${id} done — ${dur.toFixed(2)}s${capped ? ' (HIT THE 90s CAP)' : ''}`);
}

// ---- run -------------------------------------------------------------------------------
const { browser, page, cdp } = await boot();
try {
  if (smokeId) { // 2s at 0.25x: the entrance must progress across frames, or nothing will
    const spec = { speed: 0.25, flip: null };
    const info = await requireCard(page, smokeId, spec);
    const rect = await cardRect(page, smokeId);
    if (!rect) die(`#${smokeId} has no figure to crop to`);
    const dir = framesDir(smokeId);
    fresh(dir);
    await setSpeed(page, smokeId, 0.25, info.select);
    await page.evaluate((id) => window.RIG.replay(id), smokeId);
    const track = [];
    for (let k = 0; k <= 2 * FPS; k++) {
      if (k % Math.round(FPS / 2) === 0)
        track.push({ k, len: await page.evaluate((id) => window.RIG.geom(id), smokeId) });
      await shot(cdp, rect, join(dir, 'frame_' + String(k).padStart(5, '0') + '.png'));
      await step(page, cdp);
    }
    rmSync(dir, { recursive: true, force: true });
    console.log('mode', MODE, JSON.stringify(track));
    const moved = track[track.length - 1].len > track[0].len + 1;
    console.log(moved ? 'SMOKE PASS: entrance progresses' : 'SMOKE FAIL: static frames');
    await browser.close();
    process.exit(moved ? 0 : 1);
  }

  for (const job of jobs) await runClip(page, cdp, job.id, job.spec);

  const rows = manifest.map((m) =>
    `| ${m.id}.mp4 | \`${m.spec}\` | ${m.dur.toFixed(2)}s | ${m.dims.w}x${m.dims.h} | ${m.capped ? 'HIT 90s CAP' : 'no'} |`);
  writeFileSync(join(OUT, 'manifest.md'), [
    '# stormclips manifest', '',
    `Report: \`${REPORT}\` · ${FPS}fps · mode ${MODE} · 2x scale, light theme`, '',
    '| file | spec | duration | resolution | capped |', '|---|---|---|---|---|',
    ...rows, '',
  ].join('\n'));
  console.log(`${manifest.length} clip(s) in ${OUT} — see manifest.md`);
} finally {
  await browser.close();
}
