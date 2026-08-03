# frozen_string_literal: true

require "rails_helper"

# Harness smoke: proves the browser boots, React SSRs + hydrates, and the
# console-error guard (selenium_logger) is wired.
RSpec.describe "Hello world page", type: :system do
  it "server-renders and hydrates the React component" do
    visit "/hello_world"

    expect(page).to have_content("Hello, Stranger!")

    fill_in "name", with: "Marenca"

    expect(page).to have_content("Hello, Marenca!")
  end
end
