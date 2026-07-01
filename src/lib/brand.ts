/**
 * Driftly Brand Constants
 * Single source of truth for all branding elements
 */

export const BRAND = {
  name: "Driftly",
  tagline: "Travel Planning",
  description: "Plateforme intelligente de planification de voyages assistée par IA",
  logo: "✈️",
  colors: {
    primary: "#ea580c",      // orange-600
    secondary: "#fb923c",    // orange-400
    accent: "#a855f7",       // purple-500 (light accent)
    dark: "#000000",
    light: "#ffffff",
  },
} as const;

export const APP_TITLE = `${BRAND.name} — ${BRAND.tagline}`;
export const APP_DESCRIPTION = BRAND.description;
