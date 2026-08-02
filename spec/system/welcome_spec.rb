# frozen_string_literal: true

require "rails_helper"

# Proves the full page pipeline (foundation): the layout redux store +
# react-intl + a styleguide component, server-rendered through the Node renderer
# and hydrated clean (the after-hook fails on any console error).
RSpec.describe "Welcome (home)", type: :system do
  it "server-renders and hydrates the localized hero" do
    visit "/"

    expect(page).to have_content("Find your stay for less")
    expect(page).to have_button("Start searching")
  end
end
