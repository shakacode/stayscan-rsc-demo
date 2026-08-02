-- Denormalized, search-friendly location list for destination autocomplete.
-- Refreshed after seeding / location changes.
SELECT
  locations.id,
  locations.path,
  locations.name,
  locations.kind,
  locations.center_lat,
  locations.center_lng,
  locations.listings_count,
  lower(locations.name) AS name_lower
FROM locations
WHERE locations.listings_count > 0
ORDER BY locations.listings_count DESC;
