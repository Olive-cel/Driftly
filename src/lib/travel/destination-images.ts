/**
 * Destination Images Helper
 * Maps popular destinations to high-quality travel images
 * 
 * TODO: In the future, this can be replaced with:
 * - Unsplash API (requires API key)
 * - Pexels API
 * - Pixabay API
 * - Custom image service
 */

type DestinationImageMap = Record<string, string>;

const destinationImages: DestinationImageMap = {
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop",
  "Rome": "https://images.unsplash.com/photo-1552832230-636bacbc468c?w=1200&h=800&fit=crop",
  "Bali": "https://images.unsplash.com/photo-1537225228614-b19254ca192d?w=1200&h=800&fit=crop",
  "Tokyo": "https://images.unsplash.com/photo-1540959375944-7049f642e9a4?w=1200&h=800&fit=crop",
  "Cotonou": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=800&fit=crop",
  "Londres": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop",
  "Barcelone": "https://images.unsplash.com/photo-1583422409516-2895a77f3df8?w=1200&h=800&fit=crop",
  "Lisbonne": "https://images.unsplash.com/photo-1509899551159-88520bf31f65?w=1200&h=800&fit=crop",
  "Santorin": "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1200&h=800&fit=crop",
  "Kyoto": "https://images.unsplash.com/photo-1522383150241-6c85675dcf26?w=1200&h=800&fit=crop",
  "Marrakech": "https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=1200&h=800&fit=crop",
  "Amsterdam": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop",
  "Prague": "https://images.unsplash.com/photo-1508050108904-a89dd64c0bed?w=1200&h=800&fit=crop",
  "Dubaï": "https://images.unsplash.com/photo-1512453475868-a34144be6740?w=1200&h=800&fit=crop",
};

/**
 * Get a destination image URL
 * Returns a curated image for known destinations,
 * or generates a dynamic Unsplash Source URL for unknown ones
 */
export function getDestinationImage(destination: string): string {
  if (!destination) {
    return "https://source.unsplash.com/1200x800/?travel,landscape";
  }

  // Check exact match
  if (destinationImages[destination]) {
    return destinationImages[destination];
  }

  // Check case-insensitive match
  const lowerDestination = destination.toLowerCase();
  for (const [key, url] of Object.entries(destinationImages)) {
    if (key.toLowerCase() === lowerDestination) {
      return url;
    }
  }

  // Check if destination is part of a larger string (e.g., "Rome, Italy")
  const mainDestination = destination.split(",")[0].trim();
  for (const [key, url] of Object.entries(destinationImages)) {
    if (key.toLowerCase() === mainDestination.toLowerCase()) {
      return url;
    }
  }

  // Fallback: Generate dynamic URL with Unsplash Source
  // This creates a random travel image based on the destination
  const encodedDestination = encodeURIComponent(destination);
  return `https://source.unsplash.com/1200x800/?travel,${encodedDestination}`;
}

/**
 * Get a small destination image URL (for cards)
 */
export function getDestinationImageSmall(destination: string): string {
  const fullUrl = getDestinationImage(destination);
  // Replace size in URL if it's an unsplash.com URL
  if (fullUrl.includes("unsplash.com")) {
    return fullUrl.replace("w=1200&h=800", "w=400&h=300");
  }
  return fullUrl;
}

/**
 * List of all supported destinations for reference
 */
export const SUPPORTED_DESTINATIONS = Object.keys(destinationImages);
