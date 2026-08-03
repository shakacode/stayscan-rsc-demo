# frozen_string_literal: true

# A price request for a listing over a date range. The quote row holds the
# stay itself; each channel's leg of the quote settles independently and lives in
# quote_settlements, so this table stays narrow and provider-agnostic.
class CreateQuotes < ActiveRecord::Migration[7.2]
  def change
    create_table :quotes do |t|
      t.integer :guest_id
      t.references :listing, null: false, foreign_key: true
      t.integer :currency_id

      t.date :check_in, null: false
      t.date :check_out, null: false
      t.integer :adults, null: false, default: 1
      t.integer :children, null: false, default: 0
      t.integer :infants, null: false, default: 0
      t.boolean :pets, null: false, default: false

      t.string :state, null: false, default: "pending"
      t.jsonb :sibling_units, null: false, default: []

      t.timestamps
    end

    add_index :quotes, %i[listing_id check_in check_out]
    add_index :quotes, :guest_id
  end
end
