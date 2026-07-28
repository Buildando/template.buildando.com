import { describe, it, expect } from "vitest";
import { newsletterAction } from "../src/lib/newsletter";

describe("newsletterAction (REQ-039)", () => {
  it("uses a single endpoint for every locale", () => {
    const one = "https://provider.test/subscribe";
    expect(newsletterAction(one, "xx")).toBe(one);
    expect(newsletterAction(one, "yy")).toBe(one);
  });

  it("picks the locale's own list when endpoints are per locale", () => {
    const perLocale = { xx: "https://provider.test/xx", yy: "https://provider.test/yy" };
    expect(newsletterAction(perLocale, "xx")).toBe("https://provider.test/xx");
    expect(newsletterAction(perLocale, "yy")).toBe("https://provider.test/yy");
  });

  it("returns nothing for a locale with no list, rather than another's", () => {
    // Subscribing an English reader to the Portuguese list is worse than showing
    // no form: the reader gets posts they cannot read and unsubscribes for good.
    expect(newsletterAction({ xx: "https://provider.test/xx" }, "yy")).toBe("");
  });

  it("treats empty and blank configuration as disabled", () => {
    expect(newsletterAction("", "xx")).toBe("");
    expect(newsletterAction("   ", "xx")).toBe("");
    expect(newsletterAction({}, "xx")).toBe("");
    expect(newsletterAction({ xx: "  " }, "xx")).toBe("");
  });

  it("trims a pasted endpoint", () => {
    expect(newsletterAction({ xx: " https://provider.test/xx " }, "xx")).toBe(
      "https://provider.test/xx",
    );
  });
});

import { newsletterHiddenFields } from "../src/lib/newsletter";

describe("newsletterHiddenFields (REQ-039)", () => {
  it("renders nothing when the provider needs nothing", () => {
    expect(newsletterHiddenFields(undefined, "xx")).toEqual([]);
    expect(newsletterHiddenFields({}, "xx")).toEqual([]);
  });

  it("applies one flat set to every locale", () => {
    const fields = { html_type: "simple" };
    expect(newsletterHiddenFields(fields, "xx")).toEqual([["html_type", "simple"]]);
    expect(newsletterHiddenFields(fields, "yy")).toEqual([["html_type", "simple"]]);
  });

  it("picks the locale's own set when values differ by language", () => {
    const fields = { xx: { locale: "xx" }, yy: { locale: "yy" } };
    expect(newsletterHiddenFields(fields, "xx")).toEqual([["locale", "xx"]]);
    expect(newsletterHiddenFields(fields, "yy")).toEqual([["locale", "yy"]]);
  });

  it("yields nothing for a locale absent from a per-locale set", () => {
    expect(newsletterHiddenFields({ xx: { locale: "xx" } }, "yy")).toEqual([]);
  });
});
