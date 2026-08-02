# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Navbar", type: :system do
  before do
    Location.create!(path: "sy/marenca/kivora", name: "Kivora", kind: "area", listings_count: 900)
    Location.create!(path: "sy/marenca/marisel", name: "Marisel", kind: "area", listings_count: 300)
    AutocompleteLocation.refresh
    Currency.create!(code: "USD", symbol: "$")
    Currency.create!(code: "EUR", symbol: "€")
  end

  it "autocompletes seeded destinations and switches currency" do
    responsive do |r|
      r.desktop do
        visit "/"

        wait_for_hydration

        find("input[role='combobox']").set("ki")

        expect(page).to have_css("[role='option']", text: "Kivora")
        expect(page).to have_no_css("[role='option']", text: "Marisel")

        click_button "Currency"
        within("[data-test-id='currency-modal']") { find("button", text: "EUR").click }

        within("header") { expect(page).to have_text("EUR") }
      end
    end
  end

  it "renders the navbar chrome on mobile" do
    responsive do |r|
      r.mobile do
        visit "/"

        wait_for_hydration

        within("header") do
          expect(page).to have_link("StayScan")
          click_button "Menu"
          expect(page).to have_button("Sign in")
        end
      end
    end
  end
end
