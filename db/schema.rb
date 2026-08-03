# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_07_09_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "btree_gist"
  enable_extension "plpgsql"

  create_table "airhive_listings", force: :cascade do |t|
    t.string "native_id", null: false
    t.string "owner_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["native_id"], name: "index_airhive_listings_on_native_id", unique: true
  end

  create_table "amenities", force: :cascade do |t|
    t.string "name", null: false
    t.string "category"
    t.integer "bit_position", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bit_position"], name: "index_amenities_on_bit_position", unique: true
  end

  create_table "channel_blackouts", force: :cascade do |t|
    t.bigint "listing_channel_id", null: false
    t.string "kind", null: false
    t.daterange "during", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["listing_channel_id", "kind"], name: "index_channel_blackouts_on_listing_channel_id_and_kind"
    t.index ["listing_channel_id"], name: "index_channel_blackouts_on_listing_channel_id"
    t.exclusion_constraint "listing_channel_id WITH =, kind WITH =, during WITH &&", using: :gist, name: "channel_blackouts_no_overlap"
  end

  create_table "channel_hosts", force: :cascade do |t|
    t.string "provider_type", null: false
    t.string "native_id", null: false
    t.string "name"
    t.bigint "host_identity_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["host_identity_id"], name: "index_channel_hosts_on_host_identity_id"
    t.index ["provider_type", "native_id"], name: "index_channel_hosts_on_provider_type_and_native_id", unique: true
  end

  create_table "channel_offers", force: :cascade do |t|
    t.bigint "listing_id", null: false
    t.string "provider_type", null: false
    t.string "title"
    t.float "review_rating"
    t.integer "reviews_count"
    t.decimal "native_price", precision: 10, scale: 2
    t.datetime "seen_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["listing_id", "provider_type"], name: "index_channel_offers_on_listing_id_and_provider_type", unique: true
    t.index ["listing_id"], name: "index_channel_offers_on_listing_id"
  end

  create_table "channel_rates", force: :cascade do |t|
    t.bigint "listing_channel_id", null: false
    t.daterange "during", null: false
    t.decimal "nightly_price", precision: 10, scale: 2
    t.integer "min_stay"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["listing_channel_id"], name: "index_channel_rates_on_listing_channel_id"
    t.exclusion_constraint "listing_channel_id WITH =, during WITH &&", using: :gist, name: "channel_rates_no_overlap"
  end

  create_table "content_pages", force: :cascade do |t|
    t.string "slug", null: false
    t.string "title"
    t.text "body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_content_pages_on_slug", unique: true
  end

  create_table "currencies", force: :cascade do |t|
    t.string "code", null: false
    t.string "symbol"
    t.decimal "rate_to_usd", precision: 12, scale: 6, default: "1.0", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_currencies_on_code", unique: true
  end

  create_table "feature_flags", force: :cascade do |t|
    t.string "key", null: false
    t.boolean "enabled", default: false, null: false
    t.jsonb "payload", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_feature_flags_on_key", unique: true
  end

  create_table "host_aliases", force: :cascade do |t|
    t.bigint "host_identity_id", null: false
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["host_identity_id"], name: "index_host_aliases_on_host_identity_id"
  end

  create_table "host_identities", force: :cascade do |t|
    t.string "name"
    t.string "slug"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_host_identities_on_slug", unique: true
  end

  create_table "hostflow_units", force: :cascade do |t|
    t.string "native_id", null: false
    t.bigint "owner_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["native_id"], name: "index_hostflow_units_on_native_id", unique: true
    t.index ["owner_id"], name: "index_hostflow_units_on_owner_id"
  end

  create_table "listing_channels", force: :cascade do |t|
    t.bigint "listing_id", null: false
    t.string "provider_type", null: false
    t.daterange "calendar_window"
    t.boolean "stay_availability_default", default: true, null: false
    t.boolean "check_in_availability_default", default: true, null: false
    t.boolean "check_out_availability_default", default: true, null: false
    t.decimal "nightly_price_default", precision: 10, scale: 2
    t.decimal "nightly_price_floor", precision: 10, scale: 2
    t.integer "min_stay_default", default: 1
    t.integer "min_stay_floor"
    t.integer "min_stay_ceiling"
    t.decimal "tax_rate", precision: 6, scale: 4
    t.decimal "static_fee", precision: 10, scale: 2
    t.decimal "percent_fee", precision: 6, scale: 4
    t.decimal "per_guest_stay_fee", precision: 10, scale: 2
    t.integer "per_guest_stay_fee_from"
    t.decimal "per_guest_night_fee", precision: 10, scale: 2
    t.integer "per_guest_night_fee_from"
    t.boolean "per_guest_includes_adults", default: true, null: false
    t.boolean "per_guest_includes_children", default: false, null: false
    t.boolean "per_guest_includes_infants", default: false, null: false
    t.decimal "pet_fee", precision: 10, scale: 2
    t.integer "weekly_discount"
    t.integer "monthly_discount"
    t.decimal "channel_fee_percent", precision: 6, scale: 4
    t.decimal "channel_fee_max", precision: 10, scale: 2
    t.boolean "preview_quote_pricing", default: false, null: false
    t.decimal "preview_quote_static_fee", precision: 10, scale: 2
    t.decimal "preview_quote_percent_fee", precision: 6, scale: 4
    t.jsonb "cached_discounts", default: {}, null: false
    t.datetime "last_synced_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["listing_id", "provider_type"], name: "index_listing_channels_on_listing_id_and_provider_type", unique: true
    t.index ["listing_id"], name: "index_listing_channels_on_listing_id"
  end

  create_table "listing_clusters", force: :cascade do |t|
    t.integer "airhive_listing_id"
    t.integer "vacario_listing_id"
    t.integer "lodgeo_listing_id"
    t.datetime "resolved_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["resolved_at"], name: "index_listing_clusters_pending", where: "(resolved_at IS NULL)"
  end

  create_table "listing_search_rows", id: false, force: :cascade do |t|
    t.bigint "listing_id", null: false
    t.decimal "lat", precision: 10, scale: 6
    t.decimal "lng", precision: 10, scale: 6
    t.integer "preview_price_cents"
    t.bigint "rating_sort_key"
    t.integer "bathrooms_tenths"
    t.integer "bedrooms"
    t.integer "max_guests"
    t.bit_varying "amenity_mask"
    t.boolean "active", default: true, null: false
    t.boolean "active_browse", default: true, null: false
    t.boolean "book_direct", default: false, null: false
    t.boolean "top_rated", default: false, null: false
    t.datetime "updated_at"
    t.index ["lat", "lng"], name: "index_listing_search_rows_on_lat_and_lng"
    t.index ["listing_id"], name: "index_listing_search_rows_on_listing_id", unique: true
  end

  create_table "listings", force: :cascade do |t|
    t.string "origin", default: "aggregated", null: false
    t.integer "owner_id"
    t.integer "verified_owner_id"
    t.integer "host_identity_id"
    t.integer "listing_cluster_id"
    t.bigint "airhive_listing_id"
    t.bigint "vacario_listing_id"
    t.bigint "lodgeo_listing_id"
    t.bigint "hostflow_unit_id"
    t.string "rentora_native_id"
    t.string "title"
    t.text "description"
    t.text "summary"
    t.text "neighborhood_overview"
    t.string "property_type"
    t.integer "room_type", default: 0, null: false
    t.string "url_slug"
    t.string "street"
    t.string "city"
    t.string "state"
    t.string "country"
    t.string "zip_code"
    t.float "lat"
    t.float "lng"
    t.float "lat_approx"
    t.float "lng_approx"
    t.string "time_zone"
    t.boolean "display_address", default: false, null: false
    t.float "distance_to_center"
    t.integer "bedrooms"
    t.integer "bathrooms"
    t.integer "beds"
    t.integer "max_guests"
    t.integer "minimum_stay"
    t.integer "maximum_stay"
    t.integer "currency_id"
    t.string "currency_code"
    t.decimal "price", precision: 10, scale: 2
    t.decimal "preview_price", precision: 10, scale: 2
    t.decimal "average_nightly_price", precision: 10, scale: 2
    t.decimal "cleaning_fee", precision: 10, scale: 2
    t.decimal "security_deposit", precision: 10, scale: 2
    t.decimal "extra_guest_fee", precision: 10, scale: 2
    t.decimal "tax_rate", precision: 6, scale: 4
    t.decimal "estimated_fee_percent", precision: 6, scale: 4
    t.integer "weekly_discount"
    t.integer "monthly_discount"
    t.datetime "calendar_updated_at"
    t.datetime "last_synced_at"
    t.datetime "first_synced_at"
    t.float "blended_rating"
    t.integer "reviews_count", default: 0, null: false
    t.float "reviews_rating"
    t.integer "score", default: 0, null: false
    t.integer "preview_quote_id"
    t.string "contact_name"
    t.string "contact_email"
    t.string "contact_phone"
    t.string "website_url"
    t.text "house_rules"
    t.string "cancellation_policy"
    t.string "check_in_time"
    t.string "check_out_time"
    t.string "license_number"
    t.boolean "instant_book", default: false, null: false
    t.boolean "active", default: true, null: false
    t.boolean "active_browse", default: true, null: false
    t.boolean "offline", default: false, null: false
    t.datetime "published_at"
    t.datetime "archived_at"
    t.string "photos", default: [], array: true
    t.integer "amenity_ids", default: [], array: true
    t.jsonb "weekend_price", default: {}, null: false
    t.jsonb "extra_guest_price", default: {}, null: false
    t.jsonb "pet_fee", default: {}, null: false
    t.jsonb "channel_links", default: {}, null: false
    t.jsonb "direct_links", default: {}, null: false
    t.jsonb "video_links", default: {}, null: false
    t.jsonb "ai_content_host_summary", default: {}, null: false
    t.jsonb "ai_content_area_highlights", default: {}, null: false
    t.jsonb "ai_content_review_digest", default: {}, null: false
    t.jsonb "direct_book_actions", default: [], null: false
    t.string "seo_title"
    t.text "seo_description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_listings_on_active"
    t.index ["airhive_listing_id"], name: "index_listings_on_airhive_listing_id"
    t.index ["hostflow_unit_id"], name: "index_listings_on_hostflow_unit_id"
    t.index ["lat", "lng"], name: "index_listings_on_lat_and_lng"
    t.index ["lodgeo_listing_id"], name: "index_listings_on_lodgeo_listing_id"
    t.index ["origin"], name: "index_listings_on_origin"
    t.index ["owner_id"], name: "index_listings_on_owner_id"
    t.index ["url_slug"], name: "index_listings_on_url_slug", unique: true, where: "(url_slug IS NOT NULL)"
    t.index ["vacario_listing_id"], name: "index_listings_on_vacario_listing_id"
    t.check_constraint "origin::text <> 'aggregated'::text OR airhive_listing_id IS NOT NULL OR vacario_listing_id IS NOT NULL OR lodgeo_listing_id IS NOT NULL", name: "listings_aggregated_has_channel"
  end

  create_table "locations", force: :cascade do |t|
    t.string "path", null: false
    t.integer "parent_id"
    t.string "name", null: false
    t.string "kind", default: "area", null: false
    t.decimal "min_lat", precision: 10, scale: 6
    t.decimal "max_lat", precision: 10, scale: 6
    t.decimal "min_lng", precision: 10, scale: 6
    t.decimal "max_lng", precision: 10, scale: 6
    t.decimal "center_lat", precision: 10, scale: 6
    t.decimal "center_lng", precision: 10, scale: 6
    t.integer "listings_count", default: 0, null: false
    t.text "seo_text"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["parent_id"], name: "index_locations_on_parent_id"
    t.index ["path"], name: "index_locations_on_path", unique: true
  end

  create_table "lodgeo_listings", force: :cascade do |t|
    t.string "native_id", null: false
    t.string "native_unit_id", null: false
    t.string "channel_ref"
    t.string "owner_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["native_id", "native_unit_id"], name: "index_lodgeo_listings_on_native_id_and_native_unit_id", unique: true
  end

  create_table "quote_settlements", force: :cascade do |t|
    t.bigint "quote_id", null: false
    t.string "provider_type", null: false
    t.string "state", default: "pending", null: false
    t.decimal "total", precision: 10, scale: 2
    t.decimal "live_total", precision: 10, scale: 2
    t.boolean "calendar_conflict", default: false, null: false
    t.string "error_code"
    t.jsonb "breakdown", default: {}, null: false
    t.datetime "settled_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["quote_id", "provider_type"], name: "index_quote_settlements_on_quote_id_and_provider_type", unique: true
    t.index ["quote_id", "state"], name: "index_quote_settlements_on_quote_id_and_state"
    t.index ["quote_id"], name: "index_quote_settlements_on_quote_id"
  end

  create_table "quotes", force: :cascade do |t|
    t.integer "guest_id"
    t.bigint "listing_id", null: false
    t.integer "currency_id"
    t.date "check_in", null: false
    t.date "check_out", null: false
    t.integer "adults", default: 1, null: false
    t.integer "children", default: 0, null: false
    t.integer "infants", default: 0, null: false
    t.boolean "pets", default: false, null: false
    t.string "state", default: "pending", null: false
    t.jsonb "sibling_units", default: [], null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["guest_id"], name: "index_quotes_on_guest_id"
    t.index ["listing_id", "check_in", "check_out"], name: "index_quotes_on_listing_id_and_check_in_and_check_out"
    t.index ["listing_id"], name: "index_quotes_on_listing_id"
  end

  create_table "reviews", force: :cascade do |t|
    t.bigint "listing_id", null: false
    t.string "provider_type", null: false
    t.string "author_name"
    t.integer "rating", null: false
    t.string "title"
    t.text "content"
    t.date "checked_in_on"
    t.date "checked_out_on"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["listing_id"], name: "index_reviews_on_listing_id"
  end

  create_table "tracking_events", force: :cascade do |t|
    t.string "event_type", null: false
    t.bigint "listing_id"
    t.string "visitor_token"
    t.string "path"
    t.jsonb "metadata", default: {}, null: false
    t.datetime "occurred_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_type", "occurred_at"], name: "index_tracking_events_on_event_type_and_occurred_at"
  end

  create_table "trip_list_listings", force: :cascade do |t|
    t.bigint "trip_list_id", null: false
    t.bigint "listing_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["listing_id"], name: "index_trip_list_listings_on_listing_id"
    t.index ["trip_list_id", "listing_id"], name: "index_trip_list_listings_on_trip_list_id_and_listing_id", unique: true
    t.index ["trip_list_id"], name: "index_trip_list_listings_on_trip_list_id"
  end

  create_table "trip_lists", force: :cascade do |t|
    t.bigint "user_id"
    t.string "name", null: false
    t.string "slug", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_trip_lists_on_slug", unique: true
    t.index ["user_id"], name: "index_trip_lists_on_user_id"
  end

  create_table "usage_counters", force: :cascade do |t|
    t.string "visitor_token", null: false
    t.string "feature", null: false
    t.integer "count", default: 0, null: false
    t.date "period_start", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["visitor_token", "feature", "period_start"], name: "idx_on_visitor_token_feature_period_start_293c518a24", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "host_name"
    t.string "host_avatar"
    t.text "host_intro_text"
    t.datetime "verified_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "vacario_listings", force: :cascade do |t|
    t.string "native_id", null: false
    t.string "unit_code", null: false
    t.string "property_ref"
    t.string "owner_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["native_id", "unit_code"], name: "index_vacario_listings_on_native_id_and_unit_code", unique: true
  end

  add_foreign_key "channel_blackouts", "listing_channels"
  add_foreign_key "channel_hosts", "host_identities"
  add_foreign_key "channel_offers", "listings"
  add_foreign_key "channel_rates", "listing_channels"
  add_foreign_key "host_aliases", "host_identities"
  add_foreign_key "hostflow_units", "users", column: "owner_id"
  add_foreign_key "listing_channels", "listings"
  add_foreign_key "listings", "airhive_listings"
  add_foreign_key "listings", "hostflow_units"
  add_foreign_key "listings", "lodgeo_listings"
  add_foreign_key "listings", "vacario_listings"
  add_foreign_key "quote_settlements", "quotes"
  add_foreign_key "quotes", "listings"
  add_foreign_key "reviews", "listings"
  add_foreign_key "trip_list_listings", "listings"
  add_foreign_key "trip_list_listings", "trip_lists"
  add_foreign_key "trip_lists", "users"

  create_function :total_price, sql_definition: <<-'SQL'
      CREATE OR REPLACE FUNCTION public.total_price(p_channel_id bigint, p_check_in date, p_check_out date, p_adults integer, p_children integer, p_infants integer, p_pets boolean)
       RETURNS numeric
       LANGUAGE plpgsql
       STABLE
      AS $function$
      DECLARE
        ch listing_channels%ROWTYPE;
        v_nights integer;
        v_rent numeric := 0;
        v_discount_pct integer := 0;
        v_rent_net numeric;
        v_chargeable integer := 0;
        v_pp_stay numeric;
        v_pp_night numeric;
        v_pet numeric := 0;
        v_static numeric;
        v_percent numeric;
        v_subtotal numeric;
        v_tax numeric;
      BEGIN
        SELECT * INTO ch FROM listing_channels WHERE id = p_channel_id;
        v_nights := p_check_out - p_check_in;

        -- rent = sum over the nights of the rate range covering each night, falling
        -- back to the channel's default where no range does.
        SELECT COALESCE(SUM(COALESCE(r.nightly_price, ch.nightly_price_default, 0)), 0)
          INTO v_rent
          FROM generate_series(p_check_in, p_check_out - 1, interval '1 day') AS night
          LEFT JOIN channel_rates r
            ON r.listing_channel_id = ch.id
           AND r.during @> night::date;

        -- length-of-stay discount
        IF v_nights >= 28 THEN
          v_discount_pct := COALESCE(ch.monthly_discount, 0);
        ELSIF v_nights >= 7 THEN
          v_discount_pct := COALESCE(ch.weekly_discount, 0);
        END IF;
        v_rent_net := v_rent * (100 - v_discount_pct) / 100;

        -- chargeable guests for per-person fees
        IF ch.per_guest_includes_adults THEN v_chargeable := v_chargeable + p_adults; END IF;
        IF ch.per_guest_includes_children THEN v_chargeable := v_chargeable + p_children; END IF;
        IF ch.per_guest_includes_infants THEN v_chargeable := v_chargeable + p_infants; END IF;

        v_pp_stay := COALESCE(ch.per_guest_stay_fee, 0)
          * GREATEST(0, v_chargeable - COALESCE(ch.per_guest_stay_fee_from, 0));
        v_pp_night := COALESCE(ch.per_guest_night_fee, 0)
          * GREATEST(0, v_chargeable - COALESCE(ch.per_guest_night_fee_from, 0)) * v_nights;
        IF p_pets THEN v_pet := COALESCE(ch.pet_fee, 0); END IF;
        v_static := COALESCE(ch.static_fee, 0);
        v_percent := COALESCE(ch.percent_fee, 0) * v_rent_net;

        v_subtotal := v_rent_net + v_static + v_percent + v_pp_stay + v_pp_night + v_pet;
        v_tax := round(v_subtotal * COALESCE(ch.tax_rate, 0), 2);

        RETURN round(v_subtotal + v_tax, 2);
      END;
      $function$
  SQL

  create_function :available_total_price, sql_definition: <<-'SQL'
      CREATE OR REPLACE FUNCTION public.available_total_price(p_channel_id bigint, p_check_in date, p_check_out date, p_adults integer, p_children integer, p_infants integer, p_pets boolean)
       RETURNS numeric
       LANGUAGE plpgsql
       STABLE
      AS $function$
      DECLARE
        ch listing_channels%ROWTYPE;
        v_stay daterange;
      BEGIN
        SELECT * INTO ch FROM listing_channels WHERE id = p_channel_id;
        -- Half-open: the nights slept are [check_in, check_out).
        v_stay := daterange(p_check_in, p_check_out);

        -- Nights we hold no calendar for are governed by the channel default.
        IF NOT COALESCE(ch.calendar_window @> v_stay, false)
           AND NOT ch.stay_availability_default THEN
          RETURN NULL;
        END IF;

        IF EXISTS (
          SELECT 1
            FROM channel_blackouts b
           WHERE b.listing_channel_id = ch.id
             AND b.kind = 'stay'
             AND b.during && v_stay
        ) THEN
          RETURN NULL;
        END IF;

        RETURN total_price(p_channel_id, p_check_in, p_check_out, p_adults, p_children, p_infants, p_pets);
      END;
      $function$
  SQL

  create_function :listings_to_search_row_trigger, sql_definition: <<-'SQL'
      CREATE OR REPLACE FUNCTION public.listings_to_search_row_trigger()
       RETURNS trigger
       LANGUAGE plpgsql
      AS $function$
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
          (COALESCE(NEW.blended_rating, 0) >= 4.7
            AND COALESCE(NEW.reviews_count, 0) > 0
            AND (NEW.verified_owner_id IS NOT NULL
                 OR NEW.hostflow_unit_id IS NOT NULL
                 OR NEW.rentora_native_id IS NOT NULL)),
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
      $function$
  SQL

  create_trigger :listings_to_search_row, sql_definition: <<-SQL
      CREATE TRIGGER listings_to_search_row AFTER INSERT OR UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION listings_to_search_row_trigger()
  SQL

  create_view "materialized_autocomplete_locations", materialized: true, sql_definition: <<-SQL
      SELECT id,
      path,
      name,
      kind,
      center_lat,
      center_lng,
      listings_count,
      lower((name)::text) AS name_lower
     FROM locations
    WHERE (listings_count > 0)
    ORDER BY listings_count DESC;
  SQL
end
