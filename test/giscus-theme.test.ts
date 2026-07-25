import { describe, it, expect } from "vitest";
import { giscusTheme, followsSite, FOLLOW_SITE } from "../src/lib/giscus-theme";

describe("giscusTheme (REQ-022, REQ-031)", () => {
  it("follows the site's theme when configured to", () => {
    expect(giscusTheme(FOLLOW_SITE, "light")).toBe("light");
    expect(giscusTheme(FOLLOW_SITE, "dark")).toBe("dark_dimmed");
  });

  it("treats an unknown site theme as dark, matching the shipped default", () => {
    expect(giscusTheme(FOLLOW_SITE, "")).toBe("dark_dimmed");
  });

  it("passes a pinned giscus theme through for both site themes", () => {
    for (const pinned of ["light", "dark", "dark_dimmed", "transparent_dark"]) {
      expect(giscusTheme(pinned, "light")).toBe(pinned);
      expect(giscusTheme(pinned, "dark")).toBe(pinned);
    }
  });

  it("does not reinterpret giscus's own OS-following theme", () => {
    // The bug this replaced: preferred_color_scheme reads the OS, so a reader who
    // put the site in light mode kept dark comments. It stays available, but only
    // when a fork asks for it by name — it is no longer what ships.
    expect(giscusTheme("preferred_color_scheme", "light")).toBe("preferred_color_scheme");
    expect(followsSite("preferred_color_scheme")).toBe(false);
  });

  it("recognizes only the exact opt-in value as following the site", () => {
    expect(followsSite(FOLLOW_SITE)).toBe(true);
    for (const other of ["Site", "site ", "", "auto"]) {
      expect(followsSite(other), `"${other}" must not be treated as follow-site`).toBe(false);
    }
  });
});
