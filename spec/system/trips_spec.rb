# frozen_string_literal: true

require "rails_helper"

# Saved trips: the signed-in traveler's trip lists render each list with its
# saved listings as crawlable cards.
RSpec.describe "Saved trips", type: :system do
  it "shows the traveler's saved trip lists with their listings" do
    user = create(:user)
    login_as(user, scope: :user)
    trip = create(:trip_list, user:, name: "Marenca dreaming")
    listing = create(:aggregate_listing, title: "Reef Villa")
    trip.listings << listing

    visit trips_path
    wait_for_hydration

    expect(page).to have_content("Your saved trips")
    expect(page).to have_css("[data-test-id='trip-list']", text: "Marenca dreaming")
    expect(page).to have_link(href: %r{/listings/#{listing.id}})
  end
end
