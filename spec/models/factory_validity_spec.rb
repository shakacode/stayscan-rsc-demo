# frozen_string_literal: true

require "rails_helper"

# Every named factory must build/create a valid record (covers the pure-data
# supporting models too).
RSpec.describe "factories" do
  %i[user airhive_listing vacario_listing lodgeo_listing hostflow_unit
     aggregate_listing hostflow_listing listing_channel review amenity currency location].each do |name|
    it "creates a valid :#{name}" do
      expect(create(name)).to be_persisted
    end
  end

  it "builds a aggregate_listing with 1-3 OTA channels (:with_photos trait adds photos)" do
    listing = create(:aggregate_listing, :with_photos)

    expect(listing.channel_qty).to be_between(1, 3)
    expect(listing.photos.size).to eq(12)
  end
end
