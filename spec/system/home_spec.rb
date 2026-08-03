# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Home", type: :system do
  it "renders every home section including the loadable below-the-fold chunk" do
    listing = Listing.create!(origin: "aggregated", title: "Sunlit Villa",
                              city: "Kivora", photos: [ "p" ], blended_rating: 4.6, reviews_count: 22,
                              airhive_listing: AirhiveListing.create!(native_id: "a1"),
                              vacario_listing: VacarioListing.create!(native_id: "v1", unit_code: "u1"))
    listing.listing_channels.create!(provider_type: "airhive", nightly_price_floor: 200,
                                     stay_availability_default: true)
    listing.listing_channels.create!(provider_type: "vacario", nightly_price_floor: 250,
                                     stay_availability_default: true)
    ContentPage.create!(slug: "home", title: "Compare every price.", body: "No markups, no guesswork.")

    visit "/"

    expect(page).to have_content("The same stay, three prices") # what's cheaper
    expect(page).to have_content("Save $50/night by booking Airhive")
    expect(page).to have_content("How StayScan works") # explainer
    expect(page).to have_content("Travelers who booked smarter") # testimonials (loadable chunk)
    expect(page).to have_content("Are you a host?") # hosts pitch
    expect(page).to have_content("Compare every price.") # CMS block
  end

  it "pseudo-localizes every string when the pseudo locale is requested" do
    visit "/?locale=pseudo"

    expect(page).to have_content("⟦Find your stay for less⟧")
    expect(page).to have_content("⟦How StayScan works⟧")
  end
end
