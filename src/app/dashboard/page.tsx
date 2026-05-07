import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardPage() {
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
  if (!prefs?.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bienvenue sur VoyageAI ✈️</CardTitle>
          <CardDescription>Vous êtes connecté</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1 text-sm">
            <p>
              <span className="text-muted-foreground">Email : </span>
              {user.email}
            </p>
            <p>
              <span className="text-muted-foreground">Provider : </span>
              {user.app_metadata.provider}
            </p>
            <p>
              <span className="text-muted-foreground">Profil voyage : </span>
              {(prefs?.travel_type as string) ?? "—"} · {(prefs?.budget as string) ?? "—"} · {(prefs?.group_type as string) ?? "—"}
            </p>
          </div>
          <LogoutButton />
        </CardContent>
      </Card>
    </main>
  );
}
