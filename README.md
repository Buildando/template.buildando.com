# Buildando — static blog platform

A fast, **forkable** static blog built with [Astro](https://astro.build). Content
in markdown, **no backend**, strong SEO by construction, client-side search, and
comments via **GitHub Discussions**. Deploys to any static host via GitHub Actions.

This repository is the _template_ itself — the live demo at
[template.buildando.com](https://template.buildando.com). Fork it, edit **one**
configuration file, swap the logo, and the blog is yours.

## Using this template

On GitHub, click **“Use this template” → Create a new repository** to generate
your own blog from here (or fork it).

> ⚠️ **This repository ships with Buildando's real identity as an example** —
> name, author, social links (`@buildando`), domain, and the giscus repository.
> Before publishing, **replace all of it** in `src/config/site.ts` and swap the
> assets in `public/` (logo and social image). Step by step in
> [Forking](#forking-customize-everything).
>
> The example posts and home hero (`src/content/`) are demo content too: delete
> them and write your own.

Quick summary: edit `src/config/site.ts` → swap `public/favicon.svg` and
`public/og-default.svg` → write posts in `src/content/posts/` → configure deploy
and giscus. Each step is detailed below.

> The full spec (SDD) that governs this project lives in
> [`.specs/2026-07-20-static-blog-platform.md`](.specs/2026-07-20-static-blog-platform.md).
> Every `REQ-xxx` requirement traces to the code.

## What's included

- **Writing = creating a folder.** A post is a directory in `src/content/posts/`
  with an `index.md` and its images alongside. Nothing else in the project changes.
- **Frontmatter validated at build.** A missing required field fails the build,
  naming the post and the field.
- **Automatic SEO** on every page: `<title>`, description, canonical, Open Graph,
  Twitter Card, JSON-LD (incl. `BreadcrumbList`), `sitemap.xml`, `robots.txt`, RSS,
  and `rel="prev/next"` on paginated pages.
- **Auto social cards**: a post without a `cover` gets a branded 1200×630 Open
  Graph image generated at build (`/og/<slug>.png`) — posts with a cover use it.
- **Facets** by tag, category, and month, generated from the content — a
  client-side chip filter on the home.
- **Optional static pagination** (`POSTS_PER_PAGE`): `0` shows every post on one
  page (with the chip filter); a positive number generates crawlable numbered pages.
- **Client-side full-text search** ([Pagefind](https://pagefind.app)), no server.
- **Comments** via [giscus](https://giscus.app) (GitHub Discussions), loaded on
  demand.
- **Share buttons** on posts (X, WhatsApp, Telegram, LinkedIn, Facebook + copy
  link), config-driven, mostly no-JS share-intent links.
- **Light/dark theme** with a header toggle, remembered, no flash on load.
- **Internationalization (i18n)**: per-locale routes (`/pt/`, `/en/`), translated
  interface, a language switcher, `hreflang`, and a per-locale feed.
- **Automatic deploy** to any static host via GitHub Actions (rsync/SSH or FTP).

## Running locally

```bash
npm install
npm run dev        # dev server (drafts visible)
npm run build      # builds dist/ (astro build + search index) — drafts excluded
npm run preview    # serves the built dist/
npm test           # tests (unit; build assertions run when dist/ exists)
npm run test:build # build + assertions over dist/
npm run audit      # Lighthouse (SEO/perf/a11y/best-practices) — see below
```

Requires Node 22+ (see `.nvmrc`).

### Auditing SEO & performance locally

`npm run audit` runs [Lighthouse](https://developer.chrome.com/docs/lighthouse)
against the running preview and opens the report. It checks SEO, performance,
accessibility, and best practices locally — no deploy needed (only actual search
indexing requires the live site). In one terminal:

```bash
npm run build && npm run preview   # serves the built site on :4321
```

then, in another:

```bash
npm run audit
```

Lighthouse is fetched on demand via `npx`, so it is **not** a fixed dependency.
Point the script at another page (e.g. `/pt/posts/<slug>/`) by editing it, or run
`npx lighthouse <url> --view` directly.

## Writing a post

Create a folder in `src/content/posts/` with an `index.md`:

```markdown
---
title: "Post title"
description: "One-sentence summary — becomes the search snippet and social preview."
publishDate: 2026-07-20
category: "Best Practices"
tags: [oo, testing]
cover: ./cover.png       # image colocated in the same folder (optional)
coverAlt: "Cover description"
draft: false             # true hides it from production
---

Your **markdown** content here.
```

Required: `title`, `description`, `publishDate`. Everything else has a default.
See `src/content/config.ts` for the full schema.

## Forking (customize everything)

1. **Edit `src/config/site.ts`** — the single configuration surface: name,
   domain, author, colors, fonts, social links, navigation, giscus, analytics,
   `POSTS_PER_PAGE`, `THEME` (default theme / lock the theme), and `I18N` (locales).
2. **Swap** `public/favicon.svg` and `public/og-default.svg`.
3. **Set up comments**: make the repository public, enable _Discussions_, install
   the [giscus app](https://github.com/apps/giscus), get `repoId` and `categoryId`
   at [giscus.app](https://giscus.app), and fill in `GISCUS` in the config.
4. **Locales**: add/remove locales in `I18N` and translate the strings in
   `src/i18n/ui.ts`. Each post declares its language with `lang:` and links its
   translations with `translations:`. Single language? Keep just one locale in `I18N`.
5. **Theme**: set `THEME.default` to `"light"` or `"dark"`, or
   `THEME.allowToggle: false` to lock it and hide the toggle. To change the whole
   visual identity, pick a skin — see [Skins](#skins-visual-identity).
6. **Home hero**: edit `src/content/home/<locale>.md` (e.g. `pt.md`, `en.md`) —
   free-form markdown rendered with the site's CSS. Without the file, the home
   falls back to the site name + description.

No other file carries identity — if `buildando`, the domain, or the author appear
outside the config, it's a bug (that's what `REQ-030` guarantees).

## Skins (visual identity)

The whole look — light and dark palettes, the three fonts, and the reading-column
width — is a **skin**: a named preset of design tokens in `src/config/skins.ts`.
`site.ts` selects one with `ACTIVE_SKIN` and exports it as `BRAND`, which the layout
injects as CSS custom properties. It is the single source of truth for the look —
there is no separate stylesheet to keep in sync.

**Switch identity** — one line in `src/config/site.ts`:

```ts
export const ACTIVE_SKIN: SkinName = "editorial";
```

Shipped skins, each with a light **and** a dark palette (the theme toggle switches
between them):

| Skin | Look |
| --- | --- |
| `terminal` | default — dark-first, blue accent, Inter + Space Grotesk |
| `editorial` | serif headings, warm paper and ink, green accent |
| `mono` | monospace headings, high contrast, amber accent |
| `minimal` | near-monochrome, airy, a single lime accent |
| `warmDev` | the Solarized palette, cozy and familiar |

**Make your own** — copy a preset in `src/config/skins.ts`, rename its key, and
edit the values. Every value is a plain CSS value, so customizing the look is just
editing these tokens:

| Token | What it colors |
| --- | --- |
| `bg` | page background |
| `surface` | raised panels (filter bar, search box, dialog) |
| `text` | body text |
| `muted` | secondary text (dates, captions) |
| `accent` | links, buttons, highlights |
| `accentContrast` | text/icon drawn on top of `accent` |
| `border` | hairlines and dividers |

`fonts` sets `body`, `heading`, and `mono`; `contentWidth` is the reading column.
For a brand-new typeface, self-host it (e.g. via Fontsource) and add it to the
stack. Post cover images are content, not theme, so they don't change with the
skin — use covers that suit your palette.

## Analytics and ads

All off by default. Enable any of these in `src/config/site.ts` under `ANALYTICS`
— an empty value emits no script and makes no third-party request:

- **Plausible** (privacy-friendly): set `plausible` to your domain.
- **Google Analytics 4**: set `googleAnalytics` to your Measurement ID (`G-…`).
- **Google AdSense**: set `adsense` to your publisher id (`ca-pub-…`). This loads
  the AdSense script (site verification + Auto ads). For manual placements, drop
  the `AdUnit` component where you want an ad and pass its slot id:

  ```astro
  ---
  import AdUnit from "../components/AdUnit.astro";
  ---
  <AdUnit slot="1234567890" />
  ```

Enabling GA or AdSense sets cookies, so a **consent banner** gates them: they load
only after the reader accepts (nothing is set before consent), and the choice is
remembered. Plausible is cookieless and loads regardless. Configure it under
`CONSENT` in `src/config/site.ts` (`required: false` loads GA/AdSense immediately
with no banner, for when you have another legal basis; `privacyUrl` adds a link).

## Newsletter

Off by default, no backend. The signup form posts straight to an email provider,
which handles storage, double opt-in, sending, and unsubscribe. Set `NEWSLETTER`
in `src/config/site.ts` (empty `actionUrl` renders no form):

- **Buttondown** (recommended): set `actionUrl` to
  `https://buttondown.com/api/emails/embed-subscribe/<your-username>`, then in the
  Buttondown dashboard enable **RSS-to-email** pointing at your public feed
  (e.g. `https://your-domain/pt/rss.xml`) — new posts are emailed automatically.
- **Other providers**: paste their form endpoint and set `emailField` to the
  field name they expect (Buttondown: `email`, Mailchimp: `EMAIL`).

The form works without JavaScript. Consent/cookie obligations are yours; a short
consent line ships with the form, but no full consent flow.

## Integrations (swap or contribute)

Render-time integrations sit behind a **port + adapter** structure so they are easy
to swap and to extend with new technologies. **Comments**, **search**, and
**analytics** are ported — choose providers by name in `src/config/site.ts`:

```ts
export const INTEGRATIONS = {
  comments: "giscus",  // "giscus" | "utterances" | "none"
  search: "pagefind",  // "pagefind" | "none"
} as const;
```

Each provider is an adapter under `src/integrations/<kind>/<name>/`. Swapping is a
one-word change; adding a provider (e.g. Disqus, Algolia, Umami) is a new adapter
folder plus one line in the port. Analytics is multi-enable (Plausible + GA +
AdSense, each toggled by its config, with a provider-agnostic consent coordinator).
Contributions welcome — see [`src/integrations/README.md`](src/integrations/README.md)
for the guide, which also lists the build-time seams (search index, RSS, sitemap,
OG images, deploy).

## Deploying

The build output in `dist/` is plain static files — host them anywhere. A GitHub
Actions workflow (`.github/workflows/deploy.yml`) builds and publishes on every
push to `main`. It targets **cPanel-style shared hosting** over rsync/SSH by
default, but the transport is easy to swap for any host.

### Primary path: rsync over SSH

1. **Enable SSH** on your host (on cPanel shared plans it's often off by default
   and on port `2222`, not `22` — check with your provider).
2. Generate a key pair and put the public half in `~/.ssh/authorized_keys` on the
   server.
3. Configure the repository _secrets_ (Settings → Secrets → Actions):
   `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_SSH_PORT`
   (e.g. `2222`), `DEPLOY_TARGET_DIR` (e.g. `/home/USER/public_html`).
4. `git push` to the `main` branch triggers build + deploy.

### Fallback: FTP

If the host won't enable SSH, swap the deploy step for an FTP action (e.g.
`SamKirkland/FTP-Deploy-Action`) using secrets `FTP_SERVER`, `FTP_USERNAME`,
`FTP_PASSWORD` and `server-dir: public_html/`. The build is the same; only the
transport changes.

No credential goes into the repository — they all live in Actions secrets.

## Structure

```text
src/
  config/site.ts        # ← the single configuration surface (forking starts here)
  content/
    config.ts           # frontmatter schema (validated at build)
    posts/<slug>/        # one directory per post
  layouts/               # static page structure
  components/            # header, footer, SEO, giscus, search, card
  pages/                 # routes: home, post, tag, category, search, rss, robots
  styles/global.css      # typography and theme tokens
public/                  # logo, og default, .htaccess (passed straight to dist/)
.github/workflows/       # deploy
.specs/                  # SDD specification
.skills/                 # techniques used (Astro, SEO, giscus, Pagefind, deploy)
```

## License

Choose a license when you fork (suggested: MIT).
