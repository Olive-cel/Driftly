"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import type { Database } from "@/types/database";
import { countTripsByStatus } from "@/lib/trips/trip-status";
import {
  LayoutDashboard,
  Plane,
  MapPin,
  Lightbulb,
  Heart,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

type Itinerary = Database["public"]["Tables"]["itineraries"]["Row"];

const navItems: Array<{ icon: LucideIcon; label: string; href: string }> = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" as never },
  { icon: Plane, label: "Mes voyages", href: "/dashboard/trips" as never },
  { icon: MapPin, label: "Itinéraires", href: "/dashboard/trips" as never },
  { icon: Lightbulb, label: "Inspiration", href: "/dashboard/inspiration" as never },
  { icon: Heart, label: "Favoris", href: "/dashboard/favorites" as never },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" as never },
  { icon: Settings, label: "Paramètres", href: "/dashboard/settings" as never },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [tripCounts, setTripCounts] = useState({ total: 0, upcoming: 0, ongoing: 0, completed: 0 });

  useEffect(() => {
    const fetchTripCounts = async () => {
      try {
        const tripsResponse = await fetch("/api/trips");
        if (tripsResponse.ok) {
          const tripsData = await tripsResponse.json();
          const trips = tripsData.trips || [];

          // Fetch itineraries for all trips
          const itinMap: Record<string, Itinerary> = {};
          for (const trip of trips) {
            try {
              const itinResponse = await fetch(`/api/itineraries?trip_id=${trip.id}`);
              if (itinResponse.ok) {
                const itinData = await itinResponse.json();
                if (itinData.itinerary) {
                  itinMap[trip.id] = itinData.itinerary;
                }
              }
            } catch {
              // Silently continue
            }
          }

          const counts = countTripsByStatus(trips, itinMap);
          setTripCounts(counts);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des comptes:", err);
      }
    };

    fetchTripCounts();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-white via-white to-amber-50 border-r border-neutral-100 flex flex-col shadow-sm"
    >
      {/* Logo */}
      <motion.div
        className="px-8 py-6 border-b border-neutral-100"
        whileHover={{ scale: 1.02 }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-3 cursor-pointer"
          passHref
        >
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Driftly</h2>
            <p className="text-xs text-neutral-500">Travel Planning</p>
          </div>
        </Link>
      </motion.div>

      {/* Navigation */}
      <motion.nav
        className="flex-1 overflow-y-auto px-4 py-6 space-y-1"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {navItems.map((item) => (
          <motion.div key={item.href} variants={itemVariants}>
            <Link
              href={item.href}
              passHref
              className="group flex items-center gap-3 px-4 py-3 text-neutral-700 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{item.label}</span>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronDown className="w-4 h-4 rotate-90" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.nav>

      {/* Divider */}
      <motion.div
        className="border-t border-neutral-100"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      />

      {/* Trip Status Badges */}
      {(tripCounts.upcoming > 0 || tripCounts.ongoing > 0) && (
        <motion.div
          className="px-4 py-4 space-y-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {tripCounts.upcoming > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <p className="text-xs text-orange-700 font-semibold text-center">
                🚀 {tripCounts.upcoming} voyage{tripCounts.upcoming > 1 ? "s" : ""} à venir
              </p>
            </div>
          )}
          {tripCounts.ongoing > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <p className="text-xs text-green-700 font-semibold text-center">
                🌍 {tripCounts.ongoing} voyage{tripCounts.ongoing > 1 ? "s" : ""} en cours
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Divider 2 */}
      <motion.div
        className="border-t border-neutral-100"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      />

      {/* User Profile */}
      <motion.div
        className="px-4 py-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.email?.[0].toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-medium transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </motion.button>
      </motion.div>
    </motion.aside>
  );
}
