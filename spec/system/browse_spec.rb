# frozen_string_literal: true

require "rails_helper"

# browse view slice 1: the search-results shell renders over the shared layout from
# ListingIndexJson, for both free search (#index) and path-routed
# destination pages (#location_page). The heavy client state arrives in later slices.
RSpec.describe "Browse (browse view)", type: :system do
  it "renders the results shell for a free search" do
    create(:aggregate_listing, title: "Reef Villa", city: "Kivora", lat: 8.90, lng: -140.40)
    create(:aggregate_listing, title: "Palm Casita", city: "Kivora", lat: 8.91, lng: -140.41)

    visit "/s"
    wait_for_hydration

    expect(page).to have_css("[data-test-id='browse-page']")
    expect(page).to have_css("[data-test-id='result-tile']", minimum: 2)
    expect(page).to have_link("Reef Villa")
  end

  it "mounts the interactive map (default leaflet engine) with price-pill markers" do
    create(:aggregate_listing, title: "Reef Villa", city: "Kivora", lat: 8.90, lng: -140.40, preview_price: 240)

    # The map is inline on desktop; on mobile it lives behind the list/map toggle
    # (covered separately below). The leaflet mount is viewport-independent.
    responsive do |r|
      r.desktop do
        visit "/s"
        wait_for_hydration

        expect(page).to have_css("[data-test-id='listings-map'][data-engine='leaflet']")
        # The leaflet engine is a lazy client-only chunk; the marker appears post-hydration.
        expect(page).to have_css("[data-test-id^='map-marker-']", wait: 5)
      end
    end
  end

  it "toggles from the list to the map pane on mobile" do
    create(:aggregate_listing, title: "Reef Villa", city: "Kivora", lat: 8.90, lng: -140.40, preview_price: 240)

    responsive do |r|
      r.mobile do
        visit "/s"
        wait_for_hydration

        # List view is the mobile default; the map pane is hidden until toggled.
        expect(page).to have_link("Reef Villa")
        expect(page).to have_no_css("[data-test-id='listings-map']")

        find("[data-test-id='toggle-map']").click

        expect(page).to have_css("[data-test-id='listings-map']")
        expect(page).to have_css("[data-test-id^='map-marker-']", wait: 5)
      end
    end
  end

  it "streams live prices on the tiles once dates are set" do
    listing = create(:aggregate_listing, title: "Reef Villa", city: "Kivora", lat: 8.90, lng: -140.40)
    listing.listing_channels.create!(provider_type: "airhive", stay_availability_default: true,
                                     nightly_price_default: 200)

    visit "/s"
    wait_for_hydration

    fill_in "Check in", with: (Date.current + 30).strftime("%Y-%m-%d")
    fill_in "Check out", with: (Date.current + 33).strftime("%Y-%m-%d")

    # Setting both dates fires the batch quote saga; the per-channel jobs don't run
    # under the :test adapter, so the tile shows its streaming state.
    expect(page).to have_css("[data-test-id='tile-price-streaming']", wait: 5)
  end

  it "commits a filter from the modal, closes it, and reflects it in the URL" do
    create(:aggregate_listing, title: "Reef Villa", city: "Kivora", lat: 8.90, lng: -140.40)

    visit "/s"
    wait_for_hydration

    click_button "Filters"
    within("[data-test-id='filters-modal']") do
      check "Top-rated only"
      find("[data-test-id='filters-apply']").click
    end

    expect(page).to have_no_css("[data-test-id='filters-modal']")
    expect(page).to have_css("[data-test-id='open-filters']", text: "1") # one active filter
    expect(page).to have_current_path(%r{top_rated=true}, url: true)
  end

  it "restores a committed filter from a deep-linked URL" do
    create(:aggregate_listing, title: "Star Villa", city: "Kivora", lat: 8.90, lng: -140.40,
           blended_rating: 4.9, reviews_count: 30, verified_owner_id: create(:user).id)
    create(:aggregate_listing, title: "Plain Villa", city: "Kivora", lat: 8.91, lng: -140.41,
           blended_rating: 3.8, reviews_count: 4)

    visit "/s?top_rated=true"
    wait_for_hydration

    expect(page).to have_link("Star Villa")
    expect(page).to have_no_link("Plain Villa")
    expect(page).to have_css("[data-test-id='open-filters']", text: "1")
  end

  it "renders the maplibre engine when the feature flag selects it" do
    FeatureFlag.create!(key: "map_engine", enabled: true, payload: { "engine" => "maplibre" })
    create(:aggregate_listing, title: "Reef Villa", city: "Kivora", lat: 8.90, lng: -140.40)

    # The map is inline on desktop; on mobile it lives behind the list/map toggle.
    # The engine-switch plumbing is viewport-independent, so assert it on desktop.
    responsive do |r|
      r.desktop do
        visit "/s"
        wait_for_hydration

        expect(page).to have_css("[data-test-id='listings-map'][data-engine='maplibre']")
      end
    end
  end

  it "renders a path-routed destination page with the location breadcrumb" do
    marenca = create(:location, name: "Marenca", path: "marenca")
    create(:location, name: "Kivora", path: "marenca/kivora", parent: marenca,
           min_lat: 8.8, max_lat: 9.0, min_lng: -140.5, max_lng: -140.3)
    create(:aggregate_listing, title: "Reef Villa", city: "Kivora", lat: 8.90, lng: -140.40)

    visit "/l/marenca/kivora"
    wait_for_hydration

    expect(page).to have_content("Vacation rentals in Kivora")
    expect(page).to have_link("Marenca")
    expect(page).to have_link("Reef Villa")
  end
end
