"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Inspiration } from "@/lib/inspirations-service";

interface InspirationCardProps {
  inspiration: Inspiration;
  isFavorite?: boolean;
  onToggleFavorite?: (isFavorite: boolean) => void;
  onCreateTrip?: () => void;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function InspirationCard({
  inspiration,
  isFavorite = false,
  onToggleFavorite,
  onCreateTrip,
  onImageError,
}: InspirationCardProps) {
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsTogglingFavorite(true);

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "inspiration",
          item_id: inspiration.id,
          title: inspiration.destination,
          destination: inspiration.destination,
          country: inspiration.country,
          image_url: `https://images.pexels.com/search/${encodeURIComponent(inspiration.imageQuery)}?auto=compress&cs=tinysrgb&w=400&h=300`,
          metadata: {
            travelStyle: inspiration.travelStyle,
            estimatedPrice: inspiration.estimatedPrice,
            rating: inspiration.rating,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newState = data.isFavorite;
        setLocalIsFavorite(newState);
        onToggleFavorite?.(newState);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300">
        <img
          src={`https://images.pexels.com/search/${encodeURIComponent(inspiration.imageQuery)}?auto=compress&cs=tinysrgb&w=400&h=300`}
          alt={inspiration.destination}
          onError={onImageError}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 transition-all shadow-lg"
          aria-label={localIsFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              localIsFavorite ? "text-red-500 fill-red-500" : "text-gray-400"
            }`}
          />
        </button>

        {/* Style Badge */}
        <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {inspiration.travelStyle}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">{inspiration.destination}</h3>
          <p className="text-sm text-neutral-500 mt-1">{inspiration.country}</p>
          <p className="text-sm text-neutral-600 mt-2">{inspiration.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {inspiration.tags?.slice(0, 2).map((tag) => (
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
          <div className="flex flex-col gap-1">
            <span className="text-sm text-amber-600 font-semibold">
              ~{inspiration.estimatedPrice}€/jour
            </span>
            {inspiration.rating && (
              <span className="text-xs text-neutral-500">⭐ {inspiration.rating}</span>
            )}
          </div>
          <Button
            onClick={onCreateTrip}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-lg text-white font-semibold px-4 py-2 rounded-lg transition-all"
          >
            Créer voyage
          </Button>
        </div>
      </div>
    </div>
  );
}
