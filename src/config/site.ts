/**
 * THE configuration surface (REQ-009, REQ-030).
 *
 * This is the ONLY file a forker must edit, plus the logo/favicon assets it
 * points at. Every identity-bearing value — name, domain, author, colors,
 * social links, navigation, and the giscus/analytics integration ids — lives
 * here. Nothing outside this file may hardcode any of these values.
 *
 * Fork checklist:
 *   1. Edit the values in this file.
 *   2. Replace public/favicon.svg and the logo asset.
 *   3. Fill GISCUS from https://giscus.app after enabling Discussions.
 *   4. Pick a host and add your own deploy step (see "Deploying" in README.md).
 */

import { SKINS, type SkinName } from "./skins";

export const SITE = {
  /** Brand name, shown in the header and used across SEO output. */
  name: "Buildando",
  /** Used as the <title> suffix and the site-level SEO title. */
  title: "Buildando — por Fernando Teixeira",
  /** Default meta description when a page provides none. */
  description:
    "Boas práticas de desenvolvimento de software, orientação a objetos e o ofício de escrever bom código.",
  /** Canonical origin. Every absolute SEO URL derives from this (REQ-018). No trailing slash. */
  url: "https://template.buildando.com",
  /** Default author, used when a post omits `author`. */
  author: "Fernando Teixeira",
  /** Fallback BCP-47 tag. Per-page language comes from I18N below. */
  locale: "pt-BR",
  ogLocale: "pt_BR",
  /** Fallback social preview image (absolute path under /). Used when a post has no cover. */
  defaultOgImage: "/og-default.svg",
  /** Logo asset served from /public. */
  logo: "/favicon.svg",
} as const;

/**
 * Visual identity. The whole look — light + dark palettes, fonts, content width —
 * is a "skin": a named preset of design tokens in ./skins.ts, injected as CSS
 * custom properties by BaseLayout (REQ-009). `light` is the base; `dark` overrides
 * under prefers-color-scheme: dark and the theme toggle.
 *
 * Switch identity by setting ACTIVE_SKIN to any key in SKINS — "terminal"
 * (default), "editorial", "mono", "minimal", or "warmDev". Craft your own by
 * copying a preset in ./skins.ts. See the "Skins" section in README.md.
 */
export const ACTIVE_SKIN: SkinName = "terminal";
export const BRAND = SKINS[ACTIVE_SKIN];

/**
 * Social profile links, rendered as icons in the footer. `icon` is a simple-icons
 * slug (see src/components/Icon.astro for the supported set); an unknown slug
 * falls back to nothing, so add the glyph there if you use a new network.
 */
export const SOCIAL = [
  { label: "GitHub", href: "https://github.com/Buildando", icon: "github" },
  { label: "Instagram", href: "https://www.instagram.com/buildando", icon: "instagram" },
  { label: "Threads", href: "https://www.threads.net/@buildando", icon: "threads" },
  { label: "X", href: "https://x.com/buildando", icon: "x" },
  { label: "TikTok", href: "https://www.tiktok.com/@buildando", icon: "tiktok" },
  { label: "Facebook", href: "https://www.facebook.com/buildando", icon: "facebook" },
] as const;

/**
 * Header navigation. `key` is a translation key (see src/i18n/ui.ts); `path` is
 * locale-agnostic and gets prefixed with the active locale at render.
 */
export const NAV = [
  { key: "nav.home", path: "/" },
  { key: "nav.about", path: "/about" },
] as const;

/**
 * Social share buttons on posts (REQ-040). `networks` lists which share-intent
 * links appear (known: x, whatsapp, telegram, linkedin, facebook); an empty list
 * plus `copyLink: false` hides the row. The links need no JavaScript; "copy link"
 * is a progressive enhancement shown only when the browser supports it.
 */
export const SHARE = {
  networks: ["x", "whatsapp", "telegram", "linkedin", "facebook"],
  copyLink: true,
  /** Native share button (Web Share API). Shown only where the browser supports
      it (mostly mobile); falls back silently to the links elsewhere. */
  native: true,
} as const;

/**
 * Pluggable integrations (REQ-043). Each integration is a "port" component under
 * src/integrations/ that renders the adapter named here. Swap a provider by
 * changing its name (the adapter folder must exist); contribute a new one by
 * dropping a folder in src/integrations/<kind>/<name>/ and registering it in the
 * port. See src/integrations/README.md.
 */
export const INTEGRATIONS = {
  /** Comments provider: "giscus" | "utterances" | "none". */
  comments: "giscus",
  /** Search UI provider: "pagefind" | "none". The build-time index step lives in
      the `build` script in package.json (see src/integrations/README.md). */
  search: "pagefind",
} as const;

/**
 * giscus / GitHub Discussions (REQ-022–REQ-024).
 * Get repoId and categoryId from https://giscus.app after:
 *   - making the repo public,
 *   - enabling Discussions,
 *   - installing the giscus GitHub App.
 * Leave `repoId` empty to disable the embed until configured.
 */
export const GISCUS = {
  repo: "Buildando/template.buildando.com",
  repoId: "",
  category: "Comentários",
  categoryId: "",
  /** Deterministic post→thread mapping (REQ-024). "pathname" maps by URL path. */
  mapping: "pathname",
  reactionsEnabled: "1",
  /** "site" follows this site's light/dark toggle (recommended). Any other value
      is used as a giscus theme name verbatim, e.g. "light", "dark", "dark_dimmed",
      or giscus's own "preferred_color_scheme" (which follows the OS, not the site). */
  theme: "site",
  lang: "pt",
} as const;

