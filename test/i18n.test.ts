import { describe, it, expect, vi } from "vitest";

/**
 * These exercise the i18n helpers, so both the config and the dictionary are
 * fixtures: asserting real strings here would tie the suite to this site's
 * languages and copy, and a fork editing either — which the install guide tells
 * it to do — would fail tests that its build output does not contradict.
 * `test/config-integrity.test.ts` is what checks the real pair.
 */
vi.mock("../src/config/site", () => ({
  SITE: {
    title: "Fixture Title",
    description: "Fixture description.",
    url: "https://fixture.test",
  },
  I18N: {
    defaultLocale: "xx",
    locales: [
      { code: "xx", label: "Locale XX", htmlLang: "xx-XX", ogLocale: "xx_XX" },
      { code: "yy", label: "Locale YY", htmlLang: "yy-YY", ogLocale: "yy_YY" },
    ],
  },
}));

vi.mock("../src/i18n/ui", () => ({
  ui: {
    xx: { "nav.home": "Casa" },
    // yy overrides one key and adds the site identity overrides; anything it does
    // not define must fall through to xx, then to the key itself.
    yy: {
      "nav.home": "Home",
      "site.title": "Fixture Title (yy)",
      "site.description": "Fixture description in yy.",
    },
  },
}));

const {
  useTranslations,
  localizedPath,
  langFromUrl,
  hreflangAlternates,
  siteTitle,
  siteDescription,
  defaultLocale,
  locales,
} = await import("../src/i18n");

const origin = "https://fixture.test";

describe("useTranslations (REQ-032)", () => {
  it("returns the locale's string", () => {
    expect(useTranslations("xx")("nav.home")).toBe("Casa");
    expect(useTranslations("yy")("nav.home")).toBe("Home");
  });

  it("falls back to the default locale, then to the key", () => {
    // 'site.title' is defined only for yy, so xx falls through to the key.
    expect(useTranslations("xx")("site.title")).toBe("site.title");
    expect(useTranslations("yy")("totally.unknown.key")).toBe("totally.unknown.key");
    // an unknown locale falls back to the default locale's dictionary
    expect(useTranslations("zz")("nav.home")).toBe("Casa");
  });
});

describe("site identity strings (REQ-032)", () => {
  it("uses config defaults for the default locale and overrides otherwise", () => {
    expect(siteTitle("xx")).toBe("Fixture Title");
    expect(siteDescription("xx")).toBe("Fixture description.");
    expect(siteTitle("yy")).toBe("Fixture Title (yy)");
    expect(siteDescription("yy")).toBe("Fixture description in yy.");
  });
});

describe("localizedPath", () => {
  it("prefixes the locale, normalizing the leading slash", () => {
    expect(localizedPath("yy", "/tags/")).toBe("/yy/tags/");
    expect(localizedPath("yy", "tags")).toBe("/yy/tags");
    expect(localizedPath("xx", "/")).toBe("/xx/");
  });
});

describe("langFromUrl", () => {
  it("reads a known locale from the first segment", () => {
    expect(langFromUrl(new URL("https://x.dev/yy/posts/a/"))).toBe("yy");
    expect(langFromUrl(new URL("https://x.dev/xx/"))).toBe("xx");
  });
  it("falls back to the default locale for unknown/absent segments", () => {
    expect(langFromUrl(new URL("https://x.dev/"))).toBe(defaultLocale);
    expect(langFromUrl(new URL("https://x.dev/zz/foo/"))).toBe(defaultLocale);
  });
});

describe("hreflangAlternates", () => {
  it("emits one absolute alternate per configured locale plus x-default", () => {
    const alts = hreflangAlternates("/");
    const langs = alts.map((a) => a.hreflang);
    for (const code of locales) {
      expect(langs).toContain(code === "xx" ? "xx-XX" : "yy-YY");
    }
    expect(langs).toContain("x-default");
    for (const a of alts) expect(a.href.startsWith(origin)).toBe(true);
  });
});
