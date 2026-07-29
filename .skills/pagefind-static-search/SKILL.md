---
name: pagefind-static-search
description: Use when adding full-text search to a static site with no backend — Pagefind indexes built HTML at build time and runs in the browser. Covers scoping the index (e.g. posts only), rendering results as your own cards via the JS API, and the mobile Enter/submit gotcha.
---

# Pagefind (static full-text search)

Technique for client-side search with no server and no per-search cost.

## How it works

Pagefind runs **after** the site build, over the generated HTML: it produces a
compact static index and a small client under `dist/pagefind/`. The browser
downloads only the index fragments it needs, so it scales to many posts without
shipping the whole index to every visitor.

```json
"scripts": { "build": "astro build && pagefind --site dist" }
```

Install `pagefind` as a devDependency. It indexes `**/*.html` in `dist`.

## Prebuilt UI (fast path — good for a live preview)

The Pagefind assets exist only in `dist` after the build, never in `astro dev`.
So the loader must not be bundle-resolved — use an **inline** script and a dynamic
import:

```html
<div id="search"></div>
<link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
<script is:inline>
  (async () => {
    try {
      await import("/pagefind/pagefind-ui.js");
      new PagefindUI({ element: "#search", showSubResults: true });
    } catch { /* index only exists after a production build */ }
  })();
</script>
```

`is:inline` is essential: without it, Vite/Rollup tries to resolve
`/pagefind/pagefind-ui.js` at build time and fails, because it does not exist yet.

## Scope the index — e.g. posts only

By default Pagefind indexes each page's whole `<body>`. Add `data-pagefind-body`
to the element you want indexed and **Pagefind then ignores every page that lacks
it** — so putting it only on the post article indexes posts and drops category,
tag, month, home, and about pages from search. Skip it on fallback/duplicate pages
so the same content isn't indexed twice. Drafts excluded from the build produce no
HTML, so they're never indexed.

Carry the fields your result cards need with `data-pagefind-meta` (the page title
is captured automatically; you name the rest):

```html
<time data-pagefind-meta="date">22 Jul 2026</time>
<a … data-pagefind-meta="category">Guide</a>
<img … data-pagefind-meta="image[src]" />      <!-- capture an attribute -->
<ul data-pagefind-meta="tags:oo, tests">…</ul>  <!-- or an explicit value -->
```

## Results as your own cards — the JS API

When the results should match your own listing (post cards, your pagination), skip
`PagefindUI` and render the markup yourself from the **JS API**:

```js
const pf = await import("/pagefind/pagefind.js"); // inline script only
const search = await pf.search(query);            // search.results: lazy handles
const slice = await Promise.all(
  search.results.slice(start, start + perPage).map((r) => r.data()),
);
// each fragment: { url, excerpt (HTML with <mark>), meta: { title, image, date, … } }
```

Paginate `search.results` client-side. Share the card/
pagination CSS with your feed (e.g. in a global stylesheet) so server-rendered and
client-rendered listings look identical.

## Multilingual: the index key is not the locale code

Pagefind splits the index by the `<html lang>` of the pages it indexed, keyed by
that tag **lowercased** — pages declaring `pt-BR` produce an index called `pt-br`.
Detection from the page is automatic, which is exactly what makes an explicit
option dangerous: passing the locale code, as most code has lying around, silently
overrides a correct guess with a key no index carries.

```js
await pf.options({ language: htmlLang.toLowerCase() });  // "pt-br", never "pt"
new PagefindUI({ element, language: htmlLang.toLowerCase() });
```

Nothing errors when the key is wrong. Pagefind falls back to its default index and
answers, so a Portuguese search returns English posts and looks like a missing
feature rather than a typo. A site whose locale code happens to equal its tag —
`en` — works, which hides the bug in half the cases.

Assert it against reality rather than against your intent: `dist/pagefind/
pagefind-entry.json` lists the languages actually built, so a test can check every
locale's page asks for one of them. A fork adding `es` with an `es-419` tag is then
told, instead of shipping a search that quietly answers in another language.

## Gotcha: Enter on mobile submits a form, not a keydown

If Enter should open a results page, don't rely on a `keydown` listener alone: on
mobile the keyboard's action key ("Search"/"Go") **submits Pagefind's `<form>`**
rather than firing a usable keydown. Listen for the `submit` event too, in
**capture** (before Pagefind's own handler), and reuse it for the desktop Enter.

## Verify

After `npm run build`, assert `dist/pagefind/pagefind.js` exists, that scoped
pages carry `data-pagefind-body` and other page types don't, and that a known term
resolves to the expected page.
