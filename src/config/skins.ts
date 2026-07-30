/**
 * Visual identities ("skins"). A skin is a complete set of design tokens — a
 * light and a dark palette, the three font roles, and the reading-column width.
 * `site.ts` picks one via `ACTIVE_SKIN` and exports it as `BRAND`, which
 * `BaseLayout` injects as CSS custom properties (REQ-009). This is the single
 * source of truth for the look: there is no separate stylesheet to keep in sync.
 *
 * To switch identity: set `ACTIVE_SKIN` in `site.ts` to any key below.
 * To craft your own: copy a preset, rename the key, and edit the tokens. Every
 * value is a plain CSS value, so customizing the look is editing CSS here.
 *
 * The seven color tokens, per palette:
 *   bg              page background
 *   surface         raised panels (cards' filter bar, search box, dialog)
 *   text            body text
 *   muted           secondary text (dates, captions)
 *   accent          links, buttons, highlights
 *   accentContrast  text/icon drawn on top of `accent`
 *   border          hairlines and dividers
 * `dark` overrides `light` under prefers-color-scheme: dark / the theme toggle.
 */

export type Palette = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentContrast: string;
  border: string;
};

export type Skin = {
  colors: { light: Palette; dark: Palette };
  fonts: { body: string; heading: string; mono: string };
  /** Max width of the reading column. */
  contentWidth: string;
};

// Shared font stacks. Inter and Space Grotesk are self-hosted (Fontsource); the
// serif and mono stacks are system fonts, so alternate skins add no font requests.
const SANS = '"Inter Variable", system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
const GROTESK = '"Space Grotesk Variable", "Inter Variable", system-ui, sans-serif';
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SERIF = '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';

export const SKINS = {
  /** Default — dark-first, tech, blue accent. Inter + Space Grotesk. */
  terminal: {
    colors: {
      light: {
        bg: "#ffffff",
        surface: "#f6f7f9",
        text: "#141821",
        muted: "#5b6472",
        accent: "#2f6df6",
        accentContrast: "#ffffff",
        border: "#e6e9ef",
      },
      dark: {
        bg: "#0d0f14",
        surface: "#161a22",
        text: "#e7eaf0",
        muted: "#98a1b3",
        accent: "#6ea0ff",
        accentContrast: "#0d0f14",
        border: "#232936",
      },
    },
    fonts: { body: SANS, heading: GROTESK, mono: MONO },
    contentWidth: "46rem",
  },

  /** Editorial — serif headings, warm paper and ink, restrained green accent. */
  editorial: {
    colors: {
      light: {
        bg: "#faf9f6",
        surface: "#f2efe9",
        text: "#1b1a17",
        muted: "#6b6459",
        accent: "#1f6f52",
        accentContrast: "#ffffff",
        border: "#e5e0d6",
      },
      dark: {
        bg: "#17150f",
        surface: "#201d16",
        text: "#ece7dd",
        muted: "#a49c8c",
        accent: "#5aa982",
        accentContrast: "#12100b",
        border: "#322d22",
      },
    },
    fonts: { body: SANS, heading: SERIF, mono: MONO },
    contentWidth: "44rem",
  },

  /** Mono — monospace headings, high contrast, amber accent. The "build" look. */
  mono: {
    colors: {
      light: {
        bg: "#ffffff",
        surface: "#f4f4f5",
        text: "#0a0a0a",
        muted: "#52525b",
        accent: "#c2410c",
        accentContrast: "#ffffff",
        border: "#e4e4e7",
      },
      dark: {
        bg: "#0a0a0a",
        surface: "#161616",
        text: "#ededed",
        muted: "#a1a1aa",
        accent: "#f59e0b",
        accentContrast: "#0a0a0a",
        border: "#262626",
      },
    },
    fonts: { body: SANS, heading: MONO, mono: MONO },
    contentWidth: "46rem",
  },

  /** Minimal — near-monochrome, airy, a single lime accent. Content-first. */
  minimal: {
    colors: {
      light: {
        bg: "#ffffff",
        surface: "#fafafa",
        text: "#18181b",
        muted: "#71717a",
        accent: "#3f6212",
        accentContrast: "#ffffff",
        border: "#ececee",
      },
      dark: {
        bg: "#111113",
        surface: "#1a1a1d",
        text: "#e4e4e7",
        muted: "#8b8b93",
        accent: "#a3e635",
        accentContrast: "#111113",
        border: "#27272b",
      },
    },
    fonts: { body: SANS, heading: SANS, mono: MONO },
    contentWidth: "44rem",
  },

  /** Warm dev — the Solarized palette, cozy and familiar to programmers. */
  warmDev: {
    colors: {
      light: {
        bg: "#fdf6e3",
        surface: "#eee8d5",
        text: "#586e75",
        muted: "#93a1a1",
        accent: "#268bd2",
        accentContrast: "#fdf6e3",
        border: "#ddd6c1",
      },
      dark: {
        bg: "#002b36",
        surface: "#073642",
        text: "#93a1a1",
        muted: "#657b83",
        accent: "#2aa198",
        accentContrast: "#002b36",
        border: "#0f4a56",
      },
    },
    fonts: { body: SANS, heading: GROTESK, mono: MONO },
    contentWidth: "46rem",
  },

  /**
   * Brutalist — a deliberately radical skin: hard high-contrast borders, zero
   * radius, offset "hard" shadows, heavier type. Unlike the others it changes
   * structure, not just color — those rules live in src/styles/skins.css, scoped
   * by `[data-skin="brutalist"]`, and adapt to light/dark through the tokens.
   */
  brutalist: {
    colors: {
      light: {
        bg: "#f5f5f0",
        surface: "#ffffff",
        text: "#0a0a0a",
        muted: "#44444a",
        accent: "#7c3aed",
        accentContrast: "#ffffff",
        border: "#0a0a0a",
      },
      dark: {
        bg: "#0a0a0a",
        surface: "#16161a",
        text: "#f4f4f5",
        muted: "#a1a1aa",
        accent: "#a78bfa",
        accentContrast: "#0a0a0a",
        border: "#f4f4f5",
      },
    },
    fonts: { body: SANS, heading: GROTESK, mono: MONO },
    contentWidth: "48rem",
  },

  /**
   * Berry — magenta/rosa vibrante sobre uma base ameixa. Uma identidade quente e
   * distinta das demais (nenhuma outra usa magenta). Coluna de leitura mais larga
   * (62rem); o layout de filtro em barra lateral na home é estrutural e vive em
   * src/styles/skins.css, escopado por `[data-skin="berry"]`.
   */
  berry: {
    colors: {
      light: {
        bg: "#fdf6fa",
        surface: "#f6e9f1",
        text: "#1f1420",
        muted: "#7c6a82",
        accent: "#c01f6d",
        accentContrast: "#ffffff",
        border: "#ecdde7",
      },
      dark: {
        bg: "#160f1b",
        surface: "#201526",
        text: "#f1e9f3",
        muted: "#ab9cb5",
        accent: "#ff5c93",
        accentContrast: "#160f1b",
        border: "#33253c",
      },
    },
    fonts: { body: SANS, heading: GROTESK, mono: MONO },
    contentWidth: "62rem",
  },
} satisfies Record<string, Skin>;

export type SkinName = keyof typeof SKINS;
