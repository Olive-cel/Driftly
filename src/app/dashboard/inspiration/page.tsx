"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  DollarSign,
  Sparkles,
} from "lucide-react";

interface Inspiration {
  destination: string;
  description: string;
  budget_range: string;
  estimated_price: number;
  image_url?: string;
  tags: string[];
}

export default function InspirationPage() {
  const router = useRouter();
  const supabase = createClient();

  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      // Generate inspirations based on profile
      const insps = generateInspirations(profileData);
      setInspirations(insps);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateInspirations = (profile: unknown | any): Inspiration[] => {
    const destinations = [
      {
        destination: "Marrakech",
        description: "Découvrez les marchés colorés et les palais anciens du Maroc",
        budget_range: "budget",
        estimated_price: 45,
        tags: ["culture", "shopping", "histoire"],
      },
      {
        destination: "Bali",
        description: "Plages paradisiaques, temples mystiques et rizières vertes",
        budget_range: "budget",
        estimated_price: 40,
        tags: ["plage", "relaxation", "spirituel"],
      },
      {
        destination: "Tokyo",
        description: "Mégalopole moderne mêlant tradition et futurisme",
        budget_range: "moderate",
        estimated_price: 80,
        tags: ["culture", "aventure", "gastronomie"],
      },
      {
        destination: "Lisbonne",
        description: "Capitale charmante avec azulejos, miradouros et gastronomie",
        budget_range: "moderate",
        estimated_price: 55,
        tags: ["culture", "architecture", "gastronomie"],
      },
      {
        destination: "Andalousie",
        description: "Granada, Séville et la magie de l'Espagne du Sud",
        budget_range: "moderate",
        estimated_price: 60,
        tags: ["culture", "architecture", "histoire"],
      },
      {
        destination: "Thaïlande",
        description: "Temples, plages et jungle tropicale",
        budget_range: "budget",
        estimated_price: 35,
        tags: ["plage", "culture", "aventure"],
      },
      {
        destination: "Islande",
        description: "Aurores boréales, chutes d'eau et paysages dramatiques",
        budget_range: "luxury",
        estimated_price: 150,
        tags: ["nature", "aventure", "photographie"],
      },
      {
        destination: "Costa Rica",
        description: "Jungle, volcans et plages sur deux océans",
        budget_range: "comfortable",
        estimated_price: 85,
        tags: ["nature", "aventure", "plage"],
      },
    ];

    // Filter by profile preferences if available
    if (profile?.travel_style || profile?.budget_preference) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const budgetMap: any = {
        budget: ["budget"],
        moderate: ["budget", "moderate"],
        comfortable: ["moderate", "comfortable"],
        luxury: ["comfortable", "luxury"],
      };

      return destinations
        .filter(
          (d) =>
            !profile.budget_preference ||
            budgetMap[profile.budget_preference]?.includes(d.budget_range)
        )
        .slice(0, 6);
    }

    return destinations.slice(0, 6);
  };

  const handleCreateTrip = (destination: string) => {
    router.push(`/dashboard/trips/new?destination=${encodeURIComponent(destination)}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleImageError = (e: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            <p className="text-lg text-neutral-600">
              Découvrez des destinations magiques et créez votre prochain voyage
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inspirations.map((inspiration) => (
                <div
                  key={inspiration.destination}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300">
                    <img
                      src={`https://images.pexels.com/search/${encodeURIComponent(inspiration.destination)}?auto=compress&cs=tinysrgb&w=400&h=300`}
                      alt={inspiration.destination}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-900">
                        {inspiration.destination}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-2">
                        {inspiration.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {inspiration.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200 mt-auto">
                      <div className="flex items-center gap-2 text-amber-600 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span>~{inspiration.estimated_price}€/jour</span>
                      </div>
                      <Button
                        onClick={() => handleCreateTrip(inspiration.destination)}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-lg text-white font-semibold px-4 py-2 rounded-lg transition-all"
                      >
                        Créer voyage
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-center text-white space-y-4">
            <h2 className="text-2xl font-bold">Prêt à voyager?</h2>
            <p className="text-amber-50">
              Cliquez sur une destination pour commencer à planifier votre prochain voyage.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" className="bg-white text-amber-600 hover:bg-amber-50">
                  Retour au tableau de bord
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
