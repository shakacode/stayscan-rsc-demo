# frozen_string_literal: true

require "rails_helper"

# raw provider records -> match -> ResolveListingClusterJob ->
# aggregated aggregate_listing with denormalized fields, bitstring calendars, a
# trigger-maintained searchable row, and a computed sample price.
RSpec.describe ResolveListingClusterJob do
  it "aggregates a 3-channel cluster into a aggregate_listing end to end" do
    airhive = AirhiveListing.create!(native_id: "air-1")
    vacario = VacarioListing.create!(native_id: "vac-1", unit_code: "u-1")
    lodgeo = LodgeoListing.create!(native_id: "lod-1", native_unit_id: "u-1")
    cluster = ListingCluster.observe(airhive_listing_id: airhive.id, vacario_listing_id: vacario.id, lodgeo_listing_id: lodgeo.id)

    perform_enqueued_jobs { described_class.perform_now(cluster.id) }

    listing = Listing.find_by(airhive_listing_id: airhive.id)
    expect(listing.aggregate_listing?).to be(true)
    expect([ listing.airhive_listing_id, listing.vacario_listing_id, listing.lodgeo_listing_id ])
      .to eq([ airhive.id, vacario.id, lodgeo.id ])

    # denormalized per-channel fields + aggregates
    offers = listing.channel_offers.index_by(&:provider_type)
    expect(offers.keys).to include("airhive", "vacario")
    expect(offers["airhive"].title).to be_present
    expect(offers["airhive"].review_rating).to be_present
    expect(listing.blended_rating).to be_present
    expect(listing.photos).to be_present
    expect(listing.description).to be_present

    # bitstring calendar matches the provider's raw calendar, per night
    channel = listing.listing_channels.find_by(provider_type: "airhive")
    provider = Normalizers::Airhive::Calendar.call(
      ChannelDataApi.new.airhive_calendar("air-1", Date.current, RefreshChannelDataJob::DAYS)
    )
    provider.nights.first(15).each do |night|
      expect(channel.available_for_stay?(night.date)).to eq(night.available)
    end

    # trigger-maintained searchable row + computed sample price
    expect(ListingSearchRow.find_by(listing_id: listing.id)).to be_present
    expect(listing.reload.preview_price).to be_present

    expect(cluster.reload.resolved_at).to be_present
  end

  it "MergeListings confirms OTA records into a aggregate_listing" do
    airhive = AirhiveListing.create!(native_id: "air-m")

    perform_enqueued_jobs { MergeListings.call(airhive_listing_id: airhive.id) }

    expect(Listing.find_by(airhive_listing_id: airhive.id)).to be_present
  end
end
