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
