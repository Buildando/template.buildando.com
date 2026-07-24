---
name: astro-i18n
description: Use when adding multiple languages to a static Astro site — locale-prefixed routing with a root redirect, a UI string dictionary, language switching, per-locale content filtering and feeds, and hreflang/og:locale output.
---

# Astro i18n (static, multi-locale)

Technique for a multi-language static site with clean, forkable structure.

## Routing: prefix every locale

The simplest structure to reason about is uniform prefixing: every locale under
`/{lang}/`, and the root redirects to the default.

```ts
// astro.config
i18n: { defaultLocale: "pt", locales: ["pt", "en"], routing: { prefixDefaultLocale: true } },
redirects: { "/": "/pt/" },
```

Put every page under `src/pages/[lang]/…`. A page that exists in all locales
returns one `getStaticPaths` entry per locale:

```ts
export function getStaticPaths() { return locales.map((lang) => ({ params: { lang } })); }
```

Faceted routes (`[lang]/tags/[tag]`) loop locales × values. Post routes emit
`{ lang: post.data.lang, slug: post.slug }` so each post renders under its own locale.

The tradeoff: the default locale lives at `/pt/`, not `/`. If un-prefixed default
is required, use `prefixDefaultLocale: false` and split default vs non-default
pages — more files, more care.

## Content by language

Give posts a `lang` frontmatter field validated against the configured locales,
and filter listings by it. Link translations manually with a
`translations: { en: "slug" }` map, consumed for `hreflang`. Nothing enforces the
reverse link — that is a review concern.

## UI strings

A dictionary keyed by locale, with a translator that falls back to the default
locale then the key:

```ts
export const ui = { pt: { "nav.home": "Início" }, en: { "nav.home": "Home" } };
export const t = (lang) => (key) => ui[lang]?.[key] ?? ui[defaultLocale]?.[key] ?? key;
```

Route nav entries and section titles through `t(key)`; keep paths locale-agnostic
and prefix them at render (`/{lang}${path}`).

## SEO per locale

- `<html lang>` from the locale's BCP-47 tag.
- `og:locale` per locale.
- `hreflang` alternates for pages that exist in every locale (home, listings) and
  from a post's declared translations; include `x-default`.
- One RSS feed per locale, and configure `@astrojs/sitemap`'s `i18n` option so the
  sitemap declares alternates.

## Language switcher

Link each locale's equivalent of the current page by swapping the first path
segment: `"/" + pathname.split("/").slice(2).join("/")` → prefix with each locale.

This is correct only where the path after the locale is itself locale-independent:
home, feeds, about, search. It is NOT correct in two cases:

- **A post whose slug differs per language** — pass the switcher explicit per-locale
  targets instead (below).
- **A facet page keyed by an authored value.** `/pt/tags/guia/` swaps to
  `/en/tags/guia/`, which does not exist, because the English posts are tagged
  `guide`. Same for categories. The switcher then links a 404 from a page that
  looks perfectly ordinary — measured at 12 such links on a two-locale site with
  ~8 posts, and it grows with every language-specific facet value. Facet pages need
  the same treatment as posts: resolve the target per locale, and when the value has
  no counterpart there, fall back to that locale's facet index or home rather than
  emitting a link that cannot resolve.

## Decoupling page locale from content language (fallback)

A post may not be translated into every locale, yet the reader should still be
able to switch the interface language. Separate two concepts:

- **Page/UI locale** — drives `<html lang>`, nav, footer, headings, date format,
  comments. Comes from the URL's locale segment.
- **Content language** — the language the post body is actually written in.

For each post, generate its canonical route `/{postLang}/posts/{slug}/` AND a
fallback route `/{L}/posts/{slug}/` for every locale `L` with no real
translation. The fallback renders the same body with locale-`L` chrome. Key
details:

- Set `<article lang="{contentLang}">` so the body's real language is announced
  even though the page is another locale.
- Point the fallback page's canonical at the post's own-language URL — the body
  is duplicate content, so only the source should be indexed.
- `hreflang` alternates list only genuine translations, never fallback pages.
- The header switcher gets explicit targets: real translation URL if it exists,
  else the fallback URL for this same post.
- Tag/category links follow the content language (their facet pages exist there),
  while labels follow the page locale.

Validate declared translations against actually-published posts so a stale link
degrades to a fallback instead of a 404.
