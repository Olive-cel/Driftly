/**
 * Favorites Service
 * Handle persistence and retrieval of user favorites (inspirations and trips)
 */

import type { Database } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

type FavoriteRow = Database["public"]["Tables"]["favorites"]["Row"];

export interface Favorite {
  id: string;
  user_id: string;
  type: "inspiration" | "trip";
  item_id: string;
  title: string;
  destination: string;
  country: string | null;
  image_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Get all favorites for a user
 */
export async function getFavorites(userId: string): Promise<Favorite[]> {
  const supabase = createClient();

  console.log(`[Favorites Service] getFavorites: userId=${userId}`);

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`[Favorites Service] getFavorites error:`, error);
    return [];
  }

  const count = (data || []).length;
  console.log(`[Favorites Service] getFavorites: Found ${count} favorites`);

  return (data || []) as Favorite[];
}

/**
 * Get favorites of a specific type
 */
export async function getFavoritesByType(
  userId: string,
  type: "inspiration" | "trip"
): Promise<Favorite[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getFavoritesByType]", error);
    return [];
  }

  return (data || []) as Favorite[];
}

/**
 * Check if an item is favorited
 */
export async function isFavorite(
  userId: string,
  itemId: string,
  type: "inspiration" | "trip"
): Promise<boolean> {
  const supabase = createClient();

  console.log(`[Favorites Service] isFavorite: userId=${userId}, itemId=${itemId}, type=${type}`);

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .eq("type", type)
    .maybeSingle();

  if (error) {
    console.error(`[Favorites Service] isFavorite error:`, error);
    return false;
  }

  const result = !!data;
  console.log(`[Favorites Service] isFavorite: result=${result}`);

  return result;
}

/**
 * Add or toggle favorite
 * Returns true if added, false if removed
 */
export async function toggleFavorite(
  userId: string,
  type: "inspiration" | "trip",
  itemId: string,
  title: string,
  destination: string,
  country?: string | null,
  imageUrl?: string | null,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  const supabase = createClient();

  console.log(`[Favorites Service] toggleFavorite: userId=${userId}, type=${type}, itemId=${itemId}`);

  // Check if already favorited
  const alreadyFavorite = await isFavorite(userId, itemId, type);

  if (alreadyFavorite) {
    // Remove favorite
    console.log(`[Favorites Service] toggleFavorite: Removing favorite`);
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .eq("type", type);

    if (error) {
      console.error(`[Favorites Service] toggleFavorite delete error:`, error);
      throw error;
    }

    console.log(`[Favorites Service] toggleFavorite: Removed successfully`);
    return false;
  } else {
    // Add favorite
    console.log(`[Favorites Service] toggleFavorite: Adding favorite with payload:`, {
      title,
      destination,
      country,
      image_url: imageUrl,
    });

    const { error } = await supabase.from("favorites").insert({
      user_id: userId,
      type,
      item_id: itemId,
      title,
      destination,
      country: country || null,
      image_url: imageUrl || null,
      metadata: metadata || {},
    } as FavoriteRow);

    if (error) {
      console.error(`[Favorites Service] toggleFavorite insert error:`, error);
      throw error;
    }

    console.log(`[Favorites Service] toggleFavorite: Added successfully`);
    return true;
  }
}

/**
 * Remove favorite
 */
export async function removeFavorite(
  userId: string,
  itemId: string,
  type: "inspiration" | "trip"
): Promise<void> {
  const supabase = createClient();

  console.log(`[Favorites Service] removeFavorite: userId=${userId}, itemId=${itemId}, type=${type}`);

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .eq("type", type);

  if (error) {
    console.error(`[Favorites Service] removeFavorite error:`, error);
    throw error;
  }

  console.log(`[Favorites Service] removeFavorite: Removed successfully`);
}
