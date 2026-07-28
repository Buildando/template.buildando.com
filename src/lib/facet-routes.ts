/**
 * Language-switcher targets for a facet page (REQ-033).
 *
 * Facet URLs carry an authored value — `/pt/tags/guia/` — and those values are
 * written per language, so `guia` has no counterpart under `/en/`, whose posts are
 * tagged `guide`. Swapping only the locale segment, which is right for pages whose
 * path is locale-independent (home, feed, about, search), therefore links a 404
 * from a page that looks perfectly ordinary.
 *
 * A locale that has the value gets the value; a locale that does not gets a page
 * that exists — the facet index where there is one, the home otherwise. Pure and
 * config-free so it can be unit-tested: the caller passes the locales.
 */
export interface FacetSwitchParams {
  /** Segment under the locale: "tags" or "categories". */
  kind: string;
  /** The authored facet value being viewed. */
  value: string;
  /** Every configured locale. */
  locales: readonly string[];
  /** The locales in which this exact value exists. */
  availableIn: readonly string[];
  /** Locale-less path to fall back to, e.g. "/tags/" or "/". */
  fallbackPath: string;
}

export function facetLangSwitch({
  kind,
  value,
  locales,
  availableIn,
  fallbackPath,
}: FacetSwitchParams): Record<string, string> {
  const has = new Set(availableIn);
  const targets: Record<string, string> = {};
  for (const locale of locales) {
    targets[locale] = has.has(locale)
      ? `/${locale}/${kind}/${value}/`
      : `/${locale}${fallbackPath}`;
  }
  return targets;
}
