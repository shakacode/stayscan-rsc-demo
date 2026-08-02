# frozen_string_literal: true

require "rails_helper"

# listing_search_rows is maintained by the trigger, not app code.
RSpec.describe ListingSearchRow do
  def searchable_for(listing)
    described_class.find_by(listing_id: listing.id)
  end

  it "is populated by the trigger when a listing is created" do
    pool = Amenity.create!(name: "Pool", bit_position: 3)
    host = User.create!(password: "password123", email: "host@example.test")
    listing = Listing.create!(
      origin: "aggregated", verified_owner_id: host.id,
      airhive_listing: AirhiveListing.create!(native_id: "a1"),
      preview_price: 199.99, blended_rating: 4.8, reviews_count: 20,
      bedrooms: 2, bathrooms: 2, max_guests: 4, amenity_ids: [ pool.id ],
      lat: 8.9, lng: -140.3
    )

    searchable = searchable_for(listing)

    expect(searchable).to be_present
    expect(searchable.preview_price_cents).to eq(19_999)
    expect(searchable.rating_sort_key).to eq(48_000_000)
    expect(searchable.bedrooms).to eq(2)
    expect(searchable.top_rated).to be(true) # rated (4.8) + reviewed + trusted (verified)
    expect(searchable.amenity_mask[3]).to eq("1") # bit for Pool's position is set
  end

  it "is updated by the trigger when the listing changes" do
    listing = Listing.create!(origin: "aggregated",
                              airhive_listing: AirhiveListing.create!(native_id: "a2"),
                              preview_price: 100)

    listing.update!(preview_price: 250)

    expect(searchable_for(listing).preview_price_cents).to eq(25_000)
  end

  it "flags book_direct for VRS-backed listings" do
    host = User.create!(password: "password123", email: "h@example.test")
    listing = Listing.create!(origin: "host_managed", owner_id: host.id, hostflow_unit: HostflowUnit.create!(native_id: "h1", owner: host))

    expect(searchable_for(listing).book_direct).to be(true)
  end
end
