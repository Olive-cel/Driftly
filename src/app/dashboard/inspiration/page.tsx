"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { InspirationCard } from "@/components/dashboard/inspiration-card";
import {
  filterInspirationsForProfile,
  InspirationDestination,
} from "@/lib/travel/inspirations";
import { Loader2, Sparkles } from "lucide-react";

export default function InspirationPage() {
  const router = useRouter();
  const supabase = createClient();

  const [inspirations, setInspirations] = useState<InspirationDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Load profile for personalization
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Get inspirations filtered by profile
      const budgetPref = profileData?.budget_preference ? String(profileData.budget_preference) : null;
      const insps = filterInspirationsForProfile(
        profileData?.travel_style,
        budgetPref
      );
      setInspirations(insps);

      // Load user's favorites (inspiration type only)
      const { data: userFavorites } = await supabase
        .from("favorites")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("type", "inspiration");

      if (userFavorites) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFavorites(new Set(userFavorites.map((f: any) => f.item_id)));
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrip = (destination: string) => {
    router.push(`/dashboard/trips/new?destination=${encodeURIComponent(destination)}`);
  };

  const handleToggleFavorite = (inspirationId: string, isFavorite: boolean) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (isFavorite) {
        newSet.add(inspirationId);
      } else {
        newSet.delete(inspirationId);
      }
      return newSet;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleImageError = (e: any) => {
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3EImage indisponible%3C/text%3E%3C/svg%3E";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-neutral-900 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-amber-500" />
              Inspirations de voyage
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Découvrez des destinations magiques recommandées selon vos préférences.
              Cliquez sur le cœur pour ajouter aux favoris.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : inspirations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inspirations.map((inspiration) => (
                <InspirationCard
                  key={inspiration.id}
                  id={inspiration.id}
                  destination={inspiration.destination}
                  country={inspiration.country}
                  description={inspiration.description}
                  estimatedPrice={inspiration.estimatedPrice}
                  travelStyle={inspiration.travelStyle}
                  imageUrl={`https://images.pexels.com/search/${encodeURIComponent(
                    inspiration.imageQuery
                  )}?auto=compress&cs=tinysrgb&w=400&h=300`}
                  isFavorite={favorites.has(inspiration.id)}
                  onToggleFavorite={(isFavorite) =>
                    handleToggleFavorite(inspiration.id, isFavorite)
                  }
                  onCreateTrip={() => handleCreateTrip(inspiration.destination)}
                  onImageError={handleImageError}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-lg font-medium text-neutral-900">
                Aucune inspiration disponible
              </p>
              <p className="text-neutral-600 mt-2">
                Vérifiez vos paramètres de voyage et réessayez.
              </p>
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-center text-white space-y-4">
            <h2 className="text-2xl font-bold">Prêt à voyager?</h2>
            <p className="text-amber-50">
              Ajoutez vos destinations préférées aux favoris ou créez un voyage dès maintenant.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/dashboard">
                <button className="bg-white text-amber-600 hover:bg-amber-50 font-semibold px-6 py-2 rounded-lg transition-all">
                  Tableau de bord
                </button>
              </Link>
              <Link href="/dashboard/favorites">
                <button className="border-2 border-white text-white hover:bg-white/10 font-semibold px-6 py-2 rounded-lg transition-all">
                  Mes favoris
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
