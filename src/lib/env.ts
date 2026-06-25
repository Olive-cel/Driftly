function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const env = {
  get NEXT_PUBLIC_SUPABASE_URL(): string {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY(): string {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },

  get NEXT_PUBLIC_APP_URL(): string {
    return optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  },

  get OPENAI_API_KEY(): string | null {
    const value = process.env.OPENAI_API_KEY;
    if (!value || value === "CHANGEME" || value.startsWith("sk-CHANGEME")) {
      return null;
    }
    return value;
  },
} as const;
