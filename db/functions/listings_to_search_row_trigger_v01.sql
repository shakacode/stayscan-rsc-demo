-- Maintains listing_search_rows from listings on INSERT/UPDATE. Packs
-- quantized values + an amenity bitmask so app code never writes the table.
CREATE OR REPLACE FUNCTION listings_to_search_row_trigger() RETURNS trigger AS $$
DECLARE
  v_bits bit varying;
  v_pos integer;
BEGIN
  -- amenity bitmask: bit i set when an amenity with bit_position i is present
  v_bits := NULL;
  IF NEW.amenity_ids IS NOT NULL AND array_length(NEW.amenity_ids, 1) > 0 THEN
    v_bits := repeat('0', 64)::bit varying;
    FOR v_pos IN SELECT bit_position FROM amenities WHERE id = ANY(NEW.amenity_ids) LOOP
      IF v_pos >= 0 AND v_pos < 64 THEN
        v_bits := set_bit(v_bits, v_pos, 1);
      END IF;
    END LOOP;
  END IF;

  INSERT INTO listing_search_rows (
    listing_id, lat, lng, preview_price_cents, rating_sort_key, bathrooms_tenths,
    bedrooms, max_guests, amenity_mask, active, active_browse, book_direct, top_rated, updated_at
  ) VALUES (
    NEW.id, NEW.lat, NEW.lng,
    (COALESCE(NEW.preview_price, 0) * 100)::integer,
    (COALESCE(NEW.blended_rating, 0) * 10000000)::bigint,
    (COALESCE(NEW.bathrooms, 0) * 10)::integer,
    NEW.bedrooms, NEW.max_guests, v_bits,
    NEW.active, NEW.active_browse,
    (NEW.hostflow_unit_id IS NOT NULL OR NEW.rentora_native_id IS NOT NULL),
    (COALESCE(NEW.blended_rating, 0) >= 4.7 AND NEW.reviews_count >= 10),
    now()
  )
  ON CONFLICT (listing_id) DO UPDATE SET
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    preview_price_cents = EXCLUDED.preview_price_cents,
    rating_sort_key = EXCLUDED.rating_sort_key,
    bathrooms_tenths = EXCLUDED.bathrooms_tenths,
    bedrooms = EXCLUDED.bedrooms,
    max_guests = EXCLUDED.max_guests,
    amenity_mask = EXCLUDED.amenity_mask,
    active = EXCLUDED.active,
    active_browse = EXCLUDED.active_browse,
    book_direct = EXCLUDED.book_direct,
    top_rated = EXCLUDED.top_rated,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
