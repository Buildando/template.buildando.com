import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { SITE, ANALYTICS, CONSENT, NEWSLETTER, INTEGRATIONS, GISCUS } from "../src/config/site";
import { newsletterAction, newsletterHiddenFields } from "../src/lib/newsletter";
import { needsPrivacyPage } from "../src/lib/privacy";
import { locales, defaultLocale, localeMeta, useTranslations } from "../src/i18n";

// Absolute SEO URLs derive from the one configured origin (REQ-018), so a fork
// changing SITE.url does not break these assertions.
const origin = SITE.url;

// Build-output assertions. Skipped unless dist/ exists — run `npm run test:build`
// (which builds first), or `npm run build` before `npm test`.
const dist = join(process.cwd(), "dist");
const src = join(process.cwd(), "src");
const built = existsSync(dist);
const read = (...p: string[]) => readFileSync(join(dist, ...p), "utf8");
const has = (...p: string[]) => existsSync(join(dist, ...p));

/**
 * Subjects are derived from the build, never named by slug. The template ships
 * example content a forker is told to replace (REQ-002), and CI runs
 * `npm run build && npm test` — so a suite that hardcoded the sample slugs would
 * fail the fork's pipeline, and block its deploy, the moment it wrote its own
 * posts. Instead each test finds a post exhibiting the precondition it cares
 * about and reports itself skipped when the content has no such case.
 */
const attr = (html: string, re: RegExp) => re.exec(html)?.[1];
const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Every post in source, with the frontmatter facts the tests select on. */
const contentDir = join(src, "content", "posts");
const field = (fm: string, name: string) =>
  new RegExp(`^${name}:[ \\t]*(.+)$`, "m").exec(fm)?.[1].trim().replace(/^["']|["']$/g, "");
const sourcePosts = existsSync(contentDir)
  ? readdirSync(contentDir)
      .filter((slug) => existsSync(join(contentDir, slug, "index.md")))
      .sort()
      .map((slug) => {
        const fm = readFileSync(join(contentDir, slug, "index.md"), "utf8").split(/^---$/m)[1] ?? "";
        return {
          slug,
          lang: field(fm, "lang") ?? defaultLocale,
          category: field(fm, "category"),
          hasCover: /^cover:/m.test(fm),
          isDraft: /^draft:[ \t]*true\b/m.test(fm),
        };
      })
  : [];
const published = sourcePosts.filter((p) => !p.isDraft);
const draftPost = sourcePosts.find((p) => p.isDraft);
const somePost = published[0];
const coverPost = published.find((p) => p.hasCover);
const pageOf = (p: { lang: string; slug: string }) => read(p.lang, "posts", p.slug, "index.html");

/** A configured redirect builds a meta-refresh stub, not a page. It carries a
 *  canonical of its own, so it has to be told apart from a rendered post. */
const isRedirectStub = (html: string) => /http-equiv="refresh"/i.test(html);

/** Every built post page, tagged with the canonical it declares. */
const builtPages = built
  ? locales.flatMap((lang) => {
      const dir = join(dist, lang, "posts");
      if (!existsSync(dir)) return [];
      return readdirSync(dir)
        .filter((slug) => existsSync(join(dir, slug, "index.html")))
        .filter((slug) => !isRedirectStub(read(lang, "posts", slug, "index.html")))
        .map((slug) => {
          const html = read(lang, "posts", slug, "index.html");
          return {
            lang,
            slug,
            html,
            canonical: attr(html, /rel="canonical" href="([^"]+)"/) ?? "",
            own: `${origin}/${lang}/posts/${slug}/`,
          };
        });
    })
  : [];

/** Pages a locale serves for a post written in another language (REQ-033):
 *  the giveaway is a canonical pointing out of the locale serving the page. */
const fallbackPages = builtPages.filter((p) => p.canonical !== p.own);

/** Posts with a real translation: self-canonical, and listing an alternate in
 *  another locale. Each such alternate must have superseded a fallback route. */
const translatedPairs = builtPages
  .filter((p) => p.canonical === p.own)
  .flatMap((p) =>
    [...p.html.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)]
      .filter(([, hreflang]) => hreflang !== "x-default")
      .map(([, hreflang, href]) => ({ from: p, hreflang, href }))
      .filter(({ hreflang, href }) => hreflang !== localeMeta(p.lang).htmlLang && href !== p.own),
  );

