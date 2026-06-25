"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";
import type { GeneratedItinerary } from "@/types/itinerary";
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
} from "lucide-react";

type Trip = Database["public"]["Tables"]["trips"]["Row"];

const tabsData = [
  { id: "overview", label: "Aperçu" },
  { id: "itinerary", label: "Itinéraire" },
  { id: "map", label: "Carte" },
  { id: "budget", label: "Budget" },
  { id: "tips", label: "Conseils" },
  { id: "documents", label: "Documents" },
];

const dayImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1552182158-f640e07731a5?w=600&h=400&fit=crop",
];

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
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tripId, router]);

  if (loading) {
    return (
      <div className="ml-64 flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="ml-64 flex min-h-screen items-center justify-center bg-white">
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

  const heroImage = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&h=600&fit=crop";

  return (
    <motion.div className="ml-64 min-h-screen bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero Section */}
      <motion.div className="relative h-80 w-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <img src={heroImage} alt={trip.destination ?? "Voyage"} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-0 left-0 right-0 px-8 py-6 flex justify-between items-center">
          <Link href="/dashboard/trips">
            <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
              ← Retour à mes voyages
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
        <div className="absolute bottom-0 left-0 right-0 px-8 py-8 space-y-4">
          <div>
            <div className="inline-block px-3 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full text-white text-xs font-semibold mb-3">
              ✨ Confirmé
            </div>
            <h1 className="text-5xl font-bold text-white mb-3">
              {trip.departure_city} → {trip.destination}
            </h1>
            <div className="flex items-center gap-6 text-white/90 mb-4">
              <span>{trip.start_date && trip.end_date ? `${new Date(trip.start_date as string).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} → ${new Date(trip.end_date as string).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}` : "Dates non définies"} • {trip.duration || "?"} jours</span>
            </div>

            {/* Hero Info Cards */}
            <div className="flex gap-6 flex-wrap">
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
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8 overflow-x-auto">
            {tabsData.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-600"
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
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Itinerary */}
          <div className="lg:col-span-2">
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
                        src={dayImages[index % dayImages.length]}
                        alt={day.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-2xl font-bold">{day.title}</h3>
                      </div>
                    </div>

                    {/* Day Number */}
                    <div className="text-lg font-bold text-blue-600 mt-4">
                      Jour {day.day} — {day.day === 1 ? "38 jui" : day.day === 2 ? "29 jui" : day.day === 3 ? "30 jui" : "1 jui"}
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
                    <div className="bg-blue-50 border border-blue-200/30 rounded-lg p-3">
                      <p className="text-sm text-blue-900 font-semibold">Budget estimé: 120 €</p>
                    </div>

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
                <Lightbulb className="w-12 h-12 text-blue-200 mx-auto mb-4" />
                <p className="text-neutral-600">L&apos;itinéraire est en cours de génération...</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 h-64 border border-blue-200/30 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-blue-600">Voir la carte complète</p>
              </div>
            </div>

            {/* Practical Info */}
            <div className="bg-white border border-neutral-200/50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-neutral-900">Informations pratiques</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Langue</p>
                  <p className="font-medium text-neutral-900">Portugais</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Devise</p>
                  <p className="font-medium text-neutral-900">Franc CFA (XOF)</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Décalage horaire</p>
                  <p className="font-medium text-neutral-900">UTC+00</p>
                </div>
              </div>
            </div>

            {/* Budget Summary */}
            <div className="bg-white border border-neutral-200/50 rounded-lg p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Budget récapitulatif</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="60" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle cx="64" cy="64" r="60" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="120 352" />
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
                  <span className="font-semibold text-neutral-900">{trip.budget ? Math.round(trip.budget * 0.4) : "—"}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Activités</span>
                  <span className="font-semibold text-neutral-900">{trip.budget ? Math.round(trip.budget * 0.3) : "—"}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Restauration</span>
                  <span className="font-semibold text-neutral-900">{trip.budget ? Math.round(trip.budget * 0.3) : "—"}€</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
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
