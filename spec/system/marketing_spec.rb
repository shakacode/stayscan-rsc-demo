# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Marketing pages", type: :system do
  it "expands the FAQ accordion" do
    visit "/faq"

    expect(page).to have_content("How does StayScan find prices?")
    find("summary", text: "How does StayScan find prices?").click

    expect(page).to have_content("We match the same property")
  end

  it "shows the pricing plans with the configured prices" do
    visit "/pricing"

    expect(page).to have_content("$49/mo")
    expect(page).to have_content("$99/mo")
  end

  it "renders a legal/CMS page from content_pages" do
    ContentPage.create!(slug: "privacy", title: "Privacy policy", body: "StayScan stores no real personal data.")

    visit "/privacy"

    expect(page).to have_content("Privacy policy")
    expect(page).to have_content("StayScan stores no real personal data.")
  end

  it "submits the contact form" do
    visit "/contact"

    wait_for_hydration

    fill_in "Your name", with: "Ada"
    fill_in "Email", with: "ada@example.test"
    fill_in "How can we help?", with: "Loving the app."
    click_button "Send message"

    expect(page).to have_content("thanks, we")
  end

  it "renders the 404 page for an unknown path", :allow_http_error do
    visit "/no-such-page"

    expect(page).to have_content("Page not found")
  end
end
