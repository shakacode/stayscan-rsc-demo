# frozen_string_literal: true

# Rack::Attack counters live in a process-wide memory store, so reset them between
# examples — otherwise cumulative quote/search requests across the suite would trip
# the throttle spuriously.
RSpec.configure do |config|
  config.before(:each) { Rack::Attack.cache.store.clear }
end
