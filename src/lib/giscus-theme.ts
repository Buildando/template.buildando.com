/**
 * Which giscus theme to use for a given site theme (REQ-022, REQ-031).
 *
 * Pure so it can be unit-tested: the embed lives in an iframe driven by an inline
 * script, and the part worth getting right is this mapping, not the DOM plumbing.
 * The component resolves both themes at build time and the inline script only
 * picks between them.
 */

/** Config value meaning "follow this site's light/dark toggle". */
export const FOLLOW_SITE = "site";

/** True when the embed should track the site's theme rather than a pinned one. */
export function followsSite(configured: string): boolean {
  return configured === FOLLOW_SITE;
}

/**
 * giscus theme name for a site theme. Any configured value other than "site" is a
 * giscus theme name and is returned untouched — including giscus's own
 * "preferred_color_scheme", which follows the operating system and is exactly the
 * behaviour that leaves comments dark on a site switched to light.
 *
 * The dark side maps to `dark_dimmed` rather than `dark` because the site renders
 * code blocks with github-dark-dimmed, so the embed sits on the same grey.
 */
export function giscusTheme(configured: string, siteTheme: string): string {
  if (!followsSite(configured)) return configured;
  return siteTheme === "light" ? "light" : "dark_dimmed";
}
