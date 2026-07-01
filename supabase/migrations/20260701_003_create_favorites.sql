-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trip', 'inspiration')),
  item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  country TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Composite unique constraint: user can't favorite same item twice
  UNIQUE(user_id, type, item_id)
);

-- Create indexes
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_user_type ON public.favorites(user_id, type);
CREATE INDEX idx_favorites_created_at ON public.favorites(created_at DESC);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to see their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own favorites
CREATE POLICY "Users can insert their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow users to update their own favorites
CREATE POLICY "Users can update their own favorites"
  ON public.favorites
  FOR UPDATE
  USING (auth.uid() = user_id);
