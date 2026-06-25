// ═══════════════════════════════════════════════════════════════════════
// Design System - Premium UI Tokens & Classes
// ═══════════════════════════════════════════════════════════════════════

// ── Couleurs ────────────────────────────────────────────────────────────
export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  accent: {
    50: "#f3e8ff",
    100: "#e9d5ff",
    200: "#d8b4fe",
    300: "#c084fc",
    400: "#a855f7",
    500: "#9333ea",
    600: "#7e22ce",
    700: "#6b21a8",
    800: "#581c87",
    900: "#3f0f5c",
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
};

// ── Espacements ─────────────────────────────────────────────────────────
export const spacing = {
  xs: "0.75rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "3rem",
  "2xl": "4rem",
  "3xl": "6rem",
};

// ── Ombres Premium ──────────────────────────────────────────────────────
export const shadows = {
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  premium: "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
};

// ── Coins Arrondis ─────────────────────────────────────────────────────
export const radius = {
  sm: "0.375rem", // 6px
  md: "0.5rem",   // 8px
  lg: "1rem",     // 16px
  xl: "1.5rem",   // 24px
  full: "9999px",
};

// ── Classes Tailwind Réutilisables ─────────────────────────────────────

// Cartes premium
export const card = {
  base: "bg-white rounded-xl border border-neutral-200/50 shadow-md hover:shadow-lg transition-shadow duration-300",
  premium: "bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300",
  glass: "bg-white/40 backdrop-blur-lg rounded-2xl border border-white/30 shadow-md",
};

// Boutons premium
export const button = {
  primary: "inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
  secondary: "inline-flex items-center justify-center px-6 py-2.5 bg-white border border-neutral-300 text-neutral-900 rounded-lg font-medium hover:bg-neutral-50 transition-all duration-300",
  ghost: "inline-flex items-center justify-center px-6 py-2.5 text-neutral-700 font-medium hover:bg-neutral-100 rounded-lg transition-all duration-200",
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

// ── Animations ──────────────────────────────────────────────────────────
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

// ── Gradients ───────────────────────────────────────────────────────────
export const gradients = {
  blueToViolet: "bg-gradient-to-br from-blue-600 to-purple-600",
  blueToTeal: "bg-gradient-to-br from-blue-500 to-teal-500",
  violetToIndigo: "bg-gradient-to-br from-purple-600 to-indigo-600",
  warmSunset: "bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600",
};
