import { createClient } from "@/lib/supabase/server";

async function handler(req: Request) {
  if (req.method === "GET") {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { data: favorites, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return Response.json({ favorites });
    } catch (err) {
      console.error("[Favorites GET]", err);
      return Response.json(
        { error: "Failed to fetch favorites" },
        { status: 500 }
      );
    }
  } else if (req.method === "POST") {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const body = await req.json();
      const { type, item_id, title, destination, country, image_url, metadata } = body;

      if (!type || !item_id || !title || !destination) {
        return Response.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Vérifier si déjà en favori
      const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", type)
        .eq("item_id", item_id)
        .maybeSingle();

      if (existing) {
        // Supprimer s'il existe déjà
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .eq("type", type as any)
          .eq("item_id", item_id);

        return Response.json({ action: "removed", isFavorite: false });
      }

      // Ajouter en favori
      const { error: insertError } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          type,
          item_id,
          title,
          destination,
          country,
          image_url,
          metadata,
        });

      if (insertError) throw insertError;

      return Response.json({ action: "added", isFavorite: true });
    } catch (err) {
      console.error("[Favorites POST]", err);
      return Response.json(
        { error: "Failed to update favorite" },
        { status: 500 }
      );
    }
  } else if (req.method === "DELETE") {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const body = await req.json();
      const { type, item_id } = body;

      if (!type || !item_id) {
        return Response.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq("type", type as any)
        .eq("item_id", item_id);

      if (deleteError) throw deleteError;

      return Response.json({ action: "removed", isFavorite: false });
    } catch (err) {
      console.error("[Favorites DELETE]", err);
      return Response.json(
        { error: "Failed to remove favorite" },
        { status: 500 }
      );
    }
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}

export const POST = handler;
export const GET = handler;
export const DELETE = handler;
