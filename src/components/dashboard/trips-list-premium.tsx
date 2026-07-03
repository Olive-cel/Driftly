"use client";

import { useEffect, useState, useMemo } from "react";
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
  Users,
  MoreVertical,
  AlertCircle,
  Download,
  Plane,
  Globe,
  TrendingUp,
  Share2,
  Copy,
  Trash2,
  Edit,
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
    transition: { staggerChildren: 0.03, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const StatCard = ({ icon: Icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="bg-white border border-neutral-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-center gap-2 mb-1">
      <div className="p-1.5 bg-amber-100 rounded-md text-amber-600 text-sm">
        {Icon}
      </div>
      <span className="text-xs font-semibold text-neutral-600 uppercase">{label}</span>
    </div>
    <div className="text-xl font-bold text-neutral-900">{value}</div>
  </motion.div>
);

const TripCard = ({
  trip,
  statusInfo,
  startDate,
  travelType,
}: {
  trip: Trip;
  statusInfo: ReturnType<typeof getTripStatus>;
  startDate: Date | null;
  travelType: { bg: string; text: string };
}) => {
  const [showActions, setShowActions] = useState(false);
  const daysUntilDeparture = startDate
    ? Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Link href={`/dashboard/trips/${trip.id}`}>
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4 }}
        className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full"
      >
        {/* Image Container */}
        <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-amber-200 to-purple-300">
          <img
            src={trip.cover_image || FALLBACK_IMAGE_URL}
            alt={trip.destination ?? "Voyage"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE_URL;
            }}
          />
          
          {/* Status Badge Top Left */}
          <div className={`absolute top-2 left-2 ${statusInfo.badgeColor} px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 backdrop-blur-sm shadow-sm`}>
            <Plane className="w-3 h-3" />
            {statusInfo.label}
          </div>

          {/* Days Counter Top Right */}
          {daysUntilDeparture !== null && daysUntilDeparture > 0 && (
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm text-amber-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              {daysUntilDeparture}j
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          {/* Title & Location */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-1">
              {trip.departure_city} → {trip.destination}
            </h3>
            <p className="text-xs text-neutral-500 line-clamp-1">{trip.destination}</p>
          </div>

          {/* Info Compact Row */}
          <div className="flex items-center gap-3 text-xs text-neutral-600">
            {startDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" />
                {startDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
              </div>
            )}
            
            {trip.travelers_count && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-neutral-400" />
                {trip.travelers_count}
              </div>
            )}
          </div>

          {/* Tag + Budget Row */}
          <div className="flex items-center justify-between gap-2">
            {Array.isArray(trip.interests) && trip.interests.length > 0 && (
              <div className={`${travelType.bg} ${travelType.text} px-1.5 py-0.5 rounded text-xs font-medium`}>
                {String(trip.interests[0]).substring(0, 3)}
              </div>
            )}
            {trip.budget && (
              <div className="font-bold text-amber-600 text-xs">
                {trip.budget}€
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-auto">
            <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden mb-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${statusInfo.progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-gradient-to-r from-amber-500 to-orange-600 h-1.5 rounded-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-600 font-medium">{statusInfo.message}</p>
              <span className="text-xs text-neutral-500">{statusInfo.progress}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 pt-2 border-t border-neutral-100 mt-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs h-7 px-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              Voir
            </Button>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-7 hover:bg-neutral-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
              >
                <MoreVertical className="w-3.5 h-3.5 text-neutral-400" />
              </Button>

              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-7 right-0 bg-white border border-neutral-200 rounded-md shadow-xl z-20 min-w-max text-xs overflow-hidden"
                >
                  <button className="w-full px-2 py-1.5 text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 border-b border-neutral-100">
                    <Edit className="w-3 h-3" /> Modifier
                  </button>
                  <button className="w-full px-2 py-1.5 text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 border-b border-neutral-100">
                    <Copy className="w-3 h-3" /> Dupliquer
                  </button>
                  <button className="w-full px-2 py-1.5 text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 border-b border-neutral-100">
                    <Share2 className="w-3 h-3" /> Partager
                  </button>
                  <button className="w-full px-2 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-1.5">
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
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

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
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
  }, [trips, itineraries, searchQuery, activeTab]);

  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
    const upcomingTrips = trips.filter(
      (trip) => getTripStatus(trip, itineraries[trip.id]).status === "upcoming"
    );
    const nextDeparture =
      upcomingTrips.length > 0
        ? upcomingTrips
            .sort((a, b) => {
              const dateA = a.start_date ? new Date(a.start_date as string) : new Date(9999, 0, 0);
              const dateB = b.start_date ? new Date(b.start_date as string) : new Date(9999, 0, 0);
              return dateA.getTime() - dateB.getTime();
            })[0]
            .start_date
        : null;
    const uniqueCountries = new Set(trips.map((trip) => trip.destination)).size;

    return {
      totalTrips,
      totalBudget,
      nextDeparture: nextDeparture
        ? new Date(nextDeparture as string).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          })
        : "-",
      uniqueCountries,
    };
  }, [trips, itineraries]);

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
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50">
        {/* Top Header */}
        <div className="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">Mes voyages</h1>
            <p className="text-sm text-neutral-600 mt-1">Retrouvez tous vos voyages et leur état d&apos;avancement.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Importer
            </Button>
            <Link href="/dashboard/trips/new" className="w-full sm:w-auto">
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white gap-2 w-full">
                <Plus className="w-4 h-4" />
                Nouveau voyage
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Controls */}
        <div className="px-8 pb-2 space-y-2 border-t border-neutral-100">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher un voyage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-sm"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrer
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                Trier
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <StatCard icon={<Plane className="w-4 h-4" />} label="Voyages" value={stats.totalTrips} />
            <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Budget" value={`${stats.totalBudget}€`} />
            <StatCard icon={<Calendar className="w-4 h-4" />} label="Prochain" value={stats.nextDeparture} />
            <StatCard icon={<Globe className="w-4 h-4" />} label="Pays" value={stats.uniqueCountries} />
          </motion.div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
            {filterTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full"
            />
          </div>
        ) : filteredTrips.length === 0 ? (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-medium mb-2">Aucun voyage trouvé</p>
            <p className="text-sm text-neutral-500 mb-6">Créez votre premier voyage pour commencer l&apos;aventure</p>
            <Link href="/dashboard/trips/new">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Nouveau voyage
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {filteredTrips.map((trip) => {
              const statusInfo = getTripStatus(trip, itineraries[trip.id]);
              const travelType = getTravelTypeColor(trip.interests as string[] | null);
              const startDate = trip.start_date ? new Date(trip.start_date as string) : null;

              return (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  statusInfo={statusInfo}
                  startDate={startDate}
                  travelType={travelType}
                />
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
