"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import type { Inspiration } from "@/lib/inspirations-service";

interface InspirationCardProps {
  inspiration: Inspiration;
  isFavorite?: boolean;
  onToggleFavorite?: (isFavorite: boolean) => void;
  onCreateTrip?: () => void;
}

export function InspirationCard({
  inspiration,
  isFavorite = false,
  onToggleFavorite,
  onCreateTrip,
}: InspirationCardProps) {
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

  const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f5a962' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3E${encodeURIComponent(inspiration.destination)}%3C/text%3E%3C/svg%3E`;

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
          image_url: inspiration.imageUrl || "",
          metadata: {
            travelStyle: inspiration.travelStyle,
            estimatedPrice: inspiration.estimatedPrice,
            rating: inspiration.rating,
            interests: inspiration.interests,
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
    <div className="group h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300">
      {/* Image Section - Clickable */}
      <button
        onClick={onCreateTrip}
        className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300 hover:opacity-90 transition-opacity flex-shrink-0"
      >
        <img
          src={inspiration.imageUrl || fallbackSvg}
          alt={inspiration.destination}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 transition-all shadow-lg disabled:opacity-50"
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
      </button>

      {/* Content Section */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-bold text-neutral-900 line-clamp-1">
            {inspiration.title || inspiration.destination}
          </h3>
          <p className="text-sm text-neutral-500 mt-1">{inspiration.country}</p>
          <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
            {inspiration.description}
          </p>
        </div>

        {/* Tags */}
        {inspiration.tags && inspiration.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {inspiration.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

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
          <button
            onClick={onCreateTrip}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-lg text-white font-semibold px-4 py-2 rounded-lg transition-all whitespace-nowrap"
          >
            Créer voyage
          </button>
        </div>
      </div>
    </div>
  );
}
