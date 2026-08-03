# frozen_string_literal: true

require "rails_helper"

RSpec.describe Quote do
  let(:listing) do
    Listing.create!(origin: "aggregated",
                    airhive_listing: AirhiveListing.create!(native_id: "a1"))
  end

  it "counts nights between check-in and check-out" do
    quote = Quote.create!(listing:, check_in: Date.new(2026, 1, 1), check_out: Date.new(2026, 1, 6), adults: 2)

    expect(quote.nights).to eq(5)
  end

  it "defaults to the pending state" do
    quote = Quote.create!(listing:, check_in: Date.new(2026, 1, 1), check_out: Date.new(2026, 1, 2), adults: 1)

    expect(quote).to be_pending
  end
end
