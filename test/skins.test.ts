import { describe, it, expect } from "vitest";
import { SKINS } from "../src/config/skins";

// Every skin must be a complete token preset, so switching ACTIVE_SKIN can never
// leave a CSS variable undefined.
describe("skins are complete design-token presets", () => {
  const COLOR_KEYS = [
    "bg",
    "surface",
    "text",
    "muted",
    "accent",
    "accentContrast",
    "border",
  ] as const;

  for (const [name, skin] of Object.entries(SKINS)) {
    it(`${name} defines a full light+dark palette, fonts and width`, () => {
      for (const mode of ["light", "dark"] as const) {
        const palette = skin.colors[mode] as Record<string, string>;
        for (const key of COLOR_KEYS) {
          expect(palette[key], `${name}.${mode}.${key}`).toMatch(
            /^#[0-9a-fA-F]{3,8}$/,
          );
        }
      }
      expect(skin.fonts.body).toBeTruthy();
      expect(skin.fonts.heading).toBeTruthy();
      expect(skin.fonts.mono).toBeTruthy();
      expect(skin.contentWidth).toMatch(/(rem|px|em|%|ch|vw)$/);
    });
  }
});
