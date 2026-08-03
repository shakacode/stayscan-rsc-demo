# frozen_string_literal: true

require "rails_helper"

RSpec.describe QuoteJson do
  it "emits per-channel deals with status and the best deal with savings" do
    listing = Listing.create!(origin: "aggregated", title: "Villa",
                              airhive_listing: AirhiveListing.create!(native_id: "a1"),
                              vacario_listing: VacarioListing.create!(native_id: "v1", unit_code: "u1"))
    %w[airhive vacario].each do |provider|
      listing.listing_channels.create!(provider_type: provider, stay_availability_default: true)
    end
    quote = Quote.create!(listing: listing, check_in: Date.new(2026, 1, 1), check_out: Date.new(2026, 1, 4),
                          adults: 2, state: "finished")
    quote.settlements.create!(provider_type: "airhive", state: "priced", total: 600.0, settled_at: Time.current)
    quote.settlements.create!(provider_type: "vacario", state: "priced", total: 750.0, settled_at: Time.current)

    json = described_class.new(quote).as_json

    expect(json).to include(state: "finished", nights: 3)
    airhive = json[:deals].find { |deal| deal[:provider] == "airhive" }
    expect(airhive).to include(status: "priced", total: 600.0, finished: true)
    expect(json[:topDeal]).to include(provider: "airhive", total: 600.0, savingsAbsolute: 150.0, savingsPercentage: 20)
  end

  it "reports a pending channel as pending until it settles" do
    listing = Listing.create!(origin: "aggregated", title: "Villa",
                              airhive_listing: AirhiveListing.create!(native_id: "a2"))
    listing.listing_channels.create!(provider_type: "airhive", stay_availability_default: true)
    quote = Quote.create!(listing: listing, check_in: Date.current, check_out: Date.current + 2, adults: 1,
                          state: "processing")

    json = described_class.new(quote).as_json

    expect(json[:deals].first).to include(provider: "airhive", status: "pending", finished: false)
  end
end
