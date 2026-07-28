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

## 6. One language or several

The template ships bilingual (Portuguese and English), but that is configuration,
not structure. The `I18N` block decides:

```ts
export const I18N = {
  defaultLocale: "pt",
  locales: [
    { code: "pt", label: "Português", htmlLang: "pt-BR", ogLocale: "pt_BR" },
    { code: "en", label: "English",   htmlLang: "en",    ogLocale: "en_US" },
  ],
} as const;
```

**To keep a single language**, delete the other line. The language switcher
disappears from the header on its own, and URLs stay locale-prefixed (`/en/...`).
Delete that language's hero in `src/content/home/` and the posts written in it too —
a post whose `lang:` no longer exists fails the build, naming the post.

**To add a language**, add a line to `locales` and translate the strings in
`src/i18n/ui.ts`. You do not have to guess what is missing: run `npm test` and
`config-integrity.test.ts` lists exactly the keys the new language still owes.

Each post declares the language it is written in and links its translations — that
belongs to [writing posts](/en/posts/writing-posts/). What matters here is that
**nothing forces you to translate everything**: an untranslated post stays reachable
under the other languages, with the interface translated and the body in its
original language.

## 7. Logo, favicon and social images

Three files and one field:

```text
public/favicon.svg      ← header logo AND browser-tab icon
public/og-default.svg   ← social image for pages with none of their own
src/assets/author.jpg   ← the photo on the About page
```

The header logo comes from `SITE.logo`, which points at `/favicon.svg` — replace the
file keeping the name, or change the field. Being SVG, it stays sharp at any size and
weighs nothing.

Posts need no image: one without a `cover` automatically gets a social card generated
at build, carrying your brand and the skin's colors.

## 8. Social links and sharing

Two different blocks. `SOCIAL` is your own profiles, rendered as footer icons:

```ts
export const SOCIAL = [
  { label: "GitHub", href: "https://github.com/your-user", icon: "github" },
  { label: "LinkedIn", href: "https://linkedin.com/in/you", icon: "linkedin" },
] as const;
```

`icon` is a [simple-icons](https://simple-icons.org) slug. Ready to use: `github`,
`instagram`, `threads`, `x`, `tiktok`, `facebook`, `linkedin`, `youtube`, `telegram`,
`whatsapp` and `rss`. An unknown slug simply draws nothing — to add another, edit
`src/components/Icon.astro`. An empty list means a footer without icons.

`SHARE` is a different thing: the share buttons **at the foot of each post**.

```ts
export const SHARE = {
  networks: ["x", "whatsapp", "telegram", "linkedin", "facebook"],
  copyLink: true,   // copy-link button
  native: true,     // the phone's own share sheet, where available
} as const;
```

## 9. Turning integrations on

Every integration is opt-in and **empty means off** — the template as you cloned it
makes no third-party request at all.

**Comments (GitHub Discussions through giscus).** Pick the provider and fill the ids:

```ts
INTEGRATIONS.comments = "giscus";   // "giscus" | "utterances" | "none"
```

The ids come from [giscus.app](https://giscus.app), after you make a repository
public, enable **Discussions** on it and install the giscus app. Paste `repoId` and
`categoryId` into the `GISCUS` block. While `repoId` is empty, not even the comments
section renders. A tip: point it at a **separate** comments-only repository, and your
blog's own source can stay private.

Leave `theme: "site"` so the comments follow the blog's theme button. giscus's own
default (`preferred_color_scheme`) follows the operating system, which leaves the
comments dark for a reader who put the site in light mode.

**Search.** `INTEGRATIONS.search = "pagefind"` turns search on; `"none"` turns it off.
The index is built at build time and runs in the browser — there is no search server.

**Google Analytics.** Paste only the measurement id, not the whole snippet:

```ts
ANALYTICS.googleAnalytics = "G-XXXXXXXXXX";
```

That also turns the consent banner on: GA does **not** load before acceptance, and
declining clears its cookies. With analytics on you take on privacy obligations —
fill `CONSENT.privacyUrl` and `CONSENT.contact`, which feed the policy page and the
banner's link.

**Plausible.** `ANALYTICS.plausible = "your-domain.com"`. It sets no cookies, so it
triggers no banner.

**AdSense.** `ANALYTICS.adsense = "ca-pub-..."` loads the script and starts requiring
consent. Note: the `src/components/AdUnit.astro` component exists, but **no page uses
it yet** — the script loads and no ad is shown until you place the component where you
want the slot.

**Newsletter.** One common confusion first: **RSS does not send email**. The feed is
a file your site publishes; what polls it is a feed reader. Getting to email takes a
provider in between.

`NEWSLETTER.actionUrl` takes that provider's form endpoint. It accepts a single
endpoint or **one per language**:

```ts
actionUrl: "https://buttondown.com/api/emails/embed-subscribe/USER"
actionUrl: { pt: "…/USER-pt", en: "…/USER-en" }
```

On a multilingual blog prefer one per language: the feed is per language, so a list
fed from it is too, and someone who subscribes reading in English should not receive
posts in Portuguese. A language with no endpoint simply shows no form — better no
form than signing a reader up to the wrong list.

The loop closes in the provider's dashboard: turn on **RSS-to-email** for each list,
pointing at the matching feed (`/pt/rss.xml`, `/en/rss.xml`). From then on, publishing
a post sends the email on its own. The form is plain HTML posting straight to the
provider — no subscriber data touches your site, which stays static.

## 10. RSS

Nothing to configure: the feed is generated on its own, **one per language**, at
`/pt/rss.xml` and `/en/rss.xml`. It is already announced in the `<head>` of every
page, so feed readers find it by themselves, and there is an icon in the footer.
Title, description and domain come from `SITE` — changing your identity in step 2
already fixes the feed.

Drafts never reach the feed.

## 11. Publishing

`npm run build` produces the static `dist/` folder, which runs on **any** host.
The template already includes an automatic deploy workflow via GitHub Actions
(see the `README`) — just point it at your host.

Before publishing, `npm test` is worth the minute it takes: besides checking the
build, it verifies that your configuration hangs together — a language without its
translations, a skin that does not exist, consent switched off while analytics is on.

There you go — the skeleton is yours. The next step is the one that matters most:
[writing posts](/en/posts/writing-posts/).
