---
name: giscus-discussions
description: Use when embedding GitHub Discussions as a comment box on a static site via giscus — prerequisites, deterministic post-to-thread mapping, lazy loading as an island, and configuring it once.
---

# giscus (GitHub Discussions embed)

Technique for delegating comments to GitHub Discussions with no backend.

## Prerequisites (all required)

- The backing repository is **public**.
- **Discussions** is enabled on it.
- The **giscus GitHub App** is installed on the repo.
- You have `repoId` and `categoryId` from https://giscus.app (they are not the
  human-readable names). Pick a discussions **category** of type Announcement so
  only maintainers open threads.

## Configure once

Keep `repo`, `repoId`, `category`, `categoryId`, `mapping`, `theme`, `lang` in the
single config surface — never per post. Guard the whole section on
`repoId && categoryId` so an unconfigured fork renders nothing — no heading and no
script — rather than a broken widget or a placeholder.

## Deterministic mapping

`data-mapping="pathname"` maps a post to a thread by its URL path — stable across
rebuilds. Offer a per-post override: when frontmatter supplies a term, switch to
`data-mapping="specific"` + `data-term=<term>`. giscus creates the thread on first
visit, so new posts need no pre-existing discussion.

## Load lazily (island)

Do not load `giscus.app/client.js` on page load — it defeats the zero-JS default.
Inject the script only when the comment section scrolls into view:

```js
const io = new IntersectionObserver((es) => {
  if (es.some(e => e.isIntersecting)) { inject(); io.disconnect(); }
});
io.observe(mount);
```

Build the `<script>` with `data-repo`, `data-repo-id`, `data-category`,
`data-category-id`, `data-mapping`, `data-theme`, `data-lang`, `crossorigin`.

## Make the embed follow YOUR theme, not the OS

giscus's `preferred_color_scheme` reads the operating system. On a site with its own
light/dark toggle that is the wrong source: a reader who switches the page to light
keeps a dark comment box, and the toggle appears to do nothing to half the page.

Resolve the theme from your own state instead, and keep it in sync afterwards — the
embed is a cross-origin iframe, so it cannot be restyled from outside and a later
toggle only reaches it by message:

```js
new MutationObserver(function(){
  var frame = document.querySelector("iframe.giscus-frame");
  if (!frame || !frame.contentWindow) return;
  frame.contentWindow.postMessage(
    { giscus: { setConfig: { theme: themeNow() } } }, "https://giscus.app");
}).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
```

Watch the attribute, not the button: it keeps working for whatever sets it — the
toggle, the no-flash script, a control added later.

**Resolve the theme names at build time, not through `dataset`.** Writing
`data-theme-light` and reading `mount.dataset.themelight` returns `undefined`,
because the DOM camelCases it to `themeLight`. The embed then loads with the literal
string `"undefined"` as its theme and every `setConfig` carries it — no error
anywhere, the attributes look right in the HTML, and the comments simply never
follow. Interpolate the values into the script and there is no name to get wrong.

## Trade-offs

- Commenting requires a GitHub account — fine for a dev audience, excluding for a
  general one.
- Comments live in GitHub, not your repo; you own only the embed and the mapping.
