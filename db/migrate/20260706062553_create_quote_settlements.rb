# frozen_string_literal: true

# One row per (quote, channel): the async pipeline settles each channel on its
# own, so each leg carries its own lifecycle, price, breakdown and failure
# reason. Modelling this as rows rather than a column-set per
# provider means onboarding a channel is data, not a migration, and a quote can
# be rendered mid-flight by reading which legs have landed.
class CreateQuoteSettlements < ActiveRecord::Migration[7.2]
  def change
    create_table :quote_settlements do |t|
      t.references :quote, null: false, foreign_key: true
      t.string :provider_type, null: false

      # pending -> priced | unavailable | failed
      t.string :state, null: false, default: "pending"
      t.decimal :total, precision: 10, scale: 2
      t.decimal :live_total, precision: 10, scale: 2

      # The provider returned a live price for a stay our stored calendar says is
      # blocked — the two disagree and the UI flags it rather than hiding it.
      t.boolean :calendar_conflict, null: false, default: false
      t.string :error_code
      t.jsonb :breakdown, null: false, default: {}
      t.datetime :settled_at

      t.timestamps
    end

    # A channel settles exactly once per quote; concurrent jobs upsert on this.
    add_index :quote_settlements, %i[quote_id provider_type], unique: true
    add_index :quote_settlements, %i[quote_id state]
  end
end
