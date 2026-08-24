---
name: stormclips
description: Render deterministic MP4 clips of the charts in a datastorm-built HTML report — CDP virtual time steps every animation at an exact frame rate, so a 10-minute entrance at 0.1x captures as cleanly as a 2x replay. Use when someone wants to make clips of the report charts, render the charts to video or MP4, capture the report animations, or take a report's charts into an editor.
---

# Stormclips

Turn the animated cards of a datastorm report into MP4 clips. The rig drives the page on a
virtual clock — every frame is granted exactly 1/fps of time, then screenshotted — so the output
is deterministic and immune to real-time jank, and playback speed is a creative choice rather
than a capture constraint.

## Requirements

`puppeteer-core` (`npm i -D puppeteer-core`, or `PUPPETEER_CORE_PATH` to an existing copy), a
real Chrome (`--chrome`, `CHROME_PATH`, or the macOS default install), and `ffmpeg` on PATH (or
`FFMPEG`). These are prerequisites of this skill only — no other Vizardry skill needs them.
Check for Chrome and `ffmpeg` before establishing anything else, and if one is missing, tell
the user what to install (`brew install ffmpeg` on macOS) and stop until they have. **Never run two captures concurrently** — they would fight over one Chrome's virtual
clock and both produce garbage. The rig enforces this with a `.capture-lock` in the output
directory; a second invocation fails fast rather than corrupting the first.

## Establish with the user

1. **Which report** — the built, self-contained HTML file.
2. **Which charts** — card ids (`article.opt` ids, e.g. `a1`, `x3`). Every animated card and
   any static one worth a hold shot.
3. **Speed per chart** — default 1x. Slow (0.25x) flatters dense entrances; fast (2x) rescues
   long playbacks. An entrance-then-playback card can flip: slow entrance, normal playback.
4. **Output directory.**

## Procedure

### 1. Smoke one transport chart first

```bash
node <skill>/assets/capture-clips.mjs --report /abs/report.html --out /abs/clips smoke a1
```

It replays the card at 0.25x, steps 2 seconds of virtual time, and requires the total drawn
geometry in the card's svg to grow across frames. A FAIL means virtual time is not driving this
page's animations — try `MODE=patch` (a monkey-patched clock injected before page scripts)
before capturing anything, because every clip would otherwise be a video of one frame.

### 2. One invocation, all specs

```bash
node <skill>/assets/capture-clips.mjs --report /abs/report.html --out /abs/clips \
  a1=0.25>1 a3=2 x4=0.5 c3=hold:4
```

Spec grammar, per card: `<speed>` replays at that speed and runs to completion —
transport charts finish when the scrubber parks at max and play resets, entrance-only charts
when half a second of frames are byte-identical. `<speed>><speed>` runs the entrance at the
first speed and flips to the second the moment playback begins (transport charts with an
entrance only). `hold:<seconds>` is a static capture, no interaction. Anything still moving at
90s is cut there and flagged in `manifest.md` — check that column, a cap hit usually means the
speed was too slow.

### 3. QA every clip — look, don't trust

```bash
ffprobe -v error -select_streams v -show_entries \
  stream=codec_name,pix_fmt,width,height,avg_frame_rate,duration -of csv <out>/a1.mp4
```

Every clip must be h264/yuv420p at the target fps with even dimensions and a duration that
matches `manifest.md` and is sane for the spec. Then extract start/mid/end frames from at least
two clips and **actually look at them** — the characteristic failure is a perfectly encoded
video of identical frames:

```bash
ffmpeg -i <out>/a1.mp4 -vf "select='eq(n,0)+eq(n,90)+eq(n,180)'" -vsync vfr -y /tmp/a1_%d.png
```

Confirm the question text (`p.q`) is in frame at the top of each clip and the frames differ
where the animation should be moving.

## What a clip is

The full card at 2x, light theme: the question line plus the chart figure with 12px headroom,
controls included. That framing is deliberate — trim, crop, or matte downstream in the editor,
where the decision is reversible.
