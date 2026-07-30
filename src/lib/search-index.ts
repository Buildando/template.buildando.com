/**
 * Which Pagefind index a locale searches (REQ-020, REQ-032).
 *
 * Pagefind splits its index by the `<html lang>` of the indexed pages and keys each
 * one by that tag **lowercased** — so a site whose Portuguese pages declare `pt-BR`
 * gets an index called `pt-br`. The locale code is not that key: passing `"pt"`
 * matches nothing, and the search silently falls back to the default index, which
 * answers Portuguese queries with English posts.
 *
 * English hid this for a while, because `en` as a locale code and `en` as an index
 * key happen to be the same string — half the cases working is what made the bug
 * look like something else.
 */
export function pagefindLanguage(htmlLang: string): string {
  return htmlLang.trim().toLowerCase();
}

/**
 * The Pagefind index a locale's search should query, or `null` when that locale
 * has no indexed content yet (REQ-020, REQ-032).
 *
 * Pagefind builds one index per language and only for languages that actually
 * have indexed pages. A configured locale may legitimately have no posts of its
 * own — the install guide is explicit that "nada obriga a traduzir tudo", so a
 * language can exist with only fallback pages, which are not indexed. Asking
 * Pagefind for that missing index makes it silently answer from the default one,
 * so an empty locale would return another language's results — the very
 * cross-language leak `pagefindLanguage` exists to prevent. Returning `null`
 * lets the UI show an honest empty state instead of initializing that search.
 */
export function localeSearchIndex(
  htmlLang: string,
  hasIndexedContent: boolean,
): string | null {
  return hasIndexedContent ? pagefindLanguage(htmlLang) : null;
}
