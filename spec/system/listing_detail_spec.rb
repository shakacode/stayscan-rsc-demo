# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Listing detail (listing-detail view)", type: :system do
  it "renders the detail shell from ListingDetailJson over the shared layout" do
    listing = Listing.create!(origin: "aggregated", title: "Sunlit Villa",
                              description: "A lovely place by the reef.", city: "Kivora",
                              lat: 8.91, lng: -140.39, bedrooms: 2, bathrooms: 2, max_guests: 4,
                              blended_rating: 4.6, reviews_count: 3,
                              airhive_listing: AirhiveListing.create!(native_id: "a1"))
    listing.listing_channels.create!(provider_type: "airhive", nightly_price_floor: 200, static_fee: 90,
                                     tax_rate: 0.1, stay_availability_default: true,
                                     nightly_price_default: 200)

    visit "/listings/#{listing.id}"
    wait_for_hydration

    expect(page).to have_content("Sunlit Villa")
    expect(page).to have_content("A lovely place by the reef.")
    expect(page).to have_css("[data-test-id='booking-widget']")
    expect(page).to have_link("StayScan") # shared layout shell present
  end
end
