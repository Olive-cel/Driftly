import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const checks: Record<string, string> = {};
  try {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl.includes("CHANGEME") || supabaseKey === "CHANGEME") {
      checks.supabase = "not_configured";
    } else {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = createClient();
      const { error } = await supabase.from("_health_check_dummy").select("*").limit(1);
      const connected = !error || error.code === "PGRST116";
      checks.supabase = connected ? "connected" : (error?.message ?? "error");
    }
  } catch {
    checks.supabase = "not_configured";
  }

  checks.anthropic = env.ANTHROPIC_API_KEY ? "configured" : "not_configured";

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    ...checks,
  });
}
