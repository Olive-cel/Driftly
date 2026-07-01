-- Add cover_image column to trips table for storing Unsplash image URLs
-- This enables caching of destination images and eliminates dynamic fetching on every display

ALTER TABLE trips
ADD COLUMN cover_image text DEFAULT NULL;

-- Create an index on cover_image for faster queries if needed
CREATE INDEX idx_trips_cover_image ON trips(cover_image);

-- Add comment for documentation
COMMENT ON COLUMN trips.cover_image IS 'URL of the destination cover image from Unsplash API, cached upon trip creation';
