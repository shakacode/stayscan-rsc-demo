# frozen_string_literal: true

# Fire-and-forget search-request tracking.
class RecordSearchEventJob < ApplicationJob
  queue_as :tracking

  def perform(visitor_token: nil, params: {}, occurred_at: Time.current)
    TrackingEvent.create!(event_type: "search", visitor_token:, metadata: params, occurred_at:)
  end
end
