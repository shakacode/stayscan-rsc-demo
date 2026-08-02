# frozen_string_literal: true

require "rails_helper"

RSpec.describe ListingSearch do
  # Bounding box around Marenca for the geo filter.
  BBOX = { min_lat: 8.5, max_lat: 9.1, min_lng: -140.7, max_lng: -140.2 }.freeze

  def create_listing(lat: 8.9, lng: -140.4, price: 150, bedrooms: 2, bathrooms: 2, guests: 4,
                     rating: nil, amenity_ids: [], book_direct: false, top_rated: false)
    base = { lat:, lng:, preview_price: price, bedrooms:, bathrooms:, max_guests: guests, amenity_ids: }
    base[:blended_rating] = rating if rating
    base.merge!(blended_rating: 4.9, reviews_count: 30) if top_rated
    if book_direct
      host = User.create!(password: "password123", email: "#{SecureRandom.hex(4)}@e.test", verified_at: Time.current)
      Listing.create!(origin: "host_managed", owner_id: host.id, verified_owner_id: host.id,
                      hostflow_unit: HostflowUnit.create!(native_id: SecureRandom.hex(3), owner: host), **base)
    else
      # top_rated implies a trust signal (ListingScore#top_rated?), so give the
      # OTA listing a verified owner when it's meant to qualify.
      verified_owner_id = top_rated ? User.create!(password: "password123", email: "#{SecureRandom.hex(4)}@e.test").id : nil
      Listing.create!(origin: "aggregated", verified_owner_id:,
                      airhive_listing: AirhiveListing.create!(native_id: SecureRandom.hex(3)), **base)
    end
  end

  it "returns only listings inside the bounding box" do
    inside = create_listing(lat: 8.9, lng: -140.4)
    create_listing(lat: 40.0, lng: -100.0) # outside

    expect(described_class.new(BBOX).results).to contain_exactly(inside)
  end

  it "filters by price range" do
    cheap = create_listing(price: 100)
    create_listing(price: 500)

    results = described_class.new(BBOX.merge(min_price: 50, max_price: 200)).results

    expect(results).to contain_exactly(cheap)
  end

  it "filters by minimum bedrooms" do
    big = create_listing(bedrooms: 4)
    create_listing(bedrooms: 1)

    expect(described_class.new(BBOX.merge(min_bedrooms: 3)).results).to contain_exactly(big)
  end

  it "filters by minimum bathrooms" do
    big = create_listing(bathrooms: 3)
    create_listing(bathrooms: 1)

    expect(described_class.new(BBOX.merge(min_bathrooms: 2)).results).to contain_exactly(big)
  end

  it "filters by minimum guests" do
    roomy = create_listing(guests: 8)
    create_listing(guests: 2)

    expect(described_class.new(BBOX.merge(min_guests: 6)).results).to contain_exactly(roomy)
  end

  it "filters by minimum rating" do
    great = create_listing(rating: 4.8)
    create_listing(rating: 3.5)

    expect(described_class.new(BBOX.merge(min_rating: 4.5)).results).to contain_exactly(great)
  end

  it "filters by top_rated" do
    starred = create_listing(top_rated: true)
    create_listing(top_rated: false)

    expect(described_class.new(BBOX.merge(top_rated: true)).results).to contain_exactly(starred)
  end

  it "filters by required amenities (bitmask)" do
    pool = Amenity.create!(name: "Pool", bit_position: 5)
    wifi = Amenity.create!(name: "Wifi", bit_position: 6)
    with_pool = create_listing(amenity_ids: [ pool.id, wifi.id ])
    create_listing(amenity_ids: [ wifi.id ])

    expect(described_class.new(BBOX.merge(amenity_ids: [ pool.id ])).results).to contain_exactly(with_pool)
  end

  it "filters by book_direct" do
    direct = create_listing(book_direct: true)
    create_listing(book_direct: false)

    expect(described_class.new(BBOX.merge(book_direct: true)).results).to contain_exactly(direct)
  end

  it "sorts by price ascending" do
    mid = create_listing(price: 200)
    low = create_listing(price: 100)
    high = create_listing(price: 300)

    expect(described_class.new(BBOX.merge(sort: "price_asc")).results.to_a).to eq([ low, mid, high ])
  end

  it "paginates and caps total results at the anti-scraping limit" do
    stub_const("#{described_class}::MAX_RESULTS", 3)
    stub_const("#{described_class}::PAGE_SIZE", 2)
    5.times { create_listing }

    search = described_class.new(BBOX.merge(page: 1))

    expect(search.results.size).to eq(2)         # one page
    expect(search.meta[:total_count]).to eq(3)   # capped
    expect(search.meta[:cap_reached]).to be(true)
  end
end
