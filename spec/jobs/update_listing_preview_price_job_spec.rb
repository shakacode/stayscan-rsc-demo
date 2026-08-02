# frozen_string_literal: true

require "rails_helper"

RSpec.describe UpdateListingPreviewPriceJob do
  it "sets preview_price to the cheapest channel's total for the default stay" do
    listing = Listing.create!(origin: "aggregated", airhive_listing: AirhiveListing.create!(native_id: "a1"))
    cheap = listing.listing_channels.create!(provider_type: "airhive", nightly_price_default: 100)
    listing.listing_channels.create!(provider_type: "vacario", nightly_price_default: 250)

    described_class.perform_now(listing.id)

    check_in = Date.current + described_class::DEFAULT_LEAD_DAYS
    expected = Quote::Calculations::Total.call(
      channel: cheap, check_in:, check_out: check_in + described_class::DEFAULT_NIGHTS, adults: 2
    ).total
    expect(listing.reload.preview_price).to eq(expected)
  end
end
