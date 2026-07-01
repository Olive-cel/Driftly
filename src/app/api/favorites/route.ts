import { createClient } from "@/lib/supabase/server";
import { getFavorites, toggleFavorite, removeFavorite } from "@/lib/favorites-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("[Favorites] GET: Unauthorized - no user");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Favorites] GET: userId=${user.id}`);
    const favorites = await getFavorites(user.id);
    console.log(`[Favorites] GET: Found ${favorites.length} favorites`);
    return Response.json({ favorites });
  } catch (err) {
    console.error("[GET /api/favorites] Error:", err);
    return Response.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("[Favorites] POST: Unauthorized - no user");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, item_id, title, destination, country, image_url, metadata } = await req.json();

    console.log(`[Favorites] POST: userId=${user.id}, action=toggle, type=${type}, item_id=${item_id}`);
    console.log(`[Favorites] POST: payload={title, destination, country, image_url, metadata}`);

    if (!type || !item_id || !title || !destination) {
      console.log(`[Favorites] POST: Missing required fields`);
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const isFavorited = await toggleFavorite(
      user.id,
      type as "inspiration" | "trip",
      item_id,
      title,
      destination,
      country,
      image_url,
      metadata
    );

    const action = isFavorited ? "added" : "removed";
    console.log(`[Favorites] POST: ${action} successfully for ${item_id}`);

    return Response.json({
      action: action,
      isFavorite: isFavorited,
    });
  } catch (err) {
    console.error("[POST /api/favorites] Error:", err);
    return Response.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("[Favorites] DELETE: Unauthorized - no user");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, item_id } = await req.json();

    console.log(`[Favorites] DELETE: userId=${user.id}, type=${type}, item_id=${item_id}`);

    if (!type || !item_id) {
      console.log(`[Favorites] DELETE: Missing required fields`);
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await removeFavorite(user.id, item_id, type as "inspiration" | "trip");

    console.log(`[Favorites] DELETE: Removed successfully for ${item_id}`);

    return Response.json({ action: "removed", isFavorite: false });
  } catch (err) {
    console.error("[DELETE /api/favorites] Error:", err);
    return Response.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
