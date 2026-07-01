"use client";

import { useState } from "react";
import { Heart, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InspirationCardProps {
  id: string;
  destination: string;
  country: string;
  description: string;
  estimatedPrice: number;
  travelStyle: string;
  imageUrl: string;
  isFavorite?: boolean;
  onToggleFavorite?: (isFavorite: boolean) => void;
  onCreateTrip?: () => void;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function InspirationCard({
  id,
  destination,
  country,
  description,
  estimatedPrice,
  travelStyle,
  imageUrl,
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
          item_id: id,
          title: destination,
          destination,
          country,
          image_url: imageUrl,
          metadata: { travelStyle, estimatedPrice },
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
          src={imageUrl}
          alt={destination}
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
              localIsFavorite
                ? "text-red-500 fill-red-500"
                : "text-gray-400"
            }`}
          />
        </button>

        {/* Style Badge */}
        <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {travelStyle}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">{destination}</h3>
          <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {country}
          </p>
          <p className="text-sm text-neutral-600 mt-2">{description}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 mt-auto">
          <div className="flex items-center gap-2 text-amber-600 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>~{estimatedPrice}€/j</span>
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
