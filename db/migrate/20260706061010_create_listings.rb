# frozen_string_literal: true

# The `listings` aggregation hub. One physical property. An *aggregated*
# listing pulls together 1-3 OTA channels and has no owner; a Hostflow/Rentora-
# backed listing is host-managed and powers "book direct". Per-channel facts live
# in `channel_offers`; the aggregate rolls them up. Deliberately wide, with array
# and JSONB columns, like a real years-old aggregator listing.
class CreateListings < ActiveRecord::Migration[7.2]
  def change
    create_table :listings do |t|
      # --- Ownership / aggregation identity ---
      # How this listing came to exist. Aggregated listings are assembled from
      # channel records and are ownerless; host-managed ones have a real owner.
      t.string :origin, null: false, default: "aggregated"
      t.integer :owner_id
      t.integer :verified_owner_id
      t.integer :host_identity_id
      t.integer :listing_cluster_id

      # --- Channel foreign keys (which providers this listing aggregates) ---
      t.references :airhive_listing, foreign_key: true
      t.references :vacario_listing, foreign_key: true
      t.references :lodgeo_listing, foreign_key: true
      t.references :hostflow_unit, foreign_key: true
      t.string :rentora_native_id

      # --- Core identity / description ---
      t.string :title
      t.text :description
      t.text :summary
      t.text :neighborhood_overview
      t.string :property_type
      t.integer :room_type, null: false, default: 0
      t.string :url_slug

      # --- Location ---
      t.string :street
      t.string :city
      t.string :state
      t.string :country
      t.string :zip_code
      t.float :lat
      t.float :lng
      t.float :lat_approx
      t.float :lng_approx
      t.string :time_zone
      t.boolean :display_address, null: false, default: false
      t.float :distance_to_center

      # --- Capacity / physical ---
      t.integer :bedrooms
      t.integer :bathrooms
      t.integer :beds
      t.integer :max_guests
      t.integer :minimum_stay
      t.integer :maximum_stay

      # --- Sample pricing (tile-level; full pricing lives on listing_channels ) ---
      t.integer :currency_id
      t.string :currency_code
      t.decimal :price, precision: 10, scale: 2
      t.decimal :preview_price, precision: 10, scale: 2
      t.decimal :average_nightly_price, precision: 10, scale: 2
      t.decimal :cleaning_fee, precision: 10, scale: 2
      t.decimal :security_deposit, precision: 10, scale: 2
      t.decimal :extra_guest_fee, precision: 10, scale: 2
      t.decimal :tax_rate, precision: 6, scale: 4
      t.decimal :estimated_fee_percent, precision: 6, scale: 4
      t.integer :weekly_discount
      t.integer :monthly_discount

      # --- Availability windowing (calendar detail lives on listing_channels ) ---
      t.datetime :calendar_updated_at
      t.datetime :last_synced_at
      t.datetime :first_synced_at

      # --- Reviews / rating / score aggregates ---
      t.float :blended_rating
      t.integer :reviews_count, null: false, default: 0
      t.float :reviews_rating
      t.integer :score, null: false, default: 0
      t.integer :preview_quote_id

      # --- Host / contact ---
      t.string :contact_name
      t.string :contact_email
      t.string :contact_phone
      t.string :website_url

      # --- Rules / policies ---
      t.text :house_rules
      t.string :cancellation_policy
      t.string :check_in_time
      t.string :check_out_time
      t.string :license_number
      t.boolean :instant_book, null: false, default: false

      # --- Lifecycle flags ---
      t.boolean :active, null: false, default: true
      t.boolean :active_browse, null: false, default: true
      t.boolean :offline, null: false, default: false
      t.datetime :published_at
      t.datetime :archived_at

      # --- Arrays ---
      t.string :photos, array: true, default: []
      t.integer :amenity_ids, array: true, default: []

      # --- JSONB (>= 8) ---
      t.jsonb :weekend_price, null: false, default: {}
      t.jsonb :extra_guest_price, null: false, default: {}
      t.jsonb :pet_fee, null: false, default: {}
      t.jsonb :channel_links, null: false, default: {}
      t.jsonb :direct_links, null: false, default: {}
      t.jsonb :video_links, null: false, default: {}
      t.jsonb :ai_content_host_summary, null: false, default: {}
      t.jsonb :ai_content_area_highlights, null: false, default: {}
      t.jsonb :ai_content_review_digest, null: false, default: {}
      t.jsonb :direct_book_actions, null: false, default: []

      # --- SEO ---
      t.string :seo_title
      t.text :seo_description

      t.timestamps
    end

    add_index :listings, :owner_id
    add_index :listings, :origin
    add_index :listings, %i[lat lng]
    add_index :listings, :url_slug, unique: true, where: "url_slug IS NOT NULL"
    add_index :listings, :active

    # An aggregated listing exists only because channel records were matched, so
    # it must point at one of them; a host-managed listing needs no channel.
    add_check_constraint :listings, <<~SQL.squish, name: "listings_aggregated_has_channel"
      origin <> 'aggregated'
      OR airhive_listing_id IS NOT NULL
      OR vacario_listing_id IS NOT NULL
      OR lodgeo_listing_id IS NOT NULL
    SQL
  end
end
