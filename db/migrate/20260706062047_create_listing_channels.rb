# frozen_string_literal: true

# One row per (listing x provider): the availability + pricing engine.
# `calendar_window` is the span the provider actually told us about; inside it a
# night is bookable unless a `channel_blackouts` range covers it, and outside it
# the `*_default` booleans apply. Prices and min-stays come from
# `channel_rates` ranges with decimal/int fallbacks. The rest is the fee engine.
class CreateListingChannels < ActiveRecord::Migration[7.2]
  def change
    create_table :listing_channels do |t|
      t.references :listing, null: false, foreign_key: true
      t.string :provider_type, null: false

      # --- Availability (known window + blackout ranges, constant fallbacks) ---
      # Nights outside the window are unknown to us, so the defaults decide.
      t.daterange :calendar_window
      t.boolean :stay_availability_default, null: false, default: true
      t.boolean :check_in_availability_default, null: false, default: true
      t.boolean :check_out_availability_default, null: false, default: true

      # --- Pricing / min-stay fallbacks (per-range values live in channel_rates) ---
      t.decimal :nightly_price_default, precision: 10, scale: 2
      t.decimal :nightly_price_floor, precision: 10, scale: 2
      t.integer :min_stay_default, default: 1
      t.integer :min_stay_floor
      t.integer :min_stay_ceiling

      # --- Fee engine ---
      t.decimal :tax_rate, precision: 6, scale: 4
      t.decimal :static_fee, precision: 10, scale: 2
      t.decimal :percent_fee, precision: 6, scale: 4
      t.decimal :per_guest_stay_fee, precision: 10, scale: 2
      t.integer :per_guest_stay_fee_from
      t.decimal :per_guest_night_fee, precision: 10, scale: 2
      t.integer :per_guest_night_fee_from
      t.boolean :per_guest_includes_adults, null: false, default: true
      t.boolean :per_guest_includes_children, null: false, default: false
      t.boolean :per_guest_includes_infants, null: false, default: false
      t.decimal :pet_fee, precision: 10, scale: 2
      t.integer :weekly_discount
      t.integer :monthly_discount
      t.decimal :channel_fee_percent, precision: 6, scale: 4
      t.decimal :channel_fee_max, precision: 10, scale: 2

      # --- Sample-quote pricing snapshot + sync ---
      t.boolean :preview_quote_pricing, null: false, default: false
      t.decimal :preview_quote_static_fee, precision: 10, scale: 2
      t.decimal :preview_quote_percent_fee, precision: 6, scale: 4
      t.jsonb :cached_discounts, null: false, default: {}
      t.datetime :last_synced_at

      t.timestamps
    end

    add_index :listing_channels, %i[listing_id provider_type], unique: true
  end
end
