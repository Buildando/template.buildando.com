import { describe, it, expect } from "vitest";
import { I18N, SITE, ANALYTICS, CONSENT, NAV, SOCIAL } from "../src/config/site";
import { ui } from "../src/i18n/ui";
import { SKINS, type SkinName } from "../src/config/skins";
import { ACTIVE_SKIN } from "../src/config/site";

/**
 * The real configuration surface, checked for internal coherence. The other unit
 * tests run on fixtures so they survive a fork's edits; this one exists precisely
 * to catch a fork's edits that do not hang together — adding a locale without its
 * strings, pointing at a skin that does not exist — with a message that names what
 * is missing, instead of a broken page found later.
 */
describe("the configured locales and dictionary agree (REQ-032)", () => {
  const codes = I18N.locales.map((l) => l.code);

  it("declares at least one locale, with the default among them", () => {
    expect(codes.length).toBeGreaterThan(0);
    expect(codes).toContain(I18N.defaultLocale);
  });

  it("gives every locale a unique code and a BCP-47 tag", () => {
    expect(new Set(codes).size).toBe(codes.length);
    for (const l of I18N.locales) {
      expect(l.htmlLang, `locale ${l.code} has no htmlLang`).toBeTruthy();
      expect(l.label, `locale ${l.code} has no label`).toBeTruthy();
    }
  });

  it("has a dictionary for every configured locale", () => {
    for (const code of codes) {
      expect(ui[code as keyof typeof ui], `no ui strings for locale "${code}"`).toBeTruthy();
    }
  });

  it("translates every key of the default locale in the others", () => {
    const base = Object.keys(ui[I18N.defaultLocale as keyof typeof ui] ?? {});
    for (const code of codes) {
      if (code === I18N.defaultLocale) continue;
      const missing = base.filter((k) => !(k in (ui[code as keyof typeof ui] ?? {})));
      // Missing keys fall back to the default locale, so this is a warning-level
      // invariant — but a fork adding a locale should see exactly what it owes.
      expect(missing, `locale "${code}" is missing: ${missing.join(", ")}`).toEqual([]);
    }
  });
});

describe("the rest of the configuration surface is coherent (REQ-009, REQ-030)", () => {
  it("points ACTIVE_SKIN at a skin that exists", () => {
    expect(Object.keys(SKINS)).toContain(ACTIVE_SKIN as SkinName);
  });

  it("declares an absolute origin with no trailing slash", () => {
    expect(() => new URL(SITE.url)).not.toThrow();
    expect(SITE.url.endsWith("/")).toBe(false);
  });

  it("keeps navigation paths locale-agnostic", () => {
    // Paths are prefixed with the locale at render; a hardcoded prefix would
    // produce /pt/pt/... for one locale and a wrong link for the others.
    for (const item of NAV) {
      expect(item.path.startsWith("/"), `${item.key} must start with /`).toBe(true);
      for (const code of I18N.locales.map((l) => l.code)) {
        expect(
          item.path.startsWith(`/${code}/`),
          `${item.key} must not hardcode the locale prefix`,
        ).toBe(false);
      }
    }
  });

  it("gives every social link a label, an absolute href and an icon", () => {
    for (const s of SOCIAL) {
      expect(s.label).toBeTruthy();
      expect(s.icon, `social ${s.label} has no icon slug`).toBeTruthy();
      expect(() => new URL(s.href)).not.toThrow();
    }
  });

  it("requires consent whenever a cookie-setting provider is configured (REQ-042)", () => {
    if (ANALYTICS.googleAnalytics || ANALYTICS.adsense) {
      expect(
        CONSENT.required,
        "a cookie-setting provider is on, so CONSENT.required must stay true",
      ).toBe(true);
    }
  });

  it("keeps the privacy contact an email address when set", () => {
    if (CONSENT.contact) expect(CONSENT.contact).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });
});
