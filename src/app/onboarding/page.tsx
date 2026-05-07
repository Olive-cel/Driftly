import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Onboarding — VoyageAI",
};

export default async function OnboardingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("travel_preferences")
    .eq("id", user.id)
    .single();

  const prefs = (profile as { travel_preferences: Record<string, unknown> } | null)
    ?.travel_preferences;
  if (prefs?.onboarding_completed) {
    redirect("/dashboard");
  }

  return <OnboardingWizard />;
}
