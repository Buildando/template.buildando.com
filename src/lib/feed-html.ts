/**
 * Prepare rendered post HTML for a feed (REQ-016).
 *
 * A feed item is read outside the site — in an app, in another domain's reader —
 * so every root-relative URL the page could rely on (`/pt/posts/x/`, an optimized
 * `/_astro/…` image) has to become absolute or it resolves against the reader and
 * 404s. Everything already absolute, and anchors, mailto: and data: URIs, are left
 * exactly as they are.
 *
 * Pure so it can be unit-tested: the feed endpoint has no other logic worth testing.
 */

/** Attributes whose value is a single URL. */
const URL_ATTRS = ["href", "src", "poster"];

const isRelativeToRoot = (url: string) => url.startsWith("/") && !url.startsWith("//");

/** Absolute form of a root-relative URL, against the site's origin. */
function absolutize(url: string, origin: string): string {
  return isRelativeToRoot(url) ? `${origin.replace(/\/$/, "")}${url}` : url;
}

/** `srcset` is a comma-separated list of "url descriptor" pairs. */
function absolutizeSrcset(value: string, origin: string): string {
  return value
    .split(",")
    .map((candidate) => {
      const trimmed = candidate.trim();
      if (!trimmed) return "";
      const [url, ...descriptors] = trimmed.split(/\s+/);
      return [absolutize(url, origin), ...descriptors].join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

export function absolutizeHtml(html: string, origin: string): string {
  if (!html) return html;
  let out = html;
  for (const attr of URL_ATTRS) {
    out = out.replace(
      new RegExp(`(${attr}=")([^"]*)(")`, "g"),
      (_m, open, url, close) => `${open}${absolutize(url, origin)}${close}`,
    );
  }
  return out.replace(
    /(srcset=")([^"]*)(")/g,
    (_m, open, value, close) => `${open}${absolutizeSrcset(value, origin)}${close}`,
  );
}
