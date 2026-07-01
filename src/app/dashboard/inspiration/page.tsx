"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { InspirationCard } from "@/components/dashboard/inspiration-card";
import type { Inspiration } from "@/lib/inspirations-service";
import { Loader2, Sparkles, ArrowRight, RotateCw } from "lucide-react";

export default function InspirationPage() {
  const router = useRouter();
  const supabase = createClient();

  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Call API to fetch enriched inspirations
      const response = await fetch("/api/inspirations");

      if (!response.ok) {
        throw new Error("Failed to fetch inspirations");
      }

      const data = await response.json();
      setInspirations(data.inspirations || []);

      // Load user's favorite inspiration IDs
      const { data: userFavorites } = await supabase
        .from("favorites")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("type", "inspiration");

      if (userFavorites) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFavoriteIds(new Set(userFavorites.map((f: any) => f.item_id)));
      }
    } catch (err) {
      console.error("Error loading inspiration data:", err);
      setError("Une erreur est survenue lors du chargement des inspirations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleCreateTrip = (destination: string, country: string, style: string) => {
    const params = new URLSearchParams({
      destination,
      country,
      travel_style: style,
    });
    router.push(`/dashboard/trips/new?${params.toString()}`);
  };

  const handleToggleFavorite = (inspirationId: string, isFavorite: boolean) => {
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (isFavorite) {
        newSet.add(inspirationId);
      } else {
        newSet.delete(inspirationId);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 py-12 px-6">
      <div className="w-full">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-neutral-900 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-amber-500" />
              Inspirations de voyage
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Découvrez des destinations magiques personnalisées selon vos préférences.
            </p>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
              <p className="text-lg font-medium text-red-900">{error}</p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Réessayer
              </button>
            </div>
          ) : inspirations.length > 0 ? (
            <>
              {/* Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {inspirations.map((inspiration) => (
                  <InspirationCard
                    key={inspiration.id}
                    inspiration={inspiration}
                    isFavorite={favoriteIds.has(inspiration.id)}
                    onToggleFavorite={(isFavorite) =>
                      handleToggleFavorite(inspiration.id, isFavorite)
                    }
                    onCreateTrip={() =>
                      handleCreateTrip(
                        inspiration.destination,
                        inspiration.country,
                        inspiration.travelStyle
                      )
                    }
                  />
                ))}
              </div>

              {/* Refresh Button */}
              <div className="text-center mt-8">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-2 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Rafraîchir les inspirations
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center space-y-4">
              <p className="text-lg font-medium text-neutral-900">
                Aucune inspiration disponible
              </p>
              <p className="text-neutral-600">
                Vérifiez vos paramètres de voyage et réessayez.
              </p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Rafraîchir
              </button>
            </div>
          )}

          {/* CTA Section */}
          {inspirations.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-center text-white space-y-4">
              <h2 className="text-2xl font-bold">Prêt à voyager?</h2>
              <p className="text-amber-50">
                Marquez vos destinations préférées en favori et créez des voyages inoubliables.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/dashboard">
                  <button className="inline-flex items-center gap-2 bg-white text-amber-600 hover:bg-amber-50 font-semibold px-6 py-3 rounded-lg transition-all">
                    Tableau de bord
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/dashboard/favorites">
                  <button className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-lg transition-all">
                    Mes favoris
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
