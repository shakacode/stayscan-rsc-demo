# frozen_string_literal: true

require "rails_helper"
require "net/http"

# End-to-end coverage of the listing-detail view: the full content inventory renders through
# the real Node renderer, the lazy modal chunks load and drive in-browser, the quote
# streams, and gating routes correctly. The date-driven row-state matrix itself is
# exhaustively unit-tested (useBookingRowStates / useBookingReducer / useBooking jest).
RSpec.describe "Listing detail (listing-detail view) — full inventory", type: :system do
  # `blocked` are spans inside the calendar window that are closed for stays.
  def seed_listing(book_direct: false, blocked: [])
    owner = create(:user, host_name: "Mara Vance", host_intro_text: "I've hosted by the reef for a decade.")
    listing = create(:aggregate_listing, owner:, verified_owner_id: owner.id, title: "Sunlit Reef Villa",
                     description: "A restored plantation home a short walk from the water. " * 6,
                     city: "Kivora", bedrooms: 2, bathrooms: 2, beds: 3, max_guests: 4,
                     blended_rating: 4.7, reviews_count: 12,
                     photos: Array.new(6) { |i| "kivora/villa-#{i}.jpg" },
                     # Match the enriched JSONB shapes the generator writes (structured
                     # hashes, not strings) so the render walk exercises real data.
                     ai_content_review_digest: { "summary" => "Guests rave about the ocean view and the host.",
                                           "themes" => %w[views quiet cleanliness] },
                     ai_content_area_highlights: { "near" => "Kivora",
                                                     "items" => [ { "name" => "Reef boardwalk", "blurb" => "sunset strolls" },
                                                                  { "name" => "Farmers market", "blurb" => "weekend ceviche" } ] },
                     ai_content_host_summary: { "summary" => "We restored this home ourselves and love sharing it.",
                                                 "highlights" => [ "Self check-in", "Fast wifi", "Beach gear provided" ] })

    amenities = create_list(:amenity, 12)
    listing.update!(amenity_ids: amenities.map(&:id))

    create_list(:review, 12, listing:)
    create_list(:aggregate_listing, 3, city: "Kivora")

    open = Date.current...(Date.current + 720)
    give_calendar(listing.listing_channels.create!(provider_type: "airhive", nightly_price_default: 200,
                                                  nightly_price_floor: 200, static_fee: 90, tax_rate: 0.1),
                  open:, blocked:, nightly: 200, min_stay: 1)
    if book_direct
      give_calendar(listing.listing_channels.create!(provider_type: "hostflow", nightly_price_default: 180,
                                                    nightly_price_floor: 180, static_fee: 60, tax_rate: 0.1),
                    open:, blocked:, nightly: 180, min_stay: 1)
    end
    listing
  end

  # Pick a check-in/out in the *next* visible month, whose days are always future
  # (enabled) regardless of the wall-clock date.
  def pick_stay
    months = all(".DayPicker-Month")
    within(months.last) do
      find(".DayPicker-Day:not(.DayPicker-Day--disabled)", text: "15", exact_text: true).click
      find(".DayPicker-Day:not(.DayPicker-Day--disabled)", text: "18", exact_text: true).click
    end
  end

  def sign_up_as(email)
    click_button "Sign up"
    within("[data-test-id='auth-modal']") do
      fill_in "Email", with: email
      fill_in "Password", with: "password123"
      click_button "Sign up"
    end
    expect(page).to have_button(email)
  end

  it "renders the full listing-detail inventory over the shared layout on both viewports" do
    listing = seed_listing

    responsive do |r|
      [ r.method(:desktop), r.method(:mobile) ].each do |viewport|
        viewport.call do
          visit "/listings/#{listing.id}"
          wait_for_hydration

          expect(page).to have_content(listing.title)
          expect(page).to have_css("[data-test-id='photo-gallery']")
          expect(page).to have_css("[data-test-id='listing-header']")
          expect(page).to have_css("[data-test-id='description-section']")
          expect(page).to have_css("[data-test-id='amenities-section']")
          expect(page).to have_css("[data-test-id='host-section']")
          expect(page).to have_css("[data-test-id='reviews-section']")
          expect(page).to have_css("[data-test-id='review-ai-tabs']")
          expect(page).to have_css("[data-test-id='rating-breakdown']")
          expect(page).to have_css("[data-test-id='location-map']")
          expect(page).to have_css("[data-test-id='similar-section']")
          expect(page).to have_css("[data-test-id='listing-faq']")
          expect(page).to have_css("[data-test-id='booking-widget']")
        end
      end
    end
  end

  it "opens the photo lightbox and navigates through it" do
    listing = seed_listing

    visit "/listings/#{listing.id}"
    wait_for_hydration

    click_button "Show all 6 photos"
    expect(page).to have_css("[data-test-id='photo-lightbox']")

    within("[data-test-id='photo-lightbox']") do
      find("[data-test-id='lightbox-next']").click
      find("[data-test-id='lightbox-close']").click
    end
    expect(page).to have_no_css("[data-test-id='photo-lightbox']")
  end

  it "loads the amenities modal chunk and lists every amenity" do
    listing = seed_listing

    visit "/listings/#{listing.id}"
    wait_for_hydration

    click_button "Show all 12 amenities"
    expect(page).to have_css("[data-test-id='amenities-modal']")
    within("[data-test-id='amenities-modal']") do
      expect(page).to have_content(Amenity.find(listing.amenity_ids.first).name)
    end
  end

  it "steps through the negotiation wizard modal" do
    listing = seed_listing

    visit "/listings/#{listing.id}"
    wait_for_hydration

    click_button "Negotiate the price"
    within("[data-test-id='negotiation-modal']") do
      fill_in "Target nightly price", with: "150"
      find("[data-test-id='negotiate-next']").click
      choose "I'm flexible"
      find("[data-test-id='negotiate-next']").click
      expect(page).to have_css("[data-test-id='negotiate-review']")
      find("[data-test-id='negotiate-next']").click
      expect(page).to have_css("[data-test-id='negotiate-sent']")
    end
  end

  it "streams a quote when a signed-out guest compares prices" do
    listing = seed_listing

    visit "/listings/#{listing.id}"
    wait_for_hydration

    pick_stay
    find("[data-test-id='compare-prices']").click

    expect(page).to have_css("[data-test-id='price-comparison-table']")
    expect(page).to have_css("[data-test-id='price-row-airhive']")
  end

  it "gates an anonymous guest at the quote limit with the usage-limit modal", :allow_http_error do
    listing = seed_listing
    allow_any_instance_of(Quote::Limit).to receive(:reached?).and_return(true)

    visit "/listings/#{listing.id}"
    wait_for_hydration

    pick_stay
    find("[data-test-id='compare-prices']").click

    expect(page).to have_css("[data-test-id='quote-limit-banner']")
    click_button "Sign in for unlimited"
    expect(page).to have_css("[data-test-id='usage-limit-modal']")
  end

  it "reveals a book-direct link for a signed-in guest" do
    listing = seed_listing(book_direct: true)
    # Sign-up drives the full navbar; use desktop so it isn't behind the mobile menu.
    page.current_window.resize_to(1024, 768)

    visit "/listings/#{listing.id}"
    wait_for_hydration
    sign_up_as("direct@example.test")

    pick_stay
    find("[data-test-id='compare-prices']").click

    within("[data-test-id='price-row-hostflow']") { click_button "Reveal link" }
    within("[data-test-id='book-direct-reveal-modal']") do
      find("[data-test-id='confirm-reveal']").click
      expect(page).to have_css("[data-test-id='revealed-link']")
    end
  end

  it "routes an anonymous save-to-trip through the auth modal" do
    listing = seed_listing

    visit "/listings/#{listing.id}"
    wait_for_hydration

    find("[data-test-id='save-to-trip']").click
    expect(page).to have_css("[data-test-id='auth-modal']")
  end

  it "serves a 304 on a repeat anonymous request (HTTP caching)" do
    listing = seed_listing
    server = Capybara.current_session.server
    uri = URI("http://#{server.host}:#{server.port}/listings/#{listing.id}")

    first = Net::HTTP.get_response(uri)
    expect(first.code).to eq("200")
    etag = first["ETag"]
    expect(etag).to be_present

    conditional = Net::HTTP.get_response(uri, { "If-None-Match" => etag })
    expect(conditional.code).to eq("304")
  end
end
