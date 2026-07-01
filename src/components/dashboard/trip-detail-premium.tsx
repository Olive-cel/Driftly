"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";
import type { GeneratedItinerary } from "@/types/itinerary";
import type { NormalizedFlightOffer } from "@/lib/amadeus";
import type { HotelRecommendation } from "@/lib/hotels";
import { FALLBACK_IMAGE_URL } from "@/lib/pexels-client";
import { getFormattedCountryInfo } from "@/lib/travel/country-info";
import { getActivityImage, getActivityFallbackImage } from "@/lib/travel/activity-images";
import {
  calculateDailyBudget,
  calculateBudgetBreakdown,
  extractBudgetFromItinerary,
  type BudgetBreakdown,
} from "@/lib/travel/budget-calculator";
import {
  Heart,
  MoreVertical,
  Clock,
  MapPin,
  UtensilsCrossed,
  Lightbulb,
  AlertCircle,
  Share2,
  Download,
  Plane,
  Trophy,
} from "lucide-react";

type Trip = Database["public"]["Tables"]["trips"]["Row"];

const tabsData = [
  { id: "overview", label: "Aperçu" },
  { id: "flights", label: "Vols recommandés" },
  { id: "hotels", label: "Hôtels recommandés" },
  { id: "itinerary", label: "Itinéraire" },
  { id: "map", label: "Carte" },
  { id: "budget", label: "Budget" },
  { id: "tips", label: "Conseils" },
  { id: "documents", label: "Documents" },
];

/**
 * Calcule la date du jour basée sur start_date du voyage.
 */
function calculateDayDate(trip: Trip | null, dayNumber: number): string {
  if (!trip?.start_date) return `Jour ${dayNumber}`;

  try {
    const startDate = new Date(trip.start_date);
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + (dayNumber - 1));

    const formatter = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
    });

    return `Jour ${dayNumber} — ${formatter.format(dayDate)}`;
  } catch {
    return `Jour ${dayNumber}`;
  }
}

