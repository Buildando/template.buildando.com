---
name: svg-cover-images
description: Use when designing repeatable, on-brand post cover / Open Graph images from an SVG template rasterized to PNG with sharp — a fixed layout whose only variables are eyebrow, title, subtitle, and a topic glyph, so a whole set stays cohesive and each reads its subject at a glance.
---

# SVG Cover Images

Technique for generating designed cover art as a build asset — no design tool, no
external service. Author one SVG template, vary a few fields per post, rasterize
to PNG with `sharp`. A screenshot cover is nearly identical post to post and says
nothing about the topic; a templated illustration stays cohesive and tells the
subject at a glance.

## Fixed layout, few variables

Everything is constant except four fields, so the set reads as a series:

- **eyebrow** — short uppercase kicker, letter-spaced (a section/kind label).
- **title** — 1–2 lines, bold, large; wrap by hand into `<tspan>` lines so it
  never overflows (no auto-wrap in SVG `<text>`).
- **subtitle** — one muted line.
- **topic glyph** — a simple line-icon on the right that encodes the subject
  (e.g. a browser window = "the site", sliders = "configure", doc + plus =
  "new post"). This is what makes the cover legible without reading the words.

Constant furniture: dark ground with a subtle gradient, a left accent bar, and
the brand mark + wordmark in the top-left corner.

## The template

```js
const W = 1200, H = 630; // Open Graph 1.91:1

const svg = ({ eyebrow, titleLines, subtitle, glyph, accent, ink, muted }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d0f14"/><stop offset="1" stop-color="#161a22"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="14" height="${H}" fill="${accent}"/>              <!-- left accent bar -->
  <!-- brand mark + wordmark, top-left -->
  <g transform="translate(72,58)">${BRAND_MARK}
    <text x="58" y="30" font-family="sans-serif" font-size="30" font-weight="700" fill="${ink}">${wordmark}</text>
  </g>
  <!-- topic glyph, right -->
  <g transform="translate(860,205)" stroke="${accent}" stroke-width="8" fill="none"
     stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
  <text x="84" y="290" font-family="sans-serif" font-size="26" font-weight="700"
        letter-spacing="6" fill="${accent}">${eyebrow}</text>
  <text x="80" y="360" font-family="sans-serif" font-size="76" font-weight="800" fill="${ink}">
    ${titleLines.map((l, i) => `<tspan x="82" dy="${i ? 86 : 0}">${esc(l)}</tspan>`).join("")}
  </text>
  <text x="84" y="${360 + titleLines.length * 86 + 20}" font-family="sans-serif"
        font-size="32" fill="${muted}">${esc(subtitle)}</text>
</svg>`;
```

`esc()` must escape `& < >` — titles carry user text. Keep the glyph a short
snippet of `<path>/<rect>/<circle>` drawn on a 100×100-ish box.

## Colors from the config surface

Pass `accent` / `ink` / `muted` in from the brand config (the single identity
surface) — never hardcode the palette in the template, so a fork restyles every
cover by editing config. The dark ground can stay fixed or also come from config.

## Rasterize with sharp

```js
import sharp from "sharp";
await sharp(Buffer.from(markup)).png().toFile(`src/content/posts/${slug}/cover.png`);
```

`sharp` renders SVG through librsvg — vector in, crisp PNG out at exact pixels.

## Fonts

`font-family="sans-serif"` resolves to the host's system sans at render time (no
network, deterministic-enough for flat art). To pin an exact typeface, embed it:
base64 the `.woff2`/`.ttf` into an `@font-face` inside `<defs><style>` as a
`data:` URI — librsvg will not fetch a font URL.

## Wire it as the cover, not a one-off

Write the PNG **into the post folder** and reference it as the post `cover`. Astro
then optimizes it into responsive assets and `og:image` resolves to the hashed
`/_astro/` file — the same image serves the page and the social preview, and the
build-time auto-card fallback stays only for posts that ship no cover.

## A translated cover differs only in its words

When a post gets a translation, its cover should be the same picture with the text
swapped — same glyph, same furniture, same everything. Redrawing the glyph invites
drift, so don't: render the base (ground, bar, mark, eyebrow, title, subtitle) and
composite the counterpart's glyph straight out of its PNG.

```js
const png = await sharp(Buffer.from(base(text))).png().toBuffer();
const glyph = await sharp(siblingCover).extract(rect).toBuffer();   // rect around the glyph
await sharp(png).composite([{ input: glyph, left: rect.left, top: rect.top }]).png().toFile(out);
```

The seam is invisible because both images carry the same generated background —
verify that first by diffing a background-only region of a regenerated cover
against the original: it should be **0 pixels different**, not merely close.

## Recovering a generator you did not keep

Writing the PNG into the post folder and leaving the script out means the next
cover has nothing to reuse. If that already happened, the existing covers are the
spec — recover the parameters by calibration rather than by eye:

1. Sample the art for its palette: read the raw pixels and take the dominant color
   in each region (bar, eyebrow, title, subtitle, glyph). Guessing from a screenshot
   confuses an antialiased edge for a fill.
2. Re-render one existing cover from your reconstruction and compare **bounding box
   and ink-pixel count** per text run against the original.
3. Adjust one variable at a time — anchor, then size, then tracking. A run that
   matches in height but is wider is tracking, not size.

Sub-pixel differences that survive are fine; a 1px width delta on a 450px title is
not visible. What this buys you is confidence that new covers belong to the same set.
Then keep the script this time.

## Verify

Open each PNG (they are 1200×630) and read it as a stranger would: is the topic
obvious from the glyph + title alone, and does the set look like one family? Fix
the glyph before the words — the glyph is what carries at thumbnail size.
