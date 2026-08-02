# frozen_string_literal: true

require "rails_helper"

RSpec.describe ChannelIngest do
  let(:listing) do
    Listing.create!(origin: "aggregated", airhive_listing: AirhiveListing.create!(native_id: "a1"))
  end
  let(:start) { Date.new(2026, 1, 1) }
  let(:calendar) do
    nights = [
      Normalizers::NormalizedNight.new(date: start, available: true, price: 100, min_stay: 1),
      Normalizers::NormalizedNight.new(date: start + 1, available: false, price: 120, min_stay: 2),
      Normalizers::NormalizedNight.new(date: start + 2, available: true, price: 90, min_stay: 1)
    ]
    Normalizers::NormalizedCalendar.new(start_date: start, nights:)
  end
  let(:details) do
    Normalizers::NormalizedDetails.new(
      title: "X", description: "A place", bedrooms: 2, bathrooms: 1, beds: 2, max_guests: 4,
      lat: 8.9, lng: -140.4, city: "Kivora", country: "US", host_name: "Kai", base_price: 100,
      cleaning_fee: 50, rating: 4.6, reviews_count: 12, photos: [], amenities: []
    )
  end

  it "reshapes the normalized calendar into ranges the availability engine reads back" do
    channel = described_class.call(listing, channel: :airhive, details:, calendar:)

    expect(channel.provider_type).to eq("airhive")
    expect(channel.calendar_window).to eq(start...(start + 3))
    # the one closed night collapses into a single blackout range
    expect(channel.channel_blackouts.map { |b| [ b.kind, b.during ] })
      .to eq([ [ "stay", (start + 1)...(start + 2) ] ])
    expect(channel.available_for_stay?(start)).to be(true)
    expect(channel.available_for_stay?(start + 1)).to be(false)
    expect(channel.night_price(start + 2)).to eq(90)
    expect(channel.minimum_stay(start + 1)).to eq(2)
  end

  it "carries the provider's service fee (per-subclass config)" do
    expect(described_class.call(listing, channel: :airhive, details:, calendar:).channel_fee_percent).to eq(0.14)
  end

  it "upserts the same channel row on re-sync" do
    described_class.call(listing, channel: :airhive, details:, calendar:)

    expect { described_class.call(listing, channel: :airhive, details:, calendar:) }.not_to(change { listing.listing_channels.count })
  end
end
