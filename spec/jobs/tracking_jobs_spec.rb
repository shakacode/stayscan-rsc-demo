# frozen_string_literal: true

require "rails_helper"

RSpec.describe "tracking jobs" do
  it "records a page view" do
    RecordPageViewJob.perform_now(path: "/listings/5", listing_id: 5, visitor_token: "v1")

    event = TrackingEvent.last
    expect(event).to have_attributes(event_type: "page_view", path: "/listings/5", listing_id: 5)
  end

  it "records a search request with its params" do
    RecordSearchEventJob.perform_now(visitor_token: "v1", params: { "min_price" => 100 })

    expect(TrackingEvent.last).to have_attributes(event_type: "search", metadata: { "min_price" => 100 })
  end
end
