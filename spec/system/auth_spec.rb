# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Auth", type: :system do
  it "signs up then signs out, reflecting session state in the navbar" do
    responsive do |r|
      r.desktop do
        visit "/"

        wait_for_hydration

        click_button "Sign up"
        within("[data-test-id='auth-modal']") do
          fill_in "Email", with: "traveler@example.test"
          fill_in "Password", with: "password123"
          click_button "Sign up"
        end

        expect(page).to have_button("traveler@example.test") # avatar trigger (display name)
        expect(page).to have_no_button("Sign in")

        click_button "traveler@example.test"
        click_button "Sign out"

        expect(page).to have_button("Sign in")
      end
    end
  end

  it "opens the auth modal from the mobile menu" do
    responsive do |r|
      r.mobile do
        visit "/"

        wait_for_hydration

        within("header") { click_button "Menu" }
        click_button "Sign in"

        expect(page).to have_css("[data-test-id='auth-modal']")
      end
    end
  end

  it "sends an unauthenticated visitor to the home page with the sign-in modal open" do
    visit edit_account_path

    expect(page).to have_css("[data-test-id='auth-modal']")
    expect(page).to have_current_path(root_path)
  end
end
