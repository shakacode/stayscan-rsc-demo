# frozen_string_literal: true

require "rails_helper"

RSpec.describe ListingIndexJson do
  def tile_listing
    listing = create(:aggregate_listing, title: "Reef Villa", city: "Kivora", preview_price: 220,
                     blended_rating: 4.6, reviews_count: 8, bedrooms: 2, bathrooms: 2, max_guests: 4,
                     lat: 8.9, lng: -140.4, photos: [ "kivora/0.jpg" ])
    listing.listing_channels.create!(provider_type: "airhive", stay_availability_default: true,
                                     nightly_price_default: 200)
    listing
  end

  it "builds tiles, capped meta, echoed filters and seo for a free search" do
    listing = tile_listing

    json = described_class.new(
      listings: [ listing ],
      meta: { total_count: 150, current_page: 1, page_size: 25, cap_reached: true },
      filters: { min_price: "100", book_direct: "true", sort: "price_asc" }
    ).as_json

    tile = json[:listings].first
    expect(tile).to include(id: listing.id, title: "Reef Villa", city: "Kivora",
                            previewPrice: 220.0, reviewsCount: 8, photos: [ "kivora/0.jpg" ], channels: [ "airhive" ])
    expect(tile[:capacity]).to include(bedrooms: 2, maxGuests: 4)
    expect(tile[:coordinates]).to include(lat: 8.9, lng: -140.4)

    expect(json[:meta]).to include(totalCount: 150, currentPage: 1, capReached: true,
                                   maxPages: ListingSearch::MAX_PAGES)
    expect(json[:filters]).to include(minPrice: 100.0, bookDirect: true, topRated: false, sort: "price_asc")
    expect(json[:location]).to be_nil
    expect(json[:seo][:title]).to eq("Search vacation rentals")
  end

  it "includes the location nav + destination seo for a location page" do
    parent = create(:location, name: "Marenca", path: "marenca")
    location = create(:location, name: "Kivora", path: "marenca/kivora", parent: parent,
                      center_lat: 8.9, center_lng: -140.4)

    json = described_class.new(
      listings: [], meta: { total_count: 12, current_page: 1, page_size: 25, cap_reached: false },
      filters: {}, location: location
    ).as_json

    expect(json[:location]).to include(name: "Kivora", path: "marenca/kivora")
    expect(json[:location][:breadcrumb].map { |crumb| crumb[:name] }).to eq(%w[Marenca Kivora])
    expect(json[:location][:center]).to include(lat: 8.9, lng: -140.4)
    expect(json[:seo][:title]).to eq("Vacation rentals in Kivora")
  end
end
