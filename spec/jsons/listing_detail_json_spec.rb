# frozen_string_literal: true

require "rails_helper"

RSpec.describe ListingDetailJson do
  def build_listing
    listing = Listing.create!(origin: "aggregated", title: "Sunlit Villa",
                              description: "A lovely place.", city: "Kivora", lat: 8.912345, lng: -140.398765,
                              bedrooms: 2, bathrooms: 2, max_guests: 4, blended_rating: 4.6, reviews_count: 2,
                              airhive_listing: AirhiveListing.create!(native_id: "a1"))
    channel = listing.listing_channels.create!(provider_type: "airhive", nightly_price_floor: 200,
                                              nightly_price_default: 210, static_fee: 90, tax_rate: 0.1,
                                              channel_fee_percent: 0.14, stay_availability_default: false,
                                              calendar_window: Date.new(2026, 1, 1)...Date.new(2026, 1, 5))
    channel.channel_blackouts.create!(kind: "stay",
                                      during: Date.new(2026, 1, 2)...Date.new(2026, 1, 3))
    channel.channel_rates.create!(during: Date.new(2026, 1, 1)...Date.new(2026, 1, 3),
                                  nightly_price: 200, min_stay: 1)
    channel.channel_rates.create!(during: Date.new(2026, 1, 3)...Date.new(2026, 1, 5),
                                  nightly_price: 210, min_stay: 2)
    listing.reviews.create!(provider_type: "airhive", author_name: "Kai", rating: 5, content: "Great")
    listing
  end

  it "ships the raw per-channel booking-engine data for the client machine" do
    json = described_class.new(build_listing).as_json

    channel = json[:channels].first
    expect(channel).to include(providerType: "airhive", nightlyFrom: 200, available: true)
    expect(channel[:calendarWindow]).to eq(from: "2026-01-01", to: "2026-01-05")
    expect(channel[:blockedRanges]).to eq([ { from: "2026-01-02", to: "2026-01-03" } ])
    expect(channel[:rates]).to eq([
      { from: "2026-01-01", to: "2026-01-03", nightly: 200.0, minStay: 1 },
      { from: "2026-01-03", to: "2026-01-05", nightly: 210.0, minStay: 2 }
    ])
  end

  it "coarsens coordinates and includes host, reviews, pricing and gating blocks" do
    json = described_class.new(build_listing, current_user: nil,
                               quote_allowance: { limited: true, remaining: 3 }, plans: [ { code: "premium" } ]).as_json

    expect(json[:coordinates]).to include(lat: 8.91, lng: -140.4, radiusMeters: 800)
    expect(json[:reviews]).to include(total: 2, page: 1)
    expect(json[:reviews][:items].first).to include(author: "Kai", rating: 5)
    expect(json[:pricing][:cheapestProvider]).to eq("airhive")
    expect(json[:featureAccess]).to be(false)
    expect(json[:quoteAllowance]).to include(remaining: 3)
    expect(json[:plans]).to eq([ { code: "premium" } ])
  end

  it "normalizes the enriched AI-content JSONB into structured client shapes" do
    listing = build_listing
    listing.update!(
      ai_content_host_summary: { "summary" => "We host by the reef.", "highlights" => [ "Self check-in", "Fast wifi" ] },
      ai_content_area_highlights: { "near" => "Kivora",
                                      "items" => [ { "name" => "Reef boardwalk", "blurb" => "sunset strolls" } ] }
    )

    ai = described_class.new(listing).as_json[:aiContent]

    expect(ai[:fromTheHost]).to eq(summary: "We host by the reef.", highlights: [ "Self check-in", "Fast wifi" ])
    expect(ai[:nearbyHighlights]).to eq(near: "Kivora", items: [ { name: "Reef boardwalk", blurb: "sunset strolls" } ])
  end

  it "leaves un-enriched AI content nil so those sections render gracefully" do
    ai = described_class.new(build_listing).as_json[:aiContent] # columns default to {}

    expect(ai[:fromTheHost]).to be_nil
    expect(ai[:nearbyHighlights]).to be_nil
  end
end
