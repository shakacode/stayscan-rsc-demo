# frozen_string_literal: true

# Sign in without driving the full Devise UI, so auth-gated system specs can start
# from an authenticated session. Warden's test middleware logs the user in for every
# request the Capybara app server handles.
RSpec.configure do |config|
  config.include Warden::Test::Helpers, type: :system

  config.before(:each, type: :system) { Warden.test_mode! }
  config.after(:each, type: :system) { Warden.test_reset! }
end
