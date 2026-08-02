# frozen_string_literal: true

# Thin per-provider "channel" tables. Each holds only the provider's
# identity + quirks; all listing content lives on the `listings` hub. The three
# OTAs deliberately differ in how a listing is identified.
class CreateChannelListings < ActiveRecord::Migration[7.2]
  def change
    # Airhive (OTA #1): a single native_id fully identifies a listing.
    create_table :airhive_listings do |t|
      t.string :native_id, null: false
      t.string :owner_name
      t.timestamps
    end
    add_index :airhive_listings, :native_id, unique: true

    # Vacario (OTA #2): needs native_id + unit_code, and carries a property_ref.
    create_table :vacario_listings do |t|
      t.string :native_id, null: false
      t.string :unit_code, null: false
      t.string :property_ref
      t.string :owner_name
      t.timestamps
    end
    add_index :vacario_listings, %i[native_id unit_code], unique: true

    # Lodgeo (OTA #3, quirk channel): the public deep-link needs an opaque
    # channel_ref the provider assigns per (property, unit). It is NOT in the
    # feed and is resolved lazily via a separate API call. Nullable until
    # resolved, then cached on the row.
    create_table :lodgeo_listings do |t|
      t.string :native_id, null: false
      t.string :native_unit_id, null: false
      t.string :channel_ref
      t.string :owner_name
      t.timestamps
    end
    add_index :lodgeo_listings, %i[native_id native_unit_id], unique: true

    # Hostflow (VRS): token-based property-management system that powers "book
    # direct". Hostflow-sourced listings have a real owner and are auto-verified.
    create_table :hostflow_units do |t|
      t.string :native_id, null: false
      t.references :owner, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :hostflow_units, :native_id, unique: true
  end
end
