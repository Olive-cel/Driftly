"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { InspirationCard } from "@/components/dashboard/inspiration-card";
import { Loader2, Heart, ArrowRight } from "lucide-react";

interface Favorite {
  id: string;
  type: "trip" | "inspiration";
  item_id: string;
  title: string;
  destination: string;
  country: string | null;
  image_url: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
}

export default function FavoritesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
    
    // Reload favorites when the window regains focus
    const handleFocus = () => {
      console.log("[Favorites Page] Window focus - reloading favorites");
      loadFavorites();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFavorites = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: userFavorites, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching favorites:", error);
        return;
      }

      setFavorites(userFavorites || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      await supabase.from("favorites").delete().eq("id", favoriteId);

      // Remove from local state
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  const handleCreateTrip = (destination: string) => {
    router.push(`/dashboard/trips/new?destination=${encodeURIComponent(destination)}`);
  };

  const inspirationFavorites = favorites.filter((f) => f.type === "inspiration");
  const tripFavorites = favorites.filter((f) => f.type === "trip");

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 py-12 px-4">
      <div className="w-full">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-neutral-900 flex items-center justify-center gap-2">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              Mes favoris
            </h1>
            <p className="text-lg text-neutral-600">
              Destinations et voyages que vous avez ajoutés à vos favoris
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center space-y-6">
              <div className="flex justify-center">
                <Heart className="w-16 h-16 text-neutral-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Vous n&apos;avez encore aucun favori
                </h2>
                <p className="text-neutral-600 mt-2">
                  Ajoutez des destinations depuis la page Inspiration pour les retrouver ici.
                </p>
              </div>
              <Link href="/dashboard/inspiration">
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-lg text-white font-semibold px-8 py-3 rounded-lg transition-all">
                  Découvrir les inspirations
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Inspirations Favorites */}
              {inspirationFavorites.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    Destinations favorites ({inspirationFavorites.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inspirationFavorites.map((fav) => (
                      <div key={fav.id} className="relative">
                        <InspirationCard
                          inspiration={{
                            id: fav.item_id,
                            destination: fav.destination,
                            country: fav.country || "",
                            title: fav.title || fav.destination,
                            description: fav.metadata?.description || "",
                            estimatedPrice: fav.metadata?.estimatedPrice || 0,
                            travelStyle: fav.metadata?.travelStyle || "budget",
                            imageQuery: fav.destination,
                            tags: fav.metadata?.tags || [],
                            rating: fav.metadata?.rating,
                          }}
                          isFavorite={true}
                          onToggleFavorite={(isFavorite) => {
                            if (!isFavorite) {
                              handleRemoveFavorite(fav.id);
                            }
                          }}
                          onCreateTrip={() => handleCreateTrip(fav.destination)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trip Favorites */}
              {tripFavorites.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    Voyages favoris ({tripFavorites.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tripFavorites.map((fav) => (
                      <div
                        key={fav.id}
                        className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-bold text-neutral-900">{fav.title}</h3>
                          <p className="text-sm text-neutral-600">{fav.destination}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFavorite(fav.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Heart className="w-5 h-5 fill-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CTA Section */}
          {favorites.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-center text-white space-y-4">
              <h2 className="text-2xl font-bold">Êtes-vous prêt à voyager?</h2>
              <p className="text-amber-50">
                Créez un voyage depuis une de vos inspirations favorites.
              </p>
              <Link href="/dashboard/inspiration">
                <button className="inline-flex items-center gap-2 bg-white text-amber-600 hover:bg-amber-50 font-semibold px-8 py-3 rounded-lg transition-all">
                  Vers les inspirations
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <button className="text-amber-600 hover:text-amber-700 font-semibold">
                ← Retour au tableau de bord
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
