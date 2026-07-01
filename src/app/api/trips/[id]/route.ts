import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type TripsUpdate = Database["public"]["Tables"]["trips"]["Update"];

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const tripId = params.id;

    // Vérifier que l'utilisateur est connecté
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer le voyage (vérifier que user_id correspond)
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      }
      console.error("[API] GET /api/trips/[id] error:", error);
      return NextResponse.json(
        { error: "Failed to fetch trip" },
        { status: 500 }
      );
    }

    return NextResponse.json({ trip: data }, { status: 200 });
  } catch (err) {
    console.error("[API] GET /api/trips/[id] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const tripId = params.id;

    // Vérifier que l'utilisateur est connecté
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier que le voyage appartient à l'utilisateur
    const { data: existingTrip, error: fetchError } = await supabase
      .from("trips")
      .select("id")
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Parser le body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Construire l'objet de mise à jour (uniquement les champs autorisés)
    const updateData: TripsUpdate = {};

    if (body.departure_city !== undefined) {
      updateData.departure_city =
        typeof body.departure_city === "string" ? body.departure_city : null;
    }

    if (body.destination !== undefined) {
      updateData.destination =
        typeof body.destination === "string" ? body.destination : null;
    }

    if (body.start_date !== undefined) {
      updateData.start_date =
        typeof body.start_date === "string"
          ? body.start_date.split("T")[0]
          : null;
    }

    if (body.end_date !== undefined) {
      updateData.end_date =
        typeof body.end_date === "string"
          ? body.end_date.split("T")[0]
          : null;
    }

    if (body.duration !== undefined) {
      updateData.duration =
        typeof body.duration === "number" && body.duration > 0
          ? body.duration
          : null;
    }

    if (body.travelers_count !== undefined) {
      updateData.travelers_count =
        typeof body.travelers_count === "number" &&
        body.travelers_count > 0
          ? body.travelers_count
          : null;
    }

    if (body.budget !== undefined) {
      updateData.budget =
        typeof body.budget === "number" && body.budget > 0
          ? body.budget
          : null;
    }

    if (body.travel_style !== undefined) {
      updateData.travel_style =
        typeof body.travel_style === "string" ? body.travel_style : null;
    }

    if (body.interests !== undefined) {
      updateData.interests = Array.isArray(body.interests)
        ? body.interests
        : null;
    }

    if (body.status !== undefined) {
      const validStatuses = [
        "draft",
        "planning",
        "booked",
        "ongoing",
        "completed",
        "cancelled",
      ];
      if (validStatuses.includes(body.status as string)) {
        updateData.status = body.status as
          | "draft"
          | "planning"
          | "booked"
          | "ongoing"
          | "completed"
          | "cancelled";
      }
    }

    // Mettre à jour le voyage
    const { data, error } = await supabase
      .from("trips")
      .update(updateData)
      .eq("id", tripId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[API] PUT /api/trips/[id] error:", error);
      return NextResponse.json(
        { error: "Failed to update trip" },
        { status: 500 }
      );
    }

    return NextResponse.json({ trip: data }, { status: 200 });
  } catch (err) {
    console.error("[API] PUT /api/trips/[id] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const tripId = params.id;

    // Vérifier que l'utilisateur est connecté
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier que le voyage appartient à l'utilisateur
    const { data: existingTrip, error: fetchError } = await supabase
      .from("trips")
      .select("id")
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Supprimer le voyage
    const { error: deleteError } = await supabase
      .from("trips")
      .delete()
      .eq("id", tripId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("[API] DELETE /api/trips/[id] error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete trip" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Trip deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[API] DELETE /api/trips/[id] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