/**
 * Utterances adapter (comments via GitHub issues). Used when
 * INTEGRATIONS.comments === "utterances". Empty `repo` disables it. The repo must
 * be public with the utterances app installed (https://utteranc.es).
 */
export const UTTERANCES = {
  repo: "", // "owner/repo"
  issueTerm: "pathname", // pathname | url | title | og:title
  label: "", // optional issue label
  theme: "preferred-color-scheme",
} as const;

/**
 * Optional newsletter signup (REQ-039). Delegated to an email provider — no
 * backend, no subscriber data on this site. Empty disables the form entirely
 * (nothing is rendered).
 *
 * `actionUrl` takes either one endpoint for the whole site, or one per locale:
 *
 *   actionUrl: "https://buttondown.com/api/emails/embed-subscribe/USER"
 *   actionUrl: { pt: "…/USER-pt", en: "…/USER-en" }
 *
 * Prefer per locale on a multilingual blog: the feed is per language, so a list fed
 * from it is too, and a reader who signs up in English should not receive posts in
 * Portuguese. A locale with no endpoint simply shows no form.
 *
 * Buttondown: create one newsletter per language, set each `actionUrl` to
 *   https://buttondown.com/api/emails/embed-subscribe/<that-newsletter-username>
 * and, in each dashboard, enable RSS-to-email pointing at the matching feed
 * (https://your-domain/pt/rss.xml, https://your-domain/en/rss.xml) so publishing a
 * post emails the right list on its own. Other providers work the same way — paste
 * their form endpoint and set `emailField` to the field name they expect
 * (Buttondown: "email", Mailchimp: "EMAIL").
 */
export const NEWSLETTER = {
  actionUrl: {} as import("../lib/newsletter").NewsletterAction,
  emailField: "email",
  /** Extra inputs the provider's form requires, rendered hidden. One set for the
      whole site, or one per locale when a value differs by language:
        hiddenFields: { locale: "pt", html_type: "simple" }
        hiddenFields: { pt: { locale: "pt" }, en: { locale: "en" } }
      Copy them from the HTML snippet the provider generates. */
  hiddenFields: {} as import("../lib/newsletter").NewsletterFields,
} as const;

/**
 * Optional analytics and ads (REQ-038). Every field is disabled by default: an
 * empty value emits no script and makes no third-party request, so the template
 * ships analytics- and ads-free. Enabling Google Analytics or AdSense brings
 * cookie and consent obligations that are the blog owner's responsibility.
 */
export const ANALYTICS = {
  /** Privacy-friendly analytics domain (Plausible). Empty disables it. */
  plausible: "",
  /** Google Analytics 4 Measurement ID, e.g. "G-XXXXXXXXXX". Empty disables it. */
  googleAnalytics: "",
  /** Google AdSense publisher id, e.g. "ca-pub-0000000000000000". Empty disables it. */
  adsense: "",
} as const;

/**
 * Cookie consent (REQ-042). When `required` is true and Google Analytics or
 * AdSense is configured, those cookie-setting scripts do NOT load until the
 * reader accepts a consent banner — nothing is set before consent. Plausible is
 * cookieless and loads regardless. Set `required: false` only where you have
 * another legal basis (then GA/AdSense load immediately, no banner).
 */
export const CONSENT = {
  required: true,
  /** Optional privacy-policy URL linked in the banner. Empty hides the link.
      A path starting with "/" is resolved per locale; an absolute URL is used as is. */
  privacyUrl: "/privacy",
  /** Address the privacy policy gives for data-subject requests (LGPD art. 18).
      Empty falls back to pointing the reader at the About page. */
  contact: "",
} as const;

/**
 * Color theme (REQ-031). `default` is the theme a first-time visitor sees; the
 * reader can switch with the header toggle and the choice is remembered. Set
 * `allowToggle: false` to lock the site to `default` and hide the toggle.
 */
export const THEME = {
  default: "dark" as "dark" | "light",
  allowToggle: true,
} as const;

/**
 * Posts per listing page — home, tag, and category (REQ-037).
 * `0` shows every post on one page, which keeps the home facet filter (REQ-035)
 * available — the right default for small and medium blogs. A positive number
 * splits listings into pre-rendered, crawlable numbered pages with prev/next
 * navigation; at that scale faceted browsing moves to the per-facet pages and
 * search, and the home filter is shown only when a listing fits on one page.
 */
export const POSTS_PER_PAGE = 0;

/**
 * Page size for the search results page (REQ-036). Search is client-side, so this
 * paginates the Pagefind results in the browser — independent of POSTS_PER_PAGE,
 * so the home feed keeps its own behavior. A positive number; results beyond it
 * spill onto numbered pages with the same prev/next navigation as the feed.
 */
export const SEARCH_PER_PAGE = 20;

/**
 * Internationalization (REQ-032). Add or remove locales here — the routes, the
 * language switcher, and hreflang follow. UI strings live in `src/i18n/ui.ts`;
 * a post declares its language with the `lang` frontmatter field.
 */
export const I18N = {
  defaultLocale: "pt",
  locales: [
    { code: "pt", label: "Português", htmlLang: "pt-BR", ogLocale: "pt_BR" },
    { code: "en", label: "English", htmlLang: "en", ogLocale: "en_US" },
  ],
} as const;

export type LocaleCode = (typeof I18N.locales)[number]["code"];
