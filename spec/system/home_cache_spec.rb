# frozen_string_literal: true

require "rails_helper"

# The home SSR is fragment-cached under a user+locale composite key
# (welcome_cache_key), so the second request is a cache hit and renders identically.
RSpec.describe "Home fragment caching", type: :system, caching: true do
  it "writes the home render to cache, then hits it on the second request" do
    writes = 0
    hits = 0
    write_sub = ActiveSupport::Notifications.subscribe("cache_write.active_support") { writes += 1 }
    read_sub = ActiveSupport::Notifications.subscribe("cache_read.active_support") do |*args|
      hits += 1 if ActiveSupport::Notifications::Event.new(*args).payload[:hit]
    end

    visit "/"
    expect(page).to have_content("Find your stay for less")
    visit "/"
    expect(page).to have_content("Find your stay for less")

    ActiveSupport::Notifications.unsubscribe(write_sub)
    ActiveSupport::Notifications.unsubscribe(read_sub)

    expect(writes).to be_positive # first render cached the SSR
    expect(hits).to be_positive # second render served from cache
  end
end