/** Any built facet page of a locale, for the assertions about facet listings. */
const someCategory = (lang: string) => {
  const dir = join(dist, lang, "categories");
  return existsSync(dir)
    ? readdirSync(dir).find((c) => existsSync(join(dir, c, "index.html")))
    : undefined;
};

/** The hero block of a home page, where the markdown entry is rendered. */
const heroOf = (html: string) => {
  const start = html.indexOf('<section class="hero"');
  return start < 0 ? "" : html.slice(start, html.indexOf("</section>", start));
};

/** The prose a locale's home hero is authored from (REQ-034). */
const homeHeroes = locales
  .map((lang) => ({ lang, file: join(src, "content", "home", `${lang}.md`) }))
  .filter(({ file }) => existsSync(file))
  .map(({ lang, file }) => {
    const body = readFileSync(file, "utf8").split(/^---$/m).pop() ?? "";
    const line = body
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("#"));
    return { lang, line };
  })
  .filter((h): h is { lang: string; line: string } => Boolean(h.line));

describe.skipIf(!built)("build output", () => {
  it("redirects the root to the default locale (REQ-032)", () => {
    expect(read("index.html")).toContain(`/${defaultLocale}/`);
  });

  it("emits per-locale homes, feeds, sitemap, robots (REQ-014–016, 032)", () => {
    for (const lang of locales) {
      expect(has(lang, "index.html")).toBe(true);
      expect(has(lang, "rss.xml")).toBe(true);
    }
    expect(has("sitemap-index.xml")).toBe(true);
    expect(read("robots.txt")).toContain("Sitemap:");
  });

  it.skipIf(!somePost)("emits full SEO on a post page (REQ-011–013, 018)", () => {
    const html = pageOf(somePost);
    expect(html).toContain(`<link rel="canonical" href="${origin}/`);
    expect(html).toContain(`property="og:image" content="${origin}/`);
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('"@type":"BreadcrumbList"'); // REQ-013
  });

  it.skipIf(!coverPost)("uses the post cover as og:image, absolute under the domain (REQ-012)", () => {
    // A post that declares a cover serves the optimized asset as its social image;
    // the auto OG-card path (og/[...route].ts) covers the cover-less case below.
    expect(pageOf(coverPost!)).toContain(`property="og:image" content="${origin}/_astro/`);
  });

  it.skipIf(!published.some((p) => !p.hasCover))(
    "generates a branded OG card for a cover-less post (REQ-012)",
    () => {
      const bare = published.find((p) => !p.hasCover)!;
      expect(pageOf(bare)).toContain(
        `property="og:image" content="${origin}/og/${bare.slug}.png`,
      );
    },
  );

  it.skipIf(!draftPost)("excludes drafts from the production build (REQ-007)", () => {
    const { slug, lang, category } = draftPost!;
    expect(has(lang, "posts", slug, "index.html")).toBe(false); // no page
    expect(read(lang, "index.html")).not.toContain(slug); // not in the home list
    expect(read("sitemap-0.xml")).not.toContain(slug); // not in the sitemap
    expect(read(lang, "rss.xml")).not.toContain(slug); // not in the feed
    if (category && has(lang, "categories", category, "index.html")) {
      expect(read(lang, "categories", category, "index.html")).not.toContain(slug); // not in its facet
    }
    expect(has("og", `${slug}.png`)).toBe(false); // no OG card generated
  });

  it.skipIf(!coverPost)("optimizes colocated cover images into responsive WebP (REQ-006)", () => {
    expect(pageOf(coverPost!)).toMatch(/srcset="[^"]*\.webp[^"]*\s\d+w/); // responsive webp srcset
    expect(readdirSync(join(dist, "_astro")).some((f) => f.endsWith(".webp"))).toBe(true);
  });

  it.skipIf(!homeHeroes.length)("renders each home hero from its own markdown (REQ-032, 034)", () => {
    for (const { lang, line } of homeHeroes) {
      // Scoped to the hero: the same prose also reaches the meta description, so
      // asserting on the whole document would pass on a hardcoded hero.
      const hero = heroOf(read(lang, "index.html"));
      expect(hero).not.toBe("");
      // Markdown-rendered headings get slug ids; a hardcoded hero would not.
      expect(hero).toMatch(/<h1 id="[^"]+"/);
      // and the prose is this locale's own file, not another locale's
      expect(hero).toContain(escapeAttr(line));
    }
  });

  it.skipIf(!fallbackPages.length)(
    "serves an untranslated post under the other locale with translated chrome (REQ-033)",
    () => {
      for (const { lang, html, canonical } of fallbackPages) {
        expect(html).toContain(`<html lang="${localeMeta(lang).htmlLang}"`);
        expect(html).toContain(`aria-label="${useTranslations(lang)("nav.aria")}"`); // chrome in the page locale
        // the body keeps its own content language, which is not the page locale
        const bodyLang = attr(html, /<article lang="([^"]+)"/);
        expect(bodyLang).toBeTruthy();
        expect(bodyLang).not.toBe(localeMeta(lang).htmlLang);
        // and the canonical points at a page that really exists in that language
        expect(canonical.startsWith(`${origin}/`)).toBe(true);
        expect(has(...canonical.slice(origin.length).split("/").filter(Boolean), "index.html")).toBe(true);
      }
    },
  );

  it.skipIf(!translatedPairs.length)("lets a translation supersede the fallback route (REQ-033)", () => {
    for (const { from, href } of translatedPairs) {
      const [lang, , slug] = href.slice(origin.length).split("/").filter(Boolean);
      // the translation is served at its own slug, as its own canonical...
      expect(read(lang, "posts", slug, "index.html")).toContain(
        `rel="canonical" href="${origin}/${lang}/posts/${slug}/"`,
      );
      // ...so that locale renders no fallback page for the source post. A
      // URL-preserving redirect may sit at the old address; a rendered page may not.
      if (slug !== from.slug) {
        const stray = join(dist, lang, "posts", from.slug, "index.html");
        if (existsSync(stray)) {
          expect(isRedirectStub(readFileSync(stray, "utf8"))).toBe(true);
        }
      }
    }
  });

  it.skipIf(
    !(INTEGRATIONS.comments === "giscus" && GISCUS.repoId && GISCUS.categoryId) || !somePost,
  )("hands the comments embed real theme names (REQ-022, REQ-031)", () => {
    // The failure this guards was silent: the script read dataset keys that did not
    // exist — `data-theme-light` becomes `dataset.themeLight`, and `themelight` is
    // undefined — so the embed loaded with the literal string "undefined" as its
    // theme and never followed the site. Everything looked configured; only the
    // running page disagreed.
    const html = pageOf(somePost);
    const light = attr(html, /var themeLight = "([^"]*)"/);
    const dark = attr(html, /themeDark = "([^"]*)"/);
    expect(light, "no light theme reached the embed").toBeTruthy();
    expect(dark, "no dark theme reached the embed").toBeTruthy();
    expect([light, dark]).not.toContain("undefined");
  });

  it("builds a static client search index (REQ-020, 021)", () => {
    expect(has("pagefind", "pagefind.js")).toBe(true);
  });

  it.skipIf(!published.length)("searches the index that its own locale actually built (REQ-020, 032)", () => {
    // The failure this guards: the page asks Pagefind for a language key that no
    // index carries, and the search quietly answers from the default one — which is
    // how Portuguese queries returned English posts. English hid it, because the
    // locale code and the index key coincide there.
    const entry = JSON.parse(read("pagefind", "pagefind-entry.json"));
    const built = Object.keys(entry.languages ?? {});
    expect(built.length).toBeGreaterThan(0);
    // A configured locale with no posts of its own builds no index (the install
    // guide allows a language to exist untranslated). Such a locale legitimately
    // emits no search language and shows an empty state — the fix for the same
    // leak. So the invariant is: any language a locale DOES request must be one
    // Pagefind actually built, and at least one locale requests one.
    let emitted = 0;
    for (const lang of locales) {
      const asked = attr(read(lang, "search", "index.html"), /searchLanguage\s*=\s*"([^"]+)"/);
      if (!asked) continue;
      emitted++;
      expect(built, `${lang} asks for "${asked}", which no index provides`).toContain(asked);
    }
    expect(emitted, "no locale emitted a search language").toBeGreaterThan(0);
  });

  it("ships exactly the analytics that are configured (REQ-038, REQ-042)", () => {
    const html = read(defaultLocale, "index.html");
    // Each provider is opt-in: present when its id is set, absent when it is not.
    // Asserting equality (not just absence) keeps this honest whether a fork has
    // analytics off — the default — or on.
    expect(html.includes("plausible.io")).toBe(Boolean(ANALYTICS.plausible));
    expect(html.includes("googletagmanager.com")).toBe(Boolean(ANALYTICS.googleAnalytics));
    expect(html.includes("adsbygoogle")).toBe(Boolean(ANALYTICS.adsense));

    // AdSense also needs an account-association meta tag. It carries no request and
    // no cookie, so unlike the ad script it is not gated — but it must exist, or the
    // dashboard cannot verify the site and no ad ever serves.
    expect(html.includes('name="google-adsense-account"')).toBe(Boolean(ANALYTICS.adsense));
    if (ANALYTICS.adsense) {
      expect(html).toContain(
        `<meta name="google-adsense-account" content="${ANALYTICS.adsense}">`,
      );
    }

    const gated = Boolean(ANALYTICS.googleAnalytics || ANALYTICS.adsense);
    expect(html.includes('id="consent-banner"')).toBe(gated && CONSENT.required);
    // Consent must be as easy to withdraw as to give, so the control that reopens
    // the decision ships wherever the banner does.
    expect(html.includes('id="consent-reset"')).toBe(gated && CONSENT.required);
    if (gated) {
      // The cookie-setting tag is only registered on the consent queue — the page
      // itself must never load it, or consent would be decorative.
      expect(html).not.toMatch(/<script[^>]+src="https:\/\/www\.googletagmanager\.com/);
      expect(html).toContain("__consentLoaders");
    }
  });

  it("renders the signup form exactly where a list is configured (REQ-039)", () => {
    // Opt-in per locale: the form appears only where an endpoint exists, and when
    // it does it carries what the provider requires — a form that posts without
    // the provider's own fields is accepted and silently subscribes nobody.
    for (const lang of locales) {
      const html = read(lang, "index.html");
      const action = newsletterAction(NEWSLETTER.actionUrl, lang);
      expect(html.includes('class="newsletter"')).toBe(Boolean(action));
      if (!action) continue;
      expect(html).toContain(`action="${action}"`);
      expect(html).toContain(`name="${NEWSLETTER.emailField}"`);
      for (const [name, value] of newsletterHiddenFields(NEWSLETTER.hiddenFields, lang)) {
        expect(html).toContain(`name="${name}"`);
        // An empty value renders as a bare attribute, which submits as "" — which
        // is exactly what a honeypot field must do.
        if (value) expect(html).toContain(`name="${name}" value="${value}"`);
      }
    }
  });

  it.skipIf(!somePost)("shows share buttons on a post (REQ-040)", () => {
    const html = pageOf(somePost);
    expect(html).toContain("x.com/intent/tweet");
    expect(html).toContain("wa.me/?text=");
    expect(html).toContain("share-copy"); // copy-link button
    expect(html).toContain("share-native"); // native Web Share button
  });

  // The facet filter only appears when the default-locale home has posts to
  // filter; a blog with no published posts there shows the empty state instead.
  it.skipIf(!published.some((p) => p.lang === defaultLocale))("renders the home facet filter, hidden until JS (REQ-035)", () => {
    const html = read(defaultLocale, "index.html");
    expect(html).toContain('id="filter-bar" hidden');
    expect(html).toContain('data-filter="category"');
    expect(html).toContain('data-filter="month"'); // month chips (date facet)
    // Cards carry the metadata the filter reads.
    expect(html).toMatch(/class="card" data-category="[^"]*" data-tags="[^"]*" data-date="/);
  });

  it("exposes search from the layout on every page (REQ-036)", () => {
    const pages = [
      ...locales.map((lang) => read(lang, "index.html")),
      ...(somePost ? [pageOf(somePost)] : []),
    ];
    for (const html of pages) {
      expect(html).toContain('class="search-trigger"');
      expect(html).toContain('id="search-dialog"');
    }
  });

  it.skipIf(!somePost)("indexes only posts for search (REQ-020)", () => {
    // data-pagefind-body marks the post article; no other page carries it, so
    // category, tag, home and about pages are excluded from the search index.
    expect(pageOf(somePost)).toContain("data-pagefind-body");
    expect(read(defaultLocale, "index.html")).not.toContain("data-pagefind-body");
    const category = someCategory(defaultLocale);
    if (category) {
      expect(read(defaultLocale, "categories", category, "index.html")).not.toContain(
        "data-pagefind-body",
      );
    }
    expect(read(defaultLocale, "about", "index.html")).not.toContain("data-pagefind-body");
  });

  it("publishes a privacy policy exactly where there is something to disclose (REQ-038, 039)", () => {
    // The page, the footer link and the banner all follow the same fact: what this
    // build actually processes. A blog with no analytics, no ads, no comments embed
    // and no signup form discloses nothing, so it ships none of the three rather
    // than a page saying "nothing happens here" linked from every footer.
    for (const lang of locales) {
      const needed = needsPrivacyPage({
        plausible: Boolean(ANALYTICS.plausible),
        googleAnalytics: Boolean(ANALYTICS.googleAnalytics),
        ads: Boolean(ANALYTICS.adsense),
        comments:
          INTEGRATIONS.comments === "giscus" && Boolean(GISCUS.repoId && GISCUS.categoryId),
        newsletter: Boolean(newsletterAction(NEWSLETTER.actionUrl, lang)),
      });
      expect(has(lang, "privacy", "index.html"), `${lang}: privacy page`).toBe(needed);
      const linked = read(lang, "index.html").includes(`href="/${lang}/privacy"`);
      expect(linked, `${lang}: footer privacy link`).toBe(needed);
      if (!needed) {
        expect(read("sitemap-0.xml")).not.toContain(`/${lang}/privacy`);
      }
    }
  });

  it.skipIf(!published.length)("serves a search results page with a query form (REQ-036)", () => {
    const html = read(defaultLocale, "search", "index.html");
    expect(html).toContain('name="q"'); // the query input the form submits
    expect(html).toContain('id="search-results"'); // container the client fills with cards
    expect(html).toContain("/pagefind/pagefind.js"); // renders via the Pagefind JS API
  });
});

