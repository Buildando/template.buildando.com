import { describe, it, expect } from "vitest";
import { absolutizeHtml } from "../src/lib/feed-html";

const origin = "https://example.test";

describe("absolutizeHtml (REQ-016)", () => {
  it("absolutizes root-relative links and images", () => {
    const html = '<a href="/pt/posts/x/">x</a><img src="/_astro/a.webp">';
    expect(absolutizeHtml(html, origin)).toBe(
      `<a href="${origin}/pt/posts/x/">x</a><img src="${origin}/_astro/a.webp">`,
    );
  });

  it("leaves absolute, protocol-relative, anchor, mailto and data URLs alone", () => {
    const html =
      '<a href="https://other.test/a">a</a>' +
      '<a href="//cdn.test/b">b</a>' +
      '<a href="#section">c</a>' +
      '<a href="mailto:me@example.test">d</a>' +
      '<img src="data:image/gif;base64,R0lGOD">';
    expect(absolutizeHtml(html, origin)).toBe(html);
  });

  it("rewrites every candidate in a srcset, keeping the descriptors", () => {
    const html = '<img srcset="/_astro/a.webp 400w, /_astro/b.webp 800w" src="/_astro/a.webp">';
    expect(absolutizeHtml(html, origin)).toBe(
      `<img srcset="${origin}/_astro/a.webp 400w, ${origin}/_astro/b.webp 800w" ` +
        `src="${origin}/_astro/a.webp">`,
    );
  });

  it("does not double the slash when the origin carries a trailing one", () => {
    expect(absolutizeHtml('<a href="/a">a</a>', "https://example.test/")).toBe(
      '<a href="https://example.test/a">a</a>',
    );
  });

  it("leaves content with no URLs untouched, including code blocks", () => {
    const html = '<pre class="astro-code"><code><span>const a = "/not/a/url";</span></code></pre>';
    expect(absolutizeHtml(html, origin)).toBe(html);
  });

  it("returns empty input unchanged", () => {
    expect(absolutizeHtml("", origin)).toBe("");
  });
});
