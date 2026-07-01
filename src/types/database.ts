export type TripStatus = "draft" | "planning" | "booked" | "ongoing" | "completed" | "cancelled";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          firstname: string | null;
          lastname: string | null;
          email: string | null;
          budget_preference: number | null;
          travel_style: string | null;
          interests: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          firstname?: string | null;
          lastname?: string | null;
          email?: string | null;
          budget_preference?: number | null;
          travel_style?: string | null;
          interests?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          firstname?: string | null;
          lastname?: string | null;
          email?: string | null;
          budget_preference?: number | null;
          travel_style?: string | null;
          interests?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          departure_city: string | null;
          destination: string | null;
          start_date: string | null;
          end_date: string | null;
          duration: number | null;
          travelers_count: number | null;
          budget: number | null;
          travel_style: string | null;
          interests: Json;
          cover_image: string | null;
          status: TripStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          departure_city?: string | null;
          destination?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          duration?: number | null;
          travelers_count?: number | null;
          budget?: number | null;
          travel_style?: string | null;
          interests?: Json;
          cover_image?: string | null;
          status?: TripStatus;
        };
        Update: {
          departure_city?: string | null;
          destination?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          duration?: number | null;
          travelers_count?: number | null;
          budget?: number | null;
          travel_style?: string | null;
          interests?: Json;
          cover_image?: string | null;
          status?: TripStatus;
        };
        Relationships: [];
      };
      itineraries: {
        Row: {
          id: string;
          trip_id: string;
          generated_content: Json;
          estimated_budget: number | null;
          ai_model: string | null;
          prompt_version: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          generated_content: Json;
          estimated_budget?: number | null;
          ai_model?: string | null;
          prompt_version?: string | null;
        };
        Update: {
          generated_content?: Json;
          estimated_budget?: number | null;
          ai_model?: string | null;
          prompt_version?: string | null;
        };
        Relationships: [];
      };
      flight_searches: {
        Row: {
          id: string;
          trip_id: string;
          provider: string | null;
          search_params: Json;
          results: Json;
          cheapest_price: number | null;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          provider?: string | null;
          search_params?: Json;
          results?: Json;
          cheapest_price?: number | null;
          currency?: string;
        };
        Update: {
          provider?: string | null;
          search_params?: Json;
          results?: Json;
          cheapest_price?: number | null;
          currency?: string;
        };
        Relationships: [];
      };
      hotel_searches: {
        Row: {
          id: string;
          trip_id: string;
          provider: string | null;
          search_params: Json;
          results: Json;
          average_price: number | null;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          provider?: string | null;
          search_params?: Json;
          results?: Json;
          average_price?: number | null;
          currency?: string;
        };
        Update: {
          provider?: string | null;
          search_params?: Json;
          results?: Json;
          average_price?: number | null;
          currency?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          type: "trip" | "inspiration";
          item_id: string;
          title: string;
          destination: string;
          country: string | null;
          image_url: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "trip" | "inspiration";
          item_id: string;
          title: string;
          destination: string;
          country?: string | null;
          image_url?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: "trip" | "inspiration";
          item_id?: string;
          title?: string;
          destination?: string;
          country?: string | null;
          image_url?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      trip_status: TripStatus;
    };
  };
}
