---
name: astro-static-testing
description: Use when testing a static Astro site with Vitest — isolating pure logic from astro:content so it runs without the Astro runtime, and asserting on the built dist/ output for SEO, routing, and i18n.
---

# Testing a static Astro site

Two layers cover most of a content site cheaply.

## 1. Pure logic, unit-tested

Anything importing `astro:content` (a virtual module) cannot be imported in plain
Vitest. So extract the interesting decision logic into a module that imports only
plain TS, and keep the `astro:content` call in a thin wrapper.

Example: post routing (which locales get a page, translation vs fallback,
canonical, hreflang) went into `src/lib/post-routes.ts` as `planPostRoutes(descriptors)`
— taking `{lang, slug, translations}[]`. `src/lib/posts.ts` keeps
`getCollection(...)`, builds descriptors, calls the pure function, and reattaches
each rendered entry. Now the hard logic is unit-testable with fixtures, no build.

**Free of `astro:content` is not the same as pure.** That module still imports the
locale list from the config surface, so its tests silently depend on how the site
is configured: fixtures written as `{lang: "en", …}` assert routes that a
single-locale fork never emits. Measured on such a fork: 12 failures across the
routing and i18n unit tests, while the build assertions stayed green. Either inject
what the logic reads —

```ts
planPostRoutes(descriptors, { locales, defaultLocale })   // caller passes the config
```

— or pin a synthetic config in the test (`vi.mock` the config module) so the unit
tests exercise the logic instead of the deployment. Injection is the honest fix:
if a module reads global config, say so rather than calling it pure.

Config, the i18n dictionary, and helpers are already plain TS — import and test
them directly. Vitest config is minimal:

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", include: ["test/**/*.test.ts"] } });
```

## 2. Build output, asserted

The rest — SEO tags, sitemap/robots/RSS, locale routes, canonical/hreflang,
markdown rendering — is most robustly checked by reading `dist/` after a build.
These need no Astro runtime, just `fs`:

```ts
const dist = join(process.cwd(), "dist");
describe.skipIf(!existsSync(dist))("build output", () => {
  it("redirects root to default locale", () =>
    expect(readFileSync(join(dist, "index.html"), "utf8")).toContain("/pt/"));
});
```

`describe.skipIf(!existsSync(dist))` lets `npm test` pass without a build (unit
tests only) and light up the build assertions after `npm run build`. Wire a
`test:build` script that builds first, and run `npm test` in CI after the build
step so `dist/` exists.

## Useful invariants to assert

- Root redirect, per-locale homes/feeds, `sitemap`, `robots` referencing it.
- One post page carries canonical, OG/Twitter, JSON-LD, absolute image URLs.
- Markdown-rendered headings have slug ids — a cheap signal that content came
  from markdown rather than a hardcoded element.
- Source scan for the config-only identity rule: grep `src/` for the domain and
  assert it appears only in the config surface.
- **Derive expected URLs from the config origin, don't hardcode them.** Import the
  config (`const origin = SITE.url`) and assert against `` `${origin}/pt/…` `` — and
  scan for `new URL(SITE.url).host` rather than a literal domain. A fork that
  changes the domain then keeps the suite green with zero test edits.
- Draft exclusion needs a `draft: true` fixture and an assertion it is absent
  from pages, feeds, sitemap, and the search index.
