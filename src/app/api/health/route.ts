import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  let isHealthy = true;
  const checks: Record<string, string> = {};

  // Check Supabase connection
  try {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl.includes("CHANGEME") || supabaseKey === "CHANGEME") {
      checks.supabase = "not_configured";
    } else {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = createClient();

      // Use a real table instead of fictional one. Just select the count to verify connection.
      // Using 'profiles' table with select('id').limit(1) to verify connection without exposing data
      const { error } = await supabase
        .from("profiles")
        .select("id", { count: "estimated", head: true })
        .limit(1);

      if (error) {
        console.error("[Health] Supabase error:", error);
        checks.supabase = "error";
        isHealthy = false;
      } else {
        checks.supabase = "connected";
      }
    }
  } catch (err) {
    console.error("[Health] Supabase check failed:", err);
    checks.supabase = "error";
    isHealthy = false;
  }

  // Check OpenAI configuration
  checks.openai = env.OPENAI_API_KEY ? "configured" : "not_configured";

  // Check Pexels configuration
  checks.pexels = process.env.PEXELS_API_KEY ? "configured" : "not_configured";

  const status = isHealthy ? "ok" : "degraded";

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    ...checks,
  });
}