// Source-level invariants, independent of dist.
describe("pure logic stays unit-testable (architecture)", () => {
  it("the pure modules do not import astro:content", () => {
    const pure = [
      "lib/facet-filter.ts",
      "lib/post-routes.ts",
      "lib/seo.ts",
      "i18n/index.ts",
      "i18n/ui.ts",
    ];
    for (const f of pure) {
      // an actual import, not a mention in a comment
      expect(readFileSync(join(src, f), "utf8")).not.toMatch(
        /from ["']astro:content["']/,
      );
    }
  });
});

describe("identity confined to the config surface (REQ-030)", () => {
  it("the domain appears in src code only inside config/site.ts", () => {
    const host = new URL(SITE.url).host; // whatever a fork configures
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          // Example content (posts, home) is authored prose a forker replaces —
          // the rule guards the reusable code, not the sample content (which may
          // legitimately name the template's own repo, e.g. in the install guide).
          if (full === join(src, "content")) continue;
          walk(full);
        } else if (/\.(astro|ts|js|md)$/.test(entry.name)) {
          if (full.endsWith(join("config", "site.ts"))) continue;
          if (readFileSync(full, "utf8").includes(host)) {
            offenders.push(full);
          }
        }
      }
    };
    walk(src);
    expect(offenders).toEqual([]);
  });
});
