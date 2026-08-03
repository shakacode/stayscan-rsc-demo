# frozen_string_literal: true

require "rails_helper"

# Account settings: the signed-in, tabbed Redux form. One journey covers tab
# switching + saving a field; a second covers the gated delete-account confirmation.
RSpec.describe "Account settings", type: :system do
  it "switches tabs and saves a profile change" do
    login_as(create(:user, host_name: "Marine Nerd"), scope: :user)

    visit edit_account_path
    wait_for_hydration

    expect(page).to have_css("[data-test-id='account-panel-profile']")

    click_button "Password"
    expect(page).to have_css("[data-test-id='account-panel-password']")

    click_button "Profile"
    fill_in "Display name", with: "Reef Nerd"
    find("[data-test-id='account-save-profile']").click

    expect(page).to have_css("[data-test-id='account-saved']", wait: 5)
  end

  it "gates the delete-account confirmation behind the confirmation word" do
    login_as(create(:user), scope: :user)

    visit edit_account_path
    wait_for_hydration

    click_button "Danger zone"
    find("[data-test-id='account-delete']").click

    expect(page).to have_css("[data-test-id='delete-confirm-input']")
    expect(page).to have_css("[data-test-id='delete-confirm'][disabled]")

    fill_in "Confirmation", with: "DELETE"

    expect(page).to have_css("[data-test-id='delete-confirm']:not([disabled])")
  end
end
