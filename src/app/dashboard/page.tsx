import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("budget_preference, travel_style, interests")
    .eq("id", user.id)
    .single();

  if (!profile?.travel_style) {
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
              {profile.travel_style ?? "—"} · {profile.budget_preference ?? "—"}
            </p>
          </div>
          <div className="grid gap-2">
            <Link href="/dashboard/trips">
              <Button variant="default" className="w-full">
                Mes voyages
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
