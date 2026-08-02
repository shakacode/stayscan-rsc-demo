# frozen_string_literal: true

require "rails_helper"

RSpec.describe RefreshChannelDataJob do
  it "fetches each provider over HTTP and reshapes into bitstrings the availability engine reads back" do
    listing = Listing.create!(
      origin: "aggregated",
      airhive_listing: AirhiveListing.create!(native_id: "air-42"),
      lodgeo_listing: LodgeoListing.create!(native_id: "lod-7", native_unit_id: "u-1")
    )
    start = Date.new(2026, 1, 1)

    described_class.perform_now(listing.id, start_date: start)

    expect(listing.listing_channels.pluck(:provider_type)).to contain_exactly("airhive", "lodgeo")

    channel = listing.listing_channels.find_by(provider_type: "airhive")
    window = channel.calendar_window
    expect((window.end - window.first).to_i).to eq(RefreshChannelDataJob::DAYS)
    provider_calendar = Normalizers::Airhive::Calendar.call(
      ChannelDataApi.new.airhive_calendar("air-42", start, RefreshChannelDataJob::DAYS)
    )
    provider_calendar.nights.first(20).each do |night|
      expect(channel.available_for_stay?(night.date)).to eq(night.available)
      expect(channel.night_price(night.date)).to eq(night.price)
    end
  end

  it "syncs a Hostflow (VRS) channel via the token-gated unit + rates endpoints" do
    host = User.create!(password: "password123", email: "h@example.test")
    listing = Listing.create!(origin: "host_managed", owner_id: host.id,
                              hostflow_unit: HostflowUnit.create!(native_id: "hf-unit-3", owner: host))

    described_class.perform_now(listing.id)

    expect(listing.listing_channels.find_by(provider_type: "hostflow")).to be_present
  end

  it "enqueues a preview-price recompute after syncing" do
    listing = Listing.create!(origin: "aggregated", airhive_listing: AirhiveListing.create!(native_id: "air-1"))

    expect { described_class.perform_now(listing.id) }
      .to have_enqueued_job(UpdateListingPreviewPriceJob).with(listing.id)
  end

  it "enqueues AI-content enrichment after syncing" do
    listing = Listing.create!(origin: "aggregated", airhive_listing: AirhiveListing.create!(native_id: "air-2"))

    expect { described_class.perform_now(listing.id) }
      .to have_enqueued_job(EnrichListingAiContentJob).with(listing.id)
  end
end
