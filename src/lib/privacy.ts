/**
 * What a build actually processes, and therefore what its privacy policy has to
 * say (REQ-038, REQ-039, REQ-042).
 *
 * The policy is assembled from configuration so it can never claim more or less
 * than the site does. The same reasoning decides whether the page should exist at
 * all: a build with no analytics, no ads, no comments embed and no signup form
 * collects nothing beyond what any web server logs, and a policy page describing
 * that — linked from every footer — is furniture, not information.
 *
 * Comments count only when the embed can actually render. A provider named in the
 * config with no ids filled in loads nothing, so it belongs in no policy.
 *
 * Pure: the caller passes what it read from the config surface.
 */
export interface PrivacyTopics {
  /** Cookieless analytics (Plausible). */
  plausible: boolean;
  /** Google Analytics 4 — cookie-setting, consent-gated. */
  googleAnalytics: boolean;
  /** AdSense — cookie-setting, consent-gated. */
  ads: boolean;
  /** A comments embed that will really load. */
  comments: boolean;
  /** A signup form for this locale. */
  newsletter: boolean;
}

/** True when any cookie-setting provider is configured, which is what makes a
 *  consent banner necessary. */
export function needsConsent(topics: PrivacyTopics): boolean {
  return topics.googleAnalytics || topics.ads;
}

/** True when the build processes anything worth describing to a reader. */
export function needsPrivacyPage(topics: PrivacyTopics): boolean {
  return (
    topics.plausible ||
    topics.googleAnalytics ||
    topics.ads ||
    topics.comments ||
    topics.newsletter
  );
}
