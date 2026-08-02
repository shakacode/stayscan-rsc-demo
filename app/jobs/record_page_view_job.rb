# frozen_string_literal: true

# Fire-and-forget page-view tracking.
class RecordPageViewJob < ApplicationJob
  queue_as :tracking

  def perform(path:, listing_id: nil, visitor_token: nil, occurred_at: Time.current)
    TrackingEvent.create!(event_type: "page_view", path:, listing_id:, visitor_token:, occurred_at:)
  end
end
