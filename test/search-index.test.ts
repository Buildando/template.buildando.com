import { describe, it, expect } from "vitest";
import { pagefindLanguage } from "../src/lib/search-index";

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
