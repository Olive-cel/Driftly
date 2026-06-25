"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";
import { getDestinationImageSmall } from "@/lib/travel/destination-images";
import { getPersonalizedRecommendations, getAllRecommendations } from "@/lib/travel/recommendations";
import type { Recommendation } from "@/lib/travel/recommendations";
import {
  Plus,
  Zap,
  Upload,
  Heart,
  ChevronRight,
  MapPin,
  Calendar,
  TrendingUp,
  Sparkles,
} from "lucide-react";

type Trip = Database["public"]["Tables"]["trips"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"] | null;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function TripsListPremium() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [profile, setProfile] = useState<Profile>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trips
        const tripsResponse = await fetch("/api/trips");
        if (tripsResponse.ok) {
          const tripsData = await tripsResponse.json();
          setTrips(tripsData.trips || []);
        }

        // Fetch profile for personalization
        const profileResponse = await fetch("/api/profiles");
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData.profile || null);
          
          // Get personalized recommendations or fallback to all
          const tripsForRecs = await (await fetch("/api/trips")).json();
          const profileForRecs = profileData.profile;
          
          // Try to get personalized recommendations
          let recs = getPersonalizedRecommendations(profileForRecs, tripsForRecs.trips || []);
          
          // If no personalized recommendations, use all recommendations
          if (recs.length === 0) {
            recs = getAllRecommendations().slice(0, 8);
          }
          
          setRecommendations(recs);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
  const totalDays = trips.reduce((sum, trip) => sum + (trip.duration || 0), 0);

  // Calculate progress based on trip status
  const getProgressPercentage = (status: string | null) => {
    switch (status) {
      case "draft":
        return 40;
      case "generated":
        return 80;
      case "confirmed":
        return 100;
      default:
        return 60;
    }
  };

  const stats = [
    { label: "Voyages", value: trips.length, icon: MapPin, change: "+1 ce mois-ci" },
    { label: "Jours de voyage", value: totalDays, icon: Calendar, change: "+8 ce mois-ci" },
    { label: "Budget total", value: `${totalBudget} €`, icon: TrendingUp, change: "+12% vs mois dernier" },
  ];

  const quickActions = [
    { label: "Créer un voyage", icon: Plus, href: "/dashboard/trips/new", color: "bg-blue-600" },
    { label: "Générer avec l'IA", icon: Zap, href: "/dashboard/trips/new", color: "bg-purple-600" },
    { label: "Importer une information", icon: Upload, href: "#", color: "bg-orange-600" },
    { label: "Voir mes favoris", icon: Heart, href: "#", color: "bg-red-600" },
  ];

  return (
    <motion.div
      className="ml-64 min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <motion.div
        className="relative h-96 bg-gradient-to-br from-blue-600 to-purple-600 overflow-hidden"
        variants={itemVariants}
        initial="hidden"
        animate="show"
      >
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&h=600&fit=crop"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/70" />

        {/* Balloons decoration */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-20 rounded-full border-4 border-white/20"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 5}%`,
                opacity: 0.4,
              }}
              animate={{ y: [-20, 20, -20] }}
              transition={{ duration: 4 + i, repeat: Infinity }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between px-8 py-8">
          <div>
            <p className="text-blue-100 mb-2">Bonjour 👋</p>
            <h1 className="text-5xl font-bold text-white mb-2">Votre prochaine aventure commence ici</h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Planifiez, organisez et vivez des voyages inoubliables avec l'aide de l'IA générative.
            </p>
          </div>

          <motion.div
            className="flex items-center gap-6"
            variants={itemVariants}
            initial="hidden"
            animate="show"
          >
            <Link href="/dashboard/trips/new">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold flex gap-2 items-center">
                <Sparkles className="w-5 h-5" />
                Créer un nouveau voyage
              </Button>
            </Link>
            <div className="flex gap-4 text-white">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Bali, Indonésie</span>
              </div>
              <div className="flex items-center gap-2">
                <span>☀️ 28°C</span>
              </div>
              <span>Ensoleillé</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Aperçu Section */}
          <motion.section
            className="mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Aperçu</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-neutral-200/50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-neutral-600 mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <stat.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">{stat.change}</p>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full ${action.color} text-white rounded-lg p-4 font-semibold flex gap-2 items-center justify-center hover:shadow-lg transition-all`}
                  >
                    <action.icon className="w-5 h-5" />
                    {action.label}
                  </motion.button>
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Mes Voyages */}
          {trips.length > 0 && (
            <motion.section
              className="mb-12"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Mes voyages</h2>
                <Link href="/dashboard/trips" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold">
                  Voir tous mes voyages <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trips.slice(0, 4).map((trip) => {
                  const progress = getProgressPercentage(trip.status);
                  return (
                    <Link key={trip.id} href={`/dashboard/trips/${trip.id}`}>
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -8 }}
                        className="bg-white border border-neutral-200/50 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer h-full flex flex-col"
                      >
                        <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                        <img
                          src={getDestinationImageSmall(trip.destination ?? "voyage")}
                          alt={trip.destination ?? "Voyage"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://source.unsplash.com/400x300/?travel";
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {trip.status || "draft"}
                          </div>
                        </div>
                        <div className="p-4 flex-1">
                          <h3 className="font-bold text-neutral-900 mb-2">
                            {trip.departure_city} → {trip.destination}
                          </h3>
                          <div className="space-y-1 text-sm text-neutral-600 mb-4">
                            {trip.start_date && trip.end_date && (
                              <p>📅 {new Date(trip.start_date as string).toLocaleDateString("fr-FR")} - {new Date(trip.end_date as string).toLocaleDateString("fr-FR")}</p>
                            )}
                            {trip.duration && <p>⏱️ {trip.duration} jours</p>}
                            {trip.travelers_count && <p>👥 {trip.travelers_count} voyageur(s)</p>}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <p className="text-xs text-neutral-500">{progress}% de progression</p>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Inspiration Pour Vous */}
          {recommendations.length > 0 && (
            <motion.section
              className="mb-12"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Inspiration pour vous</h2>
                <Link href="#" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold">
                  Voir plus de destinations <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.slice(0, 4).map((rec) => (
                  <motion.div
                    key={rec.destination}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white border border-neutral-200/50 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="relative h-48">
                      <img
                        src={rec.imageUrl}
                        alt={rec.destination}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "https://source.unsplash.com/400x300/?travel,landscape";
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-white/80 hover:bg-white p-2 rounded-full transition-all"
                        >
                          <Heart className="w-5 h-5 text-red-500" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-neutral-900 mb-1">{rec.destination}</h3>
                      <p className="text-sm text-neutral-600 mb-3">{rec.country}</p>
                      <p className="text-sm font-semibold text-neutral-900 mb-2">{rec.priceFrom}€</p>
                      <p className="text-xs text-neutral-500 mb-3 italic">{rec.reason}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="font-semibold text-sm">{rec.rating}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* CTA Section */}
          <motion.section
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-12 text-white text-center"
            variants={itemVariants}
            initial="hidden"
            animate="show"
          >
            <h2 className="text-3xl font-bold mb-3">Besoin d'aide pour votre prochain voyage ?</h2>
            <p className="mb-6 max-w-2xl mx-auto text-white/90">
              Notre assistant IA vous aidera à organiser et planifier le voyage parfait selon vos envies, votre budget et votre style de voyage.
            </p>
            <Button className="bg-white text-purple-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold">
              Lancer l'assistant IA →
            </Button>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
