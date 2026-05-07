-- ============================================================
-- VoyageAI — Initial Schema (MVP)
-- ============================================================

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------

create type public.trip_status as enum (
  'draft',
  'planning',
  'booked',
  'ongoing',
  'completed',
  'cancelled'
);

create type public.trip_type as enum (
  'solo',
  'couple',
  'family',
  'friends',
  'business'
);

create type public.favorite_type as enum (
  'destination',
  'flight',
  'hotel',
  'activity',
  'itinerary'
);

create type public.cabin_class as enum (
  'economy',
  'premium_economy',
  'business',
  'first'
);

create type public.notification_type as enum (
  'price_alert',
  'trip_reminder',
  'system',
  'recommendation'
);

-- ------------------------------------------------------------
-- HELPER: auto-update updated_at
-- ------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  avatar_url    text,
  preferred_currency  text default 'EUR',
  preferred_locale    text default 'fr',
  travel_preferences  jsonb default '{}',
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 2. TRIPS
-- ------------------------------------------------------------

create table public.trips (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  destination   text,
  country_code  text,
  start_date    date,
  end_date      date,
  budget_min    numeric(10,2),
  budget_max    numeric(10,2),
  currency      text default 'EUR',
  trip_type     public.trip_type default 'solo',
  status        public.trip_status default 'draft',
  notes         text,
  cover_url     text,
  metadata      jsonb default '{}',
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create index idx_trips_user_id on public.trips(user_id);
create index idx_trips_status on public.trips(status);
create index idx_trips_dates on public.trips(start_date, end_date);

create trigger trips_updated_at
  before update on public.trips
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------
-- 3. TRIP MEMBERS (préparation mode groupe)
-- ------------------------------------------------------------

create table public.trip_members (
  id            uuid primary key default gen_random_uuid(),
  trip_id       uuid not null references public.trips(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text default 'member' not null,
  joined_at     timestamptz default now() not null,

  unique(trip_id, user_id)
);

create index idx_trip_members_trip on public.trip_members(trip_id);
create index idx_trip_members_user on public.trip_members(user_id);

-- ------------------------------------------------------------
-- 4. SEARCHES (historique de recherches)
-- ------------------------------------------------------------

create table public.searches (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  query         text not null,
  filters       jsonb default '{}',
  results_count integer,
  created_at    timestamptz default now() not null
);

create index idx_searches_user_id on public.searches(user_id);
create index idx_searches_created on public.searches(created_at desc);

-- ------------------------------------------------------------
-- 5. FAVORITES
-- ------------------------------------------------------------

create table public.favorites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  favorite_type public.favorite_type not null,
  reference_id  text not null,
  label         text,
  metadata      jsonb default '{}',
  created_at    timestamptz default now() not null,

  unique(user_id, favorite_type, reference_id)
);

create index idx_favorites_user_id on public.favorites(user_id);
create index idx_favorites_type on public.favorites(favorite_type);

-- ------------------------------------------------------------
-- 6. FLIGHT SEARCHES
-- ------------------------------------------------------------

create table public.flight_searches (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  trip_id         uuid references public.trips(id) on delete set null,
  origin          text not null,
  destination     text not null,
  departure_date  date not null,
  return_date     date,
  passengers      integer default 1,
  cabin_class     public.cabin_class default 'economy',
  direct_only     boolean default false,
  results         jsonb default '[]',
  best_price      numeric(10,2),
  currency        text default 'EUR',
  created_at      timestamptz default now() not null
);

create index idx_flight_searches_user on public.flight_searches(user_id);
create index idx_flight_searches_trip on public.flight_searches(trip_id);
create index idx_flight_searches_route on public.flight_searches(origin, destination);

-- ------------------------------------------------------------
-- 7. HOTEL SEARCHES
-- ------------------------------------------------------------

create table public.hotel_searches (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  trip_id         uuid references public.trips(id) on delete set null,
  destination     text not null,
  checkin_date    date not null,
  checkout_date   date not null,
  guests          integer default 1,
  rooms           integer default 1,
  results         jsonb default '[]',
  best_price      numeric(10,2),
  currency        text default 'EUR',
  created_at      timestamptz default now() not null
);

create index idx_hotel_searches_user on public.hotel_searches(user_id);
create index idx_hotel_searches_trip on public.hotel_searches(trip_id);

-- ------------------------------------------------------------
-- 8. ITINERARIES
-- ------------------------------------------------------------

create table public.itineraries (
  id            uuid primary key default gen_random_uuid(),
  trip_id       uuid not null references public.trips(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text,
  prompt        text,
  ai_model      text,
  is_active     boolean default true,
  metadata      jsonb default '{}',
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create index idx_itineraries_trip on public.itineraries(trip_id);
create index idx_itineraries_user on public.itineraries(user_id);

create trigger itineraries_updated_at
  before update on public.itineraries
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------
-- 9. ITINERARY DAYS
-- ------------------------------------------------------------

create table public.itinerary_days (
  id              uuid primary key default gen_random_uuid(),
  itinerary_id    uuid not null references public.itineraries(id) on delete cascade,
  day_number      integer not null,
  date            date,
  title           text,
  summary         text,
  activities      jsonb default '[]',
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,

  unique(itinerary_id, day_number)
);

create index idx_itinerary_days_itinerary on public.itinerary_days(itinerary_id);

create trigger itinerary_days_updated_at
  before update on public.itinerary_days
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------
-- 10. NOTIFICATIONS
-- ------------------------------------------------------------

create table public.notifications (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  notification_type public.notification_type not null default 'system',
  title             text not null,
  body              text,
  reference_id      text,
  is_read           boolean default false,
  created_at        timestamptz default now() not null
);

create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;

-- ------------------------------------------------------------
-- RLS (base minimale — sera affinée dans un ticket dédié)
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.searches enable row level security;
alter table public.favorites enable row level security;
alter table public.flight_searches enable row level security;
alter table public.hotel_searches enable row level security;
alter table public.itineraries enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.notifications enable row level security;

-- Policies: chaque user ne voit que ses propres données
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can manage own trips"
  on public.trips for all using (auth.uid() = user_id);

create policy "Users can manage own trip_members"
  on public.trip_members for all using (auth.uid() = user_id);

create policy "Users can manage own searches"
  on public.searches for all using (auth.uid() = user_id);

create policy "Users can manage own favorites"
  on public.favorites for all using (auth.uid() = user_id);

create policy "Users can manage own flight_searches"
  on public.flight_searches for all using (auth.uid() = user_id);

create policy "Users can manage own hotel_searches"
  on public.hotel_searches for all using (auth.uid() = user_id);

create policy "Users can manage own itineraries"
  on public.itineraries for all using (auth.uid() = user_id);

create policy "Users can manage own itinerary_days"
  on public.itinerary_days for all using (
    auth.uid() = (select user_id from public.itineraries where id = itinerary_id)
  );

create policy "Users can manage own notifications"
  on public.notifications for all using (auth.uid() = user_id);
