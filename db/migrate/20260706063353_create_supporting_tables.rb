# frozen_string_literal: true

# Supporting domain tables: geography, amenities, currencies, reviews,
# wishlists, the match/identity graph, feature usage, CMS content, and flags.
class CreateSupportingTables < ActiveRecord::Migration[7.2]
  def change
    create_table :currencies do |t|
      t.string :code, null: false
      t.string :symbol
      t.decimal :rate_to_usd, precision: 12, scale: 6, null: false, default: 1
      t.timestamps
    end
    add_index :currencies, :code, unique: true

    create_table :amenities do |t|
      t.string :name, null: false
      t.string :category
      t.integer :bit_position, null: false # position in listing_search_rows.amenity_mask
      t.timestamps
    end
    add_index :amenities, :bit_position, unique: true

    # Destination pages: nested geography (country > region > area) with bounding boxes.
    create_table :locations do |t|
      t.string :path, null: false
      t.integer :parent_id
      t.string :name, null: false
      t.string :kind, null: false, default: "area" # country | region | area
      t.decimal :min_lat, precision: 10, scale: 6
      t.decimal :max_lat, precision: 10, scale: 6
      t.decimal :min_lng, precision: 10, scale: 6
      t.decimal :max_lng, precision: 10, scale: 6
      t.decimal :center_lat, precision: 10, scale: 6
      t.decimal :center_lng, precision: 10, scale: 6
      t.integer :listings_count, null: false, default: 0
      t.text :seo_text
      t.timestamps
    end
    add_index :locations, :path, unique: true
    add_index :locations, :parent_id

    create_table :reviews do |t|
      t.references :listing, null: false, foreign_key: true
      t.string :provider_type, null: false
      t.string :author_name
      t.integer :rating, null: false # 1..5
      t.string :title
      t.text :content
      t.date :checked_in_on
      t.date :checked_out_on
      t.timestamps
    end

    create_table :trip_lists do |t|
      t.references :user, foreign_key: true
      t.string :name, null: false
      t.string :slug, null: false
      t.timestamps
    end
    add_index :trip_lists, :slug, unique: true

    create_table :trip_list_listings do |t|
      t.references :trip_list, null: false, foreign_key: true
      t.references :listing, null: false, foreign_key: true
      t.timestamps
    end
    add_index :trip_list_listings, %i[trip_list_id listing_id], unique: true

    # Clustering / identity graph: the channel records believed to describe one
    # property, and the host-identity grouping that produces host_identities.
    create_table :listing_clusters do |t|
      t.integer :airhive_listing_id
      t.integer :vacario_listing_id
      t.integer :lodgeo_listing_id
      # Null while the cluster is waiting to be resolved; re-observing a property
      # clears it and the resolver picks the cluster up again.
      t.datetime :resolved_at
      t.timestamps
    end

    add_index :listing_clusters, :resolved_at, where: "resolved_at IS NULL",
                                               name: "index_listing_clusters_pending"

    create_table :host_identities do |t|
      t.string :name
      t.string :slug
      t.timestamps
    end
    add_index :host_identities, :slug, unique: true

    create_table :channel_hosts do |t|
      t.string :provider_type, null: false
      t.string :native_id, null: false
      t.string :name
      t.references :host_identity, foreign_key: true
      t.timestamps
    end
    add_index :channel_hosts, %i[provider_type native_id], unique: true

    create_table :host_aliases do |t|
      t.references :host_identity, null: false, foreign_key: true
      t.string :name
      t.timestamps
    end

    # Anonymous quota tracking for the feature-usage limiter.
    create_table :usage_counters do |t|
      t.string :visitor_token, null: false
      t.string :feature, null: false
      t.integer :count, null: false, default: 0
      t.date :period_start, null: false
      t.timestamps
    end
    add_index :usage_counters, %i[visitor_token feature period_start], unique: true

    create_table :content_pages do |t|
      t.string :slug, null: false
      t.string :title
      t.text :body
      t.timestamps
    end
    add_index :content_pages, :slug, unique: true

    create_table :feature_flags do |t|
      t.string :key, null: false
      t.boolean :enabled, null: false, default: false
      t.jsonb :payload, null: false, default: {}
      t.timestamps
    end
    add_index :feature_flags, :key, unique: true
  end
end
