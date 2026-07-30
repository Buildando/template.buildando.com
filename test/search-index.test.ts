import { describe, it, expect } from "vitest";
import { pagefindLanguage, localeSearchIndex } from "../src/lib/search-index";

describe("pagefindLanguage (REQ-020, REQ-032)", () => {
  it("lowercases a regional tag into the index key Pagefind builds", () => {
    // The bug this replaced: "pt" was passed where the index is called "pt-br",
    // so Portuguese queries fell back to the default index and answered in English.
    expect(pagefindLanguage("pt-BR")).toBe("pt-br");
    expect(pagefindLanguage("en-US")).toBe("en-us");
  });

  it("leaves a plain tag alone", () => {
    expect(pagefindLanguage("en")).toBe("en");
  });

  it("trims what a config might carry", () => {
    expect(pagefindLanguage("  pt-BR ")).toBe("pt-br");
  });
});

describe("localeSearchIndex (REQ-020, REQ-032)", () => {
  it("returns the index key when the locale has indexed content", () => {
    expect(localeSearchIndex("pt-BR", true)).toBe("pt-br");
    expect(localeSearchIndex("en", true)).toBe("en");
  });

  it("returns null when the locale has no index of its own", () => {
    // A configured locale with only fallback pages builds no Pagefind index; asking
    // for it would make Pagefind answer from the default index (another language's
    // results). null lets the UI show an empty state instead of leaking.
    expect(localeSearchIndex("es", false)).toBeNull();
    expect(localeSearchIndex("pt-BR", false)).toBeNull();
  });
});
