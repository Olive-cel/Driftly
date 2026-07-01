/**
 * Helper pour créer un client Supabase admin (service role).
 * À utiliser UNIQUEMENT côté serveur dans les API routes.
 * 
 * IMPORTANT: JAMAIS dans les Server Components ou Client Components.
 * JAMAIS exposer SUPABASE_SERVICE_ROLE_KEY au navigateur.
 */

import { createClient } from "@supabase/supabase-js";

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validation stricte
  if (!url) {
    console.error("[Admin] NEXT_PUBLIC_SUPABASE_URL not found");
    throw new Error(
      "[Admin] NEXT_PUBLIC_SUPABASE_URL not found in environment"
    );
  }
  if (!key) {
    console.error("[Admin] SUPABASE_SERVICE_ROLE_KEY not found");
    throw new Error(
      "[Admin] SUPABASE_SERVICE_ROLE_KEY not found in environment. This endpoint requires admin access."
    );
  }

  console.log("[Admin] Creating client with URL:", url.substring(0, 50) + "...");
  console.log("[Admin] Service role key length:", key.length);

  const client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("[Admin] Client created successfully");
  return client;
}

export { createSupabaseAdmin };
