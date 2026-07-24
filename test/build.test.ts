import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { SITE } from "../src/config/site";

// Absolute SEO URLs derive from the one configured origin (REQ-018), so a fork
// changing SITE.url does not break these assertions.
const origin = SITE.url;

// Build-output assertions. Skipped unless dist/ exists — run `npm run test:build`
// (which builds first), or `npm run build` before `npm test`.
const dist = join(process.cwd(), "dist");
const src = join(process.cwd(), "src");
const read = (...p: string[]) => readFileSync(join(dist, ...p), "utf8");
const has = (...p: string[]) => existsSync(join(dist, ...p));

describe.skipIf(!existsSync(dist))("build output", () => {
  it("redirects the root to the default locale (REQ-032)", () => {
    expect(read("index.html")).toContain("/pt/");
  });

  it("emits per-locale homes, feeds, sitemap, robots (REQ-014–016, 032)", () => {
    expect(has("pt", "index.html")).toBe(true);
    expect(has("en", "index.html")).toBe(true);
    expect(has("pt", "rss.xml")).toBe(true);
    expect(has("en", "rss.xml")).toBe(true);
    expect(has("sitemap-index.xml")).toBe(true);
    expect(read("robots.txt")).toContain("Sitemap:");
  });

  it("emits full SEO on a post page (REQ-011–013, 018)", () => {
    const html = read("pt", "posts", "o-que-e-o-buildando", "index.html");
    expect(html).toContain(`<link rel="canonical" href="${origin}/`);
    expect(html).toContain(`property="og:image" content="${origin}/`);
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('"@type":"BreadcrumbList"'); // REQ-013
  });

  it("uses the post cover as og:image, absolute under the domain (REQ-012)", () => {
    // All shipped posts now have covers; the auto OG-card path (og/[...route].ts)
    // stays for cover-less posts a forker adds, but there is no shipped example.
    const html = read("pt", "posts", "criando-posts", "index.html");
    expect(html).toContain(`property="og:image" content="${origin}/_astro/`);
  });

  it("excludes drafts from the production build (REQ-007)", () => {
    const slug = "exemplo-rascunho"; // ships with draft: true
    expect(has("pt", "posts", slug, "index.html")).toBe(false); // no page
    expect(read("pt", "index.html")).not.toContain(slug); // not in the home list
    expect(read("sitemap-0.xml")).not.toContain(slug); // not in the sitemap
    expect(read("pt", "rss.xml")).not.toContain(slug); // not in the feed
    expect(read("pt", "categories", "Guia", "index.html")).not.toContain(slug); // not in its facet
    expect(has("og", `${slug}.png`)).toBe(false); // no OG card generated
  });

  it("optimizes colocated cover images into responsive WebP (REQ-006)", () => {
    const html = read("pt", "posts", "o-que-e-o-buildando", "index.html");
    expect(html).toMatch(/srcset="[^"]*\.webp[^"]*\s\d+w/); // responsive webp srcset
    expect(readdirSync(join(dist, "_astro")).some((f) => f.endsWith(".webp"))).toBe(true);
  });

  it("renders the home hero from markdown (REQ-034)", () => {
    // Markdown-rendered headings get slug ids; a hardcoded hero would not.
    expect(read("pt", "index.html")).toContain('<h1 id="buildando"');
    expect(read("en", "index.html")).toContain('<h1 id="buildando"');
  });

  it("localizes the site tagline on the english home (REQ-032)", () => {
    expect(read("en", "index.html")).toContain(
      "Software development best practices",
    );
  });

  it("serves an untranslated post under the other locale with translated chrome (REQ-033)", () => {
    const fb = read("en", "posts", "exemplo-sem-traducao", "index.html");
    expect(fb).toContain('<html lang="en"');
    expect(fb).toContain('aria-label="Main"'); // nav chrome in English (nav.aria)
    expect(fb).toContain('<article lang="pt-BR"'); // body marked Portuguese
    expect(fb).toContain(
      `rel="canonical" href="${origin}/pt/posts/exemplo-sem-traducao/"`,
    );
  });

  it("lets a translation supersede the fallback route (REQ-033)", () => {
    // criando-posts now has an English version, so no fallback is emitted for it;
    // each side is its own canonical and they list each other as alternates.
    expect(has("en", "posts", "criando-posts", "index.html")).toBe(false);
    const en = read("en", "posts", "writing-posts", "index.html");
    expect(en).toContain(
      `rel="canonical" href="${origin}/en/posts/writing-posts/"`,
    );
    expect(en).toContain(
      `hreflang="pt-BR" href="${origin}/pt/posts/criando-posts/"`,
    );
  });

  it("builds a static client search index (REQ-020, 021)", () => {
    expect(has("pagefind", "pagefind.js")).toBe(true);
  });

  it("emits no analytics/ads/consent by default (REQ-038, REQ-042)", () => {
    const html = read("pt", "index.html");
    expect(html).not.toContain("googletagmanager.com");
    expect(html).not.toContain("adsbygoogle");
    expect(html).not.toContain("plausible.io");
    expect(html).not.toContain('id="consent-banner"');
  });

  it("renders no newsletter form by default (REQ-039)", () => {
    expect(read("pt", "index.html")).not.toContain('class="newsletter"');
  });

  it("shows share buttons on a post (REQ-040)", () => {
    const html = read("pt", "posts", "o-que-e-o-buildando", "index.html");
    expect(html).toContain("x.com/intent/tweet");
    expect(html).toContain("wa.me/?text=");
    expect(html).toContain("share-copy"); // copy-link button
    expect(html).toContain("share-native"); // native Web Share button
  });

  it("renders the home facet filter, hidden until JS (REQ-035)", () => {
    const html = read("pt", "index.html");
    expect(html).toContain('id="filter-bar" hidden');
    expect(html).toContain('data-filter="category"');
    expect(html).toContain('data-filter="month"'); // month chips (date facet)
    // Cards carry the metadata the filter reads.
    expect(html).toMatch(/class="card" data-category="[^"]*" data-tags="[^"]*" data-date="/);
  });

  it("exposes search from the layout on every page (REQ-036)", () => {
    for (const page of ["pt/index.html", "en/index.html", "pt/posts/criando-posts/index.html"]) {
      const html = readFileSync(join(dist, page), "utf8");
      expect(html).toContain('class="search-trigger"');
      expect(html).toContain('id="search-dialog"');
    }
  });

  it("indexes only posts for search (REQ-020)", () => {
    // data-pagefind-body marks the post article; no other page carries it, so
    // category, tag, home and about pages are excluded from the search index.
    expect(read("pt", "posts", "o-que-e-o-buildando", "index.html")).toContain(
      "data-pagefind-body",
    );
    expect(read("pt", "index.html")).not.toContain("data-pagefind-body");
    expect(read("pt", "categories", "Guia", "index.html")).not.toContain(
      "data-pagefind-body",
    );
    expect(read("pt", "about", "index.html")).not.toContain("data-pagefind-body");
  });

  it("serves a search results page with a query form (REQ-036)", () => {
    const html = read("pt", "search", "index.html");
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
