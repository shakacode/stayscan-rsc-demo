# frozen_string_literal: true

require "rails_helper"

RSpec.describe Listing::PricingContext do
  def channel_for(listing, provider_type:, nightly_price_floor:, available: true)
    channel = listing.listing_channels.create!(
      provider_type: provider_type, nightly_price_floor: nightly_price_floor, static_fee: 90, tax_rate: 0.1,
      calendar_window: Date.current...(Date.current + 3), stay_availability_default: false
    )
    unless available
      channel.channel_blackouts.create!(kind: "stay", during: Date.current...(Date.current + 3))
    end
    channel.reload
  end

  it "prices each channel, picks the cheapest available, and reports the savings" do
    listing = Listing.create!(origin: "aggregated", title: "Villa",
                              airhive_listing: AirhiveListing.create!(native_id: "a1"))
    channel_for(listing, provider_type: "airhive", nightly_price_floor: 200)
    channel_for(listing, provider_type: "vacario", nightly_price_floor: 250)

    result = described_class.call(listing)

    expect(result[:cheapest_provider]).to eq("airhive")
    # (250 - 200) nightly over 3 sample nights, before fees
    expect(result[:savings]).to eq(165.0)
    airhive = result[:rows].find { |row| row.provider_type == "airhive" }
    expect(airhive).to have_attributes(nightly_from: 200, available: true, book_direct: false)
  end

  it "excludes unavailable channels from the cheapest calculation" do
    listing = Listing.create!(origin: "aggregated", title: "Villa",
                              airhive_listing: AirhiveListing.create!(native_id: "a2"))
    channel_for(listing, provider_type: "airhive", nightly_price_floor: 300, available: true)
    channel_for(listing, provider_type: "vacario", nightly_price_floor: 100, available: false)

    result = described_class.call(listing)

    expect(result[:cheapest_provider]).to eq("airhive")
    expect(result[:rows].find { |row| row.provider_type == "vacario" }.available).to be(false)
  end
end
