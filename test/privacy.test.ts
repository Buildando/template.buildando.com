import { describe, it, expect } from "vitest";
import { needsPrivacyPage, needsConsent, type PrivacyTopics } from "../src/lib/privacy";

const none: PrivacyTopics = {
  plausible: false, googleAnalytics: false, ads: false, comments: false, newsletter: false,
};

describe("needsPrivacyPage (REQ-038, REQ-039)", () => {
  it("is false for a build that processes nothing", () => {
    // The default template: no analytics, no ads, no signup, and a comments
    // provider named but not configured. A policy page saying "nothing happens
    // here", linked from every footer, is furniture.
    expect(needsPrivacyPage(none)).toBe(false);
  });

  it("is true as soon as any single topic applies", () => {
    for (const key of Object.keys(none) as (keyof PrivacyTopics)[]) {
      expect(needsPrivacyPage({ ...none, [key]: true }), `${key} alone should require it`).toBe(true);
    }
  });
});

describe("needsConsent (REQ-042)", () => {
  it("is driven only by the cookie-setting providers", () => {
    expect(needsConsent(none)).toBe(false);
    expect(needsConsent({ ...none, googleAnalytics: true })).toBe(true);
    expect(needsConsent({ ...none, ads: true })).toBe(true);
  });

  it("stays false for topics that set no cookie", () => {
    // Plausible is cookieless; comments load on scroll and set nothing here; a
    // signup form posts only what the reader types.
    expect(needsConsent({ ...none, plausible: true })).toBe(false);
    expect(needsConsent({ ...none, comments: true })).toBe(false);
    expect(needsConsent({ ...none, newsletter: true })).toBe(false);
  });
});
