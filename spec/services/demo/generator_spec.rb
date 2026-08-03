# frozen_string_literal: true

require "rails_helper"

RSpec.describe Demo::Generator do
  def seed!
    described_class.call(profile: :test, verbose: false)
  end

  it "produces pipeline-shaped data: aggregated listings + verified hostflow listings" do
    seed!

    expect(Listing.where(origin: "aggregated").count).to eq(6)

    hostflow = Listing.where.not(hostflow_unit_id: nil)
    expect(hostflow.count).to eq(2)
    hostflow.find_each { |listing| expect(listing.verified_owner_id).to eq(listing.owner_id) }

    # every listing went through the pipeline: channels + trigger-maintained searchable
    Listing.find_each do |listing|
      expect(listing.channel_qty).to be_between(1, 3)
      expect(ListingSearchRow.find_by(listing_id: listing.id)).to be_present
    end
  end

  it "passes every structural check in demo:verify" do
    seed!

    failing = Demo::Verify.call.select { |row| row.kind == :structural && !row.pass }
    expect(failing.map(&:dimension)).to be_empty
  end

  it "denormalizes provider content depth onto every listing (description + 4-18 amenities)" do
    seed!

    Listing.find_each do |listing|
      expect(listing.description).to be_present
      expect(listing.amenity_ids.size).to be_between(4, 18)
      expect(Amenity.where(id: listing.amenity_ids).count).to eq(listing.amenity_ids.size)
    end
  end

  it "enriches AI content inline through the pipeline" do
    seed!

    expect(Listing.where.not(ai_content_host_summary: {}).count).to be_positive
  end

  it "derives listing content deterministically from the provider (stable titles)" do
    seed!

    listing = Listing.where.not(airhive_listing_id: nil).first
    expected = Normalizers::Airhive::Details.call(ChannelDataApi.new.airhive_details(listing.airhive_listing.native_id)).title
    expect(listing.title).to eq(expected)
  end

  it "is deterministic from the seed: identical count + first-20 titles across fresh seeds" do
    seed!
    first_count = Listing.count
    first_titles = Listing.order(:id).limit(20).pluck(:title)

    [ Review, ChannelBlackout, ChannelRate, ListingChannel, ChannelOffer, ListingSearchRow, ListingCluster, Listing,
      AirhiveListing, VacarioListing, LodgeoListing, HostflowUnit ].each(&:delete_all)
    seed!

    expect(Listing.count).to eq(first_count)
    expect(Listing.order(:id).limit(20).pluck(:title)).to eq(first_titles)
  end

  it "is idempotent (re-running adds no listings)" do
    seed!
    count = Listing.count

    expect { seed! }.not_to change(Listing, :count)
    expect(Listing.count).to eq(count)
  end

  it "never writes listings/listing_channels/searchables directly (pipeline honesty)" do
    source = File.read(Rails.root.join("app/services/demo/generator.rb"))

    expect(source).not_to match(/\bListing\.(create|new)|ListingChannel\.(create|new)|ListingSearchRow\.(create|new|update)/)
  end
end
