import { describe, it, expect } from "vitest";
import { facetLangSwitch } from "../src/lib/facet-routes";

const locales = ["xx", "yy"];

describe("facetLangSwitch (REQ-033)", () => {
  it("keeps the facet for a locale that has the value", () => {
    const targets = facetLangSwitch({
      kind: "tags",
      value: "astro",
      locales,
      availableIn: ["xx", "yy"],
      fallbackPath: "/tags/",
    });
    expect(targets).toEqual({ xx: "/xx/tags/astro/", yy: "/yy/tags/astro/" });
  });

  it("sends a locale without the value to a page that exists", () => {
    // The bug this replaced: /xx/tags/guia/ linked /yy/tags/guia/, which 404s
    // because that locale's posts are tagged "guide".
    const targets = facetLangSwitch({
      kind: "tags",
      value: "guia",
      locales,
      availableIn: ["xx"],
      fallbackPath: "/tags/",
    });
    expect(targets.xx).toBe("/xx/tags/guia/");
    expect(targets.yy).toBe("/yy/tags/");
  });

  it("falls back to the home for a facet with no index page", () => {
    const targets = facetLangSwitch({
      kind: "categories",
      value: "Guia",
      locales,
      availableIn: ["xx"],
      fallbackPath: "/",
    });
    expect(targets.yy).toBe("/yy/");
  });

  it("emits one target per configured locale, and only those", () => {
    const targets = facetLangSwitch({
      kind: "tags",
      value: "a",
      locales: ["xx"],
      availableIn: ["xx", "zz"],
      fallbackPath: "/tags/",
    });
    expect(Object.keys(targets)).toEqual(["xx"]);
  });

  it("keeps the authored value verbatim, accents and all", () => {
    const targets = facetLangSwitch({
      kind: "tags",
      value: "instalação",
      locales: ["xx"],
      availableIn: ["xx"],
      fallbackPath: "/tags/",
    });
    // Matches how every other facet link in the site is built; the browser
    // percent-encodes on request.
    expect(targets.xx).toBe("/xx/tags/instalação/");
  });
});
