// Typage manuel aligné sur le schéma SQL.
// À remplacer par `supabase gen types typescript` quand le CLI est connecté.

export type TripStatus = "draft" | "planning" | "booked" | "ongoing" | "completed" | "cancelled";
export type TripType = "solo" | "couple" | "family" | "friends" | "business";
export type FavoriteType = "destination" | "flight" | "hotel" | "activity" | "itinerary";
export type CabinClass = "economy" | "premium_economy" | "business" | "first";
export type NotificationType = "price_alert" | "trip_reminder" | "system" | "recommendation";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          preferred_currency: string;
          preferred_locale: string;
          travel_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_currency?: string;
          preferred_locale?: string;
          travel_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_currency?: string;
          preferred_locale?: string;
          travel_preferences?: Json;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          destination: string | null;
          country_code: string | null;
          start_date: string | null;
          end_date: string | null;
          budget_min: number | null;
          budget_max: number | null;
          currency: string;
          trip_type: TripType;
          status: TripStatus;
          notes: string | null;
          cover_url: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          destination?: string | null;
          country_code?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          currency?: string;
          trip_type?: TripType;
          status?: TripStatus;
          notes?: string | null;
          cover_url?: string | null;
          metadata?: Json;
        };
        Update: {
          title?: string;
          destination?: string | null;
          country_code?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          currency?: string;
          trip_type?: TripType;
          status?: TripStatus;
          notes?: string | null;
          cover_url?: string | null;
          metadata?: Json;
        };
      };
      trip_members: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id: string;
          role?: string;
        };
        Update: {
          role?: string;
        };
      };
      searches: {
        Row: {
          id: string;
          user_id: string;
          query: string;
          filters: Json;
          results_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          query: string;
          filters?: Json;
          results_count?: number | null;
        };
        Update: {
          query?: string;
          filters?: Json;
          results_count?: number | null;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          favorite_type: FavoriteType;
          reference_id: string;
          label: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          favorite_type: FavoriteType;
          reference_id: string;
          label?: string | null;
          metadata?: Json;
        };
        Update: {
          label?: string | null;
          metadata?: Json;
        };
      };
      flight_searches: {
        Row: {
          id: string;
          user_id: string;
          trip_id: string | null;
          origin: string;
          destination: string;
          departure_date: string;
          return_date: string | null;
          passengers: number;
          cabin_class: CabinClass;
          direct_only: boolean;
          results: Json;
          best_price: number | null;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trip_id?: string | null;
          origin: string;
          destination: string;
          departure_date: string;
          return_date?: string | null;
          passengers?: number;
          cabin_class?: CabinClass;
          direct_only?: boolean;
          results?: Json;
          best_price?: number | null;
          currency?: string;
        };
        Update: {
          results?: Json;
          best_price?: number | null;
        };
      };
      hotel_searches: {
        Row: {
          id: string;
          user_id: string;
          trip_id: string | null;
          destination: string;
          checkin_date: string;
          checkout_date: string;
          guests: number;
          rooms: number;
          results: Json;
          best_price: number | null;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trip_id?: string | null;
          destination: string;
          checkin_date: string;
          checkout_date: string;
          guests?: number;
          rooms?: number;
          results?: Json;
          best_price?: number | null;
          currency?: string;
        };
        Update: {
          results?: Json;
          best_price?: number | null;
        };
      };
      itineraries: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string;
          title: string | null;
          prompt: string | null;
          ai_model: string | null;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id: string;
          title?: string | null;
          prompt?: string | null;
          ai_model?: string | null;
          is_active?: boolean;
          metadata?: Json;
        };
        Update: {
          title?: string | null;
          prompt?: string | null;
          ai_model?: string | null;
          is_active?: boolean;
          metadata?: Json;
        };
      };
      itinerary_days: {
        Row: {
          id: string;
          itinerary_id: string;
          day_number: number;
          date: string | null;
          title: string | null;
          summary: string | null;
          activities: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          itinerary_id: string;
          day_number: number;
          date?: string | null;
          title?: string | null;
          summary?: string | null;
          activities?: Json;
        };
        Update: {
          day_number?: number;
          date?: string | null;
          title?: string | null;
          summary?: string | null;
          activities?: Json;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          notification_type: NotificationType;
          title: string;
          body: string | null;
          reference_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notification_type?: NotificationType;
          title: string;
          body?: string | null;
          reference_id?: string | null;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      trip_status: TripStatus;
      trip_type: TripType;
      favorite_type: FavoriteType;
      cabin_class: CabinClass;
      notification_type: NotificationType;
    };
  };
}
