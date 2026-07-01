"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";
import { FALLBACK_IMAGE_URL } from "@/lib/unsplash-client";
import { getTripStatus } from "@/lib/trips/trip-status";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Users,
  Tag,
  MoreVertical,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

type Trip = Database["public"]["Tables"]["trips"]["Row"];
type Itinerary = Database["public"]["Tables"]["itineraries"]["Row"];

const filterTabs = [
  { id: "all", label: "Tous" },
  { id: "upcoming", label: "À venir" },
  { id: "ongoing", label: "En cours" },
  { id: "draft", label: "Brouillons" },
  { id: "completed", label: "Terminés" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function TripsListPremium() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [itineraries, setItineraries] = useState<Record<string, Itinerary>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchTripsAndItineraries = async () => {
      try {
        const response = await fetch("/api/trips");
        if (response.ok) {
          const data = await response.json();
          setTrips(data.trips || []);

          // Fetch itineraries for all trips
          const itinMap: Record<string, Itinerary> = {};
          for (const trip of data.trips || []) {
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
          setItineraries(itinMap);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des voyages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTripsAndItineraries();
  }, []);

  // Filter trips based on tab and search
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.departure_city?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const statusInfo = getTripStatus(trip, itineraries[trip.id]);

    switch (activeTab) {
      case "upcoming":
        return statusInfo.status === "upcoming";
      case "ongoing":
        return statusInfo.status === "ongoing";
      case "completed":
        return statusInfo.status === "completed";
      case "draft":
        return statusInfo.status === "draft";
      default:
        return true;
    }
  });

  const getTravelTypeColor = (interests?: string[] | null) => {
    if (!interests || interests.length === 0) return { bg: "bg-blue-100", text: "text-blue-700" };
    const type = interests[0]?.toLowerCase() || "";
    const colors: Record<string, { bg: string; text: string }> = {
      adventure: { bg: "bg-red-100", text: "text-red-700" },
      relaxation: { bg: "bg-green-100", text: "text-green-700" },
      culture: { bg: "bg-purple-100", text: "text-purple-700" },
      family: { bg: "bg-yellow-100", text: "text-yellow-700" },
      luxury: { bg: "bg-amber-100", text: "text-amber-700" },
    };
    return colors[type] || { bg: "bg-blue-100", text: "text-blue-700" };
  };

  return (
    <div className="ml-64 min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200 sticky top-0 z-10 bg-white">
        <div className="px-8 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900">Mes voyages</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/trips/new">
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Nouveau voyage
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-8 pb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un voyage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtrer
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="px-8 border-t border-neutral-100 flex gap-8 overflow-x-auto">
          {filterTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 font-medium text-sm whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-8 py-8">
        <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Trips List (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin">
                  <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full" />
                </div>
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">Aucun voyage trouvé</p>
              </div>
            ) : (
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {filteredTrips.map((trip) => {
                  const statusInfo = getTripStatus(trip, itineraries[trip.id]);
                  const travelType = getTravelTypeColor(trip.interests as string[] | null);
                  const startDate = trip.start_date ? new Date(trip.start_date as string) : null;
                  const endDate = trip.end_date ? new Date(trip.end_date as string) : null;

                  return (
                    <Link key={trip.id} href={`/dashboard/trips/${trip.id}`}>
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ x: 4, boxShadow: "0 10px 25px -5px rgba(231, 111, 81, 0.1)" }}
                        className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-row group cursor-pointer"
                      >
                        {/* Image Left */}
                        <div className="w-64 h-48 relative flex-shrink-0 overflow-hidden bg-gradient-to-br from-amber-400 to-purple-500">
                          <img
                            src={trip.cover_image || FALLBACK_IMAGE_URL}
                            alt={trip.destination ?? "Voyage"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMAGE_URL;
                            }}
                          />
                          {/* Badge sur image */}
                          <div className={`absolute top-3 left-3 ${statusInfo.badgeColor} px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1`}>
                            <span>{statusInfo.icon}</span>
                            {statusInfo.label}
                          </div>
                        </div>

                        {/* Content Right */}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          {/* Top Section */}
                          <div className="space-y-3">
                            {/* Title */}
                            <h3 className="text-xl font-bold text-neutral-900">
                              {trip.departure_city} → {trip.destination}
                            </h3>

                            {/* Dates & Duration */}
                            <div className="flex items-center gap-4 text-sm text-neutral-600">
                              {startDate && endDate && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {startDate.toLocaleDateString("fr-FR", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}{" "}
                                    -{" "}
                                    {endDate.toLocaleDateString("fr-FR", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              )}
                              {statusInfo.duration > 0 && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{statusInfo.duration} jours</span>
                                </div>
                              )}
                            </div>

                            {/* Travelers & Type */}
                            <div className="flex items-center gap-4 text-sm">
                              {trip.travelers_count && (
                                <div className="flex items-center gap-2 text-neutral-600">
                                  <Users className="w-4 h-4" />
                                  <span>{trip.travelers_count} voyageur{trip.travelers_count > 1 ? "s" : ""}</span>
                                </div>
                              )}
                              {Array.isArray(trip.interests) && trip.interests.length > 0 && (
                                <div className={`${travelType.bg} ${travelType.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                                  <Tag className="w-3 h-3" />
                                  {String(trip.interests[0])}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bottom Section */}
                          <div className="space-y-3">
                            {/* Budget */}
                            {trip.budget && (
                              <div className="text-sm">
                                <span className="text-neutral-600">Budget</span>
                                <div className="font-bold text-lg text-neutral-900">{trip.budget} €</div>
                              </div>
                            )}

                            {/* Message dynamique */}
                            <p className="text-sm text-amber-600 font-medium">
                              {statusInfo.message}
                            </p>

                            {/* Progress Bar */}
                            <div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-gradient-to-r from-amber-600 to-orange-600 h-2.5 rounded-full transition-all"
                                  style={{ width: `${statusInfo.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-neutral-500 mt-1">{statusInfo.progress}%</p>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge & Menu */}
                        <div className="p-6 flex flex-col items-end justify-between">
                          <Button variant="ghost" size="sm" className="p-1.5 h-auto">
                            <MoreVertical className="w-5 h-5 text-neutral-400" />
                          </Button>
                          <div className="text-right">
                            <p className="text-xs text-neutral-500 mb-1">Statut</p>
                            <p className={`text-sm font-semibold ${statusInfo.badgeColor.split(" ")[1]}`}>
                              {statusInfo.label}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar (1 col) */}
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Conseils du jour */}
            <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-6">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-2xl">💡</span>
                <h3 className="font-bold text-neutral-900">Conseils du jour</h3>
              </div>
              <p className="text-sm text-neutral-700 mb-4">
                Pensez à vérifier les conditions d&apos;entrée et la validité de vos documents pour chaque pays.
              </p>
              <Link href="#">
                <button className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1">
                  Voir tous les conseils <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Besoin d'inspiration */}
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200/50 rounded-2xl p-6 relative overflow-hidden">
              {/* Illustration background */}
              <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="40" fill="currentColor" className="text-purple-200" />
                  <circle cx="50" cy="30" r="15" fill="currentColor" className="text-purple-300" />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="font-bold text-neutral-900 mb-2">Besoin d&apos;inspiration ?</h3>
                <p className="text-sm text-neutral-700 mb-4">
                  Découvrez des destinations incroyables et laissez l&apos;IA générer le voyage parfait.
                </p>
                <Link href="/dashboard">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm">
                    Explorer
                  </Button>
                </Link>
              </div>
            </div>

            {/* Balloon Illustration */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🎈</div>
              <p className="text-sm text-neutral-600">
                Vous avez atteint la fin de la liste ! 🎉
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
