// ═══════════════════════════════════════════════════════════════════════
// Design System - Premium Warm Identity
// ═══════════════════════════════════════════════════════════════════════

// ── Palette Chaude & Premium ────────────────────────────────────────
export const colors = {
  primary: {
    terracotta: "#E76F51",
    terracottaLight: "#F5B4A0",
    terracottaDark: "#D15D3B",
  },
  secondary: {
    sand: "#F4A261",
    sandLight: "#F8C799",
    sandDark: "#E89247",
  },
  accent: {
    purple: "#5E548E",
    purpleLight: "#9B95C9",
    purpleDark: "#3D3456",
  },
  background: {
    ivory: "#FFF8F0",
    white: "#FFFFFF",
    light: "#FFFAF5",
  },
  text: {
    dark: "#1F2937",
    muted: "#6B7280",
    light: "#9CA3AF",
  },
  success: "#84A98C",
  warning: "#F4A261",
  error: "#E76F51",
  neutral: {
    50: "#FAFAF9",
    100: "#F5F5F4",
    200: "#E7E5E4",
    300: "#D6D3D1",
    400: "#A8A29E",
    500: "#78716B",
    600: "#57534E",
    700: "#44403C",
    800: "#292524",
    900: "#1C1917",
  },
};

// ── Espacements ─────────────────────────────────────────────────────
export const spacing = {
  xs: "0.75rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "3rem",
  "2xl": "4rem",
  "3xl": "6rem",
};

// ── Ombres Douces & Premium ──────────────────────────────────────
export const shadows = {
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(231, 111, 81, 0.08), 0 1px 2px -1px rgba(231, 111, 81, 0.04)",
  md: "0 4px 6px -1px rgba(231, 111, 81, 0.1), 0 2px 4px -2px rgba(231, 111, 81, 0.05)",
  lg: "0 10px 15px -3px rgba(231, 111, 81, 0.1), 0 4px 6px -4px rgba(231, 111, 81, 0.05)",
  xl: "0 20px 25px -5px rgba(231, 111, 81, 0.1), 0 8px 10px -6px rgba(231, 111, 81, 0.05)",
  premium: "0 20px 40px -10px rgba(231, 111, 81, 0.15)",
};

// ── Coins Arrondis Premium ──────────────────────────────────────
export const radius = {
  sm: "0.375rem",   // 6px
  md: "0.5rem",     // 8px
  lg: "1rem",       // 16px
  xl: "1.5rem",     // 24px
  "2xl": "2rem",    // 32px
  full: "9999px",
};

// ── Classes Tailwind Réutilisables ─────────────────────────────────

// Cartes premium
export const card = {
  base: "bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-300",
  premium: "bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-100/50 shadow-md hover:shadow-lg transition-all duration-300",
  glass: "bg-white/40 backdrop-blur-lg rounded-2xl border border-white/30 shadow-md",
};

// Boutons premium
export const button = {
  primary: "inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
  secondary: "inline-flex items-center justify-center px-6 py-2.5 bg-white border border-neutral-300 text-neutral-900 rounded-lg font-medium hover:bg-neutral-50 transition-all duration-300",
  ghost: "inline-flex items-center justify-center px-6 py-2.5 text-neutral-700 font-medium hover:bg-neutral-100 rounded-lg transition-all duration-200",
  accent: "inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300",
};

// Texte premium
export const typography = {
  h1: "text-5xl md:text-6xl font-bold tracking-tight text-neutral-900",
  h2: "text-4xl md:text-5xl font-bold tracking-tight text-neutral-900",
  h3: "text-3xl md:text-4xl font-bold tracking-tight text-neutral-900",
  h4: "text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900",
  body: "text-base text-neutral-600 leading-relaxed",
  small: "text-sm text-neutral-500",
  caption: "text-xs text-neutral-400 uppercase tracking-wider",
};

// Layouts
export const layout = {
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  gutter: "gap-6 md:gap-8 lg:gap-10",
};

// ── Animations ──────────────────────────────────────────────────────
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4 },
  },
  slideInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4 },
  },
  slideInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 },
  },
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 2, repeat: Infinity, ease: "linear" },
  },
  pulse: {
    animate: { opacity: [1, 0.5, 1] },
    transition: { duration: 2, repeat: Infinity },
  },
};

// ── Gradients Chauds & Premium ──────────────────────────────────────
export const gradients = {
  terracottaToPurple: "bg-gradient-to-br from-orange-600 to-purple-600",
  sandToTerracotta: "bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600",
  warmSunset: "bg-gradient-to-br from-amber-400 via-orange-500 to-red-600",
  softWarmth: "bg-gradient-to-br from-amber-50 to-orange-100",
  purpleAccent: "bg-gradient-to-br from-purple-600 to-purple-700",
};
