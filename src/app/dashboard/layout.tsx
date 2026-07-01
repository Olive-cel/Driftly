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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        {/* Sidebar - Fixed on desktop, overlay on mobile */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-64">
              <Sidebar setSidebarOpen={setSidebarOpen} />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 w-full min-w-0 lg:ml-0">
          {/* Mobile header with menu button */}
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-neutral-200 flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-bold text-neutral-900">Driftly</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Content area */}
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
