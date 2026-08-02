# frozen_string_literal: true

# What each channel says about a listing. One row per (listing, channel):
# the channel's own title, rating, review count and headline price, as last seen.
# These are the facts the aggregate rolls up (blended rating, review totals) and
# the comparison table renders, so they are read on every listing page — but
# keeping them as rows rather than a column family per provider means the set of
# channels is data, and a listing on one channel does not carry empty columns for
# the others.
class CreateChannelOffers < ActiveRecord::Migration[7.2]
  def change
    create_table :channel_offers do |t|
      t.references :listing, null: false, foreign_key: true
      t.string :provider_type, null: false

      t.string :title
      t.float :review_rating
      t.integer :reviews_count
      t.decimal :native_price, precision: 10, scale: 2
      t.datetime :seen_at

      t.timestamps
    end

    # A channel offers a listing at most once; the sync job upserts on this.
    add_index :channel_offers, %i[listing_id provider_type], unique: true
  end
end
