# frozen_string_literal: true

# Wait for React to hydrate the layout before driving JS interactions, so a fast
# Capybara action doesn't fire against not-yet-interactive markup (a race that
# only shows under load).
module HydrationHelpers
  def wait_for_hydration
    expect(page).to have_css("[data-layout-root][data-hydrated='true']", visible: :all, wait: 15)
  end
end

RSpec.configure do |config|
  config.include HydrationHelpers, type: :system
end
