# frozen_string_literal: true

require "capybara/rspec"
require "selenium/webdriver"

# Headless Chrome for JS system specs. The whole suite is run twice in CI — once
# per viewport — via CAPYBARA_WINDOW_SIZE (default desktop); a single spec can also
# exercise both viewports with the `responsive` helper.
CAPYBARA_WINDOW_SIZES = { "desktop" => [ 1024, 768 ], "mobile" => [ 375, 667 ] }.freeze
CAPYBARA_DEFAULT_VIEWPORT = ENV.fetch("CAPYBARA_WINDOW_SIZE", "desktop")

Capybara.register_driver :headless_chrome do |app|
  width, height = CAPYBARA_WINDOW_SIZES.fetch(CAPYBARA_DEFAULT_VIEWPORT)
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument("--headless=new")
  options.add_argument("--no-sandbox")
  options.add_argument("--disable-dev-shm-usage")
  options.add_argument("--disable-gpu")
  options.add_argument("--window-size=#{width},#{height}")
  options.add_argument("--user-agent=#{ENV['CAPYBARA_USER_AGENT']}") if ENV["CAPYBARA_USER_AGENT"]
  options.add_option("goog:loggingPrefs", { browser: "ALL" })
  Capybara::Selenium::Driver.new(app, browser: :chrome, options:)
end

Capybara.server = :puma, { Silent: true }
Capybara.default_max_wait_time = 5
Capybara.disable_animation = true
# Icon-only controls carry their name via aria-label; let selectors match it.
Capybara.enable_aria_label = true

RSpec.configure do |config|
  config.before(:each, type: :system) do
    driven_by :headless_chrome
  end
end
