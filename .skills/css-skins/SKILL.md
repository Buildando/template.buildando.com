---
name: css-skins
description: Use when a static site needs swappable visual identities ("skins") — named presets of design tokens injected as CSS custom properties from one config surface, selectable in one line, with optional per-skin structural overrides scoped by a data attribute that still adapt to light and dark.
---

# CSS skins (swappable visual identities)

Technique for shipping several looks a forker can switch between (or extend) by
editing config, with **one source of truth** for the design.

## One source of truth: tokens in config, injected as CSS variables

Keep the look as data, not scattered CSS. A **skin** is a preset object — a light
and a dark palette, the font roles, the content width. The layout injects the
active skin as CSS custom properties:

```js
// per palette: bg, surface, text, muted, accent, accentContrast, border
const vars = (c) => `--color-bg:${c.bg};--color-text:${c.text};/* … */`;
tokens = `:root{${vars(active.colors[THEME.default])}--font-body:${active.fonts.body};…}` +
         `:root[data-theme="light"]{${vars(active.colors.light)}}` +
         `:root[data-theme="dark"]{${vars(active.colors.dark)}}`;
```

Because the values are injected inline from config, a parallel stylesheet trying
to set the same variables would only fight it — so **don't** split colors between
config and CSS. Selecting a skin is one line:

```ts
export const ACTIVE_SKIN = "editorial";
export const BRAND = SKINS[ACTIVE_SKIN]; // same shape as before → layout unchanged
```

Authoring a new skin is copying a preset and editing token values. Ship a test
that every preset has the full set of tokens, so switching can't leave a variable
undefined.

## Structural skins: change more than color

Some identities need more than colors — borders, radius, shadows, spacing, weight.
Put the active skin's **name** on the root and scope the extra CSS to it:

```html
<html data-skin={ACTIVE_SKIN}>
```

```css
/* only applies when this skin is active; inert otherwise */
:root[data-skin="brutalist"] .card {
  border: 3px solid var(--color-border);
  box-shadow: 6px 6px 0 var(--color-text);
  border-radius: 0;
}
```

Write these rules **against the color tokens** (`var(--color-border)`,
`var(--color-text)`), so they adapt to light and dark for free — the same offset
shadow is black on a light theme and white on a dark one. Keep this in its own
stylesheet (`skins.css`); skins that only retune tokens need nothing there.

## Gotchas

- A skin's structural CSS competes with component-scoped styles. To beat a scoped
  rule (e.g. a gradient hero title) use `!important` or a more specific selector,
  not source order — bundler order is not guaranteed.
- Blanket resets like `border-radius:0` read cleanest as
  `:root[data-skin="x"] :where(.card,.chip,…){…!important}` (the `:where()` keeps
  specificity low so component states can still win where needed).
- Content assets (post cover images) are not theme — they don't follow the skin;
  say so, and let authors pick covers that suit their palette.

## Verify

Build with a non-default skin and check a page renders its palette and any
structural rules in **both** light and dark; assert every preset is complete in a
unit test.
