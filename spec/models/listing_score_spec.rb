# frozen_string_literal: true

require "rails_helper"

RSpec.describe ListingScore do
  def build_listing(**attrs)
    Listing.create!({ origin: "aggregated",
                      airhive_listing: AirhiveListing.create!(native_id: SecureRandom.hex(3)) }.merge(attrs))
  end

  it "sets the high-rating and has-reviews bits from review signals" do
    score = described_class.new(build_listing(blended_rating: 4.9, reviews_count: 30))

    expect(score.signal?(:high_rating)).to be(true)
    expect(score.signal?(:reviewed)).to be(true)
  end

  it "sets the multi-channel bit when 2+ OTAs are aggregated" do
    listing = build_listing(vacario_listing: VacarioListing.create!(native_id: "v", unit_code: "u"))

    expect(described_class.new(listing).signal?(:multi_channel)).to be(true)
  end

  it "sets the book-direct bit for VRS-backed listings" do
    host = User.create!(password: "password123", email: "h@example.test", host_intro_text: "hi")
    listing = Listing.create!(origin: "host_managed", owner_id: host.id, verified_owner_id: host.id,
                              hostflow_unit: HostflowUnit.create!(native_id: "h", owner: host))

    expect(described_class.new(listing).signal?(:book_direct)).to be(true)
  end

  describe "#top_rated?" do
    it "is true when highly rated, reviewed, and trusted (verified or book-direct)" do
      host = User.create!(password: "password123", email: "h2@example.test")
      listing = Listing.create!(origin: "host_managed", owner_id: host.id, verified_owner_id: host.id,
                                hostflow_unit: HostflowUnit.create!(native_id: "h2", owner: host),
                                blended_rating: 4.8, reviews_count: 25)

      expect(described_class.new(listing).top_rated?).to be(true)
    end

    it "is false when highly rated but untrusted (no verification, no book-direct)" do
      listing = build_listing(blended_rating: 4.9, reviews_count: 40)

      expect(described_class.new(listing).top_rated?).to be(false)
    end
  end

  it "persists the bitmask onto the listing via #update_score!" do
    listing = build_listing(blended_rating: 4.9, reviews_count: 30)

    expect { listing.update_score! }.to change { listing.reload.score }.to(described_class.new(listing).bitmask)
  end
end