export default function TripDetailPremium() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [dayImages, setDayImages] = useState<Record<number, string>>({}); // Stocker images par jour
  const [countryInfo, setCountryInfo] = useState<Record<string, string>>({}); // Stocker infos pays
  const [budgetBreakdown, setBudgetBreakdown] = useState<BudgetBreakdown | null>(null); // Budget récapitulatif
  const [dailyBudgets, setDailyBudgets] = useState<Record<number, number>>({}); // Budgets par jour
  const [flights, setFlights] = useState<NormalizedFlightOffer[]>([]); // Vols recommandés
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [hotels, setHotels] = useState<HotelRecommendation[]>([]); // Hôtels recommandés
  const [hotelsLoading, setHotelsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch trip
        const tripResponse = await fetch(`/api/trips/${tripId}`);
        if (tripResponse.status === 401) {
          router.push("/login");
          return;
        }
        if (!tripResponse.ok) throw new Error("Voyage non trouvé");
        const tripData = await tripResponse.json();
        setTrip(tripData.trip);

        // Charger infos pratiques du pays
        if (tripData.trip?.destination) {
          const countryInfoData = getFormattedCountryInfo(tripData.trip.destination);
          setCountryInfo(countryInfoData);
        }

        // Fetch itinerary
        const itinResponse = await fetch(`/api/itineraries?trip_id=${tripId}`);
        if (itinResponse.ok) {
          const itinData = await itinResponse.json();
          if (itinData.itinerary) {
            let content = itinData.itinerary.generated_content;
            if (typeof content === "string") {
              try {
                content = JSON.parse(content);
              } catch {
                console.warn("Could not parse generated_content as JSON");
              }
            }
            if (content && typeof content === "object" && "days" in content) {
              setItinerary(content);

              // Extraire les budgets depuis l'itinéraire IA
              const budgetData = extractBudgetFromItinerary(content);
              console.log("[Trip Detail] Budget data from IA:", budgetData);

              // Calculer la répartition du budget
              const breakdown = calculateBudgetBreakdown(
                tripData.trip?.budget,
                budgetData.totalBudgetBreakdown
              );
              setBudgetBreakdown(breakdown);
              console.log("[Trip Detail] Budget breakdown:", breakdown);

              // Stocker les budgets quotidiens
              if (budgetData.dailyBudgets) {
                setDailyBudgets(budgetData.dailyBudgets);
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    };

    // Charger les vols recommandés
    const fetchFlights = async () => {
      if (!tripId) return;
      try {
        setFlightsLoading(true);
        const flightsResponse = await fetch(`/api/trips/${tripId}/travel-options`);
        if (flightsResponse.ok) {
          const flightsData = await flightsResponse.json();
          if (flightsData.flights && Array.isArray(flightsData.flights)) {
            setFlights(flightsData.flights);
            console.log("[Trip Detail] Flights loaded:", flightsData.flights.length);
          }
        }
      } catch (err) {
        console.warn("[Trip Detail] Failed to load flights:", err);
      } finally {
        setFlightsLoading(false);
      }
    };

    // Charger les hôtels recommandés
    const fetchHotels = async () => {
      if (!tripId) return;
      try {
        setHotelsLoading(true);
        const hotelsResponse = await fetch(`/api/trips/${tripId}/hotels`);
        if (hotelsResponse.ok) {
          const hotelsData = await hotelsResponse.json();
          if (hotelsData.hotels && Array.isArray(hotelsData.hotels)) {
            setHotels(hotelsData.hotels);
            console.log("[Trip Detail] Hotels loaded:", hotelsData.hotels.length);
          }
        }
      } catch (err) {
        console.warn("[Trip Detail] Failed to load hotels:", err);
      } finally {
        setHotelsLoading(false);
      }
    };

    fetchData();
    fetchFlights();
    fetchHotels();
  }, [tripId, router]);

  // Charger les images pour chaque jour
  useEffect(() => {
    if (itinerary && itinerary.days && trip?.destination) {
      const loadDayImages = async () => {
        const images: Record<number, string> = {};
        for (const day of itinerary.days) {
          try {
            const firstActivity = day.activities?.[0];
            const img = await getActivityImage(
              trip.destination || "voyage",
              day.title,
              firstActivity?.description
            );
            images[day.day] = img?.imageUrl || getActivityFallbackImage(firstActivity?.category || "travel");
          } catch (err) {
            console.warn(`Failed to load image for day ${day.day}:`, err);
            images[day.day] = getActivityFallbackImage("travel");
          }
        }
        setDayImages(images);
      };

      loadDayImages();
    }
  }, [itinerary, trip?.destination]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white w-full">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white w-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-neutral-900">{error || "Voyage non trouvé"}</p>
          <Link href="/dashboard/trips">
            <Button className="mt-6">Retour aux voyages</Button>
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = trip.cover_image || FALLBACK_IMAGE_URL;

  return (
    <motion.div className="w-full min-h-screen bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero Section */}
      <motion.div className="relative h-56 sm:h-64 md:h-80 w-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <img src={heroImage} alt={trip.destination ?? "Voyage"} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE_URL; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-0 left-0 right-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href="/dashboard/trips">
            <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm text-sm">
              ← Retour
            </Button>
          </Link>
          <div className="flex gap-2">
            <motion.button
              onClick={() => setLiked(!liked)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 transition-all"
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            </motion.button>
            <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm px-3">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-3 sm:space-y-4">
          <div>
            <div className="inline-block px-3 py-1 bg-amber-600/80 backdrop-blur-sm rounded-full text-white text-xs font-semibold mb-2 sm:mb-3">
              ✨ Confirmé
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 line-clamp-2">
              {trip.departure_city} → {trip.destination}
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-white/90 mb-3 sm:mb-4 text-sm sm:text-base">
              <span className="line-clamp-1">{trip.start_date && trip.end_date ? `${new Date(trip.start_date as string).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} → ${new Date(trip.end_date as string).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}` : "Dates non définies"} • {trip.duration || "?"} jours</span>
            </div>

            {/* Hero Info Cards */}
            <div className="flex flex-wrap gap-3 sm:gap-6">
              {trip.budget && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-xs text-white/70">Budget</p>
                  <p className="text-lg font-bold text-white">{trip.budget}€</p>
                </div>
              )}
              {trip.travel_style && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-xs text-white/70">Style</p>
                  <p className="text-lg font-bold text-white">{trip.travel_style}</p>
                </div>
              )}
              {trip.interests && Array.isArray(trip.interests) && trip.interests.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-xs text-white/70">Centres d&apos;intérêt</p>
                  <p className="text-lg font-bold text-white">{(trip.interests as string[])[0]}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto">
            {tabsData.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "text-amber-600 border-amber-600"
                    : "text-neutral-600 border-transparent hover:text-neutral-900"
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
          {/* Left Column - Itinerary */}
          <div className="lg:col-span-2">
            {activeTab === "flights" && (
              <div className="space-y-6">
                {flightsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin">
                      <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full" />
                    </div>
                  </div>
                ) : flights.length === 0 ? (
                  <div className="text-center py-12">
                    <Plane className="w-12 h-12 text-amber-200 mx-auto mb-4" />
                    <p className="text-neutral-600">Aucun vol trouvé. Essayez de rechercher à nouveau.</p>
                    <motion.button
                      onClick={() => {
                        setFlightsLoading(true);
                        fetch(`/api/trips/${tripId}/travel-options`, { method: "POST" })
                          .then((r) => r.json())
                          .then((data) => {
                            if (data.flights) setFlights(data.flights);
                          })
                          .finally(() => setFlightsLoading(false));
                      }}
                      className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Rechercher les vols
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Vols recommandés</h2>
                        <p className="text-neutral-600 text-sm">
                          {flights.length} vol(s) trouvé(s) de {trip?.departure_city} à {trip?.destination}
                        </p>
                      </div>
                      <Plane className="w-8 h-8 text-amber-600" />
                    </div>

                    {flights.map((flight, idx) => {
                      const minPrice = Math.min(...flights.map((f) => f.price));
                      const isCheapest = flight.price === minPrice;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow relative"
                        >
                          {isCheapest && (
                            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                              <Trophy className="w-3 h-3" />
                              Meilleur prix
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                            {/* Airline */}
                            <div className="text-center md:text-left">
                              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Compagnie</p>
                              <p className="font-semibold text-neutral-900">{flight.airline}</p>
                            </div>

                            {/* Departure */}
                            <div className="text-center">
                              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Départ</p>
                              <div>
                                <p className="font-bold text-lg text-neutral-900">
                                  {new Date(flight.departure_time).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <p className="text-sm text-neutral-600">{flight.departure_airport}</p>
                              </div>
                            </div>

                            {/* Duration & Stops */}
                            <div className="text-center">
                              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Durée</p>
                              <div className="flex flex-col items-center">
                                <p className="font-semibold text-neutral-900">{flight.duration}</p>
                                <p className="text-xs text-neutral-600 mt-1">
                                  {flight.stops === 0 ? "Direct" : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`}
                                </p>
                              </div>
                            </div>

                            {/* Arrival */}
                            <div className="text-center">
                              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Arrivée</p>
                              <div>
                                <p className="font-bold text-lg text-neutral-900">
                                  {new Date(flight.arrival_time).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <p className="text-sm text-neutral-600">{flight.arrival_airport}</p>
                              </div>
                            </div>

                            {/* Price & Action */}
                            <div className="text-center md:text-right">
                              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Prix</p>
                              <div>
                                <p className="text-2xl font-bold text-amber-600">{flight.price}€</p>
                                <p className="text-xs text-neutral-600 mt-2">par personne</p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all w-full md:w-auto"
                              >
                                Réserver
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "hotels" && (
              <div className="space-y-6">
                {hotelsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin">
                      <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full" />
                    </div>
                  </div>
                ) : hotels.length === 0 ? (
                  <div className="text-center py-12">
                    <Lightbulb className="w-12 h-12 text-amber-200 mx-auto mb-4" />
                    <p className="text-neutral-600">Aucun hôtel trouvé. Essayez de rechercher à nouveau.</p>
                    <motion.button
                      onClick={() => {
                        setHotelsLoading(true);
                        fetch(`/api/trips/${tripId}/hotels`, { method: "POST" })
                          .then((r) => r.json())
                          .then((data) => {
                            if (data.hotels) setHotels(data.hotels);
                          })
                          .finally(() => setHotelsLoading(false));
                      }}
                      className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Rechercher les hôtels
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Hôtels recommandés</h2>
                        <p className="text-neutral-600 text-sm">
                          {hotels.length} hôtel(s) trouvé(s) à {trip?.destination}
                        </p>
                      </div>
                    </div>

                    {hotels.map((hotel, idx) => (
                      <motion.div
                        key={hotel.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-6 h-full">
                          {/* Image */}
                          <div className="relative w-full md:col-span-1 h-48 md:h-auto overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300">
                            <img
                              src={hotel.image_url || FALLBACK_IMAGE_URL}
                              alt={hotel.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white ${
                              hotel.badge === "Luxe" 
                                ? "bg-purple-600" 
                                : hotel.badge === "Premium" 
                                ? "bg-blue-600" 
                                : hotel.badge === "Meilleur choix" 
                                ? "bg-green-600" 
                                : "bg-orange-600"
                            }`}>
                              {hotel.badge}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-6 md:col-span-3 flex flex-col justify-between">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-xl font-bold text-neutral-900">{hotel.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <span
                                        key={i}
                                        className={`text-lg ${
                                          i < Math.floor(hotel.rating) ? "text-amber-400" : "text-neutral-300"
                                        }`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-sm text-neutral-600">
                                    {hotel.rating}/5 ({Math.round(Math.random() * 500) + 50} avis)
                                  </span>
                                </div>
                                <p className="text-sm text-neutral-600 mt-2">{hotel.description}</p>
                              </div>

                              {/* Amenities */}
                              <div className="flex flex-wrap gap-2">
                                {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full"
                                  >
                                    {amenity}
                                  </span>
                                ))}
                                {hotel.amenities.length > 3 && (
                                  <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full">
                                    +{hotel.amenities.length - 3} autre(s)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Price & Action */}
                            <div className="flex items-end justify-between pt-4 border-t border-neutral-200 mt-4">
                              <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                                  Prix
                                </p>
                                <div>
                                  <p className="text-2xl font-bold text-amber-600">
                                    {hotel.total_price}€
                                  </p>
                                  <p className="text-xs text-neutral-600">
                                    {hotel.price_per_night}€/nuit ({hotel.nights} nuits)
                                  </p>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:shadow-md transition-all"
                              >
                                Sélectionner
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "itinerary" && itinerary && itinerary.days ? (
              <div className="space-y-8">
                {itinerary.days.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-4"
                  >
                    {/* Day Header with Image */}
                    <div className="relative h-48 rounded-xl overflow-hidden shadow-md">
                      <img
                        src={dayImages[day.day] || FALLBACK_IMAGE_URL}
                        alt={day.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE_URL;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-2xl font-bold">{day.title}</h3>
                      </div>
                    </div>

                    {/* Day Number */}
                    <div className="text-lg font-bold text-amber-600 mt-4">
                      {calculateDayDate(trip, day.day)}
                    </div>

                    {/* Activities */}
                    {day.activities && day.activities.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Activités</p>
                        {day.activities.map((activity, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="flex items-center gap-2 min-w-fit text-neutral-500">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-medium">{activity.time}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-neutral-900">{activity.name}</p>
                              <p className="text-sm text-neutral-600">{activity.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Food */}
                    {day.food && day.food.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Gastronomie</p>
                        {day.food.map((meal, idx) => (
                          <div key={idx} className="flex gap-4">
                            <UtensilsCrossed className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-neutral-900">{meal.name}</p>
                              <p className="text-sm text-neutral-600">{meal.description}</p>
                              {meal.priceRange && <p className="text-xs text-neutral-500 mt-1">{meal.priceRange}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Budget Estimate */}
                    {trip && (
                      <div className="bg-amber-50 border border-amber-200/30 rounded-lg p-3">
                        <p className="text-sm text-amber-900 font-semibold">
                          Budget estimé:{" "}
                          {dailyBudgets[day.day]
                            ? `${Math.round(dailyBudgets[day.day])}€`
                            : calculateDailyBudget(
                                trip.budget,
                                trip.duration,
                                day.activities?.[0]?.estimatedCost,
                                day.day
                              ).estimatedBudget > 0
                            ? `${calculateDailyBudget(
                                trip.budget,
                                trip.duration,
                                day.activities?.[0]?.estimatedCost,
                                day.day
                              ).estimatedBudget}€`
                            : "Non disponible"}
                        </p>
                      </div>
                    )}

                    {/* Tips */}
                    {day.tips && day.tips.length > 0 && (
                      <div className="bg-amber-50/50 border border-amber-200/30 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-semibold text-amber-900">💡 Conseils</p>
                        {day.tips.map((tip, idx) => (
                          <p key={idx} className="text-sm text-amber-800">• {tip}</p>
                        ))}
                      </div>
                    )}

                    {index < itinerary.days.length - 1 && <div className="border-b border-neutral-200 mt-8" />}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lightbulb className="w-12 h-12 text-amber-200 mx-auto mb-4" />
                <p className="text-neutral-600">L&apos;itinéraire est en cours de génération...</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-gradient-to-br from-amber-50 to-purple-50 rounded-lg p-6 h-64 border border-amber-200/30 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-amber-600">Voir la carte complète</p>
              </div>
            </div>

            {/* Practical Info */}
            <div className="bg-white border border-neutral-100 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-neutral-900">Informations pratiques</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Langue</p>
                  <p className="font-medium text-neutral-900">{countryInfo.languages || "Information non disponible"}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Devise</p>
                  <p className="font-medium text-neutral-900">{countryInfo.currency || "Information non disponible"}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Décalage horaire</p>
                  <p className="font-medium text-neutral-900">{countryInfo.timezone || "Information non disponible"}</p>
                </div>
              </div>
            </div>

            {/* Budget Summary */}
            <div className="bg-white border border-neutral-100 rounded-lg p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Budget récapitulatif</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="60" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle cx="64" cy="64" r="60" fill="none" stroke="#d97706" strokeWidth="8" strokeDasharray="120 352" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neutral-900">{trip.budget}€</p>
                      <p className="text-xs text-neutral-500">Total</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Hébergement</span>
                  <span className="font-semibold text-neutral-900">
                    {budgetBreakdown?.accommodation ? `${budgetBreakdown.accommodation}€` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Activités</span>
                  <span className="font-semibold text-neutral-900">
                    {budgetBreakdown?.activities ? `${budgetBreakdown.activities}€` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Restauration</span>
                  <span className="font-semibold text-neutral-900">
                    {budgetBreakdown?.food ? `${budgetBreakdown.food}€` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Transport/Local</span>
                  <span className="font-semibold text-neutral-900">
                    {budgetBreakdown?.transport ? `${budgetBreakdown.transport}€` : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-lg text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Partager le voyage
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-900 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger PDF
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
