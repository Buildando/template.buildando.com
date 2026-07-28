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
