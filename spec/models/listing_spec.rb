# frozen_string_literal: true

require "rails_helper"

RSpec.describe Listing do
  # Factories arrive in T1.5; build records directly for now.
  def airhive = AirhiveListing.create!(native_id: SecureRandom.hex(4))
  def vacario = VacarioListing.create!(native_id: SecureRandom.hex(4), unit_code: SecureRandom.hex(2))
  def lodgeo = LodgeoListing.create!(native_id: SecureRandom.hex(4), native_unit_id: SecureRandom.hex(2))

  describe "#aggregate_listing?" do
    it "is true when owned by the aggregate_listing sentinel owner" do
      listing = Listing.create!(origin: "aggregated", airhive_listing: airhive)

      expect(listing.aggregate_listing?).to be(true)
    end

    it "is false when owned by a real host" do
      host = User.create!(password: "password123", email: "host@example.test")
      listing = Listing.create!(origin: "host_managed", owner_id: host.id, hostflow_unit: HostflowUnit.create!(native_id: "h1", owner: host))

      expect(listing.aggregate_listing?).to be(false)
    end
  end

  describe "#channel_qty" do
    it "counts every attached provider channel" do
      listing = Listing.create!(origin: "aggregated", airhive_listing: airhive, vacario_listing: vacario)

      expect(listing.channel_qty).to eq(2)
    end
  end

  describe "#kind" do
    it "is :regular for a aggregate_listing with a single OTA channel" do
      listing = Listing.create!(origin: "aggregated", airhive_listing: airhive)

      expect(listing.kind).to eq(:regular)
    end

    it "is :cross_listed for a aggregate_listing aggregating two or more OTA channels" do
      listing = Listing.create!(origin: "aggregated", airhive_listing: airhive, lodgeo_listing: lodgeo)

      expect(listing.kind).to eq(:cross_listed)
    end

    it "is :book_direct when a VRS (Hostflow) channel is present" do
      host = User.create!(password: "password123", email: "host2@example.test")
      listing = Listing.create!(origin: "host_managed", owner_id: host.id, hostflow_unit: HostflowUnit.create!(native_id: "h2", owner: host))

      expect(listing.kind).to eq(:book_direct)
    end
  end

  describe "aggregated-listing channel check constraint" do
    it "rejects an aggregated listing with no OTA channel" do
      expect { Listing.create!(origin: "aggregated") }
        .to raise_error(ActiveRecord::StatementInvalid, /listings_aggregated_has_channel/)
    end
  end
end
