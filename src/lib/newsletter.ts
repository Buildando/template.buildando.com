/**
 * Which signup endpoint a locale posts to (REQ-039).
 *
 * A feed is per locale, and so is a mailing list built from it: subscribing on the
 * English page and then receiving Portuguese posts is a subscription someone
 * cancels. So the endpoint may be given per locale — one provider list per
 * language — while a single string stays valid for a one-language blog, or for one
 * that deliberately runs a single list.
 *
 * Pure so it can be unit-tested; the component only renders what this returns.
 */
export type NewsletterAction = string | Readonly<Record<string, string>>;

/**
 * The endpoint for `lang`, or "" when there is none — which is what keeps the form
 * from rendering at all. A per-locale map with no entry for this locale yields ""
 * rather than another language's list: a form that silently subscribes a reader to
 * the wrong language is worse than no form.
 */
export function newsletterAction(action: NewsletterAction, lang: string): string {
  if (typeof action === "string") return action.trim();
  return (action?.[lang] ?? "").trim();
}
