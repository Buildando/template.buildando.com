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

/**
 * Extra fields a provider's form requires beyond the address — Brevo sends
 * `locale` and `html_type`, Mailchimp an anti-bot input whose name encodes the
 * account. They are rendered as hidden inputs, so a provider that needs them
 * works by pasting config rather than by editing the component. Accepts one set
 * for the whole site, or one per locale, since a value like `locale` differs by
 * language.
 */
export type NewsletterFields =
  | Readonly<Record<string, string>>
  | Readonly<Record<string, Readonly<Record<string, string>>>>;

const isNested = (v: NewsletterFields): v is Record<string, Record<string, string>> =>
  Object.values(v ?? {}).every((entry) => entry !== null && typeof entry === "object");

export function newsletterHiddenFields(
  fields: NewsletterFields | undefined,
  lang: string,
): Array<[string, string]> {
  if (!fields || Object.keys(fields).length === 0) return [];
  const flat = isNested(fields) ? ((fields as Record<string, Record<string, string>>)[lang] ?? {}) : fields;
  return Object.entries(flat as Record<string, string>).filter(([name]) => name);
}
