"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/dashboard/sidebar-premium";
import { AuthProvider } from "@/lib/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("[Dashboard] No user found, redirecting to login");
          router.push("/login");
          return;
        }

        console.log("[Dashboard] User found:", user.id);

        const { data: profile } = await supabase
          .from("profiles")
          .select("budget_preference, travel_style, interests")
          .eq("id", user.id)
          .single();

        console.log("[Dashboard] Profile found:", profile);

        if (!profile?.travel_style) {
          console.log("[Dashboard] No travel_style, redirecting to onboarding");
          router.push("/onboarding");
          return;
        }

        console.log("[Dashboard] Authorization successful");
        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error("[Dashboard] Auth check error:", error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  );
}
