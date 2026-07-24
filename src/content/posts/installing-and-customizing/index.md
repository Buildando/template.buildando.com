---
title: "Installing Buildando and customizing it"
description: "From fork to live: install it, run it locally, and customize the identity, the home intro, and the About page — all from a single configuration file."
lang: en
translations:
  pt: instalando-e-personalizando
publishDate: 2026-07-21
category: "Guide"
tags:
  - setup
  - configuration
  - guide
cover: ./cover.png
coverAlt: "Cover illustration: Installing and customizing"
---

You have seen [what Buildando is](/en/posts/what-is-buildando/). Now let's put
yours online and make it look like you.

## 1. Get the template

The template lives at
[github.com/Buildando/template.buildando.com](https://github.com/Buildando/template.buildando.com).
There, click **"Use this template" → Create a new repository** (or fork it). Then
clone **your** repository and install:

```bash
git clone https://github.com/YOUR-USER/YOUR-REPO.git
cd YOUR-REPO
npm install
npm run dev      # local server, with hot reload
```

Open `http://localhost:4321` and the blog is already running. Requires Node 22+.

## 2. The single configuration surface

Almost everything that is "yours" lives in **one file**: `src/config/site.ts`.
That is where you edit the name, domain, author, the **skin** (colors and fonts —
see section 5), **social links**, navigation, languages, and the integrations
(comments, search, analytics).

```ts
export const SITE = {
  name: "My Blog",
  url: "https://my-domain.com",
  author: "Your Name",
  // ...
};
```

> Golden rule: if `buildando`, the domain, or the author shows up **outside** that
> file, it's a bug. That is what makes forking so simple.

Swap the assets in `public/` too: `favicon.svg` (the logo) and `og-default.svg`
(the default social image).

## 3. The home intro (before the feed)

That block at the top of the home page — the title and welcome line, before the
list of posts — is **free-form markdown**, one per language, in
`src/content/home/`:

```text
src/content/home/
  pt.md      ← the Portuguese hero
  en.md      ← the English hero
```

Edit `en.md` with whatever you want (title, paragraph, links) — the site's CSS
handles the looks. Without that file, the home falls back to the site name and
description.

## 4. The "About the Author" page

The **About** page lives in `src/pages/[lang]/about.astro`. The text for each
language sits right at the top of the file — replace it with yours. The menu link
already points at it.

## 5. Visual identity (skins)

The blog's looks — light/dark palettes, fonts, and reading width — are a **skin**:
a preset of tokens in `src/config/skins.ts`. Switching identity is **one line** in
`site.ts`:

```ts
export const ACTIVE_SKIN: SkinName = "editorial";
```

Six of them ship ready:

- **`terminal`** — the default: dark, blue accent, Inter + Space Grotesk
- **`editorial`** — serif headings, warm paper, green accent
- **`mono`** — monospaced headings, high contrast, amber accent
- **`minimal`** — nearly monochrome, discreet lime accent
- **`warmDev`** — the Solarized palette
- **`brutalist`** — radical: hard borders, square corners, offset shadows, violet accent

Each comes with light **and** dark (the theme button toggles). To craft your own,
copy a preset in `skins.ts` and edit the values — it is plain CSS. A skin can even
change **structure**, not just color: rules scoped by `[data-skin="name"]` in
`src/styles/skins.css` — `brutalist` is the example. More in the **Skins** section
of the `README`.

## 6. Common quick tweaks

- **Default theme**: `THEME.default` (`"dark"` or `"light"`), or lock it with `allowToggle: false`.
- **Languages**: add or remove them in `I18N` and translate the strings in `src/i18n/ui.ts`.
  Only one language? Leave a single locale.
- **Comments / search**: pick the provider in `INTEGRATIONS`
  (see `src/integrations/README.md`).
- **Analytics, ads, newsletter, share**: each one is opt-in in a config block;
  empty means it does not show up.

## 7. Publishing

`npm run build` produces the static `dist/` folder, which runs on **any** host.
The template already includes an automatic deploy workflow via GitHub Actions
(see the `README`) — just point it at your host.

There you go — the skeleton is yours. The next step is the one that matters most:
[writing posts](/en/posts/writing-posts/).
