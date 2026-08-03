# frozen_string_literal: true

# The per-night calendar, stored as ranges rather than one row (or one bit) per
# night. Providers hand us long runs of identical nights, so a channel's
# whole season is a handful of rows: `channel_blackouts` covers the nights that
# are closed, `channel_rates` carries the price and minimum stay that applies
# over a span. Both are guarded by GiST exclusion constraints, so the database
# itself refuses to hold two rates (or two blackouts of the same kind) for the
# same night — an invariant a packed per-night representation can only hope for.
class CreateChannelCalendar < ActiveRecord::Migration[7.2]
  def change
    # Needed so an exclusion constraint can mix equality on a scalar with range
    # overlap in one GiST index.
    enable_extension "btree_gist"

    create_table :channel_blackouts do |t|
      t.references :listing_channel, null: false, foreign_key: true
      # Which calendar this range closes: the stay itself, or arrival/departure.
      t.string :kind, null: false
      t.daterange :during, null: false

      t.timestamps
    end

    add_index :channel_blackouts, %i[listing_channel_id kind]
    execute <<~SQL.squish
      ALTER TABLE channel_blackouts
      ADD CONSTRAINT channel_blackouts_no_overlap
      EXCLUDE USING gist (listing_channel_id WITH =, kind WITH =, during WITH &&)
    SQL

    create_table :channel_rates do |t|
      t.references :listing_channel, null: false, foreign_key: true
      t.daterange :during, null: false
      t.decimal :nightly_price, precision: 10, scale: 2
      t.integer :min_stay

      t.timestamps
    end

    execute <<~SQL.squish
      ALTER TABLE channel_rates
      ADD CONSTRAINT channel_rates_no_overlap
      EXCLUDE USING gist (listing_channel_id WITH =, during WITH &&)
    SQL
  end
end
