# frozen_string_literal: true

require "rails_helper"

RSpec.describe Location do
  let(:area) do
    described_class.create!(path: "sy/marenca/selora", name: "Selora", kind: "area",
                            min_lat: 8.90, max_lat: 8.93, min_lng: -140.40, max_lng: -140.36)
  end

  describe "#contains?" do
    it "is true for coordinates inside the bounding box" do
      expect(area.contains?(8.91, -140.38)).to be(true)
    end

    it "is false for coordinates outside the bounding box" do
      expect(area.contains?(9.50, -140.38)).to be(false)
    end
  end

  describe "#listings" do
    it "returns listings whose coordinates fall inside the box" do
      inside = Listing.create!(origin: "aggregated", airhive_listing: AirhiveListing.create!(native_id: "in"),
                               lat: 8.91, lng: -140.38)
      Listing.create!(origin: "aggregated", airhive_listing: AirhiveListing.create!(native_id: "out"),
                      lat: 30.0, lng: -100.0)

      expect(area.listings).to contain_exactly(inside)
    end
  end
end
