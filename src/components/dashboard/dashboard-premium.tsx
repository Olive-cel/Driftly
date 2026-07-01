"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";
import { FALLBACK_IMAGE_URL } from "@/lib/unsplash-client";
import { getPersonalizedRecommendations, getAllRecommendations, enrichRecommendationsWithImages } from "@/lib/travel/recommendations";
import type { Recommendation } from "@/lib/travel/recommendations";
import type { Inspiration } from "@/lib/inspirations-service";
import { getTripStatus, countTripsByStatus } from "@/lib/trips/trip-status";
import {
  Plane,
  MapPin,
  Calendar,
  Compass,
  Heart,
  Zap,
  Upload,
  Clock,
  ChevronRight,
  MapPinIcon,
} from "lucide-react";

type Trip = Database["public"]["Tables"]["trips"]["Row"];
type Itinerary = Database["public"]["Tables"]["itineraries"]["Row"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPremium() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [itineraries, setItineraries] = useState<Record<string, Itinerary>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [likedDestinations, setLikedDestinations] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trips
        const tripsResponse = await fetch("/api/trips");
        if (tripsResponse.ok) {
          const tripsData = await tripsResponse.json();
          setTrips(tripsData.trips || []);

          // Fetch itineraries for all trips
          const itinMap: Record<string, Itinerary> = {};
          for (const trip of tripsData.trips || []) {
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

        // Fetch profile for personalization
        const profileResponse = await fetch("/api/profiles");
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();

          // Fetch enriched inspirations from the unified API
          try {
            const inspirationsResponse = await fetch("/api/inspirations");
            if (inspirationsResponse.ok) {
              const inspirationsData = await inspirationsResponse.json();
              
              // Convert inspirations to recommendations format for display
              const inspirationRecs = (inspirationsData.inspirations || []).slice(0, 4).map((insp: Inspiration) => ({
                destination: insp.destination,
                country: insp.country,
                priceFrom: insp.estimatedPrice,
                imageUrl: insp.imageUrl,
                rating: insp.rating || 4.5,
                reason: insp.description,
              }));
              
              setRecommendations(inspirationRecs);
            } else {
              // Fallback to old system if new API fails
              const tripsForRecs = await (await fetch("/api/trips")).json();
              let recs = getPersonalizedRecommendations(profileData.profile, tripsForRecs.trips || []);
              if (recs.length === 0) {
                recs = getAllRecommendations().slice(0, 8);
              }
              const enrichedRecs = await enrichRecommendationsWithImages(recs);
              setRecommendations(enrichedRecs);
            }
          } catch (err) {
            console.warn("[Dashboard] Failed to fetch inspirations, using fallback:", err);
            // Fallback to old system
            const tripsForRecs = await (await fetch("/api/trips")).json();
            let recs = getPersonalizedRecommendations(profileData.profile, tripsForRecs.trips || []);
            if (recs.length === 0) {
              recs = getAllRecommendations().slice(0, 8);
            }
            const enrichedRecs = await enrichRecommendationsWithImages(recs);
            setRecommendations(enrichedRecs);
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
      }
    };

    fetchData();
  }, []);

  const toggleLike = (destination: string) => {
    setLikedDestinations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(destination)) {
        newSet.delete(destination);
      } else {
        newSet.add(destination);
      }
      return newSet;
    });
  };

  // Calculer les stats intelligentes
  const tripCounts = countTripsByStatus(trips, itineraries);

  const stats = [
    { label: "Voyages", value: tripCounts.total, unit: "Tous les voyages", icon: Plane },
    { label: "À venir", value: tripCounts.upcoming, unit: "Prochains départs", icon: Calendar },
    { label: "En cours", value: tripCounts.ongoing, unit: "Voyages actifs", icon: MapPin },
    { label: "Terminés", value: tripCounts.completed, unit: "Aventures vécues", icon: Heart },
  ];

  const quickActions = [
    { label: "Créer un voyage", icon: Plus, href: "/dashboard/trips/new" },
    { label: "Générer avec l'IA", icon: Zap, href: "/dashboard/trips/new" },
    { label: "Importer une réservation", icon: Upload, href: "#" },
    { label: "Voir mes favoris", icon: Heart, href: "#" },
  ];

  // Trouver le prochain voyage à venir : le voyage avec la date de départ la plus proche
  // Logique correcte : filtrer les voyages futurs et trier par start_date croissante
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrips = trips
    .filter((trip) => {
      if (!trip.start_date) return false;
      const startDate = new Date(trip.start_date as string);
      startDate.setHours(0, 0, 0, 0);
      return startDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.start_date as string).getTime();
      const dateB = new Date(b.start_date as string).getTime();
      return dateA - dateB; // Croissant : voyage le plus proche en premier
    });

  const nextUpcomingTrip = upcomingTrips[0] || null;
  const nextTripStatus = nextUpcomingTrip ? getTripStatus(nextUpcomingTrip, itineraries[nextUpcomingTrip.id]) : null;

  return (
    <motion.div
      className="w-full min-h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section avec image immersive */}
      <motion.section
        className="relative h-56 sm:h-64 md:h-80 w-full overflow-hidden rounded-none sm:rounded-2xl sm:mx-4 sm:mt-4 sm:mb-4 md:rounded-3xl md:mx-8 md:mt-8 md:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {nextUpcomingTrip && nextTripStatus ? (
        <>
          <img
            src={nextUpcomingTrip.cover_image || FALLBACK_IMAGE_URL}
            alt="Prochain voyage"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE_URL;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-8">
              <div>
                <p className="text-amber-400 text-sm font-semibold mb-2">Votre prochaine aventure commence</p>
                <h1 className="text-5xl font-bold text-white mb-3">
                  {nextUpcomingTrip.destination}
                </h1>
                <p className="text-white/80 text-lg">
                  {nextTripStatus.message}
                </p>
              </div>

              {/* Badges au bas du hero */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">{nextUpcomingTrip.destination}</span>
                </div>
                {nextUpcomingTrip.start_date && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 text-white text-sm">
                    📅 {new Date(nextUpcomingTrip.start_date as string).toLocaleDateString("fr-FR")}
                  </div>
                )}
                <Link href={`/dashboard/trips/${nextUpcomingTrip.id}`}>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                    Voir le voyage <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-purple-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="relative h-full flex flex-col justify-between p-8">
            <div>
              <p className="text-amber-200 text-sm font-semibold mb-2">Aucun départ prévu</p>
              <h1 className="text-5xl font-bold text-white mb-3">
                Planifiez votre prochaine aventure
              </h1>
              <p className="text-white/80 text-lg max-w-2xl">
                Commencez à créer un nouveau voyage pour explorer le monde.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/dashboard/trips/new">
                <Button className="bg-white text-amber-600 hover:bg-orange-50 px-8 py-3 text-base font-semibold">
                  <Compass className="w-5 h-5 mr-2" />
                  Créer mon prochain voyage
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
      </motion.section>

      {/* Main Content Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Left Column (3 cols) - Main Content */}
            <div className="lg:col-span-3 space-y-6 lg:space-y-8">
              {/* Stats Section */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    className="bg-white border border-amber-200/30 rounded-2xl p-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <stat.icon className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-neutral-600 mb-2">{stat.label}</p>
                    <p className="text-xs text-amber-600 font-medium">{stat.unit}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Mes Voyages Section */}
              {trips.length > 0 && (
                <motion.section
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-neutral-900">Mes voyages</h2>
                    <Link href="/dashboard/trips" className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium text-sm">
                      Voir tous mes voyages <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {trips.slice(0, 4).map((trip) => {
                      const statusInfo = getTripStatus(trip, itineraries[trip.id]);
                      return (
                        <Link key={trip.id} href={`/dashboard/trips/${trip.id}`}>
                          <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(231, 111, 81, 0.15)" }}
                            className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col cursor-pointer"
                          >
                            {/* Image */}
                            <div className="h-40 bg-gradient-to-br from-amber-400 to-purple-500 relative overflow-hidden">
                              <img
                                src={trip.cover_image || FALLBACK_IMAGE_URL}
                                alt={trip.destination ?? "Voyage"}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = FALLBACK_IMAGE_URL;
                                }}
                              />
                              {/* Status Badge */}
                              <div className={`absolute top-3 right-3 ${statusInfo.badgeColor} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                                <span>{statusInfo.icon}</span>
                                {statusInfo.label}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-bold text-neutral-900 mb-2 line-clamp-2">
                                {trip.departure_city} → {trip.destination}
                              </h3>

                              <div className="space-y-1 text-sm text-neutral-600 mb-auto">
                                {trip.start_date && trip.end_date && (
                                  <p className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(trip.start_date as string).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - {new Date(trip.end_date as string).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                  </p>
                                )}
                                {statusInfo.duration > 0 && (
                                  <p className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {statusInfo.duration} jours
                                  </p>
                                )}
                              </div>

                              {/* Message dynamique */}
                              <p className="text-xs text-amber-600 font-medium mb-3">
                                {statusInfo.message}
                              </p>

                              {/* Progress Bar */}
                              <div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                  <div
                                    className="bg-gradient-to-r from-amber-600 to-orange-600 h-2 rounded-full transition-all"
                                    style={{ width: `${statusInfo.progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-neutral-500">{statusInfo.progress}%</p>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Inspiration Pour Vous Section */}
              {recommendations.length > 0 && (
                <motion.section
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-neutral-900">Inspirations pour vous</h2>
                    <Link href="/dashboard/inspiration" className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium text-sm">
                      Voir plus <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {recommendations.slice(0, 4).map((rec) => (
                      <motion.div
                        key={rec.destination}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="relative h-40">
                          <img
                            src={rec.imageUrl || FALLBACK_IMAGE_URL}
                            alt={rec.destination}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMAGE_URL;
                            }}
                          />
                          {/* Heart Button */}
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleLike(rec.destination);
                            }}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full transition-all"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                likedDestinations.has(rec.destination)
                                  ? "fill-red-500 text-red-500"
                                  : "text-neutral-400"
                              }`}
                            />
                          </motion.button>
                        </div>

                        <div className="p-4">
                          <h3 className="font-bold text-neutral-900 mb-1">{rec.destination}</h3>
                          <p className="text-xs text-neutral-600 mb-2">{rec.country}</p>

                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-neutral-900">À partir de {rec.priceFrom}€</p>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-xs font-semibold text-neutral-900">{rec.rating}</span>
                            </div>
                          </div>

                          <p className="text-xs text-neutral-500 italic line-clamp-2">{rec.reason}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Right Column (1 col) - Quick Actions & Info */}
            <motion.div
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {/* Badges Voyages */}
              {(tripCounts.upcoming > 0 || tripCounts.ongoing > 0) && (
                <div className="space-y-2">
                  {tripCounts.upcoming > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-orange-700 font-semibold">
                        🚀 {tripCounts.upcoming} voyage{tripCounts.upcoming > 1 ? "s" : ""} à venir
                      </p>
                    </div>
                  )}
                  {tripCounts.ongoing > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-green-700 font-semibold">
                        🌍 {tripCounts.ongoing} voyage{tripCounts.ongoing > 1 ? "s" : ""} en cours
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions Rapides */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h3 className="font-bold text-neutral-900 mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  {quickActions.map((action) => (
                    <Link key={action.label} href={action.href}>
                      <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-amber-50 rounded-lg transition-all text-left group"
                      >
                        <div className="bg-amber-100 p-2 rounded-lg group-hover:bg-amber-200 transition-colors">
                          <action.icon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900">{action.label}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-600" />
                      </motion.button>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Prochain départ */}
              {nextUpcomingTrip && nextTripStatus && (
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-32 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 relative overflow-hidden">
                    <img
                      src={nextUpcomingTrip.cover_image || FALLBACK_IMAGE_URL}
                      alt="Prochain départ"
                      className="w-full h-full object-cover opacity-40"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE_URL;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-amber-600 font-semibold mb-1">PROCHAIN DÉPART</p>
                    <p className="font-bold text-neutral-900 mb-1">{nextUpcomingTrip.destination}</p>
                    <p className="text-xs text-neutral-600 mb-3">{nextTripStatus.message}</p>
                    <Link href={`/dashboard/trips/${nextUpcomingTrip.id}`}>
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm py-2">
                        Voir le voyage →
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Rappels */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-4">Rappels</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Vérifier passeport</p>
                      <p className="text-xs text-neutral-600">Exp. 25 juin 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Réservation hôtel</p>
                      <p className="text-xs text-neutral-600">à 2 jours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Météo destinations */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-4">Météo destinations</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-700">Bali</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">28°C</span>
                      <span>☀️</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-700">Rome</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">31°C</span>
                      <span>☀️</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Icône Plus
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
