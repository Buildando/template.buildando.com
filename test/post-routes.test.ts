import { describe, it, expect, vi } from "vitest";

/**
 * The routing logic reads the locale list from the config surface, so without a
 * fixture these tests would assert the deployment rather than the logic — and a
 * fork configuring a single language would fail them (measured: 12 failures across
 * this file and i18n.test.ts) while its build output stayed correct. Pin a
 * synthetic two-locale config here; `test/build.test.ts` is what checks the real
 * one, and `test/config-integrity.test.ts` checks that it hangs together.
 *
 * The locale codes are deliberately not real languages: nothing here should read
 * as depending on this site shipping Portuguese and English.
 */
vi.mock("../src/config/site", () => ({
  SITE: { url: "https://fixture.test" },
  I18N: {
    defaultLocale: "xx",
    locales: [
      { code: "xx", label: "Locale XX", htmlLang: "xx-XX", ogLocale: "xx_XX" },
      { code: "yy", label: "Locale YY", htmlLang: "yy-YY", ogLocale: "yy_YY" },
    ],
  },
}));

const { planPostRoutes } = await import("../src/lib/post-routes");
type PlannedRoute = Awaited<ReturnType<typeof planPostRoutes>>[number];

const origin = "https://fixture.test";

const find = (routes: PlannedRoute[], lang: string, slug: string) =>
  routes.find((r) => r.params.lang === lang && r.params.slug === slug);

describe("planPostRoutes — fully translated pair (REQ-032, REQ-033)", () => {
  const routes = planPostRoutes([
    { lang: "xx", slug: "a", translations: { yy: "b" } },
    { lang: "yy", slug: "b", translations: { xx: "a" } },
  ]);

  it("emits only the two canonicals, no fallback", () => {
    expect(routes).toHaveLength(2);
    expect(find(routes, "xx", "a")).toBeDefined();
    expect(find(routes, "yy", "b")).toBeDefined();
    expect(find(routes, "yy", "a")).toBeUndefined();
    expect(find(routes, "xx", "b")).toBeUndefined();
  });

  it("switches language straight to the translation", () => {
    expect(find(routes, "xx", "a")!.langSwitch).toEqual({
      xx: "/xx/posts/a/",
      yy: "/yy/posts/b/",
    });
  });

  it("canonical of each is itself", () => {
    expect(find(routes, "xx", "a")!.canonicalPath).toBe("/xx/posts/a/");
    expect(find(routes, "yy", "b")!.canonicalPath).toBe("/yy/posts/b/");
  });

  it("hreflang lists both real versions and x-default", () => {
    const alts = find(routes, "xx", "a")!.alternates;
    const map = Object.fromEntries(alts.map((a) => [a.hreflang, a.href]));
    expect(map["xx-XX"]).toBe(`${origin}/xx/posts/a/`);
    expect(map["yy-YY"]).toBe(`${origin}/yy/posts/b/`);
    expect(map["x-default"]).toBe(`${origin}/xx/posts/a/`);
  });
});

describe("planPostRoutes — untranslated post falls back (REQ-033)", () => {
  const routes = planPostRoutes([{ lang: "xx", slug: "x" }]);

  it("emits the canonical plus a fallback in the other locale", () => {
    expect(routes).toHaveLength(2);
    expect(find(routes, "xx", "x")!.uiLang).toBe("xx");
    expect(find(routes, "yy", "x")!.uiLang).toBe("yy");
  });

  it("keeps the same slug on the fallback (same content, translated chrome)", () => {
    const fb = find(routes, "yy", "x")!;
    expect(fb.params.slug).toBe("x");
    expect(fb.sourceKey).toBe("xx:x");
  });

  it("points the fallback canonical at the source post (dedupe)", () => {
    expect(find(routes, "yy", "x")!.canonicalPath).toBe("/xx/posts/x/");
  });

  it("hreflang lists only the real version, never the fallback", () => {
    const langs = find(routes, "xx", "x")!.alternates.map((a) => a.hreflang);
    expect(langs).toContain("xx-XX");
    expect(langs).toContain("x-default");
    expect(langs).not.toContain("yy-YY");
  });

  it("switcher offers the fallback URL for the untranslated locale", () => {
    expect(find(routes, "xx", "x")!.langSwitch.yy).toBe("/yy/posts/x/");
  });
});

describe("planPostRoutes — stale translation link degrades (REQ-033 risk)", () => {
  it("ignores a declared translation whose target does not exist", () => {
    const routes = planPostRoutes([
      { lang: "xx", slug: "y", translations: { yy: "missing" } },
    ]);
    // No yy:missing post exists → treated as untranslated → fallback to /yy/posts/y/.
    expect(find(routes, "yy", "y")).toBeDefined();
    expect(find(routes, "xx", "y")!.langSwitch.yy).toBe("/yy/posts/y/");
  });
});

describe("planPostRoutes — post written in the non-default locale (REQ-033)", () => {
  const routes = planPostRoutes([{ lang: "yy", slug: "z" }]);
  it("falls back to the default locale with canonical back to the source", () => {
    expect(find(routes, "yy", "z")!.canonicalPath).toBe("/yy/posts/z/");
    expect(find(routes, "xx", "z")!.uiLang).toBe("xx");
    expect(find(routes, "xx", "z")!.canonicalPath).toBe("/yy/posts/z/");
  });
});

describe("planPostRoutes — a single configured locale (REQ-032)", () => {
  it("emits one route per post and no fallback at all", async () => {
    vi.resetModules();
    vi.doMock("../src/config/site", () => ({
      SITE: { url: origin },
      I18N: {
        defaultLocale: "xx",
        locales: [{ code: "xx", label: "Locale XX", htmlLang: "xx-XX", ogLocale: "xx_XX" }],
      },
    }));
    const solo = await import("../src/lib/post-routes");
    const routes = solo.planPostRoutes([{ lang: "xx", slug: "only" }]);
    expect(routes).toHaveLength(1);
    expect(routes[0].canonicalPath).toBe("/xx/posts/only/");
    expect(Object.keys(routes[0].langSwitch)).toEqual(["xx"]);
    // hreflang on a monolingual site is just the post itself plus x-default
    expect(routes[0].alternates.map((a) => a.hreflang).sort()).toEqual(["x-default", "xx-XX"]);
    vi.doUnmock("../src/config/site");
    vi.resetModules();
  });
});
