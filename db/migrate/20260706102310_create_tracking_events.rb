# frozen_string_literal: true

# Fire-and-forget analytics events: page views + search requests.
class CreateTrackingEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :tracking_events do |t|
      t.string :event_type, null: false
      t.bigint :listing_id
      t.string :visitor_token
      t.string :path
      t.jsonb :metadata, null: false, default: {}
      t.datetime :occurred_at, null: false
      t.timestamps
    end
    add_index :tracking_events, %i[event_type occurred_at]
  end
end
