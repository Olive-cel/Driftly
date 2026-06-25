"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
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
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
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

      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
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
