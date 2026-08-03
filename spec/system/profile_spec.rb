# frozen_string_literal: true

require "rails_helper"

# Public profile pages: the shared ProfileView renders a traveler's or host's
# hero, badges and crawlable listings grid; the host page links through to its map.
RSpec.describe "Profile pages", type: :system do
  it "renders a traveler's public profile with a crawlable listings grid" do
    user = create(:user, host_name: "Marine Nerd", verified_at: nil)
    listings = create_list(:aggregate_listing, 2, owner_id: user.id)

    visit user_profile_path(user)
    wait_for_hydration

    expect(page).to have_css("[data-test-id='profile-name']", text: "Marine Nerd")
    expect(page).to have_content("Multiple homes")
    expect(page).to have_css("[data-test-id='listing-card']", count: 2)
    listings.each do |listing|
      expect(page).to have_link(href: %r{/listings/#{listing.id}})
    end
  end

  it "links from a verified host's profile through to their listings map" do
    host = create(:user, host_name: "Reef Host", verified_at: Time.current)
    create_list(:aggregate_listing, 5, owner_id: host.id, lat: 8.9, lng: -140.4)

    visit host_path(host)
    wait_for_hydration

    expect(page).to have_content("Superhost")
    expect(page).to have_content("Verified")

    click_link "View listings on the map"
    wait_for_hydration

    expect(page).to have_css("[data-test-id='host-map-page']")
    expect(page).to have_css("[data-test-id^='map-marker-']", wait: 5)
  end
end
