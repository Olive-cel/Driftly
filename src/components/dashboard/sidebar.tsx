"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Map,
  Lightbulb,
  Heart,
  Bell,
  Settings,
  LogOut,
  Plane,
  Sparkles,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  user: User;
}

import { LucideIcon } from "lucide-react";

interface NavItem {
  href: "/dashboard" | "/dashboard/trips";
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/trips", label: "Mes voyages", icon: Plane },
  { href: "/dashboard", label: "Itinéraires", icon: Map },
  { href: "/dashboard", label: "Inspiration", icon: Lightbulb },
  { href: "/dashboard", label: "Favoris", icon: Heart },
  { href: "/dashboard", label: "Notifications", icon: Bell },
  { href: "/dashboard", label: "Paramètres", icon: Settings },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const userName = user.user_metadata?.given_name || user.email?.split("@")[0] || "Utilisateur";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="border-b border-gray-100 p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Plane className="h-6 w-6 text-amber-600" />
          <span className="text-xl font-bold text-gray-900">Driftly</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 px-3 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-amber-50 text-amber-600"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Inspiration Block */}
      <div className="mx-3 mb-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 border border-amber-100">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <p className="font-semibold text-gray-900 text-sm">Besoin d&apos;inspiration ?</p>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Découvrez des destinations incroyables et laissez l&apos;IA générer votre voyage parfait.
        </p>
        <Link href="/dashboard/trips/new">
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
          >
            Commencer
          </Button>
        </Link>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* User Profile */}
      <div className="space-y-4 p-4">
        <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {userName}
              </p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full justify-center gap-2 border-gray-200 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </Button>
      </div>
    </aside>
  );
}
