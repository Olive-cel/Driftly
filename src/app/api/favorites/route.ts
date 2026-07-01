import { createClient } from "@/lib/supabase/server";
import { getFavorites, toggleFavorite, removeFavorite } from "@/lib/favorites-service";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await getFavorites(user.id);
    return Response.json({ favorites });
  } catch (err) {
    console.error("[GET /api/favorites]", err);
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
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, item_id, title, destination, country, image_url, metadata } = await req.json();

    if (!type || !item_id || !title || !destination) {
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

    return Response.json({
      action: isFavorited ? "added" : "removed",
      isFavorite: isFavorited,
    });
  } catch (err) {
    console.error("[POST /api/favorites]", err);
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
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, item_id } = await req.json();

    if (!type || !item_id) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await removeFavorite(user.id, item_id, type as "inspiration" | "trip");

    return Response.json({ action: "removed", isFavorite: false });
  } catch (err) {
    console.error("[DELETE /api/favorites]", err);
    return Response.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
